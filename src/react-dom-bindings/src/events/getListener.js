import { getFiberCurrentPropsFromNode } from "../client/ReactDOMComponentTree";

/**
 * 获取此fiber对应的回调函数
 * @param {*} inst 
 * @param {*} registrationName 
 */
function getListener(inst, registrationName) {
  const { stateNode } = inst;
  if (stateNode === null) {
    return null;
  }
  const props = getFiberCurrentPropsFromNode(stateNode);
  if (props === null) {
    return null;
  }
  const listener = props[registrationName];//  props.onClick
  return listener;
}

export default getListener;


/**
 * 
 */