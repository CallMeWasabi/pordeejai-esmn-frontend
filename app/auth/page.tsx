"use client";
import { Button } from "@nextui-org/react";
import { useSearchParams, useRouter, redirect } from "next/navigation";
import React, { useEffect } from "react";
import { authVerify, getToken, setToken } from "./serverAction";
import { clientWebserverUrl, shopUrl } from "../constant";
import axios from "axios";
import toast from "react-hot-toast";

const AuthPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const auth = async () => {
      try {
        const uuid = searchParams.get("uuid");
        if (!uuid) {
          return redirect("/unauthorized")
        }
        const res = await axios.get(`${clientWebserverUrl}/auth/${uuid}`);
        const { token, table_name, table_id } = res.data;
        localStorage.setItem("table_name", table_name);
        localStorage.setItem("table_id", table_id)
        setToken(token);
        toast.success("auth successefully");
        return router.push(`${shopUrl}/menu`);
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
