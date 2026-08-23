import { AlertCircle } from 'lucide-react';

interface Props {
  message: string;
}

export default function ErrorMessage({ message }: Props) {
  return (
    <div className="error-message" role="alert">
      <AlertCircle className="error-message__icon" size={20} />
      <p className="error-message__text">{message}</p>
    </div>
  );
}
