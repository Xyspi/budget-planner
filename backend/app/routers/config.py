from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..models.category import Category
from ..models.account import Account
from ..models.savings_allocation import SavingsAllocation
from ..schemas.config import *

router = APIRouter(prefix="/config", tags=["config"])

@router.get("/", response_model=ConfigResponse)
async def get_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get complete user configuration"""
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    allocations = db.query(SavingsAllocation).filter(SavingsAllocation.user_id == current_user.id).all()
    
    return ConfigResponse(
        budget_start_date=current_user.budget_start_date,
        starts_before_month=current_user.starts_before_month,
        categories=categories,
        accounts=accounts,
        savings_allocations=allocations
    )

@router.put("/start-date")
async def update_start_date(
    request: StartDateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update budget start date"""
    current_user.budget_start_date = request.budget_start_date
    current_user.starts_before_month = request.starts_before_month
    db.commit()
    return {"message": "Start date updated"}

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new category"""
    db_category = Category(
        user_id=current_user.id,
        name=category.name,
        type=category.type,
        is_credit=category.is_credit,
        sort_order=category.sort_order
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update category"""
    db_category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if category.name is not None:
        db_category.name = category.name
    if category.is_credit is not None:
        db_category.is_credit = category.is_credit
    if category.sort_order is not None:
        db_category.sort_order = category.sort_order
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete category"""
    db_category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted"}

@router.post("/accounts", response_model=AccountResponse)
async def create_account(
    account: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new account"""
    db_account = Account(
        user_id=current_user.id,
        name=account.name,
        initial_balance=account.initial_balance,
        current_balance=account.initial_balance,
        is_savings_account=account.is_savings_account,
        is_main_account=account.is_main_account
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.put("/accounts/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: int,
    account: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update account"""
    db_account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()
    
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if account.name is not None:
        db_account.name = account.name
    if account.initial_balance is not None:
        db_account.initial_balance = account.initial_balance
    if account.is_savings_account is not None:
        db_account.is_savings_account = account.is_savings_account
    if account.is_main_account is not None:
        db_account.is_main_account = account.is_main_account
    
    db.commit()
    db.refresh(db_account)
    return db_account

@router.delete("/accounts/{account_id}")
async def delete_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete account"""
    db_account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()
    
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db.delete(db_account)
    db.commit()
    return {"message": "Account deleted"}

@router.post("/savings-allocations")
async def create_savings_allocation(
    allocation: SavingsAllocationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create savings allocation"""
    db_allocation = SavingsAllocation(
        user_id=current_user.id,
        amount=allocation.amount,
        category_id=allocation.category_id,
        account_id=allocation.account_id
    )
    db.add(db_allocation)
    db.commit()
    return {"message": "Savings allocation created"}