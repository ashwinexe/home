import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
} from "react";

export const blogMdxComponents = {
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="mb-5 mt-10 font-mono text-3xl font-bold leading-tight text-te-dark"
      {...props}
    />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mb-4 mt-12 font-mono text-xl font-bold uppercase tracking-[0.12em] text-te-dark"
      {...props}
    />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="mb-3 mt-8 font-mono text-lg font-semibold text-te-dark"
      {...props}
    />
  ),
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="my-[var(--blog-block-gap)] font-sans leading-[var(--blog-line-height)] text-te-dark/90"
      {...props}
    />
  ),
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="my-[var(--blog-block-gap)] ml-6 list-disc space-y-[var(--blog-list-gap)] font-sans text-te-dark/90"
      {...props}
    />
  ),
  ol: (props: HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="my-[var(--blog-block-gap)] ml-6 list-decimal space-y-[var(--blog-list-gap)] font-sans text-te-dark/90"
      {...props}
    />
  ),
  li: (props: HTMLAttributes<HTMLLIElement>) => (
    <li
      className="font-sans leading-[var(--blog-line-height)]"
      {...props}
    />
  ),
  a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-te-orange underline decoration-te-orange/40 underline-offset-4 hover:decoration-te-orange"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),
  code: (props: HTMLAttributes<HTMLElement>) => (
    <code
      className="rounded bg-te-gray px-1.5 py-0.5 font-mono text-sm text-te-dark"
      {...props}
    />
  ),
  pre: (props: HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="my-6 overflow-x-auto rounded-te bg-te-dark p-4 text-sm text-te-beige"
      {...props}
    />
  ),
  blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-6 border-l-2 border-te-orange pl-5 font-sans italic text-te-dark/85"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-te-gray" />,
  strong: (props: HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-te-dark" {...props} />
  ),
  img: (props: ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      className="my-8 rounded-te border border-te-gray"
      loading="lazy"
      {...props}
    />
  ),
};
