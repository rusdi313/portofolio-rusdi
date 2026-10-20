-- Run after portfolio-schema.sql and seed-experiences.sql.
-- Seed statements preserve existing rows. Named legacy experience values are aligned with the CV below.
begin;
insert into public.profile (id,name,headline,status,hero_description,about,approach,location,email,linkedin_url,github_url,photo_url,contact_title,contact_description)
values ('main','Rusdi Aulia Romadhon','Cybersecurity & Network Infrastructure','Mahasiswa tingkat akhir · Teknik Informatika',
'Mendalami keamanan sistem dan jaringan melalui web security assessment, CTF, serta pengalaman langsung dalam konfigurasi MikroTik, IT support, dan otomasi Python.',
'Mahasiswa tingkat akhir S1 Teknik Informatika UIN Syarif Hidayatullah Jakarta dengan IPK 3,74/4,0. Saya berfokus pada Cybersecurity, Network Security, dan IT Infrastructure.' || E'\n\n' || 'Pengalaman saya mencakup vulnerability assessment dan web security testing di lingkungan pengujian terkontrol, proyek Red Team, serta Capture The Flag. Latar belakang Teknik Komputer dan Jaringan memberi saya pengalaman praktis dalam instalasi, konfigurasi, dan troubleshooting jaringan MikroTik.' || E'\n\n' || 'Saya juga menggunakan Python untuk otomasi pekerjaan administratif dan memiliki pengalaman pengembangan web dengan Laravel dan Tailwind CSS.',
'Memahami cara sistem bekerja, menganalisis masalahnya, lalu membangun solusi yang dapat digunakan.',
'Depok, Indonesia','rusdiaulia313@gmail.com','https://www.linkedin.com/in/rusdi-aulia-romadhon/','https://github.com/rusdi313','/rusdi.png',
'Mari terhubung.','Tertarik berdiskusi tentang cybersecurity, jaringan, IT infrastructure, atau peluang kolaborasi? Hubungi saya melalui email atau LinkedIn.')
on conflict (id) do nothing;

insert into public.education (id,institution,degree,period,gpa,highlights,sort_order) values
('uin-informatika','UIN Syarif Hidayatullah Jakarta','S1 Teknik Informatika','2023 – Sekarang','3,74 / 4,00',array['Mahasiswa tingkat akhir.','Mata kuliah relevan: Jaringan Komputer, Sistem Operasi, Keamanan Siber, Kriptografi, Forensik Digital, Sistem Basis Data, dan Manajemen Proyek TI.'],1),
('smk-tkj','SMK Budi Utomo Jombang','Teknik Komputer dan Jaringan','2020 – 2023',null,array['Meraih MTCNA dan berpengalaman dalam konfigurasi jaringan MikroTik.','Juri & Mentor Axioo Robotic Competition di Maspion IT Surabaya.','Asisten Laboratorium Komputer; membantu instalasi dan troubleshooting jaringan serta CCTV sekolah.'],2)
on conflict (id) do nothing;

insert into public.skills (id,name,category,sort_order)
select 'cv-skill-' || groups.position || '-' || item.ordinality, item.name, groups.category, groups.position * 100 + item.ordinality::integer
from (values
 (1,'Cybersecurity',array['Web Security Assessment','Vulnerability Assessment','Reconnaissance','Basic Penetration Testing','Network Security','CTF']),
 (2,'Security Tools',array['Burp Suite','Nmap','Wireshark','sqlmap','Nikto','Gobuster','ssh-audit','sslscan','Kali Linux']),
 (3,'Networking & Infrastructure',array['MikroTik','Network Troubleshooting','Router & AP Configuration','WiFi Deployment','Signal Optimization','CCTV']),
 (4,'IT Support',array['Hardware & Software Troubleshooting','Printer Support','Computer Maintenance','Technical Support']),
 (5,'Programming',array['Python','PHP','Laravel','JavaScript','ReactJS','HTML/CSS','Tailwind CSS']),
 (6,'Tools',array['Git','GitHub','Microsoft Excel','Microsoft Word','cPanel'])
) as groups(position,category,names)
cross join lateral unnest(groups.names) with ordinality as item(name,ordinality)
on conflict (id) do nothing;

-- Imported/manual IDs may be ahead of the identity/serial sequence.
-- Serialize project inserts during this seed and never move the sequence backwards.
lock table public.projects in share row exclusive mode;
do $$
declare
  project_sequence regclass := pg_get_serial_sequence('public.projects', 'id')::regclass;
  highest_id bigint;
begin
  select max(id) into highest_id from public.projects;
  if project_sequence is null then
    raise exception 'projects.id has no identity/serial sequence. Configure its automatic ID default before running this seed.';
  end if;
  if highest_id is not null then
    perform setval(project_sequence, greatest(highest_id, nextval(project_sequence)), true);
  end if;
end $$;

