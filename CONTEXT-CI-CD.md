# ⚙️ CI/CD-инфраструктура — tinyframejs

Этот документ описывает **всю внутреннюю настройку и процесс CI/CD** для репозитория `tinyframejs`. Репозиторий является частью экосистемы AlphaQuantJS, но функционирует **отдельно**, без монорепо и без использования Turborepo.

---

## 📦 Используемые инструменты и технологии

| Инструмент              | Назначение                                              |
| ----------------------- | ------------------------------------------------------- |
| `GitHub Actions`        | CI пайплайны, проверка PR, автоматические релизы        |
| `ESLint` + `Prettier`   | Линтинг и автоформатирование                            |
| `Vitest`                | Unit-тестирование с поддержкой JavaScript и ESM         |
| `pnpm` или `npm`        | Менеджер пакетов                                        |
| `Husky` + `Commitlint`  | Хуки и контроль формата коммитов (Conventional Commits) |
| `Codecov`               | Анализ покрытия кода тестами                            |
| `PR Codex` (AI-ревьюер) | Анализ PR с помощью LLM                                 |
| `Changesets`            | Автоматизация версий и changelog                        |
| `Size-limit`            | Контроль размера сборки (по желанию)                    |

---

## 📂 Структура репозитория

```bash
tinyframejs/
├── src/              # Исходный код
├── test/             # Unit-тесты (Vitest)
├── examples/         # Примеры использования
├── benchmarks/       # Производительные бенчмарки
├── .github/workflows/ci.yml         # Основной CI-процесс
├── .github/workflows/release.yml    # Публикация и релиз
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .eslintrc.json, .prettierrc, .husky/
└── README.md
```

---

## 🚦 GitHub Actions: пайплайны

### 🔁 `.github/workflows/ci.yml`

**Срабатывает на:** `push`, `pull_request` в `main`

**Что делает:**

- Устанавливает зависимости
- Запускает линтинг (`lint`)
- Проверяет формат (`format:check`)
- Запускает тесты через `vitest`
- Отправляет покрытие в Codecov
- Выполняет сборку
- (опционально) запускает AI-ревью через PR Codex

### 🚀 `.github/workflows/release.yml`

**Срабатывает при:** push в `main`, если есть `.changeset/`

**Что делает:**

- Выполняет сборку
- Генерирует версию через `changeset`
- Публикует пакет в npm
- Создаёт GitHub релиз и changelog

---

## 🧪 Локальная разработка (для контрибьюторов)

### Установка зависимостей

```bash
pnpm install      # или npm install
```

### Линтинг, тесты, сборка

```bash
pnpm lint
pnpm format
pnpm test
pnpm build
```

### Коммиты по стандарту

```bash
pnpm lint && pnpm test
# Пример коммита:
# feat(core): реализована функция transformSeries
```

### Создание changeset перед релизом

```bash
npx changeset
```

---

## 🔐 GitHub Secrets (для CI и публикации)

Настраиваются в: `Settings → Secrets and variables → Actions`
Находятся в: `https://github.com/AlphaQuantJS/tinyframejs/settings/secrets/actions`

| Название         | Назначение                       |
| ---------------- | -------------------------------- |
| `NPM_TOKEN`      | Авторизация для публикации в npm |
| `CODECOV_TOKEN`  | Покрытие тестами                 |
| `OPENAI_API_KEY` | Для AI-ревью через PR Codex      |

---

## 🧠 Обязанности мейнтейнера

### Работа с Pull Request:

- Убедиться, что PR прошёл линт, тесты, сборку, покрытие
- Проверить AI-анализ от PR Codex (если включён)
- После ревью — **Squash & Merge** в `main`

### Релиз:

- После merge → CI запускает `release.yml`
- Версия пакета обновляется автоматически
- Пакет публикуется в npm, changelog и GitHub release создаются

---

## 📌 Формат коммитов (Conventional Commits)

| Тип        | Назначение                            |
| ---------- | ------------------------------------- |
| `feat`     | Новая функциональность                |
| `fix`      | Исправление ошибки                    |
| `docs`     | Только изменение документации         |
| `refactor` | Рефакторинг (без изменения поведения) |
| `test`     | Добавление или изменение тестов       |
| `chore`    | Инфраструктура, конфиги, CI и т.п.    |

