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

        # --- 1. GÉNÉRATION DES STRATÉGIES DE NETTOYAGE ---
        cleaning_strategies = []
        for col in df_current.columns:
            if df_current[col].isnull().sum() > 0:
                # Si numérique -> Moyenne
                if pd.api.types.is_numeric_dtype(df_current[col]):
                    cleaning_strategies.append({"column": col, "method": "mean"})
                # Sinon -> Mode
                else:
                    cleaning_strategies.append({"column": col, "method": "mode"})
        
        # Exécution du nettoyage
        df_current = PreprocessingService.clean_dataframe(df_current, {
            "drop_duplicates": True,
            "strategies": cleaning_strategies
        })

        # --- 2. GÉNÉRATION DES STRATÉGIES D'ENCODAGE ---
        encoding_strategies = []
        # On prend les colonnes texte
        cat_cols = df_current.select_dtypes(include=['object', 'category']).columns
        
        for col in cat_cols:
            if col == target_column:
                # La target est toujours Label Encoded
                encoding_strategies.append({"column": col, "method": "label"})
            elif df_current[col].nunique() < 10:
                # Peu de valeurs -> OneHot
                encoding_strategies.append({"column": col, "method": "onehot"})
            else:
                # Beaucoup de valeurs -> Label
                encoding_strategies.append({"column": col, "method": "label"})

        # Exécution de l'encodage
        df_current = PreprocessingService.encode_dataframe(df_current, {
            "strategies": encoding_strategies,
            "target_column": target_column
        })

        # --- 3. OUTLIERS (Seulement sur les numériques, hors target) ---
        # On détecte les colonnes numériques APRÈS encodage
        num_cols = df_current.select_dtypes(include=[np.number]).columns.tolist()
        if target_column in num_cols:
            num_cols.remove(target_column)

        df_current = PreprocessingService.handle_outliers(df_current, {
            "columns": num_cols,
            "method": "iqr",
            "action": "clip"
        })

        # --- 4. NORMALISATION ---
        # On reprend les colonnes numériques (mises à jour)
        num_cols = df_current.select_dtypes(include=[np.number]).columns.tolist()
        if target_column in num_cols:
            num_cols.remove(target_column)

        df_current = PreprocessingService.normalize_dataframe(df_current, {
            "method": "standard",
            "columns": num_cols
        })

        # --- 5. BALANCING (Si target présente et classification) ---
        if target_column and target_column in df_current.columns:
             if df_current[target_column].nunique() < 20: # Sécurité
                 try:
                    df_current = PreprocessingService.balance_data(df_current, {
                        "target_column": target_column,
                        "method": "smote"
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
                    # En auto, on saute si pas de target, sinon erreur
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