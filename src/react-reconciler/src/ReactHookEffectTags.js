export const NoFlags = /*   */ 0b0000;
// 只有有HasEffect才会进行执行
export const HasEffect = /* */ 0b0001;
// useLayoutEffect 积极的，会在UI绘制完成之前执行，类似于微任务
export const Layout = /*    */ 0b0100; // useLayoutEffect
// useEffect，消极的，会在UI绘制之后执行，类似于宏任务
export const Passive = /*   */ 0b1000; // useEffect