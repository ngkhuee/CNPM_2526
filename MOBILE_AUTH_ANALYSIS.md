# 📱 PHÂN TÍCH AUTH SYSTEM CHO MOBILE - CUSTOMER

**Mục tiêu:** Triển khai authentication cho mobile app (React Native)  
**Yêu cầu:**
- ✅ Home: Vào thẳng dù chưa login  
- ✅ Cart/Orders/Profile: Show "Hãy đăng nhập" nếu chưa login  
- ✅ LoginScreen & RegisterScreen: Cùng trang, dùng tabs (Login | Register)  
- ✅ Không yêu cầu điều kiện mật khẩu (test cho lẹ)  

---

## 🏗️ PHẦN 1: HIẾN KIẾN TRÚC HIỆN TẠI

### 1.1 Cấu trúc thư mục

```
web/
├─ src/
│  └─ components/
│     └─ LoginPopup/  ✅ Login & Register cùng popup (tab)
│        └─ LoginPopup.jsx (110 lines)
│        └─ LoginPopup.css

mobile/
├─ src/
│  ├─ navigation/
│  │  └─ AppNavigator.jsx ⚠️ Hiện tại: 7 screens (home, restaurant, food-detail, cart, checkout, orders, profile)
│  ├─ contexts/
│  │  ├─ NavigationContext.js (quản lý navigation)
│  │  ├─ CartContext.jsx (quản lý giỏ hàng)
│  │  └─ ❌ AuthContext.jsx (KHÔNG TỒN TẠI)
│  ├─ screens/
│  │  ├─ home/HomeScreen.jsx ✅ Ai cũng vào được
│  │  ├─ orders/OrdersScreen.jsx ⚠️ Hiện tại dùng mock data
│  │  ├─ profile/ProfileScreen.jsx ⚠️ Hiện tại dùng mock data
│  │  ├─ cart/
│  │  │  ├─ CartScreen.jsx
│  │  │  └─ CheckoutScreen.jsx
│  │  └─ restaurant/
│  │     ├─ RestaurantDetail.jsx
│  │     └─ FoodDetailScreen.jsx
│  └─ ❌ screens/auth/ (KHÔNG TỒN TẠI)
│     ├─ LoginScreen.jsx
│     └─ RegisterScreen.jsx

shared/
├─ hooks/
│  └─ useAuth.js ✅ Sẵn có (dành cho cả web & mobile)
│
shared-services/
└─ services/
   └─ authService.js ✅ Sẵn có (login, register, logout, getCurrentUser)

```

### 1.2 Auth Service hiện tại (shared-services)

**File:** `packages/shared-services/src/services/authService.js`

**Endpoints:**
- `POST /auth/login` - Login (email, password)
- `POST /auth/register` - Register (name, email, password, role)
- Lưu: token + user vào storage (AsyncStorage trên mobile, localStorage web)

**Methods:**
```javascript
authService = {
  login(email, password),      // ✅ Gọi API POST /auth/login
  register(userData),          // ✅ Gọi API POST /auth/register
  logout(),                    // ✅ Xóa token, user từ storage
  getCurrentUser(),            // ✅ Lấy user từ storage
  isAuthenticated(),           // ✅ Check token tồn tại
  // + Admin methods: getAllUsers, updateUserStatus, deleteUser
}
```

**Backend (mock-backend/server.js):**
```javascript
POST /auth/login
  Input: { email, password }
  Output: { success: true, token, user: { id, name, email, phone, role, status, ... } }

POST /auth/register
  Input: { email, password, name, phone }
  Output: { success: true, token, user, message }
  Default: role = "customer", status = "active"
```

### 1.3 useAuth hook hiện tại (shared - customer-shared)

**File:** `apps/customer/shared/src/hooks/useAuth.js`

**State:**
```javascript
{
  user,                  // Logged-in user object
  token,                 // JWT token
  loading,               // During login/register
  initialized,           // Auth init completed
  isAuthenticated,       // !!token && !!user
}
```

**Methods:**
```javascript
login(email, password)       // Returns { success, message }
register(userData)           // Auto login after register
logout()                     // Clear storage
setUser(), setToken()        // Manual setters
```

**Init logic:**
```
useEffect → initializeAuth() {
  1. Lấy savedToken từ storage
  2. Lấy savedUser từ storage (nếu token exist)
  3. Validate customer status từ backend (non-blocking):
     - Nếu status === "blocked": logout
     - Nếu status !== "active": logout
  4. setInitialized(true)
}
```

