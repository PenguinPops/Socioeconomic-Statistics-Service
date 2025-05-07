import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { saltAndHashPassword } from '@/app/utils/snhpass'; // Assuming this path is correct
import { auth } from '@/../auth'; // Your auth configuration

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// PUT (Update) a user
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
  }

  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !role) { // Password is optional for updates
      return NextResponse.json({ message: 'Missing required fields (name, email, role)' }, { status: 400 });
    }

    const client = await pool.connect();
    let result;

    if (password) { // If password is provided, hash and update it
      const hashedPassword = await saltAndHashPassword(password);
      result = await client.query(
        'UPDATE users SET name = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING id, name, email, role',
        [name, email, hashedPassword, role, userId]
      );
    } else { // Otherwise, update without changing the password
      result = await client.query(
        'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, name, email, role',
        [name, email, role, userId]
      );
    }
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === '23505') {
        return NextResponse.json({ message: 'Another user with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}

// DELETE a user
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    // You might also want to delete related data in 'accounts', 'sessions', 'verification_tokens' tables
    // if you want a full cleanup. The adapter typically handles this if a user is deleted through its mechanisms.
    // For direct deletion, you'll need to manage these.
    // Example: Start a transaction
    // await client.query('BEGIN');
    // await client.query('DELETE FROM accounts WHERE userId = $1', [userId]);
    // await client.query('DELETE FROM sessions WHERE userId = $1', [userId]);
    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    // await client.query('COMMIT');
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    // await client.query('ROLLBACK'); // Rollback transaction on error
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
}