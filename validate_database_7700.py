import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== VERIFICANDO INTEGRIDAD DEL BANCO DE 7.700 PREGUNTAS AENA ===")

with open("questions.js", "r", encoding="utf-8") as f:
    js_text = f.read()

match = re.search(r"test_aptitudes:\s*(\[.*?\]),\s*test_ingles:", js_text, re.DOTALL)
if not match:
    print("ERROR: No se pudo parsear test_aptitudes en questions.js")
    exit(1)

aptitudes_qs = json.loads(match.group(1))
print(f"[OK] Total preguntas cargadas en test_aptitudes: {len(aptitudes_qs)}")

counts_by_subtype = {}
for q in aptitudes_qs:
    st = q["subtipo"]
    counts_by_subtype[st] = counts_by_subtype.get(st, 0) + 1

print("\n--- REPARTO POR SUBTIPO (ESPERADO: 700 POR SUBTIPO) ---")
all_700 = True
for st, count in counts_by_subtype.items():
    ok = "[OK]" if count == 700 else "[FAIL]"
    if count != 700: all_700 = False
    print(f"{ok} {st}: {count} preguntas")

print(f"\nTotal subtipos detectados: {len(counts_by_subtype)} / 11")

domino_qs = [q for q in aptitudes_qs if q["subtipo"] == "Series de fichas de dominó"]
domino_imgs = set(q["pregunta"] for q in domino_qs)

matrix_qs = [q for q in aptitudes_qs if q["subtipo"] == "Matrices de figuras y patrones geométricos"]
matrix_imgs = set(q["pregunta"] for q in matrix_qs)

print("\n--- VERIFICACIÓN DE UNICIDAD GRÁFICA VECTORIAL ---")
print(f"{'[OK]' if len(domino_imgs) == 700 else '[FAIL]'} Dominó: {len(domino_imgs)} imágenes de enunciado únicas sobre {len(domino_qs)} preguntas.")
print(f"{'[OK]' if len(matrix_imgs) == 700 else '[FAIL]'} Matrices: {len(matrix_imgs)} imágenes de enunciado únicas sobre {len(matrix_qs)} preguntas.")

if len(aptitudes_qs) == 7700 and all_700 and len(domino_imgs) == 700 and len(matrix_imgs) == 700:
    print("\n¡VALIDACIÓN 100% CORRECTA! EL BANCO TIENE 7.700 PREGUNTAS (700 X 11 SUBTIPOS) PERFECTAMENTE GENERADAS Y LISTAS.")
else:
    print("\n[ALERTA] ALGUNAS REGLAS NO SE CUMPLIERON.")
