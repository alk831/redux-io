"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOptions = {
    autoEmit: true,
    emitName: '$'
};
const middleware = (options) => {
    const mergedOptions = {
        ...defaultOptions,
        ...options
    };
    return (store) => (next) => (action) => {
        const { socket } = mergedOptions;
        next(action);
        if (action.meta && action.meta.io === true) {
            socket.emit(action.type, action, store.dispatch);
        }
    };
};
exports.default = middleware;
