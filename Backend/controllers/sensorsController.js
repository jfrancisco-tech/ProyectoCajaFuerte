// Controlador GENERAL para funciones que combinan múltiples sensores
const adafruitService = require('../services/adafruitService');

class SensorsController {

  // ==================== RESUMEN DE TODOS LOS SENSORES ====================
  
  async getResumenSensores(req, res) {
    try {
      const [puerta, estadoPuerta, temperatura, humedad, objeto, vibracion, intentos] = await Promise.all([
        adafruitService.getLastData('puerta'),
        adafruitService.getLastData('estado-puerta'),
        adafruitService.getLastData('temperatura'),
        adafruitService.getLastData('humedad'),
        adafruitService.getLastData('objeto'),
        adafruitService.getLastData('vibracion'),
        adafruitService.getLastData('intentos-fallidos')
      ]);

      const resumen = {
        success: true,
        timestamp: new Date().toISOString(),
        sensores: {}
      };

      if (puerta.success) {
        resumen.sensores.control_puerta = {
          valor: puerta.data.value,
          estado: puerta.data.value === '1' ? 'abierta' : 'cerrada',
          timestamp: puerta.data.created_at
        };
      }

      if (estadoPuerta.success) {
        resumen.sensores.estado_puerta = {
          abierta: estadoPuerta.data.value === '1',
          timestamp: estadoPuerta.data.created_at
        };
      }

      if (temperatura.success) {
        const temp = parseFloat(temperatura.data.value);
        resumen.sensores.temperatura = {
          valor: temp,
          unidad: '°C',
          en_rango: temp >= 18 && temp <= 27,
          timestamp: temperatura.data.created_at
        };
      }

      if (humedad.success) {
        const hum = parseFloat(humedad.data.value);
        resumen.sensores.humedad = {
          valor: hum,
          unidad: '%',
          en_rango: hum >= 30 && hum <= 60,
          timestamp: humedad.data.created_at
        };
      }

      if (objeto.success) {
        const dist = parseFloat(objeto.data.value);
        resumen.sensores.objeto = {
          distancia: dist,
          unidad: 'cm',
          objeto_detectado: dist <= 18,
          timestamp: objeto.data.created_at
        };
      }

      if (vibracion.success) {
        resumen.sensores.vibracion = {
          detectada: vibracion.data.value === '1',
          timestamp: vibracion.data.created_at
        };
      }

      if (intentos.success) {
        const int = parseInt(intentos.data.value);
        resumen.sensores.intentos_fallidos = {
          cantidad: int,
          alarma_activa: int >= 3,
          timestamp: intentos.data.created_at
        };
      }

      // Determinar estado general de seguridad
      const estadoSeguridad = determinarEstadoSeguridad(resumen.sensores);
      resumen.estado_seguridad = estadoSeguridad;

      res.json(resumen);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo resumen de sensores',
        details: error.message
      });
    }
  }

  // ==================== DATOS PARA GRÁFICOS ====================
  
  async getChartData(req, res) {
    try {
      const { sensor, limit = 20 } = req.query;
      
      if (!sensor) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro "sensor" requerido'
        });
      }

      const validSensors = ['temperatura', 'humedad', 'objeto', 'vibracion', 'intentos-fallidos'];
      if (!validSensors.includes(sensor)) {
        return res.status(400).json({
          success: false,
          error: `Sensor inválido. Use: ${validSensors.join(', ')}`
        });
      }

      const result = await adafruitService.getFeedData(sensor, { limit: parseInt(limit) });
      
      if (result.success) {
        const chartData = adafruitService.formatDataForChart(result.data);
        res.json({
          success: true,
          sensor: sensor,
          chart_data: chartData
        });
      } else {
        res.status(500).json({
          success: false,
          error: `Error obteniendo datos de ${sensor}`,
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

  // ==================== ALERTAS GENERALES ====================
  
  async getAlertasGenerales(req, res) {
    try {
      const [vibracion, intentos, temperatura, humedad] = await Promise.all([
        adafruitService.getLastData('vibracion'),
        adafruitService.getLastData('intentos-fallidos'),
        adafruitService.getLastData('temperatura'),
        adafruitService.getLastData('humedad')
      ]);

      const alertas = [];

      // Revisar vibración
      if (vibracion.success && vibracion.data.value === '1') {
        alertas.push({
          tipo: 'seguridad',
          nivel: 'alto',
          mensaje: 'Vibración detectada - Posible manipulación',
          timestamp: vibracion.data.created_at,
          sensor: 'vibracion'
        });
      }

      // Revisar intentos fallidos
      if (intentos.success) {
        const numIntentos = parseInt(intentos.data.value);
        if (numIntentos >= 3) {
          alertas.push({
            tipo: 'seguridad',
            nivel: 'critico',
            mensaje: `Alarma activada - ${numIntentos} intentos fallidos`,
            timestamp: intentos.data.created_at,
            sensor: 'intentos-fallidos'
          });
        } else if (numIntentos > 0) {
          alertas.push({
            tipo: 'seguridad',
            nivel: 'advertencia',
            mensaje: `${numIntentos} intento(s) fallido(s) registrado(s)`,
            timestamp: intentos.data.created_at,
            sensor: 'intentos-fallidos'
          });
        }
      }

      // Revisar condiciones ambientales
      if (temperatura.success) {
        const temp = parseFloat(temperatura.data.value);
        if (temp < 18 || temp > 27) {
          alertas.push({
            tipo: 'ambiental',
            nivel: 'advertencia',
            mensaje: `Temperatura fuera del rango óptimo: ${temp}°C`,
            timestamp: temperatura.data.created_at,
            sensor: 'temperatura'
          });
        }
      }

      if (humedad.success) {
        const hum = parseFloat(humedad.data.value);
        if (hum < 30 || hum > 60) {
          alertas.push({
            tipo: 'ambiental',
            nivel: 'advertencia',
            mensaje: `Humedad fuera del rango óptimo: ${hum}%`,
            timestamp: humedad.data.created_at,
            sensor: 'humedad'
          });
        }
      }

      res.json({
        success: true,
        alertas: alertas,
        total_alertas: alertas.length,
        alertas_criticas: alertas.filter(a => a.nivel === 'critico').length
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo alertas generales',
        details: error.message
      });
    }
  }
}

// Función auxiliar para determinar estado de seguridad
function determinarEstadoSeguridad(sensores) {
  let estado = 'seguro';
  let alertas = [];

  if (sensores.intentos_fallidos?.alarma_activa) {
    estado = 'alarma';
    alertas.push('Alarma activa por intentos fallidos');
  }

  if (sensores.vibracion?.detectada) {
    if (estado !== 'alarma') estado = 'alerta';
    alertas.push('Vibración detectada');
  }

  if (sensores.temperatura && !sensores.temperatura.en_rango) {
    if (estado === 'seguro') estado = 'advertencia';
    alertas.push('Temperatura fuera del rango óptimo');
  }

  if (sensores.humedad && !sensores.humedad.en_rango) {
    if (estado === 'seguro') estado = 'advertencia';
    alertas.push('Humedad fuera del rango óptimo');
  }

  return {
    nivel: estado,
    alertas: alertas
  };
}

module.exports = new SensorsController();
