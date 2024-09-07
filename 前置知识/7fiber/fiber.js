let A1 = { type: 'div', key: 'A1' };
let B1 = { type: 'div', key: 'B1', return: A1 };
let B2 = { type: 'div', key: 'B2', return: A1 };
let C1 = { type: 'div', key: 'C1', return: B1 };
let C2 = { type: 'div', key: 'C2', return: B1 };
A1.child = B1;
B1.sibling = B2;
B1.child = C1;
C1.sibling = C2;

let rootFiber = A1;
// 下一个工作单元
let nextUnitOfWork = null;
// render 工作循环
function workLoop() {
  while (nextUnitOfWork) {
    // 执行当前任务并返回下一个任务
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  // render阶段结束
}

function performUnitOfWork(fiber) {
  beginWork(fiber);
  if (fiber.child) { // 如果有子节点则返回子节点
    return fiber.child;
  }
  // 如果没有子节点，说明当前节点已经完成了渲染工作
  while (fiber) {
    completeUnitOfWork(fiber);
    if (fiber.sibling) { // 如果有弟弟就返回弟弟
      return fiber.sibling;
    }
    fiber = fiber.return; // 如果没有弟弟，就让爸爸完成，然后找叔叔
  }
}

function beginWork(fiber) {
  console.log(fiber.key, 'beginWork');
}

function completeUnitOfWork(fiber) {
  console.log('completeUnitOfWork', fiber.key);
}

nextUnitOfWork = rootFiber;
workLoop();

