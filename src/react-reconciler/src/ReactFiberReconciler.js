import { createUpdate, enqueueUpdate } from './ReactFiberClassUpdateQueue';
import { markUpdateLineFromFiberToRoot } from './ReactFiberConcurrentUpdates';
import { createFiberRoot } from './ReactFiberRoot';
import { schedulerUpdateOnFiber } from './ReactFiberWorkloop';
export function createContainer(containerInfo) {
  return createFiberRoot(containerInfo);
}
/**
 * 更新容器，将虚拟dom element变成真实DOM插入到容器container上
 * @param {*} element 虚拟dom
 * @param {*} container 真实DOM容器 FiberRootNode containerInfo 指向div
 * @returns 
 */
export function updateContainer(element, container) {
  // 获取当前的根fiber
  const current = container.current;
  const update = createUpdate();
  // 添加要更新的虚拟dom element
  update.payload = { element };
  // 将更新对象update添加到根fiber current上
  let root = enqueueUpdate(current, update);
  // 返回根节点，从当前的fiber到根节点
  // console.log(root, 'root---')
  schedulerUpdateOnFiber(root);
}