"use client";

/**
 * A link that plays a page transition on its way out (lib/route-transition.ts).
 *
 * A plain left click asks the curtain to take over; anything else (a new
 * tab, a modified click, reduced motion, no curtain listening) is left to
 * the link, so it always goes where it says.
 */

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { requestTransition, type TransitionKind } from "@/lib/route-transition";
import { loadCurtain } from "@/components/route-transition-load";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  transition: TransitionKind;
  /** The destination's name, shown on the curtain. */
  label: string;
};

const warm = () => {
  void loadCurtain().catch(() => {
    /* the click will try again, or navigate plainly */
  });
};

export default function TransitionLink({ href, transition, label, onClick, ...rest }: Props) {
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (requestTransition(transition, href, label)) e.preventDefault();
  };
  return <Link {...rest} href={href} onClick={go} onPointerEnter={warm} onFocus={warm} onTouchStart={warm} />;
}
