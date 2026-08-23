import { Check, Loader2, Circle } from 'lucide-react';
import type { MeetingStatus } from '../../types/meeting';

interface Step {
  key: string;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { key: 'uploaded', label: 'Upload Complete', description: 'Your audio file has been received' },
  { key: 'processing', label: 'Transcribing Audio', description: 'Converting speech to text with AI' },
  { key: 'transcribed', label: 'Transcript Ready', description: 'Audio has been transcribed' },
  { key: 'summarizing', label: 'Generating Summary', description: 'AI is analyzing the transcript' },
  { key: 'completed', label: 'Analysis Complete', description: 'Your meeting summary is ready' },
];

const STATUS_ORDER: MeetingStatus[] = [
  'uploaded',
  'processing',
  'transcribed',
  'summarizing',
  'completed',
];

function getStepState(
  stepKey: string,
  currentStatus: MeetingStatus
): 'completed' | 'active' | 'pending' {
  const stepIdx = STATUS_ORDER.indexOf(stepKey as MeetingStatus);
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

interface Props {
  status: MeetingStatus;
}

export default function ProcessingStatus({ status }: Props) {
  if (status === 'failed') return null;

  return (
    <div className="processing">
      <div className="processing__header">
        <div className="processing__icon">
          <Loader2 size={28} className="spinner-icon" style={{ animation: 'spin 1.5s linear infinite' }} />
        </div>
        <h2 className="processing__title">Analyzing your meeting</h2>
        <p className="processing__subtitle">
          This usually takes a few minutes depending on the audio length
        </p>
      </div>

      <div className="processing__steps">
        {STEPS.map((step) => {
          const state = getStepState(step.key, status);
          return (
            <div
              key={step.key}
              className={`processing-step processing-step--${state}`}
            >
              <div className="processing-step__indicator">
                {state === 'completed' && <Check size={16} />}
                {state === 'active' && <Loader2 size={16} />}
                {state === 'pending' && <Circle size={10} />}
              </div>
              <div className="processing-step__content">
                <p className="processing-step__label">{step.label}</p>
                <p className="processing-step__desc">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
