"use client";

import type { PortfolioData } from "@/types/portfolio";
import { useCallback, useEffect, useRef, useState } from "react";

const SKILL_ICONS = [
  "🧠",
  "🫁",
  "📊",
  "💨",
  "👁️",
  "🔬",
  "💊",
  "🧪",
  "❤️",
  "🫀",
  "🛡️",
  "🤝",
];

const CERT_ICONS = ["🫀", "💊"];

const NAV_SECTIONS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "certifications", label: "Certifications" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
] as const;

const RESUME_HREF = "/files/karthick_raja_k_resume.pdf";
const RESUME_FILENAME = "karthick_raja_k_resume.pdf";

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return { first: name, rest: "" };
  return { first: parts[0]!, rest: parts.slice(1).join(" ") };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function formatYearRange(y: string) {
  return y.replace(/\s*-\s*/g, " – ");
}

function parseYearsExp(about: string): string {
  const m = about.match(/(\d+)\s*\+\s*years?/i);
  if (m?.[1]) return `${m[1]}+`;
  return "3+";
}

function ecgWaveform(x: number) {
  const t = x % 1;
  if (t < 0.1) return 0;
  if (t < 0.12) return t * 20;
  if (t < 0.14) return -(t - 0.12) * 30;
  if (t < 0.16) return 0.6 - (t - 0.14) * 5;
  if (t < 0.18) return (t - 0.16) * 80;
  if (t < 0.22) return 1.6 - (t - 0.18) * 30;
  if (t < 0.26) return 0.4 - (t - 0.22) * 12;
  if (t < 0.3) return -0.08 + (t - 0.26) * 2;
  return 0;
}

