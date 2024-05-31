<script>
	import { goto } from '$app/navigation';
	import { Breadcrumb, BreadcrumbItem, Button, Spinner } from 'flowbite-svelte';

	let form;
	export let data;
	const { token, debitor } = data.body;
	let assetSelling = {
		debitorId: '',
		sellingPrice: ''
	};
	let loading = false;

	const handleAddAsset = async () => {
		loading = true;
		try {
			const response = await fetch('/api/assetselling', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(assetSelling)
			});
			const result = await response.json();
			if (result.success) {
				goto('./', {
					replaceState: true,
					state: {
						statusSuccess: true,
						message: result.message
					}
				});
			} else {
				form = result;
			}
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	};

    const formatPrice = (price) => {
		if (typeof price !== 'string') {
			price = price.toString(); // Convert to string if it's not already
		}
		const digits = price.replace(/,/g, '');
		const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		return formatted;
	};
</script>

<div class="space-y-4">
	<Breadcrumb aria-label="Default breadcrumb example" class="mb-4">
		<BreadcrumbItem href="/dashboard" home>Dashboard</BreadcrumbItem>
		<BreadcrumbItem href="/assetselling">List Asset Selling</BreadcrumbItem>
		<BreadcrumbItem>Tambah Asset</BreadcrumbItem>
	</Breadcrumb>

	<div class="min-h-max overflow-hidden rounded-lg border border-gray-200 p-8 dark:border-gray-700">
		<div class="space-y-4 sm:space-y-6">
			<h1
				class="text-xl font-semibold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl"
			>
				Tambah Debitor
			</h1>
			<form class="space-y-4 md:space-y-6" method="POST" on:submit|preventDefault={handleAddAsset}>
				<div class="grid gap-4 sm:gap-6 md:grid-cols-2">
					<div>
						<label
							for="debitorId"
							class={`mb-2 block text-sm font-medium ${assetSelling.debitorId === '' && form?.errors?.find((error) => error.field === 'debitorId') ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
							>Sifat/Golongan Tagihan</label
						>
						<select
							id="debitorId"
							name="debitorId"
							bind:value={assetSelling.debitorId}
							class={`block w-full rounded-lg border p-2.5 text-sm ${assetSelling.debitorId === '' && form?.errors?.find((error) => error.field === 'debitorId') ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-gray-700 dark:text-red-500 dark:placeholder-red-500' : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'}`}
						>
							<option value="" selected disabled>Pilih Debitor</option>
							{#each debitor as item}
								<option value={item.id}>{item.nama}</option>
							{/each}
						</select>
						{#if assetSelling.debitorId === '' && form?.errors?.find((error) => error.field === 'debitorId')}
							<p class="mt-2 text-xs font-normal text-red-700 dark:text-red-500">
								{form?.errors?.find((error) => error.field === 'debitorId').message}
							</p>
						{/if}
					</div>
                    <div>
                        <label
                            for="sellingPrice"
                            class={`mb-2 block text-sm font-medium ${form?.errors?.find((error) => error.field === 'sellingPrice') ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                            >Harga Asset</label
                        >
                        <div class="relative">
                            <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2.5">
                                <p
                                    class={`${form?.errors?.find((error) => error.field === 'sellingPrice') ? 'text-red-900 dark:text-red-500' : 'text-gray-500'}`}
                                >
                                    Rp.
                                </p>
                            </div>
                            <input
                                type="text"
                                name="sellingPrice"
                                placeholder="0"
                                id="sellingPrice"
                                bind:value={assetSelling.sellingPrice}
                                on:input={() => {
                                    assetSelling.sellingPrice = formatPrice(assetSelling.sellingPrice);
                                }}
                                class={`block w-full rounded-lg border p-2.5 ps-10 text-sm ${form?.errors?.find((error) => error.field === 'sellingPrice') ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-gray-700 dark:text-red-500 dark:placeholder-red-500' : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'}`}
                            />
                        </div>
                        {#if form?.errors?.find((error) => error.field === 'sellingPrice')}
                            <p class="mt-2 text-xs font-normal text-red-700 dark:text-red-500">
                                {form?.errors?.find((error) => error.field === 'sellingPrice').message}
                            </p>
                        {/if}
                    </div>
				</div>
				<Button type="submit" class="w-full md:w-fit">
					{#if loading}
						<Spinner color="white" size={4} />
					{:else}
						Simpan
					{/if}
				</Button>
			</form>
		</div>
	</div>
</div>
