"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import axios from "axios";
import { clientWebserverUrl } from "@/app/constant";
import {
  Divider,
  RadioGroup,
  Radio,
  CheckboxGroup,
  Checkbox,
  Button,
} from "@nextui-org/react";
import { MenuQuery, OptionQuery } from "../../page";
import { GoPlus } from "react-icons/go";
import { FiMinus, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { saveOrder } from "./OrderAction";
import Cookies from "js-cookie";
import { shopUrl } from "@/app/page";

interface ChoiceQuery {
  name: string;
  price: number;
  prefix: string;
}

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter()

  const [menu, setMenu] = useState<MenuQuery>();
  const [requiredOptions, setRequiredOptions] = useState<
    {
      name: string;
      value: string[];
      price: number;
    }[]
  >([]);
  const [options, setOptions] = useState<
    {
      name: string;
      value: string[];
      price: number;
    }[]
  >([]);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loadingState, setLoadingState] = useState(false);

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
    const loadMenu = async () => {
      const res = await axios.get(
        `${clientWebserverUrl}/api/menus/${searchParams.get("id")}`
      );
      if (res.status === 200) {
        setMenu(res.data);

        let tempRequired = [];
        let tempOptions = [];
        for (let i = 0; i < res.data.options.length; i++) {
          if (res.data.options[i].required) {
            tempRequired.push({
              name: res.data.options[i].name,
              value: [],
              price: 0,
            });
          } else {
            tempOptions.push({
              name: res.data.options[i].name,
              value: [],
              price: 0,
            });
          }
        }
        setRequiredOptions(tempRequired);
        setOptions(tempOptions);
        setTotalPrice(res.data.price);
      }
    };
    loadMenu();
  }, [searchParams]);

  useEffect(() => {
    let price = menu?.price ?? 0;
    for (let i = 0; i < options.length; i++) {
      price += options[i].price;
    }
    for (let i = 0; i < requiredOptions.length; i++) {
      price += requiredOptions[i].price;
    }
    setTotalPrice(price * quantity);
  }, [requiredOptions, options, menu?.price, quantity]);

  const handleOptionsChange = (option: OptionQuery, e: string[]) => {
    if (e.length > option.max_multi) {
      return;
    }

    let filteredOptions = options.filter((o) =>
      o.name !== option.name ? true : false
    );
    const choices = JSON.parse(option.choices);
    let price = 0;
    for (let i = 0; i < e.length; i++) {
      for (let j = 0; j < choices.length; j++) {
        if (e[i] === choices[j].name) {
          price += choices[j].price;
        }
      }
    }
    setOptions([...filteredOptions, { name: option.name, price, value: e }]);
  };

  const handleRequiredOptionsChange = (option: OptionQuery, e: string) => {
    const choices = JSON.parse(option.choices);
    let price = 0;
    for (let j = 0; j < choices.length; j++) {
      if (e === choices[j].name) {
        price += choices[j].price;
      }
    }
    setRequiredOptions([
      ...requiredOptions.map((r) => {
        if (r.name === option.name) {
          return { name: r.name, value: [e], price: price };
        } else {
          return { name: r.name, value: r.value, price: r.price };
        }
      }),
    ]);
  };

  const validateRequired = () => {
    for (let i = 0; i < requiredOptions.length; i++) {
      if (requiredOptions[i].value.length === 0) {
        return false;
      }
    }
    return true;
  };

  const addNewOrderToCard = async () => {
    setLoadingState(true);
    const orderString = {
      uuid: crypto.randomUUID(),
      name: menu?.name ?? "",
      price: totalPrice,
      quantity,
      status: "NOT_CONFIRM",
      created_at: (new Date()).toLocaleString(),
      options: [
        ...requiredOptions.filter((r) => (r.value.length > 0 ? true : false)),
        ...options.filter((o) => (o.value.length > 0 ? true : false)),
      ],
    };
    try {
      const tableId = JSON.parse(localStorage.getItem("table") ?? "[]").id;
      const status = await saveOrder(orderString, tableId);

      if (status === 200) {
        toast.success("เพิ่มรายการสำเร็จ");
      }
      else {
        throw new Error("http code: " + status.toString())
      }
    } catch (error) {
      console.log(error);
      toast.error("เพิ่มรายการล้มเหลว โปรดติดต่อผู้ให้บริการ");
    }
    setLoadingState(false);
  };

  return (
    <div className="flex flex-col p-5">
      <h3 className="font-bold text-xl mb-5">{menu?.name}</h3>
      <div className="flex flex-col gap-4 text-sm">
        {menu &&
          menu.options.map((option, key) => (
            <div className="flex flex-col" key={key}>
              <Divider className="mb-5" />
              <div className="flex gap-2 items-center font-bold">
                <h3>{option.name}</h3>
                {option.required && (
                  <p className="opacity-60 text-sm">(ต้องเลือก)</p>
                )}
              </div>
              <p className="opacity-60 mb-2">
                จำนวน {JSON.parse(option.choices).length} ตัวเลือก |
                เลือกได้สูงสุด {option.max_multi} ตัวเลือก
              </p>
              {option.required ? (
                <RadioGroup
                  color="success"
                  onValueChange={(e) => handleRequiredOptionsChange(option, e)}
                >
                  {JSON.parse(option.choices).map(
                    (choice: ChoiceQuery, key: number) => (
                      <Radio value={choice.name} key={key}>
                        <div className="flex justify-between opacity-60 gap-2">
                          <p className="text-sm">{choice.name}</p>
                          <p className="text-sm">
                            {choice.prefix === "inc"
                              ? "+"
                              : choice.prefix === "none"
                              ? ""
                              : "-"}
                            ฿{choice.price}
                          </p>
                        </div>
                      </Radio>
                    )
                  )}
                </RadioGroup>
              ) : (
                <CheckboxGroup
                  color="success"
                  value={
                    options.filter((o) =>
                      o.name === option.name ? true : false
                    )[0].value
                  }
                  onValueChange={(e) => handleOptionsChange(option, e)}
                >
                  {JSON.parse(option.choices).map(
                    (
                      choice: { name: string; price: number; prefix: string },
                      key: number
                    ) => (
                      <Checkbox key={key} value={choice.name}>
                        <div className="flex justify-between opacity-60 gap-2">
                          <p className="text-sm">{choice.name}</p>
                          <p className="text-sm">
                            {choice.prefix === "inc"
                              ? "+"
                              : choice.prefix === "none"
                              ? ""
                              : "-"}
                            ฿{choice.price}
                          </p>
                        </div>
                      </Checkbox>
                    )
                  )}
                </CheckboxGroup>
              )}
            </div>
          ))}
      </div>
      <div className="flex flex-col fixed bottom-0 left-0 w-full h-[100px]">
        <Divider />
        <div className="flex p-5 items-center gap-2">
          <Button
            size="sm"
            radius="full"
            onClick={() => setQuantity(quantity - 1)}
            isDisabled={quantity === 1 || loadingState}
          >
            <FiMinus />
          </Button>
          <p className="font-bold text-lg">{quantity}</p>
          <Button
            size="sm"
            radius="full"
            onClick={() => setQuantity(quantity + 1)}
            isDisabled={loadingState}
          >
            <FiPlus />
          </Button>
          <Button
            color="success"
            className="text-white font-bold flex justify-between w-full"
            isDisabled={validateRequired() ? false : true}
            onClick={addNewOrderToCard}
            isLoading={loadingState}
          >
            <p>เพิ่มลงตะกร้า</p>
            <p>฿{totalPrice}</p>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
