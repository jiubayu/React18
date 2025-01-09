import {
  schedulerCallback,
  ImmediatePriority as ImmediateSchedulerPriority,
  UserBlockingPriority as UserBlockingSchedulerPriority,
  NormalPriority as NormalSchedulerPriority,
  IdlePriority as IdleSchedulerPriority,
  shouldYield
 } from "scheduler/src/forks/Schduler";
import { beginWork } from "./ReactFiberBeginWork";
import { createWorkInProgress } from "./ReactFiber";
import { completeWork } from "./ReactFiberCompleteWork";
import { ChildDeletion, MutationMask, NoFlags, Passive, Placement, Update } from "./ReactFiberFlags";
import { commitMutationEffectsOnFiber, commitPassiveMountEffects, commitPassiveUnmountEffects, commitLayoutEffects } from "./ReactFiberCommitWork";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTags";
import { finishQueueingConcurrentUpdates } from "./ReactFiberConcurrentUpdates";

let workInProgress = null;
let workInPorgressRoot = null;
let rootDoesHavaPassiveEffect = false; // 此根fiber上有没有useEffect类型的副作用
let rootWithPendingPassiveEffects = null; // 具有useEffect副作用的根节点 fiberRootNode div#root

/**
 * 计划更新root
 * 源码中此处有任务调度的功能
 * @param {*} root 
 */
export function schedulerUpdateOnFiber(root) {
  // 确保调度执行root上的更新
  ensureRootIsScheduled(root);
}
function ensureRootIsScheduled(root) {
  // 每次更新时将workInPorgressRoot赋值为root，commit完成后清空
  // 这样可以达到批量更新的效果，即更新周期内只执行一次
  if (workInPorgressRoot) return;
  workInPorgressRoot = root;
  // 告诉浏览器要执行performanceConcurrentWorkOnRoot，参数就为root
  schedulerCallback(NormalSchedulerPriority, performanceConcurrentWorkOnRoot.bind(null, root));
  // schedulerCallback(performanceConcurrentWorkOnRoot.bind(null, root));
}
/**
 * 根据fiber构建fiber树，创建真实的DOM节点，还需要把真实的DOM节点插入容器
 * @param {*} root 
 */
function performanceConcurrentWorkOnRoot(root, timeout) {
  // debugger
  // 第一次渲染以同步的方式渲染根节点，初次渲染的时候，都是同步
  renderRootSync(root);
  // console.log(root, 'root----')
  // 开始进入提交阶段，也就是执行副作用，修改真实DOM
  const finishedWork = root.current.alternate; // 拿到构建完成的新fiber
  root.finishedWork = finishedWork;
  commitRoot(root);
  workInPorgressRoot = null;
}

function flushPassiveEffect() {
  if (rootWithPendingPassiveEffects !== null) {
    const root = rootWithPendingPassiveEffects;
    console.log('下一个宏任务中cflushPassiveEffect~~~~~~~~~~~~~~~~~~~~~~~~~~');
    // 执行卸载副作用 destroy
    commitPassiveUnmountEffects(root.current);
    // 执行挂载副作用 create
    commitPassiveMountEffects(root, root.current);
  }
}

function commitRoot(root) {
  // debugger
  // 新的构建好的根fiber
  const { finishedWork } = root;
  // 有effect
  if ((finishedWork.subtreeFlags & Passive) !== NoFlags ||
    (finishedWork.flags & Passive) !== NoFlags) {
    if (!rootDoesHavaPassiveEffect) {
      rootDoesHavaPassiveEffect = true;
      schedulerCallback(flushPassiveEffect);
    }
  }
  // printFinishedWork(finishedWork);
  console.log('开始commit~~~~~~~~~~~~~~~~~~~~~~~~~~');
  // 判断子树有没有副作用
  const subtreeFlags = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  // 判断自己是否有副作用
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
  // 如果自己或者子节点有副作用，就执行操作
  if (subtreeFlags || rootHasEffect) {
    // console.log('commitRoot', finishedWork.child);
    console.log('DOM执行变更commitMutationEffectsOnFiber~~~~~~~~~~~~~~~~~~~~~~~~~~');
    // 当DOM执行完成变更之后
    commitMutationEffectsOnFiber(finishedWork, root);
    // 执行LayoutEffect
    console.log('DOM执行变更后commitLayoutEffects~~~~~~~~~~~~~~~~~~~~~~~~~~');
    commitLayoutEffects(finishedWork, root);
    if (rootDoesHavaPassiveEffect) {
      rootDoesHavaPassiveEffect = false;
      rootWithPendingPassiveEffects = root;
    }
  }
  // 等DOM变更完成之后，执行完成后，
  root.current = finishedWork;
}

function renderRootSync(root) {
  // 开始构建fiber树
  prepareFreshStack(root);
  workLoopSync();
}

function prepareFreshStack(root) {
  // root.current指的是老的根fiber
  workInProgress = createWorkInProgress(root.current, null);
  finishQueueingConcurrentUpdates();
}

// 开始同步工作循环
function workLoopConcurrent() {
  // console.log("🚀 ~ workLoopSync ~ workInProgress:", workInProgress)
  // 如果有下一个要构建的fiber任务并且时间片没有过期
  while (workInProgress !== null && !shouldYield()) {
    performanceUnit(workInProgress);
  }
}

// 开始同步工作循环
function workLoopSync() {
  // console.log("🚀 ~ workLoopSync ~ workInProgress:", workInProgress)
  while (workInProgress !== null && !shouldYield()) {
    performanceUnit(workInProgress);
  }
}

/**
 * 执行一个工作单元 
 * @param {*} unitOfWork 
 */
function performanceUnit(unitOfWork) {
  // 获取新fiber对应的老fiber
  const current = unitOfWork.alternate;
  // 完成当前fiber的子fiber链表构建后
  const next = beginWork(current, unitOfWork);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null || next === undefined) { // 如果没有子节点表示当前fiber已经完成了
    workInProgress = null;
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}

function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  do {
    const current = unitOfWork.alternate;
    const returnFiber = completedWork.return;
    // 执行此fiber的完成工作
    // 如果是原生组件，就是创建对应的真实DOM节点
    completeWork(current, completedWork);
    // 如果有弟弟，就构建弟弟的fiber
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      workInProgress = siblingFiber;
      return;
    }
    // 如果没有弟弟，说明当前完成的是父fiber的最后一个节点
    // 标志它的父亲已经完成了
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}

function printFinishedWork(fiber) {
  let { child, deletions, flags } = fiber;
  if ((flags & ChildDeletion) !== NoFlags) {
    fiber.flags &= (~ChildDeletion);
    console.log("子节点删除" + deletions.map(item => `${item.type}#${item.memoizedProps.id}`).join(''));
  }
  while (child) {
    printFinishedWork(child);
    child = child.sibling;
  }
  if (fiber.flags !== NoFlags) {
    console.log(getFlags(fiber), getTag(fiber.tag), typeof fiber.type === 'function' ? fiber.type.name : fiber.type, fiber.memoizedProps, 'FinishedWork----');
  }
}

function getTag(tag) {
  switch (tag) {
    case HostRoot:
      return 'HostRoot';
    case HostComponent:
      return 'HostComponent';
    case HostText:
      return 'HostText';
    case FunctionComponent:
      return 'FunctionComponent'
    default:
      return tag;
  }
}

function getFlags(fiber) {
  const { flags, deletions } = fiber;
  if (flags === Placement) {
    return '插入'
  } else if (flags === Update) {
    return '更新'
  } else if (flags === (Placement | Update)) {
    return '移动'
  }

  return flags;
}