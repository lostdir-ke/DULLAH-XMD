
const { zokou } = require("../framework/zokou");
const axios = require("axios");

const API_KEY = process.env.SMM_API_KEY;
const API_URL = process.env.SMM_API_URL;

// Check Balance Command
zokou({
    name: "smmbalance",
    category: "owner",
    desc: "Check SMM panel balance",
    react: "💰"
}, async (origineMessage, zk) => {
    try {
        const response = await axios.post(API_URL, {
            key: API_KEY,
            action: "balance"
        });
        
        await zk.reply(`*💰 Balance Information*\nBalance: $${response.data.balance}\nCurrency: ${response.data.currency}`);
    } catch (error) {
        await zk.reply("Error checking balance: " + error.message);
    }
});

// List Services Command
zokou({
    name: "smmservices",
    category: "owner", 
    desc: "List available SMM services",
    react: "📋"
}, async (origineMessage, zk) => {
    try {
        const response = await axios.post(API_URL, {
            key: API_KEY,
            action: "services"
        });

        let serviceList = "*📋 Available Services*\n\n";
        response.data.slice(0, 10).forEach(service => {
            serviceList += `*ID:* ${service.service}\n`;
            serviceList += `*Category:* ${service.Category}\n`;
            serviceList += `*Name:* ${service.name}\n`;
            serviceList += `*Rate:* $${service.rate}\n`;
            serviceList += `*Min/Max:* ${service.min}-${service.max}\n`;
            serviceList += `*Type:* ${service.type}\n\n`;
        });

        await zk.reply(serviceList);
    } catch (error) {
        await zk.reply("Error fetching services: " + error.message);
    }
});

// Place Order Command
zokou({
    name: "smmorder",
    category: "owner",
    desc: "Place new SMM order",
    react: "🛍️"
}, async (origineMessage, zk, args) => {
    if (args.length < 3) {
        return await zk.reply("Usage: .smmorder <service_id> <link> <quantity>");
    }

    const [serviceId, link, quantity] = args;

    try {
        const response = await axios.post(API_URL, {
            key: API_KEY,
            action: "add",
            service: serviceId,
            link: link,
            quantity: quantity
        });

        await zk.reply(`*🛍️ Order Placed*\nOrder ID: ${response.data.order}`);
    } catch (error) {
        await zk.reply("Error placing order: " + error.message);
    }
});

// Check Order Status Command
zokou({
    name: "smmstatus",
    category: "owner",
    desc: "Check SMM order status",
    react: "📊"
}, async (origineMessage, zk, args) => {
    if (!args[0]) {
        return await zk.reply("Usage: .smmstatus <order_id1,order_id2,...>");
    }

    try {
        const response = await axios.post(API_URL, {
            key: API_KEY,
            action: "status",
            order: args[0]
        });

        let statusMsg = "*📊 Order Status*\n\n";
        
        if (Array.isArray(response.data)) {
            // Single order
            statusMsg += `Charge: $${response.data.charge}\n`;
            statusMsg += `Start Count: ${response.data.start_count}\n`;
            statusMsg += `Status: ${response.data.status}\n`;
            statusMsg += `Remains: ${response.data.remains}\n`;
            statusMsg += `Currency: ${response.data.currency}`;
        } else {
            // Multiple orders
            for (const [orderId, details] of Object.entries(response.data)) {
                statusMsg += `*Order #${orderId}*\n`;
                if (details.error) {
                    statusMsg += `Error: ${details.error}\n`;
                } else {
                    statusMsg += `Charge: $${details.charge}\n`;
                    statusMsg += `Start Count: ${details.start_count}\n`;
                    statusMsg += `Status: ${details.status}\n`;
                    statusMsg += `Remains: ${details.remains}\n`;
                    statusMsg += `Currency: ${details.currency}\n`;
                }
                statusMsg += "\n";
            }
        }

        await zk.reply(statusMsg);
    } catch (error) {
        await zk.reply("Error checking status: " + error.message);
    }
});
