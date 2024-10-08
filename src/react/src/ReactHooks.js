import ReactCurrentDispatcher from "./ReactCurrentDispatcher";

/**
 * 
 * @param {*} reducer 处理函数 根据老状态和动作计算新状态
 * @param {*} initialArg 初始状态
 */
export function useReducer(reducer, initialArg) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useReducer(reducer, initialArg);
}

export function useState(initialArg) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialArg);
}

function resolveDispatcher() {
  return ReactCurrentDispatcher.current;
}