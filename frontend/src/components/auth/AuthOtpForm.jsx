import { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const AuthOtpForm = ({ registrationData, onSuccess, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if current field is filled
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current field is empty
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.keys(registrationData).forEach(key => {
        if (key === 'certificateFile') {
          if (registrationData[key]) formData.append('certificate', registrationData[key]);
        } else {
          formData.append(key, registrationData[key]);
        }
      });
      formData.append('otp', otpCode);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || 'OTP verification failed');
        return;
      }
      toast.success(result.message || 'Registered successfully!');
      onSuccess(result.user);
    } catch (error) {
      toast.error('An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-[28px] tracking-[-0.01em] font-serif font-bold text-[#062F26] mb-1.5">Verify Email</h2>
        <p className="text-sm text-slate-600">
          Enter the 6-digit code sent to<br/>
          <span className="font-semibold text-[#062F26]">{registrationData?.email || 'your email'}</span>
        </p>
      </div>

      <form className="w-full space-y-6" onSubmit={onSubmit}>
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              ref={(el) => (inputRefs.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold border-2 border-slate-200 rounded-lg focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 outline-none transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#062F26] hover:bg-[#04201a] text-white font-semibold py-2.5 lg:py-3 rounded-md shadow-[0_4px_15px_rgba(6,47,38,0.15)] transition-all flex items-center justify-center text-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Icon icon="eos-icons:loading" className="w-5 h-5 mr-2" />
          ) : null}
          {isLoading ? 'Verifying...' : 'Verify & Create Account'}
        </button>

        <div className="text-center mt-4">
           <button type="button" onClick={onCancel} className="text-sm text-slate-500 hover:text-[#062F26] underline">
             Cancel and go back
           </button>
        </div>
      </form>
    </div>
  );
};

export default AuthOtpForm;
