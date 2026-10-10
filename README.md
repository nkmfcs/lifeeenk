# LifeOS

Личный журнал жизни: финансы, сон, тренировки, заметки, итоги недели.

Стек: Next.js (Railway) + Postgres (Neon). Хранение записей добавим на шаге 2.

## Переменные окружения

Скопируй `.env.example` в `.env.local` и заполни:

| Переменная | Что это |
|---|---|
| `APP_PASSWORD` | пароль для входа |
| `AUTH_SECRET` | случайная строка от 32 символов для подписи сессии |
| `DATABASE_URL` | строка подключения Neon (нужна со 2-го шага) |

Случайную строку можно получить командой: `openssl rand -hex 32`

## Запуск у себя

```bash
npm install
npm run dev
```

## Деплой на Railway

1. New Project → Deploy from GitHub repo → `lifeeenk`.
2. Variables: добавь `APP_PASSWORD`, `AUTH_SECRET`.
3. Settings → Networking → Generate Domain.
4. Открой ссылку с телефона и войди по паролю.

Railway сам определит Next.js, соберёт и запустит приложение (`npm run build`, `npm run start`).
