"use client";
import { Button, Chip } from "@nextui-org/react";
import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { IconContext } from "react-icons";
import { FiShieldOff } from "react-icons/fi";

const Page = () => {
  useEffect(() => {
    localStorage.removeItem("table");
    Cookies.remove("token");
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-red-500 flex flex-col items-center space-y-4">
        <IconContext.Provider value={{ size: "76px" }}>
          <FiShieldOff />
        </IconContext.Provider>
        <Button color="danger" variant="flat">
          ยืนยันตัวตนล้มเหลว
        </Button>
      </div>
    </div>
  );
};

export default Page;
