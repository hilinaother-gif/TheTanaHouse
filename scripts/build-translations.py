"""Build static translated pages from the English pages and the translation table.

Run from anywhere: python3 scripts/build-translations.py
Brand names, Mexican dish names, prices and the US address are retained.
"""
from pathlib import Path
from html.parser import HTMLParser
from html import escape, unescape
from urllib.parse import urlsplit, urlunsplit
import json, re

ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = {'en': 'English', 'es': 'Español', 'am': 'አማርኛ', 'so': 'Soomaali', 'vi': 'Tiếng Việt'}
NEW = ['am', 'so', 'vi']
STRINGS = {}
for line in (ROOT / 'assets/i18n/strings.tsv').read_text().splitlines():
    if not line.strip(): continue
    values = line.split('\t')
    assert len(values) == 4, values[0]
    STRINGS[values[0]] = dict(zip(NEW, values[1:]))

PROPER = {
    'The', 'Tana House', 'The Tana House', 'The Tana House Restaurant', 'ES',
    '¡Huevos Días!', '¡Huevos', 'Días!', 'Huevos con Jamón', 'Huevos a la Mexicana',
    'Huevos con Chorizo', 'Huevos Rancheros', 'Chilaquiles con Huevos', 'Huevos Divorciados',
    'Sopes con Cecina', 'BLT', 'Reuben', 'Rachel', 'Diet Coke', 'Sprite',
    '3055 Central Ave NE', 'Minneapolis, MN', 'Minneapolis, MN 55418', '(612) 481-3306'
}
COUNT = {'am': ('ምግብ', 'ምግቦች'), 'so': ('cunto', 'cunto'), 'vi': ('món', 'món')}
ILLUSTRATION = {'am': 'የማሳያ ምስል፦ ', 'so': 'Sawir tusaale ah: ', 'vi': 'Hình minh họa: '}
PICK_LABEL = {'en': 'Choose language', 'es': 'Elegir idioma', 'am': 'ቋንቋ ይምረጡ', 'so': 'Dooro luqadda', 'vi': 'Chọn ngôn ngữ'}
META = {
 'am': 'The Tana House በ3055 Central Ave NE፣ Minneapolis የሚገኝ የቁርስና የምሳ ምግብ ቤት ነው። ፓንኬክ፣ ኦሜሌት፣ የሜክሲኮ ቁርስ፣ በርገር እና ሌሎችም። በየቀኑ 7 AM–3 PM።',
 'so': 'The Tana House waa makhaayad quraac iyo qado oo ku taal 3055 Central Ave NE, Minneapolis. Pancake, omelet, quraac Mexico, burger iyo wax kale. Maalin kasta 7 AM–3 PM.',
 'vi': 'The Tana House phục vụ bữa sáng và bữa trưa tại 3055 Central Ave NE, Minneapolis: bánh kếp, trứng cuộn, bữa sáng Mexico, burger và nhiều món khác. Mở hằng ngày 7 AM–3 PM.'
}
TITLES = {'am': ('The Tana House | ቁርስ እና ምሳ', 'ምናሌ | The Tana House'), 'so': ('The Tana House | Quraac iyo Qado', 'Liiska Cuntada | The Tana House'), 'vi': ('The Tana House | Bữa sáng và bữa trưa', 'Thực đơn | The Tana House')}
unknown = set()

def page_name(kind, lang):
    return f'{kind}{"" if lang == "en" else "-" + lang}.html'

def translate(value, lang, record=True):
    if value in STRINGS: return STRINGS[value][lang]
    count = re.fullmatch(r'(\d+) dishes?', value)
    if count: return count[1] + ' ' + COUNT[lang][0 if int(count[1]) == 1 else 1]
    if value.startswith('Illustration of '): return ILLUSTRATION[lang] + translate(value[16:], lang, record)
    if value not in PROPER and re.search(r'[A-Za-z]{2}', value) and not re.fullmatch(r'[0-9: –AMPM.]+', value):
        if record: unknown.add(value)
    return value

def local_url(value, lang):
    parts = urlsplit(value)
    if not parts.scheme and not parts.netloc and parts.path in ['index.html', 'menu.html']:
        return urlunsplit(('', '', page_name(parts.path[:-5], lang), parts.query, parts.fragment))
    return value

def schema(value, lang):
    if isinstance(value, list): return [schema(item, lang) for item in value]
    if isinstance(value, dict):
        result = {key: schema(item, lang) for key, item in value.items()}
        for key in ['name', 'description']:
            if isinstance(value.get(key), str): result[key] = translate(value[key], lang, False)
        if value.get('@type') == 'Restaurant': result['description'] = META[lang]; result['telephone'] = '+16124813306'
        if value.get('@type') == 'Menu': result['inLanguage'] = lang
        return result
    return local_url(value, lang) if isinstance(value, str) else value

