# Realtime Updates Example

This example shows how to sync changes between multiple client applications in real time via the websockets server.

## Prerequisites

Server code uses optional chaining, object destructing and other ES6 features. You will need Node JS >= 14 to run it.

## Usage

Clone the websocket server [repo](https://github.com/bryntum/gantt-websocket-server), install packages and start the
server.

```shell
~$ git clone git@github.com:bryntum/gantt-websocket-server.git
~$ cd gantt-websocket-server
gantt-websocket-server$ npm i
gantt-websocket-server$ npm run start

> server@1.0.0 start ~/gantt-websocket-server
> node server.js port=8080

Server started at ws://192.168.1.2:8080
```

Run the demo, specify this address for the websocket server and press `Login`.
