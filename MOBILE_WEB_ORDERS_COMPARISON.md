# Mobile vs Web Order Features Comparison

## Current Status Summary
**Mobile**: Partially implemented - basic order list with tabs
**Web**: Fully featured - comprehensive order management

---

## Feature Comparison Matrix

### ✅ IMPLEMENTED IN BOTH
| Feature | Mobile | Web | Notes |
|---------|--------|-----|-------|
| View current orders | ✅ | ✅ | Tab-based display |
| View order history | ✅ | ✅ | Tab-based display |
| Order status display | ✅ | ✅ | Color-coded badges |
| Cancel order | ✅ | ✅ | Status-dependent availability |
| Order list refresh | ✅ | ✅ | Manual refresh button |
| Order items display | ✅ | ✅ | Shows items in order |
| Total price display | ✅ | ✅ | Order subtotal + fees |

---

## ❌ MISSING IN MOBILE (Web has these)

### 1. **Order Reviews**
- **Web**: Submit reviews for food items after order completion
- **Mobile**: No review functionality
- **Impact**: Users can't rate/review food quality
- **Complexity**: Medium - needs ReviewModal, review submission form, review state management

### 2. **Order Detail Page**
- **Web**: Click to view full order details with all items, breakdown, tracking info
- **Mobile**: `handleViewOrderDetails()` only logs to console (line 55-58)
- **Impact**: Users can't deep-dive into order info
- **Complexity**: Medium - needs new OrderDetailScreen component

### 3. **Order Tracking**
- **Web**: Navigate to `/tracking/{orderId}` page for real-time delivery tracking
- **Mobile**: No tracking screen implemented
- **Impact**: Users can't track delivery in real-time
- **Complexity**: High - needs map integration, real-time location updates, geolocation

### 4. **Pending Order Countdown Timer**
- **Web**: Shows remaining time for pending orders (30-min expiry window)
- **Mobile**: No countdown timer display
- **Impact**: Users don't know pending order expiry time
- **Complexity**: Low - just UI/timer logic

### 5. **Continue Payment**
- **Web**: Resume payment for incomplete orders via `/payment-momo/{orderId}`
- **Mobile**: No payment continuation feature
- **Impact**: Users can't retry failed payments
- **Complexity**: Medium - needs integration with payment flow, needs PaymentScreen

### 6. **Reorder (Retry Order)**
- **Web**: Not visible in main MyOrders code, but logic exists in useOrderActions
- **Mobile**: `handleRetryOrder` passed to OrderCard but not used
- **Impact**: Users can't quickly reorder from previous orders
- **Complexity**: Low - just re-add items to cart

### 7. **Pagination**
- **Web**: Shows 10 items per page with pagination controls
- **Mobile**: Shows all orders in infinite scroll
- **Impact**: Performance issue if user has many orders
- **Complexity**: Low - add pagination to FlatList

### 8. **Auto-cancel Expired Pending Orders**
- **Web**: Checks pending orders on mount, auto-cancels expired ones
- **Mobile**: No auto-cancellation logic
- **Impact**: Stale pending orders may remain visible
- **Complexity**: Low - just API call in useEffect

### 9. **Multiple Tab Features**
- **Web**: Tab navigation with filtering logic
- **Mobile**: Simple tab switching (implemented but may lack full filtering)
- **Impact**: May not properly filter orders by status
- **Complexity**: Low - already mostly there

---

## Hooks & Services Status

### Mobile Hooks
| Hook | Status | Issues |
|------|--------|--------|
| `useOrders` | ✅ Implemented | Works correctly, uses default import |
| `useProfile` | ✅ Fixed | Now calls actual API (was hardcoded mock) |
| `useAddress` | ✅ Fixed | Now calls actual API (was hardcoded mock) |
| `useReview` | ❌ Missing | Needed for review feature |
| `useTracking` | ❌ Missing | Needed for order tracking |
| `useOrderDetail` | ❌ Missing | Needed for detail page |

### Mobile Services
| Service | Status | Notes |
|---------|--------|-------|
| `orderService` | ✅ Fixed | All API calls correct, default export |
| `profileService` | ✅ Fixed | Using apiClient, no double .data |
| `addressService` | ✅ Fixed | Using apiClient, no double .data |
| `reviewService` | ❌ Missing | Needed for review submission |
| `trackingService` | ❌ Missing | Needed for real-time tracking |

