import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Item from './models/Item.js';
dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'development_secret_change_me';

mongoose.connect('mongodb+srv://admin:admin1234@cluster0.fxgkxru.mongodb.net/devportfolio?retryWrites=true&w=majority')
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err.message));

const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Please sign in first.' });
  try { req.userId = jwt.verify(token, JWT_SECRET).id; next(); }
  catch { return res.status(401).json({ message: 'Session expired. Please sign in again.' }); }
};

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ message: 'Could not create account.', error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash)))
      return res.status(401).json({ message: 'Invalid email or password.' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ message: 'Login failed.', error: e.message }); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('name email');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: { id: user._id, name: user.name, email: user.email } });
});

app.get('/api/items', auth, async (req, res) => {
  const items = await Item.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(items);
});
app.post('/api/items', auth, async (req, res) => {
  const { type, title, description, extra } = req.body;
  if (!type || !title) return res.status(400).json({ message: 'Type and title are required.' });
  const item = await Item.create({ user: req.userId, type, title, description: description || '', extra: extra || '' });
  res.status(201).json(item);
});
app.put('/api/items/:id', auth, async (req, res) => {
  const item = await Item.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  res.json(item);
});
app.delete('/api/items/:id', auth, async (req, res) => {
  const item = await Item.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  res.json({ message: 'Deleted successfully.' });
});

app.listen(PORT, () => console.log(`✓ API server running at http://localhost:${PORT}`));
