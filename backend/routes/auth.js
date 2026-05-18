import express from 'express';
import { clearAuthCookie, createAuthCookie, requireAuth } from '../middleware/auth.js';
import { getAdmin } from '../services/db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await getAdmin();
  const passwordHash = Buffer.from(password || '', 'utf8').toString('base64');

  if (username !== admin.username || passwordHash !== admin.passwordHash) {
    return res.status(401).json({ message: 'Неверный логин или пароль' });
  }

  createAuthCookie(res, { username: admin.username });
  return res.json({ username: admin.username });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ username: req.user.username });
});

router.post('/logout', requireAuth, (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Вы вышли из админ-панели' });
});

export default router;
