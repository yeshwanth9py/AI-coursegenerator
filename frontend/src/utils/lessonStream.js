import { API_BASE_URL } from './api';

async function responseError(response) {
  const data = await response.json().catch(() => ({}));
  return new Error(data.error || 'Could not generate lesson content.');
}

function parseEvent(frame) {
  let event = 'message';
  const data = [];

  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
  }

  if (!data.length) return null;
  return { event, data: JSON.parse(data.join('\n')) };
}

export async function generateLessonStream({
  depth,
  language,
  lessonId,
  onBlock,
}) {
  const response = await fetch(`${API_BASE_URL}/courses/lessons/${lessonId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ depth, language }),
  });

  if (!response.ok) throw await responseError(response);
  if (!response.body) throw new Error('Lesson streaming is not supported by this browser.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let completedLesson = null;

  function handleFrames(final = false) {
    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = final ? '' : frames.pop() || '';

    for (const frame of frames) {
      if (!frame.trim()) continue;

      const message = parseEvent(frame);
      if (!message) continue;

      if (message.event === 'block') onBlock?.(message.data);
      if (message.event === 'done') completedLesson = message.data;
      if (message.event === 'error') {
        throw new Error(message.data.error || 'Could not generate lesson content.');
      }
    }
  }

  let streamEnded = false;
  while (!streamEnded) {
    const { done, value } = await reader.read();
    if (done) {
      streamEnded = true;
      continue;
    }

    buffer += decoder.decode(value, { stream: true });
    handleFrames();
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    buffer += '\n\n';
    handleFrames(true);
  }

  if (!completedLesson) {
    throw new Error('Lesson generation ended before the content was saved.');
  }

  return completedLesson;
}
