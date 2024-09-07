import { schedulerCallback } from "./src/forks/Schduler";
export function schedulerUpdateOnFiber(root) {
  ensureRootIsScheduled(root);
}
function ensureRootIsScheduled(root) {
  schedulerCallback(performanceConcurrentWorkOnRoot.bind(null, root));
}
function performanceConcurrentWorkOnRoot(root) {
  console.log('performConcurrentWorkOnRoot');
}