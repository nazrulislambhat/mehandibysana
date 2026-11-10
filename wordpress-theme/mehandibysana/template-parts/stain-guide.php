<?php
/**
 * Interactive Botanical Stain Oxidation Simulator (4 Skin Tones x 3 Oxidation Phases + Slider)
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$bg_class = ! empty( $args['linen'] ) ? 'surface-linen' : 'surface-bg';
?>
<section class="section-pad hairline-rule <?php echo esc_attr( $bg_class ); ?>" data-mbs-stain-guide>
	<div class="editorial-container">
		<div class="mbs-section-header reveal-fade-block">
			<div>
				<span class="eyebrow"><?php esc_html_e( 'Zero-PPD Botanical Science', 'mehandibysana' ); ?></span>
				<h2 class="mbs-section-title"><?php esc_html_e( '48-Hour Natural Stain Oxidation', 'mehandibysana' ); ?></h2>
			</div>
			<p style="max-width:30rem;color:var(--color-text-muted);font-size:0.9375rem;">
				<?php esc_html_e( 'Genuine chemical-free Sojat henna starts bright tangerine upon scraping and deepens naturally over two full days. Preview how it matures across skin undertones.', 'mehandibysana' ); ?>
			</p>
		</div>

		<div class="mbs-stain-grid">
			<!-- Left Column: Interactive SVG Palm & Skin Tone Selector -->
			<div class="mbs-palm-card reveal-fade-block">
				<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
					<span class="eyebrow eyebrow-muted"><?php esc_html_e( 'Select Skin Undertone', 'mehandibysana' ); ?></span>
					<div class="mbs-tone-swatches">
						<button type="button" class="mbs-tone-btn" data-mbs-tone="fair">
							<span class="mbs-tone-dot" style="background:#f7decb;"></span><span>Fair</span>
						</button>
						<button type="button" class="mbs-tone-btn is-active" data-mbs-tone="medium">
							<span class="mbs-tone-dot" style="background:#dfb18d;"></span><span>Wheatish</span>
						</button>
						<button type="button" class="mbs-tone-btn" data-mbs-tone="olive">
							<span class="mbs-tone-dot" style="background:#b97e54;"></span><span>Warm Olive</span>
						</button>
						<button type="button" class="mbs-tone-btn" data-mbs-tone="deep">
							<span class="mbs-tone-dot" style="background:#79492d;"></span><span>Deep</span>
						</button>
					</div>
				</div>

				<div class="aspect-4-5" style="border-radius:var(--radius-lg);background:var(--color-surface);border:1px solid var(--color-border);display:flex;align-items:center;justify-content:center;padding:1rem;">
					<svg id="mbs-palm-svg" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="<?php esc_attr_e( 'Interactive henna stain maturity palm diagram', 'mehandibysana' ); ?>" style="width:100%;height:100%;max-height:380px;">
						<!-- Stylized Anatomical Palm & Fingers -->
						<path id="mbs-palm-base" d="M108 380V268C94 252 72 222 66 202C60 184 74 172 86 184L104 206V116C104 102 124 102 124 116V184L130 92C131 76 153 76 154 92V180L162 82C163 66 185 66 186 82V182L198 106C200 91 220 93 218 109V216C232 232 238 266 218 296L212 380H108Z" fill="#dfb18d" stroke="#bf8b66" stroke-width="2" />
						<!-- Subtle Palm Creases -->
						<path class="mbs-palm-crease" d="M126 232C150 226 176 230 198 244" stroke="#9c6744" stroke-width="1.2" stroke-linecap="round" opacity="0.55" />
						<path class="mbs-palm-crease" d="M122 254C146 264 166 286 176 312" stroke="#9c6744" stroke-width="1.2" stroke-linecap="round" opacity="0.45" />
						<!-- Botanical Mandala & Finger Caps Colored Live by Stage -->
						<g transform="translate(158 258)">
							<circle class="mbs-motif-primary" r="34" stroke="#5a1d0d" stroke-width="2.2" />
							<circle class="mbs-motif-secondary" r="22" stroke="#7e2a14" stroke-width="1.5" stroke-dasharray="3 3" />
							<circle class="mbs-motif-primary" data-fill="1" r="7" fill="#5a1d0d" />
							<path class="mbs-motif-primary" d="M0 -34C6 -46 6 -56 0 -64C-6 -56 -6 -46 0 -34Z" stroke="#5a1d0d" stroke-width="1.7" />
							<path class="mbs-motif-primary" d="M0 34C6 46 6 56 0 64C-6 56 -6 46 0 34Z" stroke="#5a1d0d" stroke-width="1.7" />
							<path class="mbs-motif-primary" d="M-34 0C-46 6 -56 6 -64 0C-56 -6 -46 -6 -34 0Z" stroke="#5a1d0d" stroke-width="1.7" />
							<path class="mbs-motif-primary" d="M34 0C46 6 56 6 64 0C56 -6 46 -6 34 0Z" stroke="#5a1d0d" stroke-width="1.7" />
							<path class="mbs-motif-secondary" d="M-24 -24L-38 -38M24 -24L38 -38M-24 24L-38 38M24 24L38 38" stroke="#7e2a14" stroke-width="1.4" stroke-linecap="round" />
						</g>
						<!-- Finger Tip Caps & Vine Bands -->
						<path class="mbs-motif-primary" d="M107 128C110 112 120 112 121 128Z" stroke="#5a1d0d" stroke-width="2" />
						<path class="mbs-motif-primary" d="M133 102C136 86 148 86 151 102Z" stroke="#5a1d0d" stroke-width="2" />
						<path class="mbs-motif-primary" d="M165 92C168 76 180 76 183 92Z" stroke="#5a1d0d" stroke-width="2" />
						<path class="mbs-motif-primary" d="M200 118C203 103 213 105 215 120Z" stroke="#5a1d0d" stroke-width="2" />
						<path class="mbs-motif-secondary" d="M136 142H148M168 134H180M108 160H120" stroke="#7e2a14" stroke-width="1.8" stroke-linecap="round" />
					</svg>
				</div>
			</div>

			<!-- Right Column: 3 Oxidation Stages + Scrubber + Aftercare Dossier -->
			<div style="display:flex;flex-direction:column;gap:1.35rem;" class="reveal-fade-block">
				<div class="mbs-stage-tabs">
					<button type="button" class="mbs-stage-card" data-mbs-stage-idx="0">
						<span class="eyebrow">01 &middot; Hour 0–2</span>
						<div style="font-family:var(--font-serif);font-size:1.25rem;font-weight:600;margin-top:4px;color:var(--color-ink);">
							<?php esc_html_e( 'Tangerine Scraping', 'mehandibysana' ); ?>
						</div>
					</button>
					<button type="button" class="mbs-stage-card" data-mbs-stage-idx="1">
						<span class="eyebrow">02 &middot; Hour 12–24</span>
						<div style="font-family:var(--font-serif);font-size:1.25rem;font-weight:600;margin-top:4px;color:var(--color-ink);">
							<?php esc_html_e( 'Amber Oxidation', 'mehandibysana' ); ?>
						</div>
					</button>
					<button type="button" class="mbs-stage-card is-active" data-mbs-stage-idx="2">
						<span class="eyebrow">03 &middot; Hour 36–48</span>
						<div style="font-family:var(--font-serif);font-size:1.25rem;font-weight:600;margin-top:4px;color:var(--color-ink);">
							<?php esc_html_e( 'Deep Mahogany Peak', 'mehandibysana' ); ?>
						</div>
					</button>
				</div>

				<div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:1.1rem 1.35rem;">
					<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
						<label for="mbs-stain-slider" class="eyebrow eyebrow-muted"><?php esc_html_e( 'Drag Timeline Oxidation Scrubber', 'mehandibysana' ); ?></label>
						<span class="eyebrow" data-mbs-ui-hour>Hour 36–48</span>
					</div>
					<input id="mbs-stain-slider" type="range" min="0" max="100" value="92" class="mbs-stain-slider" />
				</div>

				<div class="mbs-stain-dossier">
					<div style="display:flex;align-items:center;gap:14px;">
						<span data-mbs-ui-swatch style="width:42px;height:42px;border-radius:999px;background:#5a1d0d;border:2px solid var(--color-border-strong);flex-shrink:0;"></span>
						<div>
							<h3 data-mbs-ui-title style="font-size:1.65rem;color:var(--color-ink);"><?php esc_html_e( 'Deep Mahogany Peak Maturity', 'mehandibysana' ); ?></h3>
							<div data-mbs-ui-shade style="font-size:0.875rem;color:var(--color-accent);font-weight:500;">
								<?php esc_html_e( 'Rich Kashmiri Maroon & Espresso Mahogany', 'mehandibysana' ); ?>
							</div>
						</div>
					</div>

					<div class="mbs-stain-detail-cols">
						<div>
							<div class="eyebrow eyebrow-muted"><?php esc_html_e( 'Why It Looks Like This', 'mehandibysana' ); ?></div>
							<p data-mbs-ui-why style="font-size:0.875rem;color:var(--color-text-muted);margin-top:6px;line-height:1.6;">
								<?php esc_html_e( 'Complete botanical oxidation achieves its fullest, velvety depth—lasting 10 to 16 days cleanly as natural skin cells renew.', 'mehandibysana' ); ?>
							</p>
						</div>
						<div>
							<div class="eyebrow" style="color:var(--color-accent);"><?php esc_html_e( "Sana's Aftercare Ritual", 'mehandibysana' ); ?></div>
							<p data-mbs-ui-ritual style="font-size:0.875rem;color:var(--color-text-muted);margin-top:6px;line-height:1.6;">
								<?php esc_html_e( 'Continue moisturizing palms twice daily with balm; peak color photographs dramatically for bridal ceremonies 48 hours post-application.', 'mehandibysana' ); ?>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

