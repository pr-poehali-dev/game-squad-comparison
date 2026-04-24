import {
  GameState, Player, Unit, Commander, CapturePoint, Building,
  UNIT_DEFS, UnitClass, COUNTER_BONUS, BotStrategy, DailyQuest,
  RANKS, RANK_THRESHOLDS, LeaderboardEntry, PlayerRank
} from './types';

// ── Утилиты ──────────────────────────────────────────────────────────────────
let _id = 0;
export const uid = () => `u${++_id}`;

export function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function normalize(dx: number, dy: number) {
  const len = Math.sqrt(dx * dx + dy * dy);
  return len > 0 ? { x: dx / len, y: dy / len } : { x: 0, y: 0 };
}

function getRank(score: number): PlayerRank {
  let rank: PlayerRank = 'Новобранец';
  for (const r of RANKS) {
    if (score >= RANK_THRESHOLDS[r]) rank = r;
  }
  return rank;
}

// ── Константы карты ───────────────────────────────────────────────────────────
export const MAP_W = 1200;
export const MAP_H = 900;

const BOT_NAMES = [
  'Граф Волков', 'Баронесса Ли', 'Сир Громов', 'Герцог Тьмы',
  'Рыцарь Стальной', 'Маркиз Огня', 'Лорд Теней', 'Капитан Ярость',
  'Ярл Буря', 'Конте ди Ночь', 'Сэр Льдов', 'Принц Красный',
];
const BOT_COLORS = [
  '#e05252','#e07a52','#52b4e0','#52e07a',
  '#c452e0','#e0c252','#52e0c4','#e05296',
  '#9ce052','#527ae0','#e0528c','#52e0e0',
];
const BOT_STRATEGIES: BotStrategy[] = ['aggressive','defensive','economic','aggressive','economic','defensive','aggressive','defensive','economic','aggressive','defensive','economic'];

