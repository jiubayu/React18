import { HostComponent, HostText } from "react-reconciler/src/ReactWorkTags";
import { setInitialProperties, diffProperties, updateProperties } from "./ReactDOMComponent";
import { precacheFiberNode, updateFiberProps } from "./ReactDOMComponentTree";


export function shouldSetTextContent(type, props) {
  return typeof props.children === 'string' || typeof props.children === 'number';
}

export function createTextInstance(content) {
  return document.createTextNode(content);
}

export function createInstance(type, props, internalInstanceHandle) {
  const domElement = document.createElement(type);
  precacheFiberNode(internalInstanceHandle, domElement);
  // 将属性的添加到dom上，方便后续的获取
  updateFiberProps(domElement, props);
  return domElement;
}


export function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props);
}

/**
 * 把当前完成的fiber的所有子节点对应的真实DOM都挂载到自己父parent的真实DOM节点上
 * @param {*} parent 当前完成的fiber对应的真实DOM
 * @param {*} workInProgress 已经完成的fiber
 */
export function appendAllChildren(parent, workInProgress) {
  let node = workInProgress.child;
  while (node) {
    if (node === workInProgress) {
      return;
    }

    // 原生组件和text组件直接插入到父DOM上
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitailChild(parent, node.stateNode);
    } else if (node.child !== null) {
      // 如果第一个儿子不是原生节点，那么可能为函数节点或者类节点
      node = node.child;
      continue;
    }

    // 如果当前节点没有弟弟,就需要去找叔叔
    while (node.sibling === null) {
      if (node === workInProgress || node.return === null) {
        return;
      }
      // 回到父节点
      node = node.return;
    }
    node = node.sibling;
  }
}

function appendInitailChild(parent, child) {
  parent.appendChild(child);
}

export function appendChild(parentInstance, node) {
  parentInstance.appendChild(node);
}

export function insertBefore(parentInstance, node, before) {
  parentInstance.insertBefore(node, before);
}

export function prepareUpdate(domElement,  type, oldProps, newProps) {
  return diffProperties(domElement, type, oldProps, newProps);
}

export function commitUpdate(domElement, uploadPayload, type, oldProps, newProps) {
  updateProperties(domElement, uploadPayload, type, oldProps, newProps);
  updateFiberProps(domElement, newProps);
}

export function removeChild(parentInstance, child) {
  parentInstance.removeChild(child);
}