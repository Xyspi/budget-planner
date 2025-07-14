from pydantic import BaseModel
from typing import Optional
from datetime import date

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    github_id: str

class UserUpdate(BaseModel):
    budget_start_date: Optional[date] = None
    starts_before_month: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    github_id: str
    budget_start_date: Optional[date] = None
    starts_before_month: bool = False
    
    class Config:
        from_attributes = True