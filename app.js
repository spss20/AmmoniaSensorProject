const fs = require("fs");
const http = require("http");
const app = http.createServer();
const { Server } = require("socket.io");
const io = new Server(app);
const bonescript = require("bonescript");
const axios = require('axios');
require('dotenv').config();

//Setting up Socket
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
});

app.listen(process.env.PORT, () => {
  console.log("listening on *:" + process.env.PORT);
});

//Setting variabes from data.json
let SERVER_URL, sap_id, RO, m, b, RO_RS_RATIO, RL, min, max;
let data;

const stream = fs.readFileSync(process.env.DATA_PATH);
const values = JSON.parse(stream);

SERVER_URL = values.server_url;
sap_id = values.sap_id;
RO = parseFloat(values.kValue) || 0;
m = parseFloat(values.m) || 0;
b = parseFloat(values.b) || 0;
RO_RS_RATIO = parseFloat(values.RO_RS_RATIO) || 1;
RL = parseFloat(values.RL) || 0;
min = parseFloat(values.min) || 0;
max = parseFloat(values.max) || 0;
console.log({ RO, m, b, RO_RS_RATIO, RL, min, max });

setInterval(parseData, 1400);
if (SERVER_URL) {
  setInterval(publishToServer, 60 * 1000);
}

function parseData() {
  let voltageSum = 0;

  for (let i = 0; i < 200; i++) {
    const analogValue = bonescript.analogRead("A0");
    // const analogValue = getVoltage();
    voltageSum += analogValue;
  }

  const Vrl = 1.8 * voltageSum / 200; //Vrl = Voltage
  const Rs = (5.0 / Vrl - 1) * RL;

  if (!sap_id) {
    publishData(0, Vrl, "DEVICE NOT CONFIGURED", "red", 0);
  } else if (RO == 0) {
    if (RO_RS_RATIO != 0) {
      const kValue = Rs / RO_RS_RATIO;
      publishData(0, Vrl, "DEVICE NOT CALIBRATED", "red", kValue);
    } else {
      publishData(0, Vrl, "DEVICE NOT CALIBRATED", "red", 0);
    }
  } else {
    const ratio = Rs / RO;
    const PPM = Math.pow(10, (Math.log10(ratio) - b) / m);
    if (PPM < min) {
      publishData(PPM, Vrl, "ALERT: LOW PPM", "red", RO);
    } else if (PPM > max) {
      publishData(PPM, Vrl, "ALERT: HIGH PPM", "red", RO);
    } else {
      publishData(PPM, Vrl, "NORMAL", "green", RO);
    }
    console.log({ Vrl, Rs, RO, ratio, PPM });
  }
}

function publishData(ppm, voltage, status, color, kValue) {
  data = {
    ppm: ppm.toFixed(3), voltage: voltage.toFixed(3), status, color, kValue: kValue.toFixed(4)
  };
  io.emit("sensor", data);
}

function publishToServer() {
  if (sap_id) {
    axios.post(process.env.BASE_URL + '/api/amonium/add_new', {
      sap_id,
      value: data.ppm,
      k_value: data.kValue,
      status: data.status
    }).then((res) => {
      console.log("Data updated to server");
      console.log(res.status);
      console.log(res.data);
    }, (err) => {
      console.log("error while updating data to server", err);
    })

  } else {
    console.log("Sap ID not configured");
  }
}

//Simulator Functions
let x = 0.01;
let trend = 0.01;
let y = 0;
let maximumVoltage = 0.09;

function getVoltage() {
  const number = generateRandomFloat(x, x + trend);
  if (y == 50) {
    y = 0;
    if (x < maximumVoltage)
      x += trend;
  } else {
    y++;
  }
  return number;
}

function generateRandomInteger(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1))
}

function generateRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
