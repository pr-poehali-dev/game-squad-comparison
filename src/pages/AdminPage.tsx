import { useState, useEffect, useCallback } from 'react';
import { unitsApi, treatiesApi, seedApi, rolesApi, formationsApi, traitsApi, abilitiesApi, statsApi, forumApi, guidesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useUnits, useTreaties, useRoles, useFormations, useTraits, useAbilities, UnitRoleDef, TraitDef, AbilityDef } from '@/hooks/useAppData';
import Icon from '@/components/ui/icon';
import { TraitColor, Formation } from '@/data/types';

import { Toast, ConfirmModal, UnitModal, TreatyModal } from '@/components/admin/AdminModals';
import { AdminTabUnits, AdminTabTreaties } from '@/components/admin/AdminTabUnitsAndTreaties';
import { AdminTabRoles, AdminTabFormations, AdminTabTraits, AdminTabAbilities, AbilityFormState } from '@/components/admin/AdminTabDictionaries';
import { AdminTabStats, AdminTabModeration, SiteStats, PendingTopic, PendingGuide } from '@/components/admin/AdminTabStatsAndModeration';

type AdminTab = 'stats' | 'units' | 'treaties' | 'roles' | 'formations' | 'traits' | 'abilities' | 'moderation';

export default function AdminPage() {
  const { user } = useAuth();
  const { invalidate: invalidateUnits } = useUnits();
  const { invalidate: invalidateTreaties } = useTreaties();
  const { roles, invalidate: invalidateRoles } = useRoles();
  const { formations, invalidate: invalidateFormations } = useFormations();
  const { traits, invalidate: invalidateTraits } = useTraits();
  const { abilities, invalidate: invalidateAbilities } = useAbilities();

  const [tab, setTab] = useState<AdminTab>('stats');
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [units, setUnits] = useState<Record<string, unknown>[]>([]);
  const [treaties, setTreaties] = useState<Record<string, unknown>[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; kind: 'unit' | 'treaty' } | null>(null);
  const [unitModal, setUnitModal] = useState<{ open: boolean; unit?: Record<string, unknown> | null }>({ open: false });
  const [treatyModal, setTreatyModal] = useState<{ open: boolean; treaty?: Record<string, unknown> | null }>({ open: false });

  // Управление ролями
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [roleEditing, setRoleEditing] = useState<UnitRoleDef | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  // Управление построениями
  const [formationForm, setFormationForm] = useState({ name: '', description: '', avatar_url: '' });
  const [formationEditing, setFormationEditing] = useState<Formation | null>(null);
  const [formationLoading, setFormationLoading] = useState(false);

  // Управление умениями
  const [abilityForm, setAbilityForm] = useState<AbilityFormState>({ name: '', description: '', adminComment: '', modifiers: {}, newModKey: 'health', newModVal: '', newModType: 'flat' });
  const [abilityEditing, setAbilityEditing] = useState<AbilityDef | null>(null);
  const [abilityLoading, setAbilityLoading] = useState(false);

  // Управление особенностями
  const [traitForm, setTraitForm] = useState({ name: '', description: '', adminComment: '', color: 'gray' as TraitColor });
  const [traitEditing, setTraitEditing] = useState<TraitDef | null>(null);
  const [traitLoading, setTraitLoading] = useState(false);

  // Модерация
  const [pendingTopics, setPendingTopics] = useState<PendingTopic[]>([]);
  const [pendingGuides, setPendingGuides] = useState<PendingGuide[]>([]);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [u, t] = await Promise.all([unitsApi.list(), treatiesApi.list()]);
      setUnits(u.units || []);
      setTreaties(t.treaties || []);
    } catch {
      showToast('Ошибка загрузки данных', 'error');
    } finally {
      setLoadingData(false);
    }
  }, []);

  const loadPending = useCallback(async () => {
    setModerationLoading(true);
    try {
      const [t, g] = await Promise.all([forumApi.getPendingTopics(), guidesApi.getPendingGuides()]);
      setPendingTopics(t.topics || []);
      setPendingGuides(g.guides || []);
    } finally {
      setModerationLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (tab === 'stats') {
      setStatsLoading(true);
      statsApi.getStats().then(data => setSiteStats(data)).catch(() => {}).finally(() => setStatsLoading(false));
    }
    if (tab === 'moderation') loadPending();
  }, [tab]);

  const handlePublishTopic = async (id: number, approve: boolean) => {
    const key = `topic-${id}`;
    if (processingId === key) return;
    setProcessingId(key);
    try {
      await forumApi.publishTopic(id, approve);
      showToast(approve ? 'Тема опубликована' : 'Тема отклонена');
      await loadPending();
    } finally {
      setProcessingId(null);
    }
  };

  const handlePublishGuide = async (id: number, approve: boolean) => {
    const key = `guide-${id}`;
    if (processingId === key) return;
    setProcessingId(key);
    try {
      await guidesApi.publishGuide(id, approve);
      showToast(approve ? 'Гайд опубликован' : 'Гайд отклонён');
      await loadPending();
    } finally {
      setProcessingId(null);
    }
  };

  const handleSeed = async () => {
    setSeedLoading(true);
    try {
      const res = await seedApi.run();
      const u = res.units as { inserted: number; skipped: number };
      const t = res.treaties as { inserted: number; skipped: number };
      showToast(`Импортировано: ${u.inserted} отрядов, ${t.inserted} трактатов`);
      await loadData();
      invalidateUnits();
      invalidateTreaties();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка импорта', 'error');
    } finally {
      setSeedLoading(false);
    }
  };

  const handleSaveUnit = async (data: Record<string, unknown>) => {
    if (unitModal.unit) {
      await unitsApi.update(unitModal.unit.id as string, data);
      showToast('Отряд успешно обновлён');
    } else {
      await unitsApi.create(data);
      showToast('Отряд успешно добавлен');
    }
    await loadData();
    invalidateUnits();
  };

  const handleSaveTreaty = async (data: Record<string, unknown>) => {
    if (treatyModal.treaty) {
      await treatiesApi.update(treatyModal.treaty.id as string, data);
      showToast('Трактат успешно обновлён');
    } else {
      await treatiesApi.create(data);
      showToast('Трактат успешно добавлен');
    }
    await loadData();
    invalidateTreaties();
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.kind === 'unit') {
        await unitsApi.delete(confirmDelete.id);
        showToast('Отряд успешно удалён');
        invalidateUnits();
      } else {
        await treatiesApi.delete(confirmDelete.id);
        showToast('Трактат успешно удалён');
        invalidateTreaties();
      }
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка удаления', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) return;
    setRoleLoading(true);
    try {
      if (roleEditing) {
        await rolesApi.update(roleEditing.id, { name: roleForm.name.trim(), description: roleForm.description.trim() });
        showToast('Роль обновлена');
      } else {
        await rolesApi.create({ name: roleForm.name.trim(), description: roleForm.description.trim() });
        showToast('Роль добавлена');
      }
      setRoleForm({ name: '', description: '' });
      setRoleEditing(null);
      invalidateRoles();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка сохранения роли', 'error');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDeleteRole = async (role: UnitRoleDef) => {
    setRoleLoading(true);
    try {
      await rolesApi.delete(role.id);
      showToast('Роль удалена');
      invalidateRoles();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка удаления роли', 'error');
    } finally {
      setRoleLoading(false);
    }
  };

  const startEditRole = (role: UnitRoleDef) => {
    setRoleEditing(role);
    setRoleForm({ name: role.name, description: role.description });
  };

  const handleSaveFormation = async () => {
    if (!formationForm.name.trim()) return;
    setFormationLoading(true);
    try {
      if (formationEditing) {
        await formationsApi.update(formationEditing.id, { name: formationForm.name.trim(), description: formationForm.description.trim(), avatar_url: formationForm.avatar_url.trim() });
        showToast('Построение обновлено');
      } else {
        await formationsApi.create({ name: formationForm.name.trim(), description: formationForm.description.trim(), avatar_url: formationForm.avatar_url.trim() });
        showToast('Построение добавлено');
      }
      setFormationForm({ name: '', description: '', avatar_url: '' });
      setFormationEditing(null);
      invalidateFormations();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка сохранения', 'error');
    } finally {
      setFormationLoading(false);
    }
  };

  const handleDeleteFormation = async (f: Formation) => {
    setFormationLoading(true);
    try {
      await formationsApi.delete(f.id);
      showToast('Построение удалено');
      invalidateFormations();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка удаления', 'error');
    } finally {
      setFormationLoading(false);
    }
  };

  const startEditFormation = (f: Formation) => {
    setFormationEditing(f);
    setFormationForm({ name: f.name, description: f.description, avatar_url: f.avatar_url });
  };

  const handleSaveTrait = async () => {
    if (!traitForm.name.trim()) return;
    setTraitLoading(true);
    try {
      if (traitEditing) {
        await traitsApi.update(traitEditing.id, { name: traitForm.name.trim(), description: traitForm.description.trim(), adminComment: traitForm.adminComment.trim(), color: traitForm.color });
        showToast('Особенность обновлена');
      } else {
        await traitsApi.create({ name: traitForm.name.trim(), description: traitForm.description.trim(), adminComment: traitForm.adminComment.trim(), color: traitForm.color });
        showToast('Особенность добавлена');
      }
      setTraitForm({ name: '', description: '', adminComment: '', color: 'gray' });
      setTraitEditing(null);
      invalidateTraits();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка сохранения', 'error');
    } finally {
      setTraitLoading(false);
    }
  };

  const handleDeleteTrait = async (t: TraitDef) => {
    setTraitLoading(true);
    try {
      await traitsApi.delete(t.id);
      showToast('Особенность удалена');
      invalidateTraits();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка удаления', 'error');
    } finally {
      setTraitLoading(false);
    }
  };

  const startEditTrait = (t: TraitDef) => {
    setTraitEditing(t);
    setTraitForm({ name: t.name, description: t.description, adminComment: t.adminComment || '', color: t.color });
  };

  const handleSaveAbility = async () => {
    if (!abilityForm.name.trim()) return;
    setAbilityLoading(true);
    try {
      const statModifiers: Record<string, number> = {};
      const statModifiersEx: Record<string, { value: number; type: string }> = {};
      for (const [k, entry] of Object.entries(abilityForm.modifiers)) {
        const n = parseFloat(entry.value);
        if (!isNaN(n)) {
          if (entry.type === 'percent') statModifiersEx[k] = { value: n, type: 'percent' };
          else statModifiers[k] = n;
        }
      }
      if (abilityEditing) {
        await abilitiesApi.update(abilityEditing.id, { name: abilityForm.name.trim(), description: abilityForm.description.trim(), adminComment: abilityForm.adminComment.trim(), statModifiers, statModifiersEx });
        showToast('Умение обновлено');
      } else {
        await abilitiesApi.create({ name: abilityForm.name.trim(), description: abilityForm.description.trim(), adminComment: abilityForm.adminComment.trim(), statModifiers, statModifiersEx });
        showToast('Умение добавлено');
      }
      setAbilityForm({ name: '', description: '', adminComment: '', modifiers: {}, newModKey: 'health', newModVal: '', newModType: 'flat' });
      setAbilityEditing(null);
      invalidateAbilities();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка сохранения', 'error');
    } finally {
      setAbilityLoading(false);
    }
  };

  const handleDeleteAbility = async (a: AbilityDef) => {
    setAbilityLoading(true);
    try {
      await abilitiesApi.delete(a.id);
      showToast('Умение удалено');
      invalidateAbilities();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка удаления', 'error');
    } finally {
      setAbilityLoading(false);
    }
  };

  const startEditAbility = (a: AbilityDef) => {
    setAbilityEditing(a);
    const modifiers: Record<string, { value: string; type: 'flat' | 'percent' }> = {};
    for (const [k, v] of Object.entries(a.statModifiers || {})) modifiers[k] = { value: String(v), type: 'flat' };
    for (const [k, v] of Object.entries(a.statModifiersEx || {})) modifiers[k] = { value: String(v.value), type: v.type as 'flat' | 'percent' };
    setAbilityForm({ name: a.name, description: a.description, adminComment: a.adminComment || '', modifiers, newModKey: 'health', newModVal: '', newModType: 'flat' });
  };

  const addAbilityFormMod = () => {
    if (!abilityForm.newModVal) return;
    setAbilityForm(f => ({ ...f, modifiers: { ...f.modifiers, [f.newModKey]: { value: f.newModVal, type: f.newModType } }, newModVal: '' }));
  };

  const removeAbilityFormMod = (key: string) => {
    setAbilityForm(f => { const m = { ...f.modifiers }; delete m[key]; return { ...f, modifiers: m }; });
  };

  if (!user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-3">
          <Icon name="ShieldOff" size={32} className="text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Доступ только для администраторов</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold text-foreground" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
            ПАНЕЛЬ УПРАВЛЕНИЯ
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Управление данными справочника</p>
        </div>
        <button onClick={handleSeed} disabled={seedLoading}
          className="flex items-center gap-2 px-3 py-2 text-xs border border-border rounded-sm hover:bg-muted disabled:opacity-50 transition-colors">
          <Icon name={seedLoading ? 'Loader' : 'Download'} size={13} className={seedLoading ? 'animate-spin' : ''} />
          Импортировать базовые данные
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border flex-wrap">
        {(['stats', 'units', 'treaties', 'roles', 'formations', 'traits', 'abilities', 'moderation'] as AdminTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${tab === t ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t === 'stats' ? 'Статистика' : t === 'units' ? 'Отряды' : t === 'treaties' ? 'Трактаты' : t === 'roles' ? 'Роли' : t === 'formations' ? 'Построения' : t === 'traits' ? 'Особенности' : t === 'abilities' ? 'Умения' : (
              <span className="flex items-center gap-1.5">
                Публикации
                {(pendingTopics.length + pendingGuides.length) > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none"
                    style={{ background: 'hsl(355 72% 50%)', color: 'white' }}>
                    {pendingTopics.length + pendingGuides.length}
                  </span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'stats' && <AdminTabStats siteStats={siteStats} statsLoading={statsLoading} />}

      {tab === 'units' && (
        <AdminTabUnits
          units={units}
          loadingData={loadingData}
          onAdd={() => setUnitModal({ open: true, unit: null })}
          onEdit={unit => setUnitModal({ open: true, unit })}
          onDelete={unit => setConfirmDelete({ id: unit.id as string, name: unit.name as string, kind: 'unit' })}
        />
      )}

      {tab === 'treaties' && (
        <AdminTabTreaties
          treaties={treaties}
          loadingData={loadingData}
          onAdd={() => setTreatyModal({ open: true, treaty: null })}
          onEdit={treaty => setTreatyModal({ open: true, treaty })}
          onDelete={treaty => setConfirmDelete({ id: treaty.id as string, name: treaty.name as string, kind: 'treaty' })}
        />
      )}

      {tab === 'roles' && (
        <AdminTabRoles
          roles={roles}
          roleForm={roleForm}
          roleEditing={roleEditing}
          roleLoading={roleLoading}
          onFormChange={setRoleForm}
          onSave={handleSaveRole}
          onEdit={startEditRole}
          onDelete={handleDeleteRole}
          onCancelEdit={() => { setRoleEditing(null); setRoleForm({ name: '', description: '' }); }}
        />
      )}

      {tab === 'formations' && (
        <AdminTabFormations
          formations={formations}
          formationForm={formationForm}
          formationEditing={formationEditing}
          formationLoading={formationLoading}
          onFormChange={setFormationForm}
          onSave={handleSaveFormation}
          onEdit={startEditFormation}
          onDelete={handleDeleteFormation}
          onCancelEdit={() => { setFormationEditing(null); setFormationForm({ name: '', description: '', avatar_url: '' }); }}
        />
      )}

      {tab === 'traits' && (
        <AdminTabTraits
          traits={traits}
          traitForm={traitForm}
          traitEditing={traitEditing}
          traitLoading={traitLoading}
          onFormChange={setTraitForm}
          onSave={handleSaveTrait}
          onEdit={startEditTrait}
          onDelete={handleDeleteTrait}
          onCancelEdit={() => { setTraitEditing(null); setTraitForm({ name: '', description: '', adminComment: '', color: 'gray' }); }}
        />
      )}

      {tab === 'abilities' && (
        <AdminTabAbilities
          abilities={abilities}
          abilityForm={abilityForm}
          abilityEditing={abilityEditing}
          abilityLoading={abilityLoading}
          onFormChange={setAbilityForm}
          onSave={handleSaveAbility}
          onEdit={startEditAbility}
          onDelete={handleDeleteAbility}
          onCancelEdit={() => { setAbilityEditing(null); setAbilityForm({ name: '', description: '', adminComment: '', modifiers: {}, newModKey: 'health', newModVal: '', newModType: 'flat' }); }}
          onAddMod={addAbilityFormMod}
          onRemoveMod={removeAbilityFormMod}
        />
      )}

      {tab === 'moderation' && (
        <AdminTabModeration
          pendingTopics={pendingTopics}
          pendingGuides={pendingGuides}
          moderationLoading={moderationLoading}
          expandedTopic={expandedTopic}
          processingId={processingId}
          onSetExpandedTopic={setExpandedTopic}
          onPublishTopic={handlePublishTopic}
          onPublishGuide={handlePublishGuide}
        />
      )}

      {/* Modals */}
      {unitModal.open && (
        <UnitModal unit={unitModal.unit} onSave={handleSaveUnit} onClose={() => setUnitModal({ open: false })}
          availableRoles={roles} availableFormations={formations} availableTraits={traits} availableAbilities={abilities} />
      )}
      {treatyModal.open && (
        <TreatyModal treaty={treatyModal.treaty} onSave={handleSaveTreaty} onClose={() => setTreatyModal({ open: false })} />
      )}
      {confirmDelete && (
        <ConfirmModal
          name={confirmDelete.name}
          type={confirmDelete.kind === 'unit' ? 'отряд' : 'трактат'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