---

## 🔴 PHẦN 2: VẤN ĐỀ HIỆN TẠI

### 2.1 Mobile app không có Auth

| Thành phần | Status | Vấn đề |
|-----------|--------|--------|
| `AuthContext` | ❌ Không tồn tại | Mobile không có global auth state |
| `useAuth hook` | ❌ Không được import | Mobile dùng mock data thay vì auth |
| `LoginScreen` | ❌ Không tồn tại | Không có UI login |
| `RegisterScreen` | ❌ Không tồn tại | Không có UI register |
| `AppNavigator` | ⚠️ 7 screens | Không có screen login/auth flow |
| `useCart` hook | ❌ Gọi API ngay khi mount | Không check auth → 401 error |
| `useOrders` hook | ⚠️ Dùng mock data | `getMockOrders()` được gọi, không call API |
| `useProfile` hook | ⚠️ Dùng mock data | `getMockUser()` được gọi, không call API |

### 2.2 Lỗi 401 Unauthorized

**Nguyên nhân:**
```
App.js
  ↓ Mount
  → CartProvider
    → useCart hook
      → useEffect: fetchCart()
        → cartService.getCart()
          → apiClient.get('/carts')
            → NO AUTH HEADER ❌
            ← 401 Unauthorized
```

**Tại sao:** Backend yêu cầu `Authorization: Bearer {token}` nhưng client không gửi token (vì chưa login, mobile không có auth context)

### 2.3 OrdersScreen & ProfileScreen không lỗi 401

**Tại sao:** Chúng dùng mock data, không gọi API:

```javascript
// OrdersScreen.jsx
const mockOrders = orderService.getMockOrders();  // ✅ Mock, không call API

// ProfileScreen.jsx
const storedUser = profileService.getMockUser();  // ✅ Mock, không call API
```

---

## ✅ PHẦN 3: GIẢI PHÁP TOÀN DIỆN

### 3.1 Thay đổi cấu trúc AppNavigator

**Current (7 screens):**
```
home → restaurant → food-detail → cart → checkout → orders → profile
```

**New (Add auth flow):**
```
┌─ login (NEW)
├─ register (NEW)
└─ app (stack)
   ├─ home → restaurant → food-detail → cart → checkout → orders → profile
   └─ conditional auth checks
```

**Logic:**
```javascript
if (initialized) {
  if (isAuthenticated) {
    render <AppStack />  // Main app (7 screens)
  } else {
    render <AuthStack /> // Login/Register screens
  }
} else {
  render <Splash />     // Loading screen
}
```

### 3.2 Tạo AuthContext.jsx cho mobile

**File:** `apps/customer/mobile/src/contexts/AuthContext.jsx`

```javascript
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = useAuth();  // Import từ apps/customer/shared/hooks/useAuth
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3.3 Tạo LoginAuthScreen.jsx (tabs: Login | Register)

**File:** `apps/customer/mobile/src/screens/auth/LoginAuthScreen.jsx`

**Logic:**
```javascript
export default function LoginAuthScreen({ onNavigate }) {
  const { login, register } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('login');  // 'login' | 'register'
  const [data, setData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  
  // Tab: Login
  if (activeTab === 'login') {
    return <LoginTab data={data} setData={setData} onSubmit={handleLogin} />;
  }
  
  // Tab: Register
  if (activeTab === 'register') {
    return <RegisterTab data={data} setData={setData} onSubmit={handleRegister} />;
  }
}
```

**Features:**
- 2 tabs: "Login" | "Register" (swipe hoặc button tabs)
- Login form: email, password
- Register form: name, email, password, terms agreement
- ❌ Không check mật khẩu strength (test cho lẹ)
- ✅ Validation: email format, required fields
- ✅ Toast thông báo: success/error
- ✅ Loading state khi submit

### 3.4 Cập nhật AppNavigator.jsx

**New file:**
```javascript
export default function AppNavigator() {
  const { user, isAuthenticated, initialized } = useContext(AuthContext);
  const [activeScreen, setActiveScreen] = useState('home');
  
  // Loading splash
  if (!initialized) {
    return <SplashScreen />;  // NEW
  }
  
  // Not authenticated → Show LoginAuthScreen
  if (!isAuthenticated) {
    return <LoginAuthScreen onNavigate={setActiveScreen} />;  // NEW
  }
  
  // Authenticated → Show main app screens
  return <AppStack activeScreen={activeScreen} setActiveScreen={setActiveScreen} />;
}

function AppStack({ activeScreen, setActiveScreen }) {
  // Existing 7 screens...
}
```

### 3.5 Cập nhật OrdersScreen, ProfileScreen, CartScreen

**Handle unlogged state:**
```javascript
export default function OrdersScreen() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { navigate } = useContext(NavigationContext);
  
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text>Vui lòng đăng nhập để xem đơn hàng</Text>
        <Button 
          title="Đăng nhập" 
          onPress={() => navigate('login')}  // ??? Need to fix navigation
        />
      </View>
    );
  }
  
  // Existing logic...
}
```

**⚠️ Issue:** Làm sao quay lại LoginAuthScreen từ trong AppStack?
- **Option 1:** Không cho phép quay lại (logout sẽ reset toàn app)
- **Option 2:** Thêm 'login' screen trong AppStack (không recommended)
- **Option 3:** Dùng react-navigation với reset() (more complex)

**Best:** Logout sẽ reset state → useEffect trong AppNavigator detect → switch to LoginAuthScreen

### 3.6 Cập nhật useCart hook

**File:** `apps/customer/mobile/src/hooks/useCart.js`

**Problem:** `fetchCart()` gọi ngay khi mount, không check auth
**Solution:**
```javascript
const { isAuthenticated } = useContext(AuthContext);  // NEW

