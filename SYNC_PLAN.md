# 📋 KẾ HOẠCH ĐỒNG BỘ DATA + UI GIỮA MOBILE VÀ WEB

## 🔍 PHÂN TÍCH CẤU TRÚC HIỆN TẠI

### **Web (apps/customer/web)**
```
✅ Dùng chung từ customer-shared:
  - AuthContext, CartContext, OrderContext, GeolocationContext
  - StoreContext (restaurant_list, food_list, user)
  - useRestaurantDetail, useTrackingLogic, useAddresses, useUserOrderHistory

❌ Riêng web:
  - Components: Navbar, Header, Footer, LoginPopup, FoodDisplay, etc.
  - Pages: Home, Menu, RestaurantDetail, Cart, Checkout, Profile, etc.
  - Styles: CSS modules
  - Router: React Router v6

✅ Data source:
  - customer-shared contexts lấy data từ API
```

### **Mobile (apps/customer/mobile)**
```
⚠️ PROBLEM - Không dùng shared context:
  - RestaurantDetailsScreen: Dùng mock data (FIXED ✅)
  - CartScreen: Mix route.params + context
  - Tracking/Orders: Chưa dùng hooks từ shared

❌ Không có components:
  - Tất cả logic đặt trong screens/

❌ Navigation:
  - React Navigation (Stack + Tab)
  - Khác hoàn toàn với web (React Router)

✅ Data source:
  - customer-shared contexts (same as web)
```

### **Customer Shared (apps/customer/shared)**
```
✅ Contexts (lấy data từ API):
  - AuthContext
  - CartContext
  - OrderContext
  - RestaurantContext (FIXED ✅)
  - GeolocationContext (FIXED platform detection ✅)
  - StoreContext (cho web)

✅ Hooks:
  - useRestaurantDetail
  - useTrackingLogic
  - useAddresses
  - useUserOrderHistory
  - useCart
  - useAuth
  - etc.

✅ Utils:
  - cartHelpers
  - orderHelpers
  - statusHelpers
  - etc.
```

---

## 📊 DATA FLOW COMPARISON

### **Current State**
```
WEB:                           MOBILE:
Home.jsx                       HomeScreen.jsx
  ↓                              ↓
StoreContext                   RestaurantContext (shared)
  ↓                              ↓
API Call                       API Call
  ↓                              ↓
restaurant_list              restaurants ✅ DIFFERENT KEYS!
food_list                    
```

### **Problem Keys Mismatch**
| Concept | Web | Mobile (Shared) | Status |
|---------|-----|-----------------|--------|
| Restaurants | `restaurant_list` (StoreContext) | `restaurants` (RestaurantContext) | ❌ MISMATCH |
| Foods | `food_list` (StoreContext) | Should use from restaurant.foods | ❌ SPLIT |
| Cart | `cart` (CartContext) | `cart` (CartContext) | ✅ SAME |
| Orders | `orders` (OrderContext) | `orders` (OrderContext) | ✅ SAME |
| Auth | `user` (AuthContext/StoreContext) | Should use AuthContext | ⚠️ PARTIAL |

---

## 🎯 PHASE 1: UNIFY DATA STRUCTURE (NGẮN HẠN - 1-2 NGÀY)

### **1.1: Fix RestaurantContext - Tạo RestaurantProvider mạnh**
**File**: `apps/customer/shared/src/contexts/RestaurantContext.jsx`

**Current:**
```jsx
export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  // ...
}
```

**Target:**
```jsx
export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Aliases cho backward compatibility web
  const restaurant_list = restaurants; // For web
  const food_list = restaurants.flatMap(r => r.foods || []);
  
  return (
    <RestaurantContext.Provider
      value={{
        restaurants,        // Mobile/New
        restaurant_list,    // Web/Old
        food_list,         // Web/Old
        loading,
        loadingRestaurants: loading, // Alias
        fetchRestaurants,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}
```

### **1.2: Create StoreContext as wrapper (cho Web)**
**File**: `apps/customer/shared/src/contexts/StoreContext.jsx`

```jsx
// Wrapper context that combines multiple contexts for web compatibility
export const StoreContext = createContext();

export const StoreContextProvider = ({ children }) => {
  const { restaurants, loading: restaurantLoading } = useContext(RestaurantContext);
  const { user } = useContext(AuthContext);
  
  const value = {
    restaurant_list: restaurants,
    food_list: restaurants.flatMap(r => r.foods || []),
    user,
    loading: restaurantLoading,
    url: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  };
  
  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}
```

