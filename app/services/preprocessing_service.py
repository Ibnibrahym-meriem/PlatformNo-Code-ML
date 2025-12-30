import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler, MinMaxScaler

class PreprocessingService:
    
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
        Applique les règles de nettoyage (Auto ou Manuelles).
        """
        df_clean = df.copy()

        # --- LOGIQUE AUTO-CLEAN (Le Bouton Magique) ---
        # Si activé, on génère des stratégies automatiques pour les colonnes vides
        if cleaning_params.get("auto_clean", False):
            # 1. On force la suppression des doublons en mode auto
            cleaning_params["drop_duplicates"] = True
            
            auto_strategies = []
            
            # On parcourt toutes les colonnes pour voir s'il y a des trous
            for col in df_clean.columns:
                if df_clean[col].isnull().sum() > 0: # S'il y a des valeurs manquantes
                    
                    # Stratégie pour les Nombres -> Moyenne
                    if pd.api.types.is_numeric_dtype(df_clean[col]):
                        auto_strategies.append({"column": col, "method": "mean"})
                    
                    # Stratégie pour le Texte/Catégories -> Mode (Valeur la plus fréquente)
                    else:
                        auto_strategies.append({"column": col, "method": "mode"})
            
            # On ajoute ces stratégies auto à la liste (sans écraser celles manuelles s'il y en a)
            existing_strategies = cleaning_params.get("strategies", [])
            cleaning_params["strategies"] = existing_strategies + auto_strategies
        # ----------------------------------------------

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
        Gère Label, One-Hot et TARGET Encoding (Auto ou Manuel).
        """
        df_encoded = df.copy()
        
        # --- LOGIQUE AUTO-ENCODE ---
        if encoding_params.get("auto_encode", False):
            auto_strategies = []
            # On prend toutes les colonnes de type 'object' (texte) ou 'category'
            cat_cols = df_encoded.select_dtypes(include=['object', 'category']).columns
            
            for col in cat_cols:
                # Heuristique : Si peu de catégories (<10) -> OneHot, sinon -> Label
                if df_encoded[col].nunique() < 10:
                    auto_strategies.append({"column": col, "method": "onehot"})
                else:
                    auto_strategies.append({"column": col, "method": "label"})
            
            # On fusionne avec les stratégies manuelles
            encoding_params["strategies"] = encoding_params.get("strategies", []) + auto_strategies
        # ---------------------------

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
                    # En auto, on saute si pas de target, sinon erreur
                    continue 
                means = df_encoded.groupby(col)[target_col].transform("mean")
                df_encoded[col] = means
                
        return df_encoded

    

    @staticmethod
    def normalize_dataframe(df: pd.DataFrame, normalization_params: dict) -> pd.DataFrame:
        """
        Normalise les colonnes numériques (Auto ou Manuel).
        """
        df_norm = df.copy()
        
        # --- LOGIQUE AUTO-NORMALIZE ---
        if normalization_params.get("auto_normalize", False):
            # 1. On prend toutes les colonnes numériques
            numeric_cols = df_norm.select_dtypes(include=[np.number]).columns.tolist()
            
            # 2. IMPORTANT : On retire la Target de la liste (si elle est définie)
            # On ne veut pas normaliser la réponse (y), juste les features (X)
            target_col = normalization_params.get("target_column")
            if target_col and target_col in numeric_cols:
                numeric_cols.remove(target_col)
            
            # 3. On applique les paramètres auto
            normalization_params["columns"] = numeric_cols
            normalization_params["method"] = "standard" # Standard est le meilleur défaut
        # ------------------------------

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
        Détecte et traite les outliers (Auto ou Manuel).
        """
        df_out = df.copy()
        
        # --- LOGIQUE AUTO-OUTLIERS ---
        if params.get("auto_outliers", False):
            # En auto, on traite toutes les colonnes numériques avec IQR et Clip
            num_cols = df_out.select_dtypes(include=[np.number]).columns.tolist()
            params["columns"] = num_cols
            params["method"] = "iqr"
            params["action"] = "clip" # Plus sûr que drop
            params["threshold"] = 1.5
        # -----------------------------

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