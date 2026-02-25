import { useState, useEffect, useMemo } from "react";
import { useCollegeNotes } from "./FavoritesManager";

// ════════════════════════════════════════════════════════════════════════════
// COLLEGE METADATA DATABASE
// ════════════════════════════════════════════════════════════════════════════

const COLLEGE_META = {
  "College of Engineering, Pune": {
    slug: "coep-pune",
    fullName: "College of Engineering, Pune (COEP)",
    naac: "A++",
    nirf: 73,
    established: 1854,
    website: "https://www.coep.org.in",
    lat: 18.5289,
    lng: 73.8699,
    distanceFromCenter: 2.5,
    fees: { tuition: 65000, hostel: 25000, mess: 30000 },
    placement: {
      average: 8.5,
      highest: 42.0,
      placementRate: 95,
      recruiters: ["Microsoft", "Google", "Goldman Sachs", "JP Morgan", "Amazon", "Deloitte", "Oracle"]
    },
    about: "One of India's oldest and most prestigious engineering colleges, COEP has a rich 170-year legacy of excellence in technical education and research."
  },
  "Walchand College of Engineering, Sangli": {
    slug: "wce-sangli",
    fullName: "Walchand College of Engineering, Sangli",
    naac: "A+",
    nirf: 98,
    established: 1947,
    website: "https://www.walchandsangli.ac.in",
    lat: 16.8524,
    lng: 74.5815,
    distanceFromCenter: 1.8,
    fees: { tuition: 55000, hostel: 20000, mess: 28000 },
    placement: {
      average: 7.2,
      highest: 35.0,
      placementRate: 88,
      recruiters: ["TCS", "Infosys", "Wipro", "L&T", "Mahindra", "Cognizant"]
    },
    about: "Premier engineering institution in South Maharashtra known for strong industry connections and excellent academic standards."
  },
  "Veermata Jijabai Technological Institute, Mumbai": {
    slug: "vjti-mumbai",
    fullName: "VJTI Mumbai",
    naac: "A++",
    nirf: 62,
    established: 1887,
    website: "https://www.vjti.ac.in",
    lat: 19.0225,
    lng: 72.8544,
    distanceFromCenter: 3.2,
    fees: { tuition: 70000, hostel: 30000, mess: 35000 },
    placement: {
      average: 9.2,
      highest: 45.0,
      placementRate: 97,
      recruiters: ["Goldman Sachs", "Microsoft", "DE Shaw", "Google", "Atlassian", "Amazon"]
    },
    about: "Mumbai's premier autonomous engineering institute with excellent placement records and strong alumni network."
  },
};

// Helper function to get college meta by any identifier
function getCollegeMeta(identifier) {
  // If slug provided
  const bySlug = Object.values(COLLEGE_META).find(c => c.slug === identifier);
  if (bySlug) return bySlug;
  
  // If college name provided
  const byName = COLLEGE_META[identifier];
  return byName || null;
}

// NAAC explanation
function getNAACExplanation(grade) {
  const info = {
    "A++": { rating: "Outstanding", desc: "Top-tier institution with excellent infrastructure, world-class faculty, and exceptional placement records. Best-in-class academic environment.", color: "#059669", bg: "#ecfdf5" },
    "A+":  { rating: "Excellent", desc: "High-quality education with very good infrastructure, experienced faculty, and strong industry connections.", color: "#16a34a", bg: "#f0fdf4" },
    "A":   { rating: "Very Good", desc: "Good academic standards with decent facilities, qualified faculty, and solid placement opportunities.", color: "#ca8a04", bg: "#fefce8" },
    "B++": { rating: "Good", desc: "Satisfactory academic quality with basic facilities and moderate placement records.", color: "#ea580c", bg: "#fff7ed" },
  };
  return info[grade] || { rating: "Not Available", desc: "NAAC accreditation status not publicly available.", color: "#6b7280", bg: "#f3f4f6" };
}

