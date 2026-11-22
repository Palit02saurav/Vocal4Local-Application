import { DeviceEventEmitter } from "react-native";

export const emit = (name, payload) => DeviceEventEmitter.emit(name, payload);

export const on = (name, fn) => {
  const sub = DeviceEventEmitter.addListener(name, fn);
  return () => sub.remove();
};
