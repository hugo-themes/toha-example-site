---
title: "Platform engineering : bâtir une plateforme interne durable"
date: 2025-03-22T10:00:00+01:00
description: >
  Fil rouge autour du dépôt platform-project : portail HTML local, GitHub Actions,
  claims Crossplane versionnés, Argo CD et Compute Engine — vers un catalogue de
  services et un frontend plus riche.
tags:
  - Platform engineering
  - DevOps
  - Cloud
  - GCP
  - Crossplane
  - GitOps
  - Automatisation
categories:
  - Veille
menu:
  sidebar:
    name: Platform engineering
    identifier: platform-engineering
    weight: 10
---

Le **platform engineering** consiste à traiter l’infrastructure et les outils comme un **produit** : une plateforme interne qui réduit la friction pour les équipes tout en gardant des garde-fous (sécurité, coûts, conformité).

Cet article s’appuie sur **mon dépôt de travail [`platform-project`](https://github.com/Shinr0/platform-project)** : aujourd’hui, un **portail web** (fichier HTML servi en local) déclenche des **GitHub Actions** qui écrivent des **claims Crossplane** dans le repo ; **Argo CD** synchronise ces manifests vers le cluster, et **Crossplane** provisionne des VMs **Compute Engine** via le provider GCP Upbound. Demain : **autres compositions** (nouveaux services) et un **frontend** plus abouti, sans changer l’idée de fond — *GitOps + API plateforme contrôlée*.

---

## Ce que contient `platform-project` (aperçu)

| Élément | Rôle |
| ------- | ---- |
| `frontend/index.html` | Portail **Platform Engineering** : formulaire création / édition / suppression de VM, liste des claims via l’API GitHub, suivi des **workflow runs** (token + `owner/repo` en localStorage). |
| `.github/workflows/` | `create-vm.yml`, `update-vm.yml`, `delete-vm.yml` : validation du nom, génération ou mise à jour des fichiers sous `crossplane/claims/`, commit poussé sur `main`. |
| `crossplane/claims/*.yaml` | **Source de vérité déclarative** : une `VirtualMachine` (API `compute.platform.local/v1alpha1`) par VM, lue par Argo CD. |
| `crossplane/compositions/` | **Composition** `vm-gcp-compute` : pipeline **Go Template** (`function-go-templating`) qui matérialise `Instance`, adresse **statique** optionnelle, **disque de données** + `AttachedDisk` si besoin. |
| `argocd/application-claims.yaml` | Application Argo CD pointant sur le chemin `crossplane/claims` du repo (sync automatique, prune, self-heal). |
| `scripts/setup.sh` | Bootstrap local : cluster **Kind**, **Crossplane**, provider **GCP Compute** Upbound, fonctions Crossplane, compositions, **Argo CD** + application des claims. |
| `slides/` (optionnel) | Présentation **Slidev** pour expliquer le projet. |

Le portail n’appelle pas GCP directement : il déclenche l’API **`workflow_dispatch`** GitHub — la **politique** (choix de machine types, zones, validation du nom) vit dans les workflows et dans la composition.

---

## Fil rouge : aujourd’hui

1. **Ouvrir** `frontend/index.html` en local (ou le servir via un petit serveur statique) et renseigner **Settings** : Personal Access Token GitHub avec droits `actions` / repo, et cible `owner/platform-project`.
2. **Créer une VM** : le formulaire envoie les paramètres (nom, `machineType`, zone, tailles de disques, spot, IP statique) au workflow `create-vm.yml`.
3. Le workflow **écrit** `crossplane/claims/<nom>.yaml` (claim `VirtualMachine` avec `spec.parameters`) et pousse sur `main`.
4. **Argo CD** réconcilie le dossier `crossplane/claims` vers le namespace `default` du cluster.
5. **Crossplane** exécute la composition : ressources managées **Upbound** (`Instance`, `Address`, `Disk`, `AttachedDisk` selon les options) → **Google Compute Engine**.

Les toasts du portail le rappellent : après un déclenchement, **« ArgoCD will sync shortly »** — le lien utilisateur → Git → cluster → cloud est explicite.

---

## Fil rouge : demain (même architecture, plus de surface)

- **Nouveaux services** : ajouter d’autres **XRD / Compositions** (ex. bucket GCS, compte de service, règles réseau) et de nouveaux workflows (ou un workflow générique paramétré) qui génèrent des claims dans des sous-dossiers dédiés, toujours synchronisés par Argo CD.
- **Frontend** : remplacer ou compléter la page unique par une app (auth SSO, catalogue à onglets, file d’attente de demandes) tout en **gardant** GitHub Actions + repo comme couche d’orchestration — ou en introduisant une petite API backend si tu veux sortir du modèle « tout PAT côté navigateur » (recommandé en entreprise).

---

## Architecture telle qu’elle est dans le repo

{{< mermaid >}}
flowchart LR
  subgraph ux["Expérience"]
    FE["frontend/index.html\n(portail local)"]
  end

  subgraph github["GitHub"]
    GHA["Actions\ncreate / update / delete VM"]
    REPO["Repo Git\n crossplane/claims/*.yaml"]
  end

  subgraph cluster["Cluster (ex. Kind)"]
    ARGO["Argo CD"]
    XP["Crossplane"]
    COMP["Composition +\nGo templating"]
  end

  subgraph gcp["GCP"]
    CE["Compute Engine\n(Instance, IP, disques)"]
  end

  FE -->|"workflow_dispatch\nAPI GitHub"| GHA
  GHA -->|"commit / push"| REPO
  REPO --> ARGO
  ARGO --> XP
  XP --> COMP
  COMP --> CE
{{< /mermaid >}}

---

## Relier ça aux idées classiques du platform engineering

### Plateforme produit, pas catalogue d’outils

| Besoin | Comment le repo y répond |
| ------ | ------------------------ |
| VM standardisée | Claim unique + composition qui impose image Debian, réseau, tags, options spot / IP / data disk. |
| Traçabilité | Historique **Git** sur les claims, **Actions** pour qui a déclenché quoi, métadonnées `managed-by`, `created-by`. |
| Évolution catalogue | Nouveaux types de claims + compositions, sans abandonner le modèle GitOps. |
| Environnement local reproductible | `scripts/setup.sh` + Kind pour reproduire cluster + Crossplane + Argo CD. |

### Points de vigilance (honnêtes)

- **Token dans le navigateur** : pratique pour un lab ; en prod, il faudrait **OAuth GitHub App**, backend proxy, ou portail derrière ton SSO.
- **Réseau GCP** : la composition actuelle s’appuie sur le réseau **default** — à durcir pour un vrai produit interne (VPC dédié, sous-réseaux, pare-feu).

---

## Roadmap suggérée (toujours alignée avec le dépôt)

1. **Durcir** le parcours lab → « démo présentable » (doc README, variables, gestion des secrets côté cluster).
2. **Documenter** le contrat du claim `VirtualMachine` (champs, valeurs par défaut, ce que la composition crée réellement).
3. **Mesurer** : délai entre push du claim et VM `READY`, nombre de claims, coûts spot vs standard.
4. **Deuxième ressource** : choisir une composition simple (ex. stockage) et l’exposer dans le portail (nouvel onglet ou nouvelle page).
5. **Frontend v2** : même flux métier, UX et auth de niveau « produit ».

---

## Pistes d’articles suivants

- Détail du **pipeline Crossplane** (XRD, composition, `function-go-templating`).
- Pourquoi **GitOps** (Argo CD) plutôt qu’un simple `kubectl apply` depuis la CI.
- **Sécurisation** du portail et remplacement du PAT utilisateur.

---

*Article calé sur l’état du dépôt `platform-project` — à mettre à jour si tu renommes des workflows, changes d’organisation GitHub ou ajoutes des services.*
