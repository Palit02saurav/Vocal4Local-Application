import * as SecureStore from "expo-secure-store";
import adminApi, { ADMIN_TOKEN_KEY } from "./api";

let currentAdmin = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn(currentAdmin));

export const onAdminAuth = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getAdminUser = () => currentAdmin;

const NETWORK_ERROR = "Could not reach the server. Is the backend running?";

// Admins and sellers use their email. Street vendors use their phone number.
export const adminLogin = async (email, password) => {
  try {
    const res = await adminApi.post("/auth/login", { email, password });
    const { user, token } = res.data.data || {};
    if (!token) {
      return {
        success: false,
        message: "The server did not send a token. Check the backend edits.",
      };
    }
    await SecureStore.setItemAsync(ADMIN_TOKEN_KEY, token);
    currentAdmin = user;
    notify();
    return { success: true, user };
  } catch (err) {
    return {
      success: false,
      message: err.status ? err.message : NETWORK_ERROR,
    };
  }
};

export const adminLogout = async () => {
  try {
    await adminApi.post("/auth/logout");
  } catch {}
  await SecureStore.deleteItemAsync(ADMIN_TOKEN_KEY);
  currentAdmin = null;
  notify();
};

export const adminCheckAuth = async () => {
  const token = await SecureStore.getItemAsync(ADMIN_TOKEN_KEY);
  if (!token) {
    currentAdmin = null;
    return null;
  }
  try {
    const res = await adminApi.get("/auth/me");
    currentAdmin = res.data?.data?.user || null;
  } catch (err) {
    if (err.status === 401) {
      await SecureStore.deleteItemAsync(ADMIN_TOKEN_KEY);
      currentAdmin = null;
    }
  }
  return currentAdmin;
};
