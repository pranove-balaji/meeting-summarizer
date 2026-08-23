import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, ListChecks, MessageSquareText } from 'lucide-react';
import UploadZone from '../components/upload/UploadZone';
import MeetingLookup from '../components/meeting/MeetingLookup';
import { uploadMeeting } from '../api/meetings';
import { ApiClientError } from '../api/client';

const FEATURES = [
  {
    icon: <Brain size={20} />,
    color: 'blue',
    title: 'Smart Summarization',
    desc: 'AI-powered summaries that capture the essence of your meetings in seconds.',
  },
  {
    icon: <MessageSquareText size={20} />,
    color: 'green',
    title: 'Auto Transcription',
    desc: 'Converts your meeting audio into accurate text with Sarvam AI.',
  },
  {
    icon: <ListChecks size={20} />,
    color: 'orange',
    title: 'Action Items',
    desc: 'Automatically extracts tasks, assignees, and deadlines from discussions.',
  },
  {
    icon: <Sparkles size={20} />,
    color: 'purple',
    title: 'Key Points',
    desc: 'Highlights the most important decisions and insights from your meeting.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const meeting = await uploadMeeting(file);
      navigate(`/meeting/${meeting.id}`);
    } catch (err) {
      setUploadError(
        err instanceof ApiClientError
          ? err.detail
          : 'Failed to upload. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__badge">
          <Sparkles size={14} />
          AI-Powered Meeting Analysis
        </div>
        <h1 className="hero__title">
          Transform your meetings<br />
          into actionable insights
        </h1>
        <p className="hero__subtitle">
          Upload your meeting recording and let AI extract summaries,
          key points, and action items — automatically.
        </p>
      </section>

      <UploadZone
        onUpload={handleUpload}
        isUploading={isUploading}
        uploadError={uploadError}
      />

      <MeetingLookup />

      <section className="features" aria-label="Features">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <div className={`feature-card__icon feature-card__icon--${f.color}`}>
              {f.icon}
            </div>
            <h3 className="feature-card__title">{f.title}</h3>
            <p className="feature-card__desc">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
