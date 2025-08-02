USE universidad_gestion;

CREATE TABLE estudiantes (
  id_estudiante INT AUTO_INCREMENT PRIMARY KEY, 
  nombre VARCHAR(100) NOT NULL,                
  apellido VARCHAR(100) NOT NULL,              
  correo VARCHAR(100) UNIQUE NOT NULL,         
  fecha_nacimiento DATE,                       
  telefono VARCHAR(15)            
);

DROP TABLE IF EXISTS estudiantes;

-- Agregar una columna que se me olvido
  ALTER TABLE estudiantes ADD COLUMN estado_academico VARCHAR(20);

CREATE TABLE docentes (
  id_docente INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  departamento_academico ENUM('Ciencias', 'Humanidades', 'Ingenieria', 'Educacion') NOT NULL
);


CREATE TABLE cursos (
id_curso INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(50) NOT NULL,
codigo VARCHAR(100) UNIQUE,

id_docente INT NOT NULL,

FOREIGN KEY (id_docente) REFERENCES docentes(id_docente)
);

CREATE TABLE inscripciones (
id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,

id_estudiante INT NOT NULL,
id_curso INT NOT NULL,

FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante),
FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
);

INSERT INTO estudiantes (nombre, apellido, correo, fecha_nacimiento, telefono)
VALUES
('Carlos', 'Ramírez', 'carlos.ramirez@uni.edu', '2000-03-14', '3124567890'),
('María', 'Gómez', 'maria.gomez@uni.edu', '1999-07-22', '3112345678'),
('Luis', 'Fernández', 'luis.fernandez@uni.edu', '2001-01-05', '3109876543');


INSERT INTO docentes (nombre, email, departamento_academico)
VALUES
('Ana Torres', 'ana.torres@uni.edu', 'ingenieria'),
('Jorge Martínez', 'jorge.martinez@uni.edu', 'humanidades'),
('Laura Ríos', 'laura.rios@uni.edu', 'ciencias');

INSERT INTO cursos (nombre, codigo, id_docente)
VALUES
('Matemáticas Básicas', 'MAT101', 1),
('Literatura Universal', 'LIT202', 2),
('Programación I', 'PROG301', 3);


INSERT INTO inscripciones (id_estudiante, id_curso, fecha_inscripcion, calificacion_final)
VALUES
(1, 1, '2024-01-15', 4.2),
(1, 2, '2024-01-17', 3.8),
(2, 1, '2024-01-18', 4.5),
(2, 3, '2024-01-20', 4.0),
(2, 4, '2024-01-25', 3.7),
(3, 2, '2024-01-30', 3.2),
(3, 3, '2024-02-01', 4.8),
(3, 4, '2024-02-05', 4.1);



SELECT 
  cursos.nombre AS nombre_curso,
  cursos.codigo,
  docentes.nombre AS nombre_docente,
  docentes.departamento_academico
FROM cursos
JOIN docentes ON cursos.id_docente = docentes.id_docente;

SELECT 
  estudiantes.nombre AS nombre_estudiante,
  estudiantes.apellido,
  cursos.nombre AS curso
FROM inscripciones
JOIN estudiantes ON inscripciones.id_estudiante = estudiantes.id_estudiante
JOIN cursos ON inscripciones.id_curso = cursos.id_curso;

-- Listar cursos por docentes de mas de 5 años de experiencia
SELECT c.nombre AS curso, d.nombre AS docente, d.experiencia
FROM cursos c
JOIN docentes d ON c.id_docente = d.id_docente
WHERE d.experiencia > 5;

-- Calcular el promedio de calificaciones por curso
SELECT c.nombre AS curso, AVG(i.calificacion_final) AS promedio
FROM inscripciones i
JOIN cursos c ON i.id_curso = c.id_curso
GROUP BY i.id_curso;

-- Obtener los estudiantes que estén inscritos en más de un curso
SELECT e.nombre, COUNT(i.id_curso) AS cursos_inscritos
FROM inscripciones i
JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
GROUP BY i.id_estudiante
HAVING COUNT(i.id_curso) > 1;

-- Crear vista para ver inscripciones
CREATE VIEW vista_inscripciones AS
SELECT 
  e.nombre AS nombre_estudiante,
  e.apellido AS apellido_estudiante,
  c.nombre AS nombre_curso,
  c.codigo,
  d.nombre AS nombre_docente
FROM inscripciones i
JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso
JOIN docentes d ON c.id_docente = d.id_docente;

-- Vitsa estudiantes inscritos
CREATE VIEW estudiantes_inscritos AS
SELECT 
    e.nombre AS estudiante, 
    c.nombre AS curso, 
    i.calificacion_final
FROM inscripciones i
JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso;


-- Crear usuario estudiante con contraseña
CREATE USER 'usuario_estudiante'@'localhost' IDENTIFIED BY 'estudiante123';

-- Dar permiso SOLO de lectura sobre la vista
GRANT SELECT ON universidad_gestion.vista_inscripciones TO 'usuario_estudiante'@'localhost';


-- Crear usuario admin con contraseña
CREATE USER 'usuario_admin'@'localhost' IDENTIFIED BY 'admin123';

-- Darle todos los privilegios sobre la base de datos
GRANT ALL PRIVILEGES ON universidad_gestion.* TO 'usuario_admin'@'localhost';

-- Ver los privilegios del usuario_estudiante
SHOW GRANTS FOR 'usuario_estudiante'@'localhost';

-- Ver los privilegios del usuario_admin
SHOW GRANTS FOR 'usuario_admin'@'localhost';

START TRANSACTION;

INSERT INTO inscripciones (id_estudiante, id_curso, fecha_inscripcion)
VALUES (3, 2, '2025-08-02');

COMMIT;

SELECT * FROM inscripciones;
