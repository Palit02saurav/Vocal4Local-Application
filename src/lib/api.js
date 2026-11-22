import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const API_BASE = process.env.EXPO_PUBLIC_API_URL;
export const ADMIN_TOKEN_KEY = "admin_token";

export const adminClient = axios.create({
  baseURL: API_BASE,
  headers: { "x-client": "app" },
});

adminClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ADMIN_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function request(method, path, body) {
  try {
    const res = await adminClient.request({ url: path, method, data: body });
    return { data: res.data, status: res.status };
  } catch (err) {
    const status = err.response?.status;
    const data = err.response?.data ?? null;
    const wrapped = new Error(
      data?.message || `Request failed with status ${status}`,
    );
    wrapped.status = status;
    wrapped.data = data;
    throw wrapped;
  }
}

const adminApi = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  put: (path, body) => request("PUT", path, body),
  delete: (path) => request("DELETE", path),
};

export default adminApi;
