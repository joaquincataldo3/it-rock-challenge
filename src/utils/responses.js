export const ok = (body) => ({ statusCode: 200, body: JSON.stringify(body) });
export const created = (body) => ({ statusCode: 201, body: JSON.stringify(body) });
export const badRequest = (message) => ({ statusCode: 400, body: JSON.stringify({ message }) });
export const unauthorized = (message = 'Unauthorized') => ({ statusCode: 401, body: JSON.stringify({ message }) });
export const notFound = (message) => ({ statusCode: 404, body: JSON.stringify({ message }) });
export const serverError = () => ({ statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) });