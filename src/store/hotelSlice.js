import { createSlice } from "@reduxjs/toolkit";

const hotelSlice = createSlice({
  name: "hotels",

  initialState: {
    hotels: []
  },

  reducers: {
    setHotels: (state, action) => {
      state.hotels = action.payload;
    },

    addHotel: (state, action) => {
      state.hotels.push(action.payload);
    },

    deleteHotel: (state, action) => {
      state.hotels = state.hotels.filter(
        (hotel) => hotel.id !== action.payload
      );
    },

    updateHotel: (state, action) => {
      const index = state.hotels.findIndex(
        (hotel) => hotel.id === action.payload.id
      );

      if (index !== -1) {
        state.hotels[index] = action.payload;
      }
    }
  }
});

export const {
  setHotels,
  addHotel,
  deleteHotel,
  updateHotel
} = hotelSlice.actions;

export default hotelSlice.reducer;