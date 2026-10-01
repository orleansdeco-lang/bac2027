"""
Self-Host Exam PDFs into Supabase Storage
Downloads raw PDF files from eddirasa and uploads them into our Supabase Storage bucket 'exam_files'.
Updates public.resources table with the new self-hosted permanent URLs.
"""

import os
import sys
import time
import argparse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from supabase import create_client

def load_env():
    env = {}
    for p in ['.env.local', '.env']:
        if os.path.exists(p):
            with open(p, encoding='utf-8') as f:
                for line in f:
                    if '=' in line and not line.strip().startswith('#'):
                        k, v = line.strip().split('=', 1)
                        env[k.strip()] = v.strip().strip('"\'')
    return env

def sanitize_name(name: str) -> str:
    return "".join(c if c.isalnum() or c in "._-" else "_" for c in (name or "file"))

def self_host_single_resource(sb, bucket_name: str, item: dict):
    res_id = item['id']
    title = item.get('title') or 'exam'
    subject = item.get('subject') or 'general'
    pdf_links = item.get('pdf_links') or []

    if not pdf_links:
        return {'id': res_id, 'status': 'skipped_no_pdf'}

    raw_url = pdf_links[0]
    if f'/storage/v1/object/public/{bucket_name}/' in raw_url:
        return {'id': res_id, 'status': 'already_self_hosted', 'url': raw_url}

    try:
        # Download PDF with headers
        req = urllib.request.Request(
            raw_url,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': 'https://eddirasa.com/'
            }
        )
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = resp.read()

        # Target storage path in Supabase
        safe_subj = sanitize_name(subject)
        safe_title = sanitize_name(title[:40])
        storage_path = f"exams/{safe_subj}/{res_id}_{safe_title}.pdf"

        # Upload to Supabase Storage
        upload_res = sb.storage.from_(bucket_name).upload(
            storage_path,
            data,
            {'content-type': 'application/pdf', 'upsert': 'true'}
        )

        pub_url = sb.storage.from_(bucket_name).get_public_url(storage_path)

        # Update Supabase resources table
        new_links = [pub_url] + [l for l in pdf_links if l != raw_url]
        sb.table('resources').update({'pdf_links': new_links}).eq('id', res_id).execute()

        return {'id': res_id, 'status': 'uploaded', 'url': pub_url}
    except Exception as e:
        return {'id': res_id, 'status': 'error', 'error': str(e)}

def main():
    parser = argparse.ArgumentParser(description="Self-host PDFs to Supabase Storage")
    parser.add_argument('--limit', type=int, default=20, help="Number of records to process")
    parser.add_argument('--subject', type=str, default=None, help="Filter by subject")
    parser.add_argument('--bucket', type=str, default='exam_files', help="Target Supabase storage bucket")
    parser.add_argument('--concurrency', type=int, default=5, help="Number of concurrent download threads")
    args = parser.parse_args()

    env = load_env()
    url = env.get('NEXT_PUBLIC_SUPABASE_URL')
    key = env.get('SUPABASE_SERVICE_ROLE_KEY') or env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    sb = create_client(url, key)

    query = sb.table('resources').select('id, title, subject, pdf_links').neq('pdf_links', '{}')
    if args.subject:
        query = query.eq('subject', args.subject)

    res = query.limit(args.limit).execute()
    items = res.data or []
    print(f"[*] Found {len(items)} resources to check for self-hosting into '{args.bucket}'...")

    succeeded = 0
    skipped = 0
    errors = 0

    with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
        futures = {executor.submit(self_host_single_resource, sb, args.bucket, item): item for item in items}
        for future in as_completed(futures):
            item = futures[future]
            try:
                result = future.result()
                status = result['status']
                if status == 'uploaded':
                    succeeded += 1
                    print(f" ✔ [Self-Hosted] {item['title'][:45]} -> {result['url'][:65]}...")
                elif status == 'already_self_hosted':
                    skipped += 1
                    print(f" ℹ [Already Hosted] {item['title'][:45]}")
                elif status == 'skipped_no_pdf':
                    skipped += 1
                else:
                    errors += 1
                    print(f" ✖ [Failed] {item['title'][:40]}: {result.get('error')}")
            except Exception as e:
                errors += 1
                print(f" ✖ [Exception] {item['title'][:40]}: {e}")

    print("\n" + "=" * 50)
    print(f"Done! Succeeded: {succeeded} | Skipped: {skipped} | Errors: {errors}")
    print("=" * 50)

if __name__ == '__main__':
    main()
