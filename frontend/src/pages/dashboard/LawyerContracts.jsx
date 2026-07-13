import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  DRAFT: { label: "Draft", icon: "lucide:file-text", light: "bg-slate-100 text-slate-700" },
  PENDING_OWNER_REVIEW: { label: "Pending Review", icon: "lucide:clock", light: "bg-amber-100 text-amber-700" },
  REVISION_REQUIRED: { label: "Revision Needed", icon: "lucide:rotate-ccw", light: "bg-orange-100 text-orange-700" },
  OWNER_SIGNED: { label: "Owner Signed", icon: "lucide:check-circle", light: "bg-blue-100 text-blue-700" },
  PENDING_TENANT_REVIEW: { label: "Sent to Tenant", icon: "lucide:send", light: "bg-purple-100 text-purple-700" },
  TENANT_SIGNED: { label: "Fully Executed", icon: "lucide:check-circle", light: "bg-emerald-100 text-emerald-700" },
};

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const LawyerContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingToTenant, setSendingToTenant] = useState(false);

  const [creating, setCreating] = useState(false);
  const [createOwnerId, setCreateOwnerId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [owners, setOwners] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [form, setForm] = useState({});
  const [dirty, setDirty] = useState(false);

  const [bookedTenants, setBookedTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [emailingPdf, setEmailingPdf] = useState(false);

  const token = localStorage.getItem('accessToken');
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  useEffect(() => {
    fetchContracts();
    fetchOwners();

    const handleOwnerSigned = (e) => {
      setContracts(prev => prev.map(c => c._id === e.detail._id ? e.detail : c));
      setSelected(prev => (prev?._id === e.detail._id ? e.detail : prev));
      setForm(prev => (prev?._id === e.detail._id ? e.detail : prev));
    };

    const handleTenantSigned = (e) => {
      setContracts(prev => prev.map(c => c._id === e.detail._id ? e.detail : c));
      setSelected(prev => (prev?._id === e.detail._id ? e.detail : prev));
      setForm(prev => (prev?._id === e.detail._id ? e.detail : prev));
    };

    window.addEventListener('globalOwnerSignedContract', handleOwnerSigned);
    window.addEventListener('globalTenantSignedContract', handleTenantSigned);
    return () => {
      window.removeEventListener('globalOwnerSignedContract', handleOwnerSigned);
      window.removeEventListener('globalTenantSignedContract', handleTenantSigned);
    };
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contracts/lawyer', { headers });
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

  const fetchOwners = async () => {
    try {
      const response = await fetch('/api/users/lawyer/owners', { headers });
      if (response.ok) {
        const data = await response.json();
        setOwners(data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const openContract = (c) => {
    setSelected(c);
    setForm({ ...c });
    setDirty(false);

    if (c.ownerId?._id) {
      setLoadingTenants(true);
      setBookedTenants([]);
      fetch(`/api/contracts/${c._id}/booked-tenants`, { headers })
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setBookedTenants(data); })
        .catch(() => { })
        .finally(() => setLoadingTenants(false));
    }
  };

  const closeContract = () => { setSelected(null); setForm({}); setDirty(false); };

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const canEdit = selected && ["DRAFT", "REVISION_REQUIRED"].includes(selected.status);
  const canEditTenant = selected && ["DRAFT", "REVISION_REQUIRED", "OWNER_SIGNED"].includes(selected.status);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/contracts/${selected._id}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ action: "save", ...form }),
      });
      if (res.ok) {
        const d = await res.json();
        setContracts(prev => prev.map(c => c._id === d._id ? d : c));
        setSelected(d);
        setForm({ ...d });
        setDirty(false);
        toast.success("Draft saved");
      }
    } catch {
      toast.error("Failed to save draft");
    } finally { setSaving(false); }
  };

  const handleSend = async () => {
    if (!selected) return;
    setSending(true);
    try {
      const res = await fetch(`/api/contracts/${selected._id}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ action: "send_to_owner", ...form }),
      });
      if (res.ok) {
        const d = await res.json();
        setContracts(prev => prev.map(c => c._id === d._id ? d : c));
        setSelected(d);
        setForm({ ...d });
        setDirty(false);
        toast.success("Sent to owner");
      }
    } catch {
      toast.error("Failed to send");
    } finally { setSending(false); }
  };

  const handleSendToTenant = async () => {
    if (!selected) return;
    setSendingToTenant(true);
    try {
      if (form.tenantName !== selected.tenantName || form.tenantEmail !== selected.tenantEmail || form.tenantPhone !== selected.tenantPhone) {
        const saveRes = await fetch(`/api/contracts/${selected._id}`, {
          method: "PATCH", headers,
          body: JSON.stringify({
            action: "save_tenant",
            tenantName: form.tenantName,
            tenantEmail: form.tenantEmail,
            tenantPhone: form.tenantPhone,
          }),
        });
        if (!saveRes.ok) {
          setSendingToTenant(false);
          toast.error("Failed to save tenant info");
          return;
        }
      }
      const res = await fetch(`/api/contracts/${selected._id}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ action: "send_to_tenant" }),
      });
      if (res.ok) {
        const d = await res.json();
        setContracts(prev => prev.map(c => c._id === d._id ? d : c));
        setSelected(d);
        setForm({ ...d });
        toast.success("Sent to tenant");
      }
    } catch {
      toast.error("Failed to send to tenant");
    } finally { setSendingToTenant(false); }
  };

  const handleCreate = async () => {
    if (!createOwnerId) return;
    setCreating(true);
    try {
      const title = `Contract with Owner`;
      const res = await fetch("/api/contracts", {
        method: "POST", headers,
        body: JSON.stringify({ ownerId: createOwnerId, title }),
      });
      if (res.ok) {
        const d = await res.json();
        setContracts(prev => [d, ...prev]);
        setShowCreateModal(false);
        setCreateOwnerId("");
        openContract(d);
      }
    } catch {
      toast.error("Failed to create contract");
    } finally { setCreating(false); }
  };

  const handleDownloadPdf = async () => {
    if (!selected) return;
    setGeneratingPdf(true);
    try {
      const response = await fetch(`/api/contracts/${selected._id}/pdf`, { headers });
      if (!response.ok) throw new Error("Failed to generate PDF");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `rental-agreement-${selected._id.slice(-6)}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to generate PDF");
    } finally { setGeneratingPdf(false); }
  };

  const handleEmailPdf = async () => {
    if (!selected) return;
    setEmailingPdf(true);
    try {
      const res = await fetch(`/api/contracts/${selected._id}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ action: "email_completed_pdf" }),
      });
      if (res.ok) {
        toast.success("Completed copies emailed to Owner and Tenant");
      } else {
        toast.error("Failed to send emails");
      }
    } catch {
      toast.error("An error occurred");
    } finally { setEmailingPdf(false); }
  };

  const inp = `w-full px-3 py-2 text-sm rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition-all bg-white text-slate-800 placeholder-slate-400`;
  const inpDisabled = `${inp} opacity-60 cursor-not-allowed bg-slate-50`;
  const textarea = `${inp} resize-none`;

  if (selected) {
    const cfg = STATUS[selected.status] ?? STATUS.DRAFT;

    return (
      <div className="animate-fadeIn max-w-4xl mx-auto pb-10 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={closeContract} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
            <Icon icon="lucide:arrow-left" className="w-4 h-4" /> Back
          </button>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${cfg.light}`}>
            <Icon icon={cfg.icon} className="w-3.5 h-3.5" /> {cfg.label}
          </span>
          {dirty && canEdit && <span className="text-xs font-semibold text-amber-600">● Unsaved</span>}
          <div className="ml-auto flex items-center gap-2">
            {canEdit && (
              <>
                <button onClick={handleSave} disabled={saving || !dirty} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 bg-slate-100 hover:bg-slate-200 text-slate-800">
                  {saving ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : <Icon icon="lucide:save" className="w-4 h-4" />}
                  Save Draft
                </button>
                <button onClick={handleSend} disabled={sending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-[#062F26] hover:bg-brand-teal text-white transition-colors disabled:opacity-50 shadow-md">
                  {sending ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : <Icon icon="lucide:send" className="w-4 h-4" />}
                  Send to Owner
                </button>
              </>
            )}
            {selected.status === "OWNER_SIGNED" && (
              <button onClick={handleSendToTenant} disabled={sendingToTenant || !form.tenantEmail} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50 shadow-md">
                {sendingToTenant ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : <Icon icon="lucide:send" className="w-4 h-4" />}
                Send to Tenant
              </button>
            )}
          </div>
        </div>

        {selected.status === "REVISION_REQUIRED" && selected.revisionNote && (
          <div className="flex items-start gap-3 p-4 rounded-xl border bg-orange-50 border-orange-200 text-orange-800">
            <Icon icon="lucide:alert-circle" className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Owner requested changes</p>
              <p className="text-sm mt-0.5 font-medium">{selected.revisionNote}</p>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-slate-400">Owner</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EAF5F2] flex items-center justify-center text-[#062F26] font-bold text-sm flex-shrink-0 overflow-hidden">
              {selected.ownerId?.profilePic ? <img src={selected.ownerId.profilePic} alt={selected.ownerId.fullName} className="w-full h-full object-cover" /> : selected.ownerId?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{selected.ownerId?.fullName}</p>
              <p className="text-xs text-slate-500 font-medium">{selected.ownerId?.email}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 space-y-5 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tenant Details</p>
          </div>
          {canEditTenant && (
            <div>
              {loadingTenants ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium"><Icon icon="lucide:loader-2" className="w-3.5 h-3.5 animate-spin" /> Loading booked tenants…</div>
              ) : bookedTenants.length === 0 ? (
                <p className="text-sm text-slate-500 font-medium">No booked tenants found for this owner. Fill in manually.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-600">Booked tenants ({bookedTenants.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {bookedTenants.map(t => (
                      <button key={t._id} type="button" onClick={() => {
                        setField("tenantName", t.fullName);
                        setField("tenantEmail", t.email);
                      }} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-sm font-medium transition-colors ${form.tenantEmail === t.email ? "border-brand-teal bg-[#EAF5F2] text-brand-teal" : "border-slate-200 hover:border-brand-teal/40 bg-slate-50 text-slate-700"}`}>
                        <Icon icon="lucide:user" className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{t.fullName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Tenant Name"><input className={canEditTenant ? inp : inpDisabled} value={form.tenantName || ""} disabled={!canEditTenant} onChange={e => setField("tenantName", e.target.value)} placeholder="Full name" /></Field>
            <Field label="Tenant Email"><input className={canEditTenant ? inp : inpDisabled} value={form.tenantEmail || ""} disabled={!canEditTenant} onChange={e => setField("tenantEmail", e.target.value)} placeholder="email@example.com" /></Field>
            <Field label="Tenant Phone"><input className={canEditTenant ? inp : inpDisabled} value={form.tenantPhone || ""} disabled={!canEditTenant} onChange={e => setField("tenantPhone", e.target.value)} placeholder="+91 XXXXX XXXXX" /></Field>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 space-y-5 bg-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Property & Financials</p>
          <Field label="Property Address"><input className={canEdit ? inp : inpDisabled} value={form.propertyAddress || ""} disabled={!canEdit} onChange={e => setField("propertyAddress", e.target.value)} placeholder="Full address" /></Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Monthly Rent (₹)"><input type="number" className={canEdit ? inp : inpDisabled} value={form.monthlyRent || ""} disabled={!canEdit} onChange={e => setField("monthlyRent", Number(e.target.value))} placeholder="0" /></Field>
            <Field label="Security Deposit (₹)"><input type="number" className={canEdit ? inp : inpDisabled} value={form.securityDeposit || ""} disabled={!canEdit} onChange={e => setField("securityDeposit", Number(e.target.value))} placeholder="0" /></Field>
            <Field label="Lease Duration"><input className={canEdit ? inp : inpDisabled} value={form.leaseDuration || ""} disabled={!canEdit} onChange={e => setField("leaseDuration", e.target.value)} placeholder="11 months" /></Field>
            <Field label="Notice Period"><input className={canEdit ? inp : inpDisabled} value={form.noticePeriod || ""} disabled={!canEdit} onChange={e => setField("noticePeriod", e.target.value)} placeholder="1 month" /></Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start Date"><input type="date" className={canEdit ? inp : inpDisabled} value={form.startDate || ""} disabled={!canEdit} onChange={e => setField("startDate", e.target.value)} /></Field>
            <Field label="End Date"><input type="date" className={canEdit ? inp : inpDisabled} value={form.endDate || ""} disabled={!canEdit} onChange={e => setField("endDate", e.target.value)} /></Field>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Terms & Conditions</p>
          <Field label="Terms"><textarea rows={10} className={canEdit ? textarea : `${textarea} opacity-60 cursor-not-allowed`} value={form.terms || ""} disabled={!canEdit} onChange={e => setField("terms", e.target.value)} /></Field>
          <Field label="Policies"><textarea rows={6} className={canEdit ? textarea : `${textarea} opacity-60 cursor-not-allowed`} value={form.policies || ""} disabled={!canEdit} onChange={e => setField("policies", e.target.value)} /></Field>
        </div>

        {(selected.status === "OWNER_SIGNED" || selected.status === "PENDING_TENANT_REVIEW" || selected.status === "TENANT_SIGNED") && (
          <div className="space-y-4">
            <div className="rounded-2xl border p-5 space-y-3 bg-blue-50 border-blue-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:check-circle" className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="font-bold text-sm text-blue-700">Owner Signed {selected.ownerSignedAt && `— ${new Date(selected.ownerSignedAt).toLocaleDateString()}`}</p>
              </div>
              <p className="text-sm text-blue-600 font-medium">Signed electronically.</p>
              {selected.ownerSignature && (
                <div className="mt-3">
                  <div className="border border-blue-200 bg-white rounded-xl overflow-hidden w-[160px] h-[60px]">
                    <img src={selected.ownerSignature} alt="Owner Signature" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
              {selected.status === "OWNER_SIGNED" && (
                <p className="text-sm text-blue-600 font-medium mt-2">
                  Click "Send to Tenant" above to send the contract to <strong>{form.tenantName || "the tenant"}</strong> ({form.tenantEmail || "no email set"}) for their signature.
                </p>
              )}
            </div>

            {selected.status === "TENANT_SIGNED" && (
              <div className="rounded-2xl border p-5 space-y-4 bg-emerald-50 border-emerald-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:check-circle" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <p className="font-bold text-sm text-emerald-800">Tenant Signed — Contract Fully Executed {selected.tenantSignedAt && `— ${new Date(selected.tenantSignedAt).toLocaleDateString()}`}</p>
                </div>
                <p className="text-sm text-emerald-700 font-medium">Signed electronically.</p>
                {selected.tenantSignature && (
                  <div className="mt-3">
                    <div className="border border-emerald-200 bg-white rounded-xl overflow-hidden w-[160px] h-[60px]">
                      <img src={selected.tenantSignature} alt="Tenant Signature" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-emerald-200 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Contract Document</p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleDownloadPdf} disabled={generatingPdf} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm transition-colors disabled:opacity-50">
                      {generatingPdf ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : <Icon icon="lucide:download" className="w-4 h-4" />}
                      Download PDF
                    </button>
                    <button onClick={handleEmailPdf} disabled={emailingPdf} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#062F26] hover:bg-brand-teal text-white shadow-sm transition-colors disabled:opacity-50">
                      {emailingPdf ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : <Icon icon="lucide:mail" className="w-4 h-4" />}
                      Email Contract Copies
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const selectedOwner = owners.find(o => o._id === createOwnerId);

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto pb-10 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-bold text-[#062F26] tracking-tight mb-2">Contracts</h1>
          <p className="text-sm text-slate-500 font-medium">Create and manage rental contracts with property owners</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-[#062F26] hover:bg-brand-teal text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
          <Icon icon="lucide:plus" className="w-4 h-4" /> New Contract
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-teal" /></div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <Icon icon="lucide:file-text" className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No contracts yet</h3>
          <p className="text-slate-500 text-sm font-medium max-w-md">You haven't created any contracts. Click "New Contract" to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {contracts.map((c) => {
            const cfg = STATUS[c.status] ?? STATUS.DRAFT;
            return (
              <div key={c._id} onClick={() => openContract(c)} className={`bg-white border ${c.status === 'OWNER_SIGNED' ? 'border-brand-teal bg-[#EAF5F2]' : 'border-slate-200'} rounded-2xl p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-brand-teal/30 transition-all group`}>
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-brand-teal/5 transition-colors">
                    <Icon icon="lucide:file-text" className="w-5 h-5 text-slate-400 group-hover:text-brand-teal" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="font-bold text-[15px] sm:text-base text-slate-800">Contract with {c.ownerId?.fullName || 'Owner'}</h3>
                      <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.light}`}>
                        <Icon icon={cfg.icon} className="w-3.5 h-3.5" /> {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><Icon icon="lucide:building" className="w-3.5 h-3.5" />{c.propertyAddress || 'Address not specified'}</span>
                      <span className="flex items-center gap-1.5"><Icon icon="lucide:calendar" className="w-3.5 h-3.5" />{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <Icon icon="lucide:chevron-right" className="w-5 h-5 text-slate-300 group-hover:text-brand-teal transition-colors shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 animate-fadeInScale overflow-visible">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-[#062F26] tracking-tight mb-2">New Contract</h2>
              <p className="text-sm text-slate-500 mb-6">Select an owner to create a contract for</p>

              <div className="relative mb-8">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-white border-2 border-slate-200 hover:border-brand-teal rounded-2xl p-3 flex items-center justify-between transition-colors group text-left focus:outline-none focus:ring-4 focus:ring-brand-teal/10">
                  {selectedOwner ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-[#EAF5F2] flex items-center justify-center font-bold text-[#062F26]">
                        {selectedOwner.profilePic ? <img src={selectedOwner.profilePic} alt={selectedOwner.fullName} className="w-full h-full object-cover" /> : selectedOwner.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{selectedOwner.fullName}</h4>
                        <p className="text-xs text-slate-500">{selectedOwner.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center"><Icon icon="lucide:user" className="w-5 h-5 text-slate-400" /></div>
                      <span className="text-sm font-medium text-slate-500">Select an owner...</span>
                    </div>
                  )}
                  <Icon icon={isDropdownOpen ? "lucide:chevron-up" : "lucide:chevron-down"} className="w-5 h-5 text-slate-400 group-hover:text-brand-teal" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto custom-scrollbar">
                    {owners.length > 0 ? owners.map(owner => (
                      <button key={owner._id} onClick={() => { setCreateOwnerId(owner._id); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors text-left">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#EAF5F2] flex items-center justify-center font-bold text-[#062F26]">
                          {owner.profilePic ? <img src={owner.profilePic} alt={owner.fullName} className="w-full h-full object-cover" /> : owner.fullName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{owner.fullName}</h4>
                          <p className="text-xs text-slate-500">{owner.email}</p>
                        </div>
                      </button>
                    )) : <div className="p-4 text-center text-sm text-slate-500">No owners found</div>}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button onClick={handleCreate} disabled={!createOwnerId || creating} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-brand-teal hover:bg-[#062F26] text-white transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  {creating ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : <Icon icon="lucide:plus" className="w-4 h-4" />}
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerContracts;
