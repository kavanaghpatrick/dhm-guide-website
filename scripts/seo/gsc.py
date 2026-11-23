#!/usr/bin/env python3
# scripts/seo/gsc.py — Google Search Console API puller for dhmguide.com.
# Ported 2026-11-23 from arcompare-fable/scripts/seo/gsc.py (only SITE changed).
#
# Auth: Application Default Credentials with the webmasters.readonly scope
# (one-time: gcloud auth application-default login --scopes=...webmasters.readonly,...cloud-platform)
# plus a quota project (default swiftmail-466222, override with GSC_QUOTA_PROJECT).
# The API serves up to 25,000 rows/request with pagination — no 1,000-row UI-export cap.
# Inspection quota is 2,000 URLs/day. Data lags ~2-3 days behind real time.
#
# Usage:
#   python3 scripts/seo/gsc.py sites
#   python3 scripts/seo/gsc.py query --start 2026-10-01 --end 2026-10-26 \
#       --dimensions page,query [--contains /guides/] [--limit 5000] [--csv out.csv]
#   python3 scripts/seo/gsc.py daily --days 28          # date-dimension trend
#   python3 scripts/seo/gsc.py inspect URL [URL ...]    # index status per URL
#   python3 scripts/seo/gsc.py inspect --file urls.txt [--csv out.csv]
#   Prospector input: python3 scripts/seo/gsc.py query --start ... --end ... \
#       --dimensions query --csv docs/seo/gsc-queries-latest.csv
import argparse, csv, json, os, subprocess, sys, time, urllib.request

SITE = "sc-domain:dhmguide.com"
API = "https://searchconsole.googleapis.com"
QUOTA_PROJECT = os.environ.get("GSC_QUOTA_PROJECT", "swiftmail-466222")


def token():
    r = subprocess.run(["gcloud", "auth", "application-default", "print-access-token"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("gcloud token failed — re-run the one-time ADC login (see header). " + r.stderr.strip())
    return r.stdout.strip()


def call(path, body=None, tok=None):
    req = urllib.request.Request(
        API + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {tok}",
                 "x-goog-user-project": QUOTA_PROJECT,
                 "Content-Type": "application/json"},
        method="POST" if body is not None else "GET")
    return json.load(urllib.request.urlopen(req))


def cmd_sites(_):
    print(json.dumps(call("/webmasters/v3/sites", tok=token()), indent=2))


def cmd_query(a):
    tok, rows, start_row = token(), [], 0
    body = {"startDate": a.start, "endDate": a.end,
            "dimensions": a.dimensions.split(","), "rowLimit": 25000}
    if a.contains:
        body["dimensionFilterGroups"] = [{"filters": [
            {"dimension": "page", "operator": "contains", "expression": a.contains}]}]
    while True:
        body["startRow"] = start_row
        batch = call(f"/webmasters/v3/sites/{urllib.parse.quote(SITE, safe='')}/searchAnalytics/query",
                     body, tok).get("rows", [])
        rows += batch
        if len(batch) < 25000 or len(rows) >= a.limit:
            break
        start_row += len(batch)
    rows = rows[: a.limit]
    out = [dict(zip(a.dimensions.split(","), r["keys"]),
                clicks=r["clicks"], impressions=r["impressions"],
                ctr=round(r["ctr"], 4), position=round(r["position"], 1)) for r in rows]
    emit(out, a.csv)


def cmd_daily(a):
    import datetime
    end = datetime.date.today() - datetime.timedelta(days=3)  # GSC lag
    start = end - datetime.timedelta(days=a.days - 1)
    a.start, a.end, a.dimensions, a.contains, a.limit = str(start), str(end), "date", None, 25000
    cmd_query(a)


def cmd_inspect(a):
    tok = token()
    urls = list(a.urls)
    if a.file:
        urls += [l.strip() for l in open(a.file) if l.strip().startswith("http")]
    out = []
    for u in urls:
        try:
            r = call("/v1/urlInspection/index:inspect",
                     {"inspectionUrl": u, "siteUrl": SITE}, tok)["inspectionResult"]["indexStatusResult"]
            out.append({"url": u, "coverageState": r.get("coverageState"),
                        "verdict": r.get("verdict"), "lastCrawl": r.get("lastCrawlTime", "never"),
                        "googleCanonical": r.get("googleCanonical", "")})
        except Exception as e:
            out.append({"url": u, "coverageState": f"ERROR: {e}", "verdict": "", "lastCrawl": "", "googleCanonical": ""})
        time.sleep(0.4)
    emit(out, a.csv)


def emit(rows, csv_path):
    if not rows:
        print("no rows", file=sys.stderr)
        return
    if csv_path:
        with open(csv_path, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=rows[0].keys())
            w.writeheader(); w.writerows(rows)
        print(f"wrote {len(rows)} rows -> {csv_path}", file=sys.stderr)
    else:
        json.dump(rows, sys.stdout, indent=1)
        print()


p = argparse.ArgumentParser(description=__doc__)
sub = p.add_subparsers(dest="cmd", required=True)
sub.add_parser("sites").set_defaults(fn=cmd_sites)
q = sub.add_parser("query"); q.set_defaults(fn=cmd_query)
q.add_argument("--start", required=True); q.add_argument("--end", required=True)
q.add_argument("--dimensions", default="page"); q.add_argument("--contains")
q.add_argument("--limit", type=int, default=25000); q.add_argument("--csv")
d = sub.add_parser("daily"); d.set_defaults(fn=cmd_daily)
d.add_argument("--days", type=int, default=28); d.add_argument("--csv")
i = sub.add_parser("inspect"); i.set_defaults(fn=cmd_inspect)
i.add_argument("urls", nargs="*"); i.add_argument("--file"); i.add_argument("--csv")
a = p.parse_args()
a.fn(a)
