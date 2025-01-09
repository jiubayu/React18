export const NoFlags =        0b00000000000000000000000000;       // 0
export const Placement =      0b00000000000000000000000010;       // 2
export const Update =         0b00000000000000000000000100;       // 4
export const ChildDeletion =  0b00000000000000000000010000;       // 8 有子节点需要被删除
export const MutationMask = Placement | Update;                 // 6
// 如果函数里面使用了useEffect，那么此函数对应的fiber上会有一个flags
export const Passive = 0b00000000000000010000000000;       // 2**10 1024
export const LayoutMask = Update;  // 4