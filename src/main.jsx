import {createRoot} from './react-dom/src/client';
import * as React from 'react';

// import React from 'react';
// import {createRoot} from 'react-dom/client'

/** fiber基础架构 */
// let element = (
//     <h1 id='container'>
//       hello<span style={{color: 'red'}}>world</span>
//     </h1>
// );

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
  const [num, setNum] = React.useState(0);
  let attrs = {id: 'btn1'};
  if (num === 6) {
    attrs.style = {color: 'red'};
    delete attrs.id;
  }
  return (
    <button
      {...attrs}
      onClick={() => {
        // setNum({type: 'add'});
        // setNum(num => undefined);
        setNum(num);
        setNum(num + 1);
        setNum(num + 2);
      }}
    >
      {num}
    </button>
  );
}

// DOM DIFF
function FunctionComponent2() {
  const [num, setNum] = React.useState(0);
  /*********************** 单元素比较    ***********************/
  /** 1 单节点 key相同 类型相同 直接复用 */
  // return num === 0 ? (
  //   <div onClick={() => setNum(num + 1)} key='title' id='title'>
  //     title
  //   </div>
  // ) : (
  //   <div onClick={() => setNum(num + 1)} key='title' id='title2'>
  //     title2
  //   </div>
  // );

  /**2 key不同，类型相同 删除老的fiber和它的子fiber，创建新的fiber */
  // return num === 0 ? (
  //   <div onClick={() => setNum(num + 1)} key='title' id='title'>
  //     title
  //   </div>
  // ) : (
  //   <div onClick={() => setNum(num + 1)} key='title2' id='title2'>
  //     title2
  //   </div>
  // );

  /** 3 key相同，类型不同 */
  // return num === 0 ? (
  //   <div onClick={() => setNum(num + 1)} key='title' id='title'>
  //     title
  //   </div>
  // ) : (
  //   <p onClick={() => setNum(num + 1)} key='title' id='title2'>
  //     title2
  //   </p>
  // );

  /** 4 原来有多个节点，现在只有一个节点 */
  // return num === 0 ? (
  //   <ul key='container' onClick={() => setNum(num + 1)}>
  //     <li key='A' id='A'>
  //       A
  //     </li>
  //     <li key='B' id='B'>
  //       B
  //     </li>
  //     <li key='C' id='C'>
  //       C
  //     </li>
  //   </ul>
  // ) : (
  //   <ul key='container' onClick={() => setNum(num + 1)}>
  //     <li key='B' id='B2'>
  //       B2
  //     </li>
  //   </ul>
  // );

  /*********************** 多元素比较    ***********************/
  /**
   * 多元素DIFF的规则
   * 1 只对同级元素进行比较，不同层次不对比
   * 2 不同的类型对应的是不同元素
   * 3 可以通过key来标识同一个节点
   */
  /**   */
  return num === 0 ? (
    <ul key='container' onClick={() => setNum(num + 1)}>
      <li key='A' id='A'>
        A
      </li>
      <li key='B' id='B'>
        B
      </li>
      <li key='C' id='C'>
        C
      </li>
    </ul>
  ) : (
    <ul key='container' onClick={() => setNum(num + 1)}>
      <li key='A' id='A'>
        A2
      </li>
      <li key='B' id='B'>
        B
      </li>
      <li key='C' id='C'>
        C2
      </li>
      <li key='D' id='D'>
        D
      </li>
    </ul>
  );
}

// old let element = React.createElement(FunctionComponent)
// new let element = jsx(FunctionComponent);
let element = <FunctionComponent2 />;
const root = createRoot(document.querySelector('#root'));
root.render(element);
