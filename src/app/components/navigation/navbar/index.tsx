'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  title: string;
}

const Navbar = ({ title }: Props) => {
  const { back } = useRouter();
  return (
    <nav className='sticky top-0 flex w-full items-center justify-between bg-[#d90000] px-10 py-3'>
      <button onClick={() => back()}>
        <Image width={13} height={22} src='/back.svg' alt={'back-icon'} />
      </button>
      <p className='text-2xl font-bold text-white'>{title}</p>
      <button>
        <Image width={24} height={24} src='/home.svg' alt={'home-icon'} />
      </button>
    </nav>
  );
};

export default Navbar;
