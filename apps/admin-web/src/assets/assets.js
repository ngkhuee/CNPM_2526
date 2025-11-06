import logo from "./logo.png";
import add_icon from "./add_icon.png";
import order_icon from "./order_icon.png";
import profile_image from "./profile_image.png";
import upload_area from "./upload_area.png";
import parcel_icon from "./parcel_icon.png";
import drone_icon from "./drone_icon.png";
// ⚠️ menu_* images moved to mock-backend/public/images/restaurants/

// ⚠️ REMOVED: import { food_list } from "../shared/foodData" - file deleted
// Use API services instead: frontend/shared/api/services/foodService.js

export const assets = {
  logo,
  add_icon,
  order_icon,
  profile_image,
  upload_area,
  parcel_icon,
  drone_icon,
};

// ⚠️ restaurant_list REMOVED - Now fetched from API
// Use frontend/shared/api/services/restaurantService.js
// Or use Context if needed
