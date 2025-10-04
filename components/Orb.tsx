/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface OrbProps {
  volume: number;
}

const Orb: React.FC<OrbProps> = ({ volume }) => {
  // Clamp and scale the volume to create a pleasant visual effect
  const clampedVolume = Math.min(volume * 5, 1);
  const shadowSpread = clampedVolume * 40;
  const shadowBlur = clampedVolume * 80;
  const shadowOpacity = clampedVolume * 0.5;

  const orbStyle = {
    boxShadow: `0 0 ${shadowBlur}px ${shadowSpread}px rgba(255, 255, 255, ${shadowOpacity})`,
  };

  return <div className="orb" style={orbStyle} />;
};

export default Orb;
