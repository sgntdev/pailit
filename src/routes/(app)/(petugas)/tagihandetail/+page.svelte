<script>
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Breadcrumb,
		BreadcrumbItem,
		Badge,
		Indicator,
		Button,
		Spinner,
		Modal,
		Dropdown,
		DropdownItem,
		DropdownHeader,
		DropdownDivider
	} from 'flowbite-svelte';
	import { slide, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import { writable, derived } from 'svelte/store';
	import { onMount } from 'svelte';
	import { getContext } from 'svelte';
	import {
		EditSolid,
		ExclamationCircleOutline,
		MinusSolid,
		DotsHorizontalOutline
	} from 'flowbite-svelte-icons';
	import { showToast } from '$lib/toastStore';
	export let data;
	const { token } = data.body;
	const { sifatTagihanData } = data.body;
	// let tagihan;
	const chooseDebitor = getContext('Choose');
	const tagihan = writable([]);
	tagihan.set(data.body.tagihan);
	let tagihanInputsByRow = $tagihan.map(() => []);
	let loading = false;
	let openRow;
	// Modal Delete
	let deleteModal = false;
	let editModal = false;
	let deleteTargetId;
	let deleteTargetTagihanId;

	const tagihanByDebitor = derived([chooseDebitor, tagihan], ([$chooseDebitor, $tagihan]) =>
		$chooseDebitor == null ? $tagihan : $tagihan.filter((item) => item.debitorId === $chooseDebitor)
	);

	//Edit
	let dataEdit = {
		sifatTagihanId: '',
		tipe: '',
		amount: ''
	};

	onMount(() => {
		if ($page.state.statusSuccess) {
			showToast($page.state.message, 'success');
		}
	});

	const toggleRow = (i) => {
		openRow = openRow === i ? null : i;
	};

	const formatPrice = (price) => {
		if (typeof price !== 'string') {
			price = price.toString();
		}
		const digits = price.replace(/,/g, '');
		const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		return formatted;
	};
	function tambahInput(index, id) {
		openRow = openRow === null || openRow === undefined ? index : openRow;
		tagihanInputsByRow[index] = [
			...tagihanInputsByRow[index],
			{ tagihanId: id, tipe: '', amount: 0, sifatTagihanId: '' }
		];
	}

	function hapusInput(rowIndex, TagihanDetailIndex) {
		tagihanInputsByRow[rowIndex] = tagihanInputsByRow[rowIndex].filter(
			(_, i) => i !== TagihanDetailIndex
		);
	}

	function updateAmount(rowIndex, TagihanDetailIndex, event) {
		tagihanInputsByRow[rowIndex][TagihanDetailIndex].amount = event.target.value;
	}

	function validateForm(index) {
		const inputs = tagihanInputsByRow[index];
		let isValid = true;
		inputs.forEach((input) => {
			if (input.sifatTagihanId === '' || input.tipe === '' || input.amount === '') {
				isValid = false;
			}
		});
		return isValid;
	}

	function noValidationPayload(inputs) {
		return inputs.map(({ showValidation, ...rest }) => rest);
	}

	async function submitForm(index) {
		if (validateForm(index)) {
			loading = true;
			try {
				const sanitizedPayload = noValidationPayload(tagihanInputsByRow[index]);
				const payload = JSON.stringify(sanitizedPayload);

				const response = await fetch('/api/tagihandetail', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: payload
				});
				const result = await response.json();
				if (result.success) {
					// Mengubah tagihanInputsByRow[rowIndex] menjadi array kosong
					tagihanInputsByRow[index] = [];

					showToast(result.message, 'success');
					const updatedDataResponse = await fetch('/api/tagihan', {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						}
					});
					const updatedData = await updatedDataResponse.json();
					tagihan.set(updatedData.data);
				} else {
					showToast(result.message, 'error');
				}
			} catch (err) {
				console.error('client', err);
			} finally {
				loading = false;
			}
		} else {
			// Show validation errors
			tagihanInputsByRow = tagihanInputsByRow.map((row, rowIndex) => {
				if (rowIndex === index) {
					return row.map((input) => ({
						...input,
						showValidation: true
					}));
				}
				return row;
			});
		}
	}

	const handleDelete = async () => {
		try {
			const response = await fetch(`api/tagihandetail/${deleteTargetTagihanId}/${deleteTargetId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});
			const result = await response.json();
			if (result.success) {
				showToast(result.message, 'success');
				const updatedDataResponse = await fetch('/api/tagihan', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					}
				});
				const updatedData = await updatedDataResponse.json();
				tagihan.set(updatedData.data);
			} else {
				showToast(result.message, 'error');
			}
		} catch (error) {
			console.error(error);
		} finally {
			deleteTargetId = null;
			deleteTargetTagihanId = null;
			deleteModal = false;
		}
	};

	const handleEdit = async () => {
		loading = true;
		try {
			const payload = JSON.stringify(dataEdit);
			const response = await fetch(`api/tagihandetail/${dataEdit.tagihanid}/${dataEdit.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: payload
			});
			const result = await response.json();
			if (result.success) {
				dataEdit = {
					sifatTagihanId: '',
					tipe: '',
					amount: ''
				};

				showToast(result.message, 'success');
				const updatedDataResponse = await fetch('/api/tagihan', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					}
				});
				const updatedData = await updatedDataResponse.json();
				tagihan.set(updatedData.data);
			} else {
				showToast(result.message, 'error');
			}
		} catch (err) {
			console.error('client', err);
		} finally {
			loading = false;
		}
	};

	const openEditModal = (data) => {
		dataEdit = {
			id: data.id,
			tagihanId: data.tagihanId,
			sifatTagihanId: data.sifatTagihanId,
			tipe: data.tipe,
			amount: data.amount
		};
		console.log(dataEdit);
		editModal = true;
	};

	const openDeleteModal = (id, idTagihan) => {
		deleteModal = true;
		deleteTargetId = id;
		deleteTargetTagihanId = idTagihan;
	};

	let showCalculate = false;
	let loadingCalculate = false;
	let dataCalculate;

	const fetchProrate = async () => {
		loadingCalculate = true;
		try {
			const response = await fetch(`/api/calculateprorate/${$chooseDebitor}`, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});
			data = await response.json();
			if (data.success) {
				showToast(data.message, 'success');
			} else {
				showToast(data.message, 'error');
			}
			return data.data;
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			loadingCalculate = false;
		}
	};
	const calculateProrate = async () => {
		dataCalculate = await fetchProrate();
		if (dataCalculate) {
			showCalculate = true;
		}
	};
