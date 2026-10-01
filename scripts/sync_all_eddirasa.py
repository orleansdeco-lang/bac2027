#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Eddirasa Scraper & Supabase Synchronizer (Full Run)
Comprehensive, multi-subject scraper for BAC 3AS educational resources.
Extracts: title, subject, stream, category, term, source_url, pdf_links.
Features:
 - Full subject iteration
 - High-performance async concurrent fetching (Semaphore)
 - Incremental batch upserts to Supabase (50 items/batch)
 - Resumable backup to data/eddirasa_full_backup.json
 - Continuous progress logging to data/sync_progress.log
 - Final statistical breakdown by Subject, Category, and Stream
"""

import os
import re
import sys
import json
import time
import asyncio
import logging
import argparse
import urllib.parse
from datetime import datetime
from typing import List, Dict, Any, Optional, Set

import httpx
from bs4 import BeautifulSoup
from supabase import create_client, Client

# Base Paths and URLs
BASE_URL = "https://eddirasa.com"
MAIN_3AS_URL = "https://eddirasa.com/ens-sec/3as/"
DATA_DIR = "data"
BACKUP_FILE = os.path.join(DATA_DIR, "eddirasa_full_backup.json")
LOG_FILE = os.path.join(DATA_DIR, "sync_progress.log")

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

# Setup Logging to both file and console
os.makedirs(DATA_DIR, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8", mode="a"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger("EddirasaSync")

# Subject mapping & filter (excluding non-academic calculators or videos)
EXCLUDED_SUBJECT_SLUGS = ["average", "sport", "videos", "calculator"]

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
    elif any(k in combined for k in ["لغات أجنبية", "لغات اجنبية", "ألماني", "إسباني", "إيطالي", "deutsch", "espanol", "italian"]):
        return "لغات أجنبية"
    elif any(k in combined for k in ["علوم تجريبية", "علمي", "شعب علمية", "science", "sciences"]):
        return "شعب علمية"
    elif "رياضيات" in combined and ("شعبة" in combined or "maths-term" in url):
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

    # 2. Search direct anchor tags (PDF files or Google Drive or Mediafire)
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

class EddirasaCrawler:
    def __init__(self, concurrency: int = 12, timeout: float = 20.0):
        self.concurrency = concurrency
        self.semaphore = asyncio.Semaphore(concurrency)
        self.timeout = timeout
        self.supabase = get_supabase_client()
        self.seen_urls: Set[str] = set()
        self.all_records: List[Dict[str, Any]] = []
        self.has_stream_column: Optional[bool] = None
        self.load_existing_backup()

    def load_existing_backup(self):
        if os.path.exists(BACKUP_FILE):
            try:
                with open(BACKUP_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        self.all_records = data
                        for item in data:
                            if "source_url" in item:
                                self.seen_urls.add(item["source_url"])
                logger.info(f"Loaded {len(self.all_records)} existing records from local backup: {BACKUP_FILE}")
            except Exception as e:
                logger.warning(f"Could not load backup file: {e}")

    def save_backup(self):
        try:
            with open(BACKUP_FILE, "w", encoding="utf-8") as f:
                json.dump(self.all_records, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Error saving backup file: {e}")

    def upsert_batch_to_supabase(self, batch: List[Dict[str, Any]]) -> bool:
        if not batch:
            return True

        # Check if stream column is supported or test it
        if self.has_stream_column is not False:
            try:
                self.supabase.table("resources").upsert(batch, on_conflict="source_url").execute()
                self.has_stream_column = True
                return True
            except Exception as e:
                err_str = str(e)
                if "stream" in err_str or "PGRST204" in err_str:
                    self.has_stream_column = False
                else:
                    logger.error(f"Supabase upsert error: {e}")
                    return False

        # Fallback without stream column
        db_records = [
            {
                "subject": r["subject"],
                "category": r["category"],
                "term": r["term"],
                "title": r["title"],
                "source_url": r["source_url"],
                "pdf_links": r["pdf_links"],
            }
            for r in batch
        ]
        try:
            self.supabase.table("resources").upsert(db_records, on_conflict="source_url").execute()
            return True
        except Exception as e:
            logger.error(f"Supabase fallback upsert error: {e}")
            return False

    async def fetch_html(self, client: httpx.AsyncClient, url: str) -> Optional[str]:
        async with self.semaphore:
            for attempt in range(3):
                try:
                    resp = await client.get(url, headers=HEADERS, timeout=self.timeout, follow_redirects=True)
                    if resp.status_code == 200:
                        return resp.text
                    elif resp.status_code == 429:
                        await asyncio.sleep(2.0 * (attempt + 1))
                    else:
                        break
                except Exception:
                    await asyncio.sleep(1.0 * (attempt + 1))
            return None

    async def scrape_topic(self, client: httpx.AsyncClient, topic_url: str, subject_name: str, section_url: str) -> Optional[Dict[str, Any]]:
        html = await self.fetch_html(client, topic_url)
        if not html:
            return None

        soup = BeautifulSoup(html, "html.parser")
        h1 = soup.find("h1")
        title = clean_text(h1.text) if h1 else ""
        if not title and soup.title:
            title = clean_text(soup.title.string)
        if not title:
            title = "موضوع تعليمي"

        category = infer_category(title, section_url)
        term = infer_term(title, section_url)
        stream = infer_stream(title, section_url)
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

    async def get_subjects(self, client: httpx.AsyncClient) -> List[Dict[str, str]]:
        html = await self.fetch_html(client, MAIN_3AS_URL)
        if not html:
            return []

        soup = BeautifulSoup(html, "html.parser")
        subjects = []
        seen = set()

        for a in soup.find_all("a"):
            href = a.get("href") or ""
            full_url = urllib.parse.urljoin(BASE_URL, href)
            
            if "/ens-sec/3as/" in full_url and full_url != MAIN_3AS_URL:
                # Check for excluded slugs
                if any(ex in full_url for ex in EXCLUDED_SUBJECT_SLUGS):
                    continue
                    
                title = clean_text(a.text)
                title = re.sub(r'[\d,]+', '', title).strip()
                
                if title and len(title) > 2 and full_url not in seen:
                    seen.add(full_url)
                    subjects.append({"name": title, "url": full_url})

        return subjects

    async def get_sections_for_subject(self, client: httpx.AsyncClient, subject_url: str) -> List[Dict[str, str]]:
        html = await self.fetch_html(client, subject_url)
        if not html:
            return []

        soup = BeautifulSoup(html, "html.parser")
        sections = []
        seen = set()

        for a in soup.find_all("a"):
            href = a.get("href") or ""
            full_url = urllib.parse.urljoin(BASE_URL, href)
            
            # Avoid video-only sections or parent links
            if subject_url in full_url and full_url != subject_url and "video" not in full_url:
                title = clean_text(a.text)
                title = re.sub(r'[\d,]+', '', title).strip()
                if full_url not in seen:
                    seen.add(full_url)
                    sections.append({"name": title or "قسم", "url": full_url})

        return sections

    async def get_topics_for_section(self, client: httpx.AsyncClient, section_url: str) -> List[str]:
        html = await self.fetch_html(client, section_url)
        if not html:
            return []

        soup = BeautifulSoup(html, "html.parser")
        topics = []
        seen = set()

        for a in soup.find_all("a"):
            href = a.get("href") or ""
            text = a.text.strip()
            
            # Identify educational articles
            is_topic = (
                any(k in text for k in ["اختبار", "فرض", "رقم", "ملخص", "سلسلة", "تمرين", "حلول", "بكالوريا", "موضوع"])
                or re.search(r'-\d+/?$', href)
            )
            
            if is_topic and len(text) > 6:
                full_url = urllib.parse.urljoin(BASE_URL, href)
                if full_url not in seen and full_url != section_url and "/ens-sec/" not in href:
                    seen.add(full_url)
                    topics.append(full_url)

        return topics

    async def run(self, max_topics_per_subject: Optional[int] = None):
        start_time = time.time()
        logger.info("=" * 70)
        logger.info("🚀 STARTING COMPREHENSIVE EDDIRASA 3AS SCRAPING RUN")
        logger.info(f"Target: {MAIN_3AS_URL} | Concurrency: {self.concurrency}")
        logger.info("=" * 70)

        limits = httpx.Limits(max_keepalive_connections=20, max_connections=30)
        async with httpx.AsyncClient(headers=HEADERS, limits=limits, timeout=self.timeout) as client:
            subjects = await self.get_subjects(client)
            logger.info(f"📚 Discovered {len(subjects)} Academic Subjects for 3AS.")

            total_new_topics = 0

            for s_idx, subj in enumerate(subjects, 1):
                logger.info("-" * 70)
                logger.info(f"[{s_idx}/{len(subjects)}] Processing Subject: {subj['name']} ({subj['url']})")
                sections = await self.get_sections_for_subject(client, subj["url"])
                logger.info(f"   -> Found {len(sections)} sections in {subj['name']}.")

                subj_topics_count = 0

                for sec_idx, sec in enumerate(sections, 1):
                    sec_topics = await self.get_topics_for_section(client, sec["url"])
                    
                    # Filter out already scraped topics
                    new_topics = [t for t in sec_topics if t not in self.seen_urls]
                    if not new_topics:
                        continue

                    logger.info(f"   [{sec_idx}/{len(sections)}] Section '{sec['name']}': {len(new_topics)} new topics to fetch.")

                    # Scrape topics in concurrent chunks
                    chunk_size = 15
                    for c_start in range(0, len(new_topics), chunk_size):
                        chunk = new_topics[c_start:c_start + chunk_size]
                        tasks = [
                            self.scrape_topic(client, t_url, subj["name"], sec["url"])
                            for t_url in chunk
                        ]
                        results = await asyncio.gather(*tasks)

                        # Filter valid results
                        valid_records = [r for r in results if r and r.get("title")]

                        if valid_records:
                            # Upsert to Supabase
                            self.upsert_batch_to_supabase(valid_records)
                            
                            # Update local memory and backup
                            for rec in valid_records:
                                self.seen_urls.add(rec["source_url"])
                                self.all_records.append(rec)
                                
                            total_new_topics += len(valid_records)
                            subj_topics_count += len(valid_records)
                            
                            # Incremental local disk flush
                            self.save_backup()
                            logger.info(f"      ✔ Saved batch ({len(valid_records)} topics) | Total DB: {len(self.all_records)}")

                        if max_topics_per_subject and subj_topics_count >= max_topics_per_subject:
                            logger.info(f"   Reached limit of {max_topics_per_subject} for {subj['name']}.")
                            break

                    if max_topics_per_subject and subj_topics_count >= max_topics_per_subject:
                        break

                logger.info(f"✔ Completed Subject: {subj['name']} | Added: {subj_topics_count} records.")

        elapsed = round(time.time() - start_time, 2)
        logger.info("=" * 70)
        logger.info(f"🎉 SCRAPING RUN FINISHED IN {elapsed}s | Total New: {total_new_topics} | Grand Total: {len(self.all_records)}")
        logger.info("=" * 70)
        self.generate_report()

    def generate_report(self):
        report = {}
        by_subject = {}
        by_category = {}
        by_stream = {}
        total_pdfs = 0

        for r in self.all_records:
            s = r.get("subject", "غير محدد")
            c = r.get("category", "غير محدد")
            st = r.get("stream", "غير محدد")
            pdfs = r.get("pdf_links", [])

            by_subject[s] = by_subject.get(s, 0) + 1
            by_category[c] = by_category.get(c, 0) + 1
            by_stream[st] = by_stream.get(st, 0) + 1
            total_pdfs += len(pdfs)

        logger.info("\n📊 FINAL SYSTEM REPORT (Database & Backup Statistics):")
        logger.info(f"Total Resources: {len(self.all_records)} topics")
        logger.info(f"Total Extracted PDFs: {total_pdfs} files\n")

        logger.info("--- Breakdown by Subject (المواد) ---")
        for s, count in sorted(by_subject.items(), key=lambda x: x[1], reverse=True):
            logger.info(f"  • {s}: {count} موضوع")

        logger.info("\n--- Breakdown by Category (الفئات) ---")
        for c, count in sorted(by_category.items(), key=lambda x: x[1], reverse=True):
            logger.info(f"  • {c}: {count} موضوع")

        logger.info("\n--- Breakdown by Stream (الشعب) ---")
        for st, count in sorted(by_stream.items(), key=lambda x: x[1], reverse=True):
            logger.info(f"  • {st}: {count} موضوع")
        logger.info("=" * 70)

def main():
    parser = argparse.ArgumentParser(description="Eddirasa Comprehensive Scraper")
    parser.add_argument("--concurrency", type=int, default=12, help="Concurrent async workers")
    parser.add_argument("--limit-per-subject", type=int, default=None, help="Optional limit per subject")
    args = parser.parse_args()

    crawler = EddirasaCrawler(concurrency=args.concurrency)
    asyncio.run(crawler.run(max_topics_per_subject=args.limit_per_subject))

if __name__ == "__main__":
    main()
