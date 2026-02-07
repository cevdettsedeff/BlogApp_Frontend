import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';

interface MarkdownContentProps {
  content: string;
}

const getPrismLanguage = (lang?: string | null) => {
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

export function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content.trim()) {
    return <p className="text-muted-foreground">İçerik eklenmedi.</p>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const isInline = !className;
          if (isInline) {
            return (
              <code
                className="rounded bg-muted px-1 py-0.5 text-sm text-foreground"
                {...props}
              >
                {children}
              </code>
            );
          }
          const raw = String(children ?? '');
          const lang = className?.replace('language-', '') ?? null;
          const prismLang = getPrismLanguage(lang);
          const highlighted = prismLang
            ? Prism.highlight(raw, Prism.languages[prismLang] || Prism.languages.plain, prismLang)
            : raw;
          return (
            <code
              className={prismLang ? `language-${prismLang}` : className}
              dangerouslySetInnerHTML={{ __html: highlighted }}
              {...props}
            />
          );
        },
        pre({ children, ...props }) {
          return (
            <pre
              className="overflow-x-auto rounded-lg border bg-muted/40 p-4 text-sm"
              {...props}
            >
              {children}
            </pre>
          );
        },
        a({ children, ...props }) {
          return (
            <a
              className="text-primary underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
