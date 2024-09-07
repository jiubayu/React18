import { HostRoot } from "./ReactWorkTags";

const concurrentQueue = [];
let concurrentQueuesIndex = 0;

export function finishQueueingConcurrentUpdates() {
  const endIndex = concurrentQueuesIndex;
  concurrentQueuesIndex = 0;
  let i = 0;
  while (i < endIndex) {
    const fiber = concurrentQueue[i++];
    const queue = concurrentQueue[i++];
    const update = concurrentQueue[i++];

    if (queue !== null && update !== null) {
      const pending = queue.pending;
      if (pending === null) {
        update.next = update; // 构建循环链表
      } else {
        update.next = pending.next;
        pending.next = update;
      }

      queue.pending = update;
    }
  }
}

/**
 * 把更新对象添加到更新队列中
 * @param {*} fiber 函数组件对应的fiber
 * @param {*} queue 要更新的hook对应的更新队列
 * @param {*} update 更新对象
 */
export function enqueueConcurrentHookUpdate(fiber, queue, update) {
  enqueueUpdate(fiber, queue, update);
  return getRootForUpdatedFiber(fiber);
}

// 从当前的fiber走到根fiber对应的真实DOM
function getRootForUpdatedFiber(sourceFiber) {
  let node = sourceFiber;
  let parent = node.return;
  while (parent !== null) {
    node = parent;
    parent = node.return;
  }

  return node.tag === HostRoot ? node.stateNode : null; // FiberRootNode div#root
}

// 把更新先缓存到数组中
function enqueueUpdate(fiber, queue, update) {
  concurrentQueue[concurrentQueuesIndex++] = fiber; // 函数组件对应的fiber
  concurrentQueue[concurrentQueuesIndex++] = queue; // 要更新的hook对应的更新队列
  concurrentQueue[concurrentQueuesIndex++] = update; // 更新对象
}


/**
 * 本来吃方法要处理优先级的问题，
 * 目前现在只实现向上找到根节点
 * @param {*} sourceFiber 
 * @returns 
 */
export function markUpdateLineFromFiberToRoot(sourceFiber) {
  let node = sourceFiber; // 当前fiber
  let parent = sourceFiber.return; // 当前fiber父fiber
  
  while (parent !== null) {
    node = parent;
    parent = parent.return;
  }
  // 找到parent为null，只有HostRoot的parent为null
  if (node.tag === HostRoot) {
    return node.stateNode;
  }
  return null;
}