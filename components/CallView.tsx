/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import cn from 'classnames';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
import { useSettings, useUI, useLogStore, useCallState } from '../lib/state';
import Orb from './Orb';
import AudioVisualizer from './AudioVisualizer';

export default function CallView() {
  const { disconnect, volume, toggleMute, setOutputVolume: setApiVolume } = useLiveAPIContext();
  const { personaName } = useSettings();
  const { toggleSidebar } = useUI();
  const {
    isMuted,
    isCameraOn,
    showCaptions,
    outputVolume,
    toggleCamera,
    toggleCaptions,
    setOutputVolume
  } = useCallState();
  const turns = useLogStore((state) => state.turns);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setOutputVolume(newVolume);
    setApiVolume(newVolume);
  }

  const captionTurns = turns.slice(-2);

  return (
    <div className="call-view">
      <header className="call-header">
        <div className="persona-name">{personaName}</div>
        <div className="header-controls">
          <button
            className={cn('icon-button', { active: showCaptions })}
            aria-label="Toggle closed captions"
            onClick={toggleCaptions}
          >
            <span className="icon">closed_caption</span>
          </button>
          <div className="volume-control">
             <span className="icon">volume_up</span>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={outputVolume}
              onChange={handleVolumeChange}
              aria-label="Adjust volume"
            />
          </div>
          <button
            className="icon-button"
            aria-label="Settings"
            onClick={toggleSidebar}
          >
            <span className="icon">tune</span>
          </button>
        </div>
      </header>

      <main className="orb-container">
        <Orb volume={volume} />
        <AudioVisualizer volume={volume} />
      </main>

      {showCaptions && (
        <div className="captions-overlay" aria-live="polite">
          {captionTurns.map((turn, index) => (
            <div key={index} className={`caption-turn caption-turn-${turn.role}`}>
              <span className="caption-speaker">
                {turn.role === 'user' ? 'You' : personaName}:
              </span>
              <span className="caption-text">{turn.text}</span>
            </div>
          ))}
        </div>
      )}

      <footer className="call-controls">
        <button
          className={cn('call-button', { active: isCameraOn })}
          aria-label={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          onClick={toggleCamera}
        >
          <span className="icon">{isCameraOn ? 'videocam' : 'videocam_off'}</span>
        </button>
        <button
          className={cn('call-button', { active: isMuted })}
          aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          onClick={toggleMute}
        >
          <span className="icon">{isMuted ? 'mic_off' : 'mic'}</span>
        </button>
        <button className="call-button" aria-label="More options">
          <span className="icon">more_horiz</span>
        </button>
        <button
          className="call-button end-call"
          aria-label="End call"
          onClick={disconnect}
        >
          <span className="icon">close</span>
        </button>
      </footer>
    </div>
  );
}