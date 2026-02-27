/**
 * WordPress dependencies
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

// Timeout IDs for hover-close delays, keyed by the <li> DOM ref.
// Cannot store in WP Interactivity context because getContext() is only
// valid during synchronous event dispatch — not inside setTimeout callbacks.
const hoverTimeouts = new WeakMap();

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

				const li = ref.closest( '.wp-block-uwd-mega-menu' );
				if ( li ) {
					// Calculate the left offset so that translateX(-50%) centers
					// the dropdown on the viewport, regardless of the li's position.
					// --dropdown-left = (viewport center) - (li's left edge in viewport)
					const liLeft = li.getBoundingClientRect().left;
					const cssLeft = ( document.documentElement.clientWidth / 2 ) - liLeft;
					li.style.setProperty( '--dropdown-left', `${ cssLeft }px` );

					const rect = ref.getBoundingClientRect();
					li.style.setProperty( '--slide-in-top', `${ rect.bottom + 20 }px` );
				}

				actions.openMenu( 'click' );
			}
		},
		closeMenuOnClick() {
			actions.closeMenu( 'click' );
			actions.closeMenu( 'focus' );
			actions.closeMenu( 'hover' );
		},
		handleMenuMouseenter() {
			const context = getContext();
			if ( context.triggerOn !== 'hover' ) return;
			const { ref } = getElement(); // ref is the <li>

			// Cancel any pending close timeout — covers the gap between the
			// toggle button and the dropdown, and hovering back in after leaving.
			if ( hoverTimeouts.has( ref ) ) {
				clearTimeout( hoverTimeouts.get( ref ) );
				hoverTimeouts.delete( ref );
			}

			// Calculate centering offsets (same logic as click trigger).
			const liLeft = ref.getBoundingClientRect().left;
			const cssLeft = ( document.documentElement.clientWidth / 2 ) - liLeft;
			ref.style.setProperty( '--dropdown-left', `${ cssLeft }px` );

			const toggleBtn = ref.querySelector( '.wp-block-uwd-mega-menu__toggle' );
			if ( toggleBtn ) {
				const rect = toggleBtn.getBoundingClientRect();
				ref.style.setProperty( '--slide-in-top', `${ rect.bottom + 20 }px` );
				context.previousFocus = toggleBtn;
			}

			actions.openMenu( 'hover' );
		},
		handleMenuMouseleave() {
			const context = getContext();
			if ( context.triggerOn !== 'hover' ) return;
			const { ref } = getElement();

			// context is captured synchronously here. Inside the timeout we
			// mutate the reactive proxy directly — we cannot call closeMenu()
			// or any action that calls getContext() from an async callback.
			if ( hoverTimeouts.has( ref ) ) {
				clearTimeout( hoverTimeouts.get( ref ) );
			}
			const id = setTimeout( () => {
				hoverTimeouts.delete( ref );
				context.menuOpenedBy.hover = false;
				if ( ! Object.values( context.menuOpenedBy ).some( Boolean ) ) {
					if ( context.megaMenu?.contains( window.document.activeElement ) ) {
						context.previousFocus?.focus();
					}
					context.previousFocus = null;
					context.megaMenu = null;
				}
			}, 200 );
			hoverTimeouts.set( ref, id );
		},
		handleMenuKeydown( event ) {
			if ( state.menuOpenedBy.click || state.menuOpenedBy.hover ) {
				// If Escape close the menu.
				if ( event?.key === 'Escape' ) {
					actions.closeMenu( 'click' );
					actions.closeMenu( 'focus' );
					actions.closeMenu( 'hover' );
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
				actions.closeMenu( 'hover' );
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
