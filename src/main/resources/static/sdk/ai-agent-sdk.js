(function(z,N){typeof exports=="object"&&typeof module<"u"?module.exports=N():typeof define=="function"&&define.amd?define(N):(z=typeof globalThis<"u"?globalThis:z||self,z.AIAgent=N())})(this,function(){"use strict";var Ts=Object.defineProperty;var ca=z=>{throw TypeError(z)};var _s=(z,N,V)=>N in z?Ts(z,N,{enumerable:!0,configurable:!0,writable:!0,value:V}):z[N]=V;var x=(z,N,V)=>_s(z,typeof N!="symbol"?N+"":N,V),vs=(z,N,V)=>N.has(z)||ca("Cannot "+V);var da=(z,N,V)=>N.has(z)?ca("Cannot add the same private member more than once"):N instanceof WeakSet?N.add(z):N.set(z,V);var qe=(z,N,V)=>(vs(z,N,"access private method"),V);var ce,pa,Yt,ga;function z(i){if(!i)return null;try{const e=i.split(".");if(e.length!==3)return null;let t=e[1].replace(/-/g,"+").replace(/_/g,"/");for(;t.length%4;)t+="=";const n=atob(t),a=JSON.parse(n);return typeof a.exp=="number"?a.exp:null}catch{return null}}class N{constructor(){x(this,"_accessToken",null);x(this,"_expEpoch",0)}async get(e){const t=Math.floor(Date.now()/1e3);if(this._accessToken&&this._expEpoch>t+30)return this._accessToken;console.log("[AIAgent SDK] token missing/near-expiry, calling getAccessToken()...");const n=await e();if(!n||!n.accessToken)throw new Error("getAccessToken() must return { accessToken }");return this._accessToken=n.accessToken,this._expEpoch=z(n.accessToken)||t+300,this._accessToken}}async function V(i,e,t,n,a,s,o,l,c){const g=i.getReader(),p=new TextDecoder;let f="",k=!1;function u(){k||(k=!0,t())}function b(){for(;;){const A=f.indexOf(`

`);if(A<0)return;const v=f.slice(0,A);if(f=f.slice(A+2),!v)continue;const y={},D=v.split(`
`);for(let T=0;T<D.length;T++){const C=D[T],K=C.indexOf(":");if(K<0)continue;const W=C.slice(0,K).trim();let X=C.slice(K+1);X.length>0&&X.charAt(0)===" "&&(X=X.slice(1)),W==="data"?y.data=(y.data?y.data+`
`:"")+X:y[W]=X}if(y.data&&(y.data=y.data.replace(/\\n/g,`
`)),y.event==="tool_call_start"&&typeof o=="function"){try{const T=JSON.parse(y.data||"{}");console.log("[AIAgent SDK 🚀 tool_call_start]",T),o(T)}catch(T){console.error("[AIAgent SDK] tool_call_start parse failed",T,y.data)}continue}if(y.event==="tool_call"&&typeof a=="function"){try{const T=JSON.parse(y.data||"{}");console.log("[AIAgent SDK 🔧 tool_call]",T),a(T)}catch(T){console.error("[AIAgent SDK] tool_call parse failed",T,y.data)}continue}if(y.event==="tool_call_delta"&&typeof s=="function"){try{const T=JSON.parse(y.data||"{}");console.log("[AIAgent SDK 🔧 tool_call_delta]",T),s(T)}catch(T){console.error("[AIAgent SDK] tool_call_delta parse failed",T,y.data)}continue}if(y.event==="tool_call_end"&&typeof l=="function"){try{const T=y.data?JSON.parse(y.data):{};console.log("[AIAgent SDK 🏁 tool_call_end]",T),l(T)}catch{console.log("[AIAgent SDK 🏁 tool_call_end] (no data)"),l({})}continue}if(y.id==="last"){u();continue}if(y.event==="thinking"&&typeof c=="function"){c(y.data||"");continue}y.data!==void 0&&e(y)}}try{for(;;){const A=await g.read();if(A.done)break;f+=p.decode(A.value,{stream:!0}),b()}b(),u()}catch(A){n(A)}}function pt(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}let he=pt();function Kt(i){he=i}const Zt=/[&<>"']/,ua=new RegExp(Zt.source,"g"),Jt=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,ha=new RegExp(Jt.source,"g"),fa={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Xt=i=>fa[i];function Q(i,e){if(e){if(Zt.test(i))return i.replace(ua,Xt)}else if(Jt.test(i))return i.replace(ha,Xt);return i}const ma=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;function ba(i){return i.replace(ma,(e,t)=>(t=t.toLowerCase(),t==="colon"?":":t.charAt(0)==="#"?t.charAt(1)==="x"?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""))}const ka=/(^|[^\[])\^/g;function R(i,e){let t=typeof i=="string"?i:i.source;e=e||"";const n={replace:(a,s)=>{let o=typeof s=="string"?s:s.source;return o=o.replace(ka,"$1"),t=t.replace(a,o),n},getRegex:()=>new RegExp(t,e)};return n}function Vt(i){try{i=encodeURI(i).replace(/%25/g,"%")}catch{return null}return i}const Re={exec:()=>null};function Qt(i,e){const t=i.replace(/\|/g,(s,o,l)=>{let c=!1,g=o;for(;--g>=0&&l[g]==="\\";)c=!c;return c?"|":" |"}),n=t.split(/ \|/);let a=0;if(n[0].trim()||n.shift(),n.length>0&&!n[n.length-1].trim()&&n.pop(),e)if(n.length>e)n.splice(e);else for(;n.length<e;)n.push("");for(;a<n.length;a++)n[a]=n[a].trim().replace(/\\\|/g,"|");return n}function Oe(i,e,t){const n=i.length;if(n===0)return"";let a=0;for(;a<n&&i.charAt(n-a-1)===e;)a++;return i.slice(0,n-a)}function xa(i,e){if(i.indexOf(e[1])===-1)return-1;let t=0;for(let n=0;n<i.length;n++)if(i[n]==="\\")n++;else if(i[n]===e[0])t++;else if(i[n]===e[1]&&(t--,t<0))return n;return-1}function en(i,e,t,n){const a=e.href,s=e.title?Q(e.title):null,o=i[1].replace(/\\([\[\]])/g,"$1");if(i[0].charAt(0)!=="!"){n.state.inLink=!0;const l={type:"link",raw:t,href:a,title:s,text:o,tokens:n.inlineTokens(o)};return n.state.inLink=!1,l}return{type:"image",raw:t,href:a,title:s,text:Q(o)}}function ya(i,e){const t=i.match(/^(\s+)(?:```)/);if(t===null)return e;const n=t[1];return e.split(`
`).map(a=>{const s=a.match(/^\s+/);if(s===null)return a;const[o]=s;return o.length>=n.length?a.slice(n.length):a}).join(`
`)}class je{constructor(e){x(this,"options");x(this,"rules");x(this,"lexer");this.options=e||he}space(e){const t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){const t=this.rules.block.code.exec(e);if(t){const n=t[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?n:Oe(n,`
`)}}}fences(e){const t=this.rules.block.fences.exec(e);if(t){const n=t[0],a=ya(n,t[3]||"");return{type:"code",raw:n,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:a}}}heading(e){const t=this.rules.block.heading.exec(e);if(t){let n=t[2].trim();if(/#$/.test(n)){const a=Oe(n,"#");(this.options.pedantic||!a||/ $/.test(a))&&(n=a.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:n,tokens:this.lexer.inline(n)}}}hr(e){const t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:Oe(t[0],`
`)}}blockquote(e){const t=this.rules.block.blockquote.exec(e);if(t){let n=Oe(t[0],`
`).split(`
`),a="",s="";const o=[];for(;n.length>0;){let l=!1;const c=[];let g;for(g=0;g<n.length;g++)if(/^ {0,3}>/.test(n[g]))c.push(n[g]),l=!0;else if(!l)c.push(n[g]);else break;n=n.slice(g);const p=c.join(`
`),f=p.replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,`
    $1`).replace(/^ {0,3}>[ \t]?/gm,"");a=a?`${a}
${p}`:p,s=s?`${s}
${f}`:f;const k=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(f,o,!0),this.lexer.state.top=k,n.length===0)break;const u=o[o.length-1];if(u?.type==="code")break;if(u?.type==="blockquote"){const b=u,A=b.raw+`
`+n.join(`
`),v=this.blockquote(A);o[o.length-1]=v,a=a.substring(0,a.length-b.raw.length)+v.raw,s=s.substring(0,s.length-b.text.length)+v.text;break}else if(u?.type==="list"){const b=u,A=b.raw+`
`+n.join(`
`),v=this.list(A);o[o.length-1]=v,a=a.substring(0,a.length-u.raw.length)+v.raw,s=s.substring(0,s.length-b.raw.length)+v.raw,n=A.substring(o[o.length-1].raw.length).split(`
`);continue}}return{type:"blockquote",raw:a,tokens:o,text:s}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim();const a=n.length>1,s={type:"list",raw:"",ordered:a,start:a?+n.slice(0,-1):"",loose:!1,items:[]};n=a?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=a?n:"[*+-]");const o=new RegExp(`^( {0,3}${n})((?:[	 ][^\\n]*)?(?:\\n|$))`);let l=!1;for(;e;){let c=!1,g="",p="";if(!(t=o.exec(e))||this.rules.block.hr.test(e))break;g=t[0],e=e.substring(g.length);let f=t[2].split(`
`,1)[0].replace(/^\t+/,y=>" ".repeat(3*y.length)),k=e.split(`
`,1)[0],u=!f.trim(),b=0;if(this.options.pedantic?(b=2,p=f.trimStart()):u?b=t[1].length+1:(b=t[2].search(/[^ ]/),b=b>4?1:b,p=f.slice(b),b+=t[1].length),u&&/^ *$/.test(k)&&(g+=k+`
`,e=e.substring(k.length+1),c=!0),!c){const y=new RegExp(`^ {0,${Math.min(3,b-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),D=new RegExp(`^ {0,${Math.min(3,b-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),T=new RegExp(`^ {0,${Math.min(3,b-1)}}(?:\`\`\`|~~~)`),C=new RegExp(`^ {0,${Math.min(3,b-1)}}#`);for(;e;){const K=e.split(`
`,1)[0];if(k=K,this.options.pedantic&&(k=k.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),T.test(k)||C.test(k)||y.test(k)||D.test(e))break;if(k.search(/[^ ]/)>=b||!k.trim())p+=`
`+k.slice(b);else{if(u||f.search(/[^ ]/)>=4||T.test(f)||C.test(f)||D.test(f))break;p+=`
`+k}!u&&!k.trim()&&(u=!0),g+=K+`
`,e=e.substring(K.length+1),f=k.slice(b)}}s.loose||(l?s.loose=!0:/\n *\n *$/.test(g)&&(l=!0));let A=null,v;this.options.gfm&&(A=/^\[[ xX]\] /.exec(p),A&&(v=A[0]!=="[ ] ",p=p.replace(/^\[[ xX]\] +/,""))),s.items.push({type:"list_item",raw:g,task:!!A,checked:v,loose:!1,text:p,tokens:[]}),s.raw+=g}s.items[s.items.length-1].raw=s.items[s.items.length-1].raw.trimEnd(),s.items[s.items.length-1].text=s.items[s.items.length-1].text.trimEnd(),s.raw=s.raw.trimEnd();for(let c=0;c<s.items.length;c++)if(this.lexer.state.top=!1,s.items[c].tokens=this.lexer.blockTokens(s.items[c].text,[]),!s.loose){const g=s.items[c].tokens.filter(f=>f.type==="space"),p=g.length>0&&g.some(f=>/\n.*\n/.test(f.raw));s.loose=p}if(s.loose)for(let c=0;c<s.items.length;c++)s.items[c].loose=!0;return s}}html(e){const t=this.rules.block.html.exec(e);if(t)return{type:"html",block:!0,raw:t[0],pre:t[1]==="pre"||t[1]==="script"||t[1]==="style",text:t[0]}}def(e){const t=this.rules.block.def.exec(e);if(t){const n=t[1].toLowerCase().replace(/\s+/g," "),a=t[2]?t[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",s=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:n,raw:t[0],href:a,title:s}}}table(e){const t=this.rules.block.table.exec(e);if(!t||!/[:|]/.test(t[2]))return;const n=Qt(t[1]),a=t[2].replace(/^\||\| *$/g,"").split("|"),s=t[3]&&t[3].trim()?t[3].replace(/\n[ \t]*$/,"").split(`
`):[],o={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===a.length){for(const l of a)/^ *-+: *$/.test(l)?o.align.push("right"):/^ *:-+: *$/.test(l)?o.align.push("center"):/^ *:-+ *$/.test(l)?o.align.push("left"):o.align.push(null);for(let l=0;l<n.length;l++)o.header.push({text:n[l],tokens:this.lexer.inline(n[l]),header:!0,align:o.align[l]});for(const l of s)o.rows.push(Qt(l,o.header.length).map((c,g)=>({text:c,tokens:this.lexer.inline(c),header:!1,align:o.align[g]})));return o}}lheading(e){const t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){const t=this.rules.block.paragraph.exec(e);if(t){const n=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:n,tokens:this.lexer.inline(n)}}}text(e){const t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){const t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:Q(t[1])}}tag(e){const t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&/^<a /i.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){const t=this.rules.inline.link.exec(e);if(t){const n=t[2].trim();if(!this.options.pedantic&&/^</.test(n)){if(!/>$/.test(n))return;const o=Oe(n.slice(0,-1),"\\");if((n.length-o.length)%2===0)return}else{const o=xa(t[2],"()");if(o>-1){const c=(t[0].indexOf("!")===0?5:4)+t[1].length+o;t[2]=t[2].substring(0,o),t[0]=t[0].substring(0,c).trim(),t[3]=""}}let a=t[2],s="";if(this.options.pedantic){const o=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(a);o&&(a=o[1],s=o[3])}else s=t[3]?t[3].slice(1,-1):"";return a=a.trim(),/^</.test(a)&&(this.options.pedantic&&!/>$/.test(n)?a=a.slice(1):a=a.slice(1,-1)),en(t,{href:a&&a.replace(this.rules.inline.anyPunctuation,"$1"),title:s&&s.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){const a=(n[2]||n[1]).replace(/\s+/g," "),s=t[a.toLowerCase()];if(!s){const o=n[0].charAt(0);return{type:"text",raw:o,text:o}}return en(n,s,n[0],this.lexer)}}emStrong(e,t,n=""){let a=this.rules.inline.emStrongLDelim.exec(e);if(!a||a[3]&&n.match(/[\p{L}\p{N}]/u))return;if(!(a[1]||a[2]||"")||!n||this.rules.inline.punctuation.exec(n)){const o=[...a[0]].length-1;let l,c,g=o,p=0;const f=a[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(f.lastIndex=0,t=t.slice(-1*e.length+o);(a=f.exec(t))!=null;){if(l=a[1]||a[2]||a[3]||a[4]||a[5]||a[6],!l)continue;if(c=[...l].length,a[3]||a[4]){g+=c;continue}else if((a[5]||a[6])&&o%3&&!((o+c)%3)){p+=c;continue}if(g-=c,g>0)continue;c=Math.min(c,c+g+p);const k=[...a[0]][0].length,u=e.slice(0,o+a.index+k+c);if(Math.min(o,c)%2){const A=u.slice(1,-1);return{type:"em",raw:u,text:A,tokens:this.lexer.inlineTokens(A)}}const b=u.slice(2,-2);return{type:"strong",raw:u,text:b,tokens:this.lexer.inlineTokens(b)}}}}codespan(e){const t=this.rules.inline.code.exec(e);if(t){let n=t[2].replace(/\n/g," ");const a=/[^ ]/.test(n),s=/^ /.test(n)&&/ $/.test(n);return a&&s&&(n=n.substring(1,n.length-1)),n=Q(n,!0),{type:"codespan",raw:t[0],text:n}}}br(e){const t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e){const t=this.rules.inline.del.exec(e);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e){const t=this.rules.inline.autolink.exec(e);if(t){let n,a;return t[2]==="@"?(n=Q(t[1]),a="mailto:"+n):(n=Q(t[1]),a=n),{type:"link",raw:t[0],text:n,href:a,tokens:[{type:"text",raw:n,text:n}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let n,a;if(t[2]==="@")n=Q(t[0]),a="mailto:"+n;else{let s;do s=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??"";while(s!==t[0]);n=Q(t[0]),t[1]==="www."?a="http://"+t[0]:a=t[0]}return{type:"link",raw:t[0],text:n,href:a,tokens:[{type:"text",raw:n,text:n}]}}}inlineText(e){const t=this.rules.inline.text.exec(e);if(t){let n;return this.lexer.state.inRawBlock?n=t[0]:n=Q(t[0]),{type:"text",raw:t[0],text:n}}}}const wa=/^(?: *(?:\n|$))+/,Ta=/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,_a=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,De=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,va=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,tn=/(?:[*+-]|\d{1,9}[.)])/,nn=R(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g,tn).replace(/blockCode/g,/ {4}/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).getRegex(),gt=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Ea=/^[^\n]+/,ut=/(?!\s*\])(?:\\.|[^\[\]\\])+/,Aa=R(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/).replace("label",ut).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Sa=R(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,tn).getRegex(),Ge="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",ht=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Ca=R("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))","i").replace("comment",ht).replace("tag",Ge).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),an=R(gt).replace("hr",De).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Ge).getRegex(),ft={blockquote:R(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",an).getRegex(),code:Ta,def:Aa,fences:_a,heading:va,hr:De,html:Ca,lheading:nn,list:Sa,newline:wa,paragraph:an,table:Re,text:Ea},sn=R("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",De).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Ge).getRegex(),Ia={...ft,table:sn,paragraph:R(gt).replace("hr",De).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",sn).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Ge).getRegex()},Ra={...ft,html:R(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",ht).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Re,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:R(gt).replace("hr",De).replace("heading",` *#{1,6} *[^
]`).replace("lheading",nn).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},on=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Oa=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,rn=/^( {2,}|\\)\n(?!\s*$)/,Da=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Ne="\\p{P}\\p{S}",Na=R(/^((?![*_])[\spunctuation])/,"u").replace(/punctuation/g,Ne).getRegex(),La=/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g,Ma=R(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,"u").replace(/punct/g,Ne).getRegex(),za=R("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])","gu").replace(/punct/g,Ne).getRegex(),Pa=R("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])","gu").replace(/punct/g,Ne).getRegex(),$a=R(/\\([punct])/,"gu").replace(/punct/g,Ne).getRegex(),Ba=R(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Fa=R(ht).replace("(?:-->|$)","-->").getRegex(),Ua=R("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",Fa).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),We=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,Ha=R(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label",We).replace("href",/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),ln=R(/^!?\[(label)\]\[(ref)\]/).replace("label",We).replace("ref",ut).getRegex(),cn=R(/^!?\[(ref)\](?:\[\])?/).replace("ref",ut).getRegex(),qa=R("reflink|nolink(?!\\()","g").replace("reflink",ln).replace("nolink",cn).getRegex(),mt={_backpedal:Re,anyPunctuation:$a,autolink:Ba,blockSkip:La,br:rn,code:Oa,del:Re,emStrongLDelim:Ma,emStrongRDelimAst:za,emStrongRDelimUnd:Pa,escape:on,link:Ha,nolink:cn,punctuation:Na,reflink:ln,reflinkSearch:qa,tag:Ua,text:Da,url:Re},ja={...mt,link:R(/^!?\[(label)\]\((.*?)\)/).replace("label",We).getRegex(),reflink:R(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",We).getRegex()},bt={...mt,escape:R(on).replace("])","~|])").getRegex(),url:R(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},Ga={...bt,br:R(rn).replace("{2,}","*").getRegex(),text:R(bt.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Ye={normal:ft,gfm:Ia,pedantic:Ra},Le={normal:mt,gfm:bt,breaks:Ga,pedantic:ja};class ne{constructor(e){x(this,"tokens");x(this,"options");x(this,"state");x(this,"tokenizer");x(this,"inlineQueue");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||he,this.options.tokenizer=this.options.tokenizer||new je,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const t={block:Ye.normal,inline:Le.normal};this.options.pedantic?(t.block=Ye.pedantic,t.inline=Le.pedantic):this.options.gfm&&(t.block=Ye.gfm,this.options.breaks?t.inline=Le.breaks:t.inline=Le.gfm),this.tokenizer.rules=t}static get rules(){return{block:Ye,inline:Le}}static lex(e,t){return new ne(t).lex(e)}static lexInline(e,t){return new ne(t).inlineTokens(e)}lex(e){e=e.replace(/\r\n|\r/g,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){const n=this.inlineQueue[t];this.inlineTokens(n.src,n.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){this.options.pedantic?e=e.replace(/\t/g,"    ").replace(/^ +$/gm,""):e=e.replace(/^( *)(\t+)/gm,(l,c,g)=>c+"    ".repeat(g.length));let a,s,o;for(;e;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(l=>(a=l.call({lexer:this},e,t))?(e=e.substring(a.raw.length),t.push(a),!0):!1))){if(a=this.tokenizer.space(e)){e=e.substring(a.raw.length),a.raw.length===1&&t.length>0?t[t.length-1].raw+=`
`:t.push(a);continue}if(a=this.tokenizer.code(e)){e=e.substring(a.raw.length),s=t[t.length-1],s&&(s.type==="paragraph"||s.type==="text")?(s.raw+=`
`+a.raw,s.text+=`
`+a.text,this.inlineQueue[this.inlineQueue.length-1].src=s.text):t.push(a);continue}if(a=this.tokenizer.fences(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.heading(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.hr(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.blockquote(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.list(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.html(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.def(e)){e=e.substring(a.raw.length),s=t[t.length-1],s&&(s.type==="paragraph"||s.type==="text")?(s.raw+=`
`+a.raw,s.text+=`
`+a.raw,this.inlineQueue[this.inlineQueue.length-1].src=s.text):this.tokens.links[a.tag]||(this.tokens.links[a.tag]={href:a.href,title:a.title});continue}if(a=this.tokenizer.table(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.lheading(e)){e=e.substring(a.raw.length),t.push(a);continue}if(o=e,this.options.extensions&&this.options.extensions.startBlock){let l=1/0;const c=e.slice(1);let g;this.options.extensions.startBlock.forEach(p=>{g=p.call({lexer:this},c),typeof g=="number"&&g>=0&&(l=Math.min(l,g))}),l<1/0&&l>=0&&(o=e.substring(0,l+1))}if(this.state.top&&(a=this.tokenizer.paragraph(o))){s=t[t.length-1],n&&s?.type==="paragraph"?(s.raw+=`
`+a.raw,s.text+=`
`+a.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=s.text):t.push(a),n=o.length!==e.length,e=e.substring(a.raw.length);continue}if(a=this.tokenizer.text(e)){e=e.substring(a.raw.length),s=t[t.length-1],s&&s.type==="text"?(s.raw+=`
`+a.raw,s.text+=`
`+a.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=s.text):t.push(a);continue}if(e){const l="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(l);break}else throw new Error(l)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n,a,s,o=e,l,c,g;if(this.tokens.links){const p=Object.keys(this.tokens.links);if(p.length>0)for(;(l=this.tokenizer.rules.inline.reflinkSearch.exec(o))!=null;)p.includes(l[0].slice(l[0].lastIndexOf("[")+1,-1))&&(o=o.slice(0,l.index)+"["+"a".repeat(l[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(l=this.tokenizer.rules.inline.blockSkip.exec(o))!=null;)o=o.slice(0,l.index)+"["+"a".repeat(l[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;(l=this.tokenizer.rules.inline.anyPunctuation.exec(o))!=null;)o=o.slice(0,l.index)+"++"+o.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;e;)if(c||(g=""),c=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(p=>(n=p.call({lexer:this},e,t))?(e=e.substring(n.raw.length),t.push(n),!0):!1))){if(n=this.tokenizer.escape(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.tag(e)){e=e.substring(n.raw.length),a=t[t.length-1],a&&n.type==="text"&&a.type==="text"?(a.raw+=n.raw,a.text+=n.text):t.push(n);continue}if(n=this.tokenizer.link(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(n.raw.length),a=t[t.length-1],a&&n.type==="text"&&a.type==="text"?(a.raw+=n.raw,a.text+=n.text):t.push(n);continue}if(n=this.tokenizer.emStrong(e,o,g)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.codespan(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.br(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.del(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.autolink(e)){e=e.substring(n.raw.length),t.push(n);continue}if(!this.state.inLink&&(n=this.tokenizer.url(e))){e=e.substring(n.raw.length),t.push(n);continue}if(s=e,this.options.extensions&&this.options.extensions.startInline){let p=1/0;const f=e.slice(1);let k;this.options.extensions.startInline.forEach(u=>{k=u.call({lexer:this},f),typeof k=="number"&&k>=0&&(p=Math.min(p,k))}),p<1/0&&p>=0&&(s=e.substring(0,p+1))}if(n=this.tokenizer.inlineText(s)){e=e.substring(n.raw.length),n.raw.slice(-1)!=="_"&&(g=n.raw.slice(-1)),c=!0,a=t[t.length-1],a&&a.type==="text"?(a.raw+=n.raw,a.text+=n.text):t.push(n);continue}if(e){const p="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(p);break}else throw new Error(p)}}return t}}class Ke{constructor(e){x(this,"options");x(this,"parser");this.options=e||he}space(e){return""}code({text:e,lang:t,escaped:n}){const a=(t||"").match(/^\S*/)?.[0],s=e.replace(/\n$/,"")+`
`;return a?'<pre><code class="language-'+Q(a)+'">'+(n?s:Q(s,!0))+`</code></pre>
`:"<pre><code>"+(n?s:Q(s,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){const t=e.ordered,n=e.start;let a="";for(let l=0;l<e.items.length;l++){const c=e.items[l];a+=this.listitem(c)}const s=t?"ol":"ul",o=t&&n!==1?' start="'+n+'"':"";return"<"+s+o+`>
`+a+"</"+s+`>
`}listitem(e){let t="";if(e.task){const n=this.checkbox({checked:!!e.checked});e.loose?e.tokens.length>0&&e.tokens[0].type==="paragraph"?(e.tokens[0].text=n+" "+e.tokens[0].text,e.tokens[0].tokens&&e.tokens[0].tokens.length>0&&e.tokens[0].tokens[0].type==="text"&&(e.tokens[0].tokens[0].text=n+" "+e.tokens[0].tokens[0].text)):e.tokens.unshift({type:"text",raw:n+" ",text:n+" "}):t+=n+" "}return t+=this.parser.parse(e.tokens,!!e.loose),`<li>${t}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t="",n="";for(let s=0;s<e.header.length;s++)n+=this.tablecell(e.header[s]);t+=this.tablerow({text:n});let a="";for(let s=0;s<e.rows.length;s++){const o=e.rows[s];n="";for(let l=0;l<o.length;l++)n+=this.tablecell(o[l]);a+=this.tablerow({text:n})}return a&&(a=`<tbody>${a}</tbody>`),`<table>
<thead>
`+t+`</thead>
`+a+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){const t=this.parser.parseInline(e.tokens),n=e.header?"th":"td";return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${e}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){const a=this.parser.parseInline(n),s=Vt(e);if(s===null)return a;e=s;let o='<a href="'+e+'"';return t&&(o+=' title="'+t+'"'),o+=">"+a+"</a>",o}image({href:e,title:t,text:n}){const a=Vt(e);if(a===null)return n;e=a;let s=`<img src="${e}" alt="${n}"`;return t&&(s+=` title="${t}"`),s+=">",s}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):e.text}}class kt{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}}class ae{constructor(e){x(this,"options");x(this,"renderer");x(this,"textRenderer");this.options=e||he,this.options.renderer=this.options.renderer||new Ke,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new kt}static parse(e,t){return new ae(t).parse(e)}static parseInline(e,t){return new ae(t).parseInline(e)}parse(e,t=!0){let n="";for(let a=0;a<e.length;a++){const s=e[a];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[s.type]){const l=s,c=this.options.extensions.renderers[l.type].call({parser:this},l);if(c!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(l.type)){n+=c||"";continue}}const o=s;switch(o.type){case"space":{n+=this.renderer.space(o);continue}case"hr":{n+=this.renderer.hr(o);continue}case"heading":{n+=this.renderer.heading(o);continue}case"code":{n+=this.renderer.code(o);continue}case"table":{n+=this.renderer.table(o);continue}case"blockquote":{n+=this.renderer.blockquote(o);continue}case"list":{n+=this.renderer.list(o);continue}case"html":{n+=this.renderer.html(o);continue}case"paragraph":{n+=this.renderer.paragraph(o);continue}case"text":{let l=o,c=this.renderer.text(l);for(;a+1<e.length&&e[a+1].type==="text";)l=e[++a],c+=`
`+this.renderer.text(l);t?n+=this.renderer.paragraph({type:"paragraph",raw:c,text:c,tokens:[{type:"text",raw:c,text:c}]}):n+=c;continue}default:{const l='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return n}parseInline(e,t){t=t||this.renderer;let n="";for(let a=0;a<e.length;a++){const s=e[a];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[s.type]){const l=this.options.extensions.renderers[s.type].call({parser:this},s);if(l!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(s.type)){n+=l||"";continue}}const o=s;switch(o.type){case"escape":{n+=t.text(o);break}case"html":{n+=t.html(o);break}case"link":{n+=t.link(o);break}case"image":{n+=t.image(o);break}case"strong":{n+=t.strong(o);break}case"em":{n+=t.em(o);break}case"codespan":{n+=t.codespan(o);break}case"br":{n+=t.br(o);break}case"del":{n+=t.del(o);break}case"text":{n+=t.text(o);break}default:{const l='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return n}}class Me{constructor(e){x(this,"options");this.options=e||he}preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}}x(Me,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens"]));class Wa{constructor(...e){da(this,ce);x(this,"defaults",pt());x(this,"options",this.setOptions);x(this,"parse",qe(this,ce,Yt).call(this,ne.lex,ae.parse));x(this,"parseInline",qe(this,ce,Yt).call(this,ne.lexInline,ae.parseInline));x(this,"Parser",ae);x(this,"Renderer",Ke);x(this,"TextRenderer",kt);x(this,"Lexer",ne);x(this,"Tokenizer",je);x(this,"Hooks",Me);this.use(...e)}walkTokens(e,t){let n=[];for(const a of e)switch(n=n.concat(t.call(this,a)),a.type){case"table":{const s=a;for(const o of s.header)n=n.concat(this.walkTokens(o.tokens,t));for(const o of s.rows)for(const l of o)n=n.concat(this.walkTokens(l.tokens,t));break}case"list":{const s=a;n=n.concat(this.walkTokens(s.items,t));break}default:{const s=a;this.defaults.extensions?.childTokens?.[s.type]?this.defaults.extensions.childTokens[s.type].forEach(o=>{const l=s[o].flat(1/0);n=n.concat(this.walkTokens(l,t))}):s.tokens&&(n=n.concat(this.walkTokens(s.tokens,t)))}}return n}use(...e){const t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(n=>{const a={...n};if(a.async=this.defaults.async||a.async||!1,n.extensions&&(n.extensions.forEach(s=>{if(!s.name)throw new Error("extension name required");if("renderer"in s){const o=t.renderers[s.name];o?t.renderers[s.name]=function(...l){let c=s.renderer.apply(this,l);return c===!1&&(c=o.apply(this,l)),c}:t.renderers[s.name]=s.renderer}if("tokenizer"in s){if(!s.level||s.level!=="block"&&s.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");const o=t[s.level];o?o.unshift(s.tokenizer):t[s.level]=[s.tokenizer],s.start&&(s.level==="block"?t.startBlock?t.startBlock.push(s.start):t.startBlock=[s.start]:s.level==="inline"&&(t.startInline?t.startInline.push(s.start):t.startInline=[s.start]))}"childTokens"in s&&s.childTokens&&(t.childTokens[s.name]=s.childTokens)}),a.extensions=t),n.renderer){const s=this.defaults.renderer||new Ke(this.defaults);for(const o in n.renderer){if(!(o in s))throw new Error(`renderer '${o}' does not exist`);if(["options","parser"].includes(o))continue;const l=o;let c=n.renderer[l];n.useNewRenderer||(c=qe(this,ce,pa).call(this,c,l,s));const g=s[l];s[l]=(...p)=>{let f=c.apply(s,p);return f===!1&&(f=g.apply(s,p)),f||""}}a.renderer=s}if(n.tokenizer){const s=this.defaults.tokenizer||new je(this.defaults);for(const o in n.tokenizer){if(!(o in s))throw new Error(`tokenizer '${o}' does not exist`);if(["options","rules","lexer"].includes(o))continue;const l=o,c=n.tokenizer[l],g=s[l];s[l]=(...p)=>{let f=c.apply(s,p);return f===!1&&(f=g.apply(s,p)),f}}a.tokenizer=s}if(n.hooks){const s=this.defaults.hooks||new Me;for(const o in n.hooks){if(!(o in s))throw new Error(`hook '${o}' does not exist`);if(o==="options")continue;const l=o,c=n.hooks[l],g=s[l];Me.passThroughHooks.has(o)?s[l]=p=>{if(this.defaults.async)return Promise.resolve(c.call(s,p)).then(k=>g.call(s,k));const f=c.call(s,p);return g.call(s,f)}:s[l]=(...p)=>{let f=c.apply(s,p);return f===!1&&(f=g.apply(s,p)),f}}a.hooks=s}if(n.walkTokens){const s=this.defaults.walkTokens,o=n.walkTokens;a.walkTokens=function(l){let c=[];return c.push(o.call(this,l)),s&&(c=c.concat(s.call(this,l))),c}}this.defaults={...this.defaults,...a}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return ne.lex(e,t??this.defaults)}parser(e,t){return ae.parse(e,t??this.defaults)}}ce=new WeakSet,pa=function(e,t,n){switch(t){case"heading":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,n.parser.parseInline(a.tokens),a.depth,ba(n.parser.parseInline(a.tokens,n.parser.textRenderer)))};case"code":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text,a.lang,!!a.escaped)};case"table":return function(a){if(!a.type||a.type!==t)return e.apply(this,arguments);let s="",o="";for(let c=0;c<a.header.length;c++)o+=this.tablecell({text:a.header[c].text,tokens:a.header[c].tokens,header:!0,align:a.align[c]});s+=this.tablerow({text:o});let l="";for(let c=0;c<a.rows.length;c++){const g=a.rows[c];o="";for(let p=0;p<g.length;p++)o+=this.tablecell({text:g[p].text,tokens:g[p].tokens,header:!1,align:a.align[p]});l+=this.tablerow({text:o})}return e.call(this,s,l)};case"blockquote":return function(a){if(!a.type||a.type!==t)return e.apply(this,arguments);const s=this.parser.parse(a.tokens);return e.call(this,s)};case"list":return function(a){if(!a.type||a.type!==t)return e.apply(this,arguments);const s=a.ordered,o=a.start,l=a.loose;let c="";for(let g=0;g<a.items.length;g++){const p=a.items[g],f=p.checked,k=p.task;let u="";if(p.task){const b=this.checkbox({checked:!!f});l?p.tokens.length>0&&p.tokens[0].type==="paragraph"?(p.tokens[0].text=b+" "+p.tokens[0].text,p.tokens[0].tokens&&p.tokens[0].tokens.length>0&&p.tokens[0].tokens[0].type==="text"&&(p.tokens[0].tokens[0].text=b+" "+p.tokens[0].tokens[0].text)):p.tokens.unshift({type:"text",text:b+" "}):u+=b+" "}u+=this.parser.parse(p.tokens,l),c+=this.listitem({type:"list_item",raw:u,text:u,task:k,checked:!!f,loose:l,tokens:p.tokens})}return e.call(this,c,s,o)};case"html":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text,a.block)};case"paragraph":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"escape":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text)};case"link":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.href,a.title,this.parser.parseInline(a.tokens))};case"image":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.href,a.title,a.text)};case"strong":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"em":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"codespan":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text)};case"del":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"text":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text)}}return e},Yt=function(e,t){return(n,a)=>{const s={...a},o={...this.defaults,...s};this.defaults.async===!0&&s.async===!1&&(o.silent||console.warn("marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored."),o.async=!0);const l=qe(this,ce,ga).call(this,!!o.silent,!!o.async);if(typeof n>"u"||n===null)return l(new Error("marked(): input parameter is undefined or null"));if(typeof n!="string")return l(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(n)+", string expected"));if(o.hooks&&(o.hooks.options=o),o.async)return Promise.resolve(o.hooks?o.hooks.preprocess(n):n).then(c=>e(c,o)).then(c=>o.hooks?o.hooks.processAllTokens(c):c).then(c=>o.walkTokens?Promise.all(this.walkTokens(c,o.walkTokens)).then(()=>c):c).then(c=>t(c,o)).then(c=>o.hooks?o.hooks.postprocess(c):c).catch(l);try{o.hooks&&(n=o.hooks.preprocess(n));let c=e(n,o);o.hooks&&(c=o.hooks.processAllTokens(c)),o.walkTokens&&this.walkTokens(c,o.walkTokens);let g=t(c,o);return o.hooks&&(g=o.hooks.postprocess(g)),g}catch(c){return l(c)}}},ga=function(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){const a="<p>An error occurred:</p><pre>"+Q(n.message+"",!0)+"</pre>";return t?Promise.resolve(a):a}if(t)return Promise.reject(n);throw n}};const fe=new Wa;function I(i,e){return fe.parse(i,e)}I.options=I.setOptions=function(i){return fe.setOptions(i),I.defaults=fe.defaults,Kt(I.defaults),I},I.getDefaults=pt,I.defaults=he,I.use=function(...i){return fe.use(...i),I.defaults=fe.defaults,Kt(I.defaults),I},I.walkTokens=function(i,e){return fe.walkTokens(i,e)},I.parseInline=fe.parseInline,I.Parser=ae,I.parser=ae.parse,I.Renderer=Ke,I.TextRenderer=kt,I.Lexer=ne,I.lexer=ne.lex,I.Tokenizer=je,I.Hooks=Me,I.parse=I,I.options,I.setOptions,I.use,I.walkTokens,I.parseInline,ae.parse,ne.lex;/*! @license DOMPurify 3.4.9 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.9/LICENSE */function dn(i,e){(e==null||e>i.length)&&(e=i.length);for(var t=0,n=Array(e);t<e;t++)n[t]=i[t];return n}function Ya(i){if(Array.isArray(i))return i}function Ka(i,e){var t=i==null?null:typeof Symbol<"u"&&i[Symbol.iterator]||i["@@iterator"];if(t!=null){var n,a,s,o,l=[],c=!0,g=!1;try{if(s=(t=t.call(i)).next,e!==0)for(;!(c=(n=s.call(t)).done)&&(l.push(n.value),l.length!==e);c=!0);}catch(p){g=!0,a=p}finally{try{if(!c&&t.return!=null&&(o=t.return(),Object(o)!==o))return}finally{if(g)throw a}}return l}}function Za(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Ja(i,e){return Ya(i)||Ka(i,e)||Xa(i,e)||Za()}function Xa(i,e){if(i){if(typeof i=="string")return dn(i,e);var t={}.toString.call(i).slice(8,-1);return t==="Object"&&i.constructor&&(t=i.constructor.name),t==="Map"||t==="Set"?Array.from(i):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?dn(i,e):void 0}}const pn=Object.entries,gn=Object.setPrototypeOf,Va=Object.isFrozen,Qa=Object.getPrototypeOf,ei=Object.getOwnPropertyDescriptor;let Z=Object.freeze,ee=Object.seal,xe=Object.create,un=typeof Reflect<"u"&&Reflect,xt=un.apply,yt=un.construct;Z||(Z=function(e){return e}),ee||(ee=function(e){return e}),xt||(xt=function(e,t){for(var n=arguments.length,a=new Array(n>2?n-2:0),s=2;s<n;s++)a[s-2]=arguments[s];return e.apply(t,a)}),yt||(yt=function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),a=1;a<t;a++)n[a-1]=arguments[a];return new e(...n)});const le=U(Array.prototype.forEach),ti=U(Array.prototype.lastIndexOf),hn=U(Array.prototype.pop),ye=U(Array.prototype.push),ni=U(Array.prototype.splice),J=Array.isArray,ze=U(String.prototype.toLowerCase),wt=U(String.prototype.toString),fn=U(String.prototype.match),we=U(String.prototype.replace),mn=U(String.prototype.indexOf),ai=U(String.prototype.trim),ii=U(Number.prototype.toString),si=U(Boolean.prototype.toString),bn=typeof BigInt>"u"?null:U(BigInt.prototype.toString),kn=typeof Symbol>"u"?null:U(Symbol.prototype.toString),L=U(Object.prototype.hasOwnProperty),Pe=U(Object.prototype.toString),G=U(RegExp.prototype.test),me=oi(TypeError);function U(i){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var t=arguments.length,n=new Array(t>1?t-1:0),a=1;a<t;a++)n[a-1]=arguments[a];return xt(i,e,n)}}function oi(i){return function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return yt(i,t)}}function E(i,e){let t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:ze;if(gn&&gn(i,null),!J(e))return i;let n=e.length;for(;n--;){let a=e[n];if(typeof a=="string"){const s=t(a);s!==a&&(Va(e)||(e[n]=s),a=s)}i[a]=!0}return i}function ri(i){for(let e=0;e<i.length;e++)L(i,e)||(i[e]=null);return i}function Y(i){const e=xe(null);for(const n of pn(i)){var t=Ja(n,2);const a=t[0],s=t[1];L(i,a)&&(J(s)?e[a]=ri(s):s&&typeof s=="object"&&s.constructor===Object?e[a]=Y(s):e[a]=s)}return e}function li(i){switch(typeof i){case"string":return i;case"number":return ii(i);case"boolean":return si(i);case"bigint":return bn?bn(i):"0";case"symbol":return kn?kn(i):"Symbol()";case"undefined":return Pe(i);case"function":case"object":{if(i===null)return Pe(i);const e=i,t=ie(e,"toString");if(typeof t=="function"){const n=t(e);return typeof n=="string"?n:Pe(n)}return Pe(i)}default:return Pe(i)}}function ie(i,e){for(;i!==null;){const n=ei(i,e);if(n){if(n.get)return U(n.get);if(typeof n.value=="function")return U(n.value)}i=Qa(i)}function t(){return null}return t}function ci(i){try{return G(i,""),!0}catch{return!1}}const xn=Z(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),Tt=Z(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),_t=Z(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),di=Z(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),vt=Z(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),pi=Z(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),yn=Z(["#text"]),wn=Z(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),Et=Z(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),Tn=Z(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),Ze=Z(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),gi=ee(/{{[\w\W]*|^[\w\W]*}}/g),ui=ee(/<%[\w\W]*|^[\w\W]*%>/g),hi=ee(/\${[\w\W]*/g),fi=ee(/^data-[\-\w.\u00B7-\uFFFF]+$/),mi=ee(/^aria-[\-\w]+$/),_n=ee(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),bi=ee(/^(?:\w+script|data):/i),ki=ee(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),xi=ee(/^html$/i),yi=ee(/^[a-z][.\w]*(-[.\w]+)+$/i),se={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,progressingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},wi=function(){return typeof window>"u"?null:window},Ti=function(e,t){if(typeof e!="object"||typeof e.createPolicy!="function")return null;let n=null;const a="data-tt-policy-suffix";t&&t.hasAttribute(a)&&(n=t.getAttribute(a));const s="dompurify"+(n?"#"+n:"");try{return e.createPolicy(s,{createHTML(o){return o},createScriptURL(o){return o}})}catch{return console.warn("TrustedTypes policy "+s+" could not be created."),null}},vn=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function En(){let i=arguments.length>0&&arguments[0]!==void 0?arguments[0]:wi();const e=m=>En(m);if(e.version="3.4.9",e.removed=[],!i||!i.document||i.document.nodeType!==se.document||!i.Element)return e.isSupported=!1,e;let t=i.document;const n=t,a=n.currentScript;i.DocumentFragment;const s=i.HTMLTemplateElement,o=i.Node,l=i.Element,c=i.NodeFilter,g=i.NamedNodeMap;g===void 0&&(i.NamedNodeMap||i.MozNamedAttrMap),i.HTMLFormElement;const p=i.DOMParser,f=i.trustedTypes,k=l.prototype,u=ie(k,"cloneNode"),b=ie(k,"remove"),A=ie(k,"nextSibling"),v=ie(k,"childNodes"),y=ie(k,"parentNode"),D=ie(k,"shadowRoot"),T=ie(k,"attributes"),C=o&&o.prototype?ie(o.prototype,"nodeType"):null,K=o&&o.prototype?ie(o.prototype,"nodeName"):null;if(typeof s=="function"){const m=t.createElement("template");m.content&&m.content.ownerDocument&&(t=m.content.ownerDocument)}let W,X="",It,Pn=!1,$e=0;const $n=function(){if($e>0)throw me('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')},ve=function(r){$n(),$e++;try{return W.createHTML(r)}finally{$e--}},is=function(r){$n(),$e++;try{return W.createScriptURL(r)}finally{$e--}},ss=function(){return Pn||(It=Ti(f,a),Pn=!0),It},et=t,Rt=et.implementation,Bn=et.createNodeIterator,os=et.createDocumentFragment,rs=et.getElementsByTagName,ls=n.importNode;let q=vn();e.isSupported=typeof pn=="function"&&typeof y=="function"&&Rt&&Rt.createHTMLDocument!==void 0;const tt=gi,nt=ui,at=hi,cs=fi,ds=mi,ps=bi,Fn=ki,gs=yi;let Un=_n,P=null;const Ot=E({},[...xn,...Tt,..._t,...vt,...yn]);let $=null;const Dt=E({},[...wn,...Et,...Tn,...Ze]);let B=Object.seal(xe(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Be=null,it=null;const pe=Object.seal(xe(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let Hn=!0,Nt=!0,qn=!1,jn=!0,ge=!1,Fe=!0,be=!1,Lt=!1,Mt=!1,Ee=!1,st=!1,ot=!1,Gn=!0,Wn=!1;const Yn="user-content-";let zt=!0,Pt=!1,Ae={},oe=null;const $t=E({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]);let Kn=null;const Zn=E({},["audio","video","img","source","image","track"]);let Bt=null;const Jn=E({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),rt="http://www.w3.org/1998/Math/MathML",lt="http://www.w3.org/2000/svg",re="http://www.w3.org/1999/xhtml";let Se=re,Ft=!1,Ut=null;const us=E({},[rt,lt,re],wt);let Ht=E({},["mi","mo","mn","ms","mtext"]),qt=E({},["annotation-xml"]);const hs=E({},["title","style","font","a","script"]);let Ue=null;const fs=["application/xhtml+xml","text/html"],ms="text/html";let M=null,Ce=null;const bs=t.createElement("form"),Xn=function(r){return r instanceof RegExp||r instanceof Function},jt=function(){let r=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(Ce&&Ce===r)return;(!r||typeof r!="object")&&(r={}),r=Y(r),Ue=fs.indexOf(r.PARSER_MEDIA_TYPE)===-1?ms:r.PARSER_MEDIA_TYPE,M=Ue==="application/xhtml+xml"?wt:ze,P=L(r,"ALLOWED_TAGS")&&J(r.ALLOWED_TAGS)?E({},r.ALLOWED_TAGS,M):Ot,$=L(r,"ALLOWED_ATTR")&&J(r.ALLOWED_ATTR)?E({},r.ALLOWED_ATTR,M):Dt,Ut=L(r,"ALLOWED_NAMESPACES")&&J(r.ALLOWED_NAMESPACES)?E({},r.ALLOWED_NAMESPACES,wt):us,Bt=L(r,"ADD_URI_SAFE_ATTR")&&J(r.ADD_URI_SAFE_ATTR)?E(Y(Jn),r.ADD_URI_SAFE_ATTR,M):Jn,Kn=L(r,"ADD_DATA_URI_TAGS")&&J(r.ADD_DATA_URI_TAGS)?E(Y(Zn),r.ADD_DATA_URI_TAGS,M):Zn,oe=L(r,"FORBID_CONTENTS")&&J(r.FORBID_CONTENTS)?E({},r.FORBID_CONTENTS,M):$t,Be=L(r,"FORBID_TAGS")&&J(r.FORBID_TAGS)?E({},r.FORBID_TAGS,M):Y({}),it=L(r,"FORBID_ATTR")&&J(r.FORBID_ATTR)?E({},r.FORBID_ATTR,M):Y({}),Ae=L(r,"USE_PROFILES")?r.USE_PROFILES&&typeof r.USE_PROFILES=="object"?Y(r.USE_PROFILES):r.USE_PROFILES:!1,Hn=r.ALLOW_ARIA_ATTR!==!1,Nt=r.ALLOW_DATA_ATTR!==!1,qn=r.ALLOW_UNKNOWN_PROTOCOLS||!1,jn=r.ALLOW_SELF_CLOSE_IN_ATTR!==!1,ge=r.SAFE_FOR_TEMPLATES||!1,Fe=r.SAFE_FOR_XML!==!1,be=r.WHOLE_DOCUMENT||!1,Ee=r.RETURN_DOM||!1,st=r.RETURN_DOM_FRAGMENT||!1,ot=r.RETURN_TRUSTED_TYPE||!1,Mt=r.FORCE_BODY||!1,Gn=r.SANITIZE_DOM!==!1,Wn=r.SANITIZE_NAMED_PROPS||!1,zt=r.KEEP_CONTENT!==!1,Pt=r.IN_PLACE||!1,Un=ci(r.ALLOWED_URI_REGEXP)?r.ALLOWED_URI_REGEXP:_n,Se=typeof r.NAMESPACE=="string"?r.NAMESPACE:re,Ht=L(r,"MATHML_TEXT_INTEGRATION_POINTS")&&r.MATHML_TEXT_INTEGRATION_POINTS&&typeof r.MATHML_TEXT_INTEGRATION_POINTS=="object"?Y(r.MATHML_TEXT_INTEGRATION_POINTS):E({},["mi","mo","mn","ms","mtext"]),qt=L(r,"HTML_INTEGRATION_POINTS")&&r.HTML_INTEGRATION_POINTS&&typeof r.HTML_INTEGRATION_POINTS=="object"?Y(r.HTML_INTEGRATION_POINTS):E({},["annotation-xml"]);const d=L(r,"CUSTOM_ELEMENT_HANDLING")&&r.CUSTOM_ELEMENT_HANDLING&&typeof r.CUSTOM_ELEMENT_HANDLING=="object"?Y(r.CUSTOM_ELEMENT_HANDLING):xe(null);if(B=xe(null),L(d,"tagNameCheck")&&Xn(d.tagNameCheck)&&(B.tagNameCheck=d.tagNameCheck),L(d,"attributeNameCheck")&&Xn(d.attributeNameCheck)&&(B.attributeNameCheck=d.attributeNameCheck),L(d,"allowCustomizedBuiltInElements")&&typeof d.allowCustomizedBuiltInElements=="boolean"&&(B.allowCustomizedBuiltInElements=d.allowCustomizedBuiltInElements),ge&&(Nt=!1),st&&(Ee=!0),Ae&&(P=E({},yn),$=xe(null),Ae.html===!0&&(E(P,xn),E($,wn)),Ae.svg===!0&&(E(P,Tt),E($,Et),E($,Ze)),Ae.svgFilters===!0&&(E(P,_t),E($,Et),E($,Ze)),Ae.mathMl===!0&&(E(P,vt),E($,Tn),E($,Ze))),pe.tagCheck=null,pe.attributeCheck=null,L(r,"ADD_TAGS")&&(typeof r.ADD_TAGS=="function"?pe.tagCheck=r.ADD_TAGS:J(r.ADD_TAGS)&&(P===Ot&&(P=Y(P)),E(P,r.ADD_TAGS,M))),L(r,"ADD_ATTR")&&(typeof r.ADD_ATTR=="function"?pe.attributeCheck=r.ADD_ATTR:J(r.ADD_ATTR)&&($===Dt&&($=Y($)),E($,r.ADD_ATTR,M))),L(r,"ADD_URI_SAFE_ATTR")&&J(r.ADD_URI_SAFE_ATTR)&&E(Bt,r.ADD_URI_SAFE_ATTR,M),L(r,"FORBID_CONTENTS")&&J(r.FORBID_CONTENTS)&&(oe===$t&&(oe=Y(oe)),E(oe,r.FORBID_CONTENTS,M)),L(r,"ADD_FORBID_CONTENTS")&&J(r.ADD_FORBID_CONTENTS)&&(oe===$t&&(oe=Y(oe)),E(oe,r.ADD_FORBID_CONTENTS,M)),zt&&(P["#text"]=!0),be&&E(P,["html","head","body"]),P.table&&(E(P,["tbody"]),delete Be.tbody),r.TRUSTED_TYPES_POLICY){if(typeof r.TRUSTED_TYPES_POLICY.createHTML!="function")throw me('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof r.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw me('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');const h=W;W=r.TRUSTED_TYPES_POLICY;try{X=ve("")}catch(w){throw W=h,w}}else r.TRUSTED_TYPES_POLICY===null?(W=void 0,X=""):(W===void 0&&(W=ss()),W&&typeof X=="string"&&(X=ve("")));(q.uponSanitizeElement.length>0||q.uponSanitizeAttribute.length>0)&&P===Ot&&(P=Y(P)),q.uponSanitizeAttribute.length>0&&$===Dt&&($=Y($)),Z&&Z(r),Ce=r},Vn=E({},[...Tt,..._t,...di]),Qn=E({},[...vt,...pi]),ks=function(r){let d=y(r);(!d||!d.tagName)&&(d={namespaceURI:Se,tagName:"template"});const h=ze(r.tagName),w=ze(d.tagName);return Ut[r.namespaceURI]?r.namespaceURI===lt?d.namespaceURI===re?h==="svg":d.namespaceURI===rt?h==="svg"&&(w==="annotation-xml"||Ht[w]):!!Vn[h]:r.namespaceURI===rt?d.namespaceURI===re?h==="math":d.namespaceURI===lt?h==="math"&&qt[w]:!!Qn[h]:r.namespaceURI===re?d.namespaceURI===lt&&!qt[w]||d.namespaceURI===rt&&!Ht[w]?!1:!Qn[h]&&(hs[h]||!Vn[h]):!!(Ue==="application/xhtml+xml"&&Ut[r.namespaceURI]):!1},te=function(r){ye(e.removed,{element:r});try{y(r).removeChild(r)}catch{if(b(r),!y(r))throw me("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")}},ea=function(r){const d=v?v(r):r.childNodes;if(d){const w=[];le(d,_=>{ye(w,_)}),le(w,_=>{try{b(_)}catch{}})}const h=T?T(r):null;if(h)for(let w=h.length-1;w>=0;--w){const _=h[w],S=_&&_.name;if(typeof S=="string")try{r.removeAttribute(S)}catch{}}},ke=function(r,d){try{ye(e.removed,{attribute:d.getAttributeNode(r),from:d})}catch{ye(e.removed,{attribute:null,from:d})}if(d.removeAttribute(r),r==="is")if(Ee||st)try{te(d)}catch{}else try{d.setAttribute(r,"")}catch{}},xs=function(r){const d=T?T(r):r.attributes;if(d)for(let h=d.length-1;h>=0;--h){const w=d[h],_=w&&w.name;if(!(typeof _!="string"||$[M(_)]))try{r.removeAttribute(_)}catch{}}},ys=function(r){const d=[r];for(;d.length>0;){const h=d.pop();(C?C(h):h.nodeType)===se.element&&xs(h);const _=v?v(h):h.childNodes;if(_)for(let S=_.length-1;S>=0;--S)d.push(_[S])}},ta=function(r){let d=null,h=null;if(Mt)r="<remove></remove>"+r;else{const S=fn(r,/^[\r\n\t ]+/);h=S&&S[0]}Ue==="application/xhtml+xml"&&Se===re&&(r='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+r+"</body></html>");const w=W?ve(r):r;if(Se===re)try{d=new p().parseFromString(w,Ue)}catch{}if(!d||!d.documentElement){d=Rt.createDocument(Se,"template",null);try{d.documentElement.innerHTML=Ft?X:w}catch{}}const _=d.body||d.documentElement;return r&&h&&_.insertBefore(t.createTextNode(h),_.childNodes[0]||null),Se===re?rs.call(d,be?"html":"body")[0]:be?d.documentElement:_},na=function(r){return Bn.call(r.ownerDocument||r,r,c.SHOW_ELEMENT|c.SHOW_COMMENT|c.SHOW_TEXT|c.SHOW_PROCESSING_INSTRUCTION|c.SHOW_CDATA_SECTION,null)},Gt=function(r){var d,h;r.normalize();const w=Bn.call(r.ownerDocument||r,r,c.SHOW_TEXT|c.SHOW_COMMENT|c.SHOW_CDATA_SECTION|c.SHOW_PROCESSING_INSTRUCTION,null);let _=w.nextNode();for(;_;){let H=_.data;le([tt,nt,at],O=>{H=we(H,O," ")}),_.data=H,_=w.nextNode()}const S=(d=(h=r.querySelectorAll)===null||h===void 0?void 0:h.call(r,"template"))!==null&&d!==void 0?d:[];le(Array.from(S),H=>{Ie(H.content)&&Gt(H.content)})},ct=function(r){const d=K?K(r):null;return typeof d!="string"||M(d)!=="form"?!1:typeof r.nodeName!="string"||typeof r.textContent!="string"||typeof r.removeChild!="function"||r.attributes!==T(r)||typeof r.removeAttribute!="function"||typeof r.setAttribute!="function"||typeof r.namespaceURI!="string"||typeof r.insertBefore!="function"||typeof r.hasChildNodes!="function"||r.nodeType!==C(r)||r.childNodes!==v(r)},Ie=function(r){if(!C||typeof r!="object"||r===null)return!1;try{return C(r)===se.documentFragment}catch{return!1}},He=function(r){if(!C||typeof r!="object"||r===null)return!1;try{return typeof C(r)=="number"}catch{return!1}};function de(m,r,d){le(m,h=>{h.call(e,r,d,Ce)})}const aa=function(r){let d=null;if(de(q.beforeSanitizeElements,r,null),ct(r))return te(r),!0;const h=M(K?K(r):r.nodeName);if(de(q.uponSanitizeElement,r,{tagName:h,allowedTags:P}),Fe&&r.hasChildNodes()&&!He(r.firstElementChild)&&G(/<[/\w!]/g,r.innerHTML)&&G(/<[/\w!]/g,r.textContent)||Fe&&r.namespaceURI===re&&h==="style"&&He(r.firstElementChild)||r.nodeType===se.progressingInstruction||Fe&&r.nodeType===se.comment&&G(/<[/\w]/g,r.data))return te(r),!0;if(Be[h]||!(pe.tagCheck instanceof Function&&pe.tagCheck(h))&&!P[h]){if(!Be[h]&&sa(h)&&(B.tagNameCheck instanceof RegExp&&G(B.tagNameCheck,h)||B.tagNameCheck instanceof Function&&B.tagNameCheck(h)))return!1;if(zt&&!oe[h]){const _=y(r),S=v(r);if(S&&_){const H=S.length;for(let O=H-1;O>=0;--O){const F=Pt?S[O]:u(S[O],!0);_.insertBefore(F,A(r))}}}return te(r),!0}return(C?C(r):r.nodeType)===se.element&&!ks(r)||(h==="noscript"||h==="noembed"||h==="noframes")&&G(/<\/no(script|embed|frames)/i,r.innerHTML)?(te(r),!0):(ge&&r.nodeType===se.text&&(d=r.textContent,le([tt,nt,at],_=>{d=we(d,_," ")}),r.textContent!==d&&(ye(e.removed,{element:r.cloneNode()}),r.textContent=d)),de(q.afterSanitizeElements,r,null),!1)},ia=function(r,d,h){if(it[d]||Gn&&(d==="id"||d==="name")&&(h in t||h in bs))return!1;const w=$[d]||pe.attributeCheck instanceof Function&&pe.attributeCheck(d,r);if(!(Nt&&!it[d]&&G(cs,d))){if(!(Hn&&G(ds,d))){if(!w||it[d]){if(!(sa(r)&&(B.tagNameCheck instanceof RegExp&&G(B.tagNameCheck,r)||B.tagNameCheck instanceof Function&&B.tagNameCheck(r))&&(B.attributeNameCheck instanceof RegExp&&G(B.attributeNameCheck,d)||B.attributeNameCheck instanceof Function&&B.attributeNameCheck(d,r))||d==="is"&&B.allowCustomizedBuiltInElements&&(B.tagNameCheck instanceof RegExp&&G(B.tagNameCheck,h)||B.tagNameCheck instanceof Function&&B.tagNameCheck(h))))return!1}else if(!Bt[d]){if(!G(Un,we(h,Fn,""))){if(!((d==="src"||d==="xlink:href"||d==="href")&&r!=="script"&&mn(h,"data:")===0&&Kn[r])){if(!(qn&&!G(ps,we(h,Fn,"")))){if(h)return!1}}}}}}return!0},ws=E({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),sa=function(r){return!ws[ze(r)]&&G(gs,r)},oa=function(r){de(q.beforeSanitizeAttributes,r,null);const d=r.attributes;if(!d||ct(r))return;const h={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:$,forceKeepAttr:void 0};let w=d.length;for(;w--;){const _=d[w],S=_.name,H=_.namespaceURI,O=_.value,F=M(S),ue=O;let j=S==="value"?ue:ai(ue);if(h.attrName=F,h.attrValue=j,h.keepAttr=!0,h.forceKeepAttr=void 0,de(q.uponSanitizeAttribute,r,h),j=h.attrValue,Wn&&(F==="id"||F==="name")&&mn(j,Yn)!==0&&(ke(S,r),j=Yn+j),Fe&&G(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,j)){ke(S,r);continue}if(F==="attributename"&&fn(j,"href")){ke(S,r);continue}if(h.forceKeepAttr)continue;if(!h.keepAttr){ke(S,r);continue}if(!jn&&G(/\/>/i,j)){ke(S,r);continue}ge&&le([tt,nt,at],la=>{j=we(j,la," ")});const ra=M(r.nodeName);if(!ia(ra,F,j)){ke(S,r);continue}if(W&&typeof f=="object"&&typeof f.getAttributeType=="function"&&!H)switch(f.getAttributeType(ra,F)){case"TrustedHTML":{j=ve(j);break}case"TrustedScriptURL":{j=is(j);break}}if(j!==ue)try{H?r.setAttributeNS(H,S,j):r.setAttribute(S,j),ct(r)?te(r):hn(e.removed)}catch{ke(S,r)}}de(q.afterSanitizeAttributes,r,null)},dt=function(r){let d=null;const h=na(r);for(de(q.beforeSanitizeShadowDOM,r,null);d=h.nextNode();)if(de(q.uponSanitizeShadowNode,d,null),aa(d),oa(d),Ie(d.content)&&dt(d.content),(C?C(d):d.nodeType)===se.element){const _=D?D(d):d.shadowRoot;Ie(_)&&(Wt(_),dt(_))}de(q.afterSanitizeShadowDOM,r,null)},Wt=function(r){const d=[{node:r,shadow:null}];for(;d.length>0;){const h=d.pop();if(h.shadow){dt(h.shadow);continue}const w=h.node,S=(C?C(w):w.nodeType)===se.element,H=v?v(w):w.childNodes;if(H)for(let O=H.length-1;O>=0;--O)d.push({node:H[O],shadow:null});if(S){const O=K?K(w):null;if(typeof O=="string"&&M(O)==="template"){const F=w.content;Ie(F)&&d.push({node:F,shadow:null})}}if(S){const O=D?D(w):w.shadowRoot;Ie(O)&&d.push({node:null,shadow:O},{node:O,shadow:null})}}};return e.sanitize=function(m){let r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},d=null,h=null,w=null,_=null;if(Ft=!m,Ft&&(m="<!-->"),typeof m!="string"&&!He(m)&&(m=li(m),typeof m!="string"))throw me("dirty is not a string, aborting");if(!e.isSupported)return m;Lt||jt(r),e.removed=[];const S=Pt&&typeof m!="string"&&He(m);if(S){const F=K?K(m):m.nodeName;if(typeof F=="string"){const ue=M(F);if(!P[ue]||Be[ue])throw me("root node is forbidden and cannot be sanitized in-place")}if(ct(m))throw me("root node is clobbered and cannot be sanitized in-place");try{Wt(m)}catch(ue){throw ea(m),ue}}else if(He(m))d=ta("<!---->"),h=d.ownerDocument.importNode(m,!0),h.nodeType===se.element&&h.nodeName==="BODY"||h.nodeName==="HTML"?d=h:d.appendChild(h),Wt(h);else{if(!Ee&&!ge&&!be&&m.indexOf("<")===-1)return W&&ot?ve(m):m;if(d=ta(m),!d)return Ee?null:ot?X:""}d&&Mt&&te(d.firstChild);const H=na(S?m:d);try{for(;w=H.nextNode();)aa(w),oa(w),Ie(w.content)&&dt(w.content)}catch(F){throw S&&ea(m),F}if(S)return le(e.removed,F=>{F.element&&ys(F.element)}),ge&&Gt(m),m;if(Ee){if(ge&&Gt(d),st)for(_=os.call(d.ownerDocument);d.firstChild;)_.appendChild(d.firstChild);else _=d;return($.shadowroot||$.shadowrootmode)&&(_=ls.call(n,_,!0)),_}let O=be?d.outerHTML:d.innerHTML;return be&&P["!doctype"]&&d.ownerDocument&&d.ownerDocument.doctype&&d.ownerDocument.doctype.name&&G(xi,d.ownerDocument.doctype.name)&&(O="<!DOCTYPE "+d.ownerDocument.doctype.name+`>
`+O),ge&&le([tt,nt,at],F=>{O=we(O,F," ")}),W&&ot?ve(O):O},e.setConfig=function(){let m=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};jt(m),Lt=!0},e.clearConfig=function(){Ce=null,Lt=!1,W=It,X=""},e.isValidAttribute=function(m,r,d){Ce||jt({});const h=M(m),w=M(r);return ia(h,w,d)},e.addHook=function(m,r){typeof r=="function"&&ye(q[m],r)},e.removeHook=function(m,r){if(r!==void 0){const d=ti(q[m],r);return d===-1?void 0:ni(q[m],d,1)[0]}return hn(q[m])},e.removeHooks=function(m){q[m]=[]},e.removeAllHooks=function(){q=vn()},e}var _i=En();let An=!1;function vi(){An||(An=!0,I.setOptions({gfm:!0,breaks:!0}))}function Ei(i){return String(i).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function Ai(i){let e=_i.sanitize(i,{ADD_ATTR:["target","rel"]});return e=e.replace(/<a\s+([^>]*?)>/gi,(t,n)=>(/\btarget\s*=/i.test(n)||(n+=' target="_blank"'),/\brel\s*=/i.test(n)||(n+=' rel="noopener noreferrer"'),"<a "+n+">")),e}function Te(i){if(!i)return"";try{vi();const e=I.parse(i,{async:!1});return Ai(e)}catch(e){return console.warn("[AIAgent SDK] marked parse failed, fallback:",e),Si(i)}}function Si(i){let e=Ei(i);return e=e.replace(/`([^`\n]+)`/g,"<code>$1</code>"),e=e.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\n/g,"<br/>"),e}function _e(i){if(!i)return;const e=i.querySelectorAll("img");for(let t=0;t<e.length;t++){const n=e[t];if(n.dataset.aiagentDecorated==="1")continue;n.dataset.aiagentDecorated="1",n.setAttribute("loading","lazy"),n.classList.add("aiagent-sdk-img-loading");const a=()=>{n.classList.remove("aiagent-sdk-img-loading"),n.classList.add("aiagent-sdk-img-loaded")};n.complete&&n.naturalWidth>0?a():(n.addEventListener("load",a,{once:!0}),n.addEventListener("error",a,{once:!0}))}}const Sn=["#5eead4","#a78bfa","#f0abfc","#93c5fd","#fcd34d"];function Ci(){const i=document.createElement("div");i.className="aiagent-sdk-msg aiagent-sdk-msg-assistant aiagent-sdk-typing-pending";for(let e=0;e<5;e++){const t=document.createElement("span");t.className="aia-p",t.style.setProperty("--c",Sn[e%Sn.length]),e>0&&t.style.setProperty("--d",e*.2+"s"),i.appendChild(t)}return i}function Cn(i){const e=Ci();return i.appendChild(e),i.scrollTop=i.scrollHeight,e}function In(i){i&&(i.classList.remove("aiagent-sdk-typing-pending"),i.innerHTML="")}function Rn(i){i&&i.classList.add("aiagent-sdk-typing-active")}function Je(i){i&&i.classList.remove("aiagent-sdk-typing-active")}function On(i,e,t){const n=document.createElement("div");n.className="aiagent-sdk-tool-card",n.setAttribute("role","status"),n.setAttribute("data-tool",e);const a=document.createElement("div");a.className="aiagent-sdk-tool-head";const s=document.createElement("span");s.className="aiagent-sdk-tool-arrow",s.textContent="▸";const o=document.createElement("span");o.className="aiagent-sdk-tool-name",o.textContent=e;const l=document.createElement("span");l.className="aiagent-sdk-tool-dot",a.appendChild(s),a.appendChild(o),a.appendChild(l);const c=document.createElement("pre");c.className="aiagent-sdk-tool-body",c.innerHTML=Dn(JSON.stringify(t,null,2)||"{}");const g=document.createElement("div");g.className="aiagent-sdk-tool-progress";const p=document.createElement("div");p.className="aiagent-sdk-tool-bar",p.style.setProperty("--p","0%");const f=document.createElement("span");return f.className="aiagent-sdk-tool-status",f.textContent="调用中…",g.appendChild(p),g.appendChild(f),n.appendChild(a),n.appendChild(c),n.appendChild(g),i.appendChild(n),i.scrollTop=i.scrollHeight,n}function At(i,e,t){if(i&&t){const n=i.querySelector(".aiagent-sdk-tool-status");n&&(n.textContent=t)}}function Ii(i,e="✓ 完成"){if(!i)return;i.classList.add("aiagent-sdk-tool-success"),i.classList.contains("aiagent-sdk-tool-card--pending")&&(i.classList.add("aiagent-sdk-tool-confirmed"),i.classList.remove("aiagent-sdk-tool-card--pending"));const t=i.querySelector(".aiagent-sdk-tool-status");t&&(t.textContent=e)}function Xe(i,e="✕ 失败"){if(!i)return;i.classList.add("aiagent-sdk-tool-error"),i.style.borderLeftColor="var(--aia-error)";const t=i.querySelector(".aiagent-sdk-tool-status");t&&(t.textContent=e)}function Dn(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,(t,n,a,s,o)=>n?a?`<span class="k">${n}</span>${a}`:`<span class="s">${n}</span>`:s?`<span class="k">${s}</span>`:o?`<span class="n">${o}</span>`:t)}function Ri(i){const e=document.createElement("div");e.className="aiagent-sdk-thinking-card",e.setAttribute("role","status"),e.setAttribute("aria-label","AI 思考中");const t=document.createElement("div");t.className="aiagent-sdk-thinking-head";const n=document.createElement("span");n.className="aiagent-sdk-thinking-dot",n.setAttribute("aria-hidden","true");const a=document.createElement("span");a.className="aiagent-sdk-thinking-label",a.textContent="思考中…";const s=document.createElement("button");s.className="aiagent-sdk-thinking-toggle",s.textContent="展开",s.addEventListener("click",l=>{l.stopPropagation();const c=e.classList.toggle("aiagent-sdk-thinking-expanded");s.textContent=c?"收起":"展开"}),t.appendChild(n),t.appendChild(a),t.appendChild(s);const o=document.createElement("pre");return o.className="aiagent-sdk-thinking-body",e.appendChild(t),e.appendChild(o),i.appendChild(e),i.scrollTop=i.scrollHeight,e}function Oi(i,e){if(!i)return;const t=i.querySelector(".aiagent-sdk-thinking-body");t&&(t.innerHTML=Te(e||""),_e(t),t.scrollTop=t.scrollHeight)}function St(i){if(!i||i.classList.contains("aiagent-sdk-thinking-done"))return;i.classList.add("aiagent-sdk-thinking-done");const e=i.querySelector(".aiagent-sdk-thinking-label");e&&(e.textContent="✓ 思考完成"),i.classList.remove("aiagent-sdk-thinking-expanded");const t=i.querySelector(".aiagent-sdk-thinking-toggle");t&&(t.textContent="展开")}function Nn(i,e,t){const n=document.createElement("div");n.className="aiagent-sdk-tool-card aiagent-sdk-tool-card--delta",n.setAttribute("role","status"),n.setAttribute("data-tool",t||"..."),n.setAttribute("data-tool-id",e||"");const a=document.createElement("div");a.className="aiagent-sdk-tool-head";const s=document.createElement("span");s.className="aiagent-sdk-tool-dot",s.setAttribute("aria-hidden","true");const o=document.createElement("span");o.className="aiagent-sdk-tool-name",o.textContent=t||"加载工具…";const l=document.createElement("span");l.className="aiagent-sdk-tool-status",l.textContent="加载参数…";const c=document.createElement("button");c.className="aiagent-sdk-tool-toggle",c.textContent="展开",c.addEventListener("click",p=>{p.stopPropagation();const f=n.classList.toggle("aiagent-sdk-tool-expanded");c.textContent=f?"收起":"展开"}),a.appendChild(s),a.appendChild(o),a.appendChild(l),a.appendChild(c);const g=document.createElement("pre");return g.className="aiagent-sdk-tool-body",g.textContent="",n.appendChild(a),n.appendChild(g),i.appendChild(n),i.scrollTop=i.scrollHeight,n}function Di(i,e){if(!i)return;const t=i.querySelector(".aiagent-sdk-tool-body");if(!t)return;t.textContent=(t.textContent||"")+(e||"");const n=i.parentElement;n&&(n.scrollTop=n.scrollHeight)}function Ln(i,e,t){if(!i)return;i.classList.remove("aiagent-sdk-tool-card--delta"),i.classList.add("aiagent-sdk-tool-card--pending"),i.setAttribute("data-tool",t||"");const n=i.querySelector(".aiagent-sdk-tool-name");n&&(n.textContent=t||"tool");const a=i.querySelector(".aiagent-sdk-tool-status");a&&(a.textContent="等待执行");const s=i.querySelector(".aiagent-sdk-tool-body");s&&(s.innerHTML=Dn(JSON.stringify(e||{},null,2)))}function Ni(i){return new Promise(e=>{if(!i){e(!1);return}const t=i.querySelector(".aiagent-sdk-tool-head");if(!t){e(!1);return}const n=t.querySelector(".aiagent-sdk-tool-toggle");n&&n.remove();const a=t.querySelector(".aiagent-sdk-tool-status");a&&(a.textContent="⏸ 等待确认");const s=document.createElement("button");s.className="aiagent-sdk-tool-confirm-btn",s.textContent="✓ 确认";const o=document.createElement("button");o.className="aiagent-sdk-tool-cancel-btn",o.textContent="✕ 取消",t.appendChild(s),t.appendChild(o);let l=!1;const c=g=>{l||(l=!0,s.remove(),o.remove(),e(g))};s.addEventListener("click",g=>{g.stopPropagation(),i.classList.add("aiagent-sdk-tool-confirmed");const p=t.querySelector(".aiagent-sdk-tool-status");p&&(p.textContent="✓ 已确认"),c(!0)}),o.addEventListener("click",g=>{g.stopPropagation(),i.classList.add("aiagent-sdk-tool-cancelled");const p=t.querySelector(".aiagent-sdk-tool-status");p&&(p.textContent="✕ 已取消"),c(!1)})})}function Li(i){return String(i).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function Mi(i,e,t=0,n){const a=document.createElement("div");return a.style.setProperty("--i",String(t)),i==="user"?(a.className="aiagent-sdk-msg aiagent-sdk-msg-user",a.innerHTML=Li(e||"")):i==="assistant"?(a.className="aiagent-sdk-msg aiagent-sdk-msg-assistant",a.innerHTML=Te(e||""),_e(a)):i==="tool"?(a.className="aiagent-sdk-msg aiagent-sdk-msg-tool",n&&On(a,n.tool,n.args||{})):(a.className="aiagent-sdk-msg aiagent-sdk-msg-system",a.textContent=e||""),a}function zi(i,e,t,n=0,a){const s=Mi(e,t,n,a);i.appendChild(s),i.scrollTop=i.scrollHeight}class Pi{constructor(){x(this,"_tools",new Map)}register(e,t){const n=this._tools.get(e)||new Map,a=[];for(const s of t){const o={description:s.description||"",parameters:s.parameters||{type:"object",properties:{}},strict:s.strict!==!1,onCall:typeof s.onCall=="function"?s.onCall:null};n.set(s.name,o),a.push({name:s.name,description:o.description,parameters:o.parameters,strict:o.strict})}return this._tools.set(e,n),a}unregister(e,t){const n=this._tools.get(e);if(n){if(!t||!t.length){n.clear(),this._tools.delete(e);return}for(const a of t)n.delete(a);n.size===0&&this._tools.delete(e)}}get(e,t){const n=this._tools.get(e);return n&&n.get(t)||null}}async function $i(i,e,t,n){const a=await fetch(i+"/chat/"+encodeURIComponent(t)+"/tools/register",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({tools:n})});if(!a.ok){const s=await a.text();throw new Error("register failed: "+a.status+" "+s)}return await a.json()}async function Bi(i,e,t,n){const a=await fetch(i+"/chat/"+encodeURIComponent(t)+"/tools/unregister",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({names:n})});if(!a.ok)throw new Error("unregister failed: "+a.status);return await a.json()}async function Fi(i,e,t){const n=await fetch(i+"/chat/"+encodeURIComponent(t)+"/tools",{method:"GET",headers:{Authorization:"Bearer "+e}});if(!n.ok)throw new Error("list failed: "+n.status);return await n.json()}async function Ve(i,e,t){if(t){try{await fetch(i+"/chat/"+encodeURIComponent(t)+"/tools/abort",{method:"POST",headers:{Authorization:"Bearer "+e}})}catch(n){console.warn("[AIAgent SDK] abort failed:",n.message)}try{sessionStorage.removeItem("pending:"+t)}catch{}}}async function Ui(i,e,t,n){if(!e)return;const a=i.getSessionId();if(!a){console.warn("[AIAgent SDK] no sessionId for tool result");return}const s={toolUseId:e,result:t,ts:Date.now()};i.setPending(s);try{sessionStorage.setItem("pending:"+a,JSON.stringify(s))}catch{}let o;try{o=await i.ensureToken()}catch(l){i.appendMsg("system","⚠️ "+l.message),i.setBusy(!1);return}await Ct(i,e,t,a,o,n)}async function Ct(i,e,t,n,a,s){const o=i.endpoint+"/chat/"+encodeURIComponent(n)+"/tools/result",l=JSON.stringify({toolUseId:e,result:t==null?"[Tool executed by client SDK; no result returned]":typeof t=="string"?t:JSON.stringify(t)}),c={Authorization:"Bearer "+a,"Content-Type":"application/json",Accept:"text/event-stream"},g=4;let p=500,f=0,k=null,u=null;for(;f<g;){u=null;try{k=await fetch(o,{method:"POST",headers:c,body:l})}catch(C){u=C}if(u){if(f===g-1)break;await i.sleep(p),p*=2,f++,s&&At(s,Math.min(60+f*10,90),"重试中…");continue}if(k&&k.status>=500&&k.status<600&&f<g-1){await i.sleep(p),p*=2,f++,s&&At(s,Math.min(60+f*10,90),"重试中…");continue}if(k&&k.status===429&&f<g-1){const C=parseInt(k.headers.get("Retry-After")||"1",10);await i.sleep(Math.max(C*1e3,p)),p*=2,f++,s&&At(s,Math.min(60+f*10,90),"限流中…");continue}break}if(u){s&&Xe(s,"✕ 网络失败"),Qe(i,n,e,"network: "+u.message);return}if(!k){s&&Xe(s,"✕ 无响应"),Qe(i,n,e,"network: no response");return}if(k.status===409){s&&Xe(s,"✕ 409 冲突");const C=await k.text();i.appendMsg("system","⚠️ "+(C||"session 已被工具调用占用"));try{await Ve(i.endpoint,a,n)}catch{}i.setPending(null),i.setBusy(!1);return}if(!k.ok||!k.body){s&&Xe(s,"✕ HTTP "+k.status),Qe(i,n,e,"http "+k.status);return}s&&Ii(s,"✓ 已提交");const b=i.appendTyping();let A="",v=!1;function y(){v||(v=!0,b.className="aiagent-sdk-msg aiagent-sdk-msg-assistant",Rn(b))}let D=!0;const T=C=>{C&&C.tool&&C.tool.indexOf("__")!==0&&i.appendMsg("tool","",{tool:C.tool,args:C.args||{}})};try{await V(k.body,C=>{A+=C.data||"",y(),b.innerHTML=Te(A),_e(b),i.getMsgEl().scrollTop=i.getMsgEl().scrollHeight},()=>{y(),Je(b),b.innerHTML=Te(A),_e(b),i.getMsgEl().scrollTop=i.getMsgEl().scrollHeight,i.setBusy(!1)},C=>{D=!1,v?(Je(b),b.className="aiagent-sdk-msg aiagent-sdk-msg-system",b.textContent="⚠️ "+C.message):(b.remove(),i.appendMsg("system","⚠️ "+C.message)),i.setBusy(!1)},T)}catch{D=!1}if(D){try{sessionStorage.removeItem("pending:"+n)}catch{}i.setPending(null)}else Qe(i,n,e,"sse")}async function Hi(i){const e=i.getPending();if(!e)return;const t=i.getSessionId();if(!t)return;i.setBusy(!0);let n;try{n=await i.ensureToken()}catch(a){i.appendMsg("system","⚠️ "+a.message),i.setBusy(!1);return}await Ct(i,e.toolUseId,e.result,t,n)}async function qi(i){const e=i.getSessionId();if(!e){i.setBusy(!1);return}let t="";try{t=await i.ensureToken()}catch{}await Ve(i.endpoint,t,e),i.appendMsg("system","已放弃本次工具调用,可继续对话。"),i.setBusy(!1)}function Qe(i,e,t,n){console.warn("[AIAgent SDK] tool result failed:",n),ji(i,n),i.setBusy(!1)}function ji(i,e){const t=i.getMsgEl();if(t.querySelector(".aiagent-sdk-tool-result-failed"))return;const n=document.createElement("div");n.className="aiagent-sdk-tool-result-failed";const a=document.createElement("div");a.className="aiagent-sdk-tool-result-failed-header",a.textContent="提交工具结果失败";const s=document.createElement("div");s.className="aiagent-sdk-tool-result-failed-detail",s.textContent="原因:"+(e||"未知")+"。可重试,或取消本次调用以继续对话。";const o=document.createElement("div");o.className="aiagent-sdk-tool-result-actions";const l=document.createElement("button");l.type="button",l.className="aiagent-sdk-btn-retry",l.textContent="↻ 重试",l.addEventListener("click",()=>{n.parentNode&&n.parentNode.removeChild(n),Hi(i)});const c=document.createElement("button");c.type="button",c.className="aiagent-sdk-btn-cancel",c.textContent="✕ 取消",c.addEventListener("click",()=>{n.parentNode&&n.parentNode.removeChild(n),qi(i)}),o.appendChild(l),o.appendChild(c),n.appendChild(a),n.appendChild(s),n.appendChild(o),t.appendChild(n),t.scrollTop=t.scrollHeight}async function Gi(i){if(typeof sessionStorage>"u")return;let e=null,t=null;try{for(let s=0;s<sessionStorage.length;s++){const o=sessionStorage.key(s);if(o&&o.indexOf("pending:")===0){e=o,t=JSON.parse(sessionStorage.getItem(o)||"null");break}}}catch{return}if(!e||!t||!t.toolUseId){e&&sessionStorage.removeItem(e);return}const n=e.substring(8);i.appendMsg("system","检测到上次未完成的工具调用,正在重试提交…"),i.setPending(t);let a;try{a=await i.ensureToken()}catch(s){i.appendMsg("system","⚠️ "+s.message);return}await Ct(i,t.toolUseId,t.result,n,a)}function Wi(i){if(i.getActiveTools().indexOf("submit_form")>=0)i.setActiveTools([]),i.setExtractOnCall(null),i.appendMsg("system","📋 录单模式已关闭(普通聊天)");else{let e=i.getChatSessionId();e||(e=i.getDemoSessionId()||i.clientPrefix+":order-"+Date.now()),i.hasLocalTool(e,"submit_form")||(e=i.getDemoSessionId()),i.setChatSessionId(e),i.setActiveTools(["submit_form"]),i.setExtractOnCall(null),i.appendMsg("system","📋 录单模式已开启。请粘订单文本,模型会多轮收集字段。")}}function Yi(i,e){const t=e.sessionId||i.clientPrefix+":order-"+Date.now(),n=e.tools||[],a=e.activeTools||(n.length?[n[0].name]:[]);if(!n.length){console.warn("[AIAgent SDK] startExtractSession: tools required");return}e.onFormSubmit&&!n[0].onCall&&(n[0].onCall=e.onFormSubmit),i.registerTools(t,n).then(()=>{i.setChatSessionId(t),i.setActiveTools(a);const s=n[0];i.setExtractOnCall(s&&typeof s.onCall=="function"?s.onCall:null),i.appendMsg("system","📋 智能录单已开启("+t+"),激活工具: "+a.join(",")),i.sendUserMessage(e.initialMessage||"请开始按工具定义收集字段,或直接让我粘订单文本。")}).catch(s=>{i.appendMsg("system","⚠️ 工具注册失败:"+s.message)})}function Ki(i){i.setActiveTools([]),i.setExtractOnCall(null),i.appendMsg("system","📋 录单模式已关闭")}const Zi=`
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
  /* 不加 overflow:hidden/overflow-x:hidden —— 否则多张堆叠变线;
     水平溢出由 .aiagent-sdk-tool-body 的 word-break: break-word + white-space: pre-wrap 兜住 */
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
  max-width: 100%;
  min-height: 24px;        /* 防止空 body 压扁卡片变一条线 */
  max-height: calc(460px - 20px);   /* 跟思考卡默认 460 高度对齐,扣 padding 20 */
  overflow-y: auto;
  overflow-x: hidden;      /* 长 token 水平滚动让 <pre> 触发 horizontal scrollbar 太丑,这里用 break-word 折行更自然 */
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 0%, #000 92%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    #000 0%, #000 92%,
    transparent 100%
  );
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
 * Tool 工具调用卡片 — 跟思考卡完全同构,只换颜色/文字
 *
 * 状态机(对应 iridescent.ts):
 *   默认       :head 显 tool 名,body 显高亮 JSON(完整 args)
 *   --delta    :流式累积阶段,body 显 delta 原始字符串(灰)
 *   --pending  :完整 args 收齐,head 末尾追加 ✓ 确认 / ✕ 取消 按钮
 *   --confirmed:用户已点确认,head 标 ✓
 *   --cancelled:用户已点取消,整卡淡化 + 划线
 *
 * 结构跟 .aiagent-sdk-thinking-card 镜像:max-height(默认 200 / 折叠 48 /
 * 展开 500)+ head 8 12 + dot 8x8 虹彩 + body 156px 限高 + mask 渐变。
 * 颜色用 var(--aia-paint-3) 和 var(--aia-paint-4) 跟思考卡(paint-2)区分。
 * ==================================================================== */
.aiagent-sdk-tool-card {
  align-self: stretch;
  background: rgba(0, 0, 0, 0.25);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 2px solid var(--aia-paint-3);   /* 跟思考卡 paint-2 区分 */
  border-radius: 10px;
  /* 不加 overflow:hidden,否则多张堆叠变线(跟思考卡教训一致) */
  animation: aia-thinking-in 320ms var(--aia-anim-ease) forwards;
  transition: max-height 0.4s ease;
  max-height: 200px;                            /* 跟思考卡默认 200 对齐 */
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-done,
.aiagent-sdk-tool-card.aiagent-sdk-tool-confirmed,
.aiagent-sdk-tool-card.aiagent-sdk-tool-cancelled {
  max-height: 48px;   /* 跟思考卡 done 一样,48px 只露 head */
}

/* 头部 —— 跟 .aiagent-sdk-thinking-head 镜像 */
.aiagent-sdk-tool-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

/* 圆点 —— 跟 .aiagent-sdk-thinking-dot 镜像(同一套虹彩 conic) */
.aiagent-sdk-tool-dot {
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
.aiagent-sdk-tool-done .aiagent-sdk-tool-dot {
  background: var(--aia-success);
  animation: none;
  box-shadow: 0 0 6px var(--aia-success);
}
/* --delta 阶段:圆点灰化 + 弱化 box-shadow(避免视觉噪声) */
.aiagent-sdk-tool-card.aiagent-sdk-tool-card--delta .aiagent-sdk-tool-dot {
  background: var(--aia-text-muted);
  box-shadow: none;
}

/* 名字(对应思考卡的 label) */
.aiagent-sdk-tool-name {
  font-family: var(--aia-font);
  font-size: 12px;
  font-weight: 500;
  color: var(--aia-text-muted);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 工具名正常色;--pending / --confirmed 时变主色 */
.aiagent-sdk-tool-card.aiagent-sdk-tool-card--pending .aiagent-sdk-tool-name,
.aiagent-sdk-tool-card.aiagent-sdk-tool-confirmed .aiagent-sdk-tool-name {
  color: var(--aia-text);
  font-weight: 600;
}

/* 状态文字(替换思考卡"思考中"label) */
.aiagent-sdk-tool-status {
  flex-shrink: 0;
  font-size: 11.5px;
  color: var(--aia-text-faint);
  letter-spacing: 0.02em;
}

/* 主体 —— 跟 .aiagent-sdk-thinking-body 镜像 */
.aiagent-sdk-tool-card .aiagent-sdk-tool-body {
  margin: 0;
  padding: 10px 12px;
  font-family: var(--aia-mono);
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--aia-text);
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;             /* 默认截断,卡保持 200px */
  min-height: 24px;             /* 防止空 body 压扁卡片 */
  max-height: 156px;            /* 跟思考卡 body 默认 156 对齐 */
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  transition: max-height 0.35s ease, opacity 0.25s ease, padding 0.35s ease;
  opacity: 1;
}
/* --delta 阶段:body 显原始 delta 字符串,降低饱和 */
.aiagent-sdk-tool-card.aiagent-sdk-tool-card--delta .aiagent-sdk-tool-body {
  color: var(--aia-text-muted);
  font-style: italic;
}
/* done / confirmed / cancelled 状态:body 收起(跟思考卡 done 镜像) */
.aiagent-sdk-tool-card.aiagent-sdk-tool-done .aiagent-sdk-tool-body,
.aiagent-sdk-tool-card.aiagent-sdk-tool-confirmed .aiagent-sdk-tool-body,
.aiagent-sdk-tool-card.aiagent-sdk-tool-cancelled .aiagent-sdk-tool-body {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

/* 滚动条 */
.aiagent-sdk-tool-body::-webkit-scrollbar { width: 6px; }
.aiagent-sdk-tool-body::-webkit-scrollbar-thumb {
  background: var(--aia-text-faint);
  border-radius: 3px;
}
.aiagent-sdk-tool-body::-webkit-scrollbar-track { background: transparent; }

/* 展开/收起按钮 —— 跟 .aiagent-sdk-thinking-toggle 镜像 */
.aiagent-sdk-tool-toggle {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 6px;
  color: var(--aia-text-muted);
  font-size: 11px;
  font-family: var(--aia-font);
  padding: 3px 10px;
  min-height: 22px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  line-height: 1.5;
}
.aiagent-sdk-tool-toggle:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--aia-text);
}

/* === 确认按钮(--pending 时追加,跟 toggle 同位置) === */
.aiagent-sdk-tool-confirm-btn,
.aiagent-sdk-tool-cancel-btn {
  flex-shrink: 0;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-family: var(--aia-font);
  padding: 3px 10px;
  min-height: 22px;
  cursor: pointer;
  line-height: 1.5;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: background 0.15s, color 0.15s, transform 0.12s;
  margin-left: 2px;
}
.aiagent-sdk-tool-confirm-btn {
  background: rgba(74, 222, 128, 0.20);
  color: var(--aia-success);
}
.aiagent-sdk-tool-confirm-btn:hover {
  background: rgba(74, 222, 128, 0.36);
  transform: translateY(-1px);
}
.aiagent-sdk-tool-cancel-btn {
  background: rgba(244, 63, 94, 0.16);
  color: var(--aia-error);
}
.aiagent-sdk-tool-cancel-btn:hover {
  background: rgba(244, 63, 94, 0.30);
  transform: translateY(-1px);
}

/* --pending:左边线高亮成天蓝(等待确认/执行) */
.aiagent-sdk-tool-card.aiagent-sdk-tool-card--pending {
  border-left-color: var(--aia-paint-4);   /* #93c5fd 天蓝,跟思考卡紫区分 */
  border-left-width: 3px;
  max-height: 200px;                        /* 显式覆盖,跟 .aiagent-sdk-tool-card 默认一致 */
}

/* 终态:confirmed 整卡绿边、cancelled 整卡红边 + 名字划线 */
.aiagent-sdk-tool-card.aiagent-sdk-tool-confirmed {
  border-left-color: var(--aia-success);
  border-left-width: 3px;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-cancelled {
  border-left-color: var(--aia-error);
  opacity: 0.65;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-cancelled .aiagent-sdk-tool-name {
  text-decoration: line-through;
  color: var(--aia-text-faint);
}

/* === 展开状态 — 必须写在所有 max-height 规则最后,覆盖 --done/--confirmed/--cancelled/--pending === */
.aiagent-sdk-tool-card.aiagent-sdk-tool-expanded {
  max-height: 500px;  /* 跟思考卡 expanded 一样 */
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-expanded .aiagent-sdk-tool-body {
  max-height: calc(460px - 20px);
  overflow-y: auto;
  mask-image: none;
  -webkit-mask-image: none;
  /* 覆盖 --confirmed / --cancelled 的 opacity:0 / padding:0(跟思考卡 expanded 一样的处理) */
  padding-top: 10px;
  padding-bottom: 10px;
  opacity: 1;
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
`,Ji=`
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M5 12 L19 12 M13 6 L19 12 L13 18"/>
</svg>
`.trim();class Xi{constructor(e,t){x(this,"host",null);x(this,"shadow",null);x(this,"bubble",null);x(this,"panel",null);x(this,"msgEl",null);x(this,"taEl",null);x(this,"sendBtn",null);x(this,"welcomeEl",null);x(this,"isOpen",!1);x(this,"mounted",!1);x(this,"avatarRaw","🤖");x(this,"onMouseMove",null);this.opts=e,this.handlers=t}getRefs(){return!this.host||!this.bubble||!this.panel||!this.msgEl||!this.taEl||!this.sendBtn?null:{host:this.host,bubble:this.bubble,panel:this.panel,msgEl:this.msgEl,taEl:this.taEl,sendBtn:this.sendBtn}}mount(){if(this.mounted||typeof document>"u")return;const e=document.createElement("div");e.className="aiagent-sdk-host",e.setAttribute("data-position",this.opts.position||"bottom-right"),e.setAttribute("data-theme",this.opts.theme||"ink"),document.body.appendChild(e),this.host=e;const t=e.attachShadow({mode:"open"});this.shadow=t;const n=document.createElement("style");n.textContent=Zi,t.appendChild(n);const a=this.opts.position==="bottom-left"?" aiagent-sdk-pos-bl":"";this.avatarRaw=this.opts.avatar||"🤖";const s=this.avatarRaw.length<=2,o=document.createElement("button");s?(o.className="aiagent-sdk-bubble aiagent-sdk-bubble-emoji"+a,o.textContent=this.avatarRaw):o.className="aiagent-sdk-bubble"+a,o.setAttribute("aria-label",this.opts.title||"AI 助手 - 点击打开对话"),o.title=this.opts.title||"AI 助手",o.addEventListener("click",()=>this.toggle()),t.appendChild(o),this.bubble=o;const l=document.createElement("div");l.className="aiagent-sdk-panel"+a;const c=this.opts.demoTools?'<button class="aiagent-sdk-iconbtn aiagent-sdk-extract" title="开/关 录单模式" aria-label="录单模式">⊕</button>':"";l.innerHTML=['<div class="aiagent-sdk-corner aiagent-sdk-corner-tl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-tr" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-bl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-br" aria-hidden="true"></div>','<div class="aiagent-sdk-header">','  <div class="aiagent-sdk-header-info">','    <span class="aiagent-sdk-status-dot" aria-hidden="true"></span>','    <span class="aiagent-sdk-title"></span>',"  </div>",'  <div class="aiagent-sdk-header-actions">','    <span class="aiagent-sdk-subtitle"></span>',c,'    <button class="aiagent-sdk-iconbtn aiagent-sdk-new" title="新会话" aria-label="新会话">＋</button>','    <button class="aiagent-sdk-iconbtn aiagent-sdk-close" title="关闭" aria-label="关闭">✕</button>',"  </div>","</div>",'<div class="aiagent-sdk-welcome" hidden></div>','<div class="aiagent-sdk-messages" role="log" aria-live="polite"></div>','<div class="aiagent-sdk-inputbar">','  <textarea rows="1" placeholder="" aria-label="输入消息"></textarea>',`  <button class="aiagent-sdk-send" aria-label="发送">${Ji}</button>`,"</div>"].join(""),t.appendChild(l),this.panel=l;const g=l.querySelector(".aiagent-sdk-title"),p=l.querySelector(".aiagent-sdk-subtitle");g.textContent=this.opts.title||"AI 助手",p.textContent=this.opts.subtitle||"";const f=l.querySelector("textarea");f.placeholder=this.opts.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",this.msgEl=l.querySelector(".aiagent-sdk-messages"),this.taEl=f,this.sendBtn=l.querySelector(".aiagent-sdk-send"),this.welcomeEl=l.querySelector(".aiagent-sdk-welcome");const k=l.querySelector(".aiagent-sdk-close"),u=l.querySelector(".aiagent-sdk-new"),b=l.querySelector(".aiagent-sdk-extract");k.addEventListener("click",()=>this.handlers.onClose()),u.addEventListener("click",()=>this.handlers.onNew()),b&&b.addEventListener("click",()=>this.handlers.onToggleExtract()),this.sendBtn.addEventListener("click",()=>{this._burstSend(),this.handlers.onSend()}),f.addEventListener("keydown",A=>{A.key==="Enter"&&!A.shiftKey&&(A.preventDefault(),this._burstSend(),this.handlers.onSend())}),f.addEventListener("input",()=>{f.style.height="auto",f.style.height=Math.min(f.scrollHeight,80)+"px"}),this.onMouseMove=A=>{if(!this.panel)return;const v=this.panel.getBoundingClientRect(),y=(A.clientX-v.left)/v.width*100,D=(A.clientY-v.top)/v.height*100;this.panel.style.setProperty("--aia-mx",y+"%"),this.panel.style.setProperty("--aia-my",D+"%")},this.panel.addEventListener("mousemove",this.onMouseMove),this.panel.addEventListener("mouseleave",()=>{this.panel&&(this.panel.style.setProperty("--aia-mx","50%"),this.panel.style.setProperty("--aia-my","50%"))}),this.setTheme(this.opts.theme||"ink"),this.mounted=!0}destroy(){this.mounted&&(this.panel&&this.onMouseMove&&this.panel.removeEventListener("mousemove",this.onMouseMove),this.host&&this.host.parentNode&&this.host.parentNode.removeChild(this.host),this.host=null,this.shadow=null,this.bubble=null,this.panel=null,this.msgEl=null,this.taEl=null,this.sendBtn=null,this.welcomeEl=null,this.mounted=!1,this.isOpen=!1,this.onMouseMove=null)}open(){this.panel&&(this.panel.classList.add("aiagent-sdk-open"),this.isOpen=!0,setTimeout(()=>{this.taEl&&this.taEl.focus()},50),this.handlers.onPanelOpen())}close(){this.panel&&(this.panel.classList.remove("aiagent-sdk-open"),this.isOpen=!1)}toggle(){this.isOpen?this.close():this.open()}getIsOpen(){return this.isOpen}setTheme(e){this.host&&this.host.setAttribute("data-theme",e)}clearMessages(){this.msgEl&&(this.msgEl.innerHTML="")}setWelcome(e){if(this.welcomeEl){if(!e){this.welcomeEl.hidden=!0;return}this.welcomeEl.hidden=!1,this.welcomeEl.textContent=e}}hideWelcome(){this.welcomeEl&&(this.welcomeEl.hidden||(this.welcomeEl.classList.add("aiagent-sdk-welcome-leaving"),setTimeout(()=>{this.welcomeEl&&(this.welcomeEl.hidden=!0,this.welcomeEl.classList.remove("aiagent-sdk-welcome-leaving"))},280)))}_burstSend(){if(!this.sendBtn)return;const e=5,t=["#5eead4","#a78bfa","#f0abfc","#93c5fd","#fcd34d"];for(let n=0;n<e;n++){const a=Math.PI*2*n/e+Math.random()*.5,s=22+Math.random()*14,o=Math.cos(a)*s,l=Math.sin(a)*s,c=document.createElement("span");c.className="aiagent-sdk-send-burst",c.style.setProperty("--bx",o+"px"),c.style.setProperty("--by",l+"px");const g=t[n];c.style.setProperty("--c",g),c.style.background=g,this.sendBtn.appendChild(c),setTimeout(()=>c.remove(),750)}}}function Vi(i,e){i.setTheme(e)}const Qi=[{name:"submit_form",description:"Submit the collected order fields. Call only when ALL required fields are collected.",parameters:{type:"object",properties:{orderId:{type:"string",description:"订单编号,如 PO-2024-001"},customerName:{type:"string",description:"客户全名"},customerPhone:{type:"string",description:"11 位手机号"},items:{type:"string",description:"商品清单"},totalAmount:{type:"number",description:"订单总金额,单位元"},notes:{type:"string",description:"其他备注"}},required:["orderId","customerName","items","totalAmount"]},strict:!0}];class es{constructor(){x(this,"endpoint");x(this,"getAccessToken");x(this,"_opts");x(this,"_tokenCache",new N);x(this,"_tools",new Pi);x(this,"_widget",null);x(this,"_isOpen",!1);x(this,"_busy",!1);x(this,"_messages",[]);x(this,"_chatSessionId",null);x(this,"_activeTools",[]);x(this,"_extractOnCall",null);x(this,"_pendingToolCall",null);x(this,"_demoSessionId",null);x(this,"_lastToolCard",null);x(this,"_thinkingCard",null);x(this,"_pendingDelta",new Map)}init(e){if(!e||!e.endpoint)throw new Error("endpoint required");if(typeof e.getAccessToken!="function")throw new Error("getAccessToken() required");return this.endpoint=String(e.endpoint).replace(/\/+$/,""),this.getAccessToken=e.getAccessToken,this._opts={title:e.title||"AI 助手",subtitle:e.subtitle||"在线",placeholder:e.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",welcomeMessage:e.welcomeMessage||"你好!我是 AI 助手,有什么可以帮你的?",theme:e.theme||"ink",position:e.position||"bottom-right",autoOpen:!!e.autoOpen,avatar:e.avatar||"🤖",clientPrefix:e.clientPrefix||"app",demoTools:!!e.demoTools,demoOrderTools:e.demoOrderTools||Qi},this._widget=new Xi(this._opts,{onSend:()=>this._onSend(),onNew:()=>this._newSession(),onClose:()=>this.close(),onToggleExtract:()=>this._toggleExtractMode(),onPanelOpen:()=>{}}),this._widget.mount(),this._opts.autoOpen&&this.open(),this._opts.welcomeMessage&&this._widget.setWelcome(this._opts.welcomeMessage),setTimeout(()=>{this._resumePendingToolResults()},0),this._opts.demoTools&&(this._demoSessionId=this._opts.clientPrefix+":demo",this._internalRegister(this._demoSessionId,this._opts.demoOrderTools).then(()=>{}).catch(t=>{console.warn("[AIAgent SDK] demo tools register failed:",t)})),this}destroy(){this._widget&&(this._widget.destroy(),this._widget=null)}async registerTools(e){if(!e||!e.sessionId)throw new Error("sessionId required");if(!e.tools||!e.tools.length)throw new Error("tools required");return this._internalRegister(e.sessionId,e.tools)}async unregisterTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const n=t.names||null;this._tools.unregister(t.sessionId,n);const a=await this._ensureToken();return Bi(this.endpoint,a,t.sessionId,n)}async listTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const n=await this._ensureToken();return Fi(this.endpoint,n,t.sessionId)}async _internalRegister(e,t){const n=this._tools.register(e,t),a=await this._ensureToken();return $i(this.endpoint,a,e,n)}_getLocalTool(e,t){return this._tools.get(e,t)}startExtractSession(e){const t=this._extractCtx();Yi(t,e)}stopExtractSession(){Ki(this._extractCtx())}_toggleExtractMode(){Wi(this._extractCtx())}async stream(e){const t=e||{};return this._postStream({sessionId:t.sessionId,message:t.message,activeTools:t.activeTools||[],onChunk:t.onChunk||(()=>{}),onDone:t.onDone||(()=>{}),onError:t.onError||(n=>console.error(n)),onToolCall:t.onToolCall,onToolCallDelta:t.onToolCallDelta,onToolCallStart:t.onToolCallStart,onToolCallEnd:t.onToolCallEnd})}open(){this._widget&&this._widget.open(),this._isOpen=!0}close(){this._widget&&this._widget.close(),this._isOpen=!1}toggle(){this._widget&&this._widget.toggle(),this._isOpen=this._widget?this._widget.getIsOpen():!1}setTheme(e){this._widget&&Vi(this._widget,e.theme)}async _ensureToken(){return this._tokenCache.get(this.getAccessToken)}_newSession(){const e=this._chatSessionId;e&&Ve(this.endpoint,"",e).catch(()=>{}),this._widget&&this._widget.clearMessages(),this._messages=[],this._activeTools=[],this._extractOnCall=null,this._chatSessionId=null,this._thinkingCard=null,this._pendingDelta.clear(),this._widget&&this._opts.welcomeMessage&&this._widget.setWelcome(this._opts.welcomeMessage)}_onSend(){if(!this._widget)return;const e=this._widget.getRefs();if(!e)return;const t=e.taEl.value.trim();!t||this._busy||(e.taEl.value="",e.taEl.style.height="auto",this._sendUserMessage(t))}async _sendUserMessage(e){this._widget&&this._widget.hideWelcome(),this._appendMsg("user",e),this._setBusy(!0);const t=this._widget.getRefs(),n=Cn(t.msgEl);let a="",s="";const o=this,l=this._activeTools.slice(),c=this._extractOnCall;let g=!1,p=!1;function f(){p||(p=!0,In(n),Rn(n),o._thinkingCard&&(St(o._thinkingCard),o._thinkingCard=null))}const k={message:e,onChunk:u=>{a+=u.data||"",f(),n.innerHTML=Te(a),_e(n),t.msgEl.scrollTop=t.msgEl.scrollHeight},onDone:()=>{!p&&!a?n.remove():(f(),Je(n),n.innerHTML=Te(a),_e(n)),t.msgEl.scrollTop=t.msgEl.scrollHeight,g||o._setBusy(!1),o._thinkingCard&&(St(o._thinkingCard),o._thinkingCard=null)},onError:u=>{In(n),p?(Je(n),n.className="aiagent-sdk-msg aiagent-sdk-msg-system",n.textContent="⚠️ 错误:"+u.message):(n.remove(),o._appendMsg("system","⚠️ 错误:"+u.message)),o._setBusy(!1),g=!0,o._thinkingCard&&(St(o._thinkingCard),o._thinkingCard=null)},onThinking:u=>{if(s+=u,!o._thinkingCard){t.msgEl.insertBefore(Ri(t.msgEl),n);const b=t.msgEl.querySelectorAll(".aiagent-sdk-thinking-card");o._thinkingCard=b.length?b[b.length-1]:null}o._thinkingCard&&Oi(o._thinkingCard,s)},onToolCallStart:u=>{if(console.log("[AIAgent SDK 🚀 onToolCallStart]",u),!u||!u.id||!u.name){console.log("[AIAgent SDK ❌ onToolCallStart] 早 return:id 或 name 为空");return}const b=Nn(t.msgEl,u.id,u.name);o._pendingDelta.set(u.id,b)},onToolCallDelta:u=>{if(console.log("[AIAgent SDK 🔧 onToolCallDelta]",u),!u||!u.id){console.log("[AIAgent SDK ❌ onToolCallDelta] 早 return:id 为空");return}let b=o._pendingDelta.get(u.id);b||(b=Nn(t.msgEl,u.id,u.name||"..."),o._pendingDelta.set(u.id,b)),Di(b,u.delta||"")},onToolCallEnd:u=>{console.log("[AIAgent SDK 🏁 onToolCallEnd] 流式结束")},onToolCall:async u=>{if(console.log("[AIAgent SDK 🎯 onToolCall 入口] parsed=",u,"sessionId=",o._chatSessionId,"submitted=",g),o._setBusy(!0),!u||!u.tool){console.log("[AIAgent SDK ❌ onToolCall] 早 return:parsed 或 tool 为空");return}if(u.tool.indexOf("__")===0){console.log("[AIAgent SDK ❌ onToolCall] 早 return:tool 名字 __ 开头");return}if(!u.args||typeof u.args!="object"){console.log("[AIAgent SDK ❌ onToolCall] 早 return:args 不是对象",typeof u.args);return}if(Object.keys(u.args).length===0){console.log("[AIAgent SDK ❌ onToolCall] 早 return:args 是空对象(后端 last 帧没推完整?)");return}if(g){console.log("[AIAgent SDK ❌ onToolCall] 早 return:本 stream 已 submitted");return}g=!0;const b=u.id?o._pendingDelta.get(u.id):null,A=b?(Ln(b,u.args,u.tool),o._pendingDelta.delete(u.id),b):(()=>{const T=On(t.msgEl,u.tool,u.args);return Ln(T,u.args,u.tool),T})();o._lastToolCard=A,o._messages.push({role:"tool",text:"",data:{tool:u.tool,args:u.args}});const v=o._getLocalTool(o._chatSessionId,u.tool),y=!!(v&&v.onCall);if(console.log("[AIAgent SDK 🔍 onToolCall 决策]","sid=",o._chatSessionId,"tool=",u.tool,"localTool=",!!v,"hasOnCall=",y,"onCallSnapshot=",!!c),!y){const T=await Ni(A);if(console.log("[AIAgent SDK 🛡 addConfirmActions 结果]",T),!T){o._appendMsg("system",`🚫 已取消工具调用:${u.tool}`),await o._postAbort();return}}let D=y?void 0:{confirmed:!0};if(y){try{console.log("[AIAgent SDK ⚡ 调用 onCall]",u.tool,"args=",u.args),D=await Promise.resolve(v.onCall(u.args)),console.log("[AIAgent SDK ⚡ onCall 返回]",D)}catch(T){console.error("[AIAgent SDK] onCall threw:",T),o._appendMsg("system","⚠️ onCall 失败: "+T.message)}if(c&&u.tool==="submit_form")try{const T=c(u.args);T!=null&&D==null&&(D=T)}catch(T){console.error("[AIAgent SDK] extract onCall threw:",T)}}u.id&&(console.log("[AIAgent SDK 📤 POST /tools/result]",u.id,"result=",D),await o._postToolResult(u.id,D,A))}};this._chatSessionId||(this._chatSessionId=this._opts.clientPrefix+":user-"+Date.now()),k.sessionId=this._chatSessionId,k.activeTools=l;try{await this._postStream(k)}catch{}}_setBusy(e){if(this._busy=e,!this._widget)return;const t=this._widget.getRefs();t&&(t.sendBtn.disabled=e,t.sendBtn.textContent=e?"...":"发送")}_sleep(e){return new Promise(t=>setTimeout(t,e))}_appendMsg(e,t,n){if(!this._widget)return;const a=this._widget.getRefs();a&&(zi(a.msgEl,e,t,this._messages.length,n),this._messages.push({role:e,text:t,data:n}))}_appendTyping(){if(!this._widget)return document.createElement("div");const e=this._widget.getRefs();return e?Cn(e.msgEl):document.createElement("div")}async _postStream(e){const t=e.sessionId,n=e.message,a=e.activeTools,s=e.onChunk||(()=>{}),o=e.onDone||(()=>{}),l=e.onError||(y=>console.error(y)),c=e.onToolCall,g=e.onToolCallDelta,p=e.onToolCallStart,f=e.onToolCallEnd,k=e.onThinking;if(!t){l(new Error("sessionId required"));return}if(n==null){l(new Error("message required"));return}let u;try{u=await this._ensureToken()}catch(y){l(y);return}const b=this.endpoint+"/chat/"+encodeURIComponent(t)+"/stream",A={message:n};a&&a.length&&(A.activeTools=a);let v;try{v=await fetch(b,{method:"POST",headers:{Authorization:"Bearer "+u,"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify(A)})}catch(y){l(y);return}if(!v.ok||!v.body){l(new Error("http "+v.status));return}return V(v.body,s,o,l,c,g,p,f,k)}async _postToolResult(e,t,n){const a=this._toolCtx();return Ui(a,e,t,n)}async _postAbort(){const e=this._chatSessionId;if(e){try{await Ve(this.endpoint,await this._ensureToken(),e)}catch(t){console.warn("[AIAgent SDK] abort failed:",t.message)}this._setBusy(!1)}}async _resumePendingToolResults(){return Gi(this._toolCtx())}_toolCtx(){const e=this;return{endpoint:this.endpoint,ensureToken:()=>e._ensureToken(),getSessionId:()=>e._chatSessionId,getPending:()=>e._pendingToolCall,setPending:t=>{e._pendingToolCall=t},appendMsg:(t,n,a)=>e._appendMsg(t,n,a),setBusy:t=>e._setBusy(t),sleep:t=>e._sleep(t),appendTyping:()=>e._appendTyping(),getMsgEl:()=>e._widget?.getRefs()?.msgEl||document.createElement("div")}}_extractCtx(){const e=this;return{clientPrefix:this._opts.clientPrefix,getDemoSessionId:()=>e._demoSessionId,getChatSessionId:()=>e._chatSessionId,setChatSessionId:t=>{e._chatSessionId=t},getActiveTools:()=>e._activeTools,setActiveTools:t=>{e._activeTools=t},getExtractOnCall:()=>e._extractOnCall,setExtractOnCall:t=>{e._extractOnCall=t},hasLocalTool:(t,n)=>!!e._tools.get(t,n),registerTools:(t,n)=>e._internalRegister(t,n||[]),sendUserMessage:t=>e._sendUserMessage(t),appendMsg:(t,n)=>e._appendMsg(t,n)}}}function ts(){return{init:i=>new es().init(i)}}const ns=["https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap"];let Mn=!1;function as(){if(!Mn&&!(typeof document>"u"))try{const i=document.createElement("link");i.rel="preconnect",i.href="https://fonts.googleapis.com",document.head.appendChild(i);const e=document.createElement("link");e.rel="preconnect",e.href="https://fonts.gstatic.com",e.crossOrigin="anonymous",document.head.appendChild(e);for(const t of ns){const n=document.createElement("link");n.rel="stylesheet",n.href=t,document.head.appendChild(n)}Mn=!0}catch(i){console.warn("[AIAgent SDK] loadFonts failed, fallback to system fonts:",i)}}as();const zn=ts();return globalThis.AIAgent=zn,console.info("%c[AIAgent SDK v5.0.0]%c loaded (built __BUILD_TIME__). Theme: Iridescent Bloom. AIAgent.init({...}) is on window.AIAgent.","background:linear-gradient(135deg,#5eead4,#a78bfa,#f0abfc);color:#050505;padding:2px 8px;border-radius:3px;font-weight:700","color:#a1a1aa"),zn});
