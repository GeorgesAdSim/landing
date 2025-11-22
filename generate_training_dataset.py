#!/usr/bin/env python3
"""
Script de génération de dataset JSONL pour fine-tuning d'analyse de crédit.

Ce script lit un fichier CSV de clients (clients_wall.csv) et génère 100 exemples
de conversations d'analyse de crédit au format JSONL pour le fine-tuning de modèles LLM.
"""

import pandas as pd
import json
import random
from pathlib import Path
from typing import Dict, List, Any, Optional
import sys
import io
import urllib.request


class CreditAnalysisDatasetGenerator:
    """Générateur de dataset pour l'analyse de crédit."""

    def __init__(
        self,
        csv_source: str = "https://docs.google.com/spreadsheets/d/1l_oH4FwD2i2TOmesTYkCaF5p4eA4RjhzEL-JNwpPsBY/export?format=csv&gid=0",
        num_samples: int = 100
    ):
        """
        Initialise le générateur.

        Args:
            csv_source: URL Google Sheets ou chemin vers fichier CSV local
            num_samples: Nombre d'exemples à générer (défaut: 100)
        """
        self.csv_source = csv_source
        self.num_samples = num_samples
        self.df = None
        self.is_url = csv_source.startswith('http')

    def load_data(self) -> None:
        """Charge les données depuis Google Sheets ou fichier CSV local."""
        if self.is_url:
            print(f"📡 Chargement depuis Google Sheets...")
            try:
                # Utilise urllib avec un user-agent pour contourner les restrictions
                req = urllib.request.Request(
                    self.csv_source,
                    headers={'User-Agent': 'Mozilla/5.0'}
                )
                with urllib.request.urlopen(req) as response:
                    csv_data = response.read().decode('utf-8')
                self.df = pd.read_csv(io.StringIO(csv_data))
            except Exception as e:
                raise ValueError(
                    f"❌ Impossible de charger depuis Google Sheets.\n"
                    f"Erreur: {e}\n\n"
                    f"Assurez-vous que le fichier est partagé publiquement:\n"
                    f"1. Ouvrez Google Sheets\n"
                    f"2. Partager → Tous les utilisateurs avec le lien → Lecteur\n"
                    f"3. Relancez le script"
                )
        else:
            csv_path = Path(self.csv_source)
            if not csv_path.exists():
                raise FileNotFoundError(
                    f"❌ Fichier {csv_path} non trouvé.\n"
                    f"Veuillez placer le fichier clients_wall.csv dans ce répertoire."
                )
            print(f"📂 Chargement de {csv_path}...")
            self.df = pd.read_csv(csv_path)

        print(f"✅ {len(self.df)} clients chargés avec {len(self.df.columns)} colonnes")

        if len(self.df) == 0:
            raise ValueError("Le fichier CSV est vide !")

    def _get_random_client(self) -> pd.Series:
        """Retourne un client aléatoire du dataset."""
        return self.df.sample(n=1).iloc[0]

    def _format_client_data(self, client: pd.Series) -> str:
        """
        Formate les données d'un client pour le prompt.

        Args:
            client: Série pandas contenant les données du client

        Returns:
            String formatée avec les données du client
        """
        # Sélectionne aléatoirement 10-20 colonnes pertinentes
        num_cols = random.randint(10, min(20, len(client)))
        selected_cols = random.sample(list(client.index), num_cols)

        # Formate les données
        data_lines = []
        for col in selected_cols:
            value = client[col]
            # Ignore les valeurs NaN
            if pd.notna(value):
                data_lines.append(f"  - {col}: {value}")

        return "\n".join(data_lines)

    def _generate_analysis(self, client: pd.Series) -> str:
        """
        Génère une analyse de crédit basée sur les données du client.

        Args:
            client: Série pandas contenant les données du client

        Returns:
            Analyse détaillée du profil de crédit
        """
        # Templates d'analyse variés
        templates = [
            self._analysis_template_detailed,
            self._analysis_template_summary,
            self._analysis_template_risk_focused,
            self._analysis_template_recommendation,
        ]

        # Sélectionne un template aléatoire
        template_func = random.choice(templates)
        return template_func(client)

    def _analysis_template_detailed(self, client: pd.Series) -> str:
        """Template d'analyse détaillée."""
        status = client.get('cc_status', 'N/A')
        referer = client.get('ge_referen', 'N/A')

        return f"""Analyse détaillée du profil de crédit :

## Synthèse
Ce dossier présente un statut "{status}" et est référencé par {referer}. Après examen des données fournies, voici mon évaluation.

## Points clés
- Statut du compte : {status}
- Gestionnaire de référence : {referer}
- Nombre de critères analysés : {client.notna().sum()}

## Évaluation du risque
Basé sur les informations disponibles, ce profil nécessite une attention particulière concernant les éléments suivants :
1. Vérification de la cohérence des données
2. Analyse de l'historique de crédit
3. Évaluation de la capacité de remboursement

## Recommandations
- Procéder à une vérification approfondie des documents
- Consulter l'historique complet avant décision finale
- Impliquer le gestionnaire {referer} dans le processus de validation
"""

    def _analysis_template_summary(self, client: pd.Series) -> str:
        """Template d'analyse résumée."""
        status = client.get('cc_status', 'N/A')

        return f"""Synthèse rapide du dossier :

**Statut** : {status}
**Complétude** : {client.notna().sum()}/{len(client)} champs renseignés

**Évaluation** :
Ce dossier contient suffisamment d'informations pour une première analyse. Le statut "{status}" indique qu'une revue est nécessaire avant toute décision d'octroi de crédit.

**Action recommandée** :
Passer à l'étape de vérification documentaire et d'analyse approfondie.
"""

    def _analysis_template_risk_focused(self, client: pd.Series) -> str:
        """Template focalisé sur le risque."""
        status = client.get('cc_status', 'N/A')

        risk_indicators = {
            'MAIL': 'faible',
            'RECENT': 'moyen',
            'DOUBLON': 'élevé',
            'ATTDOC': 'moyen',
            'NONREA': 'élevé'
        }

        risk_level = risk_indicators.get(status, 'à évaluer')

        return f"""Analyse du risque de crédit :

**Niveau de risque estimé** : {risk_level.upper()}

**Facteurs de risque identifiés** :
- Statut du dossier : {status} (risque {risk_level})
- Complétude des données : {(client.notna().sum() / len(client) * 100):.1f}%

**Indicateurs positifs** :
- Dossier présent dans le système
- Données structurées disponibles

**Points de vigilance** :
- Nécessité de vérifier l'authenticité des informations
- Validation requise par le gestionnaire de référence

**Décision préliminaire** :
{"Dossier acceptable sous réserve de vérifications" if risk_level in ['faible', 'moyen'] else "Dossier nécessitant une analyse approfondie avant décision"}
"""

    def _analysis_template_recommendation(self, client: pd.Series) -> str:
        """Template avec recommandations actionnables."""
        status = client.get('cc_status', 'N/A')
        referer = client.get('ge_referen', 'N/A')

        return f"""Recommandations pour le dossier :

## Actions immédiates
1. ✅ Vérifier l'identité du demandeur
2. ✅ Consulter l'historique de crédit
3. ✅ Valider les revenus déclarés

## Contacts
- Gestionnaire assigné : {referer}
- Statut actuel : {status}

## Prochaines étapes
1. Collecter les documents manquants
2. Effectuer une analyse financière détaillée
3. Soumettre pour approbation finale

## Timeline recommandée
- Jour 1-2 : Collecte documentaire
- Jour 3-5 : Analyse et vérifications
- Jour 6-7 : Décision finale

Ce processus garantit une évaluation complète tout en maintenant un délai raisonnable.
"""

    def _generate_user_prompt(self, client: pd.Series) -> str:
        """
        Génère le prompt utilisateur.

        Args:
            client: Série pandas contenant les données du client

        Returns:
            Prompt formaté pour l'utilisateur
        """
        client_data = self._format_client_data(client)

        # Variations de prompts
        prompts = [
            f"Analyse ce profil de crédit et donne ton évaluation :\n\n{client_data}",
            f"Peux-tu analyser ce dossier client pour une demande de crédit ?\n\n{client_data}",
            f"Voici les données d'un client. Quelle est ton analyse du risque de crédit ?\n\n{client_data}",
            f"J'ai besoin d'une évaluation de crédit pour ce profil :\n\n{client_data}",
            f"Analyse de crédit demandée pour :\n\n{client_data}\n\nQuelle est ta recommandation ?",
            f"Évalue ce dossier de demande de crédit :\n\n{client_data}",
        ]

        return random.choice(prompts)

    def generate_dataset(self) -> List[Dict[str, Any]]:
        """
        Génère le dataset complet.

        Returns:
            Liste de dictionnaires au format JSONL pour fine-tuning
        """
        print(f"\n🔄 Génération de {self.num_samples} exemples...")

        dataset = []
        for i in range(self.num_samples):
            # Sélectionne un client aléatoire
            client = self._get_random_client()

            # Génère le prompt utilisateur
            user_prompt = self._generate_user_prompt(client)

            # Génère l'analyse assistant
            assistant_response = self._generate_analysis(client)

            # Formate au format JSONL
            example = {
                "messages": [
                    {
                        "role": "user",
                        "content": user_prompt
                    },
                    {
                        "role": "assistant",
                        "content": assistant_response
                    }
                ]
            }

            dataset.append(example)

            # Affiche la progression
            if (i + 1) % 10 == 0:
                print(f"  ✓ {i + 1}/{self.num_samples} exemples générés")

        print(f"✅ {self.num_samples} exemples générés avec succès !\n")
        return dataset

    def save_dataset(self, dataset: List[Dict[str, Any]], output_path: str = "training_dataset.jsonl") -> None:
        """
        Sauvegarde le dataset au format JSONL.

        Args:
            dataset: Liste d'exemples à sauvegarder
            output_path: Chemin du fichier de sortie
        """
        output_file = Path(output_path)

        print(f"💾 Sauvegarde dans {output_file}...")

        with output_file.open('w', encoding='utf-8') as f:
            for example in dataset:
                f.write(json.dumps(example, ensure_ascii=False) + '\n')

        print(f"✅ Dataset sauvegardé : {output_file}")
        print(f"📊 Taille du fichier : {output_file.stat().st_size / 1024:.2f} KB")

    def run(self, output_path: str = "training_dataset.jsonl") -> None:
        """
        Lance la génération complète du dataset.

        Args:
            output_path: Chemin du fichier de sortie
        """
        print("🚀 Générateur de Dataset d'Analyse de Crédit")
        print("=" * 50)

        try:
            # Charge les données
            self.load_data()

            # Génère le dataset
            dataset = self.generate_dataset()

            # Sauvegarde
            self.save_dataset(dataset, output_path)

            print("\n" + "=" * 50)
            print("✨ Génération terminée avec succès !")
            print(f"📁 Fichier prêt pour le fine-tuning : {output_path}")

        except Exception as e:
            print(f"\n❌ Erreur : {e}", file=sys.stderr)
            sys.exit(1)


def main():
    """Point d'entrée principal du script."""
    # Par défaut, charge depuis Google Sheets
    # Pour utiliser un fichier local, passez csv_source="clients_wall.csv"
    generator = CreditAnalysisDatasetGenerator(
        num_samples=100
    )
    generator.run()


if __name__ == "__main__":
    main()
