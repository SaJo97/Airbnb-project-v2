import axios, { type AxiosInstance } from "axios";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:8080/" : "/";

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

const createBooking = async (
  bookingData: CreateBookingBody
): Promise<Booking> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }
  const res = await apiClient.post("api/bookings", bookingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const fetchBookings = async (): Promise<Booking[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }
  const res = await apiClient.get("api/bookings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const fetchBookingById = async (bookingId: string): Promise<Booking> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }
  const res = await apiClient.get(`api/bookings/${bookingId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const bookingService = {
  createBooking,
  fetchBookings,
  fetchBookingById,
  apiClient,
};

export default bookingService;
