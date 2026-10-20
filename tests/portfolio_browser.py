"""Browser regression checks against the production build with isolated Supabase fixtures.
Run: npm.cmd run build; python tests/portfolio_browser.py
Requires Python Playwright + Chromium (pip install playwright; python -m playwright install chromium).
"""
import copy
import json
import re
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '.verification'
OUTPUT.mkdir(exist_ok=True)
seed = (ROOT / 'supabase/portfolio-seed.sql').read_text(encoding='utf-8-sig')
projects = json.loads(re.search(r'\$json\$(.*?)\$json\$', seed, re.S).group(1))
for index, project in enumerate(projects):
    project.update(id=index + 1, is_published=True)
fixtures = {
    'profile': [dict(id='main', name='Rusdi Aulia Romadhon', headline='Cybersecurity & Network Infrastructure',
                     status='Mahasiswa tingkat akhir · Teknik Informatika',
                     hero_description='Mendalami keamanan sistem dan jaringan melalui web security assessment, CTF, serta pengalaman langsung dalam konfigurasi MikroTik, IT support, dan otomasi Python.',
                     about='Mahasiswa tingkat akhir S1 Teknik Informatika UIN Syarif Hidayatullah Jakarta dengan IPK 3,74/4,0. Saya berfokus pada Cybersecurity, Network Security, dan IT Infrastructure.',
                     approach='Memahami cara sistem bekerja, menganalisis masalahnya, lalu membangun solusi yang dapat digunakan.',
                     location='Depok, Indonesia', email='rusdiaulia313@gmail.com', photo_url='/rusdi.png',
                     linkedin_url='https://www.linkedin.com/in/rusdi-aulia-romadhon/', github_url='https://github.com/rusdi313',
                     cv_url='https://example.com/cv.pdf', contact_title='Mari terhubung.', contact_description='Diskusi, kolaborasi, dan peluang di bidang teknologi.', is_published=True)],
    'projects': projects,
    'skills': [dict(id=str(i), name=name, category=group, is_published=True) for i, (group, name) in enumerate([
        ('Cybersecurity', 'Vulnerability Assessment'), ('Cybersecurity', 'Web Security Testing'),
        ('Security Tools', 'Burp Suite'), ('Security Tools', 'Nmap'), ('Networking & Infrastructure', 'MikroTik'),
        ('IT Support', 'Troubleshooting'), ('Programming', 'Python'), ('Tools', 'Git')])],
    'experiences': [dict(id='uin-it-support', role='IT Staff Intern', company='PUSLITPEN, UIN Syarif Hidayatullah Jakarta',
                         period='Januari – Juli 2026', type='Internship', location='Tangerang Selatan',
                         highlights=['Mengembangkan skrip Python untuk otomasi dokumen.'], technologies=['Python'], is_published=True),
                    dict(id='himti', role='Staf Divisi Akademik Development', company='HIMTI', period='Juli 2025 – Juli 2026', type='Organization', is_published=True)],
    'education': [dict(id='uin', institution='UIN Syarif Hidayatullah Jakarta', degree='S1 Teknik Informatika', period='2023 – Sekarang', gpa='3,74 / 4,00', highlights=['Keamanan Siber, Kriptografi, Forensik Digital'], is_published=True),
                  dict(id='smk', institution='SMK Budi Utomo Jombang', degree='Teknik Komputer dan Jaringan', period='2020 – 2023', highlights=['MTCNA dan konfigurasi jaringan MikroTik'], is_published=True)],
    'certificates': [dict(id=i, name=name, issuer=issuer, issued_on='2026-08-01', category='Cybersecurity', is_published=True) for i, (name, issuer) in enumerate([
        ('Junior Ethical Hacker', 'X-Code'), ('CyberOps Associate', 'Cisco Networking Academy'), ('MTCNA', 'MikroTik'),
        ('Cybersecurity Essentials', 'Cisco Networking Academy'), ('Networking', 'Certiport'), ('Cloud Basics', 'Huawei'), ('Java Fundamentals', 'Oracle')])]
}

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if urlparse(self.path).path.startswith('/project/'):
            self.path = '/index.html'
        return super().do_GET()
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(ROOT / 'dist')))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
state = copy.deepcopy(fixtures)
failed = set()
requests = []

