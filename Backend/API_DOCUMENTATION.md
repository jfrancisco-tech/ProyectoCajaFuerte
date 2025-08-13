# API Documentation - Caja Fuerte Inteligente

## Base URL
```
http://localhost:3000/api
```

## Endpoints de Sensores

### 🚪 PUERTA Y SERVO

#### Control de Puerta
- **GET** `/sensors/puerta/control` - Obtener estado del control de puerta
- **POST** `/sensors/puerta/control` - Enviar comando abrir/cerrar
  ```json
  {
    "accion": "abrir" // o "cerrar"
  }
  ```

#### Estado de Puerta
- **GET** `/sensors/puerta/estado` - Estado real de la puerta (abierta/cerrada)
- **GET** `/sensors/puerta/completo` - Estado completo (control + estado real)
- **GET** `/sensors/puerta/historial` - Historial de comandos

### 🌡️ SENSORES AMBIENTALES

#### Temperatura
- **GET** `/sensors/temperatura` - Última lectura de temperatura
- **GET** `/sensors/temperatura/historial` - Historial de temperatura
- **POST** `/sensors/temperatura` - Crear dato de prueba
  ```json
  {
    "temperatura": 25.5
  }
  ```

#### Humedad
- **GET** `/sensors/humedad` - Última lectura de humedad
- **GET** `/sensors/humedad/historial` - Historial de humedad
- **POST** `/sensors/humedad` - Crear dato de prueba
  ```json
  {
    "humedad": 45.2
  }
  ```

#### Condiciones Ambientales
- **GET** `/sensors/ambiental` - Condiciones combinadas (temp + humedad)
- **GET** `/sensors/ambiental/chart` - Datos para gráfico combinado

### 📏 SENSOR ULTRASÓNICO (OBJETO)

- **GET** `/sensors/objeto` - Última detección de objeto
- **GET** `/sensors/objeto/historial` - Historial de detecciones
- **GET** `/sensors/objeto/estadisticas` - Estadísticas de detecciones
- **GET** `/sensors/objeto/chart` - Datos para gráfico de distancias
- **GET** `/sensors/objeto/alertas` - Alertas de cambio de estado
- **POST** `/sensors/objeto` - Crear dato de prueba
  ```json
  {
    "distancia": 15.3
  }
  ```

### 📳 SENSOR DE VIBRACIÓN

- **GET** `/sensors/vibracion` - Último estado de vibración
- **GET** `/sensors/vibracion/historial` - Historial de vibraciones
- **GET** `/sensors/vibracion/alertas` - Alertas de manipulación
- **GET** `/sensors/vibracion/estadisticas` - Estadísticas de vibraciones
- **GET** `/sensors/vibracion/eventos` - Eventos de cambio de estado
- **GET** `/sensors/vibracion/chart` - Datos para gráfico de actividad
- **POST** `/sensors/vibracion` - Crear dato de prueba
  ```json
  {
    "vibracion": true // o false
  }
  ```

### 🔒 SEGURIDAD (INTENTOS FALLIDOS)

- **GET** `/sensors/seguridad/intentos` - Estado actual de intentos fallidos
- **POST** `/sensors/seguridad/reset` - Reiniciar contador de intentos
- **GET** `/sensors/seguridad/historial` - Historial de intentos
- **GET** `/sensors/seguridad/alertas` - Alertas de seguridad
- **GET** `/sensors/seguridad/estadisticas` - Estadísticas de seguridad
- **GET** `/sensors/seguridad/chart` - Datos para gráfico de intentos
- **POST** `/sensors/seguridad/simular` - Simular intento fallido

### 📊 ENDPOINTS GENERALES

- **GET** `/sensors/` - Información general de la API
- **GET** `/sensors/resumen` - Resumen de todos los sensores
- **GET** `/sensors/chart?sensor=temperatura&limit=20` - Datos para gráficos individuales

## Parámetros de Query Comunes

### Filtros de Tiempo
- `start_time` - Fecha inicio (ISO 8601)
- `end_time` - Fecha fin (ISO 8601)
- `limit` - Número máximo de resultados (default: 20-50 según endpoint)

### Ejemplo de Query con Filtros
```
GET /sensors/temperatura/historial?limit=100&start_time=2025-08-01T00:00:00Z&end_time=2025-08-13T23:59:59Z
```

## Estructura de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "sensor": "temperatura",
  "data": {
    "id": "0ED5R35E4VPSW7E9BZRRB7JE36",
    "value": "24.5",
    "feed_id": 2749845,
    "created_at": "2025-08-13T07:30:00Z",
    "temperatura": 24.5,
    "unidad": "°C",
    "en_rango_optimo": true,
    "estado": "optima",
    "timestamp": "2025-08-13T07:30:00Z"
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": "Error obteniendo temperatura",
  "details": "Network error or timeout"
}
```

## Feeds de Adafruit IO

Los feeds utilizados corresponden a tu configuración:

1. **puerta** - Control del servo (1=abrir, 0=cerrar)
2. **estado-puerta** - Estado real de la puerta (1=abierta, 0=cerrada)
3. **temperatura** - Temperatura en °C (DHT11)
4. **humedad** - Humedad en % (DHT11)
5. **objeto** - Distancia en cm (sensor ultrasónico)
6. **vibracion** - Detección de vibración (1=detectada, 0=estable)
7. **intentos-fallidos** - Contador de intentos fallidos (0-3+)

## Rangos Óptimos

- **Temperatura**: 18-27°C
- **Humedad**: 30-60%
- **Objeto detectado**: ≤ 18cm
- **Alarma activada**: ≥ 3 intentos fallidos

## Autenticación

Si tienes middleware de autenticación configurado, incluye el token en los headers:
```
Authorization: Bearer <token>
```

## Ejemplos de Uso

### Obtener estado completo del sistema
```bash
curl http://localhost:3000/api/sensors/resumen
```

### Controlar la puerta
```bash
curl -X POST http://localhost:3000/api/sensors/puerta/control \
  -H "Content-Type: application/json" \
  -d '{"accion": "abrir"}'
```

### Obtener condiciones ambientales
```bash
curl http://localhost:3000/api/sensors/ambiental
```

### Reiniciar contador de intentos fallidos
```bash
curl -X POST http://localhost:3000/api/sensors/seguridad/reset
```
