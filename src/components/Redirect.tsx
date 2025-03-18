import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findUrlByShortCode, incrementVisits } from '../lib/urls';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export function Redirect() {
  const { shortCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!shortCode) {
      toast.error('Invalid short code');
      navigate('/');
      return;
    }

    try {
      const url = findUrlByShortCode(shortCode);
      if (url) {
        incrementVisits(shortCode);
        window.location.href = url.originalUrl;
      } else {
        toast.error('This short link does not exist or has been removed', {
          duration: 5000,
        });
        navigate('/');
      }
    } catch (error) {
      toast.error('Failed to redirect. Please try again.', {
        duration: 5000,
      });
      navigate('/');
    }
  }, [shortCode, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting you to your destination...</p>
      </div>
    </div>
  );
}