<?php
/**
 * Generic Archive / Fallback Index Template
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<header class="mbs-masthead">
	<div class="editorial-container">
		<span class="eyebrow"><?php esc_html_e( 'Atelier Journal & Archive', 'mehandibysana' ); ?></span>
		<h1 style="font-size:clamp(2.25rem,4vw,3.15rem);margin-top:0.5rem;">
			<?php echo esc_html( is_archive() ? get_the_archive_title() : get_bloginfo( 'name' ) ); ?>
		</h1>
	</div>
</header>

<section class="section-pad surface-bg">
	<div class="editorial-container">
		<?php if ( have_posts() ) : ?>
			<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">
				<?php while ( have_posts() ) : the_post(); ?>
					<article style="border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:1.75rem;background:var(--color-bg);">
						<span class="eyebrow eyebrow-muted"><?php echo esc_html( get_the_date() ); ?></span>
						<h2 style="font-size:1.65rem;margin-top:0.5rem;">
							<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
						</h2>
						<p style="margin-top:0.65rem;color:var(--color-text-muted);font-size:0.9rem;">
							<?php echo esc_html( wp_trim_words( get_the_excerpt(), 26 ) ); ?>
						</p>
						<p style="margin-top:1rem;">
							<a href="<?php the_permalink(); ?>" class="mbs-btn mbs-btn-secondary mbs-btn-sm"><?php esc_html_e( 'Read Article →', 'mehandibysana' ); ?></a>
						</p>
					</article>
				<?php endwhile; ?>
			</div>
			<?php the_posts_pagination(); ?>
		<?php else : ?>
			<p><?php esc_html_e( 'No entries published here yet.', 'mehandibysana' ); ?></p>
		<?php endif; ?>
	</div>
</section>

<?php get_footer(); ?>

