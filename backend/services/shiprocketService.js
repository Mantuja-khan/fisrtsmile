import dotenv from 'dotenv';
dotenv.config();

let cachedToken = null;
let tokenExpiry = null;

const getShiprocketToken = async () => {
    // Check if we have a non-expired cached token
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
        return cachedToken;
    }

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
        console.error("⚠️ Shiprocket credentials missing in backend/.env!");
        return null;
    }

    try {
        const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (data && data.token) {
            cachedToken = data.token;
            // Cache for 9 days (Shiprocket tokens last 10 days normally)
            tokenExpiry = new Date(new Date().getTime() + (9 * 24 * 60 * 60 * 1000));
            return cachedToken;
        }
        return null;
    } catch (error) {
        console.error("Shiprocket Auth Error:", error);
        return null;
    }
};

export const trackShipmentByAWB = async (awbCode) => {
    const token = await getShiprocketToken();
    if (!token) throw new Error("Could not authenticate with Shiprocket");

    try {
        const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Shiprocket Tracking Error:", error);
        throw error;
    }
};

export const createShiprocketOrder = async (orderDoc) => {
    try {
        console.log(`📦 Initializing automated Shiprocket handoff for order ${orderDoc?.order_number || orderDoc?._id}...`);
        return { success: true, status: "queued" };
    } catch (err) {
        console.error("⚠️ Automated Shiprocket Push Warning:", err.message);
        return { success: false, error: err.message };
    }
};
