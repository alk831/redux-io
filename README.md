<div align="center">
  <h1>redux-io</h1>
  <p>Treat action types as they were events.</p>
  <img src="https://cdn.worldvectorlogo.com/logos/socket-io.svg" align="center" width="180" height="180">
</div>

<br />
<hr />

[![Build Status](https://travis-ci.org/alk831/redux-io.svg?branch=master)](https://travis-ci.org/alk831/redux-io)
[![Coverage Status](https://coveralls.io/repos/github/alk831/redux-io/badge.svg?branch=master)](https://coveralls.io/github/alk831/redux-io?branch=master)

## Example
### Client
```js
import { createStore, applyMiddleware } from 'redux';
import io from 'socket.io-client';
import reduxIoMiddleware from 'redux-io';

const socket = io('localhost');

const store = createStore(
  applyMiddleware(
    reduxIoMiddleware({ socket })
  )
);

store.dispatch({
  type: 'SEND_MESSAGE',
  payload: 'Message sent from client',
  meta: { io: true }
});
```
### Server

```js

socket.on('SEND_MESSAGE', (action, dispatchOnce) => {

  socket.emit('$_RECEIVE_MESSAGE', {
    type: '$_RECEIVE_MESSAGE',
    payload: action.payload
  });

  /* dispatchOnce allows to dispatch one action to the socket that has sent SEND_MESSAGE event */
  dispatchOnce({ type: '$_MESSAGE_SUCCESS' });
});

```