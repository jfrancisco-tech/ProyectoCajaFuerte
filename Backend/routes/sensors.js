const express = require('express');
const router = express.Router();

// Obtener datos de todos los sensores
router.get('/', (req, res) => {
  res.json({ message: 'Endpoint para obtener datos de sensores' });
});

// Obtener datos de un sensor específico
router.get('/:sensorId', (req, res) => {
  const { sensorId } = req.params;
  res.json({ 
    message: `Datos del sensor ${sensorId}`,
    sensorId 
  });
});

module.exports = router;
