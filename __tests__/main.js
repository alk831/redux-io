const reduxIoMiddleware = require('../dist/index').default;
const io = require('socket.io-client');
const http = require('http');
const ioBack = require('socket.io');
const { createStore, applyMiddleware } = require('redux');
const { chatReducer } = require('../__mocks__/store');

let socket;
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

beforeEach((done) => {
  // Square brackets are used for IPv6
  socket = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket'],
  });
  socket.on('connect', () => {
    done();
  });
});

afterEach((done) => {
  if (socket.connected) {
    socket.disconnect();
  }
  done();
});


describe('Redux middleware', () => {
  it('emits event properly', () => {
    const clientEmit = jest.spyOn(socket, 'emit');

    const store = createStore(
      chatReducer,
      applyMiddleware(
        reduxIoMiddleware({ socket })
      )
    );

    const action = {
      type: 'SEND_MESSAGE',
      payload: 'test message',
      meta: { io: true }
    }

    store.dispatch(action);

    expect(clientEmit).toHaveBeenCalledWith(action.type, action, expect.any(Function));
  });
});