def route_api(route):
    parsed = urlparse(route.request.url)
    table = parsed.path.rsplit('/', 1)[-1]
    query = parse_qs(parsed.query)
    assert query.get('is_published') == ['eq.true'], query
    requests.append(table)
    if table in failed:
        route.fulfill(status=503, content_type='application/json', body=json.dumps({'message': 'Test outage'}))
    else:
        rows = [row for row in state.get(table, []) if row.get('is_published', True)]
        route.fulfill(content_type='application/json', body=json.dumps(rows))

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
        context.route('**/rest/v1/**', route_api)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(base)
        expect(page.get_by_role('heading', name='Cybersecurity & Network Infrastructure', exact=True)).to_be_visible()
        canvas = page.locator('.particle-drift canvas')
        expect(canvas).to_be_visible()
        page.wait_for_function("document.querySelector('.particle-drift canvas').width > 0")
        still = canvas.evaluate('(canvas) => canvas.toDataURL()')
        page.wait_for_timeout(150)
        assert canvas.evaluate('(canvas) => canvas.toDataURL()') == still, 'Reduced motion must remain static'
        page.emulate_media(reduced_motion='no-preference')
        page.wait_for_function("previous => document.querySelector('.particle-drift canvas').toDataURL() !== previous", arg=still)
        page.emulate_media(reduced_motion='reduce')
        expect(page.locator('.project-card')).to_have_count(3)
        expect(page.locator('.skill-card')).to_have_count(6)
        expect(page.locator('meta[name="description"]')).to_have_count(1)
        assert page.locator('#Contact a[href="mailto:rusdiaulia313@gmail.com"]').count() == 1
        page.screenshot(path=str(OUTPUT / 'desktop.png'), full_page=True)
        page.screenshot(path=str(OUTPUT / 'desktop-hero.png'))
        page.locator('.project-grid').screenshot(path=str(OUTPUT / 'project-folders-desktop.png'))
        page.get_by_role('button', name='Automation', exact=True).click()
        expect(page.locator('.project-card')).to_have_count(1)
        page.locator('#Portofolio').get_by_role('button', name='Semua', exact=True).click()
        expect(page.locator('.project-card')).to_have_count(3)
        page.get_by_role('button', name='Organisasi', exact=True).click()
        expect(page.locator('.experience-row')).to_have_count(1)
        page.get_by_role('button', name='Kerja', exact=True).click()
        page.locator('summary').click()
        expect(page.get_by_text('Mengembangkan skrip Python untuk otomasi dokumen.', exact=True)).to_be_visible()
        expect(page.locator('.certificate-card')).to_have_count(6)
        page.get_by_role('button', name='Lihat semua sertifikasi').click()
        expect(page.locator('.certificate-card')).to_have_count(7)
        # Direct deep link works with a fresh page and no localStorage.
        detail = context.new_page()
        detail.goto(base + '/project/1')
        expect(detail.get_by_role('heading', name=projects[0]['Title'], exact=True)).to_be_visible()
        assert detail.locator('a').count() == 1  # No fabricated demo / repository URLs.
        detail.goto(base + '/project/missing')
        expect(detail.get_by_role('heading', name='Proyek tidak ditemukan')).to_be_visible()
        detail.close()
        # Error isolation and retry: projects fail while the profile still renders.
        failed.add('projects')
        page.reload()
        expect(page.locator('#Portofolio [role="alert"]')).to_be_visible()
        expect(page.get_by_role('heading', name='Cybersecurity & Network Infrastructure', exact=True)).to_be_visible()
        failed.clear()
        page.locator('#Portofolio').get_by_role('button', name='Coba lagi').click()
        expect(page.locator('.project-card')).to_have_count(3)
        # Published -> draft and empty collections recover through the same refetch path.
        state['projects'][0]['is_published'] = False
        state['skills'] = []
        page.evaluate("window.dispatchEvent(new Event('online'))")
        expect(page.locator('.project-card')).to_have_count(2)
        expect(page.locator('#Skills').get_by_text('Konten segera hadir.', exact=True)).to_be_visible()
        state = copy.deepcopy(fixtures)
        state['profile'][0]['headline'] = 'Profil diperbarui dari database'
        page.evaluate("window.dispatchEvent(new Event('online'))")
        expect(page.get_by_role('heading', name='Profil diperbarui dari database')).to_be_visible()
        state = copy.deepcopy(fixtures)
        for width in [390, 320, 768]:
            page.set_viewport_size({'width': width, 'height': 844})
            page.goto(base)
            expect(page.locator('.project-card')).to_have_count(3)
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), f'Overflow at {width}px'
            if width < 760:
                menu = page.get_by_role('button', name='Buka navigasi')
                menu.click()
                expect(page.get_by_role('button', name='Tutup navigasi')).to_have_attribute('aria-expanded', 'true')
                page.keyboard.press('Escape')
                expect(page.get_by_role('button', name='Buka navigasi')).to_have_attribute('aria-expanded', 'false')
                if width == 390:
                    page.screenshot(path=str(OUTPUT / 'mobile.png'), full_page=True)
                    page.screenshot(path=str(OUTPUT / 'mobile-hero.png'))
                    page.locator('.project-grid').screenshot(path=str(OUTPUT / 'project-folders-mobile.png'))
        assert not errors, errors
        browser.close()
        print('PASS: desktop/mobile (320/390/768px), filters, details, metadata, contacts, empty/error/retry, draft removal, live refetch; no page errors.')
finally:
    server.shutdown()
