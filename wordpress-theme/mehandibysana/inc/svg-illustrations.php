<?php
/**
 * Custom Inline Botanical & Architectural Henna SVG Illustrations
 * Mirrors BotanicalIllustrations.tsx & HennaArtworkPlates.tsx cleanly in PHP.
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Botanical Hero Study (arch + lotus + stem watermark)
 */
function mbs_svg_botanical_hero_study( $class = '' ) {
	$cls = esc_attr( $class );
	ob_start();
	?>
	<svg viewBox="0 0 360 450" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="<?php echo $cls; ?>">
		<path d="M36 414V180C36 100.471 100.471 36 180 36C259.529 36 324 100.471 324 180V414" stroke="var(--color-border-strong)" stroke-width="1" />
		<path d="M52 414V184C52 113.308 109.308 56 180 56C250.692 56 308 113.308 308 184V414" stroke="var(--color-border)" stroke-width="1" stroke-dasharray="3 5" />
		<circle cx="180" cy="86" r="4" stroke="var(--color-accent)" stroke-width="1.2" />
		<circle cx="180" cy="86" r="1.5" fill="var(--color-accent)" />
		<path d="M180 100C165 112 152 128 152 146C152 162 165 174 180 184C195 174 208 162 208 146C208 128 195 112 180 100Z" stroke="var(--color-text)" stroke-width="1.15" />
		<path d="M180 112C171 122 165 133 165 145C165 156 172 165 180 171C188 165 195 156 195 145C195 133 189 122 180 112Z" stroke="var(--color-accent)" stroke-width="1" />
		<path d="M180 184V352" stroke="var(--color-text)" stroke-width="1.2" stroke-linecap="round" />
		<path d="M180 218C156 212 138 194 134 172C156 174 174 192 180 218Z" stroke="var(--color-text)" stroke-width="1.15" />
		<path d="M180 218C204 212 222 194 226 172C204 174 186 192 180 218Z" stroke="var(--color-text)" stroke-width="1.15" />
		<path d="M180 264C149 258 125 236 120 208C148 212 172 234 180 264Z" stroke="var(--color-text)" stroke-width="1.15" />
		<path d="M180 264C211 258 235 236 240 208C212 212 188 234 180 264Z" stroke="var(--color-text)" stroke-width="1.15" />
		<path d="M180 310C153 305 134 286 130 262C154 266 173 284 180 310Z" stroke="var(--color-accent)" stroke-width="1.15" />
		<path d="M180 310C207 305 226 286 230 262C206 266 187 284 180 310Z" stroke="var(--color-accent)" stroke-width="1.15" />
		<circle cx="144" cy="240" r="2.2" fill="var(--color-accent)" />
		<circle cx="216" cy="240" r="2.2" fill="var(--color-accent)" />
		<circle cx="152" cy="196" r="1.8" fill="var(--color-text-muted)" />
		<circle cx="208" cy="196" r="1.8" fill="var(--color-text-muted)" />
		<path d="M110 352H250" stroke="var(--color-border-strong)" stroke-width="1" />
		<path d="M148 368C164 380 196 380 212 368" stroke="var(--color-accent)" stroke-width="1.15" stroke-linecap="round" />
		<circle cx="180" cy="390" r="2" fill="var(--color-text)" />
	</svg>
	<?php
	return ob_get_clean();
}

/**
 * Fine botanical sprig accent
 */
function mbs_svg_botanical_sprig( $class = '' ) {
	$cls = esc_attr( $class );
	return '<svg width="56" height="20" viewBox="0 0 56 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="' . $cls . '">'
		. '<path d="M4 10H52" stroke="var(--color-border)" stroke-width="1" />'
		. '<path d="M28 10C24 6 19 4 15 4C15 8 19 11 28 10Z" stroke="var(--color-accent)" stroke-width="1.2" />'
		. '<path d="M28 10C32 6 37 4 41 4C41 8 37 11 28 10Z" stroke="var(--color-accent)" stroke-width="1.2" />'
		. '<circle cx="28" cy="10" r="2" fill="var(--color-accent)" />'
		. '</svg>';
}

