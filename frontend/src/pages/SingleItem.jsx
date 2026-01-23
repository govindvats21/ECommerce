import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { serverURL } from "../App";
import Nav from "../components/Nav";
import RelatedItems from "../components/RelatedItems";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setBuyNowItem } from "../redux/userSlice";
import Footer from "../components/Footer";
import { categories as categoryStaticData } from "../category"; 

const SingleItem = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [mainImage, setMainImage] = useState("");
  
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedRam, setSelectedRam] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("");

  const { itemsInMyCity } = useSelector((state) => state.user);

  const handleItem = async () => {
    try {
      const res = await axios.get(
        `${serverURL}/api/item/get-item-by/${itemId}`,
        { withCredentials: true }
      );
      const data = res.data;
      setItem(data);
      
      if (data?.images && data.images.length > 0) {
        const firstImg = typeof data.images[0] === "string" 
          ? data.images[0] 
          : data.images[0]?.image1;
        setMainImage(firstImg);
      }
      
      if (data?.attributes?.sizes?.length > 0) setSelectedSize(data.attributes.sizes[0]);
      if (data?.attributes?.ram?.length > 0) setSelectedRam(data.attributes.ram[0]);
      if (data?.attributes?.storage?.length > 0) setSelectedStorage(data.attributes.storage[0]); 
      if (data?.attributes?.weight?.length > 0) setSelectedWeight(data.attributes.weight[0]);
      if (data?.attributes?.colors?.length > 0) setSelectedColor(data.attributes.colors[0]);

    } catch (error) {
      console.log("Error fetching item:", error);
    }
  };

  useEffect(() => {
    handleItem();
    window.scrollTo(0, 0);
  }, [itemId]);

  if (!item) return <p className="text-center mt-40 font-bold text-gray-400 animate-pulse">Loading Product...</p>;

  const discountPercentage = item?.originalPrice ? Math.round(((item.originalPrice - item.discountPrice) / item.originalPrice) * 100) : 0;

  const getImgSrc = (imgObj) => {
    if (typeof imgObj === "string") return imgObj;
    return imgObj?.image1 || imgObj?.image2 || imgObj?.image3 || imgObj?.image4;
  };

  // Logic to get highlights or icons from static data
  const staticCategoryInfo = categoryStaticData.find(cat => cat.category === item.category);
  
  const isOutOfStock = !item.stock || item.stock <= 0;

  const handleBuyNow = () => {
  const shopId = item.shop?._id || item.shop;
  
  const buyNowData = {
    id: item._id,
    name: item.name,
    price: item.discountPrice,
    image: mainImage,
    shop: shopId,
    quantity: 1,
    variant: { 
      size: selectedSize, 
      ram: selectedRam, 
      storage: selectedStorage, 
      weight: selectedWeight, 
      color: selectedColor 
    }
  };

  dispatch(setBuyNowItem(buyNowData)); // Redux mein set kiya
  navigate("/checkout?type=buynow");   // Query parameter ke saath bheja
};

  return (
    <>
      <div className="min-h-screen bg-white">
        <Nav />
        <div className="flex flex-col md:flex-row gap-12 md:mt-20 px-6 md:px-20 lg:px-32">
          
          <div className="w-full md:w-1/2 flex flex-col-reverse md:flex-row gap-4">
            <div className="flex flex-row md:flex-col gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {item?.images?.map((img, index) => {
                const src = getImgSrc(img);
                return src && (
                  <div key={index} className={`cursor-pointer border-2 rounded-lg overflow-hidden shrink-0 transition-all ${mainImage === src ? "border-blue-600 scale-95" : "border-gray-100 hover:border-blue-300"}`} onClick={() => setMainImage(src)}>
                    <img src={src} className="w-16 h-16 md:w-20 md:h-20 object-cover" alt="" />
                  </div>
                );
              })}
            </div>
            <div className="flex-1 border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center p-6 h-[400px] md:h-[600px]">
              <img src={mainImage} className="object-contain w-full h-full hover:scale-105 transition-transform duration-500" alt="main" />
            </div>
          </div>

          <div className="w-full md:w-1/2 space-y-6">
            <div>
              <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{item.brand}</p>
              <h1 className="text-3xl md:text-3xl font-black text-gray-800 ">{item.name}</h1>
              
              <div className="flex items-center gap-2 mt-4">
                <div className={`w-2 h-2 rounded-full ${!isOutOfStock ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${!isOutOfStock ? 'text-green-600' : 'text-red-600'}`}>
                  {!isOutOfStock ? `In Stock (${item.stock} Available)` : 'Out of Stock'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-gray-900">₹{item.discountPrice}</span>
              <span className="text-xl text-gray-400 line-through">₹{item.originalPrice}</span>
              {discountPercentage > 0 && <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold text-xs">{discountPercentage}% OFF</span>}
            </div>

            {/* Dynamic Icons from Static Category Data */}
            {staticCategoryInfo?.icons && (
              <div className="grid grid-cols-4 gap-2 py-4 border-t border-gray-100">
                {staticCategoryInfo.icons.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 text-center">
                    <item.icon className="text-gray-400 text-lg" />
                    <span className="text-[8px] font-black uppercase tracking-tighter text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-6 py-6 border-y border-gray-100">
              {item.attributes?.ram?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Select RAM</p>
                  <div className="flex flex-wrap gap-2">
                    {item.attributes.ram.map(r => (
                      <button key={r} onClick={() => setSelectedRam(r)} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${selectedRam === r ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{r}</button>
                    ))}
                  </div>
                </div>
              )}

              {item.attributes?.storage?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Select Storage</p>
                  <div className="flex flex-wrap gap-2">
                    {item.attributes.storage.map(s => (
                      <button key={s} onClick={() => setSelectedStorage(s)} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${selectedStorage === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {item.attributes?.sizes?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Choose Size</p>
                  <div className="flex flex-wrap gap-3">
                    {item.attributes.sizes.map(s => (
                      <button key={s} onClick={() => setSelectedSize(s)} className={`w-12 h-12 flex items-center justify-center rounded-full font-black text-xs transition-all border-2 ${selectedSize === s ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-black'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Render Highlights if exist in DB, else nothing */}
            {item.highlights?.length > 0 && (
              <div className="py-2">
                <p className="text-[30px] font-black uppercase text-gray-400 mb-4 tracking-widest">Product Highlights</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {item.highlights.map((point, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0" />
                      <span className="text-sm font-semibold text-gray-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
               <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Description</p>
               <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </div>

          <div className="flex gap-4 pt-6">
              <button 
                disabled={isOutOfStock}
                className={`flex-1 font-black py-4 rounded-xl transition-all uppercase text-xs tracking-widest border-2 
                  ${!isOutOfStock 
                    ? 'bg-white border-black text-black active:scale-95 hover:bg-gray-50 cursor-pointer' 
                    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}
                onClick={() => {
                  // ✨ FIXED: Extracting shop ID to prevent 500 Error
                  const shopId = item.shop?._id || item.shop;

                  dispatch(addToCart({
                    id: item._id,
                    name: item.name,
                    price: item.discountPrice,
                    image: mainImage,
                    shop: shopId, // <--- CRITICAL FIX
                    quantity: 1,
                    variant: { size: selectedSize, ram: selectedRam, storage: selectedStorage, weight: selectedWeight, color: selectedColor }
                  }));
                }}
              >
                {!isOutOfStock ? "Add to Cart" : "Sold Out"}
              </button>

              <button 
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className={`flex-1 font-black py-4 rounded-xl transition-all uppercase text-xs tracking-widest shadow-xl
                  ${!isOutOfStock 
                    ? 'bg-black text-white active:scale-95 hover:bg-gray-800 cursor-pointer' 
                    : 'bg-gray-300 text-white cursor-not-allowed shadow-none'}`}
              >
                {!isOutOfStock ? "Buy Now" : "No Stock"}
              </button>
            </div>

          </div>
        </div>

        <div className="mt-15 border-t border-gray-50 pt-10">
          <div className="px-6 md:px-20 lg:px-32 mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter italic">SIMITAR PRODUCTS</h2>
          </div>
          <RelatedItems data={itemsInMyCity?.filter((i) => i._id !== itemId && i.category === item.category)} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SingleItem;