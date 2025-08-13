// Controlador específico para la puerta y servo
const adafruitService = require('../services/adafruitService');

class PuertaController {
  
  // Obtener estado actual del control de puerta (feed: puerta)
  async getControlPuerta(req, res) {
    try {
      const result = await adafruitService.getLastData('puerta');
      
      if (result.success) {
        const estado = result.data.value === '1' ? 'abierta' : 'cerrada';
        res.json({
          success: true,
          data: {
            ...result.data,
            estado_legible: estado,
            comando_actual: result.data.value === '1' ? 'abrir' : 'cerrar',
            timestamp: result.data.created_at
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo control de puerta',
          details: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  // Controlar puerta (enviar comando abrir/cerrar)
  async controlarPuerta(req, res) {
    try {
      const { accion } = req.body; // 'abrir' o 'cerrar'
      
      if (!accion || !['abrir', 'cerrar'].includes(accion)) {
        return res.status(400).json({
          success: false,
          error: 'Acción inválida. Use "abrir" o "cerrar"'
        });
      }

      const valor = accion === 'abrir' ? '1' : '0';
      const result = await adafruitService.createData('puerta', valor);
      
      if (result.success) {
        res.json({
          success: true,
          message: `Comando ${accion} enviado al ESP32`,
          accion: accion,
          valor_enviado: valor,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: `Error enviando comando ${accion}`,
          details: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  // Obtener estado real de la puerta (feed: estado-puerta)
  async getEstadoPuerta(req, res) {
    try {
      const result = await adafruitService.getLastData('estado-puerta');
      
      if (result.success) {
        const abierta = result.data.value === '1';
        res.json({
          success: true,
          data: {
            ...result.data,
            abierta: abierta,
            estado: abierta ? 'abierta' : 'cerrada',
            servo_posicion: abierta ? '0° (abierta)' : '90° (cerrada)',
            timestamp: result.data.created_at
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo estado real de puerta',
          details: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  // Obtener ambos estados (control y real)
  async getEstadoCompleto(req, res) {
    try {
      const [controlResult, estadoResult] = await Promise.all([
        adafruitService.getLastData('puerta'),
        adafruitService.getLastData('estado-puerta')
      ]);

      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        control: null,
        estado_real: null
      };

      if (controlResult.success) {
        response.control = {
          valor: controlResult.data.value,
          comando: controlResult.data.value === '1' ? 'abrir' : 'cerrar',
          timestamp: controlResult.data.created_at
        };
      }

      if (estadoResult.success) {
        const abierta = estadoResult.data.value === '1';
        response.estado_real = {
          abierta: abierta,
          estado: abierta ? 'abierta' : 'cerrada',
          timestamp: estadoResult.data.created_at
        };
      }

      // Verificar sincronización
      if (response.control && response.estado_real) {
        response.sincronizado = response.control.valor === estadoResult.data.value;
      }

      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estado completo',
        details: error.message
      });
    }
  }

  // Historial del control de puerta
  async getHistorialControl(req, res) {
    try {
      const { limit = 20, start_time, end_time } = req.query;
      
      const result = await adafruitService.getFeedData('puerta', {
        limit: parseInt(limit),
        start_time,
        end_time
      });
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data.map(item => ({
            ...item,
            comando: item.value === '1' ? 'abrir' : 'cerrar',
            timestamp: item.created_at
          }))
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo historial de control',
          details: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }
}

module.exports = new PuertaController();
