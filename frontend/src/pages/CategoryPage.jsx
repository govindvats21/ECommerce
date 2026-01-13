import React from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav';
import ItemCard from '../components/ItemCard';
import Footer from '../components/Footer';

const CategoryPage = () => {
  const { userCity, shopsInMyCity, itemsInMyCity, searchItems } = useSelector((state) => state.user);

    const {name} = useParams()
    const matchingItems = itemsInMyCity.filter((item) => item?.category === name)

    
  return (
    <>
    <div className='min-h-screen'>
<Nav />
    <h1 className='mt-27 font-semibold text-lg text-center'>{name}</h1>

{/* Categories */}
<div className="w-full grid grid-cols-2 md:grid-cols-4 sm:grid-cols-4 md:flex md:flex-wrap items-center justify-center mt-7 gap-4 md:px-40 px-2">
  {matchingItems?.map((cate, index) => (
    <ItemCard
   data = {cate}
   key={index}
    />
  ))}
</div>
    </div>
    <Footer />
    </>
  )
}

export default CategoryPage