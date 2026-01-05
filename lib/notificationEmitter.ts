import { EventEmitter } from "events";

declare global {
  var notificationEmitter: EventEmitter | undefined;
}

export const notificationEmitter =
  global.notificationEmitter ??
  new EventEmitter();

if (!global.notificationEmitter) {
  global.notificationEmitter = notificationEmitter;
}
