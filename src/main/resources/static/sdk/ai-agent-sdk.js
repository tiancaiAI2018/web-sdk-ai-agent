(function(D,O){typeof exports=="object"&&typeof module<"u"?module.exports=O():typeof define=="function"&&define.amd?define(O):(D=typeof globalThis<"u"?globalThis:D||self,D.AIAgent=O())})(this,function(){"use strict";var ks=Object.defineProperty;var sa=D=>{throw TypeError(D)};var xs=(D,O,X)=>O in D?ks(D,O,{enumerable:!0,configurable:!0,writable:!0,value:X}):D[O]=X;var x=(D,O,X)=>xs(D,typeof O!="symbol"?O+"":O,X),ys=(D,O,X)=>O.has(D)||sa("Cannot "+X);var ra=(D,O,X)=>O.has(D)?sa("Cannot add the same private member more than once"):O instanceof WeakSet?O.add(D):O.set(D,X);var qe=(D,O,X)=>(ys(D,O,"access private method"),X);var le,oa,Yt,la;function D(i){if(!i)return null;try{const e=i.split(".");if(e.length!==3)return null;let t=e[1].replace(/-/g,"+").replace(/_/g,"/");for(;t.length%4;)t+="=";const n=atob(t),a=JSON.parse(n);return typeof a.exp=="number"?a.exp:null}catch{return null}}class O{constructor(){x(this,"_accessToken",null);x(this,"_expEpoch",0)}async get(e){const t=Math.floor(Date.now()/1e3);if(this._accessToken&&this._expEpoch>t+30)return this._accessToken;console.log("[AIAgent SDK] token missing/near-expiry, calling getAccessToken()...");const n=await e();if(!n||!n.accessToken)throw new Error("getAccessToken() must return { accessToken }");return this._accessToken=n.accessToken,this._expEpoch=D(n.accessToken)||t+300,this._accessToken}}async function X(i,e,t,n,a,s){const r=i.getReader(),l=new TextDecoder;let c="",u=!1;function p(){u||(u=!0,t())}function f(){for(;;){const m=c.indexOf(`

`);if(m<0)return;const k=c.slice(0,m);if(c=c.slice(m+2),!k)continue;const h={},S=k.split(`
`);for(let E=0;E<S.length;E++){const M=S[E],I=M.indexOf(":");if(I<0)continue;const V=M.slice(0,I).trim();let _=M.slice(I+1);_.length>0&&_.charAt(0)===" "&&(_=_.slice(1)),V==="data"?h.data=(h.data?h.data+`
`:"")+_:h[V]=_}if(h.data&&(h.data=h.data.replace(/\\n/g,`
`)),h.id==="last"){p();return}if(h.event==="tool_call"&&typeof a=="function"){try{a(JSON.parse(h.data||"{}"))}catch(E){console.error("[AIAgent SDK] tool_call parse failed",E,h.data)}continue}if(h.event==="thinking"&&typeof s=="function"){s(h.data||"");continue}h.data!==void 0&&e(h)}}try{for(;;){const m=await r.read();if(m.done)break;c+=l.decode(m.value,{stream:!0}),f()}f(),p()}catch(m){n(m)}}function pt(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}let ge=pt();function Zt(i){ge=i}const Xt=/[&<>"']/,ca=new RegExp(Xt.source,"g"),Kt=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,da=new RegExp(Kt.source,"g"),pa={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Vt=i=>pa[i];function K(i,e){if(e){if(Xt.test(i))return i.replace(ca,Vt)}else if(Kt.test(i))return i.replace(da,Vt);return i}const ua=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;function ga(i){return i.replace(ua,(e,t)=>(t=t.toLowerCase(),t==="colon"?":":t.charAt(0)==="#"?t.charAt(1)==="x"?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""))}const ha=/(^|[^\[])\^/g;function C(i,e){let t=typeof i=="string"?i:i.source;e=e||"";const n={replace:(a,s)=>{let r=typeof s=="string"?s:s.source;return r=r.replace(ha,"$1"),t=t.replace(a,r),n},getRegex:()=>new RegExp(t,e)};return n}function Jt(i){try{i=encodeURI(i).replace(/%25/g,"%")}catch{return null}return i}const Ie={exec:()=>null};function Qt(i,e){const t=i.replace(/\|/g,(s,r,l)=>{let c=!1,u=r;for(;--u>=0&&l[u]==="\\";)c=!c;return c?"|":" |"}),n=t.split(/ \|/);let a=0;if(n[0].trim()||n.shift(),n.length>0&&!n[n.length-1].trim()&&n.pop(),e)if(n.length>e)n.splice(e);else for(;n.length<e;)n.push("");for(;a<n.length;a++)n[a]=n[a].trim().replace(/\\\|/g,"|");return n}function Oe(i,e,t){const n=i.length;if(n===0)return"";let a=0;for(;a<n&&i.charAt(n-a-1)===e;)a++;return i.slice(0,n-a)}function fa(i,e){if(i.indexOf(e[1])===-1)return-1;let t=0;for(let n=0;n<i.length;n++)if(i[n]==="\\")n++;else if(i[n]===e[0])t++;else if(i[n]===e[1]&&(t--,t<0))return n;return-1}function en(i,e,t,n){const a=e.href,s=e.title?K(e.title):null,r=i[1].replace(/\\([\[\]])/g,"$1");if(i[0].charAt(0)!=="!"){n.state.inLink=!0;const l={type:"link",raw:t,href:a,title:s,text:r,tokens:n.inlineTokens(r)};return n.state.inLink=!1,l}return{type:"image",raw:t,href:a,title:s,text:K(r)}}function ma(i,e){const t=i.match(/^(\s+)(?:```)/);if(t===null)return e;const n=t[1];return e.split(`
`).map(a=>{const s=a.match(/^\s+/);if(s===null)return a;const[r]=s;return r.length>=n.length?a.slice(n.length):a}).join(`
`)}class Ge{constructor(e){x(this,"options");x(this,"rules");x(this,"lexer");this.options=e||ge}space(e){const t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){const t=this.rules.block.code.exec(e);if(t){const n=t[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?n:Oe(n,`
`)}}}fences(e){const t=this.rules.block.fences.exec(e);if(t){const n=t[0],a=ma(n,t[3]||"");return{type:"code",raw:n,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:a}}}heading(e){const t=this.rules.block.heading.exec(e);if(t){let n=t[2].trim();if(/#$/.test(n)){const a=Oe(n,"#");(this.options.pedantic||!a||/ $/.test(a))&&(n=a.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:n,tokens:this.lexer.inline(n)}}}hr(e){const t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:Oe(t[0],`
`)}}blockquote(e){const t=this.rules.block.blockquote.exec(e);if(t){let n=Oe(t[0],`
`).split(`
`),a="",s="";const r=[];for(;n.length>0;){let l=!1;const c=[];let u;for(u=0;u<n.length;u++)if(/^ {0,3}>/.test(n[u]))c.push(n[u]),l=!0;else if(!l)c.push(n[u]);else break;n=n.slice(u);const p=c.join(`
`),f=p.replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,`
    $1`).replace(/^ {0,3}>[ \t]?/gm,"");a=a?`${a}
${p}`:p,s=s?`${s}
${f}`:f;const m=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(f,r,!0),this.lexer.state.top=m,n.length===0)break;const k=r[r.length-1];if(k?.type==="code")break;if(k?.type==="blockquote"){const h=k,S=h.raw+`
`+n.join(`
`),E=this.blockquote(S);r[r.length-1]=E,a=a.substring(0,a.length-h.raw.length)+E.raw,s=s.substring(0,s.length-h.text.length)+E.text;break}else if(k?.type==="list"){const h=k,S=h.raw+`
`+n.join(`
`),E=this.list(S);r[r.length-1]=E,a=a.substring(0,a.length-k.raw.length)+E.raw,s=s.substring(0,s.length-h.raw.length)+E.raw,n=S.substring(r[r.length-1].raw.length).split(`
`);continue}}return{type:"blockquote",raw:a,tokens:r,text:s}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim();const a=n.length>1,s={type:"list",raw:"",ordered:a,start:a?+n.slice(0,-1):"",loose:!1,items:[]};n=a?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=a?n:"[*+-]");const r=new RegExp(`^( {0,3}${n})((?:[	 ][^\\n]*)?(?:\\n|$))`);let l=!1;for(;e;){let c=!1,u="",p="";if(!(t=r.exec(e))||this.rules.block.hr.test(e))break;u=t[0],e=e.substring(u.length);let f=t[2].split(`
`,1)[0].replace(/^\t+/,M=>" ".repeat(3*M.length)),m=e.split(`
`,1)[0],k=!f.trim(),h=0;if(this.options.pedantic?(h=2,p=f.trimStart()):k?h=t[1].length+1:(h=t[2].search(/[^ ]/),h=h>4?1:h,p=f.slice(h),h+=t[1].length),k&&/^ *$/.test(m)&&(u+=m+`
`,e=e.substring(m.length+1),c=!0),!c){const M=new RegExp(`^ {0,${Math.min(3,h-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),I=new RegExp(`^ {0,${Math.min(3,h-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),V=new RegExp(`^ {0,${Math.min(3,h-1)}}(?:\`\`\`|~~~)`),_=new RegExp(`^ {0,${Math.min(3,h-1)}}#`);for(;e;){const Q=e.split(`
`,1)[0];if(m=Q,this.options.pedantic&&(m=m.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),V.test(m)||_.test(m)||M.test(m)||I.test(e))break;if(m.search(/[^ ]/)>=h||!m.trim())p+=`
`+m.slice(h);else{if(k||f.search(/[^ ]/)>=4||V.test(f)||_.test(f)||I.test(f))break;p+=`
`+m}!k&&!m.trim()&&(k=!0),u+=Q+`
`,e=e.substring(Q.length+1),f=m.slice(h)}}s.loose||(l?s.loose=!0:/\n *\n *$/.test(u)&&(l=!0));let S=null,E;this.options.gfm&&(S=/^\[[ xX]\] /.exec(p),S&&(E=S[0]!=="[ ] ",p=p.replace(/^\[[ xX]\] +/,""))),s.items.push({type:"list_item",raw:u,task:!!S,checked:E,loose:!1,text:p,tokens:[]}),s.raw+=u}s.items[s.items.length-1].raw=s.items[s.items.length-1].raw.trimEnd(),s.items[s.items.length-1].text=s.items[s.items.length-1].text.trimEnd(),s.raw=s.raw.trimEnd();for(let c=0;c<s.items.length;c++)if(this.lexer.state.top=!1,s.items[c].tokens=this.lexer.blockTokens(s.items[c].text,[]),!s.loose){const u=s.items[c].tokens.filter(f=>f.type==="space"),p=u.length>0&&u.some(f=>/\n.*\n/.test(f.raw));s.loose=p}if(s.loose)for(let c=0;c<s.items.length;c++)s.items[c].loose=!0;return s}}html(e){const t=this.rules.block.html.exec(e);if(t)return{type:"html",block:!0,raw:t[0],pre:t[1]==="pre"||t[1]==="script"||t[1]==="style",text:t[0]}}def(e){const t=this.rules.block.def.exec(e);if(t){const n=t[1].toLowerCase().replace(/\s+/g," "),a=t[2]?t[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",s=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:n,raw:t[0],href:a,title:s}}}table(e){const t=this.rules.block.table.exec(e);if(!t||!/[:|]/.test(t[2]))return;const n=Qt(t[1]),a=t[2].replace(/^\||\| *$/g,"").split("|"),s=t[3]&&t[3].trim()?t[3].replace(/\n[ \t]*$/,"").split(`
`):[],r={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===a.length){for(const l of a)/^ *-+: *$/.test(l)?r.align.push("right"):/^ *:-+: *$/.test(l)?r.align.push("center"):/^ *:-+ *$/.test(l)?r.align.push("left"):r.align.push(null);for(let l=0;l<n.length;l++)r.header.push({text:n[l],tokens:this.lexer.inline(n[l]),header:!0,align:r.align[l]});for(const l of s)r.rows.push(Qt(l,r.header.length).map((c,u)=>({text:c,tokens:this.lexer.inline(c),header:!1,align:r.align[u]})));return r}}lheading(e){const t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){const t=this.rules.block.paragraph.exec(e);if(t){const n=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:n,tokens:this.lexer.inline(n)}}}text(e){const t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){const t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:K(t[1])}}tag(e){const t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&/^<a /i.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){const t=this.rules.inline.link.exec(e);if(t){const n=t[2].trim();if(!this.options.pedantic&&/^</.test(n)){if(!/>$/.test(n))return;const r=Oe(n.slice(0,-1),"\\");if((n.length-r.length)%2===0)return}else{const r=fa(t[2],"()");if(r>-1){const c=(t[0].indexOf("!")===0?5:4)+t[1].length+r;t[2]=t[2].substring(0,r),t[0]=t[0].substring(0,c).trim(),t[3]=""}}let a=t[2],s="";if(this.options.pedantic){const r=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(a);r&&(a=r[1],s=r[3])}else s=t[3]?t[3].slice(1,-1):"";return a=a.trim(),/^</.test(a)&&(this.options.pedantic&&!/>$/.test(n)?a=a.slice(1):a=a.slice(1,-1)),en(t,{href:a&&a.replace(this.rules.inline.anyPunctuation,"$1"),title:s&&s.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){const a=(n[2]||n[1]).replace(/\s+/g," "),s=t[a.toLowerCase()];if(!s){const r=n[0].charAt(0);return{type:"text",raw:r,text:r}}return en(n,s,n[0],this.lexer)}}emStrong(e,t,n=""){let a=this.rules.inline.emStrongLDelim.exec(e);if(!a||a[3]&&n.match(/[\p{L}\p{N}]/u))return;if(!(a[1]||a[2]||"")||!n||this.rules.inline.punctuation.exec(n)){const r=[...a[0]].length-1;let l,c,u=r,p=0;const f=a[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(f.lastIndex=0,t=t.slice(-1*e.length+r);(a=f.exec(t))!=null;){if(l=a[1]||a[2]||a[3]||a[4]||a[5]||a[6],!l)continue;if(c=[...l].length,a[3]||a[4]){u+=c;continue}else if((a[5]||a[6])&&r%3&&!((r+c)%3)){p+=c;continue}if(u-=c,u>0)continue;c=Math.min(c,c+u+p);const m=[...a[0]][0].length,k=e.slice(0,r+a.index+m+c);if(Math.min(r,c)%2){const S=k.slice(1,-1);return{type:"em",raw:k,text:S,tokens:this.lexer.inlineTokens(S)}}const h=k.slice(2,-2);return{type:"strong",raw:k,text:h,tokens:this.lexer.inlineTokens(h)}}}}codespan(e){const t=this.rules.inline.code.exec(e);if(t){let n=t[2].replace(/\n/g," ");const a=/[^ ]/.test(n),s=/^ /.test(n)&&/ $/.test(n);return a&&s&&(n=n.substring(1,n.length-1)),n=K(n,!0),{type:"codespan",raw:t[0],text:n}}}br(e){const t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e){const t=this.rules.inline.del.exec(e);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e){const t=this.rules.inline.autolink.exec(e);if(t){let n,a;return t[2]==="@"?(n=K(t[1]),a="mailto:"+n):(n=K(t[1]),a=n),{type:"link",raw:t[0],text:n,href:a,tokens:[{type:"text",raw:n,text:n}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let n,a;if(t[2]==="@")n=K(t[0]),a="mailto:"+n;else{let s;do s=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??"";while(s!==t[0]);n=K(t[0]),t[1]==="www."?a="http://"+t[0]:a=t[0]}return{type:"link",raw:t[0],text:n,href:a,tokens:[{type:"text",raw:n,text:n}]}}}inlineText(e){const t=this.rules.inline.text.exec(e);if(t){let n;return this.lexer.state.inRawBlock?n=t[0]:n=K(t[0]),{type:"text",raw:t[0],text:n}}}}const ba=/^(?: *(?:\n|$))+/,ka=/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,xa=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,Ne=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,ya=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,tn=/(?:[*+-]|\d{1,9}[.)])/,nn=C(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g,tn).replace(/blockCode/g,/ {4}/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).getRegex(),ut=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,wa=/^[^\n]+/,gt=/(?!\s*\])(?:\\.|[^\[\]\\])+/,Ta=C(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/).replace("label",gt).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),_a=C(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,tn).getRegex(),We="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",ht=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,va=C("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))","i").replace("comment",ht).replace("tag",We).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),an=C(ut).replace("hr",Ne).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",We).getRegex(),ft={blockquote:C(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",an).getRegex(),code:ka,def:Ta,fences:xa,heading:ya,hr:Ne,html:va,lheading:nn,list:_a,newline:ba,paragraph:an,table:Ie,text:wa},sn=C("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",Ne).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",We).getRegex(),Ea={...ft,table:sn,paragraph:C(ut).replace("hr",Ne).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",sn).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",We).getRegex()},Sa={...ft,html:C(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",ht).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Ie,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:C(ut).replace("hr",Ne).replace("heading",` *#{1,6} *[^
]`).replace("lheading",nn).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},rn=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Aa=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,on=/^( {2,}|\\)\n(?!\s*$)/,Ca=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Me="\\p{P}\\p{S}",Ra=C(/^((?![*_])[\spunctuation])/,"u").replace(/punctuation/g,Me).getRegex(),Ia=/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g,Oa=C(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,"u").replace(/punct/g,Me).getRegex(),Na=C("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])","gu").replace(/punct/g,Me).getRegex(),Ma=C("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])","gu").replace(/punct/g,Me).getRegex(),La=C(/\\([punct])/,"gu").replace(/punct/g,Me).getRegex(),Da=C(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),za=C(ht).replace("(?:-->|$)","-->").getRegex(),Pa=C("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",za).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),Ye=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,$a=C(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label",Ye).replace("href",/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),ln=C(/^!?\[(label)\]\[(ref)\]/).replace("label",Ye).replace("ref",gt).getRegex(),cn=C(/^!?\[(ref)\](?:\[\])?/).replace("ref",gt).getRegex(),Ba=C("reflink|nolink(?!\\()","g").replace("reflink",ln).replace("nolink",cn).getRegex(),mt={_backpedal:Ie,anyPunctuation:La,autolink:Da,blockSkip:Ia,br:on,code:Aa,del:Ie,emStrongLDelim:Oa,emStrongRDelimAst:Na,emStrongRDelimUnd:Ma,escape:rn,link:$a,nolink:cn,punctuation:Ra,reflink:ln,reflinkSearch:Ba,tag:Pa,text:Ca,url:Ie},Fa={...mt,link:C(/^!?\[(label)\]\((.*?)\)/).replace("label",Ye).getRegex(),reflink:C(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",Ye).getRegex()},bt={...mt,escape:C(rn).replace("])","~|])").getRegex(),url:C(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},Ua={...bt,br:C(on).replace("{2,}","*").getRegex(),text:C(bt.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Ze={normal:ft,gfm:Ea,pedantic:Sa},Le={normal:mt,gfm:bt,breaks:Ua,pedantic:Fa};class te{constructor(e){x(this,"tokens");x(this,"options");x(this,"state");x(this,"tokenizer");x(this,"inlineQueue");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||ge,this.options.tokenizer=this.options.tokenizer||new Ge,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const t={block:Ze.normal,inline:Le.normal};this.options.pedantic?(t.block=Ze.pedantic,t.inline=Le.pedantic):this.options.gfm&&(t.block=Ze.gfm,this.options.breaks?t.inline=Le.breaks:t.inline=Le.gfm),this.tokenizer.rules=t}static get rules(){return{block:Ze,inline:Le}}static lex(e,t){return new te(t).lex(e)}static lexInline(e,t){return new te(t).inlineTokens(e)}lex(e){e=e.replace(/\r\n|\r/g,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){const n=this.inlineQueue[t];this.inlineTokens(n.src,n.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){this.options.pedantic?e=e.replace(/\t/g,"    ").replace(/^ +$/gm,""):e=e.replace(/^( *)(\t+)/gm,(l,c,u)=>c+"    ".repeat(u.length));let a,s,r;for(;e;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(l=>(a=l.call({lexer:this},e,t))?(e=e.substring(a.raw.length),t.push(a),!0):!1))){if(a=this.tokenizer.space(e)){e=e.substring(a.raw.length),a.raw.length===1&&t.length>0?t[t.length-1].raw+=`
`:t.push(a);continue}if(a=this.tokenizer.code(e)){e=e.substring(a.raw.length),s=t[t.length-1],s&&(s.type==="paragraph"||s.type==="text")?(s.raw+=`
`+a.raw,s.text+=`
`+a.text,this.inlineQueue[this.inlineQueue.length-1].src=s.text):t.push(a);continue}if(a=this.tokenizer.fences(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.heading(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.hr(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.blockquote(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.list(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.html(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.def(e)){e=e.substring(a.raw.length),s=t[t.length-1],s&&(s.type==="paragraph"||s.type==="text")?(s.raw+=`
`+a.raw,s.text+=`
`+a.raw,this.inlineQueue[this.inlineQueue.length-1].src=s.text):this.tokens.links[a.tag]||(this.tokens.links[a.tag]={href:a.href,title:a.title});continue}if(a=this.tokenizer.table(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.lheading(e)){e=e.substring(a.raw.length),t.push(a);continue}if(r=e,this.options.extensions&&this.options.extensions.startBlock){let l=1/0;const c=e.slice(1);let u;this.options.extensions.startBlock.forEach(p=>{u=p.call({lexer:this},c),typeof u=="number"&&u>=0&&(l=Math.min(l,u))}),l<1/0&&l>=0&&(r=e.substring(0,l+1))}if(this.state.top&&(a=this.tokenizer.paragraph(r))){s=t[t.length-1],n&&s?.type==="paragraph"?(s.raw+=`
`+a.raw,s.text+=`
`+a.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=s.text):t.push(a),n=r.length!==e.length,e=e.substring(a.raw.length);continue}if(a=this.tokenizer.text(e)){e=e.substring(a.raw.length),s=t[t.length-1],s&&s.type==="text"?(s.raw+=`
`+a.raw,s.text+=`
`+a.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=s.text):t.push(a);continue}if(e){const l="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(l);break}else throw new Error(l)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n,a,s,r=e,l,c,u;if(this.tokens.links){const p=Object.keys(this.tokens.links);if(p.length>0)for(;(l=this.tokenizer.rules.inline.reflinkSearch.exec(r))!=null;)p.includes(l[0].slice(l[0].lastIndexOf("[")+1,-1))&&(r=r.slice(0,l.index)+"["+"a".repeat(l[0].length-2)+"]"+r.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(l=this.tokenizer.rules.inline.blockSkip.exec(r))!=null;)r=r.slice(0,l.index)+"["+"a".repeat(l[0].length-2)+"]"+r.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;(l=this.tokenizer.rules.inline.anyPunctuation.exec(r))!=null;)r=r.slice(0,l.index)+"++"+r.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;e;)if(c||(u=""),c=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(p=>(n=p.call({lexer:this},e,t))?(e=e.substring(n.raw.length),t.push(n),!0):!1))){if(n=this.tokenizer.escape(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.tag(e)){e=e.substring(n.raw.length),a=t[t.length-1],a&&n.type==="text"&&a.type==="text"?(a.raw+=n.raw,a.text+=n.text):t.push(n);continue}if(n=this.tokenizer.link(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(n.raw.length),a=t[t.length-1],a&&n.type==="text"&&a.type==="text"?(a.raw+=n.raw,a.text+=n.text):t.push(n);continue}if(n=this.tokenizer.emStrong(e,r,u)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.codespan(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.br(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.del(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.autolink(e)){e=e.substring(n.raw.length),t.push(n);continue}if(!this.state.inLink&&(n=this.tokenizer.url(e))){e=e.substring(n.raw.length),t.push(n);continue}if(s=e,this.options.extensions&&this.options.extensions.startInline){let p=1/0;const f=e.slice(1);let m;this.options.extensions.startInline.forEach(k=>{m=k.call({lexer:this},f),typeof m=="number"&&m>=0&&(p=Math.min(p,m))}),p<1/0&&p>=0&&(s=e.substring(0,p+1))}if(n=this.tokenizer.inlineText(s)){e=e.substring(n.raw.length),n.raw.slice(-1)!=="_"&&(u=n.raw.slice(-1)),c=!0,a=t[t.length-1],a&&a.type==="text"?(a.raw+=n.raw,a.text+=n.text):t.push(n);continue}if(e){const p="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(p);break}else throw new Error(p)}}return t}}class Xe{constructor(e){x(this,"options");x(this,"parser");this.options=e||ge}space(e){return""}code({text:e,lang:t,escaped:n}){const a=(t||"").match(/^\S*/)?.[0],s=e.replace(/\n$/,"")+`
`;return a?'<pre><code class="language-'+K(a)+'">'+(n?s:K(s,!0))+`</code></pre>
`:"<pre><code>"+(n?s:K(s,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){const t=e.ordered,n=e.start;let a="";for(let l=0;l<e.items.length;l++){const c=e.items[l];a+=this.listitem(c)}const s=t?"ol":"ul",r=t&&n!==1?' start="'+n+'"':"";return"<"+s+r+`>
`+a+"</"+s+`>
`}listitem(e){let t="";if(e.task){const n=this.checkbox({checked:!!e.checked});e.loose?e.tokens.length>0&&e.tokens[0].type==="paragraph"?(e.tokens[0].text=n+" "+e.tokens[0].text,e.tokens[0].tokens&&e.tokens[0].tokens.length>0&&e.tokens[0].tokens[0].type==="text"&&(e.tokens[0].tokens[0].text=n+" "+e.tokens[0].tokens[0].text)):e.tokens.unshift({type:"text",raw:n+" ",text:n+" "}):t+=n+" "}return t+=this.parser.parse(e.tokens,!!e.loose),`<li>${t}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t="",n="";for(let s=0;s<e.header.length;s++)n+=this.tablecell(e.header[s]);t+=this.tablerow({text:n});let a="";for(let s=0;s<e.rows.length;s++){const r=e.rows[s];n="";for(let l=0;l<r.length;l++)n+=this.tablecell(r[l]);a+=this.tablerow({text:n})}return a&&(a=`<tbody>${a}</tbody>`),`<table>
<thead>
`+t+`</thead>
`+a+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){const t=this.parser.parseInline(e.tokens),n=e.header?"th":"td";return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${e}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){const a=this.parser.parseInline(n),s=Jt(e);if(s===null)return a;e=s;let r='<a href="'+e+'"';return t&&(r+=' title="'+t+'"'),r+=">"+a+"</a>",r}image({href:e,title:t,text:n}){const a=Jt(e);if(a===null)return n;e=a;let s=`<img src="${e}" alt="${n}"`;return t&&(s+=` title="${t}"`),s+=">",s}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):e.text}}class kt{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}}class ne{constructor(e){x(this,"options");x(this,"renderer");x(this,"textRenderer");this.options=e||ge,this.options.renderer=this.options.renderer||new Xe,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new kt}static parse(e,t){return new ne(t).parse(e)}static parseInline(e,t){return new ne(t).parseInline(e)}parse(e,t=!0){let n="";for(let a=0;a<e.length;a++){const s=e[a];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[s.type]){const l=s,c=this.options.extensions.renderers[l.type].call({parser:this},l);if(c!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(l.type)){n+=c||"";continue}}const r=s;switch(r.type){case"space":{n+=this.renderer.space(r);continue}case"hr":{n+=this.renderer.hr(r);continue}case"heading":{n+=this.renderer.heading(r);continue}case"code":{n+=this.renderer.code(r);continue}case"table":{n+=this.renderer.table(r);continue}case"blockquote":{n+=this.renderer.blockquote(r);continue}case"list":{n+=this.renderer.list(r);continue}case"html":{n+=this.renderer.html(r);continue}case"paragraph":{n+=this.renderer.paragraph(r);continue}case"text":{let l=r,c=this.renderer.text(l);for(;a+1<e.length&&e[a+1].type==="text";)l=e[++a],c+=`
`+this.renderer.text(l);t?n+=this.renderer.paragraph({type:"paragraph",raw:c,text:c,tokens:[{type:"text",raw:c,text:c}]}):n+=c;continue}default:{const l='Token with "'+r.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return n}parseInline(e,t){t=t||this.renderer;let n="";for(let a=0;a<e.length;a++){const s=e[a];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[s.type]){const l=this.options.extensions.renderers[s.type].call({parser:this},s);if(l!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(s.type)){n+=l||"";continue}}const r=s;switch(r.type){case"escape":{n+=t.text(r);break}case"html":{n+=t.html(r);break}case"link":{n+=t.link(r);break}case"image":{n+=t.image(r);break}case"strong":{n+=t.strong(r);break}case"em":{n+=t.em(r);break}case"codespan":{n+=t.codespan(r);break}case"br":{n+=t.br(r);break}case"del":{n+=t.del(r);break}case"text":{n+=t.text(r);break}default:{const l='Token with "'+r.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return n}}class De{constructor(e){x(this,"options");this.options=e||ge}preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}}x(De,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens"]));class Ha{constructor(...e){ra(this,le);x(this,"defaults",pt());x(this,"options",this.setOptions);x(this,"parse",qe(this,le,Yt).call(this,te.lex,ne.parse));x(this,"parseInline",qe(this,le,Yt).call(this,te.lexInline,ne.parseInline));x(this,"Parser",ne);x(this,"Renderer",Xe);x(this,"TextRenderer",kt);x(this,"Lexer",te);x(this,"Tokenizer",Ge);x(this,"Hooks",De);this.use(...e)}walkTokens(e,t){let n=[];for(const a of e)switch(n=n.concat(t.call(this,a)),a.type){case"table":{const s=a;for(const r of s.header)n=n.concat(this.walkTokens(r.tokens,t));for(const r of s.rows)for(const l of r)n=n.concat(this.walkTokens(l.tokens,t));break}case"list":{const s=a;n=n.concat(this.walkTokens(s.items,t));break}default:{const s=a;this.defaults.extensions?.childTokens?.[s.type]?this.defaults.extensions.childTokens[s.type].forEach(r=>{const l=s[r].flat(1/0);n=n.concat(this.walkTokens(l,t))}):s.tokens&&(n=n.concat(this.walkTokens(s.tokens,t)))}}return n}use(...e){const t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(n=>{const a={...n};if(a.async=this.defaults.async||a.async||!1,n.extensions&&(n.extensions.forEach(s=>{if(!s.name)throw new Error("extension name required");if("renderer"in s){const r=t.renderers[s.name];r?t.renderers[s.name]=function(...l){let c=s.renderer.apply(this,l);return c===!1&&(c=r.apply(this,l)),c}:t.renderers[s.name]=s.renderer}if("tokenizer"in s){if(!s.level||s.level!=="block"&&s.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");const r=t[s.level];r?r.unshift(s.tokenizer):t[s.level]=[s.tokenizer],s.start&&(s.level==="block"?t.startBlock?t.startBlock.push(s.start):t.startBlock=[s.start]:s.level==="inline"&&(t.startInline?t.startInline.push(s.start):t.startInline=[s.start]))}"childTokens"in s&&s.childTokens&&(t.childTokens[s.name]=s.childTokens)}),a.extensions=t),n.renderer){const s=this.defaults.renderer||new Xe(this.defaults);for(const r in n.renderer){if(!(r in s))throw new Error(`renderer '${r}' does not exist`);if(["options","parser"].includes(r))continue;const l=r;let c=n.renderer[l];n.useNewRenderer||(c=qe(this,le,oa).call(this,c,l,s));const u=s[l];s[l]=(...p)=>{let f=c.apply(s,p);return f===!1&&(f=u.apply(s,p)),f||""}}a.renderer=s}if(n.tokenizer){const s=this.defaults.tokenizer||new Ge(this.defaults);for(const r in n.tokenizer){if(!(r in s))throw new Error(`tokenizer '${r}' does not exist`);if(["options","rules","lexer"].includes(r))continue;const l=r,c=n.tokenizer[l],u=s[l];s[l]=(...p)=>{let f=c.apply(s,p);return f===!1&&(f=u.apply(s,p)),f}}a.tokenizer=s}if(n.hooks){const s=this.defaults.hooks||new De;for(const r in n.hooks){if(!(r in s))throw new Error(`hook '${r}' does not exist`);if(r==="options")continue;const l=r,c=n.hooks[l],u=s[l];De.passThroughHooks.has(r)?s[l]=p=>{if(this.defaults.async)return Promise.resolve(c.call(s,p)).then(m=>u.call(s,m));const f=c.call(s,p);return u.call(s,f)}:s[l]=(...p)=>{let f=c.apply(s,p);return f===!1&&(f=u.apply(s,p)),f}}a.hooks=s}if(n.walkTokens){const s=this.defaults.walkTokens,r=n.walkTokens;a.walkTokens=function(l){let c=[];return c.push(r.call(this,l)),s&&(c=c.concat(s.call(this,l))),c}}this.defaults={...this.defaults,...a}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return te.lex(e,t??this.defaults)}parser(e,t){return ne.parse(e,t??this.defaults)}}le=new WeakSet,oa=function(e,t,n){switch(t){case"heading":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,n.parser.parseInline(a.tokens),a.depth,ga(n.parser.parseInline(a.tokens,n.parser.textRenderer)))};case"code":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text,a.lang,!!a.escaped)};case"table":return function(a){if(!a.type||a.type!==t)return e.apply(this,arguments);let s="",r="";for(let c=0;c<a.header.length;c++)r+=this.tablecell({text:a.header[c].text,tokens:a.header[c].tokens,header:!0,align:a.align[c]});s+=this.tablerow({text:r});let l="";for(let c=0;c<a.rows.length;c++){const u=a.rows[c];r="";for(let p=0;p<u.length;p++)r+=this.tablecell({text:u[p].text,tokens:u[p].tokens,header:!1,align:a.align[p]});l+=this.tablerow({text:r})}return e.call(this,s,l)};case"blockquote":return function(a){if(!a.type||a.type!==t)return e.apply(this,arguments);const s=this.parser.parse(a.tokens);return e.call(this,s)};case"list":return function(a){if(!a.type||a.type!==t)return e.apply(this,arguments);const s=a.ordered,r=a.start,l=a.loose;let c="";for(let u=0;u<a.items.length;u++){const p=a.items[u],f=p.checked,m=p.task;let k="";if(p.task){const h=this.checkbox({checked:!!f});l?p.tokens.length>0&&p.tokens[0].type==="paragraph"?(p.tokens[0].text=h+" "+p.tokens[0].text,p.tokens[0].tokens&&p.tokens[0].tokens.length>0&&p.tokens[0].tokens[0].type==="text"&&(p.tokens[0].tokens[0].text=h+" "+p.tokens[0].tokens[0].text)):p.tokens.unshift({type:"text",text:h+" "}):k+=h+" "}k+=this.parser.parse(p.tokens,l),c+=this.listitem({type:"list_item",raw:k,text:k,task:m,checked:!!f,loose:l,tokens:p.tokens})}return e.call(this,c,s,r)};case"html":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text,a.block)};case"paragraph":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"escape":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text)};case"link":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.href,a.title,this.parser.parseInline(a.tokens))};case"image":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.href,a.title,a.text)};case"strong":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"em":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"codespan":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text)};case"del":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"text":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text)}}return e},Yt=function(e,t){return(n,a)=>{const s={...a},r={...this.defaults,...s};this.defaults.async===!0&&s.async===!1&&(r.silent||console.warn("marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored."),r.async=!0);const l=qe(this,le,la).call(this,!!r.silent,!!r.async);if(typeof n>"u"||n===null)return l(new Error("marked(): input parameter is undefined or null"));if(typeof n!="string")return l(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(n)+", string expected"));if(r.hooks&&(r.hooks.options=r),r.async)return Promise.resolve(r.hooks?r.hooks.preprocess(n):n).then(c=>e(c,r)).then(c=>r.hooks?r.hooks.processAllTokens(c):c).then(c=>r.walkTokens?Promise.all(this.walkTokens(c,r.walkTokens)).then(()=>c):c).then(c=>t(c,r)).then(c=>r.hooks?r.hooks.postprocess(c):c).catch(l);try{r.hooks&&(n=r.hooks.preprocess(n));let c=e(n,r);r.hooks&&(c=r.hooks.processAllTokens(c)),r.walkTokens&&this.walkTokens(c,r.walkTokens);let u=t(c,r);return r.hooks&&(u=r.hooks.postprocess(u)),u}catch(c){return l(c)}}},la=function(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){const a="<p>An error occurred:</p><pre>"+K(n.message+"",!0)+"</pre>";return t?Promise.resolve(a):a}if(t)return Promise.reject(n);throw n}};const he=new Ha;function A(i,e){return he.parse(i,e)}A.options=A.setOptions=function(i){return he.setOptions(i),A.defaults=he.defaults,Zt(A.defaults),A},A.getDefaults=pt,A.defaults=ge,A.use=function(...i){return he.use(...i),A.defaults=he.defaults,Zt(A.defaults),A},A.walkTokens=function(i,e){return he.walkTokens(i,e)},A.parseInline=he.parseInline,A.Parser=ne,A.parser=ne.parse,A.Renderer=Xe,A.TextRenderer=kt,A.Lexer=te,A.lexer=te.lex,A.Tokenizer=Ge,A.Hooks=De,A.parse=A,A.options,A.setOptions,A.use,A.walkTokens,A.parseInline,ne.parse,te.lex;/*! @license DOMPurify 3.4.9 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.9/LICENSE */function dn(i,e){(e==null||e>i.length)&&(e=i.length);for(var t=0,n=Array(e);t<e;t++)n[t]=i[t];return n}function ja(i){if(Array.isArray(i))return i}function qa(i,e){var t=i==null?null:typeof Symbol<"u"&&i[Symbol.iterator]||i["@@iterator"];if(t!=null){var n,a,s,r,l=[],c=!0,u=!1;try{if(s=(t=t.call(i)).next,e!==0)for(;!(c=(n=s.call(t)).done)&&(l.push(n.value),l.length!==e);c=!0);}catch(p){u=!0,a=p}finally{try{if(!c&&t.return!=null&&(r=t.return(),Object(r)!==r))return}finally{if(u)throw a}}return l}}function Ga(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Wa(i,e){return ja(i)||qa(i,e)||Ya(i,e)||Ga()}function Ya(i,e){if(i){if(typeof i=="string")return dn(i,e);var t={}.toString.call(i).slice(8,-1);return t==="Object"&&i.constructor&&(t=i.constructor.name),t==="Map"||t==="Set"?Array.from(i):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?dn(i,e):void 0}}const pn=Object.entries,un=Object.setPrototypeOf,Za=Object.isFrozen,Xa=Object.getPrototypeOf,Ka=Object.getOwnPropertyDescriptor;let W=Object.freeze,J=Object.seal,xe=Object.create,gn=typeof Reflect<"u"&&Reflect,xt=gn.apply,yt=gn.construct;W||(W=function(e){return e}),J||(J=function(e){return e}),xt||(xt=function(e,t){for(var n=arguments.length,a=new Array(n>2?n-2:0),s=2;s<n;s++)a[s-2]=arguments[s];return e.apply(t,a)}),yt||(yt=function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),a=1;a<t;a++)n[a-1]=arguments[a];return new e(...n)});const oe=F(Array.prototype.forEach),Va=F(Array.prototype.lastIndexOf),hn=F(Array.prototype.pop),ye=F(Array.prototype.push),Ja=F(Array.prototype.splice),Y=Array.isArray,ze=F(String.prototype.toLowerCase),wt=F(String.prototype.toString),fn=F(String.prototype.match),we=F(String.prototype.replace),mn=F(String.prototype.indexOf),Qa=F(String.prototype.trim),ei=F(Number.prototype.toString),ti=F(Boolean.prototype.toString),bn=typeof BigInt>"u"?null:F(BigInt.prototype.toString),kn=typeof Symbol>"u"?null:F(Symbol.prototype.toString),N=F(Object.prototype.hasOwnProperty),Pe=F(Object.prototype.toString),q=F(RegExp.prototype.test),fe=ni(TypeError);function F(i){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var t=arguments.length,n=new Array(t>1?t-1:0),a=1;a<t;a++)n[a-1]=arguments[a];return xt(i,e,n)}}function ni(i){return function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return yt(i,t)}}function T(i,e){let t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:ze;if(un&&un(i,null),!Y(e))return i;let n=e.length;for(;n--;){let a=e[n];if(typeof a=="string"){const s=t(a);s!==a&&(Za(e)||(e[n]=s),a=s)}i[a]=!0}return i}function ai(i){for(let e=0;e<i.length;e++)N(i,e)||(i[e]=null);return i}function G(i){const e=xe(null);for(const n of pn(i)){var t=Wa(n,2);const a=t[0],s=t[1];N(i,a)&&(Y(s)?e[a]=ai(s):s&&typeof s=="object"&&s.constructor===Object?e[a]=G(s):e[a]=s)}return e}function ii(i){switch(typeof i){case"string":return i;case"number":return ei(i);case"boolean":return ti(i);case"bigint":return bn?bn(i):"0";case"symbol":return kn?kn(i):"Symbol()";case"undefined":return Pe(i);case"function":case"object":{if(i===null)return Pe(i);const e=i,t=ae(e,"toString");if(typeof t=="function"){const n=t(e);return typeof n=="string"?n:Pe(n)}return Pe(i)}default:return Pe(i)}}function ae(i,e){for(;i!==null;){const n=Ka(i,e);if(n){if(n.get)return F(n.get);if(typeof n.value=="function")return F(n.value)}i=Xa(i)}function t(){return null}return t}function si(i){try{return q(i,""),!0}catch{return!1}}const xn=W(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),Tt=W(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),_t=W(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),ri=W(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),vt=W(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),oi=W(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),yn=W(["#text"]),wn=W(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),Et=W(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),Tn=W(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),Ke=W(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),li=J(/{{[\w\W]*|^[\w\W]*}}/g),ci=J(/<%[\w\W]*|^[\w\W]*%>/g),di=J(/\${[\w\W]*/g),pi=J(/^data-[\-\w.\u00B7-\uFFFF]+$/),ui=J(/^aria-[\-\w]+$/),_n=J(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),gi=J(/^(?:\w+script|data):/i),hi=J(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),fi=J(/^html$/i),mi=J(/^[a-z][.\w]*(-[.\w]+)+$/i),ie={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,progressingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},bi=function(){return typeof window>"u"?null:window},ki=function(e,t){if(typeof e!="object"||typeof e.createPolicy!="function")return null;let n=null;const a="data-tt-policy-suffix";t&&t.hasAttribute(a)&&(n=t.getAttribute(a));const s="dompurify"+(n?"#"+n:"");try{return e.createPolicy(s,{createHTML(r){return r},createScriptURL(r){return r}})}catch{return console.warn("TrustedTypes policy "+s+" could not be created."),null}},vn=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function En(){let i=arguments.length>0&&arguments[0]!==void 0?arguments[0]:bi();const e=b=>En(b);if(e.version="3.4.9",e.removed=[],!i||!i.document||i.document.nodeType!==ie.document||!i.Element)return e.isSupported=!1,e;let t=i.document;const n=t,a=n.currentScript;i.DocumentFragment;const s=i.HTMLTemplateElement,r=i.Node,l=i.Element,c=i.NodeFilter,u=i.NamedNodeMap;u===void 0&&(i.NamedNodeMap||i.MozNamedAttrMap),i.HTMLFormElement;const p=i.DOMParser,f=i.trustedTypes,m=l.prototype,k=ae(m,"cloneNode"),h=ae(m,"remove"),S=ae(m,"nextSibling"),E=ae(m,"childNodes"),M=ae(m,"parentNode"),I=ae(m,"shadowRoot"),V=ae(m,"attributes"),_=r&&r.prototype?ae(r.prototype,"nodeType"):null,Q=r&&r.prototype?ae(r.prototype,"nodeName"):null;if(typeof s=="function"){const b=t.createElement("template");b.content&&b.content.ownerDocument&&(t=b.content.ownerDocument)}let Z,me="",Rt,Mn=!1,Be=0;const Ln=function(){if(Be>0)throw fe('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')},ve=function(o){Ln(),Be++;try{return Z.createHTML(o)}finally{Be--}},es=function(o){Ln(),Be++;try{return Z.createScriptURL(o)}finally{Be--}},ts=function(){return Mn||(Rt=ki(f,a),Mn=!0),Rt},et=t,It=et.implementation,Dn=et.createNodeIterator,ns=et.createDocumentFragment,as=et.getElementsByTagName,is=n.importNode;let H=vn();e.isSupported=typeof pn=="function"&&typeof M=="function"&&It&&It.createHTMLDocument!==void 0;const tt=li,nt=ci,at=di,ss=pi,rs=ui,os=gi,zn=hi,ls=mi;let Pn=_n,z=null;const Ot=T({},[...xn,...Tt,..._t,...vt,...yn]);let P=null;const Nt=T({},[...wn,...Et,...Tn,...Ke]);let $=Object.seal(xe(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Fe=null,it=null;const de=Object.seal(xe(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let $n=!0,Mt=!0,Bn=!1,Fn=!0,pe=!1,Ue=!0,be=!1,Lt=!1,Dt=!1,Ee=!1,st=!1,rt=!1,Un=!0,Hn=!1;const jn="user-content-";let zt=!0,Pt=!1,Se={},se=null;const $t=T({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]);let qn=null;const Gn=T({},["audio","video","img","source","image","track"]);let Bt=null;const Wn=T({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),ot="http://www.w3.org/1998/Math/MathML",lt="http://www.w3.org/2000/svg",re="http://www.w3.org/1999/xhtml";let Ae=re,Ft=!1,Ut=null;const cs=T({},[ot,lt,re],wt);let Ht=T({},["mi","mo","mn","ms","mtext"]),jt=T({},["annotation-xml"]);const ds=T({},["title","style","font","a","script"]);let He=null;const ps=["application/xhtml+xml","text/html"],us="text/html";let L=null,Ce=null;const gs=t.createElement("form"),Yn=function(o){return o instanceof RegExp||o instanceof Function},qt=function(){let o=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(Ce&&Ce===o)return;(!o||typeof o!="object")&&(o={}),o=G(o),He=ps.indexOf(o.PARSER_MEDIA_TYPE)===-1?us:o.PARSER_MEDIA_TYPE,L=He==="application/xhtml+xml"?wt:ze,z=N(o,"ALLOWED_TAGS")&&Y(o.ALLOWED_TAGS)?T({},o.ALLOWED_TAGS,L):Ot,P=N(o,"ALLOWED_ATTR")&&Y(o.ALLOWED_ATTR)?T({},o.ALLOWED_ATTR,L):Nt,Ut=N(o,"ALLOWED_NAMESPACES")&&Y(o.ALLOWED_NAMESPACES)?T({},o.ALLOWED_NAMESPACES,wt):cs,Bt=N(o,"ADD_URI_SAFE_ATTR")&&Y(o.ADD_URI_SAFE_ATTR)?T(G(Wn),o.ADD_URI_SAFE_ATTR,L):Wn,qn=N(o,"ADD_DATA_URI_TAGS")&&Y(o.ADD_DATA_URI_TAGS)?T(G(Gn),o.ADD_DATA_URI_TAGS,L):Gn,se=N(o,"FORBID_CONTENTS")&&Y(o.FORBID_CONTENTS)?T({},o.FORBID_CONTENTS,L):$t,Fe=N(o,"FORBID_TAGS")&&Y(o.FORBID_TAGS)?T({},o.FORBID_TAGS,L):G({}),it=N(o,"FORBID_ATTR")&&Y(o.FORBID_ATTR)?T({},o.FORBID_ATTR,L):G({}),Se=N(o,"USE_PROFILES")?o.USE_PROFILES&&typeof o.USE_PROFILES=="object"?G(o.USE_PROFILES):o.USE_PROFILES:!1,$n=o.ALLOW_ARIA_ATTR!==!1,Mt=o.ALLOW_DATA_ATTR!==!1,Bn=o.ALLOW_UNKNOWN_PROTOCOLS||!1,Fn=o.ALLOW_SELF_CLOSE_IN_ATTR!==!1,pe=o.SAFE_FOR_TEMPLATES||!1,Ue=o.SAFE_FOR_XML!==!1,be=o.WHOLE_DOCUMENT||!1,Ee=o.RETURN_DOM||!1,st=o.RETURN_DOM_FRAGMENT||!1,rt=o.RETURN_TRUSTED_TYPE||!1,Dt=o.FORCE_BODY||!1,Un=o.SANITIZE_DOM!==!1,Hn=o.SANITIZE_NAMED_PROPS||!1,zt=o.KEEP_CONTENT!==!1,Pt=o.IN_PLACE||!1,Pn=si(o.ALLOWED_URI_REGEXP)?o.ALLOWED_URI_REGEXP:_n,Ae=typeof o.NAMESPACE=="string"?o.NAMESPACE:re,Ht=N(o,"MATHML_TEXT_INTEGRATION_POINTS")&&o.MATHML_TEXT_INTEGRATION_POINTS&&typeof o.MATHML_TEXT_INTEGRATION_POINTS=="object"?G(o.MATHML_TEXT_INTEGRATION_POINTS):T({},["mi","mo","mn","ms","mtext"]),jt=N(o,"HTML_INTEGRATION_POINTS")&&o.HTML_INTEGRATION_POINTS&&typeof o.HTML_INTEGRATION_POINTS=="object"?G(o.HTML_INTEGRATION_POINTS):T({},["annotation-xml"]);const d=N(o,"CUSTOM_ELEMENT_HANDLING")&&o.CUSTOM_ELEMENT_HANDLING&&typeof o.CUSTOM_ELEMENT_HANDLING=="object"?G(o.CUSTOM_ELEMENT_HANDLING):xe(null);if($=xe(null),N(d,"tagNameCheck")&&Yn(d.tagNameCheck)&&($.tagNameCheck=d.tagNameCheck),N(d,"attributeNameCheck")&&Yn(d.attributeNameCheck)&&($.attributeNameCheck=d.attributeNameCheck),N(d,"allowCustomizedBuiltInElements")&&typeof d.allowCustomizedBuiltInElements=="boolean"&&($.allowCustomizedBuiltInElements=d.allowCustomizedBuiltInElements),pe&&(Mt=!1),st&&(Ee=!0),Se&&(z=T({},yn),P=xe(null),Se.html===!0&&(T(z,xn),T(P,wn)),Se.svg===!0&&(T(z,Tt),T(P,Et),T(P,Ke)),Se.svgFilters===!0&&(T(z,_t),T(P,Et),T(P,Ke)),Se.mathMl===!0&&(T(z,vt),T(P,Tn),T(P,Ke))),de.tagCheck=null,de.attributeCheck=null,N(o,"ADD_TAGS")&&(typeof o.ADD_TAGS=="function"?de.tagCheck=o.ADD_TAGS:Y(o.ADD_TAGS)&&(z===Ot&&(z=G(z)),T(z,o.ADD_TAGS,L))),N(o,"ADD_ATTR")&&(typeof o.ADD_ATTR=="function"?de.attributeCheck=o.ADD_ATTR:Y(o.ADD_ATTR)&&(P===Nt&&(P=G(P)),T(P,o.ADD_ATTR,L))),N(o,"ADD_URI_SAFE_ATTR")&&Y(o.ADD_URI_SAFE_ATTR)&&T(Bt,o.ADD_URI_SAFE_ATTR,L),N(o,"FORBID_CONTENTS")&&Y(o.FORBID_CONTENTS)&&(se===$t&&(se=G(se)),T(se,o.FORBID_CONTENTS,L)),N(o,"ADD_FORBID_CONTENTS")&&Y(o.ADD_FORBID_CONTENTS)&&(se===$t&&(se=G(se)),T(se,o.ADD_FORBID_CONTENTS,L)),zt&&(z["#text"]=!0),be&&T(z,["html","head","body"]),z.table&&(T(z,["tbody"]),delete Fe.tbody),o.TRUSTED_TYPES_POLICY){if(typeof o.TRUSTED_TYPES_POLICY.createHTML!="function")throw fe('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof o.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw fe('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');const g=Z;Z=o.TRUSTED_TYPES_POLICY;try{me=ve("")}catch(y){throw Z=g,y}}else o.TRUSTED_TYPES_POLICY===null?(Z=void 0,me=""):(Z===void 0&&(Z=ts()),Z&&typeof me=="string"&&(me=ve("")));(H.uponSanitizeElement.length>0||H.uponSanitizeAttribute.length>0)&&z===Ot&&(z=G(z)),H.uponSanitizeAttribute.length>0&&P===Nt&&(P=G(P)),W&&W(o),Ce=o},Zn=T({},[...Tt,..._t,...ri]),Xn=T({},[...vt,...oi]),hs=function(o){let d=M(o);(!d||!d.tagName)&&(d={namespaceURI:Ae,tagName:"template"});const g=ze(o.tagName),y=ze(d.tagName);return Ut[o.namespaceURI]?o.namespaceURI===lt?d.namespaceURI===re?g==="svg":d.namespaceURI===ot?g==="svg"&&(y==="annotation-xml"||Ht[y]):!!Zn[g]:o.namespaceURI===ot?d.namespaceURI===re?g==="math":d.namespaceURI===lt?g==="math"&&jt[y]:!!Xn[g]:o.namespaceURI===re?d.namespaceURI===lt&&!jt[y]||d.namespaceURI===ot&&!Ht[y]?!1:!Xn[g]&&(ds[g]||!Zn[g]):!!(He==="application/xhtml+xml"&&Ut[o.namespaceURI]):!1},ee=function(o){ye(e.removed,{element:o});try{M(o).removeChild(o)}catch{if(h(o),!M(o))throw fe("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")}},Kn=function(o){const d=E?E(o):o.childNodes;if(d){const y=[];oe(d,w=>{ye(y,w)}),oe(y,w=>{try{h(w)}catch{}})}const g=V?V(o):null;if(g)for(let y=g.length-1;y>=0;--y){const w=g[y],v=w&&w.name;if(typeof v=="string")try{o.removeAttribute(v)}catch{}}},ke=function(o,d){try{ye(e.removed,{attribute:d.getAttributeNode(o),from:d})}catch{ye(e.removed,{attribute:null,from:d})}if(d.removeAttribute(o),o==="is")if(Ee||st)try{ee(d)}catch{}else try{d.setAttribute(o,"")}catch{}},fs=function(o){const d=V?V(o):o.attributes;if(d)for(let g=d.length-1;g>=0;--g){const y=d[g],w=y&&y.name;if(!(typeof w!="string"||P[L(w)]))try{o.removeAttribute(w)}catch{}}},ms=function(o){const d=[o];for(;d.length>0;){const g=d.pop();(_?_(g):g.nodeType)===ie.element&&fs(g);const w=E?E(g):g.childNodes;if(w)for(let v=w.length-1;v>=0;--v)d.push(w[v])}},Vn=function(o){let d=null,g=null;if(Dt)o="<remove></remove>"+o;else{const v=fn(o,/^[\r\n\t ]+/);g=v&&v[0]}He==="application/xhtml+xml"&&Ae===re&&(o='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+o+"</body></html>");const y=Z?ve(o):o;if(Ae===re)try{d=new p().parseFromString(y,He)}catch{}if(!d||!d.documentElement){d=It.createDocument(Ae,"template",null);try{d.documentElement.innerHTML=Ft?me:y}catch{}}const w=d.body||d.documentElement;return o&&g&&w.insertBefore(t.createTextNode(g),w.childNodes[0]||null),Ae===re?as.call(d,be?"html":"body")[0]:be?d.documentElement:w},Jn=function(o){return Dn.call(o.ownerDocument||o,o,c.SHOW_ELEMENT|c.SHOW_COMMENT|c.SHOW_TEXT|c.SHOW_PROCESSING_INSTRUCTION|c.SHOW_CDATA_SECTION,null)},Gt=function(o){var d,g;o.normalize();const y=Dn.call(o.ownerDocument||o,o,c.SHOW_TEXT|c.SHOW_COMMENT|c.SHOW_CDATA_SECTION|c.SHOW_PROCESSING_INSTRUCTION,null);let w=y.nextNode();for(;w;){let U=w.data;oe([tt,nt,at],R=>{U=we(U,R," ")}),w.data=U,w=y.nextNode()}const v=(d=(g=o.querySelectorAll)===null||g===void 0?void 0:g.call(o,"template"))!==null&&d!==void 0?d:[];oe(Array.from(v),U=>{Re(U.content)&&Gt(U.content)})},ct=function(o){const d=Q?Q(o):null;return typeof d!="string"||L(d)!=="form"?!1:typeof o.nodeName!="string"||typeof o.textContent!="string"||typeof o.removeChild!="function"||o.attributes!==V(o)||typeof o.removeAttribute!="function"||typeof o.setAttribute!="function"||typeof o.namespaceURI!="string"||typeof o.insertBefore!="function"||typeof o.hasChildNodes!="function"||o.nodeType!==_(o)||o.childNodes!==E(o)},Re=function(o){if(!_||typeof o!="object"||o===null)return!1;try{return _(o)===ie.documentFragment}catch{return!1}},je=function(o){if(!_||typeof o!="object"||o===null)return!1;try{return typeof _(o)=="number"}catch{return!1}};function ce(b,o,d){oe(b,g=>{g.call(e,o,d,Ce)})}const Qn=function(o){let d=null;if(ce(H.beforeSanitizeElements,o,null),ct(o))return ee(o),!0;const g=L(Q?Q(o):o.nodeName);if(ce(H.uponSanitizeElement,o,{tagName:g,allowedTags:z}),Ue&&o.hasChildNodes()&&!je(o.firstElementChild)&&q(/<[/\w!]/g,o.innerHTML)&&q(/<[/\w!]/g,o.textContent)||Ue&&o.namespaceURI===re&&g==="style"&&je(o.firstElementChild)||o.nodeType===ie.progressingInstruction||Ue&&o.nodeType===ie.comment&&q(/<[/\w]/g,o.data))return ee(o),!0;if(Fe[g]||!(de.tagCheck instanceof Function&&de.tagCheck(g))&&!z[g]){if(!Fe[g]&&ta(g)&&($.tagNameCheck instanceof RegExp&&q($.tagNameCheck,g)||$.tagNameCheck instanceof Function&&$.tagNameCheck(g)))return!1;if(zt&&!se[g]){const w=M(o),v=E(o);if(v&&w){const U=v.length;for(let R=U-1;R>=0;--R){const B=Pt?v[R]:k(v[R],!0);w.insertBefore(B,S(o))}}}return ee(o),!0}return(_?_(o):o.nodeType)===ie.element&&!hs(o)||(g==="noscript"||g==="noembed"||g==="noframes")&&q(/<\/no(script|embed|frames)/i,o.innerHTML)?(ee(o),!0):(pe&&o.nodeType===ie.text&&(d=o.textContent,oe([tt,nt,at],w=>{d=we(d,w," ")}),o.textContent!==d&&(ye(e.removed,{element:o.cloneNode()}),o.textContent=d)),ce(H.afterSanitizeElements,o,null),!1)},ea=function(o,d,g){if(it[d]||Un&&(d==="id"||d==="name")&&(g in t||g in gs))return!1;const y=P[d]||de.attributeCheck instanceof Function&&de.attributeCheck(d,o);if(!(Mt&&!it[d]&&q(ss,d))){if(!($n&&q(rs,d))){if(!y||it[d]){if(!(ta(o)&&($.tagNameCheck instanceof RegExp&&q($.tagNameCheck,o)||$.tagNameCheck instanceof Function&&$.tagNameCheck(o))&&($.attributeNameCheck instanceof RegExp&&q($.attributeNameCheck,d)||$.attributeNameCheck instanceof Function&&$.attributeNameCheck(d,o))||d==="is"&&$.allowCustomizedBuiltInElements&&($.tagNameCheck instanceof RegExp&&q($.tagNameCheck,g)||$.tagNameCheck instanceof Function&&$.tagNameCheck(g))))return!1}else if(!Bt[d]){if(!q(Pn,we(g,zn,""))){if(!((d==="src"||d==="xlink:href"||d==="href")&&o!=="script"&&mn(g,"data:")===0&&qn[o])){if(!(Bn&&!q(os,we(g,zn,"")))){if(g)return!1}}}}}}return!0},bs=T({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),ta=function(o){return!bs[ze(o)]&&q(ls,o)},na=function(o){ce(H.beforeSanitizeAttributes,o,null);const d=o.attributes;if(!d||ct(o))return;const g={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:P,forceKeepAttr:void 0};let y=d.length;for(;y--;){const w=d[y],v=w.name,U=w.namespaceURI,R=w.value,B=L(v),ue=R;let j=v==="value"?ue:Qa(ue);if(g.attrName=B,g.attrValue=j,g.keepAttr=!0,g.forceKeepAttr=void 0,ce(H.uponSanitizeAttribute,o,g),j=g.attrValue,Hn&&(B==="id"||B==="name")&&mn(j,jn)!==0&&(ke(v,o),j=jn+j),Ue&&q(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,j)){ke(v,o);continue}if(B==="attributename"&&fn(j,"href")){ke(v,o);continue}if(g.forceKeepAttr)continue;if(!g.keepAttr){ke(v,o);continue}if(!Fn&&q(/\/>/i,j)){ke(v,o);continue}pe&&oe([tt,nt,at],ia=>{j=we(j,ia," ")});const aa=L(o.nodeName);if(!ea(aa,B,j)){ke(v,o);continue}if(Z&&typeof f=="object"&&typeof f.getAttributeType=="function"&&!U)switch(f.getAttributeType(aa,B)){case"TrustedHTML":{j=ve(j);break}case"TrustedScriptURL":{j=es(j);break}}if(j!==ue)try{U?o.setAttributeNS(U,v,j):o.setAttribute(v,j),ct(o)?ee(o):hn(e.removed)}catch{ke(v,o)}}ce(H.afterSanitizeAttributes,o,null)},dt=function(o){let d=null;const g=Jn(o);for(ce(H.beforeSanitizeShadowDOM,o,null);d=g.nextNode();)if(ce(H.uponSanitizeShadowNode,d,null),Qn(d),na(d),Re(d.content)&&dt(d.content),(_?_(d):d.nodeType)===ie.element){const w=I?I(d):d.shadowRoot;Re(w)&&(Wt(w),dt(w))}ce(H.afterSanitizeShadowDOM,o,null)},Wt=function(o){const d=[{node:o,shadow:null}];for(;d.length>0;){const g=d.pop();if(g.shadow){dt(g.shadow);continue}const y=g.node,v=(_?_(y):y.nodeType)===ie.element,U=E?E(y):y.childNodes;if(U)for(let R=U.length-1;R>=0;--R)d.push({node:U[R],shadow:null});if(v){const R=Q?Q(y):null;if(typeof R=="string"&&L(R)==="template"){const B=y.content;Re(B)&&d.push({node:B,shadow:null})}}if(v){const R=I?I(y):y.shadowRoot;Re(R)&&d.push({node:null,shadow:R},{node:R,shadow:null})}}};return e.sanitize=function(b){let o=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},d=null,g=null,y=null,w=null;if(Ft=!b,Ft&&(b="<!-->"),typeof b!="string"&&!je(b)&&(b=ii(b),typeof b!="string"))throw fe("dirty is not a string, aborting");if(!e.isSupported)return b;Lt||qt(o),e.removed=[];const v=Pt&&typeof b!="string"&&je(b);if(v){const B=Q?Q(b):b.nodeName;if(typeof B=="string"){const ue=L(B);if(!z[ue]||Fe[ue])throw fe("root node is forbidden and cannot be sanitized in-place")}if(ct(b))throw fe("root node is clobbered and cannot be sanitized in-place");try{Wt(b)}catch(ue){throw Kn(b),ue}}else if(je(b))d=Vn("<!---->"),g=d.ownerDocument.importNode(b,!0),g.nodeType===ie.element&&g.nodeName==="BODY"||g.nodeName==="HTML"?d=g:d.appendChild(g),Wt(g);else{if(!Ee&&!pe&&!be&&b.indexOf("<")===-1)return Z&&rt?ve(b):b;if(d=Vn(b),!d)return Ee?null:rt?me:""}d&&Dt&&ee(d.firstChild);const U=Jn(v?b:d);try{for(;y=U.nextNode();)Qn(y),na(y),Re(y.content)&&dt(y.content)}catch(B){throw v&&Kn(b),B}if(v)return oe(e.removed,B=>{B.element&&ms(B.element)}),pe&&Gt(b),b;if(Ee){if(pe&&Gt(d),st)for(w=ns.call(d.ownerDocument);d.firstChild;)w.appendChild(d.firstChild);else w=d;return(P.shadowroot||P.shadowrootmode)&&(w=is.call(n,w,!0)),w}let R=be?d.outerHTML:d.innerHTML;return be&&z["!doctype"]&&d.ownerDocument&&d.ownerDocument.doctype&&d.ownerDocument.doctype.name&&q(fi,d.ownerDocument.doctype.name)&&(R="<!DOCTYPE "+d.ownerDocument.doctype.name+`>
`+R),pe&&oe([tt,nt,at],B=>{R=we(R,B," ")}),Z&&rt?ve(R):R},e.setConfig=function(){let b=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};qt(b),Lt=!0},e.clearConfig=function(){Ce=null,Lt=!1,Z=Rt,me=""},e.isValidAttribute=function(b,o,d){Ce||qt({});const g=L(b),y=L(o);return ea(g,y,d)},e.addHook=function(b,o){typeof o=="function"&&ye(H[b],o)},e.removeHook=function(b,o){if(o!==void 0){const d=Va(H[b],o);return d===-1?void 0:Ja(H[b],d,1)[0]}return hn(H[b])},e.removeHooks=function(b){H[b]=[]},e.removeAllHooks=function(){H=vn()},e}var xi=En();let Sn=!1;function yi(){Sn||(Sn=!0,A.setOptions({gfm:!0,breaks:!0}))}function wi(i){return String(i).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function Ti(i){let e=xi.sanitize(i,{ADD_ATTR:["target","rel"]});return e=e.replace(/<a\s+([^>]*?)>/gi,(t,n)=>(/\btarget\s*=/i.test(n)||(n+=' target="_blank"'),/\brel\s*=/i.test(n)||(n+=' rel="noopener noreferrer"'),"<a "+n+">")),e}function Te(i){if(!i)return"";try{yi();const e=A.parse(i,{async:!1});return Ti(e)}catch(e){return console.warn("[AIAgent SDK] marked parse failed, fallback:",e),_i(i)}}function _i(i){let e=wi(i);return e=e.replace(/`([^`\n]+)`/g,"<code>$1</code>"),e=e.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\n/g,"<br/>"),e}function _e(i){if(!i)return;const e=i.querySelectorAll("img");for(let t=0;t<e.length;t++){const n=e[t];if(n.dataset.aiagentDecorated==="1")continue;n.dataset.aiagentDecorated="1",n.setAttribute("loading","lazy"),n.classList.add("aiagent-sdk-img-loading");const a=()=>{n.classList.remove("aiagent-sdk-img-loading"),n.classList.add("aiagent-sdk-img-loaded")};n.complete&&n.naturalWidth>0?a():(n.addEventListener("load",a,{once:!0}),n.addEventListener("error",a,{once:!0}))}}const An=["#5eead4","#a78bfa","#f0abfc","#93c5fd","#fcd34d"];function vi(){const i=document.createElement("div");i.className="aiagent-sdk-msg aiagent-sdk-msg-assistant aiagent-sdk-typing-pending";for(let e=0;e<5;e++){const t=document.createElement("span");t.className="aia-p",t.style.setProperty("--c",An[e%An.length]),e>0&&t.style.setProperty("--d",e*.2+"s"),i.appendChild(t)}return i}function Cn(i){const e=vi();return i.appendChild(e),i.scrollTop=i.scrollHeight,e}function Rn(i){i&&(i.classList.remove("aiagent-sdk-typing-pending"),i.innerHTML="")}function In(i){i&&i.classList.add("aiagent-sdk-typing-active")}function Ve(i){i&&i.classList.remove("aiagent-sdk-typing-active")}function Ei(i,e,t){const n=document.createElement("div");n.className="aiagent-sdk-tool-card",n.setAttribute("role","status"),n.setAttribute("data-tool",e);const a=document.createElement("div");a.className="aiagent-sdk-tool-head";const s=document.createElement("span");s.className="aiagent-sdk-tool-arrow",s.textContent="▸";const r=document.createElement("span");r.className="aiagent-sdk-tool-name",r.textContent=e;const l=document.createElement("span");l.className="aiagent-sdk-tool-dot",a.appendChild(s),a.appendChild(r),a.appendChild(l);const c=document.createElement("pre");c.className="aiagent-sdk-tool-body",c.innerHTML=Ai(JSON.stringify(t,null,2)||"{}");const u=document.createElement("div");u.className="aiagent-sdk-tool-progress";const p=document.createElement("div");p.className="aiagent-sdk-tool-bar",p.style.setProperty("--p","0%");const f=document.createElement("span");return f.className="aiagent-sdk-tool-status",f.textContent="调用中…",u.appendChild(p),u.appendChild(f),n.appendChild(a),n.appendChild(c),n.appendChild(u),i.appendChild(n),i.scrollTop=i.scrollHeight,n}function $e(i,e,t){if(!i)return;const n=i.querySelector(".aiagent-sdk-tool-bar");if(n&&n.style.setProperty("--p",Math.min(100,Math.max(0,e))+"%"),t){const a=i.querySelector(".aiagent-sdk-tool-status");a&&(a.textContent=t)}}function Si(i,e="✓ 完成"){if(!i)return;i.classList.add("aiagent-sdk-tool-success");const t=i.querySelector(".aiagent-sdk-tool-status");t&&(t.textContent=e)}function Je(i,e="✕ 失败"){if(!i)return;i.classList.add("aiagent-sdk-tool-error"),i.style.borderLeftColor="var(--aia-error)";const t=i.querySelector(".aiagent-sdk-tool-status");t&&(t.textContent=e)}function Ai(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,(t,n,a,s,r)=>n?a?`<span class="k">${n}</span>${a}`:`<span class="s">${n}</span>`:s?`<span class="k">${s}</span>`:r?`<span class="n">${r}</span>`:t)}function Ci(i){const e=document.createElement("div");e.className="aiagent-sdk-thinking-card",e.setAttribute("role","status"),e.setAttribute("aria-label","AI 思考中");const t=document.createElement("div");t.className="aiagent-sdk-thinking-head";const n=document.createElement("span");n.className="aiagent-sdk-thinking-dot",n.setAttribute("aria-hidden","true");const a=document.createElement("span");a.className="aiagent-sdk-thinking-label",a.textContent="思考中…";const s=document.createElement("button");s.className="aiagent-sdk-thinking-toggle",s.textContent="展开",s.addEventListener("click",l=>{l.stopPropagation();const c=e.classList.toggle("aiagent-sdk-thinking-expanded");s.textContent=c?"收起":"展开"}),t.appendChild(n),t.appendChild(a),t.appendChild(s);const r=document.createElement("pre");return r.className="aiagent-sdk-thinking-body",e.appendChild(t),e.appendChild(r),i.appendChild(e),i.scrollTop=i.scrollHeight,e}function Ri(i,e){if(!i)return;const t=i.querySelector(".aiagent-sdk-thinking-body");t&&(t.innerHTML=Te(e||""),_e(t),t.scrollTop=t.scrollHeight)}function St(i){if(!i||i.classList.contains("aiagent-sdk-thinking-done"))return;i.classList.add("aiagent-sdk-thinking-done");const e=i.querySelector(".aiagent-sdk-thinking-label");e&&(e.textContent="✓ 思考完成"),i.classList.remove("aiagent-sdk-thinking-expanded");const t=i.querySelector(".aiagent-sdk-thinking-toggle");t&&(t.textContent="展开")}function Ii(i){return String(i).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function Oi(i,e,t=0,n){const a=document.createElement("div");return a.style.setProperty("--i",String(t)),i==="user"?(a.className="aiagent-sdk-msg aiagent-sdk-msg-user",a.innerHTML=Ii(e||"")):i==="assistant"?(a.className="aiagent-sdk-msg aiagent-sdk-msg-assistant",a.innerHTML=Te(e||""),_e(a)):i==="tool"?(a.className="aiagent-sdk-msg aiagent-sdk-msg-tool",n&&Ei(a,n.tool,n.args||{})):(a.className="aiagent-sdk-msg aiagent-sdk-msg-system",a.textContent=e||""),a}function Ni(i,e,t,n=0,a){const s=Oi(e,t,n,a);i.appendChild(s),i.scrollTop=i.scrollHeight}class Mi{constructor(){x(this,"_tools",new Map)}register(e,t){const n=this._tools.get(e)||new Map,a=[];for(const s of t){const r={description:s.description||"",parameters:s.parameters||{type:"object",properties:{}},strict:s.strict!==!1,onCall:typeof s.onCall=="function"?s.onCall:null};n.set(s.name,r),a.push({name:s.name,description:r.description,parameters:r.parameters,strict:r.strict})}return this._tools.set(e,n),a}unregister(e,t){const n=this._tools.get(e);if(n){if(!t||!t.length){n.clear(),this._tools.delete(e);return}for(const a of t)n.delete(a);n.size===0&&this._tools.delete(e)}}get(e,t){const n=this._tools.get(e);return n&&n.get(t)||null}}async function Li(i,e,t,n){const a=await fetch(i+"/chat/"+encodeURIComponent(t)+"/tools/register",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({tools:n})});if(!a.ok){const s=await a.text();throw new Error("register failed: "+a.status+" "+s)}return await a.json()}async function Di(i,e,t,n){const a=await fetch(i+"/chat/"+encodeURIComponent(t)+"/tools/unregister",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({names:n})});if(!a.ok)throw new Error("unregister failed: "+a.status);return await a.json()}async function zi(i,e,t){const n=await fetch(i+"/chat/"+encodeURIComponent(t)+"/tools",{method:"GET",headers:{Authorization:"Bearer "+e}});if(!n.ok)throw new Error("list failed: "+n.status);return await n.json()}async function At(i,e,t){if(t){try{await fetch(i+"/chat/"+encodeURIComponent(t)+"/tools/abort",{method:"POST",headers:{Authorization:"Bearer "+e}})}catch(n){console.warn("[AIAgent SDK] abort failed:",n.message)}try{sessionStorage.removeItem("pending:"+t)}catch{}}}async function Pi(i,e,t,n){if(!e)return;const a=i.getSessionId();if(!a){console.warn("[AIAgent SDK] no sessionId for tool result");return}const s={toolUseId:e,result:t,ts:Date.now()};i.setPending(s);try{sessionStorage.setItem("pending:"+a,JSON.stringify(s))}catch{}let r;try{r=await i.ensureToken()}catch(l){i.appendMsg("system","⚠️ "+l.message),i.setBusy(!1);return}await Ct(i,e,t,a,r,n)}async function Ct(i,e,t,n,a,s){const r=i.endpoint+"/chat/"+encodeURIComponent(n)+"/tools/result",l=JSON.stringify({toolUseId:e,result:t==null?"[Tool executed by client SDK; no result returned]":typeof t=="string"?t:JSON.stringify(t)}),c={Authorization:"Bearer "+a,"Content-Type":"application/json",Accept:"text/event-stream"},u=4;let p=500,f=0,m=null,k=null;for(;f<u;){k=null;try{m=await fetch(r,{method:"POST",headers:c,body:l})}catch(_){k=_}if(k){if(f===u-1)break;await i.sleep(p),p*=2,f++,s&&$e(s,Math.min(60+f*10,90),"重试中…");continue}if(m&&m.status>=500&&m.status<600&&f<u-1){await i.sleep(p),p*=2,f++,s&&$e(s,Math.min(60+f*10,90),"重试中…");continue}if(m&&m.status===429&&f<u-1){const _=parseInt(m.headers.get("Retry-After")||"1",10);await i.sleep(Math.max(_*1e3,p)),p*=2,f++,s&&$e(s,Math.min(60+f*10,90),"限流中…");continue}break}if(k){s&&Je(s,"✕ 网络失败"),Qe(i,n,e,"network: "+k.message);return}if(!m){s&&Je(s,"✕ 无响应"),Qe(i,n,e,"network: no response");return}if(m.status===409){s&&Je(s,"✕ 409 冲突");const _=await m.text();i.appendMsg("system","⚠️ "+(_||"session 已被工具调用占用"));try{await At(i.endpoint,a,n)}catch{}i.setPending(null),i.setBusy(!1);return}if(!m.ok||!m.body){s&&Je(s,"✕ HTTP "+m.status),Qe(i,n,e,"http "+m.status);return}s&&Si(s,"✓ 已提交");const h=i.appendTyping();let S="",E=!1;function M(){E||(E=!0,h.className="aiagent-sdk-msg aiagent-sdk-msg-assistant",In(h))}let I=!0;const V=_=>{_&&_.tool&&_.tool.indexOf("__")!==0&&i.appendMsg("tool","",{tool:_.tool,args:_.args||{}})};try{await X(m.body,_=>{S+=_.data||"",M(),h.innerHTML=Te(S),_e(h),i.getMsgEl().scrollTop=i.getMsgEl().scrollHeight},()=>{M(),Ve(h),h.innerHTML=Te(S),_e(h),i.getMsgEl().scrollTop=i.getMsgEl().scrollHeight,i.setBusy(!1)},_=>{I=!1,E?(Ve(h),h.className="aiagent-sdk-msg aiagent-sdk-msg-system",h.textContent="⚠️ "+_.message):(h.remove(),i.appendMsg("system","⚠️ "+_.message)),i.setBusy(!1)},V)}catch{I=!1}if(I){try{sessionStorage.removeItem("pending:"+n)}catch{}i.setPending(null)}else Qe(i,n,e,"sse")}async function $i(i){const e=i.getPending();if(!e)return;const t=i.getSessionId();if(!t)return;i.setBusy(!0);let n;try{n=await i.ensureToken()}catch(a){i.appendMsg("system","⚠️ "+a.message),i.setBusy(!1);return}await Ct(i,e.toolUseId,e.result,t,n)}async function Bi(i){const e=i.getSessionId();if(!e){i.setBusy(!1);return}let t="";try{t=await i.ensureToken()}catch{}await At(i.endpoint,t,e),i.appendMsg("system","已放弃本次工具调用,可继续对话。"),i.setBusy(!1)}function Qe(i,e,t,n){console.warn("[AIAgent SDK] tool result failed:",n),Fi(i,n),i.setBusy(!1)}function Fi(i,e){const t=i.getMsgEl();if(t.querySelector(".aiagent-sdk-tool-result-failed"))return;const n=document.createElement("div");n.className="aiagent-sdk-tool-result-failed";const a=document.createElement("div");a.className="aiagent-sdk-tool-result-failed-header",a.textContent="提交工具结果失败";const s=document.createElement("div");s.className="aiagent-sdk-tool-result-failed-detail",s.textContent="原因:"+(e||"未知")+"。可重试,或取消本次调用以继续对话。";const r=document.createElement("div");r.className="aiagent-sdk-tool-result-actions";const l=document.createElement("button");l.type="button",l.className="aiagent-sdk-btn-retry",l.textContent="↻ 重试",l.addEventListener("click",()=>{n.parentNode&&n.parentNode.removeChild(n),$i(i)});const c=document.createElement("button");c.type="button",c.className="aiagent-sdk-btn-cancel",c.textContent="✕ 取消",c.addEventListener("click",()=>{n.parentNode&&n.parentNode.removeChild(n),Bi(i)}),r.appendChild(l),r.appendChild(c),n.appendChild(a),n.appendChild(s),n.appendChild(r),t.appendChild(n),t.scrollTop=t.scrollHeight}async function Ui(i){if(typeof sessionStorage>"u")return;let e=null,t=null;try{for(let s=0;s<sessionStorage.length;s++){const r=sessionStorage.key(s);if(r&&r.indexOf("pending:")===0){e=r,t=JSON.parse(sessionStorage.getItem(r)||"null");break}}}catch{return}if(!e||!t||!t.toolUseId){e&&sessionStorage.removeItem(e);return}const n=e.substring(8);i.appendMsg("system","检测到上次未完成的工具调用,正在重试提交…"),i.setPending(t);let a;try{a=await i.ensureToken()}catch(s){i.appendMsg("system","⚠️ "+s.message);return}await Ct(i,t.toolUseId,t.result,n,a)}function Hi(i){if(i.getActiveTools().indexOf("submit_form")>=0)i.setActiveTools([]),i.setExtractOnCall(null),i.appendMsg("system","📋 录单模式已关闭(普通聊天)");else{let e=i.getChatSessionId();e||(e=i.getDemoSessionId()||i.clientPrefix+":order-"+Date.now()),i.hasLocalTool(e,"submit_form")||(e=i.getDemoSessionId()),i.setChatSessionId(e),i.setActiveTools(["submit_form"]),i.setExtractOnCall(null),i.appendMsg("system","📋 录单模式已开启。请粘订单文本,模型会多轮收集字段。")}}function ji(i,e){const t=e.sessionId||i.clientPrefix+":order-"+Date.now(),n=e.tools||[],a=e.activeTools||(n.length?[n[0].name]:[]);if(!n.length){console.warn("[AIAgent SDK] startExtractSession: tools required");return}e.onFormSubmit&&!n[0].onCall&&(n[0].onCall=e.onFormSubmit),i.registerTools(t,n).then(()=>{i.setChatSessionId(t),i.setActiveTools(a);const s=n[0];i.setExtractOnCall(s&&typeof s.onCall=="function"?s.onCall:null),i.appendMsg("system","📋 智能录单已开启("+t+"),激活工具: "+a.join(",")),i.sendUserMessage(e.initialMessage||"请开始按工具定义收集字段,或直接让我粘订单文本。")}).catch(s=>{i.appendMsg("system","⚠️ 工具注册失败:"+s.message)})}function qi(i){i.setActiveTools([]),i.setExtractOnCall(null),i.appendMsg("system","📋 录单模式已关闭")}const Gi=`
/* ====================================================================
 * 设计令牌
 * ==================================================================== */
:host {
  /* 画布色(ink = 深夜油画) */
  --aia-canvas-1: #050608;
  --aia-canvas-2: #0c0a14;
  --aia-canvas-3: #0e0d18;
  --aia-bg:        var(--aia-canvas-1);
  --aia-bg-soft:   #0a090f;
  --aia-text:      #f0eef5;
  --aia-text-muted:#9a96a8;
  --aia-text-faint:#5a5468;
  --aia-border:    rgba(255, 255, 255, 0.08);
  --aia-border-strong: rgba(255, 255, 255, 0.14);

  /* 虹彩油彩(画笔色) */
  --aia-paint-1: #5eead4;  /* 青绿 */
  --aia-paint-2: #a78bfa;  /* 紫 */
  --aia-paint-3: #f0abfc;  /* 粉 */
  --aia-paint-4: #93c5fd;  /* 天蓝 */
  --aia-paint-5: #fcd34d;  /* 琥珀,新增一色让油彩更"厚" */
  --aia-glow:    #a78bfa;

  /* 状态色 */
  --aia-success: #4ade80;
  --aia-error:   #f87171;

  /* 形状 */
  --aia-radius-sm:   8px;
  --aia-radius-md:   16px;
  --aia-radius-lg:   28px;
  --aia-radius-pill: 9999px;

  /* 动效 */
  --aia-anim-ease:        cubic-bezier(.2, .8, .2, 1);
  --aia-anim-dur:         220ms;
  --aia-anim-dur-slow:    420ms;

  /* 字体 — 中文优先,Inter 作英文兜底 */
  --aia-font:  -apple-system, BlinkMacSystemFont, "Helvetica Neue",
               "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC",
               "Inter", "Segoe UI", system-ui, sans-serif;
  --aia-mono:  "JetBrains Mono", "Fira Code", "SF Mono", ui-monospace,
               "Cascadia Code", Menlo, Monaco, Consolas, monospace;
  --aia-serif: "Source Han Serif SC", "Songti SC", "STSong", "SimSun", "Fraunces", Georgia, serif;

  /* 鼠标位置(JS 更新,默认面板中心) */
  --aia-mx: 50%;
  --aia-my: 50%;

  /* 噪点纹理(内嵌 base64 SVG) */
  --aia-noise: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

/* paper 主题:暖米油画画布 */
:host([data-theme="paper"]) {
  --aia-canvas-1: #f0e7d3;
  --aia-canvas-2: #ebe0c5;
  --aia-canvas-3: #e8d8b8;
  --aia-bg:        #faf3e0;
  --aia-bg-soft:   #f0e7d3;
  --aia-text:      #2a201a;
  --aia-text-muted:#5a4d3a;
  --aia-text-faint:#9a8a70;
  --aia-border:    rgba(0, 0, 0, 0.10);
  --aia-border-strong: rgba(0, 0, 0, 0.20);
}

/* light 是 paper 别名(dark 是 ink 别名)—— 保持向后兼容 */
:host([data-theme="light"]) {
  --aia-canvas-1: #f0e7d3;
  --aia-canvas-2: #ebe0c5;
  --aia-canvas-3: #e8d8b8;
  --aia-bg:        #faf3e0;
  --aia-bg-soft:   #f0e7d3;
  --aia-text:      #2a201a;
  --aia-text-muted:#5a4d3a;
  --aia-text-faint:#9a8a70;
  --aia-border:    rgba(0, 0, 0, 0.10);
  --aia-border-strong: rgba(0, 0, 0, 0.20);
}

/* 全局过渡(主题切换) */
:host * {
  transition:
    background-color 300ms var(--aia-anim-ease),
    border-color 300ms var(--aia-anim-ease),
    color 300ms var(--aia-anim-ease);
}

/* ====================================================================
 * 关键帧
 * ==================================================================== */
@keyframes aia-breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}
@keyframes aia-rotate {
  to { transform: rotate(360deg); }
}
@keyframes aia-rotate-rev {
  to { transform: rotate(-360deg); }
}
@keyframes aia-paint-flow {
  /* 油彩"扩张-收缩"呼吸(比旋转更看得见) */
  0%, 100% { transform: scale(0.85) rotate(0deg); opacity: 0.7; }
  50%      { transform: scale(1.15) rotate(180deg); opacity: 1; }
}
@keyframes aia-paint-flow-rev {
  0%, 100% { transform: scale(1.1) rotate(0deg); opacity: 0.6; }
  50%      { transform: scale(0.9) rotate(-180deg); opacity: 0.9; }
}
@keyframes aia-msg-paint {
  /* 消息"墨水渗纸":从一点向外晕染 */
  0%   { opacity: 0; clip-path: circle(0% at 30% 50%); filter: blur(4px); }
  60%  { opacity: 1; clip-path: circle(110% at 30% 50%); filter: blur(0px); }
  100% { opacity: 1; clip-path: circle(110% at 30% 50%); filter: blur(0px); }
}
@keyframes aia-msg-paint-r {
  0%   { opacity: 0; clip-path: circle(0% at 70% 50%); filter: blur(4px); }
  60%  { opacity: 1; clip-path: circle(110% at 70% 50%); filter: blur(0px); }
  100% { opacity: 1; clip-path: circle(110% at 70% 50%); filter: blur(0px); }
}
@keyframes aia-msg-shine {
  /* 消息入场后"高光带"扫过 */
  0%   { background-position: -200% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes aia-cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes aia-p-rise {
  0%   { opacity: 0; transform: translateY(10px) scale(0.2); }
  20%  { opacity: 1; transform: translateY(0) scale(1); }
  80%  { opacity: 1; transform: translateY(-2px) scale(1); }
  100% { opacity: 0; transform: translateY(-10px) scale(0.2); }
}
@keyframes aia-panel-in {
  0%   { opacity: 0; transform: translateY(24px) scale(0.92); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes aia-tool-in {
  0%   { opacity: 0; transform: translateY(16px) scale(0.94); filter: blur(4px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
}
@keyframes aia-success-flash {
  /* 完成态闪光:只走 1 次,600ms 收尾;不能用 forwards(否则 box-shadow 残留) */
  0%   { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.6); }
  60%  { box-shadow: 0 0 0 6px rgba(74, 222, 128, 0.3); }
  100% { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4); }   /* 收尾回到底层 box-shadow */
}
@keyframes aia-burst {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--bx, 0), var(--by, 0)) scale(0.2); opacity: 0; }
}

/* ====================================================================
 * 气泡 — 多层 mask + 棱镜折射(看得见的"活物")
 * ==================================================================== */
.aiagent-sdk-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 50%),
    rgba(13, 12, 20, 0.7);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--aia-border-strong);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  z-index: 2147483600;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: var(--aia-font);
  transition:
    transform var(--aia-anim-dur) var(--aia-anim-ease),
    box-shadow var(--aia-anim-dur) var(--aia-anim-ease);
}
/* 气泡内"棱镜"层:conic-gradient 旋转,模拟折射光 */
.aiagent-sdk-bubble::before {
  content: '';
  position: absolute;
  inset: -50%;
  background: conic-gradient(
    from 0deg,
    var(--aia-paint-1) 0deg,
    transparent 60deg,
    var(--aia-paint-2) 120deg,
    transparent 180deg,
    var(--aia-paint-3) 240deg,
    transparent 300deg,
    var(--aia-paint-4) 360deg
  );
  animation: aia-rotate 6s linear infinite;
  filter: blur(8px);
  opacity: 0.85;
  pointer-events: none;
}
/* 气泡内"内核"高光 */
.aiagent-sdk-bubble::after {
  content: '';
  position: absolute;
  inset: 18%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 30%,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.3) 30%,
    transparent 60%
  );
  box-shadow:
    0 0 12px rgba(255, 255, 255, 0.4),
    0 0 24px var(--aia-glow);
  animation: aia-breathe 3s ease-in-out infinite;
  pointer-events: none;
}
.aiagent-sdk-bubble:hover {
  transform: scale(1.1);
  box-shadow:
    0 16px 48px rgba(167, 139, 250, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.aiagent-sdk-bubble:hover::before { animation-duration: 2s; }
.aiagent-sdk-bubble:focus-visible {
  outline: 2px solid var(--aia-glow);
  outline-offset: 4px;
}
.aiagent-sdk-bubble.aiagent-sdk-hidden { display: none; }
.aiagent-sdk-bubble.aiagent-sdk-pos-bl { right: auto; left: 24px; }

/* 头像 emoji 模式(用户传 avatar 时) */
.aiagent-sdk-bubble.aiagent-sdk-bubble-emoji {
  font-size: 26px;
  line-height: 1;
  color: #fff;
}
.aiagent-sdk-bubble.aiagent-sdk-bubble-emoji::before,
.aiagent-sdk-bubble.aiagent-sdk-bubble-emoji::after { display: none; }
.aiagent-sdk-bubble.aiagent-sdk-bubble-emoji > * { position: relative; z-index: 1; }

@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-bubble::before,
  .aiagent-sdk-bubble::after { animation: none; }
}

/* ====================================================================
 * 面板 — 油画画布 + 4 角飞溅
 * ==================================================================== */
.aiagent-sdk-panel {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 400px;
  height: 640px;
  max-height: 80vh;
  /* 油画画布背景:多层径向晕染 + 噪点 */
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%, var(--aia-canvas-3) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 100% 30%, var(--aia-canvas-2) 0%, transparent 50%),
    radial-gradient(ellipse 70% 50% at 0% 100%, var(--aia-canvas-2) 0%, transparent 50%),
    var(--aia-canvas-1);
  color: var(--aia-text);
  border-radius: var(--aia-radius-lg);
  border: 1px solid var(--aia-border-strong);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  z-index: 2147483600;
  display: none;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--aia-font);
  opacity: 0;
  transform: translateY(24px) scale(0.92);
  transform-origin: bottom right;
  transition:
    opacity 320ms var(--aia-anim-ease),
    transform 480ms var(--aia-anim-ease);
  pointer-events: none;
  /* 鼠标光斑跟随(由 JS 更新 --aia-mx/--aia-my) */
  background-image:
    radial-gradient(ellipse 80% 60% at 20% 0%, var(--aia-canvas-3) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 100% 30%, var(--aia-canvas-2) 0%, transparent 50%),
    radial-gradient(ellipse 70% 50% at 0% 100%, var(--aia-canvas-2) 0%, transparent 50%),
    radial-gradient(180px 180px at var(--aia-mx) var(--aia-my), rgba(167, 139, 250, 0.06), transparent 70%),
    var(--aia-canvas-1);
}
/* 噪点纹理(伪元素覆盖) */
.aiagent-sdk-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--aia-noise);
  background-size: 200px 200px;
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
  mix-blend-mode: overlay;
}
.aiagent-sdk-panel.aiagent-sdk-open {
  display: flex;
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
  animation: aia-panel-in 520ms var(--aia-anim-ease);
}
.aiagent-sdk-panel.aiagent-sdk-pos-bl { right: auto; left: 24px; transform-origin: bottom left; }
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-panel { transition: opacity 120ms linear; transform: none; }
  .aiagent-sdk-panel.aiagent-sdk-open { animation: none; }
}

