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

  const mergedOptions = {
    ...defaultOptions,
    ...options
  }

  return (store: Store) => (next: Dispatch) => (action: actionWithMeta) => {
    const { socket } = mergedOptions;

    next(action);

    if (action.meta && action.meta.io === true) {
      socket.emit(action.type, action, store.dispatch);
    }
  }
}

export default middleware;