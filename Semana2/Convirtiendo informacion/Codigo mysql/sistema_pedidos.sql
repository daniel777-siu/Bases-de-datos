USE sistema_reservas;

CREATE TABLE Cliente (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  correo VARCHAR(100) NOT NULL
);

CREATE TABLE Destino (
  id_destino INT AUTO_INCREMENT PRIMARY KEY,
  fecha_salida DATE NOT NULL,
  ciudad VARCHAR(50) NOT NULL,
  direccion VARCHAR(100) NOT NULL
);

CREATE TABLE paquete (
  id_paquete INT AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(50) NOT NULL,
 precio DECIMAL(10,2) NOT NULL,
 id_destino INT NOT NULL,
  FOREIGN KEY (id_destino) REFERENCES destino(id_destino)
);

CREATE TABLE reserva (
  id_reserva INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  estado VARCHAR(20),

  id_cliente INT NOT NULL,
  id_paquete INT NOT NULL,
  id_destino INT NOT NULL,

  FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
  FOREIGN KEY (id_paquete) REFERENCES paquete(id_paquete),
  FOREIGN KEY (id_destino) REFERENCES destino(id_destino)
);