// ── Инициализация ─────────────────────────────────────────────────────────────
export function createInitialState(playerName: string, botCount: number): GameState {
  const humanId = uid();

  // Стартовые позиции по периметру/углам карты
  const spawnPoints = [
    { x: 100, y: 100 },
    { x: MAP_W - 100, y: MAP_H - 100 },
    { x: MAP_W - 100, y: 100 },
    { x: 100, y: MAP_H - 100 },
    { x: MAP_W / 2, y: 60 },
    { x: MAP_W / 2, y: MAP_H - 60 },
    { x: 60, y: MAP_H / 2 },
    { x: MAP_W - 60, y: MAP_H / 2 },
    { x: 250, y: 250 },
    { x: MAP_W - 250, y: MAP_H - 250 },
    { x: MAP_W - 250, y: 250 },
    { x: 250, y: MAP_H - 250 },
  ];

  const players: Record<string, Player> = {};
  const commanders: Record<string, Commander> = {};
  const units: Record<string, Unit> = {};

  // Человек
  const hSpawn = spawnPoints[0];
  const hCmdId = uid();
  commanders[hCmdId] = { id: hCmdId, ownerId: humanId, pos: { ...hSpawn }, hp: 300, maxHp: 300, alive: true };
  players[humanId] = {
    id: humanId, name: playerName, isHuman: true,
    color: '#f0c060', gold: 150, food: 10, score: 0, kills: 0, deaths: 0,
    rank: 'Новобранец', unitIds: [], commanderId: hCmdId, alive: true,
    recruitCooldown: 0,
  };
  // Стартовый отряд для человека
  spawnStartingUnits(humanId, hSpawn, units, players);

  // Боты
  for (let i = 0; i < Math.min(botCount, 11); i++) {
    const botId = uid();
    const bSpawn = spawnPoints[i + 1] || { x: 100 + i * 80, y: 100 };
    const bCmdId = uid();
    commanders[bCmdId] = { id: bCmdId, ownerId: botId, pos: { ...bSpawn }, hp: 300, maxHp: 300, alive: true };
    players[botId] = {
      id: botId, name: BOT_NAMES[i] || `Бот ${i + 1}`,
      isHuman: false, color: BOT_COLORS[i] || '#aaa',
      gold: 150, food: 10, score: 0, kills: 0, deaths: 0,
      rank: 'Новобранец', unitIds: [], commanderId: bCmdId, alive: true,
      botStrategy: BOT_STRATEGIES[i],
      recruitCooldown: Math.random() * 200,
    };
    spawnStartingUnits(botId, bSpawn, units, players);
  }

  // Точки захвата
  const capturePoints: Record<string, CapturePoint> = {};
  const cpDefs = [
    { pos: { x: MAP_W / 2, y: MAP_H / 2 }, type: 'castle' as const, label: 'Замок', emoji: '🏰', gold: 8, food: 3 },
    { pos: { x: 300, y: MAP_H / 2 }, type: 'mine' as const, label: 'Шахта', emoji: '⛏️', gold: 5, food: 0 },
    { pos: { x: MAP_W - 300, y: MAP_H / 2 }, type: 'mine' as const, label: 'Шахта', emoji: '⛏️', gold: 5, food: 0 },
    { pos: { x: MAP_W / 2, y: 250 }, type: 'farm' as const, label: 'Ферма', emoji: '🌾', gold: 0, food: 4 },
    { pos: { x: MAP_W / 2, y: MAP_H - 250 }, type: 'farm' as const, label: 'Ферма', emoji: '🌾', gold: 0, food: 4 },
    { pos: { x: 400, y: 220 }, type: 'tower' as const, label: 'Сторожевая вышка', emoji: '🗼', gold: 3, food: 1 },
    { pos: { x: MAP_W - 400, y: 220 }, type: 'tower' as const, label: 'Сторожевая вышка', emoji: '🗼', gold: 3, food: 1 },
    { pos: { x: 400, y: MAP_H - 220 }, type: 'tower' as const, label: 'Сторожевая вышка', emoji: '🗼', gold: 3, food: 1 },
    { pos: { x: MAP_W - 400, y: MAP_H - 220 }, type: 'tower' as const, label: 'Сторожевая вышка', emoji: '🗼', gold: 3, food: 1 },
  ];
  for (const cp of cpDefs) {
    const cpId = uid();
    capturePoints[cpId] = {
      id: cpId, pos: cp.pos, type: cp.type, radius: 60,
      ownerId: null, captureProgress: 0, capturingPlayerId: null,
      label: cp.label, emoji: cp.emoji, goldPerSec: cp.gold, foodPerSec: cp.food,
    };
  }

  const quests = createDailyQuests();

  return {
    phase: 'playing',
    tick: 0,
    players,
    units,
    commanders,
    capturePoints,
    buildings: {},
    humanPlayerId: humanId,
    winner: null,
    log: ['Битва началась! Захватывай точки и нанимай войска.'],
    quests,
    leaderboard: [],
  };
}

function spawnStartingUnits(
  ownerId: string,
  spawn: { x: number; y: number },
  units: Record<string, Unit>,
  players: Record<string, Player>
) {
  const startClasses: UnitClass[] = ['infantry', 'infantry', 'archer'];
  for (let i = 0; i < startClasses.length; i++) {
    const cls = startClasses[i];
    const def = UNIT_DEFS[cls];
    const uId = uid();
    const angle = (i / startClasses.length) * Math.PI * 2;
    units[uId] = {
      id: uId, class: cls, ownerId,
      pos: { x: spawn.x + Math.cos(angle) * 30, y: spawn.y + Math.sin(angle) * 30 },
      targetPos: null,
      hp: def.hp, maxHp: def.hp, atk: def.atk, spd: def.spd, range: def.range,
      attackCooldown: 0, state: 'idle', targetUnitId: null,
      color: def.color, emoji: def.emoji, label: def.label, level: 1,
    };
    players[ownerId].unitIds.push(uId);
  }
}

function createDailyQuests(): DailyQuest[] {
  return [
    { id: 'q1', label: 'Уничтожить 10 вражеских юнитов', target: 10, progress: 0, reward: 100, completed: false },
    { id: 'q2', label: 'Захватить 3 точки', target: 3, progress: 0, reward: 150, completed: false },
    { id: 'q3', label: 'Нанять 5 юнитов', target: 5, progress: 0, reward: 80, completed: false },
  ];
}

