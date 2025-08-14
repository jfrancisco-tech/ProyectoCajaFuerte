// Servicio para manejar las comunicaciones con Adafruit IO
const axios = require('axios');
const adafruitConfig = require('../config/adafruit');

class AdafruitService {
  constructor() {
    this.config = adafruitConfig;
  }

  // ==================== MÉTODOS GENERALES ====================

  // Obtener último dato de un feed
  async getLastData(feedKey) {
    try {
      const response = await axios.get(this.config.getLastDataUrl(feedKey), {
        headers: this.config.getHeaders()
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error obteniendo último dato de ${feedKey}:`, error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Crear nuevo dato en un feed
  async createData(feedKey, value) {
    try {
      const response = await axios.post(
        this.config.getFeedDataUrl(feedKey),
        { value: value },
        { headers: this.config.getHeaders() }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error creando dato en ${feedKey}:`, error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Obtener datos de un feed con filtros
  async getFeedData(feedKey, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros si existen
      if (filters.start_time) params.append('start_time', filters.start_time);
      if (filters.end_time) params.append('end_time', filters.end_time);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.include) params.append('include', filters.include);

      const url = `${this.config.getFeedDataUrl(feedKey)}?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: this.config.getHeaders()
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error obteniendo datos de ${feedKey}:`, error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Actualizar un punto de datos específico
  async updateDataPoint(feedKey, dataId, value) {
    try {
      const response = await axios.patch(
        this.config.getDataPointUrl(feedKey, dataId),
        { value: value },
        { headers: this.config.getHeaders() }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error actualizando dato ${dataId} en ${feedKey}:`, error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Eliminar un punto de datos específico
  async deleteDataPoint(feedKey, dataId) {
    try {
      await axios.delete(
        this.config.getDataPointUrl(feedKey, dataId),
        { headers: this.config.getHeaders() }
      );
      return {
        success: true,
        message: `Dato ${dataId} eliminado de ${feedKey}`
      };
    } catch (error) {
      console.error(`Error eliminando dato ${dataId} de ${feedKey}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener información de un feed específico
  async getFeed(feedKey) {
    try {
      const response = await axios.get(this.config.getFeedUrl(feedKey), {
        headers: this.config.getHeaders()
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error obteniendo feed ${feedKey}:`, error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Obtener todos los feeds
  async getAllFeeds() {
    try {
      const response = await axios.get(this.config.getAllFeedsUrl(), {
        headers: this.config.getHeaders()
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo todos los feeds:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Crear un nuevo feed
  async createFeed(feedData) {
    try {
      const response = await axios.post(
        this.config.getAllFeedsUrl(),
        feedData,
        { headers: this.config.getHeaders() }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creando feed:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Actualizar un feed
  async updateFeed(feedKey, feedData) {
    try {
      const response = await axios.patch(
        this.config.getFeedUrl(feedKey),
        feedData,
        { headers: this.config.getHeaders() }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error actualizando feed ${feedKey}:`, error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Eliminar un feed
  async deleteFeed(feedKey) {
    try {
      await axios.delete(this.config.getFeedUrl(feedKey), {
        headers: this.config.getHeaders()
      });
      return {
        success: true,
        message: `Feed ${feedKey} eliminado`
      };
    } catch (error) {
      console.error(`Error eliminando feed ${feedKey}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== MÉTODOS ESPECÍFICOS PARA TUS FEEDS ====================

  // Método para formatear datos para gráficos
  formatDataForChart(data, chartType = 'line') {
    if (!data || !Array.isArray(data)) return null;

    return {
      labels: data.map(item => new Date(item.created_at).toLocaleString()),
      datasets: [{
        label: 'Valor',
        data: data.map(item => parseFloat(item.value)),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }]
    };
  }

  // Validar valor del sensor ultrasónico (objeto)
  validateObjetoValue(distancia) {
    const dist = parseFloat(distancia);
    if (dist <= 18) {
      return {
        status: 'objeto_detectado',
        message: 'Objeto encontrado',
        distance: dist
      };
    } else {
      return {
        status: 'sin_objeto',
        message: 'No hay objeto detectado',
        distance: dist
      };
    }
  }

  // Validar condiciones ambientales
  validateAmbientalConditions(temperatura, humedad) {
    const temp = parseFloat(temperatura);
    const hum = parseFloat(humedad);
    
    const tempOk = temp >= 18 && temp <= 27;
    const humOk = hum >= 30 && hum <= 60;
    
    return {
      temperatura: {
        value: temp,
        status: tempOk ? 'optima' : 'fuera_rango',
        range: '18-27°C'
      },
      humedad: {
        value: hum,
        status: humOk ? 'optima' : 'fuera_rango',
        range: '30-60%'
      },
      ambiente_estable: tempOk && humOk
    };
  }

  // ==================== CAMBIO DE PIN DEL TECLADO ====================
  
  // Cambiar PIN del teclado enviando nuevo PIN a Adafruit IO
  async updateKeypadPassword(newPin) {
    try {
      // Validar que el PIN sea de 4 dígitos
      if (!newPin || !/^\d{4}$/.test(newPin)) {
        throw new Error('El PIN debe tener exactamente 4 dígitos');
      }

      // Enviar nuevo PIN al feed de Adafruit IO
      const result = await this.createData('pin-teclado', newPin);
      
      if (result.success) {
        console.log(`PIN del teclado actualizado a: ${newPin}`);
        return {
          success: true,
          message: 'PIN del teclado actualizado exitosamente en Adafruit IO',
          data: result.data
        };
      } else {
        throw new Error(result.error || 'Error al actualizar PIN en Adafruit IO');
      }
    } catch (error) {
      console.error('Error actualizando PIN del teclado:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener PIN actual del teclado
  async getCurrentKeypadPassword() {
    try {
      const result = await this.getLastData('pin-teclado');
      
      if (result.success && result.data) {
        return {
          success: true,
          pin: result.data.value || '1144' // PIN por defecto si no hay datos
        };
      } else {
        return {
          success: true,
          pin: '1144' // PIN por defecto
        };
      }
    } catch (error) {
      console.error('Error obteniendo PIN actual:', error.message);
      return {
        success: true,
        pin: '1144' // PIN por defecto en caso de error
      };
    }
  }

  // Inicializar PIN por defecto si no existe
  async initializeDefaultPin() {
    try {
      console.log('🔐 Verificando PIN inicial en Adafruit IO...');
      
      // Intentar obtener el PIN actual
      const currentResult = await this.getLastData('pin-teclado');
      
      if (!currentResult.success || !currentResult.data) {
        console.log('📝 No se encontró PIN en Adafruit IO, estableciendo PIN por defecto: 1144');
        
        // Establecer PIN por defecto
        const initResult = await this.createData('pin-teclado', '1144');
        
        if (initResult.success) {
          console.log('✅ PIN por defecto establecido exitosamente en Adafruit IO');
          return {
            success: true,
            message: 'PIN por defecto inicializado',
            pin: '1144'
          };
        } else {
          console.error('❌ Error estableciendo PIN por defecto:', initResult.error);
          return {
            success: false,
            error: initResult.error
          };
        }
      } else {
        console.log(`✅ PIN ya existe en Adafruit IO: ${currentResult.data.value}`);
        return {
          success: true,
          message: 'PIN ya existe',
          pin: currentResult.data.value
        };
      }
    } catch (error) {
      console.error('Error inicializando PIN por defecto:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AdafruitService();