/* ====================================================================
 * 4 角油彩"飞溅" — 看得见的形状(不再是 blur 圆)
 * ==================================================================== */
.aiagent-sdk-corner {
  position: absolute;
  width: 140px;
  height: 140px;
  pointer-events: none;
  z-index: 1;
  filter: blur(14px);
  opacity: 0.55;
}
.aiagent-sdk-corner-tl { top: -30px; left: -30px;
  background: radial-gradient(circle at 70% 70%, var(--aia-paint-1) 0%, transparent 50%),
              radial-gradient(circle at 30% 30%, var(--aia-paint-2) 0%, transparent 40%);
  animation: aia-paint-flow 4s ease-in-out infinite;
}
.aiagent-sdk-corner-tr { top: -30px; right: -30px;
  background: radial-gradient(circle at 30% 70%, var(--aia-paint-3) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, var(--aia-paint-4) 0%, transparent 40%);
  animation: aia-paint-flow-rev 5s ease-in-out infinite;
}
.aiagent-sdk-corner-bl { bottom: -30px; left: -30px;
  background: radial-gradient(circle at 70% 30%, var(--aia-paint-2) 0%, transparent 50%),
              radial-gradient(circle at 30% 70%, var(--aia-paint-4) 0%, transparent 40%);
  animation: aia-paint-flow-rev 4.5s ease-in-out infinite;
}
.aiagent-sdk-corner-br { bottom: -30px; right: -30px;
  background: radial-gradient(circle at 30% 30%, var(--aia-paint-3) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, var(--aia-paint-1) 0%, transparent 40%);
  animation: aia-paint-flow 5.5s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-corner { animation: none !important; }
}

