import {A} from "@solidjs/router";

export function ButtonLink({text, url}: { text: string, url: string }) {
  if (url.startsWith("/")) {
    return (
      <A
        href={url}
        class={"text-[#4A0F13] hover:bg-[#ffb59c]"}
        bg={"#ebc2b4"}
        flex={"auto"}
        text={"center sm"}
        align={"middle"}
        rounded={"full"}
        font={"semibold"}
        transition={"colors"}
        duration={"200"}
        md={"px-10"}
        p={"md:x-10 y-3"}
        w={"auto"}
        no-underline
      >
        <span>{text}</span>
      </A>
    );
  }

  return (
    <a
      href={url}
      class={"text-[#4A0F13] hover:bg-[#ffb59c]"}
      bg={"#ebc2b4"}
      flex={"auto"}
      text={"center sm"}
      align={"middle"}
      rounded={"full"}
      font={"semibold"}
      transition={"colors"}
      duration={"200"}
      md={"px-10"}
      p={"md:x-10 y-3"}
      w={"auto"}
      no-underline
    >
      <span>{text}</span>
    </a>
  )
}
