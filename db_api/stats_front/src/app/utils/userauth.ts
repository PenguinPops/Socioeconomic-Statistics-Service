// app/utils/userauth.ts (or wherever getUserFromDb is located)
import { Pool } from 'pg';
import { comparePassword } from '@/app/utils/snhpass'; // Make sure this path is correct

const pool = new Pool({ // Reuse or create a new pool instance
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  // ... other pool options
});

export const getUserFromDb = async (email: string) => {
  if (!email) { // Password hash comparison is tricky here, better to do it in authorize
    throw new Error("Email is required");
  }

  const client = await pool.connect();
  try {
    // Make sure your 'users' table has 'id', 'email', 'password', 'name' (or 'username'), 'role'
    const result = await client.query('SELECT id, email, password, name, role FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user) {
      // The 'authorize' function in auth.ts now receives the plain password.
      // So, we'll compare the plain password (from credentials) with the stored hash (user.password).
      // This means the providedPasswordHashForComparison parameter is no longer directly used here
      // if you adjust the authorize function as recommended below.

      // For now, assuming authorize still passes a hash (though not ideal):
      // const isMatch = await comparePassword(user.password, providedPasswordHashForComparison); // This is comparing stored hash with a newly generated hash of input
                                                                                            // This is NOT correct. You should compare plain input with stored hash.

      // We will adjust 'authorize' to pass the plain password, so this function's role simplifies.
      // This function should primarily fetch the user by email. Password comparison will happen in 'authorize'.
      return {
        id: user.id.toString(), // Ensure ID is a string for NextAuth
        email: user.email,
        name: user.name, // Or user.name, depending on your DB column
        password: user.password, // Return the stored hash for authorize to compare
        role: user.role,
      };
    }
    return null;
  } finally {
    client.release();
  }
};