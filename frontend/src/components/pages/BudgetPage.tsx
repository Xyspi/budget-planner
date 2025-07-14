import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { budgetApi, configApi } from '../../services/api';
import { BudgetData, BudgetSummary, Balances, Treasury, Config } from '../../types';

const BudgetPage: React.FC = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: budgetResponse } = useQuery({
    queryKey: ['budget', selectedMonth, selectedYear],
    queryFn: () => budgetApi.getBudgetPeriod(selectedMonth, selectedYear).then(res => res.data),
  });

  const { data: balancesResponse } = useQuery({
    queryKey: ['balances'],
    queryFn: () => budgetApi.getBalances().then(res => res.data),
  });

  const { data: config } = useQuery<Config>({
    queryKey: ['config'],
    queryFn: () => configApi.getConfig().then(res => res.data),
  });

  const budgetData = budgetResponse?.budget_data;
  const summary = budgetResponse?.summary;
  const balances = balancesResponse?.balances;
  const treasury = balancesResponse?.treasury;

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const getAccountName = (accountId: number) => {
    return config?.accounts.find(acc => acc.id === accountId)?.name || 'Compte inconnu';
  };

  return (
    <div className="space-y-6">
      <div className="budget-header">
        <h1 className="text-2xl font-bold">📊 Tableau de Bord Budget</h1>
      </div>

      {/* Sélecteur de période */}
      <div className="budget-card">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Période :
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="budget-input w-auto"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="budget-input w-auto"
          >
            {Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Résumé budgétaire */}
      {summary && (
        <BudgetSummarySection summary={summary} />
      )}

      {/* Détails par catégorie */}
      {budgetData && (
        <BudgetDetailsSection budgetData={budgetData} />
      )}

      {/* Trésorerie */}
      {balances && treasury && config && (
        <TreasurySection 
          balances={balances}
          treasury={treasury}
          accounts={config.accounts}
          getAccountName={getAccountName}
        />
      )}
    </div>
  );
};

// Composant pour le résumé budgétaire
const BudgetSummarySection: React.FC<{
  summary: BudgetSummary;
}> = ({ summary }) => {
  const categories = [
    { key: 'revenus', name: 'Revenus', color: 'bg-budget-revenue', textColor: 'text-budget-revenue' },
    { key: 'factures', name: 'Factures', color: 'bg-budget-bill', textColor: 'text-budget-bill' },
    { key: 'dépenses', name: 'Dépenses', color: 'bg-budget-expense', textColor: 'text-budget-expense' },
    { key: 'épargnes', name: 'Épargnes', color: 'bg-budget-savings', textColor: 'text-budget-savings' },
  ];

  return (
    <div className="budget-card">
      <h2 className="text-xl font-bold mb-4">💰 Mon Budget</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {categories.map(category => {
          const data = summary[category.key as keyof BudgetSummary];
          const variancePercent = data.forecasted !== 0 ? (data.variance / data.forecasted) * 100 : 0;
          
          return (
            <div key={category.key} className="border rounded-lg p-4 space-y-3">
              <div className={`${category.color} text-white text-center py-2 rounded font-semibold`}>
                {category.name}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Prévisionnel:</span>
                  <span className="font-medium">{data.forecasted.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Réalisé:</span>
                  <span className="font-medium">{data.real.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Écart:</span>
                  <span className={`font-medium ${data.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.variance >= 0 ? '+' : ''}{data.variance.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Écart %:</span>
                  <span className={`font-medium ${variancePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {variancePercent >= 0 ? '+' : ''}{variancePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Composant pour les détails par catégorie
const BudgetDetailsSection: React.FC<{
  budgetData: BudgetData;
}> = ({ budgetData }) => {
  const categoriesByType = {
    revenus: [] as any[],
    factures: [] as any[],
    dépenses: [] as any[],
    épargnes: [] as any[]
  };

  Object.values(budgetData.categories).forEach(category => {
    const type = category.category_type as keyof typeof categoriesByType;
    if (categoriesByType[type]) {
      categoriesByType[type].push(category);
    }
  });

  const typeConfigs = [
    { key: 'revenus', name: 'Revenus', color: 'bg-budget-revenue' },
    { key: 'factures', name: 'Factures', color: 'bg-budget-bill' },
    { key: 'dépenses', name: 'Dépenses', color: 'bg-budget-expense' },
    { key: 'épargnes', name: 'Épargnes', color: 'bg-budget-savings' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">📋 Détails par Catégorie</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {typeConfigs.map(typeConfig => {
          const categories = categoriesByType[typeConfig.key as keyof typeof categoriesByType];
          
          return (
            <div key={typeConfig.key} className="budget-card">
              <div className={`${typeConfig.color} text-white text-center py-2 rounded-t font-semibold -m-6 mb-4`}>
                {typeConfig.name}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Catégorie</th>
                      <th className="text-right py-2">Prév.</th>
                      <th className="text-right py-2">Réel</th>
                      <th className="text-right py-2">Écart</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{category.category_name}</td>
                        <td className="text-right py-2">{category.forecasted.toFixed(2)} €</td>
                        <td className="text-right py-2">{category.real.toFixed(2)} €</td>
                        <td className={`text-right py-2 ${category.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {category.variance >= 0 ? '+' : ''}{category.variance.toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Composant pour la trésorerie
const TreasurySection: React.FC<{
  balances: Balances;
  treasury: Treasury;
  accounts: any[];
  getAccountName: (id: number) => string;
}> = ({ balances, treasury, accounts, getAccountName }) => {
  return (
    <div className="budget-card">
      <h2 className="text-xl font-bold mb-4">🏦 Trésorerie</h2>
      
      {/* Résumé global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {treasury.total_real.toFixed(2)} €
          </div>
          <div className="text-sm text-green-700">Solde RÉEL</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {treasury.total_upcoming.toFixed(2)} €
          </div>
          <div className="text-sm text-blue-700">Solde À VENIR</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {treasury.total_pending.toFixed(2)} €
          </div>
          <div className="text-sm text-orange-700">ENCOURS</div>
        </div>
      </div>

      {/* Détail par compte */}
      <div className="overflow-x-auto">
        <table className="budget-table">
          <thead>
            <tr>
              <th>Compte</th>
              <th>Solde RÉEL</th>
              <th>Solde À VENIR</th>
              <th>ENCOURS</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => (
              <tr key={account.id}>
                <td className="font-medium">{account.name}</td>
                <td className="text-right">
                  <span className={balances.real[account.id] >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {(balances.real[account.id] || 0).toFixed(2)} €
                  </span>
                </td>
                <td className="text-right">
                  <span className={balances.upcoming[account.id] >= 0 ? 'text-blue-600' : 'text-red-600'}>
                    {(balances.upcoming[account.id] || 0).toFixed(2)} €
                  </span>
                </td>
                <td className="text-right">
                  <span className={balances.pending[account.id] >= 0 ? 'text-orange-600' : 'text-red-600'}>
                    {(balances.pending[account.id] || 0).toFixed(2)} €
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetPage;