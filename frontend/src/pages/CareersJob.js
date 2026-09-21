import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import Seo, { breadcrumbJsonLd, orgJsonLd } from '../components/Seo';
import { Fade, Line, Tag } from '../components/Reveal';
import { fetchPublicJob } from '../services/adminApi';

function formatDate(iso) {
    if (!iso) return '-';
    try {
        return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return iso;
    }
}

function formatSalary(job) {
    const { salaryMin, salaryMax, salaryCurrency, salaryPeriod } = job || {};
    if (salaryMin == null && salaryMax == null) return null;
    const cur = salaryCurrency || '';
    const period = salaryPeriod ? ` / ${salaryPeriod}` : '';
    if (salaryMin != null && salaryMax != null) {
        return `${cur} ${salaryMin.toLocaleString?.() ?? salaryMin} – ${salaryMax.toLocaleString?.() ?? salaryMax}${period}`.trim();
    }
    const v = salaryMin ?? salaryMax;
    return `${cur} ${v.toLocaleString?.() ?? v}${period}`.trim();
}

export default function CareersJob() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchPublicJob(slug);
                if (!cancelled) setJob(data);
            } catch (err) {
                if (!cancelled) {
                    setError(err.status === 404 ? 'Role not found.' : err.message || 'Failed to load role');
                    setJob(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    if (loading) {
        return (
            <main className="min-h-[50vh] bg-ivory flex items-center justify-center" aria-busy="true">
                <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-mute">Loading role…</p>
            </main>
        );
    }

    if (error || !job) {
        return (
            <main className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-24">
                <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-copper">{error || 'Not found'}</p>
                <Link
                    to="/careers"
                    className="inline-flex items-center gap-2 mt-6 font-mono text-[11px] tracking-[0.2em] uppercase text-graphite hover:text-copper"
                >
                    <ArrowLeft size={14} /> All careers
                </Link>
            </main>
        );
    }

    const accepting = job.acceptingApplications !== false && (job.status == null || job.status === 'published');
    const salary = formatSalary(job);
    const applyTo = `/careers?role=${encodeURIComponent(job.slug || job.id)}#apply`;

    return (
        <main id="main-content" className="overflow-x-clip bg-ivory text-graphite">
            <Seo
                title={`${job.title} | Careers | AITH`}
                description={job.blurb || `${job.title} at Asian International Trade House`}
                path={`/careers/${job.slug || slug}`}
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@graph': [
                        orgJsonLd,
                        breadcrumbJsonLd([
                            { name: 'Home', path: '/' },
                            { name: 'Careers', path: '/careers' },
                            { name: job.title, path: `/careers/${job.slug || slug}` },
                        ]),
                    ],
                }}
            />

            <section className="px-5 sm:px-6 lg:px-12 pt-16 pb-10 lg:pt-24 lg:pb-14 border-b border-graphite/10">
                <Link
                    to="/careers"
                    className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-mute hover:text-copper"
                >
                    <ArrowLeft size={12} /> Careers
                </Link>
                <div className="mt-6">
                    <Tag index="Role" label={job.team || 'Opening'} />
                </div>
                <h1 className="mt-6 text-[clamp(2rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.03em] font-extrabold max-w-4xl">
                    <Line>{job.title}</Line>
                </h1>
                <p className="mt-4 font-mono text-[11px] tracking-[0.2em] uppercase text-copper">
                    {[job.team, job.type, job.location].filter(Boolean).join(' · ')}
                </p>
                {job.postedAt ? <p className="mt-2 text-sm text-mute">Posted {formatDate(job.postedAt)}</p> : null}
                {!accepting ? (
                    <p className="mt-6 max-w-xl border border-copper/40 bg-bone/50 px-4 py-3 text-sm" role="status">
                        This role is no longer accepting applications.
                    </p>
                ) : null}
            </section>

            <section className="px-5 sm:px-6 lg:px-12 py-14 lg:py-20 max-w-4xl">
                {job.blurb ? (
                    <Fade>
                        <p className="text-lg text-mute leading-relaxed">{job.blurb}</p>
                    </Fade>
                ) : null}

                {job.descriptionMarkdown ? (
                    <Fade>
                        <div className="mt-10 whitespace-pre-wrap text-sm leading-relaxed text-graphite">
                            {job.descriptionMarkdown}
                        </div>
                    </Fade>
                ) : null}

                {(job.responsibilities?.length > 0 || job.requirements?.length > 0) && (
                    <div className="mt-12 grid sm:grid-cols-2 gap-10">
                        {job.responsibilities?.length > 0 && (
                            <Fade>
                                <p className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper mb-3">
                                    What you will do
                                </p>
                                <ul className="space-y-2">
                                    {job.responsibilities.map((item) => (
                                        <li key={item} className="flex gap-2 text-sm text-mute leading-relaxed">
                                            <span className="mt-1.5 w-1 h-1 shrink-0 bg-copper" aria-hidden />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Fade>
                        )}
                        {job.requirements?.length > 0 && (
                            <Fade>
                                <p className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper mb-3">
                                    What we look for
                                </p>
                                <ul className="space-y-2">
                                    {job.requirements.map((item) => (
                                        <li key={item} className="flex gap-2 text-sm text-mute leading-relaxed">
                                            <span className="mt-1.5 w-1 h-1 shrink-0 bg-stone" aria-hidden />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Fade>
                        )}
                    </div>
                )}

                {(salary || job.applicationDeadline) && (
                    <Fade>
                        <dl className="mt-12 grid sm:grid-cols-2 gap-6 border-t border-graphite/12 pt-8">
                            {salary ? (
                                <div>
                                    <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute">
                                        Compensation
                                    </dt>
                                    <dd className="mt-1 text-sm">{salary}</dd>
                                </div>
                            ) : null}
                            {job.applicationDeadline ? (
                                <div>
                                    <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute">
                                        Deadline
                                    </dt>
                                    <dd className="mt-1 text-sm">{formatDate(job.applicationDeadline)}</dd>
                                </div>
                            ) : null}
                        </dl>
                    </Fade>
                )}

                <div className="mt-12 flex flex-wrap gap-3">
                    {accepting ? (
                        <Link
                            to={applyTo}
                            className="inline-flex items-center gap-2 bg-copper text-ivory px-6 py-3 font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-terra transition-colors min-h-[44px]"
                            onClick={() => {
                                try {
                                    sessionStorage.setItem(
                                        'aith_career_apply',
                                        JSON.stringify({
                                            jobId: job.id,
                                            jobSlug: job.slug,
                                            jobTitle: job.title,
                                        })
                                    );
                                } catch {
                                    /* ignore */
                                }
                            }}
                        >
                            Apply <ArrowUpRight size={14} aria-hidden />
                        </Link>
                    ) : (
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 border border-graphite/25 px-6 py-3 font-mono text-[11px] tracking-[0.2em] uppercase text-mute cursor-not-allowed"
                            disabled
                        >
                            Applications closed
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate('/careers')}
                        className="inline-flex items-center gap-2 border border-graphite/25 px-6 py-3 font-mono text-[11px] tracking-[0.2em] uppercase hover:border-copper hover:text-copper transition-colors"
                    >
                        All roles
                    </button>
                </div>
            </section>
        </main>
    );
}
