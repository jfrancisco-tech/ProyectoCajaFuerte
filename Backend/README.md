# sistema de caja fuerte con implementacion de sensores en conjunto con adafruit

# sensores que se van utilizar
🔌 Sensores y Componentes Principales
1. 📶 Lector RFID (RC522)
Uso: Acceso alternativo mediante tarjeta.

Columna asociada: rfid_tag en la tabla usuarios.

2. 🔢 Teclado Matricial
Uso: Acceso alternativo mediante PIN.

Columna asociada: pin_code en la tabla usuarios.

3. 👀 Sensor PIR (Infrarrojo Pasivo)
Uso: Detección de movimiento frente a la caja fuerte.

Evento registrado: deteccion_movimiento

4. 📏 Sensor Ultrasónico (HC-SR04 o similar)
Uso: Detecta si hay alguien demasiado cerca (proximidad).

Evento registrado: deteccion_proximidad

5. 🌀 Tilt Switch (sensor de inclinación)
Uso: Detecta si alguien mueve o intenta abrir la caja de forma forzada.

Evento registrado: inclinacion_detectada

6. 🔒 Servomotor (SG90 o similar)
Uso: Abre o cierra la cerradura de la caja fuerte (si el acceso fue válido).

7. ⏰ Módulo RTC (DS3231) // en discusion si se va implementar, lo mas probable es que no 
Uso: Controla acceso solo dentro de un horario permitido, y registra la hora real de los eventos.

Evento registrado: hora_restringida si intentan acceder fuera de horario.

💡 Extras (No se cuentan como sensores, pero son importantes)
✅ LEDs (verde, rojo, azul)
Uso: Indicadores visuales (acceso válido, error, alerta, etc.)

🔊 Buzzer
Uso: Sonido de alerta o confirmación (acceso fallido, acceso exitoso, intento fuera de horario, etc.)