export default function PortfolioView({ data }: { data: PortfolioData }) {
  const { first, rest } = splitName(data.name);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const ecgWrapRef = useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [activeExp, setActiveExp] = useState(0);

  const experienceOrdered = [...data.experience].reverse();
  const yearsLabel = parseYearsExp(data.about);
  const icuSpecs = data.experience.length;
  const certCount = data.certifications.length;
  const certIssued =
    data.certifications[0]?.issuedOn?.replace(/\s+/g, " ") ?? "";
  const footerLocation =
    data.experience[data.experience.length - 1]?.location ?? "";

  const drawECG = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = ecgWrapRef.current;
    if (!canvas || !wrap) return;
    const html = document.documentElement;
    const W = wrap.clientWidth;
    const H = 80;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isDark = html.dataset.theme !== "light";
    const lineColor = isDark ? "#00e5b4" : "#00876a";
    const gridColor = isDark
      ? "rgba(0,229,180,0.08)"
      : "rgba(0,135,106,0.08)";

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    const pts = 300;
    const speed = 0.003;
    const f = frameRef.current;
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = isDark ? 6 : 0;

    for (let i = 0; i < pts; i++) {
      const x = (i / pts) * W;
      const wv = ecgWaveform((i / pts) * 2.5 + f * speed * 2.5);
      const y = H / 2 - wv * (H * 0.38);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, []);

  useEffect(() => {
    const animate = () => {
      frameRef.current++;
      drawECG();
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawECG]);

  useEffect(() => {
    const ro = new ResizeObserver(() => drawECG());
    if (ecgWrapRef.current) ro.observe(ecgWrapRef.current);
    return () => ro.disconnect();
  }, [drawECG]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".portfolio-page .reveal").forEach((el) => {
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, [data]);

  useEffect(() => {
    function randBetween(a: number, b: number) {
      return Math.floor(Math.random() * (b - a + 1)) + a;
    }
    const hr = document.getElementById("vHR");
    const spo = document.getElementById("vSPO");
    const id = window.setInterval(() => {
      if (hr) hr.textContent = String(randBetween(68, 78));
      if (spo) spo.textContent = String(randBetween(96, 99));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
    drawECG();
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setNavOpen(false);
  };

  return (
    <div className="portfolio-page">
      <nav id="mainNav">
        <div className="nav-logo">
          {first}
          <span style={{ color: "var(--text3)" }}>&nbsp;/&nbsp;</span>
          {rest}
          <span className="nav-logo-sub">RN · ICU</span>
        </div>
        <ul
          className={`nav-links${navOpen ? " open" : ""}`}
          id="navLinks"
        >
          {NAV_SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <button
                type="button"
                className="nav-scroll"
                onClick={() => scrollToSection(id)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
        <div className="theme-wrap">
          <span className="theme-icon" aria-hidden>
            🌙
          </span>
          <div
            className="theme-pill"
            id="themeToggle"
            role="button"
            tabIndex={0}
            aria-label="Toggle theme"
            onClick={toggleTheme}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleTheme();
              }
            }}
          />
          <span className="theme-icon" aria-hidden>
            ☀️
          </span>
          <button
            type="button"
            className="ham"
            id="ham"
            aria-label="Menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <section className="hero"  id="about">
        <div className="hero-mesh" />
        <div className="hero-grid" />
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">
              <div className="eyebrow-pill">
                <div className="live-dot" />
                Open to Opportunities
              </div>
            </div>
            <h1 className="hero-name">
              {first}
              <br />
              <em>{rest}</em>
            </h1>
            <div className="hero-role-bar">
              <div className="role-line" />
              <span className="hero-role-text">{data.role}</span>
            </div>
            <p className="hero-about">{data.about}</p>
            <div className="hero-cta">
              <button
                type="button"
                className="cta-primary"
                onClick={() => scrollToSection("contact")}
              >
                Get in Touch →
              </button>
              <a
                href={RESUME_HREF}
                download={RESUME_FILENAME}
                className="cta-ghost"
              >
                Download Resume
              </a>
            </div>
          </div>

          <div className="hero-monitor">
            <div className="monitor-header">
              <span className="monitor-title">Patient Monitor — ICU Unit 4</span>
              <div className="monitor-status">
                <div className="monitor-dot" />
                LIVE
              </div>
            </div>
            <div className="ecg-wrap" ref={ecgWrapRef}>
              <canvas id="ecg" ref={canvasRef} />
            </div>
            <div className="vitals-grid">
              <div className="vital-tile">
                <div className="vital-label">HR</div>
                <div className="vital-val" id="vHR">
                  72
                </div>
                <div className="vital-unit">bpm</div>
              </div>
              <div className="vital-tile">
                <div className="vital-label">SpO₂</div>
                <div className="vital-val" id="vSPO">
                  98
                </div>
                <div className="vital-unit">%</div>
              </div>
              <div className="vital-tile">
                <div className="vital-label">BP</div>
                <div
                  className="vital-val"
                  style={{ fontSize: "0.95rem" }}
                  id="vBP"
                >
                  120/80
                </div>
                <div className="vital-unit">mmHg</div>
              </div>
              <div className="vital-tile">
                <div className="vital-label">RR</div>
                <div className="vital-val" id="vRR">
                  16
                </div>
                <div className="vital-unit">br/min</div>
              </div>
              <div className="vital-tile">
                <div className="vital-label">Temp</div>
                <div className="vital-val" id="vTMP">
                  37.1
                </div>
                <div className="vital-unit">°C</div>
              </div>
              <div className="vital-tile">
                <div className="vital-label">GCS</div>
                <div className="vital-val" id="vGCS">
                  15
                </div>
                <div className="vital-unit">/15</div>
              </div>
            </div>
            <div className="profile-row">
              <div className="avatar">{initials(data.name)}</div>
              <div>
                <div className="profile-name">{data.name}</div>
                <div className="profile-role">{data.role}</div>
                <div className="profile-badges">
                  <span className="badge badge-a">ACLS</span>
                  <span className="badge badge-b">BLS</span>
                  <span className="badge badge-a">B.Sc Nursing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="about-strip">
        <div className="about-strip-inner">
          <div className="stat-block reveal">
            <div className="stat-block-icon">🏥</div>
            <div className="stat-block-num">{yearsLabel}</div>
            <div className="stat-block-label">Years Critical Care Experience</div>
          </div>
          <div className="stat-block reveal">
            <div className="stat-block-icon">🧠</div>
            <div className="stat-block-num">{icuSpecs}</div>
            <div className="stat-block-label">ICU Specialisations</div>
          </div>
          <div className="stat-block reveal">
            <div className="stat-block-icon">🎓</div>
            <div className="stat-block-num">{certCount}</div>
            <div className="stat-block-label">Active Certifications</div>
          </div>
          <div className="stat-block reveal">
            <div className="stat-block-icon">⚡</div>
            <div className="stat-block-num">ACLS</div>
            <div className="stat-block-label">
              +BLS{certIssued ? ` · ${certIssued}` : ""}
            </div>
          </div>
        </div>
      </div>

      <section className="skills-section" id="skills">
        <div className="sec-inner">
          <div className="sec-head reveal">
            <div>
              <div className="sec-label">
                <span className="sec-label-num">01 /</span> Core Competencies
              </div>
              <h2 className="sec-title">
                Clinical <em>Skills</em>
              </h2>
            </div>
          </div>
          <div className="skills-mosaic reveal">
            {data.skills.map((skill, i) => (
              <div key={skill} className="skill-block">
                <div className="skill-ico">
                  {SKILL_ICONS[i % SKILL_ICONS.length]}
                </div>
                <div className="skill-name">{skill}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="experience">
        <div className="sec-inner">
          <div className="sec-head reveal">
            <div>
              <div className="sec-label">
                <span className="sec-label-num">02 /</span> Work History
              </div>
              <h2 className="sec-title">
                Clinical <em>Experience</em>
              </h2>
            </div>
          </div>
          <div className="exp-layout">
            <div className="exp-toc">
              {experienceOrdered.map((exp, i) => (
                <div
                  key={exp.name + exp.year}
                  className={`exp-toc-item${activeExp === i ? " active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setActiveExp(i);
                    const el = document.getElementById(`exp-${i}`);
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveExp(i);
                      document
                        .getElementById(`exp-${i}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                >
                  <div className="exp-toc-dot" />
                  <div>
                    <div className="exp-toc-name">{exp.name}</div>
                    <div className="exp-toc-year">
                      {formatYearRange(exp.year)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              {experienceOrdered.map((exp, i) => (
                <div
                  className="exp-card reveal"
                  id={`exp-${i}`}
                  key={exp.name + exp.year}
                >
                  <div
                    className="exp-card-glow"
                    style={
                      i % 2 === 1
                        ? { background: "var(--glow-b)" }
                        : undefined
                    }
                  />
                  <div className="exp-top">
                    <div>
                      <div className="exp-org">{exp.name}</div>
                      <div className="exp-role">{exp.role}</div>
                    </div>
                    <div className="exp-meta">
                      <div className="exp-year">{formatYearRange(exp.year)}</div>
                      <div className="exp-loc">📍 {exp.location}</div>
                    </div>
                  </div>
                  <div className="exp-divider" />
                  <ul className="exp-resp">
                    {exp.responsibilities.map((r) => (
                      <li key={r}>
                        <span className="resp-arrow">▸</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="certs-section" id="certifications">
        <div className="sec-inner">
          <div className="sec-head reveal">
            <div>
              <div className="sec-label">
                <span className="sec-label-num">03 /</span> Professional
                Development
              </div>
              <h2 className="sec-title">
                Certifi<em>cations</em>
              </h2>
            </div>
          </div>
          <div className="certs-grid">
            {data.certifications.map((c, i) => (
              <div
                className="cert-card reveal"
                key={c.url + c.courseName}
              >
                <div className="cert-icon-wrap">
                  {CERT_ICONS[i % CERT_ICONS.length]}
                </div>
                <div>
                  <div className="cert-name">{c.courseName}</div>
                  <div className="cert-issuer">{c.issuerName}</div>
                </div>
                <div className="cert-validity">
                  <div className="cert-val-item">
                    <span className="cert-val-label">Issued</span>
                    <span className="cert-val-date">{c.issuedOn}</span>
                  </div>
                  <div className="cert-val-item">
                    <span className="cert-val-label">Expires</span>
                    <span className="cert-val-date">{c.expiresAt}</span>
                  </div>
                </div>
                <a
                  className="cert-link"
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Certificate →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="education">
        <div className="sec-inner">
          <div className="sec-head reveal">
            <div>
              <div className="sec-label">
                <span className="sec-label-num">04 /</span> Academic Background
              </div>
              <h2 className="sec-title">
                Edu<em>cation</em>
              </h2>
            </div>
          </div>
          {data.education.map((edu) => (
            <div className="edu-banner reveal" key={edu.degree + edu.year}>
              <div className="edu-badge-wrap">🎓</div>
              <div>
                <div className="edu-year-pill">{formatYearRange(edu.year)}</div>
                <div className="edu-degree">{edu.degree}</div>
                <div className="edu-uni">{edu.university}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="sec-inner">
          <div className="contact-layout">
            <div className="reveal">
              <div className="sec-label">
                <span className="sec-label-num">05 /</span> Get In Touch
              </div>
              <h2 className="contact-headline">
                Let&apos;s work
                <br />
                <em style={{ fontStyle: "italic", color: "var(--accent)" }}>
                  together
                </em>
              </h2>
              <p className="contact-sub">
                Open to roles in critical care nursing, ICU, and transplant care.
                Reach out by phone or email.
              </p>
            </div>
            <div className="contact-cards reveal">
              <div className="contact-card">
                <div className="contact-card-icon">📞</div>
                <div>
                  <div className="contact-card-label">Phone</div>
                  <div className="contact-card-val">{data.contact.phoneNo}</div>
                </div>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon">✉️</div>
                <div>
                  <div className="contact-card-label">Email</div>
                  <div className="contact-card-val">{data.contact.email}</div>
                </div>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon">📍</div>
                <div>
                  <div className="contact-card-label">Address</div>
                  <div className="contact-card-val">{data.contact.address}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-text">
          © {new Date().getFullYear()}{" "}
          <span className="footer-accent">{data.name}</span> · {data.role}
        </div>
        <div className="footer-mono">
          BSc Nursing · ACLS · BLS
          {footerLocation ? ` · ${footerLocation}` : ""}
        </div>
      </footer>
    </div>
  );
}
