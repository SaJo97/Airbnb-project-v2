import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { getAllBookings } from "@/store/features/bookings/bookingSlice";
import type { RootState, AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { FaLeaf, FaCalendarAlt } from "react-icons/fa"; // Nature-themed icons

const BookingHistory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading, error } = useSelector(
    (state: RootState) => state.bookings
  );

  useEffect(() => {
    dispatch(getAllBookings());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-green-700 text-lg">Loading your bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-red-700 text-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-6 flex items-center gap-2">
          <FaLeaf className="text-green-600" />
          Din Bokningshistorik
        </h1>
        {bookings.length === 0 ? (
          <div className="text-center text-green-700 text-lg">
            Inga bokningar hittades.{" "}
            <Link to="/" className="underline">
              Utforska bostäder
            </Link>{" "}
            för att boka ett!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-green-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarAlt className="text-green-600" />
                  <span className="text-green-800 font-semibold">Bokning</span>
                </div>
                <p className="text-gray-600 mb-1">
                  <strong>Boende:</strong> {booking.housingId.title} (
                  {booking.housingId.location})
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Datum:</strong>{" "}
                  {new Date(booking.startDate).toLocaleDateString()} till{" "}
                  {new Date(booking.endDate).toLocaleDateString()}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Gäster:</strong> {booking.guests.adults} adults,{" "}
                  {booking.guests.kids} kids, {booking.guests.animals} animals
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Totala Pris:</strong> ${booking.totalPrice}
                </p>
                <Button
                  asChild
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Link to={`/booking/${booking._id}`}>Visa Detaljer</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
