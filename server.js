require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = 3001;

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Log for debugging


// Validate Supabase credentials
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing Supabase configuration in environment variables.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware
app.use(cors());
app.use(bodyParser.json());




// NEXT_PUBLIC_SUPABASE_URL=
// NEXT_PUBLIC_SUPABASE_ANON_KEY=

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Check Supabase connection
(async function checkDatabaseConnection() {
    try {
      const { data, error } = await supabase.from("students").select("*").limit(1); // Query the "students" table
      if (error) {
        console.error("❌ Supabase connection failed:", error.message);
      } else {
        console.log("✅ Supabase connection successful. Database is reachable.");
      }
    } catch (err) {
      console.error("❌ Error while checking Supabase connection:", err.message);
    }
  })();
  

// CRUD Operations

// 1. Get all students
app.get("/students", async (req, res) => {
  const { course, academic_year } = req.query; // Get the course and academic year filters

  try {
    console.log("Incoming filters:", { course, academic_year });

    let query = supabase.from("students").select("*");

    // Apply course filter
    if (course) {
      console.log(`Filtering students by course: ${course}`);
      query = query.contains("courses", [course]); // Filter by course
    }

    // Apply academic year filter
    if (academic_year) {
      console.log(`Filtering students by academic year: ${academic_year}`);
      query = query.eq("cohort", academic_year); // Filter by academic year
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase query error:", error.message);
      throw error;
    }

    console.log("Filtered students:", data);
    res.status(200).json(data); // Return the filtered or unfiltered data
  } catch (err) {
    console.error("Error in /students endpoint:", err.message);
    res.status(500).json({ error: err.message });
  }
});



// 2. Get a single student by ID
app.get("/students/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from("students").select("*").eq("id", id).single();
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Add a new student
app.post("/students", async (req, res) => {
  const { student_name, cohort, courses, status } = req.body; // Exclude date_joined and last_login
  const currentTime = new Date().toISOString(); // Automatically set current date and time

  try {
    const { data, error } = await supabase.from("students").insert([
      {
        student_name,
        cohort,
        courses,
        date_joined: currentTime, // Set current time for date_joined
        last_login: currentTime,  // Set current time for last_login
        status,
      },
    ]);
    if (error) throw error;
    res.status(201).json({ message: "Student details successfully created." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 4. Update a student
app.put("/students/:id", async (req, res) => {
  const { id } = req.params;
  const { student_name, cohort, courses, status } = req.body; // Exclude date_joined and last_login
  try {
    const { data, error } = await supabase
      .from("students")
      .update({ student_name, cohort, courses, status }) // Update only the fields that need modification
      .eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "Student details successfully updated.", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 5. Delete a student
app.delete("/students/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from("students").delete().eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "Student deleted successfully", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get("/courses", async (req, res) => {
  try {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/courses", async (req, res) => {
  const { name } = req.body;
  try {
    const { data, error } = await supabase.from("courses").insert([{ name }]);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete("/courses/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase.from("courses").delete().eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "Course deleted successfully.", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
