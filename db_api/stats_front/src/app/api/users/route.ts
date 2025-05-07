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

// GET all users
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id, name, email, role FROM users ORDER BY id ASC'); // Adjust table/column names as needed
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}

// POST a new user
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const hashedPassword = await saltAndHashPassword(password);

    const client = await pool.connect();
    // Ensure your users table has 'username', 'email', 'password', 'role' columns
    // The adapter might create an 'emailVerified' column, you might want to set a default or handle it.
    const result = await client.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );
    client.release();

    // You might want to update the 'accounts' and 'sessions' table if you want the user to be able to log in immediately,
    // or instruct the admin that the user is created and can log in.
    // For simplicity, this example focuses on the users table. The NextAuth adapter handles account linking during actual sign-in.

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    // Check for unique constraint violations (e.g., email already exists)
    if (error.code === '23505') { // PostgreSQL unique violation error code
        return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
  }
}