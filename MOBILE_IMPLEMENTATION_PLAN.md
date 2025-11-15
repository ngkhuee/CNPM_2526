# 🎯 Chi Tiết Kế Hoạch Triển Khai Mobile (React Native)
**Bản Date**: Nov 15, 2025  
**Status**: DETAILED ANALYSIS & PLANNING  
**Target**: 100% feature parity Web ↔ Mobile

---

## 📊 PHẦN 1: WEB APP (ReactJS) - KIẾN TRÚC HIỆN TẠI

### 1.1 PAGES & ROUTES (Web)

| Route | Component | Purpose | Key Features |
|-------|-----------|---------|--------------|
| `/` | Home.jsx | Landing page | 🗺 GPS location, nearby restaurants, categories, all restaurants |
| `/menu` | Menu.jsx | All foods & filters | 🔍 Search, category filter, sorting |
| `/restaurant/:id` | RestaurantDetail.jsx | Restaurant details | ℹ️ Info, menu, hours, reviews, ratings |
| `/cart` | Cart.jsx | Shopping cart | 📦 Item list, promotions, totals |
| `/order` | PlaceOrder.jsx | Redirect to checkout | ➡️ Validation redirect |
| `/checkout-info` | CheckOutInfo.jsx | Checkout form | 📍 Address, customer info, promo, delivery |
| `/tracking/:id` | Tracking.jsx | Order tracking | 🚚 Live status, delivery map |
| `/myorders` | MyOrders.jsx | Order history | 📜 Past orders, review option |
| `/verify` | Verify.jsx | Email/phone verification | ✅ OTP, verification code |
| `/profile` | Profile.jsx | User profile | 👤 Name, phone, addresses, settings |
| `/payment-momo/:orderId` | PaymentMoMo.jsx | MoMo payment | 💳 Payment processing |
| `/register-restaurant` | RegisterRestaurant.jsx | Restaurant registration | 🏪 Partner signup |

### 1.2 COMPONENTS (Web)

**Layout Components:**
- `Navbar` - Header with logo, search, auth state, cart
- `Footer` - Footer links & info
- `Header` - Page header banner
- `LoginPopup` - Modal login form

**Feature Components:**
- `ExploreMenu` - Category filter section (Nearby, Top Rated, etc.)
- `FoodDisplay` - Food items grid
- `RestaurantDisplay` - Restaurant items grid
- `Cart/CartItems` - Shopping cart items list
- `Cart/CartSummary` - Subtotal, promotions, delivery fee, total
- `Checkout/CheckoutCustomerForm` - Name, phone, email input
- `Checkout/CheckoutAddressSection` - Address selection/input
- `Checkout/CheckoutOrderSummary` - Order details before submit
- `FoodDetailPopup` - Detailed food info modal
- `Tracking/TrackingHeader` - Tracking status header
- `ReviewSection` - Food/restaurant reviews
- `AppDownload` - Download app CTA

### 1.3 CONTEXTS (Shared - customer-shared package)

**📦 StoreContext**
```javascript
State: {
  food_list: Food[],
  restaurant_list: Restaurant[],
  loading: boolean,
  error: string | null
}
Actions: {
  setFoodList,
  setRestaurantList,
  setLoading,
  setError
}
```

**🛒 CartContext**
```javascript
State: {
  cart: {
    restaurant_id: string,
    items: CartItem[]  // { id, name, quantity, price, total }
  },
  totalAmount: number
}
Actions: {
  addItem(food),
  removeItem(foodId),
  updateItem(foodId, quantity),
  clearCart(),
  getTotalCartAmount()
}
```

**👤 AuthContext**
```javascript
State: {
  user: User | null,
  token: string | null,
  isLoggedIn: boolean,
  isLoading: boolean,
  error: string | null
}
Actions: {
  login(email, password),
  register(data),
  logout(),
  updateProfile(data),
  initializeAuth()
}
```

**📍 GeolocationContext**
```javascript
State: {
  userLocation: { lat, lng } | null,
  geoLoading: boolean,
  locationPermissionDenied: boolean,
  error: string | null
}
Actions: {
  requestLocation(),
  getCurrentPosition(),
  watchPosition()
}
```

**📋 OrderContext**
```javascript
State: {
  orders: Order[],
  currentOrder: Order | null,
  loading: boolean,
  error: string | null
}
Actions: {
  addOrder(orderData),
  fetchOrders(userId),
  fetchOrderById(orderId),
  cancelOrder(orderId),
  updateOrderStatus(orderId, status)
}
```

**🏪 RestaurantContext**
```javascript
State: {
  currentRestaurant: Restaurant | null,
  loading: boolean,
  error: string | null
}
Actions: {
  fetchRestaurant(id),
  searchRestaurants(query),
  filterRestaurants(criteria)
}
```

