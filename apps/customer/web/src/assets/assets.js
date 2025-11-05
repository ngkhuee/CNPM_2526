// UI Icons only - Food and Restaurant images now served from backend
import basket_icon from "./basket_icon.png";
import logo from "./logo.png";
import header_img from "./header_img.png";
import search_icon from "./search_icon.png";

import add_icon_white from "./add_icon_white.png";
import add_icon_green from "./add_icon_green.png";
import remove_icon_red from "./remove_icon_red.png";
import app_store from "./app_store.png";
import play_store from "./play_store.png";
import linkedin_icon from "./linkedin_icon.png";
import facebook_icon from "./facebook_icon.png";
import twitter_icon from "./twitter_icon.png";
import cross_icon from "./cross_icon.png";
import selector_icon from "./selector_icon.png";
import rating_starts from "./rating_starts.png";
import profile_icon from "./profile_icon.png";
import bag_icon from "./bag_icon.png";
import logout_icon from "./logout_icon.png";
import parcel_icon from "./parcel_icon.png";

export const assets = {
  logo,
  basket_icon,
  header_img,
  search_icon,
  rating_starts,
  add_icon_green,
  add_icon_white,
  remove_icon_red,
  app_store,
  play_store,
  linkedin_icon,
  facebook_icon,
  twitter_icon,
  cross_icon,
  selector_icon,
  profile_icon,
  logout_icon,
  bag_icon,
  parcel_icon,
};

// ⚠️ TODO: Fetch menu_list/categories from API instead of hardcoded
// For now using backend image URLs
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const menu_list = [
  {
    menu_name: "Belga Pizza",
    menu_image: `${API_URL}/images/restaurants/menu_1.png`,
  },
  {
    menu_name: "Lotteria",
    menu_image: `${API_URL}/images/restaurants/menu_2.png`,
  },
  {
    menu_name: "Pizza 4P's",
    menu_image: `${API_URL}/images/restaurants/menu_3.png`,
  },
  {
    menu_name: "Texas Chicken",
    menu_image: `${API_URL}/images/restaurants/menu_4.png`,
  },
  {
    menu_name: "Today With You",
    menu_image: `${API_URL}/images/restaurants/menu_5.png`,
  },
  {
    menu_name: "Burger King",
    menu_image: `${API_URL}/images/restaurants/menu_6.png`,
  },
  // {
  //     menu_name: "Burger King",
  //     menu_image: menu_7
  // },
  // {
  //     menu_name: "Noodles",
  //     menu_image: menu_8
  // }
];