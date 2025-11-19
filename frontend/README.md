<<<<<<< HEAD
# Slooze Food Ordering Application

A full-stack web-based food ordering application with Role-Based Access Control (RBAC) and country-based access filtering.

## 🎯 Project Overview

This application implements a comprehensive food ordering system with the following features:

### **Core Features**
- ✅ View restaurants and menu items
- ✅ Create orders and add food items to cart
- ✅ Checkout and pay for orders (Admin & Manager only)
- ✅ Cancel orders (Admin & Manager only)
- ✅ Update payment methods (Admin only)
- ✅ Role-Based Access Control (RBAC)
- ✅ **Bonus:** Country-based access filtering (India/America)

## 🏗️ Architecture

### **Tech Stack**
- **Backend:** FastAPI (Python)
- **Frontend:** React + Tailwind CSS + Radix UI
- **Database:** MongoDB
- **Authentication:** JWT-based

### **Project Structure**
```
/app/
├── backend/
│   ├── server.py          # Main FastAPI application
│   ├── auth.py            # JWT & password hashing utilities
│   ├── models.py          # Pydantic data models
│   ├── middleware.py      # RBAC middleware
│   ├── database.py        # Database seeding
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, Cart)
│   │   ├── pages/         # Application pages
│   │   ├── api/           # API integration layer
│   │   └── App.js         # Main application component
│   ├── package.json       # Node dependencies
│   └── .env               # Environment variables
└── README.md              # This file
```

## 👥 User Roles & Access Control

### **Pre-seeded Users**

| Username | Password | Role | Country | Full Name |
|----------|----------|------|---------|----------|
| `nickfury` | `admin123` | ADMIN | AMERICA | Nick Fury |
| `captainmarvel` | `manager123` | MANAGER | INDIA | Captain Marvel |
| `captainamerica` | `manager123` | MANAGER | AMERICA | Captain America |
| `thanos` | `member123` | MEMBER | INDIA | Thanos |
| `thor` | `member123` | MEMBER | INDIA | Thor |
| `travis` | `member123` | MEMBER | AMERICA | Travis |

### **Access Control Matrix**

| Feature | Admin | Manager | Member |
|---------|-------|---------|--------|
| View restaurants & menu items | ✅ | ✅ | ✅ |
| Create order (add food items) | ✅ | ✅ | ✅ |
| Place order (checkout & pay) | ✅ | ✅ | ❌ |
| Cancel order | ✅ | ✅ | ❌ |
| Update payment method | ✅ | ❌ | ❌ |

### **Country-Based Access (Bonus Feature)**
- **Admin:** Can access all restaurants and orders from both India and America
- **Manager:** Can only access restaurants and orders from their assigned country
- **Member:** Can only access restaurants from their country and see only their own orders

## 🚀 Setup Instructions

### **Prerequisites**
- Python 3.11+
- Node.js 18+
- MongoDB
- yarn package manager

### **Backend Setup**

1. Navigate to backend directory:
```bash
cd /app/backend
```

2. Environment variables are already configured in `.env`:
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
```

3. The application uses supervisor to manage the backend service:
```bash
sudo supervisorctl restart backend
```

4. Backend runs on: `http://localhost:8001`

### **Frontend Setup**

1. Navigate to frontend directory:
```bash
cd /app/frontend
```

2. Environment variables are already configured in `.env`:
```env
REACT_APP_BACKEND_URL=https://pdf-maker-33.preview.emergentagent.com
WDS_SOCKET_PORT=443
```

3. The application uses supervisor to manage the frontend service:
```bash
sudo supervisorctl restart frontend
```

4. Frontend runs on: `http://localhost:3000`

### **Database Seeding**

The database is automatically seeded on first startup with:
- 6 users (see User Roles section)
- 10 restaurants (5 in India, 5 in America)
- 32+ menu items
- 2 payment methods

## 📚 API Documentation

### **Authentication Endpoints**

#### POST `/api/auth/login`
Login user and get JWT token
```json
Request:
{
  "username": "nickfury",
  "password": "admin123"
}

Response:
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { ... }
}
```

#### GET `/api/auth/me`
Get current user info (requires authentication)

### **Restaurant Endpoints**

#### GET `/api/restaurants`
Get all restaurants (filtered by country for non-admin users)

#### GET `/api/restaurants/{id}`
Get specific restaurant details

#### GET `/api/restaurants/{id}/menu`
Get menu items for a restaurant

### **Order Endpoints**

#### POST `/api/orders`
Create a new order (all roles)
```json
{
  "items": [
    {
      "menu_item_id": "uuid",
      "quantity": 2,
      "price": 10.99
    }
  ],
  "payment_method_id": "uuid" // optional
}
```

#### GET `/api/orders`
Get all orders (filtered by role and country)

#### POST `/api/orders/{id}/checkout`
Checkout and pay for order (Admin & Manager only)

#### PUT `/api/orders/{id}/cancel`
Cancel an order (Admin & Manager only)

### **Payment Method Endpoints**