/* ====================================================================
 * 头部 — 极简(状态点 + 标题)
 * ==================================================================== */
.aiagent-sdk-header {
  padding: 14px 18px 16px 18px;   /* 上下不同:bottom 多 2px 避开 1px 底边 */
  background: transparent;
  color: var(--aia-text);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-bottom: 1px solid var(--aia-border);
  position: relative;
  z-index: 2;
  min-height: 50px;
}
.aiagent-sdk-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.aiagent-sdk-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    var(--aia-paint-1),
    var(--aia-paint-2),
    var(--aia-paint-3),
    var(--aia-paint-4),
    var(--aia-paint-1)
  );
  box-shadow: 0 0 8px var(--aia-glow), 0 0 16px rgba(167, 139, 250, 0.4);
  animation: aia-rotate 4s linear infinite;
  flex-shrink: 0;
}
.aiagent-sdk-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;       /* 1.3 → 1.4,文字垂直居中更稳 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.005em;
  color: var(--aia-text);
  display: inline-flex;
  align-items: center;
}
.aiagent-sdk-subtitle {
  font-size: 11px;
  color: var(--aia-text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 1.5;       /* 显式 line-height,文字基线稳定 */
  padding: 2px 8px;       /* 内 padding 让文字远离底边线 */
  border-radius: var(--aia-radius-pill);
  background: rgba(255, 255, 255, 0.04);
  display: inline-flex;
  align-items: center;
}
.aiagent-sdk-header-actions {
  display: flex;
  align-items: center;    /* 显式 center,避免 stretch 把 subtitle 拉到底 */
  gap: 4px;
}
.aiagent-sdk-iconbtn {
  background: transparent;
  border: none;
  color: var(--aia-text-muted);
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  padding: 0;
  transition: background 150ms var(--aia-anim-ease), color 150ms var(--aia-anim-ease);
  font-family: var(--aia-font);
}
.aiagent-sdk-iconbtn:hover {
  background: var(--aia-border);
  color: var(--aia-text);
}
.aiagent-sdk-iconbtn:focus-visible {
  outline: 2px solid var(--aia-glow);
  outline-offset: 1px;
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-status-dot { animation: none; }
}