### 1.4 HOOKS (Shared - customer-shared package)

**Core Hooks:**
- `useAuth()` - Auth state & methods
- `useCart()` - Cart operations
- `useGPSLocation()` - GPS & geocoding
- `useGeolocation()` - Permission & location
- `useCheckout()` - Checkout logic
- `useAddresses()` - Address CRUD
- `usePromotions()` - Promo filtering
- `useSettings()` - App settings
- `useOrderTracking()` - Real-time tracking
- `useReview()` - Review form & submit
- `useOrderFiltering()` - Filter orders
- `useRestaurantDetail()` - Fetch restaurant data
- `useProfileForm()` - Profile form state & validation

### 1.5 SERVICES & API (shared-services)

**📡 authService**
```
Methods:
- login(email, password) → { user, token }
- register(userData) → { user, token }
- logout()
- getToken() → string
- setToken(token)
- isAuthenticated() → boolean
- refreshToken()
```

**🌐 API Endpoints (via apiClient)**
```
User:
  POST   /api/users/register
  POST   /api/users/login
  GET    /api/users/:id
  PATCH  /api/users/:id
  GET    /api/users/:id/addresses
  POST   /api/users/:id/addresses
  PUT    /api/users/:id/addresses/:addressId
  DELETE /api/users/:id/addresses/:addressId

Restaurants:
  GET    /api/restaurants
  GET    /api/restaurants/:id
  GET    /api/restaurants/:id/menu
  GET    /api/restaurants/search

Foods:
  GET    /api/foods
  GET    /api/foods/:id
  GET    /api/foods/restaurant/:restaurantId

Cart:
  GET    /api/cart (implicit in CartContext)
  POST   /api/cart/items
  PUT    /api/cart/items/:itemId
  DELETE /api/cart/items/:itemId

Orders:
  POST   /api/orders
  GET    /api/orders
  GET    /api/orders/:id
  PATCH  /api/orders/:id
  DELETE /api/orders/:id

Payments:
  POST   /api/payments/momo
  GET    /api/payments/:id
  PATCH  /api/payments/:id

Promotions:
  GET    /api/promotions
  GET    /api/promotions/restaurant/:restaurantId

Addresses (Geocoding):
  POST   /api/geocode (forward geocoding)
  POST   /api/reverse-geocode (reverse geocoding)
```

### 1.6 STYLING & UI LIBRARIES (Web)

**CSS Framework:**
- ✅ Tailwind CSS (not confirmed - check actual usage)
- ✅ CSS Modules (Cart.css, CheckOutInfo.css, etc.)
- ✅ React Icons (MdLocationOn, MdRestaurant, MdError, etc.)

**UI Libraries:**
- ❌ React Router DOM (web-only)
- ✅ React Toastify (notifications - need equivalent in mobile)
- ❌ Stripe JS (web-only payment)

### 1.7 KEY USER FLOWS (Web)

#### Flow 1: User Registration & Login
```
1. User clicks "Register" or "Login" → LoginPopup opens
2. Enter email & password
3. → authService.login/register()
4. → AuthContext updates with user & token
5. Token saved to localStorage
6. Redirect to home or previous page
```

#### Flow 2: Browse Restaurants & Food
```
1. Home page loads
2. Request GPS → GeolocationContext.requestLocation()
3. Show nearby restaurants (filtered by distance)
4. Show categories → User selects category
5. Show foods in category
6. User clicks food → FoodDetailPopup opens
7. View nutrition, reviews, etc.
```

#### Flow 3: Add to Cart
```
1. User selects quantity in FoodDetailPopup
2. Click "Add to Cart"
3. → CartContext.addItem(food)
4. Toast notification
5. User can continue browsing or go to cart
```

#### Flow 4: Checkout
```
1. User goes to cart → /cart
2. Sees cart items, applies promotion
3. Click "Checkout" → /order (redirect)
4. → /checkout-info
5. Fill customer info (name, phone, email)
6. Select delivery address (or enter new one)
7. Confirm GPS location or enter address
8. Select payment method
9. Click "Place Order"
10. → POST /api/orders
11. → OrderContext.addOrder()
12. → /tracking/:orderId
```

#### Flow 5: Track Order
```
1. User goes to /tracking/:orderId
2. Show order status: preparing → delivering → delivered
3. Show driver location on map (if available)
4. Show real-time updates
5. Option to call driver or cancel order
```

#### Flow 6: Review Order
```
1. After order delivered
2. Show "Write Review" button
3. User rates & comments
4. → POST /api/reviews
5. Review saved
```

#### Flow 7: User Profile
```
1. User goes to /profile
2. Edit name, phone, email
3. Manage saved addresses
4. View order history
5. Settings
6. Logout
```

