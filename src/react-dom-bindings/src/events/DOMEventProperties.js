import { registerTwoPhaseEvent } from "./EventRegistry";

export const topLevelEventsToReactNames = new Map();
const simpleEventPluginEvents = [
  // 'abort',
  // 'auxClick',
  // 'cancel',
  // 'canPlay',
  // 'canPlayThrough',
  'click',
  // 'close',
  // 'contextMenu',
  // 'copy',
  // 'cut',
  // 'drag',
  // 'dragEnd',
  // 'dragEnter',
  // 'dragExit',
  // 'dragLeave',
  // 'dragOver',
  // 'dragStart',
  // 'drop',
  // 'durationChange',
  // 'emptied',
  // 'encrypted',
  // 'ended',
  // 'error',
  // 'gotPointerCapture',
  // 'input',
  // 'invalid',
  // 'keyDown',
  // 'keyPress',
  // 'keyUp',
  // 'load',
  // 'loadedData',
  // 'loadedMetadata',
  // 'loadStart',
  // 'lostPointerCapture',
  // 'mouseDown',
  // 'mouseMove',
  // 'mouseOut',
  // 'mouseOver',
  // 'mouseUp',
  // 'paste',
  // 'pause',
  // 'play',
  // 'playing',
  // 'pointerCancel',
  // 'pointerDown',
  // 'pointerMove',
  // 'pointerOut',
  // 'pointerOver',
  // 'pointerUp',
  // 'progress',
  // 'rateChange',
  // 'reset',
  // 'resize',
  // 'seeked',
  // 'seeking',
  // 'stalled',
  // 'submit',
  // 'suspend',
  // 'timeUpdate',
  // 'touchCancel',
  // 'touchEnd',
  // 'touchStart',
  // 'volumeChange',
  // 'scroll',
  // 'toggle',
  // 'touchMove',
  // 'waiting',
  // 'wheel',
];


function registerSimpleEvent(domEventName, reactName) {
  // onClick对应的事件可以从哪里获取? 此元素的props中的onClick获取对应的事件 props.onClick
  // 关联原生事件和react事件  click -> onClick
  topLevelEventsToReactNames.set(domEventName, reactName); 
  registerTwoPhaseEvent(reactName, [domEventName])
}
export function registerSimpleEvents() {
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i]; // click
    const domEventName = eventName.toLowerCase();// click
    const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1); // Click

    registerSimpleEvent(domEventName, `on${capitalizedEvent}`); // click onClick
  }
}