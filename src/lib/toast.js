import { emit } from "./events";

export const showToast = (message, type = "success") => {
  emit("app-toast", { message, type });
};
