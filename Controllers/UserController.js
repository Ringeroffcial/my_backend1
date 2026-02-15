import  pool  from '../DatabaseConnection/Config.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
 

dotenv.config();

//Validator function
const validateEmail = (email) => {
    // Optional chaining to safely check if email exists and has a length property
    if (!email?.length) {
        return { isValid: false, message: "Email is required" };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return {
        isValid: emailRegex.test(email),
        message: emailRegex.test(email) ? "Email is valid" : "Invalid email format"
    };
} 

const PasswordCheck = (password) => {

    if (!password) {
        return { isValid: false, message: "Password is required" };
    }
    
    if (password.length < 8) {
        return { isValid: false, message: "Password must be at least 8 characters long" };
    }
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one uppercase letter" };
    }
    
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one lowercase letter" };
    }
    
    // Check for at least one number
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one number" };
    }
    
    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one special character" };
    }
    
    return { isValid: true, message: "Password is valid" };
};

const HashPassword = async (plainPassword) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        return hashedPassword;
    } catch (error) {
        throw new Error('Error hashing password');
    }
};
//1.Get all users
export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        if (!result.rows) {
            return res.status(500).json({
                error: "Server Error - No data returned"
            });
        }
        return res.status(200).json({
            message: "Data Fetched Successfully",
            data: result.rows 
        });  
        
    }
    catch (err) {
        console.error(`Error fetching users: ${err.message}`);
        return res.status(500).json({
            error: "There are problems with the server"
        });
    }
}

// Get Users by Id
export const GetUserById= async(req,res)=>{
    try{
            const userID = req.params.id;
            const result = await pool.query("SELECT * FROM users where userid=$1",[userID]);
            
            if(result.rows.length === 0){
                return res.status(404).json({
                    error: "User was not found"
                })
            }

            res.status(200).json({
                message:"Data fetch by Id was found succesfully",
                data: result.rows[0]
            })
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({
            error:"Internal Server Error"
        });
    }
}

//3.Create users
export const CreateUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Validate input
        if (!username?.trim() || !email?.trim() || !password?.trim()) {
            return res.status(400).json({
                error: "Missing input fields"
            });
        }

        if (!validateEmail(email) || !PasswordCheck(password)) {
            return res.status(400).json({
                error: "Bad Input - Invalid Email or Password format"
            });
        }
        
        // ✅ Check for existing user FIRST
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1", [email]  // fixed: users not user
        );

        if(existingUser.rows.length > 0){
            return res.status(409).json({
                warning: "User with that email already exists",
                field: "Email"
            });
        }
        
        // 2. Hash password
        const hashedPassword = await HashPassword(password);
        
        // 3. Insert user
        const result = await pool.query(
            `INSERT INTO users (username, email, password) 
             VALUES ($1, $2, $3) 
             RETURNING id, username, email`,  // Don't return password
            [username, email, hashedPassword]
        );

        const newUser = result.rows[0];
       
        // 4. Create token
        const token = jwt.sign(
            { userId: newUser.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(201).json({
            message: "User Created Successfully",
            token,
            user: newUser
        });

    } catch (err) {
        // 5. Handle duplicate email error (backup check)
        if (err.code === '23505') {
            return res.status(409).json({
                error: "Email already exists"
            });
        }
        
        console.error('Create user error:', err);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

