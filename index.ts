import { Action, Dispatch, Store } from 'redux';

interface IOptions {
  socket: SocketIOClient.Socket
}

const defaultOptions = {
  autoEmit: true,
  emitPrefix: '$'
}

interface actionMeta {
  io: boolean
}

interface actionWithMeta extends Action {
  meta: actionMeta
}

const middleware = (options: IOptions) => {
  /* Setup listeners and send dispatch argument on first (connect) event */

  const mergedOptions = {
    ...defaultOptions,
    ...options
  }
  const { socket } = mergedOptions;

  if (socket == null) {
    throw new Error(`You have not passed socket instance to middleware options`);
  }
  
  return (store: Store) => (next: Dispatch) => (action: actionWithMeta) => {

    next(action);

    if (action.meta && action.meta.io === true) {
      socket.emit(action.type, action, store.dispatch);
    }
  }
}

export default middleware;