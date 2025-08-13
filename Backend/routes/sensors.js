const express = require('express');
const router = express.Router();

// Importar todos los controladores
const puertaController = require('../controllers/puertaController');
const ambientalController = require('../controllers/ambientalController');
const objetoController = require('../controllers/objetoController');
const vibracionController = require('../controllers/vibracionController');
const seguridadController = require('../controllers/seguridadController');
const sensorsController = require('../controllers/sensorsController');

// ==================== RUTAS DE PUERTA Y SERVO ====================

// Control de puerta
router.get('/puerta/control', puertaController.getControlPuerta);
router.post('/puerta/control', puertaController.controlarPuerta);
router.get('/puerta/estado', puertaController.getEstadoPuerta);
router.get('/puerta/completo', puertaController.getEstadoCompleto);
router.get('/puerta/historial', puertaController.getHistorialControl);

// ==================== RUTAS AMBIENTALES ====================

// Temperatura
router.get('/temperatura', ambientalController.getTemperatura);
router.get('/temperatura/historial', ambientalController.getTemperaturaHistorial);
router.post('/temperatura', ambientalController.crearDatoTemperatura);

// Humedad
router.get('/humedad', ambientalController.getHumedad);
router.get('/humedad/historial', ambientalController.getHumedadHistorial);
router.post('/humedad', ambientalController.crearDatoHumedad);

// Condiciones ambientales combinadas
router.get('/ambiental', ambientalController.getCondicionesAmbientales);
router.get('/ambiental/chart', ambientalController.getChartDataAmbiental);

// ==================== RUTAS DE OBJETO (ULTRASÓNICO) ====================

router.get('/objeto', objetoController.getDeteccionObjeto);
router.get('/objeto/historial', objetoController.getHistorialDetecciones);
router.get('/objeto/estadisticas', objetoController.getEstadisticasDeteccion);
router.get('/objeto/chart', objetoController.getChartDataDistancias);
router.get('/objeto/alertas', objetoController.getAlertasCambioEstado);
router.post('/objeto', objetoController.crearDatoDistancia);

// ==================== RUTAS DE VIBRACIÓN ====================

router.get('/vibracion', vibracionController.getVibracion);
router.get('/vibracion/historial', vibracionController.getHistorialVibraciones);
router.get('/vibracion/alertas', vibracionController.getAlertasManipulacion);
router.get('/vibracion/estadisticas', vibracionController.getEstadisticasVibracion);
router.get('/vibracion/eventos', vibracionController.getEventosCambioEstado);
router.get('/vibracion/chart', vibracionController.getChartDataVibracion);
router.post('/vibracion', vibracionController.crearDatoVibracion);

// ==================== RUTAS DE SEGURIDAD ====================

router.get('/seguridad/intentos', seguridadController.getIntentosFallidos);
router.post('/seguridad/reset', seguridadController.resetIntentosFallidos);
router.get('/seguridad/historial', seguridadController.getHistorialIntentos);
router.get('/seguridad/alertas', seguridadController.getAlertasSeguridad);
router.get('/seguridad/estadisticas', seguridadController.getEstadisticasSeguridad);
router.get('/seguridad/chart', seguridadController.getChartDataIntentos);
router.post('/seguridad/simular', seguridadController.simularIntentoFallido);

// ==================== RUTAS GENERALES ====================

// Resumen de todos los sensores
router.get('/resumen', sensorsController.getResumenSensores);

// Datos para gráficos individuales
router.get('/chart', sensorsController.getChartData);

// Endpoint principal de información
router.get('/', (req, res) => {
  res.json({ 
    message: 'API de Sensores - Caja Fuerte Inteligente',
    version: '1.0.0',
    feeds_disponibles: [
      'puerta',
      'estado-puerta', 
      'temperatura',
      'humedad',
      'objeto',
      'vibracion',
      'intentos-fallidos'
    ],
    endpoints_principales: {
      puerta: '/api/sensors/puerta',
      ambiental: '/api/sensors/ambiental',
      objeto: '/api/sensors/objeto',
      vibracion: '/api/sensors/vibracion',
      seguridad: '/api/sensors/seguridad',
      resumen: '/api/sensors/resumen'
    }
  });
});

module.exports = router;
