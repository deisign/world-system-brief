// Navigation bridge for independently rendered SYSTEM, POSTER, and dependency pages.
// Does not alter their data or fixed-format visual compositions.
export function addAtlasNavigation(html,{lang="en",date="",mode=""}={}){
 const u=lang==="ua",other=u?"en":"ua",base="/"+lang+"/";
 const nav=[["READ",base+"brief/"+date+"/"],["SYSTEM",base+"system/"+date+"/"],["POSTER",base+"poster/"+date+"/"],[u?"АРХІВ":"ARCHIVE",base+"archive/"],[u?"СУТНОСТІ":"ENTITIES",base+"entities/"],[u?"ЗАЛЕЖНОСТІ":"DEPENDENCIES",base+"dependencies/"],[u?"ТРАЄКТОРІЇ":"TRAJECTORIES",base+"trajectories/"],[other.toUpperCase(),"/"+other+"/"+(mode==="dependencies"?"dependencies/":mode==="poster"||mode==="system"?mode+"/"+date+"/":"")]];
 const links=nav.map(([label,href])=>'<a href="'+href+'">'+label+'</a>').join("");
 const css='<style>:root{--wsb-paper:#F3EBDD;--wsb-ink:#232523;--wsb-red:#A2362A;--wsb-blue:#46697A;--wsb-rule:#CFC4B3}.wsb-topnav{box-sizing:border-box;display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:center;padding:15px 20px;background:var(--wsb-paper);border-top:7px solid var(--wsb-ink);border-bottom:1px solid var(--wsb-ink);color:var(--wsb-ink);font:700 11px "IBM Plex Mono","Courier New",monospace;letter-spacing:.04em}.wsb-topnav a{color:inherit!important;text-decoration:none!important}.wsb-topnav a:hover{color:var(--wsb-red)!important}.wsb-topnav a:focus-visible{outline:3px solid var(--wsb-blue);outline-offset:3px}@media print{.wsb-topnav{display:none}}@media(max-width:550px){.wsb-topnav{gap:12px;font-size:10px;padding:12px}}</style>';
 return html.replace("</head>",css+"</head>").replace("<body>","<body><nav class=\"wsb-topnav\" aria-label=\"World System Brief navigation\">"+links+"</nav>");
}
