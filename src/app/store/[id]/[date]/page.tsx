'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/app/components/navigation/navbar';
import Loader from '@/app/components/loader';
import { Store, Product } from '@prisma/client';

export default function Page({
  params,
}: {
  params: { date: string; id: string };
}) {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios
      .post('/api/product', { storeId: params.id })
      .then((res) => {
        console.log('res:', res.data);
        // setStores(res.data || []);
        if (res.data.store) {
          setStore(res.data.store);
        }
        if (res.data.products) {
          setProducts(res.data.products);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log('err:', err);
        setStore(null);
        setProducts([]);
        setLoading(false);
      });
  }, [params.id]);

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
        <div className='mx-auto max-w-5xl'>
          <div className='flex flex-row bg-[#2F2F2F] py-2'>
            <div className='flex-1 text-center text-white'>商品名</div>
            <div className='text-center text-white md:w-40'>前日</div>
            <div className='text-center text-white md:w-40'>当日</div>
            <div className='text-center text-white md:w-40'>補充</div>
          </div>
          <div className='bg-[#EFEFEF] py-2 pl-4 text-[20px] font-bold'>
            自社商品
          </div>
          <div className='border-t border-[#707070]'>
            {products.map((product: Product, index: number) => (
              <div
                className='flex flex-row border-b border-[#707070]'
                key={index}
              >
                <div className='flex-1 py-2 pl-4 text-[18px]'>
                  {product.name}
                </div>
                <div className='flex items-center justify-center border-x border-[#707070] sm:w-24 md:w-32 lg:w-40'>
                  <input
                    type='text'
                    className='xs:w-8 w-16 border border-[#707070] text-center'
                  />
                </div>
                <div className='flex items-center justify-center sm:w-24 md:w-32 lg:w-40'>
                  <input
                    type='text'
                    className='w-16 border border-[#707070] text-center'
                  />
                </div>
                <div className='flex items-center justify-center border-x border-[#707070] sm:w-24 md:w-32 lg:w-40'>
                  <input
                    type='text'
                    className='w-16 border border-[#707070] text-center'
                  />
                </div>
              </div>
            ))}
          </div>

          <div className='mt-8 bg-[#48A3FF] py-2 pl-4 text-[20px] font-bold text-white'>
            売上データ
          </div>
          <div className='bg-[#EFEFEF] py-2 pl-4 text-[20px] font-bold'>
            自社商品
          </div>
          <div className='border-t border-[#707070]'>
            {products.map((product: Product, index: number) => (
              <div
                className='flex flex-row border-b border-[#707070]'
                key={index}
              >
                <div className='flex-1 py-2 pl-4 text-[18px]'>
                  {product.name}
                </div>
                <div className='flex items-center justify-center border-x border-[#707070] md:w-40'>
                  35
                </div>
                <div className='flex items-center justify-center md:w-40'>
                  ¥19,250
                </div>
              </div>
            ))}
          </div>

          <div className='mt-8 bg-[#E5F2FF] py-2 pl-4 text-[20px] font-bold text-white'>
            店舗売上合計
          </div>

          <div className='mt-8 bg-[#48A3FF] py-2 pl-4 text-[20px] font-bold text-white'>
            集金
          </div>
        </div>
      </main>
    );
}
