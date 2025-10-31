import React, { useContext } from 'react'
import './ExploreMenu.css'
import { assets, menu_list } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext'
/*
 const ExploreMenu = ({category,setCategory}) => {
  const {menu_list} = useContext(StoreContext);
*/
  const ExploreMenu = ({ selected, setSelected }) => {
  const { food_list } = useContext(StoreContext);
  // Lấy danh sách restaurants có trong food_list
  const restaurants = ["All", ...Array.from(new Set(food_list.map(f => f.restaurant)))];

  return (
    <div className='explore-menu' id='explore-menu'>
      <h1>Explore New Restaurants</h1>
      <p className='explore-menu-text'>Choose from a wide selection of restaurants, each offering unique flavors and dining styles. Our mission is to satisfy your cravings and elevate your food journey, one memorable restaurant experience at a time.</p>
      
      {/* <div className="explore-menu-list">
        {menu_list.slice(0,6).map((item,index)=>{
            return (
                <div onClick={()=>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} key={index} className='explore-menu-list-item'>
                    <img src={item.menu_image} className={category===item.menu_name?"active":""} alt="" />
                    <p>{item.menu_name}</p>
                </div>
            )
        })}
      </div> */}

      <div className="explore-menu-list">
      {menu_list.map((item, index) => (
        <div
          key={index}
          className={`explore-menu-list-item ${selected === item.menu_name ? "active" : ""}`}
          onClick={() => setSelected(prev => prev === item.menu_name ? "All" : item.menu_name)}
        >
          <img src={item.menu_image} alt={item.menu_name} />
          <p>{item.menu_name}</p>
        </div>
      ))}
    </div>
      
      <hr />
    </div>
  )
}

export default ExploreMenu
