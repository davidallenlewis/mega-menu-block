<?php
/**
 * PHP file to use when rendering the block type on the server to show on the front end.
 *
 * The following variables are exposed to the file:
 *     $attributes (array): The block attributes.
 *     $content (string): The block default content.
 *     $block (WP_Block): The block instance.
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

$disable_when_collapsed = $attributes['disableWhenCollapsed'] ?? false;
$label                  = esc_html( $attributes['label'] ?? '' );
$menu_slug              = esc_attr( $attributes['menuSlug'] ?? '');
$collapsed_url          = esc_url( $attributes['collapsedUrl'] ?? '');
$menu_mode              = esc_attr( $attributes['menuMode'] ?? 'dropdown' );

// Don't display the mega menu link if there is no label or no menu slug.
if ( ! $label || ! $menu_slug ) {
	return null;	
}

$classes  = $disable_when_collapsed ? 'disable-menu-when-collapsed ' : '';
$classes .= $collapsed_url ? 'has-collapsed-link ' : '';

$wrapper_attributes = get_block_wrapper_attributes(
	array( 'class' => $classes )
);

$menu_classes = 'wp-block-uwd-mega-menu__menu-container';
$menu_classes .= ' mode-is-' . $menu_mode;

// Icons.
$close_icon  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M13 11.8l6.1-6.3-1-1-6.1 6.2-6.1-6.2-1 1 6.1 6.3-6.5 6.7 1 1 6.5-6.6 6.5 6.6 1-1z"></path></svg>';
$toggle_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false" fill="none"><path d="M1.50002 4L6.00002 8L10.5 4" stroke-width="1.5"></path></svg>'
?>

<li
	<?php echo $wrapper_attributes; ?>
	data-wp-interactive='{ "namespace": "uwd/mega-menu" }'
	data-wp-context='{ "menuOpenedBy": {}, "isTogglingMenu": false }'
	data-wp-on--focusout="actions.handleMenuFocusout"
	data-wp-on--keydown="actions.handleMenuKeydown"
	data-wp-watch="callbacks.initMenu"
>
	<button
		class="wp-block-uwd-mega-menu__toggle"
		data-wp-on--mousedown="actions.handleToggleMousedown"
		data-wp-on--click="actions.toggleMenuOnClick"
		data-wp-bind--aria-expanded="state.isMenuOpen"
	>
		<?php echo $label; ?><span class="wp-block-uwd-mega-menu__toggle-icon"><?php echo $toggle_icon; ?></span>
	</button>

	<div
		class="<?php echo $menu_classes; ?>"
		tabindex="-1"
	>
		<?php
		$pattern = WP_Block_Patterns_Registry::get_instance()->get_registered( $menu_slug );
		if ( $pattern ) {
			echo do_blocks( $pattern['content'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
		?>
		<button 
			aria-label="<?php echo __( 'Close menu', 'mega-menu' ); ?>" 
			class="menu-container__close-button" 
			data-wp-on--click="actions.closeMenuOnClick"
			type="button" 
		>
			<?php echo $close_icon; ?>
		</button>
	</div>

	<?php if ( $disable_when_collapsed && $collapsed_url ) { ?>
		<a class="wp-block-uwd-mega-menu__collapsed-link" href="<?php echo $collapsed_url; ?>">
			<span class="wp-block-navigation-item__label"><?php echo $label; ?></span>
		</a>
	<?php } ?>
</li>
