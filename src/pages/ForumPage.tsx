import { useState, useEffect, useCallback } from 'react';
import { forumApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import RichEditor from '@/components/RichEditor';
import Icon from '@/components/ui/icon';

interface Topic {
  id: number; title: string; content: string;
  author_id: number; author: string;
  views: number; is_pinned: boolean; is_locked: boolean;
  created_at: string; updated_at: string; post_count: number;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
  return new Date(iso).toLocaleDateString('ru');
}

interface ForumPageProps {
  onOpenTopic: (id: number) => void;
}

export default function ForumPage({ onOpenTopic }: ForumPageProps) {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await forumApi.getTopics();
      setTopics(data.topics || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Укажите заголовок'); return; }
    const stripped = content.replace(/<[^>]+>/g, '').trim();
    if (!stripped) { setError('Напишите содержимое темы'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await forumApi.createTopic(title.trim(), content);
      setShowForm(false); setTitle(''); setContent('');
      await load();
      onOpenTopic(res.topic_id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-1">Форум</h1>
          <p className="text-muted-foreground text-sm">Обсуждения, гайды и советы сообщества</p>
        </div>
        {user && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-sm hover:bg-primary/90 transition-colors">
            <Icon name="Plus" size={14} /> Новая тема
          </button>
        )}
      </div>

      {/* Форма создания темы */}
      {showForm && (
        <div className="bg-card border border-primary/30 rounded-sm p-5 mb-6 animate-fade-in">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="PenLine" size={14} className="text-primary" /> Новая тема
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            {error && (
              <div className="p-2 bg-destructive/10 border border-destructive/30 text-destructive text-xs rounded-sm flex items-center gap-2">
                <Icon name="AlertCircle" size={12} /> {error}
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Заголовок *</label>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Заголовок темы..."
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Содержимое *</label>
              <RichEditor value={content} onChange={setContent} placeholder="Опишите тему подробно..." minHeight={160} />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setTitle(''); setContent(''); setError(''); }}
                className="px-4 py-2 text-sm border border-border rounded-sm hover:bg-muted transition-colors">
                Отмена
              </button>
              <button type="submit" disabled={submitting}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2">
                {submitting ? <><Icon name="Loader" size={13} className="animate-spin" /> Публикую...</> : 'Опубликовать'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!user && (
        <div className="bg-card border border-border rounded-sm p-4 mb-6 text-sm text-muted-foreground flex items-center gap-3">
          <Icon name="LogIn" size={16} />
          Войдите, чтобы создавать темы и участвовать в обсуждениях
        </div>
      )}

      {/* Список тем */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          <Icon name="Loader" size={18} className="animate-spin mr-2" /> Загрузка...
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="MessageSquare" size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Тем пока нет. Будьте первым!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {topics.map(t => (
            <div
              key={t.id}
              onClick={() => onOpenTopic(t.id)}
              className={`bg-card border rounded-sm p-4 cursor-pointer hover:border-primary/40 transition-all group
                ${t.is_pinned ? 'border-primary/30' : 'border-border'}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {t.is_pinned && (
                      <span className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">
                        <Icon name="Pin" size={9} /> Закреплено
                      </span>
                    )}
                    {t.is_locked && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                        <Icon name="Lock" size={9} /> Закрыто
                      </span>
                    )}
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                      {t.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Icon name="User" size={10} /> {t.author}</span>
                    <span className="flex items-center gap-1"><Icon name="Clock" size={10} /> {timeAgo(t.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-shrink-0">
                  <span className="flex items-center gap-1"><Icon name="MessageCircle" size={12} /> {t.post_count}</span>
                  <span className="flex items-center gap-1"><Icon name="Eye" size={12} /> {t.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