-- Seed case studies with JSON conversion to support existing text[] or JSON columns.
insert into public.projects ("Title","Description","Img","Link","Github","TechStack","Features",category,role,period,context,methods,outcomes,featured,sort_order)
select p."Title",p."Description",p."Img",p."Link",p."Github",p."TechStack",p."Features",p.category,p.role,p.period,p.context,p.methods,p.outcomes,p.featured,p.sort_order
from jsonb_populate_recordset(null::public.projects, $json$[
 {"Title":"Web Security Assessment / Red Team Project","Description":"Pengujian keamanan web di lingkungan terkontrol untuk mengidentifikasi dan memvalidasi kerentanan aplikasi.","Img":"","Link":"","Github":"","TechStack":["Python","Web Security Testing","Vulnerability Assessment"],"Features":["Reconnaissance dan vulnerability assessment pada lingkungan pengujian terkontrol.","Identifikasi kerentanan CSRF, CAPTCHA, session management, dan rate limiting.","Skrip Python untuk otomasi pengujian dan validasi kerentanan."],"category":"Cybersecurity","role":"Final Project · Cybersecurity Course","period":"September – Desember 2025","context":"Proyek akhir mata kuliah Cybersecurity dengan ruang lingkup pengujian pada lingkungan terkontrol.","methods":"Reconnaissance, vulnerability assessment, dan web security testing. Mengembangkan skrip Python untuk membantu otomasi pengujian dan validasi.","outcomes":"Mengidentifikasi kerentanan terkait CSRF, CAPTCHA, session management, dan rate limiting.","featured":true,"sort_order":1},
 {"Title":"CTF — Cyber Breaker Competition Season 3","Description":"Eksplorasi keamanan web, kriptografi, reverse engineering, dan PWN melalui challenge CTF Regional Jawa.","Img":"","Link":"","Github":"","TechStack":["Python","Burp Suite","pwntools","GDB/pwndbg","IDA Pro/Ghidra","Linux"],"Features":["Menyelesaikan challenge Web, Cryptography, Reverse Engineering, dan PWN.","Menggunakan vulnerability analysis, cryptographic analysis, binary analysis, dan exploit development."],"category":"Cybersecurity","role":"Peserta · Regional Jawa","period":"Mei 2026","context":"Aktivitas Capture The Flag pada Cyber Breaker Competition Season 3, Regional Jawa.","methods":"Analisis kerentanan web, kriptografi, dan binary menggunakan Python, Burp Suite, pwntools, GDB/pwndbg, IDA Pro/Ghidra, dan Linux tools.","outcomes":"Pengalaman praktis menyelesaikan challenge lintas kategori dan mengembangkan kemampuan analisis teknis.","featured":true,"sort_order":2},
 {"Title":"Otomasi Dokumen SPK BLU & BOPTN","Description":"Skrip Python untuk mendukung pembuatan dokumen administratif dalam kegiatan magang di PUSLITPEN UIN Jakarta.","Img":"","Link":"","Github":"","TechStack":["Python","Microsoft Excel","Document Automation"],"Features":["Mengembangkan skrip Python untuk otomasi pembuatan dokumen SPK BLU dan BOPTN.","Mengelola data dan dokumen administratif menggunakan Microsoft Excel."],"category":"Automation","role":"IT Staff Intern · PUSLITPEN","period":"Januari – Juli 2026","context":"Kebutuhan pengelolaan data dan pembuatan dokumen administratif di PUSLITPEN UIN Syarif Hidayatullah Jakarta.","methods":"Mengembangkan skrip Python dan menggunakan Microsoft Excel untuk mendukung pengelolaan data serta dokumen.","outcomes":"Otomasi pembuatan dokumen SPK BLU dan BOPTN untuk mendukung pekerjaan administratif staf.","featured":true,"sort_order":3}
]$json$) p
where not exists (select 1 from public.projects existing where existing."Title" = p."Title");

-- Certificates are managed manually; keep the existing collection unchanged.

-- Correct only known legacy values, preserving later manual edits.
update public.experiences set role = 'IT Staff Intern' where id = 'uin-it-support' and role = 'Information Technology Support Specialist';
update public.experiences set company = 'PUSLITPEN, UIN Syarif Hidayatullah Jakarta' where id = 'uin-it-support' and company = 'Universitas Islam Negeri Jakarta';
update public.experiences set type = 'Internship' where id = 'uin-it-support' and type = 'Apprenticeship';
update public.experiences set role = 'Frontend Web Developer Intern' where id = 'stukka-frontend' and role = 'Frontend Developer';
update public.experiences set period = 'Nov 2025 – Feb 2026 · 4 mos' where id = 'stukka-frontend' and period = 'Oct 2025 – Feb 2026 · 5 mos';
update public.experiences set role = 'IT Team Assistant' where id = 'smk-it-assistant' and role = 'Information Technology Specialist Assistant';
update public.experiences set role = 'Network Technician Intern', type = 'Internship' where id = 'multimedia-network' and role = 'Network Engineer';
update public.experiences set role = 'Staf Divisi Akademik Development' where id = 'himti-academic' and role = 'Staff of Academic';
commit;
