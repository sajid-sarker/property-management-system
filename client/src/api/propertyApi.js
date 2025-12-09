// Fallback/Legacy API file - deferring to services/api.js
import { propertyService } from '../services/api';
export default propertyService;
export const getAll = propertyService.getAll;
export const getById = propertyService.getById;
export const create = propertyService.create;
