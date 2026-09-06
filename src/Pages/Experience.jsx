import { ArrowUpRight, BriefcaseBusiness, CalendarDays, MapPin, FileText, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const linkStyle = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400";

export default function Experience() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const toggleExperience = (id) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    let active = true;
    let requestId = 0;
    const fetchExperiences = async () => {
      const id = ++requestId;
      try {
        const { data, error: fetchError } = await supabase
          .from("experiences")
          .select("id, role, company, period, location, type, current, summary, highlights, technologies, sort_order")
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true });
        if (!active || id !== requestId) return;
        if (fetchError) throw fetchError;
        setExperiences(data ?? []);
        setError(false);
      } catch {
        if (active && id === requestId) setError(true);
      } finally {
        if (active && id === requestId) setLoading(false);
      }
    };

    fetchExperiences();
    const channel = supabase.channel("work-experiences")
      .on("postgres_changes", { event: "*", schema: "public", table: "experiences" }, fetchExperiences)
      .subscribe((status) => {
        // Refresh after connection/reconnection to include changes made while offline.
        if (status === "SUBSCRIBED") fetchExperiences();
      });
    // Also recover if the websocket is temporarily unavailable.
    const interval = window.setInterval(fetchExperiences, 30000);
    window.addEventListener("online", fetchExperiences);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("online", fetchExperiences);
      supabase.removeChannel(channel);
    };
  }, [retry]);

  return (
    <section id="Experience" aria-labelledby="experience-heading" className="relative scroll-mt-24 px-[5%] pb-20 text-white lg:px-[10%]">
      <div className="mx-auto w-full">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-xs font-medium uppercase tracking-widest text-purple-300">
            <BriefcaseBusiness size={15} aria-hidden="true" /> Career journey
          </p>
          <h2 id="experience-heading" className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-5xl">Work Experience</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
            Perjalanan profesional saya, kontribusi dalam tim, dan pengalaman membangun solusi digital.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <aside>
            <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6 backdrop-blur-lg sm:flex sm:items-center sm:gap-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300"><BriefcaseBusiness aria-hidden="true" /></div>
              <div className="flex-1">
              <h3 className="text-lg font-semibold">Pengalaman</h3>
              <p className="mt-3 text-3xl font-bold text-purple-300">{loading || (error && !experiences.length) ? "—" : experiences.length} <span className="text-sm font-normal text-gray-400">pengalaman</span></p>
              <p className="mt-3 text-sm leading-7 text-gray-400">Posisi, tanggung jawab, dan pencapaian yang membentuk perjalanan profesional saya.</p>
              </div>
              <a href="https://drive.google.com/file/d/11HebYkDMwGVuIcWoYP3eMo5yowR7mvwv/view?usp=sharing" target="_blank" rel="noopener noreferrer" className={`${linkStyle} mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 sm:mt-0 sm:w-auto sm:shrink-0`}>
                <FileText size={16} aria-hidden="true" /> Lihat CV <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </aside>

          <section aria-label="Riwayat pekerjaan" aria-busy={loading} className="min-w-0">
            {error && <div role="alert" className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-amber-200">
              <p>Pengalaman belum berhasil diperbarui. Silakan coba lagi.</p>
              <button type="button" onClick={() => setRetry((value) => value + 1)} className={`${linkStyle} mt-3 border border-amber-400/30`}>Coba lagi</button>
            </div>}
            {loading ? (
              <p role="status" className="rounded-2xl border border-white/10 bg-gray-900/50 p-8 text-center text-gray-400">Memuat pengalaman...</p>
            ) : experiences.length === 0 && !error ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-purple-400/25 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-8 text-center sm:p-12">
                <BriefcaseBusiness className="mb-5 h-10 w-10 text-purple-300" aria-hidden="true" />
                <h2 className="text-xl font-semibold">Riwayat pekerjaan segera hadir</h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-gray-400">Detail pengalaman kerja belum ditambahkan. Anda dapat melihat CV untuk mengenal latar belakang saya lebih lanjut.</p>
              </div>
            ) : (
              <ol className="grid grid-cols-1 gap-6">
                {experiences.map((experience) => {
                  const expanded = expandedIds.has(experience.id);
                  const hasDetails = Boolean(experience.summary || experience.highlights?.length || experience.technologies?.length);
                  const detailsId = `experience-details-${experience.id}`;
                  return (
                  <li key={experience.id} className="relative">
                    <article className="rounded-2xl border border-white/10 bg-gray-900/50 p-6 backdrop-blur-lg transition-colors hover:border-purple-400/40 sm:p-8">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-purple-200">
                        {experience.type && <span className="rounded-full bg-purple-400/10 px-3 py-1">{experience.type}</span>}
                        {experience.current && <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300">Saat ini</span>}
                      </div>
                      <h3 className="mt-4 break-words text-xl font-semibold sm:text-2xl">{experience.role}</h3>
                      <p className="mt-2 break-words font-medium text-purple-300">{experience.company}</p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
                        <span className="inline-flex items-center gap-2"><CalendarDays size={15} aria-hidden="true" />{experience.period}</span>
                        {experience.location && <span className="inline-flex items-center gap-2"><MapPin size={15} aria-hidden="true" />{experience.location}</span>}
                      </div>
                      <div className={hasDetails && !expanded ? "mt-5 lg:flex lg:items-center lg:gap-6" : ""}>
                      {hasDetails && !expanded && (
                        <p className="min-w-0 line-clamp-2 break-words text-sm leading-7 text-gray-400 lg:flex-1">
                          {experience.summary || experience.highlights?.[0] || "Lihat keterampilan yang digunakan dalam pengalaman ini."}
                        </p>
                      )}
                      <div id={detailsId} hidden={!expanded} className="break-words">
                      {experience.summary && <p className="mt-6 whitespace-pre-line text-sm leading-7 text-gray-300">{experience.summary}</p>}
                      {experience.highlights?.length > 0 && <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-gray-300 marker:text-purple-400">{experience.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>}
                      {experience.technologies?.length > 0 && <ul aria-label="Technologies" className="mt-6 flex flex-wrap gap-2">{experience.technologies.map((technology) => <li key={technology} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">{technology}</li>)}</ul>}
                      </div>
                      {hasDetails && (
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={detailsId}
                          onClick={() => toggleExperience(experience.id)}
                          className={`mt-5 inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:from-indigo-600 hover:to-purple-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400 sm:w-auto ${!expanded ? "lg:mt-0" : ""}`}
                        >
                          {expanded ? "Show Less" : "Show More"}
                          <span className="sr-only"> — {experience.role} at {experience.company}</span>
                          <ChevronDown size={16} aria-hidden="true" className={`transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} />
                        </button>
                      )}
                      </div>
                    </article>
                  </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
