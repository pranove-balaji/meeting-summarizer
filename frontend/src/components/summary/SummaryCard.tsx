import { FileText } from 'lucide-react';

interface Props {
  summary: string;
}

export default function SummaryCard({ summary }: Props) {
  return (
    <div className="card">
      <div className="card__header">
        <div className="card__icon card__icon--blue">
          <FileText size={18} />
        </div>
        <h3 className="card__title">Summary</h3>
      </div>
      <p className="summary__text">{summary}</p>
    </div>
  );
}
