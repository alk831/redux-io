const { createIoMiddleware: reduxIoMiddleware } = require('../dist/index');
const io = require('socket.io-client');
const http = require('http');
const ioBack = require('socket.io');
const { createStore, applyMiddleware } = require('redux');
const { chatReducer, createStoreWithMiddleware } = require('./fixtures/store');
const { wait } = require('./utils');

let socket;
let clientSocket;
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
    clientSocket = socket;
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


  it('dispatches listened events', async () => {
    const subscriptionHandler = jest.fn();

    const store = createStoreWithMiddleware(
      reduxIoMiddleware({
        socket,
        listenTo: ['$_MESSAGE_RECEIVE']
      })
    );
    store.subscribe(subscriptionHandler);

    serverSocket.emit('$_MESSAGE_RECEIVE', {
      type: '$_MESSAGE_RECEIVE',
      payload: 'Message sent from server'
    });
    await wait();

    expect(subscriptionHandler).toHaveBeenCalledTimes(1);
    expect(store.getState()).toStrictEqual(['Message sent from server']);
  });


  it('throws error when socket is not passed', () => {
    try {
      const store = createStoreWithMiddleware(
        reduxIoMiddleware({})
      );
    } catch(err) {
      expect(err).toBeInstanceOf(Error);
    }
  });


  it('does not emit event when disabled', async () => {
    const clientEmit = jest.spyOn(clientSocket, 'emit');

    const store = createStoreWithMiddleware(
      reduxIoMiddleware({
        socket: clientSocket,
        autoEmit: false
      })
    );

    store.dispatch({
      type: 'SEND_MESSAGE',
      payload: 'Message sent from client',
      meta: { io: false }
    });
    store.dispatch({
      type: 'SEND_MESSAGE',
      payload: 'Message sent from client'
    });
    await wait();

    expect(clientEmit).toHaveBeenCalledTimes(1);

    const action = {
      type: 'SEND_MESSAGE',
      payload: 'Message sent from client',
      meta: { io: true }
    }
    store.dispatch(action);

    expect(clientEmit).toHaveBeenLastCalledWith('SEND_MESSAGE', action, expect.any(Function));
  });
  

  describe('Many clients', () => {

    let clientA;
    let clientB;

    beforeEach(async () => {
      const url = `http://[${httpServerAddr.address}]:${httpServerAddr.port}`;
      const settings = {
        'reconnection delay': 0,
        'reopen delay': 0,
        'force new connection': true,
        transports: ['websocket'],
      }

      clientA = io.connect(url, settings);
      clientB = io.connect(url, settings);
      await wait();
    });

    afterEach(() => {
      if (clientA.connected) clientA.disconnect();
      if (clientB.connected) clientB.disconnect();
    });


    it('propagates event between multiple clients', async () => {
      const storeA = createStoreWithMiddleware(
        reduxIoMiddleware({
          socket: clientA,
          listenTo: ['$_MESSAGE_RECEIVE']
        })
      );

      const storeB = createStoreWithMiddleware(
        reduxIoMiddleware({
          socket: clientB,
          listenTo: ['$_MESSAGE_RECEIVE']
        })
      );

      ioServer.emit('$_MESSAGE_RECEIVE', {
        type: '$_MESSAGE_RECEIVE',
        payload: 'Message emitted to all clients'
      });
      await wait();

      expect(storeA.getState()).toStrictEqual(['Message emitted to all clients']);
      expect(storeB.getState()).toStrictEqual(['Message emitted to all clients']);
    });

  });
});