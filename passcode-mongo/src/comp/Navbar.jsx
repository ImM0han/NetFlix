import React from 'react'

const Navbar = () => {
  return (
    <nav className="w-full bg-gray-500 shadow-md p-4 flex justify-between items-center">
      
      <div className="logo">
        <span className='text-green-500 font-bold text-2xl'>&lt;</span>
        <span className='text-black font-bold text-2xl'>Pass</span>
        <span className='text-green-500 font-bold text-2xl'>Code/&gt;</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-black font-medium">
            Password Manager
          </span>
        </div>
        
        <ul className="flex gap-3">
          <li className='hover:font-bold'><a href="#">Home</a></li>
          <li className='hover:font-bold'><a href="#">About</a></li>
          <li className='hover:font-bold'><a href="#">Contact</a></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
