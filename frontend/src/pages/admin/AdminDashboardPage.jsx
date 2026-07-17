import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats, getQuestions, addQuestion, deleteQuestion, updateQuestion } from "../../api/adminDashboardApi";
import { getProducts, saveProduct, deleteProduct } from "../../api/adminProductsApi";
import AdminUsersPage from "./AdminUsersPage";
import AdminLogsPage from "./AdminLogsPage";
import AdminSettingsPage from "./AdminSettingsPage";
import logo from "../../assets/logo.png";
import "../../styles/admin-dashboard.css";
import toast from "react-hot-toast";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Product Form State
  const [addingProduct, setAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: "", name: "", description: "", bestFor: "", color: "#5B5FEF", advantages: "", disadvantages: ""
  });

  // New Question Form State
  const [newSection, setNewSection] = useState(1);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState("checkbox");
  const [newOptions, setNewOptions] = useState([{ id: "", label: "", scores: {} }]);
  const [addingQuestion, setAddingQuestion] = useState(false);



  // Matrix state — keyed by questionId → optId → productId (stable, never uses array index)
  const [matrixLocal, setMatrixLocal]   = useState({});
  const [matrixDirty, setMatrixDirty]   = useState(false);
  const [savingMatrix, setSavingMatrix] = useState(false);

  const PRODUCTS_LIST = products.map(p => p.id);

  const handleSignOut = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminRole");
    navigate("/admin159357/login");
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Session timeout (30 minutes of inactivity)
  useEffect(() => {
    let timeoutId;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        toast("Session expired due to inactivity.");
        handleSignOut();
      }, 30 * 60 * 1000); // 30 minutes
    };

    resetTimer();

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetTimer));

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, qRes, prodRes] = await Promise.all([
        getAdminStats(),
        getQuestions(),
        getProducts(),
      ]);
      setStats(statsRes.data);
      const qs = qRes.data.questions || [];
      const ps = prodRes.data.products || [];
      setQuestions(qs);
      setProducts(ps);
      // Initialise local matrix state from fresh data
      initMatrixLocal(qs, ps);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError("Failed to load dashboard data. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Build a stable deep copy of all scores keyed by questionId → optId → prodId
  const initMatrixLocal = (qs, ps) => {
    const prodIds = ps.map(p => p.id);
    const local = {};
    qs.forEach(q => {
      if (!q.options) return;
      local[q.id] = {};
      q.options.forEach(opt => {
        const key = opt.id || opt.label;
        local[q.id][key] = {};
        prodIds.forEach(prod => {
          local[q.id][key][prod] = opt.scores?.[prod] ?? "";
        });
      });
    });
    setMatrixLocal(local);
    setMatrixDirty(false);
  };

  const handleAddOption = () => {
    setNewOptions([...newOptions, { id: "", label: "", scores: {} }]);
  };

  const handleOptionChange = (index, field, value) => {
    const updated = [...newOptions];
    updated[index][field] = value;
    setNewOptions(updated);
  };



  const handleRemoveOption = (index) => {
    const updated = newOptions.filter((_, i) => i !== index);
    setNewOptions(updated);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newText.trim()) {
      toast.error("Question text is required");
      return;
    }
    
    let processedOptions = [];
    if (newType === "checkbox" || newType === "radio" || newType === "rating") {
      processedOptions = newOptions.map((opt, idx) => {
        let optId = opt.id?.trim();
        if (!optId && opt.label?.trim()) {
          optId = opt.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
          if (!optId) optId = `opt_${idx}`;
        }
        return { ...opt, id: optId };
      });

      if (processedOptions.some(o => !o.id || !o.label?.trim())) {
        toast.error("All options must have a Label.");
        return;
      }

      // Removed requirement for questions to have credit points upon creation.
    }

    try {
      setAddingQuestion(true);
      const qData = {
        section: newSection,
        sectionTitle: newSectionTitle,
        text: newText,
        type: newType,
        options: processedOptions,
      };
      await addQuestion(qData);
      toast.success("Question added successfully!");
      setNewText("");
      setNewOptions([{ id: "", label: "", scores: {} }]);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add question");
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(id);
      toast.success("Question deleted");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete question");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.id.trim() || !newProduct.name.trim()) {
      toast.error("Product ID and Name are required");
      return;
    }
    
    try {
      setAddingProduct(true);
      const payload = {
        ...newProduct,
        id: newProduct.id.toLowerCase().replace(/[^a-z0-9]+/g, ''),
        bestFor: newProduct.bestFor.split(',').map(s => s.trim()).filter(Boolean),
        advantages: newProduct.advantages.split('\n').map(s => s.trim()).filter(Boolean),
        disadvantages: newProduct.disadvantages.split('\n').map(s => s.trim()).filter(Boolean),
      };

      await saveProduct(payload);
      toast.success("Product saved successfully!");
      setNewProduct({ id: "", name: "", description: "", bestFor: "", color: "#5B5FEF", advantages: "", disadvantages: "" });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };



  const handleMatrixScoreChange = (questionId, optKey, product, value) => {
    let numVal = value;
    if (value !== "") {
      let n = Number(value);
      if (isNaN(n)) n = 0;
      if (n > 10)  n = 10;
      if (n < -10) n = -10;
      numVal = n;
    }
    setMatrixLocal(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [optKey]: {
          ...(prev[questionId]?.[optKey] || {}),
          [product]: numVal,
        }
      }
    }));
    setMatrixDirty(true);
  };

  const handleSaveMatrix = async () => {
    if (!matrixDirty) return toast.info("No changes to save.");
    try {
      setSavingMatrix(true);
      let saved = 0;
      for (const q of questions) {
        if (!matrixLocal[q.id] || !q.options) continue;
        
        let hasChanges = false;
        const updatedOptions = q.options.map(opt => {
          const key    = opt.id || opt.label;
          const edited = matrixLocal[q.id][key];
          if (!edited) return opt;
          
          const newScores = { ...opt.scores };
          let optChanged = false;
          PRODUCTS_LIST.forEach(prod => {
            const v = edited[prod];
            if (v === "" || v === undefined) {
              if (newScores[prod] !== undefined) {
                 delete newScores[prod];
                 optChanged = true;
              }
            } else {
              if (newScores[prod] !== Number(v)) {
                 newScores[prod] = Number(v);
                 optChanged = true;
              }
            }
          });
          
          if (optChanged) hasChanges = true;
          return { ...opt, scores: newScores };
        });
        
        if (hasChanges) {
          await updateQuestion(q.id, { options: updatedOptions });
          saved++;
        }
      }
      
      if (saved > 0) {
        toast.success(`Saved changes for ${saved} question(s)!`);
      } else {
        toast.info("No changes detected to save.");
      }
      setMatrixDirty(false);
      fetchData();
    } catch (err) {
      console.error("Matrix save error:", err);
      toast.error("Failed to save matrix changes");
    } finally {
      setSavingMatrix(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0", background: "var(--bg)", height: "100vh", color: "var(--text-muted)" }}>
        <p>Loading dashboard analytics...</p>
      </div>
    );
  }

  const totalIdentities = (stats?.totalUsers || 0) + (stats?.totalAdmins || 0);

  const getCrumbLabel = () => {
    switch (activeTab) {
      case 'overview': return 'Overview';
      case 'products': return 'Product Portfolio';
      case 'scoring': return 'Scoring Matrix';
      case 'questionnaire': return 'Questionnaire';
      case 'users': return 'Users & Admins';
      case 'logs': return 'Activity Logs';
      case 'settings': return 'Settings';
      default: return 'Overview';
    }
  };

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <img src={logo} alt="IAMverse" className="brand-logo-img" />
          <div className="brand-text">
            <div className="eyebrow">IAMverse</div>
            <div className="name">Control Center</div>
          </div>
        </div>

        <div className="nav-group-label">Monitor</div>
        <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h4l2 8 4-16 2 8h6"/></svg>
          Overview
        </div>

        <div className="nav-group-label">Recommendation Engine</div>
        <div className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
          Product Portfolio <span className="badge">{products.length}</span>
        </div>
        <div className={`nav-item ${activeTab === 'scoring' ? 'active' : ''}`} onClick={() => setActiveTab('scoring')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>
          Scoring Matrix
        </div>
        <div className={`nav-item ${activeTab === 'questionnaire' ? 'active' : ''}`} onClick={() => setActiveTab('questionnaire')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Questionnaire <span className="badge">{questions.length}</span>
        </div>

        <div className="nav-group-label">Administration</div>
        <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          Users &amp; Admins
        </div>
        <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h6M9 11h6"/></svg>
          Activity Logs
        </div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path></svg>
          Settings
        </div>

        <div className="sidebar-footer">
          <div className="profile-chip">
            <div className="profile-avatar">{localStorage.getItem("adminName")?.charAt(0) || "A"}</div>
            <div>
              <div className="profile-name">{localStorage.getItem("adminName") || "Admin"}</div>
              <div className="profile-role">Admin</div>
            </div>
          </div>
          <button className="signout" onClick={handleSignOut}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main">
        <div className="topbar">
          <div className="crumb">IAMverse &nbsp;/&nbsp; <b>{getCrumbLabel()}</b></div>
          <div className="topbar-right">
          </div>
        </div>

        <div className="content">
          {error && <div className="tip" style={{background: 'var(--danger-soft)', color: 'var(--danger)', borderColor: 'var(--danger-soft)', marginBottom: '20px'}}>{error}</div>}

          {/* ===== OVERVIEW ===== */}
          {activeTab === 'overview' && (
            <div className="view active">
              <div className="page-head">
                <h1>Overview</h1>
                <p>Monitor security parameters and manage questionnaire configurations.</p>
              </div>

              <div className="stats-row">
                <div className="stat-card">
                  <div>
                    <div className="stat-label">Total Identities</div>
                    <div className="stat-value">{totalIdentities}</div>
                    <div className="stat-sub">{stats?.totalUsers || 0} members · {stats?.totalAdmins || 0} admins</div>
                  </div>
                  <svg className="gauge" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="21" fill="none" stroke="#232838" strokeWidth="5"/>
                    <circle cx="26" cy="26" r="21" fill="none" stroke="#5B5FEF" strokeWidth="5" strokeLinecap="round" strokeDasharray="132" strokeDashoffset={totalIdentities > 0 ? 132 - (132 * 0.8) : 132} transform="rotate(-90 26 26)"/>
                    <text x="26" y="30" textAnchor="middle" fill="#8891A5" fontSize="9" fontFamily="JetBrains Mono">{totalIdentities > 0 ? '80%' : '0%'}</text>
                  </svg>
                </div>
                <div className="stat-card">
                  <div>
                    <div className="stat-label">Active Questions</div>
                    <div className="stat-value">{questions.length}</div>
                    <div className="stat-sub">across questionnaire sections</div>
                  </div>
                  <svg className="gauge" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="21" fill="none" stroke="#232838" strokeWidth="5"/>
                    <circle cx="26" cy="26" r="21" fill="none" stroke="#29D8D8" strokeWidth="5" strokeLinecap="round" strokeDasharray="132" strokeDashoffset={questions.length > 0 ? 132 - (132 * 0.92) : 132} transform="rotate(-90 26 26)"/>
                    <text x="26" y="30" textAnchor="middle" fill="#8891A5" fontSize="9" fontFamily="JetBrains Mono">{questions.length > 0 ? '92%' : '0%'}</text>
                  </svg>
                </div>
                <div className="stat-card">
                  <div>
                    <div className="stat-label">Products Mapped</div>
                    <div className="stat-value">{products.length}</div>
                    <div className="stat-sub">active in recommendation engine</div>
                  </div>
                  <svg className="gauge" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="21" fill="none" stroke="#232838" strokeWidth="5"/>
                    <circle cx="26" cy="26" r="21" fill="none" stroke="#E8A23D" strokeWidth="5" strokeLinecap="round" strokeDasharray="132" strokeDashoffset={products.length > 0 ? 132 - (132 * 0.6) : 132} transform="rotate(-90 26 26)"/>
                    <text x="26" y="30" textAnchor="middle" fill="#8891A5" fontSize="9" fontFamily="JetBrains Mono">{products.length > 0 ? '60%' : '0%'}</text>
                  </svg>
                </div>
                <div className="stat-card">
                  <div>
                    <div className="stat-label">Assessments Run</div>
                    <div className="stat-value">218</div>
                    <div className="stat-sub">+34 this week</div>
                  </div>
                  <svg className="gauge" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="21" fill="none" stroke="#232838" strokeWidth="5"/>
                    <circle cx="26" cy="26" r="21" fill="none" stroke="#3ECF8E" strokeWidth="5" strokeLinecap="round" strokeDasharray="132" strokeDashoffset="18" transform="rotate(-90 26 26)"/>
                    <text x="26" y="30" textAnchor="middle" fill="#8891A5" fontSize="9" fontFamily="JetBrains Mono">86%</text>
                  </svg>
                </div>
              </div>

              <div className="two-col">
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B5FEF" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                        Admin Guide
                      </div>
                      <div className="panel-desc">How to configure assessment questions</div>
                    </div>
                  </div>
                  <div className="steps">
                    <div className="step">
                      <div className="step-num"></div>
                      <div>
                        <div className="step-title">Basic details</div>
                        <div className="step-body"><code>Section</code> groups related questions. <code>Section Title</code> is the display name. <code>Type</code> sets how users answer — Radio, Checkbox, or Rating.</div>
                      </div>
                    </div>
                    <div className="step">
                      <div className="step-num"></div>
                      <div>
                        <div className="step-title">Configuring options</div>
                        <div className="step-body"><code>Option Label</code> is the text shown to the user. <code>Option ID</code> can stay blank — a clean ID is generated automatically unless you need custom tracking.</div>
                      </div>
                    </div>
                    <div className="step">
                      <div className="step-num"></div>
                      <div>
                        <div className="step-title">Product scoring</div>
                        <div className="step-body">Every option lists all IAM products. Enter points to add to a product's score when that option is selected. Leave blank if it doesn't apply.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#29D8D8" strokeWidth="2"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
                        Scoring engine
                      </div>
                      <div className="panel-desc">How selections translate to recommendations</div>
                    </div>
                  </div>
                  <p style={{fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.7', marginTop: 0}}>
                    Each answer option carries a point value per product. When an identity completes the assessment, points accumulate across all sections — the highest-scoring products surface as the top recommendation.
                  </p>
                  {/* <div className="tip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z"/></svg>
                    <div><b>Pro tip —</b> use negative scores (e.g. −10) when an answer actively disqualifies or poorly fits a product.</div>
                  </div> */}
                </div>
              </div>
            </div>
          )}

          {/* ===== PRODUCTS ===== */}
          {activeTab === 'products' && (
            <div className="view active">
              <div className="page-head">
                <h1>Product Portfolio</h1>
                <p>Add and manage products available to the recommendation engine.</p>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <div className="panel-title">Add new product</div>
                </div>
                <form onSubmit={handleAddProduct}>
                  <div className="row-3">
                    <div className="field">
                      <label>Product ID</label>
                      <input value={newProduct.id} onChange={e => setNewProduct({...newProduct, id: e.target.value})} placeholder="e.g. zscaler" required />
                    </div>
                    <div className="field">
                      <label>Display name</label>
                      <input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Zscaler Private Access" required />
                    </div>
                    <div className="field">
                      <label>Brand color</label>
                      <div className="swatch-row">
                        <div className="swatch" style={{background: newProduct.color}}></div>
                        <input type="color" value={newProduct.color} onChange={e => setNewProduct({...newProduct, color: e.target.value})} style={{padding: '0 4px', height: '38px', fontFamily: "'JetBrains Mono'", fontSize: '12px'}} />
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <label>Description</label>
                    <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="A short marketing description…" required></textarea>
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label>Best for <span style={{fontWeight: 400, color: 'var(--text-dim)'}}>(comma-separated tags)</span></label>
                      <input value={newProduct.bestFor} onChange={e => setNewProduct({...newProduct, bestFor: e.target.value})} placeholder="e.g. Zero Trust, Cloud Native" required />
                      {newProduct.bestFor && (
                        <div style={{marginTop: '6px'}}>
                          {newProduct.bestFor.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, i) => (
                            <span key={i} className="tag-chip">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label>Advantages <span style={{fontWeight: 400, color: 'var(--text-dim)'}}>(one per line)</span></label>
                      <textarea value={newProduct.advantages} onChange={e => setNewProduct({...newProduct, advantages: e.target.value})} placeholder="Advantage 1&#10;Advantage 2" required></textarea>
                    </div>
                    <div className="field">
                      <label>Disadvantages <span style={{fontWeight: 400, color: 'var(--text-dim)'}}>(one per line)</span></label>
                      <textarea value={newProduct.disadvantages} onChange={e => setNewProduct({...newProduct, disadvantages: e.target.value})} placeholder="Disadvantage 1&#10;Disadvantage 2" required></textarea>
                    </div>
                  </div>
                  <button type="submit" disabled={addingProduct} className="btn btn-primary btn-block">
                    {addingProduct ? "Saving..." : "Save Product"}
                  </button>
                </form>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Available products</div>
                    <div className="panel-desc">{products.length} products mapped to the scoring engine</div>
                  </div>
                </div>
                <div className="provider-grid">
                  {products.map(p => (
                    <div key={p.id} className="provider-card" style={{"--accent": p.color}}>
                      <div className="provider-name">{p.name}</div>
                      <div className="provider-id">ID · {p.id}</div>
                      <div className="provider-foot">
                        <button onClick={() => handleDeleteProduct(p.id)} className="link-danger">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== SCORING MATRIX ===== */}
          {activeTab === 'scoring' && (
            <div className="view active">
              <div className="page-head">
                <h1>Scoring Matrix</h1>
                <p>Edit credit points per option per product. Changes are applied per-option and saved in bulk.</p>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Question × Product credits</div>
                    <div className="panel-desc">
                      {matrixDirty
                        ? <span style={{color:'var(--amber)'}}>⚠ Unsaved changes</span>
                        : <span style={{color:'var(--success)'}}>✓ All changes saved</span>}
                    </div>
                  </div>
                  <button
                    onClick={handleSaveMatrix}
                    disabled={savingMatrix || !matrixDirty}
                    className="btn btn-primary btn-sm"
                  >
                    {savingMatrix ? "Saving..." : "Save All Changes"}
                  </button>
                </div>

                {questions.length === 0 ? (
                  <p style={{color:'var(--text-dim)', padding:'2rem 0', textAlign:'center'}}>No questions found. Add questions in the Questionnaire tab first.</p>
                ) : (
                  <div className="table-wrap" style={{maxHeight: "600px", overflowY: "auto"}}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{minWidth:"280px", position:'sticky', left:0, background:'var(--surface-2)', zIndex:2}}>Question &amp; Option</th>
                          {PRODUCTS_LIST.map(prod => (
                            <th key={prod} style={{minWidth:'80px', textAlign:'center'}}>{prod.toUpperCase()}</th>
                          ))}
                        </tr>
                      </thead>
                      {questions.map(q => {
                        if (!q.options || q.options.length === 0) return null;
                        return (
                          <tbody key={q.id}>
                            <tr>
                              <td colSpan={PRODUCTS_LIST.length + 1} style={{ background: 'var(--surface-2)', fontWeight: '600', padding: '12px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)' }}>
                                <div style={{position: 'sticky', left: '16px'}}>
                                  <span className="section-tag" style={{marginRight: '8px'}}>S{q.section}</span> {q.text}
                                </div>
                              </td>
                            </tr>
                            {q.options.map((opt, optIdx) => {
                              const optKey = opt.id || opt.label;
                              return (
                                <tr key={`${q.id}-${optKey}`}>
                                  <td className="q-cell" style={{position:'sticky', left:0, background:'var(--surface)', zIndex:1, paddingLeft: '32px'}}>
                                    <div className="q-opt">↳ {opt.label}</div>
                                  </td>
                                  {PRODUCTS_LIST.map(prod => {
                                    const val = matrixLocal[q.id]?.[optKey]?.[prod] ?? "";
                                    const isFilled = val !== "" && val !== 0;
                                    return (
                                      <td key={prod} style={{textAlign:'center'}}>
                                        <input
                                          type="number"
                                          min="-10" max="10" step="1"
                                          className={`score-input ${isFilled ? 'filled' : ''}`}
                                          placeholder="-"
                                          value={val}
                                          onChange={(e) => handleMatrixScoreChange(q.id, optKey, prod, e.target.value)}
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        );
                      })}
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== QUESTIONNAIRE ===== */}
          {activeTab === 'questionnaire' && (
            <div className="view active">
              <div className="page-head">
                <h1>Questionnaire Management</h1>
                <p>Add or remove questions from the assessment.</p>
              </div>

              <div className="panel">
                <div className="panel-head"><div className="panel-title">Add new question</div></div>
                <form onSubmit={handleAddQuestion}>
                  <div className="row-2">
                    <div className="field">
                      <label>Section number</label>
                      <select value={newSection} onChange={e => setNewSection(Number(e.target.value))} required>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                        <option value={10}>10</option>
                        <option value={11}>11</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Section title</label>
                      <select value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} required>
                        <option value="">-- Select Section Title --</option>
                        <option value="Organization Profile">Organization Profile</option>
                        <option value="Identity Management">Identity Management</option>
                        <option value="Access Management & Governance">Access Management & Governance</option>
                        <option value="Directory Services">Directory Services</option>
                        <option value="Privileged Access Management (PAM)">Privileged Access Management (PAM)</option>
                        <option value="Compliance & Regulatory">Compliance & Regulatory</option>
                        <option value="Deployment & Infrastructure">Deployment & Infrastructure</option>
                        <option value="Zero Trust & Security Architecture">Zero Trust & Security Architecture</option>
                        <option value="AI & Automation Capabilities">AI & Automation Capabilities</option>
                        <option value="Vendor & Commercial Considerations">Vendor & Commercial Considerations</option>
                        <option value="Product Preference & Scoring">Product Preference & Scoring</option>
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label>Question text</label>
                    <input value={newText} onChange={e => setNewText(e.target.value)} placeholder="e.g. What type of organization are you?" required />
                  </div>
                  <div className="field">
                    <label>Question type</label>
                    <select value={newType} onChange={e => setNewType(e.target.value)}>
                      <option value="checkbox">Checkbox (Multiple choice)</option>
                      <option value="radio">Radio (Single choice)</option>
                      <option value="rating">Rating</option>
                    </select>
                  </div>
                  
                  <div className="field">
                    <label>Options</label>
                    {newOptions.map((opt, i) => (
                      <div key={i} style={{background: 'var(--surface-2)', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border)'}}>
                        <div style={{display: 'flex', gap: '10px'}}>
                          <input value={opt.label} onChange={e => handleOptionChange(i, 'label', e.target.value)} placeholder="Option label (e.g. Startup)" style={{flex: 1}} required />
                          {newOptions.length > 1 && (
                            <button type="button" onClick={() => handleRemoveOption(i)} className="btn btn-ghost btn-sm" style={{color: 'var(--danger)'}}>X</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{display: "flex", gap: "10px"}}>
                    <button type="button" onClick={handleAddOption} className="btn btn-ghost">+ Add Option</button>
                    <button type="submit" disabled={addingQuestion} className="btn btn-primary" style={{flex: 1}}>
                      {addingQuestion ? "Saving..." : "Save Question"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Current questions</div>
                    <div className="panel-desc">{questions.length} total across sections</div>
                  </div>
                </div>
                <div>
                  {questions.map((q) => (
                    <div key={q.id} style={{marginBottom: '10px'}}>
                      <div className="q-list-item">
                        <div>
                          <div className="q-meta">
                            <span className="section-tag">Sec {q.section}</span>
                            <span className="sep">·</span>
                            <span className={`pill ${q.type === 'radio' ? 'pill-radio' : 'pill-checkbox'}`}>{q.type}</span>
                            <span className="sep">·</span>
                            <span>ID: {q.id}</span>
                          </div>
                          <div className="q-list-title">{q.number}. {q.text}</div>
                        </div>
                        <div className="q-actions">
                              <button onClick={() => handleDeleteQuestion(q.id)} className="icon-action danger">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>
                              </button>
                        </div>
                      </div>
                      

                    </div>
                  ))}
                  {questions.length === 0 && <p style={{color: 'var(--text-muted)'}}>No questions available.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ===== USERS ===== */}
          {activeTab === 'users' && (
            <div className="view active">
              <AdminUsersPage />
            </div>
          )}

          {/* ===== LOGS ===== */}
          {activeTab === 'logs' && (
            <div className="view active">
              <AdminLogsPage />
            </div>
          )}
          
          {/* ===== SETTINGS ===== */}
          {activeTab === 'settings' && (
            <div className="view active">
              <AdminSettingsPage />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
