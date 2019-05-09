"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const defaultOptions = {
    autoEmit: true,
    emitPrefix: '$',
    listenTo: []
};
exports.ioMiddleware = (options) => {
    const mergedOptions = {
        ...defaultOptions,
        ...options
    };
    const { socket } = mergedOptions;
    if (socket == null) {
        throw new Error(`You have not passed socket instance to middleware options`);
    }
    return (store) => {
        const normalizedActions = utils_1.normalizeActionTypes(mergedOptions.listenTo);
        for (let actionType of normalizedActions) {
            socket.on(actionType, store.dispatch);
        }
        return (next) => (action) => {
            const shouldBeEmitted = (action.meta && action.meta.io != null)
                ? !!action.meta.io
                : mergedOptions.autoEmit;
            next(action);
            if (shouldBeEmitted) {
                socket.emit(action.type, action, store.dispatch);
            }
        };
    };
};
