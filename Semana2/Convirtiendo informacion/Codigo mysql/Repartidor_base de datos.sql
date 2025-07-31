USE repartidor;

CREATE TABLE Cliente (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(50) NOT NULL,
direccion VARCHAR (255) NOT NULL,
telefono VARCHAR (20) NOT NULL
);

CREATE TABLE Repartidor (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(50) NOT NULL,
vehiculo ENUM('moto', 'carro', 'bicicleta', 'monopatin'),
telefono VARCHAR(20) NOT NULL
);

CREATE TABLE Pedido (
id INT AUTO_INCREMENT PRIMARY KEY,
estado ENUM('activo', 'inactivo') NOT NULL,
fecha DATE NOT NULL,
id_cliente INT NOT NULL,
id_repartidor INT NOT NULL,
FOREIGN KEY (id_cliente) REFERENCES Cliente(id),
FOREIGN KEY (id_repartidor) REFERENCES Repartidor(id)
);

