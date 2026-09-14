"""Read an owner-supplied XLSX as data; emit bounded import metadata to stdout."""
import argparse, hashlib, json, warnings
from pathlib import Path
import openpyxl
from openpyxl.utils.cell import range_boundaries, column_index_from_string

parser=argparse.ArgumentParser()
parser.add_argument("workbook")
args=parser.parse_args()
warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")
book=openpyxl.load_workbook(args.workbook, data_only=False)

def rgb(color):
    if color and color.type=="rgb" and isinstance(color.rgb,str):
        h=color.rgb[-6:]
        return dict(zip(("red","green","blue"),[int(h[i:i+2],16)/255 for i in (0,2,4)]))
    return None

styles={}
sheets=[]
for sheet in book:
    rows=[]
    for row in sheet:
        cells=[]
        for cell in row:
            ident=cell.style_id
            cells.append({"value":cell.value,"style":ident})
            if ident not in styles:
                font=cell.font
                fmt={"textFormat":{"fontFamily":font.name or "Arial","fontSize":round(font.sz or 10),"bold":bool(font.b),"italic":bool(font.i)},
                     "verticalAlignment":(cell.alignment.vertical or "top").upper(),
                     "wrapStrategy":"WRAP" if cell.alignment.wrap_text else "CLIP"}
                if fmt["verticalAlignment"]=="CENTER":fmt["verticalAlignment"]="MIDDLE"
                if cell.alignment.horizontal in ("left","center","right"):fmt["horizontalAlignment"]=cell.alignment.horizontal.upper()
                if rgb(font.color):fmt["textFormat"]["foregroundColorStyle"]={"rgbColor":rgb(font.color)}
                if cell.fill.patternType=="solid" and rgb(cell.fill.fgColor):fmt["backgroundColorStyle"]={"rgbColor":rgb(cell.fill.fgColor)}
                styles[ident]=fmt
        rows.append(cells)
    sheets.append({"title":sheet.title,"rows":rows,"merges":[list(range_boundaries(str(r))) for r in sheet.merged_cells.ranges],
      "widths":[[column_index_from_string(k)-1,round(v.width*7+5)] for k,v in sheet.column_dimensions.items()],
      "heights":[[k-1,round(v.height*4/3)] for k,v in sheet.row_dimensions.items() if v.height],
      "tables":[{"name":t.name,"range":list(range_boundaries(t.ref))} for t in sheet.tables.values()],
      "validations":[{"range":str(v.sqref),"type":v.type,"list":v.formula1.strip('"').split(",")} for v in sheet.data_validations.dataValidation if v.type=="list"]})
print(json.dumps({"sha256":hashlib.sha256(Path(args.workbook).read_bytes()).hexdigest(),"styles":styles,"sheets":sheets},ensure_ascii=True,separators=(",",":")))
