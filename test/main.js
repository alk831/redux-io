import jest from 'jest';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import reduxIo from '../index';
import io from 'socket.io-client';

function chatReducer(state = [], action) {
  switch(action.type) {
    case 'SEND_MESSAGE':
    case '$_RECEIVE_MESSAGE': 
      [...state, action.payload]
    default: return state;
  }
}

describe('', () => {
  it('emits event properly', () => {
    const spyIo = jest.spyOn(io);
    const socket = io('localhost');
    const spyEmit = jest.spyOn(socket, 'emit');

    const store = createStore(
      chatReducer,
      applyMiddleware(reduxIo({ socket }))
    );

    const action = {
      type: 'SEND_MESSAGE',
      payload: 'test message',
      meta: { io: true }
    }

    store.dispatch(action);

    expect(spyIo).toHaveBeenCalled();
    expect(spyEmit).toHaveBeenCalledWith(action.type, action, store.dispatch);
  });
});