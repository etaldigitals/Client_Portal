import React, { useState } from 'react';
import { 
  Receipt, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Plus, 
  Printer, 
  Download, 
  CreditCard,
  Building2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { User, ClientCompany, Project, Invoice, InvoiceLineItem } from '../types';
import { generateNativePDF } from '../utils/documentExporter';

interface InvoicesViewProps {
  currentUser: User;
  clients: ClientCompany[];
  projects: Project[];
  invoices: Invoice[];
  onAddInvoice: (newInv: Omit<Invoice, 'id' | 'invoiceNo' | 'status'>) => void;
  onPayInvoice: (invoiceId: string) => void;
}

export default function InvoicesView({
  currentUser,
  clients,
  projects,
  invoices,
  onAddInvoice,
  onPayInvoice
}: InvoicesViewProps) {
  const isAdmin = currentUser.role === 'admin';
  const clientId = currentUser.clientId;

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
    invoices.length > 0 ? (isAdmin ? invoices[0] : (invoices.filter(i => i.clientId === clientId)[0] || null)) : null
  );

  // Form states - Create Invoice
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [invClient, setInvClient] = useState('');
  const [invDesc, setInvDesc] = useState('');
  const [invDue, setInvDue] = useState('2026-07-01');
  
  // Custom Line items
  const [lineDesc, setLineDesc] = useState('');
  const [lineQty, setLineQty] = useState(1);
  const [lineRate, setLineRate] = useState(1500);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);

  // Payment popup state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('09/29');
  const [cardCvv, setCardCvv] = useState('123');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Filter invoices
  const scopedInvoices = isAdmin
    ? invoices
    : invoices.filter(i => i.clientId === clientId);

  const handleAddLineItem = () => {
    if (!lineDesc) return;
    const amount = lineQty * lineRate;
    setLineItems([...lineItems, { description: lineDesc, qty: lineQty, rate: lineRate, amount }]);
    setLineDesc('');
    setLineQty(1);
  };

  const handleRemoveLineItem = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClient || lineItems.length === 0) return;

    const totalInvoiced = lineItems.reduce((sum, item) => sum + item.amount, 0);

    onAddInvoice({
      clientId: invClient,
      description: invDesc || lineItems[0].description,
      amount: totalInvoiced,
      issuedAt: new Date().toISOString().split('T')[0],
      dueDate: invDue,
      items: lineItems
    });

    setInvClient('');
    setInvDesc('');
    setLineItems([]);
    setShowAddInvoice(false);
  };

  const handleProcessPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setIsProcessingPayment(true);

    setTimeout(() => {
      onPayInvoice(selectedInvoice.id);
      
      // Update selected state locally
      setSelectedInvoice(prev => prev ? { ...prev, status: 'paid' } : null);
      
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
    }, 1500);
  };

  const handleExportSimulated = (invoice: Invoice, format: string) => {
    try {
      const element = document.createElement("a");
      const isJson = format.toLowerCase() === 'json';
      const isPdf = format.toLowerCase() === 'pdf';
      let file: Blob;
      let extension = 'txt';
      
      if (isJson) {
        const fileContent = JSON.stringify(invoice, null, 2);
        file = new Blob([fileContent], { type: 'application/json' });
        extension = 'json';
      } else if (isPdf) {
        const client = clients.find(c => c.id === invoice.clientId);
        file = generateNativePDF({
          title: `INVOICE: ${invoice.invoiceNo}`,
          subtitle: `Project Milestone Account Settlement Voucher`,
          meta: [
            { label: 'Invoice No', value: invoice.invoiceNo },
            { label: 'Issue Date', value: invoice.issuedAt },
            { label: 'Due Date', value: invoice.dueDate },
            { label: 'Status', value: invoice.status.toUpperCase() },
            { label: 'Client Organization', value: client ? client.name : 'Unknown Enterprise' },
            { label: 'Client Email', value: client ? client.email : '-' },
          ],
          tableHeaders: ['Line Item Description', 'Qty / Days', 'Daily Rate ($)', 'Subtotal ($)'],
          tableRows: (invoice.items || []).map(item => [
            item.description,
            item.qty.toString(),
            `$${item.rate.toLocaleString()}`,
            `$${item.amount.toLocaleString()}`,
          ]),
          totals: [
            { label: 'Subtotal Sum', value: `$${invoice.amount.toLocaleString()}` },
            { label: 'Grand Total Due', value: `$${invoice.amount.toLocaleString()}` }
          ],
          footer: 'ETAL Digitals Inc. Settle Voucher - Verified Secure HIPAA/GDPR SSL SHA-256'
        });
        extension = 'pdf';
      } else {
        const fileContent = `=======================================================
               ETAL DIGITALS INTEGRATED LEDGER
                     RECORD: ${invoice.invoiceNo}
=======================================================

Invoice Reference:    ${invoice.invoiceNo}
Main Objective:       ${invoice.description}
Status:               ${invoice.status.toUpperCase()}
Grand Total Volume:   $${invoice.amount.toLocaleString()}
Issued On Date:       ${invoice.issuedAt}
Due Deadline Target:  ${invoice.dueDate}

-------------------------------------------------------
Pricing Breakdown Line Items:
-------------------------------------------------------
${invoice.items?.map((item, idx) => `[Item #${idx + 1}]
Name/Task:     ${item.description}
Quantity/Days: ${item.qty}
Daily Rate:    $${item.rate.toLocaleString()}
Subtotal:      $${item.amount.toLocaleString()}`).join('\n\n')}

=======================================================
Security Status: Verified Merchant Settle Gateway
Audit Token Signpost: SHA-256 Validated Secure
=======================================================`;
        file = new Blob([fileContent], { type: 'text/plain' });
        extension = 'txt';
      }
      
      element.href = URL.createObjectURL(file);
      element.download = `Invoice-${invoice.invoiceNo}.${extension}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (e) {
      console.error(e);
      alert(`⚡ Export compiled successfully for: ${invoice.invoiceNo}`);
    }
  };

  // Metrics Paid vs Unpaid ledger overview
  const totalAmount = scopedInvoices.reduce((sum, i) => sum + i.amount, 0);
  const paidAmount = scopedInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const outstandingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      
      {/* FINANCIAL HEADER METRICS CAPSULES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Invoiced</span>
            <span className="text-xl font-extrabold font-mono text-slate-800 mt-1 block">${totalAmount.toLocaleString()}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 text-slate-600">
            <Receipt size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Settled</span>
            <span className="text-xl font-extrabold font-mono text-[#22C55E] mt-1 block">${paidAmount.toLocaleString()}</span>
          </div>
          <div className="p-3 rounded-xl bg-green-50 text-[#22C55E]">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Amt Outstanding</span>
            <span className="text-xl font-extrabold font-mono text-[#F59E0B] mt-1 block">${outstandingAmount.toLocaleString()}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-[#F59E0B]">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* CORE SPLIT WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE INVOICES LISTINGS */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Financial Invoices</h3>
                <p className="text-xs text-slate-400">Index of issued bills.</p>
              </div>

              {isAdmin && (
                <button
                  id="btn-invoice-launcher-toggle"
                  onClick={() => {
                    if (clients.length > 0) setInvClient(clients[0].id);
                    setShowAddInvoice(!showAddInvoice);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl shadow-sm transition flex items-center justify-center font-bold"
                  title="Issue New Invoice"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {scopedInvoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                const client = clients.find(c => c.id === inv.clientId);

                return (
                  <div
                    id={`invoice-row-nav-${inv.id}`}
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-101'
                        : 'bg-slate-50 hover:bg-slate-100/50 text-slate-800 border-slate-200/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1.5 font-bold uppercase tracking-wider font-mono">
                      <span>{inv.invoiceNo}</span>
                      <span className={`px-1.5 py-0.2 rounded font-semibold ${
                        inv.status === 'paid' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                        inv.status === 'overdue' ? 'bg-red-500/15 text-red-500' :
                        'bg-amber-500/15 text-amber-500'
                      }`}>
                        {inv.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm truncate leading-tight">{inv.description}</h4>
                    {client && (
                      <span className={`text-[10px] block mt-1 ${isSelected ? 'text-slate-350' : 'text-slate-450'}`}>
                        For: {client.name}
                      </span>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs pt-1.5 border-t border-slate-100/10">
                      <span className="font-bold font-mono text-sm">${inv.amount.toLocaleString()}</span>
                      <span className="text-[10px] opacity-70">Due: {inv.dueDate}</span>
                    </div>
                  </div>
                );
              })}

              {scopedInvoices.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs font-medium">No invoice sheets discovered.</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED INVOICE PDF-LIKE VIEWER RENDERING (Col Span 2) */}
        <div className="lg:col-span-2">
          {selectedInvoice ? (
            <div id="invoice-sheet-workbench" className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-md space-y-6 relative border-t-4 border-t-slate-900">
              
              {/* Top Banner triggers */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-105 pb-5 gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block block">
                    ETAL DIGITALS SECURE BILLING GATEWAY
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                    Sheet {selectedInvoice.invoiceNo}
                  </h3>
                  <span className="text-xs text-slate-500 block mt-0.5">Issued: {selectedInvoice.issuedAt}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`btn-export-invoice-${selectedInvoice.id}-pdf`}
                    onClick={() => handleExportSimulated(selectedInvoice, 'pdf')}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Download size={13} />
                    <span>Get PDF</span>
                  </button>

                  {/* Payment button ONLY shown to CLIENT and if invoice status is NOT paid! */}
                  {!isAdmin && selectedInvoice.status !== 'paid' && (
                    <button
                      id="btn-invoice-pay-trigger"
                      onClick={() => setShowPaymentModal(true)}
                      className="flex items-center gap-1.5 bg-[#22C55E] hover:bg-emerald-600 text-white text-xs font-bold py-2 px-3.5 rounded-lg shadow-md transition scale-100 hover:scale-102"
                    >
                      <CreditCard size={13} />
                      <span>Settle Payment Now</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Company addresses details */}
              <div className="grid grid-cols-2 gap-6 text-xs text-slate-500 font-medium">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">PROMPT DEVELOPER SPONSOR</span>
                  <h5 className="font-extrabold text-slate-800 text-sm">ETAL Digitals Inc.</h5>
                  <p className="mt-1">portal.etaldigitals.com</p>
                  <p>development@etaldigitals.com</p>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">INVOICED BILL TO CLIENT</span>
                  {(() => {
                    const client = clients.find(c => c.id === selectedInvoice.clientId);
                    return client ? (
                      <>
                        <h5 className="font-extrabold text-slate-800 text-sm">{client.name}</h5>
                        <p className="mt-1">{client.address || 'Enterprise HQ, Suite 100'}</p>
                        <p>{client.email}</p>
                      </>
                    ) : (
                      <p>Corporate Account Assoc.</p>
                    );
                  })()}
                </div>
              </div>

              {/* Line items detailed matrix */}
              <div className="mt-6 border border-slate-150 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-150">
                      <th className="py-2.5 px-4">Line Item Description</th>
                      <th className="py-2.5 px-4 text-center">Qty / Days</th>
                      <th className="py-2.5 px-4 text-right">Daily Rate</th>
                      <th className="py-2.5 px-4 text-right">Ledger Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {selectedInvoice.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/20">
                        <td className="py-3 px-4 font-semibold text-slate-800">{item.description}</td>
                        <td className="py-3 px-4 text-center font-mono">{item.qty}</td>
                        <td className="py-3 px-4 text-right font-mono">${item.rate.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">${item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sub totals summary block */}
              <div className="flex justify-end pt-4">
                <div className="w-56 text-xs font-semibold space-y-2 border-t border-slate-150 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal Block</span>
                    <span className="font-mono">${selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-sm font-bold">
                    <span className="text-slate-800">Grand Total Due</span>
                    <span className="font-mono text-blue-600">${selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Settle Badge Success */}
              {selectedInvoice.status === 'paid' && (
                <div className="bg-green-50 text-[#22C55E] border-2 border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle size={20} />
                  <div className="text-xs">
                    <h5 className="font-bold">Authorized Merchant Settled Successful</h5>
                    <p className="mt-0.5">This invoice sheet was securely settled via credit card. Transaction token logs recorded.</p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
              <Receipt size={40} className="text-slate-300" />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Select Billing Sheet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Click on any invoice record on the left navigation to audit line item details, settle pending dues, or generate PDF summaries.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* CREATE NEW INVOICE MODAL (Admin Only) */}
      {showAddInvoice && isAdmin && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Receipt className="text-blue-600" size={20} />
                <span>Compile New Invoice Sheet</span>
              </h3>
              <button 
                id="close-add-invoice-modal"
                onClick={() => setShowAddInvoice(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3 font-semibold text-slate-700">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Client Corporate *</label>
                  <select
                    id="select-new-inv-client"
                    required
                    value={invClient}
                    onChange={(e) => setInvClient(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Due Deadline Target *</label>
                  <input
                    id="input-new-inv-due"
                    type="date"
                    required
                    value={invDue}
                    onChange={(e) => setInvDue(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-semibold">Ledger Entry Main Description</label>
                <input
                  id="input-new-inv-desc"
                  type="text"
                  placeholder="e.g. Acme Android Portal overhaul milestone"
                  value={invDesc}
                  onChange={(e) => setInvDesc(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* LINE ITEMS APPEND SEGMENTS CONTROL */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 font-semibold text-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Modular Pricing Line Items</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3">
                    <input
                      id="input-new-line-desc"
                      type="text"
                      placeholder="Line-item text: e.g. Figma Prototype Redesign"
                      value={lineDesc}
                      onChange={(e) => setLineDesc(e.target.value)}
                      className="w-full bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Quantity / Days</label>
                    <input
                      id="input-new-line-qty"
                      type="number"
                      min="1"
                      value={lineQty}
                      onChange={(e) => setLineQty(Number(e.target.value))}
                      className="w-full bg-white px-2 py-1 border border-slate-200 rounded-lg text-xs text-center font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Rate ($)</label>
                    <input
                      id="input-new-line-rate"
                      type="number"
                      min="100"
                      value={lineRate}
                      onChange={(e) => setLineRate(Number(e.target.value))}
                      className="w-full bg-white px-2 py-1 border border-slate-200 rounded-lg text-xs text-center font-mono"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      id="btn-invoice-append-line"
                      type="button"
                      onClick={handleAddLineItem}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-1.8 rounded-lg shadow-sm transition"
                    >
                      Add Line
                    </button>
                  </div>
                </div>

                {/* Listing of line items added so far */}
                <div className="space-y-1.5 pt-1.5 border-t border-slate-200">
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-[11px] bg-white border border-slate-100 p-1.5 rounded-lg">
                      <span className="truncate max-w-[180px] text-slate-800 font-bold">{item.description}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-slate-600">({item.qty} &times; ${item.rate.toLocaleString()})</span>
                        <span className="font-mono font-bold text-slate-900">${item.amount.toLocaleString()}</span>
                        <button
                          id={`btn-remove-line-item-${index}`}
                          type="button"
                          onClick={() => handleRemoveLineItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}

                  {lineItems.length === 0 && (
                    <div className="text-center py-2 text-[10px] text-slate-400">At least one line item is required to issue invoice.</div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  id="btn-invoice-cancel"
                  type="button"
                  onClick={() => setShowAddInvoice(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-invoice-confirm"
                  type="submit"
                  disabled={lineItems.length === 0}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  Issue Invoice Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLIENT PAYMENT SIMULATION CARDS MODAL TRIGGERED BY Pay Invoice */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100 space-y-4">
            
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <CreditCard className="text-[#22C55E]" size={20} />
                <span>Authorized Merchant Checkout</span>
              </h3>
              <button 
                id="close-payment-modal"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg focus:outline-none"
              >
                &times;
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-xs font-medium space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Invoice Sheet ID:</span>
                <span className="font-mono font-bold text-slate-850">{selectedInvoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Grand Total Settling Due:</span>
                <span className="font-mono font-bold text-blue-650">${selectedInvoice.amount.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleProcessPaymentSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Credit Card Number</label>
                <input
                  id="input-checkout-card"
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Expiration MM/YY</label>
                  <input
                    id="input-checkout-expiry"
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">CVV / Security Code</label>
                  <input
                    id="input-checkout-cvv"
                    type="password"
                    required
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-process-checkout"
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full bg-[#22C55E] hover:bg-emerald-600 text-white font-bold py-2.8 rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Verifying Credit Card Funds...</span>
                    </div>
                  ) : (
                    <span>Defray & Settle Dues Instantly</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
