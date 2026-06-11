(function(L,O){typeof exports=="object"&&typeof module<"u"?module.exports=O():typeof define=="function"&&define.amd?define(O):(L=typeof globalThis<"u"?globalThis:L||self,L.AIAgent=O())})(this,function(){"use strict";var ia=Object.defineProperty;var es=L=>{throw TypeError(L)};var aa=(L,O,X)=>O in L?ia(L,O,{enumerable:!0,configurable:!0,writable:!0,value:X}):L[O]=X;var k=(L,O,X)=>aa(L,typeof O!="symbol"?O+"":O,X),ra=(L,O,X)=>O.has(L)||es("Cannot "+X);var ts=(L,O,X)=>O.has(L)?es("Cannot add the same private member more than once"):O instanceof WeakSet?O.add(L):O.set(L,X);var je=(L,O,X)=>(ra(L,O,"access private method"),X);var le,ns,qt,ss;function L(a){if(!a)return null;try{const e=a.split(".");if(e.length!==3)return null;let t=e[1].replace(/-/g,"+").replace(/_/g,"/");for(;t.length%4;)t+="=";const n=atob(t),s=JSON.parse(n);return typeof s.exp=="number"?s.exp:null}catch{return null}}class O{constructor(){k(this,"_accessToken",null);k(this,"_expEpoch",0)}async get(e){const t=Math.floor(Date.now()/1e3);if(this._accessToken&&this._expEpoch>t+30)return this._accessToken;console.log("[AIAgent SDK] token missing/near-expiry, calling getAccessToken()...");const n=await e();if(!n||!n.accessToken)throw new Error("getAccessToken() must return { accessToken }");return this._accessToken=n.accessToken,this._expEpoch=L(n.accessToken)||t+300,this._accessToken}}async function X(a,e,t,n,s){const i=a.getReader(),o=new TextDecoder;let c="",l=!1;function f(){l||(l=!0,t())}function p(){for(;;){const h=c.indexOf(`

`);if(h<0)return;const g=c.slice(0,h);if(c=c.slice(h+2),!g)continue;const b={},y=g.split(`
`);for(let R=0;R<y.length;R++){const E=y[R],j=E.indexOf(":");if(j<0)continue;const Q=E.slice(0,j).trim();let A=E.slice(j+1);A.length>0&&A.charAt(0)===" "&&(A=A.slice(1)),Q==="data"?b.data=(b.data?b.data+`
`:"")+A:b[Q]=A}if(b.data&&(b.data=b.data.replace(/\\n/g,`
`)),b.id==="last"){f();return}if(b.event==="tool_call"&&typeof s=="function"){try{s(JSON.parse(b.data||"{}"))}catch(R){console.error("[AIAgent SDK] tool_call parse failed",R,b.data)}continue}b.data!==void 0&&e(b)}}try{for(;;){const h=await i.read();if(h.done)break;c+=o.decode(h.value,{stream:!0}),p()}p(),f()}catch(h){n(h)}}function ct(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}let fe=ct();function Gt(a){fe=a}const Wt=/[&<>"']/,is=new RegExp(Wt.source,"g"),Yt=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,as=new RegExp(Yt.source,"g"),rs={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Zt=a=>rs[a];function K(a,e){if(e){if(Wt.test(a))return a.replace(is,Zt)}else if(Yt.test(a))return a.replace(as,Zt);return a}const os=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;function ls(a){return a.replace(os,(e,t)=>(t=t.toLowerCase(),t==="colon"?":":t.charAt(0)==="#"?t.charAt(1)==="x"?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""))}const cs=/(^|[^\[])\^/g;function v(a,e){let t=typeof a=="string"?a:a.source;e=e||"";const n={replace:(s,i)=>{let o=typeof i=="string"?i:i.source;return o=o.replace(cs,"$1"),t=t.replace(s,o),n},getRegex:()=>new RegExp(t,e)};return n}function Xt(a){try{a=encodeURI(a).replace(/%25/g,"%")}catch{return null}return a}const Re={exec:()=>null};function Kt(a,e){const t=a.replace(/\|/g,(i,o,c)=>{let l=!1,f=o;for(;--f>=0&&c[f]==="\\";)l=!l;return l?"|":" |"}),n=t.split(/ \|/);let s=0;if(n[0].trim()||n.shift(),n.length>0&&!n[n.length-1].trim()&&n.pop(),e)if(n.length>e)n.splice(e);else for(;n.length<e;)n.push("");for(;s<n.length;s++)n[s]=n[s].trim().replace(/\\\|/g,"|");return n}function Ie(a,e,t){const n=a.length;if(n===0)return"";let s=0;for(;s<n&&a.charAt(n-s-1)===e;)s++;return a.slice(0,n-s)}function us(a,e){if(a.indexOf(e[1])===-1)return-1;let t=0;for(let n=0;n<a.length;n++)if(a[n]==="\\")n++;else if(a[n]===e[0])t++;else if(a[n]===e[1]&&(t--,t<0))return n;return-1}function Vt(a,e,t,n){const s=e.href,i=e.title?K(e.title):null,o=a[1].replace(/\\([\[\]])/g,"$1");if(a[0].charAt(0)!=="!"){n.state.inLink=!0;const c={type:"link",raw:t,href:s,title:i,text:o,tokens:n.inlineTokens(o)};return n.state.inLink=!1,c}return{type:"image",raw:t,href:s,title:i,text:K(o)}}function ps(a,e){const t=a.match(/^(\s+)(?:```)/);if(t===null)return e;const n=t[1];return e.split(`
`).map(s=>{const i=s.match(/^\s+/);if(i===null)return s;const[o]=i;return o.length>=n.length?s.slice(n.length):s}).join(`
`)}class qe{constructor(e){k(this,"options");k(this,"rules");k(this,"lexer");this.options=e||fe}space(e){const t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){const t=this.rules.block.code.exec(e);if(t){const n=t[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?n:Ie(n,`
`)}}}fences(e){const t=this.rules.block.fences.exec(e);if(t){const n=t[0],s=ps(n,t[3]||"");return{type:"code",raw:n,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:s}}}heading(e){const t=this.rules.block.heading.exec(e);if(t){let n=t[2].trim();if(/#$/.test(n)){const s=Ie(n,"#");(this.options.pedantic||!s||/ $/.test(s))&&(n=s.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:n,tokens:this.lexer.inline(n)}}}hr(e){const t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:Ie(t[0],`
`)}}blockquote(e){const t=this.rules.block.blockquote.exec(e);if(t){let n=Ie(t[0],`
`).split(`
`),s="",i="";const o=[];for(;n.length>0;){let c=!1;const l=[];let f;for(f=0;f<n.length;f++)if(/^ {0,3}>/.test(n[f]))l.push(n[f]),c=!0;else if(!c)l.push(n[f]);else break;n=n.slice(f);const p=l.join(`
`),h=p.replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,`
    $1`).replace(/^ {0,3}>[ \t]?/gm,"");s=s?`${s}
${p}`:p,i=i?`${i}
${h}`:h;const g=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(h,o,!0),this.lexer.state.top=g,n.length===0)break;const b=o[o.length-1];if(b?.type==="code")break;if(b?.type==="blockquote"){const y=b,R=y.raw+`
`+n.join(`
`),E=this.blockquote(R);o[o.length-1]=E,s=s.substring(0,s.length-y.raw.length)+E.raw,i=i.substring(0,i.length-y.text.length)+E.text;break}else if(b?.type==="list"){const y=b,R=y.raw+`
`+n.join(`
`),E=this.list(R);o[o.length-1]=E,s=s.substring(0,s.length-b.raw.length)+E.raw,i=i.substring(0,i.length-y.raw.length)+E.raw,n=R.substring(o[o.length-1].raw.length).split(`
`);continue}}return{type:"blockquote",raw:s,tokens:o,text:i}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim();const s=n.length>1,i={type:"list",raw:"",ordered:s,start:s?+n.slice(0,-1):"",loose:!1,items:[]};n=s?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=s?n:"[*+-]");const o=new RegExp(`^( {0,3}${n})((?:[	 ][^\\n]*)?(?:\\n|$))`);let c=!1;for(;e;){let l=!1,f="",p="";if(!(t=o.exec(e))||this.rules.block.hr.test(e))break;f=t[0],e=e.substring(f.length);let h=t[2].split(`
`,1)[0].replace(/^\t+/,j=>" ".repeat(3*j.length)),g=e.split(`
`,1)[0],b=!h.trim(),y=0;if(this.options.pedantic?(y=2,p=h.trimStart()):b?y=t[1].length+1:(y=t[2].search(/[^ ]/),y=y>4?1:y,p=h.slice(y),y+=t[1].length),b&&/^ *$/.test(g)&&(f+=g+`
`,e=e.substring(g.length+1),l=!0),!l){const j=new RegExp(`^ {0,${Math.min(3,y-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),Q=new RegExp(`^ {0,${Math.min(3,y-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),A=new RegExp(`^ {0,${Math.min(3,y-1)}}(?:\`\`\`|~~~)`),G=new RegExp(`^ {0,${Math.min(3,y-1)}}#`);for(;e;){const J=e.split(`
`,1)[0];if(g=J,this.options.pedantic&&(g=g.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),A.test(g)||G.test(g)||j.test(g)||Q.test(e))break;if(g.search(/[^ ]/)>=y||!g.trim())p+=`
`+g.slice(y);else{if(b||h.search(/[^ ]/)>=4||A.test(h)||G.test(h)||Q.test(h))break;p+=`
`+g}!b&&!g.trim()&&(b=!0),f+=J+`
`,e=e.substring(J.length+1),h=g.slice(y)}}i.loose||(c?i.loose=!0:/\n *\n *$/.test(f)&&(c=!0));let R=null,E;this.options.gfm&&(R=/^\[[ xX]\] /.exec(p),R&&(E=R[0]!=="[ ] ",p=p.replace(/^\[[ xX]\] +/,""))),i.items.push({type:"list_item",raw:f,task:!!R,checked:E,loose:!1,text:p,tokens:[]}),i.raw+=f}i.items[i.items.length-1].raw=i.items[i.items.length-1].raw.trimEnd(),i.items[i.items.length-1].text=i.items[i.items.length-1].text.trimEnd(),i.raw=i.raw.trimEnd();for(let l=0;l<i.items.length;l++)if(this.lexer.state.top=!1,i.items[l].tokens=this.lexer.blockTokens(i.items[l].text,[]),!i.loose){const f=i.items[l].tokens.filter(h=>h.type==="space"),p=f.length>0&&f.some(h=>/\n.*\n/.test(h.raw));i.loose=p}if(i.loose)for(let l=0;l<i.items.length;l++)i.items[l].loose=!0;return i}}html(e){const t=this.rules.block.html.exec(e);if(t)return{type:"html",block:!0,raw:t[0],pre:t[1]==="pre"||t[1]==="script"||t[1]==="style",text:t[0]}}def(e){const t=this.rules.block.def.exec(e);if(t){const n=t[1].toLowerCase().replace(/\s+/g," "),s=t[2]?t[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:n,raw:t[0],href:s,title:i}}}table(e){const t=this.rules.block.table.exec(e);if(!t||!/[:|]/.test(t[2]))return;const n=Kt(t[1]),s=t[2].replace(/^\||\| *$/g,"").split("|"),i=t[3]&&t[3].trim()?t[3].replace(/\n[ \t]*$/,"").split(`
`):[],o={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===s.length){for(const c of s)/^ *-+: *$/.test(c)?o.align.push("right"):/^ *:-+: *$/.test(c)?o.align.push("center"):/^ *:-+ *$/.test(c)?o.align.push("left"):o.align.push(null);for(let c=0;c<n.length;c++)o.header.push({text:n[c],tokens:this.lexer.inline(n[c]),header:!0,align:o.align[c]});for(const c of i)o.rows.push(Kt(c,o.header.length).map((l,f)=>({text:l,tokens:this.lexer.inline(l),header:!1,align:o.align[f]})));return o}}lheading(e){const t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){const t=this.rules.block.paragraph.exec(e);if(t){const n=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:n,tokens:this.lexer.inline(n)}}}text(e){const t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){const t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:K(t[1])}}tag(e){const t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&/^<a /i.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){const t=this.rules.inline.link.exec(e);if(t){const n=t[2].trim();if(!this.options.pedantic&&/^</.test(n)){if(!/>$/.test(n))return;const o=Ie(n.slice(0,-1),"\\");if((n.length-o.length)%2===0)return}else{const o=us(t[2],"()");if(o>-1){const l=(t[0].indexOf("!")===0?5:4)+t[1].length+o;t[2]=t[2].substring(0,o),t[0]=t[0].substring(0,l).trim(),t[3]=""}}let s=t[2],i="";if(this.options.pedantic){const o=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(s);o&&(s=o[1],i=o[3])}else i=t[3]?t[3].slice(1,-1):"";return s=s.trim(),/^</.test(s)&&(this.options.pedantic&&!/>$/.test(n)?s=s.slice(1):s=s.slice(1,-1)),Vt(t,{href:s&&s.replace(this.rules.inline.anyPunctuation,"$1"),title:i&&i.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){const s=(n[2]||n[1]).replace(/\s+/g," "),i=t[s.toLowerCase()];if(!i){const o=n[0].charAt(0);return{type:"text",raw:o,text:o}}return Vt(n,i,n[0],this.lexer)}}emStrong(e,t,n=""){let s=this.rules.inline.emStrongLDelim.exec(e);if(!s||s[3]&&n.match(/[\p{L}\p{N}]/u))return;if(!(s[1]||s[2]||"")||!n||this.rules.inline.punctuation.exec(n)){const o=[...s[0]].length-1;let c,l,f=o,p=0;const h=s[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(h.lastIndex=0,t=t.slice(-1*e.length+o);(s=h.exec(t))!=null;){if(c=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!c)continue;if(l=[...c].length,s[3]||s[4]){f+=l;continue}else if((s[5]||s[6])&&o%3&&!((o+l)%3)){p+=l;continue}if(f-=l,f>0)continue;l=Math.min(l,l+f+p);const g=[...s[0]][0].length,b=e.slice(0,o+s.index+g+l);if(Math.min(o,l)%2){const R=b.slice(1,-1);return{type:"em",raw:b,text:R,tokens:this.lexer.inlineTokens(R)}}const y=b.slice(2,-2);return{type:"strong",raw:b,text:y,tokens:this.lexer.inlineTokens(y)}}}}codespan(e){const t=this.rules.inline.code.exec(e);if(t){let n=t[2].replace(/\n/g," ");const s=/[^ ]/.test(n),i=/^ /.test(n)&&/ $/.test(n);return s&&i&&(n=n.substring(1,n.length-1)),n=K(n,!0),{type:"codespan",raw:t[0],text:n}}}br(e){const t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e){const t=this.rules.inline.del.exec(e);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e){const t=this.rules.inline.autolink.exec(e);if(t){let n,s;return t[2]==="@"?(n=K(t[1]),s="mailto:"+n):(n=K(t[1]),s=n),{type:"link",raw:t[0],text:n,href:s,tokens:[{type:"text",raw:n,text:n}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let n,s;if(t[2]==="@")n=K(t[0]),s="mailto:"+n;else{let i;do i=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??"";while(i!==t[0]);n=K(t[0]),t[1]==="www."?s="http://"+t[0]:s=t[0]}return{type:"link",raw:t[0],text:n,href:s,tokens:[{type:"text",raw:n,text:n}]}}}inlineText(e){const t=this.rules.inline.text.exec(e);if(t){let n;return this.lexer.state.inRawBlock?n=t[0]:n=K(t[0]),{type:"text",raw:t[0],text:n}}}}const ds=/^(?: *(?:\n|$))+/,fs=/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,hs=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,Oe=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,gs=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Qt=/(?:[*+-]|\d{1,9}[.)])/,Jt=v(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g,Qt).replace(/blockCode/g,/ {4}/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).getRegex(),ut=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,ms=/^[^\n]+/,pt=/(?!\s*\])(?:\\.|[^\[\]\\])+/,bs=v(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/).replace("label",pt).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),ks=v(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,Qt).getRegex(),Ge="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",dt=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,ys=v("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))","i").replace("comment",dt).replace("tag",Ge).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),en=v(ut).replace("hr",Oe).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Ge).getRegex(),ft={blockquote:v(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",en).getRegex(),code:fs,def:bs,fences:hs,heading:gs,hr:Oe,html:ys,lheading:Jt,list:ks,newline:ds,paragraph:en,table:Re,text:ms},tn=v("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",Oe).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Ge).getRegex(),xs={...ft,table:tn,paragraph:v(ut).replace("hr",Oe).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",tn).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Ge).getRegex()},Ts={...ft,html:v(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",dt).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Re,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:v(ut).replace("hr",Oe).replace("heading",` *#{1,6} *[^
]`).replace("lheading",Jt).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},nn=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,ws=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,sn=/^( {2,}|\\)\n(?!\s*$)/,_s=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Ce="\\p{P}\\p{S}",Es=v(/^((?![*_])[\spunctuation])/,"u").replace(/punctuation/g,Ce).getRegex(),As=/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g,Ss=v(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,"u").replace(/punct/g,Ce).getRegex(),vs=v("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])","gu").replace(/punct/g,Ce).getRegex(),Rs=v("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])","gu").replace(/punct/g,Ce).getRegex(),Is=v(/\\([punct])/,"gu").replace(/punct/g,Ce).getRegex(),Os=v(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Cs=v(dt).replace("(?:-->|$)","-->").getRegex(),Ds=v("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",Cs).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),We=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,Ls=v(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label",We).replace("href",/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),an=v(/^!?\[(label)\]\[(ref)\]/).replace("label",We).replace("ref",pt).getRegex(),rn=v(/^!?\[(ref)\](?:\[\])?/).replace("ref",pt).getRegex(),Ns=v("reflink|nolink(?!\\()","g").replace("reflink",an).replace("nolink",rn).getRegex(),ht={_backpedal:Re,anyPunctuation:Is,autolink:Os,blockSkip:As,br:sn,code:ws,del:Re,emStrongLDelim:Ss,emStrongRDelimAst:vs,emStrongRDelimUnd:Rs,escape:nn,link:Ls,nolink:rn,punctuation:Es,reflink:an,reflinkSearch:Ns,tag:Ds,text:_s,url:Re},Ms={...ht,link:v(/^!?\[(label)\]\((.*?)\)/).replace("label",We).getRegex(),reflink:v(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",We).getRegex()},gt={...ht,escape:v(nn).replace("])","~|])").getRegex(),url:v(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},zs={...gt,br:v(sn).replace("{2,}","*").getRegex(),text:v(gt.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Ye={normal:ft,gfm:xs,pedantic:Ts},De={normal:ht,gfm:gt,breaks:zs,pedantic:Ms};class te{constructor(e){k(this,"tokens");k(this,"options");k(this,"state");k(this,"tokenizer");k(this,"inlineQueue");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||fe,this.options.tokenizer=this.options.tokenizer||new qe,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const t={block:Ye.normal,inline:De.normal};this.options.pedantic?(t.block=Ye.pedantic,t.inline=De.pedantic):this.options.gfm&&(t.block=Ye.gfm,this.options.breaks?t.inline=De.breaks:t.inline=De.gfm),this.tokenizer.rules=t}static get rules(){return{block:Ye,inline:De}}static lex(e,t){return new te(t).lex(e)}static lexInline(e,t){return new te(t).inlineTokens(e)}lex(e){e=e.replace(/\r\n|\r/g,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){const n=this.inlineQueue[t];this.inlineTokens(n.src,n.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){this.options.pedantic?e=e.replace(/\t/g,"    ").replace(/^ +$/gm,""):e=e.replace(/^( *)(\t+)/gm,(c,l,f)=>l+"    ".repeat(f.length));let s,i,o;for(;e;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(c=>(s=c.call({lexer:this},e,t))?(e=e.substring(s.raw.length),t.push(s),!0):!1))){if(s=this.tokenizer.space(e)){e=e.substring(s.raw.length),s.raw.length===1&&t.length>0?t[t.length-1].raw+=`
`:t.push(s);continue}if(s=this.tokenizer.code(e)){e=e.substring(s.raw.length),i=t[t.length-1],i&&(i.type==="paragraph"||i.type==="text")?(i.raw+=`
`+s.raw,i.text+=`
`+s.text,this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(s);continue}if(s=this.tokenizer.fences(e)){e=e.substring(s.raw.length),t.push(s);continue}if(s=this.tokenizer.heading(e)){e=e.substring(s.raw.length),t.push(s);continue}if(s=this.tokenizer.hr(e)){e=e.substring(s.raw.length),t.push(s);continue}if(s=this.tokenizer.blockquote(e)){e=e.substring(s.raw.length),t.push(s);continue}if(s=this.tokenizer.list(e)){e=e.substring(s.raw.length),t.push(s);continue}if(s=this.tokenizer.html(e)){e=e.substring(s.raw.length),t.push(s);continue}if(s=this.tokenizer.def(e)){e=e.substring(s.raw.length),i=t[t.length-1],i&&(i.type==="paragraph"||i.type==="text")?(i.raw+=`
`+s.raw,i.text+=`
`+s.raw,this.inlineQueue[this.inlineQueue.length-1].src=i.text):this.tokens.links[s.tag]||(this.tokens.links[s.tag]={href:s.href,title:s.title});continue}if(s=this.tokenizer.table(e)){e=e.substring(s.raw.length),t.push(s);continue}if(s=this.tokenizer.lheading(e)){e=e.substring(s.raw.length),t.push(s);continue}if(o=e,this.options.extensions&&this.options.extensions.startBlock){let c=1/0;const l=e.slice(1);let f;this.options.extensions.startBlock.forEach(p=>{f=p.call({lexer:this},l),typeof f=="number"&&f>=0&&(c=Math.min(c,f))}),c<1/0&&c>=0&&(o=e.substring(0,c+1))}if(this.state.top&&(s=this.tokenizer.paragraph(o))){i=t[t.length-1],n&&i?.type==="paragraph"?(i.raw+=`
`+s.raw,i.text+=`
`+s.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(s),n=o.length!==e.length,e=e.substring(s.raw.length);continue}if(s=this.tokenizer.text(e)){e=e.substring(s.raw.length),i=t[t.length-1],i&&i.type==="text"?(i.raw+=`
`+s.raw,i.text+=`
`+s.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(s);continue}if(e){const c="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(c);break}else throw new Error(c)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n,s,i,o=e,c,l,f;if(this.tokens.links){const p=Object.keys(this.tokens.links);if(p.length>0)for(;(c=this.tokenizer.rules.inline.reflinkSearch.exec(o))!=null;)p.includes(c[0].slice(c[0].lastIndexOf("[")+1,-1))&&(o=o.slice(0,c.index)+"["+"a".repeat(c[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(c=this.tokenizer.rules.inline.blockSkip.exec(o))!=null;)o=o.slice(0,c.index)+"["+"a".repeat(c[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;(c=this.tokenizer.rules.inline.anyPunctuation.exec(o))!=null;)o=o.slice(0,c.index)+"++"+o.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;e;)if(l||(f=""),l=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(p=>(n=p.call({lexer:this},e,t))?(e=e.substring(n.raw.length),t.push(n),!0):!1))){if(n=this.tokenizer.escape(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.tag(e)){e=e.substring(n.raw.length),s=t[t.length-1],s&&n.type==="text"&&s.type==="text"?(s.raw+=n.raw,s.text+=n.text):t.push(n);continue}if(n=this.tokenizer.link(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(n.raw.length),s=t[t.length-1],s&&n.type==="text"&&s.type==="text"?(s.raw+=n.raw,s.text+=n.text):t.push(n);continue}if(n=this.tokenizer.emStrong(e,o,f)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.codespan(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.br(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.del(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.autolink(e)){e=e.substring(n.raw.length),t.push(n);continue}if(!this.state.inLink&&(n=this.tokenizer.url(e))){e=e.substring(n.raw.length),t.push(n);continue}if(i=e,this.options.extensions&&this.options.extensions.startInline){let p=1/0;const h=e.slice(1);let g;this.options.extensions.startInline.forEach(b=>{g=b.call({lexer:this},h),typeof g=="number"&&g>=0&&(p=Math.min(p,g))}),p<1/0&&p>=0&&(i=e.substring(0,p+1))}if(n=this.tokenizer.inlineText(i)){e=e.substring(n.raw.length),n.raw.slice(-1)!=="_"&&(f=n.raw.slice(-1)),l=!0,s=t[t.length-1],s&&s.type==="text"?(s.raw+=n.raw,s.text+=n.text):t.push(n);continue}if(e){const p="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(p);break}else throw new Error(p)}}return t}}class Ze{constructor(e){k(this,"options");k(this,"parser");this.options=e||fe}space(e){return""}code({text:e,lang:t,escaped:n}){const s=(t||"").match(/^\S*/)?.[0],i=e.replace(/\n$/,"")+`
`;return s?'<pre><code class="language-'+K(s)+'">'+(n?i:K(i,!0))+`</code></pre>
`:"<pre><code>"+(n?i:K(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){const t=e.ordered,n=e.start;let s="";for(let c=0;c<e.items.length;c++){const l=e.items[c];s+=this.listitem(l)}const i=t?"ol":"ul",o=t&&n!==1?' start="'+n+'"':"";return"<"+i+o+`>
`+s+"</"+i+`>
`}listitem(e){let t="";if(e.task){const n=this.checkbox({checked:!!e.checked});e.loose?e.tokens.length>0&&e.tokens[0].type==="paragraph"?(e.tokens[0].text=n+" "+e.tokens[0].text,e.tokens[0].tokens&&e.tokens[0].tokens.length>0&&e.tokens[0].tokens[0].type==="text"&&(e.tokens[0].tokens[0].text=n+" "+e.tokens[0].tokens[0].text)):e.tokens.unshift({type:"text",raw:n+" ",text:n+" "}):t+=n+" "}return t+=this.parser.parse(e.tokens,!!e.loose),`<li>${t}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t="",n="";for(let i=0;i<e.header.length;i++)n+=this.tablecell(e.header[i]);t+=this.tablerow({text:n});let s="";for(let i=0;i<e.rows.length;i++){const o=e.rows[i];n="";for(let c=0;c<o.length;c++)n+=this.tablecell(o[c]);s+=this.tablerow({text:n})}return s&&(s=`<tbody>${s}</tbody>`),`<table>
<thead>
`+t+`</thead>
`+s+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){const t=this.parser.parseInline(e.tokens),n=e.header?"th":"td";return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${e}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){const s=this.parser.parseInline(n),i=Xt(e);if(i===null)return s;e=i;let o='<a href="'+e+'"';return t&&(o+=' title="'+t+'"'),o+=">"+s+"</a>",o}image({href:e,title:t,text:n}){const s=Xt(e);if(s===null)return n;e=s;let i=`<img src="${e}" alt="${n}"`;return t&&(i+=` title="${t}"`),i+=">",i}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):e.text}}class mt{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}}class ne{constructor(e){k(this,"options");k(this,"renderer");k(this,"textRenderer");this.options=e||fe,this.options.renderer=this.options.renderer||new Ze,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new mt}static parse(e,t){return new ne(t).parse(e)}static parseInline(e,t){return new ne(t).parseInline(e)}parse(e,t=!0){let n="";for(let s=0;s<e.length;s++){const i=e[s];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){const c=i,l=this.options.extensions.renderers[c.type].call({parser:this},c);if(l!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(c.type)){n+=l||"";continue}}const o=i;switch(o.type){case"space":{n+=this.renderer.space(o);continue}case"hr":{n+=this.renderer.hr(o);continue}case"heading":{n+=this.renderer.heading(o);continue}case"code":{n+=this.renderer.code(o);continue}case"table":{n+=this.renderer.table(o);continue}case"blockquote":{n+=this.renderer.blockquote(o);continue}case"list":{n+=this.renderer.list(o);continue}case"html":{n+=this.renderer.html(o);continue}case"paragraph":{n+=this.renderer.paragraph(o);continue}case"text":{let c=o,l=this.renderer.text(c);for(;s+1<e.length&&e[s+1].type==="text";)c=e[++s],l+=`
`+this.renderer.text(c);t?n+=this.renderer.paragraph({type:"paragraph",raw:l,text:l,tokens:[{type:"text",raw:l,text:l}]}):n+=l;continue}default:{const c='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(c),"";throw new Error(c)}}}return n}parseInline(e,t){t=t||this.renderer;let n="";for(let s=0;s<e.length;s++){const i=e[s];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){const c=this.options.extensions.renderers[i.type].call({parser:this},i);if(c!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){n+=c||"";continue}}const o=i;switch(o.type){case"escape":{n+=t.text(o);break}case"html":{n+=t.html(o);break}case"link":{n+=t.link(o);break}case"image":{n+=t.image(o);break}case"strong":{n+=t.strong(o);break}case"em":{n+=t.em(o);break}case"codespan":{n+=t.codespan(o);break}case"br":{n+=t.br(o);break}case"del":{n+=t.del(o);break}case"text":{n+=t.text(o);break}default:{const c='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(c),"";throw new Error(c)}}}return n}}class Le{constructor(e){k(this,"options");this.options=e||fe}preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}}k(Le,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens"]));class Ps{constructor(...e){ts(this,le);k(this,"defaults",ct());k(this,"options",this.setOptions);k(this,"parse",je(this,le,qt).call(this,te.lex,ne.parse));k(this,"parseInline",je(this,le,qt).call(this,te.lexInline,ne.parseInline));k(this,"Parser",ne);k(this,"Renderer",Ze);k(this,"TextRenderer",mt);k(this,"Lexer",te);k(this,"Tokenizer",qe);k(this,"Hooks",Le);this.use(...e)}walkTokens(e,t){let n=[];for(const s of e)switch(n=n.concat(t.call(this,s)),s.type){case"table":{const i=s;for(const o of i.header)n=n.concat(this.walkTokens(o.tokens,t));for(const o of i.rows)for(const c of o)n=n.concat(this.walkTokens(c.tokens,t));break}case"list":{const i=s;n=n.concat(this.walkTokens(i.items,t));break}default:{const i=s;this.defaults.extensions?.childTokens?.[i.type]?this.defaults.extensions.childTokens[i.type].forEach(o=>{const c=i[o].flat(1/0);n=n.concat(this.walkTokens(c,t))}):i.tokens&&(n=n.concat(this.walkTokens(i.tokens,t)))}}return n}use(...e){const t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(n=>{const s={...n};if(s.async=this.defaults.async||s.async||!1,n.extensions&&(n.extensions.forEach(i=>{if(!i.name)throw new Error("extension name required");if("renderer"in i){const o=t.renderers[i.name];o?t.renderers[i.name]=function(...c){let l=i.renderer.apply(this,c);return l===!1&&(l=o.apply(this,c)),l}:t.renderers[i.name]=i.renderer}if("tokenizer"in i){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");const o=t[i.level];o?o.unshift(i.tokenizer):t[i.level]=[i.tokenizer],i.start&&(i.level==="block"?t.startBlock?t.startBlock.push(i.start):t.startBlock=[i.start]:i.level==="inline"&&(t.startInline?t.startInline.push(i.start):t.startInline=[i.start]))}"childTokens"in i&&i.childTokens&&(t.childTokens[i.name]=i.childTokens)}),s.extensions=t),n.renderer){const i=this.defaults.renderer||new Ze(this.defaults);for(const o in n.renderer){if(!(o in i))throw new Error(`renderer '${o}' does not exist`);if(["options","parser"].includes(o))continue;const c=o;let l=n.renderer[c];n.useNewRenderer||(l=je(this,le,ns).call(this,l,c,i));const f=i[c];i[c]=(...p)=>{let h=l.apply(i,p);return h===!1&&(h=f.apply(i,p)),h||""}}s.renderer=i}if(n.tokenizer){const i=this.defaults.tokenizer||new qe(this.defaults);for(const o in n.tokenizer){if(!(o in i))throw new Error(`tokenizer '${o}' does not exist`);if(["options","rules","lexer"].includes(o))continue;const c=o,l=n.tokenizer[c],f=i[c];i[c]=(...p)=>{let h=l.apply(i,p);return h===!1&&(h=f.apply(i,p)),h}}s.tokenizer=i}if(n.hooks){const i=this.defaults.hooks||new Le;for(const o in n.hooks){if(!(o in i))throw new Error(`hook '${o}' does not exist`);if(o==="options")continue;const c=o,l=n.hooks[c],f=i[c];Le.passThroughHooks.has(o)?i[c]=p=>{if(this.defaults.async)return Promise.resolve(l.call(i,p)).then(g=>f.call(i,g));const h=l.call(i,p);return f.call(i,h)}:i[c]=(...p)=>{let h=l.apply(i,p);return h===!1&&(h=f.apply(i,p)),h}}s.hooks=i}if(n.walkTokens){const i=this.defaults.walkTokens,o=n.walkTokens;s.walkTokens=function(c){let l=[];return l.push(o.call(this,c)),i&&(l=l.concat(i.call(this,c))),l}}this.defaults={...this.defaults,...s}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return te.lex(e,t??this.defaults)}parser(e,t){return ne.parse(e,t??this.defaults)}}le=new WeakSet,ns=function(e,t,n){switch(t){case"heading":return function(s){return!s.type||s.type!==t?e.apply(this,arguments):e.call(this,n.parser.parseInline(s.tokens),s.depth,ls(n.parser.parseInline(s.tokens,n.parser.textRenderer)))};case"code":return function(s){return!s.type||s.type!==t?e.apply(this,arguments):e.call(this,s.text,s.lang,!!s.escaped)};case"table":return function(s){if(!s.type||s.type!==t)return e.apply(this,arguments);let i="",o="";for(let l=0;l<s.header.length;l++)o+=this.tablecell({text:s.header[l].text,tokens:s.header[l].tokens,header:!0,align:s.align[l]});i+=this.tablerow({text:o});let c="";for(let l=0;l<s.rows.length;l++){const f=s.rows[l];o="";for(let p=0;p<f.length;p++)o+=this.tablecell({text:f[p].text,tokens:f[p].tokens,header:!1,align:s.align[p]});c+=this.tablerow({text:o})}return e.call(this,i,c)};case"blockquote":return function(s){if(!s.type||s.type!==t)return e.apply(this,arguments);const i=this.parser.parse(s.tokens);return e.call(this,i)};case"list":return function(s){if(!s.type||s.type!==t)return e.apply(this,arguments);const i=s.ordered,o=s.start,c=s.loose;let l="";for(let f=0;f<s.items.length;f++){const p=s.items[f],h=p.checked,g=p.task;let b="";if(p.task){const y=this.checkbox({checked:!!h});c?p.tokens.length>0&&p.tokens[0].type==="paragraph"?(p.tokens[0].text=y+" "+p.tokens[0].text,p.tokens[0].tokens&&p.tokens[0].tokens.length>0&&p.tokens[0].tokens[0].type==="text"&&(p.tokens[0].tokens[0].text=y+" "+p.tokens[0].tokens[0].text)):p.tokens.unshift({type:"text",text:y+" "}):b+=y+" "}b+=this.parser.parse(p.tokens,c),l+=this.listitem({type:"list_item",raw:b,text:b,task:g,checked:!!h,loose:c,tokens:p.tokens})}return e.call(this,l,i,o)};case"html":return function(s){return!s.type||s.type!==t?e.apply(this,arguments):e.call(this,s.text,s.block)};case"paragraph":return function(s){return!s.type||s.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(s.tokens))};case"escape":return function(s){return!s.type||s.type!==t?e.apply(this,arguments):e.call(this,s.text)};case"link":return function(s){return!s.type||s.type!==t?e.apply(this,arguments):e.call(this,s.href,s.title,this.parser.parseInline(s.tokens))};case"image":return function(s){return!s.type||s.type!==t?e.apply(this,arguments):e.call(this,s.href,s.title,s.text)};case"strong":return function(s){return!s.type||s.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(s.tokens))};case"em":return function(s){return!s.type||s.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(s.tokens))};case"codespan":return function(s){return!s.type||s.type!==t?e.apply(this,arguments):e.call(this,s.text)};case"del":return function(s){return!s.type||s.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(s.tokens))};case"text":return function(s){return!s.type||s.type!==t?e.apply(this,arguments):e.call(this,s.text)}}return e},qt=function(e,t){return(n,s)=>{const i={...s},o={...this.defaults,...i};this.defaults.async===!0&&i.async===!1&&(o.silent||console.warn("marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored."),o.async=!0);const c=je(this,le,ss).call(this,!!o.silent,!!o.async);if(typeof n>"u"||n===null)return c(new Error("marked(): input parameter is undefined or null"));if(typeof n!="string")return c(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(n)+", string expected"));if(o.hooks&&(o.hooks.options=o),o.async)return Promise.resolve(o.hooks?o.hooks.preprocess(n):n).then(l=>e(l,o)).then(l=>o.hooks?o.hooks.processAllTokens(l):l).then(l=>o.walkTokens?Promise.all(this.walkTokens(l,o.walkTokens)).then(()=>l):l).then(l=>t(l,o)).then(l=>o.hooks?o.hooks.postprocess(l):l).catch(c);try{o.hooks&&(n=o.hooks.preprocess(n));let l=e(n,o);o.hooks&&(l=o.hooks.processAllTokens(l)),o.walkTokens&&this.walkTokens(l,o.walkTokens);let f=t(l,o);return o.hooks&&(f=o.hooks.postprocess(f)),f}catch(l){return c(l)}}},ss=function(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){const s="<p>An error occurred:</p><pre>"+K(n.message+"",!0)+"</pre>";return t?Promise.resolve(s):s}if(t)return Promise.reject(n);throw n}};const he=new Ps;function S(a,e){return he.parse(a,e)}S.options=S.setOptions=function(a){return he.setOptions(a),S.defaults=he.defaults,Gt(S.defaults),S},S.getDefaults=ct,S.defaults=fe,S.use=function(...a){return he.use(...a),S.defaults=he.defaults,Gt(S.defaults),S},S.walkTokens=function(a,e){return he.walkTokens(a,e)},S.parseInline=he.parseInline,S.Parser=ne,S.parser=ne.parse,S.Renderer=Ze,S.TextRenderer=mt,S.Lexer=te,S.lexer=te.lex,S.Tokenizer=qe,S.Hooks=Le,S.parse=S,S.options,S.setOptions,S.use,S.walkTokens,S.parseInline,ne.parse,te.lex;/*! @license DOMPurify 3.4.9 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.9/LICENSE */function on(a,e){(e==null||e>a.length)&&(e=a.length);for(var t=0,n=Array(e);t<e;t++)n[t]=a[t];return n}function $s(a){if(Array.isArray(a))return a}function Bs(a,e){var t=a==null?null:typeof Symbol<"u"&&a[Symbol.iterator]||a["@@iterator"];if(t!=null){var n,s,i,o,c=[],l=!0,f=!1;try{if(i=(t=t.call(a)).next,e!==0)for(;!(l=(n=i.call(t)).done)&&(c.push(n.value),c.length!==e);l=!0);}catch(p){f=!0,s=p}finally{try{if(!l&&t.return!=null&&(o=t.return(),Object(o)!==o))return}finally{if(f)throw s}}return c}}function Us(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Fs(a,e){return $s(a)||Bs(a,e)||Hs(a,e)||Us()}function Hs(a,e){if(a){if(typeof a=="string")return on(a,e);var t={}.toString.call(a).slice(8,-1);return t==="Object"&&a.constructor&&(t=a.constructor.name),t==="Map"||t==="Set"?Array.from(a):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?on(a,e):void 0}}const ln=Object.entries,cn=Object.setPrototypeOf,js=Object.isFrozen,qs=Object.getPrototypeOf,Gs=Object.getOwnPropertyDescriptor;let W=Object.freeze,V=Object.seal,ye=Object.create,un=typeof Reflect<"u"&&Reflect,bt=un.apply,kt=un.construct;W||(W=function(e){return e}),V||(V=function(e){return e}),bt||(bt=function(e,t){for(var n=arguments.length,s=new Array(n>2?n-2:0),i=2;i<n;i++)s[i-2]=arguments[i];return e.apply(t,s)}),kt||(kt=function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),s=1;s<t;s++)n[s-1]=arguments[s];return new e(...n)});const oe=$(Array.prototype.forEach),Ws=$(Array.prototype.lastIndexOf),pn=$(Array.prototype.pop),xe=$(Array.prototype.push),Ys=$(Array.prototype.splice),Y=Array.isArray,Ne=$(String.prototype.toLowerCase),yt=$(String.prototype.toString),dn=$(String.prototype.match),Te=$(String.prototype.replace),fn=$(String.prototype.indexOf),Zs=$(String.prototype.trim),Xs=$(Number.prototype.toString),Ks=$(Boolean.prototype.toString),hn=typeof BigInt>"u"?null:$(BigInt.prototype.toString),gn=typeof Symbol>"u"?null:$(Symbol.prototype.toString),C=$(Object.prototype.hasOwnProperty),Me=$(Object.prototype.toString),H=$(RegExp.prototype.test),ge=Vs(TypeError);function $(a){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var t=arguments.length,n=new Array(t>1?t-1:0),s=1;s<t;s++)n[s-1]=arguments[s];return bt(a,e,n)}}function Vs(a){return function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return kt(a,t)}}function w(a,e){let t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:Ne;if(cn&&cn(a,null),!Y(e))return a;let n=e.length;for(;n--;){let s=e[n];if(typeof s=="string"){const i=t(s);i!==s&&(js(e)||(e[n]=i),s=i)}a[s]=!0}return a}function Qs(a){for(let e=0;e<a.length;e++)C(a,e)||(a[e]=null);return a}function q(a){const e=ye(null);for(const n of ln(a)){var t=Fs(n,2);const s=t[0],i=t[1];C(a,s)&&(Y(i)?e[s]=Qs(i):i&&typeof i=="object"&&i.constructor===Object?e[s]=q(i):e[s]=i)}return e}function Js(a){switch(typeof a){case"string":return a;case"number":return Xs(a);case"boolean":return Ks(a);case"bigint":return hn?hn(a):"0";case"symbol":return gn?gn(a):"Symbol()";case"undefined":return Me(a);case"function":case"object":{if(a===null)return Me(a);const e=a,t=se(e,"toString");if(typeof t=="function"){const n=t(e);return typeof n=="string"?n:Me(n)}return Me(a)}default:return Me(a)}}function se(a,e){for(;a!==null;){const n=Gs(a,e);if(n){if(n.get)return $(n.get);if(typeof n.value=="function")return $(n.value)}a=qs(a)}function t(){return null}return t}function ei(a){try{return H(a,""),!0}catch{return!1}}const mn=W(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),xt=W(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),Tt=W(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),ti=W(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),wt=W(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),ni=W(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),bn=W(["#text"]),kn=W(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),_t=W(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),yn=W(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),Xe=W(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),si=V(/{{[\w\W]*|^[\w\W]*}}/g),ii=V(/<%[\w\W]*|^[\w\W]*%>/g),ai=V(/\${[\w\W]*/g),ri=V(/^data-[\-\w.\u00B7-\uFFFF]+$/),oi=V(/^aria-[\-\w]+$/),xn=V(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),li=V(/^(?:\w+script|data):/i),ci=V(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),ui=V(/^html$/i),pi=V(/^[a-z][.\w]*(-[.\w]+)+$/i),ie={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,progressingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},di=function(){return typeof window>"u"?null:window},fi=function(e,t){if(typeof e!="object"||typeof e.createPolicy!="function")return null;let n=null;const s="data-tt-policy-suffix";t&&t.hasAttribute(s)&&(n=t.getAttribute(s));const i="dompurify"+(n?"#"+n:"");try{return e.createPolicy(i,{createHTML(o){return o},createScriptURL(o){return o}})}catch{return console.warn("TrustedTypes policy "+i+" could not be created."),null}},Tn=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function wn(){let a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:di();const e=m=>wn(m);if(e.version="3.4.9",e.removed=[],!a||!a.document||a.document.nodeType!==ie.document||!a.Element)return e.isSupported=!1,e;let t=a.document;const n=t,s=n.currentScript;a.DocumentFragment;const i=a.HTMLTemplateElement,o=a.Node,c=a.Element,l=a.NodeFilter,f=a.NamedNodeMap;f===void 0&&(a.NamedNodeMap||a.MozNamedAttrMap),a.HTMLFormElement;const p=a.DOMParser,h=a.trustedTypes,g=c.prototype,b=se(g,"cloneNode"),y=se(g,"remove"),R=se(g,"nextSibling"),E=se(g,"childNodes"),j=se(g,"parentNode"),Q=se(g,"shadowRoot"),A=se(g,"attributes"),G=o&&o.prototype?se(o.prototype,"nodeType"):null,J=o&&o.prototype?se(o.prototype,"nodeName"):null;if(typeof i=="function"){const m=t.createElement("template");m.content&&m.content.ownerDocument&&(t=m.content.ownerDocument)}let Z,me="",St,Rn=!1,$e=0;const In=function(){if($e>0)throw ge('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')},we=function(r){In(),$e++;try{return Z.createHTML(r)}finally{$e--}},Ui=function(r){In(),$e++;try{return Z.createScriptURL(r)}finally{$e--}},Fi=function(){return Rn||(St=fi(h,s),Rn=!0),St},Qe=t,vt=Qe.implementation,On=Qe.createNodeIterator,Hi=Qe.createDocumentFragment,ji=Qe.getElementsByTagName,qi=n.importNode;let U=Tn();e.isSupported=typeof ln=="function"&&typeof j=="function"&&vt&&vt.createHTMLDocument!==void 0;const Je=si,et=ii,tt=ai,Gi=ri,Wi=oi,Yi=li,Cn=ci,Zi=pi;let Dn=xn,N=null;const Rt=w({},[...mn,...xt,...Tt,...wt,...bn]);let M=null;const It=w({},[...kn,..._t,...yn,...Xe]);let z=Object.seal(ye(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Be=null,nt=null;const ue=Object.seal(ye(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let Ln=!0,Ot=!0,Nn=!1,Mn=!0,pe=!1,Ue=!0,be=!1,Ct=!1,Dt=!1,_e=!1,st=!1,it=!1,zn=!0,Pn=!1;const $n="user-content-";let Lt=!0,Nt=!1,Ee={},ae=null;const Mt=w({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]);let Bn=null;const Un=w({},["audio","video","img","source","image","track"]);let zt=null;const Fn=w({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),at="http://www.w3.org/1998/Math/MathML",rt="http://www.w3.org/2000/svg",re="http://www.w3.org/1999/xhtml";let Ae=re,Pt=!1,$t=null;const Xi=w({},[at,rt,re],yt);let Bt=w({},["mi","mo","mn","ms","mtext"]),Ut=w({},["annotation-xml"]);const Ki=w({},["title","style","font","a","script"]);let Fe=null;const Vi=["application/xhtml+xml","text/html"],Qi="text/html";let D=null,Se=null;const Ji=t.createElement("form"),Hn=function(r){return r instanceof RegExp||r instanceof Function},Ft=function(){let r=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(Se&&Se===r)return;(!r||typeof r!="object")&&(r={}),r=q(r),Fe=Vi.indexOf(r.PARSER_MEDIA_TYPE)===-1?Qi:r.PARSER_MEDIA_TYPE,D=Fe==="application/xhtml+xml"?yt:Ne,N=C(r,"ALLOWED_TAGS")&&Y(r.ALLOWED_TAGS)?w({},r.ALLOWED_TAGS,D):Rt,M=C(r,"ALLOWED_ATTR")&&Y(r.ALLOWED_ATTR)?w({},r.ALLOWED_ATTR,D):It,$t=C(r,"ALLOWED_NAMESPACES")&&Y(r.ALLOWED_NAMESPACES)?w({},r.ALLOWED_NAMESPACES,yt):Xi,zt=C(r,"ADD_URI_SAFE_ATTR")&&Y(r.ADD_URI_SAFE_ATTR)?w(q(Fn),r.ADD_URI_SAFE_ATTR,D):Fn,Bn=C(r,"ADD_DATA_URI_TAGS")&&Y(r.ADD_DATA_URI_TAGS)?w(q(Un),r.ADD_DATA_URI_TAGS,D):Un,ae=C(r,"FORBID_CONTENTS")&&Y(r.FORBID_CONTENTS)?w({},r.FORBID_CONTENTS,D):Mt,Be=C(r,"FORBID_TAGS")&&Y(r.FORBID_TAGS)?w({},r.FORBID_TAGS,D):q({}),nt=C(r,"FORBID_ATTR")&&Y(r.FORBID_ATTR)?w({},r.FORBID_ATTR,D):q({}),Ee=C(r,"USE_PROFILES")?r.USE_PROFILES&&typeof r.USE_PROFILES=="object"?q(r.USE_PROFILES):r.USE_PROFILES:!1,Ln=r.ALLOW_ARIA_ATTR!==!1,Ot=r.ALLOW_DATA_ATTR!==!1,Nn=r.ALLOW_UNKNOWN_PROTOCOLS||!1,Mn=r.ALLOW_SELF_CLOSE_IN_ATTR!==!1,pe=r.SAFE_FOR_TEMPLATES||!1,Ue=r.SAFE_FOR_XML!==!1,be=r.WHOLE_DOCUMENT||!1,_e=r.RETURN_DOM||!1,st=r.RETURN_DOM_FRAGMENT||!1,it=r.RETURN_TRUSTED_TYPE||!1,Dt=r.FORCE_BODY||!1,zn=r.SANITIZE_DOM!==!1,Pn=r.SANITIZE_NAMED_PROPS||!1,Lt=r.KEEP_CONTENT!==!1,Nt=r.IN_PLACE||!1,Dn=ei(r.ALLOWED_URI_REGEXP)?r.ALLOWED_URI_REGEXP:xn,Ae=typeof r.NAMESPACE=="string"?r.NAMESPACE:re,Bt=C(r,"MATHML_TEXT_INTEGRATION_POINTS")&&r.MATHML_TEXT_INTEGRATION_POINTS&&typeof r.MATHML_TEXT_INTEGRATION_POINTS=="object"?q(r.MATHML_TEXT_INTEGRATION_POINTS):w({},["mi","mo","mn","ms","mtext"]),Ut=C(r,"HTML_INTEGRATION_POINTS")&&r.HTML_INTEGRATION_POINTS&&typeof r.HTML_INTEGRATION_POINTS=="object"?q(r.HTML_INTEGRATION_POINTS):w({},["annotation-xml"]);const u=C(r,"CUSTOM_ELEMENT_HANDLING")&&r.CUSTOM_ELEMENT_HANDLING&&typeof r.CUSTOM_ELEMENT_HANDLING=="object"?q(r.CUSTOM_ELEMENT_HANDLING):ye(null);if(z=ye(null),C(u,"tagNameCheck")&&Hn(u.tagNameCheck)&&(z.tagNameCheck=u.tagNameCheck),C(u,"attributeNameCheck")&&Hn(u.attributeNameCheck)&&(z.attributeNameCheck=u.attributeNameCheck),C(u,"allowCustomizedBuiltInElements")&&typeof u.allowCustomizedBuiltInElements=="boolean"&&(z.allowCustomizedBuiltInElements=u.allowCustomizedBuiltInElements),pe&&(Ot=!1),st&&(_e=!0),Ee&&(N=w({},bn),M=ye(null),Ee.html===!0&&(w(N,mn),w(M,kn)),Ee.svg===!0&&(w(N,xt),w(M,_t),w(M,Xe)),Ee.svgFilters===!0&&(w(N,Tt),w(M,_t),w(M,Xe)),Ee.mathMl===!0&&(w(N,wt),w(M,yn),w(M,Xe))),ue.tagCheck=null,ue.attributeCheck=null,C(r,"ADD_TAGS")&&(typeof r.ADD_TAGS=="function"?ue.tagCheck=r.ADD_TAGS:Y(r.ADD_TAGS)&&(N===Rt&&(N=q(N)),w(N,r.ADD_TAGS,D))),C(r,"ADD_ATTR")&&(typeof r.ADD_ATTR=="function"?ue.attributeCheck=r.ADD_ATTR:Y(r.ADD_ATTR)&&(M===It&&(M=q(M)),w(M,r.ADD_ATTR,D))),C(r,"ADD_URI_SAFE_ATTR")&&Y(r.ADD_URI_SAFE_ATTR)&&w(zt,r.ADD_URI_SAFE_ATTR,D),C(r,"FORBID_CONTENTS")&&Y(r.FORBID_CONTENTS)&&(ae===Mt&&(ae=q(ae)),w(ae,r.FORBID_CONTENTS,D)),C(r,"ADD_FORBID_CONTENTS")&&Y(r.ADD_FORBID_CONTENTS)&&(ae===Mt&&(ae=q(ae)),w(ae,r.ADD_FORBID_CONTENTS,D)),Lt&&(N["#text"]=!0),be&&w(N,["html","head","body"]),N.table&&(w(N,["tbody"]),delete Be.tbody),r.TRUSTED_TYPES_POLICY){if(typeof r.TRUSTED_TYPES_POLICY.createHTML!="function")throw ge('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof r.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw ge('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');const d=Z;Z=r.TRUSTED_TYPES_POLICY;try{me=we("")}catch(x){throw Z=d,x}}else r.TRUSTED_TYPES_POLICY===null?(Z=void 0,me=""):(Z===void 0&&(Z=Fi()),Z&&typeof me=="string"&&(me=we("")));(U.uponSanitizeElement.length>0||U.uponSanitizeAttribute.length>0)&&N===Rt&&(N=q(N)),U.uponSanitizeAttribute.length>0&&M===It&&(M=q(M)),W&&W(r),Se=r},jn=w({},[...xt,...Tt,...ti]),qn=w({},[...wt,...ni]),ea=function(r){let u=j(r);(!u||!u.tagName)&&(u={namespaceURI:Ae,tagName:"template"});const d=Ne(r.tagName),x=Ne(u.tagName);return $t[r.namespaceURI]?r.namespaceURI===rt?u.namespaceURI===re?d==="svg":u.namespaceURI===at?d==="svg"&&(x==="annotation-xml"||Bt[x]):!!jn[d]:r.namespaceURI===at?u.namespaceURI===re?d==="math":u.namespaceURI===rt?d==="math"&&Ut[x]:!!qn[d]:r.namespaceURI===re?u.namespaceURI===rt&&!Ut[x]||u.namespaceURI===at&&!Bt[x]?!1:!qn[d]&&(Ki[d]||!jn[d]):!!(Fe==="application/xhtml+xml"&&$t[r.namespaceURI]):!1},ee=function(r){xe(e.removed,{element:r});try{j(r).removeChild(r)}catch{if(y(r),!j(r))throw ge("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")}},Gn=function(r){const u=E?E(r):r.childNodes;if(u){const x=[];oe(u,T=>{xe(x,T)}),oe(x,T=>{try{y(T)}catch{}})}const d=A?A(r):null;if(d)for(let x=d.length-1;x>=0;--x){const T=d[x],_=T&&T.name;if(typeof _=="string")try{r.removeAttribute(_)}catch{}}},ke=function(r,u){try{xe(e.removed,{attribute:u.getAttributeNode(r),from:u})}catch{xe(e.removed,{attribute:null,from:u})}if(u.removeAttribute(r),r==="is")if(_e||st)try{ee(u)}catch{}else try{u.setAttribute(r,"")}catch{}},ta=function(r){const u=A?A(r):r.attributes;if(u)for(let d=u.length-1;d>=0;--d){const x=u[d],T=x&&x.name;if(!(typeof T!="string"||M[D(T)]))try{r.removeAttribute(T)}catch{}}},na=function(r){const u=[r];for(;u.length>0;){const d=u.pop();(G?G(d):d.nodeType)===ie.element&&ta(d);const T=E?E(d):d.childNodes;if(T)for(let _=T.length-1;_>=0;--_)u.push(T[_])}},Wn=function(r){let u=null,d=null;if(Dt)r="<remove></remove>"+r;else{const _=dn(r,/^[\r\n\t ]+/);d=_&&_[0]}Fe==="application/xhtml+xml"&&Ae===re&&(r='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+r+"</body></html>");const x=Z?we(r):r;if(Ae===re)try{u=new p().parseFromString(x,Fe)}catch{}if(!u||!u.documentElement){u=vt.createDocument(Ae,"template",null);try{u.documentElement.innerHTML=Pt?me:x}catch{}}const T=u.body||u.documentElement;return r&&d&&T.insertBefore(t.createTextNode(d),T.childNodes[0]||null),Ae===re?ji.call(u,be?"html":"body")[0]:be?u.documentElement:T},Yn=function(r){return On.call(r.ownerDocument||r,r,l.SHOW_ELEMENT|l.SHOW_COMMENT|l.SHOW_TEXT|l.SHOW_PROCESSING_INSTRUCTION|l.SHOW_CDATA_SECTION,null)},Ht=function(r){var u,d;r.normalize();const x=On.call(r.ownerDocument||r,r,l.SHOW_TEXT|l.SHOW_COMMENT|l.SHOW_CDATA_SECTION|l.SHOW_PROCESSING_INSTRUCTION,null);let T=x.nextNode();for(;T;){let B=T.data;oe([Je,et,tt],I=>{B=Te(B,I," ")}),T.data=B,T=x.nextNode()}const _=(u=(d=r.querySelectorAll)===null||d===void 0?void 0:d.call(r,"template"))!==null&&u!==void 0?u:[];oe(Array.from(_),B=>{ve(B.content)&&Ht(B.content)})},ot=function(r){const u=J?J(r):null;return typeof u!="string"||D(u)!=="form"?!1:typeof r.nodeName!="string"||typeof r.textContent!="string"||typeof r.removeChild!="function"||r.attributes!==A(r)||typeof r.removeAttribute!="function"||typeof r.setAttribute!="function"||typeof r.namespaceURI!="string"||typeof r.insertBefore!="function"||typeof r.hasChildNodes!="function"||r.nodeType!==G(r)||r.childNodes!==E(r)},ve=function(r){if(!G||typeof r!="object"||r===null)return!1;try{return G(r)===ie.documentFragment}catch{return!1}},He=function(r){if(!G||typeof r!="object"||r===null)return!1;try{return typeof G(r)=="number"}catch{return!1}};function ce(m,r,u){oe(m,d=>{d.call(e,r,u,Se)})}const Zn=function(r){let u=null;if(ce(U.beforeSanitizeElements,r,null),ot(r))return ee(r),!0;const d=D(J?J(r):r.nodeName);if(ce(U.uponSanitizeElement,r,{tagName:d,allowedTags:N}),Ue&&r.hasChildNodes()&&!He(r.firstElementChild)&&H(/<[/\w!]/g,r.innerHTML)&&H(/<[/\w!]/g,r.textContent)||Ue&&r.namespaceURI===re&&d==="style"&&He(r.firstElementChild)||r.nodeType===ie.progressingInstruction||Ue&&r.nodeType===ie.comment&&H(/<[/\w]/g,r.data))return ee(r),!0;if(Be[d]||!(ue.tagCheck instanceof Function&&ue.tagCheck(d))&&!N[d]){if(!Be[d]&&Kn(d)&&(z.tagNameCheck instanceof RegExp&&H(z.tagNameCheck,d)||z.tagNameCheck instanceof Function&&z.tagNameCheck(d)))return!1;if(Lt&&!ae[d]){const T=j(r),_=E(r);if(_&&T){const B=_.length;for(let I=B-1;I>=0;--I){const P=Nt?_[I]:b(_[I],!0);T.insertBefore(P,R(r))}}}return ee(r),!0}return(G?G(r):r.nodeType)===ie.element&&!ea(r)||(d==="noscript"||d==="noembed"||d==="noframes")&&H(/<\/no(script|embed|frames)/i,r.innerHTML)?(ee(r),!0):(pe&&r.nodeType===ie.text&&(u=r.textContent,oe([Je,et,tt],T=>{u=Te(u,T," ")}),r.textContent!==u&&(xe(e.removed,{element:r.cloneNode()}),r.textContent=u)),ce(U.afterSanitizeElements,r,null),!1)},Xn=function(r,u,d){if(nt[u]||zn&&(u==="id"||u==="name")&&(d in t||d in Ji))return!1;const x=M[u]||ue.attributeCheck instanceof Function&&ue.attributeCheck(u,r);if(!(Ot&&!nt[u]&&H(Gi,u))){if(!(Ln&&H(Wi,u))){if(!x||nt[u]){if(!(Kn(r)&&(z.tagNameCheck instanceof RegExp&&H(z.tagNameCheck,r)||z.tagNameCheck instanceof Function&&z.tagNameCheck(r))&&(z.attributeNameCheck instanceof RegExp&&H(z.attributeNameCheck,u)||z.attributeNameCheck instanceof Function&&z.attributeNameCheck(u,r))||u==="is"&&z.allowCustomizedBuiltInElements&&(z.tagNameCheck instanceof RegExp&&H(z.tagNameCheck,d)||z.tagNameCheck instanceof Function&&z.tagNameCheck(d))))return!1}else if(!zt[u]){if(!H(Dn,Te(d,Cn,""))){if(!((u==="src"||u==="xlink:href"||u==="href")&&r!=="script"&&fn(d,"data:")===0&&Bn[r])){if(!(Nn&&!H(Yi,Te(d,Cn,"")))){if(d)return!1}}}}}}return!0},sa=w({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),Kn=function(r){return!sa[Ne(r)]&&H(Zi,r)},Vn=function(r){ce(U.beforeSanitizeAttributes,r,null);const u=r.attributes;if(!u||ot(r))return;const d={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:M,forceKeepAttr:void 0};let x=u.length;for(;x--;){const T=u[x],_=T.name,B=T.namespaceURI,I=T.value,P=D(_),de=I;let F=_==="value"?de:Zs(de);if(d.attrName=P,d.attrValue=F,d.keepAttr=!0,d.forceKeepAttr=void 0,ce(U.uponSanitizeAttribute,r,d),F=d.attrValue,Pn&&(P==="id"||P==="name")&&fn(F,$n)!==0&&(ke(_,r),F=$n+F),Ue&&H(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,F)){ke(_,r);continue}if(P==="attributename"&&dn(F,"href")){ke(_,r);continue}if(d.forceKeepAttr)continue;if(!d.keepAttr){ke(_,r);continue}if(!Mn&&H(/\/>/i,F)){ke(_,r);continue}pe&&oe([Je,et,tt],Jn=>{F=Te(F,Jn," ")});const Qn=D(r.nodeName);if(!Xn(Qn,P,F)){ke(_,r);continue}if(Z&&typeof h=="object"&&typeof h.getAttributeType=="function"&&!B)switch(h.getAttributeType(Qn,P)){case"TrustedHTML":{F=we(F);break}case"TrustedScriptURL":{F=Ui(F);break}}if(F!==de)try{B?r.setAttributeNS(B,_,F):r.setAttribute(_,F),ot(r)?ee(r):pn(e.removed)}catch{ke(_,r)}}ce(U.afterSanitizeAttributes,r,null)},lt=function(r){let u=null;const d=Yn(r);for(ce(U.beforeSanitizeShadowDOM,r,null);u=d.nextNode();)if(ce(U.uponSanitizeShadowNode,u,null),Zn(u),Vn(u),ve(u.content)&&lt(u.content),(G?G(u):u.nodeType)===ie.element){const T=Q?Q(u):u.shadowRoot;ve(T)&&(jt(T),lt(T))}ce(U.afterSanitizeShadowDOM,r,null)},jt=function(r){const u=[{node:r,shadow:null}];for(;u.length>0;){const d=u.pop();if(d.shadow){lt(d.shadow);continue}const x=d.node,_=(G?G(x):x.nodeType)===ie.element,B=E?E(x):x.childNodes;if(B)for(let I=B.length-1;I>=0;--I)u.push({node:B[I],shadow:null});if(_){const I=J?J(x):null;if(typeof I=="string"&&D(I)==="template"){const P=x.content;ve(P)&&u.push({node:P,shadow:null})}}if(_){const I=Q?Q(x):x.shadowRoot;ve(I)&&u.push({node:null,shadow:I},{node:I,shadow:null})}}};return e.sanitize=function(m){let r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},u=null,d=null,x=null,T=null;if(Pt=!m,Pt&&(m="<!-->"),typeof m!="string"&&!He(m)&&(m=Js(m),typeof m!="string"))throw ge("dirty is not a string, aborting");if(!e.isSupported)return m;Ct||Ft(r),e.removed=[];const _=Nt&&typeof m!="string"&&He(m);if(_){const P=J?J(m):m.nodeName;if(typeof P=="string"){const de=D(P);if(!N[de]||Be[de])throw ge("root node is forbidden and cannot be sanitized in-place")}if(ot(m))throw ge("root node is clobbered and cannot be sanitized in-place");try{jt(m)}catch(de){throw Gn(m),de}}else if(He(m))u=Wn("<!---->"),d=u.ownerDocument.importNode(m,!0),d.nodeType===ie.element&&d.nodeName==="BODY"||d.nodeName==="HTML"?u=d:u.appendChild(d),jt(d);else{if(!_e&&!pe&&!be&&m.indexOf("<")===-1)return Z&&it?we(m):m;if(u=Wn(m),!u)return _e?null:it?me:""}u&&Dt&&ee(u.firstChild);const B=Yn(_?m:u);try{for(;x=B.nextNode();)Zn(x),Vn(x),ve(x.content)&&lt(x.content)}catch(P){throw _&&Gn(m),P}if(_)return oe(e.removed,P=>{P.element&&na(P.element)}),pe&&Ht(m),m;if(_e){if(pe&&Ht(u),st)for(T=Hi.call(u.ownerDocument);u.firstChild;)T.appendChild(u.firstChild);else T=u;return(M.shadowroot||M.shadowrootmode)&&(T=qi.call(n,T,!0)),T}let I=be?u.outerHTML:u.innerHTML;return be&&N["!doctype"]&&u.ownerDocument&&u.ownerDocument.doctype&&u.ownerDocument.doctype.name&&H(ui,u.ownerDocument.doctype.name)&&(I="<!DOCTYPE "+u.ownerDocument.doctype.name+`>
`+I),pe&&oe([Je,et,tt],P=>{I=Te(I,P," ")}),Z&&it?we(I):I},e.setConfig=function(){let m=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};Ft(m),Ct=!0},e.clearConfig=function(){Se=null,Ct=!1,Z=St,me=""},e.isValidAttribute=function(m,r,u){Se||Ft({});const d=D(m),x=D(r);return Xn(d,x,u)},e.addHook=function(m,r){typeof r=="function"&&xe(U[m],r)},e.removeHook=function(m,r){if(r!==void 0){const u=Ws(U[m],r);return u===-1?void 0:Ys(U[m],u,1)[0]}return pn(U[m])},e.removeHooks=function(m){U[m]=[]},e.removeAllHooks=function(){U=Tn()},e}var hi=wn();let _n=!1;function gi(){_n||(_n=!0,S.setOptions({gfm:!0,breaks:!0}))}function mi(a){return String(a).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function bi(a){let e=hi.sanitize(a,{ADD_ATTR:["target","rel"]});return e=e.replace(/<a\s+([^>]*?)>/gi,(t,n)=>(/\btarget\s*=/i.test(n)||(n+=' target="_blank"'),/\brel\s*=/i.test(n)||(n+=' rel="noopener noreferrer"'),"<a "+n+">")),e}function ze(a){if(!a)return"";try{gi();const e=S.parse(a,{async:!1});return bi(e)}catch(e){return console.warn("[AIAgent SDK] marked parse failed, fallback:",e),ki(a)}}function ki(a){let e=mi(a);return e=e.replace(/`([^`\n]+)`/g,"<code>$1</code>"),e=e.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\n/g,"<br/>"),e}function Pe(a){if(!a)return;const e=a.querySelectorAll("img");for(let t=0;t<e.length;t++){const n=e[t];if(n.dataset.aiagentDecorated==="1")continue;n.dataset.aiagentDecorated="1",n.setAttribute("loading","lazy"),n.classList.add("aiagent-sdk-img-loading");const s=()=>{n.classList.remove("aiagent-sdk-img-loading"),n.classList.add("aiagent-sdk-img-loaded")};n.complete&&n.naturalWidth>0?s():(n.addEventListener("load",s,{once:!0}),n.addEventListener("error",s,{once:!0}))}}function yi(){const a=document.createElement("div");return a.className="aiagent-sdk-typing",a.innerHTML="<span></span><span></span><span></span>",a}function En(a){const e=yi();return a.appendChild(e),a.scrollTop=a.scrollHeight,e}function An(a){a&&a.classList.add("aiagent-sdk-typing-active")}function Ke(a){a&&a.classList.remove("aiagent-sdk-typing-active")}class xi{constructor(){k(this,"_tools",new Map)}register(e,t){const n=this._tools.get(e)||new Map,s=[];for(const i of t){const o={description:i.description||"",parameters:i.parameters||{type:"object",properties:{}},strict:i.strict!==!1,onCall:typeof i.onCall=="function"?i.onCall:null};n.set(i.name,o),s.push({name:i.name,description:o.description,parameters:o.parameters,strict:o.strict})}return this._tools.set(e,n),s}unregister(e,t){const n=this._tools.get(e);if(n){if(!t||!t.length){n.clear(),this._tools.delete(e);return}for(const s of t)n.delete(s);n.size===0&&this._tools.delete(e)}}get(e,t){const n=this._tools.get(e);return n&&n.get(t)||null}}async function Ti(a,e,t,n){const s=await fetch(a+"/chat/"+encodeURIComponent(t)+"/tools/register",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({tools:n})});if(!s.ok){const i=await s.text();throw new Error("register failed: "+s.status+" "+i)}return await s.json()}async function wi(a,e,t,n){const s=await fetch(a+"/chat/"+encodeURIComponent(t)+"/tools/unregister",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({names:n})});if(!s.ok)throw new Error("unregister failed: "+s.status);return await s.json()}async function _i(a,e,t){const n=await fetch(a+"/chat/"+encodeURIComponent(t)+"/tools",{method:"GET",headers:{Authorization:"Bearer "+e}});if(!n.ok)throw new Error("list failed: "+n.status);return await n.json()}async function Et(a,e,t){if(t){try{await fetch(a+"/chat/"+encodeURIComponent(t)+"/tools/abort",{method:"POST",headers:{Authorization:"Bearer "+e}})}catch(n){console.warn("[AIAgent SDK] abort failed:",n.message)}try{sessionStorage.removeItem("pending:"+t)}catch{}}}async function Ei(a,e,t){if(!e)return;const n=a.getSessionId();if(!n){console.warn("[AIAgent SDK] no sessionId for tool result");return}const s={toolUseId:e,result:t,ts:Date.now()};a.setPending(s);try{sessionStorage.setItem("pending:"+n,JSON.stringify(s))}catch{}let i;try{i=await a.ensureToken()}catch(o){a.appendMsg("system","⚠️ "+o.message),a.setBusy(!1);return}await At(a,e,t,n,i)}async function At(a,e,t,n,s){const i=a.endpoint+"/chat/"+encodeURIComponent(n)+"/tools/result",o=JSON.stringify({toolUseId:e,result:t==null?"[Tool executed by client SDK; no result returned]":typeof t=="string"?t:JSON.stringify(t)}),c={Authorization:"Bearer "+s,"Content-Type":"application/json",Accept:"text/event-stream"},l=4;let f=500,p=0,h=null,g=null;for(;p<l;){g=null;try{h=await fetch(i,{method:"POST",headers:c,body:o})}catch(A){g=A}if(g){if(p===l-1)break;await a.sleep(f),f*=2,p++;continue}if(h&&h.status>=500&&h.status<600&&p<l-1){await a.sleep(f),f*=2,p++;continue}if(h&&h.status===429&&p<l-1){const A=parseInt(h.headers.get("Retry-After")||"1",10);await a.sleep(Math.max(A*1e3,f)),f*=2,p++;continue}break}if(g){Ve(a,n,e,"network: "+g.message);return}if(!h){Ve(a,n,e,"network: no response");return}if(h.status===409){const A=await h.text();a.appendMsg("system","⚠️ "+(A||"session 已被工具调用占用"));try{await Et(a.endpoint,s,n)}catch{}a.setPending(null),a.setBusy(!1);return}if(!h.ok||!h.body){Ve(a,n,e,"http "+h.status);return}const b=a.appendTyping();let y="",R=!1;function E(){R||(R=!0,b.className="aiagent-sdk-msg aiagent-sdk-msg-assistant",An(b))}let j=!0;const Q=A=>{A&&A.tool&&A.tool.indexOf("__")!==0&&a.appendMsg("tool","",{tool:A.tool,args:A.args||{}})};try{await X(h.body,A=>{y+=A.data||"",E(),b.innerHTML=ze(y),Pe(b),a.getMsgEl().scrollTop=a.getMsgEl().scrollHeight},()=>{E(),Ke(b),b.innerHTML=ze(y),Pe(b),a.getMsgEl().scrollTop=a.getMsgEl().scrollHeight,a.setBusy(!1)},A=>{j=!1,R?(Ke(b),b.className="aiagent-sdk-msg aiagent-sdk-msg-system",b.textContent="⚠️ "+A.message):(b.remove(),a.appendMsg("system","⚠️ "+A.message)),a.setBusy(!1)},Q)}catch{j=!1}if(j){try{sessionStorage.removeItem("pending:"+n)}catch{}a.setPending(null)}else Ve(a,n,e,"sse")}async function Ai(a){const e=a.getPending();if(!e)return;const t=a.getSessionId();if(!t)return;a.setBusy(!0);let n;try{n=await a.ensureToken()}catch(s){a.appendMsg("system","⚠️ "+s.message),a.setBusy(!1);return}await At(a,e.toolUseId,e.result,t,n)}async function Si(a){const e=a.getSessionId();if(!e){a.setBusy(!1);return}let t="";try{t=await a.ensureToken()}catch{}await Et(a.endpoint,t,e),a.appendMsg("system","已放弃本次工具调用,可继续对话。"),a.setBusy(!1)}function Ve(a,e,t,n){console.warn("[AIAgent SDK] tool result failed:",n),vi(a,n),a.setBusy(!1)}function vi(a,e){const t=a.getMsgEl();if(t.querySelector(".aiagent-sdk-tool-result-failed"))return;const n=document.createElement("div");n.className="aiagent-sdk-tool-result-failed";const s=document.createElement("div");s.className="aiagent-sdk-tool-result-failed-header",s.textContent="提交工具结果失败";const i=document.createElement("div");i.className="aiagent-sdk-tool-result-failed-detail",i.textContent="原因:"+(e||"未知")+"。可重试,或取消本次调用以继续对话。";const o=document.createElement("div");o.className="aiagent-sdk-tool-result-actions";const c=document.createElement("button");c.type="button",c.className="aiagent-sdk-btn-retry",c.textContent="↻ 重试",c.addEventListener("click",()=>{n.parentNode&&n.parentNode.removeChild(n),Ai(a)});const l=document.createElement("button");l.type="button",l.className="aiagent-sdk-btn-cancel",l.textContent="✕ 取消",l.addEventListener("click",()=>{n.parentNode&&n.parentNode.removeChild(n),Si(a)}),o.appendChild(c),o.appendChild(l),n.appendChild(s),n.appendChild(i),n.appendChild(o),t.appendChild(n),t.scrollTop=t.scrollHeight}async function Ri(a){if(typeof sessionStorage>"u")return;let e=null,t=null;try{for(let i=0;i<sessionStorage.length;i++){const o=sessionStorage.key(i);if(o&&o.indexOf("pending:")===0){e=o,t=JSON.parse(sessionStorage.getItem(o)||"null");break}}}catch{return}if(!e||!t||!t.toolUseId){e&&sessionStorage.removeItem(e);return}const n=e.substring(8);a.appendMsg("system","检测到上次未完成的工具调用,正在重试提交…"),a.setPending(t);let s;try{s=await a.ensureToken()}catch(i){a.appendMsg("system","⚠️ "+i.message);return}await At(a,t.toolUseId,t.result,n,s)}function Ii(a){if(a.getActiveTools().indexOf("submit_form")>=0)a.setActiveTools([]),a.setExtractOnCall(null),a.appendMsg("system","📋 录单模式已关闭(普通聊天)");else{let e=a.getChatSessionId();e||(e=a.getDemoSessionId()||a.clientPrefix+":order-"+Date.now()),a.hasLocalTool(e,"submit_form")||(e=a.getDemoSessionId()),a.setChatSessionId(e),a.setActiveTools(["submit_form"]),a.setExtractOnCall(null),a.appendMsg("system","📋 录单模式已开启。请粘订单文本,模型会多轮收集字段。")}}function Oi(a,e){const t=e.sessionId||a.clientPrefix+":order-"+Date.now(),n=e.tools||[],s=e.activeTools||(n.length?[n[0].name]:[]);if(!n.length){console.warn("[AIAgent SDK] startExtractSession: tools required");return}e.onFormSubmit&&!n[0].onCall&&(n[0].onCall=e.onFormSubmit),a.registerTools(t,n).then(()=>{a.setChatSessionId(t),a.setActiveTools(s);const i=n[0];a.setExtractOnCall(i&&typeof i.onCall=="function"?i.onCall:null),a.appendMsg("system","📋 智能录单已开启("+t+"),激活工具: "+s.join(",")),a.sendUserMessage(e.initialMessage||"请开始按工具定义收集字段,或直接让我粘订单文本。")}).catch(i=>{a.appendMsg("system","⚠️ 工具注册失败:"+i.message)})}function Ci(a){a.setActiveTools([]),a.setExtractOnCall(null),a.appendMsg("system","📋 录单模式已关闭")}const Di=`
/* ====================================================================
 * 设计令牌
 * ==================================================================== */
:host {
  /* 调色板 */
  --aia-primary: #3b82f6;
  --aia-primary-strong: #2563eb;
  --aia-accent: #8b5cf6;
  --aia-bg: #ffffff;
  --aia-bg-elev: #f9fafb;
  --aia-bg-soft: #f3f4f6;
  --aia-text: #1f2937;
  --aia-text-muted: #6b7280;
  --aia-text-faint: #9ca3af;
  --aia-border: #e5e7eb;
  --aia-border-soft: #f3f4f6;
  --aia-success: #065f46;
  --aia-success-bg: #ecfdf5;
  --aia-success-border: #a7f3d0;
  --aia-error: #991b1b;
  --aia-error-bg: #fef2f2;
  --aia-error-border: #fecaca;
  --aia-link: #3b82f6;
  --aia-link-hover: #2563eb;
  --aia-code-bg: rgba(0,0,0,.06);
  --aia-pre-bg: rgba(0,0,0,.05);

  /* 形状 */
  --aia-radius-sm: 8px;
  --aia-radius-md: 12px;
  --aia-radius-lg: 16px;
  --aia-radius-pill: 9999px;

  /* 阴影 */
  --aia-shadow-1: 0 6px 20px rgba(59,130,246,.30);
  --aia-shadow-2: 0 12px 40px rgba(0,0,0,.18);
  --aia-shadow-glow: 0 0 0 3px rgba(59,130,246,.18);

  /* 动效 */
  --aia-anim-ease: cubic-bezier(.2,.8,.2,1);
  --aia-anim-dur: 220ms;
  --aia-anim-dur-slow: 320ms;
  --aia-anim-stagger-step: 30ms;

  /* 字体 */
  --aia-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif;
  --aia-mono: ui-monospace, "Cascadia Code", "JetBrains Mono", monospace;
}

:host([data-theme="dark"]) {
  --aia-bg: #0b1220;
  --aia-bg-elev: #111827;
  --aia-bg-soft: #1f2937;
  --aia-text: #e5e7eb;
  --aia-text-muted: #9ca3af;
  --aia-text-faint: #6b7280;
  --aia-border: #1f2937;
  --aia-border-soft: #374151;
  --aia-success: #a7f3d0;
  --aia-success-bg: #064e3b;
  --aia-success-border: #047857;
  --aia-error: #fecaca;
  --aia-error-bg: #450a0a;
  --aia-error-border: #7f1d1d;
  --aia-link: #93c5fd;
  --aia-link-hover: #bfdbfe;
  --aia-code-bg: rgba(255,255,255,.08);
  --aia-pre-bg: rgba(0,0,0,.35);

  --aia-shadow-1: 0 6px 20px rgba(0,0,0,.5);
  --aia-shadow-2: 0 12px 40px rgba(0,0,0,.6);
}

/* ====================================================================
 * 气泡(玻璃感 + 呼吸脉冲)
 * ==================================================================== */
.aiagent-sdk-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--aia-primary), var(--aia-accent));
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: var(--aia-shadow-1), inset 0 1px 0 rgba(255,255,255,.4);
  z-index: 2147483600;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-family: var(--aia-font);
  /* 玻璃感 */
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  transition:
    transform var(--aia-anim-dur) var(--aia-anim-ease),
    box-shadow var(--aia-anim-dur) var(--aia-anim-ease);
}
.aiagent-sdk-bubble:hover {
  transform: scale(1.08);
  box-shadow:
    0 8px 28px rgba(59,130,246,.45),
    inset 0 1px 0 rgba(255,255,255,.4);
}
.aiagent-sdk-bubble.aiagent-sdk-hidden { display: none; }
.aiagent-sdk-bubble.aiagent-sdk-pos-bl { right: auto; left: 24px; }

/* 持续浮动 + 呼吸脉冲 + 缩放呼吸(不依赖 hover,空闲就一直在动) */
@keyframes aia-bubble-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-6px) scale(1.04); }
}
@keyframes aia-bubble-pulse {
  0%   { box-shadow: var(--aia-shadow-1), inset 0 1px 0 rgba(255,255,255,.4), 0 0 0 0 rgba(59,130,246,.55); }
  70%  { box-shadow: var(--aia-shadow-1), inset 0 1px 0 rgba(255,255,255,.4), 0 0 0 22px rgba(59,130,246,0); }
  100% { box-shadow: var(--aia-shadow-1), inset 0 1px 0 rgba(255,255,255,.4), 0 0 0 0 rgba(59,130,246,0); }
}
.aiagent-sdk-bubble {
  animation:
    aia-bubble-float 2.4s var(--aia-anim-ease) infinite,
    aia-bubble-pulse 2.5s var(--aia-anim-ease) infinite;
}
.aiagent-sdk-bubble:hover,
.aiagent-sdk-bubble:focus-visible {
  /* hover 时只保留自身的缩放过渡,停掉持续动效以免视觉打架 */
  animation: none;
  transform: scale(1.10);
  box-shadow:
    0 12px 32px rgba(59,130,246,.55),
    inset 0 1px 0 rgba(255,255,255,.4),
    0 0 0 6px rgba(59,130,246,.15);
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-bubble { animation: none; }
}

/* ====================================================================
 * 面板(滑入 + 微缩放)
 * ==================================================================== */
.aiagent-sdk-panel {
  position: fixed;
  bottom: 96px;
  right: 24px;
  width: 380px;
  height: 540px;
  max-height: 80vh;
  background: var(--aia-bg);
  color: var(--aia-text);
  border-radius: var(--aia-radius-md);
  box-shadow: var(--aia-shadow-2);
  z-index: 2147483600;
  display: none;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--aia-font);
  border: 1px solid var(--aia-border);
  /* 初始关闭态(透明 + 下沉 + 缩到 .88) */
  opacity: 0;
  transform: translateY(20px) scale(.88);
  transform-origin: bottom right;
  transition:
    opacity var(--aia-anim-dur) var(--aia-anim-ease),
    transform 420ms var(--aia-anim-ease);
  pointer-events: none;
}
.aiagent-sdk-panel.aiagent-sdk-open {
  display: flex;
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}
.aiagent-sdk-panel.aiagent-sdk-pos-bl { right: auto; left: 24px; transform-origin: bottom left; }
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-panel {
    transition: opacity 120ms linear;
    transform: none;
  }
}

