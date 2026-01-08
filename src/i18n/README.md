# Internationalization (i18n)

Sandify uses [i18next](https://www.i18next.com/) with a natural language keys pattern.

Outside of these translations, sandify code, comments, and (ideally) git commit messages should be in English.

Any additional translations and maintenance is welcome. Any translations should be as close to English as reasonably possible. Translations do not have to be literally the same.

## How It Works

English strings are used as translation keys:

```jsx
t("Name")           // Returns "Name" in English, "名称" in Chinese
t("Save pattern")   // Falls back to "Save pattern" if not translated
```

For longer content, use named keys:

```jsx
t("description.heart", { defaultValue: "The heart curve..." })
```

Missing translations fall back to English automatically.

## Adding Translations

1. Find the English string in the code (e.g., `t("New label")`)
2. Add the translation to `locales/zh.json`:
   ```json
   "New label": "新标签"
   ```

Keys in `zh.json` are alphabetized for easier lookup.

## Adding a New Language

1. Create `locales/xx.json` (copy structure from `zh.json`)
2. Register in `index.js`:
   ```js
   import xxTranslations from "./locales/xx.json"

   const translations = {
     en: enTranslations,
     zh: zhTranslations,
     xx: xxTranslations,  // add here
   }
   ```
3. Add to the language selector in `src/features/app/Settings.js`
