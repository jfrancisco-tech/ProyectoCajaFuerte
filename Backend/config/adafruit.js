// Configuración para Adafruit IO
const config = {
  AIO_USER: 'gabinsky123',
  AIO_KEY: 'aio_Eoqc99e22buAA9tL4rzxnukGV6Z3',
  BASE_URL: 'https://io.adafruit.com/api/v2',
  
  // Headers para las peticiones
  getHeaders() {
    return {
      'X-AIO-Key': this.AIO_KEY,
      'Content-Type': 'application/json'
    };
  },

  // URLs para los feeds
  getFeedUrl(feedKey) {
    return `${this.BASE_URL}/${this.AIO_USER}/feeds/${feedKey}`;
  },

  getFeedDataUrl(feedKey) {
    return `${this.BASE_URL}/${this.AIO_USER}/feeds/${feedKey}/data`;
  },

  getLastDataUrl(feedKey) {
    return `${this.BASE_URL}/${this.AIO_USER}/feeds/${feedKey}/data/last`;
  },

  getDataPointUrl(feedKey, dataId) {
    return `${this.BASE_URL}/${this.AIO_USER}/feeds/${feedKey}/data/${dataId}`;
  },

  getAllFeedsUrl() {
    return `${this.BASE_URL}/${this.AIO_USER}/feeds`;
  }
};

module.exports = config;
