import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler, MinMaxScaler

class PreprocessingService:

    @staticmethod
    def run_auto_pipeline(df: pd.DataFrame, target_column: str = None) -> pd.DataFrame:
        """
        Analyse le dataset et applique TOUTES les étapes automatiquement.
        C'est cette fonction qui décide des stratégies.
        """
        df_current = df.copy()

        # --- 1. GESTION DES DOUBLONS ---
        initial_rows = len(df_current)
        df_current = df_current.drop_duplicates()
        if len(df_current) < initial_rows:
            print(f"Doublons supprimés : {initial_rows - len(df_current)}")

        # --- 2. GESTION INTELLIGENTE DES VALEURS MANQUANTES ---
        cols_to_drop = []
        rows_to_drop_indices = set()
        imputation_strategies = []

        for col in df_current.columns:
            missing_count = df_current[col].isnull().sum()
            if missing_count > 0:
                ratio = missing_count / len(df_current)

                # Cas A : > 40% -> On supprime la COLONNE
                if ratio > 0.40:
                    cols_to_drop.append(col)
                
                # Cas B : < 5% -> On marquera les LIGNES à supprimer
                elif ratio < 0.05:
                    # On note les index des lignes vides pour ce champ
                    rows_to_drop_indices.update(df_current[df_current[col].isnull()].index)
                
                # Cas C : Entre 5% et 40% -> On IMPUTE (Remplissage)
                else:
                    # Si c'est un nombre
                    if pd.api.types.is_numeric_dtype(df_current[col]):
                        # Test de Skewness (Asymétrie)
                        # Si > 1 ou < -1, la distribution est biaisée -> Médiane
                        # Sinon, c'est une courbe en cloche -> Moyenne
                        skew_val = df_current[col].skew()
                        if abs(skew_val) > 1:
                            imputation_strategies.append({"column": col, "method": "median"})
                        else:
                            imputation_strategies.append({"column": col, "method": "mean"})
                    
                    # Si c'est du texte -> Mode 
                    else:
                        imputation_strategies.append({"column": col, "method": "mode"})

        # Application des suppressions
        if cols_to_drop:
            df_current.drop(columns=cols_to_drop, inplace=True)
        
        if rows_to_drop_indices:
            df_current.drop(index=list(rows_to_drop_indices), inplace=True)
            df_current.reset_index(drop=True, inplace=True)

        # Application des imputations (pour le reste)
        if imputation_strategies:
            df_current = PreprocessingService.clean_dataframe(df_current, {
                "strategies": imputation_strategies
            })

        # --- 2. GÉNÉRATION DES STRATÉGIES D'ENCODAGE ---
        encoding_strategies = []
        # On prend les colonnes texte
        cat_cols = df_current.select_dtypes(include=['object', 'category']).columns

        if target_column and target_column in cat_cols:
             le = LabelEncoder()
             df_current[target_column] = le.fit_transform(df_current[target_column].astype(str))
             # On retire la target de la liste pour ne pas la ré-encoder
             cat_cols = [c for c in cat_cols if c != target_column]
        
        for col in cat_cols:
            # Cas 1 : Faible cardinalité (< 10) -> OneHot
            if df_current[col].nunique() < 10:
                encoding_strategies.append({"column": col, "method": "onehot"})
            
            # Cas 2 : Haute cardinalité (> 10)
            else:
                # Si on a une target 
                if target_column in df_current.columns:
                    encoding_strategies.append({"column": col, "method": "target"})
                else:
                    # Pas de target -> Label Encoding 
                    encoding_strategies.append({"column": col, "method": "label"})
        # Exécution de l'encodage
        if encoding_strategies:
            df_current = PreprocessingService.encode_dataframe(df_current, {
                "strategies": encoding_strategies,
                "target_column": target_column
            })

        # --- 4. TRAITEMENT DES OUTLIERS (Sélectif) ---
        num_cols = df_current.select_dtypes(include=[np.number]).columns.tolist()
        cols_outliers = []

        for col in num_cols:
            if col == target_column: continue
            
            # Exclusion 1 : Binaires (0/1)
            if df_current[col].nunique() <= 2: continue
            
            # Exclusion 2 : "Faux numériques" (catégories encodées 1,2,3...10)
            if df_current[col].nunique() < 15: continue

            # Candidat validé
            cols_outliers.append(col)

        if cols_outliers:
            df_current = PreprocessingService.handle_outliers(df_current, {
                "columns": cols_outliers,
                "method": "iqr",
                "threshold": 1.5,
                "action": "clip" 
            })

        # --- 4. NORMALISATION ---
        num_cols = df_current.select_dtypes(include=[np.number]).columns.tolist()
        cols_std = []   # Pour distribution Gaussienne
        cols_minmax = [] # Pour distribution étalée

        for col in num_cols:
            if col == target_column: continue
            if df_current[col].nunique() <= 2: continue # Pas les binaires
            if df_current[col].var() < 1e-5: continue # Variance quasi nulle
            
            # Test Skewness
            skew_val = df_current[col].skew()
            if -1 < skew_val < 1:
                cols_std.append(col)
            else:
                cols_minmax.append(col)

        if cols_std:
            df_current = PreprocessingService.normalize_dataframe(df_current, {"method": "standard", "columns": cols_std})
        if cols_minmax:
            df_current = PreprocessingService.normalize_dataframe(df_current, {"method": "minmax", "columns": cols_minmax})

        # --- 5. BALANCING (Si target présente et classification) ---
        if target_column and target_column in df_current.columns:
             if df_current[target_column].nunique() < 20: # Sécurité
                 counts = df_current[target_column].value_counts()
                 if (counts.min() / counts.max()) < 0.6: # Si déséquilibre marqué
                     try:
                        df_current = PreprocessingService.balance_data(df_current, {
                            "target_column": target_column, "method": "smote"
                        })
                     except:
                         pass # On ignore si ça échoue 

        return df_current
    
    @staticmethod
    def get_dataframe_info(df: pd.DataFrame) -> dict:
        """
        Analyse le DataFrame et retourne un rapport complet sur sa santé.
        """
        # 1. Infos Générales
        total_rows, total_cols = df.shape
        memory_usage = df.memory_usage(deep=True).sum() / 1024 ** 2 # En MB
        
        # 2. Analyse par colonne (Types et Manquants)
        columns_info = []
        for col in df.columns:
            col_type = str(df[col].dtype)
            missing_count = int(df[col].isnull().sum())
            missing_pct = round((missing_count / total_rows) * 100, 2)
            unique_values = df[col].nunique()
            
            columns_info.append({
                "name": col,
                "type": col_type,
                "missing": missing_count,
                "missing_percent": missing_pct,
                "unique": unique_values
            })

        # 3. Statistiques Descriptives (Uniquement pour les colonnes numériques)
        # On remplace les NaN par None pour que le JSON soit valide
        description = df.describe().where(pd.notnull(df.describe()), None).to_dict()

        # 4. Doublons
        duplicates = int(df.duplicated().sum())

        return {
            "shape": {"rows": total_rows, "columns": total_cols},
            "memory_mb": round(memory_usage, 2),
            "duplicates": duplicates,
            "columns_summary": columns_info,
            "statistics": description, # Moyenne, min, max, quartiles...
            "preview": df.head(5).where(pd.notnull(df), None).to_dict(orient="records")
        }

    @staticmethod
    def clean_dataframe(df: pd.DataFrame, cleaning_params: dict) -> pd.DataFrame:
        """
        Applique les règles de nettoyage.
        """
        df_clean = df.copy()

        # 1. Suppression des doublons
        if cleaning_params.get("drop_duplicates", False):
            df_clean = df_clean.drop_duplicates()

        # 2. Gestion des valeurs manquantes par colonne (Boucle standard)
        strategies = cleaning_params.get("strategies", [])
        
        for rule in strategies:
            col = rule.get("column")
            method = rule.get("method")
            fill_value = rule.get("value", None)

            if col not in df_clean.columns:
                continue

            # --- APPLICATION DES STRATÉGIES ---
            if method == "drop_rows":
                df_clean = df_clean.dropna(subset=[col])
            
            elif method == "mean":
                if pd.api.types.is_numeric_dtype(df_clean[col]):
                    mean_val = df_clean[col].mean()
                    df_clean[col] = df_clean[col].fillna(mean_val)
            
            elif method == "median":
                if pd.api.types.is_numeric_dtype(df_clean[col]):
                    median_val = df_clean[col].median()
                    df_clean[col] = df_clean[col].fillna(median_val)
            
            elif method == "mode":
                if not df_clean[col].mode().empty:
                    mode_val = df_clean[col].mode()[0]
                    df_clean[col] = df_clean[col].fillna(mode_val)
            
            elif method == "constant" and fill_value is not None:
                df_clean[col] = df_clean[col].fillna(fill_value)

        return df_clean
  

    @staticmethod
    def encode_dataframe(df: pd.DataFrame, encoding_params: dict) -> pd.DataFrame:
        """
        Gère Label, One-Hot et TARGET Encoding.
        """
        df_encoded = df.copy()
        strategies = encoding_params.get("strategies", [])
        target_col = encoding_params.get("target_column") 
        
        from sklearn.preprocessing import LabelEncoder

        for rule in strategies:
            col = rule.get("column")
            method = rule.get("method")
            
            if col not in df_encoded.columns:
                continue
            
            # --- Cas 1 : LABEL ENCODING ---
            if method == "label":
                df_encoded[col] = df_encoded[col].astype(str)
                le = LabelEncoder()
                df_encoded[col] = le.fit_transform(df_encoded[col])
            
            # --- Cas 2 : ONE-HOT ENCODING ---
            elif method == "onehot":
                # Petite sécurité pour éviter l'explosion de colonnes
                if df_encoded[col].nunique() > 50: 
                     # Fallback sur Label si trop grand, même si on a demandé OneHot
                    df_encoded[col] = df_encoded[col].astype(str)
                    le = LabelEncoder()
                    df_encoded[col] = le.fit_transform(df_encoded[col])
                else:
                    dummies = pd.get_dummies(df_encoded[col], prefix=col, dtype=int)
                    df_encoded = pd.concat([df_encoded, dummies], axis=1)
                    df_encoded.drop(columns=[col], inplace=True)

            # --- Cas 3 : TARGET ENCODING ---
            elif method == "target":
                if not target_col or target_col not in df_encoded.columns:
                    continue 
                means = df_encoded.groupby(col)[target_col].transform("mean")
                df_encoded[col] = means
                
        return df_encoded

    

    @staticmethod
    def normalize_dataframe(df: pd.DataFrame, normalization_params: dict) -> pd.DataFrame:
        """
        Normalise les colonnes numériques.
        """
        df_norm = df.copy()
        method = normalization_params.get("method", "standard")
        target_cols = normalization_params.get("columns", [])
        
        # On ne garde que les colonnes qui existent et sont numériques
        cols_to_process = [c for c in target_cols if c in df_norm.columns and pd.api.types.is_numeric_dtype(df_norm[c])]
        
        if not cols_to_process:
            return df_norm # Rien à faire

        if method == "standard":
            scaler = StandardScaler()
            df_norm[cols_to_process] = scaler.fit_transform(df_norm[cols_to_process])
            
        elif method == "minmax":
            scaler = MinMaxScaler()
            df_norm[cols_to_process] = scaler.fit_transform(df_norm[cols_to_process])
            
        return df_norm
    
    @staticmethod
    def handle_outliers(df: pd.DataFrame, params: dict) -> pd.DataFrame:
        """
        Détecte et traite les outliers.
        """
        df_out = df.copy()
        method = params.get("method", "iqr")
        threshold = params.get("threshold", 1.5)
        action = params.get("action", "clip")
        target_cols = params.get("columns", [])

        # On ne traite que les colonnes numériques demandées
        cols_to_process = [c for c in target_cols if c in df_out.columns and pd.api.types.is_numeric_dtype(df_out[c])]

        for col in cols_to_process:
            if method == "zscore":
                mean = df_out[col].mean()
                std = df_out[col].std()
                lower_bound = mean - threshold * std
                upper_bound = mean + threshold * std
            
            elif method == "iqr":
                Q1 = df_out[col].quantile(0.25)
                Q3 = df_out[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - threshold * IQR
                upper_bound = Q3 + threshold * IQR

            if action == "drop":
                df_out = df_out[(df_out[col] >= lower_bound) & (df_out[col] <= upper_bound)]
            
            elif action == "clip":
                df_out[col] = df_out[col].clip(lower=lower_bound, upper=upper_bound)

        return df_out
    
    @staticmethod
    def balance_data(df: pd.DataFrame, params: dict) -> pd.DataFrame:
        """
        Rééquilibre les classes (Target).
        params: {
            "target_column": "survived",
            "method": "smote" (Oversampling synthétique) ou "random_under" (Suppression),
        }
        """
        target_col = params.get("target_column")
        method = params.get("method", "smote")
        
        if target_col not in df.columns:
            raise ValueError(f"Colonne cible '{target_col}' introuvable.")

        # Séparation Features (X) / Target (y)
        X = df.drop(columns=[target_col])
        y = df[target_col]

        # Vérification : Tout doit être numérique pour SMOTE
        # On tente de convertir, si ça plante, c'est que l'user n'a pas encore encodé.
        try:
            X = X.astype(float)
        except ValueError:
            raise ValueError("Impossible de rééquilibrer : Le dataset contient encore du texte. Veuillez faire l'Encodage d'abord.")

        from imblearn.over_sampling import SMOTE, RandomOverSampler
        from imblearn.under_sampling import RandomUnderSampler

        sampler = None
        if method == "smote":
            sampler = SMOTE(random_state=42)
        elif method == "random_over":
            sampler = RandomOverSampler(random_state=42)
        elif method == "random_under":
            sampler = RandomUnderSampler(random_state=42)
        
        # Resampling
        X_res, y_res = sampler.fit_resample(X, y)
        
        # On recolle les morceaux pour refaire un DataFrame
        df_res = pd.concat([pd.DataFrame(X_res, columns=X.columns), pd.Series(y_res, name=target_col)], axis=1)
        
        return df_res