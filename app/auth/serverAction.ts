"use server"
import axios from "axios";
import { cookies } from "next/headers"


export const authVerify = async (uuid: string) => {
    try {
        const res = await axios.post(`${process.env.WEBSERVER_URL}/auth`, {
            uuid: uuid,
        });

        cookies().set({
            name: "token",
            value: res.data.token,
            httpOnly: true,
            path: "/"
        })

        return {
            status: 200,
            table: res.data.table,
            token: res.data.token
        }
    } catch (error) {
        console.log(error)
    }
}

export const setToken = (token: string) => {
    cookies().set({
        name: "token",
        value: token,
        httpOnly: true,
        path: "/"
    })
}

export const getToken = async () => {
    const token = cookies().get("token")?.value
    if (!token) {
        return "undifined"
    }
    return token
}

export const deleteToken = async () => {
    cookies().delete("token")
}