-- ATS Resume Checkerligence System Database Schema

CREATE DATABASE IF NOT EXISTS ats_resume_db;
USE ats_resume_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  tier ENUM('free', 'pro') DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500),
  file_size INT,
  file_type VARCHAR(100),
  parsed_data JSON,
  industry VARCHAR(100),
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id VARCHAR(36) PRIMARY KEY,
  resume_id VARCHAR(36) NOT NULL,
  overall_score INT NOT NULL,
  formatting_score INT DEFAULT 0,
  keywords_score INT DEFAULT 0,
  impact_score INT DEFAULT 0,
  skills_alignment_score INT DEFAULT 0,
  breakdown_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- Suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id VARCHAR(36) PRIMARY KEY,
  resume_id VARCHAR(36) NOT NULL,
  category VARCHAR(100),
  priority ENUM('Critical', 'High', 'Medium', 'Low') DEFAULT 'Medium',
  suggestion_text TEXT NOT NULL,
  impact VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- Job matches table
CREATE TABLE IF NOT EXISTS job_matches (
  id VARCHAR(36) PRIMARY KEY,
  resume_id VARCHAR(36) NOT NULL,
  job_description TEXT NOT NULL,
  job_title VARCHAR(255),
  match_score INT DEFAULT 0,
  matched_keywords JSON,
  missing_keywords JSON,
  analysis_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_history (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  resume_id VARCHAR(36),
  role ENUM('user', 'assistant') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
);

-- Insert default anonymous user
INSERT IGNORE INTO users (id, email, tier) VALUES ('anonymous', 'anonymous@ats.local', 'free');
