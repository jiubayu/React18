// 一共有16种优先级

// 同步优先级
const SyncLanePriority = 15;
const SyncBatchedLanePriority = 14;
//离散事件优先级
const InputDiscreteHydrationLanePriority = 13;
const InputDiscreteLanePriority = 12;
//连续事件优先级
const InputContinuousHydrationLanePriority = 11;
const InputContinuousLanePriority = 10;
//默认优先级
const DefaultHydrationLanePriority = 9;
const DefaultLanePriority = 8;
//渐变优先级
const TransitionHydrationPriority = 7;
const TransitionPriority = 6;
const RetryLanePriority = 5;
const SelectiveHydrationLanePriority = 4;
//空闲优先级
const IdleHydrationLanePriority = 3;
const IdleLanePriority = 2;
//离屏优先级
const OffscreenLanePriority = 1;
//未设置优先级
const NoLanePriority = 0;
/**
 * 一共有31条车道
 */
const TotalLines = 31;
//没有车道，所有位都为0
const NoLanes = 0b0000000000000000000000000000000;
const NoLane = 0b0000000000000000000000000000000;
//同步车道，优先级最高
const SyncLane = 0b0000000000000000000000000000001;
const SyncBatchedLane = 0b0000000000000000000000000000010;
//离散用户交互车道 click
const InputDiscreteHydrationLane = 0b0000000000000000000000000000100;
const InputDiscreteLanes = 0b0000000000000000000000000011000;
//连续交互车道 mouseMove
const InputContinuousHydrationLane = 0b0000000000000000000000000100000;
const InputContinuousLanes = 0b0000000000000000000000011000000;
//默认车道
const DefaultHydrationLane = 0b0000000000000000000000100000000;
const DefaultLanes = 0b0000000000000000000111000000000;
//渐变车道
const TransitionHydrationLane = 0b0000000000000000001000000000000;
const TransitionLanes = 0b0000000001111111110000000000000;
//重试车道
const RetryLanes = 0b0000011110000000000000000000000;
const SomeRetryLane = 0b0000010000000000000000000000000;
//选择性水合车道
const SelectiveHydrationLane = 0b0000100000000000000000000000000;
//非空闲车道
const NonIdleLanes = 0b0000111111111111111111111111111;
const IdleHydrationLane = 0b0001000000000000000000000000000;
//空闲车道
const IdleLanes = 0b0110000000000000000000000000000;
//离屏车道
const OffscreenLane = 0b1000000000000000000000000000000;

/**
 * 分离出所有比特位中最右边的1
 * 分离出最高优先级的车道
 * @param {*} lanes 车道
 * @returns 车道
 */
function getHighestPriorityLane(lanes) {
  return lanes & -lanes;
}
/**
 * 分离出所有比特位最左边的1
 * 分离出最低优先级的车道
 * @param {*} lanes 车道
 */
function getLowestPriorityLane(lanes) {
  // Math.clz32 返回开头的 0 的个数
  const index = 31 - Math.clz32(lanes);
  console.log(Math.clz32(lanes), index, 'index---')
  return index < 0 ? NoLanes : 1 << index;
}
console.log(getLowestPriorityLane(InputDiscreteLanes)); // 16