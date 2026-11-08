import { useEffect } from 'react';

/**
 * AccessibilityWidget Component
 * Mounts only on public customer-facing routes.
 * Uses OpenNagish - modern accessible Israeli compliance widget with Shadow DOM.
 */
export default function AccessibilityWidget() {
  useEffect(() => {
    // Configure widget
    window.OpenNagishConfig = {
      lang: 'he',
      position: 'bottom-left',
      bottomOffset: 32,
      mobileBottomOffset: 24
    };

    let script = document.getElementById('open-nagish-script');
    
    function initWidget() {
      if (window.OpenNagish && typeof window.OpenNagish.init === 'function') {
        window.OpenNagish.init({
          lang: 'he',
          position: 'bottom-left',
          bottomOffset: 32,
          mobileBottomOffset: 24
        });
      }
    }

    if (!script) {
      script = document.createElement('script');
      script.id = 'open-nagish-script';
      script.src = '/open-nagish.min.js';
      script.async = true;
      script.onload = initWidget;
      document.body.appendChild(script);
    } else {
      initWidget();
    }

    return () => {
      // Remove widget when leaving public route (e.g. going to /admin)
      const host = document.getElementById('opennagish-widget');
      if (host) {
        host.remove();
      }
    };
  }, []);

  return null;
}
