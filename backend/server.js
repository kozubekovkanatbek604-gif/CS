import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import booksRoutes from './routes/books.js';
import youtubeRoutes from './routes/youtube.js';
import { initDb } from './services/jsonDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3001;

await initDb();

app.use(cors({
  origin:
    process.env.CLIENT_ORIGIN
    || (process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173'),
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/youtube', youtubeRoutes);

const frontendDist = path.resolve(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API маршрут не найден' });
  }

  return res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(port, () => {
  console.log(`Cyber Book API запущен на http://localhost:${port}`);
});
