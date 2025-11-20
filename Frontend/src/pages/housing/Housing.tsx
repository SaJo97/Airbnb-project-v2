import House from "./components/House";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  getAllHousing,
  setCurrentFilters,
} from "@/store/features/housing/housingSlice";
import { useSearchParams } from "react-router";

const Housing = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams(); // Get URL params

  // fetch housing data
  useEffect(() => {
    dispatch(getAllHousing());
  }, [dispatch]);

  // typed selector
  const { housing, error, loading } = useSelector(
    (state: RootState) => state.housingList
  );

  // Filter housings based on URL params
  const filteredHousings = housing.filter((house) => {
    const location = searchParams.get("location");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const maxAdults = searchParams.get("maxAdults");
    const maxKids = searchParams.get("maxKids");
    const maxAnimals = searchParams.get("maxAnimals");
    const totalPrice = searchParams.get("totalPrice");
    const type = searchParams.get("type");
    const place = searchParams.get("place");
    const petFriendly = searchParams.get("petFriendly");

    // Filter by location (case-insensitive match)
    if (
      location &&
      !house.location.toLowerCase().includes(location.toLowerCase())
    ) {
      return false;
    }

    // Filter by availableDates overlap
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const hasOverlap = house.availableDates.some((range) => {
        const rangeStart = new Date(range.start);
        const rangeEnd = new Date(range.end);
        return start <= rangeEnd && end >= rangeStart;
      });
      if (!hasOverlap) return false;
    }
    // Filter by max guests
    if (maxAdults && house.maxAdults < Number(maxAdults)) return false;
    if (maxKids && house.maxKids < Number(maxKids)) return false;
    if (maxAnimals && house.maxAnimals < Number(maxAnimals)) return false;
    // Filter by totalPrice (range, e.g., ?totalPrice=100-300)
    if (totalPrice) {
      const parts = totalPrice.split("-").filter((p) => p.trim() !== "");
      if (parts.length === 2) {
        const min = Number(parts[0]);
        const max = Number(parts[1]);
        if (house.totalPrice < min || house.totalPrice > max) return false;
      }
    }

    // Filter by type/place (exact match)
    if (type && house.type !== type) return false;
    if (place && house.place !== place) return false;
    // Filter by petFriendly
    if (petFriendly && house.petFriendly !== (petFriendly === "true"))
      return false;
    return true;
  });

  // Store current filters in Redux after filtering
  useEffect(() => {
    const filters = {
      location: searchParams.get("location") || "",
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      maxAdults: searchParams.get("maxAdults") || "",
      maxKids: searchParams.get("maxKids") || "",
      maxAnimals: searchParams.get("maxAnimals") || "",
      totalPrice: searchParams.get("totalPrice") || "",
      type: searchParams.get("type") || "",
      place: searchParams.get("place") || "",
      petFriendly: searchParams.get("petFriendly") || "",
    };
    dispatch(setCurrentFilters(filters));
  }, [searchParams, dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <>
      <h1 className="font-bold text-2xl mb-0 pl-7 pt-3 text-[#063831]">
        Alla boenden
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
        {filteredHousings.length > 0 ? (
          filteredHousings.map((house: Housing) => (
            <div key={house._id}>
              <House house={house} />
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Inga boenden matchar dina filter.
          </p>
        )}
      </div>
    </>
  );
};
export default Housing;
