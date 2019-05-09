
interface StringMap { [s: string]: string; }

export const normalizeActionTypes = (actions: string[] | StringMap ) =>
  Array.isArray(actions) ? actions : Object.values(actions);