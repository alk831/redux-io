import { Action, Dispatch, Store } from 'redux';

const defaultOptions = {
  autoEmit: true,
  emitPrefix: '$',
  listenTo: []
}

export const createIoMiddleware = (options: MiddlewareOptions) => {
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

      const shouldBeEmitted = (action.meta && action.meta.io != null)
        ? !!action.meta.io
        : mergedOptions.autoEmit;

      next(action);

      if (shouldBeEmitted) {
        socket.emit(action.type, action, store.dispatch);
      }
    }
  }
}

export { createIoMiddleware as ioMiddleware };

interface MiddlewareOptions {
  socket: SocketIOClient.Socket
  listenTo?: string[]
  autoEmit?: boolean
}

interface ActionMeta {
  io?: boolean
}

interface ActionWithMeta extends Action {
  meta?: ActionMeta
}