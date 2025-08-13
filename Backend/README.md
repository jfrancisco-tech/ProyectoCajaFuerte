<<<<<<< HEAD
## atencion, todo esto se realizara mediante botones de adafruit y usaremos la kay y token para conectarnos a el, asi que el sera el intermediaro, todo esto usando el esp-32d

## ADVERTENCIA YA NO SE UTILIZARA BASE DE DATOS Y ALGUNOS SENSORES FURON REMOVIDOS, YA ESTA LA MAQUETA FISICA 

'# sistema de caja fuerte con implementacion de sensores en conjunto con adafruit


1. y 2. #sensor de humedad para detectar presencia de humedad y temperatura y proteger documentos

3. 🔢 Teclado Matricial
Uso: accecer ala caja fuerte mediante pin y despues mover el servo al completar.
se utiliza fisicamente y un boton en adafruit que sirve para cerrar y abrir caja fuerte o mover el servo

4. 📏 Sensor Ultrasónico (HC-SR04 o similar)
Uso: Detecta el objeto que se encuentra dentro de la caja, podria ser joyeria, un muneco, o dinero (detecta objeto adentro o sin objeto).



5. 🌀 Tilt Switch (sensor de inclinación)
Uso: Detecta si alguien mueve o intenta abrir la caja de forma forzada.
(manipulacion de la caja)


# usaremos 1 servo motor para morver como palanca el cerrojo de la caja fuerte
6. 🔒 Servomotor (SG90 o similar)
Uso: Abre o cierra la cerradura de la caja fuerte (si el acceso fue válido).



💡 Extras (No se cuentan como sensores, pero son importantes)
Rgb que indica el estado de la caja, azul cerrado, verde abierta, y rojo bloqueada
=======
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
>>>>>>> 84b79395e96e8ba7faccbdb1ac87c141adbe3ac0

🔊 Buzzer
Uso: Sonido de alerta o confirmación (acceso fallido, acceso exitoso, intento fuera de horario, etc.)

<<<<<<< HEAD
## servicios a implementar en adafruit que necesito obliatoriamente
ESP32 → Adafruit IO (MQTT o REST) → Backend Express → Angular
Esto te permite:

Capturar datos en tiempo real con el ESP32.

Guardarlos en los feeds de Adafruit IO.

Consultarlos, filtrarlos, graficarlos o modificarlos desde tu backend.

Y que Angular los consuma como si fueran datos de tu propia API.

Cómo encajan tus servicios con Adafruit IO
Get Last Data
→ Usas el endpoint GET /feeds/{feed_key}/data/last para traer el último dato, y en tu backend le pones los filtros que quieras.

Create Data
→ POST /feeds/{feed_key}/data para mandar un valor nuevo desde Angular o tu backend (no solo desde el ESP32).

Update Data Point
→ PATCH /feeds/{feed_key}/data/{data_id} para modificar un valor ya existente.

Delete Data Point
→ DELETE /feeds/{feed_key}/data/{data_id} para borrar un punto de datos.

Get Feed Data
→ GET /feeds/{feed_key}/data para traer datos con filtros (start_time, end_time, limit, etc.).

Chart Feed Data
→ Mismo endpoint de GET /feeds/{feed_key}/data pero procesado para devolverlo en formato que Angular pueda graficar (por ejemplo con Chart.js).

All Feeds
→ GET /feeds para listar todos tus feeds (útil si manejas varios sensores).

Create Feed
→ POST /feeds para crear un feed nuevo (por ejemplo si agregas otro sensor).

Get Feed
→ GET /feeds/{feed_key} para obtener la información de un feed específico.

Update Feed
→ PATCH /feeds/{feed_key} para cambiar nombre o configuración.

Delete Feed
→ DELETE /feeds/{feed_key} para borrarlo.

## mis feeds que tengo
Puerta // feed que tiene un boton off/ on que puede controlar la cerradura del servo desde adafruit