class Translator(HTMLParser):
    def __init__(self, lang, kind):
        super().__init__(convert_charrefs=True)
        self.lang = lang; self.kind = kind; self.output = []; self.script_type = None; self.in_title = False
    def handle_decl(self, text): self.output.append('<!' + text + '>')
    def handle_comment(self, text): self.output.append('<!--' + text + '-->')
    def handle_starttag(self, tag, attrs):
        attrs = list(attrs)
        data = dict(attrs)
        if tag == 'script': self.script_type = data.get('type', 'javascript')
        if tag == 'title': self.in_title = True
        changed = []
        for key, value in attrs:
            if tag == 'html' and key == 'lang': value = self.lang
            elif key in ['href', 'src'] and value: value = local_url(value, self.lang)
            elif key in ['aria-label', 'placeholder', 'alt', 'title'] and value:
                if value != 'Ver en español': value = translate(value, self.lang)
            elif tag == 'meta' and data.get('name') == 'description' and key == 'content': value = META[self.lang]
            changed.append(key if value is None else f'{key}="{escape(value, quote=True)}"')
        self.output.append('<' + tag + (' ' + ' '.join(changed) if changed else '') + '>')
    def handle_endtag(self, tag):
        self.output.append('</' + tag + '>')
        if tag == 'script': self.script_type = None
        if tag == 'title': self.in_title = False
    def handle_data(self, text):
        if self.script_type:
            if self.script_type == 'application/ld+json':
                self.output.append('\n' + json.dumps(schema(json.loads(text), self.lang), ensure_ascii=False, indent=1) + '\n')
            else: self.output.append(text)
            return
        if self.in_title: self.output.append(escape(TITLES[self.lang][self.kind == 'menu'])); return
        match = re.fullmatch(r'(\s*)(.*?)(\s*)', text, re.S)
        if match and match[2]: self.output.append(match[1] + escape(translate(match[2], self.lang)) + match[3])
        else: self.output.append(text)

def picker(kind, lang):
    globe = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18z"/></svg>'
    links = ''.join(f'<a class="lang-switch" href="{page_name(kind, code)}" lang="{code}" hreflang="{code}"' + (' aria-current="page"' if code == lang else '') + f'>{name}' + ('<span aria-hidden="true">✓</span>' if code == lang else '') + '</a>' for code, name in LANGUAGES.items())
    return f'<details class="language-picker"><summary aria-label="{PICK_LABEL[lang]}">{globe}<span>{lang.upper()}</span><span class="language-chevron" aria-hidden="true">⌄</span></summary><div class="language-options">{links}</div></details>'

def finalize(text, kind, lang):
    text = re.sub(r'(<meta name="viewport" content=")[^"]*(">)', r'\1width=device-width, initial-scale=1, viewport-fit=cover\2', text, count=1)
    if 'assets/css/responsive.css' not in text:
        styles = list(re.finditer(r'<link rel="stylesheet"[^>]+>', text))
        if styles:
            point = styles[-1].end()
            text = text[:point] + '\n  <link rel="stylesheet" href="assets/css/responsive.css">' + text[point:]
    text = re.sub(r'<link\b(?=[^>]*rel="alternate")[^>]*>\s*', '', text)
    alternates = '\n'.join(f'  <link rel="alternate" hreflang="{code}" href="{page_name(kind, code)}">' for code in LANGUAGES)
    alternates += f'\n  <link rel="alternate" hreflang="x-default" href="{page_name(kind, "en")}">\n'
    text = re.sub(r'^[ \t]*<script type="application/ld\+json">', lambda _:alternates + '  <script type="application/ld+json">', text, count=1, flags=re.M)
    if 'assets/css/languages.css' not in text:
        text = text.replace('<link rel="stylesheet" href="assets/css/styles.css">', '<link rel="stylesheet" href="assets/css/styles.css">\n  <link rel="stylesheet" href="assets/css/languages.css">', 1)
    if 'Noto+Sans+Ethiopic' not in text:
        text = text.replace('&display=swap', '&family=Noto+Sans+Ethiopic:wght@400;500;600&family=Noto+Serif+Ethiopic:wght@500;600&display=swap').replace('&amp;display=swap', '&amp;family=Noto+Sans+Ethiopic:wght@400;500;600&amp;family=Noto+Serif+Ethiopic:wght@500;600&amp;display=swap')
    if 'assets/js/languages.js' not in text:
        text = text.replace('  <script src="assets/js/main.js"></script>', '  <script src="assets/js/languages.js"></script>\n  <script src="assets/js/main.js"></script>')
    if '<details class="language-picker">' in text:
        text = re.sub(r'<details class="language-picker">.*?</details>', lambda _:picker(kind,lang), text, count=1, flags=re.S)
    else:
        text = re.sub(r'<a class="lang-switch"[^>]*>.*?</a>', lambda _:picker(kind,lang), text, count=1, flags=re.S)
    if kind == 'menu':
        english = (ROOT / 'menu.html').read_text()
        originals = re.findall(r'<article class="item".*?</article>', english, re.S)
        index = 0
        def search_data(match):
            nonlocal index
            name = unescape(re.search(r'<h3>(.*?)</h3>', originals[index], re.S)[1])
            index += 1
            opening = re.sub(r' data-search="[^"]*"', '', match[0])
            return opening[:-1] + ' data-search="' + escape(name, quote=True) + '">'
        text = re.sub(r'<article class="item"[^>]*>', search_data, text)
    if lang == 'am': text = text.replace('</span>, <em>', '</span>፣ <em>')
    if lang == 'vi' and kind == 'index':
        text = re.sub(r'<h1>.*?</h1>', '<h1><span data-time-greeting>Chào buổi sáng</span>.<br><em>Chăm chút</em> từng món ăn.</h1>', text, count=1, flags=re.S)
    return text

sources = {kind: (ROOT / (kind + '.html')).read_text() for kind in ['index', 'menu']}
sources = {kind: re.sub(r'<details class="language-picker">.*?</details>', '<a class="lang-switch" href="index-es.html">ES</a>', text, flags=re.S) for kind, text in sources.items()}
for lang in NEW:
    for kind, source in sources.items():
        parser = Translator(lang, kind); parser.feed(source)
        text = finalize(''.join(parser.output), kind, lang)
        (ROOT / page_name(kind, lang)).write_text(text)
for lang in ['en', 'es']:
    for kind in ['index', 'menu']:
        path = ROOT / page_name(kind, lang)
        path.write_text(finalize(path.read_text(), kind, lang))
print('Built 6 translated pages and connected all 10 pages to the five-language picker.')
if unknown: print('Retained source strings to review:', json.dumps(sorted(unknown), ensure_ascii=False, indent=2))
