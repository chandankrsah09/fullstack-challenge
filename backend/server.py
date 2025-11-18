from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone
import uuid

# Import local modules
from models import (
    UserCreate, UserLogin, User, LoginResponse, MessageResponse,
    Restaurant, MenuItem, Order, OrderCreate, OrderItem, OrderStatus,
    PaymentMethod, PaymentMethodCreate, UserRole, Country
)
from auth import hash_password, verify_password, create_access_token
from middleware import get_current_user, require_role, check_country_access
from database import seed_database

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Food Ordering API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    """Register a new user."""
    # Check if username exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create user
    user_dict = user_data.model_dump(exclude={"password"})
    user_dict["id"] = str(uuid.uuid4())
    user_dict["password_hash"] = hash_password(user_data.password)
    user_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.insert_one(user_dict)
    
    return User(**{k: v for k, v in user_dict.items() if k != "password_hash"})

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(credentials: UserLogin):
    """Login user and return JWT token."""
    user = await db.users.find_one({"username": credentials.username})
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Create access token
    token_data = {
        "user_id": user["id"],
        "username": user["username"],
        "role": user["role"],
        "country": user["country"]
    }
    access_token = create_access_token(token_data)
    
    user_obj = User(**{k: v for k, v in user.items() if k != "password_hash" and k != "_id"})
    
    return LoginResponse(
        access_token=access_token,
        user=user_obj
    )

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current logged-in user info."""
    user = await db.users.find_one({"id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**{k: v for k, v in user.items() if k != "password_hash" and k != "_id"})

# ==================== USER ENDPOINTS ====================

@api_router.get("/users", response_model=List[User])
async def get_users(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    """Get all users (Admin only)."""
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [User(**user) for user in users]

# ==================== RESTAURANT ENDPOINTS ====================

@api_router.get("/restaurants", response_model=List[Restaurant])
async def get_restaurants(current_user: dict = Depends(get_current_user)):
    """Get all restaurants (filtered by country for non-admin)."""
    query = {}
    
    # Apply country filter for non-admin users
    if current_user["role"] != UserRole.ADMIN.value:
        query["country"] = current_user["country"]
    
    restaurants = await db.restaurants.find(query, {"_id": 0}).to_list(1000)
    return [Restaurant(**restaurant) for restaurant in restaurants]

@api_router.get("/restaurants/{restaurant_id}", response_model=Restaurant)
async def get_restaurant(restaurant_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific restaurant."""
    restaurant = await db.restaurants.find_one({"id": restaurant_id}, {"_id": 0})
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Check country access for non-admin
    if not check_country_access(current_user, restaurant["country"]):
        raise HTTPException(status_code=403, detail="Access denied to this restaurant")
    
    return Restaurant(**restaurant)

@api_router.get("/restaurants/{restaurant_id}/menu", response_model=List[MenuItem])
async def get_restaurant_menu(restaurant_id: str, current_user: dict = Depends(get_current_user)):
    """Get menu items for a restaurant."""
    # First verify restaurant access
    restaurant = await db.restaurants.find_one({"id": restaurant_id}, {"_id": 0})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    if not check_country_access(current_user, restaurant["country"]):
        raise HTTPException(status_code=403, detail="Access denied to this restaurant")
    
    menu_items = await db.menu_items.find(
        {"restaurant_id": restaurant_id}, 
        {"_id": 0}
    ).to_list(1000)
    
    return [MenuItem(**item) for item in menu_items]

