import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { getMeeting } from '../../api/meetings';
import { ApiClientError } from '../../api/client';

export default function MeetingLookup() {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmed = meetingId.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate the meeting exists before navigating
      await getMeeting(trimmed);
      navigate(`/meeting/${trimmed}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 404) {
          setError('No meeting found with this ID. Please check and try again.');
        } else {
          setError(err.detail);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="meeting-lookup" aria-label="Look up a meeting">
      <div className="meeting-lookup__divider">
        <span className="meeting-lookup__divider-line" />
        <span className="meeting-lookup__divider-text">or look up a past meeting</span>
        <span className="meeting-lookup__divider-line" />
      </div>

      <form className="meeting-lookup__form" onSubmit={handleSubmit}>
        <div className="meeting-lookup__input-wrapper">
          <Search size={18} className="meeting-lookup__search-icon" />
          <input
            id="meeting-id-input"
            type="text"
            className="meeting-lookup__input"
            placeholder="Paste your meeting ID here…"
            value={meetingId}
            onChange={(e) => {
              setMeetingId(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          className="btn btn--primary meeting-lookup__btn"
          disabled={!meetingId.trim() || isLoading}
        >
          {isLoading ? (
            <span className="spinner" />
          ) : (
            <>
              View Results <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="meeting-lookup__error" role="alert">
          <p className="meeting-lookup__error-text">{error}</p>
        </div>
      )}
    </section>
  );
}
