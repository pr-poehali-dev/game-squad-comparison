-- Возвращаем тестовые трактаты
UPDATE treaties SET is_active = true WHERE id IN ('урон-5', 'урон-ii', 'урон-v');

-- Скрываем те, что были добавлены через миграцию (не через панель управления)
UPDATE treaties SET is_active = false WHERE id IN (
  'iron-discipline', 'swift-winds', 'eagle-eye', 'siege-mastery',
  'blood-oath', 'ancient-covenant', 'shadow-pact', 'shield-oath', 'marksman-training', 'arcane-infusion'
);
