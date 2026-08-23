import { useEffect, useRef, useState } from 'react';
import { getMeeting, getMeetingResult } from '../api/meetings';
import { ApiClientError } from '../api/client';
import type { Meeting, MeetingResult } from '../types/meeting';

const POLL_INTERVAL = 3000;

interface UseMeetingPollingReturn {
  meeting: Meeting | null;
  result: MeetingResult | null;
  error: string | null;
  isLoading: boolean;
}

export function useMeetingPolling(meetingId: string | undefined): UseMeetingPollingReturn {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!meetingId) return;

    let cancelled = false;

    async function poll() {
      try {
        const meetingData = await getMeeting(meetingId!);
        if (cancelled) return;

        setMeeting(meetingData);
        setError(null);

        if (meetingData.status === 'completed') {
          try {
            const resultData = await getMeetingResult(meetingId!);
            if (cancelled) return;
            setResult(resultData);
          } catch (err) {
            if (!cancelled) {
              setError(
                err instanceof ApiClientError
                  ? err.detail
                  : 'Failed to load meeting results.'
              );
            }
          }
          stopPolling();
          setIsLoading(false);
        } else if (meetingData.status === 'failed') {
          stopPolling();
          setIsLoading(false);
          setError('Processing failed. Please try uploading your meeting again.');
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiClientError
              ? err.detail
              : 'Unable to check meeting status.'
          );
        }
      }
    }

    function stopPolling() {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Initial fetch
    poll();

    // Start polling
    intervalRef.current = window.setInterval(poll, POLL_INTERVAL);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [meetingId]);

  return { meeting, result, error, isLoading };
}
