const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

class AuthController {
  
  // Login para admin y usuario normal
  static async login(req, res) {
    try {
      const { usuario, password } = req.body;

      if (!usuario || !password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario y contraseña son requeridos'
        });
      }

      // Conectar a la base de datos
      const connection = await mysql.createConnection(dbConfig);

      // Buscar usuario por email o nombre de usuario
      const [rows] = await connection.execute(
        'SELECT id, nombre, email, password_hash, rol, rfid_tag, pin_code FROM usuarios WHERE email = ? OR nombre = ?',
        [usuario, usuario]
      );

      await connection.end();

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      const user = rows[0];

      // Verificar contraseña (comparación directa porque están en texto plano)
      const isValidPassword = password === user.password_hash;

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generar JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          rol: user.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Registrar en auditoría
      await AuthController.registrarAuditoria(user.id, 'inicio_sesion', {
        email: user.email,
        rol: user.rol,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id: user.id,
          usuario: user.nombre,
          email: user.email,
          rol: user.rol
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Login alternativo con RFID
  static async loginRFID(req, res) {
    try {
      const { rfid_tag } = req.body;

      if (!rfid_tag) {
        return res.status(400).json({
          success: false,
          message: 'Tag RFID es requerido'
        });
      }

      const connection = await mysql.createConnection(dbConfig);

      const [rows] = await connection.execute(
        'SELECT id, nombre, email, rol, rfid_tag, pin_code FROM usuarios WHERE rfid_tag = ?',
        [rfid_tag]
      );

      await connection.end();

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Tag RFID no autorizado'
        });
      }

      const usuario = rows[0];

      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      await AuthController.registrarAuditoria(usuario.id, 'acceso_rfid', {
        rfid_tag: usuario.rfid_tag,
        rol: usuario.rol,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Acceso RFID exitoso',
        data: {
          token,
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
          }
        }
      });

    } catch (error) {
      console.error('Error en login RFID:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Login alternativo con PIN
  static async loginPIN(req, res) {
    try {
      const { pin_code } = req.body;

      if (!pin_code) {
        return res.status(400).json({
          success: false,
          message: 'PIN es requerido'
        });
      }

      const connection = await mysql.createConnection(dbConfig);

      const [rows] = await connection.execute(
        'SELECT id, nombre, email, rol, rfid_tag, pin_code FROM usuarios WHERE pin_code = ?',
        [pin_code]
      );

      await connection.end();

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'PIN incorrecto'
        });
      }

      const usuario = rows[0];

      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      await AuthController.registrarAuditoria(usuario.id, 'acceso_pin', {
        pin_usado: pin_code,
        rol: usuario.rol,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Acceso PIN exitoso',
        data: {
          token,
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
          }
        }
      });

    } catch (error) {
      console.error('Error en login PIN:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Verificar token
  static async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token no proporcionado'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      res.json({
        success: true,
        message: 'Token válido',
        data: decoded
      });

    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: error.message
      });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        await AuthController.registrarAuditoria(decoded.id, 'cierre_sesion', {
          email: decoded.email,
          rol: decoded.rol,
          ip: req.ip
        });
      }

      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });

    } catch (error) {
      res.json({
        success: true,
        message: 'Sesión cerrada'
      });
    }
  }

  // Función auxiliar para registrar en auditoría
  static async registrarAuditoria(usuario_id, accion, detalles) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      
      await connection.execute(
        'INSERT INTO auditoria (usuario_id, accion, detalles) VALUES (?, ?, ?)',
        [usuario_id, accion, JSON.stringify(detalles)]
      );
      
      await connection.end();
    } catch (error) {
      console.error('Error registrando auditoría:', error);
    }
  }
}

module.exports = AuthController;
