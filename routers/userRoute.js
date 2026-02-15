import express from "express";
import {getAllUsers,GetUserById, CreateUser} from "../Controllers/UserController.js";

const router = express.Router();

router.get("/getUsers",getAllUsers);
router.get("/GetUserById/:id",GetUserById);
router.post("/CreateUser",CreateUser);

export default router;