/**
 * Full-width botanical hairline section divider
 */
function mbs_svg_botanical_divider() {
	return '<div class="editorial-container mbs-botanical-divider" aria-hidden="true">'
		. '<div class="mbs-divider-line"></div>'
		. mbs_svg_botanical_sprig( 'mbs-divider-sprig' )
		. '<div class="mbs-divider-line"></div>'
		. '</div>';
}

/**
 * Service tier architectural motif icon ('bridal' | 'events' | 'botanical')
 */
function mbs_svg_service_motif( $variant = 'botanical', $class = '' ) {
	$cls = esc_attr( $class );
	if ( 'bridal' === $variant ) {
		return '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="' . $cls . '">'
			. '<circle cx="16" cy="16" r="12" stroke="var(--color-border-strong)" stroke-width="1.2" />'
			. '<path d="M16 7C13.5 10.5 12 13 12 16C12 18.2 13.8 20 16 20C18.2 20 20 18.2 20 16C20 13 18.5 10.5 16 7Z" stroke="var(--color-accent)" stroke-width="1.35" />'
			. '<circle cx="16" cy="24" r="1.5" fill="currentColor" />'
			. '</svg>';
	}
	if ( 'events' === $variant ) {
		return '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="' . $cls . '">'
			. '<path d="M16 4V28M4 16H28" stroke="var(--color-border-strong)" stroke-width="1" />'
			. '<rect x="10.5" y="10.5" width="11" height="11" transform="rotate(45 16 16)" stroke="var(--color-accent)" stroke-width="1.35" />'
			. '<circle cx="16" cy="16" r="2.2" fill="currentColor" />'
			. '</svg>';
	}
	return '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="' . $cls . '">'
		. '<path d="M16 27C16 27 8 22 8 13.5C8 9.2 11.5 6 16 6C20.5 6 24 9.2 24 13.5C24 22 16 27 16 27Z" stroke="var(--color-accent)" stroke-width="1.35" />'
		. '<path d="M16 9V25" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />'
		. '<path d="M16 15L20 12.5M16 19L12 16.5" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" />'
		. '</svg>';
}

/**
 * Botanical mortar & pestle preparation illustration
 */
function mbs_svg_botanical_craft( $class = '' ) {
	$cls = esc_attr( $class );
	ob_start();
	?>
	<svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="<?php echo $cls; ?>">
		<rect x="16" y="16" width="288" height="228" rx="8" stroke="var(--color-border)" stroke-width="1" />
		<path d="M96 144H224C224 176 198 196 160 196C122 196 96 176 96 144Z" stroke="var(--color-text)" stroke-width="1.35" />
		<path d="M132 196H188" stroke="var(--color-text)" stroke-width="1.35" stroke-linecap="round" />
		<path d="M196 86L164 144" stroke="var(--color-accent)" stroke-width="2.2" stroke-linecap="round" />
		<path d="M142 144C136 118 118 98 98 94C102 116 118 136 142 144Z" stroke="var(--color-text)" stroke-width="1.2" />
		<path d="M154 144C152 110 144 82 134 66C150 76 162 104 154 144Z" stroke="var(--color-accent)" stroke-width="1.2" />
		<circle cx="236" cy="96" r="3" stroke="var(--color-border-strong)" stroke-width="1.2" />
		<circle cx="88" cy="180" r="2" fill="var(--color-accent)" />
	</svg>
	<?php
	return ob_get_clean();
}

/**
 * Botanical empty cart line-art illustration
 */
function mbs_svg_empty_cart( $class = '' ) {
	$cls = esc_attr( $class );
	return '<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="' . $cls . '">'
		. '<circle cx="48" cy="48" r="42" stroke="var(--color-border)" stroke-width="1" stroke-dasharray="3 4" />'
		. '<path d="M32 34L28 66H68L64 34H32Z" stroke="var(--color-text)" stroke-width="1.4" stroke-linejoin="round" />'
		. '<path d="M39 34V29C39 24.0294 43.0294 20 48 20C52.9706 20 57 24.0294 57 29V34" stroke="var(--color-text)" stroke-width="1.4" />'
		. '<path d="M48 45C44 49 44 55 48 58C52 55 52 49 48 45Z" stroke="var(--color-accent)" stroke-width="1.3" />'
		. '</svg>';
}

