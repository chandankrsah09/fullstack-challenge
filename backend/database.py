from motor.motor_asyncio import AsyncIOMotorDatabase
from .models import UserRole, Country, OrderStatus, PaymentMethodType
from .auth import hash_password
from datetime import datetime, timezone
import uuid
import logging

logger = logging.getLogger(__name__)

async def seed_database(db: AsyncIOMotorDatabase):
    """Seed the database with initial data."""
    
    # Check if data already exists
    existing_users = await db.users.count_documents({})
    if existing_users > 0:
        logger.info("Database already seeded, skipping...")
        return
    
    logger.info("Seeding database...")
    
    # Seed Users
    users = [
        {
            "id": str(uuid.uuid4()),
            "username": "nickfury",
            "password_hash": hash_password("admin123"),
            "full_name": "Nick Fury",
            "role": UserRole.ADMIN.value,
            "country": Country.AMERICA.value,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "username": "captainmarvel",
            "password_hash": hash_password("manager123"),
            "full_name": "Captain Marvel",
            "role": UserRole.MANAGER.value,
            "country": Country.INDIA.value,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "username": "captainamerica",
            "password_hash": hash_password("manager123"),
            "full_name": "Captain America",
            "role": UserRole.MANAGER.value,
            "country": Country.AMERICA.value,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "username": "thanos",
            "password_hash": hash_password("member123"),
            "full_name": "Thanos",
            "role": UserRole.MEMBER.value,
            "country": Country.INDIA.value,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "username": "thor",
            "password_hash": hash_password("member123"),
            "full_name": "Thor",
            "role": UserRole.MEMBER.value,
            "country": Country.INDIA.value,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "username": "travis",
            "password_hash": hash_password("member123"),
            "full_name": "Travis",
            "role": UserRole.MEMBER.value,
            "country": Country.AMERICA.value,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.users.insert_many(users)
    logger.info(f"Seeded {len(users)} users")
    
    # Seed Restaurants
    restaurants = [
        # India Restaurants
        {
            "id": str(uuid.uuid4()),
            "name": "Spice Garden",
            "location": "Mumbai, India",
            "country": Country.INDIA.value,
            "cuisine_type": "Indian",
            "image_url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
            "rating": 4.5
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Tandoor Palace",
            "location": "Delhi, India",
            "country": Country.INDIA.value,
            "cuisine_type": "North Indian",
            "image_url": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400",
            "rating": 4.7
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Curry House",
            "location": "Bangalore, India",
            "country": Country.INDIA.value,
            "cuisine_type": "South Indian",
            "image_url": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400",
            "rating": 4.3
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Biryani Junction",
            "location": "Hyderabad, India",
            "country": Country.INDIA.value,
            "cuisine_type": "Hyderabadi",
            "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
            "rating": 4.8
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Masala Magic",
            "location": "Pune, India",
            "country": Country.INDIA.value,
            "cuisine_type": "Multi-cuisine",
            "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
            "rating": 4.4
        },
        # America Restaurants
        {
            "id": str(uuid.uuid4()),
            "name": "The Burger Joint",
            "location": "New York, USA",
            "country": Country.AMERICA.value,
            "cuisine_type": "American",
            "image_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400",
            "rating": 4.6
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pizza Paradise",
            "location": "Chicago, USA",
            "country": Country.AMERICA.value,
            "cuisine_type": "Italian",
            "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
            "rating": 4.7
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Steakhouse Deluxe",
            "location": "Texas, USA",
            "country": Country.AMERICA.value,
            "cuisine_type": "Steakhouse",
            "image_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
            "rating": 4.9
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Taco Fiesta",
            "location": "Los Angeles, USA",
            "country": Country.AMERICA.value,
            "cuisine_type": "Mexican",
            "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
            "rating": 4.5
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Seafood Bay",
            "location": "Seattle, USA",
            "country": Country.AMERICA.value,
            "cuisine_type": "Seafood",
            "image_url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400",
            "rating": 4.8
        }
    ]
    
    await db.restaurants.insert_many(restaurants)
    logger.info(f"Seeded {len(restaurants)} restaurants")
    
    # Seed Menu Items
    menu_items = []
    
    # Menu items for each restaurant
    restaurant_menus = {
        "Spice Garden": [
            {"name": "Butter Chicken", "description": "Creamy tomato-based curry with tender chicken", "price": 350, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300"},
            {"name": "Paneer Tikka", "description": "Grilled cottage cheese with spices", "price": 280, "category": "Appetizer", "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300"},
            {"name": "Garlic Naan", "description": "Soft bread with garlic and butter", "price": 60, "category": "Breads", "image_url": "https://images.unsplash.com/photo-1619467944452-00e6449c13f7?w=300"},
            {"name": "Mango Lassi", "description": "Sweet yogurt drink with mango", "price": 80, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1568906947865-79874f5e3bf3?w=300"}
        ],
        "The Burger Joint": [
            {"name": "Classic Beef Burger", "description": "Juicy beef patty with lettuce, tomato, and cheese", "price": 12.99, "category": "Burgers", "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300"},
            {"name": "Chicken Wings", "description": "Crispy wings with BBQ sauce", "price": 9.99, "category": "Appetizer", "image_url": "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=300"},
            {"name": "French Fries", "description": "Crispy golden fries", "price": 4.99, "category": "Sides", "image_url": "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=300"},
            {"name": "Coke", "description": "Refreshing cola", "price": 2.99, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300"}
        ]
    }
    
    for restaurant in restaurants:
        restaurant_name = restaurant["name"]
        items_template = restaurant_menus.get(restaurant_name, [
            {"name": "Special Dish", "description": "Chef's special", "price": 15.99, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300"},
            {"name": "Appetizer", "description": "Starter dish", "price": 7.99, "category": "Appetizer", "image_url": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=300"},
            {"name": "Dessert", "description": "Sweet ending", "price": 6.99, "category": "Dessert", "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300"}
        ])
        
        for item in items_template:
            menu_items.append({
                "id": str(uuid.uuid4()),
                "restaurant_id": restaurant["id"],
                "name": item["name"],
                "description": item["description"],
                "price": item["price"],
                "category": item["category"],
                "image_url": item.get("image_url"),
                "is_available": True
            })
    
    await db.menu_items.insert_many(menu_items)
    logger.info(f"Seeded {len(menu_items)} menu items")
    
    # Create payment methods for some users
    payment_methods = [
        {
            "id": str(uuid.uuid4()),
            "user_id": users[0]["id"],  # Nick Fury
            "type": PaymentMethodType.CREDIT_CARD.value,
            "card_last4": "4242",
            "cardholder_name": "Nick Fury",
            "is_default": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": users[1]["id"],  # Captain Marvel
            "type": PaymentMethodType.UPI.value,
            "card_last4": None,
            "cardholder_name": "Captain Marvel",
            "is_default": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.payment_methods.insert_many(payment_methods)
    logger.info(f"Seeded {len(payment_methods)} payment methods")
    
    logger.info("Database seeding completed successfully!")
