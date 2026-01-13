import { ReactNode } from 'react'

interface MarkdownParagraphProps {
    children?: ReactNode
}

export function MarkdownParagraph({ children }: Readonly<MarkdownParagraphProps>) {
    return <p className="mb-3 last:mb-0">{children}</p>
}

interface MarkdownStrongProps {
    children?: ReactNode
}

export function MarkdownStrong({ children }: Readonly<MarkdownStrongProps>) {
    return <strong className="font-bold text-gray-900">{children}</strong>
}

interface MarkdownLinkProps {
    children?: ReactNode
    href?: string
}

export function MarkdownLink({ children, href }: Readonly<MarkdownLinkProps>) {
    // Security: Only allow http/https links
    const isValidUrl = href?.startsWith('http://') || href?.startsWith('https://')

    if (!isValidUrl || !href) {
        return <span>{children || href}</span>
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
            aria-label={typeof children === 'string' ? children : `Link to ${href}`}
        >
            {children || href}
        </a>
    )
}
