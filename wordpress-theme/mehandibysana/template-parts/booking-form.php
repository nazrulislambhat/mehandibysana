<?php
/**
 * Shared Bridal & Studio Booking Inquiry Form (`#mbs-booking-form`)
 * Submits asynchronously via `mbs_submit_booking` to `mbs_booking` CPT + email notification.
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$default_service = $args['service'] ?? 'bridal';
$studio_phone    = function_exists( 'mbs_get_studio_phone' ) ? mbs_get_studio_phone() : '+91-9149648717';
$wa_digits       = function_exists( 'mbs_get_studio_whatsapp_digits' ) ? mbs_get_studio_whatsapp_digits() : '919149648717';
?>
<div>
	<form id="mbs-booking-form" novalidate style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:2rem;">
		<!-- Honeypot field -->
		<div class="sr-only" aria-hidden="true">
			<label for="mbs_company_website">Company Website</label>
			<input type="text" id="mbs_company_website" name="companyWebsite" tabindex="-1" autocomplete="off" />
		</div>

		<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1rem;">
			<div class="mbs-form-field">
				<label for="mbs_inq_name" class="mbs-form-label"><?php esc_html_e( 'Your Full Name *', 'mehandibysana' ); ?></label>
				<input id="mbs_inq_name" name="name" type="text" required placeholder="e.g. Ayesha Lone" class="mbs-input" />
			</div>
			<div class="mbs-form-field">
				<label for="mbs_inq_email" class="mbs-form-label"><?php esc_html_e( 'Email Address *', 'mehandibysana' ); ?></label>
				<input id="mbs_inq_email" name="email" type="email" required placeholder="ayesha@example.com" class="mbs-input" />
			</div>
		</div>

		<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1rem;">
			<div class="mbs-form-field">
				<label for="mbs_inq_phone" class="mbs-form-label"><?php esc_html_e( 'Phone / WhatsApp', 'mehandibysana' ); ?></label>
				<input id="mbs_inq_phone" name="phone" type="tel" placeholder="+91 98..." class="mbs-input" />
			</div>
			<div class="mbs-form-field">
				<label for="mbs_inq_service" class="mbs-form-label"><?php esc_html_e( 'Commission / Service Type', 'mehandibysana' ); ?></label>
				<select id="mbs_inq_service" name="service" class="mbs-select">
					<option value="bridal" <?php selected( $default_service, 'bridal' ); ?>><?php esc_html_e( 'Bridal Mehndi Commission', 'mehandibysana' ); ?></option>
					<option value="events" <?php selected( $default_service, 'events' ); ?>><?php esc_html_e( 'Events, Sangeet & Gatherings', 'mehandibysana' ); ?></option>
					<option value="botanical" <?php selected( $default_service, 'botanical' ); ?>><?php esc_html_e( 'Bulk Cone Orders / Workshop', 'mehandibysana' ); ?></option>
					<option value="order-support" <?php selected( $default_service, 'order-support' ); ?>><?php esc_html_e( 'Online Order Question', 'mehandibysana' ); ?></option>
				</select>
			</div>
		</div>

		<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1rem;">
			<div class="mbs-form-field">
				<label for="mbs_inq_date" class="mbs-form-label"><?php esc_html_e( 'Preferred Ceremony Date', 'mehandibysana' ); ?></label>
				<input id="mbs_inq_date" name="eventDate" type="date" class="mbs-input" />
			</div>
			<div class="mbs-form-field">
				<label for="mbs_inq_location" class="mbs-form-label"><?php esc_html_e( 'Venue / City', 'mehandibysana' ); ?></label>
				<input id="mbs_inq_location" name="location" type="text" placeholder="Srinagar / Delhi / Destination" class="mbs-input" />
			</div>
		</div>

		<div class="mbs-form-field">
			<label for="mbs_inq_message" class="mbs-form-label"><?php esc_html_e( 'Ceremony Details or Batch Inquiry *', 'mehandibysana' ); ?></label>
			<textarea id="mbs_inq_message" name="message" rows="4" required placeholder="<?php esc_attr_e( 'Tell us your event dates, guest count, preferred design style (Kashmiri Mandala, Mughal Arches), or wholesale batch quantity...', 'mehandibysana' ); ?>" class="mbs-textarea"></textarea>
		</div>

		<div id="mbs-booking-error" style="display:none;color:var(--color-error);background:#fef2f2;border:1px solid #fecaca;padding:10px 14px;border-radius:var(--radius-md);margin-bottom:1rem;font-size:0.875rem;"></div>

		<div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:space-between;margin-top:0.5rem;">
			<button type="submit" class="mbs-btn mbs-btn-primary mbs-btn-lg">
				<?php esc_html_e( 'Send Studio Inquiry', 'mehandibysana' ); ?>
			</button>
			<a href="https://wa.me/<?php echo esc_attr( $wa_digits ); ?>" target="_blank" rel="noopener noreferrer" style="font-size:0.84rem;color:var(--color-text-muted);text-decoration:underline;text-underline-offset:4px;">
				<?php printf( esc_html__( 'Or WhatsApp %s', 'mehandibysana' ), esc_html( $studio_phone ) ); ?>
			</a>
		</div>
	</form>

	<!-- Ink Black Confirmation Card -->
	<div id="mbs-booking-success" class="mbs-dossier-ink" style="display:none;">
		<span class="eyebrow" style="color:var(--color-accent);"><?php esc_html_e( 'Inquiry Logged at Srinagar Desk', 'mehandibysana' ); ?></span>
		<h3 style="font-size:2.1rem;margin-top:0.5rem;"><?php esc_html_e( 'Assalamu Alaikum — We Received Your Note', 'mehandibysana' ); ?></h3>
		<p style="margin-top:0.75rem;color:rgba(252,238,227,0.8);font-size:0.95rem;line-height:1.65;">
			<?php esc_html_e( 'Our studio manager responds within 24 hours via email & WhatsApp.', 'mehandibysana' ); ?>
		</p>
		<div style="margin:1.25rem 0;padding:1rem 1.25rem;background:rgba(255,255,255,0.06);border:1px solid rgba(252,238,227,0.16);border-radius:var(--radius-md);display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
			<div>
				<div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.14em;opacity:0.65;"><?php esc_html_e( 'Inquiry Reference', 'mehandibysana' ); ?></div>
				<div data-mbs-ref style="font-family:var(--font-mono);font-size:1.1rem;font-weight:700;color:var(--color-accent);">INQ-STUDIO</div>
			</div>
			<div>
				<div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.14em;opacity:0.65;"><?php esc_html_e( 'Confirmation Copy', 'mehandibysana' ); ?></div>
				<div data-mbs-client-email style="font-size:0.95rem;">—</div>
			</div>
		</div>
		<div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
			<a href="https://wa.me/<?php echo esc_attr( $wa_digits ); ?>" target="_blank" rel="noopener noreferrer" class="mbs-btn mbs-btn-primary mbs-btn-sm">
				<?php esc_html_e( 'Follow Up on WhatsApp →', 'mehandibysana' ); ?>
			</a>
			<button type="button" id="mbs-booking-reset" class="mbs-btn mbs-btn-inverse-outline mbs-btn-sm">
				<?php esc_html_e( 'Send Another Inquiry', 'mehandibysana' ); ?>
			</button>
		</div>
	</div>
</div>

