import React from "react";
import { FaInstagram, FaEnvelope, FaFacebookF, FaTwitter } from "react-icons/fa";
import { HiOutlineArrowUp } from "react-icons/hi";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#232F3E] text-white pt-12 pb-6 mt-20">
      {/* 🔝 Back to Top Button */}
      <button 
        onClick={scrollToTop}
        className="w-full bg-[#37475a] py-4 text-sm font-bold hover:bg-[#485769] transition mb-10 flex items-center justify-center gap-2"
      >
        <HiOutlineArrowUp /> Back to top
      </button>

      <div className="max-w-7xl mx-auto px-6 md:px-20 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* 🏢 Column 1: Brand Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-black tracking-tighter italic">GROCERY<span className="text-yellow-400">HUB</span></h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your neighborhood store, now online. Get fresh groceries and electronics delivered at your doorstep with trust.
          </p>
        </div>

        {/* 🔗 Column 2: Quick Links */}
        <div>
          <h3 className="font-bold mb-4 text-white">Get to Know Us</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li className="hover:underline cursor-pointer">About Us</li>
            <li className="hover:underline cursor-pointer">Careers</li>
            <li className="hover:underline cursor-pointer">Press Releases</li>
            <li className="hover:underline cursor-pointer">Gift a Smile</li>
          </ul>
        </div>

        {/* 🛠️ Column 3: Help & Support */}
        <div>
          <h3 className="font-bold mb-4 text-white">Let Us Help You</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li className="hover:underline cursor-pointer">Your Account</li>
            <li className="hover:underline cursor-pointer">Returns Centre</li>
            <li className="hover:underline cursor-pointer">100% Purchase Protection</li>
            <li className="hover:underline cursor-pointer">Help Help</li>
          </ul>
        </div>

        {/* 📱 Column 4: Contact & Social */}
        <div>
          <h3 className="font-bold mb-4 text-white">Connect with Us</h3>
          <div className="flex gap-4 mb-6">
            <a href="https://www.instagram.com/govindvats2803" target="_blank" rel="noopener noreferrer" 
               className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-pink-600 transition duration-300">
              <FaInstagram size={18} />
            </a>
            <a href="mailto:govindvats11m@gmail.com" 
               className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-500 transition duration-300">
              <FaEnvelope size={18} />
            </a>
            <button className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-800 transition duration-300">
              <FaFacebookF size={18} />
            </button>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Contact Support</p>
          <p className="text-sm text-yellow-400 font-bold">govindvats11m@gmail.com</p>
        </div>
      </div>

      {/* 📜 Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 mt-12 pt-6 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
        <div className="flex gap-6">
          <span className="hover:text-white cursor-pointer">Conditions of Use</span>
          <span className="hover:text-white cursor-pointer">Privacy Notice</span>
          <span className="hover:text-white cursor-pointer">Interest-Based Ads</span>
        </div>
        <p>&copy; 2026, Grocery Hub India, Inc. or its affiliates</p>
      </div>
    </footer>
  );
};

export default Footer;