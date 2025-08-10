const express = require('express');
const router = express.Router();

// Endpoints para dispositivos Adafruit
router.get('/', (req, res) => {
  res.json({ message: 'Endpoint para dispositivos Adafruit' });
});

router.post('/data', (req, res) => {
  res.json({ message: 'Datos recibidos de Adafruit', data: req.body });
});

module.exports = router;
