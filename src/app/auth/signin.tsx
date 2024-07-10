'use client';

import { FormEvent, useState } from 'react';
import { Hourglass } from 'react-loader-spinner';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Invalid ID or password');
    } else {
      setError(null);
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

      <div className='flex min-h-12 flex-col'>
        {error && <p className='text-sm text-[#d90000]'>** {error} **</p>}
        {loading && (
          <Hourglass
            visible={true}
            height='24'
            width='24'
            ariaLabel='hourglass-loading'
            wrapperClass='self-center my-auto'
            colors={['#000', '#000']}
          />
        )}
      </div>

      <button
        type='submit'
        className='mt-4 w-80 rounded-3xl bg-[#d90000] py-2 text-center text-white'
      >
        ログイン
      </button>
    </form>
  );
}
