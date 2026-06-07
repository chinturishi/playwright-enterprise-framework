import logger from "../../core/logging/logger.js";

class MailReporter {
  #transporter = null;
  #from = "";

  /**
   * @param {object} smtpConfig - { host, port, user, pass, from }
   */
  configure(smtpConfig) {
    const { host, port, user, pass, from } = smtpConfig;
    this.#from = from;

    // Placeholder: replace with nodemailer.createTransport() when nodemailer is installed
    this.#transporter = {
      host,
      port,
      auth: { user, pass },
      sendMail: async (mailOptions) => {
        logger.warn("nodemailer not installed — email send is a no-op placeholder");
        logger.debug(`Would send to=${mailOptions.to} subject="${mailOptions.subject}"`);
        return { messageId: `placeholder-${Date.now()}` };
      },
    };
    logger.info(`Mail reporter configured (host=${host}, from=${from})`);
  }

  /**
   * @param {string|string[]} to
   * @param {string} subject
   * @param {string} htmlBody
   * @param {Array<{filename: string, path: string}>} [attachments=[]]
   * @returns {Promise<object>}
   */
  async sendReport(to, subject, htmlBody, attachments = []) {
    if (!this.#transporter) throw new Error("Mail reporter not configured");
    const mailOptions = {
      from: this.#from,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html: htmlBody,
      attachments,
    };

    logger.info(`Sending email report to ${mailOptions.to}`);
    const result = await this.#transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${result.messageId}`);
    return result;
  }

  /**
   * @param {object} results - { total, passed, failed, skipped, duration, suiteName, failures }
   * @returns {string} HTML email body
   */
  formatTestReport(results) {
    const { total = 0, passed = 0, failed = 0, skipped = 0, duration = 0, suiteName = "Test Suite", failures = [] } = results;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0";
    const statusColor = failed > 0 ? "#e74c3c" : "#27ae60";

    let failureRows = "";
    for (const f of failures) {
      failureRows += `<tr><td style="padding:6px;border:1px solid #ddd">${f.name}</td><td style="padding:6px;border:1px solid #ddd">${f.error}</td></tr>`;
    }

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto">
      <h2 style="color:${statusColor}">${failed > 0 ? "❌" : "✅"} ${suiteName} — ${failed > 0 ? "FAILED" : "PASSED"}</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #ddd"><b>Total</b></td><td style="padding:8px;border:1px solid #ddd">${total}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><b>Passed</b></td><td style="padding:8px;border:1px solid #ddd;color:#27ae60">${passed}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><b>Failed</b></td><td style="padding:8px;border:1px solid #ddd;color:#e74c3c">${failed}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><b>Skipped</b></td><td style="padding:8px;border:1px solid #ddd">${skipped}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><b>Pass Rate</b></td><td style="padding:8px;border:1px solid #ddd">${passRate}%</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><b>Duration</b></td><td style="padding:8px;border:1px solid #ddd">${(duration / 1000).toFixed(1)}s</td></tr>
      </table>
      ${failureRows ? `<h3 style="color:#e74c3c">Failures</h3><table style="border-collapse:collapse;width:100%"><tr><th style="padding:6px;border:1px solid #ddd">Test</th><th style="padding:6px;border:1px solid #ddd">Error</th></tr>${failureRows}</table>` : ""}
      <p style="color:#999;font-size:12px">Generated ${new Date().toISOString()}</p>
    </div>`;

    logger.debug("Formatted HTML email report");
    return html;
  }
}

export default new MailReporter();
