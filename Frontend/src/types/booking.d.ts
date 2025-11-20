type CreateBookingBody = {
  housingId: string;
  startDate: string;
  endDate: string;
  guests: {
    adults: number;
    kids: number;
    animals: number;
  };
};

type Booking = {
  _id: string;
  userId: string;
  housingId: {
    // Populated housing object
    _id: string;
    title: string;
    location: string;
    type: string;
    place: string;
    rules: string[];
    prices: { adult: number; kid: number; animal: number; housing: number };
    nearActivities: {
      description: string;
      activities: { name: string; location: string }[];
    };
    bedrooms: number;
    rooms: number;
    beds: number;
    images: string[];
  };
  startDate: string;
  endDate: string;
  guests: {
    adults: number;
    kids: number;
    animals: number;
  };
  totalPrice: number;
  perNightPrice: number;
  createdAt: string;
  updatedAt: string;
};

