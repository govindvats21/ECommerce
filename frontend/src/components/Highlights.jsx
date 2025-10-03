import React from 'react'
import { categories } from "../category";

const Highlights = ({category}) => {
    console.log(category);
      const categoryData = categories.find(cat => cat?.category === category);
      console.log(categoryData.icons);

        if (!categoryData) {
    return <p>No highlights available for "{selectedCategory}"</p>;
  }
  return (
    <>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-gray-700 mt-4">
  {categoryData?.icons.map(({ icon: Icon, label }, idx) => (
    <div key={idx} className="flex flex-col items-center gap-1">
      <Icon className="text-xl text-green-600" />
      <span className="text-sm">{label}</span>
    </div>
  ))}
</div>

  <div className="bg-white rounded-md p-6 max-w-md ">
  <h3 className="font-semibold text-2xl text-green-700 mb-4 border-b-2 border-green-300 pb-2">
    {categoryData?.category}
  </h3>
  <h4 className="text-lg font-medium text-gray-800 mb-3 tracking-wide">
    Highlights
  </h4>

  <ul className="list-disc list-inside text-gray-600 space-y-2">
    {categoryData?.highlights.map((item, idx) => (
      <li key={idx} className="hover:text-green-600 transition-colors cursor-default">
        {item}
      </li>
    ))}
  </ul>
</div>
    </>

  )
}

export default Highlights