import type {AttributifyAttributes} from '@unocss/preset-attributify'

type ExtraUnoAttributes = {
  duration?: string | boolean;
  leading?: string | boolean;
}

type UnoAttributes = Omit<AttributifyAttributes, "children" | "size"> & ExtraUnoAttributes;

declare module 'solid-js' {
  namespace JSX {
    interface HTMLAttributes<T> extends UnoAttributes {
    }

    interface SvgSVGAttributes<T> extends UnoAttributes {
    }
  }
}
