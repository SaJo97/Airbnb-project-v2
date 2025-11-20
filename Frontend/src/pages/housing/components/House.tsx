import { Link } from "react-router";
import petlogo from "@/assets/pets.svg";

interface HouseProps {
  house: Housing;
}
const House = ({ house }: HouseProps) => {
  const petFriendly = petlogo;
  if (house.petFriendly) {
    petFriendly;
  }
  return (
    <Link
      to={`/house/${house._id}`}
      className="flex flex-row sm:flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden text-[#063831]"
    >
      {/*Image section */}
      <div className="w-1/2 sm:w-full h-44 sm:h-56 bg-gray-100 flex items-center justify-center">
        <img
          src={house.images?.[0] || "/placeholder.jpg"}
          alt={house.title}
          className="object-cover w-full h-full"
        />
      </div>

      {/*Info section */}
      <div className="w-1/2 sm:w-full p-4 flex flex-col justify-between">
        <div>
          {/* Title + Pet icon row */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold hover:underline line-clamp-1">
              {house.title}
            </h2>
            {house.petFriendly && (
              <img
                src={petlogo}
                alt="Pet friendly"
                className="w-5 h-5 ml-2 shrink-0"
                title="Husdjur tillåtna"
              />
            )}
          </div>

          <p className="mb-1 truncate text-[10px]">{house.location}</p>
          <p className="font-normal text-[10px] mb-3">
            {house.totalPrice} kr/natt
          </p>

          {/* description visible only on smaller screens */}
          <p className="text-sm sm:hidden line-clamp-3">{house.description}</p>
        </div>
      </div>
    </Link>
  );
};
export default House;
