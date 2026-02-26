import * as __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__ from "@wordpress/interactivity";
/******/ var __webpack_modules__ = ({

/***/ "@wordpress/interactivity"
/*!*******************************************!*\
  !*** external "@wordpress/interactivity" ***!
  \*******************************************/
(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__;

/***/ }

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	if (!(moduleId in __webpack_modules__)) {
/******/ 		delete __webpack_module_cache__[moduleId];
/******/ 		var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 		e.code = 'MODULE_NOT_FOUND';
/******/ 		throw e;
/******/ 	}
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/view.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/interactivity */ "@wordpress/interactivity");
/**
 * WordPress dependencies
 */

const {
  state,
  actions
} = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('uwd/mega-menu', {
  state: {
    get isMenuOpen() {
      // The menu is opened if either `click` or `focus` is true.
      return Object.values(state.menuOpenedBy).filter(Boolean).length > 0;
    },
    get menuOpenedBy() {
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      return context.menuOpenedBy;
    }
  },
  actions: {
    handleToggleMousedown() {
      // Set a flag before focusout fires so handleMenuFocusout knows
      // not to close the menu when the toggle button itself is clicked.
      // This is needed because Safari sets relatedTarget to null on click.
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      context.isTogglingMenu = true;
    },
    toggleMenuOnClick() {
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const {
        ref
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)();
      // Safari won't send focus to the clicked element, so we need to manually place it: https://bugs.webkit.org/show_bug.cgi?id=22261
      if (window.document.activeElement !== ref) ref.focus();
      context.isTogglingMenu = false;
      if (state.menuOpenedBy.click || state.menuOpenedBy.focus) {
        actions.closeMenu('click');
        actions.closeMenu('focus');
      } else {
        context.previousFocus = ref;
        // Store the toggle's bottom position so slide-in panels can
        // use position:fixed but still start below the toggle button.
        const li = ref.closest('.wp-block-uwd-mega-menu');
        if (li) {
          li.style.setProperty('--slide-in-top', `${ref.getBoundingClientRect().bottom + 20}px`);
        }
        actions.openMenu('click');
      }
    },
    closeMenuOnClick() {
      actions.closeMenu('click');
      actions.closeMenu('focus');
    },
    handleMenuKeydown(event) {
      if (state.menuOpenedBy.click) {
        // If Escape close the menu.
        if (event?.key === 'Escape') {
          actions.closeMenu('click');
          actions.closeMenu('focus');
        }
      }
    },
    handleMenuFocusout(event) {
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const menuContainer = context.megaMenu?.querySelector('.wp-block-uwd-mega-menu__menu-container');
      // If focus is outside menu, and in the document, close menu
      // event.target === The element losing focus
      // event.relatedTarget === The element receiving focus (if any)
      // When focusout is outside the document,
      // `window.document.activeElement` doesn't change.

      // If the toggle button is being clicked (tracked via mousedown), skip
      // closing here — toggleMenuOnClick will handle it. This fixes a Safari
      // bug where relatedTarget is always null on click, which previously
      // caused focusout to close the menu before the click reopened it.
      if (context.isTogglingMenu) {
        return;
      }

      // The event.relatedTarget is null when something outside the navigation menu is clicked. This is only necessary for Safari.
      if (event.relatedTarget === null || !menuContainer?.contains(event.relatedTarget) && event.target !== window.document.activeElement) {
        actions.closeMenu('click');
        actions.closeMenu('focus');
      }
    },
    openMenu(menuOpenedOn = 'click') {
      state.menuOpenedBy[menuOpenedOn] = true;
    },
    closeMenu(menuClosedOn = 'click') {
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      state.menuOpenedBy[menuClosedOn] = false;

      // Reset the menu reference and button focus when closed.
      if (!state.isMenuOpen) {
        if (context.megaMenu?.contains(window.document.activeElement)) {
          context.previousFocus?.focus();
        }
        context.previousFocus = null;
        context.megaMenu = null;
      }
    }
  },
  callbacks: {
    initMenu() {
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const {
        ref
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)();

      // Set the menu reference when initialized.
      if (state.isMenuOpen) {
        context.megaMenu = ref;
      }
    }
  }
});
})();


//# sourceMappingURL=view.js.map