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

			// If the toggle button is being clicked (tracked via mousedown), skip
			// closing here — toggleMenuOnClick will handle it. This fixes a Safari
			// bug where relatedTarget is always null on click, which previously
			// caused focusout to close the menu before the click reopened it.
			if ( context.isTogglingMenu ) return;

			// Focus moving into the portaled container is not a reason to close.
			if ( context.menuContainer?.contains( event.relatedTarget ) ) return;

			// The event.relatedTarget is null when something outside the navigation menu is clicked. This is only necessary for Safari.
			if (
				event.relatedTarget === null ||
				event.target !== window.document.activeElement
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
					context.menuContainer?.contains( window.document.activeElement ) ||
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
			const { ref } = getElement(); // ref = the <li>

			// Portal the __menu-container to <body> once on first run.
			// This removes it from the <nav> DOM tree so no navigation-block
			// descendant selectors or inherited styles can reach it.
			if ( ! context.menuContainer ) {
				const container = ref.querySelector(
					'.wp-block-uwd-mega-menu__menu-container'
				);
				if ( container ) {
					// Wire up the close button with a plain listener since it will
					// no longer be inside the Interactivity API context chain.
					const closeBtn = container.querySelector(
						'.menu-container__close-button'
					);
					if ( closeBtn ) {
						closeBtn.removeAttribute( 'data-wp-on--click' );
						closeBtn.addEventListener( 'click', () => {
							context.menuOpenedBy.click = false;
							context.menuOpenedBy.focus = false;
						} );
					}

					// Close when focus leaves the portaled container and doesn't
					// return to the <li> toggle.
					container.addEventListener( 'focusout', ( event ) => {
						if ( context.isTogglingMenu ) return;
						if ( ref.contains( event.relatedTarget ) ) return;
						if ( container.contains( event.relatedTarget ) ) return;
						context.menuOpenedBy.click = false;
						context.menuOpenedBy.focus = false;
					} );

					document.body.appendChild( container );
					context.menuContainer = container;
				}
			}

			// Sync open/closed state and position to the portaled container.
			const container = context.menuContainer;
			if ( ! container ) return;

			if ( state.isMenuOpen ) {
				context.megaMenu = ref;

				const toggle = ref.querySelector( '.wp-block-uwd-mega-menu__toggle' );

				// Reposition the container relative to the toggle's current viewport rect.
				// Called on open and on every scroll/resize so it tracks the toggle
				// even when the nav scrolls with the page.
				const reposition = () => {
					if ( ! toggle ) return;
					const rect = toggle.getBoundingClientRect();
					container.style.top = `${ rect.bottom + 20 }px`;
					container.style.setProperty( '--slide-in-top', `${ rect.bottom }px` );
				};

				reposition();

				// Store the handler so we can remove it when the menu closes.
				context._reposition = reposition;
				window.addEventListener( 'scroll', reposition, { passive: true } );
				window.addEventListener( 'resize', reposition, { passive: true } );

				container.classList.add( 'is-open' );
			} else {
				// Remove scroll/resize listeners when closed.
				if ( context._reposition ) {
					window.removeEventListener( 'scroll', context._reposition );
					window.removeEventListener( 'resize', context._reposition );
					context._reposition = null;
				}
				container.classList.remove( 'is-open' );
			}
		},
	},
} );
