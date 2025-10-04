/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  volume: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ volume }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barCount = 32;
    const barWidth = width / barCount / 2;
    const gap = barWidth;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < barCount; i++) {
        // Add some randomness to make it look more dynamic
        const randomFactor = Math.random() * 0.5 + 0.75;
        const barHeight = Math.min(height, (volume * height * 6 * randomFactor));

        const x = (width / 2) + (i * (barWidth + gap));
        const x_neg = (width / 2) - ((i + 1) * (barWidth + gap));
        const y = (height - barHeight) / 2;

        // Use a gradient for a nicer look
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, `rgba(0, 168, 107, ${0.1 + volume * 0.4})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${0.2 + volume * 0.8})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.fillRect(x_neg, y, barWidth, barHeight);
      }
      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [volume]);

  return <canvas ref={canvasRef} className="audio-visualizer" width="300" height="80" />;
};

export default AudioVisualizer;
