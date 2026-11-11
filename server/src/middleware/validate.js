import { AppError } from '../utils/errors.js';
export const validate = (schema, source = 'body') => (req,res,next) => {
 const result = schema.safeParse(req[source]);
 if (!result.success) { const issue = result.error.issues[0]; return next(new AppError(400,'VALIDATION_ERROR',issue.message,issue.path[0] || null)); }
 req[source] = result.data; next();
};
