
import axios from "axios";
import Cookies from "js-cookie";


export const authVerify = async (uuid: string) => {
    const response = await axios.post(`http://localhost:8080/api/auth`, {
        uuid: uuid,
    });
    if (response.status === 200) {
        Cookies.set("token", response.data.cookie, { secure: true })
        return {
            status: 200,
            table: response.data.table
        }
    } else {
        return {
            status: response.status,
        }
    }
}