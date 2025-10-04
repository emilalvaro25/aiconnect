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

import React from 'react';
import ErrorScreen from './components/demo/ErrorScreen';
import { LiveAPIProvider, useLiveAPIContext } from './contexts/LiveAPIContext';
import CallView from './components/CallView';
import ChatView from './components/ChatView';

const API_KEY = process.env.API_KEY as string;
if (typeof API_KEY !== 'string') {
  throw new Error('Missing required environment variable: GEMINI_API_KEY');
}

/**
 * A content component that switches between Call and Chat views.
 */
function AppContent() {
  const { connected } = useLiveAPIContext();

  return (
    <>
      <ErrorScreen />
      {connected ? <CallView /> : <ChatView />}
    </>
  );
}

/**
 * Main application component that provides a streaming interface for Live API.
 */
function App() {
  return (
    <div className="App">
      <LiveAPIProvider apiKey={API_KEY}>
        <AppContent />
      </LiveAPIProvider>
    </div>
  );
}

export default App;
