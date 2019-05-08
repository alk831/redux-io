const reduxIoMiddleware = require('../dist/index').default;
const io = require('socket.io-client');
const http = require('http');
const ioBack = require('socket.io');
const { createStore, applyMiddleware } = require('redux');
const { chatReducer, createStoreWithMiddleware } = require('../__mocks__/store');
const { wait,  } = require('./__utils__');

let socket;
let httpServer;
let httpServerAddr;
let ioServer;

let serverSocket;

beforeAll((done) => {
  httpServer = http.createServer().listen();
  httpServerAddr = httpServer.address();
  ioServer = ioBack(httpServer);
  done();
});

afterAll((done) => {
  ioServer.close();
  httpServer.close();
  done();
});

beforeEach(async (done) => {
  ioServer.on('connection', (socket) => {
    serverSocket = socket;
    if (serverSocket && serverSocket.on) {
      done();
    }
  });

  setTimeout(() => {
    // Square brackets are used for IPv6
    socket = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true,
      transports: ['websocket'],
    });
  }, 50);
});

afterEach((done) => {
  if (socket.connected) {
    socket.disconnect();
  }
  done();
});


describe('Redux middleware', () => {
  it('emits event properly', (done) => {
    if (!serverSocket) {
      const error = new Error(`Server socket undefined`)
      error.error = serverSocket;
    }
    expect(serverSocket).toBeUndefined();
    const clientEmit = jest.spyOn(socket, 'emit');

    const store = createStore(
      chatReducer,
      applyMiddleware(
        reduxIoMiddleware({ socket })
      )
    );

    const action = {
      type: 'SEND_MESSAGE',
      payload: 'Message sent from client',
      meta: { io: true }
    }

    serverSocket.on(action.type, (receivedAction, dispatch) => {
      expect(clientEmit).toHaveBeenCalledWith(action.type, action, expect.any(Function));
      expect(receivedAction).toStrictEqual(action);
      expect(dispatch).toStrictEqual(expect.any(Function));
      done();
    });

    store.dispatch(action);
  });

  it('dispatches action from server', (done) => {
    const store = createStoreWithMiddleware(
      reduxIoMiddleware({
        socket
      })
    );
    const subscriptionHandler = () => {};
    const unsubscribe = store.subscribe(subscriptionHandler);
    // const spySubscription = jest.spyOn(subscriptionHandler);

    const action = {
      type: 'SEND_MESSAGE',
      payload: 'Message sent from client',
      meta: { io: true }
    }

    serverSocket.on('SEND_MESSAGE', async (receivedAction, dispatchOnce) => {

      expect(store.getState()).toStrictEqual(['Message sent from client']);
      expect(receivedAction).toStrictEqual(action);

      dispatchOnce({
        type: '$_RECEIVE_MESSAGE',
        payload: 'Message sent from server'
      });

      await wait();

      expect(store.getState()).toStrictEqual(['Message sent from client', 'Message sent from server']);

      unsubscribe();
      done();
    });

    store.dispatch(action);
  });
});