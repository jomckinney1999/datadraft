/**
 * The curtain's drawings, fetched on intent (a hover, a focus, a touch on a
 * transition link) rather than with every page: most visitors never press
 * one. Shared by the link and the curtain so both ask for the same chunk.
 */
export const loadCurtain = () => import("./route-transition-curtain");