---

## Implementation Recommendations (Priority Order)

### HIGH PRIORITY
1. **Fix handleViewOrderDetails** - Actually navigate to detail screen instead of console.log
   - Create `OrderDetailScreen.jsx`
   - Add route/navigation for order detail
   - Show items breakdown, pricing, status timeline

2. **Implement Review Functionality**
   - Create `useReview()` hook (copy from web's customer-shared)
   - Add ReviewModal component to OrderCard
   - Add review button for completed orders

### MEDIUM PRIORITY
3. **Add Order Tracking**
   - Create `TrackingScreen.jsx` with map
   - Add delivery person location tracking
   - Show estimated delivery time

4. **Continue Payment Flow**
   - Link to payment screen for pending orders
   - Show "Pay Now" button for orders awaiting payment

### LOW PRIORITY
5. **Pending Order Countdown Timer** - Just UI enhancement
6. **Pagination** - Performance improvement
7. **Auto-cancel Logic** - Data maintenance
8. **Reorder Feature** - Add to OrderCard quick actions

---

## Code Migration Notes

### From Web to Mobile
Most web features are in `customer-shared` package:
- `useOrderActions` - Cancel/reorder logic
- `useReview` - Review submission
- `useOrderFiltering` - Filter current/history
- `OrderCardHeader`, `OrderItemsTable` - Components

### Key Differences
- **Web**: React Router for navigation
- **Mobile**: Custom NavigationContext for screen routing
- **Web**: Redux/Context for state
- **Mobile**: React Context + Hooks

### API Integration Notes
- Both use same backend API (mock-backend)
- Mobile apiClient extracts .data, so services must NOT call .data again
- All fixes from mobile should be reflected in services consistency

---

## Testing Checklist

### Currently Working ✅
- [ ] Login with customer account
- [ ] View current orders tab
- [ ] View order history tab
- [ ] Cancel button shows for pending/confirmed orders
- [ ] Orders list refreshes on button press
- [ ] Order items display correctly
- [ ] Total price calculations are correct

### Need to Test After Fixes ✅
- [ ] Profile data fetches from API (not hardcoded)
- [ ] Address list fetches from API (not hardcoded)
- [ ] Address add/edit/delete works with real API
- [ ] Order data fetches from API (verify not empty array)

### Future Testing
- [ ] Order detail page displays correctly
- [ ] Reviews can be submitted
- [ ] Reorder functionality adds items to cart
- [ ] Payment continuation works
- [ ] Order tracking shows live location
- [ ] Countdown timer displays correctly

---

## Data Structure Consistency Check

### Order Object Fields
Ensure all these fields present in API response:
- `id` or `_id` - Order identifier
- `restaurantId` / `restaurant_id` - Restaurant identifier
- `restaurantName` - For display
- `status` - pending/confirmed/delivering/completed/cancelled
- `items` - Array of { foodId, name, quantity, price, etc }
- `totalPrice` / `total_price` - Total amount
- `createdAt` / `created_at` - Order timestamp
- `deliveryAddress` / `delivery_address` - Full address object
- `paymentMethod` - cash/card/momo etc
- `deliveryPerson` - Optional for tracking feature

### Review Object Fields
- `id` - Review identifier
- `foodId` - Food being reviewed
- `userId` - User who reviewed
- `rating` - 1-5 stars
- `comment` - Review text
- `createdAt` - When review was created

---

## Estimated Effort

| Feature | Effort | Risk | Value |
|---------|--------|------|-------|
| Fix handleViewOrderDetails | 2hrs | Low | Medium |
| Review submission | 4hrs | Medium | High |
| Order tracking | 6hrs | High | High |
| Continue payment | 3hrs | Medium | Medium |
| Countdown timer | 1hr | Low | Low |
| Pagination | 1hr | Low | Low |
| Auto-cancel | 1hr | Low | Low |
| Reorder | 2hrs | Low | Medium |
| **TOTAL** | **~20hrs** | - | - |

**MVP (Minimum Viable)**: Order detail + Reviews = ~6hrs work
**Full Parity**: ~20hrs work
