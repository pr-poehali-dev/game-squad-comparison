interface Props {
  username: string;
  avatarUrl?: string;
  size?: number;
  onClick?: () => void;
  className?: string;
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function getColor(name: string) {
  const colors = [
    '#c9a84c', '#e05252', '#52b4e0', '#7eb87e',
    '#c452e0', '#e07a52', '#52e0c4', '#c47ac4',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function UserAvatar({ username, avatarUrl, size = 32, onClick, className = '' }: Props) {
  const color = getColor(username);
  const style: React.CSSProperties = {
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    overflow: 'hidden', display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', cursor: onClick ? 'pointer' : 'default',
    border: `2px solid ${color}44`,
    fontFamily: 'Manrope, sans-serif',
    fontWeight: 700,
    fontSize: size * 0.35,
    background: color + '22',
    color,
    userSelect: 'none',
  };

  if (avatarUrl) {
    return (
      <div style={style} onClick={onClick} className={className} title={username}>
        <img src={avatarUrl} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <div style={style} onClick={onClick} className={className} title={username}>
      {getInitials(username)}
    </div>
  );
}
