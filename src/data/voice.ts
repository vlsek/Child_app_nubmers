import { numberWord } from '@/data/numbersLevels'

/**
 * Записанный голос. Файлы лежат в src/assets/audio/voice/<ключ>.mp3;
 * Vite подхватывает их сам и отдаёт с хэшем в имени (кэш браузера не устаревает).
 */
const files = import.meta.glob('@/assets/audio/voice/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const urls: Record<string, string> = {}
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop()!.replace(/\.mp3$/, '')
  urls[name] = url
}

/** Фразы-конструкторы: «Привет», «Посчитаем вместе» и т. д. */
export type PhraseKey =
  | 'hello'
  | 'count-together'
  | 'how-many'
  | 'find-digit'
  | 'show-digit'
  | 'praise-molodets'
  | 'praise-otlichno'
  | 'praise-umnitsa'
  | 'praise-ura'
  | 'retry-not-quite'
  | 'retry-think'
  | 'retry-again'
  | 'retry-almost'

/** Ключ голоса: фраза или число (`num-5`). */
export type VoiceKey = PhraseKey | `num-${number}`

export const PRAISE_KEYS: readonly PhraseKey[] = [
  'praise-molodets',
  'praise-otlichno',
  'praise-umnitsa',
  'praise-ura',
]

/** Мягкие подбадривания при ошибке: без «неправильно» и без наказания. */
export const RETRY_KEYS: readonly PhraseKey[] = [
  'retry-not-quite',
  'retry-think',
  'retry-again',
  'retry-almost',
]

/** Тексты на случай, если файла с записью нет: их проговорит браузерный синтез. */
const PHRASE_TEXT: Record<PhraseKey, string> = {
  hello: 'Привет! Давай учить цифры!',
  'count-together': 'Посчитаем вместе!',
  'how-many': 'Сколько здесь?',
  'find-digit': 'Найди цифру',
  'show-digit': 'Покажи цифру',
  'praise-molodets': 'Молодец!',
  'praise-otlichno': 'Отлично!',
  'praise-umnitsa': 'Умница!',
  'praise-ura': 'Ура!',
  'retry-not-quite': 'Не совсем так',
  'retry-think': 'Подумай ещё',
  'retry-again': 'Попробуй ещё раз',
  'retry-almost': 'Почти получилось!',
}

export function numberKey(value: number): VoiceKey {
  return `num-${value}`
}

/** Адрес записи, если она есть в проекте. */
export function voiceUrl(key: VoiceKey): string | undefined {
  return urls[key]
}

/** Что сказать синтезом, если записи нет. */
export function voiceText(key: VoiceKey): string {
  if (key.startsWith('num-')) return numberWord(Number(key.slice(4)))
  return PHRASE_TEXT[key as PhraseKey]
}

/** Запись произвольной реплики по имени файла (src/assets/audio/voice/<имя>.mp3), если она есть. */
export function lineUrl(name: string): string | undefined {
  return urls[name]
}
