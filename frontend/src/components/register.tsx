import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

interface FormData {
  fullname: string;
  usn: string;
  year: string;
  branch: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface FormErrors {
  fullname?: string;
  usn?: string;
  year?: string;
  branch?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL;     
  const BRANCHES = ['CSE','ISE','AIML','CSD','CSBS','ECE'];

  const [formData, setFormData] = useState<FormData>({
    fullname: '',
    usn: '',
    year: '',
    branch: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setGoogleLoading(true);
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        return;
      }
      const res = await axios.post(
        `${apiBase}/api/v1/users/auth/google`,
        { idToken },
        { withCredentials: true }
      );
      const user = res.data?.data?.user || res.data?.user || res.data?.data;
      if (user?.onboardingCompleted === false) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrors({ general: 'Google Sign-In failed. Please try again.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const validate = () => {
    const errs: FormErrors = {};
    if (!formData.fullname.trim()) errs.fullname = 'Full name is required';
    if (!formData.usn.trim()) errs.usn = 'USN is required';
    else {
      const usn = formData.usn.trim().toUpperCase();
      if (!/^4CB/.test(usn)) {
        errs.usn = 'Invalid USN.';
      }
    }
    if (!formData.year) errs.year = 'Please select your graduation year';
    if (!formData.branch) errs.branch = 'Please select your branch';
    else if (!BRANCHES.includes(formData.branch)) errs.branch = 'Invalid branch';
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

    setLoading(true);
    try {
      const payload = {
        fullname: formData.fullname,
        usn: formData.usn.toUpperCase().trim(),
        year: Number(formData.year),
        branch: formData.branch,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      };

      await axios.post(`${apiBase}/api/v1/users/register`, payload, { withCredentials: true });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      const responseData = error.response?.data;
      const errorMessageLower = (responseData?.message || error.message || '').toLowerCase();
      const errorString = JSON.stringify(responseData || error || '').toLowerCase();

      if (error.response?.status === 409) {
        errorMessage = 'An account with this email or USN already exists.';
      } else if (error.response?.status === 400) {
        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (errorMessageLower.includes('usn') || errorString.includes('usn')) {
          errorMessage = 'This USN is already registered.';
        } else if (errorMessageLower.includes('email') || errorString.includes('email')) {
          errorMessage = 'This email is already registered.';
        } else {
          errorMessage = 'Invalid registration data. Please check your inputs.';
        }
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (
        errorMessageLower.includes('already exists') ||
        errorMessageLower.includes('duplicate') ||
        errorMessageLower.includes('already registered') ||
        errorString.includes('already exists') ||
        errorString.includes('duplicate') ||
        errorString.includes('already registered')
      ) {
        errorMessage = 'An account with this email or USN already exists.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -right-24 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-24 w-[28rem] h-[28rem] bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md p-[1px] rounded-2xl bg-gradient-to-r from-purple-500/30 to-blue-500/30 shadow-2xl">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 space-y-6"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-2">
              <img src="/logo1.png" alt="logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">InnovateHubCEC</span>
            </div>
            <h2 className="text-2xl font-semibold text-white">Create your account</h2>
            <p className="text-sm text-gray-400">Join the community</p>
          </div>

          {errors.general && (
            <p className="text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded text-sm text-center">{errors.general}</p>
          )}
          {success && (
            <p className="text-green-400 bg-green-500/10 border border-green-500/30 px-3 py-2 rounded text-sm text-center">
              Account created successfully! Redirecting...
            </p>
          )}

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setGoogleLoading(false);
                setErrors({ general: 'Google Sign-In failed. Please try again.' });
              }}
              useOneTap={false}
            />
          </div>
          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-gray-700 flex-1" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="h-px bg-gray-700 flex-1" />
          </div>

          <div>
            <input
              name="fullname"
              type="text"
              placeholder="Full Name"
              value={formData.fullname}
              onChange={handleChange}
              className={`w-full p-4 rounded-lg bg-gray-900/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition ${
                errors.fullname ? 'border-red-500' : ''
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
              className={`w-full p-4 rounded-lg bg-gray-900/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition ${
                errors.usn ? 'border-red-500' : ''
              }`}
            />
            {errors.usn && <p className="text-red-500 text-sm">{errors.usn}</p>}
          </div>

          <div>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className={`w-full p-4 rounded-lg bg-gray-900/60 text-white border border-gray-700 focus:outline-none appearance-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition ${
                errors.year ? 'border-red-500' : ''
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
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className={`w-full p-4 rounded-lg bg-gray-900/60 text-white border border-gray-700 focus:outline-none appearance-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition ${
                errors.branch ? 'border-red-500' : ''
              }`}
            >
              <option value="" disabled>
                Select Branch
              </option>
              {BRANCHES.map(b => (
                <option key={b} value={b} className="bg-[#243447]">
                  {b}
                </option>
              ))}
            </select>
            {errors.branch && <p className="text-red-500 text-sm">{errors.branch}</p>}
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-4 rounded-lg bg-gray-900/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-4 rounded-lg bg-gray-900/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition ${
                errors.password ? 'border-red-500' : ''
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-4 rounded-lg bg-gray-900/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition ${
                errors.confirmPassword ? 'border-red-500' : ''
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
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
              I agree to the <a href="#" className="underline text-[#1978e5]">Terms and Conditions</a>
            </label>
          </div>
          {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
          <p className="text-gray-400 text-sm text-center">
            Already have an account?{' '}
            <span
              className="underline text-purple-400 hover:text-white cursor-pointer"
              onClick={() => navigate('/login')}
            >
              Sign in
            </span>
          </p>
        </form>
      </div>

      {googleLoading && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 bg-gray-900/80 border border-gray-700 rounded-xl px-6 py-5">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
            <p className="text-sm text-gray-300">Signing in with Google...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupForm;