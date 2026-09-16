import { USER } from "../data/dashboard";
import { formatFullDate, greetingFor } from "../lib/format";

export function Greeting({ now }: { now: Date }) {
  return (
    <header className="greeting">
      <div>
        <h1 className="greeting__title">
          {greetingFor(now)}, {USER.firstName}
        </h1>
        <p className="greeting__subtitle">Let&rsquo;s make today count.</p>
      </div>
      <p className="greeting__date">
        <time dateTime={now.toISOString().slice(0, 10)}>{formatFullDate(now)}</time>
      </p>
    </header>
  );
}

export function AsideBar() {
  return (
    <div className="app__aside-bar">
      <p className="header-quote">&ldquo;{USER.tagline}&rdquo;</p>
      <span className="avatar" aria-hidden="true">
        {USER.initials}
      </span>
      <span className="sr-only">Signed in as {USER.firstName}</span>
    </div>
  );
}
