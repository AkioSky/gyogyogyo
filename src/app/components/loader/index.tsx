import React from 'react';
import { Hourglass } from 'react-loader-spinner';

const Loader = () => {
  return (
    <div className='flex h-screen items-center justify-center'>
      <Hourglass
        visible={true}
        height='50'
        width='50'
        ariaLabel='hourglass-loading'
        colors={['#000', '#000']}
      />
    </div>
  );
};

export default Loader;
