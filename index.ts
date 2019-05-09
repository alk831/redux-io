import { Action, Dispatch, Store } from 'redux';
import { normalizeActionTypes } from './utils';

const defaultOptions = {
  autoEmit: true,
  emitPrefix: '$',
  listenTo: []
}

const middleware = (options: IOptions) => {
  const mergedOptions = {
    ...defaultOptions,
    ...options
  }
  const { socket, autoEmit, listenTo } = mergedOptions;

  if (socket == null) {
    throw new Error(`You have not passed socket instance to middleware options`);
  }

  return (store: Store) => {

    const normalizedActions = normalizeActionTypes(listenTo);
  
    for (let actionType of normalizedActions) {
      socket.on(actionType, (action: actionWithMeta) => {
        const mergedAction = {
          ...action,
          meta: {
            io: autoEmit,
            ...action.meta
          }
        }

        store.dispatch(mergedAction);
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


interface IOptions {
  socket: SocketIOClient.Socket
  listenActions: [] | {}
}

interface actionMeta {
  io: boolean
}

interface actionWithMeta extends Action {
  meta: actionMeta
}