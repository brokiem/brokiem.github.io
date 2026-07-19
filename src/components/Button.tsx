import {A} from "@solidjs/router";

type ButtonLinkProps = {
  text: string;
  url: string;
  variant?: "primary" | "secondary";
};

export function ButtonLink({text, url, variant = "primary"}: ButtonLinkProps) {
  const className = `action-link action-link--${variant}`;
  const content = (
    <>
      <span>{text}</span>
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path fill="currentColor" d="m7.2 4.4 5.6 5.6-5.6 5.6 1.4 1.4 7-7-7-7-1.4 1.4Z"/>
      </svg>
    </>
  );

  if (url.startsWith("/")) {
    return (
      <A href={url} class={className}>
        {content}
      </A>
    );
  }

  return (
    <a
      href={url}
      class={className}
      target="_blank"
      rel="noreferrer"
    >
      {content}
    </a>
  );
}
