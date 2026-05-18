import Database from 'better-sqlite3';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const legacyDataDir = path.resolve(__dirname, '..', 'data');

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

function resolveDbPath() {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }

  return path.join(legacyDataDir, 'app.db');
}

let db;

function getDb() {
  if (!db) {
    const dbPath = resolveDbPath();
    mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    createSchema(db);
  }

  return db;
}

function createSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      cover_url TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS youtube_lessons (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      thumbnail TEXT NOT NULL DEFAULT '',
      lesson_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );
  `);
}

function rowToBook(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    url: row.url,
    description: row.description,
    coverUrl: row.cover_url,
    createdAt: row.created_at,
    ...(row.updated_at ? { updatedAt: row.updated_at } : {})
  };
}

function rowToLesson(row) {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    description: row.description,
    thumbnail: row.thumbnail,
    order: row.lesson_order,
    createdAt: row.created_at,
    ...(row.updated_at ? { updatedAt: row.updated_at } : {})
  };
}

function bookToRow(book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author || '',
    url: book.url,
    description: book.description || '',
    cover_url: book.coverUrl || '',
    created_at: book.createdAt,
    updated_at: book.updatedAt || null
  };
}

function lessonToRow(lesson) {
  return {
    id: lesson.id,
    title: lesson.title,
    url: lesson.url,
    description: lesson.description || '',
    thumbnail: lesson.thumbnail || '',
    lesson_order: Number(lesson.order) || 0,
    created_at: lesson.createdAt,
    updated_at: lesson.updatedAt || null
  };
}

function readLegacyJson(fileName, fallback) {
  const filePath = path.join(legacyDataDir, fileName);

  if (!existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function seedAdmin(database) {
  database.prepare(`
    INSERT INTO admin (id, username, password_hash)
    VALUES (1, @username, @passwordHash)
  `).run(defaultAdmin);
}

function seedBooks(database, books) {
  const insert = database.prepare(`
    INSERT INTO books (id, title, author, url, description, cover_url, created_at, updated_at)
    VALUES (@id, @title, @author, @url, @description, @cover_url, @created_at, @updated_at)
  `);

  for (const book of books) {
    insert.run(bookToRow(book));
  }
}

function seedLessons(database, lessons) {
  const insert = database.prepare(`
    INSERT INTO youtube_lessons (id, title, url, description, thumbnail, lesson_order, created_at, updated_at)
    VALUES (@id, @title, @url, @description, @thumbnail, @lesson_order, @created_at, @updated_at)
  `);

  for (const lesson of lessons) {
    insert.run(lessonToRow(lesson));
  }
}

function migrateLegacyJson(database) {
  const adminRow = database.prepare('SELECT id FROM admin WHERE id = 1').get();
  const bookCount = database.prepare('SELECT COUNT(*) AS count FROM books').get().count;
  const lessonCount = database.prepare('SELECT COUNT(*) AS count FROM youtube_lessons').get().count;

  if (!adminRow) {
    const legacyAdmin = readLegacyJson('admin.json', defaultAdmin);
    database.prepare(`
      INSERT INTO admin (id, username, password_hash)
      VALUES (1, @username, @passwordHash)
    `).run(legacyAdmin);
  }

  if (bookCount === 0) {
    const legacyBooks = readLegacyJson('books.json', defaultBooks);
    seedBooks(database, Array.isArray(legacyBooks) && legacyBooks.length ? legacyBooks : defaultBooks);
  }

  if (lessonCount === 0) {
    const legacyLessons = readLegacyJson('youtube.json', defaultYoutube);
    seedLessons(
      database,
      Array.isArray(legacyLessons) && legacyLessons.length ? legacyLessons : defaultYoutube
    );
  }
}

function seedDefaults(database) {
  const adminRow = database.prepare('SELECT id FROM admin WHERE id = 1').get();

  if (!adminRow) {
    seedAdmin(database);
  }

  const bookCount = database.prepare('SELECT COUNT(*) AS count FROM books').get().count;
  if (bookCount === 0) {
    seedBooks(database, defaultBooks);
  }

  const lessonCount = database.prepare('SELECT COUNT(*) AS count FROM youtube_lessons').get().count;
  if (lessonCount === 0) {
    seedLessons(database, defaultYoutube);
  }
}

export async function initDb() {
  const database = getDb();
  const hasLegacyJson =
    existsSync(path.join(legacyDataDir, 'admin.json'))
    || existsSync(path.join(legacyDataDir, 'books.json'))
    || existsSync(path.join(legacyDataDir, 'youtube.json'));

  if (hasLegacyJson) {
    migrateLegacyJson(database);
  } else {
    seedDefaults(database);
  }

  const dbPath = resolveDbPath();
  console.log(`SQLite: ${dbPath}`);
}

export async function getAdmin() {
  const row = getDb().prepare('SELECT username, password_hash AS passwordHash FROM admin WHERE id = 1').get();
  return row || defaultAdmin;
}

export async function getBooks() {
  const rows = getDb()
    .prepare('SELECT * FROM books ORDER BY datetime(created_at) DESC')
    .all();

  return rows.map(rowToBook);
}

export async function saveBooks(books) {
  const database = getDb();
  const insert = database.prepare(`
    INSERT INTO books (id, title, author, url, description, cover_url, created_at, updated_at)
    VALUES (@id, @title, @author, @url, @description, @cover_url, @created_at, @updated_at)
  `);

  const replaceAll = database.transaction((items) => {
    database.prepare('DELETE FROM books').run();

    for (const book of items) {
      insert.run(bookToRow(book));
    }
  });

  replaceAll(books);
}

export async function getYoutubeLessons() {
  const rows = getDb()
    .prepare('SELECT * FROM youtube_lessons ORDER BY lesson_order ASC, datetime(created_at) ASC')
    .all();

  return rows.map(rowToLesson);
}

export async function saveYoutubeLessons(lessons) {
  const database = getDb();
  const insert = database.prepare(`
    INSERT INTO youtube_lessons (id, title, url, description, thumbnail, lesson_order, created_at, updated_at)
    VALUES (@id, @title, @url, @description, @thumbnail, @lesson_order, @created_at, @updated_at)
  `);

  const replaceAll = database.transaction((items) => {
    database.prepare('DELETE FROM youtube_lessons').run();

    for (const lesson of items) {
      insert.run(lessonToRow(lesson));
    }
  });

  replaceAll(lessons);
}
