import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
// Encode the password to handle special characters
const encodedPassword = encodeURIComponent(process.env.DB_PASSWORD);

const pool = new Pool({
   connectionString: `postgresql://${process.env.DB_USER}:${encodedPassword}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`,
});
// Test the connection
pool.connect((err, client, release) => {

    if(err){
        console.log("Database connection failed", err.message);
        process.exit(1);
    }
    else{
        console.log("Database connected successfully");
        release(); // Don't forget to release the client
    }
});

pool.on("error", (err) => {
    console.log(`Database connection error: ${err.message}`);
    process.exit(-1);
});

export default pool;