/* ====================================================================
 * 消息区
 * ==================================================================== */
.aiagent-sdk-messages {
  flex: 1;
  overflow-y: auto;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: transparent;
  scrollbar-width: thin;
  scrollbar-color: var(--aia-text-faint) transparent;
  position: relative;
  z-index: 2;
}
.aiagent-sdk-messages::-webkit-scrollbar { width: 6px; }
.aiagent-sdk-messages::-webkit-scrollbar-thumb {
  background: var(--aia-text-faint);
  border-radius: 3px;
}
.aiagent-sdk-messages::-webkit-scrollbar-track { background: transparent; }

/* ====================================================================
 * 欢迎区(专属,不是消息)
 *
 * 跟 .aiagent-sdk-msg / .aiagent-sdk-msg-system 完全独立:
 *   - 不进对话历史
 *   - 用户发第一条消息后由 widget.hideWelcome() 淡出
 *   - 视觉上像面板的"介绍卡片",不是消息气泡
 * ==================================================================== */
.aiagent-sdk-welcome {
  flex-shrink: 0;
  margin: 16px 16px 4px 16px;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--aia-text-muted);
  background:
    linear-gradient(135deg, rgba(94, 234, 212, 0.06), rgba(167, 139, 250, 0.06));
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-md);
  position: relative;
  z-index: 2;
  transition: opacity 280ms var(--aia-anim-ease), transform 280ms var(--aia-anim-ease);
  letter-spacing: 0.01em;
}
.aiagent-sdk-welcome[hidden] { display: none; }
.aiagent-sdk-welcome.aiagent-sdk-welcome-leaving {
  opacity: 0;
  transform: translateY(-8px);
  pointer-events: none;
}

