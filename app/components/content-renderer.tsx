import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import Image from "next/image";
import type { ContentBlock } from "@/lib/types";

const markdownComponents: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-accent underline underline-offset-2 hover:text-accent/80"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-border px-1.5 py-0.5 text-sm">{children}</code>
  ),
};

const inlineComponents: Components = {
  ...markdownComponents,
  p: ({ children }) => <>{children}</>,
};

function InlineMarkdown({ text }: { text: string }) {
  return <Markdown components={inlineComponents}>{text}</Markdown>;
}

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="mt-10 space-y-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <div className="leading-relaxed text-gray-300">
          <Markdown components={markdownComponents}>{block.text}</Markdown>
        </div>
      );

    case "heading":
      return block.level === 2 ? (
        <h2 className="text-2xl font-bold tracking-tight">
          <InlineMarkdown text={block.text} />
        </h2>
      ) : (
        <h3 className="text-xl font-semibold tracking-tight">
          <InlineMarkdown text={block.text} />
        </h3>
      );

    case "blockquote":
      return (
        <div className="border-l-2 border-accent pl-4 italic text-muted">
          <InlineMarkdown text={block.text} />
        </div>
      );

    case "unordered-list":
      return (
        <ul className="list-disc space-y-1 pl-6 text-gray-300">
          {block.items.map((item, i) => (
            <li key={i}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>
      );

    case "ordered-list":
      return (
        <ol className="list-decimal space-y-1 pl-6 text-gray-300">
          {block.items.map((item, i) => (
            <li key={i}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ol>
      );

    case "image":
      if (!block.src) return null;
      return (
        <figure>
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
  }
}
