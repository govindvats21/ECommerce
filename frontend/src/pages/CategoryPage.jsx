import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import ItemCard from '../components/ItemCard';
import Footer from '../components/Footer';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const CategoryPage = () => {
  const { itemsInMyCity } = useSelector((state) => state.user);
  const { name } = useParams();
  const navigate = useNavigate();

  const matchingItems = itemsInMyCity.filter((item) => item?.category === name);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [name]);

  return (
    <div className='min-h-screen bg-[#F9FAFB]'>
      <Nav />
      
      <div className="pt-7 pb-5 bg-white px-6 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-orange-500 hover:text-black transition-colors"
          >
            <HiOutlineArrowLeft size={16} /> Back to Hub
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-2xl font-[1000] text-gray-900 uppercase italic tracking-tighter leading-none">
                {name}<span className="text-orange-500">.</span>
              </h1>
              <div className="flex items-center gap-3 mt-4">
                <span className="h-1 w-10 bg-black rounded-full"></span>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Premium Selection
                </p>
              </div>
            </div>
            
            <div className="bg-gray-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-gray-200">
              {matchingItems.length} Products Found
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {matchingItems.length > 0 ? (
        
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-8">
  {matchingItems.map((item, index) => (
    <div key={index} className="w-full">
      <ItemCard data={item} />
    </div>
  ))}
</div>
        ) : (
        
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="relative mb-6">
               <div className="w-24 h-24 bg-gray-100 rounded-full animate-ping absolute opacity-20"></div>
               <span className="text-7xl relative">📦</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Category Empty</h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase mt-2 tracking-widest">Check back for fresh drops</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;