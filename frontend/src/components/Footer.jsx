import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-green-600 text-white py-4 mt-5 px-6 flex flex-col md:flex-row items-center justify-between">
      <div className="text-sm">&copy; 2025 Grocery Hub. All rights reserved.</div>
      <div className="flex space-x-4 mt-3 md:mt-0">
        {[FaFacebookF, FaInstagram, FaTwitter].map((Icon, idx) => (
          <a
            href="#"
            key={idx}
            className="p-2 rounded-full bg-green-500 hover:bg-white hover:text-green-600 transition"
            aria-label="Social Link"
          >
            <Icon size={16} />
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