estado-puerta// boleano que indica si esta cerrado o abierto la puerta 

humedad // muestra  la humedad presente 

intentos-fallidos//, marca los errores al equivocarse hasta 3

objeto// sensor ultrasonico que indica en cm la proximidad de lo que mide, aprox 19 cm y se pondra que si detecta algo menor a 18 cm se pondra como estado de "objeto encontrado" y si sobre pasa los 18 cm se pondra como "no hay objeto detectado 

temperatura  // muestra la temperatura en el ambiente 

vibracion // sensor tilt swicht que indica  que se mueve o manipula la caja mediante boleanos 

## version del codigo de arduinoide con configuracion de adafruit y key

#include <WiFi.h>
#include <PubSubClient.h>
#include <Keypad.h>
#include <ESP32Servo.h>
#include <DHT.h>

// ==================== CONFIG WIFI / MQTT ====================
const char* ssid          = "SERGIO CAGON";
const char* password_wifi = "12345678";

const char* AIO_USER = "gabinsky123";
const char* AIO_KEY  = "aio_Eoqc99e22buAA9tL4rzxnukGV6Z3";
const char* MQTT_HOST = "io.adafruit.com";
const uint16_t MQTT_PORT = 1883; // 8883 para SSL (requeriría WiFiClientSecure)

WiFiClient wifiClient;
PubSubClient client(wifiClient);

// ==================== DHT ====================
#define DHTPIN 21
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ==================== KEYPAD ====================
const byte ROWS = 4, COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {13, 12, 14, 27};
byte colPins[COLS] = {26, 25, 33, 32};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// ==================== PINES ====================
Servo lockServo;
const int servoPin = 4;
const int buzzerPin = 22;
const int sw520dPin = 23;
const int trigPin = 18;
const int echoPin = 19;
const int pinR = 5;
const int pinG = 16;
const int pinB = 17;

// ==================== SERVO ====================
const int ANGULO_CERRADO = 90;
const int ANGULO_ABIERTO = 0;

// ==================== PASSWORD ====================
const int passwordLength = 4;
const char password[passwordLength + 1] = "1144";
char input[passwordLength + 1];
byte inputPos = 0;
bool doorOpen = false;

// ==================== ALARMAS ====================
int failedAttempts = 0;
bool buzzerOn = false;
unsigned long buzzerStartTime = 0;
const unsigned long buzzerDuration = 30000;
unsigned long ultimoCambioPatron = 0;
int patronActual = 0;

// ==================== LED ERROR ====================
bool errorLedActive = false;
unsigned long errorLedStartTime = 0;
const unsigned long errorLedDuration = 1500;

// ==================== SIRENA FLASH ====================
unsigned long lastFlashTime = 0;
const unsigned long flashInterval = 180;
bool flashState = false;

// ==================== TIMERS ====================
unsigned long lastSensorTime = 0;
const unsigned long sensorInterval = 5000;
unsigned long lastDataSend = 0;
const unsigned long sendInterval = 15000;

// ==================== SENSORES ====================
float currentTemperature = 0;
float currentHumidity = 0;
float currentDistance = 0;
bool tiltDetected = false;

// ==================== ENVÍO ESCALONADO ====================
unsigned long lastAdafruitSend = 0;
int sendStep = 0;
unsigned long stepDelay = 1000;

// ==================== VIBRACIÓN ====================
volatile bool balanceoDetectado = false;
void IRAM_ATTR balanceoISR() {
  balanceoDetectado = true;
  tiltDetected = true;
}

// ==================== SONIDOS PIN (no bloqueantes) ====================
enum PinSeqType { PINSEQ_NONE, PINSEQ_OK, PINSEQ_ERR };
PinSeqType pinSeq = PINSEQ_NONE;
uint8_t pinSeqStep = 0;
unsigned long pinSeqLast = 0;

