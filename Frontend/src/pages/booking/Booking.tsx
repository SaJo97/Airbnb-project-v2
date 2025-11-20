import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";
import type { AppDispatch, RootState } from "@/store";
import { getHousing } from "@/store/features/housing/housingSlice";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import Modal from "react-modal";
import { makeBooking } from "@/store/features/bookings/bookingSlice";

const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const housingId = searchParams.get("housingId") || "";
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const adultsParam = Number(searchParams.get("adults")) || 1;
  const kidsParam = Number(searchParams.get("kids")) || 0;
  const dogsParam = Number(searchParams.get("dogs")) || 0;

  const [guestError, setGuestError] = useState("");
  const [animalError, setAnimalError] = useState("");

  const [startDate, setStartDate] = useState<Date | undefined>(
    startDateParam ? new Date(startDateParam) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    endDateParam ? new Date(endDateParam) : undefined
  );
  const [guests, setGuests] = useState({
    adults: adultsParam,
    kids: kidsParam,
    dogs: dogsParam,
  });
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [showDateModal, setShowDateModal] = useState(false);
  const [showGuestsModal, setShowGuestsModal] = useState(false);

  useEffect(() => {
    if (housingId) dispatch(getHousing(housingId));
  }, [dispatch, housingId]);

  const { selectedHousing, loading, error } = useSelector(
    (state: RootState) => state.housingList
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!selectedHousing) return <p>Housing not found.</p>;

  //  DATE HELPERS (same logic as desktop + mobile booking sections)
  const normalize = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const isDateAvailable = (date: Date) => {
    const d = normalize(date);
    return selectedHousing.availableDates.some((range: any) => {
      const start = normalize(new Date(range.start));
      const end = normalize(new Date(range.end));
      return d >= start && d <= end;
    });
  };

  const isCheckOutDateAllowed = (checkIn: Date, checkOut: Date) => {
    const inDate = normalize(checkIn);
    const outDate = normalize(checkOut);

    if (outDate <= inDate) return false;

    return selectedHousing.availableDates.some((range: any) => {
      const start = normalize(new Date(range.start));
      const end = normalize(new Date(range.end));
      return inDate >= start && outDate <= end;
    });
  };

  // PRICING CALC
  const prices = selectedHousing.prices;
  const pricePerNight =
    prices.adult * guests.adults +
    prices.kid * guests.kids +
    prices.animal * guests.dogs +
    prices.housing;

  const nights =
    startDate && endDate
      ? Math.ceil(
          (normalize(endDate).getTime() - normalize(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 1;

  const totalPrice = pricePerNight * nights;

  // UI TEXT HELPERS
  const guestCount = guests.adults + guests.kids;
  const dogText =
    guests.dogs === 1
      ? "1 hund"
      : guests.dogs > 1
      ? `${guests.dogs} hundar`
      : "";
  const guestDisplay = `${guestCount} ${guestCount === 1 ? "gäst" : "gäster"}${
    dogText ? `, ${dogText}` : ""
  }`;

  const paymentTexts = {
    swish: "Betala enkelt med Swish från din mobil.",
    visa: "Säker betalning med Visa-kort.",
    mastercard: "Säker betalning med Mastercard.",
    paypal: "Betala via PayPal-konto.",
  };
  const selectedPaymentText =
    paymentTexts[paymentMethod as keyof typeof paymentTexts] || "";

  // const updateGuests = (type: keyof typeof guests, delta: number) => {
  //   setGuests((prev) => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
  // };

  const updateGuests = (type: keyof typeof guests, delta: number) => {
    setGuests((prev) => {
      const newValue = Math.max(0, prev[type] + delta);
      let newGuests = { ...prev, [type]: newValue };

      const maxGuests = selectedHousing.maxAdults + selectedHousing.maxKids;
      const totalPeople = newGuests.adults + newGuests.kids;

      // Reset errors first
      setGuestError("");
      setAnimalError("");

      // PEOPLE VALIDATION
      if (totalPeople > maxGuests) {
        setGuestError(`Max antal gäster är ${maxGuests}.`);
        return prev; // block update
      }

      // ANIMAL VALIDATION
      if (newGuests.dogs > selectedHousing.maxAnimals) {
        setAnimalError(`Max antal djur är ${selectedHousing.maxAnimals}.`);
        return prev; // block update
      }

      return newGuests;
    });
  };

  const handleBookAndPay = () => {
    const maxGuests = selectedHousing.maxAdults + selectedHousing.maxKids;
    const totalPeople = guests.adults + guests.kids;

    if (totalPeople > maxGuests) {
      alert(`Du har överskridit max antal gäster (${maxGuests}).`);
      return;
    }

    if (guests.dogs > selectedHousing.maxAnimals) {
      alert(
        `Du har överskridit max antal djur (${selectedHousing.maxAnimals}).`
      );
      return;
    }

    if (!housingId || !startDate || !endDate) {
      alert("Missing required booking fields.");
      return;
    }
    if (!isCheckOutDateAllowed(startDate, endDate)) {
      alert("Selected dates are not valid.");
      return;
    }
    if (!paymentMethod) {
      alert("Välj betalningsmetod.");
      return;
    }

    const bookingData = {
      housingId,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      guests: {
        adults: guests.adults,
        kids: guests.kids,
        animals: guests.dogs,
      },
    };

    dispatch(makeBooking(bookingData)).then(() => navigate("/"));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 text-[#063831]">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-2xl font-bold text-center mb-6">
          Betalningsöversikt
        </h3>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDE */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 mb-6">
              <img
                src={selectedHousing.images?.[0] || "/placeholder.jpg"}
                alt={selectedHousing.title}
                className="w-full sm:w-32 h-32 object-cover rounded-lg"
              />
              <div className="flex-1 flex flex-col md:gap-15">
                <h4 className="text-2xl font-semibold">
                  {selectedHousing.title}
                </h4>
                {selectedHousing.rating && (
                  <p className="text-yellow-500 text-[14px]">
                    ⭐ {selectedHousing.rating.average} (
                    {selectedHousing.rating.count} reviews)
                  </p>
                )}
              </div>
            </div>

            {/* DATE ROW */}
            <div className="mb-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <p className="font-semibold">
                  Datum: {startDate?.toLocaleDateString("sv-SE")} -{" "}
                  {endDate?.toLocaleDateString("sv-SE")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowDateModal(true)}
                >
                  Ändra
                </Button>
              </div>
            </div>

            {/* GUEST ROW */}
            <div className="mb-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <p className="font-semibold">Gäster: {guestDisplay}</p>
                <Button
                  variant="outline"
                  onClick={() => setShowGuestsModal(true)}
                >
                  Ändra
                </Button>
              </div>
            </div>

            {/* PRICE */}
            <div className="mb-4">
              <h5 className="font-semibold mb-2">Prisuppgifter</h5>
              <div className="text-sm sm:text-base space-y-1">
                <p>
                  {guests.adults}st Vuxen: {prices.adult * guests.adults} kr
                </p>
                <p>
                  {guests.kids}st Barn: {prices.kid * guests.kids} kr
                </p>
                <p>
                  {guests.dogs}st Hund: {prices.animal * guests.dogs} kr
                </p>
                <p>1st Boende: {prices.housing} kr</p>
              </div>
            </div>

            <p className="font-semibold text-lg mt-4 text-center sm:text-left">
              Pris att betala: {totalPrice} kr
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1">
            <h5 className="font-semibold mb-4 text-center sm:text-left">
              Välj betalningsmetod
            </h5>
            <div className="space-y-2 mb-4 flex flex-col items-start">
              {["swish", "visa", "mastercard", "paypal"].map((method) => (
                <label key={method} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="capitalize">{method}</span>
                </label>
              ))}
            </div>
            {selectedPaymentText && (
              <p className="text-sm text-gray-600 mb-4 text-center sm:text-left">
                {selectedPaymentText}
              </p>
            )}
            <Button
              onClick={handleBookAndPay}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Boka & Betala
            </Button>
          </div>
        </div>

        {/* DATE MODAL */}
        <Modal
          isOpen={showDateModal}
          onRequestClose={() => setShowDateModal(false)}
          className="bg-white p-4 sm:p-5 rounded-lg shadow-xl w-[85%] max-w-sm mx-auto mt-10 sm:mt-16 overflow-y-auto max-h-[80vh]"
          overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <h4 className="text-lg font-semibold mb-4 text-center">
            Ändra datum
          </h4>

          <div className="flex flex-col gap-4">
            {/* CHECK-IN CALENDAR */}
            <div>
              <label className="block text-sm mb-2">Incheckning</label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  if (!date) return;
                  if (!isDateAvailable(date)) return;

                  setStartDate(date);

                  if (endDate && !isCheckOutDateAllowed(date, endDate)) {
                    setEndDate(undefined);
                  }
                }}
                disabled={(date) => !isDateAvailable(date)}
                className="rounded-md border w-full"
              />
            </div>

            {/* CHECK-OUT CALENDAR */}
            <div>
              <label className="block text-sm mb-2">Utcheckning</label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  if (!startDate || !date) return;
                  if (!isCheckOutDateAllowed(startDate, date)) return;
                  setEndDate(date);
                }}
                disabled={(date) =>
                  !isDateAvailable(date) ||
                  (startDate ? date <= startDate : true)
                }
                className="rounded-md border w-full"
              />
            </div>
          </div>

          <Button
            onClick={() => setShowDateModal(false)}
            className="mt-5 w-full text-sm sm:text-base"
          >
            Stäng
          </Button>
        </Modal>

        {/* GUEST MODAL */}
        <Modal
          isOpen={showGuestsModal}
          onRequestClose={() => setShowGuestsModal(false)}
          className="bg-white p-4 sm:p-5 rounded-lg shadow-xl w-[85%] max-w-xs mx-auto mt-10 sm:mt-16 overflow-y-auto max-h-[80vh]"
          overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <h4 className="text-lg font-semibold mb-4 text-center">
            Ändra gäster
          </h4>
          <div className="space-y-3">
            {(["adults", "kids", "dogs"] as const).map((type) => (
              <div
                key={type}
                className="flex justify-between items-center text-sm sm:text-base"
              >
                <span className="capitalize">
                  {type === "adults"
                    ? "Vuxna"
                    : type === "kids"
                    ? "Barn"
                    : "Hundar"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateGuests(type, -1)}
                    className="bg-gray-200 px-2 py-1 rounded text-lg"
                  >
                    -
                  </button>
                  <span>{guests[type]}</span>
                  <button
                    onClick={() => updateGuests(type, 1)}
                    className="bg-gray-200 px-2 py-1 rounded text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          {guestError && (
            <p className="text-red-600 text-center mt-3">{guestError}</p>
          )}
          {animalError && (
            <p className="text-red-600 text-center mt-1">{animalError}</p>
          )}
          <Button
            onClick={() => setShowGuestsModal(false)}
            className="mt-5 w-full text-sm sm:text-base"
          >
            Stäng
          </Button>
        </Modal>
      </div>
    </div>
  );
};

export default Booking;
