import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // For displaying login errors
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(""); // Reset error message

    try {
      const response = await axios.post(
        "/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      // Store the token in localStorage
      localStorage.setItem("token", response.data.token);

      setEmail("");
      setPassword("");
      navigate("/"); // Redirect to home after login
    } catch (e) {
      console.error(e);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <section className="max-w-md mx-auto bg-white rounded-lg p-8 shadow-lg mt-24">
      <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            className="w-full p-3 border border-gray-300 rounded-md mt-2"
            placeholder="Enter email"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            className="w-full p-3 border border-gray-300 rounded-md mt-2"
            placeholder="Enter password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition duration-300"
        >
          Login
        </button>
      </form>
    </section>
  );
};

export default Login;