#### GET `/api/payment-methods`
Get user's payment methods

#### POST `/api/payment-methods`
Create payment method (Admin only)

#### PUT `/api/payment-methods/{id}`
Update payment method (Admin only)

#### DELETE `/api/payment-methods/{id}`
Delete payment method (Admin only)

### **User Endpoints**

#### GET `/api/users`
Get all users (Admin only)

## 📝 Testing the Application

### **Manual Testing Flow**

1. **Login as different users:**
   - Test with Admin (nickfury) - full access
   - Test with Manager (captainmarvel/captainamerica) - country-restricted
   - Test with Member (thanos/thor/travis) - view only

2. **Test Restaurant Browsing:**
   - Login as India Manager: Should only see India restaurants
   - Login as America Manager: Should only see America restaurants
   - Login as Admin: Should see all restaurants

3. **Test Order Creation:**
   - Add items to cart
   - Create order
   - As Admin/Manager: Checkout the order
   - As Member: Should not be able to checkout

4. **Test Order Management:**
   - View orders (filtered by role)
   - Cancel pending orders (Admin/Manager only)

5. **Test Payment Methods:**
   - Login as Admin
   - View/manage payment methods

### **API Testing with curl**

```bash
# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "nickfury", "password": "admin123"}'

# Get restaurants (with token)
curl http://localhost:8001/api/restaurants \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create order
curl -X POST http://localhost:8001/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"menu_item_id": "...", "quantity": 1, "price": 10.99}]}'
```

## 🛠️ Service Management

```bash
# Check service status
sudo supervisorctl status

# Restart services
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
sudo supervisorctl restart all

# View logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.out.log
```

## ✨ Key Features Implemented

### **1. Role-Based Access Control (RBAC)**
- JWT-based authentication
- Role-based middleware for endpoint protection
- Frontend route guards based on user role
- Dynamic UI rendering based on permissions

### **2. Country-Based Access (Bonus)**
- Managers and Members can only access data from their country
- Admin has unrestricted access to all countries
- Enforced at both API and UI levels

### **3. Complete CRUD Operations**
- Restaurants: Read operations
- Orders: Create, Read, Update (checkout/cancel)
- Payment Methods: Full CRUD (Admin only)
- Users: Read (Admin only)

### **4. User Experience**
- Responsive design with Tailwind CSS
- Modern UI with Radix UI components
- Real-time cart management
- Role-specific dashboards
- Clear access permission indicators

## 💻 Technology Highlights

### **Backend**
- FastAPI for high-performance async API
- MongoDB with Motor (async driver)
- JWT authentication with passlib for password hashing
- Pydantic for data validation
- Comprehensive error handling

### **Frontend**
- React 19 with modern hooks
- Context API for state management (Auth & Cart)
- React Router for navigation
- Axios for API communication
- Tailwind CSS for styling
- Radix UI for accessible components

## 🎯 Assignment Requirements Coverage

✅ **Full-stack web application** - React frontend + FastAPI backend
✅ **View restaurants & menu items** - All roles
✅ **Create order (add food items)** - All roles
✅ **Place order (checkout & pay)** - Admin & Manager only
✅ **Cancel order** - Admin & Manager only
✅ **Update payment method** - Admin only
✅ **RBAC Implementation** - Complete role-based access control
✅ **Bonus: Country-based access** - Managers & Members restricted to their country
✅ **README with instructions** - This file
✅ **Demo-ready application** - Fully functional and tested

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based authorization middleware
- Protected API endpoints
- Frontend route guards
- CORS configuration

## 📦 Seeded Data

### **Restaurants**
- **India:** Spice Garden, Tandoor Palace, Curry House, Biryani Junction, Masala Magic
- **America:** The Burger Joint, Pizza Paradise, Steakhouse Deluxe, Taco Fiesta, Seafood Bay

### **Sample Menu Items**
Each restaurant has 3-4 menu items with categories like:
- Main Course
- Appetizer
- Sides
- Beverages
- Dessert

## 👍 Best Practices Followed

1. **Code Organization:** Modular structure with separation of concerns
2. **Error Handling:** Comprehensive error handling at all levels
3. **Data Validation:** Pydantic models for API validation
4. **Authentication:** Secure JWT-based authentication
5. **Authorization:** Middleware-based role checking
6. **User Experience:** Intuitive UI with clear feedback
7. **Testing:** Demo accounts for easy testing
8. **Documentation:** Comprehensive README and inline comments

## 📝 Notes

- The payment system is mocked (no real payment integration)
- Database is seeded automatically on first startup
- All passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- Country-based filtering works at both API and UI levels

## 🚀 Future Enhancements

- Real payment gateway integration
- Order history with detailed tracking
- Restaurant ratings and reviews
- Search and filter functionality
- Email notifications
- Real-time order status updates

---

**Built for:** Slooze Take Home Assignment

**Contact:** For any questions, reach out to careers@slooze.xyz
=======
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
>>>>>>> 8b4fe41 (update)
