import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import SignatureCanvas from 'react-signature-canvas';

const STATUS = {
  DRAFT: { label: "Draft", icon: "lucide:file-text", dark: "bg-slate-700 text-slate-300", light: "bg-slate-100 text-slate-600" },
  PENDING_OWNER_REVIEW: { label: "Awaiting Review", icon: "lucide:clock", dark: "bg-amber-500/15 text-amber-400", light: "bg-amber-100 text-amber-700" },
  REVISION_REQUIRED: { label: "Revision Sent", icon: "lucide:rotate-ccw", dark: "bg-orange-500/15 text-orange-400", light: "bg-orange-100 text-orange-700" },
  OWNER_SIGNED: { label: "Signed", icon: "lucide:check-circle", dark: "bg-green-500/15 text-green-400", light: "bg-green-100 text-green-700" },
  PENDING_TENANT_REVIEW: { label: "Sent to Tenant", icon: "lucide:send", dark: "bg-purple-500/15 text-purple-400", light: "bg-purple-100 text-purple-700" },
  TENANT_SIGNED: { label: "Fully Executed", icon: "lucide:check-circle", dark: "bg-green-500/15 text-green-400", light: "bg-green-100 text-green-700" },
};

const OwnerContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [acting, setActing] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const sigCanvas = useRef({});
  const [signMode, setSignMode] = useState('draw');
  const [uploadedSignBase64, setUploadedSignBase64] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedSignBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const token = localStorage.getItem('accessToken');
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  useEffect(() => {
    fetchContracts();

    // Mark as read
    fetch('/api/contracts/owner/mark-read', { method: 'PUT', headers }).catch(() => { });
    window.dispatchEvent(new CustomEvent('ownerContractsRead'));

    const handleNewContract = (e) => {
      setContracts(prev => {
        if (!prev.find(c => c._id === e.detail._id)) {
          return [e.detail, ...prev];
        }
        return prev;
      });
    };

    const handleTenantSigned = (e) => {
      setContracts(prev => prev.map(c => c._id === e.detail._id ? e.detail : c));
      setSelected(prev => (prev?._id === e.detail._id ? e.detail : prev));
    };

    window.addEventListener('newOwnerContract', handleNewContract);
    window.addEventListener('globalTenantSignedContract', handleTenantSigned);
    return () => {
      window.removeEventListener('newOwnerContract', handleNewContract);
      window.removeEventListener('globalTenantSignedContract', handleTenantSigned);
    };
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contracts/owner', { headers });
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      }
    } catch (error) {
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const openContract = (c) => {
    setSelected(c); setRevisionNote(""); setShowRevisionInput(false); setShowSignModal(false); setSignMode('draw'); setUploadedSignBase64(null);
  };
  const closeContract = () => {
    setSelected(null); setRevisionNote(""); setShowRevisionInput(false); setShowSignModal(false); setSignMode('draw'); setUploadedSignBase64(null);
  };

  const handleRequestChanges = async () => {
    if (!selected) return;
    setActing(true);
    try {
      const res = await fetch(`/api/contracts/${selected._id}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ action: "request_changes", revisionNote }),
      });
      if (res.ok) {
        const d = await res.json();
        setContracts(prev => prev.map(c => c._id === d._id ? d : c));
        setSelected(d);
        setShowRevisionInput(false);
        setRevisionNote("");
        toast.success("Revision requested");
      }
    } catch {
      toast.error("Failed to request changes");
    } finally { setActing(false); }
  };

  const handleSignConfirm = async () => {
    if (!selected) return;

    let signatureUrl = null;
    if (signMode === 'draw') {
      if (sigCanvas.current.isEmpty()) {
        toast.error("Please provide your signature.");
        return;
      }
      signatureUrl = sigCanvas.current.getCanvas().toDataURL("image/png");
    } else {
      if (!uploadedSignBase64) {
        toast.error("Please upload your signature.");
        return;
      }
      signatureUrl = uploadedSignBase64;
    }

    setActing(true);
    try {
      const res = await fetch(`/api/contracts/${selected._id}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ action: "sign_owner", signature: signatureUrl }),
      });
      if (res.ok) {
        const d = await res.json();
        setContracts(prev => prev.map(c => c._id === d._id ? d : c));
        setSelected(d);
        setShowSignModal(false);
        toast.success("Contract signed successfully");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to sign contract");
      }
    } catch {
      toast.error("Failed to sign contract");
    } finally { setActing(false); }
  };

  const textarea = `w-full px-3 py-2 text-sm rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-brand-teal transition-all resize-none bg-white text-slate-800`;

  if (selected) {
    const cfg = STATUS[selected.status] ?? STATUS.DRAFT;
    const canAct = selected.status === "PENDING_OWNER_REVIEW";

    return (
      <div className="animate-fadeIn pb-10 space-y-5 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 flex-wrap pt-2">
          <button onClick={closeContract} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
            <Icon icon="lucide:arrow-left" className="w-4 h-4" /> Back to Contracts
          </button>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${cfg.light}`}>
            <Icon icon={cfg.icon} className="w-3.5 h-3.5" /> {cfg.label}
          </span>
        </div>

        {/* Lawyer info */}
        <div className="rounded-2xl border p-4 bg-white border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-slate-400">Prepared by Lawyer</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
              {selected.lawyerId?.profilePic
                ? <img src={selected.lawyerId.profilePic} alt={selected.lawyerId.fullName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                : selected.lawyerId?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">{selected.lawyerId?.fullName}</p>
                <Icon icon="lucide:scale" className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-sm text-slate-500">{selected.lawyerId?.email}</p>
            </div>
          </div>
        </div>

        {/* Tenant */}
        <div className="rounded-2xl border p-5 space-y-4 bg-white border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tenant Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[["Tenant Name", selected.tenantName], ["Email", selected.tenantEmail], ["Phone", selected.tenantPhone]].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs font-medium mb-1 text-slate-500">{label}</p>
                <p className="text-sm font-medium text-slate-800">{val || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Financials */}
        <div className="rounded-2xl border p-5 space-y-4 bg-white border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Property & Financials</p>
          <p className="text-sm text-slate-700">{selected.propertyAddress || "—"}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ["Monthly Rent", `₹${selected.monthlyRent?.toLocaleString("en-IN") || 0}`],
              ["Security Deposit", `₹${selected.securityDeposit?.toLocaleString("en-IN") || 0}`],
              ["Lease Duration", selected.leaseDuration || "—"],
              ["Notice Period", selected.noticePeriod || "—"],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs font-medium mb-1 text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{val}</p>
              </div>
            ))}
          </div>
          {(selected.startDate || selected.endDate) && (
            <div className="grid grid-cols-2 gap-4">
              {[["Start Date", selected.startDate], ["End Date", selected.endDate]].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs font-medium mb-1 text-slate-500">{label}</p>
                  <p className="text-sm font-medium text-slate-800">{val || "—"}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="rounded-2xl border p-5 space-y-4 bg-white border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Terms & Conditions</p>
          <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{selected.terms || "—"}</pre>
          <div className="border-t pt-4 border-slate-100">
            <p className="text-xs font-medium mb-2 text-slate-500">Policies</p>
            <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{selected.policies || "—"}</pre>
          </div>
        </div>

        {/* Action area */}
        {canAct && (
          <div className="rounded-2xl border p-5 space-y-4 bg-white border-slate-200 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Your Response</p>
            <p className="text-sm text-slate-500">
              Review the contract carefully. Clicking "Accept & Sign" will redirect you to DocuSign to securely e-sign.
            </p>
            {showRevisionInput ? (
              <div className="space-y-3">
                <textarea rows={4} className={textarea} placeholder="Describe what changes you need the lawyer to make..." value={revisionNote} onChange={e => setRevisionNote(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={() => setShowRevisionInput(false)} className="px-4 py-2 rounded-xl text-sm font-bold transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700">
                    Cancel
                  </button>
                  <button onClick={handleRequestChanges} disabled={acting || !revisionNote.trim()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50">
                    {acting ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : <Icon icon="lucide:send" className="w-4 h-4" />}
                    Send Revision Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => setShowSignModal(true)} disabled={acting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 shadow-sm">
                  {acting ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : <Icon icon="lucide:pen-line" className="w-4 h-4" />}
                  Accept & Sign
                </button>
                <button onClick={() => setShowRevisionInput(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700">
                  <Icon icon="lucide:rotate-ccw" className="w-4 h-4" /> Request Changes
                </button>
              </div>
            )}
          </div>
        )}

        {/* Signed confirmation */}
        {(selected.status === "OWNER_SIGNED" || selected.status === "PENDING_TENANT_REVIEW" || selected.status === "TENANT_SIGNED") && (
          <div className="rounded-2xl border p-5 space-y-3 bg-[#EAF5F2] border-[#062F26]/20">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:check-circle" className="w-5 h-5 text-[#062F26] flex-shrink-0" />
              <p className="text-sm font-bold text-[#062F26]">
                Contract signed on {selected.ownerSignedAt ? new Date(selected.ownerSignedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
              </p>
            </div>
            {selected.ownerSignature && (
              <div className="mt-3">
                <p className="text-sm font-medium text-brand-teal mb-2">Your Signature</p>
                <div className="border border-brand-teal/30 bg-white rounded-xl overflow-hidden w-[200px] h-[80px]">
                  <img src={selected.ownerSignature} alt="Owner Signature" className="w-full h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Revision sent */}
        {selected.status === "REVISION_REQUIRED" && selected.revisionNote && (
          <div className="flex items-start gap-3 p-4 rounded-xl border bg-orange-50 border-orange-200 text-orange-800">
            <Icon icon="lucide:alert-circle" className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Revision request sent to lawyer</p>
              <p className="text-sm mt-0.5 font-medium">{selected.revisionNote}</p>
            </div>
          </div>
        )}

        {/* Signature Modal */}
        {showSignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slideUp">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Icon icon="lucide:pen-line" className="text-brand-teal" /> Sign the Contract
                </h2>
                <button onClick={() => setShowSignModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <Icon icon="lucide:x" className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 pt-4">
                <div className="flex items-center gap-2 mb-4 p-1 bg-slate-100 rounded-lg w-max">
                  <button onClick={() => setSignMode('draw')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${signMode === 'draw' ? 'bg-white shadow-sm text-brand-teal' : 'text-slate-500 hover:text-slate-700'}`}>Draw</button>
                  <button onClick={() => setSignMode('upload')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${signMode === 'upload' ? 'bg-white shadow-sm text-brand-teal' : 'text-slate-500 hover:text-slate-700'}`}>Upload Image</button>
                </div>
              </div>
              <div className="px-6 pb-6">
                {signMode === 'draw' ? (
                  <>
                    <p className="text-slate-500 text-sm mb-4">
                      Draw your signature below using your mouse or finger. This will be recorded as your electronic signature.
                    </p>
                    <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden relative">
                      <SignatureCanvas
                        ref={sigCanvas}
                        penColor="blue"
                        canvasProps={{ className: "w-full h-48 sm:h-56 signature-canvas", style: { width: '100%', height: '100%' } }}
                      />
                    </div>
                    <p className="text-slate-400 text-xs mt-2">Sign within the box above</p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-500 text-sm mb-4">
                      Upload an image of your signature.
                    </p>
                    <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50 p-6 flex flex-col items-center justify-center relative min-h-[192px]">
                      {uploadedSignBase64 ? (
                        <div className="relative w-full h-full flex flex-col items-center">
                          <img src={uploadedSignBase64} alt="Uploaded Signature" className="max-h-32 object-contain mb-4" />
                          <button onClick={() => setUploadedSignBase64(null)} className="text-red-500 text-sm font-semibold hover:text-red-600">Remove Image</button>
                        </div>
                      ) : (
                        <>
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <Icon icon="lucide:upload-cloud" className="w-10 h-10 text-slate-400 mb-2" />
                          <p className="text-slate-600 font-medium text-sm">Click or drag image here</p>
                          <p className="text-slate-400 text-xs mt-1">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
                {signMode === 'draw' ? (
                  <button onClick={() => sigCanvas.current.clear()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-colors">
                    <Icon icon="lucide:trash-2" className="w-4 h-4" /> Clear
                  </button>
                ) : (<div></div>)}
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowSignModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSignConfirm} disabled={acting} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-[#8ae0a8] hover:bg-green-400 text-white transition-colors disabled:opacity-50">
                    {acting ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : <Icon icon="lucide:check-circle" className="w-4 h-4" />}
                    Confirm Signature
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10 space-y-5">
      <div className="pt-0">
        <h2 className="text-3xl font-bold text-[#062F26] tracking-tight mb-2">Contracts</h2>
        <p className="text-sm text-slate-500 font-medium">Rental contracts prepared by your lawyers</p>
      </div>
      {!loading && contracts.filter(c => c.status === "PENDING_OWNER_REVIEW").length > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-amber-100 text-amber-700">
          <Icon icon="lucide:clock" className="w-4 h-4" />
          {contracts.filter(c => c.status === "PENDING_OWNER_REVIEW").length} awaiting your review
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-teal" />
        </div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <Icon icon="lucide:file-text" className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No contracts yet</h3>
          <p className="text-slate-500 text-sm font-medium max-w-md">Contracts prepared by your lawyers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(c => {
            const cfg = STATUS[c.status] ?? STATUS.DRAFT;
            const needsAction = c.status === "PENDING_OWNER_REVIEW";
            return (
              <div key={c._id} onClick={() => openContract(c)} className={`bg-white border rounded-2xl p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition-all group ${needsAction ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400' : 'border-slate-200 hover:border-brand-teal/30'}`}>
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${needsAction ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-brand-teal/5 group-hover:text-brand-teal'}`}>
                    <Icon icon="lucide:file-text" className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="font-bold text-[15px] sm:text-base text-slate-800">Contract from {c.lawyerId?.fullName || "Lawyer"}</h3>
                      <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.light}`}>
                        <Icon icon={cfg.icon} className="w-3.5 h-3.5" /> {cfg.label}
                      </span>
                      {needsAction && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse shadow-sm">
                          Action Required
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                      {c.propertyAddress && <span className="flex items-center gap-1.5"><Icon icon="lucide:building" className="w-3.5 h-3.5" />{c.propertyAddress}</span>}
                      <span className="flex items-center gap-1.5"><Icon icon="lucide:calendar" className="w-3.5 h-3.5" />{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
                <Icon icon="lucide:chevron-right" className={`w-5 h-5 transition-colors shrink-0 ${needsAction ? 'text-amber-400 group-hover:text-amber-600' : 'text-slate-300 group-hover:text-brand-teal'}`} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerContracts;

