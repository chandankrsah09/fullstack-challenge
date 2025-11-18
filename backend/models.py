from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid
from enum import Enum

# Enums
class UserRole(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    MEMBER = "MEMBER"

class Country(str, Enum):
    INDIA = "INDIA"
    AMERICA = "AMERICA"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class PaymentMethodType(str, Enum):
    CREDIT_CARD = "CREDIT_CARD"
    DEBIT_CARD = "DEBIT_CARD"
    UPI = "UPI"
    PAYPAL = "PAYPAL"

# User Models
class UserBase(BaseModel):
    username: str
    full_name: str
    role: UserRole
    country: Country

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: UserRole
    country: Country

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: str
    created_at: datetime

class UserInDB(User):
    password_hash: str

# Restaurant Models
class RestaurantBase(BaseModel):
    name: str
    location: str
    country: Country
    cuisine_type: str
    image_url: Optional[str] = None
    rating: Optional[float] = 4.5

class Restaurant(RestaurantBase):
    id: str

# Menu Item Models
class MenuItemBase(BaseModel):
    restaurant_id: str
    name: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = None
    is_available: bool = True

class MenuItem(MenuItemBase):
    id: str

# Order Models
class OrderItemCreate(BaseModel):
    menu_item_id: str
    quantity: int
    price: float

class OrderItem(OrderItemCreate):
    id: str
    menu_item_name: Optional[str] = None

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    payment_method_id: Optional[str] = None

class Order(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = None
    order_date: datetime
    total_amount: float
    status: OrderStatus
    payment_method_id: Optional[str] = None
    country: Country
    items: List[OrderItem]

# Payment Method Models
class PaymentMethodBase(BaseModel):
    type: PaymentMethodType
    card_last4: Optional[str] = None
    cardholder_name: Optional[str] = None
    is_default: bool = False

class PaymentMethodCreate(PaymentMethodBase):
    pass

class PaymentMethod(PaymentMethodBase):
    id: str
    user_id: str
    created_at: datetime

# Response Models
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class MessageResponse(BaseModel):
    message: str
