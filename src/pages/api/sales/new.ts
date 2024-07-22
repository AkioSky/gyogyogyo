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

  const { storeId } = req.body;

  if (!storeId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      cacheStrategy: { ttl: 60 },
    });
    const products = await prisma.product.findMany({
      where: { enable: true },
      cacheStrategy: { ttl: 60 },
    });
    const previousProducts = await prisma.currentProductCount.findMany({
      where: { storeId },
      cacheStrategy: { ttl: 60 },
    });
    res.status(200).json({ store, products, previousProducts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}
