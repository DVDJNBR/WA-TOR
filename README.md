# Wa-Tor 🐟🦈

Simulation d'un écosystème proies/prédateurs sur une mer torique (elle boucle sur elle-même, comme un donut), d'après le modèle de A.K. Dewdney (Scientific American, 1984). Projet réalisé pour s'entraîner à la programmation orientée objet en Python.

Voir le sujet complet dans [`RESOURCES/BRIEF.md`](RESOURCES/BRIEF.md).

## Règles

- Les poissons 🐟 se déplacent aléatoirement vers une case vide voisine et se reproduisent après un certain nombre de cycles survécus.
- Les requins 🦈 se déplacent vers un poisson voisin s'il y en a un (et le mangent), sinon vers une case vide. Ils se reproduisent après un certain nombre de cycles, et meurent de faim s'ils ne mangent pas assez longtemps.
- La grille est torique : les bords se rejoignent (haut/bas et gauche/droite).

## Stack

- **Backend** : Python (POO) géré avec [`uv`](https://docs.astral.sh/uv/), exposé via une petite API FastAPI. Classes du domaine dans `backend/app/models/` (`Entity`, `Fish`, `Shark`), logique de simulation dans `backend/app/simulation.py`.
- **Frontend** : JavaScript vanilla + [Vite](https://vitejs.dev/), sans framework.

## Lancer en local

Installation (une fois) :

```bash
npm install          # à la racine
cd backend && uv sync
cd ../frontend && npm install
```

Puis, à la racine, une seule commande lance le backend et le frontend ensemble :

```bash
npm run dev
```

Ouvrir `http://localhost:3000`.

## Tests

```bash
cd backend
uv run pytest
```
