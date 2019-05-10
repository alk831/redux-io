<div align="center">
  <h1>reduxio</h1>
  <p>Treat actions as they were events.</p>
  <img src="https://cdn.worldvectorlogo.com/logos/socket-io.svg" align="center" width="180" height="180">
</div>

<br />
<hr />

[![pipeline status](https://gitlab.com/alk831/redux-io/badges/master/pipeline.svg)](https://gitlab.com/alk831/redux-io/pipelines)
[![Coverage Status](https://coveralls.io/repos/github/alk831/redux-io/badge.svg?branch=master)](https://coveralls.io/github/alk831/redux-io?branch=master)
<!-- [![Build Status](https://travis-ci.org/alk831/redux-io.svg?branch=master)](https://travis-ci.org/alk831/redux-io) -->
Lightweight Redux middleware that simplifies creating real-time apps with socket.io.

## Usage
```js
import { createStore, applyMiddleware } from 'redux';
import io from 'socket.io-client';
import { createIoMiddleware } from '@art4/reduxio';

const socket = io('localhost');

const ioMiddleware = createIoMiddleware({
  socket,
  /* Listen to events (action types) that are going to be automatically dispatched to the store. */  
  listenTo: ['MESSAGE_RECEIVE']
});

const store = createStore(
  reducers,
  applyMiddleware(ioMiddleware)
);
```

## Example
### Client
```js
import { createStore, applyMiddleware } from 'redux';
import io from 'socket.io-client';
import { createIoMiddleware } from '@art4/reduxio';

const socket = io('localhost');

const ioMiddleware = createIoMiddleware({
  socket,
  listenTo: ['$_MESSAGE_RECEIVE']
});

const store = createStore(
  reducers,
  applyMiddleware(ioMiddleware)
);

store.dispatch({
  type: 'MESSAGE_SEND',
  payload: 'Message sent from client'
});
```
### Server

```js
socket.on('MESSAGE_SEND', (action, dispatchOnce) => {

  /* Emitting an action to connected clients, except the sender. */
  socket.emit('$_MESSAGE_RECEIVE', {
    type: '$_MESSAGE_RECEIVE',
    payload: action.payload
  });

  /*
    We are allowed to dispatch one action to the sender using the helper.
    Obviously, dispatching more actions is available through emit.
    Advantage of this approach is that we don't have to set up the listener for this action type.
  */
  dispatchOnce({ type: '$_MESSAGE_SUCCESS' });
});
```