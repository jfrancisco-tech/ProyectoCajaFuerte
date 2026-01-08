# Sistema de Caja Fuerte Inteligente

<div align="center">
  
<img width="905" height="635" alt="image" src="https://github.com/user-attachments/assets/eb6741a7-14c1-42d1-95a3-63cf2cced77a" />

  
  *Sistema de seguridad IoT con sensores y control remoto*

</div>

---

## Descripción

Caja fuerte física con sistema de seguridad electrónico completo. Funciona con contraseña de 4 dígitos ingresada mediante un teclado matricial. Se puede monitorear y controlar desde cualquier lugar a través de internet.

## Características principales

**Seguridad**
- Teclado numérico 4x4 para ingresar contraseña
- Bloqueo automático después de 3 intentos fallidos
- Alarma sonora con 3 patrones diferentes (policía, sirena, emergencia)
- Sensor de vibración para detectar intentos de robo

**Monitoreo ambiental**
- Sensor de temperatura y humedad (DHT11)
- Protege documentos importantes manteniendo condiciones óptimas
- Alertas cuando las condiciones no son estables

**Control de acceso**
- Servomotor que abre/cierra la cerradura
- LED RGB que indica el estado:   Azul (cerrada), Verde (abierta), Rojo (bloqueada)
- Sensor ultrasónico para detectar objetos dentro de la caja

**Control remoto**
- Interfaz web para monitorear en tiempo real
- Abrir/cerrar la caja desde cualquier lugar
- Ver historial de eventos
- Dashboard con datos de sensores

## Cómo funciona

El ESP32 lee todos los sensores cada 5 segundos y envía los datos a Adafruit IO mediante MQTT. Un servidor Node.js recibe esta información y la muestra en una interfaz web hecha con Angular.  Desde ahí puedes ver el estado actual, revisar el historial de eventos y controlar la cerradura de forma remota.

**Contraseña por defecto:** 1144

## Tecnologías

**Hardware:** ESP32 · DHT11 · HC-SR04 · Tilt Switch · Servomotor SG90 · Teclado 4x4 · LED RGB · Buzzer

*
