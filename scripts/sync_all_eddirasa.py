#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Eddirasa Scraper & Supabase Synchronizer (BAC 3AS)
Extracts educational topics, categorizes by subject/stream/category/term,
and extracts verified PDF / Google Drive download links into Supabase.
"""

import os
import re
import json
import time
import argparse
import urllib.parse
from typing import List, Dict, Any, Optional

import httpx
from bs4 import BeautifulSoup
from supabase import create_client, Client

# Base Configuration
BASE_URL = "https://eddirasa.com"
MAIN_3AS_URL = "https://eddirasa.com/ens-sec/3as/"

DEFAULT_SUPABASE_URL = "https://erbvmpnxufgeinqnshzu.supabase.co"
DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnZtcG54dWZnZWlucW5zaHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjkzMzEsImV4cCI6MjEwNDcwNTMzMX0.STGUNuth4J2-TXqvH_BNwRJEsxH5RjSmhjUPttLN998"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "ar,fr;q=0.9,en;q=0.8",
}

def get_supabase_client() -> Client:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", DEFAULT_SUPABASE_URL)
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", DEFAULT_SUPABASE_KEY)
    return create_client(url, key)

def clean_text(text: Optional[str]) -> str:
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def infer_stream(text: str, url: str) -> str:
    combined = (text + " " + url).lower()
    
    if any(k in combined for k in ["تقني رياضي", "هندسة مدنية", "هندسة ميكانيكية", "هندسة كهربائية", "طرائق", "genie"]):
        return "تقني رياضي"
    elif any(k in combined for k in ["تسيير واقتصاد", "تسيير", "محاسب", "اقتصاد", "management", "gestion"]):
        return "تسيير واقتصاد"
    elif any(k in combined for k in ["آداب وفلسفة", "اداب وفلسفة", "أدبي", "فلسفة", "philo", "literary"]):
        return "آداب وفلسفة"
    elif any(k in combined for k in ["لغات أجنبية", "لغات اجنبية", "ألماني", "إسباني", "إيطالي"]):
        return "لغات أجنبية"
    elif any(k in combined for k in ["علوم تجريبية", "علمي", "شعب علمية", "science", "sciences"]):
        return "شعب علمية"
    elif "رياضيات" in combined and ("شعبة" in combined or "math" in url):
        return "رياضيات"
    
    return "عام / جميع الشعب"

def infer_category(text: str, url: str) -> str:
    combined = (text + " " + url).lower()
    
    if "فرض" in combined or "فروض" in combined or "test" in url:
        return "فروض"
    elif "اختبار" in combined or "اختبارات" in combined or "exam" in url:
        return "اختبارات"
    elif "ملخص" in combined or "ملخصات" in combined or "summar" in url:
        return "ملخصات"
    elif "سلسلة" in combined or "سلاسل" in combined or "تمارين" in combined or "تمرين" in combined or "exercise" in url:
        return "تمارين"
    elif "بكالوريا" in combined or "باك" in combined or "bac" in url:
        return "بكالوريا"
    elif "درس" in combined or "دروس" in combined or "lesson" in url:
        return "دروس"
    elif "كتاب" in combined or "كتب" in combined or "book" in url:
        return "كتب ومراجع"
    
    return "اختبارات"

def infer_term(text: str, url: str) -> Optional[int]:
    combined = (text + " " + url).lower()
    
    if any(k in combined for k in ["فصل أول", "فصل 1", "الفصل الأول", "term-1", "الفصل 1"]):
        return 1
    elif any(k in combined for k in ["فصل ثاني", "فصل 2", "الفصل الثاني", "term-2", "الفصل 2"]):
        return 2
    elif any(k in combined for k in ["فصل ثالث", "فصل 3", "الفصل الثالث", "term-3", "الفصل 3"]):
        return 3
    
    return None

def fetch_page(client: httpx.Client, url: str) -> Optional[BeautifulSoup]:
    try:
        resp = client.get(url, headers=HEADERS, timeout=20.0, follow_redirects=True)
        if resp.status_code == 200:
            return BeautifulSoup(resp.text, "html.parser")
        else:
            print(f"[-] HTTP {resp.status_code} for URL: {url}")
            return None
    except Exception as e:
        print(f"[-] Error fetching {url}: {e}")
        return None

def extract_pdf_links(soup: BeautifulSoup, page_url: str) -> List[str]:
    pdfs = []
    
    # 1. Search inside iframes (Viewer plugin file= parameter)
    for iframe in soup.find_all("iframe"):
        src = iframe.get("src") or ""
        match = re.search(r'file=([^&#]+)', src)
        if match:
            raw_file_url = match.group(1)
            decoded_url = urllib.parse.unquote(raw_file_url)
            if decoded_url.startswith("//"):
                decoded_url = "https:" + decoded_url
            elif decoded_url.startswith("/"):
                decoded_url = urllib.parse.urljoin(BASE_URL, decoded_url)
            if decoded_url not in pdfs:
                pdfs.append(decoded_url)

    # 2. Search direct anchor tags (PDF files or Google Drive)
    for a in soup.find_all("a"):
        href = a.get("href") or ""
        if not href or href.startswith("#"):
            continue
            
        full_href = urllib.parse.urljoin(BASE_URL, href)
        lower_href = full_href.lower()
        
        if ".pdf" in lower_href or "drive.google.com" in lower_href or "mediafire.com" in lower_href:
            if full_href not in pdfs:
                pdfs.append(full_href)

    # 3. Search embedded download buttons / scripts
    for btn in soup.find_all(attrs={"data-file": True}):
        f = btn["data-file"]
        if f and f not in pdfs:
            pdfs.append(f)
            
    for btn in soup.find_all(attrs={"data-pdf": True}):
        f = btn["data-pdf"]
        if f and f not in pdfs:
            pdfs.append(f)

    return pdfs

def get_subjects(client: httpx.Client) -> List[Dict[str, str]]:
    soup = fetch_page(client, MAIN_3AS_URL)
    if not soup:
        return []

    subjects = []
    seen_urls = set()
    
    # Extract subjects listed on 3as landing page
    for a in soup.find_all("a"):
        href = a.get("href") or ""
        if not href or href in seen_urls:
            continue
            
        full_url = urllib.parse.urljoin(BASE_URL, href)
        if "/ens-sec/3as/" in full_url and full_url != MAIN_3AS_URL:
            # Clean title
            title = clean_text(a.text)
            # Remove line breaks and numbers
            title = re.sub(r'[\d,]+', '', title).strip()
            
            if title and len(title) > 2 and full_url not in seen_urls:
                seen_urls.add(full_url)
                subjects.append({"name": title, "url": full_url})

    return subjects

def scrape_topic_details(client: httpx.Client, topic_url: str, subject_name: str, fallback_section_url: str) -> Optional[Dict[str, Any]]:
    soup = fetch_page(client, topic_url)
    if not soup:
        return None

    # Title extraction
    h1 = soup.find("h1")
    title = clean_text(h1.text) if h1 else ""
    if not title and soup.title:
        title = clean_text(soup.title.string)
    if not title:
        title = "موضوع تعليمي"

    # Category, Term, Stream inference
    category = infer_category(title, fallback_section_url)
    term = infer_term(title, fallback_section_url)
    stream = infer_stream(title, fallback_section_url)

    # Extract PDFs
    pdf_links = extract_pdf_links(soup, topic_url)

    return {
        "title": title,
        "subject": subject_name,
        "stream": stream,
        "category": category,
        "term": term,
        "source_url": topic_url,
        "pdf_links": pdf_links,
    }

def scrape_sample_maths(limit: int = 5) -> List[Dict[str, Any]]:
    with httpx.Client(headers=HEADERS, timeout=20.0, follow_redirects=True) as http_client:
        print("[1/4] Scanning Eddirasa 3AS subjects...")
        subjects = get_subjects(http_client)
        print(f"      Found {len(subjects)} subjects on 3AS page.")
        
        # Pick Mathematics
        math_subject = next((s for s in subjects if "رياضيات" in s["name"] or "math" in s["url"]), None)
        if not math_subject:
            math_subject = {"name": "الرياضيات", "url": "https://eddirasa.com/ens-sec/3as/maths/"}
            
        print(f"[2/4] Selected Subject: '{math_subject['name']}' ({math_subject['url']})")
        
        # Open Maths page to find sub-sections
        math_soup = fetch_page(http_client, math_subject["url"])
        if not math_soup:
            print("[-] Could not load maths index page.")
            return []

        # Find section URLs like exams-science-term-1
        section_urls = []
        for a in math_soup.find_all("a"):
            href = a.get("href") or ""
            full_url = urllib.parse.urljoin(BASE_URL, href)
            if "/ens-sec/3as/maths/" in full_url and full_url != math_subject["url"]:
                if full_url not in section_urls:
                    section_urls.append(full_url)

        print(f"      Found {len(section_urls)} sub-sections in Mathematics.")
        
        # Prioritize exams section: exams-science-term-1
        target_section = next((s for s in section_urls if "exams-science-term-1" in s), section_urls[0] if section_urls else None)
        if not target_section:
            target_section = "https://eddirasa.com/ens-sec/3as/maths/exams-science-term-1/"
            
        print(f"[3/4] Scanning section for topics: {target_section}")
        sec_soup = fetch_page(http_client, target_section)
        if not sec_soup:
            return []

        # Extract topic article URLs
        topic_urls = []
        for a in sec_soup.find_all("a"):
            href = a.get("href") or ""
            text = a.text.strip()
            # Topic links usually have 'اختبار' or 'فرض' or numeric ID
            if (any(k in text for k in ["اختبار", "فرض", "رقم"]) or re.search(r'-\d+/?$', href)) and len(text) > 8:
                full_url = urllib.parse.urljoin(BASE_URL, href)
                if full_url not in topic_urls and full_url != target_section:
                    topic_urls.append(full_url)
                    if len(topic_urls) >= limit:
                        break

        print(f"      Selected {len(topic_urls)} topic URLs for extraction.")

        # Extract details for each topic
        print("[4/4] Extracting topic details and PDF files...")
        results = []
        for idx, t_url in enumerate(topic_urls, 1):
            print(f"      ({idx}/{len(topic_urls)}) Fetching: {t_url}")
            details = scrape_topic_details(http_client, t_url, math_subject["name"], target_section)
            if details:
                results.append(details)
                print(f"          + Title: {details['title']}")
                print(f"          + Category: {details['category']} | Stream: {details['stream']} | Term: {details['term']}")
                print(f"          + PDFs ({len(details['pdf_links'])}): {details['pdf_links']}")
            time.sleep(0.5)

        return results

def save_and_sync(records: List[Dict[str, Any]]):
    # 1. Save locally to data/eddirasa_sample.json
    os.makedirs("data", exist_ok=True)
    sample_path = os.path.join("data", "eddirasa_sample.json")
    with open(sample_path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"\n[+] Saved {len(records)} records locally to: {sample_path}")

    # 2. Sync / Upsert to Supabase
    print("[+] Connecting to Supabase for database upsert...")
    supabase = get_supabase_client()
    
    # Try inserting with stream first
    try:
        res = supabase.table("resources").upsert(records, on_conflict="source_url").execute()
        print(f"✅ Successfully upserted {len(res.data)} records into 'resources' table (with stream)!")
    except Exception as e:
        err_msg = str(e)
        if "stream" in err_msg or "PGRST204" in err_msg:
            print("[-] 'stream' column not found in Supabase table 'resources'. Upserting schema-compatible fields...")
            # Prepare records without 'stream' for DB compatibility
            db_records = [
                {
                    "subject": r["subject"],
                    "category": r["category"],
                    "term": r["term"],
                    "title": r["title"],
                    "source_url": r["source_url"],
                    "pdf_links": r["pdf_links"]
                }
                for r in records
            ]
            res = supabase.table("resources").upsert(db_records, on_conflict="source_url").execute()
            print(f"✅ Successfully upserted {len(res.data)} records into 'resources' table!")
            print("💡 Tip: To store 'stream' in the database, execute migration 044: ALTER TABLE public.resources ADD COLUMN stream TEXT;")
        else:
            print(f"[-] Supabase upsert error: {e}")

def main():
    parser = argparse.ArgumentParser(description="Eddirasa Scraper & Supabase Synchronizer")
    parser.add_argument("--limit", type=int, default=5, help="Number of sample records to scrape")
    args = parser.parse_args()

    print("=" * 65)
    print("  EDDIRASA 3AS SCRAPER & SUPABASE SYNC (SAMPLE RUN)")
    print("=" * 65)

    records = scrape_sample_maths(limit=args.limit)
    if not records:
        print("[-] No records extracted.")
        return

    save_and_sync(records)

    print("\n" + "=" * 65)
    print("  VERIFIED EXTRACTED SAMPLE:")
    print("=" * 65)
    for idx, r in enumerate(records, 1):
        print(f"{idx}. [{r['category']} - فصل {r['term']}] {r['title']}")
        print(f"   المادة: {r['subject']} | الشعبة: {r['stream']}")
        print(f"   المصدر: {r['source_url']}")
        print(f"   الروابط ({len(r['pdf_links'])}):")
        for p in r['pdf_links']:
            print(f"     -> {p}")
        print("-" * 65)

if __name__ == "__main__":
    main()
