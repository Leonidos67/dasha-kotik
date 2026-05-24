import { mediaUrl } from '../api';
import './MediaGallery.css';

function MediaItem({ file, compact }) {
  const url = mediaUrl(file.url);
  const name = file.originalName || 'файл';

  if (file.mimeType?.startsWith('image/')) {
    return (
      <a
        className="media-gallery__item media-gallery__item--image"
        href={url}
        target="_blank"
        rel="noreferrer"
        title={name}
      >
        <img src={url} alt="" loading="lazy" />
      </a>
    );
  }

  if (file.mimeType?.startsWith('video/')) {
    return (
      <div className={`media-gallery__item media-gallery__item--video ${compact ? 'media-gallery__item--compact' : ''}`}>
        <video src={url} controls preload="metadata" />
        {!compact && <span className="media-gallery__caption">{name}</span>}
      </div>
    );
  }

  if (file.mimeType?.startsWith('audio/')) {
    return (
      <div className={`media-gallery__item media-gallery__item--audio ${compact ? 'media-gallery__item--compact' : ''}`}>
        <span className="media-gallery__audio-icon" aria-hidden>
          🎙
        </span>
        <audio src={url} controls preload="metadata" />
        <span className="media-gallery__caption">{name}</span>
      </div>
    );
  }

  return (
    <a className="media-gallery__item media-gallery__item--file" href={url} target="_blank" rel="noreferrer">
      📎 {name}
    </a>
  );
}

export default function MediaGallery({ files, compact = false, className = '' }) {
  if (!files?.length) return null;

  return (
    <div
      className={['media-gallery', compact ? 'media-gallery--compact' : '', className].filter(Boolean).join(' ')}
    >
      {files.map((f, i) => (
        <MediaItem key={f.url || f.filename || i} file={f} compact={compact} />
      ))}
    </div>
  );
}
