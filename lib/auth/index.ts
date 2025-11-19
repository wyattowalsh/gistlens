/**
 * Auth.js (NextAuth.js v5) Exports
 * 
 * Official documentation: https://authjs.dev
 */

import NextAuth from 'next-auth';
import { authConfig } from './config';

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export { authConfig };
