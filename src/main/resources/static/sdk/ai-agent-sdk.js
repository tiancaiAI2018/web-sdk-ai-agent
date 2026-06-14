(function($,N){typeof exports=="object"&&typeof module<"u"?module.exports=N():typeof define=="function"&&define.amd?define(N):($=typeof globalThis<"u"?globalThis:$||self,$.AIAgent=N())})(this,function(){"use strict";var Ws=Object.defineProperty;var Mn=$=>{throw TypeError($)};var Ys=($,N,Q)=>N in $?Ws($,N,{enumerable:!0,configurable:!0,writable:!0,value:Q}):$[N]=Q;var f=($,N,Q)=>Ys($,typeof N!="symbol"?N+"":N,Q),Ks=($,N,Q)=>N.has($)||Mn("Cannot "+Q);var zn=($,N,Q)=>N.has($)?Mn("Cannot add the same private member more than once"):N instanceof WeakSet?N.add($):N.set($,Q);var tt=($,N,Q)=>(Ks($,N,"access private method"),Q);var he,$n,ma,Bn;function $(s){if(!s)return null;try{const e=s.split(".");if(e.length!==3)return null;let t=e[1].replace(/-/g,"+").replace(/_/g,"/");for(;t.length%4;)t+="=";const a=atob(t),n=JSON.parse(a);return typeof n.exp=="number"?n.exp:null}catch{return null}}class N{constructor(){f(this,"_accessToken",null);f(this,"_expEpoch",0)}async get(e){const t=Math.floor(Date.now()/1e3);if(this._accessToken&&this._expEpoch>t+30)return this._accessToken;console.log("[AIAgent SDK] token missing/near-expiry, calling getAccessToken()...");const a=await e();if(!a||!a.accessToken)throw new Error("getAccessToken() must return { accessToken }");return this._accessToken=a.accessToken,this._expEpoch=$(a.accessToken)||t+300,this._accessToken}}async function Q(s,e,t,a,n,i,o,d,l,p,g){const u=s.getReader(),m=new TextDecoder;let y="",_=!1;function C(){_||(_=!0,t())}function w(){for(;;){const I=y.indexOf(`

`);if(I<0)return;const O=y.slice(0,I);if(y=y.slice(I+2),!O)continue;const v={},b=O.split(`
`);for(let x=0;x<b.length;x++){const P=b[x],B=P.indexOf(":");if(B<0)continue;const te=P.slice(0,B).trim();let ne=P.slice(B+1);ne.length>0&&ne.charAt(0)===" "&&(ne=ne.slice(1)),te==="data"?v.data=(v.data?v.data+`
`:"")+ne:v[te]=ne}if(v.data&&(v.data=v.data.replace(/\\n/g,`
`)),v.event==="tool_call_start"&&typeof o=="function"){try{const x=JSON.parse(v.data||"{}");console.log("[AIAgent SDK 🚀 tool_call_start]",x),o(x)}catch(x){console.error("[AIAgent SDK] tool_call_start parse failed",x,v.data)}continue}if(v.event==="tool_call"&&typeof n=="function"){try{const x=JSON.parse(v.data||"{}");console.log("[AIAgent SDK 🔧 tool_call]",x),n(x)}catch(x){console.error("[AIAgent SDK] tool_call parse failed",x,v.data)}continue}if(v.event==="tool_call_delta"&&typeof i=="function"){try{const x=JSON.parse(v.data||"{}");console.log("[AIAgent SDK 🔧 tool_call_delta]",x),i(x)}catch(x){console.error("[AIAgent SDK] tool_call_delta parse failed",x,v.data)}continue}if(v.event==="tool_call_end"&&typeof d=="function"){try{const x=v.data?JSON.parse(v.data):{};console.log("[AIAgent SDK 🏁 tool_call_end]",x),d(x)}catch{console.log("[AIAgent SDK 🏁 tool_call_end] (no data)"),d({})}continue}if(v.event==="round_end"&&typeof p=="function"){try{const x=v.data?JSON.parse(v.data):{};console.log("[AIAgent SDK 🔄 round_end]",x),p(x)}catch{p({})}continue}if(v.id==="last"){C();continue}if(v.event==="thinking"&&typeof l=="function"){l(v.data||"");continue}if(v.event==="text"&&typeof g=="function"){g(v.data||"");continue}v.data!==void 0&&e(v)}}try{for(;;){const I=await u.read();if(I.done)break;y+=m.decode(I.value,{stream:!0}),w()}w(),C()}catch(I){a(I)}}function Lt(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}let xe=Lt();function ka(s){xe=s}const ba=/[&<>"']/,Un=new RegExp(ba.source,"g"),xa=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,Hn=new RegExp(xa.source,"g"),Fn={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ya=s=>Fn[s];function ee(s,e){if(e){if(ba.test(s))return s.replace(Un,ya)}else if(xa.test(s))return s.replace(Hn,ya);return s}const qn=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;function jn(s){return s.replace(qn,(e,t)=>(t=t.toLowerCase(),t==="colon"?":":t.charAt(0)==="#"?t.charAt(1)==="x"?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""))}const Gn=/(^|[^\[])\^/g;function D(s,e){let t=typeof s=="string"?s:s.source;e=e||"";const a={replace:(n,i)=>{let o=typeof i=="string"?i:i.source;return o=o.replace(Gn,"$1"),t=t.replace(n,o),a},getRegex:()=>new RegExp(t,e)};return a}function wa(s){try{s=encodeURI(s).replace(/%25/g,"%")}catch{return null}return s}const ze={exec:()=>null};function _a(s,e){const t=s.replace(/\|/g,(i,o,d)=>{let l=!1,p=o;for(;--p>=0&&d[p]==="\\";)l=!l;return l?"|":" |"}),a=t.split(/ \|/);let n=0;if(a[0].trim()||a.shift(),a.length>0&&!a[a.length-1].trim()&&a.pop(),e)if(a.length>e)a.splice(e);else for(;a.length<e;)a.push("");for(;n<a.length;n++)a[n]=a[n].trim().replace(/\\\|/g,"|");return a}function $e(s,e,t){const a=s.length;if(a===0)return"";let n=0;for(;n<a&&s.charAt(a-n-1)===e;)n++;return s.slice(0,a-n)}function Wn(s,e){if(s.indexOf(e[1])===-1)return-1;let t=0;for(let a=0;a<s.length;a++)if(s[a]==="\\")a++;else if(s[a]===e[0])t++;else if(s[a]===e[1]&&(t--,t<0))return a;return-1}function va(s,e,t,a){const n=e.href,i=e.title?ee(e.title):null,o=s[1].replace(/\\([\[\]])/g,"$1");if(s[0].charAt(0)!=="!"){a.state.inLink=!0;const d={type:"link",raw:t,href:n,title:i,text:o,tokens:a.inlineTokens(o)};return a.state.inLink=!1,d}return{type:"image",raw:t,href:n,title:i,text:ee(o)}}function Yn(s,e){const t=s.match(/^(\s+)(?:```)/);if(t===null)return e;const a=t[1];return e.split(`
`).map(n=>{const i=n.match(/^\s+/);if(i===null)return n;const[o]=i;return o.length>=a.length?n.slice(a.length):n}).join(`
`)}class at{constructor(e){f(this,"options");f(this,"rules");f(this,"lexer");this.options=e||xe}space(e){const t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){const t=this.rules.block.code.exec(e);if(t){const a=t[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?a:$e(a,`
`)}}}fences(e){const t=this.rules.block.fences.exec(e);if(t){const a=t[0],n=Yn(a,t[3]||"");return{type:"code",raw:a,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:n}}}heading(e){const t=this.rules.block.heading.exec(e);if(t){let a=t[2].trim();if(/#$/.test(a)){const n=$e(a,"#");(this.options.pedantic||!n||/ $/.test(n))&&(a=n.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:a,tokens:this.lexer.inline(a)}}}hr(e){const t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:$e(t[0],`
`)}}blockquote(e){const t=this.rules.block.blockquote.exec(e);if(t){let a=$e(t[0],`
`).split(`
`),n="",i="";const o=[];for(;a.length>0;){let d=!1;const l=[];let p;for(p=0;p<a.length;p++)if(/^ {0,3}>/.test(a[p]))l.push(a[p]),d=!0;else if(!d)l.push(a[p]);else break;a=a.slice(p);const g=l.join(`
`),u=g.replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,`
    $1`).replace(/^ {0,3}>[ \t]?/gm,"");n=n?`${n}
${g}`:g,i=i?`${i}
${u}`:u;const m=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(u,o,!0),this.lexer.state.top=m,a.length===0)break;const y=o[o.length-1];if(y?.type==="code")break;if(y?.type==="blockquote"){const _=y,C=_.raw+`
`+a.join(`
`),w=this.blockquote(C);o[o.length-1]=w,n=n.substring(0,n.length-_.raw.length)+w.raw,i=i.substring(0,i.length-_.text.length)+w.text;break}else if(y?.type==="list"){const _=y,C=_.raw+`
`+a.join(`
`),w=this.list(C);o[o.length-1]=w,n=n.substring(0,n.length-y.raw.length)+w.raw,i=i.substring(0,i.length-_.raw.length)+w.raw,a=C.substring(o[o.length-1].raw.length).split(`
`);continue}}return{type:"blockquote",raw:n,tokens:o,text:i}}}list(e){let t=this.rules.block.list.exec(e);if(t){let a=t[1].trim();const n=a.length>1,i={type:"list",raw:"",ordered:n,start:n?+a.slice(0,-1):"",loose:!1,items:[]};a=n?`\\d{1,9}\\${a.slice(-1)}`:`\\${a}`,this.options.pedantic&&(a=n?a:"[*+-]");const o=new RegExp(`^( {0,3}${a})((?:[	 ][^\\n]*)?(?:\\n|$))`);let d=!1;for(;e;){let l=!1,p="",g="";if(!(t=o.exec(e))||this.rules.block.hr.test(e))break;p=t[0],e=e.substring(p.length);let u=t[2].split(`
`,1)[0].replace(/^\t+/,I=>" ".repeat(3*I.length)),m=e.split(`
`,1)[0],y=!u.trim(),_=0;if(this.options.pedantic?(_=2,g=u.trimStart()):y?_=t[1].length+1:(_=t[2].search(/[^ ]/),_=_>4?1:_,g=u.slice(_),_+=t[1].length),y&&/^ *$/.test(m)&&(p+=m+`
`,e=e.substring(m.length+1),l=!0),!l){const I=new RegExp(`^ {0,${Math.min(3,_-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),O=new RegExp(`^ {0,${Math.min(3,_-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),v=new RegExp(`^ {0,${Math.min(3,_-1)}}(?:\`\`\`|~~~)`),b=new RegExp(`^ {0,${Math.min(3,_-1)}}#`);for(;e;){const x=e.split(`
`,1)[0];if(m=x,this.options.pedantic&&(m=m.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),v.test(m)||b.test(m)||I.test(m)||O.test(e))break;if(m.search(/[^ ]/)>=_||!m.trim())g+=`
`+m.slice(_);else{if(y||u.search(/[^ ]/)>=4||v.test(u)||b.test(u)||O.test(u))break;g+=`
`+m}!y&&!m.trim()&&(y=!0),p+=x+`
`,e=e.substring(x.length+1),u=m.slice(_)}}i.loose||(d?i.loose=!0:/\n *\n *$/.test(p)&&(d=!0));let C=null,w;this.options.gfm&&(C=/^\[[ xX]\] /.exec(g),C&&(w=C[0]!=="[ ] ",g=g.replace(/^\[[ xX]\] +/,""))),i.items.push({type:"list_item",raw:p,task:!!C,checked:w,loose:!1,text:g,tokens:[]}),i.raw+=p}i.items[i.items.length-1].raw=i.items[i.items.length-1].raw.trimEnd(),i.items[i.items.length-1].text=i.items[i.items.length-1].text.trimEnd(),i.raw=i.raw.trimEnd();for(let l=0;l<i.items.length;l++)if(this.lexer.state.top=!1,i.items[l].tokens=this.lexer.blockTokens(i.items[l].text,[]),!i.loose){const p=i.items[l].tokens.filter(u=>u.type==="space"),g=p.length>0&&p.some(u=>/\n.*\n/.test(u.raw));i.loose=g}if(i.loose)for(let l=0;l<i.items.length;l++)i.items[l].loose=!0;return i}}html(e){const t=this.rules.block.html.exec(e);if(t)return{type:"html",block:!0,raw:t[0],pre:t[1]==="pre"||t[1]==="script"||t[1]==="style",text:t[0]}}def(e){const t=this.rules.block.def.exec(e);if(t){const a=t[1].toLowerCase().replace(/\s+/g," "),n=t[2]?t[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:a,raw:t[0],href:n,title:i}}}table(e){const t=this.rules.block.table.exec(e);if(!t||!/[:|]/.test(t[2]))return;const a=_a(t[1]),n=t[2].replace(/^\||\| *$/g,"").split("|"),i=t[3]&&t[3].trim()?t[3].replace(/\n[ \t]*$/,"").split(`
`):[],o={type:"table",raw:t[0],header:[],align:[],rows:[]};if(a.length===n.length){for(const d of n)/^ *-+: *$/.test(d)?o.align.push("right"):/^ *:-+: *$/.test(d)?o.align.push("center"):/^ *:-+ *$/.test(d)?o.align.push("left"):o.align.push(null);for(let d=0;d<a.length;d++)o.header.push({text:a[d],tokens:this.lexer.inline(a[d]),header:!0,align:o.align[d]});for(const d of i)o.rows.push(_a(d,o.header.length).map((l,p)=>({text:l,tokens:this.lexer.inline(l),header:!1,align:o.align[p]})));return o}}lheading(e){const t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){const t=this.rules.block.paragraph.exec(e);if(t){const a=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:a,tokens:this.lexer.inline(a)}}}text(e){const t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){const t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:ee(t[1])}}tag(e){const t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&/^<a /i.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){const t=this.rules.inline.link.exec(e);if(t){const a=t[2].trim();if(!this.options.pedantic&&/^</.test(a)){if(!/>$/.test(a))return;const o=$e(a.slice(0,-1),"\\");if((a.length-o.length)%2===0)return}else{const o=Wn(t[2],"()");if(o>-1){const l=(t[0].indexOf("!")===0?5:4)+t[1].length+o;t[2]=t[2].substring(0,o),t[0]=t[0].substring(0,l).trim(),t[3]=""}}let n=t[2],i="";if(this.options.pedantic){const o=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(n);o&&(n=o[1],i=o[3])}else i=t[3]?t[3].slice(1,-1):"";return n=n.trim(),/^</.test(n)&&(this.options.pedantic&&!/>$/.test(a)?n=n.slice(1):n=n.slice(1,-1)),va(t,{href:n&&n.replace(this.rules.inline.anyPunctuation,"$1"),title:i&&i.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer)}}reflink(e,t){let a;if((a=this.rules.inline.reflink.exec(e))||(a=this.rules.inline.nolink.exec(e))){const n=(a[2]||a[1]).replace(/\s+/g," "),i=t[n.toLowerCase()];if(!i){const o=a[0].charAt(0);return{type:"text",raw:o,text:o}}return va(a,i,a[0],this.lexer)}}emStrong(e,t,a=""){let n=this.rules.inline.emStrongLDelim.exec(e);if(!n||n[3]&&a.match(/[\p{L}\p{N}]/u))return;if(!(n[1]||n[2]||"")||!a||this.rules.inline.punctuation.exec(a)){const o=[...n[0]].length-1;let d,l,p=o,g=0;const u=n[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(u.lastIndex=0,t=t.slice(-1*e.length+o);(n=u.exec(t))!=null;){if(d=n[1]||n[2]||n[3]||n[4]||n[5]||n[6],!d)continue;if(l=[...d].length,n[3]||n[4]){p+=l;continue}else if((n[5]||n[6])&&o%3&&!((o+l)%3)){g+=l;continue}if(p-=l,p>0)continue;l=Math.min(l,l+p+g);const m=[...n[0]][0].length,y=e.slice(0,o+n.index+m+l);if(Math.min(o,l)%2){const C=y.slice(1,-1);return{type:"em",raw:y,text:C,tokens:this.lexer.inlineTokens(C)}}const _=y.slice(2,-2);return{type:"strong",raw:y,text:_,tokens:this.lexer.inlineTokens(_)}}}}codespan(e){const t=this.rules.inline.code.exec(e);if(t){let a=t[2].replace(/\n/g," ");const n=/[^ ]/.test(a),i=/^ /.test(a)&&/ $/.test(a);return n&&i&&(a=a.substring(1,a.length-1)),a=ee(a,!0),{type:"codespan",raw:t[0],text:a}}}br(e){const t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e){const t=this.rules.inline.del.exec(e);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e){const t=this.rules.inline.autolink.exec(e);if(t){let a,n;return t[2]==="@"?(a=ee(t[1]),n="mailto:"+a):(a=ee(t[1]),n=a),{type:"link",raw:t[0],text:a,href:n,tokens:[{type:"text",raw:a,text:a}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let a,n;if(t[2]==="@")a=ee(t[0]),n="mailto:"+a;else{let i;do i=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??"";while(i!==t[0]);a=ee(t[0]),t[1]==="www."?n="http://"+t[0]:n=t[0]}return{type:"link",raw:t[0],text:a,href:n,tokens:[{type:"text",raw:a,text:a}]}}}inlineText(e){const t=this.rules.inline.text.exec(e);if(t){let a;return this.lexer.state.inRawBlock?a=t[0]:a=ee(t[0]),{type:"text",raw:t[0],text:a}}}}const Kn=/^(?: *(?:\n|$))+/,Xn=/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,Zn=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,Be=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Jn=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Ta=/(?:[*+-]|\d{1,9}[.)])/,Ea=D(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g,Ta).replace(/blockCode/g,/ {4}/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).getRegex(),Pt=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Vn=/^[^\n]+/,Nt=/(?!\s*\])(?:\\.|[^\[\]\\])+/,Qn=D(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/).replace("label",Nt).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),ei=D(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,Ta).getRegex(),nt="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",Mt=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,ti=D("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))","i").replace("comment",Mt).replace("tag",nt).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),Sa=D(Pt).replace("hr",Be).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",nt).getRegex(),zt={blockquote:D(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",Sa).getRegex(),code:Xn,def:Qn,fences:Zn,heading:Jn,hr:Be,html:ti,lheading:Ea,list:ei,newline:Kn,paragraph:Sa,table:ze,text:Vn},Aa=D("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",Be).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",nt).getRegex(),ai={...zt,table:Aa,paragraph:D(Pt).replace("hr",Be).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Aa).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",nt).getRegex()},ni={...zt,html:D(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",Mt).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:ze,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:D(Pt).replace("hr",Be).replace("heading",` *#{1,6} *[^
]`).replace("lheading",Ea).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Ca=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,ii=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Ia=/^( {2,}|\\)\n(?!\s*$)/,si=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Ue="\\p{P}\\p{S}",oi=D(/^((?![*_])[\spunctuation])/,"u").replace(/punctuation/g,Ue).getRegex(),ri=/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g,li=D(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,"u").replace(/punct/g,Ue).getRegex(),di=D("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])","gu").replace(/punct/g,Ue).getRegex(),ci=D("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])","gu").replace(/punct/g,Ue).getRegex(),gi=D(/\\([punct])/,"gu").replace(/punct/g,Ue).getRegex(),pi=D(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),ui=D(Mt).replace("(?:-->|$)","-->").getRegex(),hi=D("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",ui).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),it=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,fi=D(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label",it).replace("href",/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Ra=D(/^!?\[(label)\]\[(ref)\]/).replace("label",it).replace("ref",Nt).getRegex(),Oa=D(/^!?\[(ref)\](?:\[\])?/).replace("ref",Nt).getRegex(),mi=D("reflink|nolink(?!\\()","g").replace("reflink",Ra).replace("nolink",Oa).getRegex(),$t={_backpedal:ze,anyPunctuation:gi,autolink:pi,blockSkip:ri,br:Ia,code:ii,del:ze,emStrongLDelim:li,emStrongRDelimAst:di,emStrongRDelimUnd:ci,escape:Ca,link:fi,nolink:Oa,punctuation:oi,reflink:Ra,reflinkSearch:mi,tag:hi,text:si,url:ze},ki={...$t,link:D(/^!?\[(label)\]\((.*?)\)/).replace("label",it).getRegex(),reflink:D(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",it).getRegex()},Bt={...$t,escape:D(Ca).replace("])","~|])").getRegex(),url:D(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},bi={...Bt,br:D(Ia).replace("{2,}","*").getRegex(),text:D(Bt.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},st={normal:zt,gfm:ai,pedantic:ni},He={normal:$t,gfm:Bt,breaks:bi,pedantic:ki};class se{constructor(e){f(this,"tokens");f(this,"options");f(this,"state");f(this,"tokenizer");f(this,"inlineQueue");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||xe,this.options.tokenizer=this.options.tokenizer||new at,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const t={block:st.normal,inline:He.normal};this.options.pedantic?(t.block=st.pedantic,t.inline=He.pedantic):this.options.gfm&&(t.block=st.gfm,this.options.breaks?t.inline=He.breaks:t.inline=He.gfm),this.tokenizer.rules=t}static get rules(){return{block:st,inline:He}}static lex(e,t){return new se(t).lex(e)}static lexInline(e,t){return new se(t).inlineTokens(e)}lex(e){e=e.replace(/\r\n|\r/g,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){const a=this.inlineQueue[t];this.inlineTokens(a.src,a.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],a=!1){this.options.pedantic?e=e.replace(/\t/g,"    ").replace(/^ +$/gm,""):e=e.replace(/^( *)(\t+)/gm,(d,l,p)=>l+"    ".repeat(p.length));let n,i,o;for(;e;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(d=>(n=d.call({lexer:this},e,t))?(e=e.substring(n.raw.length),t.push(n),!0):!1))){if(n=this.tokenizer.space(e)){e=e.substring(n.raw.length),n.raw.length===1&&t.length>0?t[t.length-1].raw+=`
`:t.push(n);continue}if(n=this.tokenizer.code(e)){e=e.substring(n.raw.length),i=t[t.length-1],i&&(i.type==="paragraph"||i.type==="text")?(i.raw+=`
`+n.raw,i.text+=`
`+n.text,this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(n);continue}if(n=this.tokenizer.fences(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.heading(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.hr(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.blockquote(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.list(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.html(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.def(e)){e=e.substring(n.raw.length),i=t[t.length-1],i&&(i.type==="paragraph"||i.type==="text")?(i.raw+=`
`+n.raw,i.text+=`
`+n.raw,this.inlineQueue[this.inlineQueue.length-1].src=i.text):this.tokens.links[n.tag]||(this.tokens.links[n.tag]={href:n.href,title:n.title});continue}if(n=this.tokenizer.table(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.lheading(e)){e=e.substring(n.raw.length),t.push(n);continue}if(o=e,this.options.extensions&&this.options.extensions.startBlock){let d=1/0;const l=e.slice(1);let p;this.options.extensions.startBlock.forEach(g=>{p=g.call({lexer:this},l),typeof p=="number"&&p>=0&&(d=Math.min(d,p))}),d<1/0&&d>=0&&(o=e.substring(0,d+1))}if(this.state.top&&(n=this.tokenizer.paragraph(o))){i=t[t.length-1],a&&i?.type==="paragraph"?(i.raw+=`
`+n.raw,i.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(n),a=o.length!==e.length,e=e.substring(n.raw.length);continue}if(n=this.tokenizer.text(e)){e=e.substring(n.raw.length),i=t[t.length-1],i&&i.type==="text"?(i.raw+=`
`+n.raw,i.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(n);continue}if(e){const d="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(d);break}else throw new Error(d)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let a,n,i,o=e,d,l,p;if(this.tokens.links){const g=Object.keys(this.tokens.links);if(g.length>0)for(;(d=this.tokenizer.rules.inline.reflinkSearch.exec(o))!=null;)g.includes(d[0].slice(d[0].lastIndexOf("[")+1,-1))&&(o=o.slice(0,d.index)+"["+"a".repeat(d[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(d=this.tokenizer.rules.inline.blockSkip.exec(o))!=null;)o=o.slice(0,d.index)+"["+"a".repeat(d[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;(d=this.tokenizer.rules.inline.anyPunctuation.exec(o))!=null;)o=o.slice(0,d.index)+"++"+o.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;e;)if(l||(p=""),l=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(g=>(a=g.call({lexer:this},e,t))?(e=e.substring(a.raw.length),t.push(a),!0):!1))){if(a=this.tokenizer.escape(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.tag(e)){e=e.substring(a.raw.length),n=t[t.length-1],n&&a.type==="text"&&n.type==="text"?(n.raw+=a.raw,n.text+=a.text):t.push(a);continue}if(a=this.tokenizer.link(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(a.raw.length),n=t[t.length-1],n&&a.type==="text"&&n.type==="text"?(n.raw+=a.raw,n.text+=a.text):t.push(a);continue}if(a=this.tokenizer.emStrong(e,o,p)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.codespan(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.br(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.del(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.autolink(e)){e=e.substring(a.raw.length),t.push(a);continue}if(!this.state.inLink&&(a=this.tokenizer.url(e))){e=e.substring(a.raw.length),t.push(a);continue}if(i=e,this.options.extensions&&this.options.extensions.startInline){let g=1/0;const u=e.slice(1);let m;this.options.extensions.startInline.forEach(y=>{m=y.call({lexer:this},u),typeof m=="number"&&m>=0&&(g=Math.min(g,m))}),g<1/0&&g>=0&&(i=e.substring(0,g+1))}if(a=this.tokenizer.inlineText(i)){e=e.substring(a.raw.length),a.raw.slice(-1)!=="_"&&(p=a.raw.slice(-1)),l=!0,n=t[t.length-1],n&&n.type==="text"?(n.raw+=a.raw,n.text+=a.text):t.push(a);continue}if(e){const g="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(g);break}else throw new Error(g)}}return t}}class ot{constructor(e){f(this,"options");f(this,"parser");this.options=e||xe}space(e){return""}code({text:e,lang:t,escaped:a}){const n=(t||"").match(/^\S*/)?.[0],i=e.replace(/\n$/,"")+`
`;return n?'<pre><code class="language-'+ee(n)+'">'+(a?i:ee(i,!0))+`</code></pre>
`:"<pre><code>"+(a?i:ee(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){const t=e.ordered,a=e.start;let n="";for(let d=0;d<e.items.length;d++){const l=e.items[d];n+=this.listitem(l)}const i=t?"ol":"ul",o=t&&a!==1?' start="'+a+'"':"";return"<"+i+o+`>
`+n+"</"+i+`>
`}listitem(e){let t="";if(e.task){const a=this.checkbox({checked:!!e.checked});e.loose?e.tokens.length>0&&e.tokens[0].type==="paragraph"?(e.tokens[0].text=a+" "+e.tokens[0].text,e.tokens[0].tokens&&e.tokens[0].tokens.length>0&&e.tokens[0].tokens[0].type==="text"&&(e.tokens[0].tokens[0].text=a+" "+e.tokens[0].tokens[0].text)):e.tokens.unshift({type:"text",raw:a+" ",text:a+" "}):t+=a+" "}return t+=this.parser.parse(e.tokens,!!e.loose),`<li>${t}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t="",a="";for(let i=0;i<e.header.length;i++)a+=this.tablecell(e.header[i]);t+=this.tablerow({text:a});let n="";for(let i=0;i<e.rows.length;i++){const o=e.rows[i];a="";for(let d=0;d<o.length;d++)a+=this.tablecell(o[d]);n+=this.tablerow({text:a})}return n&&(n=`<tbody>${n}</tbody>`),`<table>
<thead>
`+t+`</thead>
`+n+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){const t=this.parser.parseInline(e.tokens),a=e.header?"th":"td";return(e.align?`<${a} align="${e.align}">`:`<${a}>`)+t+`</${a}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${e}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:a}){const n=this.parser.parseInline(a),i=wa(e);if(i===null)return n;e=i;let o='<a href="'+e+'"';return t&&(o+=' title="'+t+'"'),o+=">"+n+"</a>",o}image({href:e,title:t,text:a}){const n=wa(e);if(n===null)return a;e=n;let i=`<img src="${e}" alt="${a}"`;return t&&(i+=` title="${t}"`),i+=">",i}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):e.text}}class Ut{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}}class oe{constructor(e){f(this,"options");f(this,"renderer");f(this,"textRenderer");this.options=e||xe,this.options.renderer=this.options.renderer||new ot,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Ut}static parse(e,t){return new oe(t).parse(e)}static parseInline(e,t){return new oe(t).parseInline(e)}parse(e,t=!0){let a="";for(let n=0;n<e.length;n++){const i=e[n];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){const d=i,l=this.options.extensions.renderers[d.type].call({parser:this},d);if(l!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(d.type)){a+=l||"";continue}}const o=i;switch(o.type){case"space":{a+=this.renderer.space(o);continue}case"hr":{a+=this.renderer.hr(o);continue}case"heading":{a+=this.renderer.heading(o);continue}case"code":{a+=this.renderer.code(o);continue}case"table":{a+=this.renderer.table(o);continue}case"blockquote":{a+=this.renderer.blockquote(o);continue}case"list":{a+=this.renderer.list(o);continue}case"html":{a+=this.renderer.html(o);continue}case"paragraph":{a+=this.renderer.paragraph(o);continue}case"text":{let d=o,l=this.renderer.text(d);for(;n+1<e.length&&e[n+1].type==="text";)d=e[++n],l+=`
`+this.renderer.text(d);t?a+=this.renderer.paragraph({type:"paragraph",raw:l,text:l,tokens:[{type:"text",raw:l,text:l}]}):a+=l;continue}default:{const d='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(d),"";throw new Error(d)}}}return a}parseInline(e,t){t=t||this.renderer;let a="";for(let n=0;n<e.length;n++){const i=e[n];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){const d=this.options.extensions.renderers[i.type].call({parser:this},i);if(d!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){a+=d||"";continue}}const o=i;switch(o.type){case"escape":{a+=t.text(o);break}case"html":{a+=t.html(o);break}case"link":{a+=t.link(o);break}case"image":{a+=t.image(o);break}case"strong":{a+=t.strong(o);break}case"em":{a+=t.em(o);break}case"codespan":{a+=t.codespan(o);break}case"br":{a+=t.br(o);break}case"del":{a+=t.del(o);break}case"text":{a+=t.text(o);break}default:{const d='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(d),"";throw new Error(d)}}}return a}}class Fe{constructor(e){f(this,"options");this.options=e||xe}preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}}f(Fe,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens"]));class xi{constructor(...e){zn(this,he);f(this,"defaults",Lt());f(this,"options",this.setOptions);f(this,"parse",tt(this,he,ma).call(this,se.lex,oe.parse));f(this,"parseInline",tt(this,he,ma).call(this,se.lexInline,oe.parseInline));f(this,"Parser",oe);f(this,"Renderer",ot);f(this,"TextRenderer",Ut);f(this,"Lexer",se);f(this,"Tokenizer",at);f(this,"Hooks",Fe);this.use(...e)}walkTokens(e,t){let a=[];for(const n of e)switch(a=a.concat(t.call(this,n)),n.type){case"table":{const i=n;for(const o of i.header)a=a.concat(this.walkTokens(o.tokens,t));for(const o of i.rows)for(const d of o)a=a.concat(this.walkTokens(d.tokens,t));break}case"list":{const i=n;a=a.concat(this.walkTokens(i.items,t));break}default:{const i=n;this.defaults.extensions?.childTokens?.[i.type]?this.defaults.extensions.childTokens[i.type].forEach(o=>{const d=i[o].flat(1/0);a=a.concat(this.walkTokens(d,t))}):i.tokens&&(a=a.concat(this.walkTokens(i.tokens,t)))}}return a}use(...e){const t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(a=>{const n={...a};if(n.async=this.defaults.async||n.async||!1,a.extensions&&(a.extensions.forEach(i=>{if(!i.name)throw new Error("extension name required");if("renderer"in i){const o=t.renderers[i.name];o?t.renderers[i.name]=function(...d){let l=i.renderer.apply(this,d);return l===!1&&(l=o.apply(this,d)),l}:t.renderers[i.name]=i.renderer}if("tokenizer"in i){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");const o=t[i.level];o?o.unshift(i.tokenizer):t[i.level]=[i.tokenizer],i.start&&(i.level==="block"?t.startBlock?t.startBlock.push(i.start):t.startBlock=[i.start]:i.level==="inline"&&(t.startInline?t.startInline.push(i.start):t.startInline=[i.start]))}"childTokens"in i&&i.childTokens&&(t.childTokens[i.name]=i.childTokens)}),n.extensions=t),a.renderer){const i=this.defaults.renderer||new ot(this.defaults);for(const o in a.renderer){if(!(o in i))throw new Error(`renderer '${o}' does not exist`);if(["options","parser"].includes(o))continue;const d=o;let l=a.renderer[d];a.useNewRenderer||(l=tt(this,he,$n).call(this,l,d,i));const p=i[d];i[d]=(...g)=>{let u=l.apply(i,g);return u===!1&&(u=p.apply(i,g)),u||""}}n.renderer=i}if(a.tokenizer){const i=this.defaults.tokenizer||new at(this.defaults);for(const o in a.tokenizer){if(!(o in i))throw new Error(`tokenizer '${o}' does not exist`);if(["options","rules","lexer"].includes(o))continue;const d=o,l=a.tokenizer[d],p=i[d];i[d]=(...g)=>{let u=l.apply(i,g);return u===!1&&(u=p.apply(i,g)),u}}n.tokenizer=i}if(a.hooks){const i=this.defaults.hooks||new Fe;for(const o in a.hooks){if(!(o in i))throw new Error(`hook '${o}' does not exist`);if(o==="options")continue;const d=o,l=a.hooks[d],p=i[d];Fe.passThroughHooks.has(o)?i[d]=g=>{if(this.defaults.async)return Promise.resolve(l.call(i,g)).then(m=>p.call(i,m));const u=l.call(i,g);return p.call(i,u)}:i[d]=(...g)=>{let u=l.apply(i,g);return u===!1&&(u=p.apply(i,g)),u}}n.hooks=i}if(a.walkTokens){const i=this.defaults.walkTokens,o=a.walkTokens;n.walkTokens=function(d){let l=[];return l.push(o.call(this,d)),i&&(l=l.concat(i.call(this,d))),l}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return se.lex(e,t??this.defaults)}parser(e,t){return oe.parse(e,t??this.defaults)}}he=new WeakSet,$n=function(e,t,a){switch(t){case"heading":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,a.parser.parseInline(n.tokens),n.depth,jn(a.parser.parseInline(n.tokens,a.parser.textRenderer)))};case"code":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.text,n.lang,!!n.escaped)};case"table":return function(n){if(!n.type||n.type!==t)return e.apply(this,arguments);let i="",o="";for(let l=0;l<n.header.length;l++)o+=this.tablecell({text:n.header[l].text,tokens:n.header[l].tokens,header:!0,align:n.align[l]});i+=this.tablerow({text:o});let d="";for(let l=0;l<n.rows.length;l++){const p=n.rows[l];o="";for(let g=0;g<p.length;g++)o+=this.tablecell({text:p[g].text,tokens:p[g].tokens,header:!1,align:n.align[g]});d+=this.tablerow({text:o})}return e.call(this,i,d)};case"blockquote":return function(n){if(!n.type||n.type!==t)return e.apply(this,arguments);const i=this.parser.parse(n.tokens);return e.call(this,i)};case"list":return function(n){if(!n.type||n.type!==t)return e.apply(this,arguments);const i=n.ordered,o=n.start,d=n.loose;let l="";for(let p=0;p<n.items.length;p++){const g=n.items[p],u=g.checked,m=g.task;let y="";if(g.task){const _=this.checkbox({checked:!!u});d?g.tokens.length>0&&g.tokens[0].type==="paragraph"?(g.tokens[0].text=_+" "+g.tokens[0].text,g.tokens[0].tokens&&g.tokens[0].tokens.length>0&&g.tokens[0].tokens[0].type==="text"&&(g.tokens[0].tokens[0].text=_+" "+g.tokens[0].tokens[0].text)):g.tokens.unshift({type:"text",text:_+" "}):y+=_+" "}y+=this.parser.parse(g.tokens,d),l+=this.listitem({type:"list_item",raw:y,text:y,task:m,checked:!!u,loose:d,tokens:g.tokens})}return e.call(this,l,i,o)};case"html":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.text,n.block)};case"paragraph":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(n.tokens))};case"escape":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.text)};case"link":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.href,n.title,this.parser.parseInline(n.tokens))};case"image":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.href,n.title,n.text)};case"strong":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(n.tokens))};case"em":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(n.tokens))};case"codespan":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.text)};case"del":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(n.tokens))};case"text":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.text)}}return e},ma=function(e,t){return(a,n)=>{const i={...n},o={...this.defaults,...i};this.defaults.async===!0&&i.async===!1&&(o.silent||console.warn("marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored."),o.async=!0);const d=tt(this,he,Bn).call(this,!!o.silent,!!o.async);if(typeof a>"u"||a===null)return d(new Error("marked(): input parameter is undefined or null"));if(typeof a!="string")return d(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(a)+", string expected"));if(o.hooks&&(o.hooks.options=o),o.async)return Promise.resolve(o.hooks?o.hooks.preprocess(a):a).then(l=>e(l,o)).then(l=>o.hooks?o.hooks.processAllTokens(l):l).then(l=>o.walkTokens?Promise.all(this.walkTokens(l,o.walkTokens)).then(()=>l):l).then(l=>t(l,o)).then(l=>o.hooks?o.hooks.postprocess(l):l).catch(d);try{o.hooks&&(a=o.hooks.preprocess(a));let l=e(a,o);o.hooks&&(l=o.hooks.processAllTokens(l)),o.walkTokens&&this.walkTokens(l,o.walkTokens);let p=t(l,o);return o.hooks&&(p=o.hooks.postprocess(p)),p}catch(l){return d(l)}}},Bn=function(e,t){return a=>{if(a.message+=`
Please report this to https://github.com/markedjs/marked.`,e){const n="<p>An error occurred:</p><pre>"+ee(a.message+"",!0)+"</pre>";return t?Promise.resolve(n):n}if(t)return Promise.reject(a);throw a}};const ye=new xi;function R(s,e){return ye.parse(s,e)}R.options=R.setOptions=function(s){return ye.setOptions(s),R.defaults=ye.defaults,ka(R.defaults),R},R.getDefaults=Lt,R.defaults=xe,R.use=function(...s){return ye.use(...s),R.defaults=ye.defaults,ka(R.defaults),R},R.walkTokens=function(s,e){return ye.walkTokens(s,e)},R.parseInline=ye.parseInline,R.Parser=oe,R.parser=oe.parse,R.Renderer=ot,R.TextRenderer=Ut,R.Lexer=se,R.lexer=se.lex,R.Tokenizer=at,R.Hooks=Fe,R.parse=R,R.options,R.setOptions,R.use,R.walkTokens,R.parseInline,oe.parse,se.lex;/*! @license DOMPurify 3.4.9 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.9/LICENSE */function Da(s,e){(e==null||e>s.length)&&(e=s.length);for(var t=0,a=Array(e);t<e;t++)a[t]=s[t];return a}function yi(s){if(Array.isArray(s))return s}function wi(s,e){var t=s==null?null:typeof Symbol<"u"&&s[Symbol.iterator]||s["@@iterator"];if(t!=null){var a,n,i,o,d=[],l=!0,p=!1;try{if(i=(t=t.call(s)).next,e!==0)for(;!(l=(a=i.call(t)).done)&&(d.push(a.value),d.length!==e);l=!0);}catch(g){p=!0,n=g}finally{try{if(!l&&t.return!=null&&(o=t.return(),Object(o)!==o))return}finally{if(p)throw n}}return d}}function _i(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function vi(s,e){return yi(s)||wi(s,e)||Ti(s,e)||_i()}function Ti(s,e){if(s){if(typeof s=="string")return Da(s,e);var t={}.toString.call(s).slice(8,-1);return t==="Object"&&s.constructor&&(t=s.constructor.name),t==="Map"||t==="Set"?Array.from(s):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?Da(s,e):void 0}}const La=Object.entries,Pa=Object.setPrototypeOf,Ei=Object.isFrozen,Si=Object.getPrototypeOf,Ai=Object.getOwnPropertyDescriptor;let Z=Object.freeze,ae=Object.seal,Se=Object.create,Na=typeof Reflect<"u"&&Reflect,Ht=Na.apply,Ft=Na.construct;Z||(Z=function(e){return e}),ae||(ae=function(e){return e}),Ht||(Ht=function(e,t){for(var a=arguments.length,n=new Array(a>2?a-2:0),i=2;i<a;i++)n[i-2]=arguments[i];return e.apply(t,n)}),Ft||(Ft=function(e){for(var t=arguments.length,a=new Array(t>1?t-1:0),n=1;n<t;n++)a[n-1]=arguments[n];return new e(...a)});const ue=j(Array.prototype.forEach),Ci=j(Array.prototype.lastIndexOf),Ma=j(Array.prototype.pop),Ae=j(Array.prototype.push),Ii=j(Array.prototype.splice),J=Array.isArray,qe=j(String.prototype.toLowerCase),qt=j(String.prototype.toString),za=j(String.prototype.match),Ce=j(String.prototype.replace),$a=j(String.prototype.indexOf),Ri=j(String.prototype.trim),Oi=j(Number.prototype.toString),Di=j(Boolean.prototype.toString),Ba=typeof BigInt>"u"?null:j(BigInt.prototype.toString),Ua=typeof Symbol>"u"?null:j(Symbol.prototype.toString),M=j(Object.prototype.hasOwnProperty),je=j(Object.prototype.toString),K=j(RegExp.prototype.test),we=Li(TypeError);function j(s){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var t=arguments.length,a=new Array(t>1?t-1:0),n=1;n<t;n++)a[n-1]=arguments[n];return Ht(s,e,a)}}function Li(s){return function(){for(var e=arguments.length,t=new Array(e),a=0;a<e;a++)t[a]=arguments[a];return Ft(s,t)}}function S(s,e){let t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:qe;if(Pa&&Pa(s,null),!J(e))return s;let a=e.length;for(;a--;){let n=e[a];if(typeof n=="string"){const i=t(n);i!==n&&(Ei(e)||(e[a]=i),n=i)}s[n]=!0}return s}function Pi(s){for(let e=0;e<s.length;e++)M(s,e)||(s[e]=null);return s}function X(s){const e=Se(null);for(const a of La(s)){var t=vi(a,2);const n=t[0],i=t[1];M(s,n)&&(J(i)?e[n]=Pi(i):i&&typeof i=="object"&&i.constructor===Object?e[n]=X(i):e[n]=i)}return e}function Ni(s){switch(typeof s){case"string":return s;case"number":return Oi(s);case"boolean":return Di(s);case"bigint":return Ba?Ba(s):"0";case"symbol":return Ua?Ua(s):"Symbol()";case"undefined":return je(s);case"function":case"object":{if(s===null)return je(s);const e=s,t=re(e,"toString");if(typeof t=="function"){const a=t(e);return typeof a=="string"?a:je(a)}return je(s)}default:return je(s)}}function re(s,e){for(;s!==null;){const a=Ai(s,e);if(a){if(a.get)return j(a.get);if(typeof a.value=="function")return j(a.value)}s=Si(s)}function t(){return null}return t}function Mi(s){try{return K(s,""),!0}catch{return!1}}const Ha=Z(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),jt=Z(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),Gt=Z(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),zi=Z(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),Wt=Z(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),$i=Z(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),Fa=Z(["#text"]),qa=Z(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),Yt=Z(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),ja=Z(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),rt=Z(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),Bi=ae(/{{[\w\W]*|^[\w\W]*}}/g),Ui=ae(/<%[\w\W]*|^[\w\W]*%>/g),Hi=ae(/\${[\w\W]*/g),Fi=ae(/^data-[\-\w.\u00B7-\uFFFF]+$/),qi=ae(/^aria-[\-\w]+$/),Ga=ae(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),ji=ae(/^(?:\w+script|data):/i),Gi=ae(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),Wi=ae(/^html$/i),Yi=ae(/^[a-z][.\w]*(-[.\w]+)+$/i),le={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,progressingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},Ki=function(){return typeof window>"u"?null:window},Xi=function(e,t){if(typeof e!="object"||typeof e.createPolicy!="function")return null;let a=null;const n="data-tt-policy-suffix";t&&t.hasAttribute(n)&&(a=t.getAttribute(n));const i="dompurify"+(a?"#"+a:"");try{return e.createPolicy(i,{createHTML(o){return o},createScriptURL(o){return o}})}catch{return console.warn("TrustedTypes policy "+i+" could not be created."),null}},Wa=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function Ya(){let s=arguments.length>0&&arguments[0]!==void 0?arguments[0]:Ki();const e=k=>Ya(k);if(e.version="3.4.9",e.removed=[],!s||!s.document||s.document.nodeType!==le.document||!s.Element)return e.isSupported=!1,e;let t=s.document;const a=t,n=a.currentScript;s.DocumentFragment;const i=s.HTMLTemplateElement,o=s.Node,d=s.Element,l=s.NodeFilter,p=s.NamedNodeMap;p===void 0&&(s.NamedNodeMap||s.MozNamedAttrMap),s.HTMLFormElement;const g=s.DOMParser,u=s.trustedTypes,m=d.prototype,y=re(m,"cloneNode"),_=re(m,"remove"),C=re(m,"nextSibling"),w=re(m,"childNodes"),I=re(m,"parentNode"),O=re(m,"shadowRoot"),v=re(m,"attributes"),b=o&&o.prototype?re(o.prototype,"nodeType"):null,x=o&&o.prototype?re(o.prototype,"nodeName"):null;if(typeof i=="function"){const k=t.createElement("template");k.content&&k.content.ownerDocument&&(t=k.content.ownerDocument)}let P,B="",te,ne=!1,Ze=0;const gn=function(){if(Ze>0)throw we('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')},Oe=function(r){gn(),Ze++;try{return P.createHTML(r)}finally{Ze--}},Cs=function(r){gn(),Ze++;try{return P.createScriptURL(r)}finally{Ze--}},Is=function(){return ne||(te=Xi(u,n),ne=!0),te},_t=t,Qt=_t.implementation,pn=_t.createNodeIterator,Rs=_t.createDocumentFragment,Os=_t.getElementsByTagName,Ds=a.importNode;let W=Wa();e.isSupported=typeof La=="function"&&typeof I=="function"&&Qt&&Qt.createHTMLDocument!==void 0;const vt=Bi,Tt=Ui,Et=Hi,Ls=Fi,Ps=qi,Ns=ji,un=Gi,Ms=Yi;let hn=Ga,U=null;const ea=S({},[...Ha,...jt,...Gt,...Wt,...Fa]);let H=null;const ta=S({},[...qa,...Yt,...ja,...rt]);let F=Object.seal(Se(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Je=null,St=null;const me=Object.seal(Se(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let fn=!0,aa=!0,mn=!1,kn=!0,ke=!1,Ve=!0,Te=!1,na=!1,ia=!1,De=!1,At=!1,Ct=!1,bn=!0,xn=!1;const yn="user-content-";let sa=!0,oa=!1,Le={},ge=null;const ra=S({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]);let wn=null;const _n=S({},["audio","video","img","source","image","track"]);let la=null;const vn=S({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),It="http://www.w3.org/1998/Math/MathML",Rt="http://www.w3.org/2000/svg",pe="http://www.w3.org/1999/xhtml";let Pe=pe,da=!1,ca=null;const zs=S({},[It,Rt,pe],qt);let ga=S({},["mi","mo","mn","ms","mtext"]),pa=S({},["annotation-xml"]);const $s=S({},["title","style","font","a","script"]);let Qe=null;const Bs=["application/xhtml+xml","text/html"],Us="text/html";let z=null,Ne=null;const Hs=t.createElement("form"),Tn=function(r){return r instanceof RegExp||r instanceof Function},ua=function(){let r=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(Ne&&Ne===r)return;(!r||typeof r!="object")&&(r={}),r=X(r),Qe=Bs.indexOf(r.PARSER_MEDIA_TYPE)===-1?Us:r.PARSER_MEDIA_TYPE,z=Qe==="application/xhtml+xml"?qt:qe,U=M(r,"ALLOWED_TAGS")&&J(r.ALLOWED_TAGS)?S({},r.ALLOWED_TAGS,z):ea,H=M(r,"ALLOWED_ATTR")&&J(r.ALLOWED_ATTR)?S({},r.ALLOWED_ATTR,z):ta,ca=M(r,"ALLOWED_NAMESPACES")&&J(r.ALLOWED_NAMESPACES)?S({},r.ALLOWED_NAMESPACES,qt):zs,la=M(r,"ADD_URI_SAFE_ATTR")&&J(r.ADD_URI_SAFE_ATTR)?S(X(vn),r.ADD_URI_SAFE_ATTR,z):vn,wn=M(r,"ADD_DATA_URI_TAGS")&&J(r.ADD_DATA_URI_TAGS)?S(X(_n),r.ADD_DATA_URI_TAGS,z):_n,ge=M(r,"FORBID_CONTENTS")&&J(r.FORBID_CONTENTS)?S({},r.FORBID_CONTENTS,z):ra,Je=M(r,"FORBID_TAGS")&&J(r.FORBID_TAGS)?S({},r.FORBID_TAGS,z):X({}),St=M(r,"FORBID_ATTR")&&J(r.FORBID_ATTR)?S({},r.FORBID_ATTR,z):X({}),Le=M(r,"USE_PROFILES")?r.USE_PROFILES&&typeof r.USE_PROFILES=="object"?X(r.USE_PROFILES):r.USE_PROFILES:!1,fn=r.ALLOW_ARIA_ATTR!==!1,aa=r.ALLOW_DATA_ATTR!==!1,mn=r.ALLOW_UNKNOWN_PROTOCOLS||!1,kn=r.ALLOW_SELF_CLOSE_IN_ATTR!==!1,ke=r.SAFE_FOR_TEMPLATES||!1,Ve=r.SAFE_FOR_XML!==!1,Te=r.WHOLE_DOCUMENT||!1,De=r.RETURN_DOM||!1,At=r.RETURN_DOM_FRAGMENT||!1,Ct=r.RETURN_TRUSTED_TYPE||!1,ia=r.FORCE_BODY||!1,bn=r.SANITIZE_DOM!==!1,xn=r.SANITIZE_NAMED_PROPS||!1,sa=r.KEEP_CONTENT!==!1,oa=r.IN_PLACE||!1,hn=Mi(r.ALLOWED_URI_REGEXP)?r.ALLOWED_URI_REGEXP:Ga,Pe=typeof r.NAMESPACE=="string"?r.NAMESPACE:pe,ga=M(r,"MATHML_TEXT_INTEGRATION_POINTS")&&r.MATHML_TEXT_INTEGRATION_POINTS&&typeof r.MATHML_TEXT_INTEGRATION_POINTS=="object"?X(r.MATHML_TEXT_INTEGRATION_POINTS):S({},["mi","mo","mn","ms","mtext"]),pa=M(r,"HTML_INTEGRATION_POINTS")&&r.HTML_INTEGRATION_POINTS&&typeof r.HTML_INTEGRATION_POINTS=="object"?X(r.HTML_INTEGRATION_POINTS):S({},["annotation-xml"]);const c=M(r,"CUSTOM_ELEMENT_HANDLING")&&r.CUSTOM_ELEMENT_HANDLING&&typeof r.CUSTOM_ELEMENT_HANDLING=="object"?X(r.CUSTOM_ELEMENT_HANDLING):Se(null);if(F=Se(null),M(c,"tagNameCheck")&&Tn(c.tagNameCheck)&&(F.tagNameCheck=c.tagNameCheck),M(c,"attributeNameCheck")&&Tn(c.attributeNameCheck)&&(F.attributeNameCheck=c.attributeNameCheck),M(c,"allowCustomizedBuiltInElements")&&typeof c.allowCustomizedBuiltInElements=="boolean"&&(F.allowCustomizedBuiltInElements=c.allowCustomizedBuiltInElements),ke&&(aa=!1),At&&(De=!0),Le&&(U=S({},Fa),H=Se(null),Le.html===!0&&(S(U,Ha),S(H,qa)),Le.svg===!0&&(S(U,jt),S(H,Yt),S(H,rt)),Le.svgFilters===!0&&(S(U,Gt),S(H,Yt),S(H,rt)),Le.mathMl===!0&&(S(U,Wt),S(H,ja),S(H,rt))),me.tagCheck=null,me.attributeCheck=null,M(r,"ADD_TAGS")&&(typeof r.ADD_TAGS=="function"?me.tagCheck=r.ADD_TAGS:J(r.ADD_TAGS)&&(U===ea&&(U=X(U)),S(U,r.ADD_TAGS,z))),M(r,"ADD_ATTR")&&(typeof r.ADD_ATTR=="function"?me.attributeCheck=r.ADD_ATTR:J(r.ADD_ATTR)&&(H===ta&&(H=X(H)),S(H,r.ADD_ATTR,z))),M(r,"ADD_URI_SAFE_ATTR")&&J(r.ADD_URI_SAFE_ATTR)&&S(la,r.ADD_URI_SAFE_ATTR,z),M(r,"FORBID_CONTENTS")&&J(r.FORBID_CONTENTS)&&(ge===ra&&(ge=X(ge)),S(ge,r.FORBID_CONTENTS,z)),M(r,"ADD_FORBID_CONTENTS")&&J(r.ADD_FORBID_CONTENTS)&&(ge===ra&&(ge=X(ge)),S(ge,r.ADD_FORBID_CONTENTS,z)),sa&&(U["#text"]=!0),Te&&S(U,["html","head","body"]),U.table&&(S(U,["tbody"]),delete Je.tbody),r.TRUSTED_TYPES_POLICY){if(typeof r.TRUSTED_TYPES_POLICY.createHTML!="function")throw we('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof r.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw we('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');const h=P;P=r.TRUSTED_TYPES_POLICY;try{B=Oe("")}catch(T){throw P=h,T}}else r.TRUSTED_TYPES_POLICY===null?(P=void 0,B=""):(P===void 0&&(P=Is()),P&&typeof B=="string"&&(B=Oe("")));(W.uponSanitizeElement.length>0||W.uponSanitizeAttribute.length>0)&&U===ea&&(U=X(U)),W.uponSanitizeAttribute.length>0&&H===ta&&(H=X(H)),Z&&Z(r),Ne=r},En=S({},[...jt,...Gt,...zi]),Sn=S({},[...Wt,...$i]),Fs=function(r){let c=I(r);(!c||!c.tagName)&&(c={namespaceURI:Pe,tagName:"template"});const h=qe(r.tagName),T=qe(c.tagName);return ca[r.namespaceURI]?r.namespaceURI===Rt?c.namespaceURI===pe?h==="svg":c.namespaceURI===It?h==="svg"&&(T==="annotation-xml"||ga[T]):!!En[h]:r.namespaceURI===It?c.namespaceURI===pe?h==="math":c.namespaceURI===Rt?h==="math"&&pa[T]:!!Sn[h]:r.namespaceURI===pe?c.namespaceURI===Rt&&!pa[T]||c.namespaceURI===It&&!ga[T]?!1:!Sn[h]&&($s[h]||!En[h]):!!(Qe==="application/xhtml+xml"&&ca[r.namespaceURI]):!1},ie=function(r){Ae(e.removed,{element:r});try{I(r).removeChild(r)}catch{if(_(r),!I(r))throw we("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")}},An=function(r){const c=w?w(r):r.childNodes;if(c){const T=[];ue(c,E=>{Ae(T,E)}),ue(T,E=>{try{_(E)}catch{}})}const h=v?v(r):null;if(h)for(let T=h.length-1;T>=0;--T){const E=h[T],A=E&&E.name;if(typeof A=="string")try{r.removeAttribute(A)}catch{}}},Ee=function(r,c){try{Ae(e.removed,{attribute:c.getAttributeNode(r),from:c})}catch{Ae(e.removed,{attribute:null,from:c})}if(c.removeAttribute(r),r==="is")if(De||At)try{ie(c)}catch{}else try{c.setAttribute(r,"")}catch{}},qs=function(r){const c=v?v(r):r.attributes;if(c)for(let h=c.length-1;h>=0;--h){const T=c[h],E=T&&T.name;if(!(typeof E!="string"||H[z(E)]))try{r.removeAttribute(E)}catch{}}},js=function(r){const c=[r];for(;c.length>0;){const h=c.pop();(b?b(h):h.nodeType)===le.element&&qs(h);const E=w?w(h):h.childNodes;if(E)for(let A=E.length-1;A>=0;--A)c.push(E[A])}},Cn=function(r){let c=null,h=null;if(ia)r="<remove></remove>"+r;else{const A=za(r,/^[\r\n\t ]+/);h=A&&A[0]}Qe==="application/xhtml+xml"&&Pe===pe&&(r='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+r+"</body></html>");const T=P?Oe(r):r;if(Pe===pe)try{c=new g().parseFromString(T,Qe)}catch{}if(!c||!c.documentElement){c=Qt.createDocument(Pe,"template",null);try{c.documentElement.innerHTML=da?B:T}catch{}}const E=c.body||c.documentElement;return r&&h&&E.insertBefore(t.createTextNode(h),E.childNodes[0]||null),Pe===pe?Os.call(c,Te?"html":"body")[0]:Te?c.documentElement:E},In=function(r){return pn.call(r.ownerDocument||r,r,l.SHOW_ELEMENT|l.SHOW_COMMENT|l.SHOW_TEXT|l.SHOW_PROCESSING_INSTRUCTION|l.SHOW_CDATA_SECTION,null)},ha=function(r){var c,h;r.normalize();const T=pn.call(r.ownerDocument||r,r,l.SHOW_TEXT|l.SHOW_COMMENT|l.SHOW_CDATA_SECTION|l.SHOW_PROCESSING_INSTRUCTION,null);let E=T.nextNode();for(;E;){let G=E.data;ue([vt,Tt,Et],L=>{G=Ce(G,L," ")}),E.data=G,E=T.nextNode()}const A=(c=(h=r.querySelectorAll)===null||h===void 0?void 0:h.call(r,"template"))!==null&&c!==void 0?c:[];ue(Array.from(A),G=>{Me(G.content)&&ha(G.content)})},Ot=function(r){const c=x?x(r):null;return typeof c!="string"||z(c)!=="form"?!1:typeof r.nodeName!="string"||typeof r.textContent!="string"||typeof r.removeChild!="function"||r.attributes!==v(r)||typeof r.removeAttribute!="function"||typeof r.setAttribute!="function"||typeof r.namespaceURI!="string"||typeof r.insertBefore!="function"||typeof r.hasChildNodes!="function"||r.nodeType!==b(r)||r.childNodes!==w(r)},Me=function(r){if(!b||typeof r!="object"||r===null)return!1;try{return b(r)===le.documentFragment}catch{return!1}},et=function(r){if(!b||typeof r!="object"||r===null)return!1;try{return typeof b(r)=="number"}catch{return!1}};function fe(k,r,c){ue(k,h=>{h.call(e,r,c,Ne)})}const Rn=function(r){let c=null;if(fe(W.beforeSanitizeElements,r,null),Ot(r))return ie(r),!0;const h=z(x?x(r):r.nodeName);if(fe(W.uponSanitizeElement,r,{tagName:h,allowedTags:U}),Ve&&r.hasChildNodes()&&!et(r.firstElementChild)&&K(/<[/\w!]/g,r.innerHTML)&&K(/<[/\w!]/g,r.textContent)||Ve&&r.namespaceURI===pe&&h==="style"&&et(r.firstElementChild)||r.nodeType===le.progressingInstruction||Ve&&r.nodeType===le.comment&&K(/<[/\w]/g,r.data))return ie(r),!0;if(Je[h]||!(me.tagCheck instanceof Function&&me.tagCheck(h))&&!U[h]){if(!Je[h]&&Dn(h)&&(F.tagNameCheck instanceof RegExp&&K(F.tagNameCheck,h)||F.tagNameCheck instanceof Function&&F.tagNameCheck(h)))return!1;if(sa&&!ge[h]){const E=I(r),A=w(r);if(A&&E){const G=A.length;for(let L=G-1;L>=0;--L){const q=oa?A[L]:y(A[L],!0);E.insertBefore(q,C(r))}}}return ie(r),!0}return(b?b(r):r.nodeType)===le.element&&!Fs(r)||(h==="noscript"||h==="noembed"||h==="noframes")&&K(/<\/no(script|embed|frames)/i,r.innerHTML)?(ie(r),!0):(ke&&r.nodeType===le.text&&(c=r.textContent,ue([vt,Tt,Et],E=>{c=Ce(c,E," ")}),r.textContent!==c&&(Ae(e.removed,{element:r.cloneNode()}),r.textContent=c)),fe(W.afterSanitizeElements,r,null),!1)},On=function(r,c,h){if(St[c]||bn&&(c==="id"||c==="name")&&(h in t||h in Hs))return!1;const T=H[c]||me.attributeCheck instanceof Function&&me.attributeCheck(c,r);if(!(aa&&!St[c]&&K(Ls,c))){if(!(fn&&K(Ps,c))){if(!T||St[c]){if(!(Dn(r)&&(F.tagNameCheck instanceof RegExp&&K(F.tagNameCheck,r)||F.tagNameCheck instanceof Function&&F.tagNameCheck(r))&&(F.attributeNameCheck instanceof RegExp&&K(F.attributeNameCheck,c)||F.attributeNameCheck instanceof Function&&F.attributeNameCheck(c,r))||c==="is"&&F.allowCustomizedBuiltInElements&&(F.tagNameCheck instanceof RegExp&&K(F.tagNameCheck,h)||F.tagNameCheck instanceof Function&&F.tagNameCheck(h))))return!1}else if(!la[c]){if(!K(hn,Ce(h,un,""))){if(!((c==="src"||c==="xlink:href"||c==="href")&&r!=="script"&&$a(h,"data:")===0&&wn[r])){if(!(mn&&!K(Ns,Ce(h,un,"")))){if(h)return!1}}}}}}return!0},Gs=S({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),Dn=function(r){return!Gs[qe(r)]&&K(Ms,r)},Ln=function(r){fe(W.beforeSanitizeAttributes,r,null);const c=r.attributes;if(!c||Ot(r))return;const h={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:H,forceKeepAttr:void 0};let T=c.length;for(;T--;){const E=c[T],A=E.name,G=E.namespaceURI,L=E.value,q=z(A),be=L;let Y=A==="value"?be:Ri(be);if(h.attrName=q,h.attrValue=Y,h.keepAttr=!0,h.forceKeepAttr=void 0,fe(W.uponSanitizeAttribute,r,h),Y=h.attrValue,xn&&(q==="id"||q==="name")&&$a(Y,yn)!==0&&(Ee(A,r),Y=yn+Y),Ve&&K(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,Y)){Ee(A,r);continue}if(q==="attributename"&&za(Y,"href")){Ee(A,r);continue}if(h.forceKeepAttr)continue;if(!h.keepAttr){Ee(A,r);continue}if(!kn&&K(/\/>/i,Y)){Ee(A,r);continue}ke&&ue([vt,Tt,Et],Nn=>{Y=Ce(Y,Nn," ")});const Pn=z(r.nodeName);if(!On(Pn,q,Y)){Ee(A,r);continue}if(P&&typeof u=="object"&&typeof u.getAttributeType=="function"&&!G)switch(u.getAttributeType(Pn,q)){case"TrustedHTML":{Y=Oe(Y);break}case"TrustedScriptURL":{Y=Cs(Y);break}}if(Y!==be)try{G?r.setAttributeNS(G,A,Y):r.setAttribute(A,Y),Ot(r)?ie(r):Ma(e.removed)}catch{Ee(A,r)}}fe(W.afterSanitizeAttributes,r,null)},Dt=function(r){let c=null;const h=In(r);for(fe(W.beforeSanitizeShadowDOM,r,null);c=h.nextNode();)if(fe(W.uponSanitizeShadowNode,c,null),Rn(c),Ln(c),Me(c.content)&&Dt(c.content),(b?b(c):c.nodeType)===le.element){const E=O?O(c):c.shadowRoot;Me(E)&&(fa(E),Dt(E))}fe(W.afterSanitizeShadowDOM,r,null)},fa=function(r){const c=[{node:r,shadow:null}];for(;c.length>0;){const h=c.pop();if(h.shadow){Dt(h.shadow);continue}const T=h.node,A=(b?b(T):T.nodeType)===le.element,G=w?w(T):T.childNodes;if(G)for(let L=G.length-1;L>=0;--L)c.push({node:G[L],shadow:null});if(A){const L=x?x(T):null;if(typeof L=="string"&&z(L)==="template"){const q=T.content;Me(q)&&c.push({node:q,shadow:null})}}if(A){const L=O?O(T):T.shadowRoot;Me(L)&&c.push({node:null,shadow:L},{node:L,shadow:null})}}};return e.sanitize=function(k){let r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},c=null,h=null,T=null,E=null;if(da=!k,da&&(k="<!-->"),typeof k!="string"&&!et(k)&&(k=Ni(k),typeof k!="string"))throw we("dirty is not a string, aborting");if(!e.isSupported)return k;na||ua(r),e.removed=[];const A=oa&&typeof k!="string"&&et(k);if(A){const q=x?x(k):k.nodeName;if(typeof q=="string"){const be=z(q);if(!U[be]||Je[be])throw we("root node is forbidden and cannot be sanitized in-place")}if(Ot(k))throw we("root node is clobbered and cannot be sanitized in-place");try{fa(k)}catch(be){throw An(k),be}}else if(et(k))c=Cn("<!---->"),h=c.ownerDocument.importNode(k,!0),h.nodeType===le.element&&h.nodeName==="BODY"||h.nodeName==="HTML"?c=h:c.appendChild(h),fa(h);else{if(!De&&!ke&&!Te&&k.indexOf("<")===-1)return P&&Ct?Oe(k):k;if(c=Cn(k),!c)return De?null:Ct?B:""}c&&ia&&ie(c.firstChild);const G=In(A?k:c);try{for(;T=G.nextNode();)Rn(T),Ln(T),Me(T.content)&&Dt(T.content)}catch(q){throw A&&An(k),q}if(A)return ue(e.removed,q=>{q.element&&js(q.element)}),ke&&ha(k),k;if(De){if(ke&&ha(c),At)for(E=Rs.call(c.ownerDocument);c.firstChild;)E.appendChild(c.firstChild);else E=c;return(H.shadowroot||H.shadowrootmode)&&(E=Ds.call(a,E,!0)),E}let L=Te?c.outerHTML:c.innerHTML;return Te&&U["!doctype"]&&c.ownerDocument&&c.ownerDocument.doctype&&c.ownerDocument.doctype.name&&K(Wi,c.ownerDocument.doctype.name)&&(L="<!DOCTYPE "+c.ownerDocument.doctype.name+`>
`+L),ke&&ue([vt,Tt,Et],q=>{L=Ce(L,q," ")}),P&&Ct?Oe(L):L},e.setConfig=function(){let k=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};ua(k),na=!0},e.clearConfig=function(){Ne=null,na=!1,P=te,B=""},e.isValidAttribute=function(k,r,c){Ne||ua({});const h=z(k),T=z(r);return On(h,T,c)},e.addHook=function(k,r){typeof r=="function"&&Ae(W[k],r)},e.removeHook=function(k,r){if(r!==void 0){const c=Ci(W[k],r);return c===-1?void 0:Ii(W[k],c,1)[0]}return Ma(W[k])},e.removeHooks=function(k){W[k]=[]},e.removeAllHooks=function(){W=Wa()},e}var Zi=Ya();let Ka=!1;function Ji(){Ka||(Ka=!0,R.setOptions({gfm:!0,breaks:!0}))}function Vi(s){return String(s).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function Qi(s){let e=Zi.sanitize(s,{ADD_ATTR:["target","rel"]});return e=e.replace(/<a\s+([^>]*?)>/gi,(t,a)=>(/\btarget\s*=/i.test(a)||(a+=' target="_blank"'),/\brel\s*=/i.test(a)||(a+=' rel="noopener noreferrer"'),"<a "+a+">")),e}function lt(s){if(!s)return"";try{Ji();const e=R.parse(s,{async:!1});return Qi(e)}catch(e){return console.warn("[AIAgent SDK] marked parse failed, fallback:",e),es(s)}}function es(s){let e=Vi(s);return e=e.replace(/`([^`\n]+)`/g,"<code>$1</code>"),e=e.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\n/g,"<br/>"),e}function dt(s){if(!s)return;const e=s.querySelectorAll("img");for(let t=0;t<e.length;t++){const a=e[t];if(a.dataset.aiagentDecorated==="1")continue;a.dataset.aiagentDecorated="1",a.setAttribute("loading","lazy"),a.classList.add("aiagent-sdk-img-loading");const n=()=>{a.classList.remove("aiagent-sdk-img-loading"),a.classList.add("aiagent-sdk-img-loaded")};a.complete&&a.naturalWidth>0?n():(a.addEventListener("load",n,{once:!0}),a.addEventListener("error",n,{once:!0}))}}const ct=`
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

/* 面板级隐藏:头部 🧠 按钮切换 panel 上的 .aiagent-sdk-thinking-hidden */
.aiagent-sdk-panel.aiagent-sdk-thinking-hidden .aiagent-sdk-thinking-card {
  display: none;
}

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

/* 换肤瞬间闪光(widget.ts applySkin 时挂 .aiagent-sdk-skin-just-changed 400ms) */
@keyframes aia-skin-flash {
  0%   { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0); }
  40%  { box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.55), 0 0 32px rgba(167, 139, 250, 0.6); }
  100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0); }
}
.aiagent-sdk-panel.aiagent-sdk-skin-just-changed {
  animation: aia-skin-flash 400ms var(--aia-anim-ease);
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

/* ====================================================================
 * 工具面板(ToolPanel)
 * ==================================================================== */

/* 工具面板容器:header 下方的下拉面板 */
.aiagent-sdk-tool-panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--aia-border);
  padding: 0 12px;
}
.aiagent-sdk-tool-panel.aiagent-sdk-tool-panel-open {
  max-height: 300px;
  padding: 8px 12px 10px;
}

/* 面板标题 */
.aiagent-sdk-tp-title {
  font-size: 11px;
  color: var(--aia-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--aia-border);
}

/* 每个工具条目 */
.aiagent-sdk-tp-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}
.aiagent-sdk-tp-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

/* 图标 */
.aiagent-sdk-tp-icon {
  font-size: 14px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

/* 标签 */
.aiagent-sdk-tp-label {
  flex: 1;
  font-size: 13px;
  color: var(--aia-text);
}

/* Toggle 开关 */
.aiagent-sdk-tp-switch {
  width: 32px;
  height: 18px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.12);
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.aiagent-sdk-tp-on .aiagent-sdk-tp-switch {
  background: var(--aia-paint-1);
}
.aiagent-sdk-tp-switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.aiagent-sdk-tp-on .aiagent-sdk-tp-switch-knob {
  transform: translateX(14px);
}

/* Action 箭头 */
.aiagent-sdk-tp-arrow {
  font-size: 12px;
  color: var(--aia-text-faint);
  flex-shrink: 0;
  transition: color 0.15s, transform 0.15s;
}
.aiagent-sdk-tp-item:hover .aiagent-sdk-tp-arrow {
  color: var(--aia-paint-1);
  transform: translateX(2px);
}

/* Action 点击闪光 */
.aiagent-sdk-tp-flash {
  background: rgba(94, 234, 212, 0.15) !important;
}

/* Toggle off 状态标签变淡 */
.aiagent-sdk-tp-off .aiagent-sdk-tp-label {
  color: var(--aia-text-muted);
}
.aiagent-sdk-tp-on .aiagent-sdk-tp-label {
  color: var(--aia-text);
}

/* ================================================================
   页面感知错误角标(附在气泡右上角)
   ================================================================ */
.aiagent-sdk-error-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: var(--aia-error, #f87171);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  z-index: 1;
  box-shadow: 0 2px 6px rgba(248, 113, 113, 0.4);
  font-family: system-ui, sans-serif;
  line-height: 1;
  pointer-events: none;
}
`,ts=`
/* ====================================================================
 * 设计令牌 — 浅灰白底
 * ==================================================================== */
:host {
  --aia-canvas-1: #ffffff;
  --aia-canvas-2: #f5f5f7;
  --aia-canvas-3: #ebebed;
  --aia-bg:        #ffffff;
  --aia-bg-soft:   #f5f5f7;
  --aia-text:      #1a1a1a;
  --aia-text-muted:#5a5a5a;
  --aia-text-faint:#9a9a9a;
  --aia-border:    rgba(0, 0, 0, 0.08);
  --aia-border-strong: rgba(0, 0, 0, 0.16);

  /* 蓝色强调(替代虹彩) */
  --aia-paint-1: #3b82f6;
  --aia-paint-2: #2563eb;
  --aia-paint-3: #1d4ed8;
  --aia-paint-4: #60a5fa;
  --aia-paint-5: #93c5fd;
  --aia-glow:    #3b82f6;

  /* 状态色 */
  --aia-success: #10b981;
  --aia-error:   #ef4444;

  /* 形状 */
  --aia-radius-sm:   6px;
  --aia-radius-md:   12px;
  --aia-radius-lg:   16px;
  --aia-radius-pill: 9999px;

  /* 动效 */
  --aia-anim-ease:        cubic-bezier(.2, .8, .2, 1);
  --aia-anim-dur:         180ms;
  --aia-anim-dur-slow:    300ms;

  /* 字体 — 纯系统栈,无中文优先 */
  --aia-font:  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               system-ui, sans-serif;
  --aia-mono:  ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  --aia-serif: Georgia, "Times New Roman", serif;

  --aia-mx: 50%;
  --aia-my: 50%;

  /* 无噪点(干净背景) */
  --aia-noise: none;
}

/* 无 paper/dark 别名切换 — classic 只用一套变量 */

/* ====================================================================
 * 关键帧
 * ==================================================================== */
@keyframes aia-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes aia-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
@keyframes aia-msg-fade {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}

/* ====================================================================
 * 气泡 — 静态圆(无旋转/无棱镜)
 * ==================================================================== */
.aiagent-sdk-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--aia-paint-1);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2147483600;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: var(--aia-font);
  font-size: 20px;
  color: #fff;
  transition:
    transform var(--aia-anim-dur) var(--aia-anim-ease),
    box-shadow var(--aia-anim-dur) var(--aia-anim-ease);
}
.aiagent-sdk-bubble::before,
.aiagent-sdk-bubble::after { display: none; }
.aiagent-sdk-bubble.aiagent-sdk-bubble-emoji { font-size: 22px; }
.aiagent-sdk-bubble:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}
.aiagent-sdk-bubble.aiagent-sdk-hidden { display: none; }
.aiagent-sdk-bubble.aiagent-sdk-pos-bl { right: auto; left: 24px; }

@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-bubble { transition: none; }
}

/* ====================================================================
 * 面板 — 干净白底,简单阴影
 * ==================================================================== */
.aiagent-sdk-panel {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 400px;
  height: 600px;
  max-height: 80vh;
  background: var(--aia-bg);
  color: var(--aia-text);
  border-radius: var(--aia-radius-lg);
  border: 1px solid var(--aia-border);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 2147483600;
  display: none;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--aia-font);
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 200ms var(--aia-anim-ease),
    transform 200ms var(--aia-anim-ease);
  pointer-events: none;
}
.aiagent-sdk-panel::before { display: none; }  /* 关闭噪点 */
.aiagent-sdk-panel.aiagent-sdk-open {
  display: flex;
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  animation: aia-fade-in 200ms var(--aia-anim-ease);
}
.aiagent-sdk-panel.aiagent-sdk-pos-bl { right: auto; left: 24px; }
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-panel { transition: opacity 100ms linear; transform: none; }
  .aiagent-sdk-panel.aiagent-sdk-open { animation: none; }
}

/* 4 角不渲染(经典皮肤没装饰) */
.aiagent-sdk-corner { display: none; }

/* ====================================================================
 * 头部 — 干净白条
 * ==================================================================== */
.aiagent-sdk-header {
  padding: 12px 16px;
  background: var(--aia-bg);
  color: var(--aia-text);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-bottom: 1px solid var(--aia-border);
  min-height: 48px;
}
.aiagent-sdk-header-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.aiagent-sdk-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--aia-paint-1);
  animation: aia-pulse 1.8s ease-in-out infinite;
  flex-shrink: 0;
}
.aiagent-sdk-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--aia-text);
}
.aiagent-sdk-subtitle {
  font-size: 11px;
  color: var(--aia-text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
  padding: 2px 6px;
}
.aiagent-sdk-header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
.aiagent-sdk-iconbtn {
  background: transparent;
  border: none;
  color: var(--aia-text-muted);
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  padding: 0;
  transition: background 120ms var(--aia-anim-ease), color 120ms var(--aia-anim-ease);
  font-family: var(--aia-font);
}
.aiagent-sdk-iconbtn:hover {
  background: var(--aia-border);
  color: var(--aia-text);
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
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--aia-bg-soft);
  scrollbar-width: thin;
  scrollbar-color: var(--aia-text-faint) transparent;
}
.aiagent-sdk-messages::-webkit-scrollbar { width: 6px; }
.aiagent-sdk-messages::-webkit-scrollbar-thumb {
  background: var(--aia-text-faint);
  border-radius: 3px;
}
.aiagent-sdk-messages::-webkit-scrollbar-track { background: transparent; }

/* 欢迎区 */
.aiagent-sdk-welcome {
  flex-shrink: 0;
  margin: 12px 12px 4px 12px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--aia-text-muted);
  background: var(--aia-bg);
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-md);
  transition: opacity 200ms var(--aia-anim-ease);
}
.aiagent-sdk-welcome[hidden] { display: none; }
.aiagent-sdk-welcome.aiagent-sdk-welcome-leaving {
  opacity: 0;
  pointer-events: none;
}

/* ====================================================================
 * 消息 — 简单气泡
 * ==================================================================== */
.aiagent-sdk-msg {
  position: relative;
  display: inline-block;
  width: fit-content;
  max-width: 85%;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.55;
  word-wrap: break-word;
  font-weight: 400;
  border-radius: var(--aia-radius-md);
  animation: aia-msg-fade 200ms var(--aia-anim-ease) forwards;
  background: var(--aia-bg);
  border: 1px solid var(--aia-border);
}
.aiagent-sdk-msg-user {
  align-self: flex-end;
  background: var(--aia-paint-1);
  color: #fff;
  border-color: var(--aia-paint-1);
}
.aiagent-sdk-msg-assistant {
  align-self: flex-start;
  color: var(--aia-text);
}
.aiagent-sdk-msg-system {
  align-self: center;
  color: var(--aia-text-faint);
  font-size: 12px;
  padding: 4px 10px;
  background: var(--aia-bg-soft);
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-pill);
}
.aiagent-sdk-msg-tool {
  align-self: stretch;
  max-width: 100%;
  padding: 0;
  background: transparent;
  border: none;
}
.aiagent-sdk-msg b { font-weight: 600; }
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-msg,
  .aiagent-sdk-msg-user,
  .aiagent-sdk-msg-assistant,
  .aiagent-sdk-msg-system,
  .aiagent-sdk-msg-tool { animation: none; opacity: 1; }
}

/* 等待中的占位(5 颗粒子) */
.aiagent-sdk-msg-assistant.aiagent-sdk-typing-pending {
  padding: 8px 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 22px;
}
.aiagent-sdk-msg-assistant.aiagent-sdk-typing-pending .aia-p {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--aia-text-faint);
  animation: aia-pulse 1.2s ease-in-out infinite;
  animation-delay: var(--d, 0s);
  opacity: 0.6;
  flex-shrink: 0;
}

/* ====================================================================
 * 工具卡 — 蓝灰版(状态机不变)
 * ==================================================================== */
.aiagent-sdk-tool-card {
  align-self: stretch;
  background: var(--aia-bg);
  border: 1px solid var(--aia-border);
  border-left: 3px solid var(--aia-paint-1);
  border-radius: var(--aia-radius-md);
  font-family: var(--aia-mono);
  font-size: 12px;
  animation: aia-fade-in 200ms var(--aia-anim-ease) forwards;
  transition: max-height 0.3s ease;
  max-height: 200px;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-success {
  border-left-color: var(--aia-success);
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-done,
.aiagent-sdk-tool-card.aiagent-sdk-tool-confirmed,
.aiagent-sdk-tool-card.aiagent-sdk-tool-cancelled {
  max-height: 48px;
}
.aiagent-sdk-tool-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--aia-border);
  flex-shrink: 0;
}
.aiagent-sdk-tool-arrow { display: none; }
.aiagent-sdk-tool-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--aia-paint-1);
  flex-shrink: 0;
}
.aiagent-sdk-tool-done .aiagent-sdk-tool-dot,
.aiagent-sdk-tool-card.aiagent-sdk-tool-success .aiagent-sdk-tool-dot {
  background: var(--aia-success);
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-card--delta .aiagent-sdk-tool-dot {
  background: var(--aia-text-faint);
}
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
.aiagent-sdk-tool-card.aiagent-sdk-tool-card--pending .aiagent-sdk-tool-name,
.aiagent-sdk-tool-card.aiagent-sdk-tool-confirmed .aiagent-sdk-tool-name {
  color: var(--aia-text);
  font-weight: 600;
}
.aiagent-sdk-tool-status {
  flex-shrink: 0;
  font-size: 11.5px;
  color: var(--aia-text-faint);
}
.aiagent-sdk-tool-card .aiagent-sdk-tool-body {
  margin: 0;
  padding: 8px 12px;
  font-family: var(--aia-mono);
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--aia-text);
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  min-height: 20px;
  max-height: 156px;
  transition: max-height 0.3s ease, opacity 0.2s ease, padding 0.3s ease;
  opacity: 1;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-card--delta .aiagent-sdk-tool-body {
  color: var(--aia-text-muted);
  font-style: italic;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-done .aiagent-sdk-tool-body,
.aiagent-sdk-tool-card.aiagent-sdk-tool-confirmed .aiagent-sdk-tool-body,
.aiagent-sdk-tool-card.aiagent-sdk-tool-cancelled .aiagent-sdk-tool-body {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}
.aiagent-sdk-tool-body::-webkit-scrollbar { width: 6px; }
.aiagent-sdk-tool-body::-webkit-scrollbar-thumb {
  background: var(--aia-text-faint);
  border-radius: 3px;
}
.aiagent-sdk-tool-body::-webkit-scrollbar-track { background: transparent; }

/* JSON 配色 — 蓝灰版 */
.aiagent-sdk-tool-body .k { color: var(--aia-paint-3); font-weight: 600; }
.aiagent-sdk-tool-body .s { color: var(--aia-paint-1); font-weight: 500; }
.aiagent-sdk-tool-body .n { color: var(--aia-paint-2); font-weight: 600; }
.aiagent-sdk-tool-body .v { color: var(--aia-text); }
.aiagent-sdk-tool-body .p { color: var(--aia-text-faint); }

/* 工具卡底部状态/进度条 */
.aiagent-sdk-tool-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-top: 1px solid var(--aia-border);
  font-size: 11px;
  color: var(--aia-text-muted);
  font-family: var(--aia-font);
  min-height: 28px;
}
.aiagent-sdk-tool-bar {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: var(--aia-border);
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
  background: var(--aia-paint-1);
  border-radius: 2px;
  transition: width 200ms ease;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-success .aiagent-sdk-tool-bar::before {
  background: var(--aia-success);
  width: 100%;
}

/* 展开/收起按钮 */
.aiagent-sdk-tool-toggle {
  flex-shrink: 0;
  background: var(--aia-bg-soft);
  border: 1px solid var(--aia-border);
  border-radius: 4px;
  color: var(--aia-text-muted);
  font-size: 11px;
  font-family: var(--aia-font);
  padding: 2px 8px;
  min-height: 20px;
  cursor: pointer;
  transition: background 120ms;
  line-height: 1.4;
}
.aiagent-sdk-tool-toggle:hover {
  background: var(--aia-border);
  color: var(--aia-text);
}

/* 确认/取消按钮 */
.aiagent-sdk-tool-confirm-btn,
.aiagent-sdk-tool-cancel-btn {
  flex-shrink: 0;
  border: 1px solid;
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--aia-font);
  padding: 2px 8px;
  min-height: 20px;
  cursor: pointer;
  line-height: 1.4;
  font-weight: 600;
  margin-left: 2px;
}
.aiagent-sdk-tool-confirm-btn {
  background: var(--aia-success);
  color: #fff;
  border-color: var(--aia-success);
}
.aiagent-sdk-tool-confirm-btn:hover { opacity: 0.85; }
.aiagent-sdk-tool-cancel-btn {
  background: transparent;
  color: var(--aia-error);
  border-color: var(--aia-error);
}
.aiagent-sdk-tool-cancel-btn:hover {
  background: rgba(239, 68, 68, 0.08);
}

/* --pending */
.aiagent-sdk-tool-card.aiagent-sdk-tool-card--pending {
  border-left-color: var(--aia-paint-4);
  border-left-width: 3px;
  max-height: 200px;
}
/* confirmed / cancelled */
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

/* 展开态 — 必须放最后 */
.aiagent-sdk-tool-card.aiagent-sdk-tool-expanded {
  max-height: 500px;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-expanded .aiagent-sdk-tool-body {
  max-height: calc(460px - 16px);
  overflow-y: auto;
  padding-top: 8px;
  padding-bottom: 8px;
  opacity: 1;
}

/* ====================================================================
 * 思考卡片 — 蓝灰版
 * ==================================================================== */
.aiagent-sdk-panel.aiagent-sdk-thinking-hidden .aiagent-sdk-thinking-card {
  display: none;
}
.aiagent-sdk-thinking-card {
  align-self: stretch;
  background: var(--aia-bg);
  border: 1px solid var(--aia-border);
  border-left: 3px solid var(--aia-paint-2);
  border-radius: var(--aia-radius-md);
  animation: aia-fade-in 200ms var(--aia-anim-ease) forwards;
  transition: max-height 0.3s ease;
  max-height: 200px;
}
.aiagent-sdk-thinking-card.aiagent-sdk-thinking-done { max-height: 48px; }
.aiagent-sdk-thinking-card.aiagent-sdk-thinking-expanded { max-height: 500px; }

.aiagent-sdk-thinking-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--aia-border);
  flex-shrink: 0;
}
.aiagent-sdk-thinking-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--aia-paint-2);
  flex-shrink: 0;
  animation: aia-pulse 1.8s ease-in-out infinite;
}
.aiagent-sdk-thinking-done .aiagent-sdk-thinking-dot {
  background: var(--aia-success);
  animation: none;
}
.aiagent-sdk-thinking-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--aia-text-muted);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.aiagent-sdk-thinking-toggle {
  flex-shrink: 0;
  background: var(--aia-bg-soft);
  border: 1px solid var(--aia-border);
  border-radius: 4px;
  color: var(--aia-text-muted);
  font-size: 11px;
  font-family: var(--aia-font);
  padding: 2px 8px;
  min-height: 20px;
  cursor: pointer;
  transition: background 120ms;
  line-height: 1.4;
}
.aiagent-sdk-thinking-toggle:hover {
  background: var(--aia-border);
  color: var(--aia-text);
}
.aiagent-sdk-thinking-body {
  margin: 0;
  padding: 8px 12px;
  font-family: var(--aia-mono);
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--aia-text-muted);
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  max-height: 156px;
  transition: max-height 0.3s ease, opacity 0.2s ease, padding 0.3s ease;
  opacity: 1;
}
.aiagent-sdk-thinking-done .aiagent-sdk-thinking-body {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}
.aiagent-sdk-thinking-expanded .aiagent-sdk-thinking-body {
  max-height: calc(460px - 16px);
  overflow-y: auto;
  padding-top: 8px;
  padding-bottom: 8px;
  opacity: 1;
}
.aiagent-sdk-thinking-body::-webkit-scrollbar { width: 6px; }
.aiagent-sdk-thinking-body::-webkit-scrollbar-thumb {
  background: var(--aia-text-faint);
  border-radius: 3px;
}
.aiagent-sdk-thinking-body::-webkit-scrollbar-track { background: transparent; }
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-thinking-card { animation: none; }
  .aiagent-sdk-thinking-dot { animation: none; }
  .aiagent-sdk-thinking-body { transition: none; }
}

/* ====================================================================
 * 输入栏
 * ==================================================================== */
.aiagent-sdk-inputbar {
  padding: 10px 12px 12px;
  border-top: 1px solid var(--aia-border);
  background: var(--aia-bg);
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.aiagent-sdk-inputbar textarea {
  flex: 1;
  resize: none;
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-sm);
  padding: 6px 8px;
  font: inherit;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  max-height: 80px;
  background: var(--aia-bg);
  color: var(--aia-text);
  font-family: var(--aia-font);
  transition: border-color 150ms;
}
.aiagent-sdk-inputbar textarea::placeholder { color: var(--aia-text-faint); }
.aiagent-sdk-inputbar textarea:focus {
  border-color: var(--aia-paint-1);
}
.aiagent-sdk-send {
  background: var(--aia-paint-1);
  color: #fff;
  border: none;
  border-radius: var(--aia-radius-sm);
  padding: 0;
  cursor: pointer;
  font-weight: 500;
  position: relative;
  transition: background 120ms;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-end;
  font-family: var(--aia-font);
  font-size: 18px;
  line-height: 1;
  overflow: visible;
}
.aiagent-sdk-send:hover:not(:disabled) {
  background: var(--aia-paint-2);
}
.aiagent-sdk-send:active:not(:disabled) { transform: scale(0.94); }
.aiagent-sdk-send:disabled {
  background: var(--aia-border);
  color: var(--aia-text-faint);
  cursor: not-allowed;
}
.aiagent-sdk-send svg { display: none; }  /* 字符箭头模式,SVG 不用 */

/* 发送按钮爆炸粒子 */
.aiagent-sdk-send-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--aia-paint-1);
  pointer-events: none;
  animation: aia-burst 600ms var(--aia-anim-ease) forwards;
}
@keyframes aia-burst {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--bx, 0), var(--by, 0)) scale(0.2); opacity: 0; }
}

/* 换肤瞬间闪光(widget.ts applySkin 挂 .aiagent-sdk-skin-just-changed 400ms) */
@keyframes aia-skin-flash {
  0%   { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }
  40%  { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 4px rgba(59, 130, 246, 0.4); }
  100% { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }
}
.aiagent-sdk-panel.aiagent-sdk-skin-just-changed {
  animation: aia-skin-flash 400ms var(--aia-anim-ease);
}

/* ====================================================================
 * 工具结果重试/取消卡片
 * ==================================================================== */
.aiagent-sdk-tool-result-failed {
  align-self: stretch;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-left: 3px solid var(--aia-error);
  border-radius: var(--aia-radius-sm);
  padding: 8px 12px;
  font-size: 12px;
  color: var(--aia-error);
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: aia-fade-in 200ms var(--aia-anim-ease) forwards;
}
.aiagent-sdk-tool-result-failed-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.aiagent-sdk-tool-result-failed-detail {
  font-weight: 400;
  font-size: 12px;
  margin-left: 22px;
  color: var(--aia-text-muted);
}
.aiagent-sdk-tool-result-actions {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-left: 22px;
}
.aiagent-sdk-tool-result-actions button {
  font-family: inherit;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  border: 1px solid;
}
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-retry {
  background: var(--aia-paint-1);
  color: #fff;
  border-color: var(--aia-paint-1);
}
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-cancel {
  background: transparent;
  color: var(--aia-text-muted);
  border-color: var(--aia-border);
}

/* ====================================================================
 * Markdown 渲染
 * ==================================================================== */
.aiagent-sdk-msg p { margin: 0.4em 0; }
.aiagent-sdk-msg p:first-child { margin-top: 0; }
.aiagent-sdk-msg p:last-child { margin-bottom: 0; }
.aiagent-sdk-msg h1, .aiagent-sdk-msg h2, .aiagent-sdk-msg h3, .aiagent-sdk-msg h4 {
  font-weight: 600;
  line-height: 1.3;
  margin: 0.6em 0 0.3em;
}
.aiagent-sdk-msg h1 { font-size: 1.3em; }
.aiagent-sdk-msg h2 { font-size: 1.18em; }
.aiagent-sdk-msg h3 { font-size: 1.08em; }
.aiagent-sdk-msg h4 { font-size: 1em; }
.aiagent-sdk-msg ul, .aiagent-sdk-msg ol { margin: 0.4em 0; padding-left: 1.5em; }
.aiagent-sdk-msg li { margin: 0.15em 0; }
.aiagent-sdk-msg blockquote {
  border-left: 2px solid var(--aia-paint-1);
  padding: 4px 12px;
  margin: 0.5em 0;
  color: var(--aia-text-muted);
  background: var(--aia-bg-soft);
  border-radius: 0 4px 4px 0;
}
.aiagent-sdk-msg hr {
  border: none;
  border-top: 1px solid var(--aia-border);
  margin: 0.8em 0;
}
.aiagent-sdk-msg pre {
  background: var(--aia-bg-soft);
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-sm);
  padding: 8px 12px;
  margin: 0.5em 0;
  overflow-x: auto;
  font-family: var(--aia-mono);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre;
}
.aiagent-sdk-msg code {
  background: var(--aia-bg-soft);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 12px;
  font-family: var(--aia-mono);
  color: var(--aia-paint-3);
}
.aiagent-sdk-msg a {
  color: var(--aia-paint-1);
  text-decoration: underline;
  word-break: break-all;
}
.aiagent-sdk-msg table {
  border-collapse: separate;
  border-spacing: 0;
  margin: 0.6em 0;
  font-size: 13px;
  overflow: hidden;
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-sm);
}
.aiagent-sdk-msg th, .aiagent-sdk-msg td {
  border-bottom: 1px solid var(--aia-border);
  padding: 6px 10px;
  text-align: left;
}
.aiagent-sdk-msg tr:last-child td { border-bottom: none; }
.aiagent-sdk-msg th {
  background: var(--aia-bg-soft);
  font-weight: 600;
}
.aiagent-sdk-msg img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.4em 0;
  display: block;
}

/* ================================================================
   页面感知错误角标(附在气泡右上角)
   ================================================================ */
.aiagent-sdk-error-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: var(--aia-error, #ef4444);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  font-family: system-ui, sans-serif;
  line-height: 1;
  pointer-events: none;
}
`,Xa={cornerGlow:!0,statusDotStyle:"rainbow",sendIcon:"svg",messageEnter:"paint",bubbleAnimation:"rotate",fontStack:"mixed"};function gt(s){return{...Xa,...s}}function Za(s,e){return{...s,...e,layout:gt({...s.layout,...e.layout})}}const _e={name:"iridescent-bloom",css:ct,palette:"ink",aiHint:"深色油彩画布 + 4 角油彩飞溅 + 虹彩动画 + 毛玻璃。视觉强烈,默认皮肤。",layout:{cornerGlow:!0,statusDotStyle:"rainbow",sendIcon:"svg",messageEnter:"paint",bubbleAnimation:"rotate",fontStack:"mixed"}},pt={name:"classic",css:ts,aiHint:"浅灰白底 + 蓝色强调 + 系统字体 + 无装饰动画。商务/简洁风格,亮色环境。",layout:{cornerGlow:!1,statusDotStyle:"pulse",sendIcon:"arrow",messageEnter:"fade",bubbleAnimation:"none",fontStack:"system"}},Kt=Za(_e,{name:"aurora",css:ct+`
`+`
/* 极光主题 — 覆盖 :host 变量(只在挂 data-skin="aurora" 时生效) */
:host([data-skin="aurora"]),
:host([data-skin="aurora"]) [data-skin="aurora"] {
  --aia-canvas-1: #050a14;
  --aia-canvas-2: #0a1426;
  --aia-canvas-3: #0e1a32;
  --aia-bg:        #050a14;
  --aia-text:      #e6f1ff;
  --aia-text-muted:#8ba0bf;
  --aia-text-faint:#5a6a85;
  --aia-border:    rgba(120, 200, 255, 0.10);
  --aia-border-strong: rgba(120, 200, 255, 0.18);
  --aia-paint-1: #4ade80;  /* 极光绿 */
  --aia-paint-2: #22d3ee;  /* 青 */
  --aia-paint-3: #a78bfa;  /* 紫 */
  --aia-paint-4: #60a5fa;  /* 蓝 */
  --aia-paint-5: #2dd4bf;  /* 蓝绿 */
  --aia-glow:    #22d3ee;
  --aia-success: #4ade80;
  --aia-error:   #fb7185;
  --aia-font:    -apple-system, "Source Han Serif SC", "Songti SC", Georgia, serif;
  --aia-serif:   "Source Han Serif SC", "Songti SC", Georgia, serif;
}
`,layout:{fontStack:"serif"},aiHint:"极光绿/青/紫 + 衬线字体 + 4 角油彩 + 深绿底。夜读/文艺风格。"}),ve=class ve{constructor(){f(this,"_skins",new Map);this._skins.set(_e.name,_e),this._skins.set(pt.name,pt),this._skins.set(Kt.name,Kt)}static instance(){return ve._instance||(ve._instance=new ve),ve._instance}register(e){if(!e||!e.name||!e.css)throw new Error("[AIAgent SDK] SkinRegistry.register: invalid skin");this._skins.set(e.name,{...e,layout:gt(e.layout)})}get(e){return this._skins.get(e)||_e}has(e){return this._skins.has(e)}list(){return Array.from(this._skins.keys())}listWithInfo(){return Array.from(this._skins.values()).map(e=>({name:e.name,aiHint:e.aiHint||"no description"}))}remove(e){return e===_e.name||e===pt.name?(console.warn("[AIAgent SDK] cannot remove built-in skin:",e),!1):this._skins.delete(e)}};f(ve,"_instance",null);let V=ve;function as(s){return _e}function ut(s,e,t,a){const n=document.createElement("div");n.className="aiagent-sdk-tool-card",n.setAttribute("role","status"),n.setAttribute("data-tool",e);const i=document.createElement("div");i.className="aiagent-sdk-tool-head";const o=document.createElement("span");o.className="aiagent-sdk-tool-arrow",o.textContent="▸";const d=document.createElement("span");d.className="aiagent-sdk-tool-name",d.textContent=e;const l=document.createElement("span");l.className="aiagent-sdk-tool-dot",i.appendChild(o),i.appendChild(d),i.appendChild(l);const p=document.createElement("pre");p.className="aiagent-sdk-tool-body",p.innerHTML=Ja(JSON.stringify(t,null,2)||"{}");const g=document.createElement("div");g.className="aiagent-sdk-tool-progress";const u=document.createElement("div");u.className="aiagent-sdk-tool-bar",u.style.setProperty("--p","0%");const m=document.createElement("span");return m.className="aiagent-sdk-tool-status",m.textContent="调用中…",g.appendChild(u),g.appendChild(m),n.appendChild(i),n.appendChild(p),n.appendChild(g),a&&a.parentNode===s?s.insertBefore(n,a):s.appendChild(n),s.scrollTop=s.scrollHeight,n}function Xt(s,e,t){if(s&&t){const a=s.querySelector(".aiagent-sdk-tool-status");a&&(a.textContent=t)}}function Ge(s,e="✓ 完成"){if(!s)return;s.classList.add("aiagent-sdk-tool-success"),s.classList.contains("aiagent-sdk-tool-card--pending")&&(s.classList.add("aiagent-sdk-tool-confirmed"),s.classList.remove("aiagent-sdk-tool-card--pending"));const t=s.querySelector(".aiagent-sdk-tool-status");t&&(t.textContent=e)}function ht(s,e="✕ 失败"){if(!s)return;s.classList.add("aiagent-sdk-tool-error"),s.style.borderLeftColor="var(--aia-error)";const t=s.querySelector(".aiagent-sdk-tool-status");t&&(t.textContent=e)}function Ja(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,(t,a,n,i,o)=>a?n?`<span class="k">${a}</span>${n}`:`<span class="s">${a}</span>`:i?`<span class="k">${i}</span>`:o?`<span class="n">${o}</span>`:t)}function Va(s){const e=document.createElement("div");e.className="aiagent-sdk-thinking-card",e.setAttribute("role","status"),e.setAttribute("aria-label","AI 思考中");const t=document.createElement("div");t.className="aiagent-sdk-thinking-head";const a=document.createElement("span");a.className="aiagent-sdk-thinking-dot",a.setAttribute("aria-hidden","true");const n=document.createElement("span");n.className="aiagent-sdk-thinking-label",n.textContent="思考中…";const i=document.createElement("button");i.className="aiagent-sdk-thinking-toggle",i.textContent="展开",i.addEventListener("click",d=>{d.stopPropagation();const l=e.classList.toggle("aiagent-sdk-thinking-expanded");i.textContent=l?"收起":"展开"}),t.appendChild(a),t.appendChild(n),t.appendChild(i);const o=document.createElement("pre");return o.className="aiagent-sdk-thinking-body",e.appendChild(t),e.appendChild(o),s.appendChild(e),s.scrollTop=s.scrollHeight,e}function ns(s,e){if(!s)return;const t=s.querySelector(".aiagent-sdk-thinking-body");t&&(t.innerHTML=lt(e||""),dt(t),t.scrollTop=t.scrollHeight)}function Ie(s){if(!s||s.classList.contains("aiagent-sdk-thinking-done"))return;s.classList.add("aiagent-sdk-thinking-done");const e=s.querySelector(".aiagent-sdk-thinking-label");e&&(e.textContent="✓ 思考完成"),s.classList.remove("aiagent-sdk-thinking-expanded");const t=s.querySelector(".aiagent-sdk-thinking-toggle");t&&(t.textContent="展开")}function Zt(s,e,t,a){const n=document.createElement("div");n.className="aiagent-sdk-tool-card aiagent-sdk-tool-card--delta",n.setAttribute("role","status"),n.setAttribute("data-tool",t||"..."),n.setAttribute("data-tool-id",e||"");const i=document.createElement("div");i.className="aiagent-sdk-tool-head";const o=document.createElement("span");o.className="aiagent-sdk-tool-dot",o.setAttribute("aria-hidden","true");const d=document.createElement("span");d.className="aiagent-sdk-tool-name",d.textContent=t||"加载工具…";const l=document.createElement("span");l.className="aiagent-sdk-tool-status",l.textContent="加载参数…";const p=document.createElement("button");p.className="aiagent-sdk-tool-toggle",p.textContent="展开",p.addEventListener("click",u=>{u.stopPropagation();const m=n.classList.toggle("aiagent-sdk-tool-expanded");p.textContent=m?"收起":"展开"}),i.appendChild(o),i.appendChild(d),i.appendChild(l),i.appendChild(p);const g=document.createElement("pre");return g.className="aiagent-sdk-tool-body",g.textContent="",n.appendChild(i),n.appendChild(g),a&&a.parentNode===s?s.insertBefore(n,a):s.appendChild(n),s.scrollTop=s.scrollHeight,n}function Qa(s,e){if(!s)return;const t=s.querySelector(".aiagent-sdk-tool-body");if(!t)return;t.textContent=(t.textContent||"")+(e||"");const a=s.parentElement;a&&(a.scrollTop=a.scrollHeight)}function ft(s,e,t){if(!s)return;s.classList.remove("aiagent-sdk-tool-card--delta"),s.classList.add("aiagent-sdk-tool-card--pending"),s.setAttribute("data-tool",t||"");const a=s.querySelector(".aiagent-sdk-tool-name");a&&(a.textContent=t||"tool");const n=s.querySelector(".aiagent-sdk-tool-status");n&&(n.textContent="等待执行");const i=s.querySelector(".aiagent-sdk-tool-body");i&&(i.innerHTML=Ja(JSON.stringify(e||{},null,2)))}function is(s){return new Promise(e=>{if(!s){e(!1);return}const t=s.querySelector(".aiagent-sdk-tool-head");if(!t){e(!1);return}const a=t.querySelector(".aiagent-sdk-tool-toggle");a&&a.remove();const n=t.querySelector(".aiagent-sdk-tool-status");n&&(n.textContent="⏸ 等待确认");const i=document.createElement("button");i.className="aiagent-sdk-tool-confirm-btn",i.textContent="✓ 确认";const o=document.createElement("button");o.className="aiagent-sdk-tool-cancel-btn",o.textContent="✕ 取消",t.appendChild(i),t.appendChild(o);let d=!1;const l=p=>{d||(d=!0,i.remove(),o.remove(),e(p))};i.addEventListener("click",p=>{p.stopPropagation(),s.classList.add("aiagent-sdk-tool-confirmed");const g=t.querySelector(".aiagent-sdk-tool-status");g&&(g.textContent="✓ 已确认"),l(!0)}),o.addEventListener("click",p=>{p.stopPropagation(),s.classList.add("aiagent-sdk-tool-cancelled");const g=t.querySelector(".aiagent-sdk-tool-status");g&&(g.textContent="✕ 已取消"),l(!1)})})}function ss(s){return String(s).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function os(s,e,t=0,a){const n=document.createElement("div");return n.style.setProperty("--i",String(t)),s==="user"?(n.className="aiagent-sdk-msg aiagent-sdk-msg-user",n.innerHTML=ss(e||"")):s==="assistant"?(n.className="aiagent-sdk-msg aiagent-sdk-msg-assistant",n.innerHTML=lt(e||""),dt(n)):s==="tool"?(n.className="aiagent-sdk-msg aiagent-sdk-msg-tool",a&&ut(n,a.tool,a.args||{})):(n.className="aiagent-sdk-msg aiagent-sdk-msg-system",n.textContent=e||""),n}function en(s,e,t,a=0,n){const i=os(e,t,a,n);s.appendChild(i),s.scrollTop=s.scrollHeight}const tn=["#5eead4","#a78bfa","#f0abfc","#93c5fd","#fcd34d"];function rs(){const s=document.createElement("div");s.className="aiagent-sdk-msg aiagent-sdk-msg-assistant aiagent-sdk-typing-pending";for(let e=0;e<5;e++){const t=document.createElement("span");t.className="aia-p",t.style.setProperty("--c",tn[e%tn.length]),e>0&&t.style.setProperty("--d",e*.2+"s"),s.appendChild(t)}return s}function mt(s){const e=rs();return s.appendChild(e),s.scrollTop=s.scrollHeight,e}function an(s){s&&(s.classList.remove("aiagent-sdk-typing-pending"),s.innerHTML="")}function ls(s){s&&s.classList.add("aiagent-sdk-typing-active")}function kt(s){s&&s.classList.remove("aiagent-sdk-typing-active")}class ds{constructor(){f(this,"_tools",new Map)}register(e,t){const a=this._tools.get(e)||new Map,n=[];for(const i of t){const o={description:i.description||"",parameters:i.parameters||{type:"object",properties:{}},strict:i.strict!==!1,onCall:typeof i.onCall=="function"?i.onCall:null};a.set(i.name,o),n.push({name:i.name,description:o.description,parameters:o.parameters,strict:o.strict})}return this._tools.set(e,a),n}unregister(e,t){const a=this._tools.get(e);if(a){if(!t||!t.length){a.clear(),this._tools.delete(e);return}for(const n of t)a.delete(n);a.size===0&&this._tools.delete(e)}}get(e,t){const a=this._tools.get(e);return a&&a.get(t)||null}}async function cs(s,e,t,a){const n=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/register",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({tools:a})});if(!n.ok){const i=await n.text();throw new Error("register failed: "+n.status+" "+i)}return await n.json()}async function gs(s,e,t,a){const n=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/append",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({tools:a})});if(!n.ok){const i=await n.text();throw new Error("append failed: "+n.status+" "+i)}return await n.json()}async function nn(s,e,t,a){const n=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/unregister",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({names:a})});if(!n.ok)throw new Error("unregister failed: "+n.status);return await n.json()}async function ps(s,e,t){const a=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools",{method:"GET",headers:{Authorization:"Bearer "+e}});if(!a.ok)throw new Error("list failed: "+a.status);return await a.json()}async function bt(s,e,t){if(t){try{await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/abort",{method:"POST",headers:{Authorization:"Bearer "+e}})}catch(a){console.warn("[AIAgent SDK] abort failed:",a.message)}try{sessionStorage.removeItem("pending:"+t)}catch{}}}function us(s){const e=s.dictTypes||[],t=s.dictTypeLabels||{},a=s.cascades||[],n=e.map(o=>{const d=t[o]||o;return`  - \`${o}\`: ${d}`}).join(`
`);let i="";return a.length>0&&(i=`

级联规则:
`+a.map(o=>{const d=o.parentLabel||t[o.parentType]||o.parentType,l=o.childLabel||t[o.childType]||o.childType;return`  - ${o.childType}(${l}) 需先查 ${o.parentType}(${d}) 获得编码,再通过parentCode传入`}).join(`
`)),{name:"query_dict",description:`查字典,将中文名转系统编码。需编码时先调本工具。
字典类型:
${n}
匹配方式:exact(精确)/contains(近似)/bigram(模糊,需确认)`+i,parameters:{type:"object",properties:{dictType:{type:"string",enum:e,description:"字典类型"},keyword:{type:"string",description:'搜索关键词,如城市名"北京"、产品名"华为"'},parentCode:{type:"string",description:"父级编码(级联字典必填)。查子字典时传父字典编码限定范围,如查设备型号时传设备类型编码。"},limit:{type:"number",description:"返回条数上限,默认5"}},required:["dictType","keyword"]},strict:!1,onCall:async o=>{const d=o.dictType||"",l=o.keyword||"",p=o.parentCode||"",g=o.limit||5;if(!d||!l)return{ok:!1,error:"dictType and keyword are required"};let m=(s.endpoint||"")+"/dict/"+encodeURIComponent(d)+"/query?keyword="+encodeURIComponent(l)+"&limit="+g;p&&(m+="&parentCode="+encodeURIComponent(p));try{const y=await fetch(m,{headers:{Accept:"application/json"}});if(!y.ok)return{ok:!1,error:"HTTP "+y.status,message:"字典查询失败"};const _=await y.json();if(!_||_.length===0)return{ok:!0,items:[],message:"未找到匹配项。请尝试:更换关键词、使用全称或简称、检查字典类型是否正确。"+(p?" 当前 parentCode="+p:"")};const C=_.map(w=>{let I="";w.matchType==="exact"||w.score>=.9?I="[精确]":w.matchType==="contains"||w.matchType==="suffix_stripped"||w.matchType==="alias"?I="[近似]":I="[模糊,请确认]";const O=w.parent?` (父级:${w.parent})`:"";return`${w.code} → ${w.name}${O} ${I}`}).join(`
`);return{ok:!0,items:_.map(w=>({code:w.code,name:w.name,matchType:w.matchType,score:w.score,parent:w.parent})),formatted:C,message:C}}catch(y){return{ok:!1,error:y.message,message:"字典查询异常"}}}}}function hs(s){return{name:"change_skin",description:`切换 AI 助手浮窗的皮肤。\`name\` 字段可传:
  - 具体皮肤名(见下方列表)
  - \`"next"\` 切到下一个(在已注册皮肤列表中循环)
  - \`"prev"\` 切到上一个
  - \`"random"\` 随机切一个

当前已注册皮肤:
${V.instance().list().map(a=>{const n=V.instance().get(a),i=n&&n.aiHint?n.aiHint:"(no description)";return`  - \`${a}\`: ${i}`}).join(`
`)}
传不在列表里的名字会返回 unknown_skin 错误(不会乱切)。`,parameters:{type:"object",properties:{name:{type:"string",description:'皮肤名(见 description 列表),或 "next" / "prev" / "random" 之一。'}},required:["name"]},strict:!1,onCall:a=>{const n=a&&a.name||"next",i=V.instance().list();let o;const d=s._widget?.getSkin?.()?.name||"";if(n==="random")o=i[Math.floor(Math.random()*i.length)]||d;else if(n==="next"||n==="prev"){const l=i.indexOf(d);o=i[((l+(n==="next"?1:-1))%i.length+i.length)%i.length]||d}else if(i.indexOf(n)>=0)o=n;else return{ok:!1,error:"unknown_skin",requested:n,available:i,currentSkin:d};try{return s.setSkin(o),{ok:!0,currentSkin:o,previousSkin:d,available:i,message:"已切换皮肤:"+d+" → "+o}}catch(l){return{ok:!1,error:l.message,currentSkin:d}}}}}function sn(s){return{name:"get_page_errors",description:`查询 SDK 检测到的宿主页面错误(JS 异常、HTTP 错误、UI 错误弹窗)。
当用户可能遇到问题但未明确描述,或你需要更多细节来诊断问题时,调用此工具。
返回结果包含错误时间、来源(global/network/dom_popup)、严重级别和详情。`,parameters:{type:"object",properties:{source:{type:"string",enum:["all","global","network","dom_popup"],description:"按来源过滤。all=全部,global=JS异常,network=HTTP/网络错误,dom_popup=UI弹窗。默认 all。"},limit:{type:"number",description:"最多返回几条(按时间倒序)。默认 10。"}},required:[]},strict:!1,onCall:e=>{const t=e?.source||"all",a=e?.limit||10;let n=s.getPageErrors();return t!=="all"&&(n=n.filter(i=>i.source===t)),n=n.slice(-a),n.length===0?{ok:!0,count:0,errors:[],message:"未检测到页面错误。"}:{ok:!0,count:n.length,errors:n.map(i=>({source:i.source,severity:i.severity,timestamp:i.timestamp,message:i.message,details:i.details})),message:`检测到 ${n.length} 条页面错误。可以根据错误信息向用户解释发生了什么,并建议解决或重试方案。`}}}}async function fs(s,e,t,a){if(!e)return;const n=s.getSessionId();if(!n){console.warn("[AIAgent SDK] no sessionId for tool result");return}const i={toolUseId:e,result:t,ts:Date.now()};s.setPending(i);try{sessionStorage.setItem("pending:"+n,JSON.stringify(i))}catch{}let o;try{o=await s.ensureToken()}catch(d){s.appendMsg("system","⚠️ "+d.message),s.setBusy(!1);return}await Jt(s,e,t,n,o,a)}async function Jt(s,e,t,a,n,i){const o=s.endpoint+"/chat/"+encodeURIComponent(a)+"/tools/result",d=JSON.stringify({toolUseId:e,result:t==null?"[Tool executed by client SDK; no result returned]":typeof t=="string"?t:JSON.stringify(t)}),l={Authorization:"Bearer "+n,"Content-Type":"application/json",Accept:"text/event-stream"},p=4;let g=500,u=0,m=null,y=null;for(;u<p;){y=null;try{m=await fetch(o,{method:"POST",headers:l,body:d})}catch(b){y=b}if(y){if(u===p-1)break;await s.sleep(g),g*=2,u++,i&&Xt(i,Math.min(60+u*10,90),"重试中…");continue}if(m&&m.status>=500&&m.status<600&&u<p-1){await s.sleep(g),g*=2,u++,i&&Xt(i,Math.min(60+u*10,90),"重试中…");continue}if(m&&m.status===429&&u<p-1){const b=parseInt(m.headers.get("Retry-After")||"1",10);await s.sleep(Math.max(b*1e3,g)),g*=2,u++,i&&Xt(i,Math.min(60+u*10,90),"限流中…");continue}break}if(y){i&&ht(i,"✕ 网络失败"),xt(s,a,e,"network: "+y.message);return}if(!m){i&&ht(i,"✕ 无响应"),xt(s,a,e,"network: no response");return}if(m.status===409){i&&ht(i,"✕ 409 冲突");const b=await m.text();s.appendMsg("system","⚠️ "+(b||"session 已被工具调用占用"));try{await bt(s.endpoint,n,a)}catch{}s.setPending(null),s.setBusy(!1);return}if(!m.ok||!m.body){i&&ht(i,"✕ HTTP "+m.status),xt(s,a,e,"http "+m.status);return}i&&Ge(i,"✓ 已提交");const _=s.appendTyping(),C=s.getMsgEl();let w=!1;const I={typing:_},O=(()=>{const b=Re.buildStreamHandlers({typing:_,msgEl:C,onUpgrade:()=>{s.handleThinking},onErrorFallback:x=>s.appendMsg("system",x),onAssistantText:x=>{x&&s.appendMsg("assistant",x)},onDoneCleanup:()=>{w||s.setBusy(!1)}});return{onChunk:b.onChunk,onDone:b.onDone,onError:b.onError,getAssistantBuf:b.getAssistantBuf}})();let v=!0;try{await Q(m.body,b=>O.onChunk(b),()=>O.onDone(),b=>O.onError(b),async b=>{s.handleToolCall&&(s.setBusy(!0),await s.handleToolCall(b)&&(w=!0))},b=>{s.handleToolCallDelta&&s.handleToolCallDelta(b)},b=>{s.handleToolCallStart&&s.handleToolCallStart(b)},b=>{},b=>{s.handleThinking&&s.handleThinking(b)},b=>{const x=I.typing;if(x&&x.parentNode){const te=x.querySelector(".aiagent-sdk-typing-particle"),ne=!x.textContent?.trim();te||ne?x.remove():kt(x)}const P=mt(C),B=Re.buildStreamHandlers({typing:P,msgEl:C,onUpgrade:()=>{},onErrorFallback:te=>s.appendMsg("system",te),onAssistantText:te=>{te&&s.appendMsg("assistant",te)},onDoneCleanup:()=>{w||s.setBusy(!1)}});O.onChunk=B.onChunk,O.onDone=B.onDone,O.onError=B.onError,I.typing=P},b=>{b&&O.onChunk({event:"text",data:b})})}catch{v=!1}if(v){try{sessionStorage.removeItem("pending:"+a)}catch{}s.setPending(null)}else xt(s,a,e,"sse")}async function ms(s){const e=s.getPending();if(!e)return;const t=s.getSessionId();if(!t)return;s.setBusy(!0);let a;try{a=await s.ensureToken()}catch(n){s.appendMsg("system","⚠️ "+n.message),s.setBusy(!1);return}await Jt(s,e.toolUseId,e.result,t,a)}async function ks(s){const e=s.getSessionId();if(!e){s.setBusy(!1);return}let t="";try{t=await s.ensureToken()}catch{}await bt(s.endpoint,t,e),s.appendMsg("system","已放弃本次工具调用,可继续对话。"),s.setBusy(!1)}function xt(s,e,t,a){console.warn("[AIAgent SDK] tool result failed:",a),bs(s,a),s.setBusy(!1)}function bs(s,e){const t=s.getMsgEl();if(t.querySelector(".aiagent-sdk-tool-result-failed"))return;const a=document.createElement("div");a.className="aiagent-sdk-tool-result-failed";const n=document.createElement("div");n.className="aiagent-sdk-tool-result-failed-header",n.textContent="提交工具结果失败";const i=document.createElement("div");i.className="aiagent-sdk-tool-result-failed-detail",i.textContent="原因:"+(e||"未知")+"。可重试,或取消本次调用以继续对话。";const o=document.createElement("div");o.className="aiagent-sdk-tool-result-actions";const d=document.createElement("button");d.type="button",d.className="aiagent-sdk-btn-retry",d.textContent="↻ 重试",d.addEventListener("click",()=>{a.parentNode&&a.parentNode.removeChild(a),ms(s)});const l=document.createElement("button");l.type="button",l.className="aiagent-sdk-btn-cancel",l.textContent="✕ 取消",l.addEventListener("click",()=>{a.parentNode&&a.parentNode.removeChild(a),ks(s)}),o.appendChild(d),o.appendChild(l),a.appendChild(n),a.appendChild(i),a.appendChild(o),t.appendChild(a),t.scrollTop=t.scrollHeight}async function xs(s){if(typeof sessionStorage>"u")return;let e=null,t=null;try{for(let i=0;i<sessionStorage.length;i++){const o=sessionStorage.key(i);if(o&&o.indexOf("pending:")===0){e=o,t=JSON.parse(sessionStorage.getItem(o)||"null");break}}}catch{return}if(!e||!t||!t.toolUseId){e&&sessionStorage.removeItem(e);return}const a=e.substring(8);s.appendMsg("system","检测到上次未完成的工具调用,正在重试提交…"),s.setPending(t);let n;try{n=await s.ensureToken()}catch(i){s.appendMsg("system","⚠️ "+i.message);return}await Jt(s,t.toolUseId,t.result,a,n)}const on=[".el-message--error",".el-notification--error",".ant-message-error",".ant-notification-error",".ant-alert-error",".ivu-message-error",".van-toast--fail",'[role="alert"]',".toast-error",".alert-danger",".notification.is-danger"].join(", "),ys=[/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,/(?:password|passwd|pwd|secret|api[_-]?key)\s*[=:]\s*\S+/gi,/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,/\b(?:\d{4}[-\s]?){3}\d{4}\b/g,/(?:token|auth)\s*[=:]\s*["']?[A-Za-z0-9\-._~+/=]+/gi];let yt=0,We=null,Ye=null,Ke=null,Xe=null;const de=new Set;function ws(s,e,t,a,n){for(const i of de)try{i._handleGlobalError(s,e,t,a,n)}catch{}return typeof We=="function"?We(s,e,t,a,n):!1}function rn(s){for(const e of de)try{e._handleUnhandledRejection(s.reason)}catch{}}async function _s(...s){const e=typeof s[0]=="string"?s[0]:s[0]?.url||"",t=s[1]?.method||"GET",a=Date.now();try{const n=await Ye.apply(window,s);if(n.status>=400)for(const i of de)try{i._isOwnRequest(e)||i._ingestNetworkError(e,t,n.status,n.statusText,a)}catch{}return n}catch(n){for(const i of de)try{i._isOwnRequest(e)||i._ingestNetworkFailure(e,t,n.message,a)}catch{}throw n}}const wt=class wt{constructor(e,t,a){f(this,"_endpoint");f(this,"_opts");f(this,"_host");f(this,"_running",!1);f(this,"_buffer",[]);f(this,"_recentIds",new Map);f(this,"_maxBufferSize");f(this,"_dedupeWindowMs");f(this,"_maxErrorsPerMessage");f(this,"_autoInject");f(this,"_maxMessageLength");f(this,"_redactPatterns");f(this,"_domObserver",null);f(this,"_lastProactiveMsgTs",0);this._endpoint=e,this._opts=t,this._host=a;const n=t.behavior||{};this._maxBufferSize=n.maxBufferSize||50,this._dedupeWindowMs=n.dedupeWindowMs||5e3,this._maxErrorsPerMessage=n.maxErrorsPerMessage||5,this._autoInject=n.autoInject!==!1,this._maxMessageLength=t.filter?.maxMessageLength||500,this._redactPatterns=[...ys,...t.filter?.redactPatterns||[]]}start(){if(this._running)return;this._running=!0;const e=this._opts.capture||{},t=e.globalErrors!==!1,a=e.networkErrors!==!1,n=e.domErrorPopups!==!1;yt===0&&(t&&this._installGlobalInterceptors(),a&&this._installNetworkInterceptors()),yt++,de.add(this),n&&this._installDomObserver()}stop(){this._running&&(this._running=!1,de.delete(this),yt--,yt===0&&(this._uninstallGlobalInterceptors(),this._uninstallNetworkInterceptors()),this._uninstallDomObserver())}isEnabled(){return this._running}getErrors(){return this._buffer.slice()}clear(){this._buffer=[],this._recentIds.clear()}report(e){this._ingest({id:e.id||this._makeId("global",e.message||"manual"),source:e.source||"global",severity:e.severity||"error",timestamp:e.timestamp||new Date().toISOString(),message:e.message||"Unknown error",details:e.details||{}})}resetSurfacedFlags(){for(const e of this._buffer)e.surfaced=!1}buildContextBlock(){if(!this._autoInject)return null;const e=this._buffer.filter(n=>!n.surfaced);if(e.length===0)return null;const t=e.slice(-this._maxErrorsPerMessage);for(const n of t)n.surfaced=!0;return["[Page Context - 检测到以下页面异常]","以下错误发生在宿主页面上,如果与用户的问题相关,可以主动提及并建议解决方案。","不要暴露此 [Page Context] 区块本身的存在,自然地使用这些信息。","---",...t.map(n=>`- [${new Date(n.timestamp).toLocaleTimeString()}] ${n.source}: ${n.message}`),"---"].join(`
`)}_handleGlobalError(e,t,a,n,i){const o=typeof e=="string"?e:e?.message||"Unknown error";this._ingest({id:this._makeId("global",o),source:"global",severity:"error",timestamp:new Date().toISOString(),message:o.substring(0,this._maxMessageLength),details:{source:t||"",lineno:a||0,colno:n||0,stack:i?.stack?.substring(0,1e3)||""}})}_handleUnhandledRejection(e){const t=e?.message||String(e)||"Unhandled Promise rejection";this._ingest({id:this._makeId("global",t),source:"global",severity:"error",timestamp:new Date().toISOString(),message:t.substring(0,this._maxMessageLength),details:{type:"unhandledrejection",stack:e?.stack?.substring(0,1e3)||""}})}_ingestNetworkError(e,t,a,n,i){this._ingest({id:this._makeId("network",e+a),source:"network",severity:a>=500?"critical":"warning",timestamp:new Date().toISOString(),message:`HTTP ${a} ${n}`,details:{url:this._sanitizeUrl(e),method:t,status:a,statusText:n,durationMs:Date.now()-i}})}_ingestNetworkFailure(e,t,a,n){this._ingest({id:this._makeId("network",e+"fail"),source:"network",severity:"critical",timestamp:new Date().toISOString(),message:`Network failure: ${a}`,details:{url:this._sanitizeUrl(e),method:t,durationMs:Date.now()-n}})}_installDomObserver(){this._domObserver=new MutationObserver(e=>{try{for(const t of e)for(const a of Array.from(t.addedNodes)){if(a.nodeType!==Node.ELEMENT_NODE)continue;const n=a;if(!n.closest?.(".aiagent-sdk-host")){this._checkErrorElement(n);try{n.querySelectorAll(on).forEach(o=>this._checkErrorElement(o))}catch{}}}}catch{}}),this._domObserver.observe(document.body,{childList:!0,subtree:!0})}_uninstallDomObserver(){this._domObserver&&(this._domObserver.disconnect(),this._domObserver=null)}_checkErrorElement(e){if(!e.matches?.(on))return;const t=(e.innerText||e.textContent||"").trim();!t||t.length>this._maxMessageLength||this._ingest({id:this._makeId("dom_popup",t),source:"dom_popup",severity:"warning",timestamp:new Date().toISOString(),message:t,details:{tagName:e.tagName.toLowerCase(),className:(e.className?.toString?.()||"").substring(0,200)}})}_installGlobalInterceptors(){We=window.onerror,window.onerror=ws,window.addEventListener("unhandledrejection",rn)}_uninstallGlobalInterceptors(){window.onerror=We,We=null,window.removeEventListener("unhandledrejection",rn)}_installNetworkInterceptors(){Ye=window.fetch,window.fetch=_s,Ke=XMLHttpRequest.prototype.open,Xe=XMLHttpRequest.prototype.send,XMLHttpRequest.prototype.open=function(e,t,...a){return this.__aia_method=e,this.__aia_url=String(t),this.__aia_start=Date.now(),Ke.apply(this,[e,t,...a])},XMLHttpRequest.prototype.send=function(...e){const t=this.__aia_url||"",a=this.__aia_method||"GET",n=this.__aia_start||Date.now();let i=!1;for(const o of de)if(!o._isOwnRequest(t)){i=!0;break}return i&&(this.addEventListener("load",function(){if(this.status>=400)for(const o of de)try{o._isOwnRequest(t)||o._ingestNetworkError(t,a,this.status,this.statusText,n)}catch{}}),this.addEventListener("error",function(){for(const o of de)try{o._isOwnRequest(t)||o._ingestNetworkFailure(t,a,"XHR error",n)}catch{}}),this.addEventListener("timeout",function(){for(const o of de)try{o._isOwnRequest(t)||o._ingestNetworkFailure(t,a,"XHR timeout",n)}catch{}})),Xe.apply(this,e)}}_uninstallNetworkInterceptors(){Ye&&(window.fetch=Ye,Ye=null),Ke&&(XMLHttpRequest.prototype.open=Ke,Ke=null),Xe&&(XMLHttpRequest.prototype.send=Xe,Xe=null)}_ingest(e){try{if(this._opts.onError)try{this._opts.onError(e)}catch{}if(this._shouldIgnore(e))return;this._redact(e);const t=this._recentIds.get(e.id);if(t&&Date.now()-t<this._dedupeWindowMs)return;if(this._recentIds.set(e.id,Date.now()),this._buffer.length>=this._maxBufferSize&&this._buffer.shift(),this._buffer.push(e),this._recentIds.size>this._maxBufferSize*2){const a=Date.now()-this._dedupeWindowMs;for(const[n,i]of this._recentIds)i<a&&this._recentIds.delete(n)}e.severity==="critical"&&this._notifyCritical(e)}catch(t){console.warn("[AIAgent SDK] pageAwareness._ingest failed:",t)}}_notifyCritical(e){try{this._host.onErrorBadge?.(this._buffer.length)}catch{}if(this._host.isWidgetOpen()){const t=Date.now();if(t-this._lastProactiveMsgTs>=wt.PROACTIVE_THROTTLE_MS){this._lastProactiveMsgTs=t;try{this._host.appendSystemMsg(`检测到页面异常: ${e.message.substring(0,100)}`)}catch{}}}}_shouldIgnore(e){const t=this._opts.filter;if(!t)return!1;if(t.ignoreUrls){const a=e.details.url;if(a){for(const n of t.ignoreUrls)if(n.test(a))return!0}}if(t.ignoreMessages){for(const a of t.ignoreMessages)if(a.test(e.message))return!0}return!1}_redact(e){if(e.message=this._applyRedaction(e.message),e.details)for(const t of Object.keys(e.details)){const a=e.details[t];typeof a=="string"&&(e.details[t]=this._applyRedaction(a))}}_applyRedaction(e){let t=e;for(const a of this._redactPatterns)t=t.replace(a,"[REDACTED]");return t}_isOwnRequest(e){if(!e)return!1;const t=this._endpoint;return e.startsWith(t+"/chat/")||e.startsWith(t+"/dict/")||e.startsWith(t+"/auth/")||e.includes("/ai-token")}_sanitizeUrl(e){try{const t=new URL(e,window.location.origin),a=Array.from(t.searchParams.keys()).map(n=>`${n}=[...]`).join("&");return t.origin+t.pathname+(a?"?"+a:"")}catch{return e.substring(0,200)}}_makeId(e,t){return e+":"+t.substring(0,100)}};f(wt,"PROACTIVE_THROTTLE_MS",3e4);let Vt=wt;const ln=`
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M5 12 L19 12 M13 6 L19 12 L13 18"/>
</svg>
`.trim();class vs{constructor(e,t){f(this,"host",null);f(this,"shadow",null);f(this,"bubble",null);f(this,"panel",null);f(this,"msgEl",null);f(this,"taEl",null);f(this,"sendBtn",null);f(this,"welcomeEl",null);f(this,"isOpen",!1);f(this,"mounted",!1);f(this,"avatarRaw","🤖");f(this,"onMouseMove",null);f(this,"skin");f(this,"_pendingInput","");f(this,"_toolPanelItems",[]);f(this,"_toolPanelStates",new Map);f(this,"_toolPanelEl",null);f(this,"_toolPanelOpen",!1);f(this,"_errorBadge",null);this.opts=e,this.handlers=t;const a=e.skin||"iridescent-bloom";this.skin=V.instance().get(a)||as(e.theme||"ink")}get layout(){return gt(this.skin.layout)}getRefs(){return!this.host||!this.bubble||!this.panel||!this.msgEl||!this.taEl||!this.sendBtn?null:{host:this.host,bubble:this.bubble,panel:this.panel,msgEl:this.msgEl,taEl:this.taEl,sendBtn:this.sendBtn}}mount(){if(this.mounted||typeof document>"u")return;const e=document.createElement("div");e.className="aiagent-sdk-host",e.setAttribute("data-position",this.opts.position||"bottom-right"),e.setAttribute("data-theme",this.opts.theme||"ink"),e.setAttribute("data-skin",this.skin.name),e.setAttribute("data-status-dot",this.layout.statusDotStyle),e.setAttribute("data-send-icon",this.layout.sendIcon),e.setAttribute("data-message-enter",this.layout.messageEnter),e.setAttribute("data-bubble-anim",this.layout.bubbleAnimation),document.body.appendChild(e),this.host=e;const t=e.attachShadow({mode:"open"});this.shadow=t;const a=document.createElement("style");a.textContent=this.skin.css||ct,t.appendChild(a);const n=this.opts.position==="bottom-left"?" aiagent-sdk-pos-bl":"";this.avatarRaw=this.opts.avatar||"🤖";const i=this.avatarRaw.length<=2,o=document.createElement("button");i?(o.className="aiagent-sdk-bubble aiagent-sdk-bubble-emoji"+n,o.textContent=this.avatarRaw):o.className="aiagent-sdk-bubble"+n,o.setAttribute("aria-label",this.opts.title||"AI 助手 - 点击打开对话"),o.title=this.opts.title||"AI 助手",o.addEventListener("click",()=>this.toggle()),t.appendChild(o),this.bubble=o;const d=document.createElement("span");d.className="aiagent-sdk-error-badge",o.appendChild(d),this._errorBadge=d;const l=document.createElement("div");l.className="aiagent-sdk-panel"+n;const p=this.layout.cornerGlow?['<div class="aiagent-sdk-corner aiagent-sdk-corner-tl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-tr" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-bl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-br" aria-hidden="true"></div>'].join(""):"",u=V.instance().list().length>=2?`<button class="aiagent-sdk-iconbtn aiagent-sdk-cycle-skin" title="切换皮肤 (当前:${this.skin.name})" aria-label="切换皮肤">🎨</button>`:"",m=(()=>{switch(this.layout.sendIcon){case"svg":return ln;case"arrow":return"→";case"circle":return"";default:return ln}})();l.innerHTML=[p,'<div class="aiagent-sdk-header">','  <div class="aiagent-sdk-header-info">','    <span class="aiagent-sdk-status-dot" aria-hidden="true"></span>','    <span class="aiagent-sdk-title"></span>',"  </div>",'  <div class="aiagent-sdk-header-actions">','    <span class="aiagent-sdk-subtitle"></span>',u,'    <button class="aiagent-sdk-iconbtn aiagent-sdk-toggle-thinking" title="显示/隐藏 思考过程" aria-label="思考">🧠</button>','    <button class="aiagent-sdk-iconbtn aiagent-sdk-new" title="新会话" aria-label="新会话">＋</button>','    <button class="aiagent-sdk-iconbtn aiagent-sdk-close" title="关闭" aria-label="关闭">✕</button>',"  </div>","</div>",'<div class="aiagent-sdk-welcome" hidden></div>','<div class="aiagent-sdk-messages" role="log" aria-live="polite"></div>','<div class="aiagent-sdk-inputbar">','  <textarea rows="1" placeholder="" aria-label="输入消息"></textarea>',`  <button class="aiagent-sdk-send" aria-label="发送">${m}</button>`,"</div>"].join(""),t.appendChild(l),this.panel=l;const y=l.querySelector(".aiagent-sdk-title"),_=l.querySelector(".aiagent-sdk-subtitle");y.textContent=this.opts.title||"AI 助手",_.textContent=this.opts.subtitle||"";const C=l.querySelector("textarea");C.placeholder=this.opts.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",this.msgEl=l.querySelector(".aiagent-sdk-messages"),this.taEl=C,this.sendBtn=l.querySelector(".aiagent-sdk-send"),this.welcomeEl=l.querySelector(".aiagent-sdk-welcome");const w=l.querySelector(".aiagent-sdk-close"),I=l.querySelector(".aiagent-sdk-new"),O=l.querySelector(".aiagent-sdk-toggle-thinking"),v=l.querySelector(".aiagent-sdk-cycle-skin");w.addEventListener("click",()=>this.handlers.onClose()),I.addEventListener("click",()=>this.handlers.onNew()),O&&O.addEventListener("click",()=>{this.panel.classList.toggle("aiagent-sdk-thinking-hidden");const b=this.panel.classList.contains("aiagent-sdk-thinking-hidden");O.style.opacity=b?"0.4":"1"}),v&&v.addEventListener("click",()=>{const b=V.instance().list();if(b.length<2)return;const x=this.skin.name,P=b.indexOf(x),B=b[(P+1)%b.length];if(typeof this.handlers.onCycleSkin=="function"){this.handlers.onCycleSkin(B);return}this.applySkin(B),this.panel&&(this.panel.classList.add("aiagent-sdk-skin-just-changed"),setTimeout(()=>{this.panel&&this.panel.classList.remove("aiagent-sdk-skin-just-changed")},400)),console.log("[AIAgent SDK 🎨 换肤]",x,"→",B)}),this.sendBtn.addEventListener("click",()=>{this._burstSend(),this.handlers.onSend()}),C.addEventListener("keydown",b=>{b.key==="Enter"&&!b.shiftKey&&(b.preventDefault(),this._burstSend(),this.handlers.onSend())}),C.addEventListener("input",()=>{C.style.height="auto",C.style.height=Math.min(C.scrollHeight,80)+"px"}),this.onMouseMove=b=>{if(!this.panel)return;const x=this.panel.getBoundingClientRect(),P=(b.clientX-x.left)/x.width*100,B=(b.clientY-x.top)/x.height*100;this.panel.style.setProperty("--aia-mx",P+"%"),this.panel.style.setProperty("--aia-my",B+"%")},this.panel.addEventListener("mousemove",this.onMouseMove),this.panel.addEventListener("mouseleave",()=>{this.panel&&(this.panel.style.setProperty("--aia-mx","50%"),this.panel.style.setProperty("--aia-my","50%"))}),this.setTheme(this.opts.theme||"ink"),this._pendingInput&&this.taEl&&(this.taEl.value=this._pendingInput,this._pendingInput=""),this.mounted=!0}destroy(){this.mounted&&(this.taEl&&(this._pendingInput=this.taEl.value),this.panel&&this.onMouseMove&&this.panel.removeEventListener("mousemove",this.onMouseMove),this.host&&this.host.parentNode&&this.host.parentNode.removeChild(this.host),this.host=null,this.shadow=null,this.bubble=null,this.panel=null,this.msgEl=null,this.taEl=null,this.sendBtn=null,this.welcomeEl=null,this.mounted=!1,this.onMouseMove=null)}applySkin(e){const t=typeof e=="string"?V.instance().get(e):e;if(!t){console.warn("[AIAgent SDK] applySkin: skin not found");return}if(!this.mounted||!this.host||!this.shadow||!this.panel){this.skin=t;return}this.skin=t;const a=this.shadow.querySelector("style");a&&(a.textContent=this.skin.css||ct),this.host.setAttribute("data-skin",this.skin.name),this.host.setAttribute("data-status-dot",this.layout.statusDotStyle),this.host.setAttribute("data-send-icon",this.layout.sendIcon),this.host.setAttribute("data-message-enter",this.layout.messageEnter),this.host.setAttribute("data-bubble-anim",this.layout.bubbleAnimation);const n=this.panel.querySelectorAll(".aiagent-sdk-corner");if(!this.layout.cornerGlow)n.forEach(i=>i.remove());else if(n.length===0){const i=['<div class="aiagent-sdk-corner aiagent-sdk-corner-tl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-tr" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-bl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-br" aria-hidden="true"></div>'].join(""),o=document.createElement("div");for(o.innerHTML=i;o.firstChild;)this.panel.insertBefore(o.firstChild,this.panel.firstChild)}this.panel.classList.add("aiagent-sdk-skin-just-changed"),setTimeout(()=>{this.panel&&this.panel.classList.remove("aiagent-sdk-skin-just-changed")},400),this.panel.style.setProperty("--aia-mx","50%"),this.panel.style.setProperty("--aia-my","50%")}getSkin(){return this.skin}open(){this.panel&&(this.panel.classList.add("aiagent-sdk-open"),this.isOpen=!0,this.setErrorBadge(0),setTimeout(()=>{this.taEl&&this.taEl.focus()},50),this.handlers.onPanelOpen())}close(){this.panel&&(this.panel.classList.remove("aiagent-sdk-open"),this.isOpen=!1)}toggle(){this.isOpen?this.close():this.open()}getIsOpen(){return this.isOpen}setTheme(e){this.host&&this.host.setAttribute("data-theme",e)}clearMessages(){this.msgEl&&(this.msgEl.innerHTML="")}setErrorBadge(e){this._errorBadge&&(e<=0||this.isOpen?(this._errorBadge.style.display="none",this._errorBadge.textContent=""):(this._errorBadge.textContent=e>99?"99+":String(e),this._errorBadge.style.display="flex"))}setWelcome(e){if(this.welcomeEl){if(!e){this.welcomeEl.hidden=!0;return}this.welcomeEl.hidden=!1,this.welcomeEl.textContent=e}}hideWelcome(){this.welcomeEl&&(this.welcomeEl.hidden||(this.welcomeEl.classList.add("aiagent-sdk-welcome-leaving"),setTimeout(()=>{this.welcomeEl&&(this.welcomeEl.hidden=!0,this.welcomeEl.classList.remove("aiagent-sdk-welcome-leaving"))},280)))}_burstSend(){if(!this.sendBtn)return;const e=5,t=["#5eead4","#a78bfa","#f0abfc","#93c5fd","#fcd34d"];for(let a=0;a<e;a++){const n=Math.PI*2*a/e+Math.random()*.5,i=22+Math.random()*14,o=Math.cos(n)*i,d=Math.sin(n)*i,l=document.createElement("span");l.className="aiagent-sdk-send-burst",l.style.setProperty("--bx",o+"px"),l.style.setProperty("--by",d+"px");const p=t[a];l.style.setProperty("--c",p),l.style.background=p,this.sendBtn.appendChild(l),setTimeout(()=>l.remove(),750)}}registerToolPanelItems(e){for(const t of e)this._toolPanelItems=this._toolPanelItems.filter(a=>a.name!==t.name),this._toolPanelItems.push(t),t.type==="toggle"&&this._toolPanelStates.set(t.name,!!t.defaultOn);this._renderToolPanel()}getToolPanelState(e){return this._toolPanelStates.get(e)||!1}setToolPanelState(e,t){this._toolPanelStates.set(e,t),this._updateToolPanelUI()}_renderToolPanel(){if(!this.panel||!this.shadow)return;if(this._toolPanelItems.length===0){const t=this.panel.querySelector(".aiagent-sdk-tool-panel-btn");t&&t.remove(),this._toolPanelEl&&(this._toolPanelEl.remove(),this._toolPanelEl=null);return}let e=this.panel.querySelector(".aiagent-sdk-tool-panel-btn");if(!e){const t=this.panel.querySelector(".aiagent-sdk-header-actions");if(!t)return;e=document.createElement("button"),e.className="aiagent-sdk-iconbtn aiagent-sdk-tool-panel-btn",e.title="工具面板",e.setAttribute("aria-label","工具面板"),e.textContent="🔧";const a=t.querySelector(".aiagent-sdk-cycle-skin");a?t.insertBefore(e,a):t.insertBefore(e,t.children[1]),e.addEventListener("click",()=>this._toggleToolPanel())}this._renderToolPanelDropdown()}_toggleToolPanel(){this._toolPanelOpen=!this._toolPanelOpen,this._toolPanelEl&&this._toolPanelEl.classList.toggle("aiagent-sdk-tool-panel-open",this._toolPanelOpen),this._toolPanelOpen&&setTimeout(()=>{const e=t=>{this._toolPanelEl&&!this._toolPanelEl.contains(t.target)&&(this._toolPanelOpen=!1,this._toolPanelEl.classList.remove("aiagent-sdk-tool-panel-open"),document.removeEventListener("click",e))};document.addEventListener("click",e)},0)}_renderToolPanelDropdown(){if(!this.panel)return;if(!this._toolPanelEl){this._toolPanelEl=document.createElement("div"),this._toolPanelEl.className="aiagent-sdk-tool-panel";const t=this.panel.querySelector(".aiagent-sdk-header");t&&t.nextSibling?this.panel.insertBefore(this._toolPanelEl,t.nextSibling):this.panel.appendChild(this._toolPanelEl)}const e=this._toolPanelItems.map(t=>{const a=t.icon||(t.type==="toggle"?"🔌":"⚡"),n=t.type==="toggle"&&this._toolPanelStates.get(t.name)||!1,i=t.type==="toggle"?`aiagent-sdk-tp-toggle ${n?"aiagent-sdk-tp-on":"aiagent-sdk-tp-off"}`:"aiagent-sdk-tp-action",o=t.type==="toggle"?'<span class="aiagent-sdk-tp-switch"><span class="aiagent-sdk-tp-switch-knob"></span></span>':'<span class="aiagent-sdk-tp-arrow">→</span>';return`<div class="aiagent-sdk-tp-item ${i}" data-name="${t.name}" data-type="${t.type}" title="${t.description||""}">
        <span class="aiagent-sdk-tp-icon">${a}</span>
        <span class="aiagent-sdk-tp-label">${t.label}</span>
        ${o}
      </div>`}).join("");this._toolPanelEl.innerHTML=`<div class="aiagent-sdk-tp-title">工具面板</div>${e}`,this._toolPanelEl.querySelectorAll(".aiagent-sdk-tp-item").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.name;t.dataset.type==="toggle"?this._handleToggle(a):this._handleAction(a)})}),this._toolPanelEl.classList.toggle("aiagent-sdk-tool-panel-open",this._toolPanelOpen)}_updateToolPanelUI(){this._toolPanelEl&&this._toolPanelEl.querySelectorAll('.aiagent-sdk-tp-item[data-type="toggle"]').forEach(e=>{const t=e.dataset.name,a=this._toolPanelStates.get(t)||!1;e.classList.toggle("aiagent-sdk-tp-on",a),e.classList.toggle("aiagent-sdk-tp-off",!a)})}_handleToggle(e){const t=this._toolPanelItems.find(o=>o.name===e);if(!t||t.type!=="toggle")return;const n=!(this._toolPanelStates.get(e)||!1);this._toolPanelStates.set(e,n),this._updateToolPanelUI();const i=!t.onToggle;typeof this.handlers.onToolPanelToggle=="function"&&this.handlers.onToolPanelToggle(e,n,i)}_handleAction(e){const t=this._toolPanelItems.find(n=>n.name===e);if(!t||t.type!=="action")return;const a=this._toolPanelEl?.querySelector(`.aiagent-sdk-tp-item[data-name="${e}"]`);a&&(a.classList.add("aiagent-sdk-tp-flash"),setTimeout(()=>a.classList.remove("aiagent-sdk-tp-flash"),300)),typeof this.handlers.onToolPanelAction=="function"&&this.handlers.onToolPanelAction(e)}}function Ts(s,e){s.setTheme(e)}const ce=class ce{constructor(){f(this,"endpoint");f(this,"getAccessToken");f(this,"_opts");f(this,"_tokenCache",new N);f(this,"_tools",new ds);f(this,"_widget",null);f(this,"_isOpen",!1);f(this,"_busy",!1);f(this,"_messages",[]);f(this,"_chatSessionId",null);f(this,"_activeTools",[]);f(this,"_persistentTools",[]);f(this,"_ephemeralTools",[]);f(this,"_pendingToolCall",null);f(this,"_lastToolCard",null);f(this,"_thinkingCard",null);f(this,"_thinkingBuf","");f(this,"_pageAwareness",null);f(this,"_pendingDelta",new Map)}init(e){if(!e||!e.endpoint)throw new Error("endpoint required");if(typeof e.getAccessToken!="function")throw new Error("getAccessToken() required");if(this.endpoint=String(e.endpoint).replace(/\/+$/,""),this.getAccessToken=e.getAccessToken,this._opts={title:e.title||"AI 助手",subtitle:e.subtitle||"在线",placeholder:e.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",welcomeMessage:e.welcomeMessage||"你好!我是 AI 助手,有什么可以帮你的?",theme:e.theme||"ink",position:e.position||"bottom-right",autoOpen:!!e.autoOpen,avatar:e.avatar||"🤖",clientPrefix:e.clientPrefix||"app",persistentTools:e.persistentTools||[],builtinTools:e.builtinTools||{},skin:e.skin||"iridescent-bloom"},this._widget=new vs(this._opts,{onSend:()=>this._onSend(),onNew:()=>this._newSession(),onClose:()=>this.close(),onPanelOpen:()=>{},onCycleSkin:t=>this.setSkin(t),onToolPanelToggle:(t,a,n)=>this._handleToolPanelToggle(t,a,n),onToolPanelAction:t=>this._handleToolPanelAction(t)}),this._widget.mount(),this._opts.autoOpen&&this.open(),this._opts.welcomeMessage&&this._widget.setWelcome(this._opts.welcomeMessage),e.pageAwareness?.enabled){const t=this,a={isWidgetOpen:()=>t._isOpen,appendSystemMsg:n=>t._appendMsg("system",n),onErrorBadge:n=>t._widget?.setErrorBadge(n)};this._pageAwareness=new Vt(this.endpoint,e.pageAwareness,a),this._pageAwareness.start(),e.pageAwareness.behavior?.registerTool!==!1&&ce.registerBuiltinTool(sn({getPageErrors:()=>this.getPageErrors(),clearPageErrors:()=>this.clearPageErrors()}))}return setTimeout(()=>{this._resumePendingToolResults()},0),this._persistentTools=this._opts.persistentTools.slice(),this}destroy(){this._pageAwareness?.stop(),this._pageAwareness=null,this._widget&&(this._widget.destroy(),this._widget=null)}async registerTools(e){if(!e||!e.sessionId)throw new Error("sessionId required");if(!e.tools||!e.tools.length)throw new Error("tools required");return this._internalRegister(e.sessionId,e.tools)}async unregisterTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const a=t.names||null;this._tools.unregister(t.sessionId,a);const n=await this._ensureToken();return nn(this.endpoint,n,t.sessionId,a)}async listTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const a=await this._ensureToken();return ps(this.endpoint,a,t.sessionId)}async _internalRegister(e,t){const a=this._tools.register(e,t),n=await this._ensureToken();return cs(this.endpoint,n,e,a)}async _internalAppend(e,t){const a=this._tools.register(e,t),n=await this._ensureToken();return gs(this.endpoint,n,e,a)}async _syncToolsForSession(e){const t=this._persistentTools.slice(),a=this._opts.builtinTools;for(const n of ce._builtinTools)n.name==="change_skin"&&a&&a.changeSkin===!1||n.name==="get_page_errors"&&a&&a.pageErrors===!1||t.push(n);if(t.length>0)try{await this._internalRegister(e,t);for(const n of t)this._activeTools.indexOf(n.name)<0&&this._activeTools.push(n.name);console.log("[AIAgent SDK 🧰 持久工具已注册到 chat session]",t.map(n=>n.name).join(", "))}catch(n){console.warn("[AIAgent SDK] persistent tools register failed:",n)}if(this._ephemeralTools.length>0)try{await this._internalAppend(e,this._ephemeralTools);for(const n of this._ephemeralTools)this._activeTools.indexOf(n.name)<0&&this._activeTools.push(n.name);console.log("[AIAgent SDK 🧰 临时工具已追加到 chat session]",this._ephemeralTools.map(n=>n.name).join(", "))}catch(n){console.warn("[AIAgent SDK] ephemeral tools append failed:",n)}}async addEphemeralTools(e){if(!(!e||!e.length)){for(const t of e)this._ephemeralTools=this._ephemeralTools.filter(a=>a.name!==t.name),this._ephemeralTools.push(t);if(this._chatSessionId)try{await this._internalAppend(this._chatSessionId,e);for(const t of e)this._activeTools.indexOf(t.name)<0&&this._activeTools.push(t.name);console.log("[AIAgent SDK 🧰 临时工具已追加到当前会话]",e.map(t=>t.name).join(", "))}catch(t){console.warn("[AIAgent SDK] ephemeral tools append failed:",t)}}}async removeEphemeralTools(e){if(!(!e||!e.length)&&(this._ephemeralTools=this._ephemeralTools.filter(t=>!e.includes(t.name)),this._activeTools=this._activeTools.filter(t=>!e.includes(t)),this._chatSessionId))try{const t=await this._ensureToken();await nn(this.endpoint,t,this._chatSessionId,e)}catch(t){console.warn("[AIAgent SDK] ephemeral tools remove failed:",t)}}_getLocalTool(e,t){return this._tools.get(e,t)}static registerBuiltinTool(e){if(!e||!e.name){console.warn("[AIAgent SDK] registerBuiltinTool: invalid tool");return}ce._builtinTools=ce._builtinTools.filter(t=>t.name!==e.name),ce._builtinTools.push(e)}async stream(e){const t=e||{};return this._postStream({sessionId:t.sessionId,message:t.message,activeTools:t.activeTools||[],onChunk:t.onChunk||(()=>{}),onDone:t.onDone||(()=>{}),onError:t.onError||(a=>console.error(a)),onToolCall:t.onToolCall,onToolCallDelta:t.onToolCallDelta,onToolCallStart:t.onToolCallStart,onToolCallEnd:t.onToolCallEnd})}open(){this._widget&&this._widget.open(),this._isOpen=!0}close(){this._widget&&this._widget.close(),this._isOpen=!1}toggle(){this._widget&&this._widget.toggle(),this._isOpen=this._widget?this._widget.getIsOpen():!1}setTheme(e){this._widget&&Ts(this._widget,e.theme)}setSkin(e){if(!this._widget)return;if(!V.instance().get(e)){console.warn("[AIAgent SDK] setSkin: skin not found:",e);return}this._widget.applySkin(e)}registerSkin(e){V.instance().register(e)}listSkins(){return V.instance().list()}listSkinsWithInfo(){return V.instance().listWithInfo()}getPageErrors(){return this._pageAwareness?.getErrors()||[]}clearPageErrors(){this._pageAwareness?.clear()}reportPageError(e){this._pageAwareness?.report(e)}registerToolPanel(e){if(this._widget){this._widget.registerToolPanelItems(e);for(const t of e)t.type==="toggle"&&t.defaultOn&&t.tool&&!t.onToggle&&this.addEphemeralTools([t.tool])}}_handleToolPanelToggle(e,t,a){if(!this._widget)return;const i=this._widget._toolPanelItems?.find(o=>o.name===e);i&&(i.tool&&(t?this.addEphemeralTools([i.tool]):this.removeEphemeralTools([i.tool.name])),typeof i.onToggle=="function"&&i.onToggle(t))}_handleToolPanelAction(e){if(!this._widget)return;const a=this._widget._toolPanelItems?.find(n=>n.name===e);!a||a.type!=="action"||typeof a.onExecute=="function"&&a.onExecute()}_renderHistory(e){if(!(!this._widget||!this._widget.getRefs()))for(const a of e)a.role!=="tool"&&this._renderMsg(a.role,a.text)}_snapshotThinkingCard(e){const t=e.querySelector(".aiagent-sdk-thinking-body");return{content:t?t.innerHTML:"",done:e.classList.contains("aiagent-sdk-thinking-done")}}_snapshotToolCard(e){const t=e.getAttribute("data-tool")||"",a=e.getAttribute("data-args");let n={};if(a)try{n=JSON.parse(a)}catch{n={}}else{const d=e.querySelector(".aiagent-sdk-tool-body")?.textContent||"";try{n=JSON.parse(d)}catch{n={}}}let i="pending";e.classList.contains("aiagent-sdk-tool-success")?i="success":e.classList.contains("aiagent-sdk-tool-card--delta")?i="delta":e.classList.contains("aiagent-sdk-tool-cancelled")?i="cancelled":e.classList.contains("aiagent-sdk-tool-done")?i="done":e.classList.contains("aiagent-sdk-tool-confirmed")?i="confirmed":e.classList.contains("aiagent-sdk-tool-card--pending")&&(i="pending");const o=i==="delta"&&e.querySelector(".aiagent-sdk-tool-body")?.textContent||"";return{tool:t,args:n,state:i,bodyText:o}}_snapshotCards(){const e=this._widget?.getRefs();if(!e)return[];const t=[];return e.msgEl.querySelectorAll(".aiagent-sdk-thinking-card, .aiagent-sdk-tool-card").forEach(n=>{if(n.classList.contains("aiagent-sdk-thinking-card")){const i=this._snapshotThinkingCard(n);t.push({kind:"thinking",...i})}else{const i=this._snapshotToolCard(n);t.push({kind:"tool",...i})}}),t}_renderCardSnapshots(e){if(!this._widget)return;const t=this._widget.getRefs();if(t)for(const a of e)if(a.kind==="thinking"){const n=Va(t.msgEl),i=n.querySelector(".aiagent-sdk-thinking-body");i&&(i.innerHTML=a.content),a.done&&Ie(n)}else if(a.state==="delta"&&Object.keys(a.args).length===0){const n=Zt(t.msgEl,a.tool||"...",a.tool);a.bodyText&&Qa(n,a.bodyText)}else{const n=ut(t.msgEl,a.tool,a.args);if(a.state==="pending")n.classList.add("aiagent-sdk-tool-card--pending");else if(a.state==="confirmed"||a.state==="success")Ge(n,"✓ 完成");else if(a.state==="cancelled"){n.classList.add("aiagent-sdk-tool-cancelled");const i=n.querySelector(".aiagent-sdk-tool-status");i&&(i.textContent="✕ 已取消")}else a.state==="done"&&Ge(n,"✓ 完成")}}async _ensureToken(){return this._tokenCache.get(this.getAccessToken)}_newSession(){const e=this._chatSessionId;e&&bt(this.endpoint,"",e).catch(()=>{}),this._widget&&this._widget.clearMessages(),this._messages=[],this._activeTools=[],this._chatSessionId=null,this._thinkingCard=null,this._pendingDelta.clear(),this._ephemeralTools=[],this._pageAwareness?.resetSurfacedFlags(),this._widget&&this._widget.setErrorBadge(0),this._widget&&this._opts.welcomeMessage&&this._widget.setWelcome(this._opts.welcomeMessage)}static buildStreamHandlers(e){let t="",a=!1;function n(){a||(a=!0,an(e.typing),ls(e.typing),e.onUpgrade&&e.onUpgrade())}return{onChunk:i=>{t+=i.data||"",n(),e.typing.innerHTML=lt(t),dt(e.typing),e.msgEl.scrollTop=e.msgEl.scrollHeight},onDone:()=>{!a&&!t?e.typing.remove():(n(),kt(e.typing),e.typing.innerHTML=lt(t),dt(e.typing)),e.onAssistantText&&e.onAssistantText(t),e.msgEl.scrollTop=e.msgEl.scrollHeight,e.onDoneCleanup&&e.onDoneCleanup()},onError:i=>{an(e.typing),a?(kt(e.typing),e.typing.className="aiagent-sdk-msg aiagent-sdk-msg-system",e.typing.textContent="⚠️ "+i.message):(e.typing.remove(),e.onErrorFallback&&e.onErrorFallback("⚠️ "+i.message)),e.onDoneCleanup&&e.onDoneCleanup()},isReplaced:()=>a,getAssistantBuf:()=>t}}_onSend(){if(!this._widget)return;const e=this._widget.getRefs();if(!e)return;const t=e.taEl.value.trim();!t||this._busy||(e.taEl.value="",e.taEl.style.height="auto",this._sendUserMessage(t))}async _sendUserMessage(e){this._widget&&this._widget.hideWelcome(),this._appendMsg("user",e),this._setBusy(!0);const t=this._widget.getRefs(),a=mt(t.msgEl);this._thinkingBuf="";const n=this,i=this._activeTools.slice();let o=!1;const d={typing:a},l=(()=>{const u=ce.buildStreamHandlers({typing:a,msgEl:t.msgEl,onUpgrade:()=>{n._thinkingCard&&(Ie(n._thinkingCard),n._thinkingCard=null)},onErrorFallback:m=>n._appendMsg("system",m),onAssistantText:m=>{m&&n._messages.push({role:"assistant",text:m})},onDoneCleanup:()=>{o||n._setBusy(!1),n._thinkingCard&&(Ie(n._thinkingCard),n._thinkingCard=null)}});return{onChunk:u.onChunk,onDone:u.onDone,onError:u.onError,getAssistantBuf:u.getAssistantBuf}})();let p=e;if(this._pageAwareness?.isEnabled()){const u=this._pageAwareness.buildContextBlock();u&&(p=u+`

