import Image from 'next/image';
import { Team } from '@/lib/types';

interface Props {
  team: Team;
  size?: number;
  className?: string;
}

export default function TeamLogo({ team, size = 40, className = '' }: Props) {
  return (
    <div
      style={{ width: size, height: size, minWidth: size }}
      className={`relative rounded-full overflow-hidden bg-[#222] border border-[#333] ${className}`}
    >
      <Image
        src={`/images/${team.logo}`}
        alt={team.name}
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
    </div>
  );
}
