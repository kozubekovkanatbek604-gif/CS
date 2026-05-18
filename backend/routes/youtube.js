import express from 'express';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { getYoutubeLessons, saveYoutubeLessons } from '../services/jsonDb.js';

const router = express.Router();

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function extractYoutubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1);
    }

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2];
      }

      return parsed.searchParams.get('v');
    }

    return '';
  } catch {
    return '';
  }
}

function normalizeLesson(payload, existing = {}) {
  const title = String(payload.title || '').trim();
  const url = String(payload.url || '').trim();
  const description = String(payload.description || '').trim();
  const thumbnail = String(payload.thumbnail || '').trim();
  const order = Number.isFinite(Number(payload.order)) ? Number(payload.order) : 0;

  if (!title || !url || !isValidUrl(url)) {
    return { error: 'Укажите название и корректную ссылку YouTube' };
  }

  if (thumbnail && !isValidUrl(thumbnail)) {
    return { error: 'Ссылка на превью должна быть корректным URL' };
  }

  const videoId = extractYoutubeId(url);

  return {
    lesson: {
      ...existing,
      title,
      url,
      description,
      thumbnail: thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : ''),
      order,
      updatedAt: new Date().toISOString()
    }
  };
}

router.get('/', async (req, res) => {
  const lessons = await getYoutubeLessons();
  res.json([...lessons].sort((a, b) => Number(a.order) - Number(b.order)));
});

router.post('/', requireAuth, async (req, res) => {
  const { lesson, error } = normalizeLesson(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const lessons = await getYoutubeLessons();
  const newLesson = {
    ...lesson,
    id: uuid(),
    createdAt: new Date().toISOString()
  };

  lessons.push(newLesson);
  await saveYoutubeLessons(lessons);
  return res.status(201).json(newLesson);
});

router.put('/:id', requireAuth, async (req, res) => {
  const lessons = await getYoutubeLessons();
  const index = lessons.findIndex((lesson) => lesson.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Урок не найден' });
  }

  const { lesson, error } = normalizeLesson(req.body, lessons[index]);

  if (error) {
    return res.status(400).json({ message: error });
  }

  lessons[index] = lesson;
  await saveYoutubeLessons(lessons);
  return res.json(lesson);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const lessons = await getYoutubeLessons();
  const nextLessons = lessons.filter((lesson) => lesson.id !== req.params.id);

  if (nextLessons.length === lessons.length) {
    return res.status(404).json({ message: 'Урок не найден' });
  }

  await saveYoutubeLessons(nextLessons);
  return res.json({ id: req.params.id });
});

export default router;
