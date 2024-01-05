"use client";
import { Button, Chip } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import CardMenu from "./CardMenu";
import { MenuQuery } from "../page";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { clientWebserverUrl, shopUrl } from "@/app/constant";
import toast from "react-hot-toast";
import { getToken } from "@/app/auth/serverAction";

const Page = ({ params }: { params: { menuTypeId: number } }) => {
  const router = useRouter();
  const [tableId, setTableId] = useState("");
  const [menus, setMenus] = useState<MenuQuery[]>([]);

  useEffect(() => {
    const rawString = localStorage.getItem("table");
    if (!rawString) {
      return;
    }
    const tableInfo = JSON.parse(rawString);
    setTableId(tableInfo.name);
  }, []);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const jwtToken = await getToken();
        const res = await axios.get(
          `${clientWebserverUrl}/api/menus/type/${params.menuTypeId}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        if (res.status === 200) {
          setMenus(res.data);
        }
      } catch (e: any) {
        if (e.message === "Request failed with status code 401") {
          toast.error("ยืนยันผู้ใช้งานล้มเหลว");
          router.push("/unauthorized");
        }
      }
    };
    loadMenu();
  }, [params.menuTypeId, router]);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const raw = localStorage.getItem("table");
        const tableInfo = JSON.parse(raw ?? "{}");

        if (!tableInfo) {
          throw new Error("Unauthorization");
        }

        let res = await axios.get(
          `${clientWebserverUrl}/api/auth/verify-status/${tableInfo.uuid}`
        );

      } catch (error) {
        console.log(error);
        return router.push(`/unauthorized`);
      }
    };
    verifyUser();
  }, [router]);

  return (
    <div className="flex flex-col p-5 space-y-3">
      <div className="flex justify-between">
        <h3 className="font-bold text-lg">เมนู</h3>
        <h3>
          เลขที่โต๊ะ :{" "}
          <Chip color="success" variant="shadow" className="text-white">
            {tableId}
          </Chip>
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {menus.map((menu, key) => (
          <div key={key}>
            <CardMenu menu={menu} menuTypeId={params.menuTypeId} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
