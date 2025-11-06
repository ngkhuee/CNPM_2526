import React, { useState } from 'react'
import Add from './Add/Add'
import List from './List/List'

const FoodManager = () => {
  const [foods, setFoods] = useState([])

  return (
    <div>
      <Add foods={foods} setFoods={setFoods} />
      <List foods={foods} setFoods={setFoods} />
    </div>
  )
}

export default FoodManager
