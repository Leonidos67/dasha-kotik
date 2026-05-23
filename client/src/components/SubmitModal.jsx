import { useState } from 'react';
import { api } from '../api';

const TYPE_LABELS = {
  photo: 'Прикрепи фото',
  voice: 'Прикрепи голосовое / аудио',
  text: 'Напиши текст',
  workout: 'Скрин тренировки с Apple Watch',
  video: 'Прикрепи видео',
};

export default function SubmitModal({ task, dayNumber, onClose, onSuccess }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const needsFile = ['photo', 'voice', 'workout', 'video'].includes(task.submissionType);
  const needsText = task.submissionType === 'text';

  const submit = async () => {
    setError('');
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

  const acceptMap = {
    photo: 'image/*',
    voice: 'audio/*',
    workout: 'image/*',
    video: 'video/*',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{task.title}</h2>
        {task.description && <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{task.description}</p>}

        {needsText && (
          <>
            <label>Твой ответ</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} />
          </>
        )}

        {needsFile && (
          <>
            <label>{TYPE_LABELS[task.submissionType]}</label>
            <input
              type="file"
              accept={acceptMap[task.submissionType] || '*/*'}
              multiple={task.submissionType === 'photo'}
              onChange={(e) => setFiles([...e.target.files])}
            />
          </>
        )}

        {error && <p className="error" style={{ marginTop: '0.75rem' }}>{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="button" className="btn-primary" style={{ flex: 1, marginTop: 0 }} disabled={loading} onClick={submit}>
            {loading ? 'Отправляю…' : 'Отправить зайке'}
          </button>
        </div>
      </div>
    </div>
  );
}
