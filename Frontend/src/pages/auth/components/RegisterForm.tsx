import { useEffect, useState } from "react";
import FormInput from "./FormInput";
import type { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { register } from "@/store/features/auth/authSlice";
import { useNavigate } from "react-router";

const RegisterForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Local form state
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Select auth state for UI feedback
  const { loading, error, message, success } = useSelector(
    (state: RootState) => state.auth
  );

  // Navigate to home on successful registration
  useEffect(() => {
    if (success) {
      navigate("/"); // Redirect to startpage
    }
  }, [success, navigate]);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    if (!firstname || !lastname || !email || !password) {
      alert("Please fill in all fields."); // Basic validation; you could use a library like react-hook-form for better UX
      return;
    }
    dispatch(register({ firstname, lastname, email, password })); // Dispatch with all credentials
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Förnamn"
        name="firstname"
        id="firstname"
        type="text"
        value={firstname}
        onChange={(e) => setFirstname(e.target.value)} // Make it controlled
        required // Basic HTML validation
      />
      <FormInput
        label="Efternamn"
        name="lastname"
        id="lastname"
        type="text"
        value={lastname}
        onChange={(e) => setLastname(e.target.value)} // Make it controlled
        required // Basic HTML validation
      />
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
        {loading ? "Registrerar..." : "Registrera"}
      </button>
    </form>
  );
};
export default RegisterForm;
