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

## Деплой на Fly.io

1. Запушьте репозиторий на GitHub (`main`).
2. В панели Fly: репозиторий `CS`, branch `main`, **Internal port `8080`**, **Memory 512MB**.
3. **App name** в панели = `app` в `fly.toml` (сейчас `cs-cybersecurity-website`).
4. Environment: `JWT_SECRET` = длинная случайная строка.
5. **Managed Postgres** — не включать.
6. Deploy.

Если ошибка про **volume `data`**: в `fly.toml` секция `[mounts]` закомментирована для первого деплоя. После успешного запуска: Fly → Storage → Create volume (`data`, region `ams`, 1 GB) → раскомментируйте `[mounts]` в `fly.toml` → push → Deploy снова.

Типичные ошибки:

| Сообщение | Решение |
|-----------|---------|
| `volume data not found` | Создать volume или оставить `[mounts]` закомментированным |
| App name mismatch | Одинаковое имя в панели и `fly.toml` |
| Build failed / no Dockerfile | В репо должны быть `Dockerfile` и `fly.toml` на `main` |
| Machine OOM | Память 512MB в панели и `fly.toml` |
