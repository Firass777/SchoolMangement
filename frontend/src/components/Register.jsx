import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const Register = () => {

      const [username , setUsername] = useState ("");
      const [email , setEmail] = useState ("");
      const [password , setPassword] = useState ("");
      const navigate = useNavigate();

      const handleRegister = async (event) => {
        event.preventDefault();
        try {
          await axios.post('/register', {username , email , password});
          setUsername("");
          setEmail("");
          setPassword("");
          navigate("/login");
        } catch(e){
          console.log(e);
        }
      };
  
    return (
      <section className="max-w-md mx-auto bg-white rounded-lg p-8 shadow-lg mt-24" data-aos="fade-up">
        <h2 className="text-3xl font-bold text-center mb-6">Register</h2>
        <form  onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              id="username"
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
              placeholder="Enter username"
            />
          </div>
  
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
            Register
          </button>
        </form>
      </section>
    );
  };
  
  export default Register;
  