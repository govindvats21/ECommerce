import React from "react";

// Status + Label pair
const steps = [
  { status: "pending", label: "Order Placed" },
  { status: "preparing", label: "Packed" },
  { status: "out of delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

const OrderProgressBar = ({ status }) => {
  const currentStep = steps.findIndex((step) => step.status === status);

  return (
    <div className="relative w-full mt-6 px-2 sm:px-4">
      {/* Background line */}
      <div className="absolute top-3 left-2 sm:left-4 right-2 sm:right-4 h-1 bg-gray-300 rounded z-0"></div>

      {/* Progress line */}
      <div
        className="absolute top-3 left-2 sm:left-4 right-2 sm:right-4 h-1 bg-green-600 rounded z-0"
        style={{
          width: `${(currentStep / (steps.length - 1)) * 100}%`,
        }}
      ></div>

      <div className="flex justify-between items-center relative z-10">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStep;

          return (
            <div
              key={step.status}
              className="flex flex-col items-center w-1/4 min-w-[50px] text-center"
            >
              {/* Circle */}
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isCompleted
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              {/* Label */}
              <span className="text-[10px] sm:text-xs mt-1">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgressBar;
