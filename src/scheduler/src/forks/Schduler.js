// todo 后续实现优先队列（最小堆）
export function schedulerCallback(callback) {
  requestIdleCallback(callback);
}