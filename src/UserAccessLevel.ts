import { jwtDecode } from "jwt-decode";

interface MyJwtPayload {
    userId: number;
    accessLevel: string; // Или 'USER' | 'OWNER'
    sub: string;
    exp: number;
    iat: number;
}

export function getUserAccessLevel() {
    const token = localStorage.getItem("authToken"); // или sessionStorage, смотря где хранишь
    if (!token) return null;

    try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        return decoded.accessLevel; // это то, что ты положил в claims
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
}

export function getUsername() {
    const token = localStorage.getItem("authToken"); // или sessionStorage, смотря где хранишь
    if (!token) return null;

    try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        return decoded.sub; // это то, что ты положил в claims
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
}
