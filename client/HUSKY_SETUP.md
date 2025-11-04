# 🪝 Husky Pre-Commit Setup

## ✅ Что настроено:

### 1. **Pre-Commit Hook**

Автоматически запускается перед каждым коммитом и проверяет:

- ✅ **ESLint** - проверка качества кода (JS/JSX/TS/TSX)
- ✅ **Prettier** - автоформатирование кода
- ✅ **TypeScript Type Check** - проверка типов TypeScript

### 2. **Lint-Staged Configuration**

Проверяет только **staged** файлы (те, что в `git add`):

```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix", // Исправляет ошибки ESLint
    "prettier --write", // Форматирует код
    "bash -c 'npm run type-check'" // Проверяет типы TS
  ],
  "*.{css,md}": [
    "prettier --write" // Форматирует CSS и MD
  ]
}
```

### 3. **NPM Scripts**

```bash
npm run type-check      # TypeScript type checking
npm run lint            # ESLint проверка
npm run lint:fix        # ESLint проверка + автоисправление
npm run lint-staged     # Запускает lint-staged вручную
npm run format          # Prettier форматирование
npm run format:check    # Prettier проверка без изменений
```

## 🧪 Как протестировать:

### Способ 1: Реальный коммит

```bash
# 1. Сделай изменения в файле
echo "const test = 123" >> src/test.ts

# 2. Добавь в staging
git add src/test.ts

# 3. Попробуй закоммитить
git commit -m "test: husky hook"

# Husky запустится автоматически и проверит:
# - ESLint
# - Prettier
# - TypeScript
```

### Способ 2: Тест без коммита

```bash
# Запусти проверки вручную
npm run lint-staged
```

### Способ 3: Проверка отдельно

```bash
# TypeScript
npm run type-check

# ESLint
npm run lint

# Prettier
npm run format:check
```

## 🚫 Что произойдет если есть ошибки:

### Пример 1: TypeScript Error

```typescript
// src/test.ts
const name: string = 123; // ❌ Type error!
```

Результат:

```
✖ npm run type-check:
src/test.ts:1:7 - error TS2322: Type 'number' is not assignable to type 'string'.

✖ husky - pre-commit hook failed (cannot commit)
```

### Пример 2: ESLint Error

```typescript
// src/test.ts
const unusedVar = 123; // ❌ Unused variable!
```

Результат:

```
✖ eslint --fix:
1:7  error  'unusedVar' is assigned a value but never used  @typescript-eslint/no-unused-vars

✖ husky - pre-commit hook failed (cannot commit)
```

### Пример 3: Prettier (Auto-fix)

```typescript
// src/test.ts
const name = 'John'; // ❌ Bad formatting
```

Результат:

```
✔ prettier --write:
src/test.ts ✓

✔ husky - коммит успешен (Prettier автоматически исправил)
```

## 📦 Установленные зависимости:

```json
{
  "devDependencies": {
    "husky": "^9.1.7",
    "lint-staged": "^16.2.6",
    "eslint": "^9.36.0",
    "@typescript-eslint/parser": "^8.20.0",
    "@typescript-eslint/eslint-plugin": "^8.20.0",
    "prettier": "^3.6.2",
    "typescript": "^5.9.3"
  }
}
```

## 🔧 Структура файлов:

```
client/
├── .husky/
│   └── pre-commit           # Husky hook (запускает lint-staged)
├── eslint.config.js         # ESLint config (JS/JSX + TS/TSX)
├── tsconfig.json            # TypeScript config
├── package.json             # Scripts + lint-staged config
└── src/
    └── **/*.{ts,tsx}        # TypeScript файлы
```

## ⚙️ Как отключить (если нужно):

### Временно пропустить хук (не рекомендуется!)

```bash
git commit -m "message" --no-verify
```

### Отключить совсем

```bash
npm uninstall husky
rm -rf .husky
```

## 🎯 Что делать если хук не работает:

### 1. Переустанови Husky

```bash
cd client
rm -rf .husky
npm run prepare
```

### 2. Проверь права на выполнение

```bash
chmod +x .husky/pre-commit
```

### 3. Проверь установку зависимостей

```bash
npm install
```

### 4. Проверь вручную

```bash
npm run lint-staged
```

## ✨ Дополнительные возможности:

### Добавить другие проверки

Отредактируй `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "bash -c 'npm run type-check'",
      "bash -c 'npm test'" // Добавить тесты
    ]
  }
}
```

### Добавить pre-push hook

```bash
npx husky add .husky/pre-push "npm test"
```

Теперь Husky защищает твой код! 🛡️
