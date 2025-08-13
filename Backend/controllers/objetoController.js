// Controlador para sensor ultrasónico (detección de objetos)
const adafruitService = require('../services/adafruitService');

class ObjetoController {
  
  // Obtener última lectura del sensor ultrasónico
  async getDeteccionObjeto(req, res) {
    try {
      const result = await adafruitService.getLastData('objeto');
      
      if (result.success) {
        const distancia = parseFloat(result.data.value);
        const objetoDetectado = distancia <= 18; // Umbral según tu código Arduino
        
        res.json({
          success: true,
          sensor: 'ultrasonico',
          data: {
            ...result.data,
            distancia: distancia,
            unidad: 'cm',
            objeto_detectado: objetoDetectado,
            estado: objetoDetectado ? 'objeto_encontrado' : 'sin_objeto',
            umbral_deteccion: '18cm',
            descripcion: objetoDetectado ? 
              'Hay un objeto en la caja fuerte' : 
              'No se detecta objeto en la caja fuerte',
            timestamp: result.data.created_at
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo datos del sensor ultrasónico',
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

  // Historial de detecciones
  async getHistorialDetecciones(req, res) {
    try {
      const { limit = 50, start_time, end_time } = req.query;
      
      const result = await adafruitService.getFeedData('objeto', {
        limit: parseInt(limit),
        start_time,
        end_time
      });
      
      if (result.success) {
        res.json({
          success: true,
          sensor: 'ultrasonico',
          data: result.data.map(item => {
            const distancia = parseFloat(item.value);
            const objetoDetectado = distancia <= 18;
            
            return {
              ...item,
              distancia: distancia,
              objeto_detectado: objetoDetectado,
              estado: objetoDetectado ? 'objeto_encontrado' : 'sin_objeto',
              timestamp: item.created_at
            };
          })
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo historial de detecciones',
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

  // Estadísticas de detecciones
  async getEstadisticasDeteccion(req, res) {
    try {
      const { limit = 100 } = req.query;
      
      const result = await adafruitService.getFeedData('objeto', {
        limit: parseInt(limit)
      });
      
      if (result.success) {
        const detecciones = result.data.map(item => {
          const distancia = parseFloat(item.value);
          return {
            distancia: distancia,
            objeto_detectado: distancia <= 18,
            timestamp: item.created_at
          };
        });

        const totalLecturas = detecciones.length;
        const conObjeto = detecciones.filter(d => d.objeto_detectado).length;
        const sinObjeto = totalLecturas - conObjeto;
        
        const distancias = detecciones.map(d => d.distancia).filter(d => d > 0);
        const distanciaPromedio = distancias.length > 0 ? 
          distancias.reduce((a, b) => a + b, 0) / distancias.length : 0;
        
        const distanciaMin = distancias.length > 0 ? Math.min(...distancias) : 0;
        const distanciaMax = distancias.length > 0 ? Math.max(...distancias) : 0;

        res.json({
          success: true,
          estadisticas: {
            total_lecturas: totalLecturas,
            detecciones_con_objeto: conObjeto,
            detecciones_sin_objeto: sinObjeto,
            porcentaje_con_objeto: totalLecturas > 0 ? ((conObjeto / totalLecturas) * 100).toFixed(1) : 0,
            distancia: {
              promedio: parseFloat(distanciaPromedio.toFixed(2)),
              minima: distanciaMin,
              maxima: distanciaMax,
              unidad: 'cm'
            },
            umbral_deteccion: '18cm',
            periodo_analizado: totalLecturas > 0 ? {
              desde: detecciones[detecciones.length - 1].timestamp,
              hasta: detecciones[0].timestamp
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

  // Datos para gráfico de distancias
  async getChartDataDistancias(req, res) {
    try {
      const { limit = 30 } = req.query;
      
      const result = await adafruitService.getFeedData('objeto', {
        limit: parseInt(limit)
      });
      
      if (result.success) {
        const chartData = {
          labels: result.data.map(item => 
            new Date(item.created_at).toLocaleString()
          ),
          datasets: [{
            label: 'Distancia (cm)',
            data: result.data.map(item => parseFloat(item.value)),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
          }, {
            label: 'Umbral detección (18cm)',
            data: new Array(result.data.length).fill(18),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderDash: [5, 5]
          }]
        };

        res.json({
          success: true,
          sensor: 'ultrasonico',
          chart_data: chartData
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

  // Alertas de cambios de estado
  async getAlertasCambioEstado(req, res) {
    try {
      const { limit = 20 } = req.query;
      
      const result = await adafruitService.getFeedData('objeto', {
        limit: parseInt(limit)
      });
      
      if (result.success) {
        const alertas = [];
        
        for (let i = 0; i < result.data.length - 1; i++) {
          const actual = parseFloat(result.data[i].value);
          const anterior = parseFloat(result.data[i + 1].value);
          
          const estadoActual = actual <= 18;
          const estadoAnterior = anterior <= 18;
          
          if (estadoActual !== estadoAnterior) {
            alertas.push({
              timestamp: result.data[i].created_at,
              tipo_cambio: estadoActual ? 'objeto_detectado' : 'objeto_removido',
              distancia_actual: actual,
              distancia_anterior: anterior,
              mensaje: estadoActual ? 
                'Se detectó un objeto en la caja fuerte' : 
                'Se removió un objeto de la caja fuerte'
            });
          }
        }

        res.json({
          success: true,
          alertas: alertas,
          total_cambios: alertas.length
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo alertas',
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
  async crearDatoDistancia(req, res) {
    try {
      const { distancia } = req.body;
      
      if (!distancia || isNaN(distancia) || distancia < 0) {
        return res.status(400).json({
          success: false,
          error: 'Valor de distancia inválido (debe ser un número positivo)'
        });
      }

      const result = await adafruitService.createData('objeto', distancia.toString());
      
      if (result.success) {
        const objetoDetectado = parseFloat(distancia) <= 18;
        res.json({
          success: true,
          message: 'Dato de distancia creado',
          distancia: parseFloat(distancia),
          objeto_detectado: objetoDetectado,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error creando dato de distancia',
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

module.exports = new ObjetoController();
