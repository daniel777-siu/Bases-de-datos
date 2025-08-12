USE alojamiento;

CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL
);

CREATE TABLE servidores (
  id_servidor INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  tipo VARCHAR(50),
  precio_mensual DECIMAL(10,2),
  disponible BOOLEAN
);

CREATE TABLE ordenes (
  id_orden INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  fecha DATE,
  estado ENUM('pendiente', 'pagado', 'cancelado'),
  total DECIMAL(10,2),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE orden_detalles (
  id_orden INT,
  id_servidor INT,
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  PRIMARY KEY (id_orden, id_servidor),
  FOREIGN KEY (id_orden) REFERENCES ordenes(id_orden),
  FOREIGN KEY (id_servidor) REFERENCES servidores(id_servidor)
);

CREATE TABLE pagos (
  id_pago INT AUTO_INCREMENT PRIMARY KEY,
  id_orden INT,
  estado VARCHAR(50),
  metodo VARCHAR(50),
  fecha_pago DATE,
  FOREIGN KEY (id_orden) REFERENCES ordenes(id_orden)
);

INSERT INTO usuarios (nombre, email, contraseña, rol)
VALUES ('Carlos Pérez', 'carlos@example.com', '123456', 'cliente');

INSERT INTO servidores (nombre, tipo, precio_mensual, disponible)
VALUES ('VPS Básico', 'VPS', 20.00, TRUE);

SELECT * FROM usuarios;
SELECT * FROM servidores WHERE disponible = TRUE;

UPDATE usuarios SET nombre = 'Carlos M. Pérez' WHERE id_usuario = 1;

DELETE FROM servidores WHERE id_servidor = 1;


