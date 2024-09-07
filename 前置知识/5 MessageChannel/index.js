// 创建一个新的消息通道，并通过它的两个 MessagePort 属性发送数据
const channel = new MessageChannel();
const port1 = channel.port1;
const port2 = channel.port2;
port1.onmessage = function (event) {
  console.log("port1收到来自port2的数据：" + event.data);
}
port2.onmessage = function (event) {
  console.log('port2收到来自port1的数据：' + event.data);
};
port1.postMessage('发送给port2');
port2.postMessage('发送给port1');