import { error, redirect } from '@sveltejs/kit';
export async function load({ locals, fetch, params }) {
	const { user, token } = locals;
	if (!user) {
		redirect(303, '/');
	} else {
		if (user.roleId === 1) {
			const debitorRes = await fetch(`/api/debitor`)
			const debitor = await debitorRes.json()
            const res = await fetch(`/api/assetselling/${params.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            const assetselling = await res.json()
			return {
				status: 200,
				body: {
					token,
                    dataAsset : assetselling.data,
					debitor : debitor.data
				}
			};
		} else {
			error(404, 'Page Not Found');
		}
	}
}
