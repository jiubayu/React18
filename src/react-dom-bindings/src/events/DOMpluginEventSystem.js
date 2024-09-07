import { HostComponent } from "react-reconciler/src/ReactWorkTags";
import { addEventBubbleListener, addEventCaptureListener } from "./EventListener";
import { allNativeEvents } from "./EventRegistry";
import { IS_CAPTURE_PHASE } from "./EventSystemFlags";
import { getEventTarget } from "./getEventTarget";
import * as SimpleEventPlugin from './plugin/SimpleEventPlugin';
import { createEventListenerWrapperWithPriority } from "./ReactDOMEventListener";
import getListener from "./getListener";

SimpleEventPlugin.registerEvents();
const listeningMarker = '_reactListening' + Math.random().toString(36).slice(2);

export function listenToAllSupportedEvents(rootContainerElement) {
  // 只监听一次
  if (!rootContainerElement[listeningMarker]) {
    rootContainerElement[listeningMarker] = true;
    // 遍历所有的原生事件比如click，进行监听
    allNativeEvents.forEach(domEventName => {
      // console.log(domEventName, 'domEventName----');
      listenToNativeEvent(domEventName, true, rootContainerElement);
      listenToNativeEvent(domEventName, false, rootContainerElement);
    })
  }
}

/**
 * 注册原生事件
 * 当在页面触发click事件的时候，会走事件处理函数
 * 事件处理函数需要找到DOM元素对应的要执行的React事件 onClick, onClickCapture
 * @param {*} domEventName 事件名称 click
 * @param {*} isCapturePhaseListener 是否是捕获阶段
 * @param {*} target 目标DOM节点 div#root 根容器节点
 */
export function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
  let eventSystemFlags = 0; // 0 默认是冒泡，捕获是4
  if (isCapturePhaseListener) {
    eventSystemFlags |= IS_CAPTURE_PHASE;
  }
  addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
}

function addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener) {
  const listener = createEventListenerWrapperWithPriority(target, domEventName, eventSystemFlags);
  if (isCapturePhaseListener) {
    addEventCaptureListener(target, domEventName, listener);
  } else {
    addEventBubbleListener(target, domEventName, listener);
  }
}

export function dispatchEventforPluginEventSystem(
  domEventName, eventSystemFlags, nativeEvent, targetInst, container
) {
  dispatchEventForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, container);
}

function dispatchEventForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
  const nativeEventTarget = getEventTarget(nativeEvent);
  // 派发事件的数组
  const dispatchQueue = [];
  extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  );
  // console.log(dispatchQueue, 'dispatchQueue');
  processDispatchQueue(dispatchQueue, eventSystemFlags);
}

function processDispatchQueue(dispatchQueue, eventSystemFlags) {
  const isCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0; // 4 捕获阶段
  for (let i = 0; i < dispatchQueue.length; i++) {
    const { event, listeners } = dispatchQueue[i];
    processDispatchQueueItemsInOrder(event, listeners, isCapturePhase);
  }
}

function processDispatchQueueItemsInOrder(event, dispatchListeners, isCapturePhase) {
  if (isCapturePhase) {
    for (let i = dispatchListeners.length - 1; i >= 0; i--) {
      const { listener,currentTarget } = dispatchListeners[i];
      if (event.isPropagationStopped()) { // 阻止传播
        return;
      }
      executeDispatch(event, listener, currentTarget);
    }
  } else {
    for (let i = 0; i < dispatchListeners.length; i++) {
      const { listener, currentTarget } = dispatchListeners[i];
      if (event.isPropagationStopped()) { // 阻止传播
        return;
      }
      executeDispatch(event, listener,  currentTarget);
    }
  }
}

function executeDispatch(event, listener, currentTarget) {
  // 合成事件的currentTarget是在不断变化的
  // event nativeEventTarget 它是原始的事件源，是永远不变的
  // event currentTarget 当前事件源，它会随着事件回调的执行不停的变化
  event.currentTarget = currentTarget;
  listener(event);
}

function extractEvents(
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
  targetContainer
) {
  SimpleEventPlugin.extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  )
}

export function accumulateSinglePhaseListeners(targetFiber, reactName, nativeEventType, isCapturePhase) {
  const captureName = reactName + 'Capture';
  const reactEventName = isCapturePhase ? captureName : reactName;
  const listeners = [];
  let instance = targetFiber;
  while (instance !== null) {
    const { stateNode, tag } = instance; // 拿到fiber对应的真实DOM节点
    if (tag === HostComponent && stateNode) { // 如果是原生节点的话
      if (reactEventName !== null) {
        const listener = getListener(instance, reactEventName);
        if (listener) {
          listeners.push(createDispatchListener(instance, listener, stateNode)); // stateNode是当前执行回调的DOM节点
        }
      }
    }
    instance = instance.return; // 向上找当前fiber的父节点
  }

  return listeners;
}

function createDispatchListener(instance, listener, currentTarget) {
  return {instance, listener, currentTarget}
}