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
import { getToken } from "../auth/serverAction";
import toast from "react-hot-toast";

interface MemoOrder {
  id: number;
  order: string;
  table_id: number;
  created_at: Date;
  updated_at: Date;
}

const Page = () => {
  const router = useRouter();

  const [memoOrder, setMemoOrder] = useState<MemoOrder>();
  const [orders, setOrders] = useState<OrderQuery[]>([]);
  const [trigger, setTrigger] = useState(false);

  const refetch = () => {
    setTrigger(!trigger);
  };

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

      } catch (e: any) {
        if (e.message === "Request failed with status code 401") {
          toast.error("ยืนยันผู้ใช้งานล้มเหลว");
          return router.push("/unauthorized");
        }
        console.log(e.message);
        return router.push(`/unauthorized`);
      }
    };
    verifyUser();
  }, [router]);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const jwtToken = await getToken();
        const res = await axios.get(
          `${clientWebserverUrl}/api/memo-orders/table/${
            JSON.parse(localStorage.getItem("table") ?? "[]").id
          }`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        setMemoOrder(res.data);
        setOrders(JSON.parse(res.data.order));
      } catch (e: any) {
        if (e.message === "Request failed with status code 401") {
          toast.error("ยืนยันผู้ใช้งานล้มเหลว");
          router.push("/unauthorized");
        }
        console.log(e.message);
      }
    };
    loadOrder();
  }, [trigger, router]);

  return (
    <div className="p-5 flex flex-col">
      <h3 className="flex justify-between items-center">
        <p className="font-bold text-lg">รายการอาหาร</p>
        <Button
          as={Link}
          href="/menu"
          variant="light"
          color="success"
          className="font-bold"
        >
          สั่งอาหารเพิ่ม {">"}
        </Button>
      </h3>
      <Tabs variant="underlined" color="success" size="lg" fullWidth={true}>
        <Tab key="not-confirm" title="ยังไม่สำเร็จ">
          <NotConfirmTab
            orders={orders.filter((o) =>
              o.status === "NOT_CONFIRM" ? true : false
            )}
            tableId={memoOrder?.table_id ?? 0}
            refetch={refetch}
          />
        </Tab>
        <Tab key="on-going" title="กำลังดำเนินการ">
          <OnGoingTab
            orders={orders.filter((o) =>
              o.status === "ON_GOING" ? true : false
            )}
            tableId={memoOrder?.table_id ?? 0}
            callForceReload={refetch}
          />
        </Tab>
        <Tab key="success" title="เสร็จสิ้น">
          <SuccessTab
            orders={orders.filter((o) =>
              o.status === "SUCCESS" ? true : false
            )}
            tableId={memoOrder?.table_id ?? 0}
            callForceReload={refetch}
          />
        </Tab>
        <Tab key="failed-cancle" title="ยกเลิก/ล้มเหลว">
          <CancleTab
            orders={orders.filter((o) =>
              o.status === "CANCLE" || o.status === "FAILED" ? true : false
            )}
            tableId={memoOrder?.table_id ?? 0}
            callForceReload={refetch}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

export default Page;
