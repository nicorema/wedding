#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera un CSV con nombre, apellido y enlace wa.me a partir de un CSV de invitados.
Columnas: nombre, apellido, apodo (opcional), telefono, Tiene Plus One Sin Nombre,
Nombre unico de grupo (si hay valor = mensaje en grupo, un solo wa.me por grupo).
Tres mensajes: normal, plus one, grupo.
Uso: python save_the_date.py input.csv output.csv [mensaje] [mensaje_plus_one] [mensaje_grupo]
"""

import argparse
import csv
import re
import sys
import urllib.parse


def normalizar_telefono(telefono: str) -> str:
    """Deja solo dígitos para el enlace wa.me (sin + ni espacios)."""
    if not telefono:
        return ""
    digitos = re.sub(r"\D", "", str(telefono).strip())
    # Si no tiene código de país, asumir España (+34)
    if len(digitos) == 9 and digitos.startswith(("6", "7", "8", "9")):
        digitos = "34" + digitos
    return digitos


def es_true(valor: str) -> bool:
    """Interpreta si el valor es TRUE/True/true/1/Sí/etc."""
    if not valor:
        return False
    return str(valor).strip().upper() in ("TRUE", "1", "SÍ", "SI", "YES")


def detectar_columnas(row_keys: list[str]) -> dict[str, str]:
    """Detecta nombres de columnas para nombre, apellido, apodo, teléfono y plus one."""
    keys_lower = {k.lower().strip(): k for k in row_keys}
    nombre_key = None
    apellido_key = None
    apodo_key = None
    telefono_key = None
    plus_one_key = None

    for k in keys_lower:
        if k in ("nombre", "name", "nombre_invitado"):
            nombre_key = keys_lower[k]
            break
    if not nombre_key:
        for k in keys_lower:
            if "nombre" in k and "apellido" not in k and "apodo" not in k:
                nombre_key = keys_lower[k]
                break
    if not nombre_key:
        nombre_key = list(row_keys)[0] if row_keys else "nombre"

    for k in keys_lower:
        if k in ("apellido", "apellidos", "surname", "lastname"):
            apellido_key = keys_lower[k]
            break
    if not apellido_key:
        for k in keys_lower:
            if "apellido" in k:
                apellido_key = keys_lower[k]
                break
    if not apellido_key:
        apellido_key = list(row_keys)[1] if len(row_keys) > 1 else "apellido"

    for k in keys_lower:
        if k in ("apodo", "nickname", "alias"):
            apodo_key = keys_lower[k]
            break
    if not apodo_key:
        for k in keys_lower:
            if "apodo" in k:
                apodo_key = keys_lower[k]
                break

    for k in keys_lower:
        if k in ("telefono", "teléfono", "phone", "movil", "móvil", "tlf"):
            telefono_key = keys_lower[k]
            break
    if not telefono_key:
        for k in keys_lower:
            if "tel" in k or "phone" in k or "movil" in k:
                telefono_key = keys_lower[k]
                break
    if not telefono_key:
        telefono_key = "telefono"

    for k in keys_lower:
        if "plus one" in k and "nombre" in k:
            plus_one_key = keys_lower[k]
            break
    if not plus_one_key:
        for k in keys_lower:
            if "plus" in k or "plus_one" in k:
                plus_one_key = keys_lower[k]
                break

    grupo_key = None
    for k in keys_lower:
        if "grupo" in k and "nombre" in k:
            grupo_key = keys_lower[k]
            break
    if not grupo_key:
        for k in keys_lower:
            if "grupo" in k or "nombre unico" in k:
                grupo_key = keys_lower[k]
                break

    return {
        "nombre": nombre_key,
        "apellido": apellido_key,
        "apodo": apodo_key,
        "telefono": telefono_key,
        "plus_one_sin_nombre": plus_one_key,
        "nombre_grupo": grupo_key,
    }


def nombre_mostrar(nombre: str, apellido: str, apodo: str) -> tuple[str, str]:
    """Si hay apodo: solo apodo (nombre=apodo, apellido vacío). Si no: nombre + apellidos."""
    apodo = (apodo or "").strip()
    if apodo:
        return (apodo, "")
    return (f"{nombre} {apellido}".strip() or nombre or apellido, apellido)


# Emojis en tiempo de ejecución para evitar problemas de encoding del archivo
_ANILLO = "💍"  # 💍 anillo
_SHUSH = "🤫"  # 🤫 cara callando

# Link que se añade al final de cada mensaje
LINK_AL_FINAL = "https://wedding-flax-two.vercel.app/cuando"

MENSAJE_INVITADO_SOLO = f"""¡Hola, (nombre del invitado)! {_ANILLO}
Se acerca el matrimonio de Nico & Caro, y queremos compartir contigo este momento tan especial.
En el enlace encontrarás la reserva de la fecha y la ciudad donde celebrarán su unión (aún no podemos revelar todos los detalles {_SHUSH}). Aprovecha también para chismosear la página, dejarles mensajitos y jugar un poco por ahí.
La invitación oficial llegará próximamente con toda la información.
Este es el número oficial del matrimonio, así que cualquier duda o mensaje puedes escribir con total confianza por este medio."""

MENSAJE_GRUPO = f"""¡Hola, (nombre del grupo)! {_ANILLO}
Se acerca el matrimonio de Nico & Caro, y queremos compartir con ustedes este momento tan especial.
En el enlace encontrarán la reserva de la fecha y la ciudad donde celebrarán su unión (aún no podemos revelar todos los detalles {_SHUSH}). Aprovechen también para chismosear la página, dejarles mensajitos y jugar un poco por ahí.
La invitación oficial llegará próximamente con toda la información.
Este es el número oficial del matrimonio, así que cualquier duda o mensaje pueden escribir con total confianza por este medio."""

MENSAJE_PLUS_ONE = f"""¡Hola, (nombre del invitado)! {_ANILLO}
Se acerca el matrimonio de Nico & Caro, y queremos compartir contigo y tu plus one este momento tan especial.
En el enlace encontrarás la reserva de la fecha y la ciudad donde celebrarán su unión (aún no podemos revelar todos los detalles {_SHUSH}). Aprovecha también para chismosear la página, dejarles mensajitos y jugar un poco por ahí.
La invitación oficial llegará próximamente con toda la información.
Este es el número oficial del matrimonio, así que cualquier duda o mensaje puedes escribir con total confianza por este medio."""


def main():
    parser = argparse.ArgumentParser(
        description="Genera CSV con nombre, apellido y enlace wa.me"
    )
    parser.add_argument(
        "input_csv",
        nargs="?",
        default="input.csv",
        help="Archivo CSV de entrada (default: input.csv)",
    )
    parser.add_argument(
        "output_csv",
        nargs="?",
        default="output.csv",
        help="Archivo CSV de salida (default: output.csv)",
    )
    parser.add_argument(
        "mensaje",
        nargs="?",
        default=MENSAJE_INVITADO_SOLO,
        help="Mensaje para invitado solo. Usa (nombre del invitado) como placeholder (opcional)",
    )
    parser.add_argument(
        "mensaje_plus_one",
        nargs="?",
        default=MENSAJE_PLUS_ONE,
        help="Mensaje cuando Tiene Plus One Sin Nombre es TRUE. Usa (nombre del invitado) (opcional)",
    )
    parser.add_argument(
        "mensaje_grupo",
        nargs="?",
        default=MENSAJE_GRUPO,
        help="Mensaje para grupo. Usa (nombre del grupo) como placeholder (opcional)",
    )
    args = parser.parse_args()

    try:
        with open(args.input_csv, newline="", encoding="utf-8") as infile:
            reader = csv.DictReader(infile)
            rows = list(reader)
            if not rows:
                print("El CSV de entrada está vacío.", file=sys.stderr)
                sys.exit(1)
            fieldnames_in = reader.fieldnames or list(rows[0].keys())
    except FileNotFoundError:
        print(f"Error: no se encontró el archivo '{args.input_csv}'", file=sys.stderr)
        sys.exit(1)

    cols = detectar_columnas(fieldnames_in)
    nombre_key = cols["nombre"]
    apellido_key = cols["apellido"]
    apodo_key = cols.get("apodo")
    telefono_key = cols["telefono"]
    plus_one_key = cols.get("plus_one_sin_nombre")
    grupo_key = cols.get("nombre_grupo")

    out_fieldnames = ["nombre", "apellido", "wa_link"]

    # Por cada nombre de grupo, guardar el primer teléfono válido que encontremos (orden del CSV)
    primer_telefono_por_grupo: dict[str, str] = {}
    if grupo_key:
        for row in rows:
            nombre_grupo = (row.get(grupo_key) or "").strip()
            if not nombre_grupo:
                continue
            if nombre_grupo in primer_telefono_por_grupo:
                continue
            phone = normalizar_telefono(row.get(telefono_key, ""))
            if phone:
                primer_telefono_por_grupo[nombre_grupo] = phone

    grupos_ya_escritos: set[str] = set()
    filas_escritas = 0

    with open(args.output_csv, "w", newline="", encoding="utf-8") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=out_fieldnames)
        writer.writeheader()

        for row in rows:
            nombre = row.get(nombre_key, "").strip()
            apellido = row.get(apellido_key, "").strip()
            apodo = row.get(apodo_key, "").strip() if apodo_key else ""
            telefono = row.get(telefono_key, "")
            tiene_plus_one = (
                es_true(row.get(plus_one_key, "")) if plus_one_key else False
            )
            nombre_grupo = (row.get(grupo_key) or "").strip() if grupo_key else ""

            phone = normalizar_telefono(telefono)

            # Si tiene nombre de grupo: un único wa.me por grupo (solo la primera vez que vemos el grupo)
            if nombre_grupo:
                if nombre_grupo in grupos_ya_escritos:
                    continue
                grupos_ya_escritos.add(nombre_grupo)
                phone_grupo = primer_telefono_por_grupo.get(nombre_grupo, "")
                mensaje_grupo_final = (
                    args.mensaje_grupo.replace("(nombre del grupo)", nombre_grupo)
                    + "\n\n"
                    + LINK_AL_FINAL
                )
                mensaje_grupo_encoded = urllib.parse.quote(
                    mensaje_grupo_final, encoding="utf-8", safe=""
                )
                wa_link = (
                    f"https://wa.me/{phone_grupo}?text={mensaje_grupo_encoded}"
                    if phone_grupo
                    else ""
                )
                writer.writerow(
                    {
                        "nombre": nombre_grupo,
                        "apellido": "",
                        "wa_link": wa_link,
                    }
                )
                filas_escritas += 1
                continue

            # Sin grupo: mensaje normal o plus one, una fila por persona
            nombre_display, apellido_display = nombre_mostrar(nombre, apellido, apodo)
            plantilla = args.mensaje_plus_one if tiene_plus_one else args.mensaje
            mensaje_final = (
                plantilla.replace("(nombre del invitado)", nombre_display)
                + "\n\n"
                + LINK_AL_FINAL
            )
            mensaje_encoded = urllib.parse.quote(
                mensaje_final, encoding="utf-8", safe=""
            )
            wa_link = f"https://wa.me/{phone}?text={mensaje_encoded}" if phone else ""

            writer.writerow(
                {
                    "nombre": nombre_display,
                    "apellido": apellido_display,
                    "wa_link": wa_link,
                }
            )
            filas_escritas += 1

    print(f"Listo: {filas_escritas} filas escritas en '{args.output_csv}'")


if __name__ == "__main__":
    main()
