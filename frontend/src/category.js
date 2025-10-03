import image1 from "./assets/image1.jpg";
import image2 from "./assets/image2.jpg";
import image3 from "./assets/image3.webp";
import image4 from "./assets/image4.webp";
import image5 from "./assets/image5.webp";
import image6 from "./assets/image6.webp";
import image7 from "./assets/image7.webp";
import image8 from "./assets/image8.webp";
import image9 from "./assets/image9.webp";
import image10 from "./assets/image10.webp";

import { FiTruck, FiUserCheck, FiCoffee, FiShield } from "react-icons/fi";
import { TbLeaf, TbReplaceFilled, TbHeartHandshake } from "react-icons/tb";
import { RiLeafFill, RiShieldCheckLine, RiHome2Line } from "react-icons/ri";
import { GiBabyBottle, GiFruitBowl, GiHealthNormal } from "react-icons/gi";

export const categories = [
  {
    category: "Fruits",
    image: image1,
    highlights: [
      "Fresh from farm",
      "Seasonal picks",
      "High in vitamins",
      "Quality assured",
    ],
    icons: [
      { icon: GiFruitBowl, label: "Fresh & Natural" },
      { icon: TbLeaf, label: "Organic" },
      { icon: FiUserCheck, label: "Quality Assured" },
      { icon: RiShieldCheckLine, label: "Warranty" },
    ],
  },
  {
    category: "Vegetables",
    image: image2,
    highlights: [
      "Farm fresh",
      "Locally sourced",
      "Naturally grown",
      "Organic options",
    ],
    icons: [
      { icon: TbLeaf, label: "Fresh & Organic" },
      { icon: RiLeafFill, label: "Locally Grown" },
      { icon: FiUserCheck, label: "Quality Assured" },
      { icon: RiShieldCheckLine, label: "Warranty" },
    ],
  },
  {
    category: "Dairy & Bakery",
    image: image3,
    highlights: [
      "Daily essentials",
      "Freshly baked",
      "Trusted brands",
      "Hygienic packaging",
    ],
    icons: [
      { icon: FiCoffee, label: "Freshly Baked" },
      { icon: TbReplaceFilled, label: "Easy Replacement" },
      { icon: FiUserCheck, label: "Trusted Quality" },
      { icon: FiShield, label: "Safe & Hygienic" },
    ],
  },
  {
    category: "Snacks",
    image: image4,
    highlights: [
      "Tasty & crispy",
      "Top brands",
      "Instant munchies",
      "Variety of flavors",
    ],
    icons: [
      { icon: TbReplaceFilled, label: "Easy Replacement" },
      { icon: FiUserCheck, label: "Trusted Quality" },
      { icon: FiTruck, label: "Fast Delivery" },
      { icon: RiHome2Line, label: "Home Delivery" },
    ],
  },
  {
    category: "Beverages",
    image: image5,
    highlights: [
      "Cool & refreshing",
      "Health drinks available",
      "Party ready",
      "Wide selection",
    ],
    icons: [
      { icon: FiCoffee, label: "Refreshing Drinks" },
      { icon: TbHeartHandshake, label: "Trusted Brands" },
      { icon: FiUserCheck, label: "Quality Assured" },
      { icon: FiTruck, label: "Fast Delivery" },
    ],
  },
  {
    category: "Personal Care",
    image: image6,
    highlights: [
      "Gentle & effective",
      "Daily grooming",
      "Trusted brands",
      "Skin-friendly",
    ],
    icons: [
      { icon: TbHeartHandshake, label: "Trusted Brands" },
      { icon: FiUserCheck, label: "Quality Assured" },
      { icon: FiShield, label: "Skin Safe" },
      { icon: RiShieldCheckLine, label: "Warranty" },
    ],
  },
  {
    category: "Household Essentials",
    image: image7,
    highlights: [
      "Daily use products",
      "Cleaning & hygiene",
      "Budget-friendly",
      "Eco-friendly options",
    ],
    icons: [
      { icon: RiHome2Line, label: "Home Essentials" },
      { icon: TbReplaceFilled, label: "Easy Replacement" },
      { icon: FiUserCheck, label: "Quality Assured" },
      { icon: TbHeartHandshake, label: "Eco-Friendly" },
    ],
  },
  {
    category: "Baby Care",
    image: image8,
    highlights: [
      "Gentle for babies",
      "Doctor recommended",
      "Top brands",
      "Safe & tested",
    ],
    icons: [
      { icon: GiBabyBottle, label: "Baby Safe" },
      { icon: TbHeartHandshake, label: "Trusted Brands" },
      { icon: FiUserCheck, label: "Quality Assured" },
      { icon: RiShieldCheckLine, label: "Warranty" },
    ],
  },
  {
    category: "Packaged Food",
    image: image9,
    highlights: [
      "Ready-to-eat",
      "Tasty & convenient",
      "Safe packaging",
      "Long shelf life",
    ],
    icons: [
      { icon: FiUserCheck, label: "Quality Assured" },
      { icon: TbReplaceFilled, label: "Easy Replacement" },
      { icon: FiTruck, label: "Fast Delivery" },
      { icon: RiShieldCheckLine, label: "Warranty" },
    ],
  },
  {
    category: "Health & Wellness",
    image: image10,
    highlights: [
      "Nutrient-rich",
      "Immunity boosters",
      "Ayurvedic & herbal",
      "Certified products",
    ],
    icons: [
      { icon: GiHealthNormal, label: "Healthy Choices" },
      { icon: TbHeartHandshake, label: "Trusted Brands" },
      { icon: FiUserCheck, label: "Quality Assured" },
      { icon: RiShieldCheckLine, label: "Warranty" },
    ],
  },
  {
    category: "All",
    image: image1,
    highlights: [
      "All categories",
      "Handpicked products",
      "100% Genuine",
      "Best value",
    ],
    icons: [
      { icon: FiTruck, label: "Fast Delivery" },
      { icon: FiUserCheck, label: "Quality Assured" },
      { icon: RiHome2Line, label: "Home Delivery" },
      { icon: TbHeartHandshake, label: "Trusted Brands" },
    ],
  },
];
