import "../src/loadENV.js"; 
import connectDB from "./db/server.js";
import {app} from './app.js';
import { startStatsUpdater } from "./controllers/github.controller.js";
import http from 'http';
import { initSocket } from './socket.js';

connectDB()
.then(() => {
    const PORT = process.env.PORT || 8000;
    const server = http.createServer(app);
    initSocket(server);
    server.listen(PORT, () => {
        console.log(` Server is running at port : ${PORT}`);
        startStatsUpdater();
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

