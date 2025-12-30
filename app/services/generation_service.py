import pandas as pd
import numpy as np
from sklearn.datasets import make_classification, make_regression

# --- OPTION 1 : GÉNÉRATION SIMPLE (Scikit-Learn) ---
def generate_simple_data(n_rows=100, n_cols=5, task_type="classification") -> pd.DataFrame:
    """
    Génère rapidement un dataset mathématique parfait pour le ML.
    """
    if task_type == "classification":
        # Génère des classes (ex: 0 et 1)
        X, y = make_classification(
            n_samples=n_rows, 
            n_features=n_cols, 
            n_informative=n_cols-1, 
            n_redundant=0, 
            random_state=42
        )
        target_name = "target_class"
    
    elif task_type == "regression":
        # Génère une valeur continue
        X, y = make_regression(
            n_samples=n_rows, 
            n_features=n_cols, 
            noise=0.1, 
            random_state=42
        )
        target_name = "target_value"
    
    else:
        raise ValueError("Type inconnu. Choisir 'classification' ou 'regression'.")

    # Création du DataFrame
    col_names = [f"feature_{i+1}" for i in range(n_cols)]
    df = pd.DataFrame(X, columns=col_names)
    df[target_name] = y
    
    return df

# --- OPTION 2 : GÉNÉRATION CUSTOM (Règles Utilisateur) ---
import pandas as pd
import numpy as np
import traceback

def generate_custom_data(n_rows: int, columns_def: list) -> pd.DataFrame:
    print(f"--- DÉBUT GÉNÉRATION CUSTOM ({n_rows} lignes) ---")
    data = {}

    try:
        for col in columns_def:
            # col est un objet Pydantic (ColumnDefinition)
            col_name = col.name
            col_type = col.type
            rules = col.rules
            
            col_values = []
            total_filled = 0
            
            print(f"Traitement colonne : {col_name} ({col_type})")
            
            for rule in rules:
                # Calcul du nombre d'éléments pour cette règle
                count = int(n_rows * (rule.percentage / 100))
                
                if count > 0:
                    min_v = rule.min_val
                    max_v = rule.max_val
                    
                    if col_type == "int":
                        vals = np.random.randint(int(min_v), int(max_v) + 1, count)
                    else:
                        vals = np.random.uniform(min_v, max_v, count)
                    
                    col_values.extend(vals.tolist())
                    total_filled += count
            
            # Remplissage du reste avec None
            remaining = n_rows - total_filled
            if remaining > 0:
                col_values.extend([None] * remaining)
            
            # On coupe si dépassement (arrondi) et on mélange
            col_values = col_values[:n_rows]
            np.random.shuffle(col_values)
            
            data[col_name] = col_values

        df = pd.DataFrame(data)
        print("--- GÉNÉRATION RÉUSSIE ---")
        return df

    except Exception as e:
        traceback.print_exc()
        raise RuntimeError(f"Erreur technique génération: {e}")

