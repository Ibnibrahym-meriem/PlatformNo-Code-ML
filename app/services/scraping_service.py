import pandas as pd
import requests
import io
import traceback

def scrape_url(url: str) -> pd.DataFrame:
    print(f"--- DÉBUT SCRAPING : {url} ---")
    try:
        # 1. Headers pour ne pas être bloqué par les sites
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # 2. Requête HTTP
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        print("--- PAGE TÉLÉCHARGÉE ---")

        # 3. Conversion sécurisée pour Pandas 
        html_content = io.StringIO(response.text)

        # 4. Extraction des tables
        dfs = pd.read_html(html_content)
        
        if not dfs:
            raise ValueError("Aucune balise <table> trouvée sur cette page.")
        
        print(f"--- {len(dfs)} TABLES TROUVÉES ---")
        
        # 5. On prend la première table et on nettoie les colonnes
        df = dfs[0]
        df.columns = df.columns.astype(str)
        
        return df

    except Exception as e:
        traceback.print_exc() 
        raise RuntimeError(f"Erreur technique scraping: {e}")