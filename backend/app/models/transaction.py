from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from ..core.database import Base

class TransactionType(PyEnum):
    REVENUE = "revenus"
    BILL = "factures"
    EXPENSE = "dépenses"
    SAVINGS = "épargnes"
    TRANSFER = "transfert"

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_processed = Column(Boolean, default=False)  # VRAI/FAUX (système de pointage)
    date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)  # Toujours positif
    type = Column(Enum(TransactionType), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)  # Optionnel pour transferts
    account_from_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    account_to_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    description = Column(String, nullable=False)
    
    # Relations
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    account_from = relationship("Account", foreign_keys=[account_from_id], back_populates="transactions_from")
    account_to = relationship("Account", foreign_keys=[account_to_id], back_populates="transactions_to")