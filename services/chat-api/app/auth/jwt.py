"""
JWT verification and user extraction for FastAPI.
Validates tokens signed with shared secret from Better Auth.
"""
from typing import Optional
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import get_settings

# HTTP Bearer security scheme
security = HTTPBearer()

# Get settings
settings = get_settings()


def verify_token(token: str) -> dict:
    """
    Verify JWT token and return decoded payload.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid, expired, or malformed
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    FastAPI dependency to extract and validate user from JWT token.

    Args:
        credentials: HTTP Bearer credentials from Authorization header

    Returns:
        user_id string extracted from token 'sub' claim

    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token"
        )

    token = credentials.credentials
    payload = verify_token(token)

    # Extract user_id from 'sub' claim (standard JWT subject claim)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    return user_id


# Optional security scheme that doesn't require auth
optional_security = HTTPBearer(auto_error=False)


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)
) -> Optional[str]:
    """
    FastAPI dependency to optionally extract user from JWT token.
    Returns None if no token is provided, but validates if one is present.

    Args:
        credentials: Optional HTTP Bearer credentials from Authorization header

    Returns:
        user_id string if token is valid, None if no token provided

    Raises:
        HTTPException 401: If token is provided but invalid or expired
    """
    if not credentials:
        return None

    token = credentials.credentials
    try:
        payload = verify_token(token)
        return payload.get("sub")
    except HTTPException:
        # Token was provided but is invalid
        raise
