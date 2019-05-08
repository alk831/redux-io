import { Action, Dispatch, Store } from 'redux';

interface IOptions {
  socket: SocketIOClient.Socket
  listenActions: {}
}

const defaultOptions = {
  autoEmit: true,
  emitPrefix: '$',
  listenActions: {}
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
  const { socket, listenActions } = mergedOptions;

  if (socket == null) {
    throw new Error(`You have not passed socket instance to middleware options`);
  }

  return (store: Store) => {
  
    for (let actionType in listenActions) {
      socket.on(actionType, (action: actionWithMeta) => {
        store.dispatch({
          ...action,
          meta: {
            io: false,
            ...action.meta || {}
          }
        });
      });
    }

    return (next: Dispatch) => (action: actionWithMeta) => {

      next(action);

      if (action.meta && action.meta.io === true) {
        socket.emit(action.type, action, store.dispatch);
      }
    }
  }
}

export default middleware;