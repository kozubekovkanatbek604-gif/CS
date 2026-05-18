import express from 'express';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { getBooks, saveBooks } from '../services/db.js';

const router = express.Router();

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function normalizeBook(payload, existing = {}) {
  const title = String(payload.title || '').trim();
  const author = String(payload.author || '').trim();
  const url = String(payload.url || '').trim();
  const description = String(payload.description || '').trim();
  const coverUrl = String(payload.coverUrl || '').trim();

  if (!title || !url || !isValidUrl(url)) {
    return { error: 'Укажите название и корректную ссылку на книгу' };
  }

  if (coverUrl && !isValidUrl(coverUrl)) {
    return { error: 'Ссылка на обложку должна быть корректным URL' };
  }

  return {
    book: {
      ...existing,
      title,
      author,
      url,
      description,
      coverUrl,
      updatedAt: new Date().toISOString()
    }
  };
}

router.get('/', async (req, res) => {
  const books = await getBooks();
  res.json(books);
});

router.post('/', requireAuth, async (req, res) => {
  const { book, error } = normalizeBook(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const books = await getBooks();
  const newBook = {
    ...book,
    id: uuid(),
    createdAt: new Date().toISOString()
  };

  books.unshift(newBook);
  await saveBooks(books);
  return res.status(201).json(newBook);
});

router.put('/:id', requireAuth, async (req, res) => {
  const books = await getBooks();
  const index = books.findIndex((book) => book.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Книга не найдена' });
  }

  const { book, error } = normalizeBook(req.body, books[index]);

  if (error) {
    return res.status(400).json({ message: error });
  }

  books[index] = book;
  await saveBooks(books);
  return res.json(book);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const books = await getBooks();
  const nextBooks = books.filter((book) => book.id !== req.params.id);

  if (nextBooks.length === books.length) {
    return res.status(404).json({ message: 'Книга не найдена' });
  }

  await saveBooks(nextBooks);
  return res.json({ id: req.params.id });
});

export default router;
