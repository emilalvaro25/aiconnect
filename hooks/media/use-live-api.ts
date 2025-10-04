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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GenAILiveClient } from '../../lib/genai-live-client';
import { LiveConnectConfig, GoogleGenAI, Chat } from '@google/genai';
import { AudioStreamer } from '../../lib/audio-streamer';
import { audioContext } from '../../lib/utils';
import VolMeterWorket from '../../lib/worklets/vol-meter';
import { useCallState, useLogStore, useSettings } from '@/lib/state';
import { AudioRecorder } from '@/lib/audio-recorder';

export type UseLiveApiResults = {
  client: GenAILiveClient;
  setConfig: (config: LiveConnectConfig) => void;
  config: LiveConnectConfig;

  connect: () => Promise<void>;
  disconnect: () => void;
  connected: boolean;

  volume: number;
  sendTextMessage: (message: string) => Promise<void>;
  toggleMute: () => void;
  setOutputVolume: (level: number) => void;
};

export function useLiveApi({
  apiKey,
}: {
  apiKey: string;
}): UseLiveApiResults {
  const { model } = useSettings();
  const { isMuted, toggleMute: toggleMuteState } = useCallState();
  const client = useMemo(() => new GenAILiveClient(apiKey, model), [apiKey, model]);

  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const genAiRef = useRef<GoogleGenAI | null>(null);

  // FIX: Renamed state setter to avoid conflict with setOutputVolume function below.
  const [outputVolume, setMeasuredOutputVolume] = useState(0);
  const [inputVolume, setInputVolume] = useState(0);
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<LiveConnectConfig>({});

  // Setup for text chat
  useEffect(() => {
    genAiRef.current = new GoogleGenAI({ apiKey });
  }, [apiKey]);

  // register audio for streaming server -> speakers
  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: 'audio-out', sampleRate: 24000 }).then((audioCtx: AudioContext) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet<any>('vumeter-out', VolMeterWorket, (ev: any) => {
            // FIX: Use renamed state setter.
            setMeasuredOutputVolume(ev.data.volume);
          })
          .then(() => {
            // Successfully added worklet
          })
          .catch(err => {
            console.error('Error adding worklet:', err);
          });
      });
    }
  }, [audioStreamerRef]);

  useEffect(() => {
    const onOpen = () => {
      setConnected(true);
    };

    const onClose = () => {
      setConnected(false);
    };

    const stopAudioStreamer = () => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.stop();
      }
    };

    const onAudio = (data: ArrayBuffer) => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.addPCM16(new Uint8Array(data));
      }
    };

    // Bind event listeners
    client.on('open', onOpen);
    client.on('close', onClose);
    client.on('interrupted', stopAudioStreamer);
    client.on('audio', onAudio);

    return () => {
      // Clean up event listeners
      client.off('open', onOpen);
      client.off('close', onClose);
      client.off('interrupted', stopAudioStreamer);
      client.off('audio', onAudio);
    };
  }, [client]);

  const connect = useCallback(async () => {
    if (!config) {
      throw new Error('config has not been set');
    }
    client.disconnect();
    const connectSuccess = await client.connect(config);
    if (!connectSuccess) return;

    try {
      audioRecorderRef.current = new AudioRecorder();
      await audioRecorderRef.current.start();
      audioRecorderRef.current.on('data', (data: string) => {
          client.sendRealtimeInput([{ mimeType: 'audio/pcm;rate=16000', data }]);
      });
      audioRecorderRef.current.on('volume', (vol: number) => {
          setInputVolume(vol);
      });
      audioRecorderRef.current.toggleMute(isMuted);
    } catch (error) {
        console.error("Failed to start microphone:", error);
        client.disconnect();
        // You might want to emit an error event here to show in the UI
        client.emitter.emit('error', new ErrorEvent('error', { message: 'Microphone permission denied. Please allow microphone access in your browser settings.' }));
    }

  }, [client, config, isMuted]);

  const disconnect = useCallback(() => {
    client.disconnect();
    setConnected(false);
    audioRecorderRef.current?.stop();
    audioRecorderRef.current = null;
    setInputVolume(0);
    // FIX: Use renamed state setter.
    setMeasuredOutputVolume(0);
  }, [client]);

  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    toggleMuteState();
    audioRecorderRef.current?.toggleMute(newMutedState);
  }, [isMuted, toggleMuteState]);

  const setOutputVolume = useCallback((level: number) => {
      audioStreamerRef.current?.setVolume(level);
  }, []);

  const sendTextMessage = useCallback(async (message: string) => {
    const { addTurn, updateLastTurn, setAgentTyping } = useLogStore.getState();
    if (!genAiRef.current) return;

    if (!chatRef.current) {
        const { systemPrompt } = useSettings.getState();
        const chatInit: { model: string, config?: { systemInstruction: string } } = {
          model: 'gemini-2.5-flash',
        };
        if (systemPrompt) {
          chatInit.config = {
            systemInstruction: systemPrompt,
          };
        }
        chatRef.current = genAiRef.current.chats.create(chatInit);
    }

    setAgentTyping(true);
    // Add a placeholder for the agent's response
    addTurn({ role: 'agent', text: '', isFinal: false });

    try {
        const stream = await chatRef.current.sendMessageStream({ message });
        let responseText = '';
        for await (const chunk of stream) {
            responseText += chunk.text;
            updateLastTurn({ text: responseText });
        }
        updateLastTurn({ isFinal: true });
    } catch (error) {
        console.error("Text chat failed:", error);
        updateLastTurn({ text: "Sorry, I couldn't respond.", isFinal: true });
    } finally {
        setAgentTyping(false);
    }
  }, []);

  return {
    client,
    config,
    setConfig,
    connect,
    connected,
    disconnect,
    volume: Math.max(outputVolume, inputVolume),
    sendTextMessage,
    toggleMute,
    setOutputVolume,
  };
}