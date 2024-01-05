"use server"
import { Button } from "@nextui-org/react"
import { redirect } from "next/navigation"
import React from "react"

const Home = () => {

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <Button color="primary">กรุณายืนยันก่อนใช้บริการ</Button>
    </div>
  )
}

export default Home
