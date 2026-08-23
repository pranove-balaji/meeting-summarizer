export type MeetingStatus =
  | 'uploaded'
  | 'processing'
  | 'transcribed'
  | 'summarizing'
  | 'completed'
  | 'failed';

export interface Meeting {
  id: string;
  filename: string;
  status: MeetingStatus;
}

export interface ActionItem {
  task: string;
  assignee: string | null;
  deadline: string | null;
}

export interface MeetingResult {
  id: string;
  meeting_id: string;
  transcript: string;
  summary: string;
  key_points: string[];
  action_items: ActionItem[];
}

export interface ApiError {
  detail: string;
}
