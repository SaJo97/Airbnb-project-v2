import { Link } from "react-router";
import LoginForm from "./components/LoginForm";
import { Button } from "@/components/ui/button";
import { FiUser } from "react-icons/fi";

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-svh flex-col gap-4 p-4">
      <div className="flex items-center justify-center w-30 h-30 bg-[#063831] rounded-full">
        <FiUser className="text-white text-2xl" />
      </div>
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Har du inget konto?</p>
        <Link to="/auth/register">
          <Button className="bg-[#ECF39E] text-[#063831] font-bold text-[24px] py-2.5 hover:bg-[hsl(65,78%,55%)] w-full">
            Registrera
          </Button>
        </Link>
      </div>
    </div>
  );
};
export default Login;
