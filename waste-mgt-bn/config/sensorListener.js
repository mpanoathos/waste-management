require("dotenv").config();
const SerialPort = require("serialport").SerialPort;
const Readline = require("@serialport/parser-readline");
const axios = require("axios");

const port = new SerialPort({
  path: "COM3",
  baudRate: 9600,
});

port.on("error", (error) => {
  console.error("Sensor serial port error:", error.message);
});

const parser = port.pipe(new Readline({ delimiter: "\n" }));

parser.on("data", async (data) => {
  try {
    const parsed = JSON.parse(data.trim());
    console.log("Received:", parsed);

    const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
    const response = await axios.put(
      `${apiUrl}/api/bins/1/sensor-update`,
      parsed
    );
    console.log("Sent to server:", response.status);
  } catch (error) {
    console.error("Error:", error.message);
  }
});
