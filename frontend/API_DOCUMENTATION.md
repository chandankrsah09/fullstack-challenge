# Slooze Food Ordering API Documentation

## Base URL
```
http://localhost:8001/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## API Endpoints

### 🔐 Authentication

#### POST /auth/login
Login user and receive JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "string",
    "username": "string",
    "full_name": "string",
    "role": "ADMIN|MANAGER|MEMBER",
    "country": "INDIA|AMERICA",
    "created_at": "datetime"
  }
}
```

**Status Codes:**
- 200: Success
- 401: Invalid credentials

---

#### GET /auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "string",
  "username": "string",
  "full_name": "string",
  "role": "ADMIN|MANAGER|MEMBER",
  "country": "INDIA|AMERICA",
  "created_at": "datetime"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized

---

### 🍽️ Restaurants

#### GET /restaurants
Get all restaurants (filtered by country for non-admin users).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:** None

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "location": "string",
    "country": "INDIA|AMERICA",
    "cuisine_type": "string",
    "image_url": "string",
    "rating": 4.5
  }
]
```

**Access Control:**
- Admin: Sees all restaurants
- Manager/Member: Sees only restaurants from their country

**Status Codes:**
- 200: Success
- 401: Unauthorized

---

#### GET /restaurants/{restaurant_id}
Get specific restaurant details.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `restaurant_id` (string): Restaurant UUID

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "location": "string",
  "country": "INDIA|AMERICA",
  "cuisine_type": "string",
  "image_url": "string",
  "rating": 4.5
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Access denied (country restriction)
- 404: Restaurant not found

---

#### GET /restaurants/{restaurant_id}/menu
Get menu items for a specific restaurant.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `restaurant_id` (string): Restaurant UUID

**Response:**
```json
[
  {
    "id": "string",
    "restaurant_id": "string",
    "name": "string",
    "description": "string",
    "price": 10.99,
    "category": "string",
    "image_url": "string",
    "is_available": true
  }
]
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Access denied (country restriction)
- 404: Restaurant not found

---

### 📦 Orders

#### POST /orders
Create a new order.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "menu_item_id": "string",
      "quantity": 1,
      "price": 10.99
    }
  ],
  "payment_method_id": "string" // optional
}
```

**Response:**
```json
{
  "id": "string",
  "user_id": "string",
  "user_name": "string",
  "order_date": "datetime",
  "total_amount": 10.99,
  "status": "PENDING",
  "payment_method_id": "string",
  "country": "INDIA|AMERICA",
  "items": [
    {
      "id": "string",
      "menu_item_id": "string",
      "menu_item_name": "string",
      "quantity": 1,
      "price": 10.99
    }
  ]
}
```

**Access Control:**
- All roles can create orders
- Users can only order from restaurants in their country (non-admin)

**Status Codes:**
- 200: Success
- 400: Invalid items or unavailable
- 401: Unauthorized
- 403: Country access denied
- 404: Menu item not found

---

#### GET /orders
Get all orders (filtered by role and country).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "string",
    "user_id": "string",
    "user_name": "string",
    "order_date": "datetime",
    "total_amount": 10.99,
    "status": "PENDING|COMPLETED|CANCELLED",
    "payment_method_id": "string",
    "country": "INDIA|AMERICA",
    "items": [...]
  }
]
```

**Access Control:**
- Admin: Sees all orders
- Manager: Sees orders from their country only
- Member: Sees only their own orders

**Status Codes:**
- 200: Success
- 401: Unauthorized

---

#### GET /orders/{order_id}
Get specific order details.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `order_id` (string): Order UUID

**Response:**
```json
{
  "id": "string",
  "user_id": "string",
  "user_name": "string",
  "order_date": "datetime",
  "total_amount": 10.99,
  "status": "PENDING|COMPLETED|CANCELLED",
  "payment_method_id": "string",
  "country": "INDIA|AMERICA",
  "items": [...]
}
```

**Access Control:**
- Member: Can only view their own orders
- Manager: Can only view orders from their country
- Admin: Can view all orders

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Access denied
- 404: Order not found

---

#### POST /orders/{order_id}/checkout
Checkout and pay for an order.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `order_id` (string): Order UUID

**Response:**
```json
{
  "id": "string",
  "status": "COMPLETED",
  ...
}
```

**Access Control:**
- Admin: ✅ Can checkout any order
- Manager: ✅ Can checkout orders from their country
- Member: ❌ Cannot checkout orders

**Status Codes:**
- 200: Success
- 400: Order not in pending status
- 401: Unauthorized
- 403: Access denied (role or country)
- 404: Order not found

