<?php
/**
 * Plugin Name:       Mega Menu Block
 * Description:       An exploratory mega menu block
 * Requires at least: 6.5
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Nick Diego
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       mega-menu-block
 *
 * @package           mega-menu-block
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function outermost_mega_menu_block_init() {
	register_block_type( __DIR__ . '/build' );

	// Register the pattern category used to tag mega menu content patterns.
	register_block_pattern_category(
		'mega-menu',
		array( 'label' => __( 'Mega Menus', 'mega-menu-block' ) )
	);
}
add_action( 'init', 'outermost_mega_menu_block_init' );

