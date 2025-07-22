// 📄 File: lib/user.js
import fs from "fs";

const userFile = "./database/users.json";

export function isRegistered(senderId) {
    if (!fs.existsSync(userFile)) return false;
    const data = JSON.parse(fs.readFileSync(userFile, "utf-8"));
    return !!data[senderId];
}

export function getUserData(senderId, pushName) {
    let data = {};

    if (fs.existsSync(userFile)) {
        data = JSON.parse(fs.readFileSync(userFile, "utf-8"));
    }

    if (!data[senderId]) {
        return null;
    }

    return data[senderId];
}
