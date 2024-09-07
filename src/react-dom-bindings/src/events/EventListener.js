export function addEventCaptureListener(target, domEventName, listener) {
  target.addEventListener(domEventName, listener, true); // 捕获
  return listener;
}

export function addEventBubbleListener(target, domEventName, listener) {
  target.addEventListener(domEventName, listener, false); // 冒泡
  return listener;
}
