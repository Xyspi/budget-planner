from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..models.transaction import Transaction
from ..schemas.transaction import *

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    account_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    transaction_type: Optional[str] = Query(None),
    processed_only: Optional[bool] = Query(None)
):
    """Get transactions with filters"""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if date_from:
        query = query.filter(Transaction.date >= date_from)
    if date_to:
        query = query.filter(Transaction.date <= date_to)
    if account_id:
        query = query.filter(
            (Transaction.account_from_id == account_id) | 
            (Transaction.account_to_id == account_id)
        )
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if transaction_type:
        query = query.filter(Transaction.type == transaction_type)
    if processed_only is not None:
        query = query.filter(Transaction.is_processed == processed_only)
    
    transactions = query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()
    return transactions

@router.post("/", response_model=TransactionResponse)
async def create_transaction(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new transaction"""
    # Validation: montant positif
    if transaction.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    # Validation: comptes différents (sauf pour certains transferts)
    if transaction.account_from_id == transaction.account_to_id:
        raise HTTPException(status_code=400, detail="Source and destination accounts must be different")
    
    db_transaction = Transaction(
        user_id=current_user.id,
        is_processed=transaction.is_processed,
        date=transaction.date,
        amount=transaction.amount,
        type=transaction.type,
        category_id=transaction.category_id,
        account_from_id=transaction.account_from_id,
        account_to_id=transaction.account_to_id,
        description=transaction.description
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update transaction"""
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Mise à jour des champs
    if transaction.is_processed is not None:
        db_transaction.is_processed = transaction.is_processed
    if transaction.date is not None:
        db_transaction.date = transaction.date
    if transaction.amount is not None:
        if transaction.amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be positive")
        db_transaction.amount = transaction.amount
    if transaction.type is not None:
        db_transaction.type = transaction.type
    if transaction.category_id is not None:
        db_transaction.category_id = transaction.category_id
    if transaction.account_from_id is not None:
        db_transaction.account_from_id = transaction.account_from_id
    if transaction.account_to_id is not None:
        db_transaction.account_to_id = transaction.account_to_id
    if transaction.description is not None:
        db_transaction.description = transaction.description
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete transaction"""
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(db_transaction)
    db.commit()
    return {"message": "Transaction deleted"}

@router.patch("/{transaction_id}/process")
async def toggle_transaction_processing(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle transaction processing status (pointage)"""
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db_transaction.is_processed = not db_transaction.is_processed
    db.commit()
    
    return {
        "message": "Transaction processing status updated",
        "is_processed": db_transaction.is_processed
    }