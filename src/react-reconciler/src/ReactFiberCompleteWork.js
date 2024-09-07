import logger, { indent } from "shared/logger";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTags";
import {
  appendAllChildren,
  createInstance,
  createTextInstance,
  finalizeInitialChildren,
  prepareUpdate
} from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { NoFlags, Update } from "./ReactFiberFlags";

/**
 *  完成一个fiber节点
 * @param {*} current 老fiber
 * @param {*} workInProgress  新的构架的fiber
 */
export function completeWork(current, workInProgress) {
  // indent.number -= 2;
  // logger(" ".repeat(indent.number) + 'completeWork', workInProgress);
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    // todo 当前只针对初次创建，挂载子节点的情况，可以不用DIFF直接挂载，后续会处理更新的逻辑
    case HostRoot:
      bubbleProperties(workInProgress);
      break;
    case HostComponent:
      // 创建真实的DOM节点
      const { type } = workInProgress;
      // 如果老fiber存在并且老fiber存在真实DOM节点，要走节点更新的逻辑
      if (current !== null && workInProgress.stateNode !== null) {
        updateHostComponent(current, workInProgress, type, newProps);
      } else {
        const instance = createInstance(type, newProps, workInProgress);
        workInProgress.stateNode = instance;
        // 把自己的儿子都挂载到自己身上
        appendAllChildren(instance, workInProgress);
        finalizeInitialChildren(instance, type, newProps);
      }

      // 向上冒泡属性
      bubbleProperties(workInProgress);
      break;
    case FunctionComponent:
      bubbleProperties(workInProgress);
      break;
    case HostText:
      const newText = newProps; // 文本节点的属性是存放在pendingProps上的
      // 创建真实的文本节点并赋值给stateNode
      workInProgress.stateNode = createTextInstance(newText);
      // 向上冒泡属性
      bubbleProperties(workInProgress);
      break;
  }
}

function markUpdate(workInPorgress) {
  workInPorgress.flags |= Update; // 给当前的fiber添加更新标识
}
/**
 * 在fiber完成阶段，准备更新DOM
 * @param {*} current 老的fiber button
 * @param {*} workInPorgress 新的fiber button
 * @param {*} type 类型
 * @param {*} newProps 新的属性
 */
function updateHostComponent(current, workInPorgress, type, newProps) {
  const oldProps = current.memoizedProps; // 老的属性
  const instance = workInPorgress.stateNode; // 老的DOM节点
  // 比较新老属性，收集属性的差异
  // updatePayload = ['id', 'btn1, 'children', '2']
  // debugger
  const updatePayload = prepareUpdate(instance, type, oldProps, newProps);
  // 让原生组件的新fiber的更新队列等于获取的更新属性的队列
  workInPorgress.updateQueue = updatePayload;
  console.log(updatePayload,'updatePayload---');
  // 更新workInProgress的flags  Update
  if (updatePayload) {
    markUpdate(workInPorgress);
  }
}

function bubbleProperties(completedWork) {
  let subtreeFlags = NoFlags;
  let child = completedWork.child;
  // 遍历当前fiber的子节点，把所有节点的副作用，以及子节点的子节点的副作用全部合并起来
  while (child !== null && child !== undefined) {
    // 子节点所有的flags 副作用合集
    subtreeFlags |= child.subtreeFlags;
    // 子节点自己的flags 也就是副作用
    subtreeFlags |= child.flags;
    child = child.sibling;
  }

  completedWork.subtreeFlags = subtreeFlags;
}