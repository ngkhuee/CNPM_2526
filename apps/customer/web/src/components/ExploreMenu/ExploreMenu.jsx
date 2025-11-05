import React, { useContext, useMemo } from "react";
import "./ExploreMenu.css";
import { StoreContext } from "customer-shared";

const ExploreMenu = ({ selected, setSelected }) => {
  const { restaurant_list, loading } = useContext(StoreContext);

  // Transform restaurant data for display
  const restaurants = useMemo(() => {
    return restaurant_list.map((r) => ({
      name: r.name,
      image: r.images?.[0] || r.image || "/default-restaurant.png",
    }));
  }, [restaurant_list]);

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore New Restaurants</h1>
      <p className="explore-menu-text">
        Choose from a wide selection of restaurants, each offering unique
        flavors and dining styles. Our mission is to satisfy your cravings and
        elevate your food journey, one memorable restaurant experience at a
        time.
      </p>

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
        {loading ? (
          <p>Đang tải nhà hàng...</p>
        ) : (
          restaurants.map((restaurant, index) => (
            <div
              key={index}
              className={`explore-menu-list-item ${selected === restaurant.name ? "active" : ""}`}
              onClick={() =>
                setSelected((prev) =>
                  prev === restaurant.name ? "All" : restaurant.name
                )
              }
            >
              <img src={restaurant.image} alt={restaurant.name} />
              <p>{restaurant.name}</p>
            </div>
          ))
        )}
      </div>

      <hr />
    </div>
  );
};

export default ExploreMenu;
