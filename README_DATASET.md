# Générateur de Dataset d'Analyse de Crédit

Script Python pour générer un dataset JSONL de fine-tuning à partir de données clients.

## 📋 Prérequis

```bash
pip install -r requirements.txt
```

## 🚀 Utilisation

### 1. Préparer les données
Téléchargez votre fichier Google Sheets en CSV :
1. Ouvrez https://docs.google.com/spreadsheets/d/1l_oH4FwD2i2TOmesTYkCaF5p4eA4RjhzEL-JNwpPsBY
2. Fichier → Télécharger → Valeurs séparées par des virgules (.csv)
3. Renommez le fichier en `clients_wall.csv`
4. Placez-le dans ce répertoire

### 2. Lancer le script
```bash
python generate_training_dataset.py
```

### 3. Résultat
Le script génère `training_dataset.jsonl` avec 100 exemples au format :
```json
{"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
```

## 🎯 Fonctionnalités

✅ **Lecture automatique** du CSV (149 colonnes)
✅ **100 prompts variés** d'analyse de crédit
✅ **4 types d'analyses** différentes :
- Analyse détaillée
- Synthèse rapide
- Analyse du risque
- Recommandations actionnables

✅ **Format JSONL** prêt pour le fine-tuning
✅ **Gestion d'erreurs** robuste
✅ **Progression** affichée en temps réel

## 📊 Personnalisation

Modifiez le nombre d'exemples dans `generate_training_dataset.py` :
```python
generator = CreditAnalysisDatasetGenerator(
    csv_path="clients_wall.csv",
    num_samples=200  # Changez ici
)
```

## 🔧 Structure du code

- `CreditAnalysisDatasetGenerator` : Classe principale
- `load_data()` : Charge le CSV
- `generate_dataset()` : Génère les exemples
- `save_dataset()` : Sauvegarde en JSONL

## 📝 Format de sortie

Chaque ligne du fichier JSONL contient :
- **user** : Prompt avec données client aléatoires
- **assistant** : Analyse détaillée du profil de crédit

Parfait pour fine-tuner un modèle sur l'analyse de crédit !
