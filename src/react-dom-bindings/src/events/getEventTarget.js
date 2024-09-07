export function getEventTarget(nativeEvent) {
  // 已弃用的 Event.srcElement 是 Event.target 属性的别名
  const target = nativeEvent.target || nativeEvent.srcElement || window; //做兼容处理
  return target;
}