// PIN correcto (asc)
const uint16_t pinOkFreqs[] = { 1100, 1400, 1800 };
const uint16_t pinOkDur[]   = { 70,   70,   120  };
// PIN incorrecto (desc)
const uint16_t pinErrFreqs[] = { 900, 650, 500 };
const uint16_t pinErrDur[]   = { 90,  90,  140 };

void startPinOkSound() {
  if (buzzerOn) return;
  pinSeq = PINSEQ_OK;
  pinSeqStep = 0;
  pinSeqLast = millis();
  tone(buzzerPin, pinOkFreqs[0], pinOkDur[0]);
}
void startPinErrorSound() {
  if (buzzerOn) return;
  pinSeq = PINSEQ_ERR;
  pinSeqStep = 0;
  pinSeqLast = millis();
  tone(buzzerPin, pinErrFreqs[0], pinErrDur[0]);
}
void updatePinSeqSounds() {
  if (pinSeq == PINSEQ_NONE) return;
  unsigned long now = millis();
  const uint16_t *freqs;
  const uint16_t *durs;
  uint8_t total;
  if (pinSeq == PINSEQ_OK) {
    freqs = pinOkFreqs; durs = pinOkDur;
    total = sizeof(pinOkFreqs)/sizeof(pinOkFreqs[0]);
  } else {
    freqs = pinErrFreqs; durs = pinErrDur;
    total = sizeof(pinErrFreqs)/sizeof(pinErrFreqs[0]);
  }
  if (now - pinSeqLast >= durs[pinSeqStep] + 40) {
    pinSeqStep++;
    if (pinSeqStep >= total) {
      pinSeq = PINSEQ_NONE;
    } else {
      pinSeqLast = now;
      tone(buzzerPin, freqs[pinSeqStep], durs[pinSeqStep]);
    }
  }
}

// ==================== UTIL LED / BEEP ====================
void setColor(int r, int g, int b) {
  // En tu cableado original están cruzados: respeta tu mapping
  analogWrite(pinR, r);
  analogWrite(pinG, b); // azul real
  analogWrite(pinB, g); // verde real
}
void aplicarColorEstado() {
  if (doorOpen) setColor(0, 255, 0);  // verde
  else setColor(0, 0, 255);           // azul
}
void bipCorto()       { tone(buzzerPin, 1500, 80); }
void beepError()      { tone(buzzerPin, 650, 100); }
void mostrarError() {
  setColor(255, 120, 0);
  beepError();
  errorLedActive = true;
  errorLedStartTime = millis();
}
void manejarLedError() {
  if (errorLedActive && (millis() - errorLedStartTime >= errorLedDuration)) {
    errorLedActive = false;
    aplicarColorEstado();
  }
}

// ==================== MQTT TOPICS HELPERS ====================
String topicFeed(const char* feed) {
  // <user>/feeds/<feed>
  String t = String(AIO_USER) + "/feeds/" + feed;
  return t;
}
bool mqttPublish(const char* feed, const String& value) {
  if (!client.connected()) return false;
  String t = topicFeed(feed);
  return client.publish(t.c_str(), value.c_str(), true); // retain = true (opcional)
}

// ===== Wrappers (mismos nombres de feeds) =====
bool enviarTemperatura(float temp) { return mqttPublish("temperatura", String(temp, 1)); }
bool enviarHumedad(float hum)      { return mqttPublish("humedad", String(hum, 1)); }
bool enviarDistanciaObjeto(float d){ return mqttPublish("objeto", String(d, 1)); }
bool enviarEstadoPuerta(bool a)    { return mqttPublish("estado-puerta", a ? "1" : "0"); }
bool enviarVibracion(bool v)       { return mqttPublish("vibracion", v ? "1" : "0"); }
bool enviarIntentosFallidos(int n) { return mqttPublish("intentos-fallidos", String(n)); }
bool enviarControlPuerta(int ang)  { return mqttPublish("puerta", (ang == ANGULO_ABIERTO) ? "1" : "0"); }

