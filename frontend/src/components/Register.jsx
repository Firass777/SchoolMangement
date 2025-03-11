import { useState } from "react";
import axios from "axios";
import { FaSpinner, FaUser, FaEnvelope, FaIdCard, FaLock, FaChalkboardTeacher } from "react-icons/fa"; // Icons
import { motion } from "framer-motion"; // For animations

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nin: "",
    password: "",
    role: "student",
    class: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register", formData);
      setSuccess("Registration successful! Please log in.");
      setFormData({ name: "", email: "", nin: "", password: "", role: "student", class: "" });
    } catch (error) {
      setError(error.response?.data?.errors || { general: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-4">
      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
          <h2 className="text-3xl font-bold text-white">Register</h2>
          <p className="text-sm text-gray-200 mt-2">
            Create an account to get started
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg">
              {Object.values(error).map((err, index) => (
                <p key={index} className="text-sm">{err[0]}</p>
              ))}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/20 text-green-300 rounded-lg">
              <p className="text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* NIN Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                National ID Number (NIN)
              </label>
              <div className="relative">
                <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="nin"
                  value={formData.nin}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your NIN"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Role Select */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <div className="relative">
                <FaChalkboardTeacher className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  required
                >
                  {["student", "teacher", "admin", "parent"].map((role) => (
                    <option key={role} value={role} className="bg-gray-800 text-white">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Class Input (Conditional) */}
            {formData.role === "student" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Class
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your class"
                    required={formData.role === "student"}
                  />
                </div>
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center"
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                "Register"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-500 hover:text-blue-400 transition duration-300"
              >
                Login
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Register;