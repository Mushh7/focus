import type { Quote } from "../types";

export function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <figure className="quote-card">
      <blockquote className="quote-card__text">&ldquo;{quote.text}&rdquo;</blockquote>
      <figcaption className="quote-card__author">&mdash; {quote.author}</figcaption>
    </figure>
  );
}
