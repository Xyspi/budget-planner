import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, configApi } from '../../services/api';
import { Transaction, Config } from '../../types';
import { format } from 'date-fns';

const TransactionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    account_id: '',
    category_id: '',
    transaction_type: '',
    processed_only: ''
  });
  const [showForm, setShowForm] = useState(false);

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getTransactions(filters).then(res => res.data),
  });

  const { data: config } = useQuery<Config>({
    queryKey: ['config'],
    queryFn: () => configApi.getConfig().then(res => res.data),
  });

  const createTransactionMutation = useMutation({
    mutationFn: transactionsApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
    },
  });

  const toggleProcessingMutation = useMutation({
    mutationFn: transactionsApi.toggleProcessing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: transactionsApi.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const transactionTypes = [
    { value: 'revenus', label: 'Revenus', color: 'text-budget-revenue' },
    { value: 'factures', label: 'Factures', color: 'text-budget-bill' },
    { value: 'dépenses', label: 'Dépenses', color: 'text-budget-expense' },
    { value: 'épargnes', label: 'Épargnes', color: 'text-budget-savings' },
    { value: 'transfert', label: 'Transfert', color: 'text-gray-600' },
  ];

  const getAccountName = (accountId: number) => {
    return config?.accounts.find(acc => acc.id === accountId)?.name || 'Compte inconnu';
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return 'N/A';
    return config?.categories.find(cat => cat.id === categoryId)?.name || 'Catégorie inconnue';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="budget-header">
        <h1 className="text-2xl font-bold">💳 Transactions</h1>
      </div>

      {/* Filtres */}
      <FiltersSection 
        filters={filters} 
        setFilters={setFilters}
        config={config}
        transactionTypes={transactionTypes}
      />

      {/* Bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Liste des transactions ({transactions?.length || 0})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="budget-button"
        >
          {showForm ? 'Annuler' : '+ Nouvelle transaction'}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <TransactionForm
          config={config}
          transactionTypes={transactionTypes}
          onSubmit={createTransactionMutation.mutate}
          isLoading={createTransactionMutation.isPending}
        />
      )}

      {/* Tableau des transactions */}
      <div className="budget-card">
        <div className="overflow-x-auto">
          <table className="budget-table">
            <thead>
              <tr>
                <th className="w-16">POINTÉ</th>
                <th>DATE</th>
                <th>MONTANT</th>
                <th>TYPE</th>
                <th>CATÉGORIE</th>
                <th>DEPUIS</th>
                <th>VERS</th>
                <th>DESCRIPTION</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map(transaction => (
                <tr key={transaction.id} className={transaction.is_processed ? 'bg-green-50' : 'bg-yellow-50'}>
                  <td className="text-center">
                    <button
                      onClick={() => toggleProcessingMutation.mutate(transaction.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        transaction.is_processed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'bg-white border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {transaction.is_processed && '✓'}
                    </button>
                  </td>
                  <td>{format(new Date(transaction.date), 'dd/MM/yyyy')}</td>
                  <td className="text-right font-medium">
                    {transaction.amount.toFixed(2)} €
                  </td>
                  <td>
                    <span className={
                      transactionTypes.find(t => t.value === transaction.type)?.color || 'text-gray-600'
                    }>
                      {transactionTypes.find(t => t.value === transaction.type)?.label || transaction.type}
                    </span>
                  </td>
                  <td>{getCategoryName(transaction.category_id)}</td>
                  <td>{getAccountName(transaction.account_from_id)}</td>
                  <td>{getAccountName(transaction.account_to_id)}</td>
                  <td className="max-w-xs truncate">{transaction.description}</td>
                  <td>
                    <button
                      onClick={() => deleteTransactionMutation.mutate(transaction.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Composant pour les filtres
const FiltersSection: React.FC<{
  filters: any;
  setFilters: (filters: any) => void;
  config?: Config;
  transactionTypes: any[];
}> = ({ filters, setFilters, config, transactionTypes }) => {
  return (
    <div className="budget-card">
      <h3 className="text-lg font-semibold mb-4">Filtres</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            className="budget-input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            className="budget-input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Compte
          </label>
          <select
            value={filters.account_id}
            onChange={(e) => setFilters({ ...filters, account_id: e.target.value })}
            className="budget-input"
          >
            <option value="">Tous les comptes</option>
            {config?.accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={filters.transaction_type}
            onChange={(e) => setFilters({ ...filters, transaction_type: e.target.value })}
            className="budget-input"
          >
            <option value="">Tous les types</option>
            {transactionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// Composant pour le formulaire de transaction
const TransactionForm: React.FC<{
  config?: Config;
  transactionTypes: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}> = ({ config, transactionTypes, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'dépenses',
    category_id: '',
    account_from_id: '',
    account_to_id: '',
    description: '',
    is_processed: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0) {
      alert('Le montant doit être positif');
      return;
    }
    
    if (formData.account_from_id === formData.account_to_id) {
      alert('Les comptes de départ et d\'arrivée doivent être différents');
      return;
    }
    
    onSubmit({
      ...formData,
      category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
      account_from_id: parseInt(formData.account_from_id),
      account_to_id: parseInt(formData.account_to_id),
    });
  };

  const availableCategories = config?.categories.filter(cat => 
    formData.type === 'transfert' ? false : cat.type === formData.type
  ) || [];

  return (
    <div className="budget-card">
      <h3 className="text-lg font-semibold mb-4">Nouvelle transaction</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="budget-input"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant * (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="budget-input"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value, category_id: '' })}
              className="budget-input"
              required
            >
              {transactionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie {formData.type !== 'transfert' && '*'}
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="budget-input"
              required={formData.type !== 'transfert'}
              disabled={formData.type === 'transfert'}
            >
              <option value="">Sélectionner une catégorie</option>
              {availableCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compte départ *
            </label>
            <select
              value={formData.account_from_id}
              onChange={(e) => setFormData({ ...formData, account_from_id: e.target.value })}
              className="budget-input"
              required
            >
              <option value="">Sélectionner un compte</option>
              {config?.accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compte arrivée *
            </label>
            <select
              value={formData.account_to_id}
              onChange={(e) => setFormData({ ...formData, account_to_id: e.target.value })}
              className="budget-input"
              required
            >
              <option value="">Sélectionner un compte</option>
              {config?.accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="budget-input"
            placeholder="Description de la transaction"
            required
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_processed"
            checked={formData.is_processed}
            onChange={(e) => setFormData({ ...formData, is_processed: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="is_processed" className="text-sm text-gray-700">
            Transaction déjà pointée
          </label>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            disabled={isLoading}
            className="budget-button disabled:opacity-50"
          >
            {isLoading ? 'Création...' : 'Créer la transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionsPage;