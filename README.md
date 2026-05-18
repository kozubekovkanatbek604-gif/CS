# Cyber Book Shelf

Веб-сайт на Vue 3 и Express для книг, ссылок и YouTube-уроков по кибербезопасности.

## Возможности

- Главная страница с книгами и видеоматериалами.
- Страница «Полка» с YouTube-уроками в виде книжной полки.
- Админ-панель для CRUD операций над книгами и YouTube-ссылками.
- SQLite-база (локально `backend/data/app.db`, на Fly — volume `/data`).
- Админ создаётся автоматически при первом запуске.

## Доступ в админку

- Логин: `admin`
- Пароль: `IS-admin123456`

Пароль хранится в SQLite (таблица `admin`) как base64-значение: `SVMtYWRtaW4xMjM0NTY=`.

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

## База данных (SQLite)

При первом запуске создаётся файл БД и demo-записи. Старые `backend/data/*.json` (если есть) импортируются один раз.

- Локально: `backend/data/app.db`
- Fly.io: `/data/app.db` на постоянном volume (переживает redeploy и перезапуск)

## Деплой на Fly.io

В `fly.toml` уже есть `[mounts]` с `initial_size = '1gb'` — при **первом** деплое Fly **сам создаёт** volume `data` в регионе `ams` и монтирует в `/data`. Вручную volume создавать не нужно.

### Новое приложение (после удаления App)

**Вариант A — панель Fly + GitHub**

1. Push репозитория на `main` (с актуальным `fly.toml`).
2. Fly → **Create app** → подключить репозиторий `CS`.
3. **App name:** `cs-cybersecurity-website` (как в `fly.toml`).
4. **Region:** `ams`, **Internal port:** `8080`, **Memory:** 512MB.
5. **Env:** `JWT_SECRET` = случайная строка.
6. **Postgres** — не включать.
7. **Deploy** — volume и 1 машина (с volume) создадутся автоматически.

**Вариант B — CLI (надёжнее)**

```bash
fly auth login
cd путь/к/Book-Website
fly launch --no-deploy --ha=false --copy-config --name cs-cybersecurity-website --region ams
fly secrets set JWT_SECRET="ваш-секрет" -a cs-cybersecurity-website
fly deploy --ha=false -a cs-cybersecurity-website
```

Проверка:

```bash
fly volumes list -a cs-cybersecurity-website
fly machine list -a cs-cybersecurity-website
```

Должны быть: **1 volume** `data`, **1 machine**, в логах: `SQLite: /data/app.db`.

### Одна машина

С volume Fly по умолчанию поднимает **1 машину**. Если появятся 2:

```bash
fly scale count 1 -a cs-cybersecurity-website
```

Деплой всегда с одной машиной: `npm run fly:deploy` (`--ha=false`).

| Сообщение | Решение |
|-----------|---------|
| `volume "data" not found` | В `fly.toml` должен быть `initial_size`; redeploy нового app |
| 2 machines | `fly scale count 1` или `fly deploy --ha=false` |
| Данные пропали | Старый app без volume; у нового app проверьте `fly volumes list` |
