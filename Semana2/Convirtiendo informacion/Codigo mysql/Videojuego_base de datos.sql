USE videojuegos;

CREATE TABLE Cliente (
id_cliente INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(50) NOT NULL,
direccion VARCHAR(255) NOT NULL
);

CREATE TABLE Videojuegos (
id_videojuego INT AUTO_INCREMENT PRIMARY KEY,
titulo VARCHAR(50) NOT NULL,
plataforma enum('pc', 'xbox', 'playstation', 'nintendo'),
precio DECIMAL(10,2) NOT NULL
);

CREATE TABLE Venta (
id_venta INT AUTO_INCREMENT PRIMARY KEY,
fecha date,
total DECIMAL(10,2) NOT NULL,

id_cliente INT NOT NULL,
id_videojuego INT NOT NULL,

FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
FOREIGN KEY (id_videojuego) REFERENCES videojuegos(id_videojuego)
);