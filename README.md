# Cyber Book Shelf

Веб-сайт на Vue 3 и Express для книг, ссылок и YouTube-уроков по кибербезопасности.

## Возможности

- Главная страница с книгами и видеоматериалами.
- Страница «Полка» с YouTube-уроками в виде книжной полки.
- Админ-панель для CRUD операций над книгами и YouTube-ссылками.
- JSON-хранилище в `backend/data`.
- Админ создаётся автоматически при первом запуске.

## Доступ в админку

- Логин: `admin`
- Пароль: `IS-admin123456`

Пароль хранится в `backend/data/admin.json` как base64-значение: `SVMtYWRtaW4xMjM0NTY=`.

## Установка

```bash
npm install
```

## Запуск разработки

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

## Production

```bash
npm run build
npm start
```

После сборки Express раздаёт frontend из `frontend/dist` и API на том же сервере.

## JSON-БД

Файлы создаются автоматически:

- `backend/data/admin.json`
- `backend/data/books.json`
- `backend/data/youtube.json`

Если `books.json` и `youtube.json` отсутствуют, приложение создаст стартовые demo-записи, которые можно изменить или удалить через админку.