`+e)}const g={message:p,onChunk:u=>l.onChunk(u),onDone:()=>l.onDone(),onError:u=>l.onError(u),onThinking:u=>{n._handleThinking(u,t.msgEl,d.typing)},onToolCallStart:u=>{n._handleToolCallStart(u,t.msgEl,d.typing)},onToolCallDelta:u=>{n._handleToolCallDelta(u,t.msgEl,d.typing)},onToolCallEnd:u=>{console.log("[AIAgent SDK 🏁 onToolCallEnd] 流式工具参数传输结束",u)},onRoundEnd:u=>{n._thinkingBuf="",n._thinkingCard&&(Ie(n._thinkingCard),n._thinkingCard=null);const m=l.getAssistantBuf();m&&n._messages.push({role:"assistant",text:m});const y=d.typing;if(y&&y.parentNode){const w=y.querySelector(".aiagent-sdk-typing-particle"),I=!y.textContent?.trim();w||I?y.remove():kt(y)}const _=mt(t.msgEl),C=ce.buildStreamHandlers({typing:_,msgEl:t.msgEl,onUpgrade:()=>{n._thinkingCard&&(Ie(n._thinkingCard),n._thinkingCard=null)},onErrorFallback:w=>n._appendMsg("system",w),onAssistantText:w=>{w&&n._messages.push({role:"assistant",text:w})},onDoneCleanup:()=>{o||n._setBusy(!1),n._thinkingCard&&(Ie(n._thinkingCard),n._thinkingCard=null)}});l.onChunk=C.onChunk,l.onDone=C.onDone,l.onError=C.onError,d.typing=_},onToolCall:async u=>{n._setBusy(!0),await n._handleToolCall(u,t.msgEl,d.typing)&&(o=!0)},onText:u=>{u&&l.onChunk({event:"text",data:u})}};this._chatSessionId||(this._chatSessionId=this._opts.clientPrefix+":user-"+Date.now(),await this._syncToolsForSession(this._chatSessionId)),g.sessionId=this._chatSessionId,g.activeTools=i;try{await this._postStream(g)}catch{}}_handleThinking(e,t,a){if(this._thinkingBuf||(this._thinkingBuf=""),this._thinkingBuf+=e,!this._thinkingCard){t.insertBefore(Va(t),a);const n=t.querySelectorAll(".aiagent-sdk-thinking-card");this._thinkingCard=n.length?n[n.length-1]:null}this._thinkingCard&&ns(this._thinkingCard,this._thinkingBuf)}_handleToolCallStart(e,t,a){if(!e||!e.id||!e.name)return;const n=Zt(t,e.id,e.name,a||null);this._pendingDelta.set(e.id,n)}_handleToolCallDelta(e,t,a){if(!e||!e.id)return;let n=this._pendingDelta.get(e.id);n||(n=Zt(t,e.id,e.name||"...",a||null),this._pendingDelta.set(e.id,n)),Qa(n,e.delta||"")}async _handleToolCall(e,t,a){if(!e||!e.tool||e.tool.indexOf("__")===0)return!1;if(!!e.server_executed){const g=e.id?this._pendingDelta.get(e.id):null;if(g)ft(g,e.args||{},e.tool),this._pendingDelta.delete(e.id),Ge(g);else{const u=ut(t,e.tool,e.args||{},a||null);ft(u,e.args||{},e.tool),Ge(u)}return this._messages.push({role:"tool",text:"",data:{tool:e.tool,args:e.args||{}}}),!1}if(!e.args||typeof e.args!="object"||Object.keys(e.args).length===0)return!1;const i=e.id?this._pendingDelta.get(e.id):null,o=i?(ft(i,e.args,e.tool),this._pendingDelta.delete(e.id),i):(()=>{const g=ut(t,e.tool,e.args,a||null);return ft(g,e.args,e.tool),g})();this._lastToolCard=o,this._messages.push({role:"tool",text:"",data:{tool:e.tool,args:e.args}});const d=this._getLocalTool(this._chatSessionId,e.tool),l=!!(d&&d.onCall);if(!l&&!await is(o))return this._appendMsg("system",`🚫 已取消工具调用:${e.tool}`),await this._postAbort(),!0;let p=l?void 0:{confirmed:!0};if(l)try{p=await Promise.resolve(d.onCall(e.args))}catch(g){console.error("[AIAgent SDK] onCall threw:",g),this._appendMsg("system","⚠️ onCall 失败: "+g.message)}return e.id&&await this._postToolResult(e.id,p,o),!0}_setBusy(e){if(this._busy=e,!this._widget)return;const t=this._widget.getRefs();t&&(t.sendBtn.disabled=e,t.sendBtn.textContent=e?"...":"发送")}_sleep(e){return new Promise(t=>setTimeout(t,e))}_appendMsg(e,t,a){if(!this._widget)return;const n=this._widget.getRefs();n&&(en(n.msgEl,e,t,this._messages.length,a),this._messages.push({role:e,text:t,data:a}))}_renderMsg(e,t,a){if(!this._widget)return;const n=this._widget.getRefs();n&&(!t&&e!=="system"||en(n.msgEl,e,t,this._messages.length,a))}_appendTyping(){if(!this._widget)return document.createElement("div");const e=this._widget.getRefs();return e?mt(e.msgEl):document.createElement("div")}async _postStream(e){const t=e.sessionId,a=e.message,n=e.activeTools,i=e.onChunk||(()=>{}),o=e.onDone||(()=>{}),d=e.onError||(v=>console.error(v)),l=e.onToolCall,p=e.onToolCallDelta,g=e.onToolCallStart,u=e.onToolCallEnd,m=e.onThinking,y=e.onRoundEnd,_=e.onText;if(!t){d(new Error("sessionId required"));return}if(a==null){d(new Error("message required"));return}let C;try{C=await this._ensureToken()}catch(v){d(v);return}const w=this.endpoint+"/chat/"+encodeURIComponent(t)+"/stream",I={message:a};n&&n.length&&(I.activeTools=n);let O;try{O=await fetch(w,{method:"POST",headers:{Authorization:"Bearer "+C,"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify(I)})}catch(v){d(v);return}if(!O.ok||!O.body){d(new Error("http "+O.status));return}return Q(O.body,i,o,d,l,p,g,u,m,y,_)}async _postToolResult(e,t,a){const n=this._toolCtx();return fs(n,e,t,a)}async _postAbort(){const e=this._chatSessionId;if(e){try{await bt(this.endpoint,await this._ensureToken(),e)}catch(t){console.warn("[AIAgent SDK] abort failed:",t.message)}this._setBusy(!1)}}async _resumePendingToolResults(){return xs(this._toolCtx())}_toolCtx(){const e=this;return{endpoint:this.endpoint,ensureToken:()=>e._ensureToken(),getSessionId:()=>e._chatSessionId,getPending:()=>e._pendingToolCall,setPending:t=>{e._pendingToolCall=t},appendMsg:(t,a,n)=>e._appendMsg(t,a,n),setBusy:t=>e._setBusy(t),sleep:t=>e._sleep(t),appendTyping:()=>e._appendTyping(),getMsgEl:()=>e._widget?.getRefs()?.msgEl||document.createElement("div"),handleThinking:t=>{const a=e._widget?.getRefs();if(!a)return;const n=a.msgEl.querySelector(".aiagent-sdk-typing");n&&e._handleThinking(t,a.msgEl,n)},handleToolCallStart:t=>{const a=e._widget?.getRefs();if(!a)return;const n=a.msgEl.querySelector(".aiagent-sdk-typing");e._handleToolCallStart(t,a.msgEl,n||void 0)},handleToolCallDelta:t=>{const a=e._widget?.getRefs();if(!a)return;const n=a.msgEl.querySelector(".aiagent-sdk-typing");e._handleToolCallDelta(t,a.msgEl,n||void 0)},handleToolCall:async t=>{const a=e._widget?.getRefs();if(!a)return!1;const n=a.msgEl.querySelector(".aiagent-sdk-typing");return e._handleToolCall(t,a.msgEl,n||void 0)}}}};f(ce,"_builtinTools",[]);let Re=ce;function Es(){return{init:s=>new Re().init(s)}}const Ss=["https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap"];let dn=!1;function As(){if(!dn&&!(typeof document>"u"))try{const s=document.createElement("link");s.rel="preconnect",s.href="https://fonts.googleapis.com",document.head.appendChild(s);const e=document.createElement("link");e.rel="preconnect",e.href="https://fonts.gstatic.com",e.crossOrigin="anonymous",document.head.appendChild(e);for(const t of Ss){const a=document.createElement("link");a.rel="stylesheet",a.href=t,document.head.appendChild(a)}dn=!0}catch(s){console.warn("[AIAgent SDK] loadFonts failed, fallback to system fonts:",s)}}As();const cn=Es();return globalThis.AIAgent=Object.assign(cn,{changeSkinTool:hs,dictTool:us,pageErrorsTool:sn,registerBuiltinTool:Re.registerBuiltinTool,IRIDESCENT_BLOOM:_e,CLASSIC:pt,AURORA:Kt,SkinRegistry:V,deriveSkin:Za,resolveLayout:gt,DEFAULT_LAYOUT:Xa}),console.info("%c[AIAgent SDK v5.0.0]%c loaded (built __BUILD_TIME__). Theme: Iridescent Bloom. AIAgent.init({...}) is on window.AIAgent.","background:linear-gradient(135deg,#5eead4,#a78bfa,#f0abfc);color:#050505;padding:2px 8px;border-radius:3px;font-weight:700","color:#a1a1aa"),cn});