/* ====================================================================
 * 消息 — 墨水渗纸 + 高光扫过
 * ==================================================================== */
.aiagent-sdk-msg {
  position: relative;
  display: inline-block;
  width: fit-content;
  max-width: 85%;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.7;
  word-wrap: break-word;
  font-weight: 400;
  letter-spacing: 0.01em;
  border-radius: var(--aia-radius-md);
  /* 墨水渗纸入场 */
  animation: aia-msg-paint 360ms var(--aia-anim-ease) forwards;
  /* 背景高光扫过(每条消息入场后跟一次) */
  background-image: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 70%
  );
  background-size: 200% 100%;
  background-position: -200% 50%;
  background-repeat: no-repeat;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--aia-border);
}

/* user 消息:右对齐,青→紫渐变边 */
.aiagent-sdk-msg-user {
  align-self: flex-end;
  text-align: left;
  background-image:
    linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.12) 50%, transparent 70%),
    linear-gradient(135deg, rgba(94, 234, 212, 0.12), rgba(167, 139, 250, 0.12));
  background-size: 200% 100%, 100% 100%;
  background-position: -200% 50%, 0 0;
  background-repeat: no-repeat;
  border: 1px solid rgba(94, 234, 212, 0.3);
  color: var(--aia-text);
  animation: aia-msg-paint-r 360ms var(--aia-anim-ease) forwards, aia-msg-shine 1200ms 200ms ease-out forwards;
}

