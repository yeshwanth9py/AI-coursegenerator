import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, UserRound, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../../utils/api';

function AssistantMessage({ content }) {
  return (
    <div className="min-w-0 text-sm leading-6 text-slate-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-indigo-300 underline decoration-indigo-400/50 underline-offset-2 hover:text-indigo-200"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-indigo-400/70 pl-3 text-slate-300">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.startsWith('language-') || String(children).includes('\n');

            return (
              <code
                className={isBlock
                  ? `${className || ''} font-mono text-xs text-slate-200`
                  : 'rounded bg-slate-950/80 px-1.5 py-0.5 font-mono text-xs text-indigo-200'}
              >
                {children}
              </code>
            );
          },
          h1: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold text-white">{children}</h3>,
          h2: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold text-white">{children}</h3>,
          h3: ({ children }) => <h3 className="mb-2 mt-4 text-sm font-semibold text-white">{children}</h3>,
          hr: () => <hr className="my-4 border-slate-700" />,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:text-indigo-400">{children}</ol>,
          p: ({ children }) => <p className="mb-3 whitespace-pre-wrap last:mb-0">{children}</p>,
          pre: ({ children }) => (
            <pre className="my-3 max-w-full overflow-x-auto rounded-lg border border-slate-700 bg-slate-950 p-3">
              {children}
            </pre>
          ),
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-5 marker:text-indigo-400">{children}</ul>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function AIChatPanel({ lessonId, lessonTitle, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isOpen, messages, sending]);

  async function sendMessage() {
    const message = input.trim();
    if (!message || sending) return;

    const history = [...messages, { role: 'user', content: message }];
    setMessages(history);
    setInput('');
    setSending(true);

    try {
      const { data } = await api.post(`/courses/lessons/${lessonId}/chat`, {
        message,
        history: messages.slice(-6),
      });
      setMessages([...history, {
        role: 'assistant',
        content: String(data.reply || '').trim() || 'I could not find an answer for that question.',
      }]);
    } catch {
      setMessages([...history, { role: 'assistant', content: 'Could not answer that question.' }]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  if (!isOpen) return null;

  return (
    <aside className="fixed bottom-0 right-0 top-[4.5rem] z-40 flex w-full max-w-lg flex-col border-l border-white/[0.08] bg-[#090c1c]/90 shadow-2xl shadow-black/40 animate-scale-in backdrop-blur-2xl">
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.07] bg-white/[0.02] p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-cyan-400/10 text-indigo-200">
            <Bot className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold text-white">Lesson tutor</h2>
            <p className="truncate text-xs text-slate-400">{lessonTitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lesson chat"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        {!messages.length && (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/30 px-5 py-6 text-center">
            <Bot className="mx-auto mb-3 h-6 w-6 text-indigo-300" />
            <p className="text-sm font-medium text-slate-200">Ask about this lesson</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              I can explain concepts, show examples, or help you work through something confusing.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex items-start gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                message.role === 'user'
                  ? 'bg-indigo-500 text-white'
                  : 'border border-slate-700 bg-slate-800 text-indigo-300'
              }`}
            >
              {message.role === 'user'
                ? <UserRound className="h-3.5 w-3.5" />
                : <Bot className="h-4 w-4" />}
            </span>
            <div
              className={`min-w-0 max-w-[calc(100%-2.5rem)] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'rounded-tr-md bg-brand-600 text-sm leading-6 text-white'
                  : 'rounded-tl-md border border-slate-700/70 bg-slate-800/80'
              }`}
            >
              {message.role === 'user'
                ? <p className="whitespace-pre-wrap break-words">{message.content}</p>
                : <AssistantMessage content={message.content} />}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-indigo-300">
              <Bot className="h-4 w-4" />
            </span>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-slate-700/70 bg-slate-800/80 px-4 py-3 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-300" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/[0.07] bg-white/[0.02] p-4">
        <div className="flex items-end gap-2 rounded-2xl border border-white/[0.09] bg-black/20 p-2 transition focus-within:border-indigo-400/50 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            maxLength={2000}
            placeholder="Ask a question about this lesson..."
            className="min-h-12 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          Press Enter to send, Shift + Enter for a new line
        </p>
      </div>
    </aside>
  );
}
