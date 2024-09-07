import { createHostRootFiber } from './ReactFiber';
import { initializedUpdateQueue } from './ReactFiberClassUpdateQueue';

/**
 * React18中存在双缓冲技术
 * 分别存在根节点 FiberRootNode(div#root)
 * 旧的根Fiber HostRootFiber 
 * 新的根Fiber workInPorgress
 * 其中 根节点和旧的根Fiber关系为  FiberRootNode.current = HostRootFiber HostRootFiber.stateNode = FiberRootNode
 * 旧的Fiber根节点和新的Fiber节点的关系为  HostRootFiber.alternate = workInProgress workInProgress.alternate = HostRootFiber
 * @param {*} containerInfo 
 */
function FiberRootNode(containerInfo) {
  this.containerInfo = containerInfo;
}
export function createFiberRoot(containerInfo) {
  const root = new FiberRootNode(containerInfo);
  // HostRoot指的就是根节点div#root
  const uninitializedFiber = createHostRootFiber();
  // 根容器的current指向的是根fiber
  root.current = uninitializedFiber;
  // 根fiber的stateNode指向的是真实DOM节点，指向FiberRootNode
  uninitializedFiber.stateNode = root;
  initializedUpdateQueue(uninitializedFiber);
  return root;
}