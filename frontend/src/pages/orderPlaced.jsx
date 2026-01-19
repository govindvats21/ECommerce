import React, { useEffect } from 'react';
import { FaCircleCheck } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti'; // ✨ Confetti import karein

const OrderPlaced = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // ✨ Page load hote hi confetti chalao
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff4d2d', '#22c55e', '#ffffff']
        });
    }, []);

    return (
        <div className="min-h-screen bg-[#fff9f6] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">  
            <div className="animate-bounce">
                <FaCircleCheck className='text-green-500 text-7xl mb-6 shadow-sm' />
            </div>
            <h1 className='text-4xl font-black text-gray-900 mb-2 italic uppercase tracking-tighter'>Order Placed!</h1>
            <p className='text-gray-600 max-w-sm mb-8 font-medium'>
                Thank you for your purchase. Your order is being prepared. 
                Check status in <b>My Orders</b>.
            </p>
            <button 
                className='bg-[#ff4d2d] hover:scale-105 active:scale-95 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition shadow-lg shadow-[#ff4d2d]/30' 
                onClick={() => navigate('/my-orders')}
            >
                View My Orders
            </button>
        </div>
    );
}

export default OrderPlaced;