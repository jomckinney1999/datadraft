/**
 * The home page opens like a game: a title screen, a referee, "press any
 * button". The press blows his whistle — with sound, which is only possible
 * because a key press or tap is what browsers require before a page may make
 * any — and a cartoon iris opens onto the site.
 *
 * Rules, all load-bearing:
 *
 * - **Once per browser session, home page only.** It is an entrance, not a
 *   toll. Someone who came back to the home page from the question bank has
 *   already walked in. The flag is `sqlsports.gate.v1` in sessionStorage.
 * - **It decides before the first paint.** The inline script below runs while
 *   the HTML is still being parsed and puts `data-gate="on"` on <html>; the CSS
 *   only shows the gate under that attribute. Deciding after hydration would
 *   flash the whole hero first and then cover it.
 * - **It can never lock anyone out.** No JavaScript: the script never runs, the
 *   attribute is never set, the gate never shows. JavaScript that runs but
 *   never hydrates: the script takes the attribute back off after 8 seconds
 *   unless the React side has claimed it (`window.__ddGate`). A press before
 *   hydration is remembered (`__ddGatePress`) and played on mount; the page
 *   has already had its user gesture by then, so the whistle is still allowed.
 * - **Not for crawlers.** A bot's first paint should be the page, not a
 *   title screen.
 */

import TitleGateClient from "@/components/title-gate-client";

const GATE_SCRIPT = `
(function(){try{
if(sessionStorage.getItem("sqlsports.gate.v1"))return;
if(/bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(navigator.userAgent))return;
var d=document.documentElement;
d.setAttribute("data-gate","on");
var mark=function(e){if(e.type==="keydown"&&(e.metaKey||e.ctrlKey||e.altKey))return;window.__ddGatePress=true;};
window.addEventListener("keydown",mark,{once:true});
window.addEventListener("pointerdown",mark,{once:true});
setTimeout(function(){if(!window.__ddGate)d.removeAttribute("data-gate");},8000);
}catch(e){}})();
`;

export default function TitleGate() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />
      <TitleGateClient />
    </>
  );
}
