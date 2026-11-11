export class AppError extends Error {
  constructor(status, code, message, field = null) {
    super(message);
    Object.assign(this, { status, code, field });
  }
}
export const fail = (status, code, message, field) => {
  throw new AppError(status, code, message, field);
};
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || 500;
  res
    .status(status)
    .json({
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: status === 500 ? "Something went wrong." : error.message,
        field: error.field ?? null,
      },
    });
}
