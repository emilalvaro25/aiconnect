/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useUI, useLogStore } from '@/lib/state';

export default function Header() {
  const { toggleSidebar } = useUI();
  const { clearTurns } = useLogStore();

  return (
    <header>
      <div className="header-left">
        <button
          className="menu-button"
          onClick={toggleSidebar}
          aria-label="Open settings"
        >
          <span className="icon">menu</span>
        </button>
        <h1>Kithai AI</h1>
      </div>
      <div className="header-right">
        <button
          className="history-button"
          onClick={clearTurns}
          aria-label="New chat"
        >
          <span className="icon">history</span>
        </button>
      </div>
    </header>
  );
}
