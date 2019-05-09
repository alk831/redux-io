import { Action, Dispatch, Store } from 'redux';
import { normalizeActionTypes } from './utils';

const defaultOptions = {
  autoEmit: true,
  emitPrefix: '$',
  listenTo: []
}

export const ioMiddleware = (options: IOptions) => {
  const mergedOptions = {
    ...defaultOptions,
    ...options
  }
  const { socket } = mergedOptions;

  if (socket == null) {
    throw new Error(`You have not passed socket instance to middleware options`);
  }

  return (store: Store) => {

    const normalizedActions = normalizeActionTypes(mergedOptions.listenTo);
  
    for (let actionType of normalizedActions) {
      socket.on(actionType, store.dispatch);
    }

    return (next: Dispatch) => (action: actionWithMeta) => {
      const shouldBeEmitted = (action.meta && action.meta.io != null)
        ? action.meta.io
        : mergedOptions.autoEmit;

      next(action);

      if (shouldBeEmitted) {
        socket.emit(action.type, action, store.dispatch);
      }
    }
  }
}


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