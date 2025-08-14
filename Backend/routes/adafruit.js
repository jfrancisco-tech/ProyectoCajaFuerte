const express = require('express');
const router = express.Router();
const feedsController = require('../controllers/feedsController');

// ==================== TODOS LOS SERVICIOS REQUERIDOS ====================

// All Feeds - GET /feeds
router.get('/feeds', feedsController.getAllFeeds);

// Get Feed Stats - GET /feeds/stats
router.get('/feeds/stats', feedsController.getFeedsStats);

// Create Feed - POST /feeds
router.post('/feeds', feedsController.createFeed);

// Get Feed - GET /feeds/{feed_key}
router.get('/feeds/:feedKey', feedsController.getFeedDetails);

// Update Feed - PATCH /feeds/{feed_key}
router.patch('/feeds/:feedKey', feedsController.updateFeed);

// Delete Feed - DELETE /feeds/{feed_key}
router.delete('/feeds/:feedKey', feedsController.deleteFeed);

// Get Feed Data - GET /feeds/{feed_key}/data
router.get('/feeds/:feedKey/data', feedsController.getFeedData);

// Create Data - POST /feeds/{feed_key}/data
router.post('/feeds/:feedKey/data', feedsController.createFeedData);

// Update Data Point - PATCH /feeds/{feed_key}/data/{data_id}
router.patch('/feeds/:feedKey/data/:dataId', feedsController.updateDataPoint);

// Delete Data Point - DELETE /feeds/{feed_key}/data/{data_id}
router.delete('/feeds/:feedKey/data/:dataId', feedsController.deleteDataPoint);

// ==================== ENDPOINTS LEGACY (mantener compatibilidad) ====================

// Endpoints para dispositivos Adafruit (mantener compatibilidad)
router.get('/', (req, res) => {
  res.json({ 
    message: 'Adafruit IO API Gateway',
    services: [
      'GET /feeds - All Feeds',
      'GET /feeds/stats - Feed Statistics', 
      'POST /feeds - Create Feed',
      'GET /feeds/{key} - Get Feed',
      'PATCH /feeds/{key} - Update Feed',
      'DELETE /feeds/{key} - Delete Feed',
      'GET /feeds/{key}/data - Get Feed Data',
      'POST /feeds/{key}/data - Create Data',
      'PATCH /feeds/{key}/data/{id} - Update Data Point',
      'DELETE /feeds/{key}/data/{id} - Delete Data Point'
    ]
  });
});

router.post('/data', (req, res) => {
  res.json({ message: 'Datos recibidos de Adafruit', data: req.body });
});

module.exports = router;
