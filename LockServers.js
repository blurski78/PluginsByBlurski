// ============================================
// 🔒 Server Lock Plugin - With Settings Panel
// ============================================

(function() {
    'use strict';

    // === PLUGIN CONFIGURATION ===
    const PLUGIN = {
        name: 'ServerLock',
        displayName: '🔒 Server Lock',
        description: 'Lock servers with a numeric passcode',
        version: '1.0.0',
        author: 'Blurski'
    };

    // === STORAGE ===
    function getPassword() {
        return localStorage.getItem('serverlock_password') || '1234';
    }

    function setPassword(pass) {
        localStorage.setItem('serverlock_password', pass);
        console.log('[ServerLock] Password saved:', pass);
        updatePluginStatus();
    }

    function isServerLocked(serverId) {
        return localStorage.getItem(`serverlock_locked_${serverId}`) === 'true';
    }

    function setServerLocked(serverId, locked) {
        localStorage.setItem(`serverlock_locked_${serverId}`, locked ? 'true' : 'false');
        updatePluginStatus();
    }

    function getServerName(serverElement) {
        const nameEl = serverElement.querySelector('[class*="name"]') || 
                       serverElement.querySelector('[class*="text"]') ||
                       serverElement.querySelector('[aria-label]');
        if (nameEl) {
            return nameEl.textContent || nameEl.getAttribute('aria-label') || 'Unknown Server';
        }
        return 'Unknown Server';
    }

    function getServerId(serverElement) {
        const idAttr = serverElement.getAttribute('data-server-id') ||
                       serverElement.getAttribute('data-id') ||
                       serverElement.getAttribute('aria-controls');
        if (idAttr) return idAttr;

        const link = serverElement.querySelector('a');
        if (link && link.href) {
            const match = link.href.match(/\/channels\/(\d+)/);
            if (match) return match[1];
        }

        return 'server_' + Math.random().toString(36).substr(2, 9);
    }

    // === PLUGIN STATUS INDICATOR ===
    function updatePluginStatus() {
        const elements = findServerElements();
        let locked = 0;
        elements.forEach(el => {
            const id = getServerId(el);
            if (isServerLocked(id)) {
                locked++;
                el.style.opacity = '0.6';
                el.style.filter = 'grayscale(0.5)';
            } else {
                el.style.opacity = '1';
                el.style.filter = 'none';
            }
        });
        
        // Update badge if it exists
        const badge = document.getElementById('serverlock-badge');
        if (badge) {
            badge.textContent = locked > 0 ? `🔒 ${locked}` : '🔓';
        }
    }

    // === SETTINGS PANEL (Gear Icon) ===
    function createSettingsPanel() {
        // Remove existing panel if any
        const existing = document.getElementById('serverlock-settings-panel');
        if (existing) existing.remove();

        const currentPass = getPassword();

        const panel = document.createElement('div');
        panel.id = 'serverlock-settings-panel';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1e1e2e;
            border-radius: 16px;
            padding: 0;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 25px 80px rgba(0,0,0,0.9);
            border: 1px solid #313244;
            z-index: 9999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: serverlockFadeIn 0.3s ease;
        `;

        panel.innerHTML = `
            <style>
                @keyframes serverlockFadeIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
                @keyframes serverlockSlideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                #serverlock-settings-panel input:focus {
                    border-color: #89b4fa !important;
                    box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.3) !important;
                }
                #serverlock-settings-panel button:hover {
                    transform: scale(1.02);
                    transition: transform 0.2s;
                }
                #serverlock-settings-panel button:active {
                    transform: scale(0.98);
                }
            </style>
            <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 24px 16px 24px;
                border-bottom: 1px solid #313244;
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 28px;">⚙️</span>
                    <div>
                        <h2 style="color: #cdd6f4; font-size: 20px; margin: 0; font-weight: 600;">
                            ${PLUGIN.displayName}
                        </h2>
                        <p style="color: #6c7086; font-size: 12px; margin: 2px 0 0 0;">
                            v${PLUGIN.version} by ${PLUGIN.author}
                        </p>
                    </div>
                </div>
                <button id="serverlock-close-settings" style="
                    background: none;
                    border: none;
                    color: #6c7086;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 8px;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#313244'" onmouseout="this.style.background='none'">✕</button>
            </div>

            <div style="padding: 24px;">
                <!-- Password Section -->
                <div style="margin-bottom: 24px;">
                    <label style="color: #a6adc8; font-size: 14px; font-weight: 500; display: block; margin-bottom: 8px;">
                        🔑 Set Passcode
                    </label>
                    <div style="display: flex; gap: 10px;">
                        <input type="password" id="serverlock-new-pass" 
                            maxlength="6" inputmode="numeric" pattern="[0-9]*"
                            placeholder="Enter numbers only"
                            style="
                                flex: 1;
                                padding: 12px 16px;
                                font-size: 18px;
                                text-align: center;
                                background: #313244;
                                border: 2px solid #45475a;
                                border-radius: 10px;
                                color: #cdd6f4;
                                letter-spacing: 6px;
                                font-weight: bold;
                                outline: none;
                                transition: border-color 0.3s, box-shadow 0.3s;
                            "
                            autofocus
                        >
                        <button id="serverlock-save-pass" style="
                            padding: 12px 20px;
                            background: #a6e3a1;
                            border: none;
                            border-radius: 10px;
                            color: #1e1e2e;
                            font-weight: bold;
                            font-size: 14px;
                            cursor: pointer;
                            transition: transform 0.2s, background 0.2s;
                            white-space: nowrap;
                        ">💾 Save</button>
                    </div>
                    <div id="serverlock-settings-error" style="color: #f38ba8; font-size: 13px; margin-top: 8px; min-height: 20px;"></div>
                    <div style="color: #6c7086; font-size: 12px; margin-top: 4px;">
                        Current: <span style="color: #89b4fa; font-family: monospace;">${'•'.repeat(currentPass.length)}</span>
                        <span style="color: #6c7086; margin-left: 8px;">(min 4 numbers)</span>
                    </div>
                </div>

                <!-- Server Actions -->
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
                    <button id="serverlock-lock-all" style="
                        flex: 1;
                        padding: 10px 16px;
                        background: #f38ba8;
                        border: none;
                        border-radius: 10px;
                        color: #1e1e2e;
                        font-weight: 600;
                        font-size: 13px;
                        cursor: pointer;
                        transition: transform 0.2s;
                        min-width: 80px;
                    ">🔒 Lock All</button>
                    <button id="serverlock-unlock-all" style="
                        flex: 1;
                        padding: 10px 16px;
                        background: #a6e3a1;
                        border: none;
                        border-radius: 10px;
                        color: #1e1e2e;
                        font-weight: 600;
                        font-size: 13px;
                        cursor: pointer;
                        transition: transform 0.2s;
                        min-width: 80px;
                    ">🔓 Unlock All</button>
                    <button id="serverlock-reset-all" style="
                        flex: 1;
                        padding: 10px 16px;
                        background: #fab387;
                        border: none;
                        border-radius: 10px;
                        color: #1e1e2e;
                        font-weight: 600;
                        font-size: 13px;
                        cursor: pointer;
                        transition: transform 0.2s;
                        min-width: 80px;
                    ">🔄 Reset</button>
                </div>

                <!-- Status -->
                <div style="
                    background: #313244;
                    border-radius: 10px;
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <span style="color: #a6adc8; font-size: 13px;">📊 Status</span>
                    <span id="serverlock-status-text" style="color: #cdd6f4; font-size: 13px; font-weight: 500;">
                        Loading...
                    </span>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // === EVENTS ===

        // Close
        document.getElementById('serverlock-close-settings').addEventListener('click', function() {
            panel.remove();
        });

        // Click outside to close
        panel.addEventListener('click', function(e) {
            if (e.target === panel) {
                panel.remove();
            }
        });

        // Save password
        document.getElementById('serverlock-save-pass').addEventListener('click', function() {
            const input = document.getElementById('serverlock-new-pass');
            const error = document.getElementById('serverlock-settings-error');
            const pass = input.value.trim();

            if (pass === '') {
                error.textContent = '❌ Please enter a passcode';
                return;
            }

            if (!/^\d+$/.test(pass)) {
                error.textContent = '❌ Numbers only!';
                input.value = '';
                return;
            }

            if (pass.length < 4) {
                error.textContent = '❌ Minimum 4 numbers';
                return;
            }

            setPassword(pass);
            error.textContent = '✅ Passcode saved!';
            error.style.color = '#a6e3a1';
            input.value = '';
            updateStatusText();

            setTimeout(() => {
                error.textContent = '';
                error.style.color = '#f38ba8';
            }, 2000);
        });

        // Enter key on password input
        document.getElementById('serverlock-new-pass').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('serverlock-save-pass').click();
            }
            if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
                e.preventDefault();
            }
        });

        // Only allow numbers
        document.getElementById('serverlock-new-pass').addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });

        // Lock All
        document.getElementById('serverlock-lock-all').addEventListener('click', function() {
            const elements = findServerElements();
            elements.forEach(el => {
                const id = getServerId(el);
                setServerLocked(id, true);
                el.style.opacity = '0.6';
                el.style.filter = 'grayscale(0.5)';
            });
            updateStatusText();
            updatePluginStatus();
        });

        // Unlock All
        document.getElementById('serverlock-unlock-all').addEventListener('click', function() {
            const elements = findServerElements();
            elements.forEach(el => {
                const id = getServerId(el);
                setServerLocked(id, false);
                el.style.opacity = '1';
                el.style.filter = 'none';
            });
            updateStatusText();
            updatePluginStatus();
        });

        // Reset (unlock all + reset password to default)
        document.getElementById('serverlock-reset-all').addEventListener('click', function() {
            if (confirm('⚠️ Reset all locks and set password to "1234"?')) {
                const elements = findServerElements();
                elements.forEach(el => {
                    const id = getServerId(el);
                    setServerLocked(id, false);
                    el.style.opacity = '1';
                    el.style.filter = 'none';
                });
                setPassword('1234');
                updateStatusText();
                updatePluginStatus();
                const error = document.getElementById('serverlock-settings-error');
                error.textContent = '✅ Reset complete! Password: 1234';
                error.style.color = '#a6e3a1';
                setTimeout(() => {
                    error.textContent = '';
                    error.style.color = '#f38ba8';
                }, 3000);
            }
        });

        // Update status text
        function updateStatusText() {
            const elements = findServerElements();
            let locked = 0;
            elements.forEach(el => {
                const id = getServerId(el);
                if (isServerLocked(id)) locked++;
            });
            const status = document.getElementById('serverlock-status-text');
            if (status) {
                status.textContent = `${locked} / ${elements.length} servers locked`;
            }
        }

        updateStatusText();

        // Focus input
        setTimeout(() => {
            const input = document.getElementById('serverlock-new-pass');
            if (input) input.focus();
        }, 200);
    }

    // === FIND SERVER ELEMENTS ===
    function findServerElements() {
        return document.querySelectorAll([
            '[class*="server"]:not([class*="server"] *)',
            '[class*="guild"]:not([class*="guild"] *)',
            '[class*="pill"]',
            '[role="button"][class*="listItem"]'
        ].join(','));
    }

    function isServerElement(el) {
        return el && (
            el.getAttribute('role') === 'button' ||
            el.closest('[role="button"]') ||
            el.querySelector('[class*="pill"]') ||
            el.getAttribute('aria-label')?.includes('guild') ||
            el.getAttribute('aria-label')?.includes('server')
        );
    }

    // === CREATE SETTINGS BUTTON (Gear Icon) ===
    function createSettingsButton() {
        // Remove existing if any
        const existing = document.getElementById('serverlock-settings-btn');
        if (existing) existing.remove();

        const btn = document.createElement('button');
        btn.id = 'serverlock-settings-btn';
        btn.innerHTML = '⚙️';
        btn.title = 'Server Lock Settings';
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #1e1e2e;
            border: 2px solid #313244;
            color: #cdd6f4;
            font-size: 22px;
            cursor: pointer;
            z-index: 999998;
            box-shadow: 0 4px 20px rgba(0,0,0,0.6);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        btn.onmouseover = function() {
            this.style.transform = 'scale(1.1)';
            this.style.borderColor = '#89b4fa';
            this.style.boxShadow = '0 4px 30px rgba(137, 180, 250, 0.3)';
        };
        btn.onmouseout = function() {
            this.style.transform = 'scale(1)';
            this.style.borderColor = '#313244';
            this.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
        };
        btn.onclick = function() {
            createSettingsPanel();
        };

        // Add badge
        const badge = document.createElement('span');
        badge.id = 'serverlock-badge';
        badge.style.cssText = `
            position: absolute;
            top: -6px;
            right: -6px;
            background: #f38ba8;
            color: #1e1e2e;
            font-size: 9px;
            font-weight: bold;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #1e1e2e;
        `;
        badge.textContent = '🔓';
        btn.appendChild(badge);

        document.body.appendChild(btn);
        updatePluginStatus();
    }

    // === PASSCODE PROMPT ===
    function showPasscodePrompt(serverElement) {
        const serverId = getServerId(serverElement);
        const serverName = getServerName(serverElement);

        if (!isServerLocked(serverId)) {
            setServerLocked(serverId, true);
            serverElement.style.opacity = '0.6';
            serverElement.style.filter = 'grayscale(0.5)';
            updatePluginStatus();
            return;
        }

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999999;
            backdrop-filter: blur(8px);
            animation: serverlockFadeIn 0.3s ease;
        `;

        overlay.innerHTML = `
            <div style="
                background: #1e1e2e;
                border-radius: 16px;
                padding: 32px;
                max-width: 360px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.8);
                border: 1px solid #313244;
                animation: serverlockSlideDown 0.3s ease;
            ">
                <div style="font-size: 48px; margin-bottom: 12px;">🔒</div>
                <h2 style="color: #cdd6f4; font-size: 22px; margin: 0;">Server Locked</h2>
                <p style="color: #a6adc8; font-size: 14px; margin-top: 8px;">
                    Enter passcode to access<br>
                    <strong style="color: #89b4fa;">${serverName}</strong>
                </p>
                <div style="margin: 20px 0;">
                    <input type="password" id="serverlock-unlock-input" 
                        maxlength="6" inputmode="numeric" pattern="[0-9]*"
                        placeholder="Enter numbers"
                        style="
                            width: 100%;
                            padding: 14px;
                            font-size: 24px;
                            text-align: center;
                            background: #313244;
                            border: 2px solid #45475a;
                            border-radius: 12px;
                            color: #cdd6f4;
                            letter-spacing: 8px;
                            font-weight: bold;
                            outline: none;
                        "
                        autofocus
                    >
                    <div id="serverlock-unlock-error" style="color: #f38ba8; font-size: 13px; margin-top: 8px; min-height: 20px;"></div>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button id="serverlock-unlock-btn" style="
                        flex: 1;
                        padding: 14px;
                        background: #89b4fa;
                        border: none;
                        border-radius: 12px;
                        color: #1e1e2e;
                        font-weight: bold;
                        font-size: 16px;
                        cursor: pointer;
                    ">Unlock</button>
                    <button id="serverlock-cancel-unlock" style="
                        padding: 14px 20px;
                        background: transparent;
                        border: 1px solid #45475a;
                        border-radius: 12px;
                        color: #a6adc8;
                        font-weight: bold;
                        font-size: 16px;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const input = document.getElementById('serverlock-unlock-input');
        const error = document.getElementById('serverlock-unlock-error');
        const unlockBtn = document.getElementById('serverlock-unlock-btn');
        const cancelBtn = document.getElementById('serverlock-cancel-unlock');

        function attemptUnlock() {
            const pass = input.value.trim();
            const currentPass = getPassword();

            if (pass === '') {
                error.textContent = '❌ Please enter a passcode';
                return;
            }

            if (!/^\d+$/.test(pass)) {
                error.textContent = '❌ Numbers only!';
                input.value = '';
                return;
            }

            if (pass === currentPass) {
                setServerLocked(serverId, false);
                serverElement.style.opacity = '1';
                serverElement.style.filter = 'none';
                overlay.remove();
                updatePluginStatus();
            } else {
                error.textContent = '❌ Incorrect passcode';
                input.value = '';
                input.focus();
            }
        }

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') attemptUnlock();
            if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
                e.preventDefault();
            }
        });

        input.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });

        unlockBtn.addEventListener('click', attemptUnlock);
        cancelBtn.addEventListener('click', function() {
            overlay.remove();
        });

        setTimeout(() => input.focus(), 100);
    }

    // === INIT ===
    let observer = null;
    let pressTimer = null;

    function init() {
        console.log(`[${PLUGIN.name}] 🔒 Initializing v${PLUGIN.version}...`);

        // Create settings button
        createSettingsButton();

        // Apply locks to existing servers
        const elements = findServerElements();
        elements.forEach(el => {
            const id = getServerId(el);
            if (isServerLocked(id)) {
                el.style.opacity = '0.6';
                el.style.filter = 'grayscale(0.5)';
            }
        });

        // Long-press detection
        document.addEventListener('pointerdown', function(e) {
            const target = e.target.closest('[role="button"]') || 
                          e.target.closest('[class*="server"]') ||
                          e.target.closest('[class*="guild"]') ||
                          e.target.closest('[class*="listItem"]');
            
            if (!target) return;
            if (!isServerElement(target)) return;

            const isServer = target.getAttribute('aria-label')?.includes('guild') ||
                           target.getAttribute('aria-label')?.includes('server') ||
                           target.closest('[class*="guilds"]') ||
                           target.closest('[class*="servers"]') ||
                           target.closest('[class*="list"]');

            if (!isServer) return;

            pressTimer = setTimeout(() => {
                e.preventDefault();
                const serverEl = target.closest('[role="button"]') || target;
                showPasscodePrompt(serverEl);
            }, 600);
        });

        document.addEventListener('pointerup', function() {
            clearTimeout(pressTimer);
            pressTimer = null;
        });

        document.addEventListener('pointermove', function() {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        });

        // Watch for DOM changes
        observer = new MutationObserver(() => {
            const elements = findServerElements();
            elements.forEach(el => {
                const id = getServerId(el);
                if (isServerLocked(id)) {
                    el.style.opacity = '0.6';
                    el.style.filter = 'grayscale(0.5)';
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log(`[${PLUGIN.name}] ✅ Initialized!`);
        console.log(`[${PLUGIN.name}] 🔑 Current passcode: ${getPassword()}`);
        console.log(`[${PLUGIN.name}] ⚙️ Click the gear icon (bottom-right) for settings`);
        console.log(`[${PLUGIN.name}] 📌 Long-press a server to lock/unlock it`);
    }

    // === START ===
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 2000);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(init, 2000);
        });
    }

    // === COMMANDS ===
    window.ServerLock = {
        plugin: PLUGIN,
        getPassword: getPassword,
        setPassword: setPassword,
        openSettings: createSettingsPanel,
        lockAll: () => {
            const elements = findServerElements();
            elements.forEach(el => {
                const id = getServerId(el);
                setServerLocked(id, true);
                el.style.opacity = '0.6';
                el.style.filter = 'grayscale(0.5)';
            });
            updatePluginStatus();
            console.log(`[ServerLock] 🔒 Locked ${elements.length} servers`);
        },
        unlockAll: () => {
            const elements = findServerElements();
            elements.forEach(el => {
                const id = getServerId(el);
                setServerLocked(id, false);
                el.style.opacity = '1';
                el.style.filter = 'none';
            });
            updatePluginStatus();
            console.log(`[ServerLock] 🔓 Unlocked ${elements.length} servers`);
        },
        status: () => {
            const elements = findServerElements();
            let locked = 0;
            elements.forEach(el => {
                const id = getServerId(el);
                if (isServerLocked(id)) locked++;
            });
            console.log(`[ServerLock] 📊 ${elements.length} servers, ${locked} locked`);
            console.log(`[ServerLock] 🔑 Password: ${getPassword()}`);
        }
    };

    console.log('[ServerLock] 📦 Loaded! Use ServerLock.status() for info');
})();
