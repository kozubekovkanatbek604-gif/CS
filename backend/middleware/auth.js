import jwt from 'jsonwebtoken';

export const jwtSecret = process.env.JWT_SECRET || 'dev-cyber-book-secret';
export const cookieName = 'cyber_admin_token';

export function requireAuth(req, res, next) {
  const token = req.cookies?.[cookieName];

  if (!token) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Сессия недействительна' });
  }
}

export function createAuthCookie(res, payload) {
  const token = jwt.sign(payload, jwtSecret, { expiresIn: '8h' });

  res.cookie(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(cookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
}
