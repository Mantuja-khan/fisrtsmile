import axios from 'axios';

async function testLogin() {
  try {
    console.log("Sending login request to backend...");
    const res = await axios.post("http://localhost:5003/api/shiprocket/login-token");
    console.log("Response status:", res.status);
    console.log("Response data:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Error occurred during login token generation:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

testLogin();
