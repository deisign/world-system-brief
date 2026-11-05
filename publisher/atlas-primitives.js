export const atlasPalette=Object.freeze({
 paper:"#F3EBDD",
 ink:"#232523",
 constraint:"#A2362A",
 related:"#46697A",
 downstream:"#B08C3E",
 rule:"#B8AC9B"
});

export const atlasEscape=value=>String(value??"").replace(/[&<>"']/g,ch=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[ch]));

export function atlasSectionTitle(number,label){
 if(!Number.isInteger(number)||number<1||number>99)throw Error("Invalid editorial section number");
 const clean=String(label??"").replace(/^\s*\d+\s*\/\s*/,"").trim();
 if(!clean)throw Error("Missing section title");
 return String(number).padStart(2,"0")+" / "+atlasEscape(clean);
}

export function atlasSourceAnchor({url,label,title}){
 if(typeof url!=="string"||!/^https:\/\/[^\s<>"']+$/i.test(url))throw Error("Source URL must be absolute HTTPS");
 if(typeof label!=="string"||!label.trim())throw Error("Missing source label");
 const tip=title? ` title="${atlasEscape(title)}"`:"";
 return `<a href="${atlasEscape(url)}" rel="noopener noreferrer"${tip}>${atlasEscape(label)}</a>`;
}
