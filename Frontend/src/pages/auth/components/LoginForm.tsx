import { useDispatch, useSelector } from "react-redux";
import FormInput from "./FormInput";
import type { AppDispatch, RootState } from "@/store";
import { useEffect, useState } from "react";
import { login } from "@/store/features/auth/authSlice";
import { useNavigate } from "react-router";

const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Local form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Select auth state for UI feedback
  const { loading, error, message, success } = useSelector(
    (state: RootState) => state.auth
  );

  // Navigate to home on successful login
  useEffect(() => {
    if (success) {
      navigate("/"); // Redirect to startpage
    }
  }, [success, navigate]);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    if (!email || !password) {
      alert("Please fill in both email and password."); // Basic validation; you could use a library like react-hook-form for better UX
      return;
    }
    dispatch(login({ email, password })); // Dispatch with credentials
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Epost"
        name="email"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)} // Make it controlled
        required // Basic HTML validation
      />
      <FormInput
        label="Lösenord"
        name="password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)} // Make it controlled
        required // Basic HTML validation
      />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </p>
      )}{" "}
      {/* Display error */}
      {success && message && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-2">
          {message}
        </p>
      )}{" "}
      {/* Display success */}
      <button
        className="w-full py-2.5 rounded-lg bg-[#ECF39E] text-[#063831] font-bold
                       hover:bg-[hsl(65,78%,55%)] focus:ring-4 focus:ring-emerald-300
                       transition disabled:opacity-60 disabled:cursor-not-allowed text-[24px]"
        type="submit"
        disabled={loading}
      >
        {loading ? "Loggar in..." : "Logga in"}
      </button>
    </form>
  );
};
export default LoginForm;
