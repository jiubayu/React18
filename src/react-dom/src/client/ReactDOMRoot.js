import { listenToAllSupportedEvents } from 'react-dom-bindings/src/events/DOMpluginEventSystem';
import {
  createContainer,
  updateContainer,
} from 'react-reconciler/src/ReactFiberReconciler';
function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}

/**
 * 1 第一部分从render开始，把接收到的React Element转换为fiber，并为其设置优先级，记录updates等。
// 这部分主要是一些数据方面的准备工作
 children : $$typeof: Symbol(REACT_ELEMENT_TYPE)
key: null
props: {id: 'container', children: Array(2)}
ref:undefined 
type: "h1"
[[Prototype]]:Object

 */
ReactDOMRoot.prototype.render = function (children) {
  const root = this._internalRoot;
  root.containerInfo.innerHTML = '';
  updateContainer(children, root);
}

export function createRoot(container) {
  // 创建containerInfo对应的fiber节点uninitializedFiber，创建containerInfo对应的真实节点root
  // root.current = uninitializedFiber, uninitializedFiber.stateNode = root
  const root = createContainer(container);
  // 一开始就进行了事件的委托
  listenToAllSupportedEvents(container);
  return new ReactDOMRoot(root);
}