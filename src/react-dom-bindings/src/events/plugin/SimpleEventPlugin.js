import { registerSimpleEvents, topLevelEventsToReactNames } from "../DOMEventProperties";
import { accumulateSinglePhaseListeners } from "../DOMpluginEventSystem";
import { IS_CAPTURE_PHASE } from "../EventSystemFlags";
import { SyntheticMouseEvent } from "../SyntheticMouseEvent";

/**
 * 把要执行的回调函数添加到dispatchQueue中
 * @param {*} dispatchQueue  派发队列，里面放置事件监听函数
 * @param {*} domEventName DOM事件名 click
 * @param {*} targetInst 目标Fiber
 * @param {*} nativeEvent 原生事件
 * @param {*} nativeEventTarget 原生事件源
 * @param {*} eventSystemFlags 事件系统标识 0 冒泡 4 捕获 
 * @param {*} targetContainer 目标容器 div#root
 */
function extractEvents(
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
  targetContainer
) {
  const isCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0; // 判断是否是捕获阶段
  const reactName = topLevelEventsToReactNames.get(domEventName); // click => onClick
  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEvent.type,
    isCapturePhase,
  );
  // console.log(isCapturePhase, listeners, 'listeners---');

  let SyntheticEventCtor; // 合成事件的构造函数
  switch (domEventName) {
    case 'click':
      SyntheticEventCtor = SyntheticMouseEvent;
      break;
    default:
      break;
  }

  // 如果要执行监听函数的话[onClickCapture, onClickCapture] = [ChildCapture, ChildCapture]
  if (listeners) {
    // 合成事件实例
    const event = new SyntheticEventCtor(reactName, domEventName, null, nativeEvent, nativeEventTarget);
    dispatchQueue.push({
      event,
      listeners,
    })
  }

}

export { registerSimpleEvents as registerEvents, extractEvents };