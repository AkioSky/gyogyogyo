'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email');
      const password = formData.get('password');

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      router.push('/dashboard');
    } catch (error) {
      setError(error?.message);
    }
  };

  return (
    <form
      className='flex h-screen flex-col items-center justify-center'
      onSubmit={handleSubmit}
    >
      <div className='flex flex-col items-center'>
        <Image width={153} height={52} src='/name.svg' alt={'name-icon'} />
        <p className='mt-4 text-xl font-bold'>在庫管理・売上管理システ</p>
      </div>

      <div className='mb-2 mt-16'>
        <p className='mb-2 text-xl'>ID</p>
        <input
          name='email'
          type='text'
          className='h-10 w-80 rounded-3xl border border-[#707070] px-4'
          required
        />
        <p className='mb-2 mt-4 text-xl'>パスワード</p>
        <input
          name='password'
          type='password'
          className='h-10 w-80 rounded-3xl border border-[#707070] px-4'
          required
        />
      </div>
      {error && <p className='text-[#d90000]'>** {error} **</p>}

      <button
        type='submit'
        className='mt-12 w-80 rounded-3xl bg-[#d90000] py-2 text-center text-white'
      >
        ログイン
      </button>
    </form>
  );
}
