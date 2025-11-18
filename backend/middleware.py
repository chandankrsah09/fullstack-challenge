from fastapi import HTTPException, Header, Depends
from typing import Optional
from .auth import decode_access_token
from .models import UserRole, Country, User
import logging

logger = logging.getLogger(__name__)

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Validate JWT token and return current user."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = decode_access_token(token)
        
        if payload is None:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        return payload
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")

def require_role(allowed_roles: list[UserRole]):
    """Dependency to check if user has required role."""
    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role")
        if user_role not in [role.value for role in allowed_roles]:
            raise HTTPException(
                status_code=403, 
                detail=f"Access denied. Required roles: {[role.value for role in allowed_roles]}"
            )
        return current_user
    return role_checker

def check_country_access(current_user: dict, resource_country: str) -> bool:
    """Check if user has access to resource based on country."""
    user_role = current_user.get("role")
    user_country = current_user.get("country")
    
    # Admin has access to all countries
    if user_role == UserRole.ADMIN.value:
        return True
    
    # Manager and Member can only access their country
    return user_country == resource_country
