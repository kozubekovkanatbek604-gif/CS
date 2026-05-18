import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..', 'data');

const files = {
  admin: path.join(dataDir, 'admin.json'),
  books: path.join(dataDir, 'books.json'),
  youtube: path.join(dataDir, 'youtube.json')
};

const defaultAdmin = {
  username: 'admin',
  passwordHash: Buffer.from('IS-admin123456', 'utf8').toString('base64')
};

const defaultBooks = [
  {
    id: 'sample-book-1',
    title: 'Основы кибербезопасности',
    author: 'Cyber Library',
    url: 'https://owasp.org/www-project-top-ten/',
    description: 'Стартовая подборка материалов OWASP для понимания главных рисков веб-безопасности.',
    coverUrl: '',
    createdAt: new Date().toISOString()
  }
];

const defaultYoutube = [
  {
    id: 'sample-video-1',
    title: 'Введение в кибербезопасность',
    url: 'https://www.youtube.com/watch?v=inWWhr5tnEA',
    description: 'Базовый урок для знакомства с направлениями и практиками информационной безопасности.',
    thumbnail: 'https://img.youtube.com/vi/inWWhr5tnEA/mqdefault.jpg',
    order: 1,
    createdAt: new Date().toISOString()
  }
];

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
}

async function readJsonFile(filePath, fallback) {
  await ensureDataDir();

  try {
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    await writeJsonFile(filePath, fallback);
    return fallback;
  }
}

async function writeJsonFile(filePath, data) {
  await ensureDataDir();
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function initDb() {
  await readJsonFile(files.admin, defaultAdmin);
  await readJsonFile(files.books, defaultBooks);
  await readJsonFile(files.youtube, defaultYoutube);
}

export async function getAdmin() {
  return readJsonFile(files.admin, defaultAdmin);
}

export async function getBooks() {
  return readJsonFile(files.books, []);
}

export async function saveBooks(books) {
  await writeJsonFile(files.books, books);
}

export async function getYoutubeLessons() {
  return readJsonFile(files.youtube, []);
}

export async function saveYoutubeLessons(lessons) {
  await writeJsonFile(files.youtube, lessons);
}
