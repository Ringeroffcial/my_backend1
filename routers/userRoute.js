import express from "express";
import {getAllUsers,GetUserById, CreateUser, DeleteUser,updateUserPart} from "../Controllers/UserController.js";

const router = express.Router();

router.get("/getUsers",getAllUsers);
router.get("/GetUserById/:id",GetUserById);
router.post("/CreateUser",CreateUser);
router.patch("/Update-partially/:id",updateUserPart)
router.delete("/DeleteUser",DeleteUser);



export default router;