/* ====================================================================
 * 头部
 * ==================================================================== */
.aiagent-sdk-header {
  padding: 14px 16px;
  background: linear-gradient(135deg, var(--aia-primary), var(--aia-accent));
  color: #fff;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.aiagent-sdk-header-info { display: flex; flex-direction: column; min-width: 0; }
.aiagent-sdk-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.aiagent-sdk-subtitle {
  font-size: 11px;
  opacity: .85;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.aiagent-sdk-header-actions { display: flex; gap: 4px; }
.aiagent-sdk-iconbtn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  width: 26px;
  height: 26px;
  border-radius: var(--aia-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  padding: 0;
  opacity: .85;
  transition: background 150ms var(--aia-anim-ease), opacity 150ms var(--aia-anim-ease);
}
.aiagent-sdk-iconbtn:hover { background: rgba(255,255,255,.15); opacity: 1; }
.aiagent-sdk-iconbtn:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }

/* ====================================================================
 * 消息区
 * ==================================================================== */
.aiagent-sdk-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--aia-bg-elev);
  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: var(--aia-text-faint) transparent;
}
.aiagent-sdk-messages::-webkit-scrollbar { width: 6px; }
.aiagent-sdk-messages::-webkit-scrollbar-thumb {
  background: var(--aia-text-faint);
  border-radius: 3px;
}
.aiagent-sdk-messages::-webkit-scrollbar-track { background: transparent; }

