import logo from "./logo.png";
import add_icon from "./add_icon.png";
import order_icon from "./order_icon.png";
import profile_image from "./profile_image.png";
import upload_area from "./upload_area.png";
import parcel_icon from "./parcel_icon.png";
import drone_icon from "./drone_icon.png";
import menu_1 from "./menu_1.png";
import menu_2 from "./menu_2.png";
import menu_3 from "./menu_3.png";
import menu_4 from "./menu_4.png";
import menu_5 from "./menu_5.png";
import menu_6 from "./menu_6.png";

import { food_list } from "../shared/foodData";
export { food_list };

export const assets = {
  logo,
  add_icon,
  order_icon,
  profile_image,
  upload_area,
  parcel_icon,
  drone_icon,
};

export const restaurant_list = [
  {
    _id: "r1",
    name: "Belga Pizza",
    category: "Pizza",
    image: menu_1,
    location: { lat: 10.776, lng: 106.7 },
    openedAt: "2018-05-20",
    ownerEmail: "belga@pizza.com",
  },
  {
    _id: "r2",
    name: "Lotteria",
    category: "Chicken",
    image: menu_2,
    location: { lat: 10.8, lng: 106.71 },
    openedAt: "2015-09-01",
    ownerEmail: "contact@lotteria.com",
  },
  {
    _id: "r3",
    name: "Pizza 4P's",
    category: "Pizza",
    image: menu_3,
    location: { lat: 10.77, lng: 106.68 },
    openedAt: "2021-11-15",
    ownerEmail: "info@pizza4ps.com",
  },
  {
    _id: "r4",
    name: "Texas Chicken",
    category: "Wrap",
    image: menu_4,
    location: { lat: 10.774, lng: 106.705 },
    openedAt: "2010-01-01",
    ownerEmail: "texas@chicken.com",
  },
  {
    _id: "r5",
    name: "Today With You",
    category: "Pasta",
    image: menu_5,
    location: { lat: 10.779, lng: 106.701 },
    openedAt: "2025-10-01",
    ownerEmail: "hello@todaywithyou.com",
  },
  {
    _id: "r6",
    name: "Burger King",
    category: "Burger",
    image: menu_6,
    location: { lat: 10.778, lng: 106.702 },
    openedAt: "2022-01-01",
    ownerEmail: "support@burgerking.com",
  },
];

//export const url = 'https://tomato-food-del-backend-p1ni.onrender.com'
