-- Drop existing tables if they exist
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS card_details CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with plain text passwords
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sessions table
CREATE TABLE user_sessions (
  session_id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cards table
CREATE TABLE cards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  assigned_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create card_details table
CREATE TABLE card_details (
  id SERIAL PRIMARY KEY,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  field_name VARCHAR(255) NOT NULL,
  field_value TEXT,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create files table
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default superadmin user with plain text password
INSERT INTO users (name, email, password_hash, role) 
VALUES (
  'Super Admin', 
  'admin@qudmeet.click', 
  'admin@123',
  'superadmin'
);

-- Insert some sample users
INSERT INTO users (name, email, password_hash, role) 
VALUES 
  ('John Admin', 'john@admin.com', 'password123', 'admin'),
  ('Jane User', 'jane@user.com', 'password123', 'user'),
  ('Bob User', 'bob@user.com', 'password123', 'user');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_cards_assigned_user ON cards(assigned_user_id);
CREATE INDEX idx_card_details_card_id ON card_details(card_id);
CREATE INDEX idx_files_card_id ON files(card_id);

-- Insert some sample cards
INSERT INTO cards (title, description, type, assigned_user_id, progress, created_by) 
VALUES 
  ('LinkedIn Profile', 'Complete your LinkedIn professional profile', 'LinkedIn', 3, 25, 1),
  ('TEFL Certificate', 'Upload your TEFL teaching certificate', 'TEFL Certificate', 3, 0, 1),
  ('Bachelor Degree', 'Upload your bachelor degree certificate', 'Bachelor Degree', 4, 75, 1),
  ('University Application', 'Track your university application status', 'University Applied', 4, 50, 1),
  ('Internship Documents', 'Upload internship related documents', 'Internships', 3, 100, 1);
