import { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nin: "",
    password: "",
    role: "student",
    class: "", // Add this line
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register", formData);
      setSuccess("Registration successful! Please log in.");
      setFormData({ name: "", email: "", nin: "", password: "", role: "student", class: "" });
    } catch (error) {
      setError(error.response?.data?.errors || { general: "Something went wrong." });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold text-center mb-4">Register</h2>
      {error && Object.values(error).map((err, index) => (
        <p key={index} className="text-red-500 text-center">{err[0]}</p>
      ))}
      {success && <p className="text-green-500 text-center">{success}</p>}
      <form onSubmit={handleSubmit}>
        {[
          { label: "Name", name: "name", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "National ID Number (NIN)", name: "nin", type: "text", placeholder: "Enter your NIN" },
          { label: "Password", name: "password", type: "password" },
        ].map(({ label, name, type, placeholder }) => (
          <div key={name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
              placeholder={placeholder || ""}
              required
            />
          </div>
        ))}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md mt-2"
            required
          >
            {["student", "teacher", "admin", "parent"].map((role) => (
              <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
            ))}
          </select>
        </div>
        {formData.role === 'student' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
              placeholder="Enter your class"
              required={formData.role === 'student'}
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;