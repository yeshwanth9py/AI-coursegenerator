import {
  AudioLines,
  Gauge,
  Languages,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Square,
  Volume2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../utils/api';
import {
  extractNarration,
  matchingVoices,
  SPEECH_LANGUAGES,
  speechLanguageCode,
  splitForSpeech,
} from '../../utils/speech';

const ORIGINAL_LANGUAGE = '__original__';
const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5];

export default function LessonAudioPlayer({ lesson, translationEnabled = true }) {
  const sourceLanguage = lesson.language || 'English';
  const originalNarration = useMemo(() => extractNarration(lesson), [lesson]);
  const [narration, setNarration] = useState(originalNarration);
  const [activeLanguage, setActiveLanguage] = useState(sourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState(ORIGINAL_LANGUAGE);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('auto');
  const [rate, setRate] = useState(1);
  const [status, setStatus] = useState('idle');
  const [currentChunk, setCurrentChunk] = useState(0);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const translationCache = useRef(new Map());
  const translationRequest = useRef(0);
  const playbackSession = useRef(0);

  const supported = typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && 'SpeechSynthesisUtterance' in window;

  const speechQueue = useMemo(
    () => narration.flatMap((chunk) => splitForSpeech(chunk)),
    [narration],
  );
  const languageVoices = useMemo(
    () => matchingVoices(voices, activeLanguage),
    [activeLanguage, voices],
  );
  const completedChunks = status === 'complete'
    ? speechQueue.length
    : currentChunk + Number(status === 'playing' || status === 'paused');
  const progress = speechQueue.length
    ? Math.round((completedChunks / speechQueue.length) * 100)
    : 0;

  useEffect(() => {
    if (!supported) return undefined;

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      translationRequest.current += 1;
      playbackSession.current += 1;
      window.speechSynthesis.cancel();
      if (typeof window.speechSynthesis.removeEventListener === 'function') {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      } else if (window.speechSynthesis.onvoiceschanged === loadVoices) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [supported]);

  function stop(reset = true) {
    if (!supported) return;
    playbackSession.current += 1;
    window.speechSynthesis.cancel();
    setStatus('idle');
    if (reset) setCurrentChunk(0);
  }

  function speakAt(index, session) {
    if (!supported || session !== playbackSession.current) return;

    if (index >= speechQueue.length) {
      setCurrentChunk(speechQueue.length);
      setStatus('complete');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(speechQueue[index]);
    utterance.lang = speechLanguageCode(activeLanguage);
    utterance.rate = rate;
    utterance.pitch = 1;

    const voice = voices.find((item) => item.voiceURI === selectedVoice)
      || languageVoices[0];
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      if (session !== playbackSession.current) return;
      setCurrentChunk(index);
      setStatus('playing');
    };
    utterance.onend = () => speakAt(index + 1, session);
    utterance.onerror = (event) => {
      if (session !== playbackSession.current || event.error === 'canceled' || event.error === 'interrupted') return;
      setError('Your browser could not play this voice. Try another voice or language.');
      setStatus('idle');
    };

    window.speechSynthesis.speak(utterance);
  }

  function play() {
    if (!supported || !speechQueue.length) return;
    setError('');

    if (status === 'paused') {
      window.speechSynthesis.resume();
      setStatus('playing');
      return;
    }

    window.speechSynthesis.cancel();
    const session = playbackSession.current + 1;
    playbackSession.current = session;
    speakAt(status === 'complete' ? 0 : currentChunk, session);
  }

  function pause() {
    if (!supported || status !== 'playing') return;
    window.speechSynthesis.pause();
    setStatus('paused');
  }

  function changeRate(value) {
    stop(false);
    setRate(Number(value));
  }

  function changeVoice(value) {
    stop(false);
    setSelectedVoice(value);
  }

  async function changeLanguage(value) {
    const request = translationRequest.current + 1;
    translationRequest.current = request;
    stop();
    setTargetLanguage(value);
    setError('');
    setSelectedVoice('auto');
    setTranslating(false);

    if (value === ORIGINAL_LANGUAGE) {
      setNarration(originalNarration);
      setActiveLanguage(sourceLanguage);
      return;
    }

    const cached = translationCache.current.get(value);
    if (cached) {
      setNarration(cached.chunks);
      setActiveLanguage(cached.targetLanguage);
      return;
    }

    setTranslating(true);
    try {
      const { data } = await api.post(`/courses/lessons/${lesson._id}/narration`, {
        language: value,
      });
      if (request !== translationRequest.current) return;
      translationCache.current.set(value, data);
      setNarration(data.chunks);
      setActiveLanguage(data.targetLanguage);
    } catch (requestError) {
      if (request !== translationRequest.current) return;
      setTargetLanguage(ORIGINAL_LANGUAGE);
      setNarration(originalNarration);
      setActiveLanguage(sourceLanguage);
      setError(requestError.response?.data?.error || 'Could not translate this lesson narration.');
    } finally {
      if (request === translationRequest.current) setTranslating(false);
    }
  }

  if (!originalNarration.length) return null;

  if (!supported) {
    return (
      <section className="surface-card mb-8 p-5 text-sm text-slate-400">
        Audio lessons are not supported by this browser. Open the lesson in a browser with speech synthesis support.
      </section>
    );
  }

  return (
    <section className="surface-card relative mb-8 overflow-hidden p-5 animate-enter-delay sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="flex gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
            <AudioLines className={`h-5 w-5 ${status === 'playing' ? 'animate-pulse' : ''}`} />
          </span>
          <div>
            <p className="eyebrow">Audio lesson</p>
            <h2 className="mt-1 font-display text-lg font-bold text-white">
              {status === 'playing' ? `Listening in ${activeLanguage}` : 'Listen or translate this lesson'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Code and videos are skipped for a smoother narration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'playing' ? (
            <button type="button" onClick={pause} className="btn-primary">
              <Pause className="h-4 w-4" />
              Pause
            </button>
          ) : (
            <button type="button" onClick={play} disabled={translating} className="btn-primary">
              {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {status === 'paused' ? 'Resume' : status === 'complete' ? 'Play again' : 'Listen'}
            </button>
          )}
          <button type="button" onClick={() => stop()} className="icon-button" title="Stop audio">
            <Square className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-brand-400 to-cyan-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-medium text-slate-400">
          <span className="mb-2 flex items-center gap-1.5"><Languages className="h-3.5 w-3.5 text-brand-300" /> Narration language</span>
          <select
            value={targetLanguage}
            onChange={(event) => changeLanguage(event.target.value)}
            disabled={translating}
            className="input-field"
          >
            <option value={ORIGINAL_LANGUAGE}>Original ({sourceLanguage})</option>
            {translationEnabled && SPEECH_LANGUAGES
              .filter(({ label }) => label.toLocaleLowerCase() !== sourceLanguage.toLocaleLowerCase())
              .map(({ label }) => <option key={label} value={label}>{label}</option>)}
          </select>
        </label>

        <label className="text-xs font-medium text-slate-400">
          <span className="mb-2 flex items-center gap-1.5"><Volume2 className="h-3.5 w-3.5 text-cyan-300" /> Voice</span>
          <select value={selectedVoice} onChange={(event) => changeVoice(event.target.value)} className="input-field">
            <option value="auto">Best available voice</option>
            {languageVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium text-slate-400">
          <span className="mb-2 flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5 text-emerald-300" /> Playback speed</span>
          <select value={rate} onChange={(event) => changeRate(event.target.value)} className="input-field">
            {PLAYBACK_RATES.map((value) => <option key={value} value={value}>{value}x</option>)}
          </select>
        </label>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          {translating
            ? `Translating narration to ${targetLanguage}...`
            : `${progress}% complete - ${activeLanguage}`}
        </span>
        {status !== 'idle' && (
          <button type="button" onClick={() => stop()} className="flex items-center gap-1.5 text-slate-500 transition hover:text-white">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset audio
          </button>
        )}
      </div>

      {!languageVoices.length && (
        <p className="relative mt-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2 text-xs text-amber-200/80">
          No dedicated {activeLanguage} voice is installed. Your browser will use its closest available voice.
        </p>
      )}
      {error && <p className="relative mt-3 text-sm text-rose-300">{error}</p>}
    </section>
  );
}
