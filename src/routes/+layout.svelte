<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { navigationGroups } from '$lib/navigation/navigation';
	import '$lib/styles/global.css';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
	let menuOpen = $state(false);

	function closeMenu(): void {
		menuOpen = false;
	}

	function handleWindowKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') closeMenu();
	}

	function isCurrent(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<a class="skip-link" href="#main-content">Skip to main content</a>

<header class="site-header">
	<div class="site-header__inner">
		<a class="wordmark" href={resolve('/')} aria-label="Aircraft Systems Tester home">
			<span class="wordmark__mark" aria-hidden="true">AST</span>
			<span>Aircraft Systems Tester</span>
		</a>
		<button
			class="menu-button"
			type="button"
			aria-controls="primary-navigation"
			aria-expanded={menuOpen}
			onclick={() => (menuOpen = !menuOpen)}
		>
			{menuOpen ? 'Close menu' : 'Menu'}
		</button>
	</div>
</header>

<div class="app-frame">
	<nav id="primary-navigation" class="primary-navigation" aria-label="Primary" data-open={menuOpen}>
		{#each navigationGroups as group (group.label)}
			<section
				class="navigation-group"
				aria-labelledby={`nav-${group.label.toLowerCase().replaceAll(' ', '-')}`}
			>
				<h2 id={`nav-${group.label.toLowerCase().replaceAll(' ', '-')}`}>{group.label}</h2>
				<ul>
					{#each group.items as item (item.id)}
						<li>
							<a
								href={resolve(item.href as '/')}
								aria-current={isCurrent(item.href) ? 'page' : undefined}
								onclick={closeMenu}
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</nav>

	<main id="main-content" class="page-main" tabindex="-1">
		{@render children()}
	</main>
</div>

<footer class="site-footer">
	<p>Foundation environment — do not enter production or protected assessment data.</p>
</footer>
