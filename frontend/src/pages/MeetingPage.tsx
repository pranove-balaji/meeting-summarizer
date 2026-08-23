import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useMeetingPolling } from '../hooks/useMeetingPolling';
import ProcessingStatus from '../components/meeting/ProcessingStatus';
import SummaryCard from '../components/summary/SummaryCard';
import KeyPointsList from '../components/keypoints/KeyPointsList';
import ActionItemsTable from '../components/action-items/ActionItemsTable';
import TranscriptSection from '../components/transcript/TranscriptSection';
import ErrorMessage from '../components/common/ErrorMessage';
import StatusBadge from '../components/common/StatusBadge';

export default function MeetingPage() {
  const { id } = useParams<{ id: string }>();
  const { meeting, result, error, isLoading } = useMeetingPolling(id);
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    if (!meeting?.id) return;
    await navigator.clipboard.writeText(meeting.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading initial fetch
  if (!meeting && isLoading) {
    return (
      <div className="processing" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <span className="spinner spinner--large" />
        <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
          Loading meeting…
        </p>
      </div>
    );
  }

  // Error
  if (error && !meeting) {
    return <ErrorMessage message={error} />;
  }

  if (!meeting) {
    return <ErrorMessage message="Meeting not found." />;
  }

  const isProcessing = meeting.status !== 'completed' && meeting.status !== 'failed';

  return (
    <div>
      {/* Back link */}
      <Link to="/" className="btn btn--outline" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        <ArrowLeft size={16} /> New Meeting
      </Link>

      {/* Failed state */}
      {meeting.status === 'failed' && (
        <ErrorMessage message="Processing failed. The audio may be too short, corrupted, or in an unsupported language. Please try a different recording." />
      )}

      {/* Processing */}
      {isProcessing && <ProcessingStatus status={meeting.status} />}

      {/* Result */}
      {meeting.status === 'completed' && result && (
        <div className="result">
          <div className="result__header">
            <div>
              <h1 className="result__title">Meeting Results</h1>
              <div className="result__meta">
                <p className="result__filename">{meeting.filename}</p>
                <button
                  className="meeting-id-badge"
                  onClick={handleCopyId}
                  title="Click to copy Meeting ID"
                  aria-label="Copy Meeting ID"
                >
                  <span className="meeting-id-badge__label">ID:</span>
                  <code className="meeting-id-badge__code">{meeting.id}</code>
                  {copied ? (
                    <span className="meeting-id-badge__copied">
                      <Check size={13} /> Copied
                    </span>
                  ) : (
                    <Copy size={13} className="meeting-id-badge__icon" />
                  )}
                </button>
              </div>
            </div>
            <StatusBadge status={meeting.status} />
          </div>

          <SummaryCard summary={result.summary} />
          <KeyPointsList keyPoints={result.key_points} />
          <ActionItemsTable actionItems={result.action_items} />
          <TranscriptSection transcript={result.transcript} />
        </div>
      )}

      {/* Completed but result not yet loaded */}
      {meeting.status === 'completed' && !result && !error && (
        <div className="processing" style={{ textAlign: 'center' }}>
          <span className="spinner spinner--large" />
          <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
            Loading results…
          </p>
        </div>
      )}

      {/* Error loading result */}
      {meeting.status === 'completed' && !result && error && (
        <ErrorMessage message={error} />
      )}
    </div>
  );
}
