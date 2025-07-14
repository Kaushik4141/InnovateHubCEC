import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface FormData {
  fullname: string;
  usn: string;
  year: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface FormErrors {
  fullname?: string;
  usn?: string;
  year?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

const SignupForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    fullname: '',
    usn: '',
    year: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const validate = () => {
    const errs: FormErrors = {};
    if (!formData.fullname.trim()) errs.fullname = 'Full name is required';
    if (!formData.usn.trim()) errs.usn = 'USN is required';
    if (!formData.year) errs.year = 'Please select your graduation year';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) errs.email = 'Invalid email address';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 8)
      errs.password = 'Password must be at least 8 characters long';
    if (!formData.confirmPassword)
      errs.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    if (!formData.terms) errs.terms = 'You must agree to the terms and conditions';
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      const payload = {
        fullname: formData.fullname,
        usn: formData.usn,
        year: Number(formData.year),
        email: formData.email,
        password: formData.password,
      };

      await axios.post('/api/v1/users/register', payload, { withCredentials: true });
      setSuccess(true);
      setTimeout(() => navigate('/signin'), 2000);
    } catch (error: any) {
      console.error(error);
      setErrors({ general: error.response?.data?.message || 'Something went wrong' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111922] p-6" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#243447] p-8 rounded-lg space-y-6"
      >
        <h2 className="text-2xl font-bold text-white text-center">
          Create your InnovativeHubCEC account
        </h2>

        {errors.general && (
          <p className="text-red-500 text-sm text-center">{errors.general}</p>
        )}
        {success && (
          <p className="text-green-500 text-sm text-center">
            Account created successfully! Redirecting...
          </p>
        )}

        <div>
          <input
            name="fullname"
            type="text"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={handleChange}
            className={`w-full p-4 rounded-lg bg-[#111922] text-white placeholder-[#93acc8] focus:outline-none ${
              errors.fullname ? 'border border-red-500' : ''
            }`}
          />
          {errors.fullname && <p className="text-red-500 text-sm">{errors.fullname}</p>}
        </div>

        <div>
          <input
            name="usn"
            type="text"
            placeholder="Your USN"
            value={formData.usn}
            onChange={handleChange}
            className={`w-full p-4 rounded-lg bg-[#111922] text-white placeholder-[#93acc8] focus:outline-none ${
              errors.usn ? 'border border-red-500' : ''
            }`}
          />
          {errors.usn && <p className="text-red-500 text-sm">{errors.usn}</p>}
        </div>

        <div>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            className={`w-full p-4 rounded-lg bg-[#111922] text-white focus:outline-none appearance-none ${
              errors.year ? 'border border-red-500' : ''
            }`}
          >
            <option value="" disabled>
              Select Graduation Year
            </option>
            {Array.from({ length: 11 }, (_, i) => 2020 + i).map(y => (
              <option key={y} value={y} className="bg-[#243447]">
                {y}
              </option>
            ))}
          </select>
          {errors.year && <p className="text-red-500 text-sm">{errors.year}</p>}
        </div>

        <div>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-4 rounded-lg bg-[#111922] text-white placeholder-[#93acc8] focus:outline-none ${
              errors.email ? 'border border-red-500' : ''
            }`}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full p-4 rounded-lg bg-[#111922] text-white placeholder-[#93acc8] focus:outline-none ${
              errors.password ? 'border border-red-500' : ''
            }`}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        <div>
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full p-4 rounded-lg bg-[#111922] text-white placeholder-[#93acc8] focus:outline-none ${
              errors.confirmPassword ? 'border border-red-500' : ''
            }`}
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
        </div>

        <div className="flex items-center">
          <input
            name="terms"
            type="checkbox"
            checked={formData.terms}
            onChange={handleChange}
            id="terms"
            className="h-4 w-4 text-[#1978e5] bg-[#243447] border-[#93acc8] rounded focus:ring-[#1978e5]"
          />
          <label htmlFor="terms" className="ml-2 text-[#93acc8] text-sm">
            I agree to the <a href="#" className="underline text-[#1978e5 judgment]">Terms and Conditions</a>
          </label>
        </div>
        {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

        <button
          type="submit"
          className="w-full bg-[#1978e5] hover:bg-[#1565c0] text-white font-bold py-3 rounded-lg transition-colors"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