// ==================== SERVO MOVIMIENTO ====================
void moverServoCerrado() {
  lockServo.write(ANGULO_CERRADO);
  doorOpen = false;
  aplicarColorEstado();
  Serial.println("🔒 Caja CERRADA");
  enviarEstadoPuerta(false);
  enviarControlPuerta(ANGULO_CERRADO);
}
void moverServoAbierto() {
  lockServo.write(ANGULO_ABIERTO);
  doorOpen = true;
  aplicarColorEstado();
  Serial.println("🔓 Caja ABIERTA");
  enviarEstadoPuerta(true);
  enviarControlPuerta(ANGULO_ABIERTO);
}

// ==================== PATRONES SIRENA ====================
void policeFlash() {
  if (!buzzerOn) return;
  unsigned long now = millis();
  if (now - lastFlashTime >= flashInterval) {
    lastFlashTime = now;
    flashState = !flashState;
    if (flashState) setColor(255, 0, 0);
    else setColor(0, 0, 255);
  }
}
void patronPolicia() {
  static unsigned long lastFreqChange = 0;
  static int freq = 1000;
  static bool up = true;
  unsigned long now = millis();
  if (now - lastFreqChange >= 40) {
    freq += up ? 60 : -60;
    if (freq >= 2200) { freq = 2200; up = false; }
    if (freq <= 1000) { freq = 1000; up = true; }
    tone(buzzerPin, freq);
    policeFlash();
    lastFreqChange = now;
  }
}
void patronSirenaLarga() {
  static unsigned long lastFreqChange = 0;
  static int freq = 800;
  static bool up = true;
  unsigned long now = millis();
  if (now - lastFreqChange >= 15) {
    freq += up ? 20 : -15;
    if (freq >= 2500) { freq = 2500; up = false; }
    if (freq <= 800)  { freq = 800;  up = true; }
    tone(buzzerPin, freq);
    policeFlash();
    lastFreqChange = now;
  }
}
void patronEmergenciaFuerte() {
  static unsigned long lastBeepChange = 0;
  static bool high = true;
  unsigned long now = millis();
  if (now - lastBeepChange >= 120) {
    tone(buzzerPin, high ? 1800 : 1200);
    high = !high;
    policeFlash();
    lastBeepChange = now;
  }
}
void sirenaAturdidora() {
  unsigned long ahora = millis();
  if (ahora - ultimoCambioPatron >= 4000) {
    patronActual = (patronActual + 1) % 3;
    ultimoCambioPatron = ahora;
    Serial.print("🚨 Patrón sirena: ");
    if (patronActual == 0) Serial.println("POLICIA");
    else if (patronActual == 1) Serial.println("SIRENA LARGA");
    else Serial.println("EMERGENCIA");
  }
  switch (patronActual) {
    case 0: patronPolicia(); break;
    case 1: patronSirenaLarga(); break;
    case 2: patronEmergenciaFuerte(); break;
  }
}

// ==================== SENSORES ====================
void printTemperatureHumidity() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) {
    Serial.println("❌ Error leyendo sensor DHT!");
    return;
  }
  currentTemperature = t;
  currentHumidity = h;
  Serial.print("🌡️ Temperatura: "); Serial.print(t); Serial.println(" °C");
  Serial.print("💧 Humedad: "); Serial.print(h); Serial.println(" %");
  if (h >= 30 && h <= 60 && t >= 18 && t <= 27) Serial.println("✅ Ambiente estable");
  else Serial.println("⚠️ Ambiente NO estable");
}
bool objetoDetectado() {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long dur = pulseIn(echoPin, HIGH, 25000);
  float distancia = (dur / 2.0) / 29.1;
  currentDistance = distancia;
  Serial.print("📏 Distancia: "); Serial.print(distancia); Serial.println(" cm");
  if (distancia > 0 && distancia <= 15) {
    Serial.println("📦 Objeto detectado!");
    return true;
  } else {
    Serial.println("⭕ No hay objetos cerca");
    return false;
  }
}