---

## 📱 PHẦN 2: MOBILE APP (React Native) - HIỆN TẠI CÓ GÌ, THIẾU GÌ

### 2.1 MOBILE SCREENS - STRUCTURE

**Đã có screens:**
- ✅ HomeScreen
- ✅ MenuScreen
- ✅ FoodDetailScreen
- ✅ RestaurantDetailScreen
- ✅ CartScreen
- ✅ CheckoutScreen (implied)
- ✅ LoginScreen
- ✅ VerifyScreen
- ✅ MyOrdersScreen
- ✅ TrackingScreen
- ✅ ProfileScreen

**✅ MAPPING: Web Pages → Mobile Screens**

| Web Page | Mobile Screen | Status |
|----------|---------------|--------|
| / | HomeScreen | ✅ Partial (có basic layout, chưa đầy đủ features) |
| /menu | MenuScreen | ✅ Partial |
| /restaurant/:id | RestaurantDetailScreen | ✅ Partial |
| /cart | CartScreen | ✅ Partial (quá đơn giản, thiếu promo) |
| /checkout-info | CheckoutScreen | ❌ CHƯA CÓ |
| /tracking/:id | TrackingScreen | ✅ Partial |
| /myorders | MyOrdersScreen | ✅ Partial |
| /profile | ProfileScreen | ✅ Partial |
| /verify | VerifyScreen | ✅ Tồn tại nhưng cần kiểm tra |
| /payment-momo/:orderId | PaymentScreen | ❌ CHƯA CÓ |
| /register-restaurant | - | ⚠️ Not applicable for customer app |

### 2.2 MOBILE COMPONENTS - HIỆN TẠI CÓ GÌ

**Folder Structure:**
```
src/components/
├── common/
│   ├── Button
│   ├── Input
│   ├── Header
│   ├── ExploreMenu
│   ├── EmptyState
│   └── ...
├── cart/
│   ├── CartItem
│   └── CartSummary
├── food/
│   └── FoodDisplay
├── restaurant/
│   └── RestaurantDisplay
├── tracking/
│   └── ...
└── ...
```

**Vấn đề hiện tại:**
- ❌ Components không dùng shared UI library (nếu có)
- ⚠️ Styling không consistent với web (React Native styles khác CSS)
- ❌ Form components (CheckoutCustomerForm, CheckoutAddressSection) CHƯA CÓ

### 2.3 MOBILE NAVIGATION - HIỆN TẠI

**SimpleNavigator (custom):**
```javascript
- Conditional rendering instead of React Navigation
- Two main screens: 'Auth' vs 'Main' (tab-based)
- useSimpleNavigation() hook for navigation
- Tab screens: Home, Menu, Cart, Orders, Profile
```

**Vấn đề:**
- ⚠️ Custom navigator - may have bugs, hard to maintain
- ❌ No deep linking support
- ❌ No proper stack navigation for details
- ❌ May not handle Android back button properly

### 2.4 MOBILE AUTHENTICATION - HIỆN TẠI

**AuthContext (local, mobile-specific):**
```javascript
- login(user, token)
- logout()
- getAuth() → { user, token, isAuthenticated }
- Stores in AsyncStorage (via storage abstraction)
```

**Status:** ✅ Basic implementation done, but need to verify:
- Does it sync with shared AuthContext?
- Does it handle token refresh?
- Does it handle session expiry?

### 2.5 MOBILE CONTEXTS & STATE - HIỆN TẠI

**Using from shared (customer-shared):**
- ✅ StoreContext (food_list, restaurant_list)
- ✅ CartContext (cart items)
- ✅ OrderContext (orders)
- ✅ GeolocationContext (GPS)

**Local (mobile-specific):**
- ✅ AuthContext (navigation handling)

**Status:** ✅ Mostly OK, but screens were importing wrong paths (fixed in last session)

### 2.6 MOBILE STYLING & UI LIBRARIES

**Current Setup:**
- React Native built-in: View, Text, ScrollView, StyleSheet
- React Native Vector Icons (for icons)
- Custom styles folder (colors.js, spacing.js, typography.js)
- NO Tailwind, NO Material UI

**Vấn đề:**
- ⚠️ Styling may not match web aesthetic
- ❌ No form validation component library
- ❌ No toast/notification equivalent (web has react-toastify)
- ❌ No map component for tracking (web may use one?)

### 2.7 MOBILE SERVICES & API - HIỆN TẠI

**Current:**
- ✅ Uses shared authService from shared-services
- ✅ Uses shared apiClient
- ✅ Initialized with AsyncStorage adapter

**Status:** ✅ Should be working after platform abstraction

### 2.8 MOBILE PLATFORM ABSTRACTION - HIỆN TẠI

