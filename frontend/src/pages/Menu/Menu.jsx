import React, { useState } from 'react'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import RestaurantDisplay from '../../components/RestaurantDisplay/RestaurantDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'

const Menu = () => {

  const [category,setCategory] = useState("All")
  const [restaurantCategory, setRestaurantCategory] = useState("All");

  return (
    <>
        {/* <ExploreMenu setCategory={setCategory} category={category}/> */}
        {/* Section 1: Food Display + Search */}
        <FoodDisplay filterBy="category" filterValue={category} showFilter={true} />
        {/* Section 2: Restaurant Display + Filter */}
        <RestaurantDisplay filterBy="category" filterValue={restaurantCategory} showFilter={true} />

        <AppDownload/>
    </>
  )
}

export default Menu
