import useAuth from "@/hooks/useAuth";
// import type { RootState } from "@/store"
import type { PropsWithChildren } from "react";
// import { useSelector } from "react-redux"
import { Navigate } from "react-router";

const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { isAuthenticated } = useAuth();
  // const { role } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  return children;
};
export default ProtectedRoute;
