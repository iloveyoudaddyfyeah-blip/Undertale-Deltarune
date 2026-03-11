(function() {
    'use strict';

    function removeErrorOverlay() {
        const errorDivs = document.querySelectorAll('div');
        for (const div of errorDivs) {
            if (div.innerText && div.innerText.toLowerCase().includes('expectation thrown')) {
                const parent = div.parentNode;
                if(parent) {
                    parent.remove();
                }
            }
        }
    }

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                removeErrorOverlay();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    window.addEventListener('load', removeErrorOverlay);
})();
