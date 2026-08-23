import { apiFetch } from './client';
import type { Meeting, MeetingResult } from '../types/meeting';

export async function uploadMeeting(file: File): Promise<Meeting> {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch<Meeting>('/api/v1/meetings', {
    method: 'POST',
    body: formData,
  });
}

export async function getMeeting(meetingId: string): Promise<Meeting> {
  return apiFetch<Meeting>(`/api/v1/meetings/${meetingId}`);
}

export async function getMeetingResult(meetingId: string): Promise<MeetingResult> {
  return apiFetch<MeetingResult>(`/api/v1/meetings/${meetingId}/result`);
}
