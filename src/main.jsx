import {createRoot} from './react-dom/src/client';
import * as React from 'react';

// import React from 'react';
// import {createRoot} from 'react-dom/client'

/** fiber基础架构 */
let element = (
    <h1 id='container'>
      hello<span style={{color: 'red'}}>world</span>
    </h1>
);

/** 事件系统 */
// function FunctionComponent() {
//   return (
//     <h1
//       id='container'
//       onClick={(event) =>
//         console.log('父冒泡onClick', event.currentTarget.nodeName)
//       }
//       onClickCapture={(event) => {
//         console.log('父捕获onClickCapture', event.currentTarget.nodeName);
//         event.stopPropagation(); //阻止冒泡
//       }}
//     >
//       hello
//       <span
//         onClick={(event) => {
//           console.log('子冒泡onClick', event.currentTarget.nodeName);
//           // event.stopPropagation(); //阻止冒泡
//         }}
//         onClickCapture={(event) =>
//           console.log('子捕获onClickCapture', event.currentTarget.nodeName)
//         }
//         style={{color: 'red'}}
//       >
//         world
//       </span>
//     </h1>
//   );
// }
// debugger;

/**
 * hooks
 */

function reducer(state, action) {
  if ((action.type = 'add')) {
    return state + 1;
  }
  return state;
}
function FunctionComponent() {
  console.log('FunctionComponent');
  // const [num, setNum] = React.useReducer(reducer, 0);
  // 如果使用的useState，调用setNumber的时候传入的是老状态，则不需要更新
  let [num, setNum] = React.useState(0);
  let attrs = {id: 'btn1'};
  if (num === 6) {
    attrs.style = {color: 'red'};
    delete attrs.id;
  }
  // setTimeout(() => {
  //   num = 10
  // }, 1000);
  return (
    <button
      {...attrs}
      onClick={() => {
        // setNum({type: 'add'});
        // setNum(num => undefined);
        setNum(num+1);
        // setNum(num + 1);
        // setNum(num + 2);
      }}
    >
      {num}
    </button>
  );
}

// DOM DIFF
// function FunctionComponent2() {
//   const [num, setNum] = React.useState(0);
//   /*********************** 单元素比较    ***********************/
//   /** 1 单节点 key相同 类型相同 直接复用 */
//   // return num === 0 ? (
//   //   <div onClick={() => setNum(num + 1)} key='title' id='title'>
//   //     title
//   //   </div>
//   // ) : (
//   //   <div onClick={() => setNum(num + 1)} key='title' id='title2'>
//   //     title2
//   //   </div>
//   // );

//   /**2 key不同，类型相同 删除老的fiber和它的子fiber，创建新的fiber */
//   // return num === 0 ? (
//   //   <div onClick={() => setNum(num + 1)} key='title' id='title'>
//   //     title
//   //   </div>
//   // ) : (
//   //   <div onClick={() => setNum(num + 1)} key='title2' id='title2'>
//   //     title2
//   //   </div>
//   // );

//   /** 3 key相同，类型不同 */
//   // return num === 0 ? (
//   //   <div onClick={() => setNum(num + 1)} key='title' id='title'>
//   //     title
//   //   </div>
//   // ) : (
//   //   <p onClick={() => setNum(num + 1)} key='title' id='title2'>
//   //     title2
//   //   </p>
//   // );

//   /** 4 原来有多个节点，现在只有一个节点 */
//   // return num === 0 ? (
//   //   <ul key='container' onClick={() => setNum(num + 1)}>
//   //     <li key='A' id='A'>
//   //       A
//   //     </li>
//   //     <li key='B' id='B'>
//   //       B
//   //     </li>
//   //     <li key='C' id='C'>
//   //       C
//   //     </li>
//   //   </ul>
//   // ) : (
//   //   <ul key='container' onClick={() => setNum(num + 1)}>
//   //     <li key='B' id='B2'>
//   //       B2
//   //     </li>
//   //   </ul>
//   // );

//   /*********************** 多元素比较    ***********************/
//   /**
//    * 多元素DIFF的规则
//    * 1 只对同级元素进行比较，不同层次不对比
//    * 2 不同的类型对应的是不同元素
//    * 3 可以通过key来标识同一个节点
//    */

//   /** 多个节点的类型和 key 全部相同，有新增元素   */
//   // return num === 0 ? (
//   //   <ul key='container' onClick={() => setNum(num + 1)}>
//   //     <li key='A' id='A'>
//   //       A
//   //     </li>
//   //     <li key='B' id='B'>
//   //       B
//   //     </li>
//   //     <li key='C' id='C'>
//   //       C
//   //     </li>
//   //   </ul>
//   // ) : (
//   //   <ul key='container' onClick={() => setNum(num + 1)}>
//   //     <li key='A' id='A'>
//   //       A2
//   //     </li>
//   //     <li key='B' id='B2'>
//   //       B
//   //     </li>
//   //     <li key='C' id='C'>
//   //       C2
//   //     </li>
//   //     <li key='D' id='D2'>
//   //       D
//   //     </li>
//   //   </ul>
//   // );
//   /** 多个节点数量不同、key 不同   */
//     // return num === 0 ? (
//     //   <ul key='container' onClick={() => setNum(num + 1)}>
//     //      <li key='A'>A</li>
//     //     <li key='B' id='b'>
//     //        B
//     //     </li>
//     //      <li key='C'>C</li> <li key='D'>D</li> <li key='E'>E</li>
//     //     <li key='F'>F</li>
//     //   </ul>
//     // ) : (
//     //   <ul key='container' onClick={() => setNum(num + 1)}>
//     //       <li key='A'>A2</li>
//     //       <li key='C'>C2</li>
//     //       <li key='E'>E2</li>
//     //       <li key='B' id='b2'>
//     //         B2
//     //       </li>
//     //       <li key='G'>G</li>
//     //       <li key='D'>D2</li>
//     //   </ul>
//     // );
// }

// useEffect

function FunctionComponent3() {
  const [num, setNum] = React.useState(0);
  React.useEffect(() => {
    console.log('useEffect1');
    return () => console.log('destory  useEffect1');
  }, [num]);
  React.useLayoutEffect(() => {
    console.log('useEffect2');
    return () => console.log('destory  useEffect2');
  }, [num]);
  React.useEffect(() => {
    console.log('useEffect3');
    return () => console.log('destory  useEffect3');
  }, [num]);
  React.useLayoutEffect(() => {
    console.log('useEffect4');
    return () => console.log('destory  useEffect4');
  }, [num]);
  return <button onClick={() => setNum(num + 1)}>{num}</button>;
}

function Test() {
  let [num, setNum] = React.useState(0);
  num = 10
  return <button onClick={() => setNum(num + 1)}>{num}</button>;
}

// old let element = React.createElement(FunctionComponent)
// new let element = jsx(FunctionComponent);
// let element = <FunctionComponent />;
const root = createRoot(document.querySelector('#root'));
// console.log(Test); 
root.render(<Test/>);
