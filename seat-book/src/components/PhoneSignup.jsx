import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useUserAuth } from '../context/UserAuthContext';

// Tailwind CSS utility classes
const primaryButtonClass = 'w-32 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700';
const secondaryButtonClass = 'w-full text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 focus:outline-none dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700';
const inputFieldClass = 'w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-500 dark:text-white';

const PhoneSignUp = () => {
  const [number, setNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [flag, setFlag] = useState(false);
  const [confirmObj, setConfirmObj] = useState('');
  const { setUpRecaptcha } = useUserAuth(); // Added setUser to update user context
  const navigate = useNavigate();

  const getOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!number) {
      setError('Please enter a valid number');
      return;
    }
    try {
      const response = await setUpRecaptcha(number);
      setConfirmObj(response);
      setFlag(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('Please enter a valid OTP');
      return;
    }
    try {
      const result = await confirmObj.confirm(otp);
      // Update user context with displayName or phone number
      // setUser({
      //   ...result.user,
      //   displayName: result.user.displayName || result.user.phoneNumber,
      // });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4">
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-white text-center">Phone Number Verification</h2>

        <form onSubmit={getOtp} className={`${!flag ? 'block' : 'hidden'}`}>
          <div className="mb-4">
            <PhoneInput
              defaultCountry="IN"
              value={number}
              onChange={setNumber}
              placeholder="Enter Phone Number"
              className={`${inputFieldClass} mb-4`}
            />
            <div id="recaptcha-container" className="mb-2"></div>
          </div>
          <div className="flex justify-between">
            <Link to="/">
              <button type="button" className={secondaryButtonClass}>Cancel</button>
            </Link>
            <button type="submit" className={primaryButtonClass}>Send OTP</button>
          </div>
        </form>

        <form onSubmit={verifyOtp} className={`${flag ? 'block' : 'hidden'}`}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={`${inputFieldClass} mb-4`}
            />
          </div>
          <div className="flex justify-between">
            <Link to="/">
              <button type="button" className={secondaryButtonClass}>Cancel</button>
            </Link>
            <button type="submit" className={primaryButtonClass}>Verify OTP</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhoneSignUp;
// sdfs 