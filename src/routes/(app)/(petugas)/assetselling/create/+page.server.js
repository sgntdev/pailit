import { error, redirect } from '@sveltejs/kit';
export async function load({ locals, fetch }) {
	const { user, token } = locals;
	if (!user) {
		redirect(303, '/');
	} else {
		if (user.roleId === 1) {
			const debitorRes = await fetch(`/api/debitor`)
			const debitor = await debitorRes.json()
			return {
				status: 200,
				body: {
					token,
					debitor : debitor.data
				}
			};
		} else {
			error(404, 'Page Not Found');
		}
	}
}
