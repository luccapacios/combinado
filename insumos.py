# -*- coding: utf-8 -*-
"""Baixa os insumos do protótipo: fotos (licença Unsplash) e fontes estáticas.

Fotos em 1000 px de largura, JPEG. Fontes: instâncias estáticas por peso
(Unbounded e DM Sans), também copiadas para o documento.
"""
import io, os, re, shutil, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
FOTOS = {
    # chave: (id do arquivo no CDN, id da página, autor)
    "capa": ("1585758950312-644d1687564a", "-lgCfVJAfWE", "Gustavo Juliette"),
    "itamambuca": ("1647971447454-8093ed0f8e3d", "lOr5fSzJ9tQ", "Mauro Lima"),
    "alpendre": ("1649192155761-37edb01b542b", "C6ikMoTpBc4", "Linoleum Creative Collective"),
    "costa": ("1674136473363-2ac7e88f5866", "-xxNaEBP8eE", "Edu Lins"),
    "sobrado": ("1649101384945-4080178fd03b", "6cP3pAyLRCo", "Mauro Lima"),
    "rua": ("1607029257863-8b2e746453f7", "u7NV4Ck7hNM", "Guilherme Gabrielli"),
    "noite": ("1623194417728-adf641357d41", "Voxlac0w_6I", "Gilberto Olimpio"),
    "palafita": ("1672668798339-577dfd762e2c", "1JGIx-ExLIc", "Kawê Rodrigues"),
    "praia": ("1744658668911-8b9ec3a2de61", "3vScCVOU1ew", "Calebe Oliveira"),
    "pordosol": ("1660076327655-a43e7cadf86d", "96_QlWen0ek", "Filipe Freitas"),
    "aerea": ("1704888052546-157c67bc880f", "i1R4TgPoZjw", "Lukas Souza"),
}
UA_TTF = "curl/7.0"
FONTES = [("Unbounded", [600, 800], {}), ("DM Sans", [400, 500, 700], {"opsz": 14})]


def get(url, ua="Mozilla/5.0"):
    req = urllib.request.Request(url, headers={"User-Agent": ua})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


os.makedirs(os.path.join(HERE, "fotos"), exist_ok=True)
for k, (arq, _, _) in FOTOS.items():
    dados = get(f"https://images.unsplash.com/photo-{arq}?w=1000&q=72&fm=jpg&fit=max")
    io.open(os.path.join(HERE, "fotos", k + ".jpg"), "wb").write(dados)
    print("foto", k, len(dados) // 1024, "KB")


def estatizar(caminho, peso, fixos):
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer
    f = TTFont(caminho)
    if "fvar" in f:
        loc = {}
        for a in f["fvar"].axes:
            v = peso if a.axisTag == "wght" else fixos.get(a.axisTag, a.defaultValue)
            loc[a.axisTag] = max(a.minValue, min(a.maxValue, v))
        instancer.instantiateVariableFont(f, loc, inplace=True, updateFontNames=False)
        f.save(caminho)
    f.close()


os.makedirs(os.path.join(HERE, "fontes"), exist_ok=True)
DOC = os.path.join(os.path.dirname(HERE), "documento", "fontes")
for familia, pesos, fixos in FONTES:
    css = get(f"https://fonts.googleapis.com/css?family={familia.replace(' ', '+')}:{','.join(map(str, pesos))}", UA_TTF).decode()
    for peso, url in re.findall(r"font-weight:\s*(\d+);[^}]*?url\((https://[^)]+\.ttf)\)", css, re.S):
        nome = f"{familia.replace(' ', '')}-{peso}.ttf"
        caminho = os.path.join(HERE, "fontes", nome)
        io.open(caminho, "wb").write(get(url, UA_TTF))
        estatizar(caminho, int(peso), fixos)
        shutil.copyfile(caminho, os.path.join(DOC, nome))
        print("fonte", nome, os.path.getsize(caminho) // 1024, "KB")

for fam, lic in (("unbounded", "OFL-Unbounded.txt"), ("dmsans", "OFL-DMSans.txt")):
    io.open(os.path.join(HERE, "fontes", lic), "wb").write(get(f"https://raw.githubusercontent.com/google/fonts/main/ofl/{fam}/OFL.txt"))
print("licenças ok")
