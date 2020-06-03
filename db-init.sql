CREATE DATABASE IF NOT EXISTS ramen_pocket
  CHARACTER SET = 'utf8mb4'
  COLLATE = 'utf8mb4_bin';

USE ramen_pocket;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  points INT NOT NULL DEFAULT 0,
  token VARCHAR(2047) NULL,
  tokenExpire DATETIME NULL,
  expire DATETIME NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS stores (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  isDeleted BOOLEAN NOT NULL,
  address VARCHAR(255) NOT NULL,
  latitude DOUBLE NOT NULL,
  longtitude DOUBLE NOT NULL,
  rate DOUBLE NOT NULL DEFAULT 2.5,
  featuredImage VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS images (
  url VARCHAR(767) NOT NULL,
  storeId INT NOT NULL,
  PRIMARY KEY (url, storeId),
  FOREIGN KEY (storeId) REFERENCES stores (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS businessHours (
  day TINYINT NOT NULL,
  storeId INT NOT NULL,
  off BOOLEAN NOT NULL,
  begin TINYINT NOT NULL,
  end TINYINT NOT NULL,
  PRIMARY KEY (day, storeId),
  FOREIGN KEY (storeId) REFERENCES stores (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS courses (
  name VARCHAR(255) NOT NULL,
  storeId INT NOT NULL,
  price INT NOT NULL,
  isRamen BOOLEAN NOT NULL,
  PRIMARY KEY (name, storeId),
  FOREIGN KEY (storeId) REFERENCES stores (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS collections (
  userId VARCHAR(255) NOT NULL,
  storeId INT NOT NULL,
  PRIMARY KEY (userId, storeId),
  FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (storeId) REFERENCES stores (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedules (
  id INT NOT NULL AUTO_INCREMENT,
  userId VARCHAR(255) NOT NULL,
  storeId INT NOT NULL,
  date DATETIME NOT NULL,
  PRIMARY KEY (id, userId, storeId),
  FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (storeId) REFERENCES stores (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
  id INT NOT NULL AUTO_INCREMENT,
  userId VARCHAR(255) NOT NULL,
  storeId INT NOT NULL,
  content TEXT NOT NULL,
  isDeleted BOOLEAN NOT NULL,
  rate TINYINT NOT NULL,
  publishedAt DATETIME NOT NULL,
  PRIMARY KEY (id, userId, storeId),
  FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (storeId) REFERENCES stores (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS commentedCourses (
  name VARCHAR(255) NOT NULL,
  commentId INT NOT NULL,
  PRIMARY KEY (name, commentId),
  FOREIGN KEY (commentId) REFERENCES comments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
  id INT NOT NULL,
  name VARCHAR(255),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS storeTags (
  storeId INT NOT NULL,
  tagId INT NOT NULL,
  PRIMARY KEY (storeId, tagId),
  FOREIGN KEY (storeId) REFERENCES stores (id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags (id) ON DELETE CASCADE
);
