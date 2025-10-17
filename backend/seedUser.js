import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/userModel.js"; // đường dẫn đến user model

// MongoDB URL, thay đổi nếu cần
const MONGO_URL = "mongodb://localhost:27017/tomato";

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

async function seedUsers() {
  try {
    // Xoá toàn bộ user cũ (nếu muốn reset)
    await User.deleteMany({});

    // Hash password
    const hashedPassword = await bcrypt.hash("12345678", 10);

    // Tạo user mẫu
    const users = [
      {
        name: "Test Customer",
        email: "customer@example.com",
        password: hashedPassword,
        role: "customer",
        address: "123 Nguyễn Trãi, Quận 5, TP.HCM"
      },
      {
        name: "Test Shipper",
        email: "shipper@example.com",
        password: hashedPassword,
        role: "shipper",
        address: "456 Lê Lợi, Quận 1, TP.HCM"
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        address: "789 Hai Bà Trưng, Quận 3, TP.HCM"
      }
    ];

    await User.insertMany(users);
    console.log("Seed users created successfully!");
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedUsers();
