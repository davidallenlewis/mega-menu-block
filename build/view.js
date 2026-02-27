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


// Timeout IDs for hover-close delays, keyed by the <li> DOM ref.
// Cannot store in WP Interactivity context because getContext() is only
// valid during synchronous event dispatch — not inside setTimeout callbacks.
const hoverTimeouts = new WeakMap();
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
        const li = ref.closest('.wp-block-uwd-mega-menu');
        if (li) {
          // Calculate the left offset so that translateX(-50%) centers
          // the dropdown on the viewport, regardless of the li's position.
          // --dropdown-left = (viewport center) - (li's left edge in viewport)
          const liLeft = li.getBoundingClientRect().left;
          const cssLeft = document.documentElement.clientWidth / 2 - liLeft;
          li.style.setProperty('--dropdown-left', `${cssLeft}px`);
          const rect = ref.getBoundingClientRect();
          li.style.setProperty('--slide-in-top', `${rect.bottom + 20}px`);
        }
        actions.openMenu('click');
      }
    },
    closeMenuOnClick() {
      actions.closeMenu('click');
      actions.closeMenu('focus');
      actions.closeMenu('hover');
    },
    handleMenuMouseenter() {
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      if (context.triggerOn !== 'hover') return;
      const {
        ref
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)(); // ref is the <li>

      // Cancel any pending close timeout — covers the gap between the
      // toggle button and the dropdown, and hovering back in after leaving.
      if (hoverTimeouts.has(ref)) {
        clearTimeout(hoverTimeouts.get(ref));
        hoverTimeouts.delete(ref);
      }

      // Calculate centering offsets (same logic as click trigger).
      const liLeft = ref.getBoundingClientRect().left;
      const cssLeft = document.documentElement.clientWidth / 2 - liLeft;
      ref.style.setProperty('--dropdown-left', `${cssLeft}px`);
      const toggleBtn = ref.querySelector('.wp-block-uwd-mega-menu__toggle');
      if (toggleBtn) {
        const rect = toggleBtn.getBoundingClientRect();
        ref.style.setProperty('--slide-in-top', `${rect.bottom + 20}px`);
        context.previousFocus = toggleBtn;
      }
      actions.openMenu('hover');
    },
    handleMenuMouseleave() {
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      if (context.triggerOn !== 'hover') return;
      const {
        ref
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)();

      // context is captured synchronously here. Inside the timeout we
      // mutate the reactive proxy directly — we cannot call closeMenu()
      // or any action that calls getContext() from an async callback.
      if (hoverTimeouts.has(ref)) {
        clearTimeout(hoverTimeouts.get(ref));
      }
      const id = setTimeout(() => {
        hoverTimeouts.delete(ref);
        context.menuOpenedBy.hover = false;
        if (!Object.values(context.menuOpenedBy).some(Boolean)) {
          if (context.megaMenu?.contains(window.document.activeElement)) {
            context.previousFocus?.focus();
          }
          context.previousFocus = null;
          context.megaMenu = null;
        }
      }, 200);
      hoverTimeouts.set(ref, id);
    },
    handleMenuKeydown(event) {
      if (state.menuOpenedBy.click || state.menuOpenedBy.hover) {
        // If Escape close the menu.
        if (event?.key === 'Escape') {
          actions.closeMenu('click');
          actions.closeMenu('focus');
          actions.closeMenu('hover');
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
        actions.closeMenu('hover');
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