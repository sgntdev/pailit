import { SECRET_INGREDIENT } from '$env/static/private';
import jwt from 'jsonwebtoken';
import { prisma } from '$lib/prisma.server.js';

export async function GET({ request, params }) {
	let token = request.headers.get('authorization');
    const id = parseInt(params.id)
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
    const debitor = await prisma.Debitor.findUnique({
        where: {
            id
        },
        include:{
            Tagihan : {
                select: {
                    hutangPokok: true,
                    denda: true,
                    bunga: true,
                    Kreditor: {
                        select: {
                            nama: true
                        }
                    }
                }
            },
            AssetSelling : {
                select:{
                    sellingPrice : true
                }
            }
        }
    })
	if (!debitor) {
		return new Response(
			JSON.stringify({ success: false, code: 404, message: 'Tidak ditemukan!' }),
			{
				status: 404
			}
		);
	}
	if(debitor.AssetSelling.length < 1){
		return new Response(
			JSON.stringify({ success: false, code: 404, message: 'Asset terjual tidak ditemukan!' }),
			{
				status: 404
			}
		);
	}

    let totalSum = 0;
    let hasilSum = 0;
	let prorateSum = 0;
	debitor.Tagihan = debitor.Tagihan.map(tagihan => {
		const hutangPokok = Number(tagihan.hutangPokok) || 0;
		const bunga = Number(tagihan.bunga) || 0;
		const denda = Number(tagihan.denda) || 0;
		const total = hutangPokok + bunga + denda;
		tagihan.total = total;
		totalSum += total;
		return tagihan;
	});

    debitor.Tagihan = debitor.Tagihan.map(tagihan => {
		tagihan.prorate = ((tagihan.total / totalSum) * 100).toFixed(2);
        tagihan.hasil = Math.round(Number((tagihan.prorate/100)) * Number(debitor.AssetSelling[0].sellingPrice))
        hasilSum += tagihan.hasil;
        prorateSum += tagihan.prorate;
		return tagihan;
	});

	const responseData = {
		...debitor,
		totalSum,
        hasilSum,
		prorateSum
	};
	return new Response(JSON.stringify({ success: true, message: 'Proses kalkulasi berhasil!', data: responseData }));
}