# ==================== ORDER ENDPOINTS ====================

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    """Create a new order (All roles can create orders)."""
    # Validate menu items and calculate total
    total_amount = 0
    order_items = []
    
    for item in order_data.items:
        menu_item = await db.menu_items.find_one({"id": item.menu_item_id}, {"_id": 0})
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item.menu_item_id} not found")
        
        if not menu_item["is_available"]:
            raise HTTPException(status_code=400, detail=f"{menu_item['name']} is not available")
        
        # Check restaurant country access
        restaurant = await db.restaurants.find_one({"id": menu_item["restaurant_id"]}, {"_id": 0})
        if not check_country_access(current_user, restaurant["country"]):
            raise HTTPException(status_code=403, detail="Cannot order from restaurants outside your country")
        
        order_item = {
            "id": str(uuid.uuid4()),
            "menu_item_id": item.menu_item_id,
            "menu_item_name": menu_item["name"],
            "quantity": item.quantity,
            "price": item.price
        }
        order_items.append(order_item)
        total_amount += item.price * item.quantity
    
    # Create order
    order = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "user_name": current_user["username"],
        "order_date": datetime.now(timezone.utc).isoformat(),
        "total_amount": round(total_amount, 2),
        "status": OrderStatus.PENDING.value,
        "payment_method_id": order_data.payment_method_id,
        "country": current_user["country"],
        "items": order_items
    }
    
    await db.orders.insert_one(order)
    
    return Order(**{k: v for k, v in order.items() if k != "_id"})

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: dict = Depends(get_current_user)):
    """Get all orders (filtered by country for non-admin)."""
    query = {}
    
    # Admin sees all orders
    if current_user["role"] == UserRole.ADMIN.value:
        pass
    # Manager sees orders from their country
    elif current_user["role"] == UserRole.MANAGER.value:
        query["country"] = current_user["country"]
    # Member sees only their own orders
    else:
        query["user_id"] = current_user["user_id"]
    
    orders = await db.orders.find(query, {"_id": 0}).sort("order_date", -1).to_list(1000)
    return [Order(**order) for order in orders]

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific order."""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check access
    if current_user["role"] == UserRole.MEMBER.value and order["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied to this order")
    
    if current_user["role"] == UserRole.MANAGER.value and order["country"] != current_user["country"]:
        raise HTTPException(status_code=403, detail="Access denied to this order")
    
    return Order(**order)

@api_router.post("/orders/{order_id}/checkout", response_model=Order)
async def checkout_order(
    order_id: str, 
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """Checkout and pay for order (Admin and Manager only)."""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["status"] != OrderStatus.PENDING.value:
        raise HTTPException(status_code=400, detail="Order is not in pending status")
    
    # Check country access for manager
    if current_user["role"] == UserRole.MANAGER.value and order["country"] != current_user["country"]:
        raise HTTPException(status_code=403, detail="Cannot checkout orders from other countries")
    
    # Update order status
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": OrderStatus.COMPLETED.value}}
    )
    
    order["status"] = OrderStatus.COMPLETED.value
    return Order(**order)

@api_router.put("/orders/{order_id}/cancel", response_model=Order)
async def cancel_order(
    order_id: str, 
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """Cancel an order (Admin and Manager only)."""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["status"] == OrderStatus.CANCELLED.value:
        raise HTTPException(status_code=400, detail="Order is already cancelled")
    
    # Check country access for manager
    if current_user["role"] == UserRole.MANAGER.value and order["country"] != current_user["country"]:
        raise HTTPException(status_code=403, detail="Cannot cancel orders from other countries")
    
    # Update order status
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": OrderStatus.CANCELLED.value}}
    )
    
    order["status"] = OrderStatus.CANCELLED.value
    return Order(**order)

# ==================== PAYMENT METHOD ENDPOINTS ====================

@api_router.get("/payment-methods", response_model=List[PaymentMethod])
async def get_payment_methods(current_user: dict = Depends(get_current_user)):
    """Get payment methods for current user."""
    payment_methods = await db.payment_methods.find(
        {"user_id": current_user["user_id"]}, 
        {"_id": 0}
    ).to_list(1000)
    
    return [PaymentMethod(**pm) for pm in payment_methods]

@api_router.post("/payment-methods", response_model=PaymentMethod)
async def create_payment_method(
    payment_data: PaymentMethodCreate, 
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    """Create a payment method (Admin only)."""
    payment_method = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "type": payment_data.type.value,
        "card_last4": payment_data.card_last4,
        "cardholder_name": payment_data.cardholder_name,
        "is_default": payment_data.is_default,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_methods.insert_one(payment_method)
    
    return PaymentMethod(**{k: v for k, v in payment_method.items() if k != "_id"})

@api_router.put("/payment-methods/{payment_id}", response_model=PaymentMethod)
async def update_payment_method(
    payment_id: str,
    payment_data: PaymentMethodCreate,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    """Update a payment method (Admin only)."""
    payment_method = await db.payment_methods.find_one({"id": payment_id}, {"_id": 0})
    
    if not payment_method:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    # Update fields
    update_data = {
        "type": payment_data.type.value,
        "card_last4": payment_data.card_last4,
        "cardholder_name": payment_data.cardholder_name,
        "is_default": payment_data.is_default
    }
    
    await db.payment_methods.update_one(
        {"id": payment_id},
        {"$set": update_data}
    )
    
    payment_method.update(update_data)
    return PaymentMethod(**payment_method)

@api_router.delete("/payment-methods/{payment_id}", response_model=MessageResponse)
async def delete_payment_method(
    payment_id: str,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    """Delete a payment method (Admin only)."""
    result = await db.payment_methods.delete_one({"id": payment_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    return MessageResponse(message="Payment method deleted successfully")

# ==================== ROOT ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Food Ordering API - Welcome!"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up application...")
    await seed_database(db)
    logger.info("Application startup complete!")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down application...")
    client.close()
