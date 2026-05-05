import { Rarity } from '@/data/types';
import Icon from '@/components/ui/icon';
import { RarityBadge } from './AdminModals';

interface AdminTabUnitsProps {
  units: Record<string, unknown>[];
  loadingData: boolean;
  onAdd: () => void;
  onEdit: (unit: Record<string, unknown>) => void;
  onDelete: (unit: Record<string, unknown>) => void;
}

export function AdminTabUnits({ units, loadingData, onAdd, onEdit, onDelete }: AdminTabUnitsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">{units.length} отрядов</span>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-3 py-2 text-xs bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={13} /> Добавить отряд
        </button>
      </div>
      {loadingData ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Загрузка...</div>
      ) : units.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Отрядов пока нет</div>
      ) : (
        <div className="space-y-2">
          {units.map(unit => (
            <div key={unit.id as string} className="bg-card border border-border rounded-sm p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{unit.name as string}</span>
                  <RarityBadge rarity={unit.rarity as Rarity} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{unit.class as string}</span>
                  <span>·</span>
                  <span>{unit.role as string}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(unit)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-sm hover:bg-muted transition-colors"
                >
                  <Icon name="Pencil" size={11} /> Редактировать
                </button>
                <button
                  onClick={() => onDelete(unit)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-destructive/40 text-destructive rounded-sm hover:bg-destructive/10 transition-colors"
                >
                  <Icon name="Trash2" size={11} /> Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface AdminTabTreatiesProps {
  treaties: Record<string, unknown>[];
  loadingData: boolean;
  onAdd: () => void;
  onEdit: (treaty: Record<string, unknown>) => void;
  onDelete: (treaty: Record<string, unknown>) => void;
}

export function AdminTabTreaties({ treaties, loadingData, onAdd, onEdit, onDelete }: AdminTabTreatiesProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">{treaties.length} трактатов</span>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-3 py-2 text-xs bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={13} /> Добавить трактат
        </button>
      </div>
      {loadingData ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Загрузка...</div>
      ) : treaties.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Трактатов пока нет</div>
      ) : (
        <div className="space-y-2">
          {treaties.map(treaty => (
            <div key={treaty.id as string} className="bg-card border border-border rounded-sm p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{treaty.name as string}</span>
                  <RarityBadge rarity={treaty.rarity as Rarity} />
                </div>
                <p className="text-xs text-muted-foreground truncate">{treaty.description as string}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(treaty)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-sm hover:bg-muted transition-colors"
                >
                  <Icon name="Pencil" size={11} /> Редактировать
                </button>
                <button
                  onClick={() => onDelete(treaty)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-destructive/40 text-destructive rounded-sm hover:bg-destructive/10 transition-colors"
                >
                  <Icon name="Trash2" size={11} /> Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
