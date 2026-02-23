import jwt from 'jsonwebtoken';
import { unauthorized } from '../utils/responses.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticate = (handler) => async (event) => {
  const authHeader = event.headers?.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized('Missing or invalid token');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    event.user = decoded;
    return handler(event);
  } catch (error) {
    return unauthorized('Invalid or expired token');
  }
};