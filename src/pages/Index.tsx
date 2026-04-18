import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import CatalogPage from './CatalogPage';
import ComparePage from './ComparePage';
import TreatiesPage from './TreatiesPage';
import UnitDetailPage from './UnitDetailPage';
import AboutPage from './AboutPage';

type Page = 'catalog' | 'compare' | 'treaties' | 'about';

const NAV_ITEMS: Array<{ id: Page; label: string; icon: string }> = [
  { id: 'catalog', label: 'Каталог', icon: 'Grid3X3' },
  { id: 'compare', label: 'Сравнение', icon: 'GitCompare' },
  { id: 'treaties', label: 'Трактаты', icon: 'ScrollText' },
  { id: 'about', label: 'О проекте', icon: 'Info' },
];

export default function Index() {
  const [page, setPage] = useState<Page>('catalog');
  const [detailUnitId, setDetailUnitId] = useState<string | null>(null);
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
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-56 bg-card border-r border-border flex flex-col
        transition-transform duration-200
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-primary flex items-center justify-center">
              <Icon name="Sword" size={14} className="text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground leading-none" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
                КОМПАНЬОН
              </div>
              <div className="text-[9px] text-muted-foreground tracking-widest uppercase mt-0.5">Справочник отрядов</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all
                ${page === item.id && !detailUnitId
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              <Icon name={item.icon} size={15} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-[10px] text-muted-foreground font-mono-data">v1.0.0</div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-background/80 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 border-b border-border flex items-center px-4 lg:px-6 gap-3 bg-card/50">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon name="Menu" size={18} />
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="hover:text-foreground cursor-pointer transition-colors"
              onClick={() => { setPage('catalog'); setDetailUnitId(null); }}
            >
              {NAV_ITEMS.find(n => n.id === page)?.label}
            </span>
            {detailUnitId && (
              <>
                <Icon name="ChevronRight" size={12} />
                <span className="text-foreground">Детали</span>
              </>
            )}
          </div>
        </header>

        {/* Content */}
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
          ) : (
            <AboutPage />
          )}
        </main>
      </div>
    </div>
  );
}