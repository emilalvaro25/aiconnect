/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface WelcomeScreenProps {
  onSuggestionClick: (prompt: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    { text: 'Create image', icon: 'image', iconClass: 'create-image' },
    { text: 'Summarize text', icon: 'description', iconClass: 'summarize-text' },
    { text: 'Help me write', icon: 'edit', iconClass: 'help-me-write' },
    { text: 'More', icon: null, iconClass: '' },
  ];

  return (
    <div className="welcome-screen">
      <h2>What can I help with?</h2>
      <div className="suggestion-buttons">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.text}
            className="suggestion-button"
            onClick={() => onSuggestionClick(suggestion.text)}
          >
            {suggestion.icon && <span className={`icon ${suggestion.iconClass}`}>{suggestion.icon}</span>}
            <span>{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
