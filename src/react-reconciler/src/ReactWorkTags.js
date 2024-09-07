// 每种虚拟DOM都会对应自己的Fiber tag类型

export const FunctionComponent = 0; // 函数组件
export const ClassComponent = 1; // 类组件
// 函数组件和类型的type都是函数，这个时候并不知道具体类型，用2表示待定的元素类型 
export const IndeterminateComponent = 2;
export const HostRoot = 3; // 容器根节点
export const HostComponent = 5; // 原生节点 div span等
export const HostText = 6; // 纯文本节点 
