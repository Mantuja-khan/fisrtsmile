import axios from 'axios';

async function testCheckout() {
  try {
    const payload = {
      cartData: {
        items: [{
          variant_id: 1191884752, // Some variant ID
          quantity: 1,
        }],
      },
      redirectUrl: "https://trivoxotoys.com/order-success",
      timestamp: new Date().toISOString(),
    };

    console.log("Sending payload:", payload);
    const res = await axios.post("http://localhost:5003/api/shiprocket/checkout-token", payload);
    console.log("Response status:", res.status);
    console.log("Response data:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Error occurred:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

testCheckout();
