'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Props {
  title: string;
  noBack?: boolean;
}

const Navbar = ({ title, noBack = false }: Props) => {
  const { back, replace } = useRouter();
  return (
    <nav className='sticky top-0 flex w-full items-center justify-between bg-[#d90000] px-10 py-3'>
      <div className='flex'>
        {!noBack && (
          <button onClick={() => back()}>
            <Image width={13} height={22} src='/back.svg' alt={'back-icon'} />
          </button>
        )}
      </div>
      <p className='text-xl font-bold text-white'>{title}</p>
      <button onClick={() => replace('/')}>
        <Image width={24} height={24} src='/home.svg' alt={'home-icon'} />
      </button>
    </nav>
  );
};

export default Navbar;
