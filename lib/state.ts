/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand';
import { DEFAULT_LIVE_API_MODEL, DEFAULT_VOICE } from './constants';
import { FunctionDeclaration, FunctionResponseScheduling } from '@google/genai';

/**
 * Settings
 */
export const useSettings = create<{
  systemPrompt: string;
  model: string;
  voice: string;
  personaName: string;
  setSystemPrompt: (prompt: string) => void;
  setModel: (model: string) => void;
  setVoice: (voice: string) => void;
  setPersonaName: (name: string) => void;
}>(set => ({
  systemPrompt: `You are a helpful and friendly AI assistant. Be conversational and concise.`,
  model: DEFAULT_LIVE_API_MODEL,
  voice: DEFAULT_VOICE,
  personaName: 'Beaterice',
  setSystemPrompt: prompt => set({ systemPrompt: prompt }),
  setModel: model => set({ model }),
  setVoice: voice => set({ voice }),
  setPersonaName: name => set({ personaName: name }),
}));

/**
 * UI
 */
export const useUI = create<{
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}>(set => ({
  isSidebarOpen: false, // Default to closed on mobile
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

/**
 * Call State
 */
export const useCallState = create<{
  isMuted: boolean;
  isCameraOn: boolean;
  showCaptions: boolean;
  outputVolume: number;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleCaptions: () => void;
  setOutputVolume: (volume: number) => void;
}>(set => ({
  isMuted: false,
  isCameraOn: false,
  showCaptions: false,
  outputVolume: 1,
  toggleMute: () => set(state => ({ isMuted: !state.isMuted })),
  toggleCamera: () => set(state => ({ isCameraOn: !state.isCameraOn })),
  toggleCaptions: () => set(state => ({ showCaptions: !state.showCaptions })),
  setOutputVolume: volume => set({ outputVolume: volume }),
}));


/**
 * Logs
 */
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ConversationTurn {
  timestamp: Date;
  role: 'user' | 'agent' | 'system';
  text: string;
  isFinal: boolean;
  groundingChunks?: GroundingChunk[];
  imageUrl?: string;
}

// FIX: Define and export the FunctionCall interface.
export interface FunctionCall extends FunctionDeclaration {
  isEnabled: boolean;
  scheduling: FunctionResponseScheduling;
}

export const useLogStore = create<{
  turns: ConversationTurn[];
  isAgentTyping: boolean;
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) => void;
  updateLastTurn: (update: Partial<ConversationTurn>) => void;
  clearTurns: () => void;
  setAgentTyping: (isTyping: boolean) => void;
}>((set, get) => ({
  turns: [],
  isAgentTyping: false,
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) =>
    set(state => ({
      turns: [...state.turns, { ...turn, timestamp: new Date() }],
    })),
  updateLastTurn: (update: Partial<Omit<ConversationTurn, 'timestamp'>>) => {
    set(state => {
      if (state.turns.length === 0) {
        // If there are no turns, create a new one
        return {
          turns: [{
            role: 'agent',
            text: '',
            isFinal: false,
            timestamp: new Date(),
            ...update
          }]
        };
      }
      const newTurns = [...state.turns];
      const lastTurn = { ...newTurns[newTurns.length - 1], ...update };
      newTurns[newTurns.length - 1] = lastTurn;
      return { turns: newTurns };
    });
  },
  clearTurns: () => set({ turns: [] }),
  setAgentTyping: (isTyping: boolean) => set({ isAgentTyping: isTyping }),
}));
