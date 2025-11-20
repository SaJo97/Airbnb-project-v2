import type { RootState } from "@/store";
import { useSelector } from "react-redux";

const useAuth = () => {
  // Select auth state for UI feedback
  const user = useSelector((state: RootState) => state.auth.email);
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  return { user, isAuthenticated };
};
export default useAuth;