// ── Игровой тик ──────────────────────────────────────────────────────────────
export function tick(state: GameState, dt: number): GameState {
  if (state.phase !== 'playing') return state;

  const s = deepClone(state);
  s.tick++;

  // 1. Ресурсы с точек
  tickResources(s, dt);

  // 2. Движение и бои юнитов
  tickUnits(s, dt);

  // 3. Захват точек
  tickCapture(s, dt);

  // 4. Строения атакуют
  tickBuildings(s, dt);

  // 5. ИИ ботов
  tickBots(s, dt);

  // 6. Проверка победителя
  checkWinCondition(s);

  // 7. Таблица лидеров
  s.leaderboard = buildLeaderboard(s);

  // 8. Квесты
  s.quests = s.quests.map(q => ({ ...q, completed: q.progress >= q.target }));

  return s;
}

function tickResources(s: GameState, dt: number) {
  const rate = dt / 1000;
  for (const cp of Object.values(s.capturePoints)) {
    if (!cp.ownerId) continue;
    const p = s.players[cp.ownerId];
    if (!p || !p.alive) continue;
    p.gold = Math.min(p.gold + cp.goldPerSec * rate, 9999);
    p.food = Math.min(p.food + cp.foodPerSec * rate, 999);
  }
  // Базовая добыча
  for (const p of Object.values(s.players)) {
    if (!p.alive) continue;
    p.gold = Math.min(p.gold + 1.5 * rate, 9999);
    if (p.recruitCooldown > 0) p.recruitCooldown -= dt;
  }
}

function tickUnits(s: GameState, dt: number) {
  const dtSec = dt / 1000;

  for (const unit of Object.values(s.units)) {
    if (unit.state === 'dead') continue;

    if (unit.attackCooldown > 0) unit.attackCooldown -= dt;

    // Найти ближайшего врага
    const enemy = findNearestEnemy(unit, s);

    if (enemy && dist(unit.pos, enemy.pos) <= unit.range) {
      // Атакуем
      unit.state = 'attacking';
      unit.targetUnitId = enemy.id;
      unit.targetPos = null;

      if (unit.attackCooldown <= 0) {
        let dmg = unit.atk;
        // Бонус противостояния
        const counters = COUNTER_BONUS[unit.class];
        if (counters && counters.includes(enemy.class)) dmg *= 1.5;
        enemy.hp -= dmg;

        unit.attackCooldown = 800;

        if (enemy.hp <= 0) {
          enemy.hp = 0;
          enemy.state = 'dead';
          // Удаляем из unitIds владельца
          const enemyOwner = s.players[enemy.ownerId];
          if (enemyOwner) {
            enemyOwner.unitIds = enemyOwner.unitIds.filter(id => id !== enemy.id);
          }
          // Очки и квесты атакующему
          const attOwner = s.players[unit.ownerId];
          if (attOwner) {
            attOwner.kills++;
            attOwner.score += 10;
            // Квест убийства
            if (attOwner.isHuman) {
              const kq = s.quests.find(q => q.id === 'q1');
              if (kq && !kq.completed) kq.progress++;
            }
          }
          const log = `${s.players[unit.ownerId]?.name} уничтожил юнита ${enemy.label}`;
          if (s.log.length < 50) s.log.unshift(log);
          else { s.log.unshift(log); s.log.pop(); }
        }
      }
    } else if (enemy && dist(unit.pos, enemy.pos) <= unit.range * 3) {
      // Двигаемся к ближайшему врагу
      unit.state = 'moving';
      moveToward(unit, enemy.pos, dtSec);
    } else if (unit.targetPos) {
      // Идём к цели
      unit.state = 'moving';
      const d = dist(unit.pos, unit.targetPos);
      if (d < 8) {
        unit.targetPos = null;
        unit.state = 'idle';
      } else {
        moveToward(unit, unit.targetPos, dtSec);
      }
    } else {
      unit.state = 'idle';
    }

    // Обновляем ранг игрока
    const owner = s.players[unit.ownerId];
    if (owner) owner.rank = getRank(owner.score);
  }

  // Удаляем мёртвых из карты
  for (const [id, unit] of Object.entries(s.units)) {
    if (unit.state === 'dead') delete s.units[id];
  }
}

function moveToward(unit: Unit, target: { x: number; y: number }, dtSec: number) {
  const dx = target.x - unit.pos.x;
  const dy = target.y - unit.pos.y;
  const dir = normalize(dx, dy);
  unit.pos.x = Math.max(10, Math.min(MAP_W - 10, unit.pos.x + dir.x * unit.spd * dtSec));
  unit.pos.y = Math.max(10, Math.min(MAP_H - 10, unit.pos.y + dir.y * unit.spd * dtSec));
}

