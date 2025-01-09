import { IdlePriority, ImmediatePriority, LowPriority, NormalPriority, UserBlockingPriority } from "./SchedulerPriority";
import { push, peek, pop } from "./SchedulerMinHeap";

// 任务ID计时器 排序
let taskIdCounter = 1;
// 任务的最小堆
const taskQueue = []; 

let scheduledHostCallback = null;
let startTime = -1; // 开始执行任务的时间
let currentTask = null; // 当前执行中的任务

// react每一帧向浏览器申请5ms用于任务执行
// 如果5ms内任务没有执行完成，react也会将控制权归还给浏览器
const frameInterval = 5; // 一帧16ms，react任务 主进程执行ui，用户输入等任务至少需要10ms， 所以每一帧执行任务的时间不要超过5ms

const channel = new MessageChannel();
var port1 = channel.port1;
var port2 = channel.port2;
port1.onmessage = performWorkUntilDeadline;

// 打开页面到现在 运行的时间
function getCurrentTime() {
  return performance.now();
}

var maxSigned31BitInt = 1073741823;

// Times out immediately
var IMMEDIATE_PRIORITY_TIMEOUT = -1;
// Eventually times out
var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
// 正常优先级的等待时间
var NORMAL_PRIORITY_TIMEOUT = 5000;
// 低优先级的等待时间 
var LOW_PRIORITY_TIMEOUT = 10000;
// 最低优先级 Never timeout 永不过期 最低优先级 
var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;

/**
 * 按优先级执行任务
 * @param {*} priorityLevel 优先级
 * @param {*} callback 任务
 */
// NormalPriority 3
function schedulerCallback(priorityLevel, callback) {
  // 获取当前的时间
  const currentTime = getCurrentTime();
  startTime = currentTime; // 此任务的开始时间
  // 超时时间，超时时间没过，高优先的任务可以打断当前任务，超时时间过了就不允许打断执行了
  let timeout;
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT; // -1
      break;
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT; // 250ms
      break;
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT; // 最大时间
      break;
    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT; // 10s
      break;
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT; // 5s
      break;
  }
  // 计算此任务的过期时间
  let expirationTime = startTime + timeout;

  const newTask = {
    id: taskIdCounter++,
    callback, // 回调函数或者说任务函数
    priorityLevel, // 任务的优先级
    startTime, // 任务的开始时间
    expirationTime, // 任务的过期时间
    sortIndex: expirationTime, // 排序依据
  }
  // 向最小堆添加任务，排序依据是过期时间expirationTime
  push(taskQueue, newTask);
  // flushWork 执行工作，刷新工作，执行任务，司机接人
  requestHostCallback(flushWork);

  return newTask;
  // requestIdleCallback(callback);
}

// function schedulerCallback(callback) { 
//   requestIdleCallback(callback);
// }

/**
 * 开始执行任务队列中的任务
 * @param {*} startTime 
 */
function flushWork(startTime) {
  return workLoop(startTime);
}

function shouldYieldToHost() {
  // 用当前时间减去任务开始的时间就是任务执行的时间
  const timeElapsed = getCurrentTime() - startTime;
  // 时间片的时间到期了
  if (timeElapsed < frameInterval) {
    return false
  }
  // 5ms的时间分片时间用完了，就放弃执行当前任务
  return true;
}

// 从最小堆中取出优先级最高的任务并进行执行
function workLoop(startTime) {
  let currentTime = startTime;
  currentTask = peek(taskQueue); 
  while (currentTask !== null && currentTask !== undefined) {
    // expirationTime 是 React 任务调度中一个重要的概念。它代表了一个任务的过期时间，
    // 
    // 当前任务的过期时间小于当前时间，也就是说没有过期，并且需要放弃执行 时间片到期
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
      break; // 跳出工作循环
    }

    // ! 对于当前任务的过期时间大于当前时间，也就是说如果任务在这个时间点之前没有被执行，React 就会认为这个任务已经过期，需要立即执行。
    // ! 并且不会break中断了
    const callback = currentTask.callback; // 取出当前任务中的执行函数
    if (typeof callback === 'function') {
      currentTask.callback = null;
      // 判断当前任务是否超时
      const didUsercallbackTimeout = currentTask.expirationTime <= currentTime;
      // 执行工作，返回新的函数，则表示还有任务需要执行
      const continuationCallback = callback(didUsercallbackTimeout);
      if (typeof continuationCallback === 'function') {
        currentTask.callback = continuationCallback;
        return true; // hasMoreWork 还有任务需要执行
      } 
      // 如果此任务已经完成，则不需要在继续执行了，可以将此任务弹出去
      if (currentTask === peek(taskQueue)) {
        pop(taskQueue);
      }
    } else {
      pop(taskQueue);
    }
    // 如果当前的任务执行完了，或者当前任务不合法，取出下一个任务执行
    currentTask = peek[taskQueue];
  }

  // 如果工作循环结束，还有任务需要执行，就返回 hasMoreTask = true
  if (currentTask !== null) {
    return true;
  }
  // 没有其他的任务了，就返回false
  return false;
}

function requestHostCallback(flushWork) {
  // 先缓存回调函数
  scheduledHostCallback = flushWork;
  // 执行工作直到截止时间
  schedulePerformWorkUntilDeadline();
}

function schedulePerformWorkUntilDeadline() {
  port2.postMessage(null);
}

function performWorkUntilDeadline(event) {
  console.log(event.data, 'from-port1')
  if (scheduledHostCallback) {
    // 表示时间片的开始时间
    startTime = getCurrentTime(); // 获取开始时间 相对于页面打开到现在的时间
    // 是否有更多的工作需要执行
    let hasMoreWork = true;
    try {
      // 执行flushWork并判断是否有返回值
      hasMoreWork = scheduledHostCallback(startTime);
    } finally {
      if (hasMoreWork) {
        // 继续执行
        schedulePerformWorkUntilDeadline();
      } else {
        scheduledHostCallback = null;
      }
    }
  }
}


export {
  shouldYieldToHost as shouldYield,
  schedulerCallback,
  ImmediatePriority,
  UserBlockingPriority ,
  NormalPriority,
  IdlePriority,
}