import { Lightbulb, Inbox } from 'lucide-react';

interface Props {
  keyPoints: string[];
}

export default function KeyPointsList({ keyPoints }: Props) {
  return (
    <div className="card">
      <div className="card__header">
        <div className="card__icon card__icon--orange">
          <Lightbulb size={18} />
        </div>
        <h3 className="card__title">Key Points</h3>
      </div>

      {keyPoints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"><Inbox size={22} /></div>
          <p className="empty-state__text">No key points identified</p>
        </div>
      ) : (
        <ul className="key-points__list">
          {keyPoints.map((point, i) => (
            <li key={i} className="key-points__item">
              <span className="key-points__bullet" />
              {point}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
