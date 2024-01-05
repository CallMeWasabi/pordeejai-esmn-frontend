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
    name: string;
    price: number;
    quantity: number;
    status: string;
    created_at: string;
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

export const saveOrder = async (orderString: OrderQuery, tableId: number) => {
    try {
        const jwtToken = await getToken()
        const res = await axios.get(`${process.env.WEBSERVER_URL}/api/memo-orders/table/${tableId}`, {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        })
        let order = JSON.parse(res.data.order)
        let dup = false
        for (let i = 0; i < order.length; i++) {
            if (order[i].name === orderString.name && compareOptions(order[i].options, orderString.options) && order[i].status === "NOT_CONFIRM") {
                order[i].quantity += orderString.quantity
                order[i].price += orderString.price
                dup = true
                break
            }
        }
        if (!dup) {
            order.push(orderString)
        }
        const resUpdate = await axios.put(`${process.env.WEBSERVER_URL}/api/memo-orders/table/${tableId}`, {
            order: JSON.stringify(order)
        }, {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        })
        return resUpdate.status
    } catch (e: any) {
        if (e.message === "Request failed with status code 401") {
            redirect("/unauthorized")
        }
        const jwtToken = await getToken()
        const resUpdate = await axios.put(`${process.env.WEBSERVER_URL}/api/memo-orders/table/${tableId}`, {
            order: JSON.stringify([orderString])
        }, {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        })
        return resUpdate.status
    }
}

export const deleteOrder = async (uuid: string, tableId: number) => {
    try {
        const jwtToken = await getToken()
        const res = await axios.get(`${process.env.WEBSERVER_URL}/api/memo-orders/table/${tableId}`, {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        })
        let order = JSON.parse(res.data.order)
        let newOrder = []
        for (let i = 0; i < order.length; i++) {
            if (order[i].uuid !== uuid) {
                newOrder.push(order[i])
            }
        }
        const resUpdate = await axios.put(`${process.env.WEBSERVER_URL}/api/memo-orders/table/${tableId}`, {
            order: JSON.stringify(newOrder)
        }, {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        })
        return resUpdate.status
    } catch (e: any) {
        if (e.message === "Request failed with status code 401") {
            redirect("/unauthorized")
        }
        console.log(e.message)
    }
}

export const updateOrder = async (uuid: string, orderString: OrderQuery, tableId: number) => {
    try {
        const jwtToken = await getToken()
        const res = await axios.get(`${process.env.WEBSERVER_URL}/api/memo-orders/table/${tableId}`, {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        })
        let order = JSON.parse(res.data.order)
        let newOrder = []
        for (let i = 0; i < order.length; i++) {
            if (order[i].uuid !== uuid) {
                newOrder.push(order[i])
            }
        }
        newOrder.push(orderString)
        const resUpdate = await axios.put(`${process.env.WEBSERVER_URL}/api/memo-orders/table/${tableId}`, {
            order: JSON.stringify(newOrder)
        }, {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        })
        return resUpdate.status
    } catch (error) {
        console.log(error)
        return 401
    }
}