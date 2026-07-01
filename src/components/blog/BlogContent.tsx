import { cn } from "@/lib/utils";

interface BlogContentProps {
  html: string;
  className?: string;
}

export function BlogContent({ html, className }: BlogContentProps) {
  return (
    <div
      className={cn(
        "blog-content prose prose-neutral max-w-none",
        "text-[var(--text-muted)] leading-relaxed",
        "[&_h2]:font-heading [&_h2]:text-[var(--text)] [&_h2]:mt-8 [&_h2]:mb-3",
        "[&_h3]:font-heading [&_h3]:text-[var(--text)] [&_h3]:mt-6 [&_h3]:mb-2",
        "[&_p]:mb-4 [&_p]:leading-relaxed",
        "[&_a]:text-[#FF6A3D] [&_a]:font-medium [&_a]:underline-offset-2 hover:[&_a]:underline",
        "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-[#FF6A3D] [&_blockquote]:pl-4 [&_blockquote]:italic",
        "[&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-xl",
        "[&_figure]:my-6 [&_figure]:max-w-full",
        "[&_figure.wp-block-table]:overflow-x-auto [&_figure.wp-block-table]:rounded-xl",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
