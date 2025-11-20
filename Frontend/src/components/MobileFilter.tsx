import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { getAllHousing } from "@/store/features/housing/housingSlice";
import type { AppDispatch, RootState } from "@/store";
import { IoSearch } from "react-icons/io5";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const MobileFilter = () => {
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
  const [showDropdown, setShowDropdown] = useState(false);

  // Refs for click-outside detection
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch housings for location suggestions on mount
  useEffect(() => {
    dispatch(getAllHousing());
  }, [dispatch]);

  // Click-outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
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
    setShowDropdown(false); // Close dropdown after search
  };

  // Guests handlers
  const updateGuests = (type: keyof typeof guests, delta: number) => {
    setGuests((prev) => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
  };

  return (
    <>
      {/* Mobile menu (visible below md) */}
      <div className="flex items-center justify-center text-center xl:hidden h-[35px] bg-[#F4F4F4] rounded-3xl px-7 w-fit self-center text-[#063831] font-bold mb-3 shadow-2xl gap-1 md:px-20 md:py-0 relative">
        <span
          className="bg-[#ECF39E] rounded-2xl p-[5px] cursor-pointer"
          onClick={handleSearch}
        >
          <IoSearch size={15} />
        </span>
        <p
          className="text-[15px] md:text-[20px] self-auto cursor-pointer hover:bg-[#ECF39E] hover:rounded-xl hover:px-px"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          Påbörja din sökning
        </p>

        {/* Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-8 center bg-white border rounded shadow-lg z-10 p-4 w-80 mt-2 overflow-x-auto overflow-scroll max-h-[500px] flex flex-col items-center"
          >
            {/* Var - Location */}
            <div className="mb-4">
              <label className="block text-[16px] font-bold mb-2">Var</label>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Sök destination"
                className="w-full p-2 border rounded"
              />
              {locationSuggestions.filter((loc) =>
                loc.toLowerCase().includes(searchLocation.toLowerCase())
              ).length > 0 && (
                <ul className="max-h-32 overflow-y-auto mt-1 border rounded">
                  {locationSuggestions
                    .filter((loc) =>
                      loc.toLowerCase().includes(searchLocation.toLowerCase())
                    )
                    .map((loc, idx) => (
                      <li
                        key={idx}
                        onClick={() => setSearchLocation(loc)}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {loc}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Datum - Dates */}
            <div className="mb-4">
              <label className="block text-[16px] font-bold mb-2">Datum</label>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs mb-1">Incheckning</label>
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
                  <label className="block text-xs mb-1">Utcheckning</label>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => (startDate ? date <= startDate : false)}
                    className="rounded-md border"
                  />
                </div>
              </div>
            </div>

            {/* Vem - Guests */}
            <div className="mb-4">
              <label className="block text-[16px] font-bold mb-2">Vem</label>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Vuxna</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateGuests("adults", -1)}
                      className="bg-[#ECF39E] px-2 rounded"
                    >
                      -
                    </button>
                    <span>{guests.adults}</span>
                    <button
                      onClick={() => updateGuests("adults", 1)}
                      className="bg-[#ECF39E] px-2 rounded"
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
                      className="bg-[#ECF39E] px-2 rounded"
                    >
                      -
                    </button>
                    <span>{guests.kids}</span>
                    <button
                      onClick={() => updateGuests("kids", 1)}
                      className="bg-[#ECF39E] px-2 rounded"
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
                      className="bg-[#ECF39E] px-2 rounded"
                    >
                      -
                    </button>
                    <span>{guests.dogs}</span>
                    <button
                      onClick={() => updateGuests("dogs", 1)}
                      className="bg-[#ECF39E] px-2 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Klar - Close Button */}
            <Button
              onClick={() => {
                handleSearch();
                setShowDropdown(false);
              }}
              className="w-full bg-[#ECF39E] text-[#063831] font-bold hover:bg-[hsl(65,78%,50%)]"
            >
              Sök
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileFilter;
