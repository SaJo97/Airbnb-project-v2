import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { getAllHousing } from "@/store/features/housing/housingSlice";
import type { AppDispatch, RootState } from "@/store";
import { IoSearch } from "react-icons/io5";
import { Calendar } from "@/components/ui/calendar"; // Shadcn Calendar

const DesktopFilter = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { housing: housings } = useSelector(
    (state: RootState) => state.housingList
  ); // For location suggestions

  // Filter states
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [guests, setGuests] = useState({ adults: 0, kids: 0, dogs: 0 }); // Start at 0 for default text
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDatePickers, setShowDatePickers] = useState(false);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

  // Refs for click-outside detection
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const datePickersRef = useRef<HTMLDivElement>(null);
  const guestsDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch housings for location suggestions on mount
  useEffect(() => {
    dispatch(getAllHousing());
  }, [dispatch]);

  // Click-outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
      if (
        datePickersRef.current &&
        !datePickersRef.current.contains(event.target as Node)
      ) {
        setShowDatePickers(false);
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

  // Get unique locations from housings for suggestions
  const locationSuggestions = Array.from(
    new Set(housings.map((h) => h.location).filter(Boolean))
  );

  // Handle search/filter
  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (searchLocation) queryParams.append("location", searchLocation);
    if (startDate)
      queryParams.append("startDate", startDate.toLocaleDateString("sv-SE"));
    if (endDate)
      queryParams.append("endDate", endDate.toLocaleDateString("sv-SE"));
    if (guests.adults)
      queryParams.append("maxAdults", guests.adults.toString());
    if (guests.kids) queryParams.append("maxKids", guests.kids.toString());
    if (guests.dogs) queryParams.append("maxAnimals", guests.dogs.toString());

    dispatch(getAllHousing());
    navigate(`/?${queryParams.toString()}`);
  };

  // Guests handlers
  const updateGuests = (type: keyof typeof guests, delta: number) => {
    setGuests((prev) => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
  };

  // Calculate guest display with singular/plural
  const totalGuests = guests.adults + guests.kids;
  const dogText =
    guests.dogs === 1
      ? "1 hund"
      : guests.dogs > 1
      ? `${guests.dogs} hundar`
      : "";
  const guestText =
    totalGuests > 0 || guests.dogs > 0
      ? `${totalGuests} ${totalGuests === 1 ? "gäst" : "gäster"}${
          dogText ? `, ${dogText}` : ""
        }`
      : "";

  // Format dates for display
  const formatDate = (date: Date | undefined) =>
    date ? date.toLocaleDateString("sv-SE") : "";

  return (
    <>
      <ul className="hidden xl:flex justify-between items-center gap-[15px] text-[#063831] bg-[#F4F4F4] rounded-[3rem] px-[35px] py-2 font-bold m-3 shadow-2xl w-[732px] h-fit">
        {/* Var - Location */}
        <li className="flex flex-col leading-tight m-0 lg:text-[24px] md:text-[18px] cursor-pointer hover:bg-[#ECF39E] p-2 rounded relative w-fit max-w-[100px]">
          <span onClick={() => setShowLocationDropdown(!showLocationDropdown)}>
            Var
          </span>
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => {
              setSearchLocation(e.target.value);
              setShowLocationDropdown(true);
            }} // Update value and show dropdown on change
            onFocus={() => setShowLocationDropdown(true)} // Show dropdown on focus
            placeholder="Sök destination"
            className="text-[16px] hidden lg:flex text-[#746868] font-normal leading-tight m-0 bg-transparent border-none outline-none overflow-x-auto whitespace-nowrap max-w-full cursor-text" // Styled as text, editable, with scroll
          />
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => {
              setSearchLocation(e.target.value);
              setShowLocationDropdown(true);
            }}
            onFocus={() => setShowLocationDropdown(true)}
            placeholder="Destinationer"
            className="text-[16px] lg:hidden text-[#746868] font-normal leading-tight m-0 bg-transparent border-none outline-none overflow-x-auto whitespace-nowrap max-w-full cursor-text"
          />
          {showLocationDropdown && (
            <div
              ref={locationDropdownRef}
              className="absolute top-full left-0 bg-white border rounded shadow-lg z-10 w-48 mt-1"
            >
              <ul className="max-h-32 overflow-y-auto">
                {locationSuggestions
                  .filter((loc) =>
                    loc.toLowerCase().includes(searchLocation.toLowerCase())
                  )
                  .map((loc, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setSearchLocation(loc);
                        setShowLocationDropdown(false);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {loc}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </li>
        <span>|</span>
        {/* Checka in / Checka ut - Dates */}
        <li className="flex flex-col leading-tight m-0 lg:text-[24px] md:text-[18px] cursor-pointer hover:bg-[#ECF39E] p-2 rounded relative">
          <span onClick={() => setShowDatePickers(!showDatePickers)}>
            Datum
          </span>
          <p className="text-[16px] hidden lg:flex text-[#746868] font-normal leading-tight m-0">
            {startDate ? formatDate(startDate) : "Checka in"} -{" "}
            {endDate ? formatDate(endDate) : "Checka ut"}
          </p>
          <p className="text-[16px] lg:hidden text-[#746868] font-normal leading-tight m-0">
            {startDate || endDate
              ? `${formatDate(startDate)} - ${formatDate(endDate)}`
              : "Datum"}
          </p>
          {showDatePickers && (
            <div
              ref={datePickersRef}
              className="absolute top-full right-[-200px] bg-white border rounded shadow-lg z-10 p-4 flex gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Checka in
                </label>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    if (date && (!endDate || date >= endDate))
                      setEndDate(undefined);
                  }}
                  className="rounded-md border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Checka ut
                </label>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    if (date && startDate && date <= startDate)
                      setStartDate(undefined);
                  }}
                  disabled={(date) => (startDate ? date <= startDate : false)} // Disable dates <= startDate
                  className="rounded-md border"
                />
              </div>
            </div>
          )}
        </li>
        <span>|</span>
        {/* Vem - Guests */}
        <li className="flex flex-col leading-tight m-0 lg:text-[24px] md:text-[18px] p-2 rounded relative hover:bg-[#ECF39E]">
          <span
            className="cursor-pointer"
            onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
          >
            Vem
          </span>
          <p className="text-[16px] hidden lg:flex text-[#746868] font-normal leading-tight m-0">
            {guestText || "Lägg till gäster"}
          </p>
          <p className="text-[16px] lg:hidden text-[#746868] font-normal leading-tight m-0">
            {guestText || "Gäster"}
          </p>
          {showGuestsDropdown && (
            <div
              ref={guestsDropdownRef}
              className="absolute top-full left-0 bg-white border rounded shadow-lg z-10 p-4 w-64 mt-1"
            >
              <h3 className="text-lg font-semibold mb-4">Lägg till gäster</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Vuxna</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateGuests("adults", -1)}
                      className="bg-[#ECF39E] px-2 rounded cursor-pointer"
                    >
                      -
                    </button>
                    <span>{guests.adults}</span>
                    <button
                      onClick={() => updateGuests("adults", 1)}
                      className="bg-[#ECF39E] px-2 rounded cursor-pointer"
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
                      className="bg-[#ECF39E] px-2 rounded cursor-pointer"
                    >
                      -
                    </button>
                    <span>{guests.kids}</span>
                    <button
                      onClick={() => updateGuests("kids", 1)}
                      className="bg-[#ECF39E] px-2 rounded cursor-pointer"
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
                      className="bg-[#ECF39E] px-2 rounded cursor-pointer"
                    >
                      -
                    </button>
                    <span>{guests.dogs}</span>
                    <button
                      onClick={() => updateGuests("dogs", 1)}
                      className="bg-[#ECF39E] px-2 rounded cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowGuestsDropdown(false)}
                className="mt-4 bg-[#063831] text-[#ECF39E] px-4 py-2 rounded w-full cursor-pointer hover:bg-[hsl(172,81%,15%)]"
              >
                Klar
              </button>
            </div>
          )}
        </li>
        <span
          className="bg-[#ECF39E] rounded-4xl p-3 cursor-pointer hover:bg-[#d4e99e]"
          onClick={handleSearch}
        >
          <IoSearch className="lg:size-[25px] md:size-5" />
        </span>
      </ul>
    </>
  );
};

export default DesktopFilter;
