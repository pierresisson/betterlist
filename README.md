# Template Cloudflare Workers + React

Un template moderne et complet pour créer des applications full-stack avec Cloudflare Workers. Il combine un frontend React + Vite avec un backend déployé sur l'edge, alimenté par Hono, tRPC, Drizzle ORM, et Cloudflare D1. L'authentification est gérée via Better Auth avec OTP par email et connexion OAuth sociale.

## Stack Technique

- 🖥️ **Frontend**: React 19, TypeScript, Vite pour des builds rapides et HMR
- 🔄 **Routing & Data**: Tanstack Router, Query, et Form
- 🎨 **Styling**: Tailwind CSS, composants shadcn/ui, notifications sonner toast
- 🌐 **Backend**: Hono sur Cloudflare Workers, API type-safe de bout en bout avec tRPC & Zod
- 💾 **Base de données**: Cloudflare D1 via Drizzle ORM avec migrations et fichier SQLite local pour le développement
- 🔒 **Authentification**: OTP par email et OAuth social avec Better Auth, mise en cache des sessions dans Cloudflare KV
- 🌍 **Déploiement Edge-First**: Cloudflare Workers fournit un CDN global et un cache pour un rendu rapide
- 🧰 **Outils**: Biome pour le linting/formatage, Bun pour la gestion des packages, Wrangler pour les déploiements

## Structure du Projet

```
/ (racine)
├── src
│   ├── client                    # Application frontend
│   │   ├── components            # Composants UI et navigation
│   │   ├── routes                # Pages et layouts (TanStack Router)
│   │   ├── lib                   # Client TRPC, auth-client, theme-provider
│   │   ├── index.css             # Tailwind et thèmes personnalisés
│   │   └── routeTree.gen.ts      # Définitions de routes auto-générées
│   ├── server                    # Application backend sur Workers
│   │   ├── routers               # Routeurs tRPC
│   │   ├── middlewares           # Middleware Hono (auth/db, CORS, session)
│   │   ├── db                    # Schéma Drizzle, migrations, utilitaires
│   │   └── lib                   # Configuration auth, init TRPC, définitions de types
├── dist                          # Sortie de build de production
├── wrangler.toml                 # Configuration Cloudflare Workers
├── worker-configuration.d.ts     # Types CF générés avec `wrangler types`
├── vite.config.ts                # Configuration des plugins Vite
├── drizzle.config.ts             # Configuration Drizzle-kit
├── .env                          # Variables d'environnement locales
└── .dev.vars                     # Variables d'environnement Cloudflare locales
```

## Base de Données

- Gérée avec Drizzle ORM & D1
- SQLite local stocké sous `.wrangler/`

| Script                    | Description                                        |
| ------------------------- | -------------------------------------------------- |
| `bun run db:migrate`      | Appliquer les migrations à la DB SQLite locale     |
| `bun run db:migrate:prod` | Appliquer les migrations sur Cloudflare D1 distant |
| `bun run db:studio`       | Lancer Drizzle Studio pour la DB locale            |
| `bun run db:studio:prod`  | Lancer Drizzle Studio pour la DB de prod           |
| `bun cf:typegen`          | Générer les types depuis wrangler.toml             |
| `bun cf:dev`              | Démarrer le serveur de dev Workers local           |
| `bun cf:deploy`           | Déployer sur Cloudflare Workers                    |

## Authentification

- Flux OTP par email via le plugin Better Auth
- Connexion OAuth sociale via les fournisseurs Google
- Données utilisateur stockées dans la base de données D1 (binding `DB`)
- Données de session mises en cache dans l'espace de noms KV (`SESSION_KV` binding)
- Tous les endpoints d'auth sous `/api/auth/*`

## Démarrage

### Prérequis

- Node.js v18+ ou Bun v1.2+ installé
- CLI Wrangler (`npm install -g wrangler`)
- Compte Cloudflare avec espaces de noms D1 et KV pour la production

### Variables d'Environnement

Copiez `.dev.vars.example` vers `.dev.vars` et remplissez les valeurs.

### Installation

```bash
bun install
```

### Développement

Configurez votre `wrangler.toml` avec vos propres données d'application et bindings :

- Configurez le binding de base de données D1 (`DB`)
- Configurez le binding d'espace de noms KV (`SESSION_KV`)

Puis, à chaque fois que vous éditez le fichier `wrangler.toml`, assurez-vous d'exécuter `bun cf:typegen` pour mettre à jour le fichier `worker-configuration.d.ts` avec les derniers types.

Démarrez le serveur Vite local et le serveur Workers séparément :

```bash
bun dev     // démarre le serveur frontend sur http://localhost:5173
bun cf:dev  // démarre le serveur workers sur http://localhost:8787
```

### Build et Aperçu

```bash
bun build     // crée le bundle d'assets statiques dans ./dist/
bun preview   // aperçu du build de prod disponible sur http://localhost:4173
```

### Déploiement

Déployez sur le site en direct sur Cloudflare Workers, vers un domaine personnalisé ou le domaine `app-name.username.workers.dev` :

```bash
bun cf:deploy
# ou
bunx wrangler deploy
```

## Licence

MIT License
