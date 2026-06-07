import logger from "../../core/logging/logger.js";

class AzurePipelineReporter {
  /** @returns {boolean} */
  isAzurePipeline() {
    return process.env.TF_BUILD === "True" || process.env.AZURE_PIPELINES === "true";
  }

  /**
   * @param {string} resultsPath - Path to test results file (JUnit XML, NUnit, etc.)
   * @param {string} [format='JUnit'] - Result format
   */
  publishResults(resultsPath, format = "JUnit") {
    const cmd = `##vso[results.publish type=${format};resultFiles=${resultsPath};mergeResults=true;]`;
    console.log(cmd);
    logger.info(`Azure Pipelines: publishing results from ${resultsPath}`);
  }

  /**
   * @param {string} type - Attachment type (e.g. 'Distributedtask.Task.TestResult')
   * @param {string} name - Display name
   * @param {string} filePath - Absolute path to file
   */
  addAttachment(type, name, filePath) {
    console.log(`##vso[task.addattachment type=${type};name=${name};]${filePath}`);
    logger.info(`Azure Pipelines: attached ${name}`);
  }

  /**
   * @param {'warning'|'error'} type
   * @param {string} message
   * @param {string} [sourcePath]
   * @param {number} [lineNumber]
   */
  logIssue(type, message, sourcePath, lineNumber) {
    const props = [];
    if (sourcePath) props.push(`sourcepath=${sourcePath}`);
    if (lineNumber) props.push(`linenumber=${lineNumber}`);
    const propStr = props.length ? props.join(";") + ";" : "";
    console.log(`##vso[task.logissue type=${type};${propStr}]${message}`);
    logger.debug(`Azure Pipelines ${type}: ${message}`);
  }

  /**
   * @param {string} name
   * @param {string} value
   * @param {boolean} [isSecret=false]
   */
  setVariable(name, value, isSecret = false) {
    const secretPart = isSecret ? "issecret=true;" : "";
    console.log(`##vso[task.setvariable variable=${name};${secretPart}]${value}`);
    logger.debug(`Azure Pipelines: set variable ${name}`);
  }
}

export default new AzurePipelineReporter();
