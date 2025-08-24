CREATE DATABASE IF NOT EXISTS luxurystate_db;
USE luxurystate_db;

-- Tabla de usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    user_type ENUM('client', 'agent', 'admin') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de propiedades
CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    property_type ENUM('casa', 'apartamento', 'comercial') NOT NULL,
    status ENUM('venta', 'renta') NOT NULL,
    bedrooms INT,
    bathrooms INT,
    area DECIMAL(10, 2) COMMENT 'Metros cuadrados',
    images TEXT COMMENT 'JSON array de URLs de imágenes',
    agent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES users(id)
);

-- Tabla de contactos
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    user_id INT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT,
    status ENUM('nuevo', 'en_proceso', 'contactado', 'cerrado') DEFAULT 'nuevo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insertar datos de ejemplo
INSERT INTO users (email, password, first_name, last_name, phone, user_type) VALUES
('admin@luxurystate.com', '$2a$10$rOzZUMT2q6W.8c6b6q1kE.D1Q1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1', 'Admin', 'LuxuryState', '555-1234', 'admin'),
('agent@luxurystate.com', '$2a$10$rOzZUMT2q6W.8c6b6q1kE.D1Q1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1', 'María', 'García', '555-5678', 'agent'),
('cliente@ejemplo.com', '$2a$10$rOzZUMT2q6W.8c6b6q1kE.D1Q1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1', 'Juan', 'Pérez', '555-9012', 'client');

INSERT INTO properties (title, description, price, address, city, state, property_type, status, bedrooms, bathrooms, area, images, agent_id) VALUES
('Casa Moderna', 'Hermosa casa moderna en zona residencial', 3850000.00, 'Bosques de las Lomas', 'CDMX', 'Ciudad de México', 'casa', 'venta', 4, 3, 320.00, '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 2),
('Departamento Premium', 'Departamento de lujo en Polanco', 2200000.00, 'Polanco', 'CDMX', 'Ciudad de México', 'apartamento', 'renta', 3, 2, 180.00, '["https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 2),
('Residencia Campestre', 'Amplia residencia con vista al lago', 5750000.00, 'Valle de Bravo', 'EdoMex', 'Estado de México', 'casa', 'venta', 5, 4, 450.00, '["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 2);
