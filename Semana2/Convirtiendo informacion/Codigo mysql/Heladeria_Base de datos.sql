USE heladeria_bd;

CREATE TABLE Cliente(
id_cliente INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(50) NOT NULL,
telefono VARCHAR(20) NOT NULL,
email VARCHAR(100) NOT NULL
);

CREATE TABLE Producto(
id_producto INT AUTO_INCREMENT PRIMARY KEY,
tipo VARCHAR(50) NOT NULL,
sabor VARCHAR(50) NOT NULL,
tamaño ENUM('chiquito', 'grande'),
precio_base DECIMAL(10,2) NOT NULL
);

CREATE TABLE Pedido(
id_pedido INT AUTO_INCREMENT PRIMARY KEY,
fecha_pedido DATE NOT NULL,
fecha_entrega DATE NOT NULL,

id_cliente INT NOT NULL,

FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE Pedido_producto(
cantidad INT NOT NULL,
observaciones TEXT NOT NULL,

id_pedido INT NOT NULL,
id_producto INT NOT NULL,

PRIMARY KEY (id_pedido, id_producto),
FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido),
FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
)