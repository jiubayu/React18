const allNativeEvents = new Set();

/**
 * 注册两个阶段的事件
 * @param {*} registrationName react事件名 onClick
 * @param {*} dependencies dom原生事件数组 [click]
 */
function registerTwoPhaseEvent(registrationName, dependencies) {
  // 注册冒泡阶段的事件对应关系
  registerDirectEvent(registrationName, dependencies);
  // 注册捕获阶段的事件对应关系
  registerDirectEvent(registrationName+'Capture', dependencies);
}

function registerDirectEvent(registrationName, dependencies) {
  for (let i = 0; i < dependencies.length; i++) {
    allNativeEvents.add(dependencies[i]); // click
  }
}

export {
  allNativeEvents,
  registerTwoPhaseEvent,
  registerDirectEvent
}