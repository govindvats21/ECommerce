import {
  FiTruck,
  FiUserCheck,
  FiShield,
  FiSmartphone,
  FiMonitor,
  FiWatch,
  FiCamera,
  FiSpeaker,
  FiActivity,
  FiLayers,
  FiMapPin,
  FiPackage,
  FiSun,
} from "react-icons/fi";
import {
  TbLeaf,
  TbReplaceFilled,
  TbHeartHandshake,
  TbSmartHome,
  TbDeviceGamepad2,
  TbDeviceLaptop,
  TbHeadphones,
  TbHanger,
  TbShoe,
  TbArmchair,
  TbWallet,
  TbDeviceTvOld,
  TbAerialLift,
} from "react-icons/tb";
import {
  RiShieldCheckLine,
  RiHome2Line,
  RiTShirtLine,
  RiHardDriveLine,
} from "react-icons/ri";

// Aapki Images
import image1 from "./assets/categories/image1.jpg";
import image2 from "./assets/categories/image2.webp";
import image3 from "./assets/categories/image3.jpg";
import image4 from "./assets/categories/image4.webp";
import image5 from "./assets/categories/image5.webp";
import image6 from "./assets/categories/image6.webp";
import image7 from "./assets/categories/image7.webp";
import image8 from "./assets/categories/image8.webp";
import image9 from "./assets/categories/image9.webp";
import image10 from "./assets/categories/image10.webp";
import image11 from "./assets/categories/image11.webp";
import image12 from "./assets/categories/image12.webp";
import image13 from "./assets/categories/image13.webp";
import image14 from "./assets/categories/image14.webp";
import image15 from "./assets/categories/image15.jpeg";
import image16 from "./assets/categories/image16.webp";
import image17 from "./assets/categories/image17.webp";


