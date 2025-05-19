const express = require('express');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const SECRET_KEY = 'your_secret_key';

// Registro
router.post('/register', async (req, res) => {
  console.log('Datos recibidos en /register:', req.body);
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).send('Usuario registrado exitosamente');
  } catch (error) {
    console.error('Error en registro:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'El nombre de usuario o correo ya está en uso' });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ error: 'Error de validación: ' + error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Credenciales inválidas');
    }
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(400).send('Error al iniciar sesión');
  }
});

module.exports = router;