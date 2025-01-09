/**
 * 向最小堆中添加一个节点 
 * @param {*} heap 最小堆
 * @param {*} node 节点
 */
function push(heap, node) {
  const tail = heap.length;
  // 先将node放置进数组末尾
  heap[tail] = node;

  // 对node进行向上调整
  shiftUp(heap, node, tail);
}

/**
 * 查看最小堆顶元素
 * @param {*} heap 
 */
function peek(heap) {
  const first = heap[0];
  return first !== undefined ? first : null;
}

/**
 * 弹出最小堆的堆顶元素
 * @param {*} heap 
 */
function pop(heap) {
  const first = heap[0];
  if (first !== undefined) {
    // 弹出数组的最后一个元素
    const last = heap.pop();
    if (last !== first) {
      heap[0] = last;
      shiftDown(heap, last, 0);
    }
    return first;
  } else {
    return null;
  }
}

/**
 * 向上调整某个节点，使其位于正确的位置
 * @param {*} heap 最小堆 也就是数组
 * @param {*} node  节点
 * @param {*} i 节点所在的索引
 */
function shiftUp(heap, node, i) {
  let index = i;
  while (true) {
    // 拿到父节点的索引 当前节点index为2，父节点为0，2-1>>1;
    const parentIndex = index - 1 >>> 1;

    const parent = heap[parentIndex];
    // 父节点不是较小的节点，需要父子进行位置的交换
    // console.log(parentIndex, parent, index, node, compare(parent, node) ,'parentIndex---');
    if (parent !== undefined && compare(parent, node) > 0) {
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      return;
    }
  }
}

/**
 * 向下调整某个节点，使其位于正确的位置
 * @param {*} heap 最小堆 也就是数组
 * @param {*} node 节点
 * @param {*} i 节点所在的索引
 */
function shiftDown(heap, node, i) {
  let index = i;
  let len = heap.length;
  while (index < len) {
    // 左子节点的索引值
    const leftIndex = index * 2 + 1;
    const left = heap[leftIndex];
    // 右子节点的索引值
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex];
    // 左子节点小于父节点
    if (left !== undefined && compare(left, node) < 0) {
      // 右子节点小于左子几点  最小值为右子节点
      if (right !== undefined && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (left !== undefined && compare(left, node) > 0) {
      if (right !== undefined && compare(right, node) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        return
      }
    } else {
      return;
    }
  }
}

// 比较a，b的sortIndex，如果sortIndex相等，则比较id
function compare(a, b) {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}

export {
  push,
  pop,
  peek,
}
// let heap = [];
// let id = 1;
// push(heap, { sortIndex: 2, id: id++ });
// push(heap, { sortIndex: 1, id: id++ });
// push(heap, { sortIndex: 3, id: id++ });
// console.log(heap, 'heap----');
// push(heap, { sortIndex: 5, id: id++ });
// push(heap, { sortIndex: 6, id: id++ });
// push(heap, { sortIndex: 4, id: id++ });
// console.log(heap, 'heap----');
// pop(heap);
// console.log(heap, 'heap----');

