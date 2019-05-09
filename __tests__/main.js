const reduxIoMiddleware = require('../dist/index').default;
const io = require('socket.io-client');
const http = require('http');
const ioBack = require('socket.io');
const { createStore, applyMiddleware } = require('redux');
const { chatReducer, createStoreWithMiddleware } = require('../__mocks__/store');
const { wait } = require('./__utils__');

let socket;
let serverSocket;
let httpServer;
let httpServerAddr;
let ioServer;


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

beforeEach(() =>
  new Promise((resolve) => {

    ioServer.on('connection', (socket) => {
      serverSocket = socket;
      if (serverSocket) {
        resolve();
      }
    });

    // Square brackets are used for IPv6
    socket = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true,
      transports: ['websocket'],
    })
  })
);

afterEach((done) => {
  if (socket.connected) {
    socket.disconnect();
  }
  done();
});


describe('Redux middleware', () => {

  it('emits event properly', (done) => {
    const clientEmit = jest.spyOn(socket, 'emit');
    const action = {
      type: 'SEND_MESSAGE',
      payload: 'Message sent from client',
      meta: { io: true }
    }

    const store = createStore(
      chatReducer,
      applyMiddleware(
        reduxIoMiddleware({ socket })
      )
    );

    serverSocket.on('SEND_MESSAGE', (receivedAction, dispatch) => {
      expect(clientEmit).toHaveBeenCalledWith(action.type, action, expect.any(Function));
      expect(receivedAction).toStrictEqual(action);
      expect(dispatch).toStrictEqual(expect.any(Function));
      done();
    });

    store.dispatch(action);
  });

  it('dispatches action from server', (done) => {
    const subscriptionHandler = jest.fn();
    const action = {
      type: 'SEND_MESSAGE',
      payload: 'Message sent from client',
      meta: { io: true }
    }

    const store = createStoreWithMiddleware(
      reduxIoMiddleware({ socket })
    );
    const unsubscribe = store.subscribe(subscriptionHandler);

    serverSocket.on('SEND_MESSAGE', async (receivedAction, dispatchOnce) => {
      expect(store.getState()).toStrictEqual(['Message sent from client']);
      expect(receivedAction).toStrictEqual(action);

      dispatchOnce({
        type: '$_RECEIVE_MESSAGE',
        payload: 'Message sent from server'
      });
      await wait();

      expect(store.getState()).toStrictEqual(['Message sent from client', 'Message sent from server']);
      expect(subscriptionHandler).toHaveBeenCalledTimes(2);

      unsubscribe();
      done();
    });

    store.dispatch(action);
  });
});