// ==================== WIFI / MQTT ====================
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print("🌐 Conectando a WiFi");
  WiFi.begin(ssid, password_wifi);
  uint8_t tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 50) {
    delay(200);
    Serial.print(".");
    tries++;
    yield();
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi conectado");
    Serial.print("📡 IP: "); Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ No se pudo conectar WiFi (sigo no-bloqueante)");
  }
}

String mqttClientId() {
  uint32_t id = (uint32_t)ESP.getEfuseMac();
  String cid = "ESP32Safe-" + String(id, HEX);
  return cid;
}

unsigned long lastMqttAttempt = 0;
const unsigned long mqttRetryMs = 3000;

void subscribeControlFeeds() {
  // Control remoto de puerta
  String t = topicFeed("puerta");
  client.subscribe(t.c_str());
  Serial.print("📡 Suscrito a: "); Serial.println(t);
}

void ensureMqtt() {
  if (client.connected()) return;
  unsigned long now = millis();
  if (now - lastMqttAttempt < mqttRetryMs) return;
  lastMqttAttempt = now;

  Serial.print("🔄 Conectando MQTT...");
  String cid = mqttClientId();
  if (client.connect(cid.c_str(), AIO_USER, AIO_KEY)) {
    Serial.println("✅ MQTT conectado");
    subscribeControlFeeds();
    // Publicar estado inicial
    enviarEstadoPuerta(doorOpen);
    enviarIntentosFallidos(failedAttempts);
    enviarControlPuerta(doorOpen ? ANGULO_ABIERTO : ANGULO_CERRADO);
  } else {
    Serial.print("❌ Falló MQTT (state "); Serial.print(client.state()); Serial.println(")");
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String t = String(topic);
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];
  msg.trim();

  Serial.print("📥 MQTT ["); Serial.print(t); Serial.print("] = ");
  Serial.println(msg);

  // Feed de control "puerta": 1=abrir, 0=cerrar
  if (t.endsWith("/puerta")) {
    if (msg == "1" || msg.equalsIgnoreCase("ON")) {
      Serial.println("🟢 Abrir puerta desde MQTT");
      if (!doorOpen) {
        moverServoAbierto();
        startPinOkSound();
      }
    } else {
      Serial.println("🔴 Cerrar puerta desde MQTT");
      if (doorOpen) {
        moverServoCerrado();
        startPinOkSound();
      }
    }
  }
}

// ==================== ENVÍO ESCALONADO ====================
void manejarEnvioAdafruit() {
  unsigned long now = millis();
  if (now - lastAdafruitSend >= stepDelay && client.connected()) {
    switch (sendStep) {
      case 0: enviarTemperatura(currentTemperature); break;
      case 1: enviarHumedad(currentHumidity); break;
      case 2: enviarDistanciaObjeto(currentDistance); break;
      case 3:
        if (tiltDetected) {
          enviarVibracion(true);
          tiltDetected = false;
        } else {
          enviarVibracion(false);
        }
        break;
    }
    sendStep++;
    if (sendStep > 3) {
      sendStep = 0;
      lastDataSend = now;
      Serial.println("✅ Datos publicados (MQTT)");
    }
    lastAdafruitSend = now;
  }
}

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println("🚀 Iniciando Sistema de Caja Fuerte (MQTT)");

  connectWiFi();

  client.setServer(MQTT_HOST, MQTT_PORT);
  client.setCallback(mqttCallback);
  client.setKeepAlive(30);      // segundos
  client.setBufferSize(1024);   // por si mandas JSON más grande

  lockServo.attach(servoPin);
  moverServoCerrado();

  pinMode(buzzerPin, OUTPUT); noTone(buzzerPin);
  pinMode(sw520dPin, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(sw520dPin), balanceoISR, FALLING);
  pinMode(trigPin, OUTPUT); pinMode(echoPin, INPUT);
  pinMode(pinR, OUTPUT); pinMode(pinG, OUTPUT); pinMode(pinB, OUTPUT);
  dht.begin();

  Serial.println("🔑 Ingresa la contraseña:");
}

