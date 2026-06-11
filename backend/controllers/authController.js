const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/Schemas');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

async function seedDemoUser() {
  const exists = await User.findOne({ email: 'demo@demo.com' });
  if (!exists) {
    const hashed = await bcrypt.hash('Demo1234', 10);
    await User.create({ email: 'demo@demo.com', password: hashed, rol: 'admin' });
    console.log('Usuario admin demo creado: demo@demo.com / Demo1234');
  }
}

async function register(req, res) {
  try {
    const { email, password, rol } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'El email ya está registrado' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, rol: rol || 'alumno' });
    res.status(201).json({ message: 'Usuario creado', id: user._id, rol: user.rol });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign(
      { id: user._id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, email: user.email, rol: user.rol });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { seedDemoUser, register, login };
