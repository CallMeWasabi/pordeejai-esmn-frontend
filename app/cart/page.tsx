"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Tabs, Tab, Button, menu } from "@nextui-org/react";
import NotConfirmTab from "./NotConfirmTab";
import { OrderQuery } from "../menu/[menuTypeId]/order/OrderAction";
import { clientWebserverUrl, shopUrl } from "../constant";
import Link from "next/link";
import OnGoingTab from "./OnGoingTab";
import SuccessTab from "./SuccessTab";
import CancleTab from "./CancleTab";
import toast from "react-hot-toast";
import { recheckStatus } from "../menu/page";
import { IoReload } from "react-icons/io5";

interface MemoOrder {
  id: number;
  order: string;
  table_id: number;
  created_at: Date;
  updated_at: Date;
}

const Page = () => {
  const router = useRouter();

  const [tableId, setTableId] = useState("");
  const [orders, setOrders] = useState<OrderQuery[]>([]);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    setTableId(localStorage.getItem("table_id") ?? "");
  }, []);

  const refetch = () => {
    setTrigger(!trigger);
  };

  useEffect(() => {
    recheckStatus(router);
  }, [router]);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const tableId = localStorage.getItem("table_id");
        const res = await axios.get(`${clientWebserverUrl}/tables/${tableId}`);
        const { result } = res.data;
        if (!result.orders) {
          setOrders([]);
          return;
        }
        setOrders(result.orders);
      } catch (e: any) {
        if (e.message === "Request failed with status code 401") {
          toast.error("ยืนยันผู้ใช้งานล้มเหลว");
          router.push("/unauthorized");
        }
        toast.error(e.message)
        console.log(e);
      }
    };
    loadOrder();
  }, [trigger, router]);

  return (
    <div className="p-5 flex flex-col">
      <h3 className="flex justify-between items-center">
        <p className="font-bold text-lg">รายการอาหาร</p>
        <div className="flex items-center">
          <Button
            variant="light"
            color="success"
            className="font-bold"
            onClick={refetch}
          >
            <IoReload />
            รีโหลด
          </Button>
          <Button
            as={Link}
            href="/menu"
            variant="light"
            color="success"
            className="font-bold"
          >
            สั่งอาหารเพิ่ม {">"}
          </Button>
        </div>
      </h3>
      <Tabs variant="underlined" color="success" size="lg" fullWidth={true}>
        <Tab key="not-confirm" title="ยังไม่สำเร็จ">
          <NotConfirmTab
            orders={orders.filter((o) =>
              o.status === "NOT_CONFIRM" ? true : false
            )}
            tableId={tableId}
            refetch={refetch}
          />
        </Tab>
        <Tab key="on-going" title="กำลังดำเนินการ">
          <OnGoingTab
            orders={orders.filter((o) =>
              o.status === "PENDING" ? true : false
            )}
            tableId={tableId}
            callForceReload={refetch}
          />
        </Tab>
        <Tab key="success" title="เสร็จสิ้น">
          <SuccessTab
            orders={orders.filter((o) =>
              o.status === "SUCCESS" ? true : false
            )}
            tableId={tableId}
            callForceReload={refetch}
          />
        </Tab>
        <Tab key="failed-cancle" title="ยกเลิก/ล้มเหลว">
          <CancleTab
            orders={orders.filter((o) =>
              o.status === "CANCEL" || o.status === "FAILED" ? true : false
            )}
            tableId={tableId}
            callForceReload={refetch}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

export default Page;
