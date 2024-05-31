import { SECRET_INGREDIENT } from '$env/static/private';
import jwt from 'jsonwebtoken';
import { prisma } from '$lib/prisma.server.js';

export async function GET({ request }) {
	let token = request.headers.get('authorization');
	if (token && token.startsWith('Bearer ')) {
		token = token.slice(7, token.length);
	}
	if (!token) {
		return new Response(JSON.stringify({ success: false, code: 401, message: 'Unauthorized' }), {
			status: 401
		});
	}
	let decoded = jwt.verify(token, SECRET_INGREDIENT);
	if (decoded.user.roleId !== 1) {
		return new Response(JSON.stringify({ success: false, code: 403, message: 'Forbidden' }), {
			status: 403
		});
	}
	const assetselling = await prisma.AssetSelling.findMany({
		orderBy: { id: 'asc' },
		include:{
			Debitor:{
				select:{
					nama:true
				}
			}
		}
	});
	if (!assetselling) {
		return new Response(
			JSON.stringify({ success: false, code: 404, message: 'Asset debitor tidak ditemukan!' }),
			{
				status: 404
			}
		);
	}
	return new Response(JSON.stringify({ success: true, message: 'Berhasil', data: assetselling }));
}

function unformatPrice(price) {
	const formatted = price.replace(/,/g, '');
	return formatted;
}

export async function POST({ request }){
    let token = request.headers.get('authorization');
	if (token && token.startsWith('Bearer ')) {
		token = token.slice(7, token.length);
	}
	if (!token) {
		return new Response(JSON.stringify({ success: false, code: 401, message: 'Unauthorized' }), {
			status: 401
		});
	}
    const data = await request.json();
	const { debitorId, sellingPrice } = data;
	const validation = {
		success: false,
		errors: []
	};
	try {
		let decoded = jwt.verify(token, SECRET_INGREDIENT);
		if (decoded.user.roleId !== 1) {
			return new Response(JSON.stringify({ success: false, code: 403, message: 'Forbidden' }), {
				status: 403
			});
		}
        if (!debitorId) {
            validation.errors.push({ field: 'debitorId', message: 'Debitor tidak boleh kosong!' });
        }
		if (!sellingPrice) {
			validation.errors.push({ field: 'sellingPrice', message: 'Harga asset tidak boleh kosong!' });
		} else if (isNaN(parseFloat(sellingPrice))) {
			validation.errors.push({ field: 'sellingPrice', message: 'Harga asset harus berupa angka!' });
		}
		if (validation?.errors.length > 0) {
			return new Response(JSON.stringify(validation), { status: 400 });
		}
		const assetselling = await prisma.AssetSelling.create({
			data: {
                debitorId,
                sellingPrice : unformatPrice(sellingPrice)
			}
		});

		return new Response(
			JSON.stringify({ success: true, message: 'Asset debitor berhasil ditambahkan!', data: assetselling }),
			{
				status: 200
			}
		);
	} catch (error) {
		return new Response(
			JSON.stringify({ success: false, code: 500, message: 'Asset debitor gagal ditambahkan!' }),
			{ status: 500 }
		);
	}
}