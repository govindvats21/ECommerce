import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { removeFromCart, updateQuantity } from "../redux/userSlice";
import Footer from "../components/Footer";

const CartPage = () => {
  const { cartItems, totalAmount } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const totalItems = cartItems?.reduce((acc, item) => acc + item.quantity, 0);
  const distinctItems = cartItems?.length;

  return (
    <>
<div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-green-600 hover:text-green-800 transition"
          >
            <MdKeyboardBackspace className="w-6 h-6" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
        </div>

        {/* Total Items Info */}
        {cartItems?.length > 0 && (
          <div className="mb-4 text-gray-700 font-medium">
            Total Items: {totalItems} | Distinct Products: {distinctItems}
          </div>
        )}

        {cartItems?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <p className="text-gray-500 text-lg">🛒 Your cart is empty</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-8 py-3 text-white rounded-lg font-medium shadow hover:bg-green-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* LEFT: Cart Items */}
            <div className="lg:w-2/3 space-y-3">
              {cartItems?.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl shadow border-t border-gray-200 p-3 hover:shadow-md transition"
                >
                  {/* Item Info */}
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <img
                      src={item?.image}
                      alt={item?.name}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ₹{item?.price} × {item?.quantity}
                      </p>
                      <p className="font-bold text-green-600 mt-1 text-lg">
                        ₹{(item?.price * item?.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3 mt-4 sm:mt-0">
                    <button
                      onClick={() => handleDecrease(item.id, item.quantity)}
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                      disabled={item.quantity === 1}
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="min-w-[30px] text-center font-medium text-gray-800">
                      {item?.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrease(item.id, item.quantity)}
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                    >
                      <FaPlus size={12} />
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Total + Checkout */}
            <div className="lg:w-1/3">
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Order Summary
                </h2>
                <div className="flex justify-between mb-3 text-gray-700">
                  <span>Items Total</span>
                  <span className="font-medium">₹{totalAmount}</span>
                </div>
                <hr className="my-4 border-gray-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{totalAmount}</span>
                </div>
                <button
                  onClick={() => navigate("/checkout")}
                  className="mt-8 w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium shadow hover:from-green-600 hover:to-green-700 transition"
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
