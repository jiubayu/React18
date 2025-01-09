const TotalLanes = 31;
// 无 0
const NoLanes = /*                        */ 0b0000000000000000000000000000000;
const NoLane = /*                          */ 0b0000000000000000000000000000000;
// 同步车道 1
const SyncLane = /*                        */ 0b0000000000000000000000000000001;
// 输入连续水合车道 2
const InputContinuousHydrationLane = /*    */ 0b0000000000000000000000000000010;
// 输入连续车道 4
const InputContinuousLane = /*             */ 0b0000000000000000000000000000100;
// 默认水合车道 8
const DefaultHydrationLane = /*            */ 0b0000000000000000000000000001000;
// 默认车道 16
const DefaultLane = /*                     */ 0b0000000000000000000000000010000;

const TransitionHydrationLane = /*                */ 0b0000000000000000000000000100000;
const TransitionLaness = /*                       */ 0b0000000001111111111111111000000;
const TransitionLane1 = /*                        */ 0b0000000000000000000000001000000;
const TransitionLane2 = /*                        */ 0b0000000000000000000000010000000;
const TransitionLane3 = /*                        */ 0b0000000000000000000000100000000;
const TransitionLane4 = /*                        */ 0b0000000000000000000001000000000;
const TransitionLane5 = /*                        */ 0b0000000000000000000010000000000;
const TransitionLane6 = /*                        */ 0b0000000000000000000100000000000;
const TransitionLane7 = /*                        */ 0b0000000000000000001000000000000;
const TransitionLane8 = /*                        */ 0b0000000000000000010000000000000;
const TransitionLane9 = /*                        */ 0b0000000000000000100000000000000;
const TransitionLane10 = /*                       */ 0b0000000000000001000000000000000;
const TransitionLane11 = /*                       */ 0b0000000000000010000000000000000;
const TransitionLane12 = /*                       */ 0b0000000000000100000000000000000;
const TransitionLane13 = /*                       */ 0b0000000000001000000000000000000;
const TransitionLane14 = /*                       */ 0b0000000000010000000000000000000;
const TransitionLane15 = /*                       */ 0b0000000000100000000000000000000;
const TransitionLane16 = /*                       */ 0b0000000001000000000000000000000;

const RetryLaness = /*                            */ 0b0000111110000000000000000000000;
const RetryLane1 = /*                             */ 0b0000000010000000000000000000000;
const RetryLane2 = /*                             */ 0b0000000100000000000000000000000;
const RetryLane3 = /*                             */ 0b0000001000000000000000000000000;
const RetryLane4 = /*                             */ 0b0000010000000000000000000000000;
const RetryLane5 = /*                             */ 0b0000100000000000000000000000000;

const SomeRetryLane = RetryLane1;

const SelectiveHydrationLane = /*          */ 0b0001000000000000000000000000000;

const NonIdleLaness = /*                          */ 0b0001111111111111111111111111111;

const IdleHydrationLane = /*               */ 0b0010000000000000000000000000000;
const IdleLane = /*                        */ 0b0100000000000000000000000000000;

const OffscreenLane = /*                   */ 0b1000000000000000000000000000000;

function getHighestPriorityLane(lanes) {
  return lanes & -lanes;
}

let a = 0b00011000;
// lanes = 24 => -lanes = -24 -24的补码是 11101000
//也就是求0b00011000 & 
//       0b11101000 => 0b00001000 => 8
console.log(getHighestPriorityLane(a))
console.log(5 & -5)
// 5 ->        00000101
// - 5 -> 原码 10000101
//        反码 11111010
//        补码 11111011
// & 00000101
//   11111011 => 00000001 => 1
