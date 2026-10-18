#!/usr/bin/env python3
"""Snapshot Swiss salary taxes from the federal tax administration (ESTV).

Calls the public ESTV tax calculator (swisstaxcalculator.estv.admin.ch) for a
single employee with no children and no church membership, living in each of
the 26 cantonal capitals, across a grid of gross salaries and the four BVG
(occupational pension) age bands. ESTV itself works out the employee social
contributions (AHV/IV/EO, ALV, NBU, BVG), the deductions and the federal,
cantonal, communal and personal taxes; this script only records them.

The site interpolates between grid points at runtime. Re-run once a year when
ESTV publishes the new tax year:

    python3 scripts/fetch-swiss-tax-data.py 2027

Writes data/swissTax<year>.json. Throttled to be gentle on a public service, so
a full run takes about 30 minutes; progress is saved after every canton to
data/.swissTax<year>.partial.json, and an interrupted run resumes from there.
"""
import json
import os
import sys
import time
import urllib.request

BASE = 'https://swisstaxcalculator.estv.admin.ch/delegate/ost-integration/v1/lg-proxy/operation/c3b67379_ESTV/'

# Canton code -> (capital, search term). The first search hit in the right
# canton whose city matches is used.
CAPITALS = {
    'ZH': ('Zürich', 'Zürich'), 'BE': ('Bern', 'Bern'), 'LU': ('Luzern', 'Luzern'), 'UR': ('Altdorf', 'Altdorf'),
    'SZ': ('Schwyz', 'Schwyz'), 'OW': ('Sarnen', 'Sarnen'), 'NW': ('Stans', 'Stans'), 'GL': ('Glarus', 'Glarus'),
    'ZG': ('Zug', 'Zug'), 'FR': ('Fribourg', 'Fribourg'), 'SO': ('Solothurn', 'Solothurn'), 'BS': ('Basel', 'Basel'),
    'BL': ('Liestal', 'Liestal'), 'SH': ('Schaffhausen', 'Schaffhausen'), 'AR': ('Herisau', 'Herisau'),
    'AI': ('Appenzell', 'Appenzell'), 'SG': ('St. Gallen', 'St. Gallen'), 'GR': ('Chur', 'Chur'), 'AG': ('Aarau', 'Aarau'),
    'TG': ('Frauenfeld', 'Frauenfeld'), 'TI': ('Bellinzona', 'Bellinzona'), 'VD': ('Lausanne', 'Lausanne'),
    'VS': ('Sion', 'Sion'), 'NE': ('Neuchâtel', 'Neuchâtel'), 'GE': ('Genève', 'Genève'), 'JU': ('Delémont', 'Delémont'),
}

INCOMES = [30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 110000, 120000,
           140000, 160000, 180000, 200000, 250000, 300000, 400000, 500000]
# One age inside each BVG savings-credit band (7%, 10%, 15%, 18% of coordinated salary).
AGE_BANDS = {'25-34': 30, '35-44': 40, '45-54': 50, '55-65': 60}


def post(operation, body):
    req = urllib.request.Request(BASE + operation, data=json.dumps(body).encode(),
                                 headers={'Content-Type': 'application/json'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.load(resp)['response']
        except Exception:  # retry transient failures with backoff
            time.sleep(2 ** attempt)
    raise RuntimeError(f'{operation} failed: {body}')


def find_location(canton, city, term, year):
    hits = post('API_searchLocation', {'Search': term, 'Language': 1, 'TaxYear': year})
    for hit in hits:
        if hit['Canton'] == canton and hit['City'] == city:
            return hit
    for hit in hits:
        if hit['Canton'] == canton:
            return hit
    raise RuntimeError(f'no location for {canton} {term}')


def main():
    year = int(sys.argv[1]) if len(sys.argv) > 1 else 2026
    partial = f'data/.swissTax{year}.partial.json'
    out = {
        'source': 'ESTV Swiss tax calculator (swisstaxcalculator.estv.admin.ch)',
        'taxYear': year,
        'fetchedOn': time.strftime('%Y-%m-%d'),
        'profile': 'Single, no children, no church tax, no wealth, employed; municipality = cantonal capital',
        'incomes': INCOMES,
        'ageBands': list(AGE_BANDS),
        # social[band][i] = [AHV/IV/EO, ALV, NBU, BVG] for INCOMES[i]
        'social': {},
        # cantons[code] = {city, taxes: {band: [[federal, cantonal, communal, personal], ...]}}
        'cantons': {},
    }
    if os.path.exists(partial):
        with open(partial) as f:
            saved = json.load(f)
        if saved.get('taxYear') == year and saved.get('incomes') == INCOMES:
            out['social'], out['cantons'] = saved['social'], saved['cantons']
            print(f'resuming: {len(out["cantons"])} cantons already fetched', file=sys.stderr, flush=True)

    for code, (city, term) in CAPITALS.items():
        if code in out['cantons']:
            continue
        loc = find_location(code, city, term, year)
        entry = {'city': loc['City'], 'taxes': {}}
        for band, age in AGE_BANDS.items():
            rows = []
            social_rows = []
            for income in INCOMES:
                r = post('API_calculateDetailedTaxes', {
                    'SimKey': None, 'TaxYear': year, 'TaxLocationID': loc['TaxLocationID'],
                    'Relationship': 1, 'Confession1': 5, 'Children': [], 'Age1': age,
                    'RevenueType1': 1, 'Revenue1': income, 'Fortune': 0,
                    'Confession2': 0, 'RevenueType2': 0, 'Revenue2': 0, 'Age2': 0,
                })
                p = r['IncomeP1']
                assert p['GrossIncome'] == income, (code, band, income, p)
                rows.append([r['IncomeTaxFed'], r['IncomeTaxCanton'], r['IncomeTaxCity'], r['PersonalTax']])
                social_rows.append([p['AIOContribution'], p['ALVContribution'], p['NBUContribution'], p['BVGContribution']])
                time.sleep(0.2)
            entry['taxes'][band] = rows
            prior = out['social'].get(band)
            if prior is None:
                out['social'][band] = social_rows
            elif prior != social_rows:
                # Social contributions are federal and should not vary by canton.
                print(f'warning: social contributions differ in {code} {band}', file=sys.stderr)
        out['cantons'][code] = entry
        with open(partial, 'w') as f:
            json.dump(out, f, ensure_ascii=False)
        print(f'{code} {entry["city"]} done ({len(out["cantons"])}/26)', file=sys.stderr, flush=True)

    path = f'data/swissTax{year}.json'
    with open(path, 'w') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    os.remove(partial)
    print(f'wrote {path}', file=sys.stderr, flush=True)


if __name__ == '__main__':
    main()