### **1.3: Unify Cart structure**
Đảm bảo `CartContext` có cùng structure cho cả web + mobile:
- items
- addToCart
- removeFromCart
- clearCart
- getTotalCartAmount

---

## 🎯 PHASE 2: FIX MOBILE SCREENS (2-3 NGÀY)

### **2.1: Create shared UI components** 
(Tách logic từ screens để reuse)

**New folder**: `apps/customer/shared/src/components/`
```
shared-ui/
├── RestaurantCard.jsx      (Mobile + Web)
├── FoodItem.jsx            (Mobile + Web)
├── CartItem.jsx
├── OrderCard.jsx
├── TrackingTimeline.jsx
└── StatusBadge.jsx
```

**Approach:**
- Components nhận `Platform` prop hoặc dùng `react-native` + `react-native-web`
- Hoặc tạo từng version cho mobile + web

### **2.2: Fix Mobile Screens - Use proper hooks**
```
HomeScreen.jsx
  ↓ Remove: useContext(RestaurantContext) direct access
  ↓ Add: useRestaurants() hook → abstracted platform differences
  
RestaurantDetailsScreen.jsx
  ↓ Already fixed ✅

CartScreen.jsx
  ↓ Remove: route.params logic
  ↓ Use: CartContext only
  
CheckoutScreen.jsx
  ↓ Extract checkout logic to useCheckout hook

MyOrdersScreen.jsx
  ↓ Use: useUserOrderHistory hook

TrackingScreen.jsx
  ↓ Use: useTrackingLogic hook
```

### **2.3: Add Missing Mobile Components**
```
mobile/src/components/
├── RestaurantCard/
│   └── RestaurantCard.jsx     ← Reuse from shared or create
├── FoodItem/
│   └── FoodItem.jsx
├── CartItemRow/
│   └── CartItemRow.jsx
└── TabBarIcon/
    └── TabBarIcon.jsx
```

---

## 🎯 PHASE 3: CREATE SHARED UI LIBRARY (MEDIUM-TERM - 1 TUẦN)

### **3.1: Setup react-native-web** (Optional pero better)
Cho phép dùng React Native components trên web:

**Approach A - Simple (Recommended now):**
```
shared-ui/package.json:
  peerDependencies: {
    "react": ">=18",
    "react-native": ">=0.70"  // For type definitions
  }

shared-ui/src/RestaurantCard.jsx:
  // Platform-agnostic component
  export const RestaurantCard = ({ restaurant, onPress, style }) => {
    // Render logic here
  }
```

**Approach B - Advanced (Later):**
Migrate web to `react-native-web`:
```
apps/customer/web/
  └── Use react-native components
  └── Metro bundler instead of Vite
```

### **3.2: Shared Components List**
```jsx
// Reusable between mobile + web

// Display components
- RestaurantCard
  - Props: restaurant, onPress, style, compact?
  
- FoodItem
  - Props: food, onPress, onAddToCart, quantity?
  
- CartItemRow
  - Props: item, onRemove, onQuantityChange
  
- OrderCard
  - Props: order, onPress, showRestaurant?
  
- StatusBadge
  - Props: status (pending, confirmed, delivered, etc)
  
- TrackingTimeline
  - Props: events, currentStatus

// Input components
- AddressInput
  - Props: value, onChange, error?
  
- PaymentMethodSelector
  - Props: selected, onChange, methods
```

---

## 🎯 PHASE 4: SYNCHRONIZE NAVIGATION (MEDIUM-TERM - 1 TUẦN)

### **4.1: Map Web Routes to Mobile Screens**
| Web Route | Mobile Screen | Data Transfer |
|-----------|---------------|----------------|
| / | HomeScreen | Via RestaurantContext |
| /menu | (Not in mobile - filter in Home) | - |
| /restaurant/:id | RestaurantDetailsScreen | Via params `restaurantId` |
| /cart | CartScreen | Via CartContext |
| /order | CheckoutScreen | Via CheckoutContext |
| /myorders | MyOrdersScreen | Via OrderContext |
| /tracking/:id | TrackingScreen | Via params `orderId` |
| /profile | ProfileScreen | Via AuthContext |

