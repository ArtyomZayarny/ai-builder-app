import { useEffect, useRef, useCallback } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
            }
          ) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const handleCredentialResponse = useCallback(
    (response: { credential: string }) => {
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        onError('No credential received from Google');
      }
    },
    [onSuccess, onError]
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      onError('Google Client ID is not configured');
      return;
    }

    const initializeGoogle = () => {
      if (initializedRef.current || !window.google || !buttonRef.current) return;
      initializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
        shape: 'rectangular',
      });
    };

    // If script already loaded
    if (window.google) {
      initializeGoogle();
      return;
    }

    // Load the Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => onError('Failed to load Google sign-in');
    document.head.appendChild(script);

    return () => {
      initializedRef.current = false;
    };
  }, [handleCredentialResponse, onError]);

  return <div ref={buttonRef} className="flex justify-center" />;
}
