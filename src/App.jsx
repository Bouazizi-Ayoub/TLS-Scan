import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  Shield, 
  UploadCloud, 
  Terminal, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Download,
  Lock,
  Wifi,
  FileCode,
  Server,
  Globe,
  Zap,
  Activity,
  Link,
  Code,
  LayoutDashboard,
  FileText,
  Search,
  Cpu,
  Layers,
  Database,
  ArrowRightCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import './App.css';

const mockProfiles = [
  {
    score: 95,
    risk: 'Low Risk',
    summary: 'Strong transport security posture. No anomalies detected.',
    securityConfig: {
      'Cleartext Allowed': 'No (base-config)',
      'Min TLS Support': '1.2 (Enforced)',
      'Security Config': 'Custom & Valid',
      'Certificate Pinning': 'Present (Valid Root)',
      'HSTS Enforced': 'Detected (Server-side)'
    },
    findings: [
      { id: 1, type: 'pass', icon: 'Shield', title: 'Network Security Config', badge: 'Secure', desc: 'Valid network_security_config.xml found with cleartext traffic disabled globally.', code: '<base-config cleartextTrafficPermitted="false" />', reco: 'Maintain current configuration.' },
      { id: 2, type: 'pass', icon: 'Lock', title: 'Certificate Pinning', badge: 'Robust', desc: 'Certificate pinning is correctly implemented for production domains.', code: '<pin digest="SHA-256">...</pin>', reco: 'Consider adding a backup pin if not already present.' },
      { id: 3, type: 'pass', icon: 'Wifi', title: 'HSTS Compliance', badge: 'Detected', desc: 'Backend endpoints respond with Strict-Transport-Security headers.', code: 'max-age=31536000; includeSubDomains', reco: 'Ensure long-term max-age is maintained.' }
    ],
    endpoints: [
      { url: 'https://api.production.com/v2', type: 'Production', port: 443, status: 'Secure', tls: 'TLS 1.3', group: 'prod' },
      { url: 'https://auth.production.com/token', type: 'Production', port: 443, status: 'Secure', tls: 'TLS 1.3', group: 'prod' },
      { url: 'https://cdn.static-assets.io/lib', type: 'Third-Party', port: 443, status: 'Secure', tls: 'TLS 1.2', group: 'static' }
    ],
    aiInsights: [
      { id: 1, title: 'Domain Clustering', desc: 'High-integrity grouping detected. All endpoints belong to verified production or static delivery clusters.', icon: 'Layers' },
      { id: 2, title: 'No Anomalies', desc: 'Zero suspicious or unknown domains identified in APK strings or traffic logs.', icon: 'Search' }
    ],
    roadmap: [
      { id: 1, priority: 'High', task: 'Migrate to TLS 1.3 only', detail: 'While TLS 1.2 is secure, moving to 1.3 only eliminates legacy cipher suites and improves handshake speed.' },
      { id: 2, priority: 'Medium', task: 'Implement Certificate Pinning for Third-Party SDKs', detail: 'Expand pinning coverage to include critical third-party analytics and payment providers.' },
      { id: 3, priority: 'Low', task: 'Automated Posture Monitoring', detail: 'Integrate TLS-Scan into the CI/CD pipeline to catch regressions in network security config before release.' }
    ]
  }
];

// Helper to extract URLs from binary data
const findEndpoints = (text) => {
  const urlRegex = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}[^\s"'>]*/g;
  return [...new Set(text.match(urlRegex) || [])];
};

