"use server"

import { getToken } from "@/app/auth/serverAction";
import axios from "axios";
import { redirect } from "next/navigation";

export interface SubOrderQueryInterface {
    name: string;
    price: number;
    value: string[]
}

export interface OrderQuery {
    uuid: string;
    menu_id: string;
    name: string;
    price: number;
    quantity: number;
    status: string;
    created_at: Date;
    options: SubOrderQueryInterface[];
}

const compareOptions = (origin: SubOrderQueryInterface[], target: SubOrderQueryInterface[]) => {
    if (origin.length === target.length) {
        for (let i = 0; i < origin.length; i++) {
            if (
                origin[i].name !== target[i].name ||
                origin[i].price !== target[i].price
            ) {
                return false
            } else {
                for (let j = 0; j < origin[i].value.length; j++) {
                    if (origin[i].value[j] !== target[i].value[j]) {
                        return false
                    }
                }
            }
        }
    } else {
        return false
    }
    return true
}

export const saveOrder = async (incommingOrder: OrderQuery, tableId: string) => {
    try {
        const res = await axios.get(`${process.env.WEBSERVER_URL}/tables/${tableId}`)
        let { orders } = res.data.result
        if (orders === null || orders === undefined || orders.length === 0) {
            throw new Error("Orders is empty")
        }
        let dup = false
        for (let i = 0; i < orders.length; i++) {
            if (orders[i].name === incommingOrder.name && compareOptions(orders[i].options, incommingOrder.options) && orders[i].status === "NOT_CONFIRM") {
                orders[i].quantity += incommingOrder.quantity
                orders[i].price += incommingOrder.price
                dup = true
                break
            }
        }
        if (!dup) {
            orders.push(incommingOrder)
        }

        await axios.put(`${process.env.WEBSERVER_URL}/orders/${tableId}`, {
            orders
        })
    } catch (e: any) {
        await axios.put(`${process.env.WEBSERVER_URL}/orders/${tableId}`, {
            orders: [incommingOrder]
        })
    }
}

export const deleteOrder = async (uuid: string, tableId: string) => {
    try {
        const res = await axios.get(`${process.env.WEBSERVER_URL}/tables/${tableId}`)
        let { orders } = res.data.result
        let newOrder = []
        for (let i = 0; i < orders.length; i++) {
            if (orders[i].uuid !== uuid) {
                newOrder.push(orders[i])
            }
        }
        await axios.put(`${process.env.WEBSERVER_URL}/orders/${tableId}`, {
            orders: newOrder
        })
    } catch (e: any) {
        if (e.message === "Request failed with status code 401") {
            redirect("/unauthorized")
        }
        console.log(e.message)
    }
}

export const updateOrder = async (incommingOrder: OrderQuery, tableId: string) => {
    try {
        const res = await axios.get(`${process.env.WEBSERVER_URL}/tables/${tableId}`)
        let { orders } = res.data.result
        let newOrder = []
        for (let i = 0; i < orders.length; i++) {
            if (orders[i].uuid !== incommingOrder.uuid) {
                newOrder.push(orders[i])
            } else {
                newOrder.push(incommingOrder)
            }
        }
        await axios.put(`${process.env.WEBSERVER_URL}/orders/${tableId}`, {
            orders: newOrder
        })
    } catch (error) {
        console.log(error)
        return 401
    }
}