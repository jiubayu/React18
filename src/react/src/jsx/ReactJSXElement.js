import hasOwnProperty from 'shared/hasOwnProperty';
import {REACT_ELEMENT_TYPE} from 'shared/ReactSymbols';

const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};

function hasValidRef(config) {
  return config?.ref !== null;
}

const ReactElement = (type, key, ref, props) => {
  const element = {
    // 这就是React元素，也称为虚拟dom
    $$typeof: REACT_ELEMENT_TYPE,
    type, // h1 span
    key, // 唯一标识
    ref, // 后续处理
    props, // 属性 children style onClick等
  };
  return element;
};
// React17以前 在老板的转换函数中，key是放在config中的， 第三个参数是children
// function createElementWithValidation(type, props, children) {}
// React17之后 在新版的转换函数中 key是放在第三个参数中的， children是放在config中的 
export function jsxDEV(type, config = {}, maybeKey) {
  let propName;
  const props = {};
  let key = null;
  let ref = null;

  if (maybeKey !== undefined) {
    key = '' + maybeKey;
  }

  if (hasValidRef(config)) {
    ref = config?.ref;
  }

  for (propName in config) {
    if (
      hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      props[propName] = config[propName];
    }
  }

  return ReactElement(type, key, ref, props);
}
