const axios = require('axios');

const AIO_USER = 'gabinsky123';
const AIO_KEY = 'aio_Eoqc99e22buAA9tL4rzxnukGV6Z3';
const FEED_KEY = 'pin-teclado';

// URL para crear datos en el feed
const url = `https://io.adafruit.com/api/v2/${AIO_USER}/feeds/${FEED_KEY}/data`;

async function testPinUpdate() {
  try {
    console.log('🔐 Enviando PIN 1144 a Adafruit IO...');
    
    const response = await axios.post(url, {
      value: '1144'
    }, {
      headers: {
        'X-AIO-Key': AIO_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ PIN enviado exitosamente:', response.data);
    
    // Ahora intentar cambiar a otro PIN
    console.log('🔐 Enviando PIN 9999 para probar cambio...');
    
    const response2 = await axios.post(url, {
      value: '9999'
    }, {
      headers: {
        'X-AIO-Key': AIO_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ PIN cambiado exitosamente:', response2.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function getCurrentPin() {
  try {
    const response = await axios.get(`https://io.adafruit.com/api/v2/${AIO_USER}/feeds/${FEED_KEY}/data/last`, {
      headers: {
        'X-AIO-Key': AIO_KEY
      }
    });
    
    console.log('📋 PIN actual:', response.data);
  } catch (error) {
    console.error('❌ Error obteniendo PIN:', error.response?.data || error.message);
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🧪 Iniciando pruebas de PIN...\n');
  
  await getCurrentPin();
  console.log();
  
  await testPinUpdate();
  console.log();
  
  await getCurrentPin();
}

runTests();
