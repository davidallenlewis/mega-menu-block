/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import {
	ComboboxControl,
	PanelBody,
	Notice,
	TextControl,
	TextareaControl,
	ToggleControl,
	__experimentalHStack as HStack, // eslint-disable-line
	__experimentalToggleGroupControl as ToggleGroupControl, // eslint-disable-line
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon, // eslint-disable-line
	__experimentalVStack as VStack, // eslint-disable-line
} from '@wordpress/components';
import {
	alignNone,
	justifyLeft,
	justifyCenter,
	justifyRight,
	stretchWide,
	stretchFullWidth,
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import './edit.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @param {Object}   props               Properties passed to the function.
 * @param {Object}   props.attributes    Available block attributes.
 * @param {Function} props.setAttributes Function that updates individual attributes.
 *
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const {
		label,
		menuSlug,
		description,
		disableWhenCollapsed,
		collapsedUrl,
		menuMode,
		showChevron,
		activeParentPage,
		activePostType,
	} = attributes;

	// Get the URL for the patterns screen in the Site Editor.
	// Use window.location.origin so the protocol always matches the current page
	// (avoids http:// links when the site is accessed over https://).
	const menuPatternUrl =
		window.location.origin +
		'/wp-admin/site-editor.php?postType=wp_block&categoryId=mega-menu';

	// Get the layout settings.
	const layout = useSelect(
		( select ) =>
			select( 'core/editor' ).getEditorSettings()?.__experimentalFeatures
				?.layout
	);

	// Fetch registered block patterns in the mega-menu category.
	const patterns = useSelect(
		( select ) => select( 'core' ).getBlockPatterns(),
		[]
	);

	// Fetch user-created wp_block posts with embedded term data so we can
	// filter client-side by the 'mega-menu' wp_pattern_category slug without
	// needing a separate two-step category-ID lookup.
	const userPatterns = useSelect( ( select ) => {
		const posts = select( 'core' ).getEntityRecords( 'postType', 'wp_block', {
			per_page: -1,
			status: 'publish',
			_embed: 'wp:term',
		} );
		if ( ! posts ) return null;
		return posts.filter( ( post ) => {
			const terms = post._embedded?.[ 'wp:term' ]?.flat() ?? [];
			return terms.some(
				( term ) =>
					term.taxonomy === 'wp_pattern_category' &&
					term.slug === 'mega-menu'
			);
		} );
	}, [] );

	// Fetch published pages for the active parent page selector.
	const pageOptions = useSelect( ( select ) => {
		const records = select( 'core' ).getEntityRecords( 'postType', 'page', {
			per_page: 100,
			status: 'publish',
			_fields: 'id,title,slug',
		} );
		if ( ! records ) return [];
		return records.map( ( page ) => ( {
			label: page.title?.rendered ?? page.slug,
			value: page.id,
		} ) );
	}, [] );

	// Fetch public post types for the active post type selector.
	const postTypeOptions = useSelect( ( select ) => {
		const types = select( 'core' ).getPostTypes( { per_page: -1 } );
		if ( ! types ) return [];
		const excluded = [
			'attachment',
			'wp_block',
			'wp_navigation',
			'wp_template',
			'wp_template_part',
			'wp_global_styles',
			'wp_font_family',
			'wp_font_face',
		];
		return types
			.filter( ( type ) => type.viewable && ! excluded.includes( type.slug ) )
			.map( ( type ) => ( {
				label: type.name,
				value: type.slug,
			} ) );
	}, [] );

	const registeredMenuOptions = patterns
		? patterns
			.filter(
				( item ) =>
					item.categories &&
					item.categories.some(
						( cat ) =>
					cat === 'mega-menu' ||
					( typeof cat === 'object' && cat?.slug === 'mega-menu' )
					)
			)
			.map( ( item ) => ( {
				label: item.title,
				value: item.name,
			} ) )
		: [];

	const userMenuOptions = userPatterns
		? userPatterns.map( ( item ) => ( {
			label: item.title?.raw ?? item.slug,
			value: `wp_block:${ item.slug }`,
		} ) )
		: [];

	const menuOptions = [ ...registeredMenuOptions, ...userMenuOptions ];

	const hasMenus = menuOptions.length > 0;
	const selectedMenuAndExists = menuSlug
		? menuOptions.some( ( option ) => option.value === menuSlug )
		: true;

	// Notice for when no menus have been created.
	const noMenusNotice = (
		<Notice status="warning" isDismissible={ false }>
			{ createInterpolateElement(
				__(
					'No Patterns could be found. Create a new one in the <a>Site Editor</a>.',
					'mega-menu-block'
				),
				{
					a: (
						<a // eslint-disable-line
							href={ menuPatternUrl }
							target="_blank"
							rel="noreferrer"
						/>
					),
				}
			) }
		</Notice>
	);

	// Notice for when the selected menu pattern no longer exists.
	const menuDoesntExistNotice = (
		<Notice status="warning" isDismissible={ false }>
			{ __(
				'The selected Pattern no longer exists. Choose another.',
				'mega-menu-block'
			) }
		</Notice>
	);

	// Modify block props.
	const blockProps = useBlockProps( {
		className:
			'wp-block-navigation-item wp-block-uwd-mega-menu__toggle',
	} );

	return (
		<>
			<InspectorControls group="content">
				<PanelBody
					className="uwd-mega-menu__settings-panel"
					title={ __( 'Settings', 'mega-menu-block' ) }
					initialOpen={ true }
				>
					<TextControl
						label={ __( 'Label', 'mega-menu-block' ) }
						type="text"
						value={ label ? label.replace( /<br\s*\/?>/gi, ' ' ).replace( /<[^>]*>/g, '' ).trim() : '' }
						onChange={ ( value ) =>
							setAttributes( { label: value } )
						}
						autoComplete="off"
					/>
					<ComboboxControl
						label={ __( 'Mega Menu Pattern', 'mega-menu-block' ) }
						value={ menuSlug }
						options={ menuOptions }
						onChange={ ( value ) =>
							setAttributes( { menuSlug: value } )
						}
						help={
							hasMenus &&
							createInterpolateElement(
								__(
									'Create and modify Patterns in the <a>Site Editor</a>.',
									'mega-menu-block'
								),
								{
									a: (
									<a // eslint-disable-line
											href={ menuPatternUrl }
											target="_blank"
											rel="noreferrer"
										/>
									),
								}
							)
						}
					/>
					{ ! hasMenus && noMenusNotice }
					{ hasMenus &&
						! selectedMenuAndExists &&
						menuDoesntExistNotice }				<TextareaControl
					className="settings-panel__description"
					label={ __( 'Description', 'mega-menu-block' ) }
					value={ description || '' }
					onChange={ ( value ) =>
						setAttributes( { description: value } )
					}
					help={ __(
						'The description will be displayed in the menu if the current theme supports it.',
						'mega-menu-block'
					) }
					autoComplete="off"
				/>					<ToggleControl
						label={ __(
							'Disable mega menu in overlay',
							'mega-menu-block'
						) }
						checked={ disableWhenCollapsed }
						onChange={ () => {
							setAttributes( {
								disableWhenCollapsed: ! disableWhenCollapsed,
							} );
						} }
						help={ __(
							'When the navigation is displayed in an overlay, typically on mobile devices, disable the mega menu.',
							'mega-menu-block'
						) }
					/>
					{ disableWhenCollapsed && (
						<TextControl
							label={ __( 'Url', 'mega-menu-block' ) }
							type="text"
							value={ collapsedUrl || '' }
							onChange={ ( collapsedUrlValue ) => {
								setAttributes( {
									collapsedUrl: collapsedUrlValue,
								} );
							} }
							help={ __(
								'When the mega menu is disabled in the overlay, link to this URL instead.',
								'mega-menu-block'
							) }
							autoComplete="off"
						/>
					) }
				</PanelBody>
			</InspectorControls>
			<InspectorControls>
				<PanelBody
					title={ __( 'Active State', 'mega-menu-block' ) }
					initialOpen={ true }
				>
				<VStack spacing={ 4 }>
					<ComboboxControl
						label={ __( 'Active for parent page', 'mega-menu-block' ) }
						value={ activeParentPage || null }
						options={ pageOptions }
						onChange={ ( value ) =>
							setAttributes( { activeParentPage: value ?? 0 } )
						}
					/>
					<ComboboxControl
						label={ __( 'Active for post type', 'mega-menu-block' ) }
						value={ activePostType || null }
						options={ postTypeOptions }
						onChange={ ( value ) =>
							setAttributes( { activePostType: value ?? '' } )
						}
					/>
				</VStack>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="settings">
				<PanelBody
					className="uwd-mega-menu__layout-panel"
					title={ __( 'Layout', 'mega-menu-block' ) }
					initialOpen={ true }
				>
					<ToggleGroupControl
						label={ __( 'Menu Mode', 'mega-menu-block' ) }
						value={ menuMode }
						isBlock
						onChange={ ( value ) => setAttributes( { menuMode: value } ) }
					>
						<ToggleGroupControlOption value="dropdown" label="Dropdown" />
						<ToggleGroupControlOption value="slide-in-left" label="Slide-in Left" />
						<ToggleGroupControlOption value="slide-in-right" label="Slide-in Right" />
					</ToggleGroupControl>
				<ToggleControl
					label={ __( 'Show chevron', 'mega-menu-block' ) }
					checked={ showChevron }
					onChange={ () =>
						setAttributes( { showChevron: ! showChevron } )
					}
				/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<button className="wp-block-navigation-item__content wp-block-uwd-mega-menu__toggle">
					<RichText
						identifier="label"
						className="wp-block-navigation-item__label"
						value={ label }
						onChange={ ( labelValue ) =>
							setAttributes( {
								label: labelValue,
							} )
						}
						aria-label={ __(
							'Mega menu link text',
							'mega-menu-block'
						) }
						placeholder={ __( 'Add label…', 'mega-menu-block' ) }
						allowedFormats={ [
							'core/bold',
							'core/italic',
							'core/image',
							'core/strikethrough',
							'core/superscript',
							'core/subscript',
						] }
					/>
					
					{ showChevron && (
					<span className="wp-block-uwd-mega-menu__toggle-icon">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="12"
							height="12"
							viewBox="0 0 12 12"
							fill="none"
							aria-hidden="true"
							focusable="false"
						>
							<path
								d="M1.50002 4L6.00002 8L10.5 4"
								strokeWidth="1.5"
							></path>
						</svg>
					</span>
					) }
	
				</button>
			</div>
		</>
	);
}
