-- Crear base de datos
CREATE DATABASE red_social;
USE red_social;

-- Crear tabla de usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL
);

-- Insertar datos en usuarios
INSERT INTO usuarios (username, email, password) VALUES
('LauraCode', 'laura@example.com', '1234'),
('JuanDev', 'juan@example.com', 'abcd'),
('AnaData', 'ana@example.com', 'qwerty');

-- Crear tabla de publicaciones (posts)
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(100),
  body TEXT,
  status VARCHAR(20),
  created_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

-- Insertar datos en posts
INSERT INTO posts (user_id, title, body, status, created_at) VALUES
(1, 'Mi segundo post', 'Estoy aprendiendo SQL con Workbench', 'publicado', '2025-07-27 12:00:00'),
(2, '¡Hola mundo!', 'Este es mi primer post', 'publicado', '2025-07-27 13:15:00'),
(3, 'Consejos de programación', 'Hoy comparto tips de bases de datos.', 'borrador', '2025-07-27 14:20:00');

-- Ver todos los posts con el nombre del autor
SELECT 
  posts.title,
  posts.body,
  posts.status,
  posts.created_at,
  usuarios.username AS autor
FROM posts
JOIN usuarios ON posts.user_id = usuarios.id;

-- Ver los posts solamente de LauraCode
SELECT 
  posts.title,
  posts.body,
  posts.status,
  posts.created_at,
  usuarios.username AS autor
FROM posts
JOIN usuarios ON posts.user_id = usuarios.id
WHERE usuarios.username = 'LauraCode';
