"use client";
import { Button, Chip } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import CardTypeMenu from "./CardTypeMenu";
import Link from "next/link";
import { clientWebserverUrl } from "../constant";
import { shopUrl } from "../page";

export interface MenuTypeQuery {
  id: number;
  name: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  menus: MenuQuery[];
}

export interface OptionQuery {
  id: number;
  name: string;
  choices: string;
  required: boolean;
  multi_select: boolean;
  max_multi: number;
  created_at: Date;
  updated_at: Date;
}

export interface MenuQuery {
  id: number;
  name: string;
  price: number;
  options: OptionQuery[];
  status: string;
  created_at: Date;
  updated_at: Date;
  menu_type_id: number;
}

const MenuPage = () => {
  const router = useRouter();

  const [tableId, setTableId] = useState("");
  const [menuTypes, setMenuTyps] = useState<MenuTypeQuery[]>([]);

  useEffect(() => {
    const rawString = localStorage.getItem("table");
    if (!rawString) {
      setTableId("Not Found");
      return;
    }
    const tableInfo = JSON.parse(rawString);
    setTableId(tableInfo.name);
  }, []);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const raw = localStorage.getItem("table")
        const tableInfo = JSON.parse(raw ?? "{}")

        if (!tableInfo) {
          throw new Error("Unauthorization")
        }

        let res = await axios.get(`${clientWebserverUrl}/api/auth/verify-status/${tableInfo.uuid}`)

        if (res.status !== 200) {
          throw new Error("Unauthorization")
        }

        res = await axios.get(
          `${clientWebserverUrl}/api/auth/verify`,
          {
            headers: {
              Authorization: Cookies.get("token"),
            },
          }
        );
        if (res.status !== 200) {
          throw new Error(res.statusText)
        }
      } catch (error) {
        console.log(error)
          return router.push(`${shopUrl}/unauthorized`);
      }
    };
    verifyUser();
  }, [router]);

  useEffect(() => {
    const loadMenuType = async () => {
      const res = await axios.get(`${clientWebserverUrl}/api/menu-types`);
      if (res.status === 200) {
        const items = res.data.filter((type: MenuTypeQuery) => {
          if (type.status === "OPEN") {
            return true;
          }
          return false;
        });
        setMenuTyps(items);
      }
    };
    loadMenuType();
  }, []);

  return (
    <div className="flex flex-col p-5 space-y-3">
      <div className="flex justify-between">
        <h3 className="font-bold text-lg">หมวดหมู่</h3>
        <h3>
          เลขที่โต๊ะ :{" "}
          <Chip color="success" variant="shadow" className="text-white">
            {tableId}
          </Chip>
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {menuTypes.map((menuType, key) => (
          <div key={key}>
            <Link href={`/menu/${menuType.id}`}>
              <CardTypeMenu menuType={menuType} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
