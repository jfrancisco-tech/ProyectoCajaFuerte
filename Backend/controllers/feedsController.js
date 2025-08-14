const adafruitService = require('../services/adafruitService');

// Obtener todos los feeds de Adafruit IO
exports.getAllFeeds = async (req, res) => {
  try {
    const result = await adafruitService.getAllFeeds();
    
    if (result.success) {
      // Formatear los datos de los feeds para el frontend
      const feedsFormatted = result.data.map(feed => ({
        id: feed.id,
        name: feed.name,
        key: feed.key,
        description: feed.description || 'Sin descripción',
        last_value: feed.last_value || 'N/A',
        created_at: feed.created_at,
        updated_at: feed.updated_at,
        unit_type: feed.unit_type || '',
        unit_symbol: feed.unit_symbol || '',
        history: feed.history || false,
        visibility: feed.visibility || 'private',
        license: feed.license || ''
      }));

      res.json({
        success: true,
        feeds: feedsFormatted,
        total: feedsFormatted.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los feeds',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en getAllFeeds:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener información detallada de un feed específico
exports.getFeedDetails = async (req, res) => {
  try {
    const { feedKey } = req.params;
    
    const feedResult = await adafruitService.getFeed(feedKey);
    
    if (feedResult.success) {
      // Obtener datos recientes del feed
      const dataResult = await adafruitService.getFeedData(feedKey, { limit: 10 });
      
      res.json({
        success: true,
        feed: feedResult.data,
        recent_data: dataResult.success ? dataResult.data : [],
        data_count: dataResult.success ? dataResult.data.length : 0
      });
    } else {
      res.status(404).json({
        success: false,
        message: `Feed '${feedKey}' no encontrado`,
        error: feedResult.error
      });
    }
  } catch (error) {
    console.error('Error en getFeedDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener datos históricos de un feed
exports.getFeedData = async (req, res) => {
  try {
    const { feedKey } = req.params;
    const { limit = 50, start_time, end_time } = req.query;
    
    const filters = { limit: parseInt(limit) };
    if (start_time) filters.start_time = start_time;
    if (end_time) filters.end_time = end_time;
    
    const result = await adafruitService.getFeedData(feedKey, filters);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.data.length,
        feed_key: feedKey
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Error al obtener datos del feed '${feedKey}'`,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en getFeedData:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nuevo dato en un feed
exports.createFeedData = async (req, res) => {
  try {
    const { feedKey } = req.params;
    const { value } = req.body;
    
    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: 'El valor es requerido'
      });
    }
    
    const result = await adafruitService.createData(feedKey, value);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Dato creado en feed '${feedKey}'`,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Error al crear dato en feed '${feedKey}'`,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en createFeedData:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ==================== SERVICIOS FALTANTES AGREGADOS ====================

// Update Data Point - PATCH /feeds/{feed_key}/data/{data_id}
exports.updateDataPoint = async (req, res) => {
  try {
    const { feedKey, dataId } = req.params;
    const { value } = req.body;
    
    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: 'El valor es requerido'
      });
    }
    
    const result = await adafruitService.updateDataPoint(feedKey, dataId, value);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Dato ${dataId} actualizado en feed '${feedKey}'`,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Error al actualizar dato ${dataId} en feed '${feedKey}'`,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en updateDataPoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Delete Data Point - DELETE /feeds/{feed_key}/data/{data_id}
exports.deleteDataPoint = async (req, res) => {
  try {
    const { feedKey, dataId } = req.params;
    
    const result = await adafruitService.deleteDataPoint(feedKey, dataId);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Dato ${dataId} eliminado del feed '${feedKey}'`
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Error al eliminar dato ${dataId} del feed '${feedKey}'`,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en deleteDataPoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Create Feed - POST /feeds
exports.createFeed = async (req, res) => {
  try {
    const feedData = req.body || {};

    // Validar nombre
    if (!feedData.name || String(feedData.name).trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del feed es requerido'
      });
    }

    // Generar clave (key) si no viene, basada en el nombre
    const normalizeKey = (text) => {
      return String(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quitar acentos
        .replace(/\s+/g, '-') // espacios a guiones
        .replace(/[^a-z0-9-_]/g, '') // solo minúsculas, números, - y _
        .replace(/-{2,}/g, '-') // colapsar guiones
        .replace(/^[-_]+|[-_]+$/g, ''); // recortar guiones/underscores extremos
    };

    const key = feedData.key && String(feedData.key).trim().length > 0
      ? normalizeKey(feedData.key)
      : normalizeKey(feedData.name);

    if (!key || key.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo generar una clave válida para el feed'
      });
    }

    // Construir payload mínimo para Adafruit IO
    const payload = {
      name: String(feedData.name).trim(),
      key,
      description: (feedData.description ? String(feedData.description).trim() : '')
    };

    const result = await adafruitService.createFeed(payload);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: `Feed '${key}' creado exitosamente`,
        feed: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Error al crear feed '${key}'`,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en createFeed:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Update Feed - PATCH /feeds/{feed_key}
exports.updateFeed = async (req, res) => {
  try {
    const { feedKey } = req.params;
    const feedData = req.body;
    
    const result = await adafruitService.updateFeed(feedKey, feedData);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Feed '${feedKey}' actualizado exitosamente`,
        feed: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Error al actualizar feed '${feedKey}'`,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en updateFeed:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Delete Feed - DELETE /feeds/{feed_key}
exports.deleteFeed = async (req, res) => {
  try {
    const { feedKey } = req.params;
    
    const result = await adafruitService.deleteFeed(feedKey);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Feed '${feedKey}' eliminado exitosamente`
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Error al eliminar feed '${feedKey}'`,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en deleteFeed:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de todos los feeds
exports.getFeedsStats = async (req, res) => {
  try {
    const feedsResult = await adafruitService.getAllFeeds();
    
    if (feedsResult.success) {
      const stats = {
        total_feeds: feedsResult.data.length,
        active_feeds: 0,
        private_feeds: 0,
        public_feeds: 0,
        feeds_with_data: 0,
        last_updated: null
      };
      
      // Calcular estadísticas
      feedsResult.data.forEach(feed => {
        if (feed.last_value !== null && feed.last_value !== undefined) {
          stats.active_feeds++;
          stats.feeds_with_data++;
        }
        
        if (feed.visibility === 'private') {
          stats.private_feeds++;
        } else {
          stats.public_feeds++;
        }
        
        // Encontrar la última actualización más reciente
        if (feed.updated_at) {
          const feedDate = new Date(feed.updated_at);
          if (!stats.last_updated || feedDate > new Date(stats.last_updated)) {
            stats.last_updated = feed.updated_at;
          }
        }
      });
      
      res.json({
        success: true,
        stats: stats,
        feeds_summary: feedsResult.data.map(feed => ({
          key: feed.key,
          name: feed.name,
          last_value: feed.last_value,
          updated_at: feed.updated_at
        }))
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas de feeds',
        error: feedsResult.error
      });
    }
  } catch (error) {
    console.error('Error en getFeedsStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