useEffect(() => {
  if (isAuthenticated) {  // ✅ Chỉ fetch nếu login
    fetchCart();
  } else {
    setCart(null);  // ✅ Empty cart nếu chưa login
  }
}, [isAuthenticated]);
```

### 3.7 Cập nhật useOrders, useProfile hook

**Option 1: Dùng mock data** (HIỆN TẠI)
```javascript
const mockOrders = orderService.getMockOrders();
// ✓ Không lỗi, test được, nhưng fake data
```

**Option 2: Call real API** (RECOMMENDED)
```javascript
const { isAuthenticated, user } = useContext(AuthContext);

const fetchOrders = async () => {
  try {
    if (isAuthenticated && user?.id) {
      const data = await orderService.getOrders(user.id);  // Real API
      setOrders(data);
    } else {
      setOrders([]);  // Empty if not logged in
    }
  } catch (error) {
    // Handle 401 error gracefully
  }
};
```

---

## 🔗 PHẦN 4: DATA FLOW DIAGRAM

### 4.1 Login Flow

```
LoginAuthScreen
  ↓ (user enters email, password)
  → <LoginTab />
    ↓ (click "Login")
    → onSubmit(email, password)
      ↓
      → AuthContext.login(email, password)
        ↓
        → authService.login(email, password)
          ↓
          → API POST /auth/login
            ↓
            ← { success: true, token, user }
              ↓
              → storage.setItem('token', token)
              → storage.setItem('user', JSON.stringify(user))
                ↓
                → AuthContext state: user, token, isAuthenticated=true
                  ↓
                  → useEffect in AppNavigator detects isAuthenticated=true
                    ↓
                    → Render <AppStack /> (main app, 7 screens)
                      ↓
                      User sees HomeScreen ✅
```

### 4.2 Register Flow

```
LoginAuthScreen
  ↓ (switch to Register tab)
  → <RegisterTab />
    ↓ (user enters name, email, password, agree=true)
    → onSubmit(name, email, password)
      ↓
      → AuthContext.register({ name, email, password })
        ↓
        → authService.register(userData)
          ↓
          → API POST /auth/register
            ↓
            ← { success: true, token, user }
              ↓
              → storage.setItem('token', token)
              → storage.setItem('user', JSON.stringify(user))
              → AuthContext.login() (auto login)
                ↓
                → isAuthenticated = true
                  ↓
                  → Render <AppStack /> ✅
```

### 4.3 Protected Screens

```
[User NOT logged in]
  ↓ Try to access OrdersScreen
    → isAuthenticated = false
      ↓
      → Show: "Vui lòng đăng nhập để xem đơn hàng"
        + Button: "Đăng nhập"
          ↓ (click)
          → Somehow navigate back to LoginAuthScreen ❓
