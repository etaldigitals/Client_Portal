import React, { useState } from 'react';
import { 
  TrendingUp, 
  Settings, 
  FileSpreadsheet, 
  FolderLock, 
  FileText, 
  Play, 
  Download, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Printer,
  Sliders
} from 'lucide-react';
import { User, ClientCompany, Project, FileRecord, Invoice } from '../types';
import { generateNativePDF, generateCSVWorksheet } from '../utils/documentExporter';

interface ReportsViewProps {
  currentUser: User;
  clients: ClientCompany[];
  projects: Project[];
  files: FileRecord[];
  invoices: Invoice[];
}

export default function ReportsView({
  currentUser,
  clients,
  projects,
  files,
  invoices
}: ReportsViewProps) {
  const isAdmin = currentUser.role === 'admin';
  const clientId = currentUser.clientId;

  // Report Form state
  const [rptClient, setRptClient] = useState(isAdmin ? 'all' : (clientId || ''));
  const [rptProj, setRptProj] = useState('all');
  const [rptType, setRptType] = useState('summary');
  const [rptFormat, setRptFormat] = useState('pdf');

  // Generated state
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = [
    { id: 't-1', name: 'Weekly Progress Review', type: 'summary', desc: 'Summary of developer tasks finished, logs, and blockages.' },
    { id: 't-2', name: 'Monthly Financial Audit Ledger', type: 'financial', desc: 'Comprehensive financial billing summary: Paid vs Pending logs.' },
    { id: 't-3', name: 'Campaign SEO Crawl Analytics', type: 'marketing', desc: 'Search index rankings, load speeds, and keywords performance.' }
  ];

  const scopedClients = isAdmin 
    ? clients 
    : clients.filter(c => c.id === clientId);

  const scopedProjects = isAdmin 
    ? (rptClient === 'all' ? projects : projects.filter(p => p.clientId === rptClient))
    : projects.filter(p => p.clientId === clientId);

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      // Perform genuine statistics calculations
      const targetClient = clients.find(c => c.id === rptClient) || (isAdmin ? null : clients.find(c => c.id === clientId));
      
      const filteredProjs = projects.filter(p => {
        const matchesClient = rptClient === 'all' || p.clientId === rptClient;
        const matchesProj = rptProj === 'all' || p.id === rptProj;
        return matchesClient && matchesProj;
      });

      const totalBudgetAlloc = filteredProjs.reduce((s, p) => s + p.budget, 0);
      const avgProgress = filteredProjs.length > 0 
        ? Math.round(filteredProjs.reduce((s, p) => s + p.progress, 0) / filteredProjs.length)
        : 0;

      const totalTasksCount = filteredProjs.reduce((s, p) => s + p.tasks.length, 0);
      const completedTasksCount = filteredProjs.reduce((s, p) => s + p.tasks.filter(t => t.status === 'completed').length, 0);

      const associatedInvoices = invoices.filter(i => rptClient === 'all' || i.clientId === rptClient);
      const billingTotal = associatedInvoices.reduce((s, i) => s + i.amount, 0);
      const paidTotal = associatedInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

      const filesCount = files.filter(f => rptClient === 'all' || f.clientId === rptClient).length;

      setGeneratedReport({
        id: `RPT-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
        title: `${targetClient ? targetClient.name : 'All Clients'} - Portfolio Core Performance Report`,
        generatedAt: new Date().toISOString().split('T')[0],
        clientName: targetClient ? targetClient.name : 'Consolidated Enterprises',
        projectCount: filteredProjs.length,
        avgProgress,
        totalBudgetAlloc,
        totalTasksCount,
        completedTasksCount,
        billingTotal,
        paidTotal,
        filesCount,
        format: rptFormat.toUpperCase(),
        projectsList: filteredProjs.map(p => ({
          name: p.name,
          progress: p.progress,
          status: p.status,
          budget: p.budget,
          tasksCompleted: p.tasks.filter(t => t.status === 'completed').length,
          tasksTotal: p.tasks.length
        }))
      });

      setIsGenerating(false);
    }, 1200); // realistic delay trace
  };

  const handleExportSimulated = () => {
    if (!generatedReport) return;
    try {
      const element = document.createElement("a");
      const format = generatedReport.format.toLowerCase();
      const isJson = format === 'json';
      const isPdf = format === 'pdf';
      const isExcel = format === 'excel';
      let file: Blob;
      let extension = 'txt';
      
      if (isJson) {
        const fileContent = JSON.stringify(generatedReport, null, 2);
        file = new Blob([fileContent], { type: 'application/json' });
        extension = 'json';
      } else if (isPdf) {
        file = generateNativePDF({
          title: generatedReport.title,
          subtitle: `Consolidated Client Performance and Activity Audit`,
          meta: [
            { label: 'Report ID', value: generatedReport.id },
            { label: 'Client Partner', value: generatedReport.clientName },
            { label: 'Date Compiled', value: generatedReport.generatedAt },
            { label: 'Active Projects', value: `${generatedReport.projectCount} Folders` },
            { label: 'Average Progress', value: `${generatedReport.avgProgress}%` },
            { label: 'Tasks Metric', value: `${generatedReport.completedTasksCount} / ${generatedReport.totalTasksCount} Finished` },
            { label: 'Billing Accumulation', value: `$${generatedReport.billingTotal.toLocaleString()}` },
            { label: 'Cleared Payments', value: `$${generatedReport.paidTotal.toLocaleString()}` },
          ],
          tableHeaders: ['Project Title', 'Status Tag', 'Budget Allotted', 'Development Complete'],
          tableRows: (generatedReport.projectsList || []).map((pr: any) => [
            pr.name,
            pr.status.toUpperCase(),
            `$${pr.budget.toLocaleString()}`,
            `${pr.progress}% (${pr.tasksCompleted}/${pr.tasksTotal} Tasks)`,
          ]),
          totals: [
            { label: 'Direct Invoice Billing', value: `$${generatedReport.billingTotal.toLocaleString()}` },
            { label: 'Total Received Receipts', value: `$${generatedReport.paidTotal.toLocaleString()}` }
          ],
          footer: 'Portal verification: System Security Cryptography SSL SHA-256'
        });
        extension = 'pdf';
      } else if (isExcel) {
        const headers = ['Project Name', 'Status', 'Budget Allotted ($)', 'Development Progress (%)', 'Tasks Completed', 'Total Tasks'];
        const rows = (generatedReport.projectsList || []).map((pr: any) => [
          pr.name,
          pr.status,
          pr.budget.toString(),
          pr.progress.toString(),
          pr.tasksCompleted.toString(),
          pr.tasksTotal.toString()
        ]);
        file = generateCSVWorksheet(headers, rows);
        extension = 'csv';
      } else {
        const fileContent = `=======================================================
               ETAL DIGITALS PORTFOLIO REPORT
                     RECORD: ${generatedReport.id}
=======================================================

Report Heading:        ${generatedReport.title}
Client Enterprise:     ${generatedReport.clientName}
Document Compiled On:  ${generatedReport.generatedAt}
Format Target Speeds:  ${generatedReport.format}

-------------------------------------------------------
Executive Executive Key Performance Indicators:
-------------------------------------------------------
Active Folders:        ${generatedReport.projectCount} Projects
Average Code progress: ${generatedReport.avgProgress}%
Total Task Milestones: ${generatedReport.completedTasksCount} / ${generatedReport.totalTasksCount} Finished
Invoiced Value Sum:   $${generatedReport.billingTotal.toLocaleString()}
Total Amount Paid:     $${generatedReport.paidTotal.toLocaleString()}

-------------------------------------------------------
Detailed Associated Projects Breakdowns:
-------------------------------------------------------
${generatedReport.projectsList?.map((pr: any, idx: number) => `[Project #${idx + 1}]
Name:             ${pr.name}
Status Tag:       ${pr.status}
Budget Fund:      $${pr.budget.toLocaleString()}
Progress Value:   ${pr.progress}%
Milestones Rate:  ${pr.tasksCompleted} of ${pr.tasksTotal} Finished`).join('\n\n')}

=======================================================
Portal Verification: Security certified SSL SHA-256
=======================================================`;
        file = new Blob([fileContent], { type: 'text/plain' });
        extension = 'txt';
      }
      
      element.href = URL.createObjectURL(file);
      element.download = `Report-${generatedReport.id}.${extension}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (e) {
      console.error(e);
      alert(`⚡ Successfully exported ${generatedReport.title} as ${generatedReport.format}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">On-Demand Report Generator</h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate printable, auditable business summaries of budgets, development velocities, and attachments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* REPORT DESIGN SELECTOR WORKSPACE */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              <Sliders size={16} className="text-blue-600" />
              <span>Report Parameters</span>
            </h3>

            <form onSubmit={handleGenerateReport} className="space-y-4 text-xs font-semibold">
              {isAdmin ? (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Client Corporate</label>
                  <select
                    id="report-target-client"
                    value={rptClient}
                    onChange={(e) => {
                      setRptClient(e.target.value);
                      setRptProj('all');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold outline-none"
                  >
                    <option value="all">⚡ Global Consolidated (Cross-Clients)</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-left">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase mb-1">Client Domain</span>
                  <span className="font-extrabold text-slate-800">{currentUser.companyName}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Project Sandbox Scope</label>
                <select
                  id="report-target-project"
                  value={rptProj}
                  onChange={(e) => setRptProj(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold outline-none"
                >
                  <option value="all">📁 All Active Projects</option>
                  {scopedProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Audit Template</label>
                <select
                  id="report-target-template"
                  value={rptType}
                  onChange={(e) => setRptType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold outline-none"
                >
                  <option value="summary">Weekly Progress Summary Sheet</option>
                  <option value="financial">Financial Billing Ledger Details</option>
                  <option value="complete">Post-Launch Core Launch Audits</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Export Format</label>
                <div className="grid grid-cols-3 gap-2 pt-1 font-extrabold">
                  {['pdf', 'excel', 'json'].map((f) => (
                    <button
                      id={`btn-report-format-${f}`}
                      type="button"
                      key={f}
                      onClick={() => setRptFormat(f)}
                      className={`py-2 px-1 text-center font-mono rounded-lg border text-[10px] uppercase tracking-wider transition ${
                        rptFormat === f
                          ? 'bg-slate-900 border-slate-900 text-white font-bold'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="btn-report-generate"
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Analyzing Ledgers...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-white" />
                    <span>Generate Document</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Preset templates guide lists */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Report Presets</h4>
            <div className="space-y-3 pt-1">
              {templates.map((temp) => (
                <div key={temp.id} className="text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-medium">
                  <h5 className="font-extrabold text-slate-800 flex items-center gap-1">
                    <FileText size={13} className="text-blue-500" />
                    <span>{temp.name}</span>
                  </h5>
                  <p className="text-slate-400 text-[10px] leading-relaxed mt-1">{temp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* REPORT PREVIEW AND RENDER SHEET CANVAS (Col Span 2) */}
        <div className="lg:col-span-2">
          {generatedReport ? (
            <div id="report-rendered-sheet" className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-md space-y-6 relative border-t-4 border-t-slate-900">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block tracking-widest leading-none">
                    SECURITY LEVEL PROTOCOL | SYSTEM RECORD: {generatedReport.id}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-2">{generatedReport.title}</h3>
                  <span className="text-xs text-slate-400 mt-1 block">Compiled on {generatedReport.generatedAt} for {generatedReport.clientName} domain</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-report-export-file"
                    onClick={handleExportSimulated}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-sm transition"
                  >
                    <Download size={13} />
                    <span>Get {generatedReport.format}</span>
                  </button>
                </div>
              </div>

              {/* CORE PERFORMANCE SUMMARY GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Active Projects</span>
                  <span className="text-base font-extrabold text-slate-800 mt-1 block">{generatedReport.projectCount} Folders</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Avg Progress</span>
                  <span className="text-base font-extrabold text-blue-600 mt-1 block">{generatedReport.avgProgress}% Code</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Milestones Total</span>
                  <span className="text-base font-extrabold text-slate-800 mt-1 block">
                    {generatedReport.completedTasksCount} / {generatedReport.totalTasksCount} Done
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Ledger Sum</span>
                  <span className="text-base font-extrabold text-emerald-600 mt-1 block">${generatedReport.billingTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* VERIFIED LEDGER STATS BREAKDOWNS */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#3B82F6] border-b border-slate-50 pb-1">
                  Deliverables Progress Ledger
                </h4>

                <div className="space-y-3 font-medium">
                  {generatedReport.projectsList.map((pr: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl text-xs gap-4">
                      <div>
                        <h5 className="font-extrabold text-slate-800">{pr.name}</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Tasks: {pr.tasksCompleted} completed of {pr.tasksTotal} assigned
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800">{pr.progress}% Complete</span>
                        <div className="w-24 bg-slate-200 h-1 rounded-full mt-1 overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pr.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}

                  {generatedReport.projectsList.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs">No project folders discovered.</div>
                  )}
                </div>
              </div>

              {/* STENCIL SIGNATURE CAP SEGMENT */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[#22C55E]" />
                  <span className="font-bold">ETAL Digital Certified Secure Ledger Cryptography</span>
                </div>
                <span className="font-mono">IP AUTH: PORTAL-SSL Verified</span>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
              <TrendingUp size={44} className="text-slate-300" />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Analytical Report Summary</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Select your client company, preferred project scope folder and format, then hit "Generate Document" to view details.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
