import { type ReactNode } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const getReadingTime = (content: string) => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const getPrismLanguage = (lang: string | null) => {
  if (!lang) return null;
  const normalized = lang.toLowerCase();
  if (['js', 'javascript'].includes(normalized)) return 'javascript';
  if (['ts', 'typescript'].includes(normalized)) return 'typescript';
  if (['html', 'markup'].includes(normalized)) return 'markup';
  if (['css'].includes(normalized)) return 'css';
  if (['json'].includes(normalized)) return 'json';
  if (['bash', 'sh', 'shell'].includes(normalized)) return 'bash';
  if (['py', 'python'].includes(normalized)) return 'python';
  return null;
};

const renderInline = (text: string) => {
  const parts: ReactNode[] = [];
  let rest = text;
  let keyIndex = 0;

  while (rest.length) {
    const match = rest.match(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/);
    if (!match || match.index === undefined) {
      parts.push(rest);
      break;
    }

    if (match.index > 0) {
      parts.push(rest.slice(0, match.index));
    }

    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={`b-${keyIndex++}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      parts.push(<em key={`i-${keyIndex++}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`')) {
      parts.push(
        <code key={`c-${keyIndex++}`} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('![')) {
      const imageMatch = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageMatch) {
        const [, alt, src] = imageMatch;
        parts.push(
          <img
            key={`img-${keyIndex++}`}
            src={src}
            alt={alt}
            className="my-3 max-h-80 w-full rounded-md border object-cover"
            loading="lazy"
          />
        );
      }
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        parts.push(
          <a
            key={`l-${keyIndex++}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            {label}
          </a>
        );
      }
    }

    rest = rest.slice(match.index + token.length);
  }

  return parts;
};

export const renderMarkdown = (markdown: string) => {
  const lines = markdown.split('\n');
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listType: 'ordered' | 'unordered' | null = null;
  let quoteLines: string[] = [];
  let codeLines: string[] = [];
  let codeLang: string | null = null;
  let inCode = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(' ');
    blocks.push(
      <p key={`p-${blocks.length}`} className="leading-relaxed text-sm text-muted-foreground">
        {renderInline(text)}
      </p>
    );
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length || !listType) return;
    const listClass = 'space-y-1 pl-5 text-sm text-muted-foreground';
    if (listType === 'ordered') {
      blocks.push(
        <ol key={`ol-${blocks.length}`} className={`list-decimal ${listClass}`}>
          {listItems.map((item, index) => (
            <li key={`li-${index}`}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    } else {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className={`list-disc ${listClass}`}>
          {listItems.map((item, index) => (
            <li key={`li-${index}`}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    }
    listItems = [];
    listType = null;
  };

  const flushQuote = () => {
    if (!quoteLines.length) return;
    blocks.push(
      <blockquote
        key={`quote-${blocks.length}`}
        className="border-l-2 border-muted-foreground/30 pl-3 text-sm text-muted-foreground"
      >
        {renderInline(quoteLines.join(' '))}
      </blockquote>
    );
    quoteLines = [];
  };

  const flushCode = () => {
    if (!codeLines.length) return;
    const raw = codeLines.join('\n');
    const prismLang = getPrismLanguage(codeLang);
    const highlighted = prismLang
      ? Prism.highlight(raw, Prism.languages[prismLang] || Prism.languages.plain, prismLang)
      : escapeHtml(raw);
    blocks.push(
      <div key={`code-${blocks.length}`} className="space-y-1">
        {codeLang && (
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {codeLang}
          </div>
        )}
        <pre
          className={`overflow-x-auto rounded-md bg-muted p-3 text-xs${
            prismLang ? ` language-${prismLang}` : ''
          }`}
        >
          <code
            className={prismLang ? `language-${prismLang}` : undefined}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    );
    codeLines = [];
    codeLang = null;
  };

  lines.forEach((line) => {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        flushQuote();
        const lang = line.trim().slice(3).trim();
        codeLang = lang || null;
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const headingClass =
        level === 1
          ? 'text-base font-semibold'
          : level === 2
            ? 'text-sm font-semibold'
            : 'text-sm font-medium';
      blocks.push(
        <h3 key={`h-${blocks.length}`} className={headingClass}>
          {renderInline(text)}
        </h3>
      );
      return;
    }

    const imageLineMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageLineMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      const [, alt, src] = imageLineMatch;
      blocks.push(
        <img
          key={`img-${blocks.length}`}
          src={src}
          alt={alt}
          className="my-4 max-h-96 w-full rounded-lg border object-cover"
          loading="lazy"
        />
      );
      return;
    }

    const listMatch = line.match(/^[-*]\s+(.*)$/);
    const orderedListMatch = line.match(/^\d+\.\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== 'unordered') {
        flushList();
      }
      listType = 'unordered';
      listItems.push(listMatch[1]);
      return;
    }
    if (orderedListMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== 'ordered') {
        flushList();
      }
      listType = 'ordered';
      listItems.push(orderedListMatch[1]);
      return;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(quoteMatch[1]);
      return;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushQuote();
      return;
    }

    paragraph.push(line.trim());
  });

  if (inCode) {
    flushCode();
  }
  flushParagraph();
  flushList();
  flushQuote();

  return blocks;
};
