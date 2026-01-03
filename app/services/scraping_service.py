import pandas as pd
import io
from playwright.async_api import async_playwright

async def scrape_all_tables(url: str) -> list[pd.DataFrame]:
    """
    Récupère TOUTES les tables (statiques + dynamiques JS) d'une URL via Playwright.
    """
    async with async_playwright() as p:
        # 1. Lancer le navigateur (Headless = invisible)
        browser = await p.chromium.launch(headless=True)
        
        # 2. Créer une page et naviguer
        page = await browser.new_page()
        try:
            print(f" Navigation vers {url}...")
            await page.goto(url)
            
            # On attend que le réseau se calme (que le JS ait fini)
            try:
                await page.wait_for_load_state("networkidle", timeout=10000)
            except:
                print(" Timeout networkidle, on tente de lire quand même.")

            # 3. Récupérer le HTML final (celui généré par le JavaScript)
            html_content = await page.content()
            
        except Exception as e:
            await browser.close()
            raise RuntimeError(f"Erreur Playwright: {str(e)}")
        
        await browser.close()

    # 4. Parsing avec Pandas ( sur le HTML complet)
    try:
        dfs = pd.read_html(io.StringIO(html_content), thousands=',', decimal='.')
    except ValueError:
        return [] 

    # 5. Nettoyage de base 
    clean_dfs = []
    for df in dfs:
        # Convertir tout en string pour éviter les bugs de JSON
        df.columns = df.columns.astype(str)
        # Enlever les doublons
        df = df.drop_duplicates()
        clean_dfs.append(df)
        
    return clean_dfs