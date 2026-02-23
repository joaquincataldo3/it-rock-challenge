import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';

const STATIC_USER = {
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  username: 'admin',
  password: 'password123'
};

const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const login = (username, password) => {
  if (username !== STATIC_USER.username || password !== STATIC_USER.password) {
    return null;
  }
  return signToken({ id: STATIC_USER.id, username: STATIC_USER.username });
};
