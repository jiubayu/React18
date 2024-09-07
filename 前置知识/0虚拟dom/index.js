// 1 把虚拟dom构建成fiber树
let container = document.getElementById('root');
let C1 = {type: 'div', props: {id: 'C1', children: []}};
let C2 = {type: 'div', props: {id: 'C2', children: []}};
let B1 = {type: 'div', props: {id: 'B1', children: [C1, C2]}};
let B2 = {type: 'div', props: {id: 'B2', children: []}};
let A1 = { type: 'div', props: { id: 'A1', children: [B1, B2] } };
// A1的第一个子节点是B1
A1.child = B1;
// B1的弟弟是B2
B1.sibling = B2;
B1.child = C1;
C1.sibling = C2;

let nextUnitOfWork = null;
let workInProgressRoot = null;
function workLoop() {
  while (nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  if (!nextUnitOfWork) {
    //render阶段结束
    commitRoot();
  }
}
function commitRoot() {
  let fiber = workInProgressRoot.firstEffect;
  while (fiber) {
    console.log(fiber.props.id); //C1 C2 B1 B2 A1
    commitWork(fiber);
    fiber = fiber.nextEffect;
  }
  workInProgressRoot = null;
}
function commitWork(currentFiber) {
  currentFiber.return.stateNode.appendChild(currentFiber.stateNode);
}
function performUnitOfWork(fiber) {
  beginWork(fiber);
  if (fiber.child) {
    return fiber.child;
  }
  while (fiber) {
    completeUnitOfWork(fiber);
    if (fiber.sibling) {
      return fiber.sibling;
    }
    fiber = fiber.return;
  }
}
function beginWork(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = document.createElement(currentFiber.type); //创建真实DOM
    for (let key in currentFiber.props) {
      //循环属性赋赋值给真实DOM
      if (key !== 'children' && key !== 'key')
        currentFiber.stateNode[key] = currentFiber.props[key];
    }
  }
  let previousFiber;
  currentFiber.props.children.forEach((child, index) => {
    let childFiber = {
      type: child.type,
      props: child.props,
      return: currentFiber,
      effectTag: 'PLACEMENT',
      nextEffect: null,
    };
    if (index === 0) {
      currentFiber.child = childFiber;
    } else {
      previousFiber.sibling = childFiber;
    }
    previousFiber = childFiber;
  });
}
function completeUnitOfWork(currentFiber) {
  const returnFiber = currentFiber.return;
  if (returnFiber) {
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect;
    }
    if (currentFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
      }
      returnFiber.lastEffect = currentFiber.lastEffect;
    }

    if (currentFiber.effectTag) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber;
      } else {
        returnFiber.firstEffect = currentFiber;
      }
      returnFiber.lastEffect = currentFiber;
    }
  }
}

workInProgressRoot = {
  key: 'ROOT',
  stateNode: container,
  props: {children: [A1]},
};
nextUnitOfWork = workInProgressRoot; //从RootFiber开始，到RootFiber结束
workLoop();
