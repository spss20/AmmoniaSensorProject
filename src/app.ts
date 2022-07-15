import b from 'bonescript';
import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import path from 'path';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/../index.html'));
});

init();
setTimeout(readValues, 1000);

function readValues() {

    const m = -0.243;
    const yIntercept = 0.323;
    // const Ro = 48;
    const Ro = 85;

    const value = b.analogRead("A0");
    // process.stdout.write("Pin A0"  + ": " + (value*100).toFixed(1) + '%, ' + (1.8*value).toFixed(3) + 'V   \r');
    setTimeout(readValues, 1000);

    // const Vrl = (1.8*value).toFixed(3);
    const Vrl = (1.8 * value);

    const Rs = ((5.0 / Vrl) - 1) * 10;

    // const Ro = Rs/3.6;
    const ratio = Rs / Ro;


    const PPM = Math.pow(10, (Math.log10(ratio) - yIntercept) / m);

    console.log({ Vrl, Rs, Ro, ratio, PPM });
    io.emit("sensor", { voltage: Vrl.toFixed(3), ppm: PPM.toFixed(3)});
}

function init() {
    httpServer.listen(3000, () => {
        console.log("Listening on port " + 3000);
    });

    io.on("connection", (socket) => {
        console.log("Device Connected", socket.id);

        socket.on("disconnect", (reason) => {
            console.log("Device Disconnected");
        });
    });
}

// function publishValues() {
//     io.emit("sensor", { voltage: generateRandomInteger(0, 5), ppm: generateRandomInteger(0, 20) });
// }

// function generateRandomInteger(min: number, max: number) {
//     return Math.floor(min + Math.random() * (max - min + 1))
// }

// setInterval(publishValues, 1000);
