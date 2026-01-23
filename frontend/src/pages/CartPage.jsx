import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { removeFromCart, updateQuantity } from "../redux/userSlice";
import Footer from "../components/Footer";

const CartPage = () => {
  const { cartItems, userData } = useSelector((state) => state.user); // ✨ Added userData from Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getCleanPrice = (price) => {
    if (typeof price === 'string') {
      return Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    }
    return Number(price) || 0;
  };

  const calculatedTotal = useMemo(() => {
    return cartItems?.reduce((acc, item) => {
      return acc + (getCleanPrice(item.price) * (item.quantity || 1));
    }, 0);
  }, [cartItems]);

  const totalItems = cartItems?.reduce((acc, item) => acc + item.quantity, 0);

  const handleIncrease = (id, currentQty) => {
    dispatch(updateQuantity({ id, quantity: currentQty + 1 }));
  };

  const handleDecrease = (id, currentQty) => {
    if (currentQty > 1) {
      dispatch(updateQuantity({ id, quantity: currentQty - 1 }));
    }
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart({ id }));
  };

  // ✨ Checkout Logic with Authentication Guard
  const handleCheckout = () => {
    if (!userData) {
      // Agar login nahi hai toh Signin page par bhejo
      // 'state' ka use karke hum wapas cart par la sakte hain login ke baad
      navigate("/signin", { state: { from: "/cart" } });
    } else {
      navigate("/checkout");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-7xl mx-auto mt-5">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition"
            >
              <MdKeyboardBackspace className="w-6 h-6" />
              <span className="font-bold uppercase text-xs tracking-widest">Back to Shop</span>
            </button>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">My Cart</h1>
          </div>

          {cartItems?.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-400 text-lg font-medium">Your cart is feeling light...</p>
              <button
                onClick={() => navigate("/")}
                className="mt-6 px-10 py-4 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-gray-800 transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10">
              {/* LEFT: Cart Items */}
              <div className="lg:w-2/3 space-y-4">
                {cartItems?.map((item) => {
                  const itemSinglePrice = getCleanPrice(item.price);
                  const itemTotalPrice = itemSinglePrice * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-3xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-5 w-full sm:w-auto">
                        <img
                          src={item?.image}
                          alt={item?.name}
                          className="w-24 h-24 object-contain rounded-2xl bg-gray-50 p-2"
                        />
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            {item?.name}
                          </h3>
                          
                          <div className="flex flex-wrap gap-2 py-1">
                            {item.variant?.color && (
                              <span className="text-[9px] font-black uppercase bg-gray-100 px-2 py-1 rounded text-gray-500">
                                {item.variant.color}
                              </span>
                            )}
                            {item.variant?.size && (
                              <span className="text-[9px] font-black uppercase bg-gray-100 px-2 py-1 rounded text-gray-500">
                                Size: {item.variant.size}
                              </span>
                            )}
                          </div>
                          <p className="font-black text-gray-900 mt-1">
                            ₹{itemTotalPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mt-4 sm:mt-0">
                        <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                          <button
                            onClick={() => handleDecrease(item.id, item.quantity)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-100 transition disabled:opacity-30"
                            disabled={item.quantity === 1}
                          >
                            <FaMinus size={10} />
                          </button>
                          <span className="font-black text-sm text-gray-900">
                            {item?.quantity}
                          </span>
                          <button
                            onClick={() => handleIncrease(item.id, item.quantity)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-100 transition"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-3 text-red-400 hover:text-red-600 transition hover:bg-red-50 rounded-xl"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT: Order Summary */}
              <div className="lg:w-1/3">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-50 sticky top-24 space-y-6">
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
                    Order Summary
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>₹{calculatedTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                      <span>Shipping</span>
                      <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Free</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-gray-900">Total</span>
                      <span className="text-2xl font-black text-gray-900">₹{calculatedTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* ✨ Updated Checkout Button Click */}
                  <button
                    onClick={handleCheckout}
                    className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-gray-800 active:scale-95 transition-all"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;