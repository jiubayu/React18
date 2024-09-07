import ReactSharedInternals from "shared/ReactSharedInternals";
import { schedulerUpdateOnFiber } from "./ReactFiberWorkloop";
import { enqueueConcurrentHookUpdate } from "./ReactFiberConcurrentUpdates";

const { ReactCurrentDispatcher } = ReactSharedInternals;

let currentlyRenderingFiber = null;  // 当前正在构建中的fiber
let workInProgressHook = null; // 当前正在进行中的hook

let currentHook = null; // 当前hook对应的老hook

const HooksDispatcherOnMount = {
  useReducer: mountReducer,
  useState: mountState,
};
const HooksDispatcherOnUpdate =  {
  useReducer: updateReducer,
  useState: updateState,
}
// useState其实就是一个内置了reducer的useReducer
function baseStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action;
}

function updateState(initialState) {
  return updateReducer(baseStateReducer);
}

function mountState(initialState) {
  //! 之所以不复用这个mountReducer，是因为setState对于相同的initialState，不会进行更新处理（优化）
  // return mountReducer(baseStateReducer, initialState);
  const hook = mountWorkInProgressHook();
  hook.memoizedState = initialState;
  const queue = {
    pending: null,
    next: null,
    lastRenderedReducer: baseStateReducer, // 上一次使用的reducer
    lastRenderedState: initialState,  // 上一个state
  }

  hook.queue = queue;
  const dispatch = (queue.dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue));
  return [hook.memoizedState, dispatch];

}

function dispatchSetState(fiber, queue, action) {
  const update = {
    action,
    hasEagerState: false, // 是否有紧急的更新
    eagerState: null, // 紧急的更新
    next: null,
  }
  // 当你派发动作后，立即用上一次的reducer和状态计算出新的状态
  const { lastRenderedReducer, lastRenderedState } = queue;
  const eagetState = lastRenderedReducer(lastRenderedState, action);
  update.hasEagerState = true;
  update.eagerState = eagetState;
  // 如果最新的state和上一次的state时一样的时候，就不走后续的更新逻辑 
  // console.log(eagetState, lastRenderedState, 'lastRenderedState---')
  if (Object.is(eagetState, lastRenderedState)) {
    return;
  }
  // 下面是真正的入队更新，并调度更新逻辑
  const root = enqueueConcurrentHookUpdate(fiber, queue, update);
  schedulerUpdateOnFiber(root);
}
/**
 * 构建新的hook
 */
function updateWorkInProgressHook() {
  // 获取将要构建hook的老hoook
  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate;
    currentHook = current.memoizedState;
  } else {
    currentHook = currentHook.next;
  }
  // 根据老hook创建新hook
  // current指的是老的函数组件对应的老fiber，current.memoizedState=hook对象的单向链表
  // hook的memoizedState里面存的是状态
  const newHook = {
    memoizedState: currentHook.memoizedState,
    queue: currentHook.queue,
    next: null,
  }

  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
  } else {
    workInProgressHook = workInProgressHook.next = newHook;
  }

  return workInProgressHook;
}

function updateReducer(reducer) {
  // 获取新的hook
  const hook = updateWorkInProgressHook();
  // 获取新的更新队列
  const queue = hook.queue;
  // 获取老的hook
  const current = currentHook;
  // 获取将要更新的队列
  const pendingQueue = queue.pending;
  // 初始化一个新的状态，取值为当前的状态
  let newState = current.memoizedState;
  if (pendingQueue !== null) {
    queue.pending = null;
    const firstUpdate = pendingQueue.next;
    let update = firstUpdate;
    do {
      if (update.eagerState) {
        newState = update.eagerState;
      } else {
        const action = update.action;
        newState = reducer(newState, action);
      }
      update = update.next;
    } while (update !== null && update !== firstUpdate);
  }

  hook.memoizedState = newState;
  return [hook.memoizedState, queue.dispatch]
}

function mountReducer(reducer, initialArg) {
  // console.log(reducer, initialArg, 'mountReducer---');
  // return [initialArg];
  const hook = mountWorkInProgressHook();
  hook.memoizedState = initialArg;
  const queue = {
    pending: null,
    dispatch: null,
  };
  hook.queue = queue;
  const dispatch = (queue.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, queue));
  return [hook.memoizedState, dispatch];
}

/**
 * 执行派发动作的方法，它要更新状态，并且让页面重新更新
 * @param {*} fiber function对应的Fiber
 * @param {*} queue hook对应的更新队列
 * @param {*} action 派发的动作 
 */
function dispatchReducerAction(fiber, queue, action) {
  // console.log(fiber, queue, action);
  // 在每个hook里都会存放一个更新队列，更新队列是一个更新对象的循环链表
  const update = {
    action, // { type: 'add', payload: 1 }
    next: null,
  }
  // debugger
  const root = enqueueConcurrentHookUpdate(fiber, queue, update);
  schedulerUpdateOnFiber(root);
}
/**
 * 挂载构建中的hook
 */
function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null, // hook的状态
    queue: null,         // 存放本hook的更新队列，queue.pending = update 的循环链表
    next: null,          // 指向下一个hook，一个函数里可以有多个hook，它们会组成一个单向链表
  };
  if (workInProgressHook === null) {
    // 当前函数的对应的fiber的状态等于第一个hook对象
    currentlyRenderingFiber.memoizedState =  workInProgressHook = hook;
  } else {
    // workInProgressHook.next = hook workInProgressHook = hook
    // 这里主要是完成currentlyRenderingFiber.memoizedState的引用，维持next形成链表
    workInProgressHook = workInProgressHook.next = hook;
  }
  
  return workInProgressHook;
}

/**
 * 获取函数组件的渲染内容
 * @param {*} current 老fiber
 * @param {*} workInProgress 新fiber
 * @param {*} Component 组件定义
 * @param {*} props 组件属性
 * @returns 
 */
export function renderWithHooks(current, workInProgress, Component, props) {
  currentlyRenderingFiber = workInProgress; // function组件对应的fiber
  // 初次挂载
  // 如果不存在老的fiber并且没有老的hook链表 
  if (current !== null && current.memoizedState !== null) {
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdate;
  } else { // 挂载
    ReactCurrentDispatcher.current = HooksDispatcherOnMount;
  }
  // 需要函数组件执行前给ReactCurrentDispatcher.current赋值
  const children = Component(props);
  currentlyRenderingFiber = null;
  workInProgressHook = null;
  currentHook = null;
  return children;
}