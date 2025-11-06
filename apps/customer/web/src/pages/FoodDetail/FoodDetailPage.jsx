import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FoodDetail } from "shared-ui";
import { AuthContext } from "customer-shared";
import { foodService } from "shared-services";

const FoodDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        setLoading(true);
        const data = await foodService.getById(id);
        setFood(data);
      } catch (error) {
        console.error("Error fetching food:", error);
        alert("Food not found");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFood();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!food) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Food not found
      </div>
    );
  }

  return (
    <FoodDetail
      food={food}
      onClose={() => navigate(-1)}
      userRole="customer"
      currentUserId={user?.id}
    />
  );
};

export default FoodDetailPage;
