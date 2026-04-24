import GameScreen from '@/game/GameScreen';

export default function MedievalClashPage() {
  return (
    <div style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <GameScreen />
    </div>
  );
}
