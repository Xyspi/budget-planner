from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from ..models.category import CategoryType

class StartDateUpdate(BaseModel):
    budget_start_date: Optional[date] = None
    starts_before_month: bool = False

class CategoryCreate(BaseModel):
    name: str
    type: CategoryType
    is_credit: bool = False
    sort_order: int = 0

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    is_credit: Optional[bool] = None
    sort_order: Optional[int] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    type: CategoryType
    is_credit: bool
    sort_order: int
    
    class Config:
        from_attributes = True

class AccountCreate(BaseModel):
    name: str
    initial_balance: float
    is_savings_account: bool = False
    is_main_account: bool = False

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    initial_balance: Optional[float] = None
    is_savings_account: Optional[bool] = None
    is_main_account: Optional[bool] = None

class AccountResponse(BaseModel):
    id: int
    name: str
    initial_balance: float
    current_balance: float
    is_savings_account: bool
    is_main_account: bool
    
    class Config:
        from_attributes = True

class SavingsAllocationCreate(BaseModel):
    amount: float
    category_id: int
    account_id: int

class SavingsAllocationResponse(BaseModel):
    id: int
    amount: float
    category_id: int
    account_id: int
    
    class Config:
        from_attributes = True

class ConfigResponse(BaseModel):
    budget_start_date: Optional[date] = None
    starts_before_month: bool = False
    categories: List[CategoryResponse]
    accounts: List[AccountResponse]
    savings_allocations: List[SavingsAllocationResponse]