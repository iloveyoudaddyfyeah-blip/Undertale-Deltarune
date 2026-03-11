document.addEventListener('DOMContentLoaded', () => {
    const gameSelection = document.getElementById('game-selection');
    const gameFrame = document.getElementById('game-frame');
    const mobileControls = document.getElementById('mobile-controls');

    window.loadGame = function(url) {
        gameSelection.style.display = 'none';
        gameFrame.src = url;
        gameFrame.style.display = 'block';
        gameFrame.focus();

        if (url.includes('Undertale')) {
            gameFrame.addEventListener('load', () => {
                try {
                    const innerDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
                    if (!/Mobi|Android/i.test(navigator.userAgent)) {
                        Object.defineProperty(innerDoc.navigator, 'userAgent', {
                            get: function() { return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'; }
                        });
                    }
                } catch (e) {
                    // ignore
                }
            }, { once: true });
        }
    }

    if (/Mobi|Android/i.test(navigator.userAgent)) {
        mobileControls.style.display = 'flex';
    }

    const joystick = document.getElementById('joystick');
    const handle = document.getElementById('joystick-handle');
    const buttonZ = document.getElementById('button-z');
    const buttonX = document.getElementById('button-x');
    const buttonC = document.getElementById('button-c');

    const keyMap = {
        'ArrowUp': { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
        'ArrowDown': { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
        'ArrowLeft': { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
        'ArrowRight': { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
        'z': { key: 'z', code: 'KeyZ', keyCode: 90 },
        'x': { key: 'x', code: 'KeyX', keyCode: 88 },
        'c': { key: 'c', code: 'KeyC', keyCode: 67 }
    };

    let keys = {};
    let joystickTouchId = null;

    function dispatchKeyEvent(type, keyIdentifier) {
        const keyInfo = keyMap[keyIdentifier];
        if (!keyInfo) return;

        const event = new KeyboardEvent(type, {
            key: keyInfo.key,
            code: keyInfo.code,
            keyCode: keyInfo.keyCode,
            which: keyInfo.keyCode,
            bubbles: true,
            cancelable: true
        });

        if (gameFrame.contentWindow) {
            const elements = [
                gameFrame.contentWindow,
                gameFrame.contentWindow.document,
                gameFrame.contentWindow.document.body,
                gameFrame.contentWindow.document.getElementById('canvas')
            ].filter(Boolean);
            elements.forEach(el => el.dispatchEvent(event));
        }
    }

    function updateJoystick(x, y) {
        const rect = joystick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = x - centerX;
        const deltaY = y - centerY;
        let angle = Math.atan2(deltaY, deltaX);
        let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > rect.width / 4) {
            distance = rect.width / 4;
        }

        const handleX = distance * Math.cos(angle);
        const handleY = distance * Math.sin(angle);
        handle.style.transform = `translate(${handleX}px, ${handleY}px)`;

        const angleDeg = angle * 180 / Math.PI;
        let newKeys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

        if (joystickTouchId !== null) {
            if (angleDeg > -112.5 && angleDeg < -67.5) {
                newKeys.ArrowUp = true;
            } else if (angleDeg > -67.5 && angleDeg < -22.5) {
                newKeys.ArrowUp = true;
                newKeys.ArrowRight = true;
            } else if (angleDeg > -22.5 && angleDeg < 22.5) {
                newKeys.ArrowRight = true;
            } else if (angleDeg > 22.5 && angleDeg < 67.5) {
                newKeys.ArrowRight = true;
                newKeys.ArrowDown = true;
            } else if (angleDeg > 67.5 && angleDeg < 112.5) {
                newKeys.ArrowDown = true;
            } else if (angleDeg > 112.5 && angleDeg < 157.5) {
                newKeys.ArrowDown = true;
                newKeys.ArrowLeft = true;
            } else if (angleDeg > 157.5 || angleDeg < -157.5) {
                newKeys.ArrowLeft = true;
            } else if (angleDeg > -157.5 && angleDeg < -112.5) {
                newKeys.ArrowLeft = true;
                newKeys.ArrowUp = true;
            }
        }

        for (const key in newKeys) {
            if (newKeys[key] && !keys[key]) {
                dispatchKeyEvent('keydown', key);
                keys[key] = true;
            } else if (!newKeys[key] && keys[key]) {
                dispatchKeyEvent('keyup', key);
                keys[key] = false;
            }
        }
    }

    function handleTouchStart(e) {
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            }
        }

        for (const touch of e.changedTouches) {
            const target = touch.target;
            if (target === joystick || joystick.contains(target)) {
                e.preventDefault();
                if (joystickTouchId === null) {
                    joystickTouchId = touch.identifier;
                    updateJoystick(touch.clientX, touch.clientY);
                }
            } else if (target.classList.contains('action-button')) {
                e.preventDefault();
                const key = target.id.replace('button-', '');
                target.classList.add('pressed');
                dispatchKeyEvent('keydown', key);
                keys[key] = true;
                target.dataset.touchId = touch.identifier;
            }
        }
    }

    function handleTouchMove(e) {
        for (const touch of e.changedTouches) {
            if (touch.identifier === joystickTouchId) {
                e.preventDefault();
                updateJoystick(touch.clientX, touch.clientY);
            }
        }
    }

    function handleTouchEnd(e) {
        for (const touch of e.changedTouches) {
            if (touch.identifier === joystickTouchId) {
                e.preventDefault();
                joystickTouchId = null;
                handle.style.transform = 'translate(0px, 0px)';
                const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
                directions.forEach(key => {
                    if (keys[key]) {
                        dispatchKeyEvent('keyup', key);
                        keys[key] = false;
                    }
                });
            } else {
                const buttons = document.querySelectorAll('.action-button');
                for(const button of buttons){
                    if(button.dataset.touchId == touch.identifier){
                        e.preventDefault();
                        const key = button.id.replace('button-', '');
                        button.classList.remove('pressed');
                        dispatchKeyEvent('keyup', key);
                        keys[key] = false;
                        delete button.dataset.touchId;
                    }
                }
            }
        }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false });
});
