import type { CapacitorConfig } from '@capacitor/cli'

/** Обёртка веб-игры в Android-приложение (APK). Сборка: `npm run android:build`, см. BACKLOG.md. */
const config: CapacitorConfig = {
  appId: 'app.crocodile.numbers',
  appName: 'Крокодил и цифры',
  webDir: 'dist',
  android: { allowMixedContent: false },
  backgroundColor: '#7dd3fc',
}

export default config
