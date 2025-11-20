import { Button } from "@/components/ui/button";
import type { AppDispatch, RootState } from "@/store";
import { logout } from "@/store/features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";

const Account = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { firstname, lastname, email, role } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };
  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg md:mt-12 mt-3">
      <h1 className="text-2xl font-bold mb-4">Konto</h1>
      <p className="mb-2">
        Hej, {firstname} {lastname}!
      </p>
      <p className="mb-4">Epost: {email}</p>
      <p className="mb-4">Roll: {role}</p>

      <div className="space-y-2">
        {/* <Link to="/my-housings">
          <Button className="w-full mb-2">My Housings</Button>
        </Link> */}
        <Link to="/bookings">
          <Button className="w-full mb-2">Bokningshistorik</Button>
        </Link>
        <Button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600"
        >
          Logga ut
        </Button>
      </div>
    </div>
  );
};
export default Account;
