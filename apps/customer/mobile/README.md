# Drone Food Delivery - Mobile App

## 🚀 Quick Start with Expo Go

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo Go app on your smartphone ([Download](https://expo.dev/client))

### Setup

```bash
# Navigate to mobile app directory
cd apps/customer/mobile

# Install dependencies
npm install
# or
yarn install
```

### Run on Mobile Device

#### Option 1: Using Expo Go (Easiest)
```bash
# Start Expo development server
npm start

# A QR code will appear in terminal
# Open Expo Go app on your phone
# Scan the QR code
# Your app will load in seconds!
```

#### Option 2: Run on Android Emulator
```bash
npm run android
```

#### Option 3: Run on iOS Simulator
```bash
npm run ios
```

#### Option 4: Run on Web (for development)
```bash
npm run web
```

## 📱 App Structure

```
src/
├── screens/
│   ├── HomeScreen.jsx           # Browse restaurants
│   ├── RestaurantDetailsScreen.jsx # Menu & items
│   ├── CartScreen.jsx           # Shopping cart
│   ├── CheckoutScreen.jsx       # Order confirmation
│   ├── MyOrdersScreen.jsx       # Track orders
│   ├── TrackingScreen.jsx       # Real-time tracking
│   ├── LoginScreen.jsx          # Authentication
│   └── ProfileScreen.jsx        # User profile
└── App.jsx                      # Navigation setup
```

## 🎨 UI/UX Features

- **Responsive Design**: Works on all screen sizes
- **Tab Navigation**: Easy navigation between Home, Orders, and Profile
- **Real-time Tracking**: GPS-based order tracking
- **Order Status Timeline**: Visual representation of order progress
- **Interactive Components**: Smooth animations and feedback

## 🔌 API Integration

All screens use shared hooks from `customer-shared`:
- `useCheckout()` - Checkout flow
- `useOrderActions()` - Order operations
- `useOrderFiltering()` - Filter & sort orders
- `useReview()` - Food reviews
- `GeolocationContext` - GPS location

## 🛠️ Development

### Adding a New Screen

1. Create new file in `src/screens/YourScreen.jsx`
2. Add route in `App.jsx`
3. Import and use shared hooks
4. Style with React Native StyleSheet

### Using Shared Business Logic

```javascript
import { 
  useCheckout, 
  OrderContext,
  GeolocationContext 
} from 'customer-shared';

const { processCheckout } = useCheckout(user);
const { orders } = useContext(OrderContext);
const { userLocation } = useContext(GeolocationContext);
```

## 📦 Available Contexts

- **AuthContext**: User authentication & profile
- **CartContext**: Shopping cart management
- **OrderContext**: User orders & history
- **RestaurantContext**: Restaurants & menus
- **GeolocationContext**: GPS location tracking

## 🔐 Environment Variables

Create `.env` file in `apps/customer/mobile/`:

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_MAP_KEY=your_map_key_here
```

## 🧪 Testing

Mock backend runs at `http://localhost:3001`:

```bash
# In root directory
cd mock-backend
npm start
```

## 🎯 Performance Optimization

- ✅ Memoization with `useMemo`
- ✅ Context API for global state
- ✅ Lazy loading screens
- ✅ Image optimization
- ✅ Efficient re-renders

## 🐛 Debugging

### Expo DevTools
```bash
# Press 'j' in terminal to open debugger
# Or shake device to open menu
```

### Console Logs
```javascript
console.log('Debug info');
// Appears in terminal and Expo app
```

## 📲 Deployment

### Build for Production

```bash
# Build APK (Android)
eas build --platform android

# Build IPA (iOS)
eas build --platform ios

# Build for all platforms
eas build
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org)

## 💡 Tips

- Keep screens lightweight - move logic to hooks
- Use `useCallback` for expensive functions
- Reuse components from `shared-ui` package
- Test on real device for best experience
- Monitor app performance with Expo DevTools

---

**Happy Coding! 🎉**
