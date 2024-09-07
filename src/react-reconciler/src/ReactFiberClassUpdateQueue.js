import assign from 'shared/assign';
import { markUpdateLineFromFiberToRoot } from './ReactFiberConcurrentUpdates';

export const UpdateState = 0;
export function initializedUpdateQueue(fiber) {
  // 创建一个新的更新队列
  // pending其实是一个循环链接
  const queue = {
    shared: {
      pending: null
    }
  }
  fiber.updateQueue = queue;
}

export function createUpdate() {
  const update = {tag: UpdateState};
  return update;
}

export function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;
  if (pending === null) {
    // update的next指向自己
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  } 
  // pending需要指向最后一个更新  最后一个更新next需要指向第一个更新
  // 单向循环链表
  updateQueue.shared.pending = update;
  return markUpdateLineFromFiberToRoot(fiber);
}

/**
 * 根据老状态和更新队列中的更新计算出新状态
 * @param {*} workInProgress 要计算的fiber
 */
export function processUpdateQueue(workInProgress) {
  const queue = workInProgress.updateQueue;
  // 等待生效的队列
  const pendingQueue = queue.shared.pending;
  // 如果有更新，或者说更新队列里有内容
  if (pendingQueue !== null) {
    // 清除队列中的更新
    queue.shared.pending =  null;
    // 获取更新队列中的最后一个更新 update = {payload: {element: 'h1'}};
    const lastPendingUpdate = pendingQueue;
    // 指向第一个更新
    const firstPendingUpdate = lastPendingUpdate.next;
    // 把循环链表剪开，变成一个单链表
    lastPendingUpdate.next = null;
    // 获取老状态 null
    let newState = workInProgress.memoizedState;
    let update = firstPendingUpdate;
    while (update) {
      // 根据老状态和更新计算出新状态
      newState = getStateFromUpdate(update, newState);
      update = update.next;
    }
    // console.log(newState, 'newState---')
    // 把最终计算到的状态赋值给memoizedState
    workInProgress.memoizedState = newState;
  }
}
/**
 * 根据老状态和更新计算出新状态 state = 0 => update = 1 => update = 2
 * @param {*} update 更新对象会有很多种类型
 * @param {*} prevUpdate 
 * @returns 
 */
function getStateFromUpdate(update, prevUpdate) {
  switch (update.tag) {
    case UpdateState:
      const { payload } = update;
      const partialState = payload;
      return assign({}, prevUpdate, partialState);
    default:
      return prevUpdate;
  }
}

