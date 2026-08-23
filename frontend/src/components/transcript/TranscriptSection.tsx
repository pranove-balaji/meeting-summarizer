import { useState } from 'react';
import { ScrollText, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  transcript: string;
}

export default function TranscriptSection({ transcript }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card">
      <div className="card__header">
        <div className="card__icon card__icon--purple">
          <ScrollText size={18} />
        </div>
        <h3 className="card__title">Full Transcript</h3>
      </div>

      <button
        className="transcript__toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls="transcript-content"
      >
        {expanded ? 'Hide transcript' : 'Show full transcript'}
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div
          id="transcript-content"
          className="transcript__content"
          role="region"
          aria-label="Meeting transcript"
        >
          {transcript}
        </div>
      )}
    </div>
  );
}
