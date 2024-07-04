'use server';

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { storeId } = req.body;
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    const products = await prisma.product.findMany();
    res.status(200).json({ store, products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}
