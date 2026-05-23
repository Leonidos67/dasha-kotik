import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminApp() {
  const { logout } = useAuth();
  const [section, setSection] = useState('reports');
  const [submissions, setSubmissions] = useState([]);
  const [days, setDays] = useState([]);
  const [editDay, setEditDay] = useState(null);
  const [giftForm, setGiftForm] = useState({ title: '', description: '' });
  const [saved, setSaved] = useState(false);

  const loadReports = useCallback(() => {
    api.adminSubmissions().then((r) => setSubmissions(r.submissions));
  }, []);

  const loadDays = useCallback(() => {
    api.adminDays().then((r) => setDays(r.days));
  }, []);

  useEffect(() => {
    if (section === 'reports') loadReports();
    else loadDays();
  }, [section, loadReports, loadDays]);

  const approve = async (id, status) => {
    await api.approve(id, status);
    loadReports();
  };

  const openGiftEdit = (day) => {
    setEditDay(day.dayNumber);
    setGiftForm({ title: day.gift?.title || '', description: day.gift?.description || '' });
    setSaved(false);
  };

  const saveGift = async () => {
    await api.updateGift(editDay, giftForm);
    setSaved(true);
    loadDays();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="admin-page">
      <header className="header">
        <h1>Админка Лёни</h1>
        <p>Отчёты Даши и подарки</p>
      </header>

      <nav className="admin-nav">
        <button
          type="button"
          className={`btn-secondary ${section === 'reports' ? 'active' : ''}`}
          onClick={() => setSection('reports')}
        >
          Отчёты
        </button>
        <button
          type="button"
          className={`btn-secondary ${section === 'gifts' ? 'active' : ''}`}
          onClick={() => setSection('gifts')}
        >
          Подарки и задания
        </button>
        <button type="button" className="btn-secondary" onClick={logout}>
          Выйти
        </button>
      </nav>

      {section === 'reports' && (
        <>
          {submissions.length === 0 && <p style={{ color: 'var(--muted)' }}>Пока нет отчётов.</p>}
          <table className="admin-table">
            <thead>
              <tr>
                <th>День</th>
                <th>Задание</th>
                <th>Отчёт</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s._id}>
                  <td>{s.dayNumber}</td>
                  <td>
                    {s.taskTitle}
                    <br />
                    <small style={{ color: 'var(--muted)' }}>{s.taskType}</small>
                  </td>
                  <td className="submission-preview">
                    {s.text && <p>{s.text}</p>}
                    {s.files?.map((f) =>
                      f.mimeType?.startsWith('image/') ? (
                        <a key={f.url} href={f.url} target="_blank" rel="noreferrer">
                          <img src={f.url} alt="" />
                        </a>
                      ) : f.mimeType?.startsWith('video/') ? (
                        <video key={f.url} src={f.url} controls />
                      ) : f.mimeType?.startsWith('audio/') ? (
                        <audio key={f.url} src={f.url} controls />
                      ) : (
                        <a key={f.url} href={f.url} target="_blank" rel="noreferrer">
                          Файл
                        </a>
                      )
                    )}
                  </td>
                  <td>
                    <span className={`status-chip ${s.status}`}>{s.status}</span>
                  </td>
                  <td>
                    {s.status !== 'approved' && (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ marginBottom: 4 }}
                        onClick={() => approve(s._id, 'approved')}
                      >
                        ✓
                      </button>
                    )}
                    {s.status !== 'rejected' && (
                      <button type="button" className="btn-secondary" onClick={() => approve(s._id, 'rejected')}>
                        ✗
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {section === 'gifts' && (
        <>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Выбери день — измени текст подарка. Сохранится в MongoDB.
          </p>
          <div className="day-picker" style={{ flexWrap: 'wrap' }}>
            {days.map((d) => (
              <button
                key={d.dayNumber}
                type="button"
                className={editDay === d.dayNumber ? 'active' : ''}
                onClick={() => openGiftEdit(d)}
              >
                {d.dayNumber}
              </button>
            ))}
          </div>

          {editDay && (
            <div className="edit-block">
              <h3>День {editDay} — подарок</h3>
              <label>Название подарка</label>
              <input
                value={giftForm.title}
                onChange={(e) => setGiftForm((f) => ({ ...f, title: e.target.value }))}
              />
              <label>Описание (что она получает)</label>
              <textarea
                value={giftForm.description}
                onChange={(e) => setGiftForm((f) => ({ ...f, description: e.target.value }))}
              />
              <button type="button" className="btn-primary" style={{ marginTop: '1rem' }} onClick={saveGift}>
                {saved ? 'Сохранено ✓' : 'Сохранить в базу'}
              </button>

              <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Задания этого дня</h4>
              {days
                .find((d) => d.dayNumber === editDay)
                ?.tasks?.map((task) => (
                  <TaskEditor key={task._id} dayNumber={editDay} task={task} onSave={loadDays} />
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TaskEditor({ dayNumber, task, onSave }) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    submissionType: task.submissionType,
  });
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await api.updateTask(dayNumber, task._id, form);
    setSaved(true);
    onSave();
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="edit-block" style={{ marginTop: '0.75rem' }}>
      <label>Задание</label>
      <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
      <label>Описание</label>
      <textarea
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      />
      <label>Тип отчёта</label>
      <select
        value={form.submissionType}
        onChange={(e) => setForm((f) => ({ ...f, submissionType: e.target.value }))}
        style={{
          width: '100%',
          padding: '0.6rem',
          borderRadius: 8,
          background: 'rgba(0,0,0,0.3)',
          color: 'var(--text)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <option value="photo">Фото</option>
        <option value="voice">Голос</option>
        <option value="text">Текст</option>
        <option value="workout">Тренировка (скрин)</option>
        <option value="video">Видео</option>
      </select>
      <button type="button" className="btn-secondary" style={{ marginTop: '0.5rem' }} onClick={save}>
        {saved ? 'Ок' : 'Сохранить задание'}
      </button>
    </div>
  );
}
