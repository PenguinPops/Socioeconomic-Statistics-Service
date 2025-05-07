import { query } from '@/../db';
import { saltAndHashPassword } from '@/app/utils/snhpass';

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export async function getUsers(): Promise<User[]> {
  const result = await query('SELECT * FROM users');
  return result.rows;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const hashedPassword = await saltAndHashPassword(user.password);
  const result = await query(
    'INSERT INTO users (email, username, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [user.email, user.username, hashedPassword, user.role]
  );
  return result.rows[0];
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  let updates: string[] = [];
  let values: any[] = [];
  let counter = 1;

  if (userData.email) {
    updates.push(`email = $${counter}`);
    values.push(userData.email);
    counter++;
  }
  if (userData.username) {
    updates.push(`username = $${counter}`);
    values.push(userData.username);
    counter++;
  }
  if (userData.role) {
    updates.push(`role = $${counter}`);
    values.push(userData.role);
    counter++;
  }
  if (userData.password) {
    const hashedPassword = await saltAndHashPassword(userData.password);
    updates.push(`password = $${counter}`);
    values.push(hashedPassword);
    counter++;
  }

  values.push(id);
  const queryText = `UPDATE users SET ${updates.join(', ')} WHERE id = $${counter} RETURNING *`;
  
  const result = await query(queryText, values);
  return result.rows[0];
}

export async function deleteUser(id: string): Promise<void> {
  await query('DELETE FROM users WHERE id = $1', [id]);
}