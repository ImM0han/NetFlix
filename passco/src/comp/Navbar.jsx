import React from 'react'

const Navbar = () => {
  return (
    <nav className="w-full bg-gray-500 shadow-md p-4 flex justify-around items-center">
      
      <div className="logo">
        <span className='text-green-500 font-bold text-2xl'>&lt;</span>
        <span className='text-black font-bold text-2xl'>Pass</span>
        <span className='text-green-500 font-bold text-2xl'>Code/&gt;</span>
      </div>

      <ul className="flex gap-3">
        <li className='hover:font-bold'><a href="#">Home</a></li>
        <li className='hover:font-bold'><a href="#">About</a></li>
        <li className='hover:font-bold'><a href="#">Contact</a></li>
      </ul>
    </nav>
  )
}

export default Navbar
