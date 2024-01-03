import React from "react";
import { OrderQuery } from "../menu/[menuTypeId]/order/OrderAction";
import { IconContext } from "react-icons";
import { MdNoFood } from "react-icons/md";
import { Chip, Code, Divider } from "@nextui-org/react";
import { GiCookingPot } from "react-icons/gi";

const OnGoingTab = ({
  orders,
  tableId,
  callForceReload,
}: {
  orders: OrderQuery[];
  tableId: number;
  callForceReload: Function;
}) => {
  const totalPrice = () => {
    let price = 0;
    orders.map((order) => (price += order.price));
    return price;
  };

  return (
    <div className="flex flex-col gap-6">
      {orders.length === 0 ? (
        <div className="h-full w-full flex flex-col justify-center items-center gap-2">
          <div className="text-green-500">
            <IconContext.Provider value={{ size: "56px" }}>
              <GiCookingPot />
            </IconContext.Provider>
          </div>
          <p>ยังไม่มีรายการคำสั่ง</p>
        </div>
      ) : (
        <>
          <div className="font-bold">
            <Chip color="warning" variant="flat" size="lg">
              กำลังดำเนินการ
            </Chip>
          </div>
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
        </>
      )}
    </div>
  );
};

export default OnGoingTab;
