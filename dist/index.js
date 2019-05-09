"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const defaultOptions = {
    autoEmit: true,
    emitPrefix: '$',
    listenTo: []
};
const middleware = (options) => {
    const mergedOptions = {
        ...defaultOptions,
        ...options
    };
    const { socket, autoEmit, listenTo } = mergedOptions;
    if (socket == null) {
        throw new Error(`You have not passed socket instance to middleware options`);
    }
    return (store) => {
        const normalizedActions = utils_1.normalizeActionTypes(listenTo);
        for (let actionType of normalizedActions) {
            socket.on(actionType, (action) => {
                const mergedAction = {
                    ...action,
                    meta: {
                        io: autoEmit,
                        ...action.meta
                    }
                };
                store.dispatch(mergedAction);
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
