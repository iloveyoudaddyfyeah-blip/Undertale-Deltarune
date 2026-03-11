const gameFrame = document.getElementById('game-frame');

function removeErrorOverlay() {
    try {
        const innerDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
        const errorDivs = innerDoc.querySelectorAll('div');
        for (const div of errorDivs) {
            if (div.innerText && div.innerText.toLowerCase().includes('xception thrown')) {
                const parent = div.parentNode;
                if (parent) {
                    parent.remove();
                }
            }
        }
    } catch (e) {
        // ignore
    }
}

const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
            removeErrorOverlay();
        }
    });
});

gameFrame.addEventListener('load', () => {
    try {
        const innerDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
        Object.defineProperty(innerDoc.navigator, 'userAgent', { 
            get: function() { return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'; }
        });
        observer.observe(innerDoc.body, {
            childList: true,
            subtree: true
        });
        removeErrorOverlay();
    } catch (e) {
        // ignore
    }
});
