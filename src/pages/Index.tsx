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
import WhamPage from './WhamPage';
import NotificationBell from '@/components/NotificationBell';

type Page = 'catalog' | 'compare' | 'treaties' | 'forum' | 'game' | 'about' | 'auth' | 'admin';

const NAV_ITEMS: Array<{ id: Page; label: string; icon: string; adminOnly?: boolean }> = [
  { id: 'catalog',  label: 'Каталог',    icon: 'LayoutGrid' },
  { id: 'compare',  label: 'Сравнение',  icon: 'Swords' },
  { id: 'treaties', label: 'Трактаты',   icon: 'ScrollText' },
  { id: 'forum',    label: 'Форум',      icon: 'MessageSquare' },
  { id: 'game',     label: 'Неадекватная игра', icon: 'Gamepad2' },
  { id: 'about',    label: 'О проекте',  icon: 'Info' },
  { id: 'admin',    label: 'Управление', icon: 'Settings', adminOnly: true },
];

/* Средневековая эмблема: рыцарский щит с крестом и шевроном. Без магии. */
function ShieldEmblem({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* корпус щита */}
      <path
        d="M16 2 L28 6 V15 C28 22 21 28 16 30 C11 28 4 22 4 15 V6 L16 2 Z"
        fill="hsl(24 14% 12%)"
        stroke="hsl(18 52% 42%)"
        strokeWidth="1.3"
      />
      {/* шеврон */}
      <path
        d="M7 14 L16 8 L25 14"
        stroke="hsl(18 52% 42%)"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="square"
      />
      {/* крест */}
      <path d="M16 12 V24 M11 18 H21" stroke="hsl(4 48% 40%)" strokeWidth="1.5" strokeLinecap="square" />
      {/* заклёпки */}
      <circle cx="16" cy="5" r="0.9" fill="hsl(18 52% 42%)" />
      <circle cx="7" cy="7" r="0.9" fill="hsl(18 52% 42%)" />
      <circle cx="25" cy="7" r="0.9" fill="hsl(18 52% 42%)" />
    </svg>
  );
}