export const categories = [
  {
    category: "Mobiles",
    image: image1,
    type: "ecommerce",
    icons: [
      { icon: FiSmartphone, label: "5G Tech" },
      { icon: FiShield, label: "Secure" },
      { icon: FiTruck, label: "Free Shipping" },
      { icon: TbReplaceFilled, label: "Easy Return" },
    ],
  },
  {
    category: "Laptops",
    image: image2,
    type: "ecommerce",
    icons: [
      { icon: TbDeviceLaptop, label: "High Power" },
      { icon: FiShield, label: "Warranty" },
      { icon: FiUserCheck, label: "Verified" },
      { icon: TbReplaceFilled, label: "Upgrade" },
    ],
  },
  {
    category: "Clothes",
    image: image3,
    type: "ecommerce",
    icons: [
      { icon: RiTShirtLine, label: "Premium Fabric" }, // Fixed: Headphones ki jagah T-Shirt
      { icon: FiShield, label: "Quality Check" },
      { icon: FiTruck, label: "Fast Delivery" },
      { icon: TbReplaceFilled, label: "7 Day Return" },
    ],
  },
  {
    category: "Watches",
    image: image4,
    type: "ecommerce",
    icons: [
      { icon: FiWatch, label: "Luxury" },
      { icon: RiShieldCheckLine, label: "Warranty" },
      { icon: FiUserCheck, label: "Authentic" },
      { icon: TbReplaceFilled, label: "Exchange" },
    ],
  },
  {
    category: "Gaming",
    image: image5,
    type: "ecommerce",
    icons: [
      { icon: TbDeviceGamepad2, label: "Original" },
      { icon: FiMonitor, label: "4K Ready" },
      { icon: FiShield, label: "Safe Pay" },
      { icon: TbReplaceFilled, label: "Warranty" },
    ],
  },
  {
    category: "Fashion",
    image: image6,
    type: "ecommerce",
    icons: [
      { icon: TbHanger, label: "Trend Alert" },
      { icon: FiUserCheck, label: "Designer" },
      { icon: TbReplaceFilled, label: "Easy Exchange" },
      { icon: FiTruck, label: "Express" },
    ],
  },
  {
    category: "Footwear",
    image: image7,
    type: "ecommerce",
    icons: [
      { icon: TbShoe, label: "Comfort Fit" },
      { icon: FiShield, label: "Durable" },
      { icon: FiUserCheck, label: "Original" },
      { icon: TbReplaceFilled, label: "Size Swap" },
    ],
  },
  {
    category: "Tablets",
    image: image8,
    type: "ecommerce",
    icons: [
      { icon: FiLayers, label: "Multitask" },
      { icon: FiMonitor, label: "Vivid Display" },
      { icon: FiShield, label: "Brand Warranty" },
      { icon: TbReplaceFilled, label: "Trade-In" },
    ],
  },
  {
    category: "Cameras",
    image: image9,
    type: "ecommerce",
    icons: [
      { icon: FiCamera, label: "DSLR Tech" },
      { icon: FiShield, label: "Safe Transit" },
      { icon: FiTruck, label: "Insured" },
      { icon: FiUserCheck, label: "Pro Grade" },
    ],
  },
  {
    category: "Smart Home",
    image: image10,
    type: "ecommerce",
    icons: [
      { icon: TbSmartHome, label: "Automation" },
      { icon: FiSmartphone, label: "App Link" },
      { icon: RiShieldCheckLine, label: "Secure" },
      { icon: FiTruck, label: "Free Setup" },
    ],
  },
  {
    category: "Accessories",
    image: image11,
    type: "ecommerce",
    icons: [
      { icon: TbWallet, label: "Premium" },
      { icon: FiUserCheck, label: "Stylish" },
      { icon: FiShield, label: "Tested" },
      { icon: TbReplaceFilled, label: "Quick Swap" },
    ],
  },
  {
    category: "Appliances",
    image: image12,
    type: "ecommerce",
    icons: [
      { icon: TbDeviceTvOld, label: "Latest Tech" },
      { icon: FiShield, label: "Installation" },
      { icon: FiTruck, label: "Home Delivery" },
      { icon: TbReplaceFilled, label: "Best Deal" },
    ],
  },
  {
    category: "Furniture",
    image: image13,
    type: "ecommerce",
    icons: [
      { icon: TbArmchair, label: "Ergonomic" },
      { icon: RiHome2Line, label: "Premium" },
      { icon: FiTruck, label: "Heavy Duty" },
      { icon: FiShield, label: "Long Lasting" },
    ],
  },
  {
    category: "Backpack",
    image: image14,
    type: "ecommerce",
    icons: [
      { icon: FiPackage, label: "Tough Build" },
      { icon: FiMapPin, label: "Travel Ready" },
      { icon: FiShield, label: "Waterproof" },
      { icon: FiTruck, label: "Fast" },
    ],
  },
  {
    category: "Smart LED TV",
    image: image15,
    type: "ecommerce",
    icons: [
      { icon: FiMonitor, label: "4K Cinema" },
      { icon: FiShield, label: "Panel Warranty" },
      { icon: FiUserCheck, label: "Slim Look" },
      { icon: TbReplaceFilled, label: "No Cost EMI" },
    ],
  },
  {
    category: "Covers",
    image: image16,
    type: "ecommerce",
    icons: [
      { icon: RiHardDriveLine, label: "Shockproof" }, // Fixed: Aerial ki jagah Armor/HardDrive
      { icon: FiShield, label: "Dust Proof" },
      { icon: FiTruck, label: "Low Price" },
      { icon: FiActivity, label: "Perfect Grip" },
    ],
  },
  {
    category: "Speakers",
    image: image17,
    type: "ecommerce",
    icons: [
      { icon: FiSpeaker, label: "Deep Bass" }, // Fixed: Headphones ki jagah Speaker icon
      { icon: TbHeadphones, label: "Stereo" },
      { icon: FiShield, label: "Authentic" },
      { icon: TbReplaceFilled, label: "Easy Return" },
    ],
  },
  
];