---

#### PUT /orders/{order_id}/cancel
Cancel an order.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `order_id` (string): Order UUID

**Response:**
```json
{
  "id": "string",
  "status": "CANCELLED",
  ...
}
```

**Access Control:**
- Admin: ✅ Can cancel any order
- Manager: ✅ Can cancel orders from their country
- Member: ❌ Cannot cancel orders

**Status Codes:**
- 200: Success
- 400: Order already cancelled
- 401: Unauthorized
- 403: Access denied (role or country)
- 404: Order not found

---

### 💳 Payment Methods

#### GET /payment-methods
Get payment methods for current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "string",
    "user_id": "string",
    "type": "CREDIT_CARD|DEBIT_CARD|UPI|PAYPAL",
    "card_last4": "4242",
    "cardholder_name": "string",
    "is_default": true,
    "created_at": "datetime"
  }
]
```

**Status Codes:**
- 200: Success
- 401: Unauthorized

---

#### POST /payment-methods
Create a new payment method.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "CREDIT_CARD|DEBIT_CARD|UPI|PAYPAL",
  "card_last4": "4242",
  "cardholder_name": "string",
  "is_default": false
}
```

**Response:**
```json
{
  "id": "string",
  "user_id": "string",
  "type": "CREDIT_CARD",
  "card_last4": "4242",
  "cardholder_name": "string",
  "is_default": false,
  "created_at": "datetime"
}
```

**Access Control:**
- Admin: ✅ Can create payment methods
- Manager: ❌ Cannot create payment methods
- Member: ❌ Cannot create payment methods

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Access denied (role)

---

#### PUT /payment-methods/{payment_id}
Update a payment method.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `payment_id` (string): Payment method UUID

**Request Body:**
```json
{
  "type": "CREDIT_CARD",
  "card_last4": "4242",
  "cardholder_name": "string",
  "is_default": true
}
```

**Access Control:**
- Admin: ✅ Can update payment methods
- Manager: ❌ Cannot update
- Member: ❌ Cannot update

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Access denied
- 404: Payment method not found

---

#### DELETE /payment-methods/{payment_id}
Delete a payment method.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `payment_id` (string): Payment method UUID

**Response:**
```json
{
  "message": "Payment method deleted successfully"
}
```

**Access Control:**
- Admin: ✅ Can delete payment methods
- Manager: ❌ Cannot delete
- Member: ❌ Cannot delete

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Access denied
- 404: Payment method not found

---

### 👥 Users

#### GET /users
Get all users in the system.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "string",
    "username": "string",
    "full_name": "string",
    "role": "ADMIN|MANAGER|MEMBER",
    "country": "INDIA|AMERICA",
    "created_at": "datetime"
  }
]
```

**Access Control:**
- Admin: ✅ Can view all users
- Manager: ❌ Cannot view users
- Member: ❌ Cannot view users

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Access denied

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message description"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider:
- 100 requests per minute per user
- 10 login attempts per hour per IP

---

## Example: Complete Order Flow

### 1. Login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "captainmarvel", "password": "manager123"}'
```

### 2. Get Restaurants
```bash
curl http://localhost:8001/api/restaurants \
  -H "Authorization: Bearer <token>"
```

### 3. Get Restaurant Menu
```bash
curl http://localhost:8001/api/restaurants/{restaurant_id}/menu \
  -H "Authorization: Bearer <token>"
```

### 4. Create Order
```bash
curl -X POST http://localhost:8001/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "menu_item_id": "menu-item-uuid",
        "quantity": 2,
        "price": 350
      }
    ]
  }'
```

### 5. Checkout Order
```bash
curl -X POST http://localhost:8001/api/orders/{order_id}/checkout \
  -H "Authorization: Bearer <token>"
```

---

## Postman Collection

A Postman collection export is recommended for testing. Key collections:

1. **Authentication**
   - Login as Admin
   - Login as Manager (India)
   - Login as Manager (America)
   - Login as Member

2. **Restaurants**
   - Get All Restaurants
   - Get Restaurant Details
   - Get Restaurant Menu

3. **Orders**
   - Create Order
   - Get All Orders
   - Checkout Order
   - Cancel Order

4. **Payment Methods** (Admin only)
   - Get Payment Methods
   - Create Payment Method
   - Update Payment Method
   - Delete Payment Method

5. **Users** (Admin only)
   - Get All Users

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used for all entity IDs
- Prices are stored as floats (2 decimal places)
- JWT tokens expire after 24 hours
- Password requirements: Minimum 8 characters (in production)
