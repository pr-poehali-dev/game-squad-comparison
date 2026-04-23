INSERT INTO treaties (id, name, description, compatible_classes, rarity, stat_modifiers, is_active)
VALUES
  ('iron-discipline', 'Железная Дисциплина', 'Суровая тренировка усиливает защитные навыки пехотных отрядов.', ARRAY['Пехота'], 'common', '{"slashingDefense":15,"piercingDefense":10,"block":12,"morale":10}', true),
  ('swift-winds', 'Попутный Ветер', 'Благословение скорости — отряд движется быстрее ветра.', ARRAY['Кавалерия','Пехота','Стрелки'], 'uncommon', '{"moveSpeed":20,"morale":5,"blockRecovery":10}', true),
  ('eagle-eye', 'Орлиный Взор', 'Дальнобойные отряды получают бонус к дальности и пробиванию брони.', ARRAY['Стрелки'], 'uncommon', '{"piercingDamage":18,"piercingPenetration":22,"rangeDistance":2}', true),
  ('siege-mastery', 'Мастерство Осады', 'Осадные орудия работают с удвоенной разрушительной силой.', ARRAY['Осадные'], 'rare', '{"bluntDamage":30,"bluntPenetration":25,"moveSpeed":-5}', true),
  ('blood-oath', 'Кровавая Клятва', 'Отряд клянётся победить или умереть — атака резко возрастает.', ARRAY['Пехота','Кавалерия'], 'epic', '{"slashingDamage":30,"piercingDamage":25,"morale":25,"slashingDefense":-10,"piercingDefense":-8}', true),
  ('ancient-covenant', 'Древний Завет', 'Легендарный договор с духами предков. Все характеристики возрастают.', ARRAY['Пехота','Кавалерия','Стрелки','Осадные'], 'legendary', '{"health":15,"morale":20,"leadership":15,"slashingDamage":15,"piercingDamage":15,"bluntDamage":15,"slashingDefense":15,"piercingDefense":15,"bluntDefense":15,"block":10,"blockRecovery":15}', true),
  ('shadow-pact', 'Тёмный Пакт', 'Магический договор резко усиливает урон, но ослабляет волю.', ARRAY['Пехота'], 'epic', '{"piercingDamage":35,"piercingPenetration":30,"morale":-15,"leadership":-10}', true),
  ('shield-oath', 'Клятва Щита', 'Воины дают клятву не отступать — блок и защита от рубящих атак растут.', ARRAY['Пехота','Кавалерия'], 'rare', '{"block":20,"blockRecovery":25,"slashingDefense":18,"troops":10}', true),
  ('marksman-training', 'Меткая Рука', 'Интенсивные тренировки увеличивают боезапас и пробивную силу стрел.', ARRAY['Стрелки','Осадные'], 'common', '{"ammo":10,"piercingPenetration":18,"rangeDistance":1}', true)
ON CONFLICT (id) DO NOTHING;
