import { appendChild, commitUpdate, insertBefore, removeChild } from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { MutationMask, Placement, Update } from "./ReactFiberFlags";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTags";

let hostParent = null;
/**
 * 提交删除副作用
 * @param {*} root 根节点
 * @param {*} parentFiber 父节点
 * @param {*} deletedFiber 删除的子节点
 */
function commitDeletionEffects(root, returnFiber, deletedFiber) {
  let parent = returnFiber;
  // 一直向上查找，找到真实的DOM节点为止
  findParent: while (parent !== null) {
    switch (parent.tag) {
      case HostComponent:
        hostParent = parent.stateNode;
        break findParent; 
      case HostRoot:
        hostParent = parent.stateNode.containerInfo;
        break findParent; 
    }
    parent = parent.return;
  }

  commitDeletionEffectsOnFiber(root, returnFiber, deletedFiber);
  hostParent = null;
};

function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
  switch (deletedFiber.tag) {
    case HostComponent:
    case HostText:
      // 当要删除一个节点的时候，要删除它的子节点，然后把自己删除
      recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
      if (hostParent !== null) {
        removeChild(hostParent, deletedFiber.stateNode);
      }
      break;
    default:
      break;
  }
}

function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
  let child = parent.child;
  while (child !== null && child !== undefined) {
    commitDeletionEffects(finishedRoot, nearestMountedAncestor, child);
    child = child.sibling;
  }
}

/**
 * 递归循环处理变更的副作用
 * @param {*} root 根节点
 * @param {*} parentFiber 父fiber
 */
function recursivelyTraverseMutationEffects(root, parentFiber) {
  debugger
  // 先把父fiber上该删除的子节点都删除
  const deletions = parentFiber.deletions;
  if (deletions !== null) {
    for (let i = 0; i < deletions.length; i++) {
      const childToDelete = deletions[i];
      commitDeletionEffects(root, parentFiber, childToDelete);
    }
  }

  // 再去处理剩下的子节点
  if (parentFiber.subtreeFlags & MutationMask) {
    let { child } = parentFiber;
    while (child !== null) {
      commitMutationEffectsOnFiber(child, root);
      child = child.sibling;
    }
  }
}

function commitReconciliationEffects(finishedWork) {
  const { flags } = finishedWork;
  // 如果此fiber需要插入操作
  if (flags & Placement) {
    // 进行插入操作，也就是把此fiber对应的真实DOM节点添加到父真实DOM上 
    commitPlacement(finishedWork);
    // 把flags里的Placement删掉
    finishedWork.flags &= ~Placement;
  }
}

function isHostParent(fiber) {
  return fiber.tag === HostComponent || fiber.tag === HostRoot; // div#root; 
}

function getHostparentFiber(fiber) {
  let parent = fiber.return;
  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent;
    }
    parent = parent.return;
  }
}

/**
 * 把子节点对应的真实DOM插入到父DOM节点中
 * @param {*} node 将要插入的fiber节点
 * @param {*} parent 父真实DOM节点
 */
function insertOrAppendPlacementNode(node, before, parent) {
  const { tag } = node;
  // 判断此fiber对应的是不是真实DOM节点
  const isHost = (tag === HostComponent || tag === HostText);
  // 如果是的话直接插入
  if (isHost) {
    const { stateNode } = node;
    if (before) {
      insertBefore(parent, stateNode, before);
    } else {
      appendChild(parent, stateNode);
    }
  } else {
    // 如果node不是真实的DOM节点，获取它的大儿子
    const { child } = node;
    if (child !== null) {
      // 把大儿子插入父节点 
      insertOrAppendPlacementNode(child, before, parent);
      let { sibling } = child;
      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}
/**
 * 找到要插入的锚点
 * 找到可以插在它前面的那个fiber对应的真实DOM
 * @param {*} finishedWork 
 */
function getHostSibling(fiber) {
  let node = fiber;
  siblings: while (true) {
    while (node.sibling === null) {
      // 如果我们是根fiber或者父亲是原生节点，我们就是最后的弟弟
      if (node.return === null || isHostParent(node.return)) {
        return null;
      }
      node = node.return;
    }

    // 找到弟弟节点
    node = node.sibling;
    // 如果弟弟不是原生节点也不是文本节点
    while (node.tag !== HostComponent && node.tag !== HostText) {
      // 如果此节点是一个将要插入的新节点，找他的弟弟
      if (node.flags & Placement) {
        continue siblings;
      } else {
        node = node.child;
      }
    }

    if (!(node.flags & Placement)) {
      return node.stateNode;
    }
  }
}

function commitPlacement(finishedWork) {
  debugger
  const parentFiber = getHostparentFiber(finishedWork);
  switch (parentFiber.tag) {
    case HostRoot: {
      const parent = parentFiber.stateNode.containerInfo;
      const before = getHostSibling(finishedWork);// 获取最近弟弟的真实DOM节点
      insertOrAppendPlacementNode(finishedWork, before, parent);
      break;
    };
    case HostComponent: {
      const parent = parentFiber.stateNode;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNode(finishedWork, before, parent);
      break;
    };
    default:
      break;
  }
}

/**
 * 遍历fiber树，执行fiber上的副作用
 * @param {*} finishedWork  fiber节点
 * @param {*} root 根节点
 */
export function commitMutationEffectsOnFiber(finishedWork, root) {
  const current = finishedWork.alternate; // 老fiber
  const flags = finishedWork.flags; // 操作标识 

  switch (finishedWork.tag) {
    case FunctionComponent:
    case HostRoot:
    case HostText:
      // 先遍历它们的子节点，处理子节点上的副作用
      recursivelyTraverseMutationEffects(root, finishedWork);
      // 再处理自己身上的副作用
      commitReconciliationEffects(finishedWork);
      break;
    case HostComponent: {
      // 先遍历它们的子节点，处理子节点上的副作用
      recursivelyTraverseMutationEffects(root, finishedWork);
      // 再处理自己身上的副作用
      commitReconciliationEffects(finishedWork);
      // 需要处理DOM更新的逻辑
      if (flags & Update) {
        // 获取真实DOM
        const instance = finishedWork.stateNode;
        // 更新真实DOM的属性
        if (instance != null) {
          const newProps = finishedWork.memoizedProps;
          const oldProps = current !== null ? current.memoizedProps : newProps;
          const type = finishedWork.type;
          const uploadPayload = finishedWork.updateQueue;
          finishedWork.updateQueue = null; // 清除掉fiber上的更新
          if (uploadPayload !== null) {
            commitUpdate(instance, uploadPayload, type, oldProps, newProps, finishedWork);
          }
        }
      }
      break;
    }
    default:
      break;
  }
} 