### **4.2: Deep Linking for Mobile** (Optional)
```jsx
// mobile/App.jsx
const linking = {
  prefixes: ['drone://', 'https://drone.app'],
  config: {
    screens: {
      RestaurantDetails: 'restaurant/:restaurantId',
      Tracking: 'tracking/:orderId',
      Cart: 'cart',
      // etc
    },
  },
};

<NavigationContainer linking={linking}>
  {/* Navigation */}
</NavigationContainer>
```

---

## 📋 DETAILED TODO LIST

### **Phase 1: Unify Data (IMMEDIATE)**
- [ ] 1.1 Fix RestaurantContext - add aliases
- [ ] 1.2 Create StoreContext wrapper
- [ ] 1.3 Verify CartContext is unified
- [ ] 1.4 Fix GeolocationContext platform detection
- [ ] 1.5 Test web still works with new context structure

### **Phase 2: Fix Mobile Screens**
- [ ] 2.1 Fix HomeScreen - validate RestaurantContext usage
- [ ] 2.2 Fix CartScreen - remove route.params fallbacks
- [ ] 2.3 Fix CheckoutScreen - add proper validation
- [ ] 2.4 Fix MyOrdersScreen - use OrderContext
- [ ] 2.5 Fix TrackingScreen - use useTrackingLogic
- [ ] 2.6 Fix ProfileScreen - use AuthContext properly
- [ ] 2.7 Fix LoginScreen - validate flow

### **Phase 3: Create Shared Components (MEDIUM)**
- [ ] 3.1 Create shared-ui package structure
- [ ] 3.2 Extract RestaurantCard component
- [ ] 3.3 Extract FoodItem component
- [ ] 3.4 Extract CartItemRow component
- [ ] 3.5 Extract OrderCard component
- [ ] 3.6 Extract StatusBadge component
- [ ] 3.7 Update web pages to use shared components
- [ ] 3.8 Update mobile screens to use shared components

### **Phase 4: Create Mobile Components**
- [ ] 4.1 Create TabBarIcon component
- [ ] 4.2 Create empty state components
- [ ] 4.3 Create loading state components

### **Phase 5: Testing & Integration**
- [ ] 5.1 Test web with new RestaurantContext
- [ ] 5.2 Test mobile with shared components
- [ ] 5.3 Test data synchronization
- [ ] 5.4 Test navigation flows
- [ ] 5.5 Test offline scenarios

---

## 🔑 KEY PRINCIPLES

### **Golden Rule: Data Synchronization**
- ✅ **Same data** → Use **shared** contexts/hooks
- ✅ **Different UI** → Keep in mobile/web respective folders
- ✅ **Shared UI** → Put in `shared-ui` package

### **Context Usage**
```
✅ Shared Contexts (customer-shared):
  - AuthContext      (User data)
  - CartContext      (Shopping cart)
  - OrderContext     (User orders)
  - RestaurantContext (Restaurant list)
  - GeolocationContext (User location)

⚠️ Web-Only Contexts (if needed):
  - StoreContext     (Wrapper for web, optional)

❌ Never:
  - Local state for global data
  - Different context keys for same data
  - API calls directly in screens
```

### **Component Sharing Rules**
```
🟢 Share: Display logic
  - RestaurantCard
  - FoodItem
  - StatusBadge
  - OrderCard

🔴 Don't share: Platform-specific UI
  - Mobile native components
  - Web CSS-based layouts
  - Navigation containers

🟡 Conditional share: Core logic, platform-specific rendering
  - Use react-native-web or platform-specific files
  - Export base logic, let platform implement UI
```

---

## 🎯 SUCCESS CRITERIA

| Criteria | Current | Target |
|----------|---------|--------|
| Data sync | ❌ Partial | ✅ 100% |
| Context keys mismatch | ❌ Yes | ✅ No |
| Mobile mock data | ❌ Yes | ✅ No |
| Shared components | ❌ 0% | ✅ 30-40% |
| Code duplication | ❌ High | ✅ Low |
| Navigation parity | ⚠️ 70% | ✅ 95% |

---

## 📅 TIMELINE

**Week 1:**
- Phase 1: Unify contexts (2 days)
- Phase 2: Fix mobile screens (3 days)

**Week 2:**
- Phase 3: Create shared-ui components (3-4 days)
- Phase 4: Testing & refinement (2-3 days)

**Week 3+:**
- Optimization
- React-native-web migration (optional)
- Full E2E testing
