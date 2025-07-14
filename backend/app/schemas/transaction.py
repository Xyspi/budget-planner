from pydantic import BaseModel
from typing import Optional
from datetime import date
from ..models.transaction import TransactionType

class TransactionCreate(BaseModel):
    is_processed: bool = False
    date: date
    amount: float
    type: TransactionType
    category_id: Optional[int] = None
    account_from_id: int
    account_to_id: int
    description: str

class TransactionUpdate(BaseModel):
    is_processed: Optional[bool] = None
    date: Optional[date] = None
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    category_id: Optional[int] = None
    account_from_id: Optional[int] = None
    account_to_id: Optional[int] = None
    description: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    is_processed: bool
    date: date
    amount: float
    type: TransactionType
    category_id: Optional[int] = None
    account_from_id: int
    account_to_id: int
    description: str
    
    class Config:
        from_attributes = True