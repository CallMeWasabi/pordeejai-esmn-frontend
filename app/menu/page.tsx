"use client";
import { Button, Chip } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import CardTypeMenu from "./CardTypeMenu";
import Link from "next/link";
import { clientWebserverUrl, shopUrl } from "../constant";
import { getToken } from "../auth/serverAction";
import toast from "react-hot-toast";

export const recheckStatus = async (router: any) => {
  try {
    await axios.get(`${clientWebserverUrl}/auth`, {
      headers: {
        Token: await getToken(),
      },
    });
  } catch (err: any) {
    console.error(err);
    return router.push(`${shopUrl}/unauthorized`);
  }
};

export interface MenuTypeQuery {
  id: number;
  name: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  menus: MenuQuery[];
}

export interface ChoiceQuery {
  id: string;
  index: number;
  name: string;
  price: number;
  prefix: string;
}

export interface OptionQuery {
  id: number;
  name: string;
  choices: ChoiceQuery[];
  required: boolean;
  multi_select: boolean;
  max_select: number;
  created_at: Date;
  updated_at: Date;
  menus_id: string[];
  menus: MenuQuery[];
}

export interface MenuQuery {
  id: string;
  name: string;
  price: number;
  status: string;
  created_at: Date;
  updated_at: Date;
  menu_type_id: string;
  options_id: string[];
  options: OptionQuery[];
}

const MenuPage = () => {
  const router = useRouter();

  const [tableName, setTableName] = useState("");
  const [menuTypes, setMenuTypes] = useState<MenuTypeQuery[]>([]);

  useEffect(() => {
    const tableName = localStorage.getItem("table_name");
    if (!tableName) {
      setTableName("Not Found");
      return;
    }
    setTableName(tableName);
  }, []);

  useEffect(() => {
    recheckStatus(router);
  }, [router]);

  useEffect(() => {
    const loadMenuType = async () => {
      try {
        const res = await axios.get(`${clientWebserverUrl}/menu-types`);
        const { result } = res.data;
        const menuTypeDatas = result.filter((type: MenuTypeQuery) => {
          if (type.status === "OPEN") {
            return true;
          }
          return false;
        });
        setMenuTypes(menuTypeDatas);
      } catch (e: any) {
        if (e.message === "Request failed with status code 401") {
          toast.error("ยืนยันผุ้ใช้งานล้มเหลว");
          return router.push("/unauthorized");
        }
        console.log(e.message);
      }
    };
    loadMenuType();
  }, [router]);

  return (
    <div className="flex flex-col p-5 space-y-3">
      <div className="flex justify-between">
      <h3 className="font-bold text-lg">ประเภทอาหาร</h3>
        <h3>
          โต๊ะ:{" "}
          <Chip color="success" variant="shadow" className="text-white">
            {tableName}
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
