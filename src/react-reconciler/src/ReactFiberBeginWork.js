import logger, { indent } from "shared/logger";
import { FunctionComponent, HostComponent, HostRoot, HostText, IndeterminateComponent } from "./ReactWorkTags";
import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { shouldSetTextContent } from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { renderWithHooks } from './ReactFiberHooks';

/**
 * 根据新的虚拟DOM生成新的fiber链表
 * @param {*} current 老的父fiber
 * @param {*} workInProgress 新的父fiber
 * @param {*} nextChildren 新的子虚拟DOM
 */
function reconcileChildren(current, workInProgress, nextChildren) {
  // debugger
  // 如果没有老fiber，说明是首次创建
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  } else {
    // 如果有老的fiber，需要做DOM-DIFF，拿老的子fiber和新的虚拟DOM进行比较，进行最小化的更新
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
    console.log(workInProgress.child, ' workInProgress.child----');
    
  }
}

function updateHostRoot(current, workInProgress) {
  // 需要知道它的子虚拟dom信息，它的儿子的子虚拟dom信息
  // workInProgress.memoizedState={element};
  processUpdateQueue(workInProgress);
  const nextState = workInProgress.memoizedState;
  // nextChildren是新的虚拟DOM
  const nextChildren = nextState.element;
  // 协调子节点 DOM-DIFF算法
  // 根据新的虚拟dom生成子fiber链表
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child; // 根据element创建fiber赋值给child，{type: 'h1', tag: 5, }
}

/**
 * 构建原生组件的子fiber链表
 * @param {*} current  老fiber
 * @param {*} workInProgress 新fiber h1
 */
function updateHostComponent(current, workInProgress) {
  const { type } = workInProgress;
  const nextProps = workInProgress.pendingProps;
  let nextChildren = nextProps.children;
  // 判断当前虚拟dom是否只有一个儿子，并且此儿子为text文本
  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild) {
    nextChildren = null;
  }
  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child; // 根据element创建fiber赋值给child，{type: 'h1', tag: 5, }
}
/**
 * 挂载函数组件
 * @param {*} current 老fiber
 * @param {*} workInProgress 新fiber
 * @param {*} Component 函数类型，也就是函数组件的定义
 */
function mountIndeterminateComponent(current, workInProgress, Component) {
  const props = workInProgress.pendingProps;
  // const value = Component(props);
  const value = renderWithHooks(current, workInProgress, Component, props);
  workInProgress.tag = FunctionComponent;
  reconcileChildren(current, workInProgress, value);
  return workInProgress.child;
}

export function updateFunctionComponent(current, workInProgress, Component, newProps) {
  const nextChildren = renderWithHooks(current, workInProgress, Component, newProps);
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

/**
 * 根据新的虚拟DOM构建新的Fiber子链表 child sibling 
 * @param {*} current 老fiber
 * @param {*} workInProgress 新fiber
 * @returns 
 */
export function beginWork(current, workInProgress) {
  // logger(' '.repeat(indent.number) + 'beginWork', workInProgress);
  // indent.number += 2;
  switch (workInProgress.tag) {
    // 因为react组件中，有2种组件，函数和类组件，但是他们的类型都是函数
    case IndeterminateComponent:
      return mountIndeterminateComponent(current, workInProgress, workInProgress.type);
    case FunctionComponent: {
      const Component = workInProgress.type;
      const newProps = workInProgress.pendingProps;

      return updateFunctionComponent(current, workInProgress, Component, newProps);
    }
    case HostRoot:
      return updateHostRoot(current, workInProgress);
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case HostText:
      return null;
    default:
      return null;
  }
}