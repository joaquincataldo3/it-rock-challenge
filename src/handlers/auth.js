import { login } from '../services/auth.js';
import { LOG_LEVELS, logger } from '../utils/logger.js';
import { badRequest, unauthorized, ok, serverError } from '../utils/responses.js';

export const handleLogin = async (event) => {
  try {
    // event.body is string in aws lambda, that's why the json.parse
    const body = JSON.parse(event.body || '{}');
    const { username, password } = body;

    if (!username || !password) return badRequest('Username and password are required')

    const token = login(username, password);

    if (!token) {
      logger(LOG_LEVELS.WARN, 'Failed login attempt', {username});
      return unauthorized('Invalid credentials')
    }

    logger(LOG_LEVELS.INFO, 'User logged in', { username });
    return ok({token})

  } catch (error) {
    logger(LOG_LEVELS.ERROR, 'Error during login', { error: error.message });
    return serverError();
  }
};