/* ====================================================================
 * 消息气泡(聊天框里的消息框)
 *
 * 设计要点:
 *   - display: inline-block + width: fit-content → 宽度跟内容走,不会撑出空白
 *   - 不用 border(会跟输入框撞视觉),改用 box-shadow 立体感
 *   - 不用 1px 边框纯白底,改用浅蓝→浅紫渐变(assistant)与蓝渐变(user)
 *   - 不加微信尖角:渐变消息上尖角颜色难统一,纯圆角更干净
 * ==================================================================== */
.aiagent-sdk-msg {
  position: relative;
  display: inline-block;
  width: fit-content;
  max-width: 85%;
  padding: 9px 13px;
  font-size: 13.5px;
  line-height: 1.5;
  word-wrap: break-word;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 2px 6px rgba(0,0,0,.04);
  /* 入场前态:大位移 + 小缩放,绝对看得见"消息冒出来" */
  opacity: 0;
  transform: translateY(16px) scale(.9);
  animation: aia-msg-in 420ms var(--aia-anim-ease) forwards;
  /* --i 由 JS 设置(消息下标),每条 delay 70ms,最多 5 */
  animation-delay: calc(min(var(--i, 0), 5) * 70ms);
}
@keyframes aia-msg-in {
  0%   { opacity: 0; transform: translateY(16px) scale(.9); }
  60%  { opacity: 1; transform: translateY(-2px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-msg { animation: none; opacity: 1; transform: none; }
}

/* 用户消息:蓝→紫渐变 + 蓝色阴影(右侧) */
.aiagent-sdk-msg-user {
  align-self: flex-end;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(59,130,246,.32);
  animation-name: aia-msg-in-user;
}
@keyframes aia-msg-in-user {
  0%   { opacity: 0; transform: translateX(28px) scale(.9); }
  60%  { opacity: 1; transform: translateX(-3px) scale(1.02); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
}

/* assistant 消息:浅蓝→浅紫渐变 + 灰阴影(左侧,无边框) */
.aiagent-sdk-msg-assistant {
  align-self: flex-start;
  background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
  color: var(--aia-text);
  box-shadow: 0 2px 8px rgba(99,102,241,.10);
  animation-name: aia-msg-in-assistant;
}
@keyframes aia-msg-in-assistant {
  0%   { opacity: 0; transform: translateX(-28px) scale(.9); }
  60%  { opacity: 1; transform: translateX(3px) scale(1.02); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
}
:host([data-theme="dark"]) .aiagent-sdk-msg-assistant {
  background: linear-gradient(135deg, #1e293b 0%, #2e1f47 100%);
  color: var(--aia-text);
  box-shadow: 0 2px 8px rgba(0,0,0,.30);
}

/* 系统提示(小字居中,胶囊背景) */
.aiagent-sdk-msg-system {
  align-self: center;
  background: var(--aia-bg-soft);
  color: var(--aia-text-faint);
  font-size: 11.5px;
  font-style: italic;
  padding: 4px 12px;
  border: none;
  box-shadow: none;
  border-radius: var(--aia-radius-pill);
  animation: aia-msg-in 380ms var(--aia-anim-ease) forwards;
}

/* 工具调用卡片(绿色调) */
.aiagent-sdk-msg-tool {
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  color: var(--aia-success);
  border: none;
  font-size: 12.5px;
  padding: 9px 13px;
  align-self: flex-start;
  max-width: 90%;
  border-radius: 14px;
  font-family: var(--aia-mono);
  box-shadow: 0 2px 8px rgba(16,185,129,.10);
}
:host([data-theme="dark"]) .aiagent-sdk-msg-tool {
  background: linear-gradient(135deg, #064e3b 0%, #14532d 100%);
}
.aiagent-sdk-msg-tool .aiagent-sdk-tool-title {
  font-family: var(--aia-font);
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 12px;
}
.aiagent-sdk-msg-tool pre {
  margin: 4px 0 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 11.5px;
}
.aiagent-sdk-msg b { font-weight: 600; }

/* ====================================================================
 * 流式光标(assistant 消息末尾 ▌ 闪烁)
 * 加 class="aiagent-sdk-typing-active" 的 assistant 消息 div 会在
 * 末尾生成一个 <span class="aia-cursor">▌</span>(由 typing.ts 注入)
 * ==================================================================== */
.aiagent-sdk-msg-assistant.aiagent-sdk-typing-active::after {
  content: '▌';
  display: inline-block;
  margin-left: 2px;
  color: var(--aia-primary);
  font-weight: 600;
  animation: aia-cursor-blink 1s steps(2) infinite;
}
@keyframes aia-cursor-blink {
  50% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-msg-assistant.aiagent-sdk-typing-active::after { animation: none; }
}

/* ====================================================================
 * 打字指示器(3 圆点)
 * ==================================================================== */
.aiagent-sdk-typing {
  align-self: flex-start;
  display: inline-flex;
  gap: 4px;
  padding: 10px 14px;
  background: var(--aia-bg);
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-md);
  border-bottom-left-radius: 2px;
  opacity: 0;
  transform: translateY(6px);
  animation: aia-msg-in 280ms var(--aia-anim-ease) forwards;
}
.aiagent-sdk-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--aia-text-faint);
  animation: aia-typing-bounce 1.2s infinite;
}
.aiagent-sdk-typing span:nth-child(2) { animation-delay: .2s; }
.aiagent-sdk-typing span:nth-child(3) { animation-delay: .4s; }
@keyframes aia-typing-bounce {
  0%, 60%, 100% { opacity: .3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-typing span { animation: none; opacity: .6; }
}

/* ====================================================================
 * 工具卡骨架屏(等结果时 shimmer)
 * 加 class="aiagent-sdk-skeleton" 触发
 * ==================================================================== */
@keyframes aia-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.aiagent-sdk-skeleton {
  background: linear-gradient(
    90deg,
    var(--aia-bg-soft) 0%,
    rgba(255,255,255,.4) 50%,
    var(--aia-bg-soft) 100%
  );
  background-size: 200% 100%;
  animation: aia-shimmer 1.4s linear infinite;
  border-radius: var(--aia-radius-sm);
}
:host([data-theme="dark"]) .aiagent-sdk-skeleton {
  background: linear-gradient(
    90deg,
    var(--aia-bg-soft) 0%,
    rgba(255,255,255,.06) 50%,
    var(--aia-bg-soft) 100%
  );
  background-size: 200% 100%;
}

/* ====================================================================
 * 输入栏
 * ==================================================================== */
.aiagent-sdk-inputbar {
  padding: 10px;
  border-top: 1px solid var(--aia-border);
  background: var(--aia-bg);
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
/* 顶部扫光线(空闲时一直在扫,4s 一次) */
.aiagent-sdk-inputbar::before {
  content: '';
  position: absolute;
  top: 0;
  left: -50%;
  width: 50%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--aia-primary) 50%,
    transparent 100%
  );
  animation: aia-scanline 4s linear infinite;
  pointer-events: none;
}
@keyframes aia-scanline {
  0%   { left: -50%; }
  100% { left: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-inputbar::before { animation: none; opacity: .4; }
}
.aiagent-sdk-inputbar textarea {
  flex: 1;
  resize: none;
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-sm);
  padding: 8px 10px;
  font: inherit;
  font-size: 13.5px;
  line-height: 1.4;
  outline: none;
  max-height: 80px;
  background: var(--aia-bg);
  color: var(--aia-text);
  font-family: inherit;
  transition:
    border-color 160ms var(--aia-anim-ease),
    box-shadow 160ms var(--aia-anim-ease);
}
.aiagent-sdk-inputbar textarea:focus {
  border-color: var(--aia-primary);
  box-shadow: var(--aia-shadow-glow);
}
.aiagent-sdk-send {
  background: var(--aia-primary);
  color: #fff;
  border: none;
  border-radius: var(--aia-radius-sm);
  padding: 0 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  position: relative;
  transition:
    background 150ms var(--aia-anim-ease),
    transform 80ms var(--aia-anim-ease),
    box-shadow 200ms var(--aia-anim-ease);
  min-width: 54px;
}
.aiagent-sdk-send:hover:not(:disabled) {
  background: var(--aia-primary-strong);
  box-shadow: 0 0 0 4px rgba(59,130,246,.25);
}
.aiagent-sdk-send:active:not(:disabled) { transform: scale(.94); }
.aiagent-sdk-send:disabled {
  background: var(--aia-text-faint);
  cursor: not-allowed;
}

/* ====================================================================
 * 工具结果重试/取消卡片
 * ==================================================================== */
.aiagent-sdk-tool-result-failed {
  align-self: stretch;
  background: var(--aia-error-bg);
  border: 1px solid var(--aia-error-border);
  border-radius: var(--aia-radius-sm);
  padding: 10px 12px;
  margin: 2px 0;
  font-size: 12.5px;
  color: var(--aia-error);
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: aia-msg-in 280ms var(--aia-anim-ease) forwards;
}
.aiagent-sdk-tool-result-failed-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.aiagent-sdk-tool-result-failed-header::before { content: "⚠️"; font-size: 14px; }
.aiagent-sdk-tool-result-failed-detail {
  font-weight: 400;
  opacity: .85;
  font-size: 12px;
  margin-left: 22px;
}
.aiagent-sdk-tool-result-actions {
  display: inline-flex;
  gap: 6px;
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
}
.aiagent-sdk-tool-result-actions button:active { transform: scale(.96); }
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-retry {
  background: var(--aia-primary);
  color: #fff;
  border: 1px solid var(--aia-primary);
}
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-retry:hover {
  background: var(--aia-primary-strong);
  border-color: var(--aia-primary-strong);
}
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-cancel {
  background: transparent;
  color: var(--aia-text-muted);
  border: 1px solid var(--aia-border);
}
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-cancel:hover {
  background: var(--aia-bg-soft);
  color: var(--aia-text);
  border-color: var(--aia-text-faint);
}

/* ====================================================================
 * Markdown 渲染样式(marked + DOMPurify)
 * ==================================================================== */
.aiagent-sdk-msg p { margin: .35em 0; }
.aiagent-sdk-msg p:first-child { margin-top: 0; }
.aiagent-sdk-msg p:last-child { margin-bottom: 0; }
.aiagent-sdk-msg h1, .aiagent-sdk-msg h2, .aiagent-sdk-msg h3, .aiagent-sdk-msg h4 {
  font-weight: 600;
  line-height: 1.3;
  margin: .7em 0 .3em;
}
.aiagent-sdk-msg h1 { font-size: 1.3em; }
.aiagent-sdk-msg h2 { font-size: 1.18em; }
.aiagent-sdk-msg h3 { font-size: 1.08em; }
.aiagent-sdk-msg h4 { font-size: 1em; }
.aiagent-sdk-msg ul, .aiagent-sdk-msg ol { margin: .4em 0; padding-left: 1.5em; }
.aiagent-sdk-msg li { margin: .15em 0; }
.aiagent-sdk-msg li > p { margin: .15em 0; }
.aiagent-sdk-msg blockquote {
  border-left: 3px solid var(--aia-border);
  padding: 2px 10px;
  margin: .5em 0;
  color: var(--aia-text-muted);
  background: rgba(0,0,0,.02);
  border-radius: 0 4px 4px 0;
}
:host([data-theme="dark"]) .aiagent-sdk-msg blockquote {
  background: rgba(255,255,255,.04);
  border-left-color: var(--aia-border-soft);
}
.aiagent-sdk-msg hr {
  border: none;
  border-top: 1px solid var(--aia-border);
  margin: .8em 0;
}
.aiagent-sdk-msg pre {
  background: var(--aia-pre-bg);
  border-radius: 6px;
  padding: 8px 10px;
  margin: .5em 0;
  overflow-x: auto;
  font-family: var(--aia-mono);
  font-size: 12.5px;
  line-height: 1.5;
  white-space: pre;
}
.aiagent-sdk-msg pre code { background: transparent; padding: 0; font-size: inherit; }
.aiagent-sdk-msg code {
  background: var(--aia-code-bg);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 12.5px;
  font-family: var(--aia-mono);
}
.aiagent-sdk-msg a {
  color: var(--aia-link);
  text-decoration: underline;
  word-break: break-all;
}
.aiagent-sdk-msg a:hover { color: var(--aia-link-hover); }
.aiagent-sdk-msg table {
  border-collapse: separate;
  border-spacing: 0;
  margin: .6em 0;
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
  border-bottom: 1px solid var(--aia-border-soft);
  padding: 7px 12px;
  text-align: left;
  vertical-align: middle;
}
.aiagent-sdk-msg tr:last-child td { border-bottom: none; }
.aiagent-sdk-msg th {
  background: var(--aia-bg-elev);
  font-weight: 600;
  color: var(--aia-text);
}
.aiagent-sdk-msg tbody tr:nth-child(even) td {
  background: var(--aia-bg-soft);
}
.aiagent-sdk-msg del { color: var(--aia-text-faint); text-decoration: line-through; }
.aiagent-sdk-msg input[type=checkbox] { margin-right: 6px; }

/* ====================================================================
 * 图片(百分比缩放 + 加载模糊过渡)
 * ==================================================================== */
.aiagent-sdk-msg img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: .4em 0;
  display: block;
  cursor: zoom-in;
  background: rgba(0,0,0,.03);
}
.aiagent-sdk-msg img.aiagent-sdk-img-loading {
  opacity: .3;
  filter: blur(6px);
  transition: opacity .35s, filter .35s;
}
.aiagent-sdk-msg img.aiagent-sdk-img-loaded {
  opacity: 1;
  filter: none;
  transition: opacity .35s, filter .35s;
}
`;class Li{constructor(e,t){k(this,"host",null);k(this,"shadow",null);k(this,"bubble",null);k(this,"panel",null);k(this,"msgEl",null);k(this,"taEl",null);k(this,"sendBtn",null);k(this,"isOpen",!1);k(this,"mounted",!1);this.opts=e,this.handlers=t}getRefs(){return!this.host||!this.bubble||!this.panel||!this.msgEl||!this.taEl||!this.sendBtn?null:{host:this.host,bubble:this.bubble,panel:this.panel,msgEl:this.msgEl,taEl:this.taEl,sendBtn:this.sendBtn}}mount(){if(this.mounted||typeof document>"u")return;const e=document.createElement("div");e.className="aiagent-sdk-host",e.setAttribute("data-position",this.opts.position||"bottom-right"),e.setAttribute("data-theme",this.opts.theme||"light"),document.body.appendChild(e),this.host=e;const t=e.attachShadow({mode:"open"});this.shadow=t;const n=document.createElement("style");n.textContent=Di,t.appendChild(n);const s=this.opts.position==="bottom-left"?" aiagent-sdk-pos-bl":"",i=document.createElement("button");i.className="aiagent-sdk-bubble"+s,i.setAttribute("aria-label",this.opts.title||"AI 助手"),i.title=this.opts.title||"AI 助手",i.innerHTML=this.opts.avatar||"🤖",i.addEventListener("click",()=>this.toggle()),t.appendChild(i),this.bubble=i;const o=document.createElement("div");o.className="aiagent-sdk-panel"+s;const c=this.opts.demoTools?'<button class="aiagent-sdk-iconbtn aiagent-sdk-extract" title="开/关 录单模式">📋</button>':"";o.innerHTML=['<div class="aiagent-sdk-header">','  <div class="aiagent-sdk-header-info">','    <div class="aiagent-sdk-title"></div>','    <div class="aiagent-sdk-subtitle"></div>',"  </div>",'  <div class="aiagent-sdk-header-actions">',c,'    <button class="aiagent-sdk-iconbtn aiagent-sdk-new" title="新会话">＋</button>','    <button class="aiagent-sdk-iconbtn aiagent-sdk-close" title="关闭">✕</button>',"  </div>","</div>",'<div class="aiagent-sdk-messages"></div>','<div class="aiagent-sdk-inputbar">','  <textarea rows="1" placeholder=""></textarea>','  <button class="aiagent-sdk-send">发送</button>',"</div>"].join(""),t.appendChild(o),this.panel=o;const l=o.querySelector(".aiagent-sdk-title"),f=o.querySelector(".aiagent-sdk-subtitle");l.textContent=this.opts.title||"AI 助手",f.textContent=this.opts.subtitle||"在线";const p=o.querySelector("textarea");p.placeholder=this.opts.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",this.msgEl=o.querySelector(".aiagent-sdk-messages"),this.taEl=p,this.sendBtn=o.querySelector(".aiagent-sdk-send");const h=o.querySelector(".aiagent-sdk-close"),g=o.querySelector(".aiagent-sdk-new"),b=o.querySelector(".aiagent-sdk-extract");h.addEventListener("click",()=>this.handlers.onClose()),g.addEventListener("click",()=>this.handlers.onNew()),b&&b.addEventListener("click",()=>this.handlers.onToggleExtract()),this.sendBtn.addEventListener("click",()=>this.handlers.onSend()),p.addEventListener("keydown",y=>{y.key==="Enter"&&!y.shiftKey&&(y.preventDefault(),this.handlers.onSend())}),p.addEventListener("input",()=>{p.style.height="auto",p.style.height=Math.min(p.scrollHeight,80)+"px"}),this.setTheme(this.opts.theme||"light"),this.mounted=!0}destroy(){this.mounted&&(this.host&&this.host.parentNode&&this.host.parentNode.removeChild(this.host),this.host=null,this.shadow=null,this.bubble=null,this.panel=null,this.msgEl=null,this.taEl=null,this.sendBtn=null,this.mounted=!1,this.isOpen=!1)}open(){this.panel&&(this.panel.classList.add("aiagent-sdk-open"),this.isOpen=!0,setTimeout(()=>{this.taEl&&this.taEl.focus()},50),this.handlers.onPanelOpen())}close(){this.panel&&(this.panel.classList.remove("aiagent-sdk-open"),this.isOpen=!1)}toggle(){this.isOpen?this.close():this.open()}getIsOpen(){return this.isOpen}setTheme(e){this.host&&this.host.setAttribute("data-theme",e)}clearMessages(){this.msgEl&&(this.msgEl.innerHTML="")}}function Ni(a,e){a.setTheme(e)}function Sn(a){return String(a).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function Mi(a,e,t=0,n){const s=document.createElement("div");return a==="user"?s.className="aiagent-sdk-msg aiagent-sdk-msg-user":a==="assistant"?s.className="aiagent-sdk-msg aiagent-sdk-msg-assistant":a==="tool"?s.className="aiagent-sdk-msg aiagent-sdk-msg-tool":s.className="aiagent-sdk-msg aiagent-sdk-msg-system",s.style.setProperty("--i",String(t)),a==="tool"?s.innerHTML='<div class="aiagent-sdk-tool-title">📋 '+Sn(n?.tool||"tool")+"</div><pre>"+Sn(JSON.stringify(n?.args,null,2)||"")+"</pre>":(s.innerHTML=ze(e||""),Pe(s)),s}function zi(a,e,t,n=0,s){const i=Mi(e,t,n,s);a.appendChild(i),a.scrollTop=a.scrollHeight}const Pi=[{name:"submit_form",description:"Submit the collected order fields. Call only when ALL required fields are collected.",parameters:{type:"object",properties:{orderId:{type:"string",description:"订单编号,如 PO-2024-001"},customerName:{type:"string",description:"客户全名"},customerPhone:{type:"string",description:"11 位手机号"},items:{type:"string",description:"商品清单"},totalAmount:{type:"number",description:"订单总金额,单位元"},notes:{type:"string",description:"其他备注"}},required:["orderId","customerName","items","totalAmount"]},strict:!0}];class $i{constructor(){k(this,"endpoint");k(this,"getAccessToken");k(this,"_opts");k(this,"_tokenCache",new O);k(this,"_tools",new xi);k(this,"_widget",null);k(this,"_isOpen",!1);k(this,"_busy",!1);k(this,"_messages",[]);k(this,"_chatSessionId",null);k(this,"_activeTools",[]);k(this,"_extractOnCall",null);k(this,"_pendingToolCall",null);k(this,"_demoSessionId",null)}init(e){if(!e||!e.endpoint)throw new Error("endpoint required");if(typeof e.getAccessToken!="function")throw new Error("getAccessToken() required");return this.endpoint=String(e.endpoint).replace(/\/+$/,""),this.getAccessToken=e.getAccessToken,this._opts={title:e.title||"AI 助手",subtitle:e.subtitle||"在线",placeholder:e.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",welcomeMessage:e.welcomeMessage||"你好!我是 AI 助手,有什么可以帮你的?",theme:e.theme||"light",position:e.position||"bottom-right",autoOpen:!!e.autoOpen,avatar:e.avatar||"🤖",clientPrefix:e.clientPrefix||"app",demoTools:!!e.demoTools,demoOrderTools:e.demoOrderTools||Pi},this._widget=new Li(this._opts,{onSend:()=>this._onSend(),onNew:()=>this._newSession(),onClose:()=>this.close(),onToggleExtract:()=>this._toggleExtractMode(),onPanelOpen:()=>{}}),this._widget.mount(),this._opts.autoOpen&&this.open(),setTimeout(()=>{this._resumePendingToolResults()},0),this._opts.demoTools&&(this._demoSessionId=this._opts.clientPrefix+":demo",this._internalRegister(this._demoSessionId,this._opts.demoOrderTools).then(()=>{}).catch(t=>{console.warn("[AIAgent SDK] demo tools register failed:",t)})),this}destroy(){this._widget&&(this._widget.destroy(),this._widget=null)}async registerTools(e){if(!e||!e.sessionId)throw new Error("sessionId required");if(!e.tools||!e.tools.length)throw new Error("tools required");return this._internalRegister(e.sessionId,e.tools)}async unregisterTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const n=t.names||null;this._tools.unregister(t.sessionId,n);const s=await this._ensureToken();return wi(this.endpoint,s,t.sessionId,n)}async listTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const n=await this._ensureToken();return _i(this.endpoint,n,t.sessionId)}async _internalRegister(e,t){const n=this._tools.register(e,t),s=await this._ensureToken();return Ti(this.endpoint,s,e,n)}_getLocalTool(e,t){return this._tools.get(e,t)}startExtractSession(e){const t=this._extractCtx();Oi(t,e)}stopExtractSession(){Ci(this._extractCtx())}_toggleExtractMode(){Ii(this._extractCtx())}async stream(e){const t=e||{};return this._postStream({sessionId:t.sessionId,message:t.message,activeTools:t.activeTools||[],onChunk:t.onChunk||(()=>{}),onDone:t.onDone||(()=>{}),onError:t.onError||(n=>console.error(n)),onToolCall:t.onToolCall})}open(){this._widget&&this._widget.open(),this._isOpen=!0}close(){this._widget&&this._widget.close(),this._isOpen=!1}toggle(){this._widget&&this._widget.toggle(),this._isOpen=this._widget?this._widget.getIsOpen():!1}setTheme(e){this._widget&&Ni(this._widget,e.theme)}async _ensureToken(){return this._tokenCache.get(this.getAccessToken)}_newSession(){const e=this._chatSessionId;e&&Et(this.endpoint,"",e).catch(()=>{}),this._widget&&this._widget.clearMessages(),this._messages=[],this._activeTools=[],this._extractOnCall=null,this._chatSessionId=null,this._appendMsg("system","新会话已开启")}_onSend(){if(!this._widget)return;const e=this._widget.getRefs();if(!e)return;const t=e.taEl.value.trim();!t||this._busy||(e.taEl.value="",e.taEl.style.height="auto",this._sendUserMessage(t))}async _sendUserMessage(e){this._appendMsg("user",e),this._setBusy(!0);const t=this._widget.getRefs(),n=En(t.msgEl);let s="";const i=this,o=this._activeTools.slice(),c=this._extractOnCall;let l=!1,f=!1;function p(){f||(f=!0,n.className="aiagent-sdk-msg aiagent-sdk-msg-assistant",An(n))}const h={message:e,onChunk:g=>{s+=g.data||"",p(),n.innerHTML=ze(s),Pe(n),t.msgEl.scrollTop=t.msgEl.scrollHeight},onDone:()=>{p(),Ke(n),n.innerHTML=ze(s),Pe(n),t.msgEl.scrollTop=t.msgEl.scrollHeight,l||i._setBusy(!1)},onError:g=>{f?(Ke(n),n.className="aiagent-sdk-msg aiagent-sdk-msg-system",n.textContent="⚠️ 错误:"+g.message):(n.remove(),i._appendMsg("system","⚠️ 错误:"+g.message)),i._setBusy(!1),l=!0},onToolCall:async g=>{if(!g||!g.tool||g.tool.indexOf("__")===0||!g.args||typeof g.args!="object"||!Object.keys(g.args).length||l)return;l=!0,i._appendMsg("tool","",{tool:g.tool,args:g.args});let y;const R=i._getLocalTool(i._chatSessionId,g.tool);if(R&&R.onCall)try{y=await Promise.resolve(R.onCall(g.args))}catch(E){console.error("[AIAgent SDK] onCall threw:",E),i._appendMsg("system","⚠️ onCall 失败: "+E.message)}if(c&&g.tool==="submit_form")try{const E=c(g.args);E!=null&&y==null&&(y=E)}catch(E){console.error("[AIAgent SDK] extract onCall threw:",E)}g.id&&await i._postToolResult(g.id,y)}};this._chatSessionId||(this._chatSessionId=this._opts.clientPrefix+":user-"+Date.now()),h.sessionId=this._chatSessionId,h.activeTools=o;try{await this._postStream(h)}catch{}}_setBusy(e){if(this._busy=e,!this._widget)return;const t=this._widget.getRefs();t&&(t.sendBtn.disabled=e,t.sendBtn.textContent=e?"...":"发送")}_sleep(e){return new Promise(t=>setTimeout(t,e))}_appendMsg(e,t,n){if(!this._widget)return;const s=this._widget.getRefs();s&&(zi(s.msgEl,e,t,this._messages.length,n),this._messages.push({role:e,text:t,data:n}))}_appendTyping(){if(!this._widget)return document.createElement("div");const e=this._widget.getRefs();return e?En(e.msgEl):document.createElement("div")}async _postStream(e){const t=e.sessionId,n=e.message,s=e.activeTools,i=e.onChunk||(()=>{}),o=e.onDone||(()=>{}),c=e.onError||(b=>console.error(b)),l=e.onToolCall;if(!t){c(new Error("sessionId required"));return}if(n==null){c(new Error("message required"));return}let f;try{f=await this._ensureToken()}catch(b){c(b);return}const p=this.endpoint+"/chat/"+encodeURIComponent(t)+"/stream",h={message:n};s&&s.length&&(h.activeTools=s);let g;try{g=await fetch(p,{method:"POST",headers:{Authorization:"Bearer "+f,"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify(h)})}catch(b){c(b);return}if(!g.ok||!g.body){c(new Error("http "+g.status));return}return X(g.body,i,o,c,l)}async _postToolResult(e,t){const n=this._toolCtx();return Ei(n,e,t)}async _resumePendingToolResults(){return Ri(this._toolCtx())}_toolCtx(){const e=this;return{endpoint:this.endpoint,ensureToken:()=>e._ensureToken(),getSessionId:()=>e._chatSessionId,getPending:()=>e._pendingToolCall,setPending:t=>{e._pendingToolCall=t},appendMsg:(t,n,s)=>e._appendMsg(t,n,s),setBusy:t=>e._setBusy(t),sleep:t=>e._sleep(t),appendTyping:()=>e._appendTyping(),getMsgEl:()=>e._widget?.getRefs()?.msgEl||document.createElement("div")}}_extractCtx(){const e=this;return{clientPrefix:this._opts.clientPrefix,getDemoSessionId:()=>e._demoSessionId,getChatSessionId:()=>e._chatSessionId,setChatSessionId:t=>{e._chatSessionId=t},getActiveTools:()=>e._activeTools,setActiveTools:t=>{e._activeTools=t},getExtractOnCall:()=>e._extractOnCall,setExtractOnCall:t=>{e._extractOnCall=t},hasLocalTool:(t,n)=>!!e._tools.get(t,n),registerTools:(t,n)=>e._internalRegister(t,n||[]),sendUserMessage:t=>e._sendUserMessage(t),appendMsg:(t,n)=>e._appendMsg(t,n)}}}function Bi(){return{init:a=>new $i().init(a)}}const vn=Bi();return globalThis.AIAgent=vn,console.info("%c[AIAgent SDK v4.0.0]%c loaded (built __BUILD_TIME__). AIAgent.init({...}) is on window.","background:#3b82f6;color:#fff;padding:2px 6px;border-radius:3px;font-weight:600","color:#6b7280"),vn});