/* Разделитель: двойная тонкая линия с ромбом-камнем посередине */
function OrnateDivider() {
  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-2 opacity-70">
        <div className="flex-1 h-0 border-t border-primary/30" />
        <span className="w-[5px] h-[5px] bg-primary/80 rotate-45" />
        <div className="flex-1 h-0 border-t border-primary/30" />
      </div>
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
        fixed inset-y-0 left-0 z-40 flex flex-col
        transition-transform duration-250
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex
      `}
        style={{
          width: '232px',
          background:
            'linear-gradient(180deg, hsl(24 10% 5%) 0%, hsl(20 10% 4%) 100%)',
          borderRight: '1px solid hsl(30 14% 14%)',
          boxShadow: 'inset -1px 0 0 hsl(18 52% 42% / 0.15)',
        }}
      >
        {/* Медная полоска сверху — «кованая планка» */}
        <div className="h-[3px] sidebar-top-accent" />

        {/* ── Бренд — гильдейская печать ─ */}
        <div className="px-5 py-6 flex items-center gap-3 relative">
          <ShieldEmblem size={34} />
          <div className="flex-1 min-w-0">
            <div
              className="leading-none"
              style={{
                fontFamily: '"UnifrakturCook", serif',
                fontSize: '1.55rem',
                fontWeight: 700,
                color: 'hsl(40 40% 88%)',
                letterSpacing: '0.02em',
                textShadow: '0 2px 0 hsl(0 0% 0% / 0.6)',
              }}
            >
              Хоругвь
            </div>
            <div
              className="mt-1 uppercase"
              style={{
                fontFamily: '"IM Fell English SC", serif',
                fontSize: '0.58rem',
                fontWeight: 400,
                color: 'hsl(18 52% 48%)',
                letterSpacing: '0.3em',
              }}
            >
              Реэстръ ратныхъ
            </div>
          </div>
        </div>

        <OrnateDivider />

        {/* ── Навигация — строки реестра ─ */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto scrollbar-thin">
          {visibleNav.map(item => {
            const isActive = page === item.id && !detailUnitId;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[0.95rem] transition-all duration-150 group relative"
                style={{
                  fontFamily: '"IM Fell English", serif',
                  fontWeight: 400,
                  letterSpacing: '0.03em',
                  color: isActive ? 'hsl(40 42% 92%)' : 'hsl(30 12% 52%)',
                  background: isActive
                    ? 'linear-gradient(90deg, hsl(18 52% 42% / 0.22), transparent 85%)'
                    : 'transparent',
                  borderLeft: isActive
                    ? '2px solid hsl(18 52% 48%)'
                    : '2px solid transparent',
                }}
              >
                {!isActive && (
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{ background: 'hsl(18 52% 42% / 0.08)' }} />
                )}
                <Icon
                  name={item.icon}
                  size={16}
                  style={{ color: isActive ? 'hsl(18 62% 56%)' : 'hsl(30 12% 44%)' }}
                />
                <span className="relative">{item.label}</span>
                {isActive && (
                  <span
                    className="ml-auto w-[6px] h-[6px] rotate-45"
                    style={{ background: 'hsl(18 52% 48%)' }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <OrnateDivider />

        {/* ── Пользователь — восковая печать ─ */}
        <div className="px-2 py-3 space-y-1">
          {!authLoading && (
            user ? (
              <>
                <div
                  className="px-3 py-2.5"
                  style={{
                    background: 'hsl(4 48% 26% / 0.22)',
                    border: '1px solid hsl(4 48% 36% / 0.45)',
                    boxShadow: 'inset 0 1px 0 hsl(4 48% 50% / 0.25)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 flex items-center justify-center flex-shrink-0 rotate-45"
                      style={{
                        background: 'hsl(4 48% 36%)',
                        border: '1px solid hsl(4 48% 50%)',
                        boxShadow: 'inset 0 1px 0 hsl(4 48% 60% / 0.35)',
                      }}
                    >
                      <span className="-rotate-45">
                        <Icon name="User" size={12} style={{ color: 'hsl(40 40% 92%)' }} />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-[0.92rem] truncate"
                        style={{ fontFamily: '"IM Fell English", serif', color: 'hsl(40 30% 88%)' }}
                      >
                        {user.username}
                      </div>
                      {user.is_admin && (
                        <div
                          className="uppercase"
                          style={{
                            fontFamily: '"IM Fell English SC", serif',
                            fontSize: '0.55rem',
                            color: 'hsl(18 62% 56%)',
                            letterSpacing: '0.24em',
                          }}
                        >
                          Смотритель
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm transition-all"
                  style={{
                    fontFamily: '"IM Fell English", serif',
                    color: 'hsl(30 12% 50%)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'hsl(4 62% 58%)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'hsl(30 12% 50%)')}
                >
                  <Icon name="LogOut" size={14} />
                  Покинуть
                </button>
              </>
            ) : (
              <button
                onClick={() => navigateTo('auth')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all"
                style={{
                  fontFamily: '"IM Fell English", serif',
                  color: page === 'auth' ? 'hsl(40 42% 92%)' : 'hsl(30 12% 55%)',
                  background:
                    page === 'auth' ? 'hsl(18 52% 42% / 0.18)' : 'transparent',
                  borderLeft:
                    page === 'auth' ? '2px solid hsl(18 52% 48%)' : '2px solid transparent',
                }}
              >
                <Icon name="LogIn" size={14} />
                Войти в реестръ
              </button>
            )
          )}

          {/* Клеймо мастерской */}
          <div className="px-3 pt-3 pb-1 flex items-center justify-between">
            <div
              className="font-mono-data"
              style={{ color: 'hsl(30 10% 30%)', fontSize: '0.58rem', letterSpacing: '0.2em' }}
            >
              ANNO · MMXXVI
            </div>
            <div
              style={{
                fontFamily: '"IM Fell English SC", serif',
                color: 'hsl(18 52% 42% / 0.5)',
                fontSize: '0.58rem',
                letterSpacing: '0.25em',
              }}
            >
              v·XI
            </div>
          </div>
        </div>

        {/* Медная полоска снизу */}
        <div className="h-[3px] sidebar-top-accent" />
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'hsl(20 10% 3% / 0.85)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Основной контент ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Топ-бар: геральдическая плашка ─ */}
        <header
          className="h-14 flex items-center px-4 lg:px-7 gap-4 relative"
          style={{
            background:
              'linear-gradient(180deg, hsl(26 12% 10%) 0%, hsl(22 10% 7%) 100%)',
            borderBottom: '1px solid hsl(18 52% 42% / 0.35)',
            boxShadow: 'inset 0 -1px 0 hsl(18 52% 42% / 0.15), 0 2px 0 hsl(0 0% 0% / 0.35)',
          }}
        >
          {/* Гильошная нить-рамка снизу */}
          <div
            className="absolute left-0 right-0 bottom-0 h-[2px] opacity-60"
            style={{
              background:
                'repeating-linear-gradient(90deg, hsl(18 52% 42%) 0 6px, transparent 6px 12px)',
            }}
          />

          {/* Мобильное меню */}
          <button
            className="lg:hidden transition-colors"
            style={{ color: 'hsl(30 12% 55%)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            onMouseEnter={e => (e.currentTarget.style.color = 'hsl(18 62% 56%)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'hsl(30 12% 55%)')}
          >
            <Icon name="Menu" size={20} />
          </button>

          {/* Хлебные крошки в свитковом стиле */}
          <div className="flex items-center gap-2.5">
            <span
              className="w-[7px] h-[7px] rotate-45"
              style={{ background: 'hsl(18 52% 48%)', boxShadow: '0 0 0 1px hsl(4 48% 24%)' }}
            />
            <button
              className="transition-colors"
              style={{
                fontFamily: '"IM Fell English SC", serif',
                fontSize: '0.85rem',
                fontWeight: 400,
                letterSpacing: '0.18em',
                color: 'hsl(40 28% 78%)',
                textTransform: 'uppercase',
              }}
              onClick={() => { setPage('catalog'); setDetailUnitId(null); setForumTopicId(null); }}
              onMouseEnter={e => (e.currentTarget.style.color = 'hsl(18 62% 56%)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'hsl(40 28% 78%)')}
            >
              {currentLabel}
            </button>
            {detailUnitId && (
              <>
                <span style={{ color: 'hsl(18 52% 42% / 0.6)', fontSize: '0.7rem' }}>—</span>
                <span
                  style={{
                    fontFamily: '"IM Fell English", serif',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    color: 'hsl(40 28% 70%)',
                  }}
                >
                  грамота отряда
                </span>
              </>
            )}
            {page === 'forum' && forumTopicId && (
              <>
                <span style={{ color: 'hsl(18 52% 42% / 0.6)', fontSize: '0.7rem' }}>—</span>
                <span
                  style={{
                    fontFamily: '"IM Fell English", serif',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    color: 'hsl(40 28% 70%)',
                  }}
                >
                  обсуждение
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
          ) : page === 'game' ? (
            <WhamPage />
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