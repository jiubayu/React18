import { listenToAllSupportedEvents } from 'react-dom-bindings/src/events/DOMpluginEventSystem';
import {
  createContainer,
  updateContainer,
} from 'react-reconciler/src/ReactFiberReconciler';
function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}
ReactDOMRoot.prototype.render = function (children) {
  const root = this._internalRoot;
  root.containerInfo.innerHTML = '';
  updateContainer(children, root);
}

export function createRoot(container) {
  const root = createContainer(container);
  // 一开始就进行了事件的委托
  listenToAllSupportedEvents(container);
  return new ReactDOMRoot(root);
}