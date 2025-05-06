// app/actions/auth.js
'use server';

import { signOut } from '@/../auth'; // Your auth config

export async function logout() {
  await signOut({ redirectTo: '/login' });
}