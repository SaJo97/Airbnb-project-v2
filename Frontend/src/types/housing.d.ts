type Housing = {
  _id: number;
  title: string;
  description: string;
  location: string;
  coords: { lat: number; lon: number };
  availableDates: { start: string; end: string }[];
  maxAdults: number;
  maxKids: number;
  maxAnimals: number;
  prices: { adult: number; kid: number; animal: number; housing: number };
  totalPrice: number;
  type: string;
  place: string;
  nearActivities: {
    description: string;
    activities: { name: string; location: string }[];
    coords?: { lat: number; lon: number } | null;
  };
  petFriendly: boolean;
  images: string[];
  isAvailable: boolean;
  rules: string[];
  rating: {
    average: number;
    count: number;
  };
  bedrooms: number;
  rooms: number;
  beds: number;
};

type HousingQuery = {
  location?: string;
  startDate?: string;
  endDate?: string;
  maxAdults?: string;
  maxKids?: string;
  maxAnimals?: string;
  totalPrice?: string;
  type?: string;
  place?: string;
  petFriendly?: string;
  nearActivities?: string;
};

type CreateHousingBody = {
  title: string;
  description: string;
  location: string;
  availableDates: { start: string; end: string }[];
  maxAdults: number;
  maxKids: number;
  maxAnimals: number;
  prices: { adult: number; kid: number; animal: number; housing: number };
  type: string;
  place: string;
  nearActivities: {
    description: string;
    activities: { name: string; location: string }[];
  };
  petFriendly: boolean;
  images: string[];
  rules: string[];
  bedrooms: number;
  rooms: number;
  beds: number;
};
