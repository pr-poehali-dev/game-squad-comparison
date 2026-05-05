import Icon from '@/components/ui/icon';

interface SiteStats {
  total_unique: number;
  total_views: number;
  today_unique: number;
  week_unique: number;
  month_unique: number;
  total_users: number;
  daily: { date: string; visitors: number }[];
}

interface AdminTabStatsProps {
  siteStats: SiteStats | null;
  statsLoading: boolean;
}

export function AdminTabStats({ siteStats, statsLoading }: AdminTabStatsProps) {
  return (
    <div>
      {statsLoading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Загрузка статистики...</div>
      ) : !siteStats ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Нет данных</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'За сегодня', value: siteStats.today_unique, icon: 'CalendarDays' },
              { label: 'За 7 дней', value: siteStats.week_unique, icon: 'TrendingUp' },
              { label: 'За 30 дней', value: siteStats.month_unique, icon: 'BarChart2' },
              { label: 'Всего уникальных', value: siteStats.total_unique, icon: 'Users' },
              { label: 'Всего просмотров', value: siteStats.total_views, icon: 'Eye' },
              { label: 'Зарегистрировано', value: siteStats.total_users, icon: 'UserCheck' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-card border border-border rounded-sm p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={14} />
                  <span className="text-xs">{label}</span>
                </div>
                <div className="text-2xl font-semibold text-foreground" style={{ fontFamily: 'Oswald, sans-serif' }}>{value}</div>
              </div>
            ))}
          </div>

          {siteStats.daily.length > 0 && (
            <div className="bg-card border border-border rounded-sm p-4">
              <div className="text-xs text-muted-foreground mb-4">Уникальные посетители за 30 дней</div>
              <div className="flex items-end gap-1 h-24">
                {(() => {
                  const max = Math.max(...siteStats.daily.map(d => d.visitors), 1);
                  return siteStats.daily.map(d => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className="w-full bg-primary/60 rounded-sm hover:bg-primary transition-colors"
                        style={{ height: `${(d.visitors / max) * 100}%`, minHeight: d.visitors > 0 ? '2px' : '0' }}
                      />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover border border-border text-xs px-1.5 py-0.5 rounded hidden group-hover:block whitespace-nowrap z-10">
                        {d.date.slice(5)}: {d.visitors}
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{siteStats.daily[0]?.date.slice(5)}</span>
                <span>{siteStats.daily[siteStats.daily.length - 1]?.date.slice(5)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PendingTopic { id: number; title: string; content: string; author: string; author_id: number; created_at: string; }
interface PendingGuide { id: number; title: string; author: string; author_id: number; created_at: string; }

interface AdminTabModerationProps {
  pendingTopics: PendingTopic[];
  pendingGuides: PendingGuide[];
  moderationLoading: boolean;
  expandedTopic: number | null;
  processingId: string | null;
  onSetExpandedTopic: (id: number | null) => void;
  onPublishTopic: (id: number, approve: boolean) => void;
  onPublishGuide: (id: number, approve: boolean) => void;
}

export function AdminTabModeration({
  pendingTopics,
  pendingGuides,
  moderationLoading,
  expandedTopic,
  processingId,
  onSetExpandedTopic,
  onPublishTopic,
  onPublishGuide,
}: AdminTabModerationProps) {
  return (
    <div>
      {moderationLoading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Загрузка...</div>
      ) : (pendingTopics.length + pendingGuides.length) === 0 ? (
        <div className="py-16 text-center">
          <Icon name="CheckCircle" size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm text-muted-foreground">Нет публикаций на проверке</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingTopics.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="MessageSquare" size={14} className="text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Темы форума ({pendingTopics.length})
                </span>
              </div>
              <div className="space-y-3">
                {pendingTopics.map(topic => (
                  <div key={topic.id} className="bg-card border border-border rounded-sm overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground mb-1">{topic.title}</div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Автор: <span className="text-foreground">{topic.author}</span> · {new Date(topic.created_at).toLocaleDateString('ru')}
                          </div>
                          {expandedTopic === topic.id && (
                            <div className="text-xs text-muted-foreground leading-relaxed mt-2 mb-3 max-h-40 overflow-y-auto"
                              dangerouslySetInnerHTML={{ __html: topic.content }} />
                          )}
                          <button onClick={() => onSetExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                            <Icon name={expandedTopic === topic.id ? 'ChevronUp' : 'ChevronDown'} size={11} />
                            {expandedTopic === topic.id ? 'Свернуть' : 'Читать текст'}
                          </button>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => onPublishTopic(topic.id, true)}
                            disabled={processingId === `topic-${topic.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm font-semibold transition-all disabled:opacity-40"
                            style={{ background: 'hsl(150 48% 40% / 0.15)', border: '1px solid hsl(150 48% 40% / 0.4)', color: 'hsl(150 48% 60%)' }}>
                            <Icon name={processingId === `topic-${topic.id}` ? 'Loader' : 'Check'} size={12} className={processingId === `topic-${topic.id}` ? 'animate-spin' : ''} /> Одобрить
                          </button>
                          <button onClick={() => onPublishTopic(topic.id, false)}
                            disabled={processingId === `topic-${topic.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm font-semibold transition-all disabled:opacity-40"
                            style={{ background: 'hsl(355 62% 40% / 0.15)', border: '1px solid hsl(355 62% 40% / 0.4)', color: 'hsl(355 72% 62%)' }}>
                            <Icon name="X" size={12} /> Отклонить
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingGuides.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="BookOpen" size={14} className="text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Гайды ({pendingGuides.length})
                </span>
              </div>
              <div className="space-y-3">
                {pendingGuides.map(guide => (
                  <div key={guide.id} className="bg-card border border-border rounded-sm p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground mb-1">{guide.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Автор: <span className="text-foreground">{guide.author}</span> · {new Date(guide.created_at).toLocaleDateString('ru')}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => onPublishGuide(guide.id, true)}
                          disabled={processingId === `guide-${guide.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm font-semibold transition-all disabled:opacity-40"
                          style={{ background: 'hsl(150 48% 40% / 0.15)', border: '1px solid hsl(150 48% 40% / 0.4)', color: 'hsl(150 48% 60%)' }}>
                          <Icon name={processingId === `guide-${guide.id}` ? 'Loader' : 'Check'} size={12} className={processingId === `guide-${guide.id}` ? 'animate-spin' : ''} /> Одобрить
                        </button>
                        <button onClick={() => onPublishGuide(guide.id, false)}
                          disabled={processingId === `guide-${guide.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm font-semibold transition-all disabled:opacity-40"
                          style={{ background: 'hsl(355 62% 40% / 0.15)', border: '1px solid hsl(355 62% 40% / 0.4)', color: 'hsl(355 72% 62%)' }}>
                          <Icon name="X" size={12} /> Отклонить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { SiteStats, PendingTopic, PendingGuide };
