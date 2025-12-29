-- Align Auth.js table columns with @auth/d1-adapter expectations

-- Users
ALTER TABLE users RENAME COLUMN email_verified TO emailVerified;

-- Accounts
ALTER TABLE accounts RENAME COLUMN user_id TO userId;
ALTER TABLE accounts RENAME COLUMN provider_account_id TO providerAccountId;
ALTER TABLE accounts ADD COLUMN oauth_token TEXT;
ALTER TABLE accounts ADD COLUMN oauth_token_secret TEXT;

-- Sessions
ALTER TABLE sessions RENAME COLUMN session_token TO sessionToken;
ALTER TABLE sessions RENAME COLUMN user_id TO userId;
