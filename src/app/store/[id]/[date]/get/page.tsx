'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/app/components/navigation/navbar';
import Loader from '@/app/components/loader';
import { Store, ProductSale } from '@prisma/client';
import _ from 'lodash';
import moment from 'moment-timezone';
import { CombinedProduct } from '@/app/models/CombinedProduct';

const ProductInput = ({ value }: { value: number }) => (
  <input
    type='number'
    className='w-14 border border-[#707070] text-center'
    value={value}
    disabled
  />
);

export default function Page({
  params,
}: {
  params: { date: string; id: string };
}) {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<CombinedProduct[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [storeCollection, setStoreCollection] = useState<number>(0);
  const [paypayCollection, setPaypayCollection] = useState<number>(0);
  const [paypayTimeHour, setPaypayTimeHour] = useState<number>(
    moment.tz('Asia/Tokyo').hour()
  );
  const [paypayTimeMin, setPaypayTimeMin] = useState<number>(
    moment.tz('Asia/Tokyo').minute()
  );

  useEffect(() => {
    axios
      .post('/api/sales/get', {
        storeId: params.id,
        date: params.date,
      })
      .then((res) => {
        if (res.data.store) {
          setStore(res.data.store);
        }
        const saleData = res.data.sales[0];
        setTotalSales(saleData.totalSales);
        setStoreCollection(saleData.storeCollection);
        setPaypayCollection(saleData.paypayCollection);
        setPaypayTimeHour(saleData.paypayTimeHour);
        setPaypayTimeMin(saleData.paypayTimeMin);
        const combined: CombinedProduct[] = _.compact(
          res.data.productSales.map((productSale: ProductSale) => {
            const product = _.find(res.data.products, {
              id: productSale.productId,
            });
            return {
              id: product.id,
              name: product.name,
              price: product.price,
              previousCount: productSale.previousCount,
              remainCount: productSale.remainCount,
              restockCount: productSale.restockCount,
            };
          })
        );
        setProducts(combined);
        setLoading(false);
      })
      .catch((err) => {
        console.log('err:', err);
        setStore(null);
        setProducts([]);
        setLoading(false);
      });
  }, [params.date, params.id]);

  useEffect(() => {
    const total = products.reduce((sum, product) => {
      const difference = product.previousCount - product.remainCount;
      return sum + product.price * difference;
    }, 0);
    setTotalSales(total);
  }, [products]);

  if (loading) return <Loader />;
  else
    return (
      <main>
        <Navbar title='納品回収 集計ページ' />
        {store && (
          <div className='bg-[#EAEAEA] py-2 text-center'>
            <p className='text-xl font-bold'>{store?.name}</p>
          </div>
        )}
        <div className='mx-auto pb-16 sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl'>
          <div className='flex flex-row bg-[#2F2F2F] py-2 text-white'>
            <div className='flex-1 text-center'>商品名</div>
            <div className='w-16 text-center sm:w-24'>前日</div>
            <div className='w-16 text-center sm:w-24'>当日</div>
            <div className='w-16 text-center sm:w-24'>補充</div>
          </div>
          <div className='bg-[#EFEFEF] py-2 pl-4 text-lg font-bold'>
            自社商品
          </div>
          <div className='border-t border-[#707070]'>
            {products.map((product: CombinedProduct, index: number) => (
              <div
                className='flex flex-row border-b border-[#707070]'
                key={index}
              >
                <div className='flex-1 py-2 pl-4 text-base'>{product.name}</div>
                <div className='flex w-16 items-center justify-center border-x border-[#707070] sm:w-24'>
                  <ProductInput value={product.previousCount} />
                </div>
                <div className='flex w-16 items-center justify-center sm:w-24'>
                  <ProductInput value={product.remainCount} />
                </div>
                <div className='flex w-16 items-center justify-center border-x border-[#707070] sm:w-24'>
                  <ProductInput value={product.restockCount} />
                </div>
              </div>
            ))}
          </div>

          <div className='mt-8 bg-[#48A3FF] py-2 pl-4 text-lg font-bold text-white'>
            売上データ
          </div>
          <div className='bg-[#EFEFEF] py-2 pl-4 text-lg font-bold'>
            自社商品
          </div>
          <div className='border-t border-[#707070]'>
            {products
              .filter(
                (product: CombinedProduct) =>
                  product.previousCount - product.remainCount != 0
              )
              .map((product: CombinedProduct, index: number) => (
                <div
                  className='flex flex-row border-b border-[#707070] px-4'
                  key={index}
                >
                  <div className='flex-1 py-2 text-base'>{product.name}</div>
                  <div className='flex w-20 items-center justify-center text-xl '>
                    {product.previousCount - product.remainCount}
                  </div>
                  <div className='flex w-24 items-center justify-end text-right sm:w-32 md:w-48'>
                    <p className='text-xl font-bold'>
                      ¥
                      {product.price *
                        (product.previousCount - product.remainCount)}
                    </p>
                  </div>
                </div>
              ))}
            <div className='flex flex-row px-4'>
              <div className='flex-1 py-2 text-lg font-bold'>合計</div>
              <div className='flex w-20 items-center justify-end font-bold sm:w-24 md:w-40'>
                <p className='text-xl'>¥{totalSales}</p>
              </div>
            </div>
          </div>
          <div className='mt-2 flex flex-row bg-[#E5F2FF] px-4'>
            <div className='flex-1 py-2 text-lg font-bold'>店舗売上合計</div>
            <div className='flex w-20 items-center justify-end text-xl font-bold sm:w-24 md:w-40'>
              <p>¥{totalSales}</p>
            </div>
          </div>

          <div className='mt-8 bg-[#48A3FF] py-2 pl-4 text-lg font-bold text-white'>
            集金
          </div>
          <div className='flex flex-row border-b border-[#707070]'>
            <div className='flex-1 py-2 pl-4 text-lg font-bold'>店舗集金</div>
            <div className='flex w-32 items-center justify-end border-x border-[#707070] pr-4 sm:w-40'>
              <input
                type='number'
                className='w-20 border border-[#707070] px-1 text-right sm:w-32'
                value={storeCollection}
                disabled
              />
            </div>
          </div>
          <div className='flex flex-row border-b border-[#707070]'>
            <div className='flex-1 py-2 pl-4 text-lg font-bold'>PayPay集金</div>
            <div className='flex w-32 items-center justify-end border-x border-[#707070] pr-4 sm:w-40'>
              <input
                type='number'
                className='w-20 border border-[#707070] px-1 text-right sm:w-32'
                value={paypayCollection}
                disabled
              />
            </div>
          </div>
          <div className='flex flex-row border-b border-[#707070]'>
            <div className='flex-1 py-2 pl-4 text-lg font-bold'>
              PayPay集金時刻
            </div>
            <div className='flex w-32 items-center justify-center border-x border-[#707070] sm:w-40'>
              <input
                type='number'
                className='w-14 border border-[#707070] px-1 text-center'
                value={paypayTimeHour}
                disabled
              />
              <p className='px-1'>:</p>
              <input
                type='number'
                className='w-14 border border-[#707070] px-1 text-center'
                value={paypayTimeMin}
                disabled
              />
            </div>
          </div>
          <div className='flex flex-row border-b border-[#707070]'>
            <div className='flex-1 py-2 pl-4 text-lg font-bold'>合計</div>
            <div className='flex w-32 items-center justify-end border-x border-[#707070] pr-4 sm:w-40'>
              <p className='text-xl'>¥{storeCollection + paypayCollection}</p>
            </div>
          </div>
          <div className='flex flex-row border-b border-[#707070]'>
            <div className='flex-1 py-2 pl-4 text-lg font-bold'>
              売上との差額
            </div>
            <div className='flex w-32 items-center justify-end border-x border-[#707070] pr-4 sm:w-40'>
              <p className='text-xl font-bold text-[#f00]'>
                -¥{totalSales - storeCollection - paypayCollection}
              </p>
            </div>
          </div>
        </div>
      </main>
    );
}
