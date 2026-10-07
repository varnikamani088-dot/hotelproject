const express = require("express")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { Pool } = require("pg")
require("dotenv").config()
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "pearl_horizon",
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432
})

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ PostgreSQL Connection Failed:", err.message)
  } else {
    console.log("✅ PostgreSQL Database Connected Successfully!")
    release()
  }
})
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const uploadsPath = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath)
}
app.use("/uploads", express.static(uploadsPath))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath)
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1000000)
    cb(null, uniqueName + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"), false)
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter
})

const initDb = async () => {
  try {
    // 1. Hotels Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image TEXT,
        rating NUMERIC(2, 1) NOT NULL,
        location VARCHAR(255) NOT NULL,
        location_name VARCHAR(255),
        description TEXT NOT NULL,
        facilities TEXT,
        price NUMERIC(10, 2) NOT NULL,
        latitude NUMERIC(10, 7) NOT NULL,
        longitude NUMERIC(10, 7) NOT NULL,
        gallery TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    await pool.query(`
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        hotel_name VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        room_type VARCHAR(100),
        stay_type VARCHAR(50) DEFAULT 'night',
        check_in VARCHAR(50),
        check_out VARCHAR(50),
        guests INTEGER DEFAULT 1,
        rooms INTEGER DEFAULT 1,
        total_price NUMERIC(10, 2),
        special_request TEXT,
        status VARCHAR(50) DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        hotel_name VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        rating NUMERIC(2, 1) NOT NULL,
        feedback TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    console.log("✅ Database schema initialized ('hotels', 'bookings', 'reviews' tables ready)")
  } catch (err) {
    console.error("❌ Error initializing database schema:", err.message)
  }
}
app.get("/", async (req, res) => {
  try {
    const dbCheck = await pool.query(
      "SELECT NOW() as current_time, current_database() as database_name"
    )
    res.json({
      message: "PEARL HORIZON backend is running",
      database: {
        status: "connected",
        name: dbCheck.rows[0].database_name,
        time: dbCheck.rows[0].current_time
      }
    })
  } catch (error) {
    res.status(500).json({
      message: "PEARL HORIZON backend is running",
      database: {
        status: "disconnected",
        error: error.message
      }
    })
  }
})

app.get("/api/health", async (req, res) => {
  try {
    const dbCheck = await pool.query(
      "SELECT NOW() as current_time, current_database() as database_name"
    )
    res.json({
      status: "OK",
      database: "connected",
      databaseName: dbCheck.rows[0].database_name,
      serverTime: dbCheck.rows[0].current_time
    })
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "disconnected",
      error: error.message
    })
  }
})

app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" })
    }
    const filePath = `/uploads/${req.file.filename}`
    res.status(200).json({
      message: "Image uploaded successfully",
      filePath: filePath,
      fileName: req.file.filename
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ message: "Image upload failed", error: error.message })
  }
})

app.post("/api/upload-gallery", upload.array("gallery", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No gallery images provided" })
    }
    const filePaths = req.files.map((file) => `/uploads/${file.filename}`)
    res.status(200).json({
      message: `${req.files.length} gallery images uploaded successfully`,
      filePaths
    })
  } catch (error) {
    console.error("Gallery upload error:", error)
    res.status(500).json({ message: "Gallery upload failed", error: error.message })
  }
})
app.get("/api/hotels", async (req, res) => {
  try {
    const {
      search = "",
      minPrice = "",
      maxPrice = "",
      offset = 0,
      limit = 50
    } = req.query

    let query = `
      SELECT *
      FROM hotels
      WHERE 1 = 1
    `
    const values = []
    let valueIndex = 1

    if (search) {
      query += ` AND (LOWER(name) LIKE LOWER($${valueIndex}) OR LOWER(location) LIKE LOWER($${valueIndex}))`
      values.push(`%${search}%`)
      valueIndex++
    }

    if (minPrice !== "") {
      query += ` AND price >= $${valueIndex}`
      values.push(Number(minPrice))
      valueIndex++
    }

    if (maxPrice !== "") {
      query += ` AND price <= $${valueIndex}`
      values.push(Number(maxPrice))
      valueIndex++
    }

    query += `
      ORDER BY id DESC
      LIMIT $${valueIndex}
      OFFSET $${valueIndex + 1}
    `
    values.push(Number(limit))
    values.push(Number(offset))

    const result = await pool.query(query, values)
    res.json(result.rows)
  } catch (error) {
    console.error("Fetch hotels error:", error)
    res.status(500).json({ message: "Failed to fetch hotels" })
  }
})

app.get("/api/hotels/:id", async (req, res) => {
  try {
    const isNumeric = /^\d+$/.test(req.params.id)
    const query = isNumeric
      ? "SELECT * FROM hotels WHERE id = $1"
      : "SELECT * FROM hotels WHERE LOWER(name) = LOWER($1)"
    const result = await pool.query(query, [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Hotel not found" })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error("Fetch hotel error:", error)
    res.status(500).json({ message: "Failed to fetch hotel" })
  }
})
app.post(
  "/api/hotels",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const {
        name,
        rating,
        location,
        locationName,
        description,
        facilities,
        price,
        latitude,
        longitude
      } = req.body

      if (
        !name ||
        !rating ||
        !location ||
        !description ||
        !price ||
        latitude === undefined ||
        longitude === undefined
      ) {
        return res.status(400).json({
          message: "Please fill all required details (name, rating, location, description, price, latitude, longitude)"
        })
      }

      let imagePath = ""
      if (req.files && req.files.image && req.files.image.length > 0) {
        imagePath = `/uploads/${req.files.image[0].filename}`
      } else if (req.body.image) {
        imagePath = req.body.image
      }
      let galleryPaths = []
      if (req.files && req.files.gallery && req.files.gallery.length > 0) {
        galleryPaths = req.files.gallery.map((file) => `/uploads/${file.filename}`)
      } else if (req.body.gallery) {
        if (Array.isArray(req.body.gallery)) {
          galleryPaths = req.body.gallery
        } else if (typeof req.body.gallery === "string") {
          try {
            galleryPaths = JSON.parse(req.body.gallery)
          } catch {
            galleryPaths = req.body.gallery.split(",").map((s) => s.trim())
          }
        }
      }

      const result = await pool.query(
        `
        INSERT INTO hotels
        (
          name,
          image,
          rating,
          location,
          location_name,
          description,
          facilities,
          price,
          latitude,
          longitude,
          gallery
        )
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
        `,
        [
          name.trim(),
          imagePath,
          Number(rating),
          location.trim(),
          locationName ? locationName.trim() : location.trim(),
          description.trim(),
          facilities || "",
          Number(price),
          Number(latitude),
          Number(longitude),
          galleryPaths
        ]
      )

      res.status(201).json(result.rows[0])
    } catch (error) {
      console.error("Add hotel error:", error)
      res.status(500).json({ message: "Failed to add hotel", error: error.message })
    }
  }
)

const updateHotelHandler = async (req, res) => {
  try {
    const isNumeric = /^\d+$/.test(req.params.id)
    const oldHotel = await pool.query(
      isNumeric
        ? "SELECT * FROM hotels WHERE id = $1"
        : "SELECT * FROM hotels WHERE LOWER(name) = LOWER($1)",
      [req.params.id]
    )

    if (oldHotel.rows.length === 0) {
      return res.status(404).json({ message: "Hotel not found" })
    }

    const old = oldHotel.rows[0]
    const {
      name,
      rating,
      location,
      locationName,
      description,
      facilities,
      price,
      latitude,
      longitude
    } = req.body

    let imagePath = old.image
    if (req.files && req.files.image && req.files.image.length > 0) {
      imagePath = `/uploads/${req.files.image[0].filename}`
    } else if (req.file) {
      imagePath = `/uploads/${req.file.filename}`
    } else if (req.body.image !== undefined && req.body.image !== "") {
      imagePath = req.body.image
    }

    let galleryPaths = old.gallery || []
    if (req.files && req.files.gallery && req.files.gallery.length > 0) {
      const newUploads = req.files.gallery.map((file) => `/uploads/${file.filename}`)
      galleryPaths = [...galleryPaths, ...newUploads]
    } else if (req.body.gallery !== undefined) {
      if (Array.isArray(req.body.gallery)) {
        galleryPaths = req.body.gallery
      } else if (typeof req.body.gallery === "string") {
        try {
          galleryPaths = JSON.parse(req.body.gallery)
        } catch {
          galleryPaths = req.body.gallery.split(",").map((s) => s.trim())
        }
      }
    }

    const updatedName = name !== undefined && name.trim() !== "" ? name.trim() : old.name
    const updatedRating = rating !== undefined && rating !== "" ? Number(rating) : Number(old.rating)
    const updatedLocation = location !== undefined && location.trim() !== "" ? location.trim() : old.location
    const updatedLocationName = locationName !== undefined ? locationName.trim() : (old.location_name || old.location)
    const updatedDescription = description !== undefined && description.trim() !== "" ? description.trim() : old.description
    const updatedFacilities = facilities !== undefined ? facilities : (old.facilities || "")
    const updatedPrice = price !== undefined && price !== "" ? Number(price) : Number(old.price)
    const updatedLatitude = latitude !== undefined && latitude !== "" ? Number(latitude) : Number(old.latitude)
    const updatedLongitude = longitude !== undefined && longitude !== "" ? Number(longitude) : Number(old.longitude)

    const result = await pool.query(
      `
      UPDATE hotels
      SET
        name = $1,
        image = $2,
        rating = $3,
        location = $4,
        location_name = $5,
        description = $6,
        facilities = $7,
        price = $8,
        latitude = $9,
        longitude = $10,
        gallery = $11
      WHERE id = $12
      RETURNING *
      `,
      [
        updatedName,
        imagePath,
        updatedRating,
        updatedLocation,
        updatedLocationName,
        updatedDescription,
        updatedFacilities,
        updatedPrice,
        updatedLatitude,
        updatedLongitude,
        galleryPaths,
        old.id
      ]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error("Update hotel error:", error)
    res.status(500).json({ message: "Failed to update hotel", error: error.message })
  }
}
app.put(
  "/api/hotels/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 }
  ]),
  updateHotelHandler
)
app.patch(
  "/api/hotels/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 }
  ]),
  updateHotelHandler
)
app.post(
  "/api/hotels/:id/gallery",
  upload.array("gallery", 10),
  async (req, res) => {
    try {
      const isNumeric = /^\d+$/.test(req.params.id)
      const hotelRes = await pool.query(
        isNumeric
          ? "SELECT * FROM hotels WHERE id = $1"
          : "SELECT * FROM hotels WHERE LOWER(name) = LOWER($1)",
        [req.params.id]
      )

      if (hotelRes.rows.length === 0) {
        return res.status(404).json({ message: "Hotel not found" })
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No gallery images uploaded" })
      }

      const newImages = req.files.map((file) => `/uploads/${file.filename}`)
      const currentGallery = hotelRes.rows[0].gallery || []
      const updatedGallery = [...currentGallery, ...newImages]

      const updated = await pool.query(
        "UPDATE hotels SET gallery = $1 WHERE id = $2 RETURNING *",
        [updatedGallery, hotelRes.rows[0].id]
      )

      res.json({
        message: `${newImages.length} gallery images added successfully`,
        hotel: updated.rows[0]
      })
    } catch (error) {
      console.error("Add hotel gallery error:", error)
      res.status(500).json({ message: "Failed to add gallery images", error: error.message })
    }
  }
)
app.delete("/api/hotels/:id", async (req, res) => {
  try {
    const isNumeric = /^\d+$/.test(req.params.id)
    const result = await pool.query(
      isNumeric
        ? "DELETE FROM hotels WHERE id = $1 RETURNING *"
        : "DELETE FROM hotels WHERE LOWER(name) = LOWER($1) RETURNING *",
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Hotel not found" })
    }

    res.json({
      message: "Hotel deleted successfully",
      hotel: result.rows[0]
    })
  } catch (error) {
    console.error("Delete hotel error:", error)
    res.status(500).json({ message: "Failed to delete hotel", error: error.message })
  }
})

app.get("/api/bookings", async (req, res) => {
  try {
    const { hotel, email } = req.query
    let query = "SELECT * FROM bookings WHERE 1 = 1"
    const values = []
    let valIndex = 1

    if (hotel) {
      query += ` AND LOWER(hotel_name) = LOWER($${valIndex})`
      values.push(hotel)
      valIndex++
    }
    if (email) {
      query += ` AND LOWER(email) = LOWER($${valIndex})`
      values.push(email)
      valIndex++
    }

    query += " ORDER BY id DESC"
    const result = await pool.query(query, values)
    res.json(result.rows)
  } catch (error) {
    console.error("Fetch bookings error:", error)
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message })
  }
})


app.post("/api/bookings", async (req, res) => {
  try {
    const {
      hotelName,
      customerName,
      email,
      phone,
      roomType,
      stayType = "night",
      checkIn,
      checkOut,
      guests = 1,
      rooms = 1,
      totalPrice = 0,
      specialRequest = ""
    } = req.body

    if (!hotelName || !customerName || !checkIn || !checkOut) {
      return res.status(400).json({
        message: "hotelName, customerName, checkIn, and checkOut are required"
      })
    }

    const result = await pool.query(
      `
      INSERT INTO bookings
      (
        hotel_name,
        customer_name,
        email,
        phone,
        room_type,
        stay_type,
        check_in,
        check_out,
        guests,
        rooms,
        total_price,
        special_request,
        status
      )
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Confirmed')
      RETURNING *
      `,
      [
        hotelName,
        customerName,
        email || "",
        phone || "",
        roomType || "Standard Room",
        stayType || "night",
        checkIn,
        checkOut,
        Number(guests) || 1,
        Number(rooms) || 1,
        Number(totalPrice) || 0,
        specialRequest || ""
      ]
    )

    res.status(201).json({
      message: "Booking confirmed successfully",
      booking: result.rows[0]
    })
  } catch (error) {
    console.error("Create booking error:", error)
    res.status(500).json({ message: "Failed to create booking", error: error.message })
  }
})

app.put("/api/bookings/:id", async (req, res) => {
  try {
    const { status, roomType, guests, rooms } = req.body
    const bookingCheck = await pool.query("SELECT * FROM bookings WHERE id = $1", [req.params.id])

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" })
    }

    const old = bookingCheck.rows[0]
    const updated = await pool.query(
      `
      UPDATE bookings
      SET
        status = $1,
        room_type = $2,
        guests = $3,
        rooms = $4
      WHERE id = $5
      RETURNING *
      `,
      [
        status || old.status,
        roomType || old.room_type,
        guests !== undefined ? Number(guests) : old.guests,
        rooms !== undefined ? Number(rooms) : old.rooms,
        req.params.id
      ]
    )

    res.json({ message: "Booking updated", booking: updated.rows[0] })
  } catch (error) {
    console.error("Update booking error:", error)
    res.status(500).json({ message: "Failed to update booking", error: error.message })
  }
})
app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM bookings WHERE id = $1 RETURNING *", [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" })
    }
    res.json({ message: "Booking cancelled successfully", booking: result.rows[0] })
  } catch (error) {
    console.error("Delete booking error:", error)
    res.status(500).json({ message: "Failed to cancel booking", error: error.message })
  }
})

app.get("/api/reviews", async (req, res) => {
  try {
    const { hotel } = req.query
    let query = "SELECT * FROM reviews"
    const values = []

    if (hotel) {
      query += " WHERE LOWER(hotel_name) = LOWER($1)"
      values.push(hotel)
    }

    query += " ORDER BY id DESC"
    const result = await pool.query(query, values)
    res.json(result.rows)
  } catch (error) {
    console.error("Fetch reviews error:", error)
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message })
  }
})
app.post("/api/reviews", async (req, res) => {
  try {
    const { hotelName, customerName, rating, feedback } = req.body

    if (!hotelName || !customerName || rating === undefined || !feedback) {
      return res.status(400).json({
        message: "hotelName, customerName, rating, and feedback are required"
      })
    }

    const result = await pool.query(
      `
      INSERT INTO reviews
      (hotel_name, customer_name, rating, feedback)
      VALUES
      ($1, $2, $3, $4)
      RETURNING *
      `,
      [hotelName.trim(), customerName.trim(), Number(rating), feedback.trim()]
    )

    res.status(201).json({
      message: "Review submitted successfully",
      review: result.rows[0]
    })
  } catch (error) {
    console.error("Submit review error:", error)
    res.status(500).json({ message: "Failed to submit review", error: error.message })
  }
})
app.delete("/api/reviews/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM reviews WHERE id = $1 RETURNING *", [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Review not found" })
    }
    res.json({ message: "Review deleted successfully", review: result.rows[0] })
  } catch (error) {
    console.error("Delete review error:", error)
    res.status(500).json({ message: "Failed to delete review", error: error.message })
  }
})
app.use((err, req, res, next) => {
  console.error("Server error:", err.message)
  res.status(400).json({ message: err.message, error: err.message })
})
const PORT = process.env.PORT || 5000

app.listen(PORT, async () => {
  console.log(`🚀 PEARL HORIZON backend running on port ${PORT}`)
  try {
    const res = await pool.query("SELECT current_database(), NOW()")
    console.log(
      `✅ Connected to PostgreSQL database "${res.rows[0].current_database}" at ${res.rows[0].now}`
    )
    await initDb()
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL database:", error.message)
  }
})

module.exports = app