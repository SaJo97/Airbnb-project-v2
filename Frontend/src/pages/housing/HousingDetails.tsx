import { Button } from "@/components/ui/button";
import { HousingMap } from "@/components/ui/map";
import type { AppDispatch, RootState } from "@/store";
import { getHousing } from "@/store/features/housing/housingSlice";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import dogFriendly from "@/assets/dog.svg";
import { FaChevronDown } from "react-icons/fa";
import { Calendar } from "@/components/ui/calendar";
import MobileBookingSection from "./components/MobileBookingSection";
const HousingDetails = () => {
  const { houseId } = useParams<{ houseId: string }>();
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  // typed selector
  const { selectedHousing, error, loading, currentFilters } = useSelector(
    (state: RootState) => state.housingList
  );

  const [guestError, setGuestError] = useState("");
  const [animalError, setAnimalError] = useState("");

  // Booking state (pre-filled from Redux currentFilters)
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(
    currentFilters.startDate ? new Date(currentFilters.startDate) : undefined
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(
    currentFilters.endDate ? new Date(currentFilters.endDate) : undefined
  );
  const [guests, setGuests] = useState({
    adults: Number(currentFilters.maxAdults) || 1,
    kids: Number(currentFilters.maxKids) || 0,
    dogs: Number(currentFilters.maxAnimals) || 0,
  });
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

  // Add refs for click-outside detection
  const checkInCalendarRef = useRef<HTMLDivElement>(null);
  const checkOutCalendarRef = useRef<HTMLDivElement>(null);
  const guestsDropdownRef = useRef<HTMLDivElement>(null);

  // Click-outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        checkInCalendarRef.current &&
        !checkInCalendarRef.current.contains(event.target as Node)
      ) {
        setShowCheckInCalendar(false);
      }
      if (
        checkOutCalendarRef.current &&
        !checkOutCalendarRef.current.contains(event.target as Node)
      ) {
        setShowCheckOutCalendar(false);
      }
      if (
        guestsDropdownRef.current &&
        !guestsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowGuestsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // fetch housing data
  useEffect(() => {
    if (houseId) {
      dispatch(getHousing(houseId));
    }
  }, [dispatch, houseId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!selectedHousing) return null;

  // Normalize to YYYY-MM-DD (removes timezone effects)
  const normalize = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  // Helper function to check if a date is within available ranges
  const isDateAvailable = (
    date: Date,
    availableDates: { start: Date | string; end: Date | string }[]
  ) => {
    const d = normalize(date);

    return availableDates.some((range) => {
      const start = normalize(new Date(range.start));
      const end = normalize(new Date(range.end));
      return d >= start && d <= end;
    });
  };

  // Returns true if the range [checkIn, checkOut] does NOT overlap unavailable ranges
  const isCheckOutDateAllowed = (
    checkIn: Date,
    checkOut: Date,
    availableDates: { start: Date | string; end: Date | string }[]
  ) => {
    const startCheckIn = normalize(checkIn);
    const endCheckOut = normalize(checkOut);

    // If checkOut is before checkIn, immediately disallow
    if (endCheckOut <= startCheckIn) return false;

    // Check for overlap with any unavailable range
    return availableDates.some((range) => {
      const rangeStart = normalize(new Date(range.start));
      const rangeEnd = normalize(new Date(range.end));

      // Allowed if the entire selected range fits inside this available range
      return startCheckIn >= rangeStart && endCheckOut <= rangeEnd;
    });
  };

  const images = selectedHousing.images || [];
  const totalImages = images.length;
  const totalGuests = selectedHousing.maxAdults + selectedHousing.maxKids;

  // Guest display logic (matches navbar)
  const guestCount = guests.adults + guests.kids;
  const dogText =
    guests.dogs === 1
      ? "1 hund"
      : guests.dogs > 1
      ? `${guests.dogs} hundar`
      : "";
  const guestDisplay =
    guestCount > 0 || guests.dogs > 0
      ? `${guestCount} ${guestCount === 1 ? "gäst" : "gäster"}${
          dogText ? `, ${dogText}` : ""
        }`
      : "0 gäster";
  // Price calculations
  const prices = selectedHousing.prices;
  const pricePerNight =
    prices.adult * guests.adults +
    prices.kid * guests.kids +
    prices.animal * guests.dogs +
    prices.housing;
  // Guests modal handlers
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

  // Handle booking (fixed: convert _id to string)
  const handleBooking = () => {
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
    if (!checkInDate || !checkOutDate) {
      alert("Välj inchecknings- och utcheckningsdatum.");
      return;
    }
    const params = new URLSearchParams({
      housingId: selectedHousing._id.toString(), // Convert to string
      startDate: checkInDate.toLocaleDateString("sv-SE"),
      endDate: checkOutDate.toLocaleDateString("sv-SE"),
      adults: guests.adults.toString(),
      kids: guests.kids.toString(),
      dogs: guests.dogs.toString(),
    });
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <div className="text-[#063831] md:bg-white flex-1 ">
      <div className="lg:p-12.5 md:p-6">
        {/* Image grid container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[500px] overflow-hidden relative">
          {/* Big image (left on desktop, full on mobile) */}
          <div className="relative w-full h-[429px] md:h-[500px]">
            <img
              src={images[0] || "/placeholder.jpg"}
              alt={selectedHousing.title}
              className="object-cover w-full h-full md:rounded-lg"
            />
            {/* Back arrow button */}
            <Button
              onClick={() => navigate(-1)} // go back to previous page
              className="absolute top-3 left-3 bg-[#D9D9D9] text-white p-2 rounded-full hover:bg-gray-500 transition md:hidden"
            >
              ←
            </Button>

            {/* Image counter overlay */}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-2 py-1 rounded-md md:hidden">
              1 / {totalImages}
            </div>
          </div>

          {/* Small images grid (hidden on mobile) */}
          <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2 bg-[white] max-h-[500px]">
            {images.slice(1, 5).map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img || "/placeholder.jpg"}
                  alt={`${selectedHousing.title} ${index + 2}`}
                  className="object-cover w-full h-full rounded-lg"
                />
                {/* Optional: overlay number on each small image */}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1 rounded md:hidden">
                  {index + 2} / {totalImages}
                </div>
              </div>
            ))}
            {/* "View all photos" button with 6-dot icon */}
            <Button
              onClick={() => console.log("Show all photos")} // replace with modal or gallery logic
              className="absolute bottom-2 right-2 bg-black/60 text-white px-3 py-1 rounded flex items-center gap-2"
            >
              {/* 6 dots in 2x3 grid */}
              <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-[5px] h-[5px] bg-white rounded-full"
                  />
                ))}
              </div>
              <span className="lg:text-[24px] font-bold md:text-[20px]">
                Visa alla foton
              </span>
            </Button>
          </div>
        </div>
      </div>
      {/* Info section below images */}
      <div className="md:flex md:gap-0">
        {/* Left side: sec 1 and sec 2 */}
        <div className="md:flex-2 md:flex md:flex-col md:gap-0">
          {/* sec 1 */}
          <div className="p-6 md:border-[#ECF39E] md:border bg-[#063831] md:bg-white md:flex-1">
            <div className="bg-[#FFFF] flex flex-col md:flex-row gap-1 md:w-full md:drop-shadow-lg overflow-hidden md:justify-between h-full">
              {/* Title & Location */}
              <div className="md:flex md:flex-col md:w-full md:flex-1">
                <div className="p-6 flex justify-between ">
                  <div>
                    <h1 className="text-[15px] font-bold">
                      {selectedHousing.title}
                    </h1>
                    <p className="text-[15px] mt-1">
                      {selectedHousing.location}
                    </p>
                  </div>
                  <div className="pr-5 md:hidden">
                    <img
                      src={dogFriendly}
                      alt="dog-logo"
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                </div>
                {/* Guests & Rooms */}
                <div className=" bg-[#F4F4F4] p-6">
                  <h3 className="font-bold text-[15px]">Antal rum & gäster</h3>
                  <div className="flex flex-wrap gap-4 text-[#746868] text-[10px] font-normal">
                    <p>
                      <span className="font-semibold">
                        {selectedHousing.bedrooms}
                      </span>{" "}
                      sovrum
                    </p>
                    <p>
                      <span className="font-semibold">
                        {selectedHousing.rooms}
                      </span>{" "}
                      rum
                    </p>
                    <p>
                      <span className="font-semibold">
                        {selectedHousing.beds}
                      </span>{" "}
                      sängar
                    </p>
                    <p>
                      <span className="font-semibold">{totalGuests}</span>{" "}
                      gäster
                    </p>
                    <p>
                      <span className="font-semibold">
                        {selectedHousing.maxAnimals}
                      </span>{" "}
                      hundar
                    </p>
                  </div>
                </div>
                {/* Rating */}
                {selectedHousing.rating && (
                  <div className="flex items-center gap-2 text-yellow-500 p-3">
                    <span>⭐ {selectedHousing.rating.average}</span>
                    <span className="text-[#746868] text-[10px]">
                      ({selectedHousing.rating.count} reviews)
                    </span>
                  </div>
                )}
                {/* Rules */}
                {selectedHousing.rules && selectedHousing.rules.length > 0 && (
                  <div className="bg-[#F4F4F4] p-6 text-[15px]">
                    <h2 className="font-bold mb-2">Regler</h2>
                    <ul className="list-disc list-inside font-normal text-[15px] font-[Open_Sans]">
                      {selectedHousing.rules.map(
                        (rule: string, idx: number) => (
                          <li key={idx}>{rule}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <div className="hidden md:block md:pr-5 md:bg-white md:pl-5 justify-center items-center">
                <img
                  src={dogFriendly}
                  alt="dog-logo"
                  className="h-auto w-auto object-contain"
                />
              </div>
            </div>
          </div>
          {/* sec 2 */}
          <div className="bg-[#063831] border border-solid border-[#ECF39E] p-6 md:bg-white md:flex-1 h-full ">
            <div className="bg-[#F4F4F4] p-6 flex flex-col gap-6  md:drop-shadow-lg h-full">
              {/* Description */}
              {selectedHousing.description && (
                <div className="lg:max-w-[1000px] md:max-w-[250px]">
                  <h2 className="text-[15px] font-bold">
                    Detaljer om boendet & vad som erbjuds
                  </h2>
                  <p className="font-normal text-[15px] font-[Open_Sans] wrap-break-word">
                    {selectedHousing.description}
                  </p>
                </div>
              )}
              {/* Activities */}
              {selectedHousing.nearActivities &&
                selectedHousing.nearActivities.activities.length > 0 && (
                  <div className="flex flex-col max-w-[1000px]">
                    <h2 className="text-[15px] font-bold text-center md:text-left">
                      Aktiviteter
                    </h2>
                    <p className="font-normal text-[15px] font-[Open_Sans] wrap-break-word">
                      {selectedHousing.nearActivities.description}
                    </p>
                    <ul className="list-disc list-inside font-normal text-[15px] font-[Open_Sans]">
                      {selectedHousing.nearActivities.activities.map(
                        (activity, idx) => (
                          <li key={idx}>{activity.name}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        </div>
        {/* Booking section - desktop only*/}
        <div className="hidden md:flex item-start h-fit p-6 border border-[#ECF39E]">
          <div className="bg-[#F4F4F4] flex flex-col gap-4 p-6 drop-shadow-lg">
            <h3 className="font-bold self-center lg:text-[24px] md:text-[20px]">
              Bokning
            </h3>
            <div className="flex justify-between gap-[45px]">
              <div
                className="flex flex-col cursor-pointer"
                onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
              >
                <p className="font-bold lg:text-[24px] md:text-[20px]">
                  INCHECKNING
                </p>
                <span className="text-[16px] text-[#746868]">
                  (
                  {checkInDate
                    ? checkInDate.toLocaleDateString("sv-SE")
                    : "xxxx-xx-xx"}
                  )
                </span>
                {showCheckInCalendar && (
                  <div
                    ref={checkInCalendarRef}
                    className="absolute bg-white top-30 border rounded shadow-lg z-10 mt-2"
                    onClick={(e) => e.stopPropagation()} // Prevent closing on calendar clicks
                  >
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={(date) => {
                        setCheckInDate(date ? normalize(date) : undefined);
                        setShowCheckInCalendar(false);
                        // Reset check-out if it's before new check-in
                        if (date && checkOutDate && checkOutDate <= date) {
                          setCheckOutDate(undefined);
                        }
                      }}
                      disabled={(date) =>
                        // Disable if date itself is unavailable
                        !isDateAvailable(
                          date,
                          selectedHousing.availableDates
                        ) ||
                        // Or if no valid check-out exists after this check-in
                        !selectedHousing.availableDates.some((range) => {
                          const rangeStart = normalize(new Date(range.start));
                          const rangeEnd = normalize(new Date(range.end));
                          const d = normalize(date);
                          return d >= rangeStart && d < rangeEnd; // at least 1 night
                        })
                      } // Disable unavailable dates
                      className="rounded-md border"
                    />
                  </div>
                )}
              </div>
              {/* checkout */}
              <div
                className="flex flex-col cursor-pointer"
                onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
              >
                <p className="font-bold lg:text-[24px] md:text-[20px]">
                  UTCHECKNING
                </p>
                <span className="text-[16px] text-[#746868]">
                  (
                  {checkOutDate
                    ? checkOutDate.toLocaleDateString("sv-SE")
                    : "xxxx-xx-xx"}
                  )
                </span>
                {showCheckOutCalendar && (
                  <div
                    ref={checkOutCalendarRef}
                    className="absolute left-20 top-30 bg-white border rounded shadow-lg z-10 mt-2"
                    onClick={(e) => e.stopPropagation()} // Prevent closing on calendar clicks
                  >
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={(date) => {
                        setCheckOutDate(date ? normalize(date) : undefined);
                        setShowCheckOutCalendar(false);
                      }}
                      disabled={(date) =>
                        !checkInDate || // must have check-in first
                        !isCheckOutDateAllowed(
                          checkInDate,
                          date,
                          selectedHousing.availableDates
                        )
                      }
                      className="rounded-md border"
                    />
                  </div>
                )}
              </div>
            </div>
            <div
              className="flex justify-between cursor-pointer relative"
              onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
            >
              <div>
                <p className="font-bold lg:text-[24px] md:text-[20px]">
                  GÄSTER
                </p>
                <span className="text-[16px] text-[#746868]">
                  {guestDisplay}
                </span>
              </div>
              <div>
                <FaChevronDown size={25} />
              </div>
              {showGuestsDropdown && (
                <div
                  className="absolute top-full left-0 bg-white border rounded shadow-lg z-10 p-4 w-64 mt-2"
                  ref={guestsDropdownRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-xl font-bold mb-4">Lägg till gäster</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Vuxna</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateGuests("adults", -1)}
                          className="bg-gray-200 px-2 rounded"
                        >
                          -
                        </button>
                        <span>{guests.adults}</span>
                        <button
                          onClick={() => updateGuests("adults", 1)}
                          className="bg-gray-200 px-2 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Barn</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateGuests("kids", -1)}
                          className="bg-gray-200 px-2 rounded"
                        >
                          -
                        </button>
                        <span>{guests.kids}</span>
                        <button
                          onClick={() => updateGuests("kids", 1)}
                          className="bg-gray-200 px-2 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Hundar</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateGuests("dogs", -1)}
                          className="bg-gray-200 px-2 rounded"
                        >
                          -
                        </button>
                        <span>{guests.dogs}</span>
                        <button
                          onClick={() => updateGuests("dogs", 1)}
                          className="bg-gray-200 px-2 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  {guestError && (
                    <p className="text-red-600 text-center mt-3">
                      {guestError}
                    </p>
                  )}
                  {animalError && (
                    <p className="text-red-600 text-center mt-1">
                      {animalError}
                    </p>
                  )}
                  <Button
                    onClick={() => setShowGuestsDropdown(false)}
                    className="mt-4 w-full"
                  >
                    Stäng
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <p className="font-bold lg:text-[24px] md:text-[20px]">
                Prisdetaljer
              </p>
              <span className="text-[16px] text-[#746868]">
                {guests.adults}st Vuxen {prices.adult * guests.adults}kr
              </span>
              <span className="text-[16px] text-[#746868]">
                {guests.kids}st Barn {prices.kid * guests.kids}kr
              </span>
              <span className="text-[16px] text-[#746868]">
                {guests.dogs}st Hund {prices.animal * guests.dogs}kr
              </span>
              <span className="text-[16px] text-[#746868]">
                1st Boende {prices.housing}kr
              </span>
            </div>
            <div className="flex flex-col">
              <p className="font-bold lg:text-[24px] md:text-[20px]">
                Pris per natt
              </p>
              <span className="text-[16px] text-[#746868]">
                {pricePerNight} kr
              </span>
            </div>
            <div className="flex self-center">
              <Button
                onClick={handleBooking}
                className="bg-[#ECF39E] text-[#063831] lg:text-[24px] md:text-[20px] font-bold rounded-[5rem] lg:p-10 lg:px-25 md:p-6 md:px-12 hover:bg-[hsl(65,78%,40%)]"
              >
                Reservera
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Location */}
      <div className="bg-[#063831] flex flex-col lg:p-12.5 md:p-6 p-6 items-center text-center gap-[15px] h-auto">
        <h2 className="text-[15px] font-bold text-white mb-2">
          Var du kommer att vara
        </h2>
        <p className="text-white text-[10px]">{selectedHousing.location}</p>
        <HousingMap
          location={selectedHousing.location}
          coords={selectedHousing.coords}
          zoom={13}
          activities={selectedHousing.nearActivities.activities}
          description={selectedHousing.nearActivities.description}
        />
      </div>
      {/* booking section - mobile  */}
      <div className="md:hidden">
        <MobileBookingSection
          selectedHousing={selectedHousing}
          checkInDate={checkInDate}
          setCheckInDate={setCheckInDate}
          checkOutDate={checkOutDate}
          setCheckOutDate={setCheckOutDate}
          guests={guests}
          setGuests={setGuests}
          pricePerNight={pricePerNight}
          handleBooking={handleBooking}
        />
      </div>
    </div>
  );
};
export default HousingDetails;
