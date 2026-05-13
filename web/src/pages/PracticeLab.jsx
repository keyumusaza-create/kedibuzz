import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

export default function PracticeLab() {
  const [html, setHtml] = useState('<section class="hero">\\n  <h1>Build a cleaner developer landing page</h1>\\n  <p>Use semantic HTML, responsive CSS, and a touch of interaction.</p>\\n  <button>Launch Project</button>\\n</section>')
  const [css, setCss] = useState(':root { color-scheme: light; }\\nbody { font-family: Arial, sans-serif; margin: 0; padding: 2rem; background: linear-gradient(180deg, #eff6ff 0%, #fff7ed 100%); }\\n.hero { max-width: 640px; margin: 3rem auto; padding: 2rem; border-radius: 24px; background: white; box-shadow: 0 20px 45px rgba(15,23,42,0.08); }\\nh1 { color: #0f172a; }\\nbutton { background: linear-gradient(90deg, #1d4ed8, #f59e0b); color: white; border: none; padding: 0.9rem 1.2rem; border-radius: 999px; font-weight: 700; }')
  const [js, setJs] = useState("document.querySelector('button')?.addEventListener('click', () => alert('Nice. Keep iterating.'));")
  const [srcDoc, setSrcDoc] = useState('')

  useEffect(() => {
    setSrcDoc(`<html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`)
  }, [html, css, js])

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #f59e0b 130%)', color: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 18px 40px rgba(15,23,42,0.14)' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.8rem', fontWeight: 800, color: '#bfdbfe', marginBottom: '0.45rem' }}>Practice Lab</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, fontWeight: 900, marginBottom: '0.75rem' }}>Experiment, prototype, and refine practical code.</h1>
          <p style={{ color: 'rgba(255,255,255,0.84)', lineHeight: 1.65, maxWidth: 720 }}>Use the live editor to test layout ideas, practice frontend logic, and iterate quickly before you ship project work.</p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1rem' }}>
          <section style={{ background: '#fff', borderRadius: '1.5rem', padding: '1rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)', display: 'grid', gap: '0.9rem' }}>
            <Editor label="HTML" value={html} onChange={setHtml} tone="#1d4ed8" />
            <Editor label="CSS" value={css} onChange={setCss} tone="#f59e0b" />
            <Editor label="JavaScript" value={js} onChange={setJs} tone="#0f172a" />
          </section>

          <section style={{ display: 'grid', gap: '1rem', alignSelf: 'start' }}>
            <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '1rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.75rem' }}>Live Preview</h2>
              <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0', minHeight: 420 }}>
                <iframe title="practice-lab-preview" srcDoc={srcDoc} sandbox="allow-scripts" style={{ width: '100%', height: 420, border: 'none', background: '#fff' }} />
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.4rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.75rem' }}>Suggested task</h2>
              <p style={{ color: '#51657f', lineHeight: 1.6, marginBottom: '0.8rem' }}>Turn the current starter into a polished hero section with a stronger hierarchy, responsive spacing, and a secondary action.</p>
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                <Badge text="Responsive layout" />
                <Badge text="Clear CTA hierarchy" />
                <Badge text="Polished visual finish" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}

function Editor({ label, value, onChange, tone }) {
  return (
    <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <div style={{ padding: '0.7rem 0.9rem', background: '#0f172a', color: tone, fontWeight: 800 }}>{label}</div>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} spellCheck="false" style={{ width: '100%', minHeight: 150, border: 'none', outline: 'none', resize: 'vertical', padding: '1rem', fontFamily: 'Consolas, monospace', fontSize: '0.9rem', color: '#e2e8f0', background: '#111827' }} />
    </div>
  )
}

function Badge({ text }) {
  return <div style={{ padding: '0.7rem 0.9rem', borderRadius: '0.85rem', background: '#f8fbff', color: '#1d4ed8', fontWeight: 800 }}>{text}</div>
}
