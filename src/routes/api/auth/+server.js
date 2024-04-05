import jwt from 'jsonwebtoken';
import { prisma } from '$lib/prisma.server.js';
import { SECRET_INGREDIENT } from '$env/static/private';

export async function POST({ request }) {
	const { debitorUid, uniqueCode } = await request.json();
	const user = await prisma.UserVerify.findUnique({
		where: { uniqueCode },
		select: {
			email: true,
			expirationDate: true
		}
	});
	if (user) {
		if (new Date(user.expirationDate) < new Date()) {
			return new Response(JSON.stringify('Expired Unique Code'), { status: 400 });
		} else {
			// Check if user already exists before creating a new one
			const existingUser = await prisma.User.findUnique({
				where: { email: user.email },
				select: {
					id: true,
					email: true,
					roleId: true
				}
			});
			try {
				if (!existingUser) {
					await prisma.User.create({
						data: {
							email: user.email
						}
					});
				}
			} catch (error) {
				console.error('Error creating user:', error);
			}
			let data = { ...existingUser, debitorUid, expirationDate: user.expirationDate };
			const authToken = jwt.sign({ user:data }, SECRET_INGREDIENT, { expiresIn: '24h' });
			return new Response(JSON.stringify({ authToken }));
		}
	} else {
		return new Response(JSON.stringify('Invalid Unique Code'), { status: 404 });
	}
}
