import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-green-600 text-white pt-8 md:pt-12 pb-6 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">

        {/* About Section */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Grocery Hub</h2>
          <p className="text-gray-200 text-sm md:text-base">
            Fresh groceries delivered to your doorstep. Quality products, affordable prices, and fast delivery.
          </p>
          <div className="flex gap-3 mt-2">
            {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map((Icon, idx) => (
              <a
                href="#"
                key={idx}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 hover:bg-white hover:text-green-600 transition transform hover:scale-110 shadow-md"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Quick Links</h3>
          <ul className="space-y-2 text-gray-200 text-sm md:text-base">
            {["Home", "Shop", "Categories", "About Us", "Contact"].map((link, idx) => (
              <li key={idx}>
                <a href="#" className="hover:text-gray-300 transition">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Contact Us</h3>
          <p className="text-gray-200 text-sm md:text-base">123 Grocery Street, Food City, India</p>
          <p className="text-gray-200 text-sm md:text-base">support@groceryhub.com</p>
          <p className="text-gray-200 text-sm md:text-base">+91 12345 67890</p>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-green-500 mt-6 pt-3 text-center text-gray-200 text-xs md:text-sm">
        © 2025 Grocery Hub. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
