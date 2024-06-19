'use client';

import Navbar from '@/app/components/navigation/navbar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { push } = useRouter();

  return (
    <main>
      <Navbar title='メニュー' />
      <div className='mt-16 flex flex-col items-center'>
        <button
          className='flex w-80 flex-col items-center rounded-3xl border-4 border-black py-6'
          onClick={() => push('/storeselect')}
        >
          <Image width={36} height={36} src='/pen.svg' alt={'pen-icon'} />
          <p className='mt-3 text-2xl font-bold'>店舗記録</p>
        </button>
        <button className='mt-6 flex w-80 flex-col items-center rounded-3xl border-4 border-black py-6'>
          <Image width={36} height={36} src='/doc.png' alt={'doc-icon'} />
          <p className='mt-3 text-2xl font-bold'>各種データ</p>
        </button>
      </div>

      <div className='absolute bottom-16 left-0 right-0 text-center'>
        <p className='text-base font-bold'>ログインアカウント</p>
        <p className='mt-4 text-xl font-bold'>株式会社マクティス</p>
      </div>
    </main>
  );
}
