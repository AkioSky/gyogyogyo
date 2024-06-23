'use client';

import Navbar from '@/app/components/navigation/navbar';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Store } from '@prisma/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const RenderStore = (store: Store) => {
  return (
    <div className='my-4 flex flex-row items-center justify-between'>
      <p className='text-xl font-bold'>{store.name}</p>
      <Image
        width={13}
        height={22}
        src='/right_arrow.svg'
        alt={'right-arrow-icon'}
      />
    </div>
  );
};

export default function Page() {
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    axios
      .post('/api/store')
      .then((res) => {
        console.log('res:', res);
        setStores(res.data || []);
      })
      .catch((err) => {
        console.log('err:', err);
        setStores([]);
      });
  }, []);

  return (
    <main>
      <Navbar title='店舗選択' />
      <div className='px-10 py-8'>
        {stores.map((store, index) => (
          <div
            key={index}
            onClick={() => {
              router.push(`/store/${store.id}`);
            }}
          >
            {RenderStore(store)}
          </div>
        ))}
      </div>
    </main>
  );
}
