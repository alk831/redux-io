const { combineReducers, createStore, applyMiddleware } = require('redux');

function chatReducer(state = [], action) {
  switch(action.type) {
    case 'SEND_MESSAGE':
    case '$_RECEIVE_MESSAGE': 
      [...state, action.payload]
    default: return state;
  }
}

function createStoreWithMiddleware(...middleware) {
  return createStore(
    chatReducer,
    applyMiddleware(...middleware)
  );
}

module.exports = {
  chatReducer,
  createStoreWithMiddleware
}