/**
 * Hero Architectural Henna Mandala & Rolled 0.38mm Cone Composition
 */
function mbs_svg_hero_composition( $class = '' ) {
	$cls = esc_attr( $class );
	ob_start();
	?>
	<svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="<?php esc_attr_e( 'Botanical henna mandala and cone illustration by Mehandi by Sana', 'mehandibysana' ); ?>" class="<?php echo $cls; ?>">
		<rect width="400" height="500" fill="#ffffff" />
		<path d="M28 472V188C28 96 105 24 200 24C295 24 372 96 372 188V472" stroke="#e5e5e5" stroke-width="1.2" />
		<path d="M44 472V192C44 109 114 42 200 42C286 42 356 109 356 192V472" stroke="#d9541e" stroke-opacity="0.45" stroke-width="1" stroke-dasharray="4 6" />
		<g transform="translate(200 66)">
			<path d="M0 -14C5 -6 5 2 0 8C-5 2 -5 -6 0 -14Z" fill="#d9541e" />
			<path d="M0 8C-8 4 -14 -2 -14 -9C-7 -6 -3 1 0 8Z" stroke="#111111" stroke-width="1.2" fill="#ffffff" />
			<path d="M0 8C8 4 14 -2 14 -9C7 -6 3 1 0 8Z" stroke="#111111" stroke-width="1.2" fill="#ffffff" />
			<circle cx="0" cy="-19" r="2" fill="#111111" />
		</g>
		<g transform="translate(200 226)">
			<circle r="116" stroke="#e5e5e5" stroke-width="1" stroke-dasharray="3 5" />
			<circle r="98" stroke="#111111" stroke-width="1.3" />
			<circle r="86" stroke="#d9541e" stroke-width="0.9" />
			<circle r="54" stroke="#111111" stroke-width="1.3" />
			<circle r="24" stroke="#d9541e" stroke-width="1.4" />
			<circle r="8" fill="#111111" />
			<circle r="3.2" fill="#fceee3" />
			<?php for ( $i = 0; $i < 12; $i++ ) : ?>
				<g transform="rotate(<?php echo esc_attr( $i * 30 ); ?>)">
					<path d="M0 -86C11 -102 12 -114 0 -122C-12 -114 -11 -102 0 -86Z" fill="<?php echo 0 === $i % 2 ? '#111111' : 'none'; ?>" stroke="#111111" stroke-width="1.15" />
					<circle cx="0" cy="-129" r="2.2" fill="#d9541e" />
				</g>
			<?php endfor; ?>
			<?php for ( $j = 0; $j < 8; $j++ ) : ?>
				<g transform="rotate(<?php echo esc_attr( $j * 45 ); ?>)">
					<path d="M0 -24C14 -42 13 -64 0 -78C-13 -64 -14 -42 0 -24Z" stroke="#d9541e" stroke-width="1.25" fill="none" />
					<path d="M0 -34C6 -45 6 -56 0 -64C-6 -56 -6 -45 0 -34Z" fill="#111111" />
					<circle cx="0" cy="-49" r="1.6" fill="#fceee3" />
				</g>
			<?php endfor; ?>
		</g>
		<path d="M200 342V412" stroke="#111111" stroke-width="1.4" stroke-linecap="round" />
		<path d="M200 364C166 360 144 338 136 314C162 318 186 338 200 364Z" stroke="#111111" stroke-width="1.25" fill="#111111" />
		<path d="M200 364C234 360 256 338 264 314C238 318 214 338 200 364Z" stroke="#111111" stroke-width="1.25" fill="#111111" />
		<path d="M192 358C174 352 158 340 146 325" stroke="#fceee3" stroke-width="1" stroke-linecap="round" />
		<path d="M208 358C226 352 242 340 254 325" stroke="#fceee3" stroke-width="1" stroke-linecap="round" />
		<g transform="translate(262 390) rotate(-38)">
			<path d="M0 -42L12 12C12 18 6 22 0 22C-6 22 -12 18 -12 12L0 -42Z" fill="#d9541e" stroke="#111111" stroke-width="1.35" />
			<path d="M0 -42V-52" stroke="#111111" stroke-width="1.5" stroke-linecap="round" />
			<path d="M-8 4H8" stroke="#fceee3" stroke-width="1.1" stroke-linecap="round" />
			<path d="M-5 -12H5" stroke="#fceee3" stroke-width="1.1" stroke-linecap="round" />
			<path d="M-12 12C-4 15 4 15 12 12" stroke="#111111" stroke-width="1.1" />
		</g>
		<circle cx="226" cy="346" r="2.2" fill="#d9541e" />
		<circle cx="218" cy="354" r="1.4" fill="#111111" />
		<path d="M98 412H302" stroke="#111111" stroke-width="1.1" />
		<circle cx="98" cy="412" r="2.2" fill="#d9541e" />
		<circle cx="302" cy="412" r="2.2" fill="#d9541e" />
	</svg>
	<?php
	return ob_get_clean();
}

