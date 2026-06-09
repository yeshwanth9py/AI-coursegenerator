const COURSE_LIST_UPDATED = 'course-list-updated';

export function notifyCourseListUpdated() {
  window.dispatchEvent(new Event(COURSE_LIST_UPDATED));
}

export function subscribeToCourseListUpdates(listener) {
  window.addEventListener(COURSE_LIST_UPDATED, listener);
  return () => window.removeEventListener(COURSE_LIST_UPDATED, listener);
}
