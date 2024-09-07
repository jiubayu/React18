import assign from "shared/assign";

function functionThatReturnsFalse() {
  return false;
}
function functionThatReturnsTrue() {
  return true;
}

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
const EventInterface = {
  eventPhase: 0,
  bubbles: 0,
  cancelable: 0,
  timeStamp: function (event) {
    return event.timeStamp || Date.now();
  },
  defaultPrevented: 0,
  isTrusted: 0,
};

const UIEventInterface = {
  ...EventInterface,
  view: 0,
  detail: 0,
};

const MouseEventInterface = {
  ...UIEventInterface,
  screenX: 0,
  screenY: 0,
  clientX: 0,
  clientY: 0,
  pageX: 0,
  pageY: 0,
  ctrlKey: 0,
  shiftKey: 0,
  altKey: 0,
  metaKey: 0,
  button: 0,
  buttons: 0,
}

function createSyntheticEvent(Interface) {
  /**
   * 合成事件的基类
   * @param {*} reactName React属性 onClick
   * @param {*} reactEventType click
   * @param {*} targetInst 事件源对应的Fiber实例
   * @param {*} nativeEvent 原生事件对象
   * @param {*} nativeEventTarget 原生事件源 span 事件源对应的真实DOM
   */
  function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
    this._reactName = reactName;
    this._reactEventType = reactEventType;
    this._targetInst = targetInst;
    this.nativeEvent = nativeEvent;
    this.nativeEventTarget = nativeEventTarget;
    // 把此接口对应的事件属性从原生事件上拷贝到合成事件的实例上
    for (const propName in Interface) {
      if (!Interface.hasOwnProperty(propName)) {
        continue;
      }
      this[propName] = Interface[propName];
    }
    // 是否已经阻止默认事件了
    this.isDefaultPrevented = functionThatReturnsFalse;
    // 是否已经阻止事件传播了
    this.isPropagationStopped = functionThatReturnsFalse;
    // 兼容  preventDefault|stopPropagation
    assign(SyntheticBaseEvent.prototype, {
      preventDefault() {
        const event = this.nativeEvent;
        if (event.preventDefault) {
          event.preventDefault();
        } else { // 兼容IE
          event.returnValue = false;
        }
        
        this.isDefaultPrevented = functionThatReturnsTrue;
      },
      stopPropagation() {
        const event = this.nativeEvent;
        if (event.stopPropagation) {
          event.stopPropagation();
        } else { // 兼容IE
          event.cancelBubble = true;
        }

        this.isPropagationStopped = functionThatReturnsTrue;
      }
    })
    return this;
  }

  return SyntheticBaseEvent;
}

export const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);