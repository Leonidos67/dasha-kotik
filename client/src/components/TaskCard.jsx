import MediaGallery from './MediaGallery';

const STATUS = {
  pending: { label: 'Ждём проверки Лёни', class: 'pending' },
  approved: { label: 'Зай, ты молодец ✓', class: 'approved' },
  rejected: { label: 'Переделай, зай', class: 'rejected' },
};

export default function TaskCard({ task, index, onSubmit }) {
  const sub = task.submission;
  const status = sub?.status;
  const done = status === 'approved';
  const showActions = !sub || status === 'rejected';

  return (
    <article
      className={['task-card', done ? 'task-card--done' : ''].filter(Boolean).join(' ')}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="task-body">
        <div className="task-body__head">
          <div className="task-body__icon" aria-hidden>
            <span className="task-body__dot" />
          </div>
          <div className="task-body__text">
            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}
            {status && (
              <span className={`status-chip ${STATUS[status]?.class}`}>{STATUS[status]?.label}</span>
            )}
            {sub?.files?.length > 0 && (
              <>
                <p className="task-body__sent">
                  Отчёт отправлен ✓ · {sub.files.length}{' '}
                  {sub.files.length === 1 ? 'файл' : sub.files.length < 5 ? 'файла' : 'файлов'}
                </p>
                <div className="task-body__media">
                  <MediaGallery files={sub.files} compact />
                </div>
              </>
            )}
          </div>
        </div>

        {showActions && (
          <button type="button" className="btn-primary btn-primary--zaya" onClick={() => onSubmit(task)}>
            Как нехуй сделаю, Зая!
          </button>
        )}

        {status === 'pending' && sub && <p className="task-body__wait">Лёня скоро проверит 💕</p>}
      </div>
    </article>
  );
}