/* assistant 消息:左对齐,半透明白边 */
.aiagent-sdk-msg-assistant {
  align-self: flex-start;
  color: var(--aia-text);
  background-image:
    linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.08) 50%, transparent 70%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.05));
  background-size: 200% 100%, 100% 100%;
  background-position: -200% 50%, 0 0;
  background-repeat: no-repeat;
  border: 1px solid var(--aia-border);
  animation: aia-msg-paint 360ms var(--aia-anim-ease) forwards, aia-msg-shine 1200ms 200ms ease-out forwards;
}

/* 系统提示:小字居中,极淡 */
.aiagent-sdk-msg-system {
  align-self: center;
  color: var(--aia-text-faint);
  font-size: 12px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-pill);
  animation: aia-msg-paint 360ms var(--aia-anim-ease) forwards;
}

/* 工具调用卡片容器 */
.aiagent-sdk-msg-tool {
  align-self: stretch;
  max-width: 100%;
  padding: 0;
  background: transparent;
  border: none;
  animation: aia-tool-in 480ms var(--aia-anim-ease) forwards;
}

.aiagent-sdk-msg b { font-weight: 600; }

@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-msg,
  .aiagent-sdk-msg-user,
  .aiagent-sdk-msg-assistant,
  .aiagent-sdk-msg-system,
  .aiagent-sdk-msg-tool { animation: none; opacity: 1; clip-path: none; filter: none; }
}

/* ====================================================================
 * 流式光标(assistant 消息末尾 ▍ 闪烁)
 * ==================================================================== */
.aiagent-sdk-msg-assistant.aiagent-sdk-typing-active::after {
  content: '▍';
  display: inline-block;
  margin-left: 2px;
  color: var(--aia-paint-3);
  font-weight: 400;
  animation: aia-cursor-blink 1.2s steps(1) infinite;
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-msg-assistant.aiagent-sdk-typing-active::after { animation: none; }
}

/* ====================================================================
 * 流式光标 + AI 思考粒子 —— 合并到 assistant 消息占位内
 *
 * 修 v5 问题:
 *   - 之前 thinking(粒子)+ typing(空 div)是两个独立 sibling,看着"loading
 *     在占位外面"
 *   - 现在 typing 占位 div 内部就是 5 颗粒子(代表"等待响应中"),
 *     等流开始时清空粒子 + 填 markdown
 *
 *   <div class="aiagent-sdk-msg aiagent-sdk-msg-assistant aiagent-sdk-typing-pending">
 *     <span class="aia-p"></span> × 5  (颜色和 delay 由 JS 内联 style 注入)
 *   </div>
 * ==================================================================== */

/* 等待中的占位:5 颗粒子在 assistant 框内部"飞" */
.aiagent-sdk-msg-assistant {
  align-self: flex-start;
  color: var(--aia-text);
  background-image:
    linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.08) 50%, transparent 70%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.05));
  background-size: 200% 100%, 100% 100%;
  background-position: -200% 50%, 0 0;
  background-repeat: no-repeat;
  border: 1px solid var(--aia-border);
  animation: aia-msg-paint 360ms var(--aia-anim-ease) forwards, aia-msg-shine 1200ms 200ms ease-out forwards;
}
/* 等待中(粒子):调整 padding 让 5 颗 5px 粒子舒服居中 */
.aiagent-sdk-msg-assistant.aiagent-sdk-typing-pending {
  padding: 10px 16px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 22px;
}
.aiagent-sdk-msg-assistant.aiagent-sdk-typing-pending .aia-p {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c, var(--aia-glow));
  box-shadow: 0 0 8px var(--c, var(--aia-glow)), 0 0 16px var(--c, var(--aia-glow));
  animation: aia-p-rise 1.4s ease-in-out infinite;
  animation-delay: var(--d, 0s);
  opacity: 0;
  flex-shrink: 0;
}

/* (流式光标 ::after 由 aiagent-sdk-typing-active 触发) */
.aiagent-sdk-msg-assistant.aiagent-sdk-typing-active::after {
  content: '▍';
  display: inline-block;
  margin-left: 2px;
  color: var(--aia-paint-3);
  font-weight: 400;
  animation: aia-cursor-blink 1.2s steps(1) infinite;
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-msg-assistant.aiagent-sdk-typing-pending .aia-p { animation: none; opacity: 0.6; }
  .aiagent-sdk-msg-assistant.aiagent-sdk-typing-active::after { animation: none; }
}
@media (prefers-reduced-motion: reduce) {
  .aia-p { animation: none; opacity: 0.6; }
}

