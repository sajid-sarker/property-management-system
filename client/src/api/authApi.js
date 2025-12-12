// Fallback/Legacy API file - deferring to services/api.js
import { authService } from "../services/api";
export default authService;
export const login = authService.login;
export const register = authService.register;
export const logout = authService.logout;
