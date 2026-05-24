import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import './SubmitModal.css';

const MAX_FILES = 10;

const TYPE_LABELS = {
  photo: 'Фото (можно несколько)',
  voice: 'Голосовые / аудио (можно несколько)',
  text: 'Напиши текст',
  workout: 'Скрины тренировки (можно несколько)',
  video: 'Видео (можно несколько)',
};

const MULTI_FILE_TYPES = new Set(['photo', 'voice', 'workout', 'video']);

const acceptMap = {
  photo: 'image/*',
  voice: 'audio/*',
  workout: 'image/*',
  video: 'video/*',
};

export default function SubmitModal({ task, dayNumber, onClose, onSuccess }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const needsFile = MULTI_FILE_TYPES.has(task.submissionType);
  const needsText = task.submissionType === 'text';
  const allowMultiple = MULTI_FILE_TYPES.has(task.submissionType);

  const previews = useMemo(() => {
    return files.map((file) => ({
      file,
      key: `${file.name}-${file.size}-${file.lastModified}`,
      url: file.type.startsWith('image/') || file.type.startsWith('audio/') || file.type.startsWith('video/')
        ? URL.createObjectURL(file)
        : null,
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [previews]);

  const addFiles = (picked) => {
    if (!picked.length) return;
    setFiles((prev) => {
      const merged = [...prev, ...picked];
      return merged.slice(0, MAX_FILES);
    });
  };

  const removeFile = (key) => {
    setFiles((prev) =>
      prev.filter((f) => `${f.name}-${f.size}-${f.lastModified}` !== key)
    );
  };

  const submit = async () => {
    setError('');
    if (needsFile && files.length === 0) {
      setError('Прикрепи хотя бы один файл');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('dayNumber', String(dayNumber));
      form.append('taskId', task._id);
      if (text) form.append('text', text);
      files.forEach((f) => form.append('files', f));

      await api.submit(form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal submit-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{task.title}</h2>
        {task.description && <p className="submit-modal__desc">{task.description}</p>}

        {needsText && (
          <>
            <label>Твой ответ</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} />
          </>
        )}

        {needsFile && (
          <>
            <label>{TYPE_LABELS[task.submissionType]}</label>
            <p className="submit-modal__hint">
              До {MAX_FILES} файлов · выбрано: {files.length}
            </p>
            <label className="submit-modal__file-btn">
              <span>+ Добавить {allowMultiple ? 'файлы' : 'файл'}</span>
              <input
                type="file"
                accept={acceptMap[task.submissionType] || '*/*'}
                multiple={allowMultiple}
                onChange={(e) => {
                  addFiles([...e.target.files]);
                  e.target.value = '';
                }}
              />
            </label>

            {previews.length > 0 && (
              <ul className="submit-modal__previews">
                {previews.map(({ file, key, url }) => (
                  <li key={key} className="submit-preview">
                    {file.type.startsWith('image/') && url ? (
                      <img src={url} alt="" className="submit-preview__thumb" />
                    ) : file.type.startsWith('audio/') && url ? (
                      <div className="submit-preview__audio">
                        <span aria-hidden>🎙</span>
                        <audio src={url} controls preload="metadata" />
                      </div>
                    ) : file.type.startsWith('video/') && url ? (
                      <video src={url} className="submit-preview__video" controls preload="metadata" />
                    ) : (
                      <span className="submit-preview__name">📎 {file.name}</span>
                    )}
                    <button
                      type="button"
                      className="submit-preview__remove"
                      aria-label="Убрать файл"
                      onClick={() => removeFile(key)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {error && <p className="error submit-modal__error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ flex: 1, marginTop: 0 }}
            disabled={loading}
            onClick={submit}
          >
            {loading ? 'Отправляю…' : 'Отправить зайке'}
          </button>
        </div>
      </div>
    </div>
  );
}
