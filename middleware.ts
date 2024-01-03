import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const webServerUrl = process.env.WEBSERVER_URL
const hostUrl = process.env.HOST_URL

export default async function middlware(req: NextRequest) {
    const token = req.cookies.get("token")?.value
    try {
        if (!token) {
            throw new Error("Unauthorized")
        }
    } catch (error) {
        console.log(error)
        return NextResponse.redirect(new URL(`${hostUrl}/unauthorized/`, req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/menu/:path*", "/cart/:path*"]
}