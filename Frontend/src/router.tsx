import { createBrowserRouter } from "react-router";
import RootLayout from "./layout/RootLayout";
import NotFound from "./utils/NotFound";
import Housing from "./pages/housing/Housing";
import HousingDetails from "./pages/housing/HousingDetails";
import AuthLayout from "./layout/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Booking from "./pages/booking/Booking";
import ProtectedRoute from "./components/ProtectedRoute";
import Account from "./pages/profile/Account";
import BookingHistory from "./pages/profile/BookingHistory";
import BookingDetails from "./pages/booking/BookingDetails";
import AdminLayout from "./layout/AdminLayout";
import Admin from "./pages/Admin/Admin";
import Users from "./pages/Admin/Users";
import UpdateHousing from "./pages/profile/UpdateHousing";
import CreateHousing from "./pages/profile/CreateHousing";
import MyHousings from "./pages/profile/MyHousings";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Housing />,
      },
      {
        path: "house/:houseId",
        element: <HousingDetails />,
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: "auth",
            element: <Login />,
          },
          {
            path: "auth/register",
            element: <Register />,
          },
        ],
      },
      {
        path: "account",
        element: (
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-housings",
        element: (
          <ProtectedRoute>
            <MyHousings />
          </ProtectedRoute>
        ),
      },
      {
        path: "bookings",
        element: (
          <ProtectedRoute>
            <BookingHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "/booking/:bookingId",
        element: (
          <ProtectedRoute>
            <BookingDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "createhousing",
        element: (
          // makers
          <ProtectedRoute>
            <CreateHousing />
          </ProtectedRoute>
        ),
      },
      {
        path: "update/:housingId",
        element: (
          // makers
          <ProtectedRoute>
            <UpdateHousing />
          </ProtectedRoute>
        ),
      },
      {
        path: "checkout",
        // logged in users
        element: (
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: (
              // req admin på protected role
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: "admin/users",
        element: (
          // req role admin
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
