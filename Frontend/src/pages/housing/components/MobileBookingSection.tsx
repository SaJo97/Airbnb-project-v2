import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import Modal from "react-modal";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

type MobileBookingSectionProps = {
  selectedHousing: any;
  checkInDate: Date | undefined;
  setCheckInDate: (date: Date | undefined) => void;
  checkOutDate: Date | undefined;
  setCheckOutDate: (date: Date | undefined) => void;
  guests: { adults: number; kids: number; dogs: number };
  setGuests: (guests: { adults: number; kids: number; dogs: number }) => void;
  pricePerNight: number;
  handleBooking: () => void;
};

const MobileBookingSection = ({
  selectedHousing,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  guests,
  setGuests,
  pricePerNight,
  handleBooking,
}: MobileBookingSectionProps) => {
  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  const [showDetails, setShowDetails] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showGuestsModal, setShowGuestsModal] = useState(false);

  const [tempCheckInDate, setTempCheckInDate] = useState<Date | undefined>(
    checkInDate
  );
  const [tempCheckOutDate, setTempCheckOutDate] = useState<Date | undefined>(
    checkOutDate
  );
  const [tempGuests, setTempGuests] = useState(guests);

  const [guestError, setGuestError] = useState("");
  const [animalError, setAnimalError] = useState("");

  // Helper: normalize to ignore time
  const normalize = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // Check if a date is within available ranges
  const isDateAvailable = (date: Date) => {
    const d = normalize(date);
    return selectedHousing.availableDates.some((range: any) => {
      const start = normalize(new Date(range.start));
      const end = normalize(new Date(range.end));
      return d >= start && d <= end;
    });
  };
  // Check if check-out date is valid for selected check-in
  const isCheckOutDateAllowed = (checkIn: Date, checkOut: Date) => {
    const startCheckIn = normalize(checkIn);
    const endCheckOut = normalize(checkOut);
    if (endCheckOut <= startCheckIn) return false;
    return selectedHousing.availableDates.some((range: any) => {
      const rangeStart = normalize(new Date(range.start));
      const rangeEnd = normalize(new Date(range.end));
      return startCheckIn >= rangeStart && endCheckOut <= rangeEnd;
    });
  };

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

  const updateTempGuests = (type: keyof typeof tempGuests, delta: number) => {
    setTempGuests((prev) => {
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

  const cancelModal = () => {
    setTempCheckInDate(checkInDate);
    setTempCheckOutDate(checkOutDate);
    setTempGuests(guests);
    setShowCheckInModal(false);
    setShowCheckOutModal(false);
    setShowGuestsModal(false);
  };

  return (
    <div className="md:hidden w-full">
      {/* COLLAPSED VIEW - Sticky bar that moves with scroll and sticks to bottom */}
      {!showDetails && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#063831] p-4 shadow-2xl z-1000 border border-[#ECF39E]">
          <div className="flex flex-col items-center">
            <Button
              onClick={() => setShowDetails(true)}
              className="bg-[#ECF39E] hover:bg-[hsl(65,78%,50%)] text-[#063831] p-2 rounded-full drop-shadow-xl h-[30px] w-[30px]"
            >
              <FaChevronUp size={15} />
            </Button>
          </div>

          <div className="mt-3 w-full flex flex-col items-center">
            <p className="text-[11px] text-white/80 font-normal bg-[#0f544c] p-1 rounded-full px-5">
              {pricePerNight} kr/natt
            </p>

            <Button
              onClick={handleBooking}
              className="w-[60%] bg-[#ECF39E] text-[#063831] font-bold py-3 rounded-full mt-3 hover:bg-[hsl(65,78%,50%)]"
            >
              Reservera
            </Button>
          </div>
        </div>
      )}

      {/* EXPANDED VIEW */}
      {showDetails && (
        <div className="fixed inset-0 bg-[#063831] z-1000 flex justify-center items-center overflow-y-auto p-4">
          {/* Center Card */}
          <div className="bg-[#F4F4F4] w-[90%] rounded-xl p-5 shadow-xl overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">Bokning</h3>
              <Button
                onClick={() => setShowDetails(false)}
                className="bg-[#ECF39E] text-[#063831] p-2 rounded-full hover:bg-[hsl(65,78%,50%)]"
              >
                <FaChevronDown size={20} />
              </Button>
            </div>

            {/* INPUTS */}
            <div className="space-y-4">
              {/* Incheckning */}
              <div>
                <p className="font-semibold">Incheckning</p>
                <p className="text-sm text-gray-600">
                  {checkInDate
                    ? checkInDate.toLocaleDateString("sv-SE")
                    : "Välj datum"}
                </p>
                <Button
                  onClick={() => setShowCheckInModal(true)}
                  variant="outline"
                  className="mt-1 w-full"
                >
                  Ändra
                </Button>
              </div>

              {/* Utcheckning */}
              <div>
                <p className="font-semibold">Utcheckning</p>
                <p className="text-sm text-gray-600">
                  {checkOutDate
                    ? checkOutDate.toLocaleDateString("sv-SE")
                    : "Välj datum"}
                </p>
                <Button
                  onClick={() => setShowCheckOutModal(true)}
                  variant="outline"
                  className="mt-1 w-full"
                >
                  Ändra
                </Button>
              </div>

              {/* Guests */}
              <div>
                <p className="font-semibold">Antal gäster</p>
                <p className="text-sm text-gray-600">{guestDisplay}</p>
                <Button
                  onClick={() => setShowGuestsModal(true)}
                  variant="outline"
                  className="mt-1 w-full"
                >
                  Ändra
                </Button>
              </div>

              {/* Price Details */}
              <div>
                <p className="font-semibold">Prisdetaljer</p>
                <p className="text-sm text-gray-600">
                  {guests.adults} vuxna{" "}
                  {selectedHousing.prices.adult * guests.adults} kr
                </p>
                <p className="text-sm text-gray-600">
                  {guests.kids} barn {selectedHousing.prices.kid * guests.kids}{" "}
                  kr
                </p>
                <p className="text-sm text-gray-600">
                  {guests.dogs} hundar{" "}
                  {selectedHousing.prices.animal * guests.dogs} kr
                </p>
                <p className="text-sm text-gray-600">
                  Boende {selectedHousing.prices.housing} kr
                </p>
              </div>

              {/* Price per night */}
              <div>
                <p className="font-semibold">Pris per natt</p>
                <p className="text-sm text-gray-600">{pricePerNight} kr</p>
              </div>

              {/* Reserve Button */}
              <Button
                onClick={handleBooking}
                className="w-full bg-[#ECF39E] text-[#063831] font-bold py-3 rounded-lg mt-3 hover:bg-[hsl(65,78%,50%)]"
              >
                Reservera
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* Check-In */}
      <Modal
        isOpen={showCheckInModal}
        onRequestClose={cancelModal}
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]"
      >
        <h4 className="text-lg font-semibold mb-4">Välj incheckningsdatum</h4>
        <Calendar
          mode="single"
          selected={tempCheckInDate}
          onSelect={setTempCheckInDate}
          disabled={(date) => {
            const d = normalize(date);
            // Disable if date itself is unavailable
            if (!isDateAvailable(d)) return true;

            // Disable if there is no valid check-out after this check-in
            return !selectedHousing.availableDates.some((range: any) => {
              const rangeStart = normalize(new Date(range.start));
              const rangeEnd = normalize(new Date(range.end));
              return d >= rangeStart && d < rangeEnd; // at least 1 night
            });
          }}
          className="rounded-md border"
        />
        <div className="flex gap-2 mt-4">
          <Button onClick={cancelModal} variant="outline" className="flex-1">
            Avbryt
          </Button>
          <Button
            onClick={() => {
              setCheckInDate(tempCheckInDate);
              if (
                tempCheckInDate &&
                checkOutDate &&
                checkOutDate <= tempCheckInDate
              ) {
                setCheckOutDate(undefined); // reset if invalid
              }
              setShowCheckInModal(false);
            }}
            className="flex-1"
          >
            Spara
          </Button>
        </div>
      </Modal>

      {/* Check-Out */}
      <Modal
        isOpen={showCheckOutModal}
        onRequestClose={cancelModal}
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]"
      >
        <h4 className="text-lg font-semibold mb-4">Välj utcheckningsdatum</h4>
        <Calendar
          mode="single"
          selected={tempCheckOutDate}
          onSelect={setTempCheckOutDate}
          disabled={(date) => {
            const d = normalize(date);
            return (
              !tempCheckInDate || // must have check-in first
              !isCheckOutDateAllowed(tempCheckInDate, d)
            );
          }}
          className="rounded-md border"
        />
        <div className="flex gap-2 mt-4">
          <Button onClick={cancelModal} variant="outline" className="flex-1">
            Avbryt
          </Button>
          <Button
            onClick={() => {
              setCheckOutDate(tempCheckOutDate);
              setShowCheckOutModal(false);
            }}
            className="flex-1"
          >
            Spara
          </Button>
        </div>
      </Modal>

      {/* Guests */}
      <Modal
        isOpen={showGuestsModal}
        onRequestClose={cancelModal}
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]"
      >
        <h4 className="text-lg font-semibold mb-4">Välj antal gäster</h4>

        <div className="space-y-4">
          {["adults", "kids", "dogs"].map((key) => (
            <div key={key} className="flex justify-between items-center">
              <span>
                {key === "adults"
                  ? "Vuxna"
                  : key === "kids"
                  ? "Barn"
                  : "Hundar"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateTempGuests(key as any, -1)}
                  className="bg-gray-200 px-2 rounded"
                >
                  -
                </button>
                <span>{tempGuests[key as keyof typeof tempGuests]}</span>
                <button
                  onClick={() => updateTempGuests(key as any, 1)}
                  className="bg-gray-200 px-2 rounded"
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

        <div className="flex gap-2 mt-4">
          <Button onClick={cancelModal} variant="outline" className="flex-1">
            Avbryt
          </Button>
          <Button
            onClick={() => {
              setGuests(tempGuests);
              setShowGuestsModal(false);
            }}
            className="flex-1"
          >
            Spara
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MobileBookingSection;
