const SerialPort = require("serialport").SerialPort;
const Readline = require("@serialport/parser-readline");
const axios = require("axios");

const port = new SerialPort({
  path: "COM3",
  baudRate: 9600,
});

const parser = port.pipe(new Readline({ delimiter: "\n" }));

parser.on("data", async (data) => {
  try {
    const parsed = JSON.parse(data.trim());
    console.log("Received:", parsed);

    const response = await axios.put(
      "http://localhost:5000/api/bins/1/sensor-update", 
      parsed
    );
    console.log("Sent to server:", response.status);
  } catch (error) {
    console.error("Error:", error.message);
  }
});
