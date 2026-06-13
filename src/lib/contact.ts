export const followUpStatuses = [
  { value: 'not_started', label: 'Not started' },
  { value: 'needs_follow_up', label: 'Needs follow-up' },
  { value: 'followed_up', label: 'Followed up' },
  { value: 'no_follow_up_needed', label: 'No follow-up needed' }
];

export function statusLabel(status: string) {
  return followUpStatuses.find((item) => item.value === status)?.label || 'Not started';
}

export function parseTags(value?: string | null) {
  return (value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function formatDateInput(value?: Date | string | null) {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}
