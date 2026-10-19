import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileText, Plus, Trash2, Edit3, Paperclip, X, Check } from 'lucide-react';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Note editor modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const res = await api.getNotes();
      if (res.success) {
        setNotes(res.notes);
      }
    } catch (e) {
      console.error('Failed to load notes:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenNew = () => {
    setCurrentNoteId(null);
    setTitle('');
    setBody('');
    setAttachment(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (note) => {
    setCurrentNoteId(note._id);
    setTitle(note.title);
    setBody(note.body);
    setAttachment(null);
    setIsEditorOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('body', body);
      if (attachment) {
        formData.append('attachment', attachment);
      }

      if (currentNoteId) {
        await api.updateNote(currentNoteId, formData);
      } else {
        await api.createNote(formData);
      }

      setIsEditorOpen(false);
      fetchNotes();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.deleteNote(id);
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    (n.body && n.body.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="notes-page">
      <div className="notes-header glass-panel">
        <div className="notes-title-group">
          <FileText size={24} className="notes-icon-accent" />
          <h1>Personal Notes & Journal</h1>
          <span className="badge badge-primary">{notes.length} Notes</span>
        </div>
        <div className="notes-actions-bar">
          <input
            type="text"
            className="notes-search-input"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={handleOpenNew}>
            <Plus size={16} /> New Note
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading notes...</div>
      ) : filteredNotes.length > 0 ? (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <div key={note._id} className="note-card glass-panel">
              <div className="note-card-top">
                <h3 className="note-title">{note.title}</h3>
                <div className="note-actions">
                  <button type="button" className="icon-btn" onClick={() => handleOpenEdit(note)}>
                    <Edit3 size={15} />
                  </button>
                  <button type="button" className="icon-btn delete-btn" onClick={() => handleDelete(note._id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <p className="note-body-preview">{note.body || 'No description added.'}</p>

              <div className="note-card-footer">
                <span className="note-date">{new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</span>
                {note.attachmentPath && (
                  <a
                    href={note.attachmentPath}
                    target="_blank"
                    rel="noreferrer"
                    className="attachment-pill"
                  >
                    <Paperclip size={12} /> Attachment
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-panel">
          <FileText size={48} className="empty-icon" />
          <h3>No Notes Found</h3>
          <p>Create personal study notes, paste code snippets, or document solutions.</p>
          <button type="button" className="btn btn-primary" onClick={handleOpenNew}>
            <Plus size={16} /> Create Your First Note
          </button>
        </div>
      )}

      {/* Note Editor Modal */}
      {isEditorOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditorOpen(false)}>
          <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{currentNoteId ? 'Edit Study Note' : 'Create Study Note'}</h3>
              <button type="button" className="modal-close" onClick={() => setIsEditorOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="note-modal-form">
              <div className="form-group">
                <label>Note Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pandas DataFrame filtering tips"
                  required
                />
              </div>

              <div className="form-group">
                <label>Content / Code Notes</label>
                <textarea
                  className="form-textarea"
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Document formulas, syntax, or insights..."
                />
              </div>

              <div className="form-group">
                <label>Optional Attachment File</label>
                <input
                  type="file"
                  className="form-file-input"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditorOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .notes-page {
          max-width: 1360px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          width: 100%;
        }
        .notes-header {
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .notes-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .notes-title-group h1 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
        }
        .notes-icon-accent {
          color: var(--accent-secondary);
        }
        .notes-actions-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .notes-search-input {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 8px 14px;
          color: var(--text-primary);
          font-size: 0.9rem;
          min-width: 220px;
        }
        .notes-search-input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .note-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: var(--radius-lg);
          min-height: 200px;
        }
        .note-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }
        .note-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .note-actions {
          display: flex;
          gap: 6px;
        }
        .icon-btn {
          color: var(--text-muted);
          padding: 4px;
          transition: color var(--transition-fast);
        }
        .icon-btn:hover {
          color: var(--text-primary);
        }
        .delete-btn:hover {
          color: var(--accent-danger);
        }
        .note-body-preview {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 20px;
          white-space: pre-wrap;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .note-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
        }
        .note-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .attachment-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.1);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-card {
          width: 100%;
          max-width: 560px;
          padding: 28px;
          background: var(--bg-secondary);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .modal-header h3 {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 700;
        }
        .modal-close {
          color: var(--text-muted);
        }
        .note-modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 12px;
        }
      `}</style>
    </div>
  );
}
