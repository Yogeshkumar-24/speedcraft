import Link from 'next/link'
import React from 'react'

const Multiplayer = () => {
  return (
    <Link href={"/room"}>
        <div className=' text-white mx-4 bg-black px-3 py-2 rounded-md dark:bg-blue-500 font-bold'>
          Multiplayer typing test
        </div>
    </Link>
  )
}

export default Multiplayer