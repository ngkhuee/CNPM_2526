import React, { useState, useEffect } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'

const Add = ({ foods, setFoods, restaurants }) => {
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Pizza"
  })
  const [image, setImage] = useState(null)
  // const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0] || "")

  // Load từ localStorage khi mount
  useEffect(() => {
    const storedFoods = JSON.parse(localStorage.getItem('foods') || '[]')
    setFoods(storedFoods)
  }, [setFoods])

  // const onSubmitHandler = (event) => {
  //   event.preventDefault()
  //   const newFood = {
  //     id: Date.now(),
  //     ...data,
  //     price: Number(data.price),
  //     image: image ? URL.createObjectURL(image) : null,
  //     // restaurantName: selectedRestaurant,
  //     active: true
  //   }
  //   const updatedFoods = [...foods, newFood]
  //   setFoods(updatedFoods)
  //   localStorage.setItem('foods', JSON.stringify(updatedFoods))
  //   toast.success("✅ Product added successfully!")

  //   setData({ name: "", description: "", price: "", category: "Pizza" })
  //   setImage(null)
  // }

  const onSubmitHandler = (event) => {
  event.preventDefault();

  if (!image) {
    toast.error("Please upload an image");
    return;
  }

  const reader = new FileReader();
    reader.onloadend = () => {
      const newFood = {
        id: Date.now(),
        ...data,
        price: Number(data.price),
        image: reader.result, // ✅ lưu dạng base64 thay vì URL tạm
        active: true
      };

      const updatedFoods = [...foods, newFood];
      setFoods(updatedFoods);
      localStorage.setItem('foods', JSON.stringify(updatedFoods));
      toast.success("✅ Product added successfully!");

      setData({ name: "", description: "", price: "", category: "Pizza" });
      setImage(null);
    };

    reader.readAsDataURL(image); // đọc ảnh ra base64
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const formatVND = (value) => {
    if (!value) return ""
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  return (
    <div className='add'>
      <h2 className='add-title'>Add New Product</h2>
      <form className='add-form' onSubmit={onSubmitHandler}>
        <div className='add-left'>
          <p className='label'>Product Image</p>
          <label htmlFor="image" className='upload-box'>
            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="upload" />
            <span>Click to upload</span>
          </label>
          <input 
            type="file" 
            id="image" 
            hidden 
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])} 
            required 
          />
        </div>

        <div className='add-right'>
          {/* <p className='label'>Select Restaurant</p>
          <select value={selectedRestaurant} onChange={(e) => setSelectedRestaurant(e.target.value)}>
            {restaurants.map((res, idx) => (
              <option key={idx} value={res}>{res}</option>
            ))}
          </select> */}

          <p className='label'>Product Name</p>
          <input type="text" name='name' value={data.name} onChange={onChangeHandler} placeholder="Enter product name" required />

          <p className='label'>Description</p>
          <textarea name='description' value={data.description} onChange={onChangeHandler} rows={4} placeholder="Write product description" required />

          <div className='add-bottom'>
            <div className='category-box'>
              <p className='label'>Category</p>
              <select name='category' onChange={onChangeHandler} value={data.category}>
                <option>Pizza</option>
                <option>Pasta</option>
                <option>Chicken</option>
                <option>Wrap</option>
                <option>Burger</option>
                <option>Drink</option>
              </select>
            </div>

            <div className='price-box'>
              <p className='label'>Price</p>
              <input type="number" name='price' value={data.price} onChange={onChangeHandler} placeholder="20000" />
              {data.price && <p className='price-preview'>{formatVND(data.price)}</p>}
            </div>
          </div>

          <button type='submit' className='add-btn'>Add Product</button>
        </div>
      </form>
    </div>
  )
}

export default Add
