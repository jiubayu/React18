import { setValueForStyles } from "./CSSPropertyOperations";
import { setValueForProperty } from "./DOMPropertyOperations";
import setTextContent from "./setTextContent";

const STYLE = 'style';
const CHILDREN = 'children';

export function setInitialProperties(domElement, tag, props) {
  setInitialDOMProperties(tag, domElement, props);
}

function setInitialDOMProperties(tag, domElement, nextProps) {
  for (const propKey in nextProps) {
    if (nextProps.hasOwnProperty(propKey)) {
      const nextProp = nextProps[propKey];
      if (propKey === STYLE) {
        setValueForStyles(domElement, nextProp);
      } else if (propKey === CHILDREN) {
        // 只有一个节点且为文本的话
        if (typeof nextProp === 'string') {
          setTextContent(domElement, nextProp);
        } else if (typeof nextProp === 'number') {
          setTextContent(domElement, `${nextProp}`);
        }
      } else if (propKey !== null) {
        setValueForProperty(domElement, propKey, nextProp);
      }
    }
  }
}

export function diffProperties(domElement, type, lastProps, nextProps) {
  let uploadPayload = null;
  let propKey = null;
  let styleName = null;
  let styleUpdates = null;

  // 处理属性的删除，如果说一个属性在老的对象里有，在新的对象中没有，那么就需要删除了
  for (propKey in lastProps) {
    // 新对象中有这个属性或者是老的对象里没有这个属性，那就不用处理
    if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey) || lastProps[propKey] === null) {
      continue;
    }
    if (propKey === STYLE) {
      const lastStyle = lastProps[propKey];
      for (styleName in lastStyle) {
        // 老的对象里有这个属性，就需要给他进行删除处理
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {};
          }
          styleUpdates[styleName] =  '';
        }
      }
    } else {
      (uploadPayload = uploadPayload || []).push(propKey, null);
    }
  }
  // 遍历新的对象
  for (propKey in nextProps) {
    const nextProp = nextProps[propKey]; // 新属性的值
    const lastProp = lastProps !== null ? lastProps[propKey] : undefined; // 老属性中的值

    if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp || (nextProp === null && lastProp === null)) {
      continue;
    }

    if (propKey === STYLE) {
      if (lastProp) {
        // 计算要删除的行内样式
        for (styleName in lastProp) {
          // 如果老属性中有style，而新属性中没有，就删除这个样式
          if (lastProp.hasOwnProperty(styleName) && (!nextProp || !nextProp.hasOwnProperty(styleName))) {
            if (!styleUpdates) {
              styleUpdates = {};
            }

            styleUpdates[styleName] = '';
          }
        }
        // 遍历新的样式对象
        for (styleName in nextProp) {
          // 如果说新的属性有，而且新属性和老属性不一样，那就用新的属性 
          if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = nextProp[styleName];
          }
        }
      } else {
        styleUpdates = nextProp;
      }
    } else if(propKey === CHILDREN){
      if (typeof nextProp === 'string' || typeof nextProp === 'number') {
        (uploadPayload = uploadPayload || []).push(propKey, nextProp);
      }
    } else {
      (uploadPayload = uploadPayload || []).push(propKey, nextProp);
    }
  }

  if (styleUpdates) {
    (uploadPayload = uploadPayload || []).push(STYLE, styleUpdates);
  }

  return uploadPayload; // [key1, value1, key2, value2]
}

export function updateProperties(domElement, uploadPayload, type, oldProps, newProps) {
  updateDOMProperties(domElement, uploadPayload);
}

function updateDOMProperties(domElement, uploadPayload) {
  for (let i = 0; i < uploadPayload.length; i+=2) {
    const propKey = uploadPayload[i];
    const propValue = uploadPayload[i + 1];
    if (propKey === STYLE) {
      setValueForStyles(domElement, propValue);
    } else if(propKey === CHILDREN) {
      setTextContent(domElement, propValue);
    } else {
      setValueForProperty(domElement, propKey, propValue);
    }
  }
}