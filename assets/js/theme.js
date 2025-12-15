/**
 * Preferences utility for managing theme and font switching
 */
var PreferencesUtil = (function() {
  // Single source of truth for configuration
  var CONFIG = {
    themes: ['latte', 'frappe', 'macchiato', 'mocha', 'tokyo-night'],
    defaultTheme: 'latte',
    defaultDarkTheme: 'mocha',
    fonts: {
      'jetbrains-mono': { name: 'JetBrains Mono' },
      'caskaydia-cove': { name: 'CaskaydiaCove Nerd Font' }
    },
    defaultFont: 'jetbrains-mono'
  };

  var stylesheets = {};

  function getStylesheets() {
    if (Object.keys(stylesheets).length === 0) {
      CONFIG.themes.forEach(function(theme) {
        stylesheets[theme] = document.getElementById('theme-' + theme);
      });
    }
    return stylesheets;
  }

  /**
   * Get the configuration
   * @returns {object} The configuration object
   */
  function getConfig() {
    return CONFIG;
  }

  /**
   * Get the list of available themes
   * @returns {string[]} Array of theme names
   */
  function getThemes() {
    return CONFIG.themes.slice();
  }

  /**
   * Get the list of available fonts
   * @returns {object} Font configuration object
   */
  function getFonts() {
    return CONFIG.fonts;
  }

  /**
   * Get the current theme from localStorage or determine default
   * @returns {string} The current theme name
   */
  function getTheme() {
    var stored = localStorage.getItem('theme');
    if (stored && CONFIG.themes.indexOf(stored) !== -1) {
      return stored;
    }
    // Check stylesheets as fallback
    var sheets = getStylesheets();
    for (var i = 0; i < CONFIG.themes.length; i++) {
      var theme = CONFIG.themes[i];
      if (sheets[theme] && !sheets[theme].disabled) {
        return theme;
      }
    }
    return CONFIG.defaultTheme;
  }

  /**
   * Get the current font
   * @returns {string} The current font key
   */
  function getFont() {
    var stored = localStorage.getItem('font');
    if (stored && CONFIG.fonts[stored]) {
      return stored;
    }
    return CONFIG.defaultFont;
  }

  /**
   * Determine the initial theme based on stored preference or system preference
   * @returns {string} The theme to use
   */
  function getInitialTheme() {
    var stored = localStorage.getItem('theme');
    if (stored && CONFIG.themes.indexOf(stored) !== -1) {
      return stored;
    }
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? CONFIG.defaultDarkTheme : CONFIG.defaultTheme;
  }

  /**
   * Set the theme
   * @param {string} theme - The theme to set
   * @param {boolean} [save=true] - Whether to save to localStorage
   */
  function setTheme(theme, save) {
    if (CONFIG.themes.indexOf(theme) === -1) {
      theme = CONFIG.defaultTheme;
    }

    var sheets = getStylesheets();
    if (save === undefined) {
      save = true;
    }

    CONFIG.themes.forEach(function(t) {
      if (sheets[t]) {
        sheets[t].disabled = (t !== theme);
      }
    });

    document.documentElement.setAttribute('data-theme', theme);

    if (save) {
      localStorage.setItem('theme', theme);
    }
  }

  /**
   * Set the font
   * @param {string} font - The font key to set
   * @param {boolean} [save=true] - Whether to save to localStorage
   */
  function setFont(font, save) {
    if (!CONFIG.fonts[font]) {
      font = CONFIG.defaultFont;
    }

    if (save === undefined) {
      save = true;
    }

    document.documentElement.setAttribute('data-font', font);

    if (save) {
      localStorage.setItem('font', font);
    }
  }

  /**
   * Early initialization - call before stylesheets are loaded
   * Sets data-font attribute to avoid FOUF
   */
  function earlyInit() {
    var font = getFont();
    document.documentElement.setAttribute('data-font', font);
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  function initTheme() {
    var theme = getInitialTheme();
    setTheme(theme, false);
  }

  /**
   * Initialize font from localStorage
   */
  function initFont() {
    var font = getFont();
    setFont(font, false);
  }

  /**
   * Initialize all preferences
   */
  function init() {
    initTheme();
    initFont();
  }

  return {
    getConfig: getConfig,
    getTheme: getTheme,
    getThemes: getThemes,
    getInitialTheme: getInitialTheme,
    setTheme: setTheme,
    initTheme: initTheme,
    getFont: getFont,
    getFonts: getFonts,
    setFont: setFont,
    initFont: initFont,
    earlyInit: earlyInit,
    init: init
  };
})();

// Backwards compatibility
var ThemeUtil = PreferencesUtil;
