const InputContinuousHydrationLane = /*    */ 0b0000000000000000000000000000010;
const SyncLane = /*                        */ 0b0000000000000000000000000000001;
const NoLane = /*                          */ 0b0000000000000000000000000000000;

let renderLanes = NoLane;
function initializeUpdateQueue(fiber) {
  const queue = {
    shared: {
      pending: null,
    }
  }
  fiber.updateQueue = queue;
}

function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  sharedQueue.pending = update; 
}

function processUpdateQueue(fiber) {
  const queue = fiber.updateQueue;
  // 老链表头
  let firstBaseUpdate = queue.firstBaseUpdate;
  // 老链表尾
  let lastBaseUpdate = queue.lastBaseUpdate;
  // 新链表尾部 D->A->B->C->D
  const pendingQueue = queue.shared.pending;
  // 合并新老链表为单链表
  // firstBaseUpdate->A->B->C->D->lastBaseUpdate
  if (pendingQueue !== null) {
    queue.shared.pending = null;
    // 新链表尾部
    const lastPendingUpdate = pendingQueue;
    const firstPengdingUpdate = lastPendingUpdate.next;
    // 把循环链表剪开，变成一个单链表
    lastPendingUpdate.next = null;
    if(lastBaseUpdate === null) {
      firstBaseUpdate = firstPengdingUpdate;
    } else {
      lastBaseUpdate.next = firstPengdingUpdate;
    }
    // 老链表尾指向新链表尾
    lastBaseUpdate = lastPendingUpdate;
  }

  // 如果老链表头存在
  // 
  if (firstBaseUpdate !== null) {
    // 上次跳过的更新状态
    let newState = fiber.memoizedState;
    // 尚未执行更新的fiber的lane
    let newLanes = NoLane;
    let newBaseState = null;
    let newFirstBaseUpdate = null;
    let newLastBaseUpdate = null;
    let update = firstBaseUpdate; // A
    do {
      // 获取更新的车道
      const updateLane = update.lane;
      // 当前更新的赛道updateLane是否在渲染车道renderLanes内，进行更新处理
      if (isSubsetOfLanes(renderLanes, updateLane)) {
        newLanes = newLanes | updateLane; 
        newState = update.payload(newState);
      } else {
        // 把此更新clone一份
        const clone = {
          id: update.id,
          payload: update.payload,
          lane: updateLane
        }
        if(newFirstBaseUpdate === null) {
          newFirstBaseUpdate = clone;
        }
        newLastBaseUpdate = update;
      }
      update = update.next;
    }

    while (update !== null && update !== firstBaseUpdate);
    if (newLastBaseUpdate !== null) {
      newFirstBaseUpdate = newLastBaseUpdate.next;
      newLastBaseUpdate.next = null;
    }
    fiber.memoizedState = newState;
    firstBaseUpdate = newFirstBaseUpdate;
    baseState = newBaseState;
    baseLanes = newLanes;
  }
}

let fiber = { memoizedState: '' };
initializeUpdateQueue(fiber)
let updateA = {id: 'A', payload: (state) => state+'A', lane: InputContinuousHydrationLane};
let updateB = { id: 'B', payload: (state) => state + 'B', lane: SyncLane };
let updateC = { id: 'C', payload: (state) => state + 'C', lane: InputContinuousHydrationLane };
let updateD = { id: 'D', payload: (state) => state + 'D', lane: SyncLane };
enqueueUpdate(fiber, updateA);
enqueueUpdate(fiber, updateB);
enqueueUpdate(fiber, updateC);
enqueueUpdate(fiber, updateD);
processUpdateQueue(fiber);
console.log(fiber.memoizedState)