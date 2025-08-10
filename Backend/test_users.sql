-- Script para crear usuarios de prueba
-- Insertar un admin de prueba
INSERT INTO usuarios (nombre, email, password_hash, rol, rfid_tag, pin_code) 
VALUES ('admin', 'admin@correo.com', 'admin123', 'admin', 'RFID123', '1234');

-- Insertar un usuario normal de prueba  
INSERT INTO usuarios (nombre, email, password_hash, rol, rfid_tag, pin_code) 
VALUES ('usuario', 'usuario@correo.com', 'usuario123', 'usuario', 'RFID456', '5678');
