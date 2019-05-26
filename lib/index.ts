import { Action, Dispatch, Store } from 'redux';

const defaultOptions = {
  autoEmit: true,
  listenTo: []
}

export const createIoMiddleware = (options: CreateIoMiddleware) => {
  const mergedOptions = {
    ...defaultOptions,
    ...options
  }
  const { socket } = mergedOptions;

  if (socket == null) {
    throw new Error(`You have not passed socket instance to middleware options`);
  }

  return (store: Store) => {

    for (let actionType of mergedOptions.listenTo) {
      socket.on(actionType, store.dispatch);
    }

    return (next: Dispatch) => (action: ActionWithMeta) => {
      const meta = action.meta || {};
      const shouldBeEmitted = (meta.io != null)
          ? !!meta.io
          : mergedOptions.autoEmit;

      next(action);

      if (shouldBeEmitted) {
        if (typeof meta.io === 'object' && meta.io.withState) {
          socket.emit(action.type, action, store.getState(), store.dispatch);
        } else {
          socket.emit(action.type, action, store.dispatch);
        }
      }
    }
  }
}

export { createIoMiddleware as ioMiddleware };

interface CreateIoMiddleware {
  socket: SocketIOClient.Socket
  listenTo?: string[]
  autoEmit?: boolean
}

interface IoOptions {
  withState?: boolean
}

interface ActionWithMeta extends Action {
  meta?: {
    io?: boolean | IoOptions
  }
}