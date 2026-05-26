import { useCallback, useEffect, useState } from 'react';
import { api, TASK_SUBMISSION_TYPES } from '../api';
import MediaGallery from '../components/MediaGallery';
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
                    <small style={{ color: 'var(--gold)' }}>{s.userLabel || 'Даша'}</small>
                    <br />
                    {s.taskTitle}
                    <br />
                    <small style={{ color: 'var(--muted)' }}>{s.taskType}</small>
                  </td>
                  <td className="submission-preview">
                    {s.text && <p className="submission-preview__text">{s.text}</p>}
                    <MediaGallery files={s.files} />
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
              <AddTaskForm dayNumber={editDay} onAdded={loadDays} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TaskTypeSelect({ value, onChange }) {
  return (
    <select className="admin-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {TASK_SUBMISSION_TYPES.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  );
}

function TaskEditor({ dayNumber, task, onSave }) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    submissionType: task.submissionType,
    hidden: !!task.hidden,
  });
  const [saved, setSaved] = useState(false);
  const [toggling, setToggling] = useState(false);

  const save = async () => {
    await api.updateTask(dayNumber, task._id, form);
    setSaved(true);
    onSave();
    setTimeout(() => setSaved(false), 1500);
  };

  const toggleHidden = async () => {
    const hidden = !form.hidden;
    setToggling(true);
    try {
      await api.updateTask(dayNumber, task._id, { hidden });
      setForm((f) => ({ ...f, hidden }));
      onSave();
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      className={`edit-block admin-task-editor ${form.hidden ? 'admin-task-editor--hidden' : ''}`}
      style={{ marginTop: '0.75rem' }}
    >
      <div className="admin-task-editor__head">
        <span className="admin-task-editor__status">
          {form.hidden ? 'Скрыто у Даши' : 'Видно Даше'}
        </span>
        <button
          type="button"
          className="btn-secondary admin-task-editor__toggle"
          onClick={toggleHidden}
          disabled={toggling}
        >
          {form.hidden ? 'Показать' : 'Скрыть'}
        </button>
      </div>
      <label>Задание</label>
      <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
      <label>Описание</label>
      <textarea
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      />
      <label>Тип отчёта</label>
      <TaskTypeSelect
        value={form.submissionType}
        onChange={(submissionType) => setForm((f) => ({ ...f, submissionType }))}
      />
      <button type="button" className="btn-secondary" style={{ marginTop: '0.5rem' }} onClick={save}>
        {saved ? 'Ок' : 'Сохранить задание'}
      </button>
    </div>
  );
}

function AddTaskForm({ dayNumber, onAdded }) {
  const empty = {
    title: '',
    description: '',
    submissionType: 'photo',
    hidden: false,
  };
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.title.trim()) {
      setError('Введи название задания');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await api.createTask(dayNumber, {
        title: form.title.trim(),
        description: form.description.trim(),
        submissionType: form.submissionType,
        hidden: form.hidden,
      });
      setForm(empty);
      setOpen(false);
      onAdded();
    } catch (e) {
      setError(e.message || 'Не удалось добавить');
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className="btn-primary admin-add-task-btn"
        style={{ marginTop: '1rem' }}
        onClick={() => setOpen(true)}
      >
        + Добавить задание
      </button>
    );
  }

  return (
    <div className="edit-block admin-add-task" style={{ marginTop: '1rem' }}>
      <h4>Новое задание</h4>
      <label>Название</label>
      <input
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        placeholder="Например: Утренняя зарядка"
      />
      <label>Описание</label>
      <textarea
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        placeholder="Что нужно сделать и что прислать"
      />
      <label>Тип отчёта</label>
      <TaskTypeSelect
        value={form.submissionType}
        onChange={(submissionType) => setForm((f) => ({ ...f, submissionType }))}
      />
      <label className="admin-checkbox-label">
        <input
          type="checkbox"
          checked={form.hidden}
          onChange={(e) => setForm((f) => ({ ...f, hidden: e.target.checked }))}
        />
        Сразу скрыть от Даши
      </label>
      {error && <p className="admin-form-error">{error}</p>}
      <div className="admin-add-task__actions">
        <button type="button" className="btn-primary" onClick={submit} disabled={saving}>
          {saving ? 'Добавляю…' : 'Добавить в базу'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setOpen(false);
            setForm(empty);
            setError('');
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
