const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Servidor Backend de Caja Fuerte funcionando!',
    version: '1.0.0'
  });
});

// Importar rutas
const authRoutes = require('./routes/auth');

// Usar rutas
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});

module.exports = app;
