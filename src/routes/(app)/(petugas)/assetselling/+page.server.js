import { error } from '@sveltejs/kit';

export async function load({ locals, fetch }) {
	const { user, token } = locals;
	if (!user) {
		redirect(303, '/');
	} else {
		if (user.roleId === 1 || user.roleId === 2) {
			const res = await fetch('/api/assetselling',{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});
			const assetselling = await res.json();
			console.log(assetselling);
			return {
				status: 200,
				body: {
					roleId : user.roleId,
					assetselling: assetselling.data, 
					token
				}
			};
		} else {
			error(404, 'Page Not Found');
		}
	}
}
