import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router";
import { getSpecificBooking } from "@/store/features/bookings/bookingSlice";
import type { RootState, AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import {
  FaLeaf,
  FaCalendarAlt,
  FaUsers,
  FaHome,
  FaMapMarkerAlt,
  FaBed,
  FaRulerCombined,
  FaListUl,
  FaImage,
} from "react-icons/fa";

const BookingDetails = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedBooking, loading, error } = useSelector(
    (state: RootState) => state.bookings
  );

  useEffect(() => {
    if (bookingId) {
      dispatch(getSpecificBooking(bookingId));
    }
  }, [dispatch, bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-green-700 text-lg">Laddar bokning detaljer...</div>
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

  if (!selectedBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-green-700 text-lg">Bokning hittades inte.</div>
      </div>
    );
  }

  const housing = selectedBooking.housingId; // Alias for readability

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 border border-green-200">
        <h1 className="text-3xl font-bold text-green-800 mb-6 flex items-center gap-2">
          <FaLeaf className="text-green-600" />
          Bokningsdetaljer
        </h1>

        {/* Booking Info Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            Bokningsinformation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-green-600" />
              <span className="text-gray-700">
                <strong>Datum:</strong>{" "}
                {new Date(selectedBooking.startDate).toLocaleDateString()} to{" "}
                {new Date(selectedBooking.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="text-green-600" />
              <span className="text-gray-700">
                <strong>Gäster:</strong> {selectedBooking.guests.adults} vuxna,{" "}
                {selectedBooking.guests.kids} barn,{" "}
                {selectedBooking.guests.animals} hundar
              </span>
            </div>
            <p className="text-gray-700">
              <strong>Totala Pris:</strong> ${selectedBooking.totalPrice} (Per
              Natt: ${selectedBooking.perNightPrice})
            </p>
            <p className="text-gray-700">
              <strong>Bokade På:</strong>{" "}
              {new Date(selectedBooking.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Housing Details Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
            <FaHome className="text-green-600" />
            Boende Detaljer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-gray-700">
              <strong>Titel:</strong> {housing.title}
            </p>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-green-600" />
              <span className="text-gray-700">
                <strong>Plats:</strong> {housing.location}
              </span>
            </div>
            <p className="text-gray-700">
              <strong>Typ:</strong> {housing.type}
            </p>
            <p className="text-gray-700">
              <strong>Ställe:</strong> {housing.place}
            </p>
            <div className="flex items-center gap-2">
              <FaBed className="text-green-600" />
              <span className="text-gray-700">
                <strong>Sovrum:</strong> {housing.bedrooms},{" "}
                <strong>Rum:</strong> {housing.rooms}, <strong>Sängar:</strong>{" "}
                {housing.beds}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaRulerCombined className="text-green-600" />
              <span className="text-gray-700">
                <strong>Priser:</strong> Vuxen: ${housing.prices.adult}, Barn: $
                {housing.prices.kid}, Hund: ${housing.prices.animal}, Boende: $
                {housing.prices.housing}
              </span>
            </div>
          </div>
        </div>

        {/* Rules Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
            <FaListUl className="text-green-600" />
            Regler
          </h2>
          <ul className="list-disc list-inside text-gray-700">
            {housing.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </div>

        {/* Near Activities Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            Nära Aktiviteter
          </h2>
          <p className="text-gray-700 mb-2">
            <strong>Beskrivning:</strong> {housing.nearActivities.description}
          </p>
          <ul className="list-disc list-inside text-gray-700">
            {housing.nearActivities.activities.map((activity, index) => (
              <li key={index}>
                <strong>{activity.name}</strong> - {activity.location}
              </li>
            ))}
          </ul>
        </div>

        {/* Images Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
            <FaImage className="text-green-600" />
            Bilder
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {housing.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Housing ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg shadow-sm"
              />
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button
            asChild
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            <Link to="/bookings">Tillbaka till Historik</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
