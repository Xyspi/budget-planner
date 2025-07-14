import React from 'react';

const MemoPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="budget-header">
        <h1 className="text-2xl font-bold">📝 Mémo - Planification Annuelle</h1>
      </div>

      <div className="budget-card">
        <h2 className="text-xl font-bold mb-4">🚧 Page en cours de développement</h2>
        <p className="text-gray-600">
          Cette page permettra de planifier vos dépenses annuelles par mois.
        </p>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Fonctionnalités prévues :</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Planification des dépenses exceptionnelles par mois</li>
            <li>• Suivi des paiements effectués</li>
            <li>• Rappels pour les échéances importantes</li>
            <li>• Export vers le budget prévisionnel</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MemoPage;