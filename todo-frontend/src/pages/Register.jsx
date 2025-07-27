import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState();
  const [number, setNumber] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [otp, setOtp] = useState();
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);


    const resentOtp = () => {
    const OtpPayload = {
      email: email
      
    };
    axios.post('http://localhost:9090/api/users/resend-otp',OtpPayload)
    .then((res)=>{
     setErrorMessage('');
    })
    .catch((err) => {
        if (err.response && err.response.data && err.response.data.error) {
          setErrorMessage(err.response.data.error);
        } else {
          setErrorMessage('An unexpected error occurred.');
        }
      });
  };

  const verifyEmailWithOtp = () => {
    const OtpPayload = {
      email: email,
      otp: otp
    };
    axios.post('http://localhost:9090/api/users/verify-otp', OtpPayload)
      .then((res) => {
        setErrorMessage('');
        navigate('/login'); 
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.error) {
          setErrorMessage(err.response.data.error);
        } else {
          setErrorMessage('An unexpected error occurred.');
        }
      });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: name,
      number: number,
      email: email,
      password: password
    };
    axios.post('http://localhost:9090/api/users/register', payload)
      .then((res) => {
        
        setErrorMessage('');
       
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.error) {
          setErrorMessage(err.response.data.error);
        } else {
          setErrorMessage('An unexpected error occurred.');
        }
      });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-purple-700 text-center mb-6">Register</h2>

        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-sm text-center mb-4">
            {errorMessage}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <input
            type="tel"
            name="phone"
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Phone Number"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <input
            type="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border rounded pr-10 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <div
              onClick={togglePassword}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              name="otp"
              placeholder="Enter OTP"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <button
              type="button"
             onClick={handleSubmit}
              className="bg-white text-purple-700 font-semibold px-4 py-2 rounded-md shadow hover:bg-purple-100 transition"
            >
              Send OTP
            </button>
            <button
             type="button"
             onClick={resentOtp}
            className="bg-white text-purple-700 font-semibold px-4 py-2 rounded-md shadow hover:bg-purple-100 transition"
            > Resend</button>
          </div>

          <button
            type="button"
            onClick={verifyEmailWithOtp}
            className="w-full bg-white text-purple-700 font-semibold py-2 rounded-md shadow hover:bg-purple-100 transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
