import React from 'react';

const EpargnesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="budget-header">
        <h1 className="text-2xl font-bold">💰 Épargnes</h1>
      </div>

      <div className="budget-card">
        <h2 className="text-xl font-bold mb-4">🚧 Page en cours de développement</h2>
        <p className="text-gray-600">
          Cette page permettra de suivre vos objectifs d'épargne et leur progression.
        </p>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Fonctionnalités prévues :</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Définition des objectifs d'épargne par catégorie</li>
            <li>• Suivi de la progression vers les objectifs</li>
            <li>• Affectation des épargnes par compte</li>
            <li>• Graphiques de progression</li>
            <li>• Notifications quand les objectifs sont atteints</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EpargnesPage;