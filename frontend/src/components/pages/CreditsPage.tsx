import React from 'react';

const CreditsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="budget-header">
        <h1 className="text-2xl font-bold">💳 Crédits & Dettes</h1>
      </div>

      <div className="budget-card">
        <h2 className="text-xl font-bold mb-4">🚧 Page en cours de développement</h2>
        <p className="text-gray-600">
          Cette page permettra de gérer vos crédits et dettes, avec suivi des remboursements.
        </p>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Fonctionnalités prévues :</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Enregistrement des crédits avec taux et durée</li>
            <li>• Calcul automatique des mensualités</li>
            <li>• Suivi des remboursements effectués</li>
            <li>• Tableau d'amortissement</li>
            <li>• Indicateurs d'endettement</li>
            <li>• Alertes pour les échéances</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;