'use server';

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { CombinedProduct } from '@/app/models/CombinedProduct';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const {
    storeId,
    date,
    products,
    totalSales,
    storeCollection,
    paypayCollection,
    paypayTimeHour,
    paypayTimeMin,
  } = req.body;

  try {
    const productOperations = products.map(async (product: CombinedProduct) => {
      const existingProductCount = await prisma.currentProductCount.findFirst({
        where: {
          productId: product.id,
          storeId,
        },
        cacheStrategy: { ttl: 60 },
      });
      if (existingProductCount) {
        await prisma.currentProductCount.update({
          where: {
            id: existingProductCount.id,
          },
          data: {
            count: product.remainCount + product.restockCount,
          },
        });
      } else {
        await prisma.currentProductCount.create({
          data: {
            productId: product.id,
            storeId,
            count: product.remainCount + product.restockCount,
          },
        });
      }

      const existingProductSaleCount = await prisma.productSale.count({
        where: {
          productId: product.id,
          storeId,
          date: new Date(date),
        },
      });
      if (existingProductSaleCount === 0) {
        await prisma.productSale.create({
          data: {
            date: new Date(date),
            productId: product.id,
            storeId,
            previousCount: product.previousCount,
            remainCount: product.remainCount,
            restockCount: product.restockCount,
          },
        });
      }
    });
    await Promise.all(productOperations);

    await prisma.sales.create({
      data: {
        date: new Date(date),
        totalSales,
        storeCollection,
        paypayCollection,
        paypayTimeHour,
        paypayTimeMin,
        storeId,
      },
    });

    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ error });
  }
}
