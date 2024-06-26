'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import Navbar from '@/app/components/navigation/navbar';
import { Store } from '@prisma/client';
import Loader from '../components/loader';

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
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    axios
      .post('/api/store')
      .then((res) => {
        setStores(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log('err:', err);
        setStores([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loader />;
  else
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
