"use client";
import { Button } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { authVerify } from "./serverAction";
import { shopUrl } from "../constant";

const AuthPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const auth = async () => {
      try {
        const uuid = searchParams.get("uuid");
        if (!uuid) {
          return router.push(`${shopUrl}/unauthorized`);
        }
        const response = await authVerify(uuid);
        if (response.status === 200) {
          localStorage.setItem("table", JSON.stringify(response.table));
          return router.push(`${shopUrl}/menu`);
        } else {
          throw new Error("Unauthorized")
        }
      } catch (error) {
        return router.push(`${shopUrl}/unauthorized`);
      }
    };
    auth();
  }, [router, searchParams]);

  return (
    <div className="flex justify-center items-center w-[100vw] h-[100vh]">
      <Button isLoading={true} color="primary">
        กำลังยืนยันตัวตน
      </Button>
    </div>
  );
};

export default AuthPage;
