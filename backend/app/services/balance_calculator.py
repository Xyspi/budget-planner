from sqlalchemy.orm import Session
from typing import Dict, List
from datetime import date, datetime
from ..models.account import Account
from ..models.transaction import Transaction
from ..models.user import User

class BalanceCalculator:
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_account_balance(self, account_id: int, user_id: int, processed_only: bool = False) -> float:
        """
        Calcul du solde d'un compte
        processed_only = True : solde RÉEL (transactions pointées)
        processed_only = False : solde À VENIR (toutes les transactions)
        """
        account = self.db.query(Account).filter(
            Account.id == account_id,
            Account.user_id == user_id
        ).first()
        
        if not account:
            return 0.0
        
        balance = account.initial_balance
        
        # Requête pour les transactions
        query = self.db.query(Transaction).filter(
            Transaction.user_id == user_id
        )
        
        if processed_only:
            query = query.filter(Transaction.is_processed == True)
        
        transactions = query.all()
        
        for transaction in transactions:
            # Si le compte est la source (account_from), on soustrait
            if transaction.account_from_id == account_id:
                balance -= transaction.amount
            # Si le compte est la destination (account_to), on ajoute
            elif transaction.account_to_id == account_id:
                balance += transaction.amount
        
        return balance
    
    def calculate_all_balances(self, user_id: int) -> Dict[str, Dict[int, float]]:
        """
        Calcul de tous les soldes (RÉEL, À VENIR, ENCOURS) pour tous les comptes
        """
        accounts = self.db.query(Account).filter(Account.user_id == user_id).all()
        
        balances = {
            "real": {},      # Soldes RÉEL (pointés)
            "upcoming": {},  # Soldes À VENIR (toutes transactions)
            "pending": {}    # ENCOURS (différence)
        }
        
        for account in accounts:
            real_balance = self.calculate_account_balance(account.id, user_id, processed_only=True)
            upcoming_balance = self.calculate_account_balance(account.id, user_id, processed_only=False)
            
            balances["real"][account.id] = real_balance
            balances["upcoming"][account.id] = upcoming_balance
            balances["pending"][account.id] = upcoming_balance - real_balance
        
        return balances
    
    def get_treasury_summary(self, user_id: int) -> Dict[str, float]:
        """
        Résumé de trésorerie globale
        """
        balances = self.calculate_all_balances(user_id)
        
        return {
            "total_real": sum(balances["real"].values()),
            "total_upcoming": sum(balances["upcoming"].values()),
            "total_pending": sum(balances["pending"].values())
        }