> Пример: `feat(core): добавлен метод corrMatrix`

---

## 🔄 Changesets

### 1. Обновлённый `.changeset/config.json`

```json
{
  "changelog": [
    "@changesets/changelog",
    { "repo": "AlphaQuantJS/tinyframejs" }
  ],
  "commit": true,
  "access": "public",
  "baseBranch": "main"
}
```

> **Что это даёт**
>
> - **changelog**: плагин `@changesets/changelog` генерирует CHANGELOG.md с ссылками на PR в вашем репозитории.
> - **commit: true**: после `changeset version` обновления версий и changelog-а автоматически коммитятся.
> - **access: public**: публикация в npm как публичного пакета.
> - **baseBranch: main**: ветка, в которой смотрим changeset-файлы и по которой делаем релизы.

---

### 2. CI для сборки и тестов — `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js & pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm run lint

      - name: Format check
        run: pnpm run format:check

      - name: Run tests
        run: pnpm run test

      - name: Build
        run: pnpm run build
```

> **CI** по-прежнему срабатывает на каждый `push` и `PR` в `main`/`dev`, запускает линт, форматирование, тесты и сборку.

---

### 3. Job для автоматического релиза — `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    branches: [main]
    # срабатывает только если были изменения в .changeset/
    paths:
      - '.changeset/**'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js & pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Bump version, generate changelog & publish
        uses: changesets/action@v1
        with:
          publish: pnpm publish --access public
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

> **Как это работает**
>
> 1. **Триггер**: только при пуше в `main` и если есть изменения внутри `.changeset/` (то есть вы явно создали новый changeset).
> 2. **changesets/action** автоматически:
>    - выполняет `changeset version` → обновляет `package.json` и `CHANGELOG.md`, коммитит (из-за `"commit": true`).
>    - создаёт git-тег.
>    - запускает `pnpm publish` → новый релиз в npm.
> 3. При отсутствии новых файлов в `.changeset/` job пропустится (skipped).

---

### 4. Ваши основные команды для управления версиями

1. **Создать запрос на новый релиз (changeset):**

   ```bash
   pnpm run changeset
   ```

   — выбираете `patch`/`minor`/`major`, указываете описание, получаете файл `.changeset/<id>-описание.md`.

2. **Проверить pending-релизы:**

   ```bash
   pnpm exec changeset status
   ```

   — покажет, какие bump-файлы ждут публикации.

3. **(Опционально) Локально посмотреть версии и changelog перед пушем:**

   ```bash
   pnpm exec changeset version
   git diff   # чтобы убедиться в изменениях package.json и CHANGELOG.md
   git push && git push --tags
   ```

   Либо просто пушьте PR с файлом в `.changeset/` — всё сделает CI.

4. **CI-релиз:** после мёрджа PR в `main` с вашим `.changeset/` GitHub Actions автоматически опубликует новую версию.

---

## 🔄 Практики и рекомендации

- Делай PR небольшими и тематическими
- Добавляй тесты к каждой новой логике
- Документируй публичные функции через JSDoc
- Профилируй критические места через бенчмарки
- Обновляй `examples/`, если добавляешь новое API

---

## 🧪 Тестирование и покрытие

- Запуск тестов через `vitest run`
- Покрытие отправляется в Codecov
- Бенчмарки хранятся в `benchmarks/`
- Guard-тесты защищают от падения скорости/памяти

---

## 🔭 Сводка по CI/CD

| Этап       | Инструменты                            |
| ---------- | -------------------------------------- |
| Линтинг    | ESLint + Prettier                      |
| Тесты      | Vitest + Codecov                       |
| Покрытие   | Codecov + бейдж в README               |
| Формат     | Prettier (`format`, `format:check`)    |
| Коммиты    | Husky + Commitlint                     |
| AI-ревью   | PR Codex (по API-ключу)                |
| Релиз      | Changesets + GitHub Actions            |
| Публикация | npm через `NPM_TOKEN` и `pnpm publish` |

---

Этот документ предназначен для **внутреннего использования**. Обновляй при каждом изменении инструментов или процессов ⚙️
