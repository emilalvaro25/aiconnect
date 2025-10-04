/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cn from 'classnames';
import React, { useState } from 'react';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';
import { useLogStore } from '@/lib/state';

export default function ControlTray() {
  const { connected, connect, disconnect, sendTextMessage } = useLiveAPIContext();
  const { addTurn } = useLogStore();
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleMicClick = () => {
    if (connected) {
      disconnect();
    } else {
      connect();
    }
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      addTurn({ role: 'user', text: inputValue, isFinal: true });
      sendTextMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        addTurn({
          role: 'user',
          text: `Attached image: ${file.name}`,
          imageUrl: dataUrl,
          isFinal: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="control-tray">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
        aria-hidden="true"
      />
      <div className="input-wrapper">
        <button
          className="icon-button"
          aria-label="Attach image"
          onClick={handleAttachClick}
        >
          <span className="icon">image</span>
        </button>
        <input
          type="text"
          placeholder="Ask anything"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={connected}
        />
        <button
          className="icon-button"
          aria-label="Send message"
          onClick={handleSend}
          disabled={!inputValue.trim() || connected}
        >
          <span className="icon">send</span>
        </button>
        <button
          className={cn('icon-button', { active: connected })}
          onClick={handleMicClick}
          aria-label={connected ? 'Stop listening' : 'Start listening'}
        >
          <span className="icon">mic</span>
        </button>
      </div>
    </section>
  );
}