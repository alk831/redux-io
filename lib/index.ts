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
  /**
   * Socket.io client instance.
   */
  socket: SocketIOClient.Socket
  /**
   * Action types (event names) that are going to be automatically dispatched to the store.
   * @default []
   */
  listenTo?: string[]
  /**
   * Automatically emit every dispatched action.
   * Can be overwritten for specific action with meta `io: false` option.
   * @default true
   */
  autoEmit?: boolean
}

interface IoOptions {
  /**
   * Emits action with current store state (after this action has been dispatched).
   */
  withState?: boolean
}

interface ActionWithMeta extends Action {
  meta?: {
    /**
     * Disables/enables action emitting, or provides options to emitter when enabled.
     */
    io?: boolean | IoOptions
  }
}