// API Client for TIET-Sync Academic Backend
// Re-exports from centralized typed client in src/lib/api.ts

import { api, fetchApi, getToken, setToken } from './lib/api';

export { api, fetchApi, fetchApi as fetchJson, getToken, setToken };
export default api;