// ════════════════════════════════════════════════════════════════════════════
// COLLEGE DETAIL PAGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export function CollegeDetailPage({ collegeName, allData, user, onBack }) {
  const [collegeMeta, setCollegeMeta] = useState(null);
  const [branches, setBranches] = useState([]);
  const [similarColleges, setSimilarColleges] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, branches, placements, location

  const collegeKey = `${collegeName}`.replace(/[^a-zA-Z0-9]/g, "_");
  const { notes, updateNotes, lastSaved } = useCollegeNotes(user?.id, collegeKey);

  useEffect(() => {
    // Load college metadata
    const meta = getCollegeMeta(collegeName);
    setCollegeMeta(meta);

    // Load branches from CSV data
    if (allData && allData.length > 0) {
      const collegeRows = allData.filter(row => row["College Name"] === collegeName);
      
      // Group by branch
      const branchMap = {};
      collegeRows.forEach(row => {
        const branch = row["Branch Name"];
        if (!branchMap[branch]) {
          branchMap[branch] = {
            name: branch,
            rounds: {},
            years: new Set(),
          };
        }
        
        branchMap[branch].years.add(row.Year);
        const round = row.CAP_Round;
        if (!branchMap[branch].rounds[round]) {
          branchMap[branch].rounds[round] = {};
        }
        
        // Store all category cutoffs
        ["GOPENS", "GOBCS", "GSCS", "GSTS"].forEach(cat => {
          if (row[cat] && row[cat] > 0) {
            branchMap[branch].rounds[round][cat] = row[cat];
          }
        });
      });
      
      setBranches(Object.values(branchMap));
      
      // Find similar colleges
      if (meta) {
        findSimilarColleges(meta, allData);
      }
    }
  }, [collegeName, allData]);

  const findSimilarColleges = (targetMeta, data) => {
    // Get average cutoff for this college
    const collegeRows = data.filter(r => r["College Name"] === collegeName);
    const avgCutoff = collegeRows.reduce((sum, r) => sum + (r.GOPENS || 0), 0) / collegeRows.length;
    
    // Find colleges with similar cutoffs (±5%)
    const similarMap = new Map();
    data.forEach(row => {
      if (row["College Name"] === collegeName) return;
      if (!row.GOPENS) return;
      
      const cutoffDiff = Math.abs(row.GOPENS - avgCutoff);
      if (cutoffDiff <= 5) {
        if (!similarMap.has(row["College Name"])) {
          similarMap.set(row["College Name"], {
            name: row["College Name"],
            city: row.City,
            cutoff: row.GOPENS,
            year: row.Year,
          });
        }
      }
    });
    
    setSimilarColleges(Array.from(similarMap.values()).slice(0, 6));
  };

  if (!collegeMeta) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏫</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>College Not Found</h2>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>Detailed information for this college is not available yet.</p>
        <button onClick={onBack} style={{ padding: '10px 24px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          ← Go Back
        </button>
      </div>
    );
  }

  const totalFees = collegeMeta.fees.tuition + collegeMeta.fees.hostel + collegeMeta.fees.mess;
  const naacInfo = getNAACExplanation(collegeMeta.naac);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            ← Back
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{collegeMeta.fullName}</h1>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, color: '#6b7280' }}>
              <span>📍 {branches[0]?.name}</span>
              <span>•</span>
              <span>🏛️ Est. {collegeMeta.established}</span>
              <span>•</span>
              <span>🏆 NIRF #{collegeMeta.nirf}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', gap: 8 }}>
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'branches', label: '📚 Branches & Cutoffs', icon: '📚' },
            { id: 'placements', label: '💼 Placements', icon: '💼' },
            { id: 'location', label: '📍 Location', icon: '📍' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#f3f4f6' : 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                fontSize: 14,
                fontWeight: 600,
                color: activeTab === tab.id ? '#2563eb' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: 24 }}>
            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <StatCard label="NAAC Grade" value={collegeMeta.naac} sublabel={naacInfo.rating} color={naacInfo.color} bg={naacInfo.bg} />
              <StatCard label="NIRF Rank" value={`#${collegeMeta.nirf}`} sublabel="National" color="#2563eb" bg="#dbeafe" />
              <StatCard label="Established" value={collegeMeta.established} sublabel="Years of Legacy" color="#059669" bg="#ecfdf5" />
              <StatCard label="Branches" value={branches.length} sublabel="Available" color="#7c3aed" bg="#f3e8ff" />
            </div>

            {/* About */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>About</h3>
              <p style={{ color: '#4b5563', lineHeight: 1.7 }}>{collegeMeta.about}</p>
            </div>

            {/* NAAC Info */}
            <div style={{ background: naacInfo.bg, borderRadius: 12, padding: 24, border: `1px solid ${naacInfo.color}40` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: naacInfo.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, flexShrink: 0 }}>
                  {collegeMeta.naac}
                </div>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: naacInfo.color, marginBottom: 6 }}>
                    NAAC {collegeMeta.naac} - {naacInfo.rating}
                  </h4>
                  <p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.6 }}>{naacInfo.desc}</p>
                </div>
              </div>
            </div>

            {/* Fee Structure */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Annual Fee Structure</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <FeeItem label="Tuition Fees" amount={collegeMeta.fees.tuition} />
                <FeeItem label="Hostel Fees" amount={collegeMeta.fees.hostel} />
                <FeeItem label="Mess Charges" amount={collegeMeta.fees.mess} />
                <FeeItem label="Total (Annual)" amount={totalFees} highlight />
              </div>
              <p style={{ marginTop: 16, fontSize: 12, color: '#9ca3af' }}>
                💡 Estimated fees. Actual amounts may vary. Please check official website for latest information.
              </p>
            </div>

            {/* Notes */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>My Notes</h3>
                {lastSaved && (
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>
                    Saved {formatTimeAgo(lastSaved)}
                  </span>
                )}
              </div>
              <textarea
                value={notes}
                onChange={(e) => updateNotes(e.target.value)}
                placeholder="Add your notes here... e.g., 'Visited campus - great facilities', 'Ask about scholarship options'"
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: 12,
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>All Branches & CAP Round Cutoffs</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>Branch</th>
                    <th style={{ padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#f97316' }}>CAP R1</th>
                    <th style={{ padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#8b5cf6' }}>CAP R2</th>
                    <th style={{ padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#14b8a6' }}>CAP R3</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: 12, fontSize: 14, fontWeight: 600, color: '#111827' }}>{branch.name}</td>
                      <td style={{ padding: 12, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#f97316', fontFamily: 'monospace' }}>
                        {branch.rounds[1]?.GOPENS?.toFixed(2) || '—'}
                      </td>
                      <td style={{ padding: 12, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#8b5cf6', fontFamily: 'monospace' }}>
                        {branch.rounds[2]?.GOPENS?.toFixed(2) || '—'}
                      </td>
                      <td style={{ padding: 12, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#14b8a6', fontFamily: 'monospace' }}>
                        {branch.rounds[3]?.GOPENS?.toFixed(2) || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'placements' && (
          <div style={{ display: 'grid', gap: 24 }}>
            {/* Placement Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <StatCard label="Average Package" value={`₹${collegeMeta.placement.average} LPA`} sublabel="Annual" color="#2563eb" bg="#dbeafe" />
              <StatCard label="Highest Package" value={`₹${collegeMeta.placement.highest} LPA`} sublabel="Annual" color="#059669" bg="#ecfdf5" />
              <StatCard label="Placement Rate" value={`${collegeMeta.placement.placementRate}%`} sublabel="Students Placed" color="#7c3aed" bg="#f3e8ff" />
            </div>

            {/* Top Recruiters */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Top Recruiters</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {collegeMeta.placement.recruiters.map((recruiter, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#374151',
                      textAlign: 'center',
                    }}
                  >
                    {recruiter}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div style={{ display: 'grid', gap: 24 }}>
            {/* Map */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Campus Location</h3>
              <div style={{ borderRadius: 8, overflow: 'hidden', height: 400 }}>
                <iframe
                  src={`https://www.google.com/maps?q=${collegeMeta.lat},${collegeMeta.lng}&z=15&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Location Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📍</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Distance from Center</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{collegeMeta.distanceFromCenter} km</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🌐</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Website</div>
                <a href={collegeMeta.website} target="_blank" rel="noreferrer" style={{ fontSize: 14, fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
                  Visit Website →
                </a>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Directions</div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${collegeMeta.lat},${collegeMeta.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 14, fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}
                >
                  Get Directions →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Similar Colleges */}
        {similarColleges.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Students Also Viewed</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {similarColleges.map((college, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 20,
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{college.name}</h4>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#6b7280' }}>
                    <span>📍 {college.city}</span>
                    <span>•</span>
                    <span>📊 {college.cutoff.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function StatCard({ label, value, sublabel, color, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: 20, border: `1px solid ${color}40` }}>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: 'monospace', lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af' }}>{sublabel}</div>
    </div>
  );
}

function FeeItem({ label, amount, highlight }) {
  return (
    <div style={{
      padding: 16,
      background: highlight ? '#f0f9ff' : '#f9fafb',
      borderRadius: 8,
      border: highlight ? '2px solid #2563eb' : '1px solid #e5e7eb',
    }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{label}</div>
      <div style={{
        fontSize: highlight ? 24 : 20,
        fontWeight: 900,
        color: highlight ? '#2563eb' : '#111827',
        fontFamily: 'monospace',
      }}>
        ₹{amount.toLocaleString('en-IN')}
      </div>
    </div>
  );
}

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
