<!-- src/lib/components/Toast.svelte -->
<script>
	import { toast } from '$lib/toastStore';
	import { fly } from 'svelte/transition';
	import { Toast } from 'flowbite-svelte';
	import { CheckCircleSolid, XCircleSolid, ExclamationCircleSolid } from 'flowbite-svelte-icons';

	let toastMessage;
	let toastType;
	let showToast;

	$: {
		toast.subscribe((value) => {
			toastMessage = value.message;
			toastType = value.type;
			showToast = value.show;
		});
	}
</script>

{#if showToast}
	<div transition:fly={{ x: 200 }} class="top-95 fixed end-3 z-30">
		<Toast color={toastType === 'success' ? 'green' : toastType === 'error' ? 'red' : 'orange'}>
			<svelte:fragment slot="icon">
				{#if toastType === 'success'}
					<CheckCircleSolid class="h-5 w-5" />
					<span class="sr-only">Check icon</span>
				{:else if toastType === 'error'}
					<XCircleSolid class="h-5 w-5" />
					<span class="sr-only">Error icon</span>
				{:else}
					<ExclamationCircleSolid class="h-5 w-5" />
					<span class="sr-only">Info icon</span>
				{/if}
			</svelte:fragment>
			{toastMessage}
		</Toast>
	</div>
{/if}