function findNearestEnemy(unit: Unit, s: GameState): Unit | null {
  let best: Unit | null = null;
  let bestDist = Infinity;
  for (const other of Object.values(s.units)) {
    if (other.ownerId === unit.ownerId || other.state === 'dead') continue;
    const d = dist(unit.pos, other.pos);
    if (d < bestDist) { bestDist = d; best = other; }
  }
  return best;
}

function tickCapture(s: GameState, dt: number) {
  const dtSec = dt / 1000;

  for (const cp of Object.values(s.capturePoints)) {
    // Считаем игроков в радиусе
    const presence: Record<string, number> = {};
    for (const unit of Object.values(s.units)) {
      if (unit.state === 'dead') continue;
      if (dist(unit.pos, cp.pos) <= cp.radius) {
        presence[unit.ownerId] = (presence[unit.ownerId] || 0) + 1;
      }
    }

    const playerIds = Object.keys(presence);
    if (playerIds.length === 0) continue;
    if (playerIds.length > 1) {
      // Конфликт — прогресс замирает
      continue;
    }

    const capturingId = playerIds[0];
    if (cp.ownerId === capturingId) continue; // уже наш

    cp.capturingPlayerId = capturingId;
    const speed = presence[capturingId] * 15 * dtSec;

    if (cp.ownerId === null) {
      cp.captureProgress = Math.min(100, cp.captureProgress + speed);
    } else {
      // Нейтрализуем сначала
      cp.captureProgress = Math.max(0, cp.captureProgress - speed);
      if (cp.captureProgress <= 0) {
        cp.ownerId = null;
        cp.captureProgress = 0;
      }
    }

    if (cp.captureProgress >= 100 && cp.ownerId === null) {
      cp.ownerId = capturingId;
      cp.captureProgress = 100;
      const p = s.players[capturingId];
      if (p) {
        p.score += 50;
        const log = `${p.name} захватил ${cp.label}`;
        s.log.unshift(log);
        if (s.log.length > 50) s.log.pop();
        if (p.isHuman) {
          const cq = s.quests.find(q => q.id === 'q2');
          if (cq && !cq.completed) cq.progress++;
        }
      }
    }
  }
}

function tickBuildings(s: GameState, dt: number) {
  for (const bld of Object.values(s.buildings)) {
    if (bld.attackCooldown > 0) { bld.attackCooldown -= dt; continue; }
    // Найти ближайшего врага
    for (const unit of Object.values(s.units)) {
      if (unit.ownerId === bld.ownerId || unit.state === 'dead') continue;
      if (dist(unit.pos, bld.pos) <= bld.range) {
        unit.hp -= bld.atk;
        bld.attackCooldown = 1200;
        if (unit.hp <= 0) {
          unit.hp = 0;
          unit.state = 'dead';
          const owner = s.players[unit.ownerId];
          if (owner) owner.unitIds = owner.unitIds.filter(id => id !== unit.id);
          const bOwner = s.players[bld.ownerId];
          if (bOwner) { bOwner.kills++; bOwner.score += 10; }
        }
        break;
      }
    }
  }
  // Удалить мёртвых снова (от башен)
  for (const [id, unit] of Object.entries(s.units)) {
    if (unit.state === 'dead') delete s.units[id];
  }
}

// ── ИИ ботов ─────────────────────────────────────────────────────────────────
function tickBots(s: GameState, dt: number) {
  for (const player of Object.values(s.players)) {
    if (player.isHuman || !player.alive) continue;

    const strategy = player.botStrategy || 'aggressive';

    // Нанять юнит если есть деньги и кулдаун прошёл
    if (player.recruitCooldown <= 0 && player.gold >= 40) {
      botRecruit(player, s, strategy);
      player.recruitCooldown = 3000 + Math.random() * 2000;
    }

    // Управление юнитами
    for (const uid_ of player.unitIds) {
      const unit = s.units[uid_];
      if (!unit || unit.state === 'dead') continue;

      if (strategy === 'aggressive') {
        // Атаковать ближайшего игрока (человека приоритет)
        botAggressiveMove(unit, player, s);
      } else if (strategy === 'defensive') {
        // Держаться у командира, атаковать тех кто близко
        botDefensiveMove(unit, player, s);
      } else {
        // Захватывать точки
        botEconomicMove(unit, player, s);
      }
    }

    // Строить (инженеры)
    botBuild(player, s);
  }
}

