"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOptions = {
    autoEmit: true,
    emitPrefix: '$',
    listenTo: []
};
exports.createIoMiddleware = (options) => {
    const mergedOptions = {
        ...defaultOptions,
        ...options
    };
    const { socket } = mergedOptions;
    if (socket == null) {
        throw new Error(`You have not passed socket instance to middleware options`);
    }
    return (store) => {
        for (let actionType of mergedOptions.listenTo) {
            socket.on(actionType, store.dispatch);
        }
        return (next) => (action) => {
            const shouldBeEmitted = (action.meta && action.meta.io != null)
                ? !!action.meta.io
                : mergedOptions.autoEmit;
            next(action);
            if (shouldBeEmitted) {
                if (action.meta && typeof action.meta.io === 'object' && action.meta.io.withState) {
                    socket.emit(action.type, action, store.getState(), store.dispatch);
                }
                else {
                    socket.emit(action.type, action, store.dispatch);
                }
            }
        };
    };
};
exports.ioMiddleware = exports.createIoMiddleware;
