/**
 * Sanitize HTML/Markdown content to prevent XSS attacks
 * This is a lightweight sanitizer that works on both client and server
 * @param content - Content to sanitize
 * @returns Sanitized content
 */
export function sanitizeContent(content: string): string {
  if (!content) return '';
  
  // Simple regex-based sanitization (works on both server and client)
  let sanitized = content;
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove inline event handlers
  sanitized = sanitized.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\bon\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '');
  
  // Remove dangerous tags
  sanitized = sanitized.replace(/<iframe[^>]*>/gi, '');
  sanitized = sanitized.replace(/<object[^>]*>/gi, '');
  sanitized = sanitized.replace(/<embed[^>]*>/gi, '');
  sanitized = sanitized.replace(/<form[^>]*>/gi, '');
  
  return sanitized;
}

/**
 * Sanitize markdown content specifically (less restrictive than HTML)
 * @param markdown - Markdown content to sanitize
 * @returns Sanitized markdown
 */
export function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  // For markdown, we mainly want to remove:
  // 1. Script tags
  // 2. Inline event handlers
  // 3. javascript: URLs
  
  let sanitized = markdown;
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove inline event handlers
  sanitized = sanitized.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\bon\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '');
  
  // Remove data: URLs (except for images)
  sanitized = sanitized.replace(/href\s*=\s*["']data:[^"']*["']/gi, '');
  
  return sanitized;
}

/**
 * Validate that content doesn't contain dangerous patterns
 * @param content - Content to validate
 * @returns true if content is safe
 */
export function isContentSafe(content: string): boolean {
  if (!content) return true;
  
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // event handlers
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(content));
}

