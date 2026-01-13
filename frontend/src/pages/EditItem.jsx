import React, { useEffect, useState } from "react";
import { FaSave, FaBoxOpen, FaArrowLeft, FaDatabase } from "react-icons/fa"; // FaDatabase icon add kiya
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { setMyShopData } from "../redux/ownerSlice";
import { serverURL } from "../App";

const EditItem = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { myShopData } = useSelector((state) => state.owner);

  const [frontendImages, setFrontendImages] = useState([null, null, null, null]);
  const [backendImages, setBackendImages] = useState([null, null, null, null]);
  const [oldImages, setOldImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm();
  const selectedCategory = watch("category");

  // Load existing item data
  useEffect(() => {
    if (myShopData?.items) {
      const item = myShopData.items.find((it) => it._id === id);
      if (item) {
        setValue("name", item.name);
        setValue("brand", item.brand);
        setValue("originalPrice", item.originalPrice);
        setValue("discountPrice", item.discountPrice);
        setValue("description", item.description);
        setValue("category", item.category);
        setValue("stock", item.stock); // Stock value set ho rahi hai

        if (item.attributes) {
          setValue("colors", item.attributes.colors?.join(", "));
          setValue("sizes", item.attributes.sizes?.join(", "));
          setValue("ram", item.attributes.ram?.join(", "));
          setValue("storage", item.attributes.storage?.join(", "));
        }

        const imgs = item.images ? Object.values(item.images) : [];
        setOldImages(imgs);
      }
    }
  }, [id, myShopData, setValue]);

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newBackend = [...backendImages];
      newBackend[index] = file;
      setBackendImages(newBackend);

      const newFrontend = [...frontendImages];
      newFrontend[index] = URL.createObjectURL(file);
      setFrontendImages(newFrontend);
    }
  };

  const formSubmit = async (details) => {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("name", details.name);
      formData.append("brand", details.brand || "");
      formData.append("category", details.category);
      formData.append("originalPrice", details.originalPrice);
      formData.append("discountPrice", details.discountPrice);
      formData.append("stock", details.stock || 0); // Stock value append ho rahi hai
      formData.append("description", details.description);

      const attributes = {
        colors: details.colors ? details.colors.split(",").map(s => s.trim()) : [],
        sizes: details.sizes ? details.sizes.split(",").map(s => s.trim()) : [],
        ram: details.ram ? details.ram.split(",").map(s => s.trim()) : [],
        storage: details.storage ? details.storage.split(",").map(s => s.trim()) : [],
      };
      
      formData.append("attributes", JSON.stringify(attributes));

      for (let i = 0; i < 4; i++) {
        if (backendImages[i]) {
          formData.append("images", backendImages[i]); 
        } else if (oldImages[i]) {
          formData.append("oldImages", oldImages[i]); 
        }
      }

      const res = await axios.post(`${serverURL}/api/item/edit-item/${id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });

      dispatch(setMyShopData(res.data));
      navigate("/owner-dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Error updating item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-3xl flex items-center mb-8">
         <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
            <FaArrowLeft className="text-gray-600" />
         </button>
      </div>

      <form onSubmit={handleSubmit(formSubmit)} className="max-w-3xl w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 space-y-8 border border-gray-50">
        <header className="text-center space-y-2">
          <div className="inline-flex bg-black text-white p-4 rounded-2xl mb-2">
            <FaBoxOpen size={24} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Edit Product</h2>
          <p className="text-gray-400 font-medium text-sm">Modify your shopping catalog item</p>
        </header>

        {/* Media Grid */}
        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">Media Assets</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="relative aspect-square bg-[#f9f9f9] rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden group hover:border-black transition-all">
                <input type="file" onChange={(e) => handleImageChange(e, index)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                {frontendImages[index] || oldImages[index] ? (
                  <img src={frontendImages[index] || oldImages[index]} className="w-full h-full object-contain p-2" alt="product" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <span className="text-xl font-light">+</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="col-span-2 space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Product Name</label>
            <input {...register("name", { required: true })} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-semibold outline-none focus:ring-2 focus:ring-black transition-all" />
          </div>

          <div className="space-y-2">
             <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">MRP (₹)</label>
             <input type="number" {...register("originalPrice", { required: true })} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-semibold outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div className="space-y-2">
             <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Sale Price (₹)</label>
             <input type="number" {...register("discountPrice")} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-semibold outline-none focus:ring-2 focus:ring-black" />
          </div>

          {/* New Inventory Section: Brand & Stock */}
          <div className="space-y-2">
             <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Brand Name</label>
             <input {...register("brand")} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-semibold outline-none focus:ring-2 focus:ring-black" placeholder="e.g. Apple, Nike" />
          </div>
          <div className="space-y-2">
             <label className="text-[11px] font-black uppercase text-orange-500 tracking-widest">Available Stock</label>
             <input type="number" {...register("stock", { required: true })} className="w-full bg-orange-50/30 border-2 border-orange-100/50 rounded-2xl p-5 text-sm font-bold text-orange-700 outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="Quantity in hand" />
          </div>

          {/* Dynamic Sections Based on Category */}
          {(selectedCategory === "Mobiles" || selectedCategory === "Electronics") && (
              <div className="col-span-2 grid grid-cols-2 gap-4 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                <input {...register("ram")} className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold outline-none shadow-sm" placeholder="RAM (e.g. 8GB)" />
                <input {...register("storage")} className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold outline-none shadow-sm" placeholder="Storage (e.g. 256GB)" />
              </div>
          )}

          {(selectedCategory === "Fashion" || selectedCategory === "Clothes" || selectedCategory === "Beauty") && (
              <div className="col-span-2 grid grid-cols-2 gap-4 p-6 bg-purple-50/50 rounded-[2rem] border border-purple-100">
                <input {...register("sizes")} className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold outline-none shadow-sm" placeholder="Sizes (S, M, L)" />
                <input {...register("colors")} className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold outline-none shadow-sm" placeholder="Colors (Black, Blue)" />
              </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Description</label>
          <textarea {...register("description")} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-semibold outline-none h-40 focus:ring-2 focus:ring-black" />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full ${loading ? 'bg-gray-400' : 'bg-black'} text-white font-black py-6 rounded-3xl flex items-center justify-center gap-3 hover:shadow-2xl transition-all active:scale-[0.98] uppercase text-xs tracking-[0.2em]`}
        >
          {loading ? "Updating..." : <><FaSave /> Update Item</>}
        </button>
      </form>
    </div>
  );
};

export default EditItem;