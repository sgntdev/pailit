<script>
    import '../app.pcss';
	import { page } from '$app/stores';
    // console.log($page.error, $page)
</script>

<section class="relative ">
    <div class="flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-svh pt:mt-0 dark:bg-gray-900">
        <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">{$page.status}</h1>
        <p class="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">{$page.error.message}</p>
        <p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">{$page.error.description ?? 'We are already working to solve the problem.'}</p>
    </div>
</section>