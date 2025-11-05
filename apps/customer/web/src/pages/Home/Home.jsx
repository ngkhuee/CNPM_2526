import React, { useState } from 'react'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = () => {
/*
const [category,setCategory] = useState("All")
*/
const [selectedRestaurant, setSelectedRestaurant] = useState("All");
  return (
    <>
      <Header/>
      {/*
      <ExploreMenu setCategory={setCategory} category={category}/>
      <FoodDisplay filterBy="category" filterValue={category} showFilter={false} />
      */}
      <ExploreMenu selected={selectedRestaurant} setSelected={setSelectedRestaurant} />
      <FoodDisplay filterBy="restaurant" filterValue={selectedRestaurant} showFilter={false} />
      <AppDownload/>
    </>
  )
}

export default Home
