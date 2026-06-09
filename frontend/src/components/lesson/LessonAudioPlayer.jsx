import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Pause, Play, RefreshCw, Square, Volume2 } from 'lucide-react';
import { chooseSpeechVoice, loadSpeechVoices } from '../../utils/speech';

const MAX_CHUNK_LENGTH = 220;

function getLessonText(title, content) {
  const readableBlocks = (content || [])
    .filter((block) => block?.type === 'heading' || block?.type === 'paragraph')
    .map((block) => block.text)
    .filter(Boolean);

  return [title, ...readableBlocks].filter(Boolean).join('\n');
}

function splitForSpeech(text) {
  const parts = text
    .replaceAll('**', '')
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks = [];

  for (const part of parts) {
    const words = part.split(/\s+/);
    let chunk = '';

    for (const word of words) {
      if (word.length > MAX_CHUNK_LENGTH) {
        if (chunk) chunks.push(chunk);

        const characters = Array.from(word);
        for (let index = 0; index < characters.length; index += MAX_CHUNK_LENGTH) {
          chunks.push(characters.slice(index, index + MAX_CHUNK_LENGTH).join(''));
        }

        chunk = '';
        continue;
      }

      if (chunk && `${chunk} ${word}`.length > MAX_CHUNK_LENGTH) {
        chunks.push(chunk);
        chunk = word;
      } else {
        chunk = chunk ? `${chunk} ${word}` : word;
      }
    }

    if (chunk) chunks.push(chunk);
  }

  return chunks;
}

export default function LessonAudioPlayer({ title, content, language }) {
  const [status, setStatus] = useState('idle');
  const [missingVoice, setMissingVoice] = useState('');
  const sessionId = useRef(0);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const isWindows = typeof navigator !== 'undefined' && navigator.userAgent.includes('Windows');
  const text = getLessonText(title, content);

  useEffect(() => {
    sessionId.current += 1;
    window.speechSynthesis?.cancel();
    setStatus('idle');
    setMissingVoice('');

    return () => {
      sessionId.current += 1;
      window.speechSynthesis?.cancel();
    };
  }, [text, language]);

  const speakChunk = (chunks, index, currentSession, speechVoice) => {
    if (sessionId.current !== currentSession) return;

    if (index >= chunks.length) {
      setStatus('idle');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.lang = speechVoice.locale;

    if (speechVoice.voice) {
      utterance.voice = speechVoice.voice;
    }

    utterance.onend = () => speakChunk(chunks, index + 1, currentSession, speechVoice);
    utterance.onerror = () => {
      if (sessionId.current === currentSession) setStatus('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const start = async () => {
    const chunks = splitForSpeech(text);
    if (!supported || chunks.length === 0) return;

    setMissingVoice('');
    const voices = await loadSpeechVoices();
    const speechVoice = chooseSpeechVoice(voices, language, text);

    if (!speechVoice.voice) {
      setMissingVoice(speechVoice.locale || language || 'matching language');
      return;
    }

    window.speechSynthesis.cancel();
    sessionId.current += 1;
    setStatus('speaking');
    speakChunk(chunks, 0, sessionId.current, speechVoice);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setStatus('paused');
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setStatus('speaking');
  };

  const stop = () => {
    sessionId.current += 1;
    window.speechSynthesis.cancel();
    setStatus('idle');
  };

  if (!supported) {
    return (
      <button type="button" className="btn-secondary" disabled>
        <Volume2 className="w-4 h-4" />
        Audio unavailable
      </button>
    );
  }

  return (
    <>
      {status === 'idle' && (
        <button type="button" onClick={start} className="btn-secondary">
          <Volume2 className="w-4 h-4" />
          Listen
        </button>
      )}

      {status === 'speaking' && (
        <button type="button" onClick={pause} className="btn-secondary">
          <Pause className="w-4 h-4" />
          Pause
        </button>
      )}

      {status === 'paused' && (
        <button type="button" onClick={resume} className="btn-secondary">
          <Play className="w-4 h-4" />
          Resume
        </button>
      )}

      {status !== 'idle' && (
        <button type="button" onClick={stop} className="btn-secondary">
          <Square className="w-4 h-4" />
          Stop
        </button>
      )}

      {missingVoice && (
        <div className="w-full rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
          <p className="font-medium text-amber-200">
            A {missingVoice} speech voice is not available in this browser.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Install the voice in your device settings, restart the browser if needed, then retry.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {isWindows && (
              <a href="ms-settings:speech" className="btn-secondary">
                <ExternalLink className="w-4 h-4" />
                Open voice settings
              </a>
            )}
            <button type="button" onClick={start} className="btn-secondary">
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}
    </>
  );
}
