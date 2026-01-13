import React from 'react'

interface MarkdownListProps {
    children?: React.ReactNode
    node?: unknown
}

export const MarkdownUnorderedList: React.FC<MarkdownListProps> = ({ children, ...props }) => (
    <ul className="space-y-1 list-none" {...props}>
        {children}
    </ul>
)

export const MarkdownListItem: React.FC<MarkdownListProps> = ({ children, ...props }) => (
    <li className="flex gap-2" {...props}>
        <span className="font-bold text-blue-700 flex-shrink-0">•</span>
        <span className="flex-1">{children}</span>
    </li>
)

interface MarkdownAnchorProps {
    children?: React.ReactNode
    href?: string
    node?: unknown
}

export const MarkdownAnchorWithValidation: React.FC<MarkdownAnchorProps> = ({ children, href, ...props }) => {
    const validHref = href || ''

    if (validHref.startsWith('http://') || validHref.startsWith('https://')) {
        return (
            <a
                {...props}
                href={validHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
            >
                {children}
            </a>
        )
    }

    return <span>{children}</span>
}

interface MarkdownParagraphInlineProps {
    children?: React.ReactNode
    node?: unknown
}

export const MarkdownParagraphInline: React.FC<MarkdownParagraphInlineProps> = ({ children, ...props }) => (
    <span {...props}>{children}</span>
)
