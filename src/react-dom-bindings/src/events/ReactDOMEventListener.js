import { getClosestInstanceFromNode } from "../client/ReactDOMComponentTree";
import { dispatchEventforPluginEventSystem } from "./DOMpluginEventSystem";
import { getEventTarget } from "./getEventTarget";

export function createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags) {
  const listenerWrapper = dispatchDiscreteEvent;
  return listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
}
/**
 * 派发离散事件的监听函数  离散指的是事件不连续 离散事件比如click， 非离散事件比如scroll，滚动事件是连续执行的
 * @param {*} domEventName 事件名 click
 * @param {*} eventSystemFlags 阶段 0 冒泡 4 捕获
 * @param {*} container 容器 div#root
 * @param {*} nativeEvent 原生的事件
 */
function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
  dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
}

/**
 * 此方法就是委托给容器的回调，当容器#root在捕获或者冒泡阶段处理事件的时候会执行此函数
 * @param {*} domEventName 
 * @param {*} eventSystemFlags 
 * @param {*} container 
 * @param {*} nativeEvent 
 */
export function dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent) {
  // console.log('dispatchEvent', domEventName, eventSystemFlags, container, nativeEvent);
  // 获取事件源，是一个真实DOM
  const nativeEventTarget = getEventTarget(nativeEvent);
  // 寻找离事件源对应的fiber节点
  const targetInst = getClosestInstanceFromNode(nativeEventTarget);
  dispatchEventforPluginEventSystem(
    domEventName, // click
    eventSystemFlags, // 0 4
    nativeEvent, // 原生事件
    targetInst, // 真实dom对应的fiber
    container // 目标容器
  )
}