</script>

<div class="space-y-4">
	<Breadcrumb aria-label="Default breadcrumb example" class="mb-4">
		<BreadcrumbItem href="/dashboard" home>Dashboard</BreadcrumbItem>
		<BreadcrumbItem>List Tagihan</BreadcrumbItem>
	</Breadcrumb>
	<div class="min-h-max overflow-hidden rounded-lg border border-gray-200 p-8 dark:border-gray-700">
		<div class="mb-4 flex flex-col items-start justify-between sm:mb-0 md:flex-row">
			<caption
				class="mb-2 bg-white text-left text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-white md:mb-5"
			>
				List Tagihan
				<p class="mt-1 text-sm font-light text-gray-500 dark:text-gray-400">
					Kelola semua tagihan.
				</p>
			</caption>
		</div>

		{#if $tagihanByDebitor.length === 0}
			<div
				class="border-1 flex w-full items-center justify-center rounded-md border border-gray-300 py-40"
			>
				<h1 class="text-md font-medium text-gray-400 dark:text-white">
					List tagihan masih kosong.
				</h1>
			</div>
		{:else}
			<Table>
				<TableHead>
					<TableHeadCell>No</TableHeadCell>
					<TableHeadCell>Nama Kreditur</TableHeadCell>
					<TableHeadCell>Sifat / Golongan Tagihan</TableHeadCell>
					<TableHeadCell>Hutang Pokok</TableHeadCell>
					<TableHeadCell>Bunga</TableHeadCell>
					<TableHeadCell>Denda</TableHeadCell>
					<TableHeadCell>Status</TableHeadCell>
					<TableHeadCell>Tagihan</TableHeadCell>
				</TableHead>
				<TableBody tableBodyClass="divide-y">
					{#each $tagihanByDebitor as data, index (data)}
						<TableBodyRow>
							<TableBodyCell style="display: flex; padding-top: 24px; gap: 4px;"
								>{index + 1}
							</TableBodyCell>
							<TableBodyCell class="min-w-60 max-w-80 text-wrap">{data.Kreditor.nama}</TableBodyCell>
							<TableBodyCell class="max-w-16">{data.SifatTagihan.sifat}</TableBodyCell>
							<TableBodyCell>Rp. {formatPrice(parseFloat(data.hutangPokok))}</TableBodyCell>
							<TableBodyCell>Rp. {formatPrice(parseFloat(data.bunga))}</TableBodyCell>
							<TableBodyCell>Rp. {formatPrice(parseFloat(data.denda))}</TableBodyCell>
							<TableBodyCell>
								{#if data.status === 0}
									<Badge color="gray" rounded class="px-2.5 py-0.5">
										<Indicator color="dark" size="xs" class="me-1" />Pending
									</Badge>
								{:else if data.status === 1}
									<Badge color="green" rounded class="px-2.5 py-0.5">
										<Indicator color="green" size="xs" class="me-1" />Verified
									</Badge>
								{:else}
									<Badge color="red" rounded class="px-2.5 py-0.5">
										<Indicator color="red" size="xs" class="me-1" />Objection
									</Badge>
								{/if}
							</TableBodyCell>
							<TableBodyCell>
								<div class="acs{index} cursor-pointer text-cyan-600">
									<!-- <Button size="xs" outline color="dark"> -->
									<DotsHorizontalOutline class="dots-menu dark:text-white" />
									<!-- </Button> -->
								</div>
								<Dropdown triggeredBy=".acs{index}">
									<div slot="header" class="px-4 py-2">
										<span class="block truncate text-sm font-medium">{data.Kreditor.nama}</span>
									</div>
									<DropdownItem>
										<a
											href={`/tagihandetail/${data.id}`}
											class="font-medium text-primary-600 hover:underline dark:text-primary-500"
											>Lihat Dokumen</a
										>
									</DropdownItem>
									<DropdownItem on:click={() => toggleRow(index)}>Revisi</DropdownItem>
								</Dropdown>
							</TableBodyCell>
						</TableBodyRow>
						{#if openRow === index}
							{#if tagihanInputsByRow[index].length > 0}
								<TableBodyRow>
									<TableBodyCell colspan="11">
										{#each tagihanInputsByRow as tagihanInputs, index}
											{#each tagihanInputs as tagihanDetail, TagihanDetailIndex (tagihanDetail)}
												<div
													class="grid gap-4 sm:gap-6 md:grid-cols-10"
													style="margin-bottom: 10px; width: 80%; margin-inline: auto;"
												>
													<div class="md:col-span-3">
														<label
															for="sifatTagihan"
															class={`mb-2 block text-sm font-medium ${tagihanDetail.showValidation && tagihanDetail.sifatTagihanId === '' ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
															>Sifat/Golongan Tagihan</label
														>
														<select
															id="sifatTagihan"
															name="sifatTagihanId"
															bind:value={tagihanDetail.sifatTagihanId}
															class={`block w-full rounded-lg border p-2.5 text-sm ${tagihanDetail.showValidation && tagihanDetail.sifatTagihanId === '' ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-gray-700 dark:text-red-500 dark:placeholder-red-500' : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'}`}
														>
															<option value="" selected disabled>Pilih Sifat Tagihan</option>
															{#each sifatTagihanData as { id, sifat }}
																<option value={id}>{sifat}</option>
															{/each}
														</select>
														{#if tagihanDetail.showValidation && tagihanDetail.sifatTagihanId === ''}
															<p class="mt-2 text-xs font-normal text-red-700 dark:text-red-500">
																Sifat Tagihan harus dipilih
															</p>
														{/if}
													</div>
													<div class="md:col-span-3">
														<label
															for="tipeTagihan"
															class={`mb-2 block text-sm font-medium ${tagihanDetail.showValidation && tagihanDetail.tipe === '' ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
															>Tipe Detail Tagihan</label
														>
														<select
															id="tipeTagihan"
															name="tipeTagihan"
															bind:value={tagihanDetail.tipe}
															class={`block w-full rounded-lg border p-2.5 text-sm ${tagihanDetail.showValidation && tagihanDetail.tipe === '' ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-gray-700 dark:text-red-500 dark:placeholder-red-500' : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'}`}
														>
															<option value="" selected disabled>Pilih Tipe Tagihan</option>
															<option value="bunga">Bunga</option>
															<option value="denda">Denda</option>
															<option value="tagihan">Tagihan</option>
														</select>
														{#if tagihanDetail.showValidation && tagihanDetail.tipe === ''}
															<p class="mt-2 text-xs font-normal text-red-700 dark:text-red-500">
																Tipe Tagihan harus dipilih
															</p>
														{/if}
													</div>
													<div class="md:col-span-3">
														<label
															for="amountTagihan"
															class={`mb-2 block text-sm font-medium ${tagihanDetail.showValidation && tagihanDetail.amount === '' ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
															>Amount</label
														>
														<div class="relative">
															<div
																class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2.5"
															>
																<p
																	class={`${tagihanDetail.showValidation && tagihanDetail.amount === '' ? 'text-red-900 dark:text-red-500' : 'text-gray-500'}`}
																>
																	Rp.
																</p>
															</div>
															<input
																type="text"
																name="Amount Tagihan"
																placeholder="Amount Tagihan"
																id="amountTagihan"
																bind:value={tagihanDetail.amount}
																on:input={(event) => updateAmount(index, TagihanDetailIndex, event)}
																class={`block w-full rounded-lg border p-2.5 ps-10 text-sm ${tagihanDetail.showValidation && tagihanDetail.amount === '' ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-gray-700 dark:text-red-500 dark:placeholder-red-500' : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'}`}
															/>
														</div>
														{#if tagihanDetail.showValidation && tagihanDetail.amount === ''}
															<p class="mt-2 text-xs font-normal text-red-700 dark:text-red-500">
																Amount Tagihan tidak boleh kosong
															</p>
														{/if}
													</div>
													<div style="position: relative;">
														<Button
															style="padding: 5px 10px; position: absolute; top: 45%;"
															color="red"
															on:click={() => hapusInput(index, TagihanDetailIndex)}
															><MinusSolid style="outline: none;" /></Button
														>
													</div>
												</div>
											{/each}
										{/each}
										<div
											style="display: flex;
										justify-content: space-between;
										padding: 20px 40px 0px 40px"
										>
											<Button size="xs" on:click={() => submitForm(index)}>
												{#if loading}
													<Spinner color="white" size={4} />
												{:else}
													SUBMIT
												{/if}
											</Button>
											<Button size="xs" color="green" on:click={() => tambahInput(index, data.id)}
												>TAMBAH INPUT</Button
											>
										</div>
									</TableBodyCell>
								</TableBodyRow>
							{/if}
							<TableBodyRow>
								<TableBodyCell colspan="11">
									{#if tagihanInputsByRow[index].length === 0}
										<div class="mb-6 mr-8 mt-3 flex justify-end">
											{#if data.status !== 1}
												<Button size="xs" on:click={() => tambahInput(index, data.id)}
													><EditSolid class="me-2 h-5 w-5" />REVISI</Button
												>
											{/if}
										</div>
									{/if}
									<div
										transition:slide={{ duration: 300, axis: 'y' }}
										style="width: 80%; margin-inline: auto;"
									>
										<Table shadow>
											<TableHead>
												<TableHeadCell>No</TableHeadCell>
												<TableHeadCell>Sifat/Golongan Tagihan</TableHeadCell>
												<TableHeadCell>Tipe Detail Tagihan</TableHeadCell>
												<TableHeadCell>Amount</TableHeadCell>
												<TableBodyCell>Action</TableBodyCell>
											</TableHead>
											<TableBody>
												{#each data.tagihanItem as data, index (data)}
													<TableBodyRow>
														<TableBodyCell>{index + 1}</TableBodyCell>
														<TableBodyCell>{data.SifatTagihan.sifat}</TableBodyCell>
														<TableBodyCell style="text-transform: capitalize;"
															>{data.tipe}</TableBodyCell
														>
														<TableBodyCell>Rp. {formatPrice(parseFloat(data.amount))}</TableBodyCell
														>
														<TableBodyCell>
															<Button on:click={() => openEditModal(data)}>
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																	class="h-5 w-5 shrink-0"
																	role="img"
																	aria-label="edit solid"
																	viewBox="0 0 24 24"
																	><path
																		fill="currentColor"
																		fill-rule="evenodd"
																		d="M11.3 6.2H5a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h11c1.1 0 2-1 2-2.1V11l-4 4.2c-.3.3-.7.6-1.2.7l-2.7.6c-1.7.3-3.3-1.3-3-3.1l.6-2.9c.1-.5.4-1 .7-1.3l3-3.1Z"
																		clip-rule="evenodd"
																	></path><path
																		fill="currentColor"
																		fill-rule="evenodd"
																		d="M19.8 4.3a2.1 2.1 0 0 0-1-1.1 2 2 0 0 0-2.2.4l-.6.6 2.9 3 .5-.6a2.1 2.1 0 0 0 .6-1.5c0-.2 0-.5-.2-.8Zm-2.4 4.4-2.8-3-4.8 5-.1.3-.7 3c0 .3.3.7.6.6l2.7-.6.3-.1 4.7-5Z"
																		clip-rule="evenodd"
																	></path></svg
																>
															</Button>
															<Button
																color="red"
																on:click={() => openDeleteModal(data.id, data.tagihanId)}
															>
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																	class="h-5 w-5 shrink-0"
																	role="img"
																	aria-label="trash bin solid"
																	viewBox="0 0 24 24"
																	><path
																		fill="currentColor"
																		fill-rule="evenodd"
																		d="M8.6 2.6A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4c0-.5.2-1 .6-1.4ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
																		clip-rule="evenodd"
																	></path></svg
																></Button
															>
														</TableBodyCell>
													</TableBodyRow>
												{/each}
											</TableBody>
											<tfoot style="border-top-width: 1px !important;">
												<tr class="font-semibold text-gray-900 dark:text-white">
													<td class="px-6 py-3"></td>
													<th scope="row" class="px-6 py-3 text-base" colspan="2">TOTAL:</th>
													<td class="px-6 py-3"
														>Rp. {formatPrice(
															data.tagihanItem.reduce((sum, item) => sum + parseInt(item.amount), 0)
														)}</td
													>
												</tr>
											</tfoot>
										</Table>
									</div>
								</TableBodyCell>
							</TableBodyRow>
						{/if}
					{/each}
				</TableBody>
			</Table>
		{/if}
	</div>
	{#if showCalculate}
		<div
			class="min-h-max overflow-hidden rounded-lg border border-gray-200 p-8 dark:border-gray-700"
		>
			{#if loadingCalculate}
				<div class="flex items-center justify-center">
					<Spinner color="blue" size={10} />
				</div>
			{:else if dataCalculate}
				<Table>
					<TableHead>
						<TableHeadCell>No</TableHeadCell>
						<TableHeadCell>Nama Kreditur</TableHeadCell>
						<TableHeadCell>Tagihan</TableHeadCell>
						<TableHeadCell>Prorate</TableHeadCell>
						<TableHeadCell>Hasil</TableHeadCell>
						<TableHeadCell>Asset Laku</TableHeadCell>
					</TableHead>
					<TableBody tableBodyClass="divide-y">
						{#each dataCalculate?.Tagihan as data, index (data)}
							<TableBodyRow>
								<TableBodyCell style="display: flex; padding-top: 24px; gap: 4px;"
									>{index + 1}
								</TableBodyCell>
								<TableBodyCell>{data.Kreditor.nama}</TableBodyCell>
								<TableBodyCell>Rp. {formatPrice(data.total)}</TableBodyCell>
								<TableBodyCell>{data.prorate}%</TableBodyCell>
								<TableBodyCell>Rp. {formatPrice(data.hasil)}</TableBodyCell>
								{#if index === 0}
									<TableBodyCell rowSpan={dataCalculate.Tagihan.length}
										>Rp. {formatPrice(dataCalculate.AssetSelling[0].sellingPrice)}</TableBodyCell
									>
								{/if}
							</TableBodyRow>
						{/each}
					</TableBody>
					<tfoot>
						<tr class="bg-gray-50 font-semibold text-gray-900 dark:text-white">
							<th scope="row" class="px-6 py-3 text-center text-base" colspan="2">Total</th>
							<td class="px-6 py-3">Rp. {formatPrice(dataCalculate.totalSum)}</td>
							<td class="px-6 py-3">100%</td>
							<td class="px-6 py-3" colspan="2">Rp. {formatPrice(dataCalculate.hasilSum)}</td>
						</tr>
					</tfoot>
				</Table>
			{/if}
		</div>
	{/if}

	<div class="flex justify-end">
		<Button on:click={() => calculateProrate()}>Calculate Prorate</Button>
	</div>
</div>
<!-- delete modal -->
<Modal bind:open={deleteModal} size="xs" autoclose>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			Anda yakin akan menghapus tagihan detail ini?
		</h3>
		<Button color="red" class="me-2" on:click={handleDelete}>Ya, Saya yakin</Button>
		<Button color="alternative">Tidak, batal</Button>
	</div>
</Modal>

<Modal bind:open={editModal} size="xs" autoclose>
	<div class="text-center">
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Edit Detail Tagihan</h3>
		<div class="grid sm:gap-3 md:grid-cols-1" style="margin-bottom: 30px;">
			<div>
				<label
					for="sifatTagihan"
					class="mb-2 block text-left text-sm font-medium text-gray-900 dark:text-white"
				>
					Sifat/Golongan Tagihan
				</label>
				<select
					id="sifatTagihan"
					name="sifatTagihanId"
					bind:value={dataEdit.sifatTagihanId}
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-left text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
				>
					<option value="" selected disabled>Pilih Sifat Tagihan</option>
					{#each sifatTagihanData as { id, sifat }}
						<option value={id}>{sifat}</option>
					{/each}
				</select>
			</div>
			<div>
				<label
					for="tipeTagihan"
					class="mb-2 block text-left text-sm font-medium text-gray-900 dark:text-white"
				>
					Tipe Detail Tagihan
				</label>
				<select
					id="tipeTagihan"
					name="tipeTagihan"
					bind:value={dataEdit.tipe}
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
				>
					<option value="" selected disabled>Pilih Tipe Tagihan</option>
					<option value="bunga">Bunga</option>
					<option value="denda">Denda</option>
					<option value="tagihan">Tagihan</option>
				</select>
			</div>
			<div>
				<label
					for="amountTagihan"
					class="mb-2 block text-left text-sm font-medium text-gray-900 dark:text-white"
				>
					Amount
				</label>
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2.5">
						<p class="text-gray-500">Rp.</p>
					</div>
					<input
						type="text"
						name="Amount Tagihan"
						placeholder="Amount Tagihan"
						id="amountTagihan"
						bind:value={dataEdit.amount}
						class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					/>
				</div>
			</div>
			<Button color="blue" class="me-2" on:click={handleEdit}>Edit</Button>
			<Button color="alternative">Tidak, batal</Button>
		</div>
	</div></Modal
>
