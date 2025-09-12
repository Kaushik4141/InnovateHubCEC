import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import QRCodeService from '../services/qrcode.service';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  fullname: string;
  userDetails: {
    fullname: string;
    year?: number;
    branch?: string;
    email?: string;
    usn?: string;
  };
}

const QRCodeModal = ({ open, onClose, userId, fullname, userDetails }: QRCodeModalProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError('');
      
      QRCodeService.generateUserProfileQR(userId, fullname)
        .then(dataUrl => {
          setQrCodeUrl(dataUrl);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to generate QR code:', err);
          setError('Failed to generate QR code');
          setLoading(false);
        });
    }
  }, [open, userId, fullname]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 relative border border-gray-700 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h3 className="text-xl font-semibold text-white mb-4 text-center">Profile QR Code</h3>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-white p-3 rounded-lg">
                <img src={qrCodeUrl} alt="Profile QR Code" className="w-64 h-64" />
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
              <h4 className="text-lg font-medium text-white">User Details</h4>
              <p className="text-gray-300"><span className="text-gray-400">Name:</span> {userDetails.fullname}</p>
              {userDetails.year && (
                <p className="text-gray-300"><span className="text-gray-400">Year:</span> {userDetails.year}</p>
              )}
              {userDetails.branch && (
                <p className="text-gray-300"><span className="text-gray-400">Branch:</span> {userDetails.branch}</p>
              )}
              {userDetails.usn && (
                <p className="text-gray-300"><span className="text-gray-400">USN:</span> {userDetails.usn}</p>
              )}
              {userDetails.email && (
                <p className="text-gray-300"><span className="text-gray-400">Email:</span> {userDetails.email}</p>
              )}
            </div>
            
            <p className="text-sm text-gray-400 text-center">
              Scan this QR code to view this profile
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeModal;