import React from 'react'

const Navbar = () => {
  return (
    <div className=' bg-slate-900 w-full h-20  text-center flex items-center justify-between'>
        <div className='ml-6 font-semibold'>KIMDEV</div>
        <div className=''>
            <ul className='flex mr-6'>
                <li className='mr-2 font-semibold'><a href='/'>HOME</a></li>
                <li className='font-semibold'><a href='/dashboard'>DASHBOARD</a></li>
            </ul>
        </div>
    </div>
  )
}

export default Navbar;