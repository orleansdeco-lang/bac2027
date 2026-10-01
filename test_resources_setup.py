import os
import asyncio
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://erbvmpnxufgeinqnshzu.supabase.co")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnZtcG54dWZnZWlucW5zaHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjkzMzEsImV4cCI6MjEwNDcwNTMzMX0.STGUNuth4J2-TXqvH_BNwRJEsxH5RjSmhjUPttLN998")

async def test_environment():
    print("=== 1. Testing BeautifulSoup ===")
    soup = BeautifulSoup("<html><body><h1>BAC BEM Scraping Ready</h1></body></html>", "html.parser")
    print(f"BS4 parsed heading: {soup.h1.text}")

    print("\n=== 2. Testing Playwright Chromium ===")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_content("<html><body><p>Playwright Chromium works!</p></body></html>")
        content = await page.text_content("p")
        print(f"Playwright rendered: {content}")
        await browser.close()

    print("\n=== 3. Testing Supabase Connection ===")
    client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    try:
        res = client.table("resources").select("*").limit(1).execute()
        print("[SUCCESS] Table 'resources' is READY and accessible!")
        print("Query sample:", res.data)
    except Exception as e:
        print("[INFO] Table 'resources' not yet created in PostgreSQL schema cache:")
        print(f"   {e}")

if __name__ == "__main__":
    asyncio.run(test_environment())
