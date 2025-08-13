// Controlador para sensor de vibración (tilt switch)
const adafruitService = require('../services/adafruitService');

class VibracionController {
  
  // Obtener último estado de vibración
  async getVibracion(req, res) {
    try {
      const result = await adafruitService.getLastData('vibracion');
      
      if (result.success) {
        const vibrando = result.data.value === '1';
        
        res.json({
          success: true,
          sensor: 'tilt_switch',
          data: {
            ...result.data,
            vibracion_detectada: vibrando,
            estado: vibrando ? 'manipulacion_detectada' : 'estable',
            nivel_alerta: vibrando ? 'alto' : 'normal',
            descripcion: vibrando ? 
              'Se detectó movimiento o manipulación de la caja fuerte' : 
              'La caja fuerte está estable',
            timestamp: result.data.created_at
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo datos de vibración',
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

  // Historial de detecciones de vibración
  async getHistorialVibraciones(req, res) {
    try {
      const { limit = 50, start_time, end_time } = req.query;
      
      const result = await adafruitService.getFeedData('vibracion', {
        limit: parseInt(limit),
        start_time,
        end_time
      });
      
      if (result.success) {
        res.json({
          success: true,
          sensor: 'tilt_switch',
          data: result.data.map(item => {
            const vibrando = item.value === '1';
            
            return {
              ...item,
              vibracion_detectada: vibrando,
              estado: vibrando ? 'manipulacion_detectada' : 'estable',
              timestamp: item.created_at
            };
          })
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo historial de vibraciones',
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

  // Alertas de manipulación
  async getAlertasManipulacion(req, res) {
    try {
      const { limit = 30 } = req.query;
      
      const result = await adafruitService.getFeedData('vibracion', {
        limit: parseInt(limit)
      });
      
      if (result.success) {
        // Filtrar solo las detecciones de vibración (valor = 1)
        const alertas = result.data
          .filter(item => item.value === '1')
          .map(item => ({
            id: item.id,
            timestamp: item.created_at,
            tipo: 'manipulacion_detectada',
            nivel: 'alto',
            mensaje: 'Se detectó movimiento o manipulación de la caja fuerte',
            fecha_legible: new Date(item.created_at).toLocaleString()
          }));

        res.json({
          success: true,
          alertas: alertas,
          total_alertas: alertas.length,
          periodo_consultado: limit
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo alertas de manipulación',
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

  // Estadísticas de vibraciones
  async getEstadisticasVibracion(req, res) {
    try {
      const { limit = 100 } = req.query;
      
      const result = await adafruitService.getFeedData('vibracion', {
        limit: parseInt(limit)
      });
      
      if (result.success) {
        const totalLecturas = result.data.length;
        const vibracionesDetectadas = result.data.filter(item => item.value === '1').length;
        const estadoEstable = totalLecturas - vibracionesDetectadas;
        
        // Calcular frecuencia de vibraciones por día
        const fechas = result.data.map(item => new Date(item.created_at).toDateString());
        const fechasUnicas = [...new Set(fechas)];
        const promedioVibracionesPorDia = vibracionesDetectadas / Math.max(fechasUnicas.length, 1);

        res.json({
          success: true,
          estadisticas: {
            total_lecturas: totalLecturas,
            vibraciones_detectadas: vibracionesDetectadas,
            estado_estable: estadoEstable,
            porcentaje_vibraciones: totalLecturas > 0 ? 
              ((vibracionesDetectadas / totalLecturas) * 100).toFixed(1) : 0,
            promedio_vibraciones_por_dia: parseFloat(promedioVibracionesPorDia.toFixed(1)),
            nivel_seguridad: vibracionesDetectadas === 0 ? 'muy_alto' : 
                           vibracionesDetectadas < 5 ? 'alto' : 
                           vibracionesDetectadas < 15 ? 'medio' : 'bajo',
            periodo_analizado: totalLecturas > 0 ? {
              desde: result.data[result.data.length - 1].created_at,
              hasta: result.data[0].created_at,
              dias_analizados: fechasUnicas.length
            } : null
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo estadísticas',
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

  // Eventos de cambio de estado
  async getEventosCambioEstado(req, res) {
    try {
      const { limit = 50 } = req.query;
      
      const result = await adafruitService.getFeedData('vibracion', {
        limit: parseInt(limit)
      });
      
      if (result.success) {
        const eventos = [];
        
        for (let i = 0; i < result.data.length - 1; i++) {
          const actual = result.data[i].value === '1';
          const anterior = result.data[i + 1].value === '1';
          
          if (actual !== anterior) {
            eventos.push({
              timestamp: result.data[i].created_at,
              tipo_evento: actual ? 'inicio_vibracion' : 'fin_vibracion',
              estado_anterior: anterior ? 'vibrando' : 'estable',
              estado_actual: actual ? 'vibrando' : 'estable',
              mensaje: actual ? 
                'Inicio de detección de vibración' : 
                'Fin de detección de vibración',
              duracion_estimada: i > 0 ? 
                Math.abs(new Date(result.data[i].created_at) - new Date(result.data[i + 1].created_at)) / 1000 + ' segundos' : 
                'N/A'
            });
          }
        }

        res.json({
          success: true,
          eventos: eventos,
          total_cambios: eventos.length
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo eventos',
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

  // Datos para gráfico de actividad de vibraciones
  async getChartDataVibracion(req, res) {
    try {
      const { limit = 50 } = req.query;
      
      const result = await adafruitService.getFeedData('vibracion', {
        limit: parseInt(limit)
      });
      
      if (result.success) {
        const chartData = {
          labels: result.data.map(item => 
            new Date(item.created_at).toLocaleTimeString()
          ),
          datasets: [{
            label: 'Estado de Vibración',
            data: result.data.map(item => item.value === '1' ? 1 : 0),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            stepped: true
          }]
        };

        res.json({
          success: true,
          sensor: 'tilt_switch',
          chart_data: chartData,
          descripcion: 'Gráfico de actividad de vibraciones (1 = detectada, 0 = estable)'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo datos para gráfico',
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

  // Crear dato de prueba
  async crearDatoVibracion(req, res) {
    try {
      const { vibracion } = req.body;
      
      if (vibracion === undefined || ![true, false, 'true', 'false', '1', '0', 1, 0].includes(vibracion)) {
        return res.status(400).json({
          success: false,
          error: 'Valor de vibración inválido (debe ser true/false o 1/0)'
        });
      }

      // Convertir a formato esperado por Adafruit (1 o 0)
      let valor = '0';
      if (vibracion === true || vibracion === 'true' || vibracion === '1' || vibracion === 1) {
        valor = '1';
      }

      const result = await adafruitService.createData('vibracion', valor);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Dato de vibración creado',
          vibracion_detectada: valor === '1',
          valor_enviado: valor,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error creando dato de vibración',
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

module.exports = new VibracionController();
