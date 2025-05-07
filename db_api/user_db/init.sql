CREATE TABLE IF NOT EXISTS verification_token
(
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
 
  PRIMARY KEY (identifier, token)
);
 
CREATE TABLE IF NOT EXISTS accounts
(
  id SERIAL,
  "userId" INTEGER NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
 
  PRIMARY KEY (id)
);
 
CREATE TABLE IF NOT EXISTS sessions
(
  id SERIAL,
  "userId" INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,
 
  PRIMARY KEY (id)
);
 
CREATE TABLE IF NOT EXISTS users
(
  id SERIAL,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  role VARCHAR(255),
  password TEXT,
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
 
  PRIMARY KEY (id)
);

INSERT INTO public.users (name, email, role, "emailVerified", image, password)
VALUES (
  'Admin',
  'admin@test.com',
  'admin',
  CURRENT_TIMESTAMP,
  'https://example.com/images/a.jpg',
  '$2y$10$cUF1ulqE5LEwzuH0SMwrxemYN4lPdR71QIPlPFpf59WdWinHeFv9m'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (name, email, role, "emailVerified", image, password)
VALUES (
   'User',
   'user@test.com',
   'user',
   CURRENT_TIMESTAMP,
   'https://example.com/images/u.jpg',
   '$2y$10$cUF1ulqE5LEwzuH0SMwrxemYN4lPdR71QIPlPFpf59WdWinHeFv9m'
)
ON CONFLICT (email) DO NOTHING;