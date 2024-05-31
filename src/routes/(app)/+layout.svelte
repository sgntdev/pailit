<script>
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { PUBLIC_SITE_URL } from '$env/static/public';
	injectSpeedInsights();
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	inject({ mode: dev ? 'development' : 'production' });
	import '../../app.pcss';
	import { goto } from '$app/navigation';
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	export let data;
	const { user } = data;
	const handleLogout = () => {
		goto('/logout');
	};
</script>

<svelte:head>
	<title>PAILIT</title>
</svelte:head>
<nav
	data-sveltekit-reload
	class="relative top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
>
	<div class="px-3 py-3 lg:px-5 lg:pl-3">
		<div class="flex items-center justify-between">
			<div class="flex items-center justify-start rtl:justify-end">
				<a href="/" class="ms-2 flex md:me-24">
					<span
						class="self-center whitespace-nowrap text-xl font-semibold dark:text-white sm:text-2xl"
						>PAILIT</span
					>
				</a>
			</div>
			<div class="flex items-center lg:order-2">
				{#if user}
					<Button color="light"><p>{user.slice(0, user.indexOf('@'))}</p></Button>
					<Dropdown>
						<div class="px-4 py-3">
							<span class="block text-sm font-semibold text-gray-900 dark:text-white"
								>{user}</span
							>
							<span class="block truncate text-sm text-gray-900 dark:text-white"
								>Kreditor</span
							>
						</div>
						<DropdownItem on:click={handleLogout}>Logout</DropdownItem>
					</Dropdown>
				{:else}
					<Button color="light" href="/login">Login</Button>
				{/if}
			</div>
		</div>
	</div>
</nav>
<main class="p-4">
	<slot />
</main>
