import { useState } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import api from '../../utils/api';

export default function AIChatPanel({ lessonId, lessonTitle, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

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
      setMessages([...history, { role: 'assistant', content: data.reply }]);
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
    <aside className="fixed inset-y-16 right-0 z-40 flex w-full max-w-md flex-col border-l border-slate-800 bg-slate-900">
      <header className="flex items-center justify-between border-b border-slate-800 p-4">
        <div>
          <h2 className="font-semibold text-white">Lesson chat</h2>
          <p className="text-xs text-slate-500">{lessonTitle}</p>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400">
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {!messages.length && <p className="text-sm text-slate-500">Ask a question about this lesson.</p>}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-lg p-3 text-sm ${
              message.role === 'user'
                ? 'ml-8 bg-brand-600 text-white'
                : 'mr-8 bg-slate-800 text-slate-200'
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-t border-slate-800 p-4">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          maxLength={2000}
          placeholder="Ask a question"
          className="input-field resize-none"
        />
        <button type="button" onClick={sendMessage} disabled={!input.trim() || sending} className="btn-primary">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
