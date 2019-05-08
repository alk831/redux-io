"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOptions = {
    autoEmit: true,
    emitPrefix: '$',
    listenActions: {}
};
const middleware = (options) => {
    /* Setup listeners and send dispatch argument on first (connect) event */
    const mergedOptions = {
        ...defaultOptions,
        ...options
    };
    const { socket, listenActions } = mergedOptions;
    if (socket == null) {
        throw new Error(`You have not passed socket instance to middleware options`);
    }
    return (store) => {
        for (let actionType in listenActions) {
            socket.on(actionType, (action) => {
                store.dispatch({
                    ...action,
                    meta: {
                        io: false,
                        ...action.meta || {}
                    }
                });
            });
        }
        return (next) => (action) => {
            next(action);
            if (action.meta && action.meta.io === true) {
                socket.emit(action.type, action, store.dispatch);
            }
        };
    };
};
exports.default = middleware;