function botRecruit(player: Player, s: GameState, strategy: string) {
  const options: UnitClass[] = strategy === 'aggressive'
    ? ['cavalry', 'knight', 'infantry']
    : strategy === 'defensive'
    ? ['knight', 'infantry', 'archer']
    : ['archer', 'infantry', 'engineer'];

  for (const cls of options) {
    const def = UNIT_DEFS[cls];
    if (player.gold >= def.goldCost && player.food >= def.foodCost) {
      const cmd = s.commanders[player.commanderId];
      if (!cmd) break;
      const uId = uid();
      const angle = Math.random() * Math.PI * 2;
      s.units[uId] = {
        id: uId, class: cls, ownerId: player.id,
        pos: { x: cmd.pos.x + Math.cos(angle) * 40, y: cmd.pos.y + Math.sin(angle) * 40 },
        targetPos: null,
        hp: def.hp, maxHp: def.hp, atk: def.atk, spd: def.spd, range: def.range,
        attackCooldown: 0, state: 'idle', targetUnitId: null,
        color: def.color, emoji: def.emoji, label: def.label, level: 1,
      };
      player.unitIds.push(uId);
      player.gold -= def.goldCost;
      player.food -= def.foodCost;
      break;
    }
  }
}

function botAggressiveMove(unit: Unit, player: Player, s: GameState) {
  // Атаковать командира человека или его юнитов
  const humanPlayer = Object.values(s.players).find(p => p.isHuman && p.alive);
  if (!humanPlayer) return;
  const humanCmd = s.commanders[humanPlayer.commanderId];
  if (humanCmd && humanCmd.alive) {
    if (!unit.targetPos || Math.random() < 0.01) {
      // Идти к командиру человека
      unit.targetPos = {
        x: humanCmd.pos.x + (Math.random() - 0.5) * 60,
        y: humanCmd.pos.y + (Math.random() - 0.5) * 60,
      };
    }
  }
}

function botDefensiveMove(unit: Unit, player: Player, s: GameState) {
  const cmd = s.commanders[player.commanderId];
  if (!cmd) return;
  const d = dist(unit.pos, cmd.pos);
  if (d > 120) {
    unit.targetPos = { x: cmd.pos.x + (Math.random() - 0.5) * 80, y: cmd.pos.y + (Math.random() - 0.5) * 80 };
  }
}

function botEconomicMove(unit: Unit, player: Player, s: GameState) {
  // Найти незахваченную точку
  if (!unit.targetPos || Math.random() < 0.005) {
    const uncaptured = Object.values(s.capturePoints)
      .filter(cp => cp.ownerId !== player.id)
      .sort((a, b) => dist(unit.pos, a.pos) - dist(unit.pos, b.pos));
    if (uncaptured.length > 0) {
      unit.targetPos = { ...uncaptured[0].pos };
    }
  }
}

function botBuild(player: Player, s: GameState) {
  // Инженеры строят башни
  for (const uid_ of player.unitIds) {
    const unit = s.units[uid_];
    if (!unit || unit.class !== 'engineer') continue;
    if (player.gold >= 200 && Object.values(s.buildings).filter(b => b.ownerId === player.id).length < 3) {
      const bId = uid();
      s.buildings[bId] = {
        id: bId, type: 'tower', ownerId: player.id,
        pos: { x: unit.pos.x + (Math.random() - 0.5) * 40, y: unit.pos.y + (Math.random() - 0.5) * 40 },
        hp: 300, maxHp: 300, emoji: '🗼', atk: 20, range: 100, attackCooldown: 0,
      };
      player.gold -= 200;
    }
  }
}

