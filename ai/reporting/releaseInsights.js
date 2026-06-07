import logger from "../../core/logging/logger.js";

class ReleaseInsights {
  /**
   * Compare current and previous release test results.
   * @param {Array<{ name: string, status: string, duration?: number }>} currentResults
   * @param {Array<{ name: string, status: string, duration?: number }>} previousResults
   */
  analyze(currentResults, previousResults) {
    const regressions = this.getRegressions(currentResults, previousResults);
    const improvements = this.getImprovements(currentResults, previousResults);
    const quality = this.assessReleaseQuality(currentResults);
    return {
      regressions,
      improvements,
      quality,
      newTests: currentResults.filter((c) => !previousResults.find((p) => p.name === c.name)).map((c) => c.name),
      removedTests: previousResults.filter((p) => !currentResults.find((c) => c.name === p.name)).map((p) => p.name),
    };
  }

  /**
   * Find tests that were passing before but now fail.
   * @param {Array} current @param {Array} previous
   */
  getRegressions(current, previous) {
    return current
      .filter((c) => c.status === "failed" && previous.find((p) => p.name === c.name)?.status === "passed")
      .map((c) => ({ name: c.name, error: c.error || "Unknown" }));
  }

  /**
   * Find tests that were failing before but now pass.
   * @param {Array} current @param {Array} previous
   */
  getImprovements(current, previous) {
    return current
      .filter((c) => c.status === "passed" && previous.find((p) => p.name === c.name)?.status === "failed")
      .map((c) => c.name);
  }

  /**
   * Compute an overall quality score for a release.
   * @param {Array<{ status: string }>} results
   */
  assessReleaseQuality(results) {
    if (!results.length) return { score: 0, grade: "N/A" };
    const passRate = (results.filter((r) => r.status === "passed").length / results.length) * 100;
    const score = Math.round(passRate);
    const grade = score >= 95 ? "A" : score >= 85 ? "B" : score >= 70 ? "C" : score >= 50 ? "D" : "F";
    return { score, grade, passRate: Math.round(passRate * 100) / 100 };
  }

  /** @param {object} analysis */
  generateReport(analysis) {
    logger.info(`[ReleaseInsights] Quality: ${analysis.quality?.grade}, ${analysis.regressions?.length || 0} regressions`);
    return {
      ...analysis,
      summary: [
        `Quality grade: ${analysis.quality?.grade} (${analysis.quality?.score}%)`,
        `Regressions: ${analysis.regressions?.length || 0}`,
        `Improvements: ${analysis.improvements?.length || 0}`,
        `New tests: ${analysis.newTests?.length || 0}`,
      ].join(" | "),
      generatedAt: new Date().toISOString(),
    };
  }
}

export default new ReleaseInsights();