/**
 * Unique Atelier Portrait of Sana (Burqa / Modest Veiled Henna Artist)
 */
function mbs_svg_sana_portrait( $class = '' ) {
	$cls = esc_attr( $class );
	ob_start();
	?>
	<svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="<?php esc_attr_e( 'Illustration of Sumaiya Rashid Magray (Sana) applying organic henna in Srinagar', 'mehandibysana' ); ?>" class="<?php echo $cls; ?>">
		<rect width="400" height="500" fill="#ffffff" />
		<path d="M28 482V194C28 96 105 22 200 22C295 22 372 96 372 194V482" stroke="#e5e5e5" stroke-width="1.2" />
		<path d="M44 482V198C44 110 114 40 200 40C286 40 356 110 356 198V482" stroke="#d9541e" stroke-opacity="0.5" stroke-width="1.1" stroke-dasharray="4 6" />
		<g transform="translate(200 60)">
			<path d="M0 -13C4.5 -5 4.5 2 0 7C-4.5 2 -4.5 -5 0 -13Z" fill="#d9541e" />
			<path d="M0 7C-7 3.5 -12 -2 -12 -8.5C-6 -5.5 -2.5 1 0 7Z" stroke="#111111" stroke-width="1.15" fill="#ffffff" />
			<path d="M0 7C7 3.5 12 -2 12 -8.5C6 -5.5 2.5 1 0 7Z" stroke="#111111" stroke-width="1.15" fill="#ffffff" />
			<circle cx="0" cy="-17" r="1.8" fill="#111111" />
		</g>
		<circle cx="200" cy="176" r="96" stroke="#e5e5e5" stroke-width="1" />
		<circle cx="200" cy="176" r="112" stroke="#d9541e" stroke-opacity="0.32" stroke-width="0.9" stroke-dasharray="2 5" />
		<g transform="translate(78 118) rotate(-22)">
			<path d="M0 30C-8 22 -14 10 -10 0C-3 4 0 10 0 16C0 10 3 4 10 0C14 10 8 22 0 30Z" stroke="#111111" stroke-width="1.2" fill="#ffffff" />
			<path d="M0 30V6" stroke="#d9541e" stroke-width="1.2" />
		</g>
		<g transform="translate(322 118) rotate(22)">
			<path d="M0 30C-8 22 -14 10 -10 0C-3 4 0 10 0 16C0 10 3 4 10 0C14 10 8 22 0 30Z" stroke="#111111" stroke-width="1.2" fill="#ffffff" />
			<path d="M0 30V6" stroke="#d9541e" stroke-width="1.2" />
		</g>
		<path d="M200 84C150 84 114 118 106 168C98 214 78 264 62 326C52 364 48 416 48 476H352C352 416 346 364 336 326C320 264 302 214 294 168C286 118 250 84 200 84Z" fill="#111111" />
		<path d="M126 154C112 204 94 268 78 346" stroke="#fceee3" stroke-opacity="0.22" stroke-width="1.3" stroke-linecap="round" />
		<path d="M274 154C288 204 306 268 322 346" stroke="#fceee3" stroke-opacity="0.22" stroke-width="1.3" stroke-linecap="round" />
		<path d="M142 124C160 102 240 102 258 124C272 146 276 196 278 242C258 296 232 322 200 326C168 322 142 296 122 242C124 196 128 146 142 124Z" fill="#151515" stroke="#fceee3" stroke-opacity="0.28" stroke-width="1.15" />
		<path d="M150 154C156 140 184 139 200 141C216 139 244 140 250 154C251 164 245 174 236 177C214 170 186 170 164 177C155 174 149 164 150 154Z" fill="#fceee3" />
		<path d="M149 149C176 141 224 141 251 149" stroke="#111111" stroke-width="1.6" />
		<g>
			<path d="M161 153C169 148 180 148 188 152" stroke="#111111" stroke-width="1.7" stroke-linecap="round" />
			<path d="M163 161C170 156 180 156 187 161C180 165 170 165 163 161Z" fill="#ffffff" stroke="#111111" stroke-width="1.35" />
			<circle cx="175" cy="160.5" r="2.8" fill="#111111" />
			<circle cx="176" cy="159.5" r="0.9" fill="#ffffff" />
			<path d="M163 161L159 159" stroke="#111111" stroke-width="1.2" stroke-linecap="round" />
			<path d="M212 152C220 148 231 148 239 153" stroke="#111111" stroke-width="1.7" stroke-linecap="round" />
			<path d="M213 161C220 156 230 156 237 161C230 165 220 165 213 161Z" fill="#ffffff" stroke="#111111" stroke-width="1.35" />
			<circle cx="225" cy="160.5" r="2.8" fill="#111111" />
			<circle cx="226" cy="159.5" r="0.9" fill="#ffffff" />
			<path d="M237 161L241 159" stroke="#111111" stroke-width="1.2" stroke-linecap="round" />
		</g>
		<path d="M148 171C174 167 190 164 200 164C210 164 226 167 252 171L265 268C244 298 220 310 200 310C180 310 156 298 135 268L148 171Z" fill="#111111" stroke="#fceee3" stroke-opacity="0.45" stroke-width="1.2" />
		<path d="M150 172C176 168 190 165 200 165C210 165 224 168 250 172" stroke="#fceee3" stroke-width="1.2" stroke-linecap="round" />
		<path d="M146 270C172 296 228 296 254 270" stroke="#d9541e" stroke-width="1.4" stroke-linecap="round" />
		<circle cx="200" cy="292" r="2.2" fill="#d9541e" />
		<circle cx="178" cy="287" r="1.4" fill="#fceee3" />
		<circle cx="222" cy="287" r="1.4" fill="#fceee3" />
		<path d="M200 182C198 214 195 244 192 272" stroke="#fceee3" stroke-opacity="0.16" stroke-width="1.1" stroke-linecap="round" />
		<path d="M90 328C124 318 164 334 194 364L168 416C132 396 102 374 78 352Z" fill="#111111" stroke="#fceee3" stroke-opacity="0.38" stroke-width="1.2" />
		<path d="M188 358L162 410" stroke="#d9541e" stroke-width="3" stroke-linecap="round" />
		<path d="M180 353L154 405" stroke="#fceee3" stroke-opacity="0.7" stroke-width="1.1" stroke-dasharray="2 4" />
		<g>
			<path d="M178 370C190 361 206 362 216 368C226 374 236 378 238 386C230 393 218 394 208 394C198 397 184 398 172 392C168 384 171 376 178 370Z" fill="#fceee3" stroke="#111111" stroke-width="1.3" />
			<path d="M206 368C218 364 230 368 234 374" stroke="#111111" stroke-width="1.25" stroke-linecap="round" />
			<path d="M229 371L235 375" stroke="#d9541e" stroke-width="2.6" stroke-linecap="round" />
			<path d="M231 382L237 385" stroke="#d9541e" stroke-width="2.4" stroke-linecap="round" />
			<circle cx="196" cy="380" r="2.2" fill="#d9541e" />
			<path d="M184 384C190 379 198 381 206 385" stroke="#d9541e" stroke-width="1.1" stroke-linecap="round" />
			<g transform="translate(226 352) rotate(32)">
				<path d="M0 -34L10 16C10 21 5 25 0 25C-5 25 -10 21 -10 16L0 -34Z" fill="#d9541e" stroke="#111111" stroke-width="1.3" />
				<path d="M0 -34V-42" stroke="#111111" stroke-width="1.5" stroke-linecap="round" />
				<path d="M-7 6H7" stroke="#fceee3" stroke-width="1.1" />
				<path d="M-4 -9H4" stroke="#fceee3" stroke-width="1.1" />
			</g>
			<path d="M250 388C272 384 294 396 298 416C302 434 286 448 268 446C254 444 246 432 254 420C260 412 272 414 276 422" stroke="#d9541e" stroke-width="2" stroke-linecap="round" />
			<circle cx="268" cy="424" r="2.6" fill="#fceee3" stroke="#d9541e" stroke-width="1.2" />
			<circle cx="305" cy="402" r="2" fill="#d9541e" />
			<circle cx="311" cy="418" r="1.7" fill="#fceee3" />
			<circle cx="242" cy="442" r="1.7" fill="#fceee3" />
		</g>
		<path d="M96 458H304" stroke="#fceee3" stroke-opacity="0.28" stroke-width="1" />
		<circle cx="200" cy="458" r="3" fill="#d9541e" />
	</svg>
	<?php
	return ob_get_clean();
}

