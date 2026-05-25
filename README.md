# Зай — 31 день (Москва → Сочи)

Сайт с ежедневными заданиями для Даши, отчётами и подарками. Админка для Лёни.

## Стек

- **Frontend:** React (Vite) → [Vercel](https://vercel.com)
- **Backend:** Express + MongoDB → [Render](https://render.com) + [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Старт:** день 1 = **25.05.2026**

## Быстрый старт (локально)

1. MongoDB локально или Atlas.

2. Установка:

```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

3. `server/.env.example` → `server/.env`, поменяй пароли.

4. Сид:

```bash
npm run seed
```

5. Разработка:

```bash
npm run dev
```

- Даша / Лёня: http://localhost:5173 (прокси `/api` → `:3001`)

## Деплой: Vercel + Render

**Да, сервер логично ставить на Render** (или Railway/Fly). Vercel — только статика React; Express с MongoDB и загрузками на Vercel Serverless неудобен.

### 1. MongoDB Atlas

- Создай кластер, пользователя, строку подключения с именем БД: `.../dasha-moscow`
- **Network Access:** добавь `0.0.0.0/0` (иначе Render не подключится)
- Один раз засей прод:

```bash
cd server
# MONGODB_URI из Atlas в .env
npm run seed
```

### 2. Render (API)

1. [dashboard.render.com](https://dashboard.render.com) → **New Web Service** → репозиторий GitHub
2. **Root Directory:** `server`
3. **Build:** `npm install` · **Start:** `npm start`
4. Переменные (см. `server/.env.example`):

| Переменная | Значение |
|------------|----------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | строка Atlas |
| `JWT_SECRET` | длинная случайная строка |
| `ADMIN_PASSWORD` / `DASHENKA_PASSWORD` | пароли Лёни и Дашеньки |
| `CLIENT_URL` | `https://твой-проект.vercel.app` (после Vercel; preview можно через запятую) |
| `API_PUBLIC_URL` | `https://твой-сервис.onrender.com` |
| `START_DATE` | `2026-05-25` |
| `UNLOCK_ALL_DAYS` | `false` |

Можно импортировать `render.yaml` из корня репо.

**Загрузки:** файлы в `server/uploads/` на бесплатном Render **сбрасываются при редеплое**. Для долгого хранения позже — S3/GridFS.

### 3. Vercel (фронт)

1. Import репозитория → **Root Directory:** `client`
2. Framework: Vite (определится сам)
3. **Environment variable:**

```
VITE_API_URL=https://твой-сервис.onrender.com
```

4. Deploy → скопируй URL и пропиши его в `CLIENT_URL` на Render → **Manual Deploy** API (или перезапуск).

### 4. Проверка

- `https://api.onrender.com/api/health` → `{ "ok": true }`
- Логин Даши/Лёни с Vercel-домена (куки `SameSite=None` в production)
- Отправка фото → в админке превью открывается

## Как это работает

- Каждый день открывается по дате от `START_DATE`.
- Задания → **«Как нехуй сделаю, Зая!»** → отчёт Лёне.
- После подтверждения всех заданий дня — подарок во вкладке **«Подарки»**.
- Тексты редактируются в админке → **«Подарки и задания»**.

## Локальный прод-сборка (всё с одного порта)

```bash
npm run build
SERVE_CLIENT=true npm start
```

Сервер отдаёт `client/dist` с `:3001` (без Vercel).
