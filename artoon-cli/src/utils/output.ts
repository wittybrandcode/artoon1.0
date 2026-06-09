import chalk from 'chalk';

export const colors = {
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  dim: chalk.dim,
  bold: chalk.bold,
};

export function printSuccess(message: string): void {
  console.log(colors.success('✓'), message);
}

export function printError(message: string): void {
  console.error(colors.error('✗'), message);
}

export function printWarning(message: string): void {
  console.log(colors.warning('⚠'), message);
}

export function printInfo(message: string): void {
  console.log(colors.info('ℹ'), message);
}

export function printDivider(): void {
  console.log(colors.dim('─'.repeat(50)));
}

export interface ValidationIssue {
  code: string;
  message: string;
  line?: number;
  severity: 'error' | 'warning' | 'info';
}

export function formatIssue(issue: ValidationIssue): string {
  const lineInfo = issue.line ? `line ${issue.line}: ` : '';
  const codeInfo = issue.code ? `[${issue.code}] ` : '';
  
  switch (issue.severity) {
    case 'error':
      return `${colors.error('error')} ${lineInfo}${codeInfo}${issue.message}`;
    case 'warning':
      return `${colors.warning('warn')}  ${lineInfo}${codeInfo}${issue.message}`;
    case 'info':
      return `${colors.info('info')}  ${lineInfo}${codeInfo}${issue.message}`;
  }
}

export function formatSummary(errors: number, warnings: number): string {
  const parts: string[] = [];
  
  if (errors > 0) {
    parts.push(colors.error(`${errors} error${errors > 1 ? 's' : ''}`));
  }
  if (warnings > 0) {
    parts.push(colors.warning(`${warnings} warning${warnings > 1 ? 's' : ''}`));
  }
  
  if (parts.length === 0) {
    return colors.success('No issues found');
  }
  
  return parts.join(', ');
}
