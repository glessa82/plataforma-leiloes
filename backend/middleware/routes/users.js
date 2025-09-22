const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Seu modelo de usuário
const authMiddleware = require('../middleware/auth'); // O middleware de autenticação

// Rota de registro protegida
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Nome de usuário já existe.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();
    
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erro do servidor.' });
  }
});

module.exports = router;