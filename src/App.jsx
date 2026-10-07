import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import './App.css'

export const API_BASE_URL = "http://localhost:5000"

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/images/placeholder.jpg"
  if (typeof imagePath === "string" &&
    (imagePath.startsWith("http://") ||
      imagePath.startsWith("https://") ||
      imagePath.startsWith("data:") ||
      imagePath.startsWith("blob:"))) return imagePath
  if (typeof imagePath === "string" && imagePath.startsWith("/uploads/"))
    return `${API_BASE_URL}${imagePath}`
  return imagePath
}

const parseGallery = (g) => {
  if (Array.isArray(g)) return g
  if (typeof g === "string") {
    try { return JSON.parse(g) } catch { return g ? [g] : [] }
  }
  return []
}

const HotelDetailPage = ({ hotel, onBack }) => {
  if (!hotel) return null

  return (
    <>
      <Helmet>
        <title>{hotel.name} | PEARL HORIZON</title>
        <meta name="description" content={hotel.description || `View details, facilities and prices for ${hotel.name} at PEARL HORIZON.`} />
        <meta name="keywords" content={`${hotel.name}, hotels, ${hotel.locationName || hotel.location}, hotel booking`} />
        <meta property="og:title" content={`${hotel.name} | PEARL HORIZON`} />
        <meta property="og:description" content={hotel.description || `Explore ${hotel.name}.`} />
        <meta property="og:image" content={getImageUrl(hotel.image)} />
      </Helmet>

      <div className="hotel-detail-page">
        <button onClick={onBack} className="back-button">← Back to Hotels</button>
        <h1>{hotel.name}</h1>
        <img src={getImageUrl(hotel.image)} alt={hotel.name} className="detail-hotel-image" />
        <h2>⭐ {hotel.rating} Rating</h2>
        <p>📍 {hotel.locationName || hotel.location}</p>
        <p><strong>Description:</strong> {hotel.description}</p>
        <p><strong>Price:</strong> ₹{Number(hotel.price).toLocaleString()} / Night</p>
        <p><strong>Facilities:</strong> {hotel.facilities}</p>

        {hotel.gallery?.length > 0 && (
          <>
            <h2>Hotel Gallery</h2>
            <div className="detail-gallery">
              {hotel.gallery.map((image, index) => (
                <img key={index} src={getImageUrl(image)} alt={`${hotel.name} gallery ${index + 1}`} />
              ))}
            </div>
          </>
        )}

        {hotel.latitude !== "" && hotel.longitude !== "" &&
          hotel.latitude != null && hotel.longitude != null &&
          Number.isFinite(Number(hotel.latitude)) &&
          Number.isFinite(Number(hotel.longitude)) && (
            <div className="detail-map">
              <h2>📍 Hotel Location</h2>
              <iframe
                title={`${hotel.name} map`}
                src={`https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}&output=embed`}
                width="100%" height="300"
                style={{ border: 0, borderRadius: "12px" }}
                loading="lazy" allowFullScreen
              />
              <a href={`https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}`} target="_blank" rel="noreferrer">
                Open in Google Maps
              </a>
            </div>
          )}

        <button onClick={onBack} className="back-button">Back to Hotels</button>
      </div>
    </>
  )
}

