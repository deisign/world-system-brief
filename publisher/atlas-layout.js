import {atlasEscape,atlasSectionTitle} from "./atlas-primitives.js";

function path(value){
 if(typeof value!=="string"||!/^\/(?!\/)[a-zA-Z0-9/_-]+\/$/.test(value))throw Error("Invalid local Atlas destination");
 return value;
}

export function atlasEditorialHeader({subtitle,kicker,title,lead,links=[]}){
 if(!subtitle||!kicker||!title||!lead||!Array.isArray(links)||links.length<2)throw Error("Incomplete Atlas masthead");
 const E=atlasEscape;
 const items=links.map(link=>{
  if(!link?.label)throw Error("Missing Atlas navigation label");
  return `<a href="${E(path(link.href))}">${E(link.label)}</a>`;
 }).join("");
 return `<header class="mast atlas-mast">WORLD SYSTEM BRIEF <small>${E(subtitle)}</small></header><p class="kicker atlas-kicker">${E(kicker)}</p><h1>${E(title)}</h1><p class="lead">${E(lead)}</p><nav class="nav atlas-nav" aria-label="Editorial navigation">${items}</nav>`;
}

export function atlasRegisterHeading(number,label){
 return `<h2 class="atlas-register-heading">${atlasSectionTitle(number,label)}</h2>`;
}

export const atlasSharedShellCSS=`
.atlas-mast{min-width:0}
.atlas-mast small{overflow-wrap:anywhere}
.atlas-nav{display:flex;align-items:baseline;flex-wrap:wrap;gap:clamp(12px,2vw,24px)}
.atlas-nav a{display:inline-block;min-height:24px}
.atlas-register-heading{overflow-wrap:anywhere}
.atlas-study-links{display:flex;flex-wrap:wrap;align-items:center;gap:clamp(10px,2vw,22px);border-top:1px solid var(--rule,#B8AC9B);border-bottom:1px solid var(--rule,#B8AC9B);padding:13px 0;margin:0 0 28px;font:700 11px/1.5 "IBM Plex Mono",monospace}
.atlas-study-links a{color:inherit;text-decoration:none}
.atlas-study-links a:hover,.atlas-study-links a[aria-current="page"]{color:var(--red,#A2362A)}
.atlas-study-links a[aria-current="page"]{border-bottom:2px solid currentColor}
.atlas-study-links a:focus-visible{outline:3px solid var(--blue,#46697A);outline-offset:3px}

@media(max-width:600px){
 .atlas-mast{display:block}
 .atlas-mast small{display:block;margin-top:10px}
 .atlas-nav{column-gap:16px;row-gap:7px}
}
`;
