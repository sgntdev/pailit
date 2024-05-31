
<script>
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	injectSpeedInsights();
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	inject({ mode: dev ? 'development' : 'production' });
	import '../../../../app.pcss';
	
</script>

<svelte:head>
	<title>PAILIT</title>
</svelte:head>
<main class="flex min-h-screen flex-col items-center justify-center">
	<slot />
</main>