from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict

from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..services.budget_calculator import BudgetCalculator
from ..services.balance_calculator import BalanceCalculator

router = APIRouter(prefix="/budget", tags=["budget"])

@router.get("/{month}/{year}")
async def get_budget_period(
    month: int,
    year: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get budget data for specific period"""
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    
    if year < 2000 or year > 2100:
        raise HTTPException(status_code=400, detail="Year must be between 2000 and 2100")
    
    calculator = BudgetCalculator(db)
    budget_data = calculator.calculate_budget_for_period(current_user.id, month, year)
    summary = calculator.get_budget_summary(current_user.id, month, year)
    
    return {
        "budget_data": budget_data,
        "summary": summary
    }

@router.get("/balances/")
async def get_balances(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all account balances"""
    calculator = BalanceCalculator(db)
    balances = calculator.calculate_all_balances(current_user.id)
    treasury = calculator.get_treasury_summary(current_user.id)
    
    return {
        "balances": balances,
        "treasury": treasury
    }

@router.get("/charts/{month}/{year}")
async def get_chart_data(
    month: int,
    year: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get data for budget charts"""
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    
    budget_calculator = BudgetCalculator(db)
    balance_calculator = BalanceCalculator(db)
    
    # Données budget
    budget_data = budget_calculator.calculate_budget_for_period(current_user.id, month, year)
    summary = budget_calculator.get_budget_summary(current_user.id, month, year)
    
    # Données soldes
    balances = balance_calculator.calculate_all_balances(current_user.id)
    
    # Préparation des données pour les graphiques
    chart_data = {
        "balance_evolution": {
            "labels": ["Solde Réel", "Solde À Venir", "Encours"],
            "data": [
                balances["real"],
                balances["upcoming"], 
                balances["pending"]
            ]
        },
        "budget_repartition": {
            "labels": list(summary.keys()),
            "forecasted": [summary[key]["forecasted"] for key in summary.keys()],
            "real": [summary[key]["real"] for key in summary.keys()]
        },
        "savings_progress": {
            # À implémenter selon les objectifs d'épargne
            "labels": [],
            "data": []
        }
    }
    
    return chart_data