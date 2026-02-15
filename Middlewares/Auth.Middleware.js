import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../DatabaseConnection/Config.js';

dotenv.config();

export const AuthToken= async (req,res,next)=>{
    try{
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(' ')[1] // bearer token

        if(!token){
            return res.status(401).json({
                error:"Invalid Token"
            })
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        
        const userRes = await pool.query("SELECT id,username,email from users where id =$1",[decoded]); 
    }
    catch(err){
        if(err.name === "TokenExpiredError"){
            return res.status(401).json({
                error:"Token Has Expired"
            })
        }

        if(err.name === 'jsonwebtokenError'){
            return res.status(403).json({
                error:"Token is Invalid"
            })
        }

        console.log(err.message)
        return res.status(500).json({
            error:"Internal server During the Authentication Processs"
        })
    }
}