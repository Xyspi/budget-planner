import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configApi } from '../../services/api';
import { Config, Category, Account } from '../../types';

const ParametresPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'date' | 'categories' | 'accounts' | 'savings'>('date');

  const { data: config, isLoading } = useQuery<Config>({
    queryKey: ['config'],
    queryFn: () => configApi.getConfig().then(res => res.data),
  });

  const updateStartDateMutation = useMutation({
    mutationFn: (data: { budget_start_date?: string; starts_before_month: boolean }) =>
      configApi.updateStartDate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: configApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: configApi.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });

  const tabs = [
    { id: 'date', name: 'Date de départ', icon: '📅' },
    { id: 'categories', name: 'Catégories', icon: '📋' },
    { id: 'accounts', name: 'Comptes', icon: '💰' },
    { id: 'savings', name: 'Épargnes', icon: '🏦' },
  ];

  const categoryTypes = [
    { id: 'revenus', name: 'Revenus', color: 'text-budget-revenue' },
    { id: 'factures', name: 'Factures', color: 'text-budget-bill' },
    { id: 'dépenses', name: 'Dépenses', color: 'text-budget-expense' },
    { id: 'épargnes', name: 'Épargnes', color: 'text-budget-savings' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement de la configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="budget-header">
        <h1 className="text-2xl font-bold">⚙️ Paramètres de Configuration</h1>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-budget-header text-budget-header'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="budget-card">
        {activeTab === 'date' && (
          <DateConfiguration 
            config={config} 
            onUpdate={updateStartDateMutation.mutate}
            isLoading={updateStartDateMutation.isPending}
          />
        )}
        
        {activeTab === 'categories' && (
          <CategoriesConfiguration 
            categories={config?.categories || []}
            categoryTypes={categoryTypes}
            onCreate={createCategoryMutation.mutate}
            isLoading={createCategoryMutation.isPending}
          />
        )}
        
        {activeTab === 'accounts' && (
          <AccountsConfiguration 
            accounts={config?.accounts || []}
            onCreate={createAccountMutation.mutate}
            isLoading={createAccountMutation.isPending}
          />
        )}
        
        {activeTab === 'savings' && (
          <SavingsConfiguration 
            config={config}
          />
        )}
      </div>
    </div>
  );
};

// Composant pour la configuration de la date
const DateConfiguration: React.FC<{
  config?: Config;
  onUpdate: (data: any) => void;
  isLoading: boolean;
}> = ({ config, onUpdate, isLoading }) => {
  const [startDate, setStartDate] = useState(config?.budget_start_date || '');
  const [startsBefore, setStartsBefore] = useState(config?.starts_before_month || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      budget_start_date: startDate || undefined,
      starts_before_month: startsBefore,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Date de départ du budget</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date de départ
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="budget-input"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="starts_before"
          checked={startsBefore}
          onChange={(e) => setStartsBefore(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="starts_before" className="text-sm text-gray-700">
          Le budget commence le mois précédent
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="budget-button disabled:opacity-50"
      >
        {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
      </button>
    </form>
  );
};

// Composant pour les catégories
const CategoriesConfiguration: React.FC<{
  categories: Category[];
  categoryTypes: any[];
  onCreate: (data: any) => void;
  isLoading: boolean;
}> = ({ categories, categoryTypes, onCreate, isLoading }) => {
  const [newCategory, setNewCategory] = useState({ name: '', type: 'revenus', is_credit: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.name.trim()) {
      onCreate(newCategory);
      setNewCategory({ name: '', type: 'revenus', is_credit: false });
    }
  };

  const categoriesByType = categoryTypes.reduce((acc, type) => {
    acc[type.id] = categories.filter(cat => cat.type === type.id);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Gestion des catégories</h3>
      
      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la catégorie
            </label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              className="budget-input"
              placeholder="Ex: Salaire, Électricité..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={newCategory.type}
              onChange={(e) => setNewCategory({...newCategory, type: e.target.value})}
              className="budget-input"
            >
              {categoryTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading || !newCategory.name.trim()}
              className="budget-button disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        </div>
      </form>

      {/* Affichage des catégories par type */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {categoryTypes.map(type => (
          <div key={type.id} className="space-y-2">
            <h4 className={`font-semibold ${type.color}`}>{type.name}</h4>
            <div className="space-y-1">
              {categoriesByType[type.id]?.map(category => (
                <div key={category.id} className="p-2 bg-gray-50 rounded text-sm">
                  {category.name}
                  {category.is_credit && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Crédit</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Composant pour les comptes
const AccountsConfiguration: React.FC<{
  accounts: Account[];
  onCreate: (data: any) => void;
  isLoading: boolean;
}> = ({ accounts, onCreate, isLoading }) => {
  const [newAccount, setNewAccount] = useState({ 
    name: '', 
    initial_balance: 0, 
    is_savings_account: false,
    is_main_account: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccount.name.trim()) {
      onCreate(newAccount);
      setNewAccount({ name: '', initial_balance: 0, is_savings_account: false, is_main_account: false });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Gestion des comptes</h3>
      
      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du compte
            </label>
            <input
              type="text"
              value={newAccount.name}
              onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
              className="budget-input"
              placeholder="Ex: Compte courant, Livret A..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solde initial
            </label>
            <input
              type="number"
              step="0.01"
              value={newAccount.initial_balance}
              onChange={(e) => setNewAccount({...newAccount, initial_balance: parseFloat(e.target.value) || 0})}
              className="budget-input"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newAccount.is_savings_account}
                onChange={(e) => setNewAccount({...newAccount, is_savings_account: e.target.checked})}
                className="mr-2"
              />
              Compte épargne
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newAccount.is_main_account}
                onChange={(e) => setNewAccount({...newAccount, is_main_account: e.target.checked})}
                className="mr-2"
              />
              Compte principal
            </label>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading || !newAccount.name.trim()}
              className="budget-button disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        </div>
      </form>

      {/* Liste des comptes */}
      <div className="overflow-x-auto">
        <table className="budget-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Solde initial</th>
              <th>Solde actuel</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => (
              <tr key={account.id}>
                <td>{account.name}</td>
                <td>{account.initial_balance.toFixed(2)} €</td>
                <td>{account.current_balance.toFixed(2)} €</td>
                <td>
                  <div className="flex space-x-2">
                    {account.is_main_account && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Principal
                      </span>
                    )}
                    {account.is_savings_account && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Épargne
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Composant pour les épargnes
const SavingsConfiguration: React.FC<{
  config?: Config;
}> = ({ config }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Affectation des épargnes</h3>
      <p className="text-gray-600">
        Configurez l'affectation de vos épargnes par catégorie et compte.
      </p>
      
      {/* À implémenter */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">
          Fonctionnalité en cours de développement...
        </p>
      </div>
    </div>
  );
};

export default ParametresPage;