import axios from 'axios';

async function testCheckout() {
  try {
    const payload = {
      cartData: {
        items: [{
          variant_id: 1353976808, // Real variant ID for ANNIE BABA BIG TOWEL
          quantity: 1,
        }],
      },
      redirectUrl: "https://trivoxotoys.com/payment-success",
      timestamp: new Date().toISOString(),
    };

    console.log("Sending payload to backend:");
    console.log(JSON.stringify(payload, null, 2));

    const res = await axios.post("http://localhost:5003/api/shiprocket/checkout-token", payload);
    console.log("Response status:", res.status);
    console.log("Response data:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Error occurred during checkout token generation:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

testCheckout();
