import React from "react";
import {
  X,
  Facebook,
  Twitter,
  Mail,
  MessageCircle,
} from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  profileUrl: string;
  onCopy: () => void;
  copied: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({
  open,
  onClose,
  profileUrl,
  onCopy,
  copied,
}) => {
  if (!open) return null;

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-6 w-6 text-green-500" />,
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(profileUrl)}`,
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-6 w-6 text-blue-500" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
    },
    {
      name: "X",
      icon: <Twitter className="h-6 w-6 text-white" />,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}`,
    },
    {
      name: "Email",
      icon: <Mail className="h-6 w-6 text-gray-400" />,
      href: `mailto:?subject=Check%20this%20profile&body=${encodeURIComponent(profileUrl)}`,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <h3 className="text-lg font-semibold text-white mb-4 text-center">
          Share this profile
        </h3>

        {/* Share buttons */}
        <div className="flex justify-around mb-4">
          {shareOptions.map((opt) => (
            <a
              key={opt.name}
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-gray-300 hover:text-white"
            >
              {opt.icon}
              <span className="text-xs mt-1">{opt.name}</span>
            </a>
          ))}
        </div>

        {/* Copy link */}
        <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
          <input
            type="text"
            readOnly
            value={profileUrl}
            className="flex-1 bg-gray-800 text-gray-300 px-3 py-2 text-sm outline-none"
          />
          <button
            onClick={onCopy}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 text-white text-sm"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