/* ====================================================================
 * 油彩终端卡(工具调用)
 *
 * 修 v5 问题:
 *   - <pre> 触发 native horizontal scrollbar(就算内容不需要)
 *   - JSON 字段颜色对比度不足(--aia-paint-4 天蓝在深色背景看不清)
 *   - aia-success-flash 动画结束 box-shadow 残留
 *   - 卡片整体太厚重
 * ==================================================================== */
.aiagent-sdk-tool-card {
  background:
    linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2)),
    rgba(0, 0, 0, 0.3);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  backdrop-filter: blur(20px) saturate(160%);
  border-radius: var(--aia-radius-md);
  border: 1px solid var(--aia-border-strong);
  border-left: 3px solid var(--aia-paint-3);
  font-family: var(--aia-mono);
  font-size: 12.5px;
  overflow: hidden;        /* 关键:阻止 <pre> 触发 horizontal scrollbar */
  animation: aia-tool-in 480ms var(--aia-anim-ease) forwards;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-success {
  border-left-color: var(--aia-success);
  /* 只跑 1 次入场的 2 个动画,不带常驻 box-shadow 残留 */
  animation: aia-tool-in 480ms var(--aia-anim-ease) forwards, aia-success-flash 600ms ease-out;
}
.aiagent-sdk-tool-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--aia-border);
  background: linear-gradient(90deg, rgba(167, 139, 250, 0.10), transparent);
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-success .aiagent-sdk-tool-head {
  background: linear-gradient(90deg, rgba(74, 222, 128, 0.12), transparent);
}
.aiagent-sdk-tool-arrow {
  background: conic-gradient(
    from 0deg,
    var(--aia-paint-1),
    var(--aia-paint-2),
    var(--aia-paint-3),
    var(--aia-paint-4),
    var(--aia-paint-1)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-success .aiagent-sdk-tool-arrow {
  background: var(--aia-success);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.aiagent-sdk-tool-name {
  color: var(--aia-text);
  font-weight: 600;
  flex: 1;
  letter-spacing: -0.01em;
  font-size: 12.5px;
}
.aiagent-sdk-tool-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--aia-glow);
  box-shadow: 0 0 6px var(--aia-glow);
  flex-shrink: 0;
  animation: aia-breathe 1.5s ease-in-out infinite;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-success .aiagent-sdk-tool-dot {
  background: var(--aia-success);
  box-shadow: 0 0 6px var(--aia-success);
  animation: none;
}
.aiagent-sdk-tool-body {
  margin: 0;
  padding: 10px 14px;
  color: var(--aia-text);
  font-size: 12.5px;
  line-height: 1.75;       /* 1.6 → 1.75,更易读 */
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--aia-mono);
  overflow: hidden;         /* 关键:不显示 native horizontal scrollbar */
  max-width: 100%;
}
/* JSON 字段配色(对比度 WCAG AA 4.5:1 验证通过)
 *   k (key) :粉 #f0abfc + 粗,极显眼
 *   s (string value):青绿 #5eead4 + 略粗
 *   n (number):琥珀 #fcd34d + 粗
 *   v (其他值,基本不用):主白
 */
.aiagent-sdk-tool-body .k {
  color: var(--aia-paint-3);
  font-weight: 600;
}
.aiagent-sdk-tool-body .s {
  color: var(--aia-paint-1);
  font-weight: 500;
}
.aiagent-sdk-tool-body .n {
  color: var(--aia-paint-5);  /* 琥珀 #fcd34d,与油彩终端呼应 */
  font-weight: 600;
}
.aiagent-sdk-tool-body .v { color: var(--aia-text); }
.aiagent-sdk-tool-body .p { color: var(--aia-text-faint); }  /* 标点 */
/* 工具名字(在 body 顶部单独高亮) */
.aiagent-sdk-tool-body .tool-name {
  color: var(--aia-paint-2);
  font-weight: 600;
  font-size: 13px;
  display: inline-block;
  margin-right: 8px;
}
.aiagent-sdk-tool-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-top: 1px solid var(--aia-border);
  font-size: 11.5px;
  color: var(--aia-text-muted);
  font-family: var(--aia-font);
  min-height: 30px;
}
.aiagent-sdk-tool-bar {
  flex: 1;
  height: 4px;             /* 3 → 4 更清楚 */
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.10);
  position: relative;
  overflow: hidden;
}
.aiagent-sdk-tool-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--p, 0%);
  background: linear-gradient(90deg,
    var(--aia-paint-1), var(--aia-paint-2),
    var(--aia-paint-3), var(--aia-paint-4));
  border-radius: 2px;
  transition: width 280ms ease;
  box-shadow: 0 0 6px var(--aia-glow);
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-success .aiagent-sdk-tool-bar::before {
  background: var(--aia-success);
  width: 100%;
  box-shadow: 0 0 8px var(--aia-success);
}
.aiagent-sdk-tool-status {
  flex-shrink: 0;
  letter-spacing: 0.02em;
  color: var(--aia-text);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  min-width: 80px;          /* 给状态文字一个固定宽度,防止布局跳动 */
  text-align: right;
}

/* ====================================================================
 * 思考卡片 — 模型推理过程(流式,可折叠,完成自动收起)
 * ==================================================================== */
.aiagent-sdk-thinking-card {
  align-self: stretch;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 2px solid var(--aia-paint-2);
  border-radius: 10px;
  /* 不加 overflow:hidden,否则 body 内部的 overflow-y:auto 滚动被截 */
  animation: aia-thinking-in 320ms var(--aia-anim-ease) forwards;
  transition: max-height 0.4s ease;
  max-height: 200px;
}
.aiagent-sdk-thinking-card.aiagent-sdk-thinking-done {
  max-height: 48px;  /* 40 → 48,多张堆叠时 header 不挤成一条缝 */
}
.aiagent-sdk-thinking-card.aiagent-sdk-thinking-expanded {
  max-height: 500px;  /* 给展开后留够滚动空间,header 40 + body 460 */
}

/* 入场:墨水渗纸 */
@keyframes aia-thinking-in {
  from {
    opacity: 0;
    transform: translateY(8px);
    clip-path: circle(0% at 50% 50%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    clip-path: circle(100% at 50% 50%);
  }
}

/* 头部 */
.aiagent-sdk-thinking-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

/* 虹彩圆点(思考中 → 完成变绿) */
.aiagent-sdk-thinking-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: conic-gradient(
    from 0deg,
    var(--aia-paint-1), var(--aia-paint-2),
    var(--aia-paint-3), var(--aia-paint-4), var(--aia-paint-1)
  );
  animation: aia-core-spin 3s linear infinite;
  box-shadow: 0 0 6px var(--aia-glow);
}
.aiagent-sdk-thinking-done .aiagent-sdk-thinking-dot {
  background: var(--aia-success);
  animation: none;
  box-shadow: 0 0 6px var(--aia-success);
}

/* 标签 */
.aiagent-sdk-thinking-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--aia-text-muted);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 展开/收起按钮 */
.aiagent-sdk-thinking-toggle {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 6px;
  color: var(--aia-text-muted);
  font-size: 11px;
  font-family: var(--aia-font);
  padding: 3px 10px;
  min-height: 22px;  /* 提升可点击区,堆叠时更容易点 */
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  line-height: 1.5;
}
.aiagent-sdk-thinking-toggle:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--aia-text);
}

/* 主体(等宽字体,底部淡出) */
.aiagent-sdk-thinking-body {
  margin: 0;
  padding: 10px 12px;
  font-family: var(--aia-mono);
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--aia-text-muted);
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  max-height: 156px;
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  transition: max-height 0.35s ease, opacity 0.25s ease, padding 0.35s ease;
  opacity: 1;
}
.aiagent-sdk-thinking-done .aiagent-sdk-thinking-body {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}
.aiagent-sdk-thinking-expanded .aiagent-sdk-thinking-body {
  /* max-height 包含 padding (box-sizing:border-box),所以用 calc 减掉 padding 上下 20px */
  /* 这样 max-height:460 包含 20px padding → 内容 440,刚好被 card 框住,滚动条不溢出 */
  max-height: calc(460px - 20px);
  overflow-y: auto;
  mask-image: none;
  -webkit-mask-image: none;
  /* 覆盖 .done 状态下的 padding:0 / opacity:0 — 展开后内容必须可见 */
  padding-top: 10px;
  padding-bottom: 10px;
  opacity: 1;
}
/* 滚动条样式 — 和消息区一致,深色细条 */
.aiagent-sdk-thinking-body::-webkit-scrollbar { width: 6px; }
.aiagent-sdk-thinking-body::-webkit-scrollbar-thumb {
  background: var(--aia-text-faint);
  border-radius: 3px;
}
.aiagent-sdk-thinking-body::-webkit-scrollbar-track { background: transparent; }

/* 无障碍:减少动画 */
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-thinking-card { animation: none; }
  .aiagent-sdk-thinking-dot { animation: none; }
  .aiagent-sdk-thinking-body { transition: none; }
  .aiagent-sdk-thinking-card { transition: none; }
}

/* ====================================================================
 * 输入栏 — 底部焦点线 + 圆形发送按钮(SVG 箭头)
 * ==================================================================== */
.aiagent-sdk-inputbar {
  padding: 12px 14px 14px;
  border-top: 1px solid var(--aia-border);
  background: transparent;
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}
.aiagent-sdk-inputbar textarea {
  flex: 1;
  resize: none;
  border: none;
  border-bottom: 1px solid var(--aia-border);
  border-radius: 0;
  padding: 8px 2px;
  font: inherit;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  max-height: 80px;
  background: transparent;
  color: var(--aia-text);
  font-family: var(--aia-font);
  letter-spacing: 0.01em;
  transition: border-color 200ms var(--aia-anim-ease);
}
.aiagent-sdk-inputbar textarea::placeholder {
  color: var(--aia-text-faint);
}
.aiagent-sdk-inputbar textarea:focus {
  border-bottom-color: var(--aia-glow);
  box-shadow: 0 1px 0 0 var(--aia-glow);
}
.aiagent-sdk-send {
  background: conic-gradient(
    from 0deg,
    var(--aia-paint-1),
    var(--aia-paint-2),
    var(--aia-paint-3),
    var(--aia-paint-4),
    var(--aia-paint-1)
  );
  color: #fff;
  border: none;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  font-weight: 500;
  position: relative;
  transition: transform 150ms var(--aia-anim-ease);
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 14px var(--aia-glow), 0 4px 12px rgba(0, 0, 0, 0.3);
  align-self: flex-end;
  font-family: var(--aia-font);
  overflow: visible;
}
.aiagent-sdk-send:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 0 24px var(--aia-glow), 0 6px 20px rgba(0, 0, 0, 0.4);
}
.aiagent-sdk-send:active:not(:disabled) { transform: scale(0.94); }
.aiagent-sdk-send:disabled {
  background: var(--aia-border-strong);
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.6;
}
.aiagent-sdk-send svg {
  position: relative;
  z-index: 1;
  width: 18px;
  height: 18px;
  stroke: #fff;
  stroke-width: 2.5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
}
/* 发送按钮爆炸粒子(由 JS 临时加) */
.aiagent-sdk-send-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px #fff, 0 0 20px var(--c, var(--aia-glow));
  pointer-events: none;
  animation: aia-burst 700ms var(--aia-anim-ease) forwards;
}

/* ====================================================================
 * 工具结果重试/取消卡片
 * ==================================================================== */
.aiagent-sdk-tool-result-failed {
  align-self: stretch;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-left: 3px solid var(--aia-error);
  border-radius: var(--aia-radius-sm);
  padding: 10px 12px;
  margin: 2px 0;
  font-size: 12.5px;
  color: var(--aia-error);
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: aia-tool-in 320ms var(--aia-anim-ease) forwards;
}
.aiagent-sdk-tool-result-failed-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.aiagent-sdk-tool-result-failed-detail {
  font-weight: 400;
  opacity: 0.85;
  font-size: 12px;
  margin-left: 22px;
  color: var(--aia-text-muted);
}
.aiagent-sdk-tool-result-actions {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-left: 22px;
}
.aiagent-sdk-tool-result-actions button {
  font-family: inherit;
  font-size: 12px;
  line-height: 1;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 150ms var(--aia-anim-ease), border-color 150ms var(--aia-anim-ease), color 150ms var(--aia-anim-ease), transform 80ms var(--aia-anim-ease);
  border: 1px solid;
}
.aiagent-sdk-tool-result-actions button:active { transform: scale(0.96); }
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-retry {
  background: var(--aia-text);
  color: var(--aia-bg);
  border-color: var(--aia-text);
}
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-retry:hover { opacity: 0.9; }
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-cancel {
  background: transparent;
  color: var(--aia-text-muted);
  border-color: var(--aia-border);
}
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-cancel:hover {
  background: var(--aia-border);
  color: var(--aia-text);
}

/* ====================================================================
 * Markdown 渲染样式
 * ==================================================================== */
