from sqlalchemy.orm import Session
from typing import Dict, List
from datetime import date, datetime, timedelta
from ..models.user import User
from ..models.category import Category, CategoryType
from ..models.transaction import Transaction, TransactionType
from ..models.budget_forecast import BudgetForecast

class BudgetCalculator:
    def __init__(self, db: Session):
        self.db = db
    
    def get_budget_period_dates(self, user: User, month: int, year: int) -> tuple[date, date]:
        """
        Calcul des dates de début et fin de période budgétaire
        selon budget_start_date et starts_before_month
        """
        if not user.budget_start_date:
            # Par défaut : du 1er au dernier jour du mois
            start_date = date(year, month, 1)
            if month == 12:
                end_date = date(year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = date(year, month + 1, 1) - timedelta(days=1)
            return start_date, end_date
        
        start_day = user.budget_start_date.day
        
        if user.starts_before_month:
            # Budget commence le mois précédent
            if month == 1:
                start_date = date(year - 1, 12, start_day)
                end_date = date(year, month, start_day - 1)
            else:
                start_date = date(year, month - 1, start_day)
                end_date = date(year, month, start_day - 1)
        else:
            # Budget commence le mois courant
            start_date = date(year, month, start_day)
            if month == 12:
                end_date = date(year + 1, 1, start_day - 1)
            else:
                end_date = date(year, month + 1, start_day - 1)
        
        return start_date, end_date
    
    def calculate_budget_for_period(self, user_id: int, month: int, year: int) -> Dict:
        """
        Calcul du budget pour une période donnée
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}
        
        start_date, end_date = self.get_budget_period_dates(user, month, year)
        
        # Récupération des prévisions pour ce mois
        forecasts = self.db.query(BudgetForecast).filter(
            BudgetForecast.user_id == user_id,
            BudgetForecast.month_number == month
        ).all()
        
        # Récupération des transactions réelles pour cette période
        transactions = self.db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).all()
        
        # Calcul par catégorie
        budget_data = {}
        categories = self.db.query(Category).filter(Category.user_id == user_id).all()
        
        for category in categories:
            forecast_amount = 0.0
            for forecast in forecasts:
                if forecast.category_id == category.id:
                    forecast_amount = forecast.forecasted_amount
                    break
            
            real_amount = 0.0
            for transaction in transactions:
                if transaction.category_id == category.id:
                    real_amount += transaction.amount
            
            variance = real_amount - forecast_amount
            
            budget_data[category.id] = {
                "category_name": category.name,
                "category_type": category.type.value,
                "forecasted": forecast_amount,
                "real": real_amount,
                "variance": variance,
                "variance_percent": (variance / forecast_amount * 100) if forecast_amount != 0 else 0
            }
        
        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date,
                "month": month,
                "year": year
            },
            "categories": budget_data
        }
    
    def get_budget_summary(self, user_id: int, month: int, year: int) -> Dict:
        """
        Résumé budgétaire par type de catégorie
        """
        budget_data = self.calculate_budget_for_period(user_id, month, year)
        
        summary = {
            "revenus": {"forecasted": 0, "real": 0, "variance": 0},
            "factures": {"forecasted": 0, "real": 0, "variance": 0},
            "dépenses": {"forecasted": 0, "real": 0, "variance": 0},
            "épargnes": {"forecasted": 0, "real": 0, "variance": 0}
        }
        
        for category_data in budget_data.get("categories", {}).values():
            cat_type = category_data["category_type"]
            if cat_type in summary:
                summary[cat_type]["forecasted"] += category_data["forecasted"]
                summary[cat_type]["real"] += category_data["real"]
                summary[cat_type]["variance"] += category_data["variance"]
        
        return summary