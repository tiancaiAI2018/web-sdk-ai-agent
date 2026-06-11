(function(L,O){typeof exports=="object"&&typeof module<"u"?module.exports=O():typeof define=="function"&&define.amd?define(O):(L=typeof globalThis<"u"?globalThis:L||self,L.AIAgent=O())})(this,function(){"use strict";var hs=Object.defineProperty;var ia=L=>{throw TypeError(L)};var ms=(L,O,K)=>O in L?hs(L,O,{enumerable:!0,configurable:!0,writable:!0,value:K}):L[O]=K;var b=(L,O,K)=>ms(L,typeof O!="symbol"?O+"":O,K),bs=(L,O,K)=>O.has(L)||ia("Cannot "+K);var sa=(L,O,K)=>O.has(L)?ia("Cannot add the same private member more than once"):O instanceof WeakSet?O.add(L):O.set(L,K);var qe=(L,O,K)=>(bs(L,O,"access private method"),K);var le,ra,Wt,oa;function L(s){if(!s)return null;try{const e=s.split(".");if(e.length!==3)return null;let t=e[1].replace(/-/g,"+").replace(/_/g,"/");for(;t.length%4;)t+="=";const n=atob(t),a=JSON.parse(n);return typeof a.exp=="number"?a.exp:null}catch{return null}}class O{constructor(){b(this,"_accessToken",null);b(this,"_expEpoch",0)}async get(e){const t=Math.floor(Date.now()/1e3);if(this._accessToken&&this._expEpoch>t+30)return this._accessToken;console.log("[AIAgent SDK] token missing/near-expiry, calling getAccessToken()...");const n=await e();if(!n||!n.accessToken)throw new Error("getAccessToken() must return { accessToken }");return this._accessToken=n.accessToken,this._expEpoch=L(n.accessToken)||t+300,this._accessToken}}async function K(s,e,t,n,a){const i=s.getReader(),o=new TextDecoder;let l="",c=!1;function u(){c||(c=!0,t())}function p(){for(;;){const h=l.indexOf(`

`);if(h<0)return;const f=l.slice(0,h);if(l=l.slice(h+2),!f)continue;const k={},x=f.split(`
`);for(let v=0;v<x.length;v++){const E=x[v],C=E.indexOf(":");if(C<0)continue;const W=E.slice(0,C).trim();let q=E.slice(C+1);q.length>0&&q.charAt(0)===" "&&(q=q.slice(1)),W==="data"?k.data=(k.data?k.data+`
`:"")+q:k[W]=q}if(k.data&&(k.data=k.data.replace(/\\n/g,`
`)),k.id==="last"){u();return}if(k.event==="tool_call"&&typeof a=="function"){try{a(JSON.parse(k.data||"{}"))}catch(v){console.error("[AIAgent SDK] tool_call parse failed",v,k.data)}continue}k.data!==void 0&&e(k)}}try{for(;;){const h=await i.read();if(h.done)break;l+=o.decode(h.value,{stream:!0}),p()}p(),u()}catch(h){n(h)}}function pt(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}let ge=pt();function Yt(s){ge=s}const Zt=/[&<>"']/,la=new RegExp(Zt.source,"g"),Xt=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,ca=new RegExp(Xt.source,"g"),da={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Kt=s=>da[s];function V(s,e){if(e){if(Zt.test(s))return s.replace(la,Kt)}else if(Xt.test(s))return s.replace(ca,Kt);return s}const pa=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;function ua(s){return s.replace(pa,(e,t)=>(t=t.toLowerCase(),t==="colon"?":":t.charAt(0)==="#"?t.charAt(1)==="x"?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""))}const ga=/(^|[^\[])\^/g;function R(s,e){let t=typeof s=="string"?s:s.source;e=e||"";const n={replace:(a,i)=>{let o=typeof i=="string"?i:i.source;return o=o.replace(ga,"$1"),t=t.replace(a,o),n},getRegex:()=>new RegExp(t,e)};return n}function Vt(s){try{s=encodeURI(s).replace(/%25/g,"%")}catch{return null}return s}const Re={exec:()=>null};function Jt(s,e){const t=s.replace(/\|/g,(i,o,l)=>{let c=!1,u=o;for(;--u>=0&&l[u]==="\\";)c=!c;return c?"|":" |"}),n=t.split(/ \|/);let a=0;if(n[0].trim()||n.shift(),n.length>0&&!n[n.length-1].trim()&&n.pop(),e)if(n.length>e)n.splice(e);else for(;n.length<e;)n.push("");for(;a<n.length;a++)n[a]=n[a].trim().replace(/\\\|/g,"|");return n}function Ce(s,e,t){const n=s.length;if(n===0)return"";let a=0;for(;a<n&&s.charAt(n-a-1)===e;)a++;return s.slice(0,n-a)}function fa(s,e){if(s.indexOf(e[1])===-1)return-1;let t=0;for(let n=0;n<s.length;n++)if(s[n]==="\\")n++;else if(s[n]===e[0])t++;else if(s[n]===e[1]&&(t--,t<0))return n;return-1}function Qt(s,e,t,n){const a=e.href,i=e.title?V(e.title):null,o=s[1].replace(/\\([\[\]])/g,"$1");if(s[0].charAt(0)!=="!"){n.state.inLink=!0;const l={type:"link",raw:t,href:a,title:i,text:o,tokens:n.inlineTokens(o)};return n.state.inLink=!1,l}return{type:"image",raw:t,href:a,title:i,text:V(o)}}function ha(s,e){const t=s.match(/^(\s+)(?:```)/);if(t===null)return e;const n=t[1];return e.split(`
`).map(a=>{const i=a.match(/^\s+/);if(i===null)return a;const[o]=i;return o.length>=n.length?a.slice(n.length):a}).join(`
`)}class Ge{constructor(e){b(this,"options");b(this,"rules");b(this,"lexer");this.options=e||ge}space(e){const t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){const t=this.rules.block.code.exec(e);if(t){const n=t[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?n:Ce(n,`
`)}}}fences(e){const t=this.rules.block.fences.exec(e);if(t){const n=t[0],a=ha(n,t[3]||"");return{type:"code",raw:n,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:a}}}heading(e){const t=this.rules.block.heading.exec(e);if(t){let n=t[2].trim();if(/#$/.test(n)){const a=Ce(n,"#");(this.options.pedantic||!a||/ $/.test(a))&&(n=a.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:n,tokens:this.lexer.inline(n)}}}hr(e){const t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:Ce(t[0],`
`)}}blockquote(e){const t=this.rules.block.blockquote.exec(e);if(t){let n=Ce(t[0],`
`).split(`
`),a="",i="";const o=[];for(;n.length>0;){let l=!1;const c=[];let u;for(u=0;u<n.length;u++)if(/^ {0,3}>/.test(n[u]))c.push(n[u]),l=!0;else if(!l)c.push(n[u]);else break;n=n.slice(u);const p=c.join(`
`),h=p.replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,`
    $1`).replace(/^ {0,3}>[ \t]?/gm,"");a=a?`${a}
${p}`:p,i=i?`${i}
${h}`:h;const f=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(h,o,!0),this.lexer.state.top=f,n.length===0)break;const k=o[o.length-1];if(k?.type==="code")break;if(k?.type==="blockquote"){const x=k,v=x.raw+`
`+n.join(`
`),E=this.blockquote(v);o[o.length-1]=E,a=a.substring(0,a.length-x.raw.length)+E.raw,i=i.substring(0,i.length-x.text.length)+E.text;break}else if(k?.type==="list"){const x=k,v=x.raw+`
`+n.join(`
`),E=this.list(v);o[o.length-1]=E,a=a.substring(0,a.length-k.raw.length)+E.raw,i=i.substring(0,i.length-x.raw.length)+E.raw,n=v.substring(o[o.length-1].raw.length).split(`
`);continue}}return{type:"blockquote",raw:a,tokens:o,text:i}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim();const a=n.length>1,i={type:"list",raw:"",ordered:a,start:a?+n.slice(0,-1):"",loose:!1,items:[]};n=a?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=a?n:"[*+-]");const o=new RegExp(`^( {0,3}${n})((?:[	 ][^\\n]*)?(?:\\n|$))`);let l=!1;for(;e;){let c=!1,u="",p="";if(!(t=o.exec(e))||this.rules.block.hr.test(e))break;u=t[0],e=e.substring(u.length);let h=t[2].split(`
`,1)[0].replace(/^\t+/,C=>" ".repeat(3*C.length)),f=e.split(`
`,1)[0],k=!h.trim(),x=0;if(this.options.pedantic?(x=2,p=h.trimStart()):k?x=t[1].length+1:(x=t[2].search(/[^ ]/),x=x>4?1:x,p=h.slice(x),x+=t[1].length),k&&/^ *$/.test(f)&&(u+=f+`
`,e=e.substring(f.length+1),c=!0),!c){const C=new RegExp(`^ {0,${Math.min(3,x-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),W=new RegExp(`^ {0,${Math.min(3,x-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),q=new RegExp(`^ {0,${Math.min(3,x-1)}}(?:\`\`\`|~~~)`),S=new RegExp(`^ {0,${Math.min(3,x-1)}}#`);for(;e;){const Q=e.split(`
`,1)[0];if(f=Q,this.options.pedantic&&(f=f.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),q.test(f)||S.test(f)||C.test(f)||W.test(e))break;if(f.search(/[^ ]/)>=x||!f.trim())p+=`
`+f.slice(x);else{if(k||h.search(/[^ ]/)>=4||q.test(h)||S.test(h)||W.test(h))break;p+=`
`+f}!k&&!f.trim()&&(k=!0),u+=Q+`
`,e=e.substring(Q.length+1),h=f.slice(x)}}i.loose||(l?i.loose=!0:/\n *\n *$/.test(u)&&(l=!0));let v=null,E;this.options.gfm&&(v=/^\[[ xX]\] /.exec(p),v&&(E=v[0]!=="[ ] ",p=p.replace(/^\[[ xX]\] +/,""))),i.items.push({type:"list_item",raw:u,task:!!v,checked:E,loose:!1,text:p,tokens:[]}),i.raw+=u}i.items[i.items.length-1].raw=i.items[i.items.length-1].raw.trimEnd(),i.items[i.items.length-1].text=i.items[i.items.length-1].text.trimEnd(),i.raw=i.raw.trimEnd();for(let c=0;c<i.items.length;c++)if(this.lexer.state.top=!1,i.items[c].tokens=this.lexer.blockTokens(i.items[c].text,[]),!i.loose){const u=i.items[c].tokens.filter(h=>h.type==="space"),p=u.length>0&&u.some(h=>/\n.*\n/.test(h.raw));i.loose=p}if(i.loose)for(let c=0;c<i.items.length;c++)i.items[c].loose=!0;return i}}html(e){const t=this.rules.block.html.exec(e);if(t)return{type:"html",block:!0,raw:t[0],pre:t[1]==="pre"||t[1]==="script"||t[1]==="style",text:t[0]}}def(e){const t=this.rules.block.def.exec(e);if(t){const n=t[1].toLowerCase().replace(/\s+/g," "),a=t[2]?t[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:n,raw:t[0],href:a,title:i}}}table(e){const t=this.rules.block.table.exec(e);if(!t||!/[:|]/.test(t[2]))return;const n=Jt(t[1]),a=t[2].replace(/^\||\| *$/g,"").split("|"),i=t[3]&&t[3].trim()?t[3].replace(/\n[ \t]*$/,"").split(`
`):[],o={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===a.length){for(const l of a)/^ *-+: *$/.test(l)?o.align.push("right"):/^ *:-+: *$/.test(l)?o.align.push("center"):/^ *:-+ *$/.test(l)?o.align.push("left"):o.align.push(null);for(let l=0;l<n.length;l++)o.header.push({text:n[l],tokens:this.lexer.inline(n[l]),header:!0,align:o.align[l]});for(const l of i)o.rows.push(Jt(l,o.header.length).map((c,u)=>({text:c,tokens:this.lexer.inline(c),header:!1,align:o.align[u]})));return o}}lheading(e){const t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){const t=this.rules.block.paragraph.exec(e);if(t){const n=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:n,tokens:this.lexer.inline(n)}}}text(e){const t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){const t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:V(t[1])}}tag(e){const t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&/^<a /i.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){const t=this.rules.inline.link.exec(e);if(t){const n=t[2].trim();if(!this.options.pedantic&&/^</.test(n)){if(!/>$/.test(n))return;const o=Ce(n.slice(0,-1),"\\");if((n.length-o.length)%2===0)return}else{const o=fa(t[2],"()");if(o>-1){const c=(t[0].indexOf("!")===0?5:4)+t[1].length+o;t[2]=t[2].substring(0,o),t[0]=t[0].substring(0,c).trim(),t[3]=""}}let a=t[2],i="";if(this.options.pedantic){const o=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(a);o&&(a=o[1],i=o[3])}else i=t[3]?t[3].slice(1,-1):"";return a=a.trim(),/^</.test(a)&&(this.options.pedantic&&!/>$/.test(n)?a=a.slice(1):a=a.slice(1,-1)),Qt(t,{href:a&&a.replace(this.rules.inline.anyPunctuation,"$1"),title:i&&i.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){const a=(n[2]||n[1]).replace(/\s+/g," "),i=t[a.toLowerCase()];if(!i){const o=n[0].charAt(0);return{type:"text",raw:o,text:o}}return Qt(n,i,n[0],this.lexer)}}emStrong(e,t,n=""){let a=this.rules.inline.emStrongLDelim.exec(e);if(!a||a[3]&&n.match(/[\p{L}\p{N}]/u))return;if(!(a[1]||a[2]||"")||!n||this.rules.inline.punctuation.exec(n)){const o=[...a[0]].length-1;let l,c,u=o,p=0;const h=a[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(h.lastIndex=0,t=t.slice(-1*e.length+o);(a=h.exec(t))!=null;){if(l=a[1]||a[2]||a[3]||a[4]||a[5]||a[6],!l)continue;if(c=[...l].length,a[3]||a[4]){u+=c;continue}else if((a[5]||a[6])&&o%3&&!((o+c)%3)){p+=c;continue}if(u-=c,u>0)continue;c=Math.min(c,c+u+p);const f=[...a[0]][0].length,k=e.slice(0,o+a.index+f+c);if(Math.min(o,c)%2){const v=k.slice(1,-1);return{type:"em",raw:k,text:v,tokens:this.lexer.inlineTokens(v)}}const x=k.slice(2,-2);return{type:"strong",raw:k,text:x,tokens:this.lexer.inlineTokens(x)}}}}codespan(e){const t=this.rules.inline.code.exec(e);if(t){let n=t[2].replace(/\n/g," ");const a=/[^ ]/.test(n),i=/^ /.test(n)&&/ $/.test(n);return a&&i&&(n=n.substring(1,n.length-1)),n=V(n,!0),{type:"codespan",raw:t[0],text:n}}}br(e){const t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e){const t=this.rules.inline.del.exec(e);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e){const t=this.rules.inline.autolink.exec(e);if(t){let n,a;return t[2]==="@"?(n=V(t[1]),a="mailto:"+n):(n=V(t[1]),a=n),{type:"link",raw:t[0],text:n,href:a,tokens:[{type:"text",raw:n,text:n}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let n,a;if(t[2]==="@")n=V(t[0]),a="mailto:"+n;else{let i;do i=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??"";while(i!==t[0]);n=V(t[0]),t[1]==="www."?a="http://"+t[0]:a=t[0]}return{type:"link",raw:t[0],text:n,href:a,tokens:[{type:"text",raw:n,text:n}]}}}inlineText(e){const t=this.rules.inline.text.exec(e);if(t){let n;return this.lexer.state.inRawBlock?n=t[0]:n=V(t[0]),{type:"text",raw:t[0],text:n}}}}const ma=/^(?: *(?:\n|$))+/,ba=/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,ka=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,Ie=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,xa=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,en=/(?:[*+-]|\d{1,9}[.)])/,tn=R(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g,en).replace(/blockCode/g,/ {4}/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).getRegex(),ut=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,ya=/^[^\n]+/,gt=/(?!\s*\])(?:\\.|[^\[\]\\])+/,wa=R(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/).replace("label",gt).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Ta=R(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,en).getRegex(),We="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",ft=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,_a=R("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))","i").replace("comment",ft).replace("tag",We).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),nn=R(ut).replace("hr",Ie).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",We).getRegex(),ht={blockquote:R(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",nn).getRegex(),code:ba,def:wa,fences:ka,heading:xa,hr:Ie,html:_a,lheading:tn,list:Ta,newline:ma,paragraph:nn,table:Re,text:ya},an=R("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",Ie).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",We).getRegex(),va={...ht,table:an,paragraph:R(ut).replace("hr",Ie).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",an).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",We).getRegex()},Ea={...ht,html:R(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",ft).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Re,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:R(ut).replace("hr",Ie).replace("heading",` *#{1,6} *[^
]`).replace("lheading",tn).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},sn=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Sa=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,rn=/^( {2,}|\\)\n(?!\s*$)/,Aa=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Oe="\\p{P}\\p{S}",Ra=R(/^((?![*_])[\spunctuation])/,"u").replace(/punctuation/g,Oe).getRegex(),Ca=/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g,Ia=R(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,"u").replace(/punct/g,Oe).getRegex(),Oa=R("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])","gu").replace(/punct/g,Oe).getRegex(),Ma=R("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])","gu").replace(/punct/g,Oe).getRegex(),Na=R(/\\([punct])/,"gu").replace(/punct/g,Oe).getRegex(),La=R(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Da=R(ft).replace("(?:-->|$)","-->").getRegex(),za=R("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",Da).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),Ye=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,Pa=R(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label",Ye).replace("href",/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),on=R(/^!?\[(label)\]\[(ref)\]/).replace("label",Ye).replace("ref",gt).getRegex(),ln=R(/^!?\[(ref)\](?:\[\])?/).replace("ref",gt).getRegex(),$a=R("reflink|nolink(?!\\()","g").replace("reflink",on).replace("nolink",ln).getRegex(),mt={_backpedal:Re,anyPunctuation:Na,autolink:La,blockSkip:Ca,br:rn,code:Sa,del:Re,emStrongLDelim:Ia,emStrongRDelimAst:Oa,emStrongRDelimUnd:Ma,escape:sn,link:Pa,nolink:ln,punctuation:Ra,reflink:on,reflinkSearch:$a,tag:za,text:Aa,url:Re},Ba={...mt,link:R(/^!?\[(label)\]\((.*?)\)/).replace("label",Ye).getRegex(),reflink:R(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",Ye).getRegex()},bt={...mt,escape:R(sn).replace("])","~|])").getRegex(),url:R(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},Fa={...bt,br:R(rn).replace("{2,}","*").getRegex(),text:R(bt.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Ze={normal:ht,gfm:va,pedantic:Ea},Me={normal:mt,gfm:bt,breaks:Fa,pedantic:Ba};class te{constructor(e){b(this,"tokens");b(this,"options");b(this,"state");b(this,"tokenizer");b(this,"inlineQueue");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||ge,this.options.tokenizer=this.options.tokenizer||new Ge,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const t={block:Ze.normal,inline:Me.normal};this.options.pedantic?(t.block=Ze.pedantic,t.inline=Me.pedantic):this.options.gfm&&(t.block=Ze.gfm,this.options.breaks?t.inline=Me.breaks:t.inline=Me.gfm),this.tokenizer.rules=t}static get rules(){return{block:Ze,inline:Me}}static lex(e,t){return new te(t).lex(e)}static lexInline(e,t){return new te(t).inlineTokens(e)}lex(e){e=e.replace(/\r\n|\r/g,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){const n=this.inlineQueue[t];this.inlineTokens(n.src,n.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){this.options.pedantic?e=e.replace(/\t/g,"    ").replace(/^ +$/gm,""):e=e.replace(/^( *)(\t+)/gm,(l,c,u)=>c+"    ".repeat(u.length));let a,i,o;for(;e;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(l=>(a=l.call({lexer:this},e,t))?(e=e.substring(a.raw.length),t.push(a),!0):!1))){if(a=this.tokenizer.space(e)){e=e.substring(a.raw.length),a.raw.length===1&&t.length>0?t[t.length-1].raw+=`
`:t.push(a);continue}if(a=this.tokenizer.code(e)){e=e.substring(a.raw.length),i=t[t.length-1],i&&(i.type==="paragraph"||i.type==="text")?(i.raw+=`
`+a.raw,i.text+=`
`+a.text,this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(a);continue}if(a=this.tokenizer.fences(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.heading(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.hr(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.blockquote(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.list(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.html(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.def(e)){e=e.substring(a.raw.length),i=t[t.length-1],i&&(i.type==="paragraph"||i.type==="text")?(i.raw+=`
`+a.raw,i.text+=`
`+a.raw,this.inlineQueue[this.inlineQueue.length-1].src=i.text):this.tokens.links[a.tag]||(this.tokens.links[a.tag]={href:a.href,title:a.title});continue}if(a=this.tokenizer.table(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.lheading(e)){e=e.substring(a.raw.length),t.push(a);continue}if(o=e,this.options.extensions&&this.options.extensions.startBlock){let l=1/0;const c=e.slice(1);let u;this.options.extensions.startBlock.forEach(p=>{u=p.call({lexer:this},c),typeof u=="number"&&u>=0&&(l=Math.min(l,u))}),l<1/0&&l>=0&&(o=e.substring(0,l+1))}if(this.state.top&&(a=this.tokenizer.paragraph(o))){i=t[t.length-1],n&&i?.type==="paragraph"?(i.raw+=`
`+a.raw,i.text+=`
`+a.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(a),n=o.length!==e.length,e=e.substring(a.raw.length);continue}if(a=this.tokenizer.text(e)){e=e.substring(a.raw.length),i=t[t.length-1],i&&i.type==="text"?(i.raw+=`
`+a.raw,i.text+=`
`+a.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(a);continue}if(e){const l="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(l);break}else throw new Error(l)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n,a,i,o=e,l,c,u;if(this.tokens.links){const p=Object.keys(this.tokens.links);if(p.length>0)for(;(l=this.tokenizer.rules.inline.reflinkSearch.exec(o))!=null;)p.includes(l[0].slice(l[0].lastIndexOf("[")+1,-1))&&(o=o.slice(0,l.index)+"["+"a".repeat(l[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(l=this.tokenizer.rules.inline.blockSkip.exec(o))!=null;)o=o.slice(0,l.index)+"["+"a".repeat(l[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;(l=this.tokenizer.rules.inline.anyPunctuation.exec(o))!=null;)o=o.slice(0,l.index)+"++"+o.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;e;)if(c||(u=""),c=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(p=>(n=p.call({lexer:this},e,t))?(e=e.substring(n.raw.length),t.push(n),!0):!1))){if(n=this.tokenizer.escape(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.tag(e)){e=e.substring(n.raw.length),a=t[t.length-1],a&&n.type==="text"&&a.type==="text"?(a.raw+=n.raw,a.text+=n.text):t.push(n);continue}if(n=this.tokenizer.link(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(n.raw.length),a=t[t.length-1],a&&n.type==="text"&&a.type==="text"?(a.raw+=n.raw,a.text+=n.text):t.push(n);continue}if(n=this.tokenizer.emStrong(e,o,u)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.codespan(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.br(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.del(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.autolink(e)){e=e.substring(n.raw.length),t.push(n);continue}if(!this.state.inLink&&(n=this.tokenizer.url(e))){e=e.substring(n.raw.length),t.push(n);continue}if(i=e,this.options.extensions&&this.options.extensions.startInline){let p=1/0;const h=e.slice(1);let f;this.options.extensions.startInline.forEach(k=>{f=k.call({lexer:this},h),typeof f=="number"&&f>=0&&(p=Math.min(p,f))}),p<1/0&&p>=0&&(i=e.substring(0,p+1))}if(n=this.tokenizer.inlineText(i)){e=e.substring(n.raw.length),n.raw.slice(-1)!=="_"&&(u=n.raw.slice(-1)),c=!0,a=t[t.length-1],a&&a.type==="text"?(a.raw+=n.raw,a.text+=n.text):t.push(n);continue}if(e){const p="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(p);break}else throw new Error(p)}}return t}}class Xe{constructor(e){b(this,"options");b(this,"parser");this.options=e||ge}space(e){return""}code({text:e,lang:t,escaped:n}){const a=(t||"").match(/^\S*/)?.[0],i=e.replace(/\n$/,"")+`
`;return a?'<pre><code class="language-'+V(a)+'">'+(n?i:V(i,!0))+`</code></pre>
`:"<pre><code>"+(n?i:V(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){const t=e.ordered,n=e.start;let a="";for(let l=0;l<e.items.length;l++){const c=e.items[l];a+=this.listitem(c)}const i=t?"ol":"ul",o=t&&n!==1?' start="'+n+'"':"";return"<"+i+o+`>
`+a+"</"+i+`>
`}listitem(e){let t="";if(e.task){const n=this.checkbox({checked:!!e.checked});e.loose?e.tokens.length>0&&e.tokens[0].type==="paragraph"?(e.tokens[0].text=n+" "+e.tokens[0].text,e.tokens[0].tokens&&e.tokens[0].tokens.length>0&&e.tokens[0].tokens[0].type==="text"&&(e.tokens[0].tokens[0].text=n+" "+e.tokens[0].tokens[0].text)):e.tokens.unshift({type:"text",raw:n+" ",text:n+" "}):t+=n+" "}return t+=this.parser.parse(e.tokens,!!e.loose),`<li>${t}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t="",n="";for(let i=0;i<e.header.length;i++)n+=this.tablecell(e.header[i]);t+=this.tablerow({text:n});let a="";for(let i=0;i<e.rows.length;i++){const o=e.rows[i];n="";for(let l=0;l<o.length;l++)n+=this.tablecell(o[l]);a+=this.tablerow({text:n})}return a&&(a=`<tbody>${a}</tbody>`),`<table>
<thead>
`+t+`</thead>
`+a+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){const t=this.parser.parseInline(e.tokens),n=e.header?"th":"td";return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${e}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){const a=this.parser.parseInline(n),i=Vt(e);if(i===null)return a;e=i;let o='<a href="'+e+'"';return t&&(o+=' title="'+t+'"'),o+=">"+a+"</a>",o}image({href:e,title:t,text:n}){const a=Vt(e);if(a===null)return n;e=a;let i=`<img src="${e}" alt="${n}"`;return t&&(i+=` title="${t}"`),i+=">",i}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):e.text}}class kt{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}}class ne{constructor(e){b(this,"options");b(this,"renderer");b(this,"textRenderer");this.options=e||ge,this.options.renderer=this.options.renderer||new Xe,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new kt}static parse(e,t){return new ne(t).parse(e)}static parseInline(e,t){return new ne(t).parseInline(e)}parse(e,t=!0){let n="";for(let a=0;a<e.length;a++){const i=e[a];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){const l=i,c=this.options.extensions.renderers[l.type].call({parser:this},l);if(c!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(l.type)){n+=c||"";continue}}const o=i;switch(o.type){case"space":{n+=this.renderer.space(o);continue}case"hr":{n+=this.renderer.hr(o);continue}case"heading":{n+=this.renderer.heading(o);continue}case"code":{n+=this.renderer.code(o);continue}case"table":{n+=this.renderer.table(o);continue}case"blockquote":{n+=this.renderer.blockquote(o);continue}case"list":{n+=this.renderer.list(o);continue}case"html":{n+=this.renderer.html(o);continue}case"paragraph":{n+=this.renderer.paragraph(o);continue}case"text":{let l=o,c=this.renderer.text(l);for(;a+1<e.length&&e[a+1].type==="text";)l=e[++a],c+=`
`+this.renderer.text(l);t?n+=this.renderer.paragraph({type:"paragraph",raw:c,text:c,tokens:[{type:"text",raw:c,text:c}]}):n+=c;continue}default:{const l='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return n}parseInline(e,t){t=t||this.renderer;let n="";for(let a=0;a<e.length;a++){const i=e[a];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){const l=this.options.extensions.renderers[i.type].call({parser:this},i);if(l!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){n+=l||"";continue}}const o=i;switch(o.type){case"escape":{n+=t.text(o);break}case"html":{n+=t.html(o);break}case"link":{n+=t.link(o);break}case"image":{n+=t.image(o);break}case"strong":{n+=t.strong(o);break}case"em":{n+=t.em(o);break}case"codespan":{n+=t.codespan(o);break}case"br":{n+=t.br(o);break}case"del":{n+=t.del(o);break}case"text":{n+=t.text(o);break}default:{const l='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return n}}class Ne{constructor(e){b(this,"options");this.options=e||ge}preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}}b(Ne,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens"]));class Ua{constructor(...e){sa(this,le);b(this,"defaults",pt());b(this,"options",this.setOptions);b(this,"parse",qe(this,le,Wt).call(this,te.lex,ne.parse));b(this,"parseInline",qe(this,le,Wt).call(this,te.lexInline,ne.parseInline));b(this,"Parser",ne);b(this,"Renderer",Xe);b(this,"TextRenderer",kt);b(this,"Lexer",te);b(this,"Tokenizer",Ge);b(this,"Hooks",Ne);this.use(...e)}walkTokens(e,t){let n=[];for(const a of e)switch(n=n.concat(t.call(this,a)),a.type){case"table":{const i=a;for(const o of i.header)n=n.concat(this.walkTokens(o.tokens,t));for(const o of i.rows)for(const l of o)n=n.concat(this.walkTokens(l.tokens,t));break}case"list":{const i=a;n=n.concat(this.walkTokens(i.items,t));break}default:{const i=a;this.defaults.extensions?.childTokens?.[i.type]?this.defaults.extensions.childTokens[i.type].forEach(o=>{const l=i[o].flat(1/0);n=n.concat(this.walkTokens(l,t))}):i.tokens&&(n=n.concat(this.walkTokens(i.tokens,t)))}}return n}use(...e){const t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(n=>{const a={...n};if(a.async=this.defaults.async||a.async||!1,n.extensions&&(n.extensions.forEach(i=>{if(!i.name)throw new Error("extension name required");if("renderer"in i){const o=t.renderers[i.name];o?t.renderers[i.name]=function(...l){let c=i.renderer.apply(this,l);return c===!1&&(c=o.apply(this,l)),c}:t.renderers[i.name]=i.renderer}if("tokenizer"in i){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");const o=t[i.level];o?o.unshift(i.tokenizer):t[i.level]=[i.tokenizer],i.start&&(i.level==="block"?t.startBlock?t.startBlock.push(i.start):t.startBlock=[i.start]:i.level==="inline"&&(t.startInline?t.startInline.push(i.start):t.startInline=[i.start]))}"childTokens"in i&&i.childTokens&&(t.childTokens[i.name]=i.childTokens)}),a.extensions=t),n.renderer){const i=this.defaults.renderer||new Xe(this.defaults);for(const o in n.renderer){if(!(o in i))throw new Error(`renderer '${o}' does not exist`);if(["options","parser"].includes(o))continue;const l=o;let c=n.renderer[l];n.useNewRenderer||(c=qe(this,le,ra).call(this,c,l,i));const u=i[l];i[l]=(...p)=>{let h=c.apply(i,p);return h===!1&&(h=u.apply(i,p)),h||""}}a.renderer=i}if(n.tokenizer){const i=this.defaults.tokenizer||new Ge(this.defaults);for(const o in n.tokenizer){if(!(o in i))throw new Error(`tokenizer '${o}' does not exist`);if(["options","rules","lexer"].includes(o))continue;const l=o,c=n.tokenizer[l],u=i[l];i[l]=(...p)=>{let h=c.apply(i,p);return h===!1&&(h=u.apply(i,p)),h}}a.tokenizer=i}if(n.hooks){const i=this.defaults.hooks||new Ne;for(const o in n.hooks){if(!(o in i))throw new Error(`hook '${o}' does not exist`);if(o==="options")continue;const l=o,c=n.hooks[l],u=i[l];Ne.passThroughHooks.has(o)?i[l]=p=>{if(this.defaults.async)return Promise.resolve(c.call(i,p)).then(f=>u.call(i,f));const h=c.call(i,p);return u.call(i,h)}:i[l]=(...p)=>{let h=c.apply(i,p);return h===!1&&(h=u.apply(i,p)),h}}a.hooks=i}if(n.walkTokens){const i=this.defaults.walkTokens,o=n.walkTokens;a.walkTokens=function(l){let c=[];return c.push(o.call(this,l)),i&&(c=c.concat(i.call(this,l))),c}}this.defaults={...this.defaults,...a}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return te.lex(e,t??this.defaults)}parser(e,t){return ne.parse(e,t??this.defaults)}}le=new WeakSet,ra=function(e,t,n){switch(t){case"heading":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,n.parser.parseInline(a.tokens),a.depth,ua(n.parser.parseInline(a.tokens,n.parser.textRenderer)))};case"code":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text,a.lang,!!a.escaped)};case"table":return function(a){if(!a.type||a.type!==t)return e.apply(this,arguments);let i="",o="";for(let c=0;c<a.header.length;c++)o+=this.tablecell({text:a.header[c].text,tokens:a.header[c].tokens,header:!0,align:a.align[c]});i+=this.tablerow({text:o});let l="";for(let c=0;c<a.rows.length;c++){const u=a.rows[c];o="";for(let p=0;p<u.length;p++)o+=this.tablecell({text:u[p].text,tokens:u[p].tokens,header:!1,align:a.align[p]});l+=this.tablerow({text:o})}return e.call(this,i,l)};case"blockquote":return function(a){if(!a.type||a.type!==t)return e.apply(this,arguments);const i=this.parser.parse(a.tokens);return e.call(this,i)};case"list":return function(a){if(!a.type||a.type!==t)return e.apply(this,arguments);const i=a.ordered,o=a.start,l=a.loose;let c="";for(let u=0;u<a.items.length;u++){const p=a.items[u],h=p.checked,f=p.task;let k="";if(p.task){const x=this.checkbox({checked:!!h});l?p.tokens.length>0&&p.tokens[0].type==="paragraph"?(p.tokens[0].text=x+" "+p.tokens[0].text,p.tokens[0].tokens&&p.tokens[0].tokens.length>0&&p.tokens[0].tokens[0].type==="text"&&(p.tokens[0].tokens[0].text=x+" "+p.tokens[0].tokens[0].text)):p.tokens.unshift({type:"text",text:x+" "}):k+=x+" "}k+=this.parser.parse(p.tokens,l),c+=this.listitem({type:"list_item",raw:k,text:k,task:f,checked:!!h,loose:l,tokens:p.tokens})}return e.call(this,c,i,o)};case"html":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text,a.block)};case"paragraph":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"escape":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text)};case"link":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.href,a.title,this.parser.parseInline(a.tokens))};case"image":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.href,a.title,a.text)};case"strong":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"em":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"codespan":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text)};case"del":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"text":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text)}}return e},Wt=function(e,t){return(n,a)=>{const i={...a},o={...this.defaults,...i};this.defaults.async===!0&&i.async===!1&&(o.silent||console.warn("marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored."),o.async=!0);const l=qe(this,le,oa).call(this,!!o.silent,!!o.async);if(typeof n>"u"||n===null)return l(new Error("marked(): input parameter is undefined or null"));if(typeof n!="string")return l(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(n)+", string expected"));if(o.hooks&&(o.hooks.options=o),o.async)return Promise.resolve(o.hooks?o.hooks.preprocess(n):n).then(c=>e(c,o)).then(c=>o.hooks?o.hooks.processAllTokens(c):c).then(c=>o.walkTokens?Promise.all(this.walkTokens(c,o.walkTokens)).then(()=>c):c).then(c=>t(c,o)).then(c=>o.hooks?o.hooks.postprocess(c):c).catch(l);try{o.hooks&&(n=o.hooks.preprocess(n));let c=e(n,o);o.hooks&&(c=o.hooks.processAllTokens(c)),o.walkTokens&&this.walkTokens(c,o.walkTokens);let u=t(c,o);return o.hooks&&(u=o.hooks.postprocess(u)),u}catch(c){return l(c)}}},oa=function(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){const a="<p>An error occurred:</p><pre>"+V(n.message+"",!0)+"</pre>";return t?Promise.resolve(a):a}if(t)return Promise.reject(n);throw n}};const fe=new Ua;function A(s,e){return fe.parse(s,e)}A.options=A.setOptions=function(s){return fe.setOptions(s),A.defaults=fe.defaults,Yt(A.defaults),A},A.getDefaults=pt,A.defaults=ge,A.use=function(...s){return fe.use(...s),A.defaults=fe.defaults,Yt(A.defaults),A},A.walkTokens=function(s,e){return fe.walkTokens(s,e)},A.parseInline=fe.parseInline,A.Parser=ne,A.parser=ne.parse,A.Renderer=Xe,A.TextRenderer=kt,A.Lexer=te,A.lexer=te.lex,A.Tokenizer=Ge,A.Hooks=Ne,A.parse=A,A.options,A.setOptions,A.use,A.walkTokens,A.parseInline,ne.parse,te.lex;/*! @license DOMPurify 3.4.9 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.9/LICENSE */function cn(s,e){(e==null||e>s.length)&&(e=s.length);for(var t=0,n=Array(e);t<e;t++)n[t]=s[t];return n}function Ha(s){if(Array.isArray(s))return s}function ja(s,e){var t=s==null?null:typeof Symbol<"u"&&s[Symbol.iterator]||s["@@iterator"];if(t!=null){var n,a,i,o,l=[],c=!0,u=!1;try{if(i=(t=t.call(s)).next,e!==0)for(;!(c=(n=i.call(t)).done)&&(l.push(n.value),l.length!==e);c=!0);}catch(p){u=!0,a=p}finally{try{if(!c&&t.return!=null&&(o=t.return(),Object(o)!==o))return}finally{if(u)throw a}}return l}}function qa(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Ga(s,e){return Ha(s)||ja(s,e)||Wa(s,e)||qa()}function Wa(s,e){if(s){if(typeof s=="string")return cn(s,e);var t={}.toString.call(s).slice(8,-1);return t==="Object"&&s.constructor&&(t=s.constructor.name),t==="Map"||t==="Set"?Array.from(s):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?cn(s,e):void 0}}const dn=Object.entries,pn=Object.setPrototypeOf,Ya=Object.isFrozen,Za=Object.getPrototypeOf,Xa=Object.getOwnPropertyDescriptor;let Y=Object.freeze,J=Object.seal,xe=Object.create,un=typeof Reflect<"u"&&Reflect,xt=un.apply,yt=un.construct;Y||(Y=function(e){return e}),J||(J=function(e){return e}),xt||(xt=function(e,t){for(var n=arguments.length,a=new Array(n>2?n-2:0),i=2;i<n;i++)a[i-2]=arguments[i];return e.apply(t,a)}),yt||(yt=function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),a=1;a<t;a++)n[a-1]=arguments[a];return new e(...n)});const oe=B(Array.prototype.forEach),Ka=B(Array.prototype.lastIndexOf),gn=B(Array.prototype.pop),ye=B(Array.prototype.push),Va=B(Array.prototype.splice),Z=Array.isArray,Le=B(String.prototype.toLowerCase),wt=B(String.prototype.toString),fn=B(String.prototype.match),we=B(String.prototype.replace),hn=B(String.prototype.indexOf),Ja=B(String.prototype.trim),Qa=B(Number.prototype.toString),ei=B(Boolean.prototype.toString),mn=typeof BigInt>"u"?null:B(BigInt.prototype.toString),bn=typeof Symbol>"u"?null:B(Symbol.prototype.toString),M=B(Object.prototype.hasOwnProperty),De=B(Object.prototype.toString),j=B(RegExp.prototype.test),he=ti(TypeError);function B(s){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var t=arguments.length,n=new Array(t>1?t-1:0),a=1;a<t;a++)n[a-1]=arguments[a];return xt(s,e,n)}}function ti(s){return function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return yt(s,t)}}function T(s,e){let t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:Le;if(pn&&pn(s,null),!Z(e))return s;let n=e.length;for(;n--;){let a=e[n];if(typeof a=="string"){const i=t(a);i!==a&&(Ya(e)||(e[n]=i),a=i)}s[a]=!0}return s}function ni(s){for(let e=0;e<s.length;e++)M(s,e)||(s[e]=null);return s}function G(s){const e=xe(null);for(const n of dn(s)){var t=Ga(n,2);const a=t[0],i=t[1];M(s,a)&&(Z(i)?e[a]=ni(i):i&&typeof i=="object"&&i.constructor===Object?e[a]=G(i):e[a]=i)}return e}function ai(s){switch(typeof s){case"string":return s;case"number":return Qa(s);case"boolean":return ei(s);case"bigint":return mn?mn(s):"0";case"symbol":return bn?bn(s):"Symbol()";case"undefined":return De(s);case"function":case"object":{if(s===null)return De(s);const e=s,t=ae(e,"toString");if(typeof t=="function"){const n=t(e);return typeof n=="string"?n:De(n)}return De(s)}default:return De(s)}}function ae(s,e){for(;s!==null;){const n=Xa(s,e);if(n){if(n.get)return B(n.get);if(typeof n.value=="function")return B(n.value)}s=Za(s)}function t(){return null}return t}function ii(s){try{return j(s,""),!0}catch{return!1}}const kn=Y(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),Tt=Y(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),_t=Y(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),si=Y(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),vt=Y(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),ri=Y(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),xn=Y(["#text"]),yn=Y(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),Et=Y(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),wn=Y(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),Ke=Y(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),oi=J(/{{[\w\W]*|^[\w\W]*}}/g),li=J(/<%[\w\W]*|^[\w\W]*%>/g),ci=J(/\${[\w\W]*/g),di=J(/^data-[\-\w.\u00B7-\uFFFF]+$/),pi=J(/^aria-[\-\w]+$/),Tn=J(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),ui=J(/^(?:\w+script|data):/i),gi=J(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),fi=J(/^html$/i),hi=J(/^[a-z][.\w]*(-[.\w]+)+$/i),ie={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,progressingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},mi=function(){return typeof window>"u"?null:window},bi=function(e,t){if(typeof e!="object"||typeof e.createPolicy!="function")return null;let n=null;const a="data-tt-policy-suffix";t&&t.hasAttribute(a)&&(n=t.getAttribute(a));const i="dompurify"+(n?"#"+n:"");try{return e.createPolicy(i,{createHTML(o){return o},createScriptURL(o){return o}})}catch{return console.warn("TrustedTypes policy "+i+" could not be created."),null}},_n=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function vn(){let s=arguments.length>0&&arguments[0]!==void 0?arguments[0]:mi();const e=m=>vn(m);if(e.version="3.4.9",e.removed=[],!s||!s.document||s.document.nodeType!==ie.document||!s.Element)return e.isSupported=!1,e;let t=s.document;const n=t,a=n.currentScript;s.DocumentFragment;const i=s.HTMLTemplateElement,o=s.Node,l=s.Element,c=s.NodeFilter,u=s.NamedNodeMap;u===void 0&&(s.NamedNodeMap||s.MozNamedAttrMap),s.HTMLFormElement;const p=s.DOMParser,h=s.trustedTypes,f=l.prototype,k=ae(f,"cloneNode"),x=ae(f,"remove"),v=ae(f,"nextSibling"),E=ae(f,"childNodes"),C=ae(f,"parentNode"),W=ae(f,"shadowRoot"),q=ae(f,"attributes"),S=o&&o.prototype?ae(o.prototype,"nodeType"):null,Q=o&&o.prototype?ae(o.prototype,"nodeName"):null;if(typeof i=="function"){const m=t.createElement("template");m.content&&m.content.ownerDocument&&(t=m.content.ownerDocument)}let X,me="",Rt,Mn=!1,Be=0;const Nn=function(){if(Be>0)throw he('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')},Te=function(r){Nn(),Be++;try{return X.createHTML(r)}finally{Be--}},Vi=function(r){Nn(),Be++;try{return X.createScriptURL(r)}finally{Be--}},Ji=function(){return Mn||(Rt=bi(h,a),Mn=!0),Rt},et=t,Ct=et.implementation,Ln=et.createNodeIterator,Qi=et.createDocumentFragment,es=et.getElementsByTagName,ts=n.importNode;let U=_n();e.isSupported=typeof dn=="function"&&typeof C=="function"&&Ct&&Ct.createHTMLDocument!==void 0;const tt=oi,nt=li,at=ci,ns=di,as=pi,is=ui,Dn=gi,ss=hi;let zn=Tn,D=null;const It=T({},[...kn,...Tt,..._t,...vt,...xn]);let z=null;const Ot=T({},[...yn,...Et,...wn,...Ke]);let P=Object.seal(xe(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Fe=null,it=null;const de=Object.seal(xe(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let Pn=!0,Mt=!0,$n=!1,Bn=!0,pe=!1,Ue=!0,be=!1,Nt=!1,Lt=!1,_e=!1,st=!1,rt=!1,Fn=!0,Un=!1;const Hn="user-content-";let Dt=!0,zt=!1,ve={},se=null;const Pt=T({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]);let jn=null;const qn=T({},["audio","video","img","source","image","track"]);let $t=null;const Gn=T({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),ot="http://www.w3.org/1998/Math/MathML",lt="http://www.w3.org/2000/svg",re="http://www.w3.org/1999/xhtml";let Ee=re,Bt=!1,Ft=null;const rs=T({},[ot,lt,re],wt);let Ut=T({},["mi","mo","mn","ms","mtext"]),Ht=T({},["annotation-xml"]);const os=T({},["title","style","font","a","script"]);let He=null;const ls=["application/xhtml+xml","text/html"],cs="text/html";let N=null,Se=null;const ds=t.createElement("form"),Wn=function(r){return r instanceof RegExp||r instanceof Function},jt=function(){let r=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(Se&&Se===r)return;(!r||typeof r!="object")&&(r={}),r=G(r),He=ls.indexOf(r.PARSER_MEDIA_TYPE)===-1?cs:r.PARSER_MEDIA_TYPE,N=He==="application/xhtml+xml"?wt:Le,D=M(r,"ALLOWED_TAGS")&&Z(r.ALLOWED_TAGS)?T({},r.ALLOWED_TAGS,N):It,z=M(r,"ALLOWED_ATTR")&&Z(r.ALLOWED_ATTR)?T({},r.ALLOWED_ATTR,N):Ot,Ft=M(r,"ALLOWED_NAMESPACES")&&Z(r.ALLOWED_NAMESPACES)?T({},r.ALLOWED_NAMESPACES,wt):rs,$t=M(r,"ADD_URI_SAFE_ATTR")&&Z(r.ADD_URI_SAFE_ATTR)?T(G(Gn),r.ADD_URI_SAFE_ATTR,N):Gn,jn=M(r,"ADD_DATA_URI_TAGS")&&Z(r.ADD_DATA_URI_TAGS)?T(G(qn),r.ADD_DATA_URI_TAGS,N):qn,se=M(r,"FORBID_CONTENTS")&&Z(r.FORBID_CONTENTS)?T({},r.FORBID_CONTENTS,N):Pt,Fe=M(r,"FORBID_TAGS")&&Z(r.FORBID_TAGS)?T({},r.FORBID_TAGS,N):G({}),it=M(r,"FORBID_ATTR")&&Z(r.FORBID_ATTR)?T({},r.FORBID_ATTR,N):G({}),ve=M(r,"USE_PROFILES")?r.USE_PROFILES&&typeof r.USE_PROFILES=="object"?G(r.USE_PROFILES):r.USE_PROFILES:!1,Pn=r.ALLOW_ARIA_ATTR!==!1,Mt=r.ALLOW_DATA_ATTR!==!1,$n=r.ALLOW_UNKNOWN_PROTOCOLS||!1,Bn=r.ALLOW_SELF_CLOSE_IN_ATTR!==!1,pe=r.SAFE_FOR_TEMPLATES||!1,Ue=r.SAFE_FOR_XML!==!1,be=r.WHOLE_DOCUMENT||!1,_e=r.RETURN_DOM||!1,st=r.RETURN_DOM_FRAGMENT||!1,rt=r.RETURN_TRUSTED_TYPE||!1,Lt=r.FORCE_BODY||!1,Fn=r.SANITIZE_DOM!==!1,Un=r.SANITIZE_NAMED_PROPS||!1,Dt=r.KEEP_CONTENT!==!1,zt=r.IN_PLACE||!1,zn=ii(r.ALLOWED_URI_REGEXP)?r.ALLOWED_URI_REGEXP:Tn,Ee=typeof r.NAMESPACE=="string"?r.NAMESPACE:re,Ut=M(r,"MATHML_TEXT_INTEGRATION_POINTS")&&r.MATHML_TEXT_INTEGRATION_POINTS&&typeof r.MATHML_TEXT_INTEGRATION_POINTS=="object"?G(r.MATHML_TEXT_INTEGRATION_POINTS):T({},["mi","mo","mn","ms","mtext"]),Ht=M(r,"HTML_INTEGRATION_POINTS")&&r.HTML_INTEGRATION_POINTS&&typeof r.HTML_INTEGRATION_POINTS=="object"?G(r.HTML_INTEGRATION_POINTS):T({},["annotation-xml"]);const d=M(r,"CUSTOM_ELEMENT_HANDLING")&&r.CUSTOM_ELEMENT_HANDLING&&typeof r.CUSTOM_ELEMENT_HANDLING=="object"?G(r.CUSTOM_ELEMENT_HANDLING):xe(null);if(P=xe(null),M(d,"tagNameCheck")&&Wn(d.tagNameCheck)&&(P.tagNameCheck=d.tagNameCheck),M(d,"attributeNameCheck")&&Wn(d.attributeNameCheck)&&(P.attributeNameCheck=d.attributeNameCheck),M(d,"allowCustomizedBuiltInElements")&&typeof d.allowCustomizedBuiltInElements=="boolean"&&(P.allowCustomizedBuiltInElements=d.allowCustomizedBuiltInElements),pe&&(Mt=!1),st&&(_e=!0),ve&&(D=T({},xn),z=xe(null),ve.html===!0&&(T(D,kn),T(z,yn)),ve.svg===!0&&(T(D,Tt),T(z,Et),T(z,Ke)),ve.svgFilters===!0&&(T(D,_t),T(z,Et),T(z,Ke)),ve.mathMl===!0&&(T(D,vt),T(z,wn),T(z,Ke))),de.tagCheck=null,de.attributeCheck=null,M(r,"ADD_TAGS")&&(typeof r.ADD_TAGS=="function"?de.tagCheck=r.ADD_TAGS:Z(r.ADD_TAGS)&&(D===It&&(D=G(D)),T(D,r.ADD_TAGS,N))),M(r,"ADD_ATTR")&&(typeof r.ADD_ATTR=="function"?de.attributeCheck=r.ADD_ATTR:Z(r.ADD_ATTR)&&(z===Ot&&(z=G(z)),T(z,r.ADD_ATTR,N))),M(r,"ADD_URI_SAFE_ATTR")&&Z(r.ADD_URI_SAFE_ATTR)&&T($t,r.ADD_URI_SAFE_ATTR,N),M(r,"FORBID_CONTENTS")&&Z(r.FORBID_CONTENTS)&&(se===Pt&&(se=G(se)),T(se,r.FORBID_CONTENTS,N)),M(r,"ADD_FORBID_CONTENTS")&&Z(r.ADD_FORBID_CONTENTS)&&(se===Pt&&(se=G(se)),T(se,r.ADD_FORBID_CONTENTS,N)),Dt&&(D["#text"]=!0),be&&T(D,["html","head","body"]),D.table&&(T(D,["tbody"]),delete Fe.tbody),r.TRUSTED_TYPES_POLICY){if(typeof r.TRUSTED_TYPES_POLICY.createHTML!="function")throw he('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof r.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw he('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');const g=X;X=r.TRUSTED_TYPES_POLICY;try{me=Te("")}catch(y){throw X=g,y}}else r.TRUSTED_TYPES_POLICY===null?(X=void 0,me=""):(X===void 0&&(X=Ji()),X&&typeof me=="string"&&(me=Te("")));(U.uponSanitizeElement.length>0||U.uponSanitizeAttribute.length>0)&&D===It&&(D=G(D)),U.uponSanitizeAttribute.length>0&&z===Ot&&(z=G(z)),Y&&Y(r),Se=r},Yn=T({},[...Tt,..._t,...si]),Zn=T({},[...vt,...ri]),ps=function(r){let d=C(r);(!d||!d.tagName)&&(d={namespaceURI:Ee,tagName:"template"});const g=Le(r.tagName),y=Le(d.tagName);return Ft[r.namespaceURI]?r.namespaceURI===lt?d.namespaceURI===re?g==="svg":d.namespaceURI===ot?g==="svg"&&(y==="annotation-xml"||Ut[y]):!!Yn[g]:r.namespaceURI===ot?d.namespaceURI===re?g==="math":d.namespaceURI===lt?g==="math"&&Ht[y]:!!Zn[g]:r.namespaceURI===re?d.namespaceURI===lt&&!Ht[y]||d.namespaceURI===ot&&!Ut[y]?!1:!Zn[g]&&(os[g]||!Yn[g]):!!(He==="application/xhtml+xml"&&Ft[r.namespaceURI]):!1},ee=function(r){ye(e.removed,{element:r});try{C(r).removeChild(r)}catch{if(x(r),!C(r))throw he("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")}},Xn=function(r){const d=E?E(r):r.childNodes;if(d){const y=[];oe(d,w=>{ye(y,w)}),oe(y,w=>{try{x(w)}catch{}})}const g=q?q(r):null;if(g)for(let y=g.length-1;y>=0;--y){const w=g[y],_=w&&w.name;if(typeof _=="string")try{r.removeAttribute(_)}catch{}}},ke=function(r,d){try{ye(e.removed,{attribute:d.getAttributeNode(r),from:d})}catch{ye(e.removed,{attribute:null,from:d})}if(d.removeAttribute(r),r==="is")if(_e||st)try{ee(d)}catch{}else try{d.setAttribute(r,"")}catch{}},us=function(r){const d=q?q(r):r.attributes;if(d)for(let g=d.length-1;g>=0;--g){const y=d[g],w=y&&y.name;if(!(typeof w!="string"||z[N(w)]))try{r.removeAttribute(w)}catch{}}},gs=function(r){const d=[r];for(;d.length>0;){const g=d.pop();(S?S(g):g.nodeType)===ie.element&&us(g);const w=E?E(g):g.childNodes;if(w)for(let _=w.length-1;_>=0;--_)d.push(w[_])}},Kn=function(r){let d=null,g=null;if(Lt)r="<remove></remove>"+r;else{const _=fn(r,/^[\r\n\t ]+/);g=_&&_[0]}He==="application/xhtml+xml"&&Ee===re&&(r='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+r+"</body></html>");const y=X?Te(r):r;if(Ee===re)try{d=new p().parseFromString(y,He)}catch{}if(!d||!d.documentElement){d=Ct.createDocument(Ee,"template",null);try{d.documentElement.innerHTML=Bt?me:y}catch{}}const w=d.body||d.documentElement;return r&&g&&w.insertBefore(t.createTextNode(g),w.childNodes[0]||null),Ee===re?es.call(d,be?"html":"body")[0]:be?d.documentElement:w},Vn=function(r){return Ln.call(r.ownerDocument||r,r,c.SHOW_ELEMENT|c.SHOW_COMMENT|c.SHOW_TEXT|c.SHOW_PROCESSING_INSTRUCTION|c.SHOW_CDATA_SECTION,null)},qt=function(r){var d,g;r.normalize();const y=Ln.call(r.ownerDocument||r,r,c.SHOW_TEXT|c.SHOW_COMMENT|c.SHOW_CDATA_SECTION|c.SHOW_PROCESSING_INSTRUCTION,null);let w=y.nextNode();for(;w;){let F=w.data;oe([tt,nt,at],I=>{F=we(F,I," ")}),w.data=F,w=y.nextNode()}const _=(d=(g=r.querySelectorAll)===null||g===void 0?void 0:g.call(r,"template"))!==null&&d!==void 0?d:[];oe(Array.from(_),F=>{Ae(F.content)&&qt(F.content)})},ct=function(r){const d=Q?Q(r):null;return typeof d!="string"||N(d)!=="form"?!1:typeof r.nodeName!="string"||typeof r.textContent!="string"||typeof r.removeChild!="function"||r.attributes!==q(r)||typeof r.removeAttribute!="function"||typeof r.setAttribute!="function"||typeof r.namespaceURI!="string"||typeof r.insertBefore!="function"||typeof r.hasChildNodes!="function"||r.nodeType!==S(r)||r.childNodes!==E(r)},Ae=function(r){if(!S||typeof r!="object"||r===null)return!1;try{return S(r)===ie.documentFragment}catch{return!1}},je=function(r){if(!S||typeof r!="object"||r===null)return!1;try{return typeof S(r)=="number"}catch{return!1}};function ce(m,r,d){oe(m,g=>{g.call(e,r,d,Se)})}const Jn=function(r){let d=null;if(ce(U.beforeSanitizeElements,r,null),ct(r))return ee(r),!0;const g=N(Q?Q(r):r.nodeName);if(ce(U.uponSanitizeElement,r,{tagName:g,allowedTags:D}),Ue&&r.hasChildNodes()&&!je(r.firstElementChild)&&j(/<[/\w!]/g,r.innerHTML)&&j(/<[/\w!]/g,r.textContent)||Ue&&r.namespaceURI===re&&g==="style"&&je(r.firstElementChild)||r.nodeType===ie.progressingInstruction||Ue&&r.nodeType===ie.comment&&j(/<[/\w]/g,r.data))return ee(r),!0;if(Fe[g]||!(de.tagCheck instanceof Function&&de.tagCheck(g))&&!D[g]){if(!Fe[g]&&ea(g)&&(P.tagNameCheck instanceof RegExp&&j(P.tagNameCheck,g)||P.tagNameCheck instanceof Function&&P.tagNameCheck(g)))return!1;if(Dt&&!se[g]){const w=C(r),_=E(r);if(_&&w){const F=_.length;for(let I=F-1;I>=0;--I){const $=zt?_[I]:k(_[I],!0);w.insertBefore($,v(r))}}}return ee(r),!0}return(S?S(r):r.nodeType)===ie.element&&!ps(r)||(g==="noscript"||g==="noembed"||g==="noframes")&&j(/<\/no(script|embed|frames)/i,r.innerHTML)?(ee(r),!0):(pe&&r.nodeType===ie.text&&(d=r.textContent,oe([tt,nt,at],w=>{d=we(d,w," ")}),r.textContent!==d&&(ye(e.removed,{element:r.cloneNode()}),r.textContent=d)),ce(U.afterSanitizeElements,r,null),!1)},Qn=function(r,d,g){if(it[d]||Fn&&(d==="id"||d==="name")&&(g in t||g in ds))return!1;const y=z[d]||de.attributeCheck instanceof Function&&de.attributeCheck(d,r);if(!(Mt&&!it[d]&&j(ns,d))){if(!(Pn&&j(as,d))){if(!y||it[d]){if(!(ea(r)&&(P.tagNameCheck instanceof RegExp&&j(P.tagNameCheck,r)||P.tagNameCheck instanceof Function&&P.tagNameCheck(r))&&(P.attributeNameCheck instanceof RegExp&&j(P.attributeNameCheck,d)||P.attributeNameCheck instanceof Function&&P.attributeNameCheck(d,r))||d==="is"&&P.allowCustomizedBuiltInElements&&(P.tagNameCheck instanceof RegExp&&j(P.tagNameCheck,g)||P.tagNameCheck instanceof Function&&P.tagNameCheck(g))))return!1}else if(!$t[d]){if(!j(zn,we(g,Dn,""))){if(!((d==="src"||d==="xlink:href"||d==="href")&&r!=="script"&&hn(g,"data:")===0&&jn[r])){if(!($n&&!j(is,we(g,Dn,"")))){if(g)return!1}}}}}}return!0},fs=T({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),ea=function(r){return!fs[Le(r)]&&j(ss,r)},ta=function(r){ce(U.beforeSanitizeAttributes,r,null);const d=r.attributes;if(!d||ct(r))return;const g={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:z,forceKeepAttr:void 0};let y=d.length;for(;y--;){const w=d[y],_=w.name,F=w.namespaceURI,I=w.value,$=N(_),ue=I;let H=_==="value"?ue:Ja(ue);if(g.attrName=$,g.attrValue=H,g.keepAttr=!0,g.forceKeepAttr=void 0,ce(U.uponSanitizeAttribute,r,g),H=g.attrValue,Un&&($==="id"||$==="name")&&hn(H,Hn)!==0&&(ke(_,r),H=Hn+H),Ue&&j(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,H)){ke(_,r);continue}if($==="attributename"&&fn(H,"href")){ke(_,r);continue}if(g.forceKeepAttr)continue;if(!g.keepAttr){ke(_,r);continue}if(!Bn&&j(/\/>/i,H)){ke(_,r);continue}pe&&oe([tt,nt,at],aa=>{H=we(H,aa," ")});const na=N(r.nodeName);if(!Qn(na,$,H)){ke(_,r);continue}if(X&&typeof h=="object"&&typeof h.getAttributeType=="function"&&!F)switch(h.getAttributeType(na,$)){case"TrustedHTML":{H=Te(H);break}case"TrustedScriptURL":{H=Vi(H);break}}if(H!==ue)try{F?r.setAttributeNS(F,_,H):r.setAttribute(_,H),ct(r)?ee(r):gn(e.removed)}catch{ke(_,r)}}ce(U.afterSanitizeAttributes,r,null)},dt=function(r){let d=null;const g=Vn(r);for(ce(U.beforeSanitizeShadowDOM,r,null);d=g.nextNode();)if(ce(U.uponSanitizeShadowNode,d,null),Jn(d),ta(d),Ae(d.content)&&dt(d.content),(S?S(d):d.nodeType)===ie.element){const w=W?W(d):d.shadowRoot;Ae(w)&&(Gt(w),dt(w))}ce(U.afterSanitizeShadowDOM,r,null)},Gt=function(r){const d=[{node:r,shadow:null}];for(;d.length>0;){const g=d.pop();if(g.shadow){dt(g.shadow);continue}const y=g.node,_=(S?S(y):y.nodeType)===ie.element,F=E?E(y):y.childNodes;if(F)for(let I=F.length-1;I>=0;--I)d.push({node:F[I],shadow:null});if(_){const I=Q?Q(y):null;if(typeof I=="string"&&N(I)==="template"){const $=y.content;Ae($)&&d.push({node:$,shadow:null})}}if(_){const I=W?W(y):y.shadowRoot;Ae(I)&&d.push({node:null,shadow:I},{node:I,shadow:null})}}};return e.sanitize=function(m){let r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},d=null,g=null,y=null,w=null;if(Bt=!m,Bt&&(m="<!-->"),typeof m!="string"&&!je(m)&&(m=ai(m),typeof m!="string"))throw he("dirty is not a string, aborting");if(!e.isSupported)return m;Nt||jt(r),e.removed=[];const _=zt&&typeof m!="string"&&je(m);if(_){const $=Q?Q(m):m.nodeName;if(typeof $=="string"){const ue=N($);if(!D[ue]||Fe[ue])throw he("root node is forbidden and cannot be sanitized in-place")}if(ct(m))throw he("root node is clobbered and cannot be sanitized in-place");try{Gt(m)}catch(ue){throw Xn(m),ue}}else if(je(m))d=Kn("<!---->"),g=d.ownerDocument.importNode(m,!0),g.nodeType===ie.element&&g.nodeName==="BODY"||g.nodeName==="HTML"?d=g:d.appendChild(g),Gt(g);else{if(!_e&&!pe&&!be&&m.indexOf("<")===-1)return X&&rt?Te(m):m;if(d=Kn(m),!d)return _e?null:rt?me:""}d&&Lt&&ee(d.firstChild);const F=Vn(_?m:d);try{for(;y=F.nextNode();)Jn(y),ta(y),Ae(y.content)&&dt(y.content)}catch($){throw _&&Xn(m),$}if(_)return oe(e.removed,$=>{$.element&&gs($.element)}),pe&&qt(m),m;if(_e){if(pe&&qt(d),st)for(w=Qi.call(d.ownerDocument);d.firstChild;)w.appendChild(d.firstChild);else w=d;return(z.shadowroot||z.shadowrootmode)&&(w=ts.call(n,w,!0)),w}let I=be?d.outerHTML:d.innerHTML;return be&&D["!doctype"]&&d.ownerDocument&&d.ownerDocument.doctype&&d.ownerDocument.doctype.name&&j(fi,d.ownerDocument.doctype.name)&&(I="<!DOCTYPE "+d.ownerDocument.doctype.name+`>
`+I),pe&&oe([tt,nt,at],$=>{I=we(I,$," ")}),X&&rt?Te(I):I},e.setConfig=function(){let m=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};jt(m),Nt=!0},e.clearConfig=function(){Se=null,Nt=!1,X=Rt,me=""},e.isValidAttribute=function(m,r,d){Se||jt({});const g=N(m),y=N(r);return Qn(g,y,d)},e.addHook=function(m,r){typeof r=="function"&&ye(U[m],r)},e.removeHook=function(m,r){if(r!==void 0){const d=Ka(U[m],r);return d===-1?void 0:Va(U[m],d,1)[0]}return gn(U[m])},e.removeHooks=function(m){U[m]=[]},e.removeAllHooks=function(){U=_n()},e}var ki=vn();let En=!1;function xi(){En||(En=!0,A.setOptions({gfm:!0,breaks:!0}))}function yi(s){return String(s).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function wi(s){let e=ki.sanitize(s,{ADD_ATTR:["target","rel"]});return e=e.replace(/<a\s+([^>]*?)>/gi,(t,n)=>(/\btarget\s*=/i.test(n)||(n+=' target="_blank"'),/\brel\s*=/i.test(n)||(n+=' rel="noopener noreferrer"'),"<a "+n+">")),e}function ze(s){if(!s)return"";try{xi();const e=A.parse(s,{async:!1});return wi(e)}catch(e){return console.warn("[AIAgent SDK] marked parse failed, fallback:",e),Ti(s)}}function Ti(s){let e=yi(s);return e=e.replace(/`([^`\n]+)`/g,"<code>$1</code>"),e=e.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\n/g,"<br/>"),e}function Pe(s){if(!s)return;const e=s.querySelectorAll("img");for(let t=0;t<e.length;t++){const n=e[t];if(n.dataset.aiagentDecorated==="1")continue;n.dataset.aiagentDecorated="1",n.setAttribute("loading","lazy"),n.classList.add("aiagent-sdk-img-loading");const a=()=>{n.classList.remove("aiagent-sdk-img-loading"),n.classList.add("aiagent-sdk-img-loaded")};n.complete&&n.naturalWidth>0?a():(n.addEventListener("load",a,{once:!0}),n.addEventListener("error",a,{once:!0}))}}const Sn=["#5eead4","#a78bfa","#f0abfc","#93c5fd","#fcd34d"];function _i(){const s=document.createElement("div");s.className="aiagent-sdk-msg aiagent-sdk-msg-assistant aiagent-sdk-typing-pending";for(let e=0;e<5;e++){const t=document.createElement("span");t.className="aia-p",t.style.setProperty("--c",Sn[e%Sn.length]),e>0&&t.style.setProperty("--d",e*.2+"s"),s.appendChild(t)}return s}function An(s){const e=_i();return s.appendChild(e),s.scrollTop=s.scrollHeight,e}function Rn(s){s&&(s.classList.remove("aiagent-sdk-typing-pending"),s.innerHTML="")}function Cn(s){s&&s.classList.add("aiagent-sdk-typing-active")}function Ve(s){s&&s.classList.remove("aiagent-sdk-typing-active")}function vi(s,e,t){const n=document.createElement("div");n.className="aiagent-sdk-tool-card",n.setAttribute("role","status"),n.setAttribute("data-tool",e);const a=document.createElement("div");a.className="aiagent-sdk-tool-head";const i=document.createElement("span");i.className="aiagent-sdk-tool-arrow",i.textContent="▸";const o=document.createElement("span");o.className="aiagent-sdk-tool-name",o.textContent=e;const l=document.createElement("span");l.className="aiagent-sdk-tool-dot",a.appendChild(i),a.appendChild(o),a.appendChild(l);const c=document.createElement("pre");c.className="aiagent-sdk-tool-body",c.innerHTML=Si(JSON.stringify(t,null,2)||"{}");const u=document.createElement("div");u.className="aiagent-sdk-tool-progress";const p=document.createElement("div");p.className="aiagent-sdk-tool-bar",p.style.setProperty("--p","0%");const h=document.createElement("span");return h.className="aiagent-sdk-tool-status",h.textContent="调用中…",u.appendChild(p),u.appendChild(h),n.appendChild(a),n.appendChild(c),n.appendChild(u),s.appendChild(n),s.scrollTop=s.scrollHeight,n}function $e(s,e,t){if(!s)return;const n=s.querySelector(".aiagent-sdk-tool-bar");if(n&&n.style.setProperty("--p",Math.min(100,Math.max(0,e))+"%"),t){const a=s.querySelector(".aiagent-sdk-tool-status");a&&(a.textContent=t)}}function Ei(s,e="✓ 完成"){if(!s)return;s.classList.add("aiagent-sdk-tool-success");const t=s.querySelector(".aiagent-sdk-tool-status");t&&(t.textContent=e)}function Je(s,e="✕ 失败"){if(!s)return;s.classList.add("aiagent-sdk-tool-error"),s.style.borderLeftColor="var(--aia-error)";const t=s.querySelector(".aiagent-sdk-tool-status");t&&(t.textContent=e)}function Si(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,(t,n,a,i,o)=>n?a?`<span class="k">${n}</span>${a}`:`<span class="s">${n}</span>`:i?`<span class="k">${i}</span>`:o?`<span class="n">${o}</span>`:t)}function Ai(s){return String(s).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function Ri(s,e,t=0,n){const a=document.createElement("div");return a.style.setProperty("--i",String(t)),s==="user"?(a.className="aiagent-sdk-msg aiagent-sdk-msg-user",a.innerHTML=Ai(e||"")):s==="assistant"?(a.className="aiagent-sdk-msg aiagent-sdk-msg-assistant",a.innerHTML=ze(e||""),Pe(a)):s==="tool"?(a.className="aiagent-sdk-msg aiagent-sdk-msg-tool",n&&vi(a,n.tool,n.args||{})):(a.className="aiagent-sdk-msg aiagent-sdk-msg-system",a.textContent=e||""),a}function Ci(s,e,t,n=0,a){const i=Ri(e,t,n,a);s.appendChild(i),s.scrollTop=s.scrollHeight}class Ii{constructor(){b(this,"_tools",new Map)}register(e,t){const n=this._tools.get(e)||new Map,a=[];for(const i of t){const o={description:i.description||"",parameters:i.parameters||{type:"object",properties:{}},strict:i.strict!==!1,onCall:typeof i.onCall=="function"?i.onCall:null};n.set(i.name,o),a.push({name:i.name,description:o.description,parameters:o.parameters,strict:o.strict})}return this._tools.set(e,n),a}unregister(e,t){const n=this._tools.get(e);if(n){if(!t||!t.length){n.clear(),this._tools.delete(e);return}for(const a of t)n.delete(a);n.size===0&&this._tools.delete(e)}}get(e,t){const n=this._tools.get(e);return n&&n.get(t)||null}}async function Oi(s,e,t,n){const a=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/register",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({tools:n})});if(!a.ok){const i=await a.text();throw new Error("register failed: "+a.status+" "+i)}return await a.json()}async function Mi(s,e,t,n){const a=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/unregister",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({names:n})});if(!a.ok)throw new Error("unregister failed: "+a.status);return await a.json()}async function Ni(s,e,t){const n=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools",{method:"GET",headers:{Authorization:"Bearer "+e}});if(!n.ok)throw new Error("list failed: "+n.status);return await n.json()}async function St(s,e,t){if(t){try{await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/abort",{method:"POST",headers:{Authorization:"Bearer "+e}})}catch(n){console.warn("[AIAgent SDK] abort failed:",n.message)}try{sessionStorage.removeItem("pending:"+t)}catch{}}}async function Li(s,e,t,n){if(!e)return;const a=s.getSessionId();if(!a){console.warn("[AIAgent SDK] no sessionId for tool result");return}const i={toolUseId:e,result:t,ts:Date.now()};s.setPending(i);try{sessionStorage.setItem("pending:"+a,JSON.stringify(i))}catch{}let o;try{o=await s.ensureToken()}catch(l){s.appendMsg("system","⚠️ "+l.message),s.setBusy(!1);return}await At(s,e,t,a,o,n)}async function At(s,e,t,n,a,i){const o=s.endpoint+"/chat/"+encodeURIComponent(n)+"/tools/result",l=JSON.stringify({toolUseId:e,result:t==null?"[Tool executed by client SDK; no result returned]":typeof t=="string"?t:JSON.stringify(t)}),c={Authorization:"Bearer "+a,"Content-Type":"application/json",Accept:"text/event-stream"},u=4;let p=500,h=0,f=null,k=null;for(;h<u;){k=null;try{f=await fetch(o,{method:"POST",headers:c,body:l})}catch(S){k=S}if(k){if(h===u-1)break;await s.sleep(p),p*=2,h++,i&&$e(i,Math.min(60+h*10,90),"重试中…");continue}if(f&&f.status>=500&&f.status<600&&h<u-1){await s.sleep(p),p*=2,h++,i&&$e(i,Math.min(60+h*10,90),"重试中…");continue}if(f&&f.status===429&&h<u-1){const S=parseInt(f.headers.get("Retry-After")||"1",10);await s.sleep(Math.max(S*1e3,p)),p*=2,h++,i&&$e(i,Math.min(60+h*10,90),"限流中…");continue}break}if(k){i&&Je(i,"✕ 网络失败"),Qe(s,n,e,"network: "+k.message);return}if(!f){i&&Je(i,"✕ 无响应"),Qe(s,n,e,"network: no response");return}if(f.status===409){i&&Je(i,"✕ 409 冲突");const S=await f.text();s.appendMsg("system","⚠️ "+(S||"session 已被工具调用占用"));try{await St(s.endpoint,a,n)}catch{}s.setPending(null),s.setBusy(!1);return}if(!f.ok||!f.body){i&&Je(i,"✕ HTTP "+f.status),Qe(s,n,e,"http "+f.status);return}i&&Ei(i,"✓ 已提交");const x=s.appendTyping();let v="",E=!1;function C(){E||(E=!0,x.className="aiagent-sdk-msg aiagent-sdk-msg-assistant",Cn(x))}let W=!0;const q=S=>{S&&S.tool&&S.tool.indexOf("__")!==0&&s.appendMsg("tool","",{tool:S.tool,args:S.args||{}})};try{await K(f.body,S=>{v+=S.data||"",C(),x.innerHTML=ze(v),Pe(x),s.getMsgEl().scrollTop=s.getMsgEl().scrollHeight},()=>{C(),Ve(x),x.innerHTML=ze(v),Pe(x),s.getMsgEl().scrollTop=s.getMsgEl().scrollHeight,s.setBusy(!1)},S=>{W=!1,E?(Ve(x),x.className="aiagent-sdk-msg aiagent-sdk-msg-system",x.textContent="⚠️ "+S.message):(x.remove(),s.appendMsg("system","⚠️ "+S.message)),s.setBusy(!1)},q)}catch{W=!1}if(W){try{sessionStorage.removeItem("pending:"+n)}catch{}s.setPending(null)}else Qe(s,n,e,"sse")}async function Di(s){const e=s.getPending();if(!e)return;const t=s.getSessionId();if(!t)return;s.setBusy(!0);let n;try{n=await s.ensureToken()}catch(a){s.appendMsg("system","⚠️ "+a.message),s.setBusy(!1);return}await At(s,e.toolUseId,e.result,t,n)}async function zi(s){const e=s.getSessionId();if(!e){s.setBusy(!1);return}let t="";try{t=await s.ensureToken()}catch{}await St(s.endpoint,t,e),s.appendMsg("system","已放弃本次工具调用,可继续对话。"),s.setBusy(!1)}function Qe(s,e,t,n){console.warn("[AIAgent SDK] tool result failed:",n),Pi(s,n),s.setBusy(!1)}function Pi(s,e){const t=s.getMsgEl();if(t.querySelector(".aiagent-sdk-tool-result-failed"))return;const n=document.createElement("div");n.className="aiagent-sdk-tool-result-failed";const a=document.createElement("div");a.className="aiagent-sdk-tool-result-failed-header",a.textContent="提交工具结果失败";const i=document.createElement("div");i.className="aiagent-sdk-tool-result-failed-detail",i.textContent="原因:"+(e||"未知")+"。可重试,或取消本次调用以继续对话。";const o=document.createElement("div");o.className="aiagent-sdk-tool-result-actions";const l=document.createElement("button");l.type="button",l.className="aiagent-sdk-btn-retry",l.textContent="↻ 重试",l.addEventListener("click",()=>{n.parentNode&&n.parentNode.removeChild(n),Di(s)});const c=document.createElement("button");c.type="button",c.className="aiagent-sdk-btn-cancel",c.textContent="✕ 取消",c.addEventListener("click",()=>{n.parentNode&&n.parentNode.removeChild(n),zi(s)}),o.appendChild(l),o.appendChild(c),n.appendChild(a),n.appendChild(i),n.appendChild(o),t.appendChild(n),t.scrollTop=t.scrollHeight}async function $i(s){if(typeof sessionStorage>"u")return;let e=null,t=null;try{for(let i=0;i<sessionStorage.length;i++){const o=sessionStorage.key(i);if(o&&o.indexOf("pending:")===0){e=o,t=JSON.parse(sessionStorage.getItem(o)||"null");break}}}catch{return}if(!e||!t||!t.toolUseId){e&&sessionStorage.removeItem(e);return}const n=e.substring(8);s.appendMsg("system","检测到上次未完成的工具调用,正在重试提交…"),s.setPending(t);let a;try{a=await s.ensureToken()}catch(i){s.appendMsg("system","⚠️ "+i.message);return}await At(s,t.toolUseId,t.result,n,a)}function Bi(s){if(s.getActiveTools().indexOf("submit_form")>=0)s.setActiveTools([]),s.setExtractOnCall(null),s.appendMsg("system","📋 录单模式已关闭(普通聊天)");else{let e=s.getChatSessionId();e||(e=s.getDemoSessionId()||s.clientPrefix+":order-"+Date.now()),s.hasLocalTool(e,"submit_form")||(e=s.getDemoSessionId()),s.setChatSessionId(e),s.setActiveTools(["submit_form"]),s.setExtractOnCall(null),s.appendMsg("system","📋 录单模式已开启。请粘订单文本,模型会多轮收集字段。")}}function Fi(s,e){const t=e.sessionId||s.clientPrefix+":order-"+Date.now(),n=e.tools||[],a=e.activeTools||(n.length?[n[0].name]:[]);if(!n.length){console.warn("[AIAgent SDK] startExtractSession: tools required");return}e.onFormSubmit&&!n[0].onCall&&(n[0].onCall=e.onFormSubmit),s.registerTools(t,n).then(()=>{s.setChatSessionId(t),s.setActiveTools(a);const i=n[0];s.setExtractOnCall(i&&typeof i.onCall=="function"?i.onCall:null),s.appendMsg("system","📋 智能录单已开启("+t+"),激活工具: "+a.join(",")),s.sendUserMessage(e.initialMessage||"请开始按工具定义收集字段,或直接让我粘订单文本。")}).catch(i=>{s.appendMsg("system","⚠️ 工具注册失败:"+i.message)})}function Ui(s){s.setActiveTools([]),s.setExtractOnCall(null),s.appendMsg("system","📋 录单模式已关闭")}const Hi=`
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
`,ji=`
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M5 12 L19 12 M13 6 L19 12 L13 18"/>
</svg>
`.trim();class qi{constructor(e,t){b(this,"host",null);b(this,"shadow",null);b(this,"bubble",null);b(this,"panel",null);b(this,"msgEl",null);b(this,"taEl",null);b(this,"sendBtn",null);b(this,"welcomeEl",null);b(this,"isOpen",!1);b(this,"mounted",!1);b(this,"avatarRaw","🤖");b(this,"onMouseMove",null);this.opts=e,this.handlers=t}getRefs(){return!this.host||!this.bubble||!this.panel||!this.msgEl||!this.taEl||!this.sendBtn?null:{host:this.host,bubble:this.bubble,panel:this.panel,msgEl:this.msgEl,taEl:this.taEl,sendBtn:this.sendBtn}}mount(){if(this.mounted||typeof document>"u")return;const e=document.createElement("div");e.className="aiagent-sdk-host",e.setAttribute("data-position",this.opts.position||"bottom-right"),e.setAttribute("data-theme",this.opts.theme||"ink"),document.body.appendChild(e),this.host=e;const t=e.attachShadow({mode:"open"});this.shadow=t;const n=document.createElement("style");n.textContent=Hi,t.appendChild(n);const a=this.opts.position==="bottom-left"?" aiagent-sdk-pos-bl":"";this.avatarRaw=this.opts.avatar||"🤖";const i=this.avatarRaw.length<=2,o=document.createElement("button");i?(o.className="aiagent-sdk-bubble aiagent-sdk-bubble-emoji"+a,o.textContent=this.avatarRaw):o.className="aiagent-sdk-bubble"+a,o.setAttribute("aria-label",this.opts.title||"AI 助手 - 点击打开对话"),o.title=this.opts.title||"AI 助手",o.addEventListener("click",()=>this.toggle()),t.appendChild(o),this.bubble=o;const l=document.createElement("div");l.className="aiagent-sdk-panel"+a;const c=this.opts.demoTools?'<button class="aiagent-sdk-iconbtn aiagent-sdk-extract" title="开/关 录单模式" aria-label="录单模式">⊕</button>':"";l.innerHTML=['<div class="aiagent-sdk-corner aiagent-sdk-corner-tl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-tr" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-bl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-br" aria-hidden="true"></div>','<div class="aiagent-sdk-header">','  <div class="aiagent-sdk-header-info">','    <span class="aiagent-sdk-status-dot" aria-hidden="true"></span>','    <span class="aiagent-sdk-title"></span>',"  </div>",'  <div class="aiagent-sdk-header-actions">','    <span class="aiagent-sdk-subtitle"></span>',c,'    <button class="aiagent-sdk-iconbtn aiagent-sdk-new" title="新会话" aria-label="新会话">＋</button>','    <button class="aiagent-sdk-iconbtn aiagent-sdk-close" title="关闭" aria-label="关闭">✕</button>',"  </div>","</div>",'<div class="aiagent-sdk-welcome" hidden></div>','<div class="aiagent-sdk-messages" role="log" aria-live="polite"></div>','<div class="aiagent-sdk-inputbar">','  <textarea rows="1" placeholder="" aria-label="输入消息"></textarea>',`  <button class="aiagent-sdk-send" aria-label="发送">${ji}</button>`,"</div>"].join(""),t.appendChild(l),this.panel=l;const u=l.querySelector(".aiagent-sdk-title"),p=l.querySelector(".aiagent-sdk-subtitle");u.textContent=this.opts.title||"AI 助手",p.textContent=this.opts.subtitle||"";const h=l.querySelector("textarea");h.placeholder=this.opts.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",this.msgEl=l.querySelector(".aiagent-sdk-messages"),this.taEl=h,this.sendBtn=l.querySelector(".aiagent-sdk-send"),this.welcomeEl=l.querySelector(".aiagent-sdk-welcome");const f=l.querySelector(".aiagent-sdk-close"),k=l.querySelector(".aiagent-sdk-new"),x=l.querySelector(".aiagent-sdk-extract");f.addEventListener("click",()=>this.handlers.onClose()),k.addEventListener("click",()=>this.handlers.onNew()),x&&x.addEventListener("click",()=>this.handlers.onToggleExtract()),this.sendBtn.addEventListener("click",()=>{this._burstSend(),this.handlers.onSend()}),h.addEventListener("keydown",v=>{v.key==="Enter"&&!v.shiftKey&&(v.preventDefault(),this._burstSend(),this.handlers.onSend())}),h.addEventListener("input",()=>{h.style.height="auto",h.style.height=Math.min(h.scrollHeight,80)+"px"}),this.onMouseMove=v=>{if(!this.panel)return;const E=this.panel.getBoundingClientRect(),C=(v.clientX-E.left)/E.width*100,W=(v.clientY-E.top)/E.height*100;this.panel.style.setProperty("--aia-mx",C+"%"),this.panel.style.setProperty("--aia-my",W+"%")},this.panel.addEventListener("mousemove",this.onMouseMove),this.panel.addEventListener("mouseleave",()=>{this.panel&&(this.panel.style.setProperty("--aia-mx","50%"),this.panel.style.setProperty("--aia-my","50%"))}),this.setTheme(this.opts.theme||"ink"),this.mounted=!0}destroy(){this.mounted&&(this.panel&&this.onMouseMove&&this.panel.removeEventListener("mousemove",this.onMouseMove),this.host&&this.host.parentNode&&this.host.parentNode.removeChild(this.host),this.host=null,this.shadow=null,this.bubble=null,this.panel=null,this.msgEl=null,this.taEl=null,this.sendBtn=null,this.welcomeEl=null,this.mounted=!1,this.isOpen=!1,this.onMouseMove=null)}open(){this.panel&&(this.panel.classList.add("aiagent-sdk-open"),this.isOpen=!0,setTimeout(()=>{this.taEl&&this.taEl.focus()},50),this.handlers.onPanelOpen())}close(){this.panel&&(this.panel.classList.remove("aiagent-sdk-open"),this.isOpen=!1)}toggle(){this.isOpen?this.close():this.open()}getIsOpen(){return this.isOpen}setTheme(e){this.host&&this.host.setAttribute("data-theme",e)}clearMessages(){this.msgEl&&(this.msgEl.innerHTML="")}setWelcome(e){if(this.welcomeEl){if(!e){this.welcomeEl.hidden=!0;return}this.welcomeEl.hidden=!1,this.welcomeEl.textContent=e}}hideWelcome(){this.welcomeEl&&(this.welcomeEl.hidden||(this.welcomeEl.classList.add("aiagent-sdk-welcome-leaving"),setTimeout(()=>{this.welcomeEl&&(this.welcomeEl.hidden=!0,this.welcomeEl.classList.remove("aiagent-sdk-welcome-leaving"))},280)))}_burstSend(){if(!this.sendBtn)return;const e=5,t=["#5eead4","#a78bfa","#f0abfc","#93c5fd","#fcd34d"];for(let n=0;n<e;n++){const a=Math.PI*2*n/e+Math.random()*.5,i=22+Math.random()*14,o=Math.cos(a)*i,l=Math.sin(a)*i,c=document.createElement("span");c.className="aiagent-sdk-send-burst",c.style.setProperty("--bx",o+"px"),c.style.setProperty("--by",l+"px");const u=t[n];c.style.setProperty("--c",u),c.style.background=u,this.sendBtn.appendChild(c),setTimeout(()=>c.remove(),750)}}}function Gi(s,e){s.setTheme(e)}const Wi=[{name:"submit_form",description:"Submit the collected order fields. Call only when ALL required fields are collected.",parameters:{type:"object",properties:{orderId:{type:"string",description:"订单编号,如 PO-2024-001"},customerName:{type:"string",description:"客户全名"},customerPhone:{type:"string",description:"11 位手机号"},items:{type:"string",description:"商品清单"},totalAmount:{type:"number",description:"订单总金额,单位元"},notes:{type:"string",description:"其他备注"}},required:["orderId","customerName","items","totalAmount"]},strict:!0}];class Yi{constructor(){b(this,"endpoint");b(this,"getAccessToken");b(this,"_opts");b(this,"_tokenCache",new O);b(this,"_tools",new Ii);b(this,"_widget",null);b(this,"_isOpen",!1);b(this,"_busy",!1);b(this,"_messages",[]);b(this,"_chatSessionId",null);b(this,"_activeTools",[]);b(this,"_extractOnCall",null);b(this,"_pendingToolCall",null);b(this,"_demoSessionId",null);b(this,"_lastToolCard",null)}init(e){if(!e||!e.endpoint)throw new Error("endpoint required");if(typeof e.getAccessToken!="function")throw new Error("getAccessToken() required");return this.endpoint=String(e.endpoint).replace(/\/+$/,""),this.getAccessToken=e.getAccessToken,this._opts={title:e.title||"AI 助手",subtitle:e.subtitle||"在线",placeholder:e.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",welcomeMessage:e.welcomeMessage||"你好!我是 AI 助手,有什么可以帮你的?",theme:e.theme||"ink",position:e.position||"bottom-right",autoOpen:!!e.autoOpen,avatar:e.avatar||"🤖",clientPrefix:e.clientPrefix||"app",demoTools:!!e.demoTools,demoOrderTools:e.demoOrderTools||Wi},this._widget=new qi(this._opts,{onSend:()=>this._onSend(),onNew:()=>this._newSession(),onClose:()=>this.close(),onToggleExtract:()=>this._toggleExtractMode(),onPanelOpen:()=>{}}),this._widget.mount(),this._opts.autoOpen&&this.open(),this._opts.welcomeMessage&&this._widget.setWelcome(this._opts.welcomeMessage),setTimeout(()=>{this._resumePendingToolResults()},0),this._opts.demoTools&&(this._demoSessionId=this._opts.clientPrefix+":demo",this._internalRegister(this._demoSessionId,this._opts.demoOrderTools).then(()=>{}).catch(t=>{console.warn("[AIAgent SDK] demo tools register failed:",t)})),this}destroy(){this._widget&&(this._widget.destroy(),this._widget=null)}async registerTools(e){if(!e||!e.sessionId)throw new Error("sessionId required");if(!e.tools||!e.tools.length)throw new Error("tools required");return this._internalRegister(e.sessionId,e.tools)}async unregisterTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const n=t.names||null;this._tools.unregister(t.sessionId,n);const a=await this._ensureToken();return Mi(this.endpoint,a,t.sessionId,n)}async listTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const n=await this._ensureToken();return Ni(this.endpoint,n,t.sessionId)}async _internalRegister(e,t){const n=this._tools.register(e,t),a=await this._ensureToken();return Oi(this.endpoint,a,e,n)}_getLocalTool(e,t){return this._tools.get(e,t)}startExtractSession(e){const t=this._extractCtx();Fi(t,e)}stopExtractSession(){Ui(this._extractCtx())}_toggleExtractMode(){Bi(this._extractCtx())}async stream(e){const t=e||{};return this._postStream({sessionId:t.sessionId,message:t.message,activeTools:t.activeTools||[],onChunk:t.onChunk||(()=>{}),onDone:t.onDone||(()=>{}),onError:t.onError||(n=>console.error(n)),onToolCall:t.onToolCall})}open(){this._widget&&this._widget.open(),this._isOpen=!0}close(){this._widget&&this._widget.close(),this._isOpen=!1}toggle(){this._widget&&this._widget.toggle(),this._isOpen=this._widget?this._widget.getIsOpen():!1}setTheme(e){this._widget&&Gi(this._widget,e.theme)}async _ensureToken(){return this._tokenCache.get(this.getAccessToken)}_newSession(){const e=this._chatSessionId;e&&St(this.endpoint,"",e).catch(()=>{}),this._widget&&this._widget.clearMessages(),this._messages=[],this._activeTools=[],this._extractOnCall=null,this._chatSessionId=null,this._widget&&this._opts.welcomeMessage&&this._widget.setWelcome(this._opts.welcomeMessage)}_onSend(){if(!this._widget)return;const e=this._widget.getRefs();if(!e)return;const t=e.taEl.value.trim();!t||this._busy||(e.taEl.value="",e.taEl.style.height="auto",this._sendUserMessage(t))}async _sendUserMessage(e){this._widget&&this._widget.hideWelcome(),this._appendMsg("user",e),this._setBusy(!0);const t=this._widget.getRefs(),n=An(t.msgEl);let a="";const i=this,o=this._activeTools.slice(),l=this._extractOnCall;let c=!1,u=!1;function p(){u||(u=!0,Rn(n),Cn(n))}const h={message:e,onChunk:f=>{a+=f.data||"",p(),n.innerHTML=ze(a),Pe(n),t.msgEl.scrollTop=t.msgEl.scrollHeight},onDone:()=>{p(),Ve(n),n.innerHTML=ze(a),Pe(n),t.msgEl.scrollTop=t.msgEl.scrollHeight,c||i._setBusy(!1)},onError:f=>{Rn(n),u?(Ve(n),n.className="aiagent-sdk-msg aiagent-sdk-msg-system",n.textContent="⚠️ 错误:"+f.message):(n.remove(),i._appendMsg("system","⚠️ 错误:"+f.message)),i._setBusy(!1),c=!0},onToolCall:async f=>{if(!f||!f.tool||f.tool.indexOf("__")===0||!f.args||typeof f.args!="object"||!Object.keys(f.args).length||c)return;c=!0,i._appendMsg("tool","",{tool:f.tool,args:f.args});const x=t.msgEl.querySelectorAll(".aiagent-sdk-tool-card");i._lastToolCard=x.length?x[x.length-1]:null,i._lastToolCard&&$e(i._lastToolCard,30,"执行中…");let v;const E=i._getLocalTool(i._chatSessionId,f.tool);if(E&&E.onCall)try{v=await Promise.resolve(E.onCall(f.args))}catch(C){console.error("[AIAgent SDK] onCall threw:",C),i._appendMsg("system","⚠️ onCall 失败: "+C.message)}if(l&&f.tool==="submit_form")try{const C=l(f.args);C!=null&&v==null&&(v=C)}catch(C){console.error("[AIAgent SDK] extract onCall threw:",C)}i._lastToolCard&&$e(i._lastToolCard,60,"提交结果…"),f.id&&await i._postToolResult(f.id,v,i._lastToolCard)}};this._chatSessionId||(this._chatSessionId=this._opts.clientPrefix+":user-"+Date.now()),h.sessionId=this._chatSessionId,h.activeTools=o;try{await this._postStream(h)}catch{}}_setBusy(e){if(this._busy=e,!this._widget)return;const t=this._widget.getRefs();t&&(t.sendBtn.disabled=e,t.sendBtn.textContent=e?"...":"发送")}_sleep(e){return new Promise(t=>setTimeout(t,e))}_appendMsg(e,t,n){if(!this._widget)return;const a=this._widget.getRefs();a&&(Ci(a.msgEl,e,t,this._messages.length,n),this._messages.push({role:e,text:t,data:n}))}_appendTyping(){if(!this._widget)return document.createElement("div");const e=this._widget.getRefs();return e?An(e.msgEl):document.createElement("div")}async _postStream(e){const t=e.sessionId,n=e.message,a=e.activeTools,i=e.onChunk||(()=>{}),o=e.onDone||(()=>{}),l=e.onError||(k=>console.error(k)),c=e.onToolCall;if(!t){l(new Error("sessionId required"));return}if(n==null){l(new Error("message required"));return}let u;try{u=await this._ensureToken()}catch(k){l(k);return}const p=this.endpoint+"/chat/"+encodeURIComponent(t)+"/stream",h={message:n};a&&a.length&&(h.activeTools=a);let f;try{f=await fetch(p,{method:"POST",headers:{Authorization:"Bearer "+u,"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify(h)})}catch(k){l(k);return}if(!f.ok||!f.body){l(new Error("http "+f.status));return}return K(f.body,i,o,l,c)}async _postToolResult(e,t,n){const a=this._toolCtx();return Li(a,e,t,n)}async _resumePendingToolResults(){return $i(this._toolCtx())}_toolCtx(){const e=this;return{endpoint:this.endpoint,ensureToken:()=>e._ensureToken(),getSessionId:()=>e._chatSessionId,getPending:()=>e._pendingToolCall,setPending:t=>{e._pendingToolCall=t},appendMsg:(t,n,a)=>e._appendMsg(t,n,a),setBusy:t=>e._setBusy(t),sleep:t=>e._sleep(t),appendTyping:()=>e._appendTyping(),getMsgEl:()=>e._widget?.getRefs()?.msgEl||document.createElement("div")}}_extractCtx(){const e=this;return{clientPrefix:this._opts.clientPrefix,getDemoSessionId:()=>e._demoSessionId,getChatSessionId:()=>e._chatSessionId,setChatSessionId:t=>{e._chatSessionId=t},getActiveTools:()=>e._activeTools,setActiveTools:t=>{e._activeTools=t},getExtractOnCall:()=>e._extractOnCall,setExtractOnCall:t=>{e._extractOnCall=t},hasLocalTool:(t,n)=>!!e._tools.get(t,n),registerTools:(t,n)=>e._internalRegister(t,n||[]),sendUserMessage:t=>e._sendUserMessage(t),appendMsg:(t,n)=>e._appendMsg(t,n)}}}function Zi(){return{init:s=>new Yi().init(s)}}const Xi=["https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap"];let In=!1;function Ki(){if(!In&&!(typeof document>"u"))try{const s=document.createElement("link");s.rel="preconnect",s.href="https://fonts.googleapis.com",document.head.appendChild(s);const e=document.createElement("link");e.rel="preconnect",e.href="https://fonts.gstatic.com",e.crossOrigin="anonymous",document.head.appendChild(e);for(const t of Xi){const n=document.createElement("link");n.rel="stylesheet",n.href=t,document.head.appendChild(n)}In=!0}catch(s){console.warn("[AIAgent SDK] loadFonts failed, fallback to system fonts:",s)}}Ki();const On=Zi();return globalThis.AIAgent=On,console.info("%c[AIAgent SDK v5.0.0]%c loaded (built __BUILD_TIME__). Theme: Iridescent Bloom. AIAgent.init({...}) is on window.AIAgent.","background:linear-gradient(135deg,#5eead4,#a78bfa,#f0abfc);color:#050505;padding:2px 8px;border-radius:3px;font-weight:700","color:#a1a1aa"),On});
