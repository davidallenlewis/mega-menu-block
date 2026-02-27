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
		title,
		description,
		disableWhenCollapsed,
		collapsedUrl,
		menuMode,
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

	const menuOptions = patterns
		? patterns
			.filter(
				( item ) =>
					item.categories &&
					item.categories.includes( 'mega-menu' )
			)
			.map( ( item ) => ( {
				label: item.title,
				value: item.name,
			} ) )
		: [];

	const hasMenus = menuOptions.length > 0;
	const selectedMenuAndExists = menuSlug
		? menuOptions.some( ( option ) => option.value === menuSlug )
		: true;

	// Notice for when no menus have been created.
	const noMenusNotice = (
		<Notice status="warning" isDismissible={ false }>
			{ createInterpolateElement(
				__(
					'No mega menu Patterns could be found. Create a new one in the <a>Site Editor</a>.',
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
				'The selected mega menu Pattern no longer exists. Choose another.',
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
			<InspectorControls group="settings">
				<PanelBody
					className="uwd-mega-menu__settings-panel"
					title={ __( 'Settings', 'mega-menu-block' ) }
					initialOpen={ true }
				>
					<TextControl
						label={ __( 'Label', 'mega-menu-block' ) }
						type="text"
						value={ label }
						onChange={ ( value ) =>
							setAttributes( { label: value } )
						}
						autoComplete="off"
					/>
					<ComboboxControl
						label={ __( 'Menu Pattern', 'mega-menu-block' ) }
						value={ menuSlug }
						options={ menuOptions }
						onChange={ ( value ) =>
							setAttributes( { menuSlug: value } )
						}
						help={
							hasMenus &&
							createInterpolateElement(
								__(
									'Create and modify mega menu Patterns in the <a>Site Editor</a>.',
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
						menuDoesntExistNotice }
					<TextareaControl
						className="settings-panel__description"
						label={ __( 'Description', 'mega-menu-block' ) }
						type="text"
						value={ description || '' }
						onChange={ ( descriptionValue ) => {
							setAttributes( { description: descriptionValue } );
						} }
						help={ __(
							'The description will be displayed in the menu if the current theme supports it.',
							'mega-menu-block'
						) }
						autoComplete="off"
					/>
					<TextControl
						label={ __( 'Title', 'mega-menu-block' ) }
						type="text"
						value={ title || '' }
						onChange={ ( titleValue ) => {
							setAttributes( { title: titleValue } );
						} }
						help={ __(
							'Additional information to help clarify the purpose of the link.',
							'mega-menu-block'
						) }
						autoComplete="off"
					/>
					<ToggleControl
						label={ __(
							'Disable in navigation overlay',
							'mega-menu-block'
						) }
						checked={ disableWhenCollapsed }
						onChange={ () => {
							setAttributes( {
								disableWhenCollapsed: ! disableWhenCollapsed,
							} );
						} }
						help={ __(
							'When the navigation options are displayed in an overlay, typically on mobile devices, disable the mega menu.',
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
								'When the navigtion menu is collapsed, link to this URL instead.',
								'mega-menu-block'
							) }
							autoComplete="off"
						/>
					) }
				</PanelBody>
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
						<ToggleGroupControlOption value="slide-in-right" label="Slide-in Right" />
					</ToggleGroupControl>
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
						] }
					/>
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
					{ description && (
						<span className="wp-block-navigation-item__description">
							{ description }
						</span>
					) }
				</button>
			</div>
		</>
	);
}
