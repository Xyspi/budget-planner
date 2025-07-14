# Budget Planner

Application web de gestion budgétaire reproduisant fidèlement le Budget Planner Excel v1.3.

## 🎯 Fonctionnalités

- **Authentification GitHub OAuth** - Connexion sécurisée avec votre compte GitHub
- **Gestion des paramètres** - Configuration des comptes, catégories et dates budgétaires
- **Transactions avec système de pointage** - Saisie et validation des opérations
- **Tableau de bord budgétaire** - Suivi en temps réel des budgets et soldes
- **Gestion des épargnes** - Objectifs et affectations d'épargne
- **Suivi des crédits** - Gestion de l'endettement et des remboursements
- **Calculs automatiques** - Soldes réels, à venir et encours

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework** : FastAPI avec SQLAlchemy
- **Base de données** : PostgreSQL
- **Authentification** : OAuth GitHub + JWT
- **API** : REST avec documentation automatique

### Frontend (React + TypeScript)
- **Framework** : React 18 avec TypeScript
- **Styles** : Tailwind CSS
- **State Management** : React Query
- **Graphiques** : Chart.js

### Structure du projet
```
budget-planner/
├── backend/
│   ├── app/
│   │   ├── models/          # Modèles SQLAlchemy (8 tables)
│   │   ├── schemas/         # Schémas Pydantic
│   │   ├── services/        # Logique métier
│   │   ├── routers/         # Endpoints API
│   │   └── core/           # Configuration, auth, database
│   ├── alembic/            # migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── hooks/          # Hooks personnalisés
│   │   ├── services/       # Appels API
│   │   └── types/          # Types TypeScript
│   └── package.json
└── docker-compose.yml
```

## 🚀 Installation

### Prérequis
- Docker et Docker Compose
- Compte GitHub (pour OAuth)

### Configuration GitHub OAuth

1. Créez une application GitHub :
   - Allez sur https://github.com/settings/developers
   - Cliquez sur "New OAuth App"
   - Remplissez les champs :
     - Application name: `Budget Planner`
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:8000/api/v1/auth/callback`

2. Copiez le Client ID et Client Secret

### Lancement de l'application

1. Clonez le repository
2. Copiez `.env.example` vers `.env` et configurez les variables :
   ```bash
   cp .env.example .env
   ```
   
3. Modifiez `.env` avec vos informations GitHub :
   ```
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   SECRET_KEY=your-secret-key-change-in-production
   ```

4. Démarrez l'application :
   ```bash
   docker-compose up --build
   ```

5. Accédez à l'application :
   - **Frontend** : http://localhost:3000
   - **Backend API** : http://localhost:8000
   - **Documentation API** : http://localhost:8000/docs

## 📊 Modèle de données

### Tables principales

- **users** : Utilisateurs avec authentification GitHub
- **categories** : 4 types (revenus, factures, dépenses, épargnes)
- **accounts** : Comptes bancaires avec soldes
- **transactions** : Opérations avec système de pointage
- **budget_forecasts** : Prévisions budgétaires mensuelles
- **memo_items** : Planification des dépenses annuelles
- **savings_allocations** : Affectation des épargnes
- **savings_goals** : Objectifs d'épargne
- **credit_details** : Détails des crédits et dettes

## 🔧 Système de pointage

Le cœur du système repose sur le champ `is_processed` des transactions :

- **Solde RÉEL** : Calculé avec les transactions pointées (`is_processed = true`)
- **Solde À VENIR** : Calculé avec toutes les transactions
- **ENCOURS** : Différence entre les deux (transactions en attente)

## 📱 Pages de l'application

1. **Paramètres** : Configuration initiale (comptes, catégories, dates)
2. **Mémo** : Planification des dépenses annuelles
3. **Prévisionnel** : Budget prévisionnel mensuel
4. **Transactions** : Saisie et gestion des opérations
5. **Budget** : Tableau de bord principal
6. **Épargnes** : Suivi des objectifs d'épargne
7. **Crédits** : Gestion de l'endettement

## 🧪 Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## 🔒 Sécurité

- Authentification OAuth GitHub uniquement
- Tokens JWT pour les sessions
- Row Level Security sur PostgreSQL
- Validation des données côté API
- CORS configuré pour l'environnement

## 📝 API Documentation

La documentation complète de l'API est disponible à l'adresse http://localhost:8000/docs une fois l'application démarrée.

## 🤝 Contribution

Ce projet reproduit fidèlement le Budget Planner Excel v1.3. Les contributions doivent respecter cette contrainte de compatibilité fonctionnelle.

## 📄 Licence

Usage personnel uniquement.