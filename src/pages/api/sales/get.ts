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
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      cacheStrategy: { ttl: 60 },
    });
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: store?.products,
        },
      },
      cacheStrategy: { ttl: 60 },
    });
    const makers = await prisma.maker.findMany({
      cacheStrategy: { ttl: 60 },
    });
    const productSales = await prisma.productSale.findMany({
      where: {
        storeId,
        date: new Date(date),
      },
      cacheStrategy: { ttl: 60 },
    });
    const sales = await prisma.sales.findMany({
      where: { storeId, date: new Date(date) },
      cacheStrategy: { ttl: 60 },
    });
    res.status(200).json({ store, productSales, products, makers, sales });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}