```

### 4.4 Logout Flow

```
ProfileScreen
  ↓ (click "Logout")
  → AuthContext.logout()
    ↓
    → storage.removeItem('token')
    → storage.removeItem('user')
      ↓
      → AuthContext state: user=null, token='', isAuthenticated=false
        ↓
        → useEffect in AppNavigator detects isAuthenticated=false
          ↓
          → Render <LoginAuthScreen /> ✅
```

---

## 🔌 PHẦN 5: API ENDPOINTS LIÊN QUAN

| Endpoint | Method | Auth | Input | Output |
|----------|--------|------|-------|--------|
| `/auth/login` | POST | ❌ | { email, password } | { token, user } |
| `/auth/register` | POST | ❌ | { name, email, password } | { token, user } |
| `/carts` | GET | ✅ Bearer | - | { items, total, restaurant_id } |
| `/orders` | GET | ✅ Bearer | - | { orders[] } |
| `/users/{id}` | GET | ✅ Bearer | - | { id, name, email, status } |
| `/users/{id}` | PUT | ✅ Bearer | { name, phone, ... } | { user } |

**Lưu ý:** Endpoint `/carts`, `/orders` yêu cầu `Authorization: Bearer {token}` trong header

---

## 🛠️ PHẦN 6: IMPLEMENTATION CHECKLIST

### Phase 1: Setup Auth Infrastructure
- [ ] **1. Create AuthContext.jsx**
  - Import useAuth từ customer-shared
  - Provide global auth state
  
- [ ] **2. Create SplashScreen.jsx**
  - Show loading indicator
  - Wait for auth initialization
  
- [ ] **3. Create LoginAuthScreen.jsx**
  - 2 tabs: Login | Register
  - Login form: email, password, submit button
  - Register form: name, email, password, terms checkbox, submit button
  - Tab switch: buttons or gesture swipe
  - Error messages & loading state
  - Toast notifications

- [ ] **4. Update App.js**
  - Wrap AppNavigator with <AuthProvider>
  ```javascript
  <AuthProvider>
    <AppNavigator />
  </AuthProvider>
  ```

### Phase 2: Update Navigation
- [ ] **5. Update AppNavigator.jsx**
  - Check `initialized` state
  - Conditionally render: SplashScreen | LoginAuthScreen | AppStack
  - Handle logout reset

- [ ] **6. Create AppStack.jsx** (optional refactor)
  - Extract main 7 screens into separate component
  - Cleaner navigation logic

### Phase 3: Protect Screens
- [ ] **7. Update HomeScreen.jsx**
  - ✅ No auth required (allow unlogged users)
  
- [ ] **8. Update CartScreen.jsx**
  - Check `isAuthenticated`
  - If not: show "Hãy đăng nhập để mua hàng" + Login button
  - Need to handle navigation back to login ⚠️
  
- [ ] **9. Update OrdersScreen.jsx**
  - Check `isAuthenticated`
  - If not: show "Hãy đăng nhập để xem đơn hàng" + Login button
  - If yes: call real API (not mock)
  
- [ ] **10. Update ProfileScreen.jsx**
  - Check `isAuthenticated`
  - If not: show "Hãy đăng nhập" + Login button
  - If yes: call real API (not mock)

### Phase 4: API Integration
- [ ] **11. Update useCart.js**
  - Add auth check before fetchCart()
  
- [ ] **12. Update useOrders.js**
  - Switch from mock → real API call
  - Handle 401 error gracefully
  
- [ ] **13. Update useProfile.js**
  - Switch from mock → real API call
  - Handle 401 error gracefully

### Phase 5: Token Management
- [ ] **14. Update apiClient.js** (if needed)
  - Check if interceptor already attaches token
  - Test with postman or real API

### Phase 6: Testing
- [ ] **15. Test Login flow**
  - Valid credentials → success
  - Invalid credentials → error message
  - Token stored in AsyncStorage
  
- [ ] **16. Test Register flow**
  - New email → account created
  - Existing email → error
  - Auto-login after register
  
- [ ] **17. Test Protected screens**
  - Not logged in → show "Hãy đăng nhập"
  - Logged in → show data
  
- [ ] **18. Test Logout**
  - Click logout → back to LoginAuthScreen
  - Token removed from storage
  
- [ ] **19. Test Cart/Orders/Profile API calls**
  - Real data instead of mock
  - No 401 errors

---

## ⚠️ PHẦN 7: ISSUES & EDGE CASES

### Issue 1: Navigation from Protected Screen back to Login
**Problem:** Nếu user ở OrdersScreen mà bị logout (token expires), làm sao quay lại LoginAuthScreen?

**Solution Options:**
1. **Auto-logout on 401 error:**
   ```javascript
   apiClient.interceptors.response.use(
     (response) => response,
     (error) => {
       if (error.response?.status === 401) {
         AuthContext.logout();  // Will trigger AppNavigator re-render
       }
      return Promise.reject(error);
     }
   );
   ```

2. **useEffect checks isAuthenticated:**
   ```javascript
   useEffect(() => {
     if (!isAuthenticated) {
       // User logged out, navigate to home or show login
       onNavigate('home');
     }
   }, [isAuthenticated]);
   ```

### Issue 2: Circular dependency - AuthContext & apiClient
**Problem:** apiClient (token interceptor) needs AuthContext, but AuthContext needs to import from mobile

**Solution:** ✅ Tách riêng token management từ navigation  
- apiClient chỉ đọc token từ AsyncStorage
- Không cần import AuthContext

### Issue 3: Cart being cleared on logout
**Problem:** `authService.logout()` xóa toàn bộ storage bao gồm cartItems

**Solution:** ✅ Xóa cart khi user logout là hợp lý (an toàn)

### Issue 4: Home screen should NOT require login
**Problem:** User vẫn có thể xem home dù chưa login

**Solution:** ✅ HomeScreen không check auth, chỉ show restaurants + foods

### Issue 5: AddtoCart logic cho unlogged user
**Problem:** User chưa login nhưng click "Thêm vào giỏ"

**Solution:** Có 2 cách:
1. **Show message:** "Hãy đăng nhập để thêm vào giỏ" + navigate to login
2. **Auto-navigate to login:** Click add → go to login screen first

**Recommend:** Option 1 (user-friendly)

---

## 📋 PHẦN 8: TIMELINE & DEPENDENCIES

| Phase | Tasks | Duration | Depends on |
|-------|-------|----------|-----------|
| 1 | AuthContext, SplashScreen, LoginAuthScreen | 2h | None |
| 2 | Update AppNavigator, AppStack | 1h | Phase 1 |
| 3 | Protect screens (HomeScreen, CartScreen, Orders, Profile) | 1.5h | Phase 2 |
| 4 | Update hooks (useCart, useOrders, useProfile) | 1.5h | Phase 1, 3 |
| 5 | Token interceptor, apiClient verification | 1h | Phase 1 |
| 6 | Testing (login, register, protected screens, logout) | 2h | All phases |
| **Total** | | **9h** | |

---

## 🎯 PHẦN 9: SUCCESS CRITERIA

✅ **Auth System Ready When:**
1. ✅ LoginAuthScreen works with tabs (Login | Register)
2. ✅ Valid credentials → login success + navigate to HomeScreen
3. ✅ Invalid credentials → show error message
4. ✅ Register with valid email → account created + auto-login
5. ✅ Register with existing email → show error
6. ✅ Logout button → back to LoginAuthScreen + token removed
7. ✅ HomeScreen accessible without login
8. ✅ OrdersScreen shows "Hãy đăng nhập" if not logged in
9. ✅ ProfileScreen shows "Hãy đăng nhập" if not logged in
10. ✅ CartScreen shows "Hãy đăng nhập" if not logged in
11. ✅ No more 401 errors on API calls (token attached)
12. ✅ Real API data instead of mock data (OrdersScreen, ProfileScreen)

---

## 🔗 PHẦN 10: REFERENCE LINKS

- **Web LoginPopup:** `apps/customer/web/src/components/LoginPopup/LoginPopup.jsx` (110 lines - reference)
- **useAuth hook:** `apps/customer/shared/src/hooks/useAuth.js` (120 lines - copy logic)
- **authService:** `packages/shared-services/src/services/authService.js` (130 lines - already setup)
- **Backend:** `mock-backend/server.js` lines 200-250 (login/register endpoints)

---

## ✏️ NOTES

- **Password validation:** Không cần (tester friendly)
- **Email format check:** Cần `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- **Terms checkbox:** Bắt buộc ở Register tab
- **Token storage:** AsyncStorage (React Native)
- **Token refresh:** Không cần (scope: chỉ login/logout)
- **2FA/OTP:** Không cần (scope sau)
- **Social login:** Không cần (scope sau)

