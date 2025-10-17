import React, { useState,useContext } from 'react'
import './Add.css'
import { assets } from '../../assets/assets';
import { FoodContext } from '../../Context/FoodContext';

const Add = () => {
        const { setFoodList } = useContext(FoodContext);

        const [data, setData] = useState({
            name: "",
            price: "",
            category: "Salad",
            description: ""
        });

        const [image, setImage] = useState(false);

        // Hàm format tiền Việt
        const formatVND = (value) => {
            if (!value) return "";
            return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            }).format(value);
        };

        const onChangeHandler = (e) => {
            const { name, value } = e.target;
            if (name === "price") {
            const numericValue = value.replace(/\D/g, "");
            setData((prev) => ({ ...prev, [name]: numericValue }));
            } else {
            setData((prev) => ({ ...prev, [name]: value }));
            }
        };


        const onSubmitHandler = (e) => {
        e.preventDefault();

        // Tạo sản phẩm mới
        const newFood = {
        _id: Date.now().toString(), // tạo id tạm
        name: data.name,
        price: Number(data.price),
        category: data.category,
        description: data.description,
        image: image ? URL.createObjectURL(image) : assets.upload_area,
        };

        // Cập nhật vào FoodContext
        setFoodList(prev => [...prev, newFood]);

        // Reset form
        setData({
        name: "",
        price: "",
        description: "",
        category: "Pizza",
        });
        setImage(false);
    };

    return React.createElement(
    "div",
    { className: "add" },
    React.createElement(
      "form",
      { className: "flex-col", onSubmit: onSubmitHandler },
      // Image upload
      React.createElement(
        "div",
        { className: "add-img-upload flex-col" },
        React.createElement("p", null, "Upload image"),
        React.createElement(
          "label",
          { htmlFor: "image" },
          React.createElement("img", {
            src: !image ? assets.upload_area : URL.createObjectURL(image),
            alt: "",
          })
        ),
        React.createElement("input", {
          type: "file",
          id: "image",
          hidden: true,
          required: true,
          onChange: (e) => setImage(e.target.files[0]),
        })
      ),
      // Name
      React.createElement(
        "div",
        { className: "add-product-name flex-col" },
        React.createElement("p", null, "Product name"),
        React.createElement("input", {
          name: "name",
          type: "text",
          placeholder: "Type here",
          value: data.name,
          onChange: onChangeHandler,
          required: true,
        })
      ),
      // Description
      React.createElement(
        "div",
        { className: "add-product-description flex-col" },
        React.createElement("p", null, "Product description"),
        React.createElement("textarea", {
          name: "description",
          rows: 6,
          placeholder: "Write content here",
          value: data.description,
          onChange: onChangeHandler,
          required: true,
        })
      ),
      // Category & Price
      React.createElement(
        "div",
        { className: "add-category-price" },
        React.createElement(
          "div",
          { className: "add-category flex-col" },
          React.createElement("p", null, "Product category"),
          React.createElement(
            "select",
            { name: "category", value: data.category, onChange: onChangeHandler },
            ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"].map(
              (c) => React.createElement("option", { key: c, value: c }, c)
            )
          )
        ),
        React.createElement(
          "div",
          { className: "add-price flex-col" },
          React.createElement("p", null, "Product Price"),
          React.createElement("input", {
            type: "text",
            name: "price",
            placeholder: "25.000 ₫",
            value: data.price ? formatVND(data.price) : "",
            onChange: onChangeHandler,
            required: true,
          })
        )
      ),
      // Submit button
      React.createElement(
        "button",
        { type: "submit", className: "add-btn" },
        "ADD"
      )
    )
  );
}

export default Add