**Created (from last session):**
- ✅ `shared-services/src/utils/storage.js` - localStorage/AsyncStorage abstraction
- ✅ `shared-services/src/utils/geolocation.js` - navigator.geolocation/expo-location abstraction

**Initialization:**
- ✅ Mobile index.js calls initStorage(AsyncStorage) and initGeolocation()
- ✅ Web auto-fallback (no setup needed)

**Status:** ✅ Should work after fixing runtime issues

---

## 🚨 PHẦN 3: PROBLEM ANALYSIS - CÁC VẤN ĐỀ CẦN SỬA

### 3.1 MISSING SCREENS/FLOWS

| Issue | Severity | Impact | Solution |
|-------|----------|--------|----------|
| CheckoutScreen CHƯA CÓ | 🔴 Critical | Không thể checkout | Create CheckoutScreen based on web CheckOutInfo.jsx |
| PaymentScreen CHƯA CÓ | 🔴 Critical | Không thể thanh toán MoMo | Create PaymentScreen (MoMo integration) |
| VerifyScreen functionality | 🟡 Medium | OTP verification broken? | Verify/fix VerifyScreen implementation |

### 3.2 MISSING COMPONENTS/FEATURES

| Component | Status | Impact | Solution |
|-----------|--------|--------|----------|
| CheckoutCustomerForm | ❌ Missing | Can't input customer info | Create from web version |
| CheckoutAddressSection | ❌ Missing | Can't select/input address | Create from web version |
| CheckoutOrderSummary | ❌ Missing | Can't review order before submit | Create from web version |
| CartSummary (with promo) | ⚠️ Incomplete | Promotions not applied | Enhance current CartSummary |
| TrackingHeader | ⚠️ Partial | Status display may be incomplete | Enhance from web version |
| ReviewSection | ⚠️ Partial | Review UI incomplete | Create based on web ReviewSection |
| Notifications/Toast | ❌ Missing | No user feedback | Add native alert or Toast library |

### 3.3 UI/UX DISCREPANCIES

