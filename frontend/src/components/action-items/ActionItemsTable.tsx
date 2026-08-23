import { CheckSquare, User, CalendarClock, Inbox } from 'lucide-react';
import type { ActionItem } from '../../types/meeting';

interface Props {
  actionItems: ActionItem[];
}

export default function ActionItemsTable({ actionItems }: Props) {
  return (
    <div className="card">
      <div className="card__header">
        <div className="card__icon card__icon--green">
          <CheckSquare size={18} />
        </div>
        <h3 className="card__title">Action Items</h3>
      </div>

      {actionItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"><Inbox size={22} /></div>
          <p className="empty-state__text">No action items identified</p>
        </div>
      ) : (
        <div className="action-items__grid">
          {actionItems.map((item, i) => (
            <div key={i} className="action-item">
              <p className="action-item__task">{item.task}</p>
              <div className="action-item__meta">
                <div className="action-item__meta-row">
                  <User size={14} />
                  <span>{item.assignee || 'Unassigned'}</span>
                </div>
                <div className="action-item__meta-row">
                  <CalendarClock size={14} />
                  <span>{item.deadline || 'No deadline'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
