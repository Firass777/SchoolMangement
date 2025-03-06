import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlelogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });

      console.log("Response:", response.data);
      if (response.data.token && response.data.user) {
        setSuccess("Login successful!");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", response.data.role); 

        // Redirect based on role
        switch (response.data.role) {
          case 'admin':
            navigate("/admindb");
            break;
          case 'teacher':
            navigate("/teacherdb");
            break;
          case 'student':
            navigate("/studentdb");
            break;
          case 'parent':
            navigate("/guardiandb");
            break;
          default:
            navigate("/");
        }
      } else {
        setError("Invalid login response. Please try again.");
      }
    } catch (err) {
      setLoading(false);
      if (err.response) {
        setError(err.response.data.error || "Login failed. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <section className="max-w-md mx-auto bg-white rounded-lg p-8 shadow-lg mt-24" data-aos="fade-up">
      <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
      <form onSubmit={handlelogin}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="username">
            Username
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            className="w-full p-3 border border-gray-300 rounded-md mt-2"
            placeholder="Enter email"
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