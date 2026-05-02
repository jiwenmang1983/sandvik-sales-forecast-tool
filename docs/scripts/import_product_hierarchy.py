#!/usr/bin/env python3
"""
Product Hierarchy Import Script for Sandvik Forecast Tool
Reads product data from Excel (产品库.xlsx) and imports into MySQL ProductHierarchy table.

GUID scheme (level-specific to avoid collisions):
  L1: p{PA:05d}-0000-0000-0000-000000000001
  L2: p{PA:05d}-{PA1:04d}-0000-0000-000000000002
  L3: p{PA:05d}-{PA1:02d}{PA2:04d}-0000-000000000003
  L4: p{PA:05d}-{PA1:02d}{PA2:04d}-{PA3:010d}-000000000004

Usage:
  python import_product_hierarchy.py <excel_path>
"""

import sys
import zipfile
import xml.etree.ElementTree as ET
import mysql.connector
from datetime import datetime

EXCEL = sys.argv[1] if len(sys.argv) > 1 else "/home/markji/.hermes/cache/documents/doc_ee843c475760_04_产品库.xlsx"
DB = dict(host='localhost', port=3306, user='root', password='Sandvik2026!', database='sandvik_forecast')

# Sheet name → PA line number mapping
SHEET_PA = {
    'Item Master_AH INSERT 2026V1': 1,
    'Item Master_KLT INSERT': 2,
    'Item Master_AHNO Round 2026 V1': 3,
    'AHNO Round Regrinding': 4,
    'Item Master_Wanke PCD': 5,
    'Coating': 6,
    'Medical': 7,
    'Multiple': 8
}
PA_NAME = {
    1: 'AH INSERT', 2: 'Kelite', 3: 'ROUND', 4: 'Regrinding',
    5: 'PCD', 6: 'Coating', 7: 'Medical', 8: 'Multiple'
}


def gid(pa, pa1=None, pa2=None, pa3=None, lvl=1):
    """Generate level-specific GUID to avoid L1/L2 collisions."""
    if lvl == 1: return f"p{pa:05d}-0000-0000-0000-00000000000{lvl}"
    if lvl == 2: return f"p{pa:05d}-{pa1:04d}-0000-0000-00000000000{lvl}"
    if lvl == 3: return f"p{pa:05d}-{pa1:02d}{pa2:04d}-0000-00000000000{lvl}"
    return f"p{pa:05d}-{pa1:02d}{pa2:04d}-{pa3:010d}-00000000000{lvl}"


