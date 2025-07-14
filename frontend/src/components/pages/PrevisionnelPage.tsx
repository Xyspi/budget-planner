import React from 'react';

const PrevisionnelPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="budget-header">
        <h1 className="text-2xl font-bold">📈 Budget Prévisionnel</h1>
      </div>

      <div className="budget-card">
        <h2 className="text-xl font-bold mb-4">🚧 Page en cours de développement</h2>
        <p className="text-gray-600">
          Cette page permettra de définir votre budget prévisionnel mensuel par catégorie.
        </p>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Fonctionnalités prévues :</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Définition des montants prévisionnels par catégorie et par mois</li>
            <li>• Répartition automatique sur 12 mois</li>
            <li>• Copie des montants d'un mois à l'autre</li>
            <li>• Calcul automatique des totaux</li>
            <li>• Comparaison avec les données réelles</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrevisionnelPage;