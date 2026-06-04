import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import User from './models/User.js';
import Order from './models/Order.js';
import { orderWebhook } from './controllers/shiprocketController.js';

dotenv.config();

async function runTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clean up any old test data if exists
    const testPhone = "9998887776";
    const testEmail = "test-webhook-user@toyhaat.fastrr.com";
    await User.deleteOne({ phone: testPhone });
    await Order.deleteOne({ order_number: "TEST-WEBHOOK-12345" });

    // Mock Express Request & Response Objects
    const req = {
      body: {
        order_number: "TEST-WEBHOOK-12345",
        customer_name: "Test Webhook Customer",
        customer_email: testEmail,
        customer_phone: testPhone,
        shipping_address: {
          address: "123 Toy Street",
          city: "Toy City",
          state: "Delhi",
          pincode: "110001"
        },
        items: [],
        subtotal: 0,
        shipping: 0,
        cod_charge: 0,
        discount: 0,
        total: 0,
        payment_method: "prepaid"
      }
    };

    let statusSent = null;
    const res = {
      sendStatus: (status) => {
        statusSent = status;
        console.log(`Response sent: SendStatus = ${status}`);
      },
      status: (code) => {
        console.log(`Response sent: Status = ${code}`);
        return {
          send: (msg) => {
            console.log(`Response body sent: ${msg}`);
          }
        };
      }
    };

    console.log("Invoking orderWebhook...");
    await orderWebhook(req, res);

    if (statusSent === 200) {
      console.log("Webhook returned 200 OK");
      
      // Verify user was created
      const createdUser = await User.findOne({ phone: testPhone });
      if (createdUser) {
        console.log("SUCCESS: User was automatically created:", createdUser._id, createdUser.email);
        
        // Verify order was created and linked to the user
        const createdOrder = await Order.findOne({ order_number: "TEST-WEBHOOK-12345" });
        if (createdOrder) {
          console.log("SUCCESS: Order was created:", createdOrder._id);
          if (createdOrder.user && createdOrder.user.toString() === createdUser._id.toString()) {
            console.log("SUCCESS: Order is correctly associated with the User ID!");
          } else {
            console.error("FAIL: Order is NOT associated with the correct User ID. order.user =", createdOrder.user);
          }
        } else {
          console.error("FAIL: Order was not found in the database.");
        }
      } else {
        console.error("FAIL: User was not automatically created.");
      }
    } else {
      console.error("FAIL: Webhook response was not 200 OK. Status =", statusSent);
    }

    // Clean up test data
    await User.deleteOne({ phone: testPhone });
    await Order.deleteOne({ order_number: "TEST-WEBHOOK-12345" });
    console.log("Cleanup complete");

    await mongoose.disconnect();
  } catch (err) {
    console.error("Test failed with error:", err);
  }
}

runTest();