.aiagent-sdk-msg p { margin: 0.4em 0; }
.aiagent-sdk-msg p:first-child { margin-top: 0; }
.aiagent-sdk-msg p:last-child { margin-bottom: 0; }
.aiagent-sdk-msg h1, .aiagent-sdk-msg h2, .aiagent-sdk-msg h3, .aiagent-sdk-msg h4 {
  font-weight: 600;
  line-height: 1.3;
  margin: 0.7em 0 0.3em;
  letter-spacing: -0.01em;
}
.aiagent-sdk-msg h1 { font-size: 1.3em; }
.aiagent-sdk-msg h2 { font-size: 1.18em; }
.aiagent-sdk-msg h3 { font-size: 1.08em; }
.aiagent-sdk-msg h4 { font-size: 1em; }
.aiagent-sdk-msg ul, .aiagent-sdk-msg ol { margin: 0.4em 0; padding-left: 1.5em; }
.aiagent-sdk-msg li { margin: 0.15em 0; }
.aiagent-sdk-msg li > p { margin: 0.15em 0; }
.aiagent-sdk-msg blockquote {
  border-left: 2px solid var(--aia-paint-2);
  padding: 4px 12px;
  margin: 0.5em 0;
  color: var(--aia-text-muted);
  background: rgba(167, 139, 250, 0.05);
  border-radius: 0 6px 6px 0;
}
.aiagent-sdk-msg hr {
  border: none;
  border-top: 1px solid var(--aia-border);
  margin: 0.8em 0;
}
.aiagent-sdk-msg pre {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-sm);
  padding: 10px 12px;
  margin: 0.5em 0;
  overflow-x: auto;
  font-family: var(--aia-mono);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre;
}
.aiagent-sdk-msg pre code { background: transparent; padding: 0; font-size: inherit; }
.aiagent-sdk-msg code {
  background: rgba(167, 139, 250, 0.1);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 12px;
  font-family: var(--aia-mono);
  color: var(--aia-paint-3);
}
.aiagent-sdk-msg a {
  color: var(--aia-paint-3);
  text-decoration: underline;
  text-underline-offset: 2px;
  word-break: break-all;
  text-decoration-color: rgba(240, 171, 252, 0.4);
}
.aiagent-sdk-msg a:hover { color: var(--aia-paint-2); }
.aiagent-sdk-msg table {
  border-collapse: separate;
  border-spacing: 0;
  margin: 0.6em 0;
  font-size: 13px;
  display: table;
  overflow: hidden;
  max-width: 100%;
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-sm);
  width: auto;
}
.aiagent-sdk-msg th, .aiagent-sdk-msg td {
  border: none;
  border-bottom: 1px solid var(--aia-border);
  padding: 7px 12px;
  text-align: left;
  vertical-align: middle;
}
.aiagent-sdk-msg tr:last-child td { border-bottom: none; }
.aiagent-sdk-msg th {
  background: rgba(255, 255, 255, 0.04);
  font-weight: 600;
  color: var(--aia-text);
}
.aiagent-sdk-msg tbody tr:nth-child(even) td {
  background: rgba(255, 255, 255, 0.02);
}
.aiagent-sdk-msg del { color: var(--aia-text-faint); text-decoration: line-through; }
.aiagent-sdk-msg input[type=checkbox] { margin-right: 6px; }
.aiagent-sdk-msg img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 0.4em 0;
  display: block;
  cursor: zoom-in;
  background: rgba(255, 255, 255, 0.03);
}
`,Wi=`
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M5 12 L19 12 M13 6 L19 12 L13 18"/>
</svg>
`.trim();class Yi{constructor(e,t){x(this,"host",null);x(this,"shadow",null);x(this,"bubble",null);x(this,"panel",null);x(this,"msgEl",null);x(this,"taEl",null);x(this,"sendBtn",null);x(this,"welcomeEl",null);x(this,"isOpen",!1);x(this,"mounted",!1);x(this,"avatarRaw","🤖");x(this,"onMouseMove",null);this.opts=e,this.handlers=t}getRefs(){return!this.host||!this.bubble||!this.panel||!this.msgEl||!this.taEl||!this.sendBtn?null:{host:this.host,bubble:this.bubble,panel:this.panel,msgEl:this.msgEl,taEl:this.taEl,sendBtn:this.sendBtn}}mount(){if(this.mounted||typeof document>"u")return;const e=document.createElement("div");e.className="aiagent-sdk-host",e.setAttribute("data-position",this.opts.position||"bottom-right"),e.setAttribute("data-theme",this.opts.theme||"ink"),document.body.appendChild(e),this.host=e;const t=e.attachShadow({mode:"open"});this.shadow=t;const n=document.createElement("style");n.textContent=Gi,t.appendChild(n);const a=this.opts.position==="bottom-left"?" aiagent-sdk-pos-bl":"";this.avatarRaw=this.opts.avatar||"🤖";const s=this.avatarRaw.length<=2,r=document.createElement("button");s?(r.className="aiagent-sdk-bubble aiagent-sdk-bubble-emoji"+a,r.textContent=this.avatarRaw):r.className="aiagent-sdk-bubble"+a,r.setAttribute("aria-label",this.opts.title||"AI 助手 - 点击打开对话"),r.title=this.opts.title||"AI 助手",r.addEventListener("click",()=>this.toggle()),t.appendChild(r),this.bubble=r;const l=document.createElement("div");l.className="aiagent-sdk-panel"+a;const c=this.opts.demoTools?'<button class="aiagent-sdk-iconbtn aiagent-sdk-extract" title="开/关 录单模式" aria-label="录单模式">⊕</button>':"";l.innerHTML=['<div class="aiagent-sdk-corner aiagent-sdk-corner-tl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-tr" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-bl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-br" aria-hidden="true"></div>','<div class="aiagent-sdk-header">','  <div class="aiagent-sdk-header-info">','    <span class="aiagent-sdk-status-dot" aria-hidden="true"></span>','    <span class="aiagent-sdk-title"></span>',"  </div>",'  <div class="aiagent-sdk-header-actions">','    <span class="aiagent-sdk-subtitle"></span>',c,'    <button class="aiagent-sdk-iconbtn aiagent-sdk-new" title="新会话" aria-label="新会话">＋</button>','    <button class="aiagent-sdk-iconbtn aiagent-sdk-close" title="关闭" aria-label="关闭">✕</button>',"  </div>","</div>",'<div class="aiagent-sdk-welcome" hidden></div>','<div class="aiagent-sdk-messages" role="log" aria-live="polite"></div>','<div class="aiagent-sdk-inputbar">','  <textarea rows="1" placeholder="" aria-label="输入消息"></textarea>',`  <button class="aiagent-sdk-send" aria-label="发送">${Wi}</button>`,"</div>"].join(""),t.appendChild(l),this.panel=l;const u=l.querySelector(".aiagent-sdk-title"),p=l.querySelector(".aiagent-sdk-subtitle");u.textContent=this.opts.title||"AI 助手",p.textContent=this.opts.subtitle||"";const f=l.querySelector("textarea");f.placeholder=this.opts.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",this.msgEl=l.querySelector(".aiagent-sdk-messages"),this.taEl=f,this.sendBtn=l.querySelector(".aiagent-sdk-send"),this.welcomeEl=l.querySelector(".aiagent-sdk-welcome");const m=l.querySelector(".aiagent-sdk-close"),k=l.querySelector(".aiagent-sdk-new"),h=l.querySelector(".aiagent-sdk-extract");m.addEventListener("click",()=>this.handlers.onClose()),k.addEventListener("click",()=>this.handlers.onNew()),h&&h.addEventListener("click",()=>this.handlers.onToggleExtract()),this.sendBtn.addEventListener("click",()=>{this._burstSend(),this.handlers.onSend()}),f.addEventListener("keydown",S=>{S.key==="Enter"&&!S.shiftKey&&(S.preventDefault(),this._burstSend(),this.handlers.onSend())}),f.addEventListener("input",()=>{f.style.height="auto",f.style.height=Math.min(f.scrollHeight,80)+"px"}),this.onMouseMove=S=>{if(!this.panel)return;const E=this.panel.getBoundingClientRect(),M=(S.clientX-E.left)/E.width*100,I=(S.clientY-E.top)/E.height*100;this.panel.style.setProperty("--aia-mx",M+"%"),this.panel.style.setProperty("--aia-my",I+"%")},this.panel.addEventListener("mousemove",this.onMouseMove),this.panel.addEventListener("mouseleave",()=>{this.panel&&(this.panel.style.setProperty("--aia-mx","50%"),this.panel.style.setProperty("--aia-my","50%"))}),this.setTheme(this.opts.theme||"ink"),this.mounted=!0}destroy(){this.mounted&&(this.panel&&this.onMouseMove&&this.panel.removeEventListener("mousemove",this.onMouseMove),this.host&&this.host.parentNode&&this.host.parentNode.removeChild(this.host),this.host=null,this.shadow=null,this.bubble=null,this.panel=null,this.msgEl=null,this.taEl=null,this.sendBtn=null,this.welcomeEl=null,this.mounted=!1,this.isOpen=!1,this.onMouseMove=null)}open(){this.panel&&(this.panel.classList.add("aiagent-sdk-open"),this.isOpen=!0,setTimeout(()=>{this.taEl&&this.taEl.focus()},50),this.handlers.onPanelOpen())}close(){this.panel&&(this.panel.classList.remove("aiagent-sdk-open"),this.isOpen=!1)}toggle(){this.isOpen?this.close():this.open()}getIsOpen(){return this.isOpen}setTheme(e){this.host&&this.host.setAttribute("data-theme",e)}clearMessages(){this.msgEl&&(this.msgEl.innerHTML="")}setWelcome(e){if(this.welcomeEl){if(!e){this.welcomeEl.hidden=!0;return}this.welcomeEl.hidden=!1,this.welcomeEl.textContent=e}}hideWelcome(){this.welcomeEl&&(this.welcomeEl.hidden||(this.welcomeEl.classList.add("aiagent-sdk-welcome-leaving"),setTimeout(()=>{this.welcomeEl&&(this.welcomeEl.hidden=!0,this.welcomeEl.classList.remove("aiagent-sdk-welcome-leaving"))},280)))}_burstSend(){if(!this.sendBtn)return;const e=5,t=["#5eead4","#a78bfa","#f0abfc","#93c5fd","#fcd34d"];for(let n=0;n<e;n++){const a=Math.PI*2*n/e+Math.random()*.5,s=22+Math.random()*14,r=Math.cos(a)*s,l=Math.sin(a)*s,c=document.createElement("span");c.className="aiagent-sdk-send-burst",c.style.setProperty("--bx",r+"px"),c.style.setProperty("--by",l+"px");const u=t[n];c.style.setProperty("--c",u),c.style.background=u,this.sendBtn.appendChild(c),setTimeout(()=>c.remove(),750)}}}function Zi(i,e){i.setTheme(e)}const Xi=[{name:"submit_form",description:"Submit the collected order fields. Call only when ALL required fields are collected.",parameters:{type:"object",properties:{orderId:{type:"string",description:"订单编号,如 PO-2024-001"},customerName:{type:"string",description:"客户全名"},customerPhone:{type:"string",description:"11 位手机号"},items:{type:"string",description:"商品清单"},totalAmount:{type:"number",description:"订单总金额,单位元"},notes:{type:"string",description:"其他备注"}},required:["orderId","customerName","items","totalAmount"]},strict:!0}];class Ki{constructor(){x(this,"endpoint");x(this,"getAccessToken");x(this,"_opts");x(this,"_tokenCache",new O);x(this,"_tools",new Mi);x(this,"_widget",null);x(this,"_isOpen",!1);x(this,"_busy",!1);x(this,"_messages",[]);x(this,"_chatSessionId",null);x(this,"_activeTools",[]);x(this,"_extractOnCall",null);x(this,"_pendingToolCall",null);x(this,"_demoSessionId",null);x(this,"_lastToolCard",null);x(this,"_thinkingCard",null)}init(e){if(!e||!e.endpoint)throw new Error("endpoint required");if(typeof e.getAccessToken!="function")throw new Error("getAccessToken() required");return this.endpoint=String(e.endpoint).replace(/\/+$/,""),this.getAccessToken=e.getAccessToken,this._opts={title:e.title||"AI 助手",subtitle:e.subtitle||"在线",placeholder:e.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",welcomeMessage:e.welcomeMessage||"你好!我是 AI 助手,有什么可以帮你的?",theme:e.theme||"ink",position:e.position||"bottom-right",autoOpen:!!e.autoOpen,avatar:e.avatar||"🤖",clientPrefix:e.clientPrefix||"app",demoTools:!!e.demoTools,demoOrderTools:e.demoOrderTools||Xi},this._widget=new Yi(this._opts,{onSend:()=>this._onSend(),onNew:()=>this._newSession(),onClose:()=>this.close(),onToggleExtract:()=>this._toggleExtractMode(),onPanelOpen:()=>{}}),this._widget.mount(),this._opts.autoOpen&&this.open(),this._opts.welcomeMessage&&this._widget.setWelcome(this._opts.welcomeMessage),setTimeout(()=>{this._resumePendingToolResults()},0),this._opts.demoTools&&(this._demoSessionId=this._opts.clientPrefix+":demo",this._internalRegister(this._demoSessionId,this._opts.demoOrderTools).then(()=>{}).catch(t=>{console.warn("[AIAgent SDK] demo tools register failed:",t)})),this}destroy(){this._widget&&(this._widget.destroy(),this._widget=null)}async registerTools(e){if(!e||!e.sessionId)throw new Error("sessionId required");if(!e.tools||!e.tools.length)throw new Error("tools required");return this._internalRegister(e.sessionId,e.tools)}async unregisterTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const n=t.names||null;this._tools.unregister(t.sessionId,n);const a=await this._ensureToken();return Di(this.endpoint,a,t.sessionId,n)}async listTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const n=await this._ensureToken();return zi(this.endpoint,n,t.sessionId)}async _internalRegister(e,t){const n=this._tools.register(e,t),a=await this._ensureToken();return Li(this.endpoint,a,e,n)}_getLocalTool(e,t){return this._tools.get(e,t)}startExtractSession(e){const t=this._extractCtx();ji(t,e)}stopExtractSession(){qi(this._extractCtx())}_toggleExtractMode(){Hi(this._extractCtx())}async stream(e){const t=e||{};return this._postStream({sessionId:t.sessionId,message:t.message,activeTools:t.activeTools||[],onChunk:t.onChunk||(()=>{}),onDone:t.onDone||(()=>{}),onError:t.onError||(n=>console.error(n)),onToolCall:t.onToolCall})}open(){this._widget&&this._widget.open(),this._isOpen=!0}close(){this._widget&&this._widget.close(),this._isOpen=!1}toggle(){this._widget&&this._widget.toggle(),this._isOpen=this._widget?this._widget.getIsOpen():!1}setTheme(e){this._widget&&Zi(this._widget,e.theme)}async _ensureToken(){return this._tokenCache.get(this.getAccessToken)}_newSession(){const e=this._chatSessionId;e&&At(this.endpoint,"",e).catch(()=>{}),this._widget&&this._widget.clearMessages(),this._messages=[],this._activeTools=[],this._extractOnCall=null,this._chatSessionId=null,this._thinkingCard=null,this._widget&&this._opts.welcomeMessage&&this._widget.setWelcome(this._opts.welcomeMessage)}_onSend(){if(!this._widget)return;const e=this._widget.getRefs();if(!e)return;const t=e.taEl.value.trim();!t||this._busy||(e.taEl.value="",e.taEl.style.height="auto",this._sendUserMessage(t))}async _sendUserMessage(e){this._widget&&this._widget.hideWelcome(),this._appendMsg("user",e),this._setBusy(!0);const t=this._widget.getRefs(),n=Cn(t.msgEl);let a="",s="";const r=this,l=this._activeTools.slice(),c=this._extractOnCall;let u=!1,p=!1;function f(){p||(p=!0,Rn(n),In(n),r._thinkingCard&&(St(r._thinkingCard),r._thinkingCard=null))}const m={message:e,onChunk:k=>{a+=k.data||"",f(),n.innerHTML=Te(a),_e(n),t.msgEl.scrollTop=t.msgEl.scrollHeight},onDone:()=>{f(),Ve(n),n.innerHTML=Te(a),_e(n),t.msgEl.scrollTop=t.msgEl.scrollHeight,u||r._setBusy(!1),r._thinkingCard&&(St(r._thinkingCard),r._thinkingCard=null)},onError:k=>{Rn(n),p?(Ve(n),n.className="aiagent-sdk-msg aiagent-sdk-msg-system",n.textContent="⚠️ 错误:"+k.message):(n.remove(),r._appendMsg("system","⚠️ 错误:"+k.message)),r._setBusy(!1),u=!0,r._thinkingCard&&(St(r._thinkingCard),r._thinkingCard=null)},onThinking:k=>{if(s+=k,!r._thinkingCard){t.msgEl.insertBefore(Ci(t.msgEl),n);const h=t.msgEl.querySelectorAll(".aiagent-sdk-thinking-card");r._thinkingCard=h.length?h[h.length-1]:null}r._thinkingCard&&Ri(r._thinkingCard,s)},onToolCall:async k=>{if(!k||!k.tool||k.tool.indexOf("__")===0||!k.args||typeof k.args!="object"||!Object.keys(k.args).length||u)return;u=!0,r._appendMsg("tool","",{tool:k.tool,args:k.args});const S=t.msgEl.querySelectorAll(".aiagent-sdk-tool-card");r._lastToolCard=S.length?S[S.length-1]:null,r._lastToolCard&&$e(r._lastToolCard,30,"执行中…");let E;const M=r._getLocalTool(r._chatSessionId,k.tool);if(M&&M.onCall)try{E=await Promise.resolve(M.onCall(k.args))}catch(I){console.error("[AIAgent SDK] onCall threw:",I),r._appendMsg("system","⚠️ onCall 失败: "+I.message)}if(c&&k.tool==="submit_form")try{const I=c(k.args);I!=null&&E==null&&(E=I)}catch(I){console.error("[AIAgent SDK] extract onCall threw:",I)}r._lastToolCard&&$e(r._lastToolCard,60,"提交结果…"),k.id&&await r._postToolResult(k.id,E,r._lastToolCard)}};this._chatSessionId||(this._chatSessionId=this._opts.clientPrefix+":user-"+Date.now()),m.sessionId=this._chatSessionId,m.activeTools=l;try{await this._postStream(m)}catch{}}_setBusy(e){if(this._busy=e,!this._widget)return;const t=this._widget.getRefs();t&&(t.sendBtn.disabled=e,t.sendBtn.textContent=e?"...":"发送")}_sleep(e){return new Promise(t=>setTimeout(t,e))}_appendMsg(e,t,n){if(!this._widget)return;const a=this._widget.getRefs();a&&(Ni(a.msgEl,e,t,this._messages.length,n),this._messages.push({role:e,text:t,data:n}))}_appendTyping(){if(!this._widget)return document.createElement("div");const e=this._widget.getRefs();return e?Cn(e.msgEl):document.createElement("div")}async _postStream(e){const t=e.sessionId,n=e.message,a=e.activeTools,s=e.onChunk||(()=>{}),r=e.onDone||(()=>{}),l=e.onError||(h=>console.error(h)),c=e.onToolCall,u=e.onThinking;if(!t){l(new Error("sessionId required"));return}if(n==null){l(new Error("message required"));return}let p;try{p=await this._ensureToken()}catch(h){l(h);return}const f=this.endpoint+"/chat/"+encodeURIComponent(t)+"/stream",m={message:n};a&&a.length&&(m.activeTools=a);let k;try{k=await fetch(f,{method:"POST",headers:{Authorization:"Bearer "+p,"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify(m)})}catch(h){l(h);return}if(!k.ok||!k.body){l(new Error("http "+k.status));return}return X(k.body,s,r,l,c,u)}async _postToolResult(e,t,n){const a=this._toolCtx();return Pi(a,e,t,n)}async _resumePendingToolResults(){return Ui(this._toolCtx())}_toolCtx(){const e=this;return{endpoint:this.endpoint,ensureToken:()=>e._ensureToken(),getSessionId:()=>e._chatSessionId,getPending:()=>e._pendingToolCall,setPending:t=>{e._pendingToolCall=t},appendMsg:(t,n,a)=>e._appendMsg(t,n,a),setBusy:t=>e._setBusy(t),sleep:t=>e._sleep(t),appendTyping:()=>e._appendTyping(),getMsgEl:()=>e._widget?.getRefs()?.msgEl||document.createElement("div")}}_extractCtx(){const e=this;return{clientPrefix:this._opts.clientPrefix,getDemoSessionId:()=>e._demoSessionId,getChatSessionId:()=>e._chatSessionId,setChatSessionId:t=>{e._chatSessionId=t},getActiveTools:()=>e._activeTools,setActiveTools:t=>{e._activeTools=t},getExtractOnCall:()=>e._extractOnCall,setExtractOnCall:t=>{e._extractOnCall=t},hasLocalTool:(t,n)=>!!e._tools.get(t,n),registerTools:(t,n)=>e._internalRegister(t,n||[]),sendUserMessage:t=>e._sendUserMessage(t),appendMsg:(t,n)=>e._appendMsg(t,n)}}}function Vi(){return{init:i=>new Ki().init(i)}}const Ji=["https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap"];let On=!1;function Qi(){if(!On&&!(typeof document>"u"))try{const i=document.createElement("link");i.rel="preconnect",i.href="https://fonts.googleapis.com",document.head.appendChild(i);const e=document.createElement("link");e.rel="preconnect",e.href="https://fonts.gstatic.com",e.crossOrigin="anonymous",document.head.appendChild(e);for(const t of Ji){const n=document.createElement("link");n.rel="stylesheet",n.href=t,document.head.appendChild(n)}On=!0}catch(i){console.warn("[AIAgent SDK] loadFonts failed, fallback to system fonts:",i)}}Qi();const Nn=Vi();return globalThis.AIAgent=Nn,console.info("%c[AIAgent SDK v5.0.0]%c loaded (built __BUILD_TIME__). Theme: Iridescent Bloom. AIAgent.init({...}) is on window.AIAgent.","background:linear-gradient(135deg,#5eead4,#a78bfa,#f0abfc);color:#050505;padding:2px 8px;border-radius:3px;font-weight:700","color:#a1a1aa"),Nn});
