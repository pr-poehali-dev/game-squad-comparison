import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import CatalogPage from './CatalogPage';
import ComparePage from './ComparePage';
import TreatiesPage from './TreatiesPage';
import UnitDetailPage from './UnitDetailPage';
import AboutPage from './AboutPage';
import AuthPage from './AuthPage';
import AdminPage from './AdminPage';
import ForumPage from './ForumPage';
import TopicPage from './TopicPage';
import NotificationBell from '@/components/NotificationBell';

type Page = 'catalog' | 'compare' | 'treaties' | 'forum' | 'about' | 'auth' | 'admin';

const NAV_ITEMS: Array<{ id: Page; label: string; icon: string; adminOnly?: boolean }> = [
  { id: 'catalog',  label: 'Каталог',    icon: 'LayoutGrid' },
  { id: 'compare',  label: 'Сравнение',  icon: 'Swords' },
  { id: 'treaties', label: 'Трактаты',   icon: 'ScrollText' },
  { id: 'forum',    label: 'Форум',      icon: 'MessageSquare' },
  { id: 'about',    label: 'О проекте',  icon: 'Info' },
  { id: 'admin',    label: 'Управление', icon: 'Settings', adminOnly: true },
];

/* Геральдический SVG-ромб для иконки в лого */
function ShieldEmblem({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 2L25 7V15C25 21 14 26 14 26C14 26 3 21 3 15V7L14 2Z"
        fill="hsl(42 90% 52% / 0.15)"
        stroke="hsl(42 90% 52% / 0.7)"
        strokeWidth="1.2"
      />
      <path
        d="M14 6L21 9.5V15C21 19 14 22.5 14 22.5C14 22.5 7 19 7 15V9.5L14 6Z"
        fill="hsl(42 90% 52% / 0.08)"
        stroke="hsl(42 90% 52% / 0.4)"
        strokeWidth="0.8"
      />
      <path d="M14 10V18M10 14H18" stroke="hsl(42 90% 52% / 0.8)" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  );
}

/* Декоративный разделитель */
function GoldDivider() {
  return (
    <div className="px-4 py-1">
      <div className="h-px" style={{
        background: 'linear-gradient(90deg, transparent, hsl(42 90% 52% / 0.3), transparent)'
      }} />
    </div>
  );
}

