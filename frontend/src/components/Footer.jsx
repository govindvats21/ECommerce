import React from "react";
import { FaInstagram, FaEnvelope, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { HiOutlineArrowUp } from "react-icons/hi";
import { Link } from "react-router-dom";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#131921] text-white pt-0 pb-6 mt-10">
      {/* 🔝 Back to Top Button */}
      <button 
        onClick={scrollToTop}
        className="w-full bg-[#37475a] py-3 text-sm font-bold hover:bg-[#485769] transition flex items-center justify-center gap-2 mb-10"
      >
        <HiOutlineArrowUp /> Back to top
      </button>

      <div className="max-w-7xl mx-auto px-6 md:px-20 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* 🏢 Column 1: VatsStore Brand */}
        <div className="space-y-4">
          <Link to="/" className="text-2xl font-black tracking-tighter uppercase">
            VATS<span className="text-[#ff4d2d]">STORE</span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed">
            Premium Ecommerce Experience. Electronics se lekar daily essentials tak, 
            VatsStore deta hai aapko bharosa aur sabse tez delivery.
          </p>
        </div>

        {/* 🔗 Column 2: User Links */}
        <div>
          <h3 className="font-bold mb-4 text-white border-b border-gray-700 pb-2 inline-block">VatsStore Shopping</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li><Link to="/orders" className="hover:text-[#ff4d2d] transition">My Orders</Link></li>
            <li><Link to="/cart" className="hover:text-[#ff4d2d] transition">Cart Items</Link></li>
            <li><Link to="/profile" className="hover:text-[#ff4d2d] transition">Account Settings</Link></li>
            <li className="hover:underline cursor-pointer">Wishlist</li>
          </ul>
        </div>

        {/* 🛠️ Column 3: Policy */}
        <div>
          <h3 className="font-bold mb-4 text-white border-b border-gray-700 pb-2 inline-block">Customer Care</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li className="hover:underline cursor-pointer">Track Your Package</li>
            <li className="hover:underline cursor-pointer">Replacement Policy</li>
            <li className="hover:underline cursor-pointer">VatsStore Trust</li>
            <li className="hover:underline cursor-pointer">Help Center</li>
          </ul>
        </div>

        {/* 📱 Column 4: Contact */}
        <div>
          <h3 className="font-bold mb-4 text-white border-b border-gray-700 pb-2 inline-block">Contact Govind Vats</h3>
          <div className="flex gap-4 mb-6">
            <a href="https://www.instagram.com/govindvats2803" target="_blank" rel="noopener noreferrer" 
               className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-[#ff4d2d] transition duration-300">
              <FaInstagram size={18} />
            </a>
            <a href="mailto:govindvats11m@gmail.com" 
               className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-blue-500 transition duration-300">
              <FaEnvelope size={18} />
            </a>
            <a href="https://wa.me/your-number" target="_blank" rel="noopener noreferrer"
               className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-green-500 transition duration-300">
              <FaWhatsapp size={18} />
            </a>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Developer Support</p>
          <p className="text-sm text-[#ff4d2d] font-bold">govindvats11m@gmail.com</p>
        </div>
      </div>

      {/* 📜 Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 mt-12 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
        <div className="flex gap-6">
          <span className="hover:text-white cursor-pointer">Terms & Conditions</span>
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
        </div>
        <p className="text-center md:text-right">&copy; 2026, VatsStore Ecommerce. <br className="md:hidden" /> Crafted with 🔥 by Govind Vats</p>
      </div>
    </footer>
  );
};

export default Footer;