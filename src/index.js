import express from "express";
import dotenv from "dotenv";
import cors from 'cors'

import userRoute from "../routers/userRoute.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;

app.use("/api",userRoute);

app.listen(PORT,()=>{
    console.log(`Server is on  (http://localhost:${PORT})`)
})

