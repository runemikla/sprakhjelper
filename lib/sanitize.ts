import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML/Markdown content to prevent XSS attacks
 * @param content - Content to sanitize
 * @returns Sanitized content
 */
export function sanitizeContent(content: string): string {
  if (!content) return '';
  
  // Configure DOMPurify
  const config = {
    ALLOWED_TAGS: [
      // Text formatting
      'b', 'i', 'em', 'strong', 'u', 's', 'del', 'mark', 'small', 'sub', 'sup',
      // Lists
      'ul', 'ol', 'li',
      // Paragraphs and line breaks
      'p', 'br', 'hr',
      // Headers
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Quotes
      'blockquote',
      // Code
      'code', 'pre',
      // Tables
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      // Links (but sanitized)
      'a',
    ],
    ALLOWED_ATTR: [
      'href', // for links
      'title', // for tooltips
      'class', // for styling (but we control the classes)
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i, // Only allow https, http, and mailto
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  };
  
  return DOMPurify.sanitize(content, config);
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