const App = () => {
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [showMyBookings, setShowMyBookings] = useState(false)
  const [myBookings, setMyBookings] = useState([])
  const [activePage, setActivePage] = useState("welcome")
  const [helpSearch, setHelpSearch] = useState("")
  const [location, setLocation] = useState("")
  const [searchLocation, setSearchLocation] = useState("")
  const [showReviews, setShowReviews] = useState(false)
  const [reviewHotel, setReviewHotel] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerRating, setCustomerRating] = useState(0)
  const [customerFeedback, setCustomerFeedback] = useState("")
  const [customerReviews, setCustomerReviews] = useState([])
  const [sortOption, setSortOption] = useState("")
  const [filterRating, setFilterRating] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [roomType, setRoomType] = useState("")
  const [roomCount, setRoomCount] = useState(1)
  const [showBooking, setShowBooking] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(10)
  const [stayType, setStayType] = useState("night")
  const [bookingHotel, setBookingHotel] = useState("")
  const [showGallery, setShowGallery] = useState(false)
  const [galleryHotel, setGalleryHotel] = useState(null)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(0)
  const [showFullImage, setShowFullImage] = useState(false)
  const [searchTitle, setSearchTitle] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [imagePreview, setImagePreview] = useState("")
  const [detailHotel, setDetailHotel] = useState(null)

  const hotelsPerPage = 8

  const initialHotels = [
    {
      name: "Purple Bloom", image: "/images/PurpleBloom.png", rating: 4.8,
      location: "bangalore", locationName: "Bangalore", latitude: 12.9716, longitude: 77.5946,
      description: "Luxury rooms with modern facilities.",
      facilities: "🏊 Pool | 🍽️ Restaurant | 📶 Free Wi-Fi", price: 4500,
      gallery: ["/images/PurpleBloom- bedroom.jpg", "/images/PurpleBloom- washroom.jpg", "/images/PurpleBloom- resturant.jpg", "/images/PurpleBloom- Swimming pool.jpg"]
    },
    {
      name: "Falcone", image: "/images/Falcone.jpg", rating: 4.7,
      location: "chennai", locationName: "Chennai", latitude: 13.0827, longitude: 80.2707,
      description: "Elegant rooms with a comfortable stay.",
      facilities: "🍳 Breakfast | 📶 Free Wi-Fi | 🅿️ Parking", price: 3800,
      gallery: ["/images/falcone- bedroom.jpg", "/images/falcone- washroom.jpg", "/images/falcone- resturant.jpg", "/images/falcone- swimming pool.jpg"]
    },
    {
      name: "Pearl Vista", image: "/images/PearlVista.jpg", rating: 4.6,
      location: "coimbatore", locationName: "Coimbatore", latitude: 11.0168, longitude: 76.9558,
      description: "Modern hotel with stylish rooms and dining.",
      facilities: "🍽️ Restaurant | 🏊 Pool | 📶 Free Wi-Fi", price: 3500,
      gallery: ["/images/PearlVista- bedroom.jpg", "/images/PearlVista- washroom.jpg", "/images/PearlVista- resturant.jpg", "/images/PearlVista- swimming pool.jpg"]
    },
    {
      name: "Vantella", image: "/images/Vantella.jpg", rating: 4.9,
      location: "hyderabad", locationName: "Hyderabad", latitude: 17.385, longitude: 78.4867,
      description: "Premium stay with spacious and elegant rooms.",
      facilities: "🏊 Pool | 🍳 Breakfast | 🅿️ Parking", price: 5000,
      gallery: ["/images/Vantella- bedroom.jpg", "/images/Vantella- washroom.jpg", "/images/Vantella- resturant.jpg", "/images/Vantella- swimming pool.jpg"]
    },
    {
      name: "Royal Crest", image: "/images/RoyalCrest.jpg", rating: 4.7,
      location: "mysore", locationName: "Mysore", latitude: 12.2958, longitude: 76.6394,
      description: "Elegant rooms with a peaceful atmosphere.",
      facilities: "🏊 Pool | 🍽️ Restaurant | 📶 Free Wi-Fi", price: 4200,
      gallery: ["/images/RoyalCrest- bedroom.jpg", "/images/RoyalCrest- washroom.jpg", "/images/RoyalCrest- resturant.jpg", "/images/RoyalCrest- swimming pool.jpg"]
    },
    {
      name: "Moonlight Grand", image: "/images/MoonlightGrand.jpg", rating: 4.6,
      location: "delhi", locationName: "Delhi", latitude: 28.6139, longitude: 77.209,
      description: "Comfortable stay with modern interiors.",
      facilities: "🍳 Breakfast | 🅿️ Parking | 📶 Free Wi-Fi", price: 3900,
      gallery: ["/images/MoonlightGrand- bedroom.jpg", "/images/MoonlightGrand- washroom.jpg", "/images/MoonlightGrand- resturant.jpg", "/images/MoonlightGrand- swimming pool.jpg"]
    },
    {
      name: "Luxury Modern Hotel", image: "/images/Luxury Modern Hotel.jpg", rating: 4.5,
      location: "new york", locationName: "New York", latitude: 40.7128, longitude: -74.006,
      description: "Modern rooms with excellent dining facilities.",
      facilities: "🍽️ Restaurant | 🏊 Pool | 🅿️ Parking", price: 3600,
      gallery: ["/images/LuxuryModern- bedroom.jpg", "/images/LuxuryModern- washroom.jpg", "/images/LuxuryModern- resturant.jpg", "/images/LuxuryModern- swimming pool.jpg"]
    },
    {
      name: "Crystal Bay", image: "/images/CrystalBay.jpg", rating: 4.8,
      location: "singapore", locationName: "Singapore", latitude: 1.3521, longitude: 103.8198,
      description: "Premium rooms designed for a relaxing stay.",
      facilities: "🏊 Pool | 🍳 Breakfast | 📶 Free Wi-Fi", price: 4800,
      gallery: ["/images/CrystalBay- bedroom.jpg", "/images/CrystalBay- washroom.jpg", "/images/CrystalBay- resturant.jpg", "/images/CrystalBay- swimming pool.jpg"]
    }
  ]

  const [hotels, setHotels] = useState(() => {
    const savedHotels = localStorage.getItem("pearlHotels")
    return savedHotels ? JSON.parse(savedHotels) : initialHotels
  })

  React.useEffect(() => {
    localStorage.setItem("pearlHotels", JSON.stringify(hotels))
  }, [hotels])

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/hotels`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load hotels from backend")
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((h) => {
            const local = initialHotels.find(
              (i) => i.name.toLowerCase() === h.name.toLowerCase()
            )
            const backendGallery = parseGallery(h.gallery)
            return {
              ...h,
              locationName: h.location_name || h.locationName || h.location,
              rating: Number(h.rating),
              price: Number(h.price),
              latitude: Number(h.latitude),
              longitude: Number(h.longitude),
              gallery: backendGallery.length > 0 ? backendGallery : local?.gallery || []
            }
          })

          setHotels((prev) => {
            const backendNames = new Set(formatted.map((h) => h.name.toLowerCase()))
            const remainingInitial = initialHotels.filter(
              (initH) => !backendNames.has(initH.name.toLowerCase())
            )
            return [...formatted, ...remainingInitial]
          })
        }
      })
      .catch((err) => console.warn("Backend not reached, using local data:", err.message))
  }, [])

  const getHelpAnswer = (question) => {
    const q = question.toLowerCase().trim()
    if (!q) return []

    const matchingHotels = hotels.filter(
      (hotel) =>
        q.includes(hotel.name.toLowerCase()) ||
        hotel.name.toLowerCase().split(" ").some(
          (word) => word.length > 2 && q.includes(word)
        )
    )

    if (matchingHotels.length > 0) {
      return matchingHotels.map((hotel) => {
        const asksPrice = /price|cost|rate|rupees|₹/.test(q)
        const asksRating = /rating|star|review/.test(q)
        const asksLocation = /location|where|city|place/.test(q)
        const asksFacility = /facility|facilities|pool|wifi|wi-fi|parking|restaurant|breakfast/.test(q)
        const asksDescription = /information|details|about|describe/.test(q)
        let answer = []

        if (asksPrice) answer.push(`Price: ₹${hotel.price.toLocaleString()} per night`)
        if (asksRating) answer.push(`Rating: ${hotel.rating}/5`)
        if (asksLocation) answer.push(`Location: ${hotel.locationName}`)
        if (asksFacility) answer.push(`Facilities: ${hotel.facilities}`)

        if (asksDescription || answer.length === 0) {
          answer.push(hotel.description)
          answer.push(`Location: ${hotel.locationName}`)
          answer.push(`Price: ₹${hotel.price.toLocaleString()} per night`)
          answer.push(`Rating: ${hotel.rating}/5`)
          answer.push(`Facilities: ${hotel.facilities}`)
        }

        return `${hotel.name}: ${answer.join(". ")}`
      })
    }

    if (/search|find|available hotels/.test(q))
      return [`Your website has ${hotels.length} hotels: ${hotels.map((h) => h.name).join(", ")}.`]

    if (/book|booking|reserve/.test(q))
      return ["To book a room, choose a hotel, click Book Now, select your room type and dates, and confirm your booking."]

    if (/review|feedback/.test(q))
      return ["Click Reviews on a hotel card to read or submit customer feedback."]

    if (/contact|support|email/.test(q))
      return ["For support, visit the Contact page. Email: support@pearlhorizon.com"]

    return ["I couldn't find an answer in the available website information. Try a hotel name, price, location, facilities, booking, or reviews."]
  }

  const [showCrud, setShowCrud] = useState(false)
  const [editingHotel, setEditingHotel] = useState(null)
  const [deletedHotel, setDeletedHotel] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])

  const [hotelForm, setHotelForm] = useState({
    name: "", image: "", rating: "", location: "", locationName: "",
    description: "", facilities: "", price: "", latitude: "", longitude: "", gallery: []
  })

  const handleAddHotel = async () => {
    if (!hotelForm.name.trim()) return alert("Hotel Name is empty")
    if (!imageFile && !hotelForm.image) return alert("Hotel Image is empty")
    if (!hotelForm.rating) return alert("Rating is empty")
    if (!hotelForm.location.trim()) return alert("Location is empty")
    if (!hotelForm.description.trim()) return alert("Description is empty")
    if (!hotelForm.price) return alert("Price is empty")
    if (hotelForm.latitude === "" || hotelForm.longitude === "") return alert("Latitude or Longitude is empty")

    try {
      const formData = new FormData()
      formData.append("name", hotelForm.name.trim())
      formData.append("rating", hotelForm.rating)
      formData.append("location", hotelForm.location.trim())
      formData.append("locationName", hotelForm.locationName.trim() || hotelForm.location.trim())
      formData.append("description", hotelForm.description.trim())
      formData.append("facilities", hotelForm.facilities || "")
      formData.append("price", hotelForm.price)
      formData.append("latitude", hotelForm.latitude)
      formData.append("longitude", hotelForm.longitude)

      galleryFiles.forEach((file) => formData.append("gallery", file))
      if (imageFile) formData.append("image", imageFile)
      else if (hotelForm.image) formData.append("image", hotelForm.image)

      const response = await fetch(`${API_BASE_URL}/api/hotels`, {
        method: "POST", body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to add hotel")
      }

      const savedHotel = await response.json()
      const formattedHotel = {
        ...savedHotel,
        locationName: savedHotel.location_name || savedHotel.locationName || savedHotel.location,
        rating: Number(savedHotel.rating),
        price: Number(savedHotel.price),
        latitude: Number(savedHotel.latitude),
        longitude: Number(savedHotel.longitude),
        gallery: savedHotel.gallery || []
      }

      setHotels((prev) => [formattedHotel, ...prev])
      setHotelForm({
        name: "", image: "", rating: "", location: "", locationName: "",
        description: "", facilities: "", price: "", latitude: "", longitude: "", gallery: []
      })
      setImageFile(null)
      setGalleryFiles([])
      setImagePreview("")
      setShowCrud(false)
      alert("Hotel Added Successfully! Image uploaded to backend and path saved in database.")
    } catch (error) {
      console.error("Error adding hotel:", error)
      alert(`Error adding hotel: ${error.message}`)
    }
  }

  const handleDeleteHotel = async (hotelName) => {
    const hotelToDelete = hotels.find((hotel) => hotel.name === hotelName)
    if (!hotelToDelete) return

    if (hotelToDelete.id) {
      try {
        await fetch(`${API_BASE_URL}/api/hotels/${hotelToDelete.id}`, { method: "DELETE" })
      } catch (err) {
        console.warn("Failed to delete from backend:", err.message)
      }
    }

    setDeletedHotel(hotelToDelete)
    alert(hotelToDelete.name + " deleted")
    setHotels(hotels.filter((hotel) => hotel.name !== hotelName))
  }

  const handleEditHotel = (hotel) => {
    setGalleryFiles([])
    setEditingHotel(hotel)
    setShowCrud(true)

    setHotelForm({
      name: hotel.name,
      image: hotel.image,
      rating: hotel.rating,
      location: hotel.location,
      locationName: hotel.locationName || hotel.location_name || "",
      latitude: hotel.latitude ?? "",
      longitude: hotel.longitude ?? "",
      description: hotel.description,
      facilities: hotel.facilities,
      price: hotel.price,
      gallery: hotel.gallery ?? []
    })

    setImageFile(null)
    setImagePreview(getImageUrl(hotel.image))
  }

  const handleUpdateHotel = async () => {
    if (
      !hotelForm.name.trim() || (!imageFile && !hotelForm.image) ||
      !hotelForm.rating || !hotelForm.location.trim() ||
      !hotelForm.description.trim() || !hotelForm.price ||
      hotelForm.latitude === "" || hotelForm.longitude === ""
    ) return alert("Please fill all required details")

    if (
      !Number.isFinite(Number(hotelForm.rating)) ||
      Number(hotelForm.rating) < 0 || Number(hotelForm.rating) > 5 ||
      !Number.isFinite(Number(hotelForm.price)) || Number(hotelForm.price) <= 0 ||
      !Number.isFinite(Number(hotelForm.latitude)) ||
      Number(hotelForm.latitude) < -90 || Number(hotelForm.latitude) > 90 ||
      !Number.isFinite(Number(hotelForm.longitude)) ||
      Number(hotelForm.longitude) < -180 || Number(hotelForm.longitude) > 180
    ) return alert("Please enter valid rating, price and location coordinates")

    try {
      const hotelId = editingHotel?.id
      const editName = editingHotel?.name || editingHotel

      if (hotelId) {
        const formData = new FormData()
        formData.append("name", hotelForm.name.trim())
        formData.append("rating", hotelForm.rating)
        formData.append("location", hotelForm.location.trim())
        formData.append("locationName", hotelForm.locationName.trim() || hotelForm.location.trim())
        formData.append("description", hotelForm.description.trim())
        formData.append("facilities", hotelForm.facilities || "")
        formData.append("price", hotelForm.price)
        formData.append("latitude", hotelForm.latitude)
        formData.append("longitude", hotelForm.longitude)

        galleryFiles.forEach((file) => formData.append("gallery", file))
        if (imageFile) formData.append("image", imageFile)
        else if (hotelForm.image) formData.append("image", hotelForm.image)

        const res = await fetch(`${API_BASE_URL}/api/hotels/${hotelId}`, {
          method: "PUT", body: formData
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || errData.message || "Failed to update hotel")
        }

        const updated = await res.json()
        const formattedUpdated = {
          ...updated,
          locationName: updated.location_name || updated.locationName || updated.location,
          rating: Number(updated.rating),
          price: Number(updated.price),
          latitude: Number(updated.latitude),
          longitude: Number(updated.longitude),
          gallery: updated.gallery || []
        }

        setHotels((prev) =>
          prev.map((h) =>
            h.id === hotelId || h.name === editName ? formattedUpdated : h
          )
        )
      } else {
        setHotels(
          hotels.map((hotel) =>
            hotel.name === editName
              ? {
                  ...hotelForm,
                  rating: Number(hotelForm.rating),
                  price: Number(hotelForm.price),
                  latitude: Number(hotelForm.latitude),
                  longitude: Number(hotelForm.longitude),
                  gallery: hotelForm.gallery
                }
              : hotel
          )
        )
      }

      setEditingHotel(null)
      setImageFile(null)
      setGalleryFiles([])
      setImagePreview("")
      setHotelForm({
        name: "", image: "", rating: "", location: "", locationName: "",
        description: "", facilities: "", price: "", latitude: "", longitude: "", gallery: []
      })
      alert("Hotel Updated Successfully!")
    } catch (err) {
      console.error("Error updating hotel:", err)
      alert(`Error updating hotel: ${err.message}`)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setHotelForm((prev) => ({ ...prev, image: URL.createObjectURL(file) }))
    }
  }

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setGalleryFiles(files)

      const imagePromises = files.map((file) =>
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
      )

      Promise.all(imagePromises).then((images) => {
        setHotelForm((prev) => ({ ...prev, gallery: [...prev.gallery, ...images] }))
      })
    }
  }

  const selectedRoomPrice = {
    "Standard Room": { day: 1500, night: 2500 },
    "Deluxe Room": { day: 2000, night: 3500 },
    "Premium Room": { day: 3000, night: 4500 },
    Suite: { day: 4000, night: 6000 }
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
  }

  const nights = calculateNights()
  const totalPrice = (selectedRoomPrice[roomType]?.[stayType] || 0) * nights * roomCount
  const discountAmount = (totalPrice * discountPercent) / 100
  const finalPrice = totalPrice - discountAmount

  let filteredHotels = hotels.filter((hotel) => {
    const search = searchLocation.toLowerCase().trim()
    const locationMatch =
      !search ||
      hotel.location?.toLowerCase().trim() === search ||
      hotel.locationName?.toLowerCase().trim() === search
    const ratingMatch = !filterRating || hotel.rating >= Number(filterRating)
    const titleMatch = hotel.name.toLowerCase().includes(searchTitle.toLowerCase().trim())
    const minPriceMatch = minPrice === "" || Number(hotel.price) >= Number(minPrice)
    const maxPriceMatch = maxPrice === "" || Number(hotel.price) <= Number(maxPrice)

    return locationMatch && ratingMatch && titleMatch && minPriceMatch && maxPriceMatch
  })

  if (sortOption === "low") filteredHotels.sort((a, b) => a.price - b.price)
  if (sortOption === "high") filteredHotels.sort((a, b) => b.price - a.price)
  if (sortOption === "rating") filteredHotels.sort((a, b) => b.rating - a.rating)

  const totalPages = Math.ceil(filteredHotels.length / hotelsPerPage)
  const startIndex = (currentPage - 1) * hotelsPerPage
  const currentHotels = filteredHotels.slice(startIndex, startIndex + hotelsPerPage)

  return (
    <div className="bg-img" id="home">
      {detailHotel ? (
        <HotelDetailPage hotel={detailHotel} onBack={() => setDetailHotel(null)} />
      ) : activePage === "welcome" ? (
        <div className="welcome-page">
          <div className="welcome-content">
            <h1>Welcome to Pearl Horizon</h1>
            <h2>Discover Your Perfect Stay</h2>
            <p>Experience comfort, luxury, and unforgettable moments at our hotels and resorts.</p>
            <button className="view-hotels-btn" onClick={() => setActivePage("hotels")}>
              View Hotels & Resorts
            </button>
          </div>
        </div>
      ) : (
        <>
          <nav>
            <h2> PEARL HORIZON</h2>
            <ul>
              <li><a href="#home" onClick={() => setActivePage("home")}>Home</a></li>
              <li><a href="#hotel-list" onClick={() => setActivePage("hotels")}>Hotel List</a></li>
              <li><a href="#about" onClick={() => setActivePage("about")}>About</a></li>
              <li><a href="#contact" onClick={() => setActivePage("contact")}>Contact</a></li>
              <li><a href="#help" onClick={() => setActivePage("help")}>Help</a></li>
            </ul>
          </nav>

          {activePage === "about" && (
            <div className="info-section" id="about">
              <h2>About Us</h2>
              <p>Welcome to PEARL HORIZON!</p>
              <p>Explore hotels, compare prices, view facilities and book your comfortable stay.</p>
            </div>
          )}

          {activePage === "contact" && (
            <div className="info-section" id="contact">
              <h2>Contact Us</h2>
              <p>📧 Email: support@pearlhorizon.com</p>
              <p>📞 Contact us for hotel booking enquiries.</p>
            </div>
          )}

          {activePage === "help" && (
            <div className="info-section" id="help">
              <h2>How Can We Help You?</h2>
              <p>Search below to find answers to your questions.</p>
              <input
                type="text"
                placeholder="Search help... (e.g. hotel name, price, location)"
                value={helpSearch}
                onChange={(e) => setHelpSearch(e.target.value)}
                className="help-search"
              />
              {helpSearch.trim() !== "" &&
                getHelpAnswer(helpSearch).map((answer, index) => (
                  <div className="help-result" key={index}>
                    <p>{answer}</p>
                  </div>
                ))}
            </div>
          )}

          {(activePage === "home" || activePage === "hotels") && (
            <>
              <div className="booking-box">
                <div className="booking-item">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="Where do you want to go?"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="booking-item">
                  <label>Check-in</label>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>

                <div className="booking-item">
                  <label>Chech-out</label>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>

                <div className="booking-item">
                  <label>Guests</label>
                  <select>
                    <option>1 Guests</option>
                    <option>2 Guests</option>
                    <option>3 Guests</option>
                    <option>4 Guests</option>
                  </select>
                </div>

                <button
                  className="search-btn"
                  onClick={() => setSearchLocation(location.toLowerCase().trim())}
                >
                  search hotels
                </button>
              </div>

              <div className="filter-sort">
                <select
                  value={filterRating}
                  onChange={(e) => {
                    setFilterRating(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="">All Ratings</option>
                  <option value="4.5">4.5+ Rating</option>
                  <option value="4.7">4.7+ Rating</option>
                  <option value="4.8">4.8+ Rating</option>
                </select>

                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                  <option value="">Sort Hotels</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                  <option value="rating">Rating: High to Low</option>
                </select>

                <button onClick={() => setShowCrud(!showCrud)}>➕ Add Hotel</button>
              </div>

              <div className="hotel-search-filters">
                <input
                  type="text"
                  placeholder="Search hotel by name"
                  value={searchTitle}
                  onChange={(e) => {
                    setSearchTitle(e.target.value)
                    setCurrentPage(1)
                  }}
                />

                <input
                  type="number"
                  placeholder="Minimum Price"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value)
                    setCurrentPage(1)
                  }}
                />

                <input
                  type="number"
                  placeholder="Maximum Price"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value)
                    setCurrentPage(1)
                  }}
                />

                <button onClick={() => {
                  setSearchTitle("")
                  setMinPrice("")
                  setMaxPrice("")
                  setCurrentPage(1)
                }}>
                  Clear Filters
                </button>
              </div>

              {showPreview && (
                <div className="preview-box">
                  <h2>👁️ Hotel Preview</h2>
                  <h3>{hotelForm.name}</h3>
                  <p>⭐ {hotelForm.rating}</p>
                  <p>📍 {hotelForm.locationName}</p>
                  <p>{hotelForm.description}</p>
                  <p>{hotelForm.facilities}</p>
                  <h4>₹{hotelForm.price} / Night</h4>
                  <img
                    src={imagePreview || getImageUrl(hotelForm.image)}
                    alt={hotelForm.name}
                    className="image-preview"
                  />
                  <button onClick={() => setShowPreview(false)}>Close Preview</button>
                </div>
              )}

              <div className="hotel-images" id="hotel-list">
                {showCrud && (
                  <div className="crud-box">
                    <button
                      className="crud-close"
                      onClick={() => {
                        setShowCrud(false)
                        setEditingHotel(null)
                        setImageFile(null)
                        setGalleryFiles([])
                        setImagePreview("")
                      }}
                    >
                      ✕
                    </button>

                    <h2>{editingHotel ? "✏️ Edit Hotel" : "➕ Add New Hotel"}</h2>

                    <input
                      type="text"
                      placeholder="Hotel Name"
                      value={hotelForm.name}
                      onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                    />

                    <input type="file" accept="image/*" onChange={handleImageChange} />

                    {imagePreview && (
                      <img src={imagePreview} alt="Hotel Preview" className="image-preview" />
                    )}

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview("")
                          setHotelForm({ ...hotelForm, image: "" })
                        }}
                      >
                        Remove Image
                      </button>
                    )}

                    <input
                      type="number"
                      placeholder="Rating"
                      value={hotelForm.rating}
                      onChange={(e) => setHotelForm({ ...hotelForm, rating: e.target.value })}
                    />

                    <input
                      type="text"
                      placeholder="Location"
                      value={hotelForm.location}
                      onChange={(e) => setHotelForm({ ...hotelForm, location: e.target.value })}
                    />

                    <input
                      type="text"
                      placeholder="Location Name"
                      value={hotelForm.locationName}
                      onChange={(e) => setHotelForm({ ...hotelForm, locationName: e.target.value })}
                    />

                    <input
                      type="number"
                      placeholder="Latitude"
                      min="-90"
                      max="90"
                      step="any"
                      value={hotelForm.latitude}
                      onChange={(e) => setHotelForm({ ...hotelForm, latitude: e.target.value })}
                    />

                    <input
                      type="number"
                      placeholder="Longitude"
                      min="-180"
                      max="180"
                      step="any"
                      value={hotelForm.longitude}
                      onChange={(e) => setHotelForm({ ...hotelForm, longitude: e.target.value })}
                    />

                    <input
                      type="text"
                      placeholder="Description"
                      value={hotelForm.description}
                      onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                    />

                    <input
                      type="text"
                      placeholder="Facilities"
                      value={hotelForm.facilities}
                      onChange={(e) => setHotelForm({ ...hotelForm, facilities: e.target.value })}
                    />

                    <input
                      type="number"
                      placeholder="Price per Night"
                      value={hotelForm.price}
                      onChange={(e) => setHotelForm({ ...hotelForm, price: e.target.value })}
                    />

                    <label>Gallery Images</label>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryChange}
                    />

                    {hotelForm.gallery.length > 0 && (
                      <div className="gallery-preview">
                        {hotelForm.gallery.map((image, index) => (
                          <img key={index} src={image} alt={`Gallery ${index + 1}`} width="100" />
                        ))}
                      </div>
                    )}

                    <button onClick={() => setShowPreview(true)}>👁️ Preview</button>

                    {editingHotel ? (
                      <button onClick={handleUpdateHotel}>✏️ Update Hotel</button>
                    ) : (
                      <button onClick={handleAddHotel}>➕ Add Hotel</button>
                    )}
                  </div>
                )}
              </div>

              <div className="hotel-images">
                {currentHotels.map((hotel) => (
                  <div className="hotel-card" key={hotel.id || hotel.name}>
                    <img src={getImageUrl(hotel.image)} alt={hotel.name} />
                    <h3>{hotel.name}</h3>
                    <p>⭐ {hotel.rating} | 📍 {hotel.locationName}</p>
                    <p>{hotel.description}</p>
                    <p>{hotel.facilities}</p>
                    <h4>₹{hotel.price.toLocaleString()} / Night</h4>

                    <button onClick={() => setDetailHotel(hotel)}>View Details</button>

                    <button onClick={() => {
                      setGalleryHotel(hotel)
                      setShowGallery(true)
                    }}>
                      🖼️ View Gallery
                    </button>

                    <button onClick={() => {
                      setReviewHotel(hotel.name)
                      setShowReviews(true)
                    }}>
                      ⭐ Reviews
                    </button>

                    <button onClick={() => {
                      setBookingHotel(hotel.name)
                      setShowBooking(true)
                    }}>
                      Book Now
                    </button>

                    <button onClick={() => handleEditHotel(hotel)}>✏️ Edit</button>
                    <button onClick={() => handleDeleteHotel(hotel.name)}>🗑️ Delete</button>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </button>

                  <span>Page {currentPage} of {totalPages}</span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}

              {deletedHotel && (
                <div
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    padding: "20px",
                    margin: "20px auto",
                    width: "400px",
                    textAlign: "center",
                    borderRadius: "10px"
                  }}
                >
                  <p>🗑️ {deletedHotel.name} deleted</p>

                  <button onClick={() => {
                    setHotels([...hotels, deletedHotel])
                    setDeletedHotel(null)
                  }}>
                    ↩️ Undo
                  </button>

                  <button onClick={() => setDeletedHotel(null)}>Close</button>
                </div>
              )}

              {selectedHotel && (
                <div className="hotel-details">
                  <h2>{selectedHotel.name || selectedHotel}</h2>
                  <p>⭐ {selectedHotel.rating || 4.8} Rating</p>
                  <p>📍 {selectedHotel.locationName || "Bangalore"}</p>
                  <p>🛏️ Deluxe and Premium Rooms</p>
                  <p>🍽️ Restaurant and Room Service</p>
                  <p>🏊 Swimming Pool</p>
                  <p>📶 Free Wi-Fi</p>
                  <p>🅿️ Free Parking</p>
                  <p>🕐 24/7 Reception</p>

                  {selectedHotel.latitude != null && selectedHotel.longitude != null && (
                    <div className="hotel-map">
                      <h3>📍 Hotel Location</h3>

                      <iframe
                        title={`${selectedHotel.name || selectedHotel} Location`}
                        width="100%"
                        height="250"
                        style={{ border: 0, borderRadius: "10px" }}
                        loading="lazy"
                        src={`https://www.google.com/maps?q=${selectedHotel.latitude},${selectedHotel.longitude}&output=embed`}
                        allowFullScreen
                      />

                      <a
                        href={`https://www.google.com/maps?q=${selectedHotel.latitude},${selectedHotel.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  )}

                  <button onClick={() => setSelectedHotel(null)}>Close</button>
                </div>
              )}

              {showReviews && (
                <div className="reviews-box">
                  <h2>⭐ {reviewHotel} Reviews</h2>
                  <h3>Give Your Rating</h3>

                  <input
                    type="text"
                    placeholder="Your Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />

                  <select
                    value={customerRating}
                    onChange={(e) => setCustomerRating(Number(e.target.value))}
                  >
                    <option value="0">Select Rating</option>
                    <option value="1">⭐ 1 Star</option>
                    <option value="2">⭐⭐ 2 Stars</option>
                    <option value="3">⭐⭐⭐ 3 Stars</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                  </select>

                  <textarea
                    placeholder="Write your feedback"
                    value={customerFeedback}
                    onChange={(e) => setCustomerFeedback(e.target.value)}
                  />

                  <button onClick={() => {
                    if (!customerName.trim() || customerRating === 0 || !customerFeedback.trim()) {
                      alert("Please enter your name, rating and feedback")
                      return
                    }

                    setCustomerReviews([
                      ...customerReviews,
                      {
                        hotel: reviewHotel,
                        name: customerName,
                        rating: customerRating,
                        feedback: customerFeedback
                      }
                    ])

                    setCustomerName("")
                    setCustomerRating(0)
                    setCustomerFeedback("")
                    alert("Review submitted successfully!")
                  }}>
                    Submit Review
                  </button>

                  <hr />

                  {customerReviews
                    .filter((review) => review.hotel === reviewHotel)
                    .map((review, index) => (
                      <div className="review" key={index}>
                        <h3>{"⭐".repeat(review.rating)}</h3>
                        <p><b>{review.name}</b></p>
                        <p>{review.feedback}</p>
                      </div>
                    ))}

                  <button onClick={() => setShowReviews(false)}>Close</button>
                </div>
              )}

              {showGallery && galleryHotel && (
                <div className="gallery-box">
                  <h2>🖼️ {galleryHotel.name} Gallery</h2>

                  <div className="gallery-images">
                    {(galleryHotel.gallery || []).map((image, index) => (
                      <img
                        key={index}
                        src={getImageUrl(image)}
                        alt={`${galleryHotel.name} ${index + 1}`}
                        onClick={() => {
                          setSelectedGalleryImage(index)
                          setShowFullImage(true)
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </div>

                  <button onClick={() => {
                    setShowGallery(false)
                    setGalleryHotel(null)
                  }}>
                    Close Gallery
                  </button>
                </div>
              )}
              {showFullImage && showGallery && galleryHotel && (
                <div className="full-image-page">
                  <button className="close-image" onClick={() => setShowFullImage(false)}>✕</button>
                  <img
                    src={getImageUrl(galleryHotel.gallery[selectedGalleryImage])}
                    alt={`${galleryHotel.name} ${selectedGalleryImage + 1}`}
                  />
                  <div>
                    <button
                      disabled={selectedGalleryImage === 0}
                      onClick={() => setSelectedGalleryImage(selectedGalleryImage - 1)}
                    >
                      ← Previous
                    </button>
                    <span> {selectedGalleryImage + 1} / {galleryHotel.gallery.length} </span>
                    <button
                      disabled={selectedGalleryImage === galleryHotel.gallery.length - 1}
                      onClick={() => setSelectedGalleryImage(selectedGalleryImage + 1)}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
              {showBooking && (
                <div className="booking-form">
                  <h2>Booking Details</h2>
                  <input type="text" placeholder="Full Name" />
                  <input type="tel" placeholder="Phone Number" />
                  <input type="email" placeholder="Email Address" />
                  <label>Check-in Date</label>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                  <label>Check-out Date</label>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                  <select>
                    <option>1 Guest</option>
                    <option>2 Guests</option>
                    <option>3 Guests</option>
                    <option>4 Guests</option>
                  </select>
                  <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                    <option value="">Select Room Type</option>
                    <option value="Standard Room">Standard Room - ₹2,500</option>
                    <option value="Deluxe Room">Deluxe Room - ₹3,500</option>
                    <option value="Premium Room">Premium Room - ₹4,500</option>
                    <option value="Suite">Suite - ₹6,000</option>
                  </select>
                  <select value={roomCount} onChange={(e) => setRoomCount(Number(e.target.value))}>
                    <option value="1">1 Room</option>
                    <option value="2">2 Rooms</option>
                    <option value="3">3 Rooms</option>
                    <option value="4">4 Rooms</option>
                  </select>
                  <label>Select Stay Type</label>
                  <select value={stayType} onChange={(e) => setStayType(e.target.value)}>
                    <option value="day">Day Stay</option>
                    <option value="night">Night Stay</option>
                  </select>
                  <textarea placeholder="Special Request"></textarea>
                  <label>Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setDiscountPercent(Math.min(100, Math.max(0, value)))
                    }}
                  />
                  {totalPrice > 0 && (
                    <div>
                      <p>Original Price: ₹{totalPrice.toLocaleString()}</p>
                      <p>🎉 Discount: {discountPercent}%</p>
                      <p>Discount Amount: ₹{discountAmount.toLocaleString()}</p>
                      <h3>Final Price: ₹{finalPrice.toLocaleString()}</h3>
                    </div>
                  )}
                  <select>
                    <option>Select Payment Method</option>
                    <option>UPI</option>
                    <option>Credit/Debit Card</option>
                    <option>Pay at Hotel</option>
                  </select>
                  <button onClick={() => {
                    setShowBooking(false)
                    setShowMyBookings(true)
                    setTimeout(() => {
                      document.querySelector(".my-bookings")?.scrollIntoView({
                        behavior: "smooth"
                      })
                    }, 100)
                  }}>
                    Confirm Booking
                  </button>
                  <button onClick={() => setShowBooking(false)}>Close</button>
                </div>
              )}
              {showMyBookings && (
                <div className="my-bookings">
                  <h2>📋 My Booking</h2>
                  <p>🏨 Hotel: {bookingHotel}</p>
                  <p>✅ Booking Confirmed</p>
                  <p>🛏️ Room Type: {roomType}</p>
                  <p>🚪 Number of Rooms: {roomCount}</p>
                  <p>📅 Check-in: {checkIn}</p>
                  <p>📅 Check-out: {checkOut}</p>
                  {totalPrice > 0 && (
                    <div>
                      <p>Original Price: ₹{totalPrice.toLocaleString()}</p>
                      <p>🎉 Discount: {discountPercent}%</p>
                      <p>Discount Amount: ₹{discountAmount.toLocaleString()}</p>
                      <h3>Final Price: ₹{finalPrice.toLocaleString()}</h3>
                    </div>
                  )}
                  <button onClick={() => setShowMyBookings(false)}>Close</button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
export default App