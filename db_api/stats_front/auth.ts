// auth.ts (relevant part of authorize)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
// import { saltAndHashPassword } from "@/app/utils/snhpass"; // No longer needed here for hashing credential.password
import { comparePassword } from "@/app/utils/snhpass"; // For comparing
import { getUserFromDb } from "@/app/utils/userauth"; // Your updated function
import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PostgresAdapter(pool),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const email = credentials.email as string;
          const plainPassword = credentials.password as string;

          // 1. Fetch user by email from the database
          const userFromDb = await getUserFromDb(email); // Pass only email

          if (!userFromDb || !userFromDb.password) {
            console.log("User not found or password not set in DB");
            return null; // User not found
          }

          // 2. Compare the provided plain password with the stored hashed password
          const passwordsMatch = await comparePassword(plainPassword, userFromDb.password);

          if (!passwordsMatch) {
            console.log("Password mismatch");
            return null; // Invalid credentials
          }

          console.log("User authenticated:", userFromDb.email);
          return { // Return the user object expected by NextAuth
            id: userFromDb.id.toString(), // Ensure ID is a string
            email: userFromDb.email,
            name: userFromDb.name, // Ensure this matches your DB column (username or name)
            role: userFromDb.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null; // Return null to indicate failure
        }
      },
    }),
  ],
  callbacks: { // Callbacks look good
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id; // Also good to add id to token
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }: { session: any; token: any }) => {
      if (session.user) {
        session.user.id = token.id as string; // Ensure id is a string
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt", // Explicitly set JWT strategy
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is set
  useSecureCookies: process.env.NODE_ENV === "production", // Secure cookies in production
});