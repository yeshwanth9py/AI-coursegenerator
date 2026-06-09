const LANGUAGE_LOCALES = {
  english: 'en-US',
  hindi: 'hi-IN',
  spanish: 'es-ES',
  french: 'fr-FR',
  german: 'de-DE',
  tamil: 'ta-IN',
  telugu: 'te-IN',
  bengali: 'bn-IN',
  marathi: 'mr-IN',
  gujarati: 'gu-IN',
  kannada: 'kn-IN',
  malayalam: 'ml-IN',
  punjabi: 'pa-IN',
  urdu: 'ur-PK',
  arabic: 'ar-SA',
  chinese: 'zh-CN',
  mandarin: 'zh-CN',
  japanese: 'ja-JP',
  korean: 'ko-KR',
  portuguese: 'pt-BR',
  italian: 'it-IT',
  russian: 'ru-RU',
};

const SCRIPT_LOCALES = [
  [/\p{Script=Tamil}/u, 'ta-IN'],
  [/\p{Script=Telugu}/u, 'te-IN'],
  [/\p{Script=Bengali}/u, 'bn-IN'],
  [/\p{Script=Gujarati}/u, 'gu-IN'],
  [/\p{Script=Kannada}/u, 'kn-IN'],
  [/\p{Script=Malayalam}/u, 'ml-IN'],
  [/\p{Script=Gurmukhi}/u, 'pa-IN'],
  [/\p{Script=Arabic}/u, 'ar-SA'],
  [/\p{Script=Hiragana}|\p{Script=Katakana}/u, 'ja-JP'],
  [/\p{Script=Han}/u, 'zh-CN'],
  [/\p{Script=Hangul}/u, 'ko-KR'],
  [/\p{Script=Cyrillic}/u, 'ru-RU'],
  [/\p{Script=Devanagari}/u, 'hi-IN'],
];

function detectLocale(text) {
  return SCRIPT_LOCALES.find(([pattern]) => pattern.test(text))?.[1];
}

function languageName(locale) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' })
      .of(locale.split('-')[0])
      .toLowerCase();
  } catch {
    return '';
  }
}

function findVoiceByName(voices, requestedLanguage) {
  if (!requestedLanguage) return null;

  return voices.find((voice) => {
    const voiceName = voice.name.toLowerCase();
    const displayedLanguage = languageName(voice.lang);

    return voiceName.includes(requestedLanguage)
      || displayedLanguage === requestedLanguage
      || (displayedLanguage && requestedLanguage.startsWith(displayedLanguage));
  });
}

export function chooseSpeechVoice(voices, language, text) {
  const requestedLanguage = language?.trim().toLowerCase() || '';
  const detectedLocale = detectLocale(text);
  const useDetectedLocale = detectedLocale
    && (!requestedLanguage || requestedLanguage === 'english');
  const namedVoice = useDetectedLocale ? null : findVoiceByName(voices, requestedLanguage);

  let locale = useDetectedLocale
    ? detectedLocale
    : namedVoice?.lang || LANGUAGE_LOCALES[requestedLanguage];

  if (!locale) {
    try {
      locale = Intl.getCanonicalLocales(language)[0];
    } catch {
      locale = '';
    }
  }

  const baseLanguage = locale?.split('-')[0].toLowerCase();
  const voice = namedVoice || voices.find((item) => {
    const voiceLanguage = item.lang.toLowerCase();
    return voiceLanguage === locale?.toLowerCase()
      || voiceLanguage.split('-')[0] === baseLanguage;
  });

  return { locale, voice };
}

export function loadSpeechVoices() {
  const speech = window.speechSynthesis;
  const availableVoices = speech.getVoices();

  if (availableVoices.length > 0) {
    return Promise.resolve(availableVoices);
  }

  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timeout);
      speech.removeEventListener('voiceschanged', finish);
      resolve(speech.getVoices());
    };

    const timeout = setTimeout(finish, 1000);
    speech.addEventListener('voiceschanged', finish);
  });
}