| Area | Web | Mobile | Status |
|------|-----|--------|--------|
| Navbar/Header | Fixed navbar | Screen-specific headers | ✅ Acceptable |
| Footer | Yes | No | ✅ OK (mobile doesn't need) |
| Forms | React form lib | Native TextInput | ⚠️ May differ in validation |
| Modals | React-based popups | Native modals | ✅ Acceptable |
| Icons | React Icons (SVG) | React Native Vector Icons (TrueType) | ✅ Acceptable |
| Colors/Spacing | CSS-based | Styles object | ⚠️ Need to ensure consistency |
| Notifications | react-toastify | ? (need to add) | ❌ Missing |

### 3.4 NAVIGATION ISSUES

| Issue | Current | Problem | Solution |
|-------|---------|---------|----------|
| Deep linking | ❌ Not supported | Can't open app to specific screen | Add React Navigation deep linking |
| Back button | ❌ Uncertain | Android back may not work | Implement proper stack navigation |
| Screen transitions | Basic | No smooth animations | Add React Navigation animations |
| Auth persistence | ⚠️ Maybe | Login may not persist on app restart | Verify AuthContext initialization |

### 3.5 DATA SYNC & STATE ISSUES

| Issue | Status | Impact | Solution |
|-------|--------|--------|----------|
| Cart sync web ↔ mobile | ⚠️ Uncertain | May have different carts | Ensure server-side cart or sync |
| Order sync | ⚠️ Uncertain | Orders may not sync | Server-side orders (should work) |
| Profile sync | ⚠️ Uncertain | Profile changes may not sync | Server-side profile (should work) |
| Favorites | ❌ Not checked | May not be implemented | Verify if needed |

### 3.6 RUNTIME/BUILD ISSUES

| Issue | Status | Cause | Solution |
|-------|--------|-------|----------|
| `npm start` failing | 🔴 YES | TypeScript/Babel/Metro issues | Check error logs, fix build config |
| Missing packages | ⚠️ Possibly | customer-shared not installed? | Verify monorepo setup |
| Platform abstraction errors | ⚠️ Possibly | Storage/geolocation adapter issues | Debug initialization in index.js |

---

## 📋 PHẦN 4: IMPLEMENTATION ROADMAP (CHI TIẾT)

### Phase 1: FIX FOUNDATION (Days 1-2)
**Goal:** Get mobile app running without errors

**Tasks:**
1. [ ] Debug `npm start` error
   - Check terminal output in detail
   - Fix TypeScript errors
   - Fix Babel/Metro config if needed
   
2. [ ] Verify all dependencies installed
   - Check if `customer-shared` package linked
   - Check if `shared-services` accessible
   
3. [ ] Test platform abstraction
   - Verify storage.js initialization
   - Verify geolocation.js initialization
   - Check AsyncStorage is working

4. [ ] Verify contexts are working
   - AuthContext auth flow
   - StoreContext data loading
   - CartContext operations

**Deliverable:** ✅ App starts and basic screens render

---

### Phase 2: CHECKOUT FLOW (Days 3-4)
**Goal:** Create complete checkout experience

**Tasks:**

2.1 Create CheckoutScreen (Mirror CheckOutInfo.jsx)
```
Features needed:
- Customer form (name, phone, email)
- Address selection/input
- GPS location confirmation
- Promotion application
- Order summary
- Submit button → POST /api/orders
```

2.2 Create CheckoutCustomerForm component
```
Inputs:
- name (text)
- phone (text)
- email (text)
Props:
- initialValues
- onSubmit
- errors
```

2.3 Create CheckoutAddressSection component
```
Features:
- List saved addresses (from useAddresses hook)
- Select address option
- Enter new address option
- GPS location button
- Address validation
```

2.4 Create CheckoutOrderSummary component
```
Display:
- Restaurant name
- Order items (food name, qty, price)
- Subtotal
- Applied promotion (discount)
- Delivery fee
- Total
```

2.5 Update CartScreen
```
Add:
- Apply promotion functionality
- Show applicable promotions
- Promo code input
- Discount display
- Better checkout UX
```

**Deliverable:** ✅ User can complete checkout flow (cart → checkout → order confirmation)

---

### Phase 3: PAYMENT FLOW (Days 5-6)
**Goal:** Integrate MoMo payment

**Tasks:**

3.1 Create PaymentScreen
```
Features:
- Order details review
- Payment methods (MoMo, COD, etc.)
- Payment status display
- Redirect to MoMo (if web version does)
- Handle payment callback
Props/Routes:
- orderId (from URL params)
- onPaymentSuccess → show order confirmation
- onPaymentFailed → show error & retry
```

3.2 Create payment service integration
```
Methods needed:
- initiatePayment(orderId, amount)
- handlePaymentCallback(response)
- checkPaymentStatus(orderId)
```

3.3 Integrate with OrderContext
```
- Update order status after payment
- Clear cart after successful payment
- Handle payment errors
```

**Deliverable:** ✅ User can process payment via MoMo

---

### Phase 4: ORDER TRACKING (Days 7-8)
**Goal:** Complete tracking experience

**Tasks:**

4.1 Enhance TrackingScreen
```
Display:
- Order status badge
- Status timeline (preparing → delivering → delivered)
- Driver info (if assigned)
- Live driver location map
- Delivery time estimate
- Contact driver button
- Report issue button
```

4.2 Create/integrate live tracking
```
Features:
- Real-time order status updates (WebSocket or polling)
- Driver location updates
- Order timeline
- Notifications for status changes
```

4.3 Implement status change notifications
```
- Order confirmed
- Preparing
- Ready for delivery
- Driver assigned
- On the way
- Delivered
```

**Deliverable:** ✅ User can track order in real-time

---

### Phase 5: USER MANAGEMENT (Days 9-10)
**Goal:** Complete profile & auth flows

**Tasks:**

5.1 Verify LoginScreen & AuthContext
```
Check:
- Login success → correct token storage
- Session persistence on app restart
- Token refresh on expiry
- Error handling
```

5.2 Create/Fix VerifyScreen
```
Features:
- OTP input (4-6 digits)
- Resend OTP button
- Submit button
- Error messages
- Handle verification failure
```

5.3 Enhance ProfileScreen
```
Features:
- Edit profile (name, phone, email)
- Manage addresses (list, add, delete, edit)
- View order history
- View settings
- Logout button
- Account deletion option
```

5.4 Create AddressManagement component
```
Features:
- List saved addresses
- Add new address (with GPS option)
- Edit address
- Delete address
- Set as default
- Map display of address
```

**Deliverable:** ✅ User profile & authentication fully functional

---

### Phase 6: SEARCH & FILTER (Days 11-12)
**Goal:** Complete discovery features

**Tasks:**

6.1 Enhance MenuScreen
```
Features:
- Search by food name
- Filter by category
- Filter by restaurant
- Sort (price, rating, new, etc.)
- Display results with pagination/lazy load
```

6.2 Enhance HomeScreen
```
Features:
- Category filter (Nearby, Top Rated, etc.)
- Nearby restaurants (GPS-based, distance sorted)
- Recommended foods
- Recently viewed
- Trending foods
```

6.3 Create SearchScreen
```
Features:
- Search bar (global search)
- Search history
- Search suggestions
- Filter results
- Results for foods AND restaurants
```

**Deliverable:** ✅ User can search and filter all content

---

### Phase 7: REVIEWS & RATINGS (Days 13-14)
**Goal:** Complete review system

**Tasks:**

7.1 Create ReviewForm component
```
Features:
- Star rating (1-5)
- Text review input
- Photo upload (optional)
- Submit button
- Validation
```

7.2 Add review UI to screens
```
Places:
- FoodDetailScreen → Review this food
- MyOrdersScreen → Review food after delivery
- RestaurantDetailScreen → Review restaurant
```

7.3 Integrate review service
```
Methods:
- submitFoodReview(foodId, rating, text)
- submitRestaurantReview(restaurantId, rating, text)
- fetchReviews(foodId or restaurantId)
```

**Deliverable:** ✅ User can write and view reviews

---

### Phase 8: NOTIFICATIONS & UX (Days 15-16)
**Goal:** Polish user experience

**Tasks:**

8.1 Add toast/notification library
```
Options:
- react-native-toast-message
- React Native Notifee (for push notifications)
- Native Alert API (simple)
Choose based on current implementation
```

8.2 Add notifications for key events
```
Events:
- Login success/failure
- Add to cart
- Remove from cart
- Checkout success
- Order placed
- Order status changes (push notifications)
- Payment success/failure
- Profile updated
- Address added/deleted
- Review submitted
```

8.3 Optimize performance
```
- Lazy load images
- Implement pagination
- Optimize list rendering
- Reduce API calls (caching)
- Optimize state updates
```

8.4 Polish UI/UX
```
- Consistent spacing
- Consistent fonts
- Consistent colors
- Loading states on all screens
- Error states & error messages
- Empty states for lists
- Smooth animations/transitions
```

**Deliverable:** ✅ App is polished and production-ready

---

### Phase 9: INTEGRATION & TESTING (Days 17-18)
**Goal:** Ensure everything works together

**Tasks:**

9.1 Integration testing
```
Test flows:
- Registration → Login → Browse → Add to cart → Checkout → Payment → Tracking
- Guest browse → Add to cart → Prompt login → Login → Checkout
- Auto-logout on session expiry
- Profile edit → Sync across screens
- Address management
```

9.2 Platform-specific testing
```
- Test on Android device/emulator
- Test on iOS device/emulator (if available)
- Test web version (via expo web)
- Test navigation (back button, deep linking)
```

9.3 Fix compatibility issues
```
- iOS-specific styling
- Android-specific styling
- Screen size responsive design
- Notch/safe area handling
- Keyboard behavior
```

**Deliverable:** ✅ All flows working end-to-end

---

### Phase 10: DEPLOYMENT & CLEANUP (Days 19-20)
**Goal:** Prepare for production

**Tasks:**

10.1 Cleanup code
```
- Remove console.log statements
- Remove debug code
- Remove unused imports
- Consistent code formatting
- Comment critical code
```

10.2 Prepare build
```
- Test production build
- Optimize bundle size
- Test performance
```

10.3 Documentation
```
- Update README.md
- Document screen flows
- Document component APIs
- Document environment setup
```

10.4 Version control
```
- Review all changes
- Commit organized changes
- Tag release version
```

**Deliverable:** ✅ App ready for submission/deployment

---

## 🔧 PHẦN 5: TECHNICAL SPECIFICATIONS

### 5.1 SCREEN SPECS - DETAILED

#### HomeScreen
**Purpose:** Landing & browsing
**Layout:**
```
┌─────────────────┐
│     Header      │ (Safe area)
├─────────────────┤
│  Nearby Restaurants │ (if GPS granted)
│  [List scrollable]  │
├─────────────────┤
│  Categories     │
│  [Horizontal]   │
├─────────────────┤
│  Featured Foods │
│  [Grid]         │
├─────────────────┤
│  All Restaurants│
│  [Grid]         │
└─────────────────┘
```

**Data Sources:**
- StoreContext.restaurant_list
- StoreContext.food_list
- GeolocationContext.userLocation

**Actions:**
- `onFoodPress` → navigate to FoodDetail
- `onRestaurantPress` → navigate to RestaurantDetail
- `onRequestLocation` → GeolocationContext.requestLocation()

**Validation:**
- ⚠️ If no restaurants → show empty state
- ⚠️ If GPS denied → show "Enable GPS" button
- ⚠️ If loading → show skeleton or spinner

---

#### MenuScreen
**Purpose:** Browse all foods with filters
**Layout:**
```
┌─────────────────┐
│  Search Bar     │
├─────────────────┤
│  Filters        │
│  [Category tabs]│
├─────────────────┤
│  Food List      │
│  [Scrollable]   │
│  [Lazy load]    │
└─────────────────┘
```

**Data Sources:**
- StoreContext.food_list

**Actions:**
- `onSearch` → filter locally
- `onCategorySelect` → filter
- `onSort` → sort (price, rating, new)
- `onFoodPress` → navigate to FoodDetail

**Validation:**
- ⚠️ If no results → show empty state with suggestion

---

#### CheckoutScreen (NEW)
**Purpose:** Complete checkout process
**Layout:**
```
┌─────────────────────┐
│  Customer Info Form │
├─────────────────────┤
│  Address Section    │
├─────────────────────┤
│  Order Summary      │
├─────────────────────┤
│  Payment Method     │
├─────────────────────┤
│  [Place Order Btn]  │
└─────────────────────┘
```

**Data Sources:**
- AuthContext.user
- CartContext.cart
- useAddresses hook
- useGPSLocation hook
- usePromotions hook

**Actions:**
- Validate form
- Select address (saved or new)
- Get GPS location
- Apply promotion code
- Submit order → POST /api/orders
- On success → navigate to Tracking

**Validation:**
- ⚠️ Name required, phone required
- ⚠️ Address validation (street + city + zip)
- ⚠️ Promo code validation
- ⚠️ Cart items validation

---

#### PaymentScreen (NEW)
**Purpose:** Process payment
**Layout:**
```
┌─────────────────┐
│  Order Summary  │
├─────────────────┤
│  Payment Methods│
│  [Radio select] │
├─────────────────┤
│  Payment Details│
├─────────────────┤
│  [Pay Button]   │
└─────────────────┘
```

**Data Sources:**
- OrderContext.currentOrder
- Payment methods from settings

**Actions:**
- Select payment method
- Process payment → MoMo API
- Handle callback → update order status
- On success → navigate to Tracking
- On failure → show error & retry

---

#### TrackingScreen
**Purpose:** Real-time order tracking
**Layout:**
```
┌─────────────────────┐
│  Status Badge       │
├─────────────────────┤
│  Timeline           │
│  (Status Progress)  │
├─────────────────────┤
│  Driver Info        │
│  [Name, photo, tel] │
├─────────────────────┤
│  Live Map           │
│  [Driver location]  │
├─────────────────────┤
│  Estimated Time     │
└─────────────────────┘
```

**Data Sources:**
- OrderContext.currentOrder
- Real-time updates (WebSocket or polling)
- Driver location data

**Actions:**
- Call driver
- Report issue
- Cancel order (if eligible)
- Auto-refresh status

---

#### ProfileScreen
**Purpose:** User profile & settings
**Layout:**
```
┌──────────────────┐
│  Profile Header  │
│  [Avatar, name]  │
├──────────────────┤
│  Edit Profile    │
├──────────────────┤
│  My Addresses    │
├──────────────────┤
│  Settings        │
├──────────────────┤
│  About           │
├──────────────────┤
│  [Logout]        │
└──────────────────┘
```

**Data Sources:**
- AuthContext.user
- useAddresses hook

**Actions:**
- Edit name, phone, email
- Manage addresses
- Change settings
- Logout

---

### 5.2 COMPONENT SPECS - DETAIL

#### CheckoutCustomerForm
```javascript
Props:
  initialValues: {
    name: string,
    phone: string,
    email: string
  },
  onSubmit: (values) => void,
  errors?: { name?, phone?, email? },
  isLoading?: boolean

Validation:
  - name: required, min 2 chars
  - phone: required, valid format
  - email: required, valid email

Behavior:
  - TextInput fields (name, phone, email)
  - Disabled while loading
  - Show field errors
  - On submit, validate & call onSubmit
```

#### CheckoutAddressSection
```javascript
Props:
  addresses: Address[],
  selectedId: string | null,
  onSelectAddress: (id) => void,
  onUseNewAddress: () => void,
  onAddressChange: (address) => void,
  userLocation: { lat, lng } | null,
  onRequestGPS: () => void

Behavior:
  - List saved addresses with radio buttons
  - "Use new address" option
  - Input fields for manual address entry
  - "Get from GPS" button
  - Show selected address on map
  - Address validation
```

#### CheckoutOrderSummary
```javascript
Props:
  cart: Cart,
  appliedPromo: Promotion | null,
  deliveryFee: number

Display:
  - Restaurant name
  - Order items table
  - Subtotal
  - Discount (if promo applied)
  - Delivery fee
  - Total (bold, large)
```

---

### 5.3 DATA FLOW DIAGRAMS

#### Authentication Flow
```
LoginScreen
  ↓ (email, password)
  → authService.login()
    ↓
    → API POST /api/users/login
      ↓
      ← { user, token }
        ↓
        → AuthContext.login(user, token)
          ↓
          → storage.setItem('token', token)
          → storage.setItem('user', JSON.stringify(user))
            ↓
            ← useAuth hook updated
              ↓
              → SimpleNavigator switches to 'Main' screen
                ↓
                ✅ User logged in
```

#### Add to Cart Flow
```
FoodDetailScreen
  ↓ (food, quantity)
  → CartContext.addItem(food, quantity)
    ↓
    → Check if new restaurant
      ├─ YES: Clear old cart, add new
      └─ NO: Add to existing cart
        ↓
        → Update local state
          ↓
          → Toast: "Added to cart"
            ↓
            ✅ CartContext.cart updated
```

#### Checkout Flow
```
CartScreen → CheckoutScreen
  ↓
  useCheckoutValidation()
  useAddressManagement()
  useGPSLocation()
  usePromotions()
    ↓
  User fills form + selects address
    ↓
  Apply promotion (optional)
    ↓
  Click "Place Order"
    ↓
  → useCheckoutProcessing.processCheckoutOrders()
    ↓
    → Validate address
      ↓
      → Create order object
        ↓
        → POST /api/orders
          ↓
          ← { orderId, status }
            ↓
            → OrderContext.addOrder()
            → CartContext.clearCart()
            → storage.clearItem('currentPromo')
              ↓
              → Navigate to /tracking/{orderId}
                ↓
                ✅ Order placed
```

---

### 5.4 STATE MANAGEMENT ARCHITECTURE

**❌ PROBLEM:** Screens were importing from local mobile contexts instead of shared

**✅ SOLUTION (from last session):** All screens now import from `customer-shared`

**Architecture:**
```
app.jsx
  ↓
  ├─ AuthProvider (local - mobile only)
  │   └─ For navigation state only
  │
  ├─ StoreContextProvider (shared)
  │   └─ food_list, restaurant_list, loading
  │
  ├─ CartProvider (shared)
  │   └─ cart items, operations
  │
  ├─ OrderProvider (shared)
  │   └─ orders, order operations
  │
  └─ GeolocationProvider (shared)
      └─ GPS location, permissions
```

**Data persistence:**
```
localStorage (web) ↔ [Platform Abstraction] ↔ AsyncStorage (mobile)
                      └─ storage.js
                      └─ geolocation.js
                      └─ apiClient.js (interceptors)
```

---

## ✅ PHẦN 6: VALIDATION CHECKLIST

### Pre-Implementation Verification

- [ ] npm start works without errors
- [ ] All contexts initialized properly
- [ ] Platform abstraction working (storage, geolocation)
- [ ] API calls working via shared apiClient
- [ ] AuthContext persists token on restart

### Per-Phase Verification

**Phase 1 (Foundation):**
- [ ] App renders without crashes
- [ ] Screens load with data
- [ ] Navigation between screens works
- [ ] Context state changes propagate to UI
- [ ] AsyncStorage accessible (for debug, test write/read)

**Phase 2 (Checkout):**
- [ ] CheckoutScreen renders
- [ ] Form validation works
- [ ] Address selection works
- [ ] Promotion application works
- [ ] Order submission works
- [ ] Order created in backend
- [ ] Clear cart after submission

**Phase 3 (Payment):**
- [ ] PaymentScreen renders
- [ ] MoMo payment initiation works
- [ ] Payment callback handled
- [ ] Order status updated after payment
- [ ] User redirected to tracking

**Phase 4 (Tracking):**
- [ ] TrackingScreen shows order details
- [ ] Status updates in real-time
- [ ] Driver location updates
- [ ] Notifications sent for status changes
- [ ] Contact driver works

**Phase 5 (User Management):**
- [ ] Login/logout works
- [ ] Session persists on app restart
- [ ] Profile edit works
- [ ] Address management works
- [ ] Verify screen works (if applicable)

---

## 🎯 FINAL SUMMARY

### What We're Building
A complete React Native mobile app that mirrors all features of the React web app, sharing 90%+ of business logic through a platform abstraction layer.

### Key Principles
1. **Maximum code reuse** - Share contexts, hooks, services
2. **Platform abstraction** - Storage, geolocation, API
3. **Graceful degradation** - Mobile-first features (GPS), but browseable without auth
4. **100% feature parity** - Every web feature works on mobile

### Success Criteria
- ✅ User can complete full flow: Register → Browse → Add to Cart → Checkout → Pay → Track
- ✅ No breaking changes to web app
- ✅ All shared services work on both platforms
- ✅ App runs without errors on Android
- ✅ Consistent UI/UX across platforms

### Effort Estimate
- **Total:** 20 days of development
- **Per developer:** Could be done in ~10-12 days with full focus
- **Includes:** Feature development + testing + polish

---

**Next Action:** 
1. Debug `npm start` error in mobile app
2. Get foundation working (all screens render)
3. Then proceed phase by phase

