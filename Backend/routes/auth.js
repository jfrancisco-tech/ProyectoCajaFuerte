const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// 🧠 RUTAS PARA EL SISTEMA WEB (Angular)
// Solo login tradicional con email y contraseña para acceder a la página

// Login para acceder al panel web
router.post('/login', AuthController.login);

// Verificar si el token es válido
router.get('/verify', AuthController.verifyToken);

// Logout del sistema web
router.post('/logout', authMiddleware, AuthController.logout);

// Obtener perfil del usuario autenticado
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Perfil obtenido exitosamente',
    data: {
      usuario: req.user
    }
  });
});

module.exports = router;
