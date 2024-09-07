// 1 把虚拟dom构建成fiber树
let container = document.getElementById('root');
let C1 = {type: 'div', props: {id: 'C1', children: []}};
let C2 = {type: 'div', props: {id: 'C2', children: []}};
let B1 = {type: 'div', props: {id: 'B1', children: [C1, C2]}};
let B2 = {type: 'div', props: {id: 'B2', children: []}};
let A1 = {type: 'div', props: {id: 'A1', children: [B1, B2]}};
// A1的第一个子节点是B1
A1.child = B1;
// B1的弟弟是B2
B1.sibling = B2;
B1.child = C1;
C1.sibling = C2;

let nextUnitOfWork = null;
let workInProgressRoot = null;

// 具体的执行流程
// render： 如果有尚未完成的nextUnitOfWork，继续执行，否则进行commitRoot阶段
function workLoop() {
  while (nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  if (!nextUnitOfWork) {
    // 表示渲染阶段已经结束，进入commit阶段
    commitRoot();
  }
}
// 从根节点fiberHostRoot开始，拿到对应的firstEffect，进行副作用处理
// 这里简单打印id
function commitRoot() {
  let fiber = workInProgressRoot.firstEffect;

  while (fiber) {
    console.log(fiber.props.id);
    commitWork(fiber);
    fiber = fiber.nextEffect;
  }
  // 结束后，垃圾回收
  workInProgressRoot = null;
}
// current当前节点插入编译完成的dom节点
function commitWork(currentFiber) {
  currentFiber.return.stateNode.appendChild(currentFiber.stateNode);
}
// fiber节点的遍历规则
// 1 如果有子节点，则返回子节点
// 2 没有子节点，则当前节点标记为处理完成
// 3 继续处理当前节点的兄弟节点，
// 4 没有兄弟节点，则返回父节点进行处理
function performUnitOfWork(fiber) {
  beginWork(fiber);
  // 1 如果有子节点，则返回子节点
  if (fiber.child) {
    return fiber.child;
  }
  while (fiber) {
    // 2 没有子节点，则当前节点标记为处理完成
    completeUnitOfWork(fiber);
    // 3 继续处理当前节点的兄弟节点
    if (fiber.sibling) {
      return fiber.sibling;
    }
    // 4 没有兄弟节点，则对父节点进行处理
    fiber = fiber.return;
  }
}
// 1 根据fiber节点的类型生成真实节点并挂载到currentFiber的statteNode上
// 2 处理currentFiber的props属性，如果key!=children和key!=style，则直接将属性挂载到真实dom上
// 3 将fiber的子节点处理成fiber
function beginWork(currentFiber) {
  if (!currentFiber.stateNode) {
    // 1 根据fiber节点的类型生成真实节点并挂载到currentFiber的statteNode上
    currentFiber.stateNode = document.createElement(currentFiber.type); // 根据type类型创建真实的dom
    const {props} = currentFiber;
    for (let key in props) {
      // 2 处理currentFiber的props属性，如果key!=children和key!=style，则直接将属性挂载到真实dom上
      if (key !== 'children' && key !== 'style') {
        currentFiber.stateNode[key] = props[key];
      }
    }
  }
  let previousFiber;
  const {children} = currentFiber.props;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childFiber = {
        props: child.props,
        type: child.type,
        return: currentFiber,
        effectTag: 'PLACEMENT',
        nextEffect: null,
      };
      if (i === 0) {
        currentFiber.child = childFiber;
      } else {
        previousFiber.sibling = childFiber;
      }
      previousFiber = childFiber;
    }
  }
}
// 副作用收集
// 将currentFiber挂载到父级上，每个fiber分别有firstEffect,lastEffect和nextEffect3个参数
// 1 父节点没有第一个节点，则直接讲currentFiber的第一个当成父的
// 2 父有第一个而且子有多个副作用，则讲子的副作用接到父的最后面
// 3 子有effectTags，即自己为一个副作用,则直接接上父的最后一个节点

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
