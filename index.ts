import { Action, Dispatch, Store } from 'redux';

interface IOptions {
  socket: SocketIOClientStatic,
  autoEmit: boolean
  emitName: string
}

const defaultOptions = {
  autoEmit: true,
  emitName: '$'
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

  return (store: Store) => (action: actionWithMeta) => (dispatch: Dispatch) => {
    const { socket } = mergedOptions;
    const { meta = {} } = action;

    socket.emit(action.type, action, store.dispatch);
  }
}

export default middleware;