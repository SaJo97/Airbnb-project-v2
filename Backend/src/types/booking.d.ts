// Define type for request bodies
type CreateBookingBody = {
 housingId: string;
 startDate: string;
 endDate: string;
 guests: {
   adults: number;
   kids: number;
   animals: number;
 };
}
