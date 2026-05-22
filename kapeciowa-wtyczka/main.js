
(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('Kapeciowa Wtyczka V4 wymaga uruchomienia bez piaskownicy (unsandboxed)!');
    }

    let lastGamepadConnected = false;
    let lastNetworkStatus = navigator.onLine;
    let lastKeysPressed = {};
    let mouseClickedThisFrame = false;
    let rightMouseClickedThisFrame = false;
    let lastWindowFocused = document.hasFocus();
    let networkDataStorage = "Brak danych";
    let mouseX = 0;
    let mouseY = 0;

    let fps = 0;
    let lastFrameTime = performance.now();
    let frameCount = 0;
    function updateFPS() {
        let now = performance.now();
        frameCount++;
        if (now >= lastFrameTime + 1000) {
            fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
            frameCount = 0;
            lastFrameTime = now;
        }
        requestAnimationFrame(updateFPS);
    }
    requestAnimationFrame(updateFPS);

    window.addEventListener('keydown', (e) => { lastKeysPressed[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', (e) => { lastKeysPressed[e.key.toLowerCase()] = false; });
    window.addEventListener('mousedown', (e) => {
        if (e.button === 0) mouseClickedThisFrame = true;
        if (e.button === 2) rightMouseClickedThisFrame = true;
    });
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    window.addEventListener('contextmenu', (e) => {
        if (Scratch.vm.runtime.ioDevices.mouse) rightMouseClickedThisFrame = true;
    });

    class KapeciowaWtyczkaV4 {
        getInfo() {
            return {
                id: 'kapeciowawtyczka4',
                name: 'Kapeciowa Wtyczka v4',
                blocks: [
                    {
                        opcode: 'whenGamepadConnected',
                        blockType: Scratch.BlockType.HAT,
                        text: 'kiedy gamepad zostanie podłączony',
                        color: '#ffd700',
                        isEdgeActivated: true
                    },
                    {
                        opcode: 'whenInternetChanges',
                        blockType: Scratch.BlockType.HAT,
                        text: 'kiedy zmieni się stan internetu',
                        color: '#ffd700',
                        isEdgeActivated: true
                    },
                    {
                        opcode: 'whenAnyKeyIsPressed',
                        blockType: Scratch.BlockType.HAT,
                        text: 'kiedy wciśnięto dowolny klawisz',
                        color: '#ffd700',
                        isEdgeActivated: true
                    },
                    {
                        opcode: 'whenMouseClicked',
                        blockType: Scratch.BlockType.HAT,
                        text: 'kiedy kliknięto lewy przycisk myszy',
                        color: '#ffd700',
                        isEdgeActivated: true
                    },
                    {
                        opcode: 'whenRightMouseClicked',
                        blockType: Scratch.BlockType.HAT,
                        text: 'kiedy kliknięto prawy przycisk myszy',
                        color: '#ffd700',
                        isEdgeActivated: true
                    },
                    {
                        opcode: 'isGamepadConnected',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'czy gamepad jest podłączony?',
                        color: '#8a2be2'
                    },
                    {
                        opcode: 'getGamepadAxis',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'oś [AXIS] pada nr [NUM]',
                        color: '#8a2be2',
                        arguments: {
                            AXIS: { type: Scratch.ArgumentType.NUMBER, menu: 'axisMenu', defaultValue: '0' },
                            NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                        }
                    },
                    {
                        opcode: 'isGamepadButtonPressed',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'przycisk [BTN] wciśnięty na padzie [NUM]?',
                        color: '#8a2be2',
                        arguments: {
                            BTN: { type: Scratch.ArgumentType.NUMBER, menu: 'btnMenu', defaultValue: '0' },
                            NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                        }
                    },
                    {
                        opcode: 'isOnline',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'czy jest internet?',
                        color: '#008b8b'
                    },
                    {
                        opcode: 'fetchData',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'pobierz tekst z URL [URL]',
                        color: '#008b8b',
                        arguments: { URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://api.ipify.org' } }
                    },
                    {
                        opcode: 'sendDiscordWebhook',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'wyślij Webhook Discord [URL] treść: [TEXT]',
                        color: '#008b8b',
                        arguments: {
                            URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://discord.com/api/webhooks/...' },
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Siema! 🧦' }
                        }
                    },
                    {
                        opcode: 'toBase64',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'zakoduj [TEXT] do Base64',
                        color: '#2e8b57',
                        arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'kapcie' } }
                    },
                    {
                        opcode: 'fromBase64',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'odkoduj [BASE64] z Base64',
                        color: '#2e8b57',
                        arguments: { BASE64: { type: Scratch.ArgumentType.STRING, defaultValue: 'a2FwY2ll' } }
                    },
                    {
                        opcode: 'caesarCipher',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'szyfr Cezara: [TEXT] przesuń o [SHIFT] (ujemna odkodowuje)',
                        color: '#2e8b57',
                        arguments: {
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'SekretnyZapis123' },
                            SHIFT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 }
                        }
                    },
                    {
                        opcode: 'removeHash',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'usuń znak płotka z koloru [TEXT]',
                        color: '#ff1493',
                        arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: '#ff9900' } }
                    },
                    {
                        opcode: 'addHash',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'dodaj znak płotka do koloru [TEXT]',
                        color: '#ff1493',
                        arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'ff9900' } }
                    },
                    {
                        opcode: 'showNotification',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'pokaż powiadomienie [TITLE] treść: [BODY]',
                        color: '#ff4500',
                        arguments: {
                            TITLE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Osiągnięcie!' },
                            BODY: { type: Scratch.ArgumentType.STRING, defaultValue: 'Odblokowałeś kapeć poziomu 99! 🏆' }
                        }
                    },
                    {
                        opcode: 'copyToClipboard',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'skopiuj [TEXT] do schowka',
                        color: '#ff4500',
                        arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'KOD-ZAPISU-GRA' } }
                    },
                    {
                        opcode: 'generateRandomString',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'generuj losowy tekst o długości [LEN]',
                        color: '#ff4500',
                        arguments: { LEN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 8 } }
                    },
                    {
                        opcode: 'getMouseWindowPos',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'pozycja myszy na ekranie [COORD]',
                        color: '#ff4500',
                        arguments: {
                            COORD: { type: Scratch.ArgumentType.STRING, menu: 'mouseCoords', defaultValue: 'X' }
                        }
                    },
                    {
                        opcode: 'getFPS',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'FPS (płynność gry)',
                        color: '#ff4500'
                    },
                    {
                        opcode: 'downloadFile',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'pobierz plik o nazwie [NAME] i treści [CONTENT]',
                        color: '#ff4500',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'zapis.txt' },
                            CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: 'punkty=100' }
                        }
                    }
                ],
                menus: {
                    axisMenu: { acceptReporters: true, items: [{ text: 'Lewy analog X', value: '0' }, { text: 'Lewy analog Y', value: '1' }, { text: 'Prawy analog X', value: '2' }, { text: 'Prawy analog Y', value: '3' }] },
                    btnMenu: { acceptReporters: true, items: [{ text: 'Przycisk A / ╳', value: '0' }, { text: 'Przycisk B / ◯', value: '1' }, { text: 'Przycisk X / ▢', value: '2' }, { text: 'Przycisk Y / △', value: '3' }, { text: 'L1', value: '4' }, { text: 'R1', value: '5' }] },
                    mouseCoords: { acceptReporters: false, items: [{ text: 'Szerokość X (px)', value: 'X' }, { text: 'Wysokość Y (px)', value: 'Y' }] }
                }
            };
        }

        whenGamepadConnected() { const c = this.isGamepadConnected(); if (c !== lastGamepadConnected) { lastGamepadConnected = c; if (c) return true; } return false; }
        whenInternetChanges() { const s = navigator.onLine; if (s !== lastNetworkStatus) { lastNetworkStatus = s; return true; } return false; }
        whenAnyKeyIsPressed() { for (let k in lastKeysPressed) { if (lastKeysPressed[k]) return true; } return false; }
        whenMouseClicked() { if (mouseClickedThisFrame) { mouseClickedThisFrame = false; return true; } return false; }
        whenRightMouseClicked() { if (rightMouseClickedThisFrame) { rightMouseClickedThisFrame = false; return true; } return false; }

        isGamepadConnected() { return navigator.getGamepads().some(gp => gp !== null); }
        getGamepadAxis(args) { const p = navigator.getGamepads()[Math.floor(args.NUM)]; return p ? (p.axes[Math.floor(args.AXIS)] || 0) : 0; }
        isGamepadButtonPressed(args) { const p = navigator.getGamepads()[Math.floor(args.NUM)]; return p ? (p.buttons[Math.floor(args.BTN)]?.pressed || false) : false; }
        isOnline() { return navigator.onLine; }
        async fetchData(args) { try { const r = await fetch(args.URL); const t = await r.text(); return t; } catch(e) { return "Błąd sieci"; } }
        async sendDiscordWebhook(args) { try { await fetch(args.URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: args.TEXT }) }); } catch(e) {} }

        toBase64(args) { try { return btoa(unescape(encodeURIComponent(args.TEXT))); } catch(e) { return 'Błąd'; } }
        fromBase64(args) { try { return decodeURIComponent(escape(atob(args.BASE64))); } catch(e) { return 'Błąd'; } }
        
        caesarCipher(args) {
            const text = Scratch.Cast.toString(args.TEXT);
            let shift = Scratch.Cast.toNumber(args.SHIFT);
            if (shift < 0) shift = 26 + (shift % 26);
            
            return text.split('').map(char => {
                const code = char.charCodeAt(0);
                if (code >= 65 && code <= 90) {
                    return String.fromCharCode(((code - 65 + shift) % 26) + 65);
                }
                if (code >= 97 && code <= 122) {
                    return String.fromCharCode(((code - 97 + shift) % 26) + 97);
                }
                return char;
            }).join('');
        }

        removeHash(args) {
            const s = Scratch.Cast.toString(args.TEXT);
            return s.startsWith('#') ? s.slice(1) : s;
        }

        addHash(args) {
            const s = Scratch.Cast.toString(args.TEXT);
            return s.startsWith('#') ? s : '#' + s;
        }

        getFPS() { return fps; }
        getMouseWindowPos(args) { return args.COORD === 'X' ? mouseX : mouseY; }

        showNotification(args) {
            if (!("Notification" in window)) return;
            const title = Scratch.Cast.toString(args.TITLE);
            const body = Scratch.Cast.toString(args.BODY);

            if (Notification.permission === "granted") {
                new Notification(title, { body: body });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") new Notification(title, { body: body });
                });
            }
        }

        copyToClipboard(args) {
            const text = Scratch.Cast.toString(args.TEXT);
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text);
            }
        }

        generateRandomString(args) {
            const len = Math.max(1, Math.floor(Scratch.Cast.toNumber(args.LEN)));
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < len; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        downloadFile(args) {
            const blob = new Blob([args.CONTENT], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = args.NAME;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    Scratch.extensions.register(new KapeciowaWtyczkaV4());
})(Scratch);
