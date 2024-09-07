import { HostComponent, HostRoot, HostText, IndeterminateComponent } from './ReactWorkTags';
import { NoFlags } from './ReactFiberFlags';
export function FiberNode(tag, pendingProps, key) {
  this.tag = tag;
  this.key = key;
  this.type = null; // fiber类型，来自于虚拟DOM节点的type div，span，p等
  // 每个虚拟DOM => Fiber节点 => 真实DOM
  this.stateNode = null; // 此fiber对应的真实DOM h1 = 真实的h1 DOM
 
  this.return = null;     // 指向父节点
  this.child = null;      // 指向第一个child
  this.sibling = null;    // 指向弟弟节点

  // fiber哪来的？通过虚拟DOM节点创建，虚拟DOM会提供pendingProps用来创建fiber节点的属性
  this.pendingProps = pendingProps; // 等待生效的属性
  this.memoizedProps = null;        // 已经生效的属性

  // 每个fiber还会有自己的状态，每一种fiber 保存的状态类型是不一样的
  // 类组件对应的fiber 存的状态就是类的实例 HostRoot存的状态是要渲染的元素，也就是虚拟DOM的起始节点
  this.memoizedState = null;
  // 每个fiber身上有更新队列
  this.updateQueue = null;
 
  // 副作用的标识，表示要针对此fiber节点进行如何操作
  this.flags = NoFlags;
  // 子节点对应的副使用标识
  this.subtreeFlags = NoFlags;
  // 替身 轮替 在后面将DOM-DIFF的时候会用到
  this.alternate = null;

  this.index = 0; // 用于多个子节点的位置标记

  this.deletions = null; // 存储将要删掉的子节点


}

function createFiber(tag, pendingProps, key) {
  return new FiberNode(tag, pendingProps, key);
}

export function createHostRootFiber() {
  return createFiber(HostRoot, null, null);
}
// 我们使用双缓冲池技术，我们知道一棵树最多只需要两个版本
// 我们将其他未使用的我们可以自由重用的节点
// 这是延迟创建的，以避免分配从未更新的内容的额外对象，它还允许我们如果需要，回收额外的内存
/**
 * 基于老的fiber和新的属性创建新的fiber
 * ! DOM DIFF
 * 1 current和workInProgress不是一个对象
 * 2 workInProgress
 *   2.1 有两种情况，一种是没有，创建一个新的，互相通过alternate引用
 *   2.2 存在alternate，直接复用老的alternate就好了
 * 
 * 复用有两层含义
 * 1 复用老的fiber
 * 2 复用老的真实DOM
 * @param {*} current 老fiber
 * @param {*} pendingProps 新属性
 * @returns 
 */
export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate; // 拿到老fiber的轮替
  // 第一次创建
  if (workInProgress === null) {
    // 把老fiber的tag，type，key，stateNode拷贝过来
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 更新
    // 复用老的fiber对象，清空flags
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  }
  workInProgress.child = current.child;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  return workInProgress;
}
/**
 * 根据虚拟DOM创建Fiber节点
 * @param {*} element 
 */
export function createFiberFromElement(element) {
  const { type, key } = element;
  const pendingProps = element.props;
  
  return createFiberFromTypeAndProps(type, key, pendingProps);
}

function createFiberFromTypeAndProps(type, key, pendingProps) {
  let tag = IndeterminateComponent;
  if (typeof type === 'string') {// 原生组件，div，span，p
    tag = HostComponent;
  }
  const fiber = createFiber(tag, pendingProps, key);
  fiber.type = type;
  return fiber;
}
/**
 * 根据文本创建fiber节点
 * @param {*} text 
 */
export function createFiberFromText(content) {
  return createFiber(HostText, content, null);
}