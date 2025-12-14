-- CREAR BASE DE DATOS
create database maison_du_chef;
use maison_du_chef;

-- TABLA DE ROLES
create table roles (
    idRol int auto_increment primary key,
    nombreRol varchar(50) not null
);

-- TABLA DE USUARIOS
create table usuarios (
    idUsuario int auto_increment primary key,
    nombre varchar(100) not null,
    correo varchar(100) unique not null,
    contrasena varchar(100) not null,
    id_rol int not null,
    foreign key (id_rol) references roles(idRol)
);

-- TABLA DE RESTAURANTES
create table restaurantes (
    idRestaurante int auto_increment primary key,
    nombreRestaurante varchar(100) not null,
    direccion varchar(200) not null,
    telefono varchar(20) not null,
    id_usuario int not null,
    foreign key (id_usuario) references usuarios(idUsuario)
);

-- TABLA DE CATEGORIAS
create table categorias (
    idCategoria int auto_increment primary key,
    nombreCategoria varchar(50) not null
);

-- TABLA DE PRODUCTOS
create table productos (
    idProducto int auto_increment primary key,
    nombreProducto varchar(100) not null,
    descripcion text,
    precio decimal(10,2) not null,
    disponible enum('Si', 'No') default 'Si',
    id_restaurante int not null,
    id_categoria int not null,
    foreign key (id_restaurante) references restaurantes(idRestaurante),
    foreign key (id_categoria) references categorias(idCategoria)
);

-- TABLA DE PEDIDOS
create table pedidos (
    idPedido int auto_increment primary key,		
    id_usuario int not null,
    id_domiciliario int,
    direccion varchar(200) not null,
    fechaPedido datetime not null,
    estado varchar(50) default 'pendiente',
    foreign key (id_usuario) references usuarios(idUsuario),
    foreign key (id_domiciliario) references usuarios(idUsuario)
);

-- TABLA DE DETALLES DE PEDIDO
create table detalles_pedido (
    idDetalle int auto_increment primary key,
    id_pedido int not null,
    id_producto int not null,
    cantidad int not null,
    foreign key (id_pedido) references pedidos(idPedido),
    foreign key (id_producto) references productos(idProducto)
);


-- TABLA DE PAGOS
create table pagos (
    idPago int auto_increment primary key,
    id_pedido int not null,
    metodo enum('efectivo', 'nequi', 'daviplata') not null default 'efectivo',
    monto decimal(10,2) not null,
    fecha datetime not null,
    foreign key (id_pedido) references pedidos(idPedido)
);

-- TABLA DE RESEÑAS
create table resenas (
    idResena int auto_increment primary key,
    id_usuario int not null,
    id_producto int not null,
    comentario text,
    calificacion int check (calificacion between 1 and 5),
    fecha datetime not null,
    foreign key (id_usuario) references usuarios(idUsuario),
    foreign key (id_producto) references productos(idProducto)
);
