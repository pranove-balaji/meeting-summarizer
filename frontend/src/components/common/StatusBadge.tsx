import type { MeetingStatus } from '../../types/meeting';

interface Props {
  status: MeetingStatus;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className="status-badge__dot" />
      {status}
    </span>
  );
}
