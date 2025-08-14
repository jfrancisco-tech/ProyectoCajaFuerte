-- Script para crear usuario admin Valeria
-- Insertar usuario admin Valeria
INSERT INTO usuarios (nombre, email, password_hash, rol, rfid_tag, pin_code) 
VALUES ('Valeria', 'valeria@correo.com', 'valeria123', 'admin', 'RFID_VALERIA', '2024');

-- Verificar que se insertó correctamente
SELECT * FROM usuarios WHERE email = 'valeria@correo.com';
