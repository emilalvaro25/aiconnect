/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLogStore } from '../lib/state';
import WelcomeScreen from './demo/welcome-screen/WelcomeScreen';
import StreamingConsole from './demo/streaming-console/StreamingConsole';
import ControlTray from './console/control-tray/ControlTray';
import Header from './Header';
import Sidebar from './Sidebar';

export default function ChatView() {
  const turns = useLogStore((state) => state.turns);
  const { addTurn } = useLogStore();

  const handleSuggestionClick = (prompt: string) => {
    addTurn({ role: 'user', text: prompt, isFinal: true });
    // In a real app, you would also trigger the AI response here.
  };

  return (
    <>
      <Header />
      <Sidebar />
      <main className="main-app-area">
        {turns.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <StreamingConsole />
        )}
      </main>
      <ControlTray />
    </>
  );
}
