// Controlador para sensores ambientales (temperatura y humedad)
const adafruitService = require('../services/adafruitService');

class AmbientalController {
  
  // ==================== TEMPERATURA ====================
  
  async getTemperatura(req, res) {
    try {
      const result = await adafruitService.getLastData('temperatura');
      
      if (result.success) {
        const temp = parseFloat(result.data.value);
        const enRango = temp >= 18 && temp <= 27;
        
        res.json({
          success: true,
          sensor: 'temperatura',
          data: {
            ...result.data,
            temperatura: temp,
            unidad: '°C',
            en_rango_optimo: enRango,
            rango_optimo: '18-27°C',
            estado: enRango ? 'optima' : 'fuera_rango',
            timestamp: result.data.created_at
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo temperatura',
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

  // Historial de temperatura
  async getTemperaturaHistorial(req, res) {
    try {
      const { limit = 50, start_time, end_time } = req.query;
      
      const result = await adafruitService.getFeedData('temperatura', {
        limit: parseInt(limit),
        start_time,
        end_time
      });
      
      if (result.success) {
        res.json({
          success: true,
          sensor: 'temperatura',
          data: result.data.map(item => {
            const temp = parseFloat(item.value);
            return {
              ...item,
              temperatura: temp,
              en_rango: temp >= 18 && temp <= 27,
              timestamp: item.created_at
            };
          })
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo historial de temperatura',
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

  // ==================== HUMEDAD ====================
  
  async getHumedad(req, res) {
    try {
      const result = await adafruitService.getLastData('humedad');
      
      if (result.success) {
        const hum = parseFloat(result.data.value);
        const enRango = hum >= 30 && hum <= 60;
        
        res.json({
          success: true,
          sensor: 'humedad',
          data: {
            ...result.data,
            humedad: hum,
            unidad: '%',
            en_rango_optimo: enRango,
            rango_optimo: '30-60%',
            estado: enRango ? 'optima' : 'fuera_rango',
            timestamp: result.data.created_at
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo humedad',
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

  // Historial de humedad
  async getHumedadHistorial(req, res) {
    try {
      const { limit = 50, start_time, end_time } = req.query;
      
      const result = await adafruitService.getFeedData('humedad', {
        limit: parseInt(limit),
        start_time,
        end_time
      });
      
      if (result.success) {
        res.json({
          success: true,
          sensor: 'humedad',
          data: result.data.map(item => {
            const hum = parseFloat(item.value);
            return {
              ...item,
              humedad: hum,
              en_rango: hum >= 30 && hum <= 60,
              timestamp: item.created_at
            };
          })
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo historial de humedad',
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

  // ==================== CONDICIONES AMBIENTALES COMBINADAS ====================
  
  async getCondicionesAmbientales(req, res) {
    try {
      const [tempResult, humResult] = await Promise.all([
        adafruitService.getLastData('temperatura'),
        adafruitService.getLastData('humedad')
      ]);

      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        condiciones: {}
      };

      if (tempResult.success) {
        const temp = parseFloat(tempResult.data.value);
        const tempEnRango = temp >= 18 && temp <= 27;
        
        response.condiciones.temperatura = {
          valor: temp,
          unidad: '°C',
          en_rango: tempEnRango,
          estado: tempEnRango ? 'optima' : 'fuera_rango',
          timestamp: tempResult.data.created_at
        };
      }

      if (humResult.success) {
        const hum = parseFloat(humResult.data.value);
        const humEnRango = hum >= 30 && hum <= 60;
        
        response.condiciones.humedad = {
          valor: hum,
          unidad: '%',
          en_rango: humEnRango,
          estado: humEnRango ? 'optima' : 'fuera_rango',
          timestamp: humResult.data.created_at
        };
      }

      // Evaluar condiciones generales
      if (response.condiciones.temperatura && response.condiciones.humedad) {
        const ambienteEstable = response.condiciones.temperatura.en_rango && 
                               response.condiciones.humedad.en_rango;
        
        response.ambiente = {
          estable: ambienteEstable,
          estado: ambienteEstable ? 'condiciones_optimas' : 'requiere_atencion',
          recomendacion: ambienteEstable ? 
            'Condiciones ideales para conservación' : 
            'Ajustar temperatura y/o humedad'
        };
      }

      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo condiciones ambientales',
        details: error.message
      });
    }
  }

  // Datos para gráficos combinados
  async getChartDataAmbiental(req, res) {
    try {
      const { limit = 20, start_time, end_time } = req.query;
      
      const [tempResult, humResult] = await Promise.all([
        adafruitService.getFeedData('temperatura', { limit: parseInt(limit), start_time, end_time }),
        adafruitService.getFeedData('humedad', { limit: parseInt(limit), start_time, end_time })
      ]);

      const chartData = {
        success: true,
        chart_data: {
          labels: [],
          datasets: []
        }
      };

      if (tempResult.success) {
        chartData.chart_data.labels = tempResult.data.map(item => 
          new Date(item.created_at).toLocaleString()
        );
        chartData.chart_data.datasets.push({
          label: 'Temperatura (°C)',
          data: tempResult.data.map(item => parseFloat(item.value)),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'y'
        });
      }

      if (humResult.success) {
        if (chartData.chart_data.labels.length === 0) {
          chartData.chart_data.labels = humResult.data.map(item => 
            new Date(item.created_at).toLocaleString()
          );
        }
        chartData.chart_data.datasets.push({
          label: 'Humedad (%)',
          data: humResult.data.map(item => parseFloat(item.value)),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          yAxisID: 'y1'
        });
      }

      res.json(chartData);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo datos para gráfico',
        details: error.message
      });
    }
  }

  // Crear datos de prueba (útil para testing)
  async crearDatoTemperatura(req, res) {
    try {
      const { temperatura } = req.body;
      
      if (!temperatura || isNaN(temperatura)) {
        return res.status(400).json({
          success: false,
          error: 'Valor de temperatura inválido'
        });
      }

      const result = await adafruitService.createData('temperatura', temperatura.toString());
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Dato de temperatura creado',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error creando dato de temperatura',
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

  async crearDatoHumedad(req, res) {
    try {
      const { humedad } = req.body;
      
      if (!humedad || isNaN(humedad)) {
        return res.status(400).json({
          success: false,
          error: 'Valor de humedad inválido'
        });
      }

      const result = await adafruitService.createData('humedad', humedad.toString());
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Dato de humedad creado',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error creando dato de humedad',
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

module.exports = new AmbientalController();
