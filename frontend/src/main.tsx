import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './cookiescheker.ts';
import { ChatProvider } from './context/ChatContext.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string}>
      <ChatProvider>
        <App />
      </ChatProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
