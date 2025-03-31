const { Pool } = require("pg");
require("dotenv").config(); 

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Use PostgreSQL connection URL
    ssl: { rejectUnauthorized: false }, // Required for Render DB
  });


// Test DB connection
pool.connect()
  .then(() => console.log("Connected to PostgreSQL on Render"))
  .catch(err => console.error("Database connection error:", err));

  const test_query = "SELECT * FROM students;";
//   console.log(test_query);
  pool.query(test_query, (err, res) => {
    if (err) {
      console.error("Error running query:", err);
    } else {
      console.log("Students:", res.rows);
    }
  });
  

module.exports = pool;