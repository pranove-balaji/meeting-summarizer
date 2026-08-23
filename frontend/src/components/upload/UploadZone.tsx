import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { CloudUpload, FileAudio, X, Upload } from 'lucide-react';

const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.webm'];
const ALLOWED_MIME_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/webm'];
const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

interface Props {
  onUpload: (file: File) => void;
  isUploading: boolean;
  uploadError: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx).toLowerCase() : '';
}

function isValidAudioFile(file: File): string | null {
  const ext = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Unsupported format "${ext}". Accepted: ${ALLOWED_EXTENSIONS.join(', ')}`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File is too large (${formatFileSize(file.size)}). Maximum is 100 MB.`;
  }
  return null;
}

export default function UploadZone({ onUpload, isUploading, uploadError }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    const error = isValidAudioFile(f);
    if (error) {
      setValidationError(error);
      setFile(null);
      return;
    }
    setValidationError(null);
    setFile(f);
  }, []);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleRemove = () => {
    setFile(null);
    setValidationError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUploadClick = () => {
    if (file) onUpload(file);
  };

  const handleZoneClick = () => {
    if (!file && !isUploading) inputRef.current?.click();
  };

  const error = validationError || uploadError;

  const zoneClasses = [
    'upload-zone',
    dragOver && 'upload-zone--drag-over',
    file && 'upload-zone--has-file',
    isUploading && 'upload-zone--uploading',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <div
        className={zoneClasses}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleZoneClick(); }}
        aria-label="Upload audio file"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_MIME_TYPES.join(',')}
          onChange={handleInputChange}
          hidden
          aria-hidden="true"
        />

        {isUploading ? (
          <>
            <div className="upload-zone__icon">
              <span className="spinner spinner--large" />
            </div>
            <p className="upload-zone__title">Uploading your meeting…</p>
            <p className="upload-zone__subtitle">Please wait while we upload your file</p>
          </>
        ) : file ? (
          <>
            <div className="upload-zone__file-info">
              <div className="upload-zone__file-icon">
                <FileAudio size={22} />
              </div>
              <div className="upload-zone__file-details">
                <span className="upload-zone__filename">{file.name}</span>
                <span className="upload-zone__filesize">{formatFileSize(file.size)}</span>
              </div>
            </div>
            <div className="upload-zone__actions">
              <button className="upload-zone__remove-btn" onClick={(e) => { e.stopPropagation(); handleRemove(); }}>
                <X size={14} /> Remove
              </button>
              <button className="btn btn--primary" onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}>
                <Upload size={16} /> Upload & Analyze
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="upload-zone__icon">
              <CloudUpload size={26} />
            </div>
            <p className="upload-zone__title">Drop your audio file here</p>
            <p className="upload-zone__subtitle">or click to browse from your computer</p>
            <div className="upload-zone__formats">
              {ALLOWED_EXTENSIONS.map((ext) => (
                <span key={ext} className="upload-zone__format-tag">{ext.slice(1)}</span>
              ))}
              <span className="upload-zone__format-tag">Max 100 MB</span>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="error-message" role="alert" style={{ marginTop: '1rem', maxWidth: 640, marginInline: 'auto' }}>
          <p className="error-message__text">{error}</p>
        </div>
      )}
    </div>
  );
}
