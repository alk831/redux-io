"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeActionTypes = (actions) => Array.isArray(actions) ? actions : Object.values(actions);
