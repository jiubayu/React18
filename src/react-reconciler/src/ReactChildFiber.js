import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { ChildDeletion, Placement } from "./ReactFiberFlags";
import isArray from "shared/isArray";
import { createFiberFromElement, createFiberFromText, createWorkInProgress } from "./ReactFiber";

/**
 * 
 * @param {*} shouldTrackSideEffects 是否跟踪副作用
 */
function createChildReconciler(shouldTrackSideEffects) {
  function useFiber(fiber, pendingProps) {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }
  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) { // 不需要跟踪副作用，直接返回
      return;
    }
    const deletions = returnFiber.deletions;
    if (deletions === null) {
      returnFiber.deletions = [childToDelete];
      returnFiber.flags |= ChildDeletion;
    } else {
      returnFiber.deletions.push(childToDelete);
    }
  }
  // 删除从currentFirstChild之后的所有子节点
  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackSideEffects) {
      return;
    }
    let childToDelete = currentFirstChild;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }

    return null;
  }
  /**
   * 
   * @param {*} returnFiber 根fiber div#root对应的fiber
   * @param {*} currentFirstChild 老的FunctionComponent对应的fiber
   * @param {*} element 新的虚拟对象
   * @returns 返回新的第一个子fiber
   */
  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    const key = element.key; // 新的虚拟dom的key，也就是唯一标识  null
    let child = currentFirstChild;  // 老的FunctionComponent对应的Fiber
    //! DOM-DIFF
    while (child !== null) {
      // 判断此老Fiber对应的key和新的虚拟dom的key是否一致  老key null 新key null === null
      if (child.key === key) {
        // 判断老fiber对应的类型和新的fiber对应的类型是否相同
        if (child.type === element.type) {
          // 如果key和type都一样，则可以认为此fiber可以复用，需要删除其他的老fiber，复用当前的fiber
          // 删除其他的老fiber
          deleteRemainingChildren(returnFiber, child.sibling);
          const existing = useFiber(child, element.props);
          existing.return = returnFiber;
          return existing;
        } else {
          // 如果key一样，type不一样，不能复用，把剩下的全部删除
          deleteRemainingChildren(returnFiber, child);
        }
      } else { // 如果key不相等，则直接删除
        deleteChild(returnFiber, child);
      }

      child = child.sibling;
    }

    // 当前没有老的子fiber节点，所以直接进行新的fiber节点的创建
    const created = createFiberFromElement(element);
    created.return = returnFiber;


    return created;
  }
  /**
   * 设置副作用
   * @param {*} newFiber 
   */
  function placeSingleChild(newFiber) {
    // 说明需要副作用，并且新fiber的老fiber不存在
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      // 要在最后的提交阶段插入此节点 React渲染分为渲染（创建Fiber树）和提交（更新真实DOM）二个阶段
      newFiber.flags |= Placement;
    }
    return newFiber;
  }
  /**
   * 根据虚拟dom创建对应的fiber
   * @param {*} returnFiber 父fiber
   * @param {*} newChild  如果为字符串，则创建text类型的fiber，如果为对象，需要进一步的tag判断
   * @returns 
   */
  function createChild(returnFiber, newChild) {
    if ((typeof newChild === 'string' && newChild !== '') || typeof newChild === 'number') {
      const created = createFiberFromText(newChild);
      created.return = returnFiber;
      return created;
    }
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          const created = createFiberFromElement(newChild);
          created.return = returnFiber;
          return created;
        default:
          break;
      }
    }
    return null;
  }

  function updateElement(returnFiber, current, element) {
    const elementType = element.type;
    if (current !== null) {
      // 判断是否类型一样，如果key和type类型都一样，可以复用老的fiber和对应的真实DOM
      if (current.type === elementType) {
        const existing = useFiber(current, element.props);
        existing.return = returnFiber;
        return existing;
      }
    }

    const created = createFiberFromElement(element);
    created.return = returnFiber;
    return created;
  }

  function updateSlot(returnFiber, oldFiber, newChild) {
    const key = oldFiber !== null ? oldFiber.key : null;
    if (newChild !== null && typeof newChild === 'object') {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          if (newChild.key === key) { // 老fiber和新child的key相同的情况，准备进进一步判断type，并进行属性的更新
            return updateElement(returnFiber, oldFiber, newChild);
          }
        default:
          return null;
      }
    }

    return null;
  }


  function placeChild(newFiber, newIndex) {
    // 将newIndex赋值给newFiber；
    // 指定新的fiber在新的fiber树中对应的位置
    newFiber.index = newIndex;
    if (!shouldTrackSideEffects) {
      return;
    }

    const current = newFiber.alternate; // 获取老的fiber
    if (current !== null) { // 说明复用了老fiber，就不需要处理
      return;
    } else { // 如果没有，说明这是一个新的节点，需要插入
      // 如果一个fiber它的Flags上有Placement，说明此节点需要创建真实DOM并插入到容器上
      // 如果父fiber节点是初次挂载，shouldTrackSideEffects=false，不需要添加flags
      // 这种情况会在完成阶段把所有的子节点全部添加到自己的身上 
      newFiber.flags |= Placement;
    }
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    let resultingFirstChild = null; //返回的第一个新儿子
    let previousNewFiber = null; // 上一个新fiber
    let newIndex = 0; // 用来遍历新的虚拟DOM的索引

    let oldFiber = currentFirstChild;
    let nextOldFiber = null; // 下一个老fiber
    // 开始第一轮循环
    // 如果老的fiber有值，新的虚拟DOM也有值
    for (; oldFiber !== null && newIndex < newChildren.length; newIndex++) {
      // 先暂存下一个老fiber
      nextOldFiber = oldFiber.sibling;
      // 试图更新或者试图复用老的fiber
      const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIndex]);
      if (newFiber === null) {
        break;
      }
      if (shouldTrackSideEffects) {
        // 如果有老fiber，而且新的fiber没有复用老的fiber和真实DOM，那就删除老的fiber，并在提交阶段删除对应的真实DOM
        if (oldFiber && newFiber.alternate === null) {
          deleteChild(returnFiber, oldFiber);
        }
      }
      // 指定新Fiber的位置
      placeChild(newFiber, newIndex);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber; // li(A).sibling = p(B).sibling = li(c)
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;

      oldFiber = nextOldFiber; // oldFiber = oldFiber.sibling; 继续链表遍历
    }

    //如果老的fiber已经走完了，但是新的fiber还是有的，会走到这里继续信息的新fiber的创建
    for (; newIndex < newChildren.length; newIndex++) {
      const newFiber = createChild(returnFiber, newChildren[newIndex]);
      if (newFiber === null) continue;
      placeChild(newFiber, newIndex);
      // 说明没有前一个儿子节点，当前newFiber即为第一个节点
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else { // 存在大儿子，则将newFiber通过sibling挂载到大儿子的后面
        previousNewFiber.sibling = newFiber;
      }
      // previousNewFiber指向当前儿子节点的最后一个
      previousNewFiber = newFiber;
    }

    return resultingFirstChild; // 返回子fiber中的头节点
  }
  /**
   * 比较子fibers DOM_DIFF就是用老的子fiber链表和新的虚拟DOM进行比较的过程
   * @param {*} returnFiber 新的父fiber workInProgress
   * @param {*} currentFirstChild  current一般指的就是老的意思
   * @param {*} newChild 新的子虚拟dom h1
   */
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    // ! 新的节点只有一个节点的情况
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild));
        default:
          break;
      }
    }
    // workingInProgress的children为数组 [hello文本节点， <span>workd</span>]
    //! 新的节点有多个子节点的情况
    if (isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
    }
  }
  return reconcileChildFibers;
}

export const mountChildFibers = createChildReconciler(false);
export const reconcileChildFibers = createChildReconciler(true);