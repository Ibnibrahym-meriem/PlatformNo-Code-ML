# run.py
import uvicorn
import sys
import asyncio

if __name__ == "__main__":
    # FORCE WINDOWS À UTILISER LE BON MOTEUR POUR PLAYWRIGHT
    if sys.platform.startswith("win"):
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    
    print("Démarrage du serveur avec Playwright pour Windows...")
    
    # On lance Uvicorn depuis le code python
    uvicorn.run(
        "app.main:app", 
        host="127.0.0.1", 
        port=8005, 
        reload=False,
        loop="asyncio"
    )