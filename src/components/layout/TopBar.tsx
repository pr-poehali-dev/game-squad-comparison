import Icon from '@/components/ui/icon';
import NotificationBell from '@/components/NotificationBell';

type Page = 'catalog' | 'compare' | 'treaties' | 'houses' | 'forum' | 'guides' | 'game' | 'about' | 'auth' | 'admin' | 'profile' | 'messages';

const NAV_ITEMS_LABELS: Partial<Record<Page, string>> = {
  catalog: 'Каталог',
  compare: 'Сравнение',
  treaties: 'Трактаты',
  houses: 'Дома CB',
  forum: 'Форум',
  guides: 'Гайды',
  game: 'Неадекватная игра',
  about: 'О проекте',
  admin: 'Управление',
};

interface TopBarProps {
  page: Page;
  detailUnitId: string | null;
  forumTopicId: number | null;
  mobileMenuOpen: boolean;
  unreadMessages: number;
  user: { username: string; is_admin: boolean; avatar_url?: string; house_name?: string } | null;
  authLoading: boolean;
  onNavigate: (p: Page) => void;
  onToggleMobile: () => void;
  onLogout: () => void;
  onResetDetail: () => void;
  onOpenTopic: (id: number) => void;
}

export default function TopBar({
  page,
  detailUnitId,
  forumTopicId,
  unreadMessages,
  user,
  authLoading,
  onNavigate,
  onToggleMobile,
  onLogout,
  onResetDetail,
  onOpenTopic,
}: TopBarProps) {
  const currentLabel =
    page === 'auth' ? 'Вход' :
    page === 'admin' ? 'Управление' :
    NAV_ITEMS_LABELS[page];

  return (
    <header
      className="h-16 flex items-center px-4 lg:px-8 gap-4 relative"
      style={{
        background: 'linear-gradient(180deg, hsl(222 18% 9%) 0%, hsl(222 20% 6%) 100%)',
        borderBottom: '1px solid hsl(222 14% 16%)',
        boxShadow: 'inset 0 -1px 0 hsl(42 76% 50% / 0.06), 0 4px 20px hsl(222 40% 2% / 0.3)',
      }}
    >
      <div
        className="absolute left-0 right-0 bottom-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(42 76% 58% / 0.5) 30%, hsl(42 76% 58%) 50%, hsl(42 76% 58% / 0.5) 70%, transparent)',
        }}
      />

      <button
        className="lg:hidden p-2 rounded-lg transition-all"
        style={{
          color: 'hsl(222 10% 62%)',
          background: 'hsl(222 14% 14%)',
          border: '1px solid hsl(222 14% 18%)',
        }}
        onClick={onToggleMobile}
        onMouseEnter={e => { e.currentTarget.style.color = 'hsl(42 76% 68%)'; e.currentTarget.style.borderColor = 'hsl(42 76% 50% / 0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'hsl(222 10% 62%)'; e.currentTarget.style.borderColor = 'hsl(222 14% 18%)'; }}
      >
        <Icon name="Menu" size={18} />
      </button>

      <div className="flex items-center gap-3">
        <span
          className="w-2 h-2 rotate-45"
          style={{
            background: 'linear-gradient(135deg, hsl(48 80% 72%), hsl(32 64% 40%))',
            boxShadow: '0 0 8px hsl(42 76% 58% / 0.6)',
          }}
        />
        <button
          className="transition-colors"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'hsl(38 22% 90%)',
            letterSpacing: '0.005em',
          }}
          onClick={onResetDetail}
          onMouseEnter={e => (e.currentTarget.style.color = 'hsl(42 76% 72%)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'hsl(38 22% 90%)')}
        >
          {currentLabel}
        </button>
        {detailUnitId && (
          <>
            <Icon name="ChevronRight" size={16} style={{ color: 'hsl(42 76% 50% / 0.5)' }} />
            <span
              className="italic"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.1rem', color: 'hsl(222 10% 62%)' }}
            >
              подробности отряда
            </span>
          </>
        )}
        {page === 'forum' && forumTopicId && (
          <>
            <Icon name="ChevronRight" size={16} style={{ color: 'hsl(42 76% 50% / 0.5)' }} />
            <span
              className="italic"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.1rem', color: 'hsl(222 10% 62%)' }}
            >
              обсуждение
            </span>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {user && (
          <>
            <button
              onClick={() => onNavigate('messages')}
              className="p-1.5 rounded-lg transition-all relative"
              title="Сообщения"
              style={{
                color: page === 'messages' ? 'hsl(42 76% 68%)' : 'hsl(222 10% 58%)',
                border: `1px solid ${page === 'messages' ? 'hsl(42 76% 50% / 0.4)' : 'hsl(222 14% 18%)'}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'hsl(42 76% 68%)'; e.currentTarget.style.borderColor = 'hsl(42 76% 50% / 0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = page === 'messages' ? 'hsl(42 76% 68%)' : 'hsl(222 10% 58%)'; e.currentTarget.style.borderColor = page === 'messages' ? 'hsl(42 76% 50% / 0.4)' : 'hsl(222 14% 18%)'; }}
            >
              <Icon name="Mail" size={16} />
              {unreadMessages > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: 'hsl(355 72% 58%)', color: '#fff', lineHeight: 1 }}
                >
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </button>
            <NotificationBell
              onGoForum={() => onNavigate('forum')}
              onOpenTopic={id => { onNavigate('forum'); onOpenTopic(id); }}
            />
          </>
        )}
        {!authLoading && (
          user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all"
                style={{
                  background: 'hsl(222 16% 12%)',
                  border: '1px solid hsl(42 76% 50% / 0.2)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'hsl(42 76% 50% / 0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(42 76% 50% / 0.2)'; }}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-md object-cover flex-shrink-0" />
                ) : (
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, hsl(48 80% 68%) 0%, hsl(32 64% 40%) 100%)' }}
                  >
                    <Icon name="User" size={12} style={{ color: 'hsl(222 30% 10%)' }} />
                  </div>
                )}
                <span style={{ fontFamily: '"Manrope", sans-serif', fontSize: '0.82rem', fontWeight: 600, color: 'hsl(38 24% 92%)' }}>
                  {user.username}
                  {user.house_name && (
                    <span style={{ color: 'hsl(42 76% 58%)', fontWeight: 500 }}> [{user.house_name}]</span>
                  )}
                </span>
                {user.is_admin && (
                  <span style={{ fontSize: '0.58rem', color: 'hsl(355 72% 68%)', fontWeight: 700 }}>✦</span>
                )}
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg transition-all"
                title="Выйти"
                style={{ color: 'hsl(222 10% 58%)', border: '1px solid hsl(222 14% 18%)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'hsl(355 72% 68%)'; e.currentTarget.style.borderColor = 'hsl(355 62% 40%)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'hsl(222 10% 58%)'; e.currentTarget.style.borderColor = 'hsl(222 14% 18%)'; }}
              >
                <Icon name="LogOut" size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="btn-primary"
              style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}
            >
              <Icon name="LogIn" size={14} />
              Войти
            </button>
          )
        )}
      </div>
    </header>
  );
}
