<div align="center">
  <h1>redux-io</h1>
  <p>Treat action types as they were events.</p>
  <img src="https://cdn.worldvectorlogo.com/logos/socket-io.svg" align="center" width="180" height="180">
</div>

<br />
<hr />

[![pipeline status](https://gitlab.com/alk831/redux-io/badges/master/pipeline.svg)](https://gitlab.com/alk831/redux-io/pipelines)
[![Coverage Status](https://coveralls.io/repos/github/alk831/redux-io/badge.svg?branch=master)](https://coveralls.io/github/alk831/redux-io?branch=master)
<!-- [![Build Status](https://travis-ci.org/alk831/redux-io.svg?branch=master)](https://travis-ci.org/alk831/redux-io) -->

## Example
### Client
```js
import { createStore, applyMiddleware } from 'redux';
import io from 'socket.io-client';
import { ioMiddleware } from 'redux-io';

const socket = io('localhost');

const store = createStore(
  reducers,
  applyMiddleware(
    ioMiddleware({ socket })
  )
);

store.dispatch({
  type: 'MESSAGE_SEND',
  payload: 'Message sent from client'
});
```
### Server

```js
socket.on('MESSAGE_SEND', (action, dispatchOnce) => {

  /* Emitting an action to connected clients, except sender. */
  socket.emit('$_MESSAGE_RECEIVE', {
    type: '$_MESSAGE_RECEIVE',
    payload: action.payload
  });

  /*
    We are allowed to dispatch one action to the sender using helper.
    Obviously, dispatching more actions is available through emit.
  */
  dispatchOnce({ type: '$_MESSAGE_SUCCESS' });
});

```