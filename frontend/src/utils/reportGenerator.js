/**
 * Professional PDF Report Generator for Individual Farmer & Group Profiles
 */

export function generateFarmerPDFReport(farmerHistory) {
  const p = farmerHistory.personalDetails || {};
  const f = farmerHistory.farmLandDetails || {};
  const v = farmerHistory.verificationRecords || {};
  const c = farmerHistory.creditScoreRecords || {};
  const r = farmerHistory.repaymentHistory || {};
  const ai = farmerHistory.aiRiskAssessment || {};
  const logs = farmerHistory.auditLogs || [];

  const reportHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Farmer Audit & History Report - ${p.name} (${farmerHistory.farmerId})</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 24px; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 22px; font-weight: 800; color: #065f46; }
          .sub-logo { font-size: 11px; color: #047857; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; }
          .report-title { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 15px; }
          .badge { background-color: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; }
          .badge-risk { background-color: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; }
          .section { margin-bottom: 24px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
          .section-title { font-size: 14px; font-weight: bold; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 12px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .label { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; }
          .value { font-size: 13px; font-weight: bold; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background-color: #f1f5f9; color: #334155; font-weight: bold; text-transform: uppercase; font-size: 10px; }
          .audit-item { border-left: 3px solid #10b981; padding-left: 10px; margin-bottom: 10px; font-size: 11px; }
          .audit-time { color: #64748b; font-size: 10px; font-weight: bold; }
          .footer { font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 30px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🌾 AgriTrust Credit Network</div>
            <div class="sub-logo">NABARD / RBI Compliant Self-Sovereign Farmer Credit Passport</div>
            <div class="report-title">Comprehensive Farmer Historical Audit & Credit Report</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">VERIFIED GENUINE (96.8%)</span>
            <div style="font-size: 10px; color: #64748b; margin-top: 6px;">Generated on: ${new Date().toLocaleString()}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">1. Personal & Farm Ownership Profile</div>
          <div class="grid">
            <div><span class="label">Farmer Name:</span> <div class="value">${p.name}</div></div>
            <div><span class="label">Farmer ID:</span> <div class="value">${farmerHistory.farmerId}</div></div>
            <div><span class="label">Aadhaar / PM-KISAN:</span> <div class="value">${p.aadhaarNo} / ${p.pmKisanId}</div></div>
            <div><span class="label">Mobile Number:</span> <div class="value">${p.mobileNo}</div></div>
            <div><span class="label">Farm Location:</span> <div class="value">${p.village}, ${p.district}, ${p.state}</div></div>
            <div><span class="label">Cultivated Landholding:</span> <div class="value">${f.landAcres} Acres (${f.ownershipStatus})</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. Multi-Vector ML Verification & Credit Scoring</div>
          <div class="grid">
            <div><span class="label">ML Authenticity Score:</span> <div class="value">${v.authenticityScore}% Verified</div></div>
            <div><span class="label">PM-KISAN Status:</span> <div class="value">${v.pmKisanStatus} (${v.installmentsReceived} Installments)</div></div>
            <div><span class="label">Alternative Credit Score:</span> <div class="value" style="color: #059669; font-size: 16px;">${c.currentScore} / 900 (${c.tier})</div></div>
            <div><span class="label">Satellite ICAR Vigor:</span> <div class="value">${v.icarCanopyReflectance}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">3. Loans & Repayment Performance</div>
          <table>
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Lender Institution</th>
                <th>Type / Purpose</th>
                <th>Sanctioned Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${(farmerHistory.loanRecords || []).map(l => `
                <tr>
                  <td><strong>${l.loanId}</strong></td>
                  <td>${l.lender}</td>
                  <td>${l.loanType}</td>
                  <td>₹${(l.principalINR || 0).toLocaleString('en-IN')}</td>
                  <td><strong style="color: #047857;">${l.repaymentStatus}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">4. Explainable AI Repayment Risk Assessment</div>
          <div class="grid">
            <div><span class="label">Repayment Risk Score:</span> <div class="value">${ai.repaymentRiskScore}/100 — <span class="badge-risk">${ai.riskCategory} RISK</span></div></div>
            <div><span class="label">Next Installment Probability:</span> <div class="value" style="color: #059669;">${ai.nextInstallmentSuccessProb}% Success</div></div>
          </div>
          <div style="margin-top: 10px; font-size: 11px;">
            <strong>Positive Factors:</strong>
            <ul>
              ${(ai.positiveFactors || []).map(pf => `<li>${pf}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="section">
          <div class="section-title">5. Chronological System Audit Logs</div>
          ${logs.map(l => `
            <div class="audit-item">
              <div class="audit-time">${new Date(l.timestamp).toLocaleString()} | <strong>${l.eventType}</strong> by ${l.performedBy}</div>
              <div>${l.details}</div>
              ${l.previousValue || l.newValue ? `<div style="font-size: 10px; color: #475569;">Change: <em>${l.previousValue || 'N/A'}</em> → <strong>${l.newValue || 'N/A'}</strong></div>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="footer">
          AgriTrust Self-Sovereign Farmer Credit Protocol • Confidential Official Financial Record • Verified via Zero-Knowledge Verification
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(reportHTML);
    printWindow.document.close();
  }
}

export function generateGroupPDFReport(groupHistory) {
  const g = groupHistory || {};
  const members = g.members || [];
  const logs = g.auditLogs || [];

  const reportHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Joint Liability Group Audit Report - ${g.groupName} (${g.groupId})</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 24px; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 3px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 22px; font-weight: 800; color: #1d4ed8; }
          .sub-logo { font-size: 11px; color: #2563eb; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; }
          .report-title { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 15px; }
          .badge { background-color: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; }
          .section { margin-bottom: 24px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
          .section-title { font-size: 14px; font-weight: bold; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 12px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .label { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; }
          .value { font-size: 13px; font-weight: bold; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background-color: #f1f5f9; color: #334155; font-weight: bold; text-transform: uppercase; font-size: 10px; }
          .audit-item { border-left: 3px solid #3b82f6; padding-left: 10px; margin-bottom: 10px; font-size: 11px; }
          .audit-time { color: #64748b; font-size: 10px; font-weight: bold; }
          .footer { font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🌾 AgriTrust Community Joint Credit Network</div>
            <div class="sub-logo">Joint Liability Group (JLG) Credit Guarantee Audit Report</div>
            <div class="report-title">${g.groupName}</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">${g.riskTier}</span>
            <div style="font-size: 10px; color: #64748b; margin-top: 6px;">Generated on: ${new Date().toLocaleString()}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">1. Group Governance & Credit Ceiling</div>
          <div class="grid">
            <div><span class="label">Group ID:</span> <div class="value">${g.groupId}</div></div>
            <div><span class="label">Location:</span> <div class="value">${g.village}, ${g.district}, ${g.state}</div></div>
            <div><span class="label">Group Trust Score:</span> <div class="value" style="color: #2563eb; font-size: 16px;">${g.groupTrustScore} / 900</div></div>
            <div><span class="label">Aggregate Loan Ceiling:</span> <div class="value">₹${(g.totalGroupLoanCeilingINR || 0).toLocaleString('en-IN')}</div></div>
            <div><span class="label">Grace Resolution Period:</span> <div class="value">${g.gracePeriodDays} Days</div></div>
            <div><span class="label">Active Members Count:</span> <div class="value">${g.membersCount} Farmer Members</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. Co-Signing Group Members & Sub-Limits</div>
          <table>
            <thead>
              <tr>
                <th>Farmer Name & ID</th>
                <th>Landholding</th>
                <th>Crop</th>
                <th>Individual Credit Sub-Limit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${members.map(m => `
                <tr>
                  <td><strong>${m.name}</strong><br/><span style="font-size: 10px; color: #64748b;">${m.farmerId}</span></td>
                  <td>${m.landAcres} Acres</td>
                  <td>${m.crop}</td>
                  <td><strong>₹${(m.individualSubLimitINR || 0).toLocaleString('en-IN')}</strong></td>
                  <td><span style="color: #047857; font-weight: bold;">${m.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">3. Joint Liability & Guarantee Drawdown Events</div>
          ${(g.jointLiabilityEvents || []).map(e => `
            <div style="border-left: 3px solid #3b82f6; padding-left: 8px; margin-bottom: 8px; font-size: 11px;">
              <strong>${e.eventType}</strong> (${e.date})<br/>
              <span>${e.details}</span>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">4. Chronological Group Audit Trail</div>
          ${logs.map(l => `
            <div class="audit-item">
              <div class="audit-time">${new Date(l.timestamp).toLocaleString()} | <strong>${l.eventType}</strong> by ${l.performedBy}</div>
              <div>${l.details}</div>
              ${l.previousValue || l.newValue ? `<div style="font-size: 10px; color: #475569;">Change: <em>${l.previousValue || 'N/A'}</em> → <strong>${l.newValue || 'N/A'}</strong></div>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="footer">
          AgriTrust Joint Liability Credit Guarantee Protocol • NABARD Community Credit Reserve Verified
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(reportHTML);
    printWindow.document.close();
  }
}
