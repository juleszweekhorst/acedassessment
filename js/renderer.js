const { ipcRenderer } = require('electron');

    marked.setOptions({
      sanitize: true,
      breaks: true,
      gfm: true
    });

    const showOverlay = () => {
      document.getElementById('response-overlay').classList.add('opacity-100', 'visible');
      document.getElementById('response-overlay').classList.remove('opacity-0', 'invisible');
    };

    const hideOverlay = () => {
      document.getElementById('response-overlay').classList.add('opacity-0', 'invisible');
      document.getElementById('response-overlay').classList.remove('opacity-100', 'visible');
    };

    const updateBanner = (text, show = true) => {
      const banner = document.getElementById('instruction-banner');
      banner.style.opacity = show ? '1' : '0';
      if (text) banner.textContent = text;
    };

    const handlers = {
      'analysis-result': (event, result) => {
        showOverlay();
        document.getElementById('response-box').innerHTML = marked.parse(result);
        updateBanner("Ctrl+Shift+R: Repeat process");
      },

      'error': (event, error) => {
        showOverlay();
        document.getElementById('response-box').innerHTML = `
          <div class="text-red-400 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-md mb-4">
            <strong>Error:</strong> ${error}
            <br><small class="text-sm">Press Ctrl+Shift+R to try again</small>
          </div>`;
      },

      'update-instruction': (event, instruction) => {
        updateBanner(instruction, true);
      },

      'hide-instruction': () => {
        updateBanner('', false);
      },

      'clear-result': () => {
        document.getElementById('response-box').innerHTML = "";
        hideOverlay();
      }
    };

    Object.entries(handlers).forEach(([channel, handler]) => {
      ipcRenderer.on(channel, handler);
    });

    window.addEventListener('unload', () => {
      Object.keys(handlers).forEach(channel => {
        ipcRenderer.removeAllListeners(channel);
      });
    });

    updateBanner("Ctrl+Shift+S: Screenshot | Ctrl+Shift+Q: Close | Ctrl+Shift+Arrow Keys: Move window | Ctrl+Shift+ +/-: Resize window");