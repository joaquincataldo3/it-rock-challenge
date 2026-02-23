import { create, update, remove, importFromApi, getAll } from '../services/tasks.js';
import { authenticate } from '../middlewares/auth.js';
import { ok, created, badRequest, serverError, notFound } from '../utils/responses.js';
import { LOG_LEVELS, logger } from '../utils/logger.js';

export const handleCreate = authenticate(async (event) => {
  try {
    // event.body is string in aws lambda, that's why the json.parse
    const body = JSON.parse(event.body || '{}');
    const { title, description } = body;

    if (!title) return badRequest('Title is required');

    const task = create(event.user.id, title, description);

    logger(LOG_LEVELS.INFO, 'Task created', { taskId: task.id, userId: event.user.id });
    return created(task);

  } catch (error) {
    logger(LOG_LEVELS.ERROR, 'Error creating task', {error: error.message});
    return serverError();
  }
});

export const handleGetAll = authenticate(async (event) => {
  try {
    const { page, limit, completed, from, to } = event.queryStringParameters || {};

    if (from && to && from > to) {
      return badRequest('From must be earlier than to');
    }

    const filters = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      completed: completed !== undefined ? completed === 'true' : undefined,
      from,
      to
    };

    const result = getAll(event.user.id, filters);

    return ok(result);
  } catch (error) {
    logger(LOG_LEVELS.ERROR, 'Error getting all tasks', {error: error.message});
    return serverError();
  }
});

export const handleUpdate = authenticate(async (event) => {
  try {
    // event.body is string in aws lambda, that's why the json.parse
    const body = JSON.parse(event.body || '{}');
    const { id } = event.pathParameters;
    const { title, description, completed } = body;

    if (!title && !description && completed === undefined) {
        return badRequest('At least one field is required');
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
        return badRequest('Completed must be a boolean');
    }

    // only send fields that were provided
    const fields = {};
    if (title !== undefined) fields.title = title;
    if (description !== undefined) fields.description = description;
    if (completed !== undefined) fields.completed = completed;
    const userId = event.user.id;
    const task = update(userId, id, fields);

    if (!task) {
      logger(LOG_LEVELS.WARN, 'Task not found', {taskId: id})
      return notFound('Task not found');
    }

    logger(LOG_LEVELS.INFO, 'Successfully updated task', {taskId: id});
    return ok(task);

  } catch (error) {
    logger(LOG_LEVELS.ERROR, 'Error updating task', {error: error.message});
    return serverError();
  }
});

export const handleRemove = authenticate(async (event) => {
  try {
    const { id } = event.pathParameters;

    const result = remove(event.user.id, id);

    if (!result) {
      logger(LOG_LEVELS.WARN, 'Task not found', {taskId: id});
      return notFound('Task not found');
    }

    logger(LOG_LEVELS.INFO, 'Task successfully deleted', {taskId: id});
    return ok({ message: 'Task successfully deleted' });

  } catch (error) {
    logger(LOG_LEVELS.ERROR, 'Error removing task', {error: error.message});
    return serverError();
  }
});

export const handleImportFromApi = authenticate(async (event) => {
  try {
    const result = await importFromApi(event.user.id);
    logger(LOG_LEVELS.INFO, 'Tasks imported from external API', { 
      imported: result.imported, 
      userId: event.user.id 
    });
    return ok(result);
  } catch (error) {
    logger(LOG_LEVELS.ERROR, 'Error importing tasks from api', {error: error.message});
    return serverError();
  }
});