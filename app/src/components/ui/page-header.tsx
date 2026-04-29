import { Eyebrow } from './eyebrow';

type Props = {
  eyebrow?: string;
  title: string;
  lede?: string;
};

export function PageHeader({ eyebrow, title, lede }: Props) {
  return (
    <header className="mb-12 border-b border-[color:var(--color-rule)] pb-8">
      {eyebrow ? (
        <div className="mb-4">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <h1 className="text-(length:--text-display) leading-(--text-display--line-height) tracking-(--text-display--letter-spacing) font-[var(--font-display)]">
        {title}
      </h1>
      {lede ? (
        <p className="mt-4 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
          {lede}
        </p>
      ) : null}
    </header>
  );
}