export default function Index() {
  const { user, loading: authLoading, logout } = useAuth();
  const [page, setPage] = useState<Page>('catalog');
  const [detailUnitId, setDetailUnitId] = useState<string | null>(null);
  const [forumTopicId, setForumTopicId] = useState<number | null>(null);
  const [appliedTreaties, setAppliedTreaties] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('companion_treaties');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('companion_treaties', JSON.stringify(appliedTreaties));
  }, [appliedTreaties]);

  const handleApplyTreaty = (unitId: string, treatyId: string) => {
    setAppliedTreaties(prev => ({
      ...prev,
      [unitId]: [...(prev[unitId] || []), treatyId],
    }));
  };

  const handleRemoveTreaty = (unitId: string, treatyId: string) => {
    setAppliedTreaties(prev => ({
      ...prev,
      [unitId]: (prev[unitId] || []).filter(id => id !== treatyId),
    }));
  };

  const navigateTo = (p: Page) => {
    setPage(p);
    setDetailUnitId(null);
    setForumTopicId(null);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setPage('catalog');
    setMobileMenuOpen(false);
  };

  const visibleNav = NAV_ITEMS.filter(item => !item.adminOnly || user?.is_admin);
  const currentLabel = page === 'auth' ? 'Вход' : page === 'admin' ? 'Управление' : NAV_ITEMS.find(n => n.id === page)?.label;

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Сайдбар ─────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-58 flex flex-col
        transition-transform duration-250
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex
      `}
        style={{
          width: '220px',
          background: 'linear-gradient(180deg, hsl(222 22% 5%) 0%, hsl(222 20% 4%) 100%)',
          borderRight: '1px solid hsl(42 90% 52% / 0.12)',
        }}
      >
        {/* Тонкая золотая полоска сверху */}
        <div className="h-0.5 sidebar-top-accent" />

        {/* ── Логотип ─ */}
        <div className="px-5 py-5 flex items-center gap-3">
          <ShieldEmblem size={30} />
          <div className="flex-1 min-w-0">
            <div
              className="text-foreground leading-none tracking-widest"
              style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em' }}
            >
              КОМПАНЬОН
            </div>
            <div
              className="mt-0.5 tracking-widest uppercase"
              style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.55rem', fontWeight: 500, color: 'hsl(42 90% 52% / 0.6)', letterSpacing: '0.18em' }}
            >
              Conqueror's Blade
            </div>
          </div>
        </div>

        <GoldDivider />

        {/* ── Навигация ─ */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
          {visibleNav.map(item => {
            const isActive = page === item.id && !detailUnitId;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 group relative"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.04em',
                  borderRadius: '2px',
                  color: isActive ? 'hsl(42 90% 55%)' : 'hsl(215 18% 52%)',
                  background: isActive
                    ? 'linear-gradient(90deg, hsl(42 90% 52% / 0.12), hsl(42 90% 52% / 0.04))'
                    : 'transparent',
                  borderLeft: isActive ? '2px solid hsl(42 90% 52% / 0.8)' : '2px solid transparent',
                }}
              >
                {/* Hover-эффект */}
                {!isActive && (
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-sm"
                    style={{ background: 'hsl(42 90% 52% / 0.05)' }} />
                )}
                <Icon
                  name={item.icon}
                  size={15}
                  style={{ color: isActive ? 'hsl(42 90% 55%)' : 'hsl(215 18% 45%)' }}
                />
                <span style={{ color: isActive ? 'hsl(38 15% 88%)' : undefined }}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="ml-auto w-1 h-1 rounded-full" style={{ background: 'hsl(42 90% 52%)' }} />
                )}
              </button>
            );
          })}
        </nav>

        <GoldDivider />

        {/* ── Пользователь ─ */}
        <div className="px-2 py-3 space-y-0.5">
          {!authLoading && (
            user ? (
              <>
                <div className="px-3 py-2.5 rounded-sm" style={{ background: 'hsl(42 90% 52% / 0.05)', border: '1px solid hsl(42 90% 52% / 0.1)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0"
                      style={{ background: 'hsl(42 90% 52% / 0.15)', border: '1px solid hsl(42 90% 52% / 0.3)' }}>
                      <Icon name="User" size={11} style={{ color: 'hsl(42 90% 55%)' }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em' }}>
                        {user.username}
                      </div>
                      {user.is_admin && (
                        <div className="text-[9px] uppercase tracking-widest" style={{ color: 'hsl(42 90% 52%)', fontFamily: 'Rajdhani, sans-serif' }}>
                          Администратор
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-all group"
                  style={{ fontFamily: 'Rajdhani, sans-serif', color: 'hsl(215 18% 45%)', borderRadius: '2px' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'hsl(0 70% 60%)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'hsl(215 18% 45%)')}
                >
                  <Icon name="LogOut" size={13} />
                  Выйти
                </button>
              </>
            ) : (
              <button
                onClick={() => navigateTo('auth')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  color: page === 'auth' ? 'hsl(42 90% 55%)' : 'hsl(215 18% 52%)',
                  background: page === 'auth' ? 'hsl(42 90% 52% / 0.1)' : 'transparent',
                  borderRadius: '2px',
                }}
              >
                <Icon name="LogIn" size={14} />
                Войти
              </button>
            )
          )}

          {/* Версия */}
          <div className="px-3 pt-2 pb-1">
            <div className="text-[9px] font-mono-data tracking-widest" style={{ color: 'hsl(215 18% 30%)' }}>
              v1.0.0 · CB Companion
            </div>
          </div>
        </div>

        {/* Тонкая золотая полоска снизу */}
        <div className="h-0.5 sidebar-top-accent" />
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'hsl(222 18% 5% / 0.85)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Основной контент ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Топ-бар ─ */}
        <header className="h-12 flex items-center px-4 lg:px-6 gap-3"
          style={{
            background: 'hsl(224 16% 7% / 0.95)',
            borderBottom: '1px solid hsl(42 90% 52% / 0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Мобильное меню */}
          <button
            className="lg:hidden transition-colors"
            style={{ color: 'hsl(215 18% 45%)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            onMouseEnter={e => (e.currentTarget.style.color = 'hsl(42 90% 52%)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'hsl(215 18% 45%)')}
          >
            <Icon name="Menu" size={18} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5">
            {/* Маленький ромб-разделитель */}
            <span style={{ color: 'hsl(42 90% 52% / 0.5)', fontSize: '0.5rem' }}>◆</span>
            <button
              className="transition-colors"
              style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'hsl(215 18% 52%)', textTransform: 'uppercase' }}
              onClick={() => { setPage('catalog'); setDetailUnitId(null); setForumTopicId(null); }}
              onMouseEnter={e => (e.currentTarget.style.color = 'hsl(38 15% 88%)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'hsl(215 18% 52%)')}
            >
              {currentLabel}
            </button>
            {detailUnitId && (
              <>
                <span style={{ color: 'hsl(42 90% 52% / 0.4)', fontSize: '0.6rem' }}>▶</span>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'hsl(38 15% 80%)', textTransform: 'uppercase' }}>
                  Детали отряда
                </span>
              </>
            )}
            {page === 'forum' && forumTopicId && (
              <>
                <span style={{ color: 'hsl(42 90% 52% / 0.4)', fontSize: '0.6rem' }}>▶</span>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'hsl(38 15% 80%)', textTransform: 'uppercase' }}>
                  Тема
                </span>
              </>
            )}
          </div>

          {/* Правая часть — уведомления */}
          {user && (
            <div className="ml-auto">
              <NotificationBell
                onGoForum={() => navigateTo('forum')}
                onOpenTopic={id => { navigateTo('forum'); setForumTopicId(id); }}
              />
            </div>
          )}
        </header>

        {/* ── Контент страниц ─ */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto scrollbar-thin">
          {detailUnitId ? (
            <UnitDetailPage
              unitId={detailUnitId}
              appliedTreaties={appliedTreaties}
              onBack={() => setDetailUnitId(null)}
            />
          ) : page === 'catalog' ? (
            <CatalogPage onSelectUnit={setDetailUnitId} />
          ) : page === 'compare' ? (
            <ComparePage
              appliedTreaties={appliedTreaties}
              onApply={handleApplyTreaty}
              onRemove={handleRemoveTreaty}
            />
          ) : page === 'treaties' ? (
            <TreatiesPage
              appliedTreaties={appliedTreaties}
              onApply={handleApplyTreaty}
              onRemove={handleRemoveTreaty}
            />
          ) : page === 'forum' ? (
            forumTopicId ? (
              <TopicPage
                topicId={forumTopicId}
                onBack={() => setForumTopicId(null)}
              />
            ) : (
              <ForumPage onOpenTopic={setForumTopicId} />
            )
          ) : page === 'about' ? (
            <AboutPage />
          ) : page === 'auth' ? (
            <AuthPage onSuccess={() => setPage('catalog')} />
          ) : page === 'admin' ? (
            <AdminPage />
          ) : null}
        </main>
      </div>
    </div>
  );
}
