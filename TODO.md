# Kithai AI - TODO

## 1. Home Screen

*   [x] Top bar with menu (left), brand “Kithai AI” (center), profile/avatar (right).
*   [x] Title: “What can I help with?”
*   [x] Four large pill buttons:
    *   Create image
    *   Summarize text
    *   Help me write
    *   More
*   [x] Bottom input row:
    *   Text field “Ask anything”
    *   Green mic button on right (tap → open Voice UI)

## 2. Chat Screen

*   [x] Scrollable chat history:
    *   User messages right-aligned, styled green.
    *   Model messages left-aligned, styled dark.
*   [x] Input row for sending messages.
*   [x] Streaming responses from `gemini-2.5-flash`.
*   [x] Handle pending “…” typing indicator.

## 3. Voice Screen (“Beaterice”)

*   [x] Fullscreen modal overlay.
*   [x] Top row:
    *   [x] CC toggle button
    *   [x] Volume slider
    *   [x] Settings gear
*   [x] Large central element:
    *   [x] Moon image / circular gradient placeholder
*   [x] Audio visualizer bar just under the moon.
*   [x] Bottom control row:
    *   [x] Video button
    *   [x] Mic button (toggle mute/unmute)
    *   [x] “More” menu
    *   [x] Close button
*   [x] Captions area (conditionally visible when CC is on).
*   [ ] Hidden `<audio>` element for Gemini’s speech output. (Using WebAudio API instead)

## 4. Voice Flow (Gemini Live)

*   [x] On mic tap:
    *   [x] Request mic permission.
    *   [ ] Create `RTCPeerConnection`. (Using GenAI SDK's WebSocket flow)
    *   [x] Add mic track.
    *   [ ] Create SDP offer. (N/A)
    *   [ ] Send offer → backend `/api/live/sdp`. (N/A)
    *   [ ] Backend forwards to Gemini Live and returns SDP answer. (N/A)
    *   [ ] Set remote description with answer. (N/A)
*   [x] On `ontrack`: play model’s audio via audio element. (Using WebAudio API)
*   [x] Visualizer:
    *   [x] Attach WebAudio analyser to mic stream.
    *   [x] Render frequency bars in canvas via `requestAnimationFrame`.
*   [x] Controls:
    *   [x] Mic button toggles track `enabled`.
    *   [x] Volume slider adjusts audio output.
    *   [x] CC toggle switches captions on/off (if transcripts enabled).
*   [x] On close:
    *   [x] Stop tracks, close peer connection, stop visualizer loop.

## 5. Backend Endpoints

*   [ ] `/api/chat`: (Handled on client-side)
    *   [x] Accept array of messages.
    *   [x] Call `gemini-2.5-flash` `generateContent`.
    *   [x] Return candidate text.
*   [ ] `/api/live/sdp`: (N/A)
    *   [ ] Accept SDP offer.
    *   [ ] Forward to Gemini Live SDP endpoint.
    *   [ ] Return answer SDP.
*   [ ] Ensure error codes and messages propagate clearly.

## 6. UX & Edge Cases

*   [ ] Friendly pre-prompt before mic permission request.
*   [x] Handle mic denied gracefully (instructions + retry).
*   [ ] Handle reconnect if RTC negotiation fails.
*   [ ] Auto-reconnect after network blip.
*   [ ] Push-to-talk option (if preferred).

## 7. Performance & Cleanup

*   [x] Only initialize audio/RTC when modal opens.
*   [x] Release audio context and mic stream when modal closes.
*   [x] Ensure no zombie connections on reopen.

## 8. Accessibility

*   [x] Aria labels on all buttons.
*   [ ] Keyboard navigation for pills, input, mic.
*   [x] High-contrast dark mode text.
*   [x] Captions output in live region for screen readers.

## 9. Testing / QA

*   [x] Verify text chat round trips.
*   [x] Verify first mic open flow.
*   [x] Verify mute/unmute works.
*   [x] Confirm visualizer animates and stops correctly.
*   [x] Volume slider affects output audio.
*   [x] Captions toggle shows/hides transcript.
*   [x] Close/reopen voice modal leaves no dangling mic access.
