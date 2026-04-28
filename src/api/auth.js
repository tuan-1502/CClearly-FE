import http from '@/lib/http/client';
import { ENDPOINT } from '@/utils/endpoints';

export const authRequest = {
  // Login with email/password
  login: async (credentials) => {
    const res = await http.post(ENDPOINT.LOGIN, credentials);
    return res.data;
  },

  // Register new account
  register: async (data) => {
    const res = await http.post(ENDPOINT.REGISTER, data);
    return res.data;
  },

  // Logout
  logout: async () => {
    const res = await http.post(ENDPOINT.LOGOUT);
    return res.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const res = await http.post(ENDPOINT.REFRESH, { refreshToken });
    return res.data;
  },

  // Get current user profile
  getProfile: async () => {
    const res = await http.get(ENDPOINT.PROFILE);
    return res.data;
  },

  // Forgot password - send reset email
  forgotPassword: async (email) => {
    const res = await http.post(ENDPOINT.FORGOT_PASSWORD, {
      email,
      domain: window.location.origin,
    });
    return res.data;
  },

  // Reset password with token
  resetPassword: async (data) => {
    const res = await http.post(ENDPOINT.RESET_PASSWORD, data);
    return res.data;
  },

  // Verify email with OTP code
  verifyEmail: async ({ email, otpCode }) => {
    const res = await http.post(ENDPOINT.VERIFY_EMAIL, { email, otpCode });
    return res.data;
  },

  // Resend verification email
  resendVerificationEmail: async (email) => {
    const res = await http.post(ENDPOINT.RESEND_VERIFICATION, { email });
    return res.data;
  },

  // Login with Google
  loginWithGoogle: async (idToken) => {
    const res = await http.post(ENDPOINT.GOOGLE_LOGIN, { idToken });
    return res.data;
  },
};
