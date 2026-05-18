.dashboardLayout {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px;
  min-height: 100vh;
  background: #f5f7fa;
  font-family: 'Segoe UI', system-ui, sans-serif;
  box-sizing: border-box;
}
@media (max-width: 900px) {
  .dashboardLayout { grid-template-columns: 1fr; }
}

.col {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.colTitle {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin: 0 0 4px 0;
}

.bodyPartSelect {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  color: #1e293b;
}
.bodyPartSelect:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
}

.dictationArea {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  color: #1e293b;
  box-sizing: border-box;
}
.dictationArea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
}
.dictationAreaListening {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
}

.btnMic {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
  color: #475569;
}
.btnMic:hover { background: #f1f5f9; }
.btnMicActive {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

.btnGenerate {
  width: 100%;
  padding: 11px;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btnGenerate:hover:not(:disabled) { background: #1d4ed8; }
.btnGenerate:disabled { opacity: 0.6; cursor: not-allowed; }

.reportOutput {
  flex: 1;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13.5px;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-y: auto;
  min-height: 320px;
  max-height: 70vh;
  color: #1e293b;
  background: #fafbfc;
  font-family: 'Courier New', monospace;
}
.reportPlaceholder {
  color: #94a3b8;
  font-family: inherit;
  font-size: 14px;
  font-style: italic;
}

.btnCopy {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  color: #475569;
}
.btnCopy:hover:not(:disabled) { background: #f1f5f9; }
.btnCopySuccess {
  background: #f0fdf4;
  border-color: #86efac;
  color: #16a34a;
}
.btnCopy:disabled { opacity: 0.4; cursor: not-allowed; }

.referencePanel {
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
}
.referencePanelEmpty { color: #94a3b8; font-size: 13px; }

.referenceTop,
.referenceBottom {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}
.refDivider {
  height: 1px;
  background: #e2e8f0;
  margin: 12px 0;
  flex-shrink: 0;
}

.refSectionTitle {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.refSectionIcon { font-size: 14px; }

.measurementSelect {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  color: #1e293b;
}
.measurementSelect:focus { outline: none; border-color: #3b82f6; }

.measurementDetail { display: flex; flex-direction: column; gap: 8px; }
.measurementMeta { display: flex; flex-direction: column; gap: 4px; }
.metaBadge {
  display: inline-block;
  padding: 2px 8px;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  width: fit-content;
}
.measurementDescription { font-size: 12px; color: #64748b; margin: 0; line-height: 1.5; }

.diagramContainer {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fafbfc;
  padding: 8px;
}
.diagramPlaceholder {
  padding: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.measurementEmpty,
.referencePanelEmpty {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 12px;
  text-align: center;
}

.normalValuesTable { width: 100%; border-collapse: collapse; font-size: 12px; }
.normalValuesTable tr:not(:last-child) td { border-bottom: 1px solid #f1f5f9; }
.nvLabel { padding: 5px 4px; color: #64748b; width: 45%; vertical-align: top; }
.nvValue { padding: 5px 4px; color: #1e293b; font-weight: 500; font-family: 'Courier New', monospace; }

.normalValuesAll {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  max-height: 200px;
}
.nvSummaryRow {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  background: #f8fafc;
  border-radius: 6px;
}
.nvSummaryName {
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 0;
  text-decoration: underline;
}
.nvSummaryFirst { font-size: 11px; color: #64748b; }

.loadingDots { display: inline-flex; gap: 4px; align-items: center; }
.loadingDots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
  animation: bounce 1.2s infinite ease-in-out;
}
.loadingDots span:nth-child(2) { animation-delay: 0.2s; }
.loadingDots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

.wFull { width: 100%; }
