import React from 'react';
import { MatchStartCountdown } from './MatchStartCountdown';

interface MatchStartTransitionProps {
  isActive: boolean;
  modeText?: string;
  botCount?: number;
  onComplete: () => void;
}

export const MatchStartTransition: React.FC<MatchStartTransitionProps> = ({
  isActive,
  modeText = 'INICIANDO PARTIDA',
  onComplete,
}) => {
  if (!isActive) return null;

  return (
    <MatchStartCountdown
      onComplete={onComplete}
      subtitle={modeText}
    />
  );
};
