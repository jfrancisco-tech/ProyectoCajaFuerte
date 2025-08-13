// Controlador para intentos fallidos de acceso
const adafruitService = require('../services/adafruitService');

class SeguridadController {
  
  // Obtener estado actual de intentos fallidos
  async getIntentosFallidos(req, res) {
    try {
      const result = await adafruitService.getLastData('intentos-fallidos');
      
      if (result.success) {
        const intentos = parseInt(result.data.value);
        const alarmaActiva = intentos >= 3;
        
        res.json({
          success: true,
          sensor: 'intentos_fallidos',
          data: {
            ...result.data,
            intentos_fallidos: intentos,
            alarma_activa: alarmaActiva,
            limite_alarma: 3,
            intentos_restantes: Math.max(0, 3 - intentos),
            nivel_alerta: intentos === 0 ? 'normal' : 
                         intentos < 3 ? 'advertencia' : 'critico',
            estado: alarmaActiva ? 'alarma_activada' : 'sistema_seguro',
            mensaje: alarmaActiva ? 
              'Sistema bloqueado por intentos fallidos' : 
              `${intentos} intento(s) fallido(s) registrado(s)`,
            timestamp: result.data.created_at
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo intentos fallidos',
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

  // Reiniciar contador de intentos fallidos
  async resetIntentosFallidos(req, res) {
    try {
      const result = await adafruitService.createData('intentos-fallidos', '0');
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Contador de intentos fallidos reiniciado',
          intentos_fallidos: 0,
          alarma_activa: false,
          estado: 'sistema_reiniciado',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error reiniciando intentos fallidos',
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

  // Historial de intentos fallidos
  async getHistorialIntentos(req, res) {
    try {
      const { limit = 50, start_time, end_time } = req.query;
      
      const result = await adafruitService.getFeedData('intentos-fallidos', {
        limit: parseInt(limit),
        start_time,
        end_time
      });
      
      if (result.success) {
        res.json({
          success: true,
          sensor: 'intentos_fallidos',
          data: result.data.map(item => {
            const intentos = parseInt(item.value);
            const alarmaActiva = intentos >= 3;
            
            return {
              ...item,
              intentos_fallidos: intentos,
              alarma_activa: alarmaActiva,
              nivel_alerta: intentos === 0 ? 'normal' : 
                           intentos < 3 ? 'advertencia' : 'critico',
              timestamp: item.created_at
            };
          })
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo historial de intentos',
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

  // Alertas de seguridad
  async getAlertasSeguridad(req, res) {
    try {
      const { limit = 30 } = req.query;
      
      const result = await adafruitService.getFeedData('intentos-fallidos', {
        limit: parseInt(limit)
      });
      
      if (result.success) {
        const alertas = [];
        
        // Buscar incrementos en intentos fallidos y activaciones de alarma
        for (let i = 0; i < result.data.length - 1; i++) {
          const intentosActual = parseInt(result.data[i].value);
          const intentosAnterior = parseInt(result.data[i + 1].value);
          
          if (intentosActual > intentosAnterior) {
            const tipoAlerta = intentosActual >= 3 ? 'alarma_activada' : 'intento_fallido';
            
            alertas.push({
              id: result.data[i].id,
              timestamp: result.data[i].created_at,
              tipo: tipoAlerta,
              intentos_anteriores: intentosAnterior,
              intentos_actuales: intentosActual,
              nivel: intentosActual >= 3 ? 'critico' : 'advertencia',
              mensaje: intentosActual >= 3 ? 
                `¡ALARMA ACTIVADA! - ${intentosActual} intentos fallidos` :
                `Intento fallido registrado - Total: ${intentosActual}`,
              fecha_legible: new Date(result.data[i].created_at).toLocaleString()
            });
          }
          
          // Detectar reinicios del contador
          if (intentosActual === 0 && intentosAnterior > 0) {
            alertas.push({
              id: result.data[i].id,
              timestamp: result.data[i].created_at,
              tipo: 'reset_contador',
              intentos_anteriores: intentosAnterior,
              intentos_actuales: 0,
              nivel: 'info',
              mensaje: 'Contador de intentos fallidos reiniciado',
              fecha_legible: new Date(result.data[i].created_at).toLocaleString()
            });
          }
        }

        res.json({
          success: true,
          alertas: alertas,
          total_alertas: alertas.length,
          alertas_criticas: alertas.filter(a => a.nivel === 'critico').length
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo alertas de seguridad',
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

  // Estadísticas de seguridad
  async getEstadisticasSeguridad(req, res) {
    try {
      const { limit = 100 } = req.query;
      
      const result = await adafruitService.getFeedData('intentos-fallidos', {
        limit: parseInt(limit)
      });
      
      if (result.success) {
        const datos = result.data.map(item => ({
          intentos: parseInt(item.value),
          timestamp: item.created_at,
          fecha: new Date(item.created_at).toDateString()
        }));

        const totalRegistros = datos.length;
        const alarmasActivadas = datos.filter(d => d.intentos >= 3).length;
        const intentosRegistrados = datos.filter(d => d.intentos > 0).length;
        const sistemaSeguro = datos.filter(d => d.intentos === 0).length;
        
        // Contar días únicos para calcular promedios
        const fechasUnicas = [...new Set(datos.map(d => d.fecha))];
        const alarmasPorDia = alarmasActivadas / Math.max(fechasUnicas.length, 1);
        
        // Encontrar el máximo número de intentos
        const maxIntentos = datos.length > 0 ? Math.max(...datos.map(d => d.intentos)) : 0;
        
        // Calcular tiempo promedio entre alarmas
        const alarmas = datos.filter(d => d.intentos >= 3);
        let tiempoPromedioEntreAlarmas = 'N/A';
        if (alarmas.length > 1) {
          const tiempos = [];
          for (let i = 0; i < alarmas.length - 1; i++) {
            const diff = new Date(alarmas[i].timestamp) - new Date(alarmas[i + 1].timestamp);
            tiempos.push(diff);
          }
          const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
          tiempoPromedioEntreAlarmas = Math.round(promedio / (1000 * 60 * 60)) + ' horas';
        }

        res.json({
          success: true,
          estadisticas: {
            total_registros: totalRegistros,
            alarmas_activadas: alarmasActivadas,
            intentos_registrados: intentosRegistrados,
            sistema_seguro: sistemaSeguro,
            porcentaje_alarmas: totalRegistros > 0 ? 
              ((alarmasActivadas / totalRegistros) * 100).toFixed(1) : 0,
            promedio_alarmas_por_dia: parseFloat(alarmasPorDia.toFixed(2)),
            maximo_intentos_registrado: maxIntentos,
            tiempo_promedio_entre_alarmas: tiempoPromedioEntreAlarmas,
            nivel_seguridad_general: alarmasActivadas === 0 ? 'excelente' :
                                   alarmasActivadas < 3 ? 'bueno' :
                                   alarmasActivadas < 10 ? 'regular' : 'preocupante',
            periodo_analizado: totalRegistros > 0 ? {
              desde: datos[datos.length - 1].timestamp,
              hasta: datos[0].timestamp,
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

  // Datos para gráfico de intentos fallidos
  async getChartDataIntentos(req, res) {
    try {
      const { limit = 30 } = req.query;
      
      const result = await adafruitService.getFeedData('intentos-fallidos', {
        limit: parseInt(limit)
      });
      
      if (result.success) {
        const chartData = {
          labels: result.data.map(item => 
            new Date(item.created_at).toLocaleString()
          ),
          datasets: [{
            label: 'Intentos Fallidos',
            data: result.data.map(item => parseInt(item.value)),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            stepped: true
          }, {
            label: 'Límite de Alarma (3)',
            data: new Array(result.data.length).fill(3),
            borderColor: 'rgb(255, 0, 0)',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            borderDash: [5, 5]
          }]
        };

        res.json({
          success: true,
          sensor: 'intentos_fallidos',
          chart_data: chartData,
          descripcion: 'Gráfico de evolución de intentos fallidos'
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

  // Simular intento fallido (para testing)
  async simularIntentoFallido(req, res) {
    try {
      // Primero obtener el valor actual
      const currentResult = await adafruitService.getLastData('intentos-fallidos');
      
      if (!currentResult.success) {
        return res.status(500).json({
          success: false,
          error: 'Error obteniendo valor actual de intentos',
          details: currentResult.error
        });
      }

      const intentosActuales = parseInt(currentResult.data.value);
      const nuevosIntentos = intentosActuales + 1;

      const result = await adafruitService.createData('intentos-fallidos', nuevosIntentos.toString());
      
      if (result.success) {
        const alarmaActivada = nuevosIntentos >= 3;
        
        res.json({
          success: true,
          message: 'Intento fallido simulado',
          intentos_anteriores: intentosActuales,
          intentos_actuales: nuevosIntentos,
          alarma_activada: alarmaActivada,
          estado: alarmaActivada ? 'sistema_bloqueado' : 'advertencia',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error simulando intento fallido',
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

module.exports = new SeguridadController();
