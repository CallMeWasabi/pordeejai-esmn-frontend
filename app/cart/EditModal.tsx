"use client";
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { FiMinus, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { MenuQuery, OptionQuery } from "../menu/page";
import {
  OrderQuery,
  SubOrderQueryInterface,
  deleteOrder,
  saveOrder,
  updateOrder,
} from "../menu/[menuTypeId]/order/OrderAction";
import { FaRegTrashAlt } from "react-icons/fa";
import { getToken } from "../auth/serverAction";
import { useRouter } from "next/navigation";

interface ChoiceQuery {
  name: string;
  price: number;
  prefix: string;
}

const EditModal = ({
  order,
  tableId,
  refetch,
}: {
  order: OrderQuery;
  tableId: string;
  refetch: Function;
}) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuQuery>();

  const [requiredOptions, setRequiredOptions] = useState<
    SubOrderQueryInterface[]
  >([]);
  const [newRequiredOptions, setNewRequiredOptions] = useState<
    SubOrderQueryInterface[]
  >([]);

  const [options, setOptions] = useState<SubOrderQueryInterface[]>([]);
  const [newOptions, setNewOptions] = useState<SubOrderQueryInterface[]>([]);

  const [quantity, setQuantity] = useState(0);
  const [newQuantity, setNewQuantity] = useState(0);

  const [totalPrice, setTotalPrice] = useState(0);
  const [loadingState, setLoadingState] = useState(false);

  const onOpenChange = () => {
    setNewRequiredOptions(requiredOptions);
    setNewOptions(options);
    setNewQuantity(quantity);
    setOpen(!open);
  };

  useEffect(() => {
    let price = menu?.price ?? 0;
    for (let i = 0; i < newOptions.length; i++) {
      price += newOptions[i].price;
    }
    for (let i = 0; i < newRequiredOptions.length; i++) {
      price += newRequiredOptions[i].price;
    }
    setTotalPrice(price * newQuantity);
  }, [newOptions, newRequiredOptions, menu?.price, newQuantity]);

  useEffect(() => {
    setNewRequiredOptions(requiredOptions);
    setNewOptions(options);
    setNewQuantity(quantity);
  }, [options, requiredOptions, quantity]);

  const loadMenu = async () => {
    try {
      const res = await axios.get(
        `${clientWebserverUrl}/menus/${order.menu_id}`,
        {
          headers: {
            Includes: true,
          },
        }
      );
      const { result } = res.data;
      setMenu(result);

      let tempRequired = [];
      let tempOptions = [];
      if (order.options) {
        for (let i = 0; i < result.options.length; i++) {
          if (result.options[i].required) {
            let v: any[] = [];
            let p = 0;
            for (let j = 0; j < order.options.length; j++) {
              if (result.options[i].name === order.options[j].name) {
                v = order.options[j].value;
                p = order.options[j].price;
                break;
              }
            }
            tempRequired.push({
              name: result.options[i].name,
              value: v,
              price: p,
            });
          } else {
            let v: any[] = [];
            let p = 0;
            for (let j = 0; j < order.options.length; j++) {
              if (result.options[i].name === order.options[j].name) {
                v = order.options[j].value;
                p = order.options[j].price;
                break;
              }
            }
            tempOptions.push({
              name: result.options[i].name,
              value: v,
              price: p,
            });
          }
        }
      }
      setRequiredOptions(tempRequired);
      setOptions(tempOptions);
      setQuantity(order.quantity);
    } catch (e: any) {
      if (e.message === "Request failed with status code 401") {
        toast.error("ยืนยันผู้ใช้งานล้มเหลว");
        router.push("/unauthorized");
      }
      console.error(e.message);
    }
  };

  const handleOptionsChange = (option: OptionQuery, e: string[]) => {
    if (e.length > option.max_select) {
      return;
    }

    let filteredOptions = newOptions.filter((o) =>
      o.name !== option.name ? true : false
    );
    const choices = option.choices;
    let price = 0;
    for (let i = 0; i < e.length; i++) {
      for (let j = 0; j < choices.length; j++) {
        if (e[i] === choices[j].name) {
          price += choices[j].price;
        }
      }
    }
    setNewOptions([...filteredOptions, { name: option.name, price, value: e }]);
  };

  const handleRequiredOptionsChange = (option: OptionQuery, e: string) => {
    const choices = option.choices;
    let price = 0;
    for (let j = 0; j < choices.length; j++) {
      if (e === choices[j].name) {
        price += choices[j].price;
      }
    }
    setNewRequiredOptions([
      ...newRequiredOptions.map((r) => {
        if (r.name === option.name) {
          return { name: r.name, value: [e], price: price };
        } else {
          return { name: r.name, value: r.value, price: r.price };
        }
      }),
    ]);
  };

  const handleUpdateOrder = async (onClose: Function) => {
    setLoadingState(true);
    const newOrder = {
      uuid: order.uuid,
      name: menu?.name ?? "",
      menu_id: menu?.id ?? "null",
      price: totalPrice,
      quantity: newQuantity,
      status: "NOT_CONFIRM",
      created_at: new Date(),
      options: [
        ...newRequiredOptions.filter((r) =>
          r.value.length > 0 ? true : false
        ),
        ...newOptions.filter((o) => (o.value.length > 0 ? true : false)),
      ],
    };
    try {
      const tableId = localStorage.getItem("table_id") ?? "null";
      await updateOrder(newOrder, tableId);
      refetch();
      onClose();
      toast.success("บันทึกรายการสำเร็จ");
    } catch (error) {
      console.log(error);
      toast.error("บันทึกรายการล้มเหลว โปรดติดต่อผู้ให้บริการ");
    }
    setLoadingState(false);
  };

  const handleDeleteOrder = async (onClose: Function) => {
    setLoadingState(true);
    try {
      await deleteOrder(order.uuid, tableId);
      refetch();
      onClose();
      toast.success("ลบรายการสำเร็จ");
    } catch (err: any) {
      toast.error("ลบรายการล้มเหลว");
    }
    setLoadingState(false);
  };

  return (
    <>
      <button
        className="text-green-500 text-start"
        onClick={async () => {
          if (!open) {
            await loadMenu();
          }
          onOpenChange();
        }}
      >
        แก้ไข
      </button>
      <Modal isOpen={open} onOpenChange={onOpenChange} isDismissable={false}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-bodl text-xl mb-5">
                {order.name}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4 text-sm">
                  {menu?.options &&
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
                          จำนวน {option.choices.length} ตัวเลือก |
                          เลือกได้สูงสุด {option.max_select} ตัวเลือก
                        </p>
                        {option.required && newRequiredOptions.length > 0 ? (
                          <RadioGroup
                            value={
                              newRequiredOptions.filter((r) => {
                                if (r.name === option.name) {
                                  return true;
                                }
                                return false;
                              })[0].value[0]
                            }
                            color="success"
                            onValueChange={(e) =>
                              handleRequiredOptionsChange(option, e)
                            }
                          >
                            {option.choices.map(
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
                          <>
                            {newOptions.length > 0 && (
                              <CheckboxGroup
                                color="success"
                                value={
                                  newOptions.filter((o) =>
                                    o.name === option.name ? true : false
                                  )[0].value
                                }
                                onValueChange={(e) =>
                                  handleOptionsChange(option, e)
                                }
                              >
                                {option.choices.map(
                                  (
                                    choice: {
                                      name: string;
                                      price: number;
                                      prefix: string;
                                    },
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
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </ModalBody>
              <ModalFooter className="flex flex-col">
                <Divider />
                <div className="flex p-5 items-center gap-2">
                  {newQuantity === 0 ? (
                    <>
                      <Button
                        size="sm"
                        radius="full"
                        color="danger"
                        variant="flat"
                        isLoading={loadingState}
                        onClick={async () => await handleDeleteOrder(onClose)}
                      >
                        <FaRegTrashAlt />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        radius="full"
                        onClick={() => setNewQuantity(newQuantity - 1)}
                      >
                        <FiMinus />
                      </Button>
                    </>
                  )}
                  <p className="font-bold text-lg">{newQuantity}</p>
                  <Button
                    size="sm"
                    radius="full"
                    onClick={() => setNewQuantity(newQuantity + 1)}
                    isDisabled={loadingState}
                  >
                    <FiPlus />
                  </Button>
                  {newQuantity === 0 ? (
                    <>
                      <Button
                        color="danger"
                        variant="flat"
                        className="w-full"
                        onClick={async () => handleDeleteOrder(onClose)}
                      >
                        ลบ
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        color="success"
                        className="text-white font-bold flex justify-between w-full"
                        onClick={async () => await handleUpdateOrder(onClose)}
                        isLoading={loadingState}
                      >
                        <p>บันทึก</p>
                        <p>฿{totalPrice}</p>
                      </Button>
                    </>
                  )}
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditModal;
