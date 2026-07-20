import {A} from "@solidjs/router";
import {ChevronIcon} from "./Icons";

type ActionLinkProps = {
  children: string;
  href: string;
  variant?: "primary" | "secondary";
};

export function ActionLink(props: ActionLinkProps) {
  const className = () => `action-link action-link--${props.variant ?? "primary"}`;
  const content = <><span>{props.children}</span><ChevronIcon/></>;

  if (props.href.startsWith("/")) {
    return <A href={props.href} class={className()} data-ripple>{content}</A>;
  }

  return <a href={props.href} class={className()} target="_blank" rel="noreferrer" data-ripple>{content}</a>;
}