export default function App() {
  const [appState, setAppState] = useState('upload');
  const [reportTab, setReportTab] = useState('overview');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanLogs, setScanLogs] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [reportData, setReportData] = useState(null);
  const [isFailed, setIsFailed] = useState(false);
  
  const terminalRef = useRef(null);
  const intervalRef = useRef(null);

  const steps = [
    { title: 'Uploading', desc: 'Sending APK to backend server' },
    { title: 'Decompiling (JADX)', desc: 'Reversing bytecode to source code' },
    { title: 'Static Analysis', desc: 'Extracting endpoints and configurations' }
  ];

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setAppState('scanning');
    setIsFailed(false);
    setScanLogs([{ msg: `Target: ${selectedFile.name}`, type: 'cmd', time: new Date().toLocaleTimeString() }]);
    
    let logInterval = null;
    try {
      setCurrentStep(0);
      setScanLogs(p => [...p, { msg: "Uploading APK to backend for decompilation...", type: 'cmd', time: new Date().toLocaleTimeString() }]);

      const formData = new FormData();
      formData.append('file', selectedFile);

      // Start the JADX processing log simulation since backend might take a while
      logInterval = setInterval(() => {
         setScanLogs(p => [...p, { msg: "JADX: Processing dex files...", type: 'info', time: new Date().toLocaleTimeString() }]);
      }, 5000);

      setCurrentStep(1);
      const response = await fetch('http://127.0.0.1:8000/api/scan', {
        method: 'POST',
        body: formData,
      });

      if (logInterval) {
        clearInterval(logInterval);
        logInterval = null;
      }

      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }

      setScanLogs(p => [...p, { msg: "Decompiling and Analyzing complete.", type: 'success', time: new Date().toLocaleTimeString() }]);
      setCurrentStep(2);

      const report = await response.json();

      setScanLogs(p => [...p, { msg: "Static Analysis complete. Parsing results...", type: 'success', time: new Date().toLocaleTimeString() }]);

      setReportData(report);
      setTimeout(() => setAppState('report'), 1000);

    } catch (error) {
      if (logInterval) {
        clearInterval(logInterval);
      }
      setIsFailed(true);
      setScanLogs(p => [...p, { msg: `Error: ${error.message}`, type: 'fail', time: new Date().toLocaleTimeString() }]);
      console.error(error);
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [scanLogs]);

  const generatePDF = () => {
    if (!reportData || !file) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Defensive Transport Audit Report', 14, 20);
    doc.setFontSize(11);
    doc.text(`Target: ${file.name} | Score: ${reportData.score}/100`, 14, 30);
    
    doc.autoTable({
      startY: 40,
      head: [['Finding', 'Impact', 'Recommendation']],
      body: reportData.findings.map(f => [f.title, f.badge, f.reco]),
    });
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Hardening Task', 'Priority', 'Detail']],
      body: reportData.roadmap.map(r => [r.task, r.priority, r.detail]),
    });

    doc.save(`TLS_Audit_Roadmap_${file.name.split('.')[0]}.pdf`);
  };

  const IconMap = { Shield, AlertTriangle, Lock, Zap, FileCode, Server, Globe, Link, Activity, Code, FileText, Search, Cpu, Layers, Database, ArrowRightCircle, Lightbulb, Target };

  return (
    <div className="app-shell animate-fade-in">
      <nav className="top-nav">
        <div className="nav-logo">
          <Shield className="logo-brand" />
          <span>Defensive TLS Audit</span>
        </div>
        {appState === 'report' && (
          <div className="nav-actions">
            <button className="nav-btn primary" onClick={generatePDF}><Download size={16} /> Export PDF Report</button>
            <button className="nav-btn" onClick={() => setAppState('upload')}><RefreshCw size={16} /> New Scan</button>
          </div>
        )}
      </nav>

      <main className="main-stage">
        {appState === 'upload' && (
          <div className="upload-hero">
            <div className="upload-card glass-panel">
              <UploadCloud size={64} className="upload-icon" />
              <h1>Transport Posture Analyzer</h1>
              <p>Perform a defensive audit of network security configurations, TLS settings, and endpoint clustering.</p>
              <div 
                className={`file-zone ${isDragging ? 'drag-active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
              >
                <input type="file" onChange={(e) => handleFile(e.target.files[0])} accept=".apk" />
                <span>Select APK to Begin Audit</span>
              </div>
            </div>
          </div>
        )}

        {appState === 'scanning' && (
          <div className="scanning-grid">
            <div className="scan-status-card glass-panel">
              <h2>{isFailed ? "Defensive Audit Failed" : "Defensive Audit in Progress..."}</h2>
              <div className="progress-list">
                {steps.map((s, idx) => (
                  <div key={idx} className={`step-item ${currentStep === idx && !isFailed ? 'active' : currentStep > idx ? 'done' : ''}`}>
                    <div className="indicator"></div>
                    <div className="step-text">
                      <h4>{s.title}</h4>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {isFailed && (
                <button className="nav-btn primary" style={{ marginTop: '2rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={() => setAppState('upload')}>
                  <RefreshCw size={16} /> Go Back / Try Again
                </button>
              )}
            </div>
            <div className="terminal-card glass-panel">
              <div className="terminal-body" ref={terminalRef}>
                {scanLogs.map((l, i) => (
                  <div key={i} className={`log-line ${l.type}`}>
                    <span className="time">[{l.time}]</span> {l.msg}
                  </div>
                ))}
                <div className="blinking-cursor"></div>
              </div>
            </div>
          </div>
        )}

        {appState === 'report' && reportData && (
          <div className="report-view">
            <aside className="report-sidebar glass-panel">
              <div className="score-widget" style={{ color: reportData.score > 70 ? '#10b981' : '#f43f5e' }}>
                <div className="score-ring"><span className="val">{reportData.score}</span></div>
                <h3>{reportData.risk} Posture</h3>
              </div>
              <nav className="report-nav">
                <button className={reportTab === 'overview' ? 'active' : ''} onClick={() => setReportTab('overview')}><LayoutDashboard size={18} /> Dashboard</button>
                <button className={reportTab === 'findings' ? 'active' : ''} onClick={() => setReportTab('findings')}><AlertTriangle size={18} /> Audit Findings</button>
                <button className={reportTab === 'endpoints' ? 'active' : ''} onClick={() => setReportTab('endpoints')}><Globe size={18} /> Endpoint Inventory</button>
                <button className={reportTab === 'ai' ? 'active' : ''} onClick={() => setReportTab('ai')}><Zap size={18} /> AI Anomaly Report</button>
                <button className={reportTab === 'roadmap' ? 'active' : ''} onClick={() => setReportTab('roadmap')}><Target size={18} /> Hardening Roadmap</button>
              </nav>
            </aside>

            <section className="report-content">
              {reportTab === 'overview' && (
                <div className="overview-pane animate-fade-in">
                  <div className="stat-grid">
                    {Object.entries(reportData.securityConfig).map(([k, v]) => (
                      <div key={k} className="stat-card glass-panel">
                        <span className="label">{k}</span>
                        <span className="value">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="ai-summary glass-panel">
                    <h3><Activity size={20} /> Executive Summary</h3>
                    <p>{reportData.summary}</p>
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                      <span className="badge pass">HSTS: {reportData.securityConfig['HSTS Enforced']}</span>
                      <span className="badge pass">TLS: {reportData.securityConfig['Min TLS Support']}</span>
                    </div>
                  </div>
                </div>
              )}

              {reportTab === 'findings' && (
                <div className="findings-pane animate-fade-in">
                  {reportData.findings.map(f => {
                    const FindingIcon = IconMap[f.icon] || Shield;
                    return (
                      <div key={f.id} className="finding-row glass-panel">
                        <div className={`status-icon ${f.type}`}><FindingIcon size={28} /></div>
                        <div className="finding-info">
                          <div className="finding-head">
                            <h4>{f.title}</h4>
                            <span className={`badge ${f.type}`}>{f.badge}</span>
                          </div>
                          <p>{f.desc}</p>
                          <div className="code-box"><code>{f.code}</code></div>
                          <div className="reco-box">
                            <strong>Recommendation:</strong> {f.reco}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {reportTab === 'endpoints' && (
                <div className="endpoints-pane animate-fade-in">
                  <div className="endpoint-grid">
                    {reportData.endpoints.map((e, i) => (
                      <div key={i} className="endpoint-card glass-panel">
                        <div className="url-row"><Link size={14} /><span>{e.url}</span></div>
                        <div className="tags-row">
                          <span className="tag">Port: {e.port}</span>
                          <span className="tag">{e.tls}</span>
                          <span className="tag">{e.type}</span>
                          <span className={`pill ${e.status.toLowerCase()}`}>{e.status}</span>
                        </div>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', opacity: 0.6 }}>
                          Cluster: {e.group.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportTab === 'ai' && (
                <div className="ai-pane animate-fade-in">
                  <div className="findings-pane">
                    {reportData.aiInsights.map(insight => {
                      const InsightIcon = IconMap[insight.icon] || Cpu;
                      return (
                        <div key={insight.id} className="finding-row glass-panel ai-card">
                          <div className="status-icon info"><InsightIcon size={32} /></div>
                          <div className="finding-info">
                            <h4>{insight.title}</h4>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>{insight.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {reportTab === 'roadmap' && (
                <div className="roadmap-pane animate-fade-in">
                  <div className="findings-pane">
                    {reportData.roadmap.map(item => (
                      <div key={item.id} className="finding-row glass-panel roadmap-card">
                        <div className="status-icon"><ArrowRightCircle size={32} /></div>
                        <div className="finding-info">
                          <div className="finding-head">
                            <h4>{item.task}</h4>
                            <span className={`badge ${item.priority.toLowerCase()}`}>{item.priority}</span>
                          </div>
                          <p style={{ fontSize: '1rem', marginTop: '0.5rem' }}>{item.detail}</p>
                        </div>
                      </div>
                    ))}
                    <div className="roadmap-tip glass-panel">
                      <Lightbulb size={24} className="tip-icon" />
                      <div>
                        <strong>Pro Tip:</strong> Integrate this audit into your CI/CD pipeline to catch transport regressions early in the development lifecycle.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