def parse_xlsx(path):
    with zipfile.ZipFile(path) as z:
        # Shared strings
        ss = []
        for si in ET.parse(z.open('xl/sharedStrings.xml')).getroot().iter(
                '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
            ss.append(''.join(t.text or '' for t in si.iter(
                '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')))

        # Relationships
        rels = {}
        for r in ET.parse(z.open('xl/_rels/workbook.xml.rels')).getroot():
            rels[r.get('Id')] = r.get('Target')

        # Sheet name → path mapping
        sheets = {}
        for s in ET.parse(z.open('xl/workbook.xml')).getroot().iter(
                '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheet'):
            nm = s.get('name', '').strip()
            rid = s.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            tgt = rels.get(rid, '')
            sheets[nm] = f"xl/{tgt}" if not tgt.startswith('xl/') else tgt

    def gv(cell):
        t = cell.get('t', '')
        v = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
        if v is None or v.text is None:
            return ''
        return ss[int(v.text)] if t == 's' else v.text

    def read(name):
        rows = []
        with zipfile.ZipFile(path) as z:
            for row in ET.parse(z.open(sheets[name])).getroot().iter(
                    '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                rows.append([gv(c) for c in row])
        return rows

    def r(row, i):
        return row[i] if i < len(row) else ''

    entries = []
    for sn, pa_num in SHEET_PA.items():
        if sn not in sheets:
            print(f"  SKIP: {sn} (not found)")
            continue
        rows = read(sn)
        cur_pa1 = cur_pa1n = cur_pa2 = cur_pa2n = None
        in_sub = False
        sort = 0
        for ri, row in enumerate(rows):
            if ri == 0:
                continue
            if len(row) < 2:
                continue
            # SubPA-1 marker
            if any('SubPA-1' in str(c) for c in row):
                in_sub = True
                continue
            pa_v = r(row, 0)
            pa_n = r(row, 1)
            pa1_v = r(row, 2)
            pa1_n = r(row, 3)
            pa2_v = r(row, 4)
            pa2_n = r(row, 5)
            pa3_v = r(row, 6)
            pa3_n = r(row, 7)
            if pa_v.strip().isdigit():
                pa_num = int(pa_v.strip())
            if pa1_v.strip().isdigit():
                cur_pa1 = int(pa1_v.strip())
                cur_pa1n = pa1_n
                cur_pa2 = None
                cur_pa2n = None
                in_sub = False
            elif pa1_v.strip() and not pa1_v.strip().isdigit():
                if in_sub or 'ROUND' in pa1_v.upper():
                    cur_pa1 = 99
                    cur_pa1n = pa1_v
                    cur_pa2 = None
                    cur_pa2n = None
            if pa2_v.strip().isdigit():
                cur_pa2 = int(pa2_v.strip())
                cur_pa2n = pa2_n
            sort += 1
            # L1: PA line
            if pa_v.strip().isdigit():
                entries.append({
                    'id': gid(pa_num, lvl=1), 'parent': None, 'lvl': 1,
                    'code': str(pa_num), 'name': PA_NAME.get(pa_num, pa_n),
                    'pcode': str(pa_num), 'sort': sort
                })
            # L2: PA-1
            if cur_pa1:
                entries.append({
                    'id': gid(pa_num, cur_pa1, lvl=2),
                    'parent': gid(pa_num, lvl=1), 'lvl': 2,
                    'code': str(cur_pa1).zfill(2),
                    'name': cur_pa1n or 'PA-1',
                    'pcode': str(pa_num) + str(cur_pa1).zfill(2),
                    'sort': sort
                })
            # L3: PA-2
            if cur_pa2:
                entries.append({
                    'id': gid(pa_num, cur_pa1, cur_pa2, lvl=3),
                    'parent': gid(pa_num, cur_pa1, lvl=2), 'lvl': 3,
                    'code': str(cur_pa2).zfill(3),
                    'name': cur_pa2n or 'PA-2',
                    'pcode': str(pa_num) + str(cur_pa1).zfill(2) + str(cur_pa2).zfill(3),
                    'sort': sort
                })
            # L4: PA-3
            if pa3_v.strip().isdigit():
                pa3i = int(pa3_v.strip())
                entries.append({
                    'id': gid(pa_num, cur_pa1, cur_pa2, pa3i, lvl=4),
                    'parent': gid(pa_num, cur_pa1, cur_pa2, lvl=3), 'lvl': 4,
                    'code': str(pa3i).zfill(5),
                    'name': pa3_n or 'PA-3',
                    'pcode': str(pa_num) + str(cur_pa1).zfill(2) + str(cur_pa2).zfill(3) + str(pa3i).zfill(5),
                    'sort': sort
                })

    return entries


def main():
    entries = parse_xlsx(EXCEL)
    print(f"Parsed {len(entries)} entries: ", end='')
    for l in [1, 2, 3, 4]:
        print(f"L{l}={sum(1 for e in entries if e['lvl']==l)} ", end='')
    print()

    conn = mysql.connector.connect(**DB)
    cur = conn.cursor()
    cur.execute("DELETE FROM ProductHierarchy")
    conn.commit()

    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ins = ("INSERT INTO ProductHierarchy "
           "(Id,ParentId,ProductLevel,ProductCode,ProductName,SortOrder,IsActive,CreatedAt,UpdatedAt,IsDeleted) "
           "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)")

    for e in entries:
        cur.execute(ins, (e['id'], e['parent'], e['lvl'], e['pcode'],
                          e['name'], e['sort'], 1, now, now, 0))
    conn.commit()
    print(f"Imported {len(entries)} rows into ProductHierarchy")

    cur.execute("SELECT ProductLevel,COUNT(*) FROM ProductHierarchy GROUP BY ProductLevel ORDER BY ProductLevel")
    for row in cur:
        print(f"  L{row[0]}: {row[1]} rows")
    conn.close()


if __name__ == '__main__':
    main()