/**
 * Fallback Architectural SVG Plates for Gallery items when remote/local images aren't loaded yet
 */
function mbs_svg_plate_artwork( $plate_id = 'bridal-mandala', $class = '' ) {
	$cls = esc_attr( $class );
	ob_start();
	switch ( $plate_id ) {
		case 'chinar-silhouette':
			?>
			<svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="<?php echo $cls; ?>">
				<rect width="400" height="400" fill="#111111" />
				<rect x="20" y="20" width="360" height="360" rx="14" stroke="#fceee3" stroke-opacity="0.2" stroke-width="1" />
				<circle cx="200" cy="200" r="128" stroke="#fceee3" stroke-opacity="0.16" stroke-width="1" stroke-dasharray="4 6" />
				<g transform="translate(200 206)">
					<path d="M0 104V62M0 62C-18 68 -56 76 -84 56C-62 42 -42 32 -28 24C-62 12 -98 -8 -110 -34C-80 -34 -56 -26 -38 -16C-44 -58 -24 -102 0 -132C24 -102 44 -58 38 -16C56 -26 80 -34 110 -34C98 -8 62 12 28 24C42 32 62 42 84 56C56 76 18 68 0 62Z" stroke="#fceee3" stroke-width="1.6" stroke-linejoin="round" />
					<path d="M0 62V-112" stroke="#d9541e" stroke-width="1.6" stroke-linecap="round" />
					<path d="M0 18L-92 -28M0 18L92 -28M0 44L-68 50M0 44L68 50" stroke="#d9541e" stroke-width="1.3" stroke-linecap="round" />
					<circle cx="0" cy="-138" r="3.5" fill="#d9541e" />
					<circle cx="-116" cy="-38" r="2.8" fill="#d9541e" />
					<circle cx="116" cy="-38" r="2.8" fill="#d9541e" />
					<circle cx="-88" cy="60" r="2.5" fill="#fceee3" />
					<circle cx="88" cy="60" r="2.5" fill="#fceee3" />
				</g>
			</svg>
			<?php
			break;
		case 'sunburst-medallion':
			?>
			<svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="<?php echo $cls; ?>">
				<rect width="400" height="500" fill="#ffffff" />
				<rect x="20" y="20" width="360" height="460" rx="14" stroke="#e5e5e5" stroke-width="1" />
				<g transform="translate(200 250)">
					<circle r="136" stroke="#111111" stroke-width="1.2" />
					<circle r="62" stroke="#d9541e" stroke-width="1.5" />
					<circle r="22" fill="#d9541e" />
					<circle r="8" fill="#fceee3" />
					<?php for ( $i = 0; $i < 24; $i++ ) : ?>
						<g transform="rotate(<?php echo esc_attr( $i * 15 ); ?>)">
							<line x1="0" y1="-68" x2="0" y2="<?php echo 0 === $i % 2 ? '-128' : '-104'; ?>" stroke="<?php echo 0 === $i % 2 ? '#111111' : '#d9541e'; ?>" stroke-width="<?php echo 0 === $i % 2 ? '1.5' : '1.1'; ?>" stroke-linecap="round" />
							<?php if ( 0 === $i % 2 ) : ?>
								<circle cx="0" cy="-144" r="2.6" fill="#111111" />
							<?php endif; ?>
						</g>
					<?php endfor; ?>
				</g>
				<path d="M168 430C184 442 216 442 232 430" stroke="#d9541e" stroke-width="1.4" stroke-linecap="round" />
				<path d="M168 70C184 58 216 58 232 70" stroke="#111111" stroke-width="1.4" stroke-linecap="round" />
			</svg>
			<?php
			break;
		case 'lotus-jali':
			?>
			<svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="<?php echo $cls; ?>">
				<rect width="400" height="500" fill="#ffffff" />
				<rect x="20" y="20" width="360" height="460" rx="14" stroke="#e5e5e5" stroke-width="1" />
				<g stroke="#e5e5e5" stroke-width="1.1">
					<path d="M60 90L340 370M130 90L340 300M200 90L340 230M60 160L310 410M60 230L240 410" />
					<path d="M340 90L60 370M270 90L60 300M200 90L60 230M340 160L90 410M340 230L160 410" />
				</g>
				<g transform="translate(200 220)">
					<circle r="86" fill="#ffffff" stroke="#111111" stroke-width="1.4" />
					<path d="M0 -64C18 -40 22 -10 0 28C-22 -10 -18 -40 0 -64Z" fill="#d9541e" />
					<path d="M0 28C-38 14 -64 -18 -56 -48C-30 -36 -10 -6 0 28Z" stroke="#111111" stroke-width="1.5" fill="#ffffff" />
					<path d="M0 28C38 14 64 -18 56 -48C30 -36 10 -6 0 28Z" stroke="#111111" stroke-width="1.5" fill="#ffffff" />
					<circle cx="0" cy="-74" r="3" fill="#111111" />
					<path d="M0 28V64" stroke="#111111" stroke-width="1.5" />
				</g>
			</svg>
			<?php
			break;
		case 'mughal-archways':
			?>
			<svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="<?php echo $cls; ?>">
				<rect width="400" height="500" fill="#111111" />
				<path d="M44 452V210C44 172 64 146 92 126C124 104 166 86 200 52C234 86 276 104 308 126C336 146 356 172 356 210V452H44Z" stroke="#fceee3" stroke-width="1.5" />
				<path d="M72 452V218C72 186 88 164 114 146C140 128 172 112 200 84C228 112 260 128 286 146C312 164 328 186 328 218V452" stroke="#d9541e" stroke-width="1.4" />
				<path d="M200 84V360" stroke="#fceee3" stroke-opacity="0.6" stroke-width="1.2" />
				<?php foreach ( array( 140, 210, 280, 350 ) as $idx => $y ) : ?>
					<g transform="translate(200 <?php echo esc_attr( $y ); ?>)">
						<circle r="<?php echo esc_attr( 24 - $idx * 3 ); ?>" stroke="#d9541e" stroke-width="1.3" fill="#111111" />
						<circle r="<?php echo esc_attr( 10 - $idx ); ?>" fill="#fceee3" />
						<circle r="3" fill="#d9541e" />
					</g>
				<?php endforeach; ?>
				<path d="M84 416H316" stroke="#fceee3" stroke-opacity="0.35" stroke-width="1.1" />
			</svg>
			<?php
			break;
		case 'hathphool-cuff':
			?>
			<svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="<?php echo $cls; ?>">
				<rect width="400" height="500" fill="#ffffff" />
				<rect x="20" y="20" width="360" height="460" rx="14" stroke="#e5e5e5" stroke-width="1" />
				<path d="M82 372H318M82 390H318M82 408H318" stroke="#111111" stroke-width="1.4" />
				<?php for ( $idx = 0; $idx < 9; $idx++ ) : ?>
					<circle cx="<?php echo esc_attr( 100 + $idx * 25 ); ?>" cy="390" r="3.2" fill="<?php echo 0 === $idx % 2 ? '#d9541e' : '#111111'; ?>" />
				<?php endfor; ?>
				<path d="M110 372C128 310 162 276 200 248C238 276 272 310 290 372" stroke="#d9541e" stroke-width="1.4" stroke-dasharray="4 5" />
				<path d="M200 248V122M138 154L200 248L262 154" stroke="#111111" stroke-width="1.35" stroke-linecap="round" />
				<g transform="translate(200 248)">
					<rect x="-24" y="-24" width="48" height="48" transform="rotate(45)" fill="#111111" stroke="#d9541e" stroke-width="1.6" />
					<circle r="10" fill="#fceee3" />
					<circle r="4" fill="#d9541e" />
				</g>
				<ellipse cx="138" cy="142" rx="14" ry="18" stroke="#111111" stroke-width="1.4" />
				<ellipse cx="200" cy="112" rx="16" ry="20" stroke="#d9541e" stroke-width="1.6" />
				<ellipse cx="262" cy="142" rx="14" ry="18" stroke="#111111" stroke-width="1.4" />
				<circle cx="200" cy="112" r="4" fill="#111111" />
			</svg>
			<?php
			break;
		case 'bridal-mandala':
		default:
			?>
			<svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="<?php echo $cls; ?>">
				<rect width="400" height="500" fill="#ffffff" />
				<rect x="20" y="20" width="360" height="460" rx="14" stroke="#e5e5e5" stroke-width="1" />
				<g transform="translate(200 245)">
					<circle r="134" stroke="#e5e5e5" stroke-width="1" stroke-dasharray="3 5" />
					<circle r="112" stroke="#111111" stroke-width="1.4" />
					<circle r="76" stroke="#d9541e" stroke-width="1.2" />
					<circle r="36" stroke="#111111" stroke-width="1.4" />
					<circle r="10" fill="#111111" />
					<circle r="4" fill="#d9541e" />
					<?php for ( $i = 0; $i < 16; $i++ ) : ?>
						<g transform="rotate(<?php echo esc_attr( $i * 22.5 ); ?>)">
							<path d="M0 -76C10 -94 10 -106 0 -114C-10 -106 -10 -94 0 -76Z" fill="<?php echo 0 === $i % 2 ? '#111111' : 'none'; ?>" stroke="#111111" stroke-width="1.15" />
							<circle cx="0" cy="-124" r="2.2" fill="#d9541e" />
						</g>
					<?php endfor; ?>
					<?php for ( $j = 0; $j < 8; $j++ ) : ?>
						<g transform="rotate(<?php echo esc_attr( $j * 45 ); ?>)">
							<path d="M0 -36C12 -50 12 -64 0 -72C-12 -64 -12 -50 0 -36Z" stroke="#d9541e" stroke-width="1.2" />
						</g>
					<?php endfor; ?>
				</g>
				<path d="M90 426H310M90 438H310" stroke="#111111" stroke-width="1.3" />
				<path d="M110 438L130 456L150 438L170 456L190 438L210 456L230 438L250 456L270 438L290 456" stroke="#d9541e" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			<?php
			break;
	}
	return ob_get_clean();
}

