import "../src/loadENV.js"; 
import connectDB from "./db/server.js";
import {app} from './app.js';
import { startStatsUpdater } from "./controllers/github.controller.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(` Server is running at port : ${process.env.PORT}`);
        startStatsUpdater();
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

