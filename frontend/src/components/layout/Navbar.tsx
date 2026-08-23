import { Link } from 'react-router-dom';
import { AudioLines } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

export default function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <Link to="/" className="navbar__logo">
        <span className="navbar__logo-icon">
          <AudioLines size={18} />
        </span>
        MeetingAI
      </Link>

      <div className="navbar__actions">
        <ThemeToggle />
      </div>
    </nav>
  );
}
