"use client";
import { Button, Chip } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import CardMenu from "./CardMenu";
import { MenuQuery, recheckStatus } from "../page";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { clientWebserverUrl, shopUrl } from "@/app/constant";
import toast from "react-hot-toast";
import { getToken } from "@/app/auth/serverAction";

const Page = ({ params }: { params: { menuTypeId: number } }) => {
  const router = useRouter();
  const [tableName, setTableName] = useState("");
  const [menus, setMenus] = useState<MenuQuery[]>([]);

  useEffect(() => {
    const tableName = localStorage.getItem("table_name")
    if (!tableName) {
      return setTableName("Not found");
    }
    setTableName(tableName);
  }, []);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const res = await axios.get(
          `${clientWebserverUrl}/menu-types/${params.menuTypeId}`
        );
        const { menus } = res.data.result;
        const menuDatas = menus.filter((menu: any) =>
          menu.status === "OPEN" ? true : false
        );
        setMenus(menuDatas)
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
    recheckStatus(router);
  }, [router]);

  return (
    <div className="flex flex-col p-5 space-y-3">
      <div className="flex justify-between">
        <h3 className="font-bold text-lg">เมนู</h3>
        <h3>
          เลขที่โต๊ะ :{" "}
          <Chip color="success" variant="shadow" className="text-white">
            {tableName}
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
