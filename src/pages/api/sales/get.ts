'use server';

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { storeId, date } = req.body;

  if (!storeId || !date) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    const products = await prisma.product.findMany();
    const productSales = await prisma.productSale.findMany({
      where: {
        storeId,
        date: new Date(date),
      },
    });
    const sales = await prisma.sales.findMany({
      where: { storeId, date: new Date(date) },
    });
    res.status(200).json({ store, productSales, products, sales });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}
