"use client";
import React, { useState } from "react";
import { OrderQuery } from "../menu/[menuTypeId]/order/OrderAction";
import { Button, Code, Divider } from "@nextui-org/react";
import Link from "next/link";
import axios from "axios";
import { clientWebserverUrl } from "../constant";
import toast from "react-hot-toast";
import { IconContext } from "react-icons";
import { MdNoFood } from "react-icons/md";
import EditModal from "./EditModal";
import { getToken } from "../auth/serverAction";
import { useRouter } from "next/navigation";

const NotConfirmTab = ({
  orders,
  tableId,
  refetch,
}: {
  orders: OrderQuery[];
  tableId: number;
  refetch: Function;
}) => {
  const router = useRouter()
  const [loadingState, setLoadingState] = useState(false);

  const totalPrice = () => {
    let price = 0;
    orders.map((order) => (price += order.price));
    return price;
  };

  const submitOrder = async () => {
    setLoadingState(true);
    try {
      const jwtToken = await getToken();
      let res = await axios.get(
        `${clientWebserverUrl}/api/memo-orders/table/${tableId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      if (res.status === 200) {
      }
      const memoOrder = res.data;
      const currentOrder = JSON.parse(memoOrder.order);
      const uuids = orders.map((order) => order.uuid);
      const newOrder = currentOrder.map((curr: OrderQuery) => {
        if (uuids.includes(curr.uuid)) {
          curr.status = "ON_GOING";
          return curr;
        } else {
          return curr;
        }
      });

      res = await axios.put(
        `${clientWebserverUrl}/api/memo-orders/table/${tableId}`,
        {
          order: JSON.stringify(newOrder),
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      toast.success("สั่งอาหารสำเร็จ");
      refetch();
    } catch (e: any) {
      if (e.message === "Request failed with status code 401") {
        router.push("/unauthorized")
      }
      console.log(e.message);
      toast.error("สั่งรายการอาหารล้มเหลว โปรดติดต่อผู้ให้บริการ");
    }
    setLoadingState(false);
  };

  const getAllQuantity = () => {
    let quantity = 0;
    for (let i = 0; i < orders.length; i++) {
      quantity += orders[i].quantity;
    }
    return quantity;
  };

  return (
    <div className="flex flex-col gap-6">
      {orders.length === 0 ? (
        <div className="h-full w-full flex flex-col justify-center items-center gap-2">
          <div className="text-green-500">
            <IconContext.Provider value={{ size: "56px" }}>
              <MdNoFood />
            </IconContext.Provider>
          </div>
          <p>ยังไม่มีรายการอาหาร</p>
        </div>
      ) : (
        <>
          <p className="font-bold">เมนู</p>
          {orders.map((order, key) => (
            <div key={key} className="flex gap-4">
              <Code className="font-bold">{order.quantity}</Code>
              <div className="flex flex-col w-full gap-1">
                <div className="flex justify-between w-full">
                  <p className="font-bold">{order.name}</p>
                  <p className="text-neutral-600">฿{order.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-2 text-neutral-500">
                  {order.options.map((option, key) => (
                    <p key={key}>{option.value.join(" + ")}</p>
                  ))}
                </div>
                <EditModal order={order} tableId={tableId} refetch={refetch} />
              </div>
            </div>
          ))}
          <Divider />
          <div className="flex flex-col">
            <div className="flex justify-between text-lg font-bold text-green-500">
              <p>ทั้งหมด</p>
              <p>฿{totalPrice().toFixed(2)}</p>
            </div>
          </div>
          <div className="fixed p-3 bottom-0 left-0 w-full">
            <Divider className="mb-4" />
            <Button
              isLoading={loadingState}
              color="success"
              className="text-white w-full flex justify-between h-full py-3"
              onClick={async () => await submitOrder()}
            >
              <div className="flex gap-2 items-center">
                <p className="px-3 py-2 bg-white text-green-500 rounded-lg">
                  {getAllQuantity()}
                </p>
                <p className="font-bold text-lg">สั่งเลย</p>
              </div>
              <p className="text-lg font-bold">฿{totalPrice().toFixed(2)}</p>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotConfirmTab;