// ── Победа ───────────────────────────────────────────────────────────────────
function checkWinCondition(s: GameState) {
  // Убит командир — игрок выбывает
  for (const [playerId, player] of Object.entries(s.players)) {
    if (!player.alive) continue;
    const cmd = s.commanders[player.commanderId];
    if (!cmd) continue;
    // Если все юниты уничтожены и рядом враги — командир уязвим
    const myUnits = player.unitIds.filter(id => s.units[id]);
    if (myUnits.length === 0) {
      // Проверяем атаку на командира
      for (const unit of Object.values(s.units)) {
        if (unit.ownerId === playerId || unit.state === 'dead') continue;
        if (dist(unit.pos, cmd.pos) <= 50) {
          cmd.hp -= 5;
          if (cmd.hp <= 0) {
            cmd.alive = false;
            player.alive = false;
            player.deaths++;
            const killerPlayer = s.players[unit.ownerId];
            if (killerPlayer) {
              killerPlayer.score += 100;
              killerPlayer.kills++;
            }
            s.log.unshift(`⚔️ ${player.name} пал в бою!`);
            if (s.log.length > 50) s.log.pop();
          }
          break;
        }
      }
    }
  }

  const alive = Object.values(s.players).filter(p => p.alive);
  if (alive.length === 1) {
    s.winner = alive[0].id;
    s.phase = 'ended';
    s.log.unshift(`🏆 ${alive[0].name} победил!`);
  }

  // Ограничение по времени (10 минут = 36000 тиков при 60fps)
  if (s.tick > 36000 && s.phase === 'playing') {
    const top = alive.sort((a, b) => b.score - a.score)[0];
    if (top) { s.winner = top.id; s.phase = 'ended'; s.log.unshift(`⏱️ Время вышло! Победитель: ${top.name}`); }
  }
}

function buildLeaderboard(s: GameState): LeaderboardEntry[] {
  return Object.values(s.players)
    .sort((a, b) => b.score - a.score)
    .map(p => ({
      name: p.name,
      score: p.score,
      rank: p.rank,
      kd: p.deaths > 0 ? (p.kills / p.deaths).toFixed(1) : p.kills.toString(),
    }));
}

// ── Действия игрока ───────────────────────────────────────────────────────────
export function playerMoveUnits(s: GameState, targetX: number, targetY: number): GameState {
  const ns = deepClone(s);
  const player = ns.players[ns.humanPlayerId];
  if (!player || !player.alive) return ns;

  for (const uid_ of player.unitIds) {
    const unit = ns.units[uid_];
    if (!unit) continue;
    const spread = (Math.random() - 0.5) * 60;
    unit.targetPos = { x: targetX + spread, y: targetY + (Math.random() - 0.5) * 60 };
    unit.state = 'moving';
  }
  return ns;
}

export function playerRecruitUnit(s: GameState, unitClass: UnitClass): GameState {
  const ns = deepClone(s);
  const player = ns.players[ns.humanPlayerId];
  if (!player || !player.alive) return ns;
  if (player.unitIds.length >= 5) { return ns; }

  const def = UNIT_DEFS[unitClass];
  if (player.gold < def.goldCost || player.food < def.foodCost) return ns;

  const cmd = ns.commanders[player.commanderId];
  if (!cmd) return ns;

  const uId = uid();
  const angle = Math.random() * Math.PI * 2;
  ns.units[uId] = {
    id: uId, class: unitClass, ownerId: player.id,
    pos: { x: cmd.pos.x + Math.cos(angle) * 45, y: cmd.pos.y + Math.sin(angle) * 45 },
    targetPos: null,
    hp: def.hp, maxHp: def.hp, atk: def.atk, spd: def.spd, range: def.range,
    attackCooldown: 0, state: 'idle', targetUnitId: null,
    color: def.color, emoji: def.emoji, label: def.label, level: 1,
  };
  player.unitIds.push(uId);
  player.gold -= def.goldCost;
  player.food -= def.foodCost;
  player.recruitCooldown = 0;

  // Квест найма
  const hq = ns.quests.find(q => q.id === 'q3');
  if (hq && !hq.completed) hq.progress++;

  return ns;
}

export function playerBuildTower(s: GameState): GameState {
  const ns = deepClone(s);
  const player = ns.players[ns.humanPlayerId];
  if (!player || !player.alive) return ns;
  if (player.gold < 200) return ns;

  // Найти инженера
  const engineer = player.unitIds.map(id => ns.units[id]).find(u => u && u.class === 'engineer');
  if (!engineer) return ns;

  const bId = uid();
  ns.buildings[bId] = {
    id: bId, type: 'tower', ownerId: player.id,
    pos: { x: engineer.pos.x + (Math.random() - 0.5) * 30, y: engineer.pos.y + (Math.random() - 0.5) * 30 },
    hp: 300, maxHp: 300, emoji: '🗼', atk: 20, range: 100, attackCooldown: 0,
  };
  player.gold -= 200;
  return ns;
}

// ── Утилиты ───────────────────────────────────────────────────────────────────
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