// ==================== LOOP ====================
void loop() {
  connectWiFi();
  ensureMqtt();
  client.loop();               // importante para recibir MQTT

  unsigned long currentMillis = millis();

  manejarLedError();
  updatePinSeqSounds();

  // ===== TECLADO =====
  char key = keypad.getKey();
  if (key) {
    bipCorto();

    if (key == 'D') {
      Serial.print("🔍 Puerta: "); Serial.println(doorOpen ? "ABIERTA" : "CERRADA");
      Serial.print("📶 WiFi: "); Serial.println(WiFi.status() == WL_CONNECTED ? "CONECTADO" : "DESCONECTADO");
      Serial.print("📡 MQTT: "); Serial.println(client.connected() ? "CONECTADO" : "DESCONECTADO");
      return;
    }
    if (key == '#') {
      inputPos = 0; input[0] = '\0';
      Serial.println("🗑️ Entrada borrada");
      return;
    }
    if (key == '*') {
      input[inputPos] = '\0';
      Serial.print("🔐 Verificando: "); Serial.println(input);
      if (strcmp(input, password) == 0) {
        Serial.println("✅ Correcta!");
        failedAttempts = 0;
        enviarIntentosFallidos(0);
        startPinOkSound();
        if (doorOpen) moverServoCerrado();
        else          moverServoAbierto();
        bipCorto(); bipCorto();
      } else {
        failedAttempts++;
        Serial.print("❌ Incorrecta. Intento ");
        Serial.println(failedAttempts);
        enviarIntentosFallidos(failedAttempts);
        mostrarError();
        startPinErrorSound();
        if (failedAttempts >= 3) {
          Serial.println("🚨 ¡Alarma!");
          buzzerOn = true;
          buzzerStartTime = currentMillis;
          ultimoCambioPatron = currentMillis;
          patronActual = 0;
          lastFlashTime = currentMillis;
          flashState = false;
          errorLedActive = false;
          pinSeq = PINSEQ_NONE; // cancelar secuencias si entra alarma
        }
      }
      inputPos = 0; input[0] = '\0';
      return;
    }
    if (inputPos < passwordLength) {
      input[inputPos++] = key;
      Serial.print("*");
    }
  }

  // ===== ALARMA =====
  if (buzzerOn) {
    sirenaAturdidora();
    if (currentMillis - buzzerStartTime >= buzzerDuration) {
      buzzerOn = false;
      noTone(buzzerPin);
      failedAttempts = 0;
      patronActual = 0;
      aplicarColorEstado();
      Serial.println("🔇 Alarma apagada.");
      enviarIntentosFallidos(0);
    }
    return; // mientras suena la alarma, no hacemos más
  }

  // ===== VIBRACIÓN =====
  if (balanceoDetectado) {
    Serial.println("⚠️ Vibración detectada!");
    tiltDetected = true;
    enviarVibracion(true);
    balanceoDetectado = false;
  }

  // ===== SENSORES =====
  if (currentMillis - lastSensorTime >= sensorInterval) {
    Serial.println("📊 Leyendo sensores...");
    printTemperatureHumidity();
    objetoDetectado();
    lastSensorTime = currentMillis;
  }

  // ===== ENVÍO (escalonado) =====
  if (currentMillis - lastDataSend >= sendInterval && client.connected()) {
    if (sendStep == 0) Serial.println("📤 Publicando en Adafruit IO (MQTT)...");
    manejarEnvioAdafruit();
  }
}



=======
>>>>>>> 84b79395e96e8ba7faccbdb1ac87c141adbe3ac0
