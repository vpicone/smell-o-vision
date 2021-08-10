import SerialPort from "serialport";
import Readline from "@serialport/parser-readline";

import WS from "ws";

const WebSocketServer = WS.Server;

const SERVER_PORT = 8081;
let wss = new WebSocketServer({ port: SERVER_PORT });
let connections = [];

const ports = await SerialPort.list();
const arduinoPort = ports.find((port) =>
  port.manufacturer?.includes("Arduino")
);

const port = new SerialPort(arduinoPort.path);
const parser = new Readline();
port.pipe(parser);

parser.on("data", (data) => {
  if (connections.length > 0) {
    connections.forEach((con) => {
      con.send(data);
    });
  }
});

const handleConnection = (client) => {
  console.log("New connection");
  connections.push(client);

  client.on("message", (data) => {
    console.log("sending to serial: " + data);
    port.write(data);
  });

  client.on("close", () => {
    let pos = connections.indexOf(client);
    connections.splice(pos, 1);
  });
};

wss.on("connection", handleConnection);
