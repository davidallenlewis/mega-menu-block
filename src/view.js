/**
 * WordPress dependencies
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

const { state, actions } = store( 'uwd/mega-menu', {
	state: {
		get isMenuOpen() {
			// The menu is opened if either `click` or `focus` is true.
			return (
				Object.values( state.menuOpenedBy ).filter( Boolean ).length > 0
			);
		},
		get menuOpenedBy() {
			const context = getContext();
			return context.menuOpenedBy;
		},
	},
	actions: {
		handleToggleMousedown() {
			// Set a flag before focusout fires so handleMenuFocusout knows
			// not to close the menu when the toggle button itself is clicked.
			// This is needed because Safari sets relatedTarget to null on click.
			const context = getContext();
			context.isTogglingMenu = true;
		},
		toggleMenuOnClick() {
			const context = getContext();
			const { ref } = getElement();
			// Safari won't send focus to the clicked element, so we need to manually place it: https://bugs.webkit.org/show_bug.cgi?id=22261
			if ( window.document.activeElement !== ref ) ref.focus();

			context.isTogglingMenu = false;

			if ( state.menuOpenedBy.click || state.menuOpenedBy.focus ) {
				actions.closeMenu( 'click' );
				actions.closeMenu( 'focus' );
			} else {
				context.previousFocus = ref;
				// Store the toggle's bottom position so slide-in panels can
				// use position:fixed but still start below the toggle button.
				const li = ref.closest( '.wp-block-uwd-mega-menu' );
				if ( li ) {
					li.style.setProperty(
						'--slide-in-top',
						`${ ref.getBoundingClientRect().bottom + 20 }px`
					);
				}
				actions.openMenu( 'click' );
			}
		},
		closeMenuOnClick() {
			actions.closeMenu( 'click' );
			actions.closeMenu( 'focus' );
		},
		handleMenuKeydown( event ) {
			if ( state.menuOpenedBy.click ) {
				// If Escape close the menu.
				if ( event?.key === 'Escape' ) {
					actions.closeMenu( 'click' );
					actions.closeMenu( 'focus' );
				}
			}
		},
		handleMenuFocusout( event ) {
			const context = getContext();
			const menuContainer = context.megaMenu?.querySelector(
				'.wp-block-uwd-mega-menu__menu-container'
			);
			// If focus is outside menu, and in the document, close menu
			// event.target === The element losing focus
			// event.relatedTarget === The element receiving focus (if any)
			// When focusout is outside the document,
			// `window.document.activeElement` doesn't change.

			// If the toggle button is being clicked (tracked via mousedown), skip
			// closing here — toggleMenuOnClick will handle it. This fixes a Safari
			// bug where relatedTarget is always null on click, which previously
			// caused focusout to close the menu before the click reopened it.
			if ( context.isTogglingMenu ) {
				return;
			}

			// The event.relatedTarget is null when something outside the navigation menu is clicked. This is only necessary for Safari.
			if (
				event.relatedTarget === null ||
				( ! menuContainer?.contains( event.relatedTarget ) &&
					event.target !== window.document.activeElement )
			) {
				actions.closeMenu( 'click' );
				actions.closeMenu( 'focus' );
			}
		},
		openMenu( menuOpenedOn = 'click' ) {
			state.menuOpenedBy[ menuOpenedOn ] = true;
		},
		closeMenu( menuClosedOn = 'click' ) {
			const context = getContext();
			state.menuOpenedBy[ menuClosedOn ] = false;

			// Reset the menu reference and button focus when closed.
			if ( ! state.isMenuOpen ) {
				if (
					context.megaMenu?.contains( window.document.activeElement )
				) {
					context.previousFocus?.focus();
				}
				context.previousFocus = null;
				context.megaMenu = null;
			}
		},
	},
	callbacks: {
		initMenu() {
			const context = getContext();
			const { ref } = getElement();

			// Set the menu reference when initialized.
			if ( state.isMenuOpen ) {
				context.megaMenu = ref;
			}
		},
	},
} );
