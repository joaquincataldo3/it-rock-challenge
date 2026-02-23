import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
const TODOS_API_URL = 'https://jsonplaceholder.typicode.com/todos';

export const create = (userId, title, description) => {
  const task = {
    id: uuidv4(),
    title,
    description,
    completed: 0,
    userId,
    createdAt: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO tasks (id, title, description, completed, userId, createdAt)
    VALUES (@id, @title, @description, @completed, @userId, @createdAt)
  `).run(task);

  return { ...task, completed: false };
};

export const getAll = (userId, filters = {}) => {
  const { page = 1, limit = 10, completed, from, to } = filters;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM tasks WHERE userId = ?';
  const params = [userId];

  if (completed !== undefined) {
    query += ' AND completed = ?';
    params.push(completed ? 1 : 0);
  }

  if (from) {
    query += ' AND createdAt >= ?';
    params.push(from);
  }

  if (to) {
    query += ' AND createdAt <= ?';
    params.push(to);
  }

  query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const tasks = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE userId = ?').get(userId).count;

  return {
    // sqllite doesn't have boolean type, 0/1 is used instead
    tasks: tasks.map(task => ({ ...task, completed: task.completed === 1 })),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
};

export const update = (userId, id, fields) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?').get(id, userId);

  if (!task) return null;

  const updated = { ...task, ...fields };

  db.prepare(`
    UPDATE tasks SET title = @title, description = @description, completed = @completed
    WHERE id = @id AND userId = @userId
  `).run({
    ...updated,
    // sqllite doesn't have boolean type, 0/1 is used instead
    completed: updated.completed ? 1 : 0
  });

  return { ...updated, completed: Boolean(updated.completed) };
};

export const remove = (userId, id) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?').get(id, userId);

  if (!task) return null;

  db.prepare('DELETE FROM tasks WHERE id = ? AND userId = ?').run(id, userId);
  return true;
};

export const importFromApi = async (userId) => {
  const response = await fetch(TODOS_API_URL);
  const todos = await response.json();

  const filtered = todos.filter(todo => todo.userId === 1).slice(0, 5);

  if (filtered.length === 0) {
    return { imported: 0, tasks: [] };
  }

  const tasks = filtered.map(todo => ({
    id: uuidv4(),
    title: todo.title,
    description: '',
    completed: todo.completed ? 1 : 0,
    userId,
    createdAt: new Date().toISOString()
  }));

  const insert = db.prepare(`
    INSERT INTO tasks (id, title, description, completed, userId, createdAt)
    VALUES (@id, @title, @description, @completed, @userId, @createdAt)
  `);

  // all tasks need to be inserted or none
  const insertMany = db.transaction((tasks) => {
    for (const task of tasks) insert.run(task);
  });

  insertMany(tasks);

  return {
    imported: tasks.length,
    tasks: tasks.map(task => ({ ...task, completed: Boolean(task.completed) }))
  };
};