import { SITE_URL, SECRET_INGREDIENT } from '$env/static/private';
import transporter from '$lib/emailSetup.server.js';
import { prisma } from '$lib/prisma.server.js';
import jwt from 'jsonwebtoken';

const sendEmail = async (message) => {
	try {
		return await transporter.sendMail(message);
	} catch (error) {
		console.error(error);
		throw error;
	}
};

async function generateUniqueCode(length) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';

	// Generate a unique code
	while (true) {
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			result += characters.charAt(randomIndex);
		}

		// Check if the generated code already exists in the database
		const existingUser = await prisma.Verified.findFirst({
			where: { uniqueCode: result }
		});

		if (!existingUser) {
			// If the code is unique, break out of the loop
			break;
		} else {
			// If the code already exists, reset and try generating a new one
			result = '';
		}
	}

	return result;
}

export async function POST({ request }) {
	let token = request.headers.get('authorization');
	if (token && token.startsWith('Bearer ')) {
		token = token.slice(7, token.length);
	}
	if (!token) {
		return new Response(JSON.stringify({ success: false, code: 401, message: 'Unauthorized' }), {
			status: 401
		});
	}
	const email = await request.json();
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	let uniqueCode = null;
	if (!emailRegex.test(email)) {
		return new Response({ success: false, code: 400, message: 'Format email tidak valid!' });
	}
	try {
		let decoded = jwt.verify(token, SECRET_INGREDIENT);
		if (decoded.user.roleId !== 1) {
			return new Response(JSON.stringify({ success: false, code: 403, message: 'Forbidden' }), {
				status: 403
			});
		}

		const expirationDate = new Date();
		expirationDate.setHours(expirationDate.getHours() + 2);

		const existingPassword = await prisma.Verified.findFirst({
			select: {
				id: true,
				expirationDate: true,
				uniqueCode: true
			}
		});

		if (existingPassword) {
			if (new Date(existingPassword.expirationDate) < new Date()) {
				uniqueCode = await generateUniqueCode(25);
				await prisma.Verified.update({
					where: { id: existingPassword.id },
					data: {
						uniqueCode,
						expirationDate: expirationDate.toISOString()
					}
				});
			} else {
				uniqueCode = existingPassword.uniqueCode;
			}
		}

		const link = `${SITE_URL}/resetpassword/${uniqueCode}`;
		let html = `<h2>Hi!</h2><p>Click the following link to access reset the verify password: <a href="${link}">${link}</a></p>`;

		const message = {
			from: '"pailit.co.id" <fotoarchive8@gmail.com>',
			to: email,
			bcc: 'www.pailit.co.id',
			subject: 'Link to reset password verify Tagihan',
			text: 'INI BODY',
			html: html
		};
		await sendEmail(message);
		return new Response(
			JSON.stringify({ success: true, message: 'Reset link sent successfully, check your email!' })
		);
	} catch (error) {
		console.error(error);
		return new Response(
			JSON.stringify({ success: false, code: 400, message: 'Reset link failed to sent!' })
		);
	}
}

export async function PUT({ request }) {
	let token = request.headers.get('authorization');
	const { uniqueCode, password, confirmPassword } = await request.json();
	const validation = {
		success: false,
		errors: []
	};
	if (token && token.startsWith('Bearer ')) {
		token = token.slice(7, token.length);
	}
	if (!token) {
		return new Response(JSON.stringify({ success: false, code: 401, message: 'Unauthorized' }), {
			status: 401
		});
	}
	try {
		let decoded = jwt.verify(token, SECRET_INGREDIENT);
		if (decoded.user.roleId !== 1) {
			return new Response(JSON.stringify({ success: false, code: 403, message: 'Forbidden' }), {
				status: 403
			});
		}
		if (!password) {
			validation.errors.push({ field: 'password', message: 'Password tidak boleh kosong!' });
		}
		if (!confirmPassword) {
			validation.errors.push({
				field: 'confirmPassword',
				message: 'Confirm password tidak boleh kosong!'
			});
		}
		if (password !== confirmPassword) {
			validation.errors.push({
				field: 'confirmPassword',
				message: 'Confirm password tidak sesuai!'
			});
		}
		if (validation?.errors.length > 0) {
			return new Response(JSON.stringify(validation), { status: 400 });
		}
		const existingPassword = await prisma.Verified.findUnique({
			where:{uniqueCode}
		});
		if (!existingPassword) {
			return new Response(
				JSON.stringify({ success: false, code: 404, message: 'Password tidak ditemukan!' }),
				{ status: 404 }
			);
		} else {
			await prisma.Verified.update({
				where: { id: existingPassword.id },
				data: {
					password,
					uniqueCode: null,
					expirationDate: null
				}
			});
			return new Response(
				JSON.stringify({ success: true, message: 'Password berhasil diubah!' }),
				{ status: 200 }
			);
		}
	} catch (error) {
		return new Response(
			JSON.stringify({
				success: false,
				code: 500,
				message: 'Password gagal diubah!'
			}),
			{ status: 500 }
		);
	}
}
