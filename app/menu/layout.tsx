import React from 'react'
import NavbarComponent from './Navbar'
import { Toaster } from 'react-hot-toast'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
        <NavbarComponent />
        {children}
    </div>
  )
}

export default layout
