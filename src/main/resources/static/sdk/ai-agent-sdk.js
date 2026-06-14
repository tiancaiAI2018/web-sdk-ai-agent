(function($,P){typeof exports=="object"&&typeof module<"u"?module.exports=P():typeof define=="function"&&define.amd?define(P):($=typeof globalThis<"u"?globalThis:$||self,$.AIAgent=P())})(this,function(){"use strict";var Js=Object.defineProperty;var $a=$=>{throw TypeError($)};var Vs=($,P,Q)=>P in $?Js($,P,{enumerable:!0,configurable:!0,writable:!0,value:Q}):$[P]=Q;var f=($,P,Q)=>Vs($,typeof P!="symbol"?P+"":P,Q),Qs=($,P,Q)=>P.has($)||$a("Cannot "+Q);var Ba=($,P,Q)=>P.has($)?$a("Cannot add the same private member more than once"):P instanceof WeakSet?P.add($):P.set($,Q);var at=($,P,Q)=>(Qs($,P,"access private method"),Q);var he,Ua,xn,Ha;function $(s){if(!s)return null;try{const e=s.split(".");if(e.length!==3)return null;let t=e[1].replace(/-/g,"+").replace(/_/g,"/");for(;t.length%4;)t+="=";const n=atob(t),a=JSON.parse(n);return typeof a.exp=="number"?a.exp:null}catch{return null}}class P{constructor(){f(this,"_accessToken",null);f(this,"_expEpoch",0)}async get(e){const t=Math.floor(Date.now()/1e3);if(this._accessToken&&this._expEpoch>t+30)return this._accessToken;console.log("[AIAgent SDK] token missing/near-expiry, calling getAccessToken()...");const n=await e();if(!n||!n.accessToken)throw new Error("getAccessToken() must return { accessToken }");return this._accessToken=n.accessToken,this._expEpoch=$(n.accessToken)||t+300,this._accessToken}}async function Q(s,e,t,n,a,i,o,d,l,g,c){const u=s.getReader(),m=new TextDecoder;let k="",w=!1;function C(){w||(w=!0,t())}function _(){for(;;){const I=k.indexOf(`

`);if(I<0)return;const O=k.slice(0,I);if(k=k.slice(I+2),!O)continue;const v={},x=O.split(`
`);for(let y=0;y<x.length;y++){const N=x[y],B=N.indexOf(":");if(B<0)continue;const te=N.slice(0,B).trim();let ae=N.slice(B+1);ae.length>0&&ae.charAt(0)===" "&&(ae=ae.slice(1)),te==="data"?v.data=(v.data?v.data+`
`:"")+ae:v[te]=ae}if(v.data&&(v.data=v.data.replace(/\\n/g,`
`)),v.event==="tool_call_start"&&typeof o=="function"){try{const y=JSON.parse(v.data||"{}");console.log("[AIAgent SDK 🚀 tool_call_start]",y),o(y)}catch(y){console.error("[AIAgent SDK] tool_call_start parse failed",y,v.data)}continue}if(v.event==="tool_call"&&typeof a=="function"){try{const y=JSON.parse(v.data||"{}");console.log("[AIAgent SDK 🔧 tool_call]",y),a(y)}catch(y){console.error("[AIAgent SDK] tool_call parse failed",y,v.data)}continue}if(v.event==="tool_call_delta"&&typeof i=="function"){try{const y=JSON.parse(v.data||"{}");console.log("[AIAgent SDK 🔧 tool_call_delta]",y),i(y)}catch(y){console.error("[AIAgent SDK] tool_call_delta parse failed",y,v.data)}continue}if(v.event==="tool_call_end"&&typeof d=="function"){try{const y=v.data?JSON.parse(v.data):{};console.log("[AIAgent SDK 🏁 tool_call_end]",y),d(y)}catch{console.log("[AIAgent SDK 🏁 tool_call_end] (no data)"),d({})}continue}if(v.event==="round_end"&&typeof g=="function"){try{const y=v.data?JSON.parse(v.data):{};console.log("[AIAgent SDK 🔄 round_end]",y),g(y)}catch{g({})}continue}if(v.id==="last"){C();continue}if(v.event==="thinking"&&typeof l=="function"){l(v.data||"");continue}if(v.event==="text"&&typeof c=="function"){c(v.data||"");continue}v.data!==void 0&&e(v)}}try{for(;;){const I=await u.read();if(I.done)break;k+=m.decode(I.value,{stream:!0}),_()}_(),C()}catch(I){n(I)}}function Pt(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}let xe=Pt();function yn(s){xe=s}const wn=/[&<>"']/,Fa=new RegExp(wn.source,"g"),_n=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,qa=new RegExp(_n.source,"g"),ja={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},vn=s=>ja[s];function ee(s,e){if(e){if(wn.test(s))return s.replace(Fa,vn)}else if(_n.test(s))return s.replace(qa,vn);return s}const Ga=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;function Wa(s){return s.replace(Ga,(e,t)=>(t=t.toLowerCase(),t==="colon"?":":t.charAt(0)==="#"?t.charAt(1)==="x"?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""))}const Ya=/(^|[^\[])\^/g;function D(s,e){let t=typeof s=="string"?s:s.source;e=e||"";const n={replace:(a,i)=>{let o=typeof i=="string"?i:i.source;return o=o.replace(Ya,"$1"),t=t.replace(a,o),n},getRegex:()=>new RegExp(t,e)};return n}function Tn(s){try{s=encodeURI(s).replace(/%25/g,"%")}catch{return null}return s}const ze={exec:()=>null};function En(s,e){const t=s.replace(/\|/g,(i,o,d)=>{let l=!1,g=o;for(;--g>=0&&d[g]==="\\";)l=!l;return l?"|":" |"}),n=t.split(/ \|/);let a=0;if(n[0].trim()||n.shift(),n.length>0&&!n[n.length-1].trim()&&n.pop(),e)if(n.length>e)n.splice(e);else for(;n.length<e;)n.push("");for(;a<n.length;a++)n[a]=n[a].trim().replace(/\\\|/g,"|");return n}function $e(s,e,t){const n=s.length;if(n===0)return"";let a=0;for(;a<n&&s.charAt(n-a-1)===e;)a++;return s.slice(0,n-a)}function Ka(s,e){if(s.indexOf(e[1])===-1)return-1;let t=0;for(let n=0;n<s.length;n++)if(s[n]==="\\")n++;else if(s[n]===e[0])t++;else if(s[n]===e[1]&&(t--,t<0))return n;return-1}function Sn(s,e,t,n){const a=e.href,i=e.title?ee(e.title):null,o=s[1].replace(/\\([\[\]])/g,"$1");if(s[0].charAt(0)!=="!"){n.state.inLink=!0;const d={type:"link",raw:t,href:a,title:i,text:o,tokens:n.inlineTokens(o)};return n.state.inLink=!1,d}return{type:"image",raw:t,href:a,title:i,text:ee(o)}}function Xa(s,e){const t=s.match(/^(\s+)(?:```)/);if(t===null)return e;const n=t[1];return e.split(`
`).map(a=>{const i=a.match(/^\s+/);if(i===null)return a;const[o]=i;return o.length>=n.length?a.slice(n.length):a}).join(`
`)}class it{constructor(e){f(this,"options");f(this,"rules");f(this,"lexer");this.options=e||xe}space(e){const t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){const t=this.rules.block.code.exec(e);if(t){const n=t[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?n:$e(n,`
`)}}}fences(e){const t=this.rules.block.fences.exec(e);if(t){const n=t[0],a=Xa(n,t[3]||"");return{type:"code",raw:n,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:a}}}heading(e){const t=this.rules.block.heading.exec(e);if(t){let n=t[2].trim();if(/#$/.test(n)){const a=$e(n,"#");(this.options.pedantic||!a||/ $/.test(a))&&(n=a.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:n,tokens:this.lexer.inline(n)}}}hr(e){const t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:$e(t[0],`
`)}}blockquote(e){const t=this.rules.block.blockquote.exec(e);if(t){let n=$e(t[0],`
`).split(`
`),a="",i="";const o=[];for(;n.length>0;){let d=!1;const l=[];let g;for(g=0;g<n.length;g++)if(/^ {0,3}>/.test(n[g]))l.push(n[g]),d=!0;else if(!d)l.push(n[g]);else break;n=n.slice(g);const c=l.join(`
`),u=c.replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,`
    $1`).replace(/^ {0,3}>[ \t]?/gm,"");a=a?`${a}
${c}`:c,i=i?`${i}
${u}`:u;const m=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(u,o,!0),this.lexer.state.top=m,n.length===0)break;const k=o[o.length-1];if(k?.type==="code")break;if(k?.type==="blockquote"){const w=k,C=w.raw+`
`+n.join(`
`),_=this.blockquote(C);o[o.length-1]=_,a=a.substring(0,a.length-w.raw.length)+_.raw,i=i.substring(0,i.length-w.text.length)+_.text;break}else if(k?.type==="list"){const w=k,C=w.raw+`
`+n.join(`
`),_=this.list(C);o[o.length-1]=_,a=a.substring(0,a.length-k.raw.length)+_.raw,i=i.substring(0,i.length-w.raw.length)+_.raw,n=C.substring(o[o.length-1].raw.length).split(`
`);continue}}return{type:"blockquote",raw:a,tokens:o,text:i}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim();const a=n.length>1,i={type:"list",raw:"",ordered:a,start:a?+n.slice(0,-1):"",loose:!1,items:[]};n=a?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=a?n:"[*+-]");const o=new RegExp(`^( {0,3}${n})((?:[	 ][^\\n]*)?(?:\\n|$))`);let d=!1;for(;e;){let l=!1,g="",c="";if(!(t=o.exec(e))||this.rules.block.hr.test(e))break;g=t[0],e=e.substring(g.length);let u=t[2].split(`
`,1)[0].replace(/^\t+/,I=>" ".repeat(3*I.length)),m=e.split(`
`,1)[0],k=!u.trim(),w=0;if(this.options.pedantic?(w=2,c=u.trimStart()):k?w=t[1].length+1:(w=t[2].search(/[^ ]/),w=w>4?1:w,c=u.slice(w),w+=t[1].length),k&&/^ *$/.test(m)&&(g+=m+`
`,e=e.substring(m.length+1),l=!0),!l){const I=new RegExp(`^ {0,${Math.min(3,w-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),O=new RegExp(`^ {0,${Math.min(3,w-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),v=new RegExp(`^ {0,${Math.min(3,w-1)}}(?:\`\`\`|~~~)`),x=new RegExp(`^ {0,${Math.min(3,w-1)}}#`);for(;e;){const y=e.split(`
`,1)[0];if(m=y,this.options.pedantic&&(m=m.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),v.test(m)||x.test(m)||I.test(m)||O.test(e))break;if(m.search(/[^ ]/)>=w||!m.trim())c+=`
`+m.slice(w);else{if(k||u.search(/[^ ]/)>=4||v.test(u)||x.test(u)||O.test(u))break;c+=`
`+m}!k&&!m.trim()&&(k=!0),g+=y+`
`,e=e.substring(y.length+1),u=m.slice(w)}}i.loose||(d?i.loose=!0:/\n *\n *$/.test(g)&&(d=!0));let C=null,_;this.options.gfm&&(C=/^\[[ xX]\] /.exec(c),C&&(_=C[0]!=="[ ] ",c=c.replace(/^\[[ xX]\] +/,""))),i.items.push({type:"list_item",raw:g,task:!!C,checked:_,loose:!1,text:c,tokens:[]}),i.raw+=g}i.items[i.items.length-1].raw=i.items[i.items.length-1].raw.trimEnd(),i.items[i.items.length-1].text=i.items[i.items.length-1].text.trimEnd(),i.raw=i.raw.trimEnd();for(let l=0;l<i.items.length;l++)if(this.lexer.state.top=!1,i.items[l].tokens=this.lexer.blockTokens(i.items[l].text,[]),!i.loose){const g=i.items[l].tokens.filter(u=>u.type==="space"),c=g.length>0&&g.some(u=>/\n.*\n/.test(u.raw));i.loose=c}if(i.loose)for(let l=0;l<i.items.length;l++)i.items[l].loose=!0;return i}}html(e){const t=this.rules.block.html.exec(e);if(t)return{type:"html",block:!0,raw:t[0],pre:t[1]==="pre"||t[1]==="script"||t[1]==="style",text:t[0]}}def(e){const t=this.rules.block.def.exec(e);if(t){const n=t[1].toLowerCase().replace(/\s+/g," "),a=t[2]?t[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:n,raw:t[0],href:a,title:i}}}table(e){const t=this.rules.block.table.exec(e);if(!t||!/[:|]/.test(t[2]))return;const n=En(t[1]),a=t[2].replace(/^\||\| *$/g,"").split("|"),i=t[3]&&t[3].trim()?t[3].replace(/\n[ \t]*$/,"").split(`
`):[],o={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===a.length){for(const d of a)/^ *-+: *$/.test(d)?o.align.push("right"):/^ *:-+: *$/.test(d)?o.align.push("center"):/^ *:-+ *$/.test(d)?o.align.push("left"):o.align.push(null);for(let d=0;d<n.length;d++)o.header.push({text:n[d],tokens:this.lexer.inline(n[d]),header:!0,align:o.align[d]});for(const d of i)o.rows.push(En(d,o.header.length).map((l,g)=>({text:l,tokens:this.lexer.inline(l),header:!1,align:o.align[g]})));return o}}lheading(e){const t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){const t=this.rules.block.paragraph.exec(e);if(t){const n=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:n,tokens:this.lexer.inline(n)}}}text(e){const t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){const t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:ee(t[1])}}tag(e){const t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&/^<a /i.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){const t=this.rules.inline.link.exec(e);if(t){const n=t[2].trim();if(!this.options.pedantic&&/^</.test(n)){if(!/>$/.test(n))return;const o=$e(n.slice(0,-1),"\\");if((n.length-o.length)%2===0)return}else{const o=Ka(t[2],"()");if(o>-1){const l=(t[0].indexOf("!")===0?5:4)+t[1].length+o;t[2]=t[2].substring(0,o),t[0]=t[0].substring(0,l).trim(),t[3]=""}}let a=t[2],i="";if(this.options.pedantic){const o=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(a);o&&(a=o[1],i=o[3])}else i=t[3]?t[3].slice(1,-1):"";return a=a.trim(),/^</.test(a)&&(this.options.pedantic&&!/>$/.test(n)?a=a.slice(1):a=a.slice(1,-1)),Sn(t,{href:a&&a.replace(this.rules.inline.anyPunctuation,"$1"),title:i&&i.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){const a=(n[2]||n[1]).replace(/\s+/g," "),i=t[a.toLowerCase()];if(!i){const o=n[0].charAt(0);return{type:"text",raw:o,text:o}}return Sn(n,i,n[0],this.lexer)}}emStrong(e,t,n=""){let a=this.rules.inline.emStrongLDelim.exec(e);if(!a||a[3]&&n.match(/[\p{L}\p{N}]/u))return;if(!(a[1]||a[2]||"")||!n||this.rules.inline.punctuation.exec(n)){const o=[...a[0]].length-1;let d,l,g=o,c=0;const u=a[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(u.lastIndex=0,t=t.slice(-1*e.length+o);(a=u.exec(t))!=null;){if(d=a[1]||a[2]||a[3]||a[4]||a[5]||a[6],!d)continue;if(l=[...d].length,a[3]||a[4]){g+=l;continue}else if((a[5]||a[6])&&o%3&&!((o+l)%3)){c+=l;continue}if(g-=l,g>0)continue;l=Math.min(l,l+g+c);const m=[...a[0]][0].length,k=e.slice(0,o+a.index+m+l);if(Math.min(o,l)%2){const C=k.slice(1,-1);return{type:"em",raw:k,text:C,tokens:this.lexer.inlineTokens(C)}}const w=k.slice(2,-2);return{type:"strong",raw:k,text:w,tokens:this.lexer.inlineTokens(w)}}}}codespan(e){const t=this.rules.inline.code.exec(e);if(t){let n=t[2].replace(/\n/g," ");const a=/[^ ]/.test(n),i=/^ /.test(n)&&/ $/.test(n);return a&&i&&(n=n.substring(1,n.length-1)),n=ee(n,!0),{type:"codespan",raw:t[0],text:n}}}br(e){const t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e){const t=this.rules.inline.del.exec(e);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e){const t=this.rules.inline.autolink.exec(e);if(t){let n,a;return t[2]==="@"?(n=ee(t[1]),a="mailto:"+n):(n=ee(t[1]),a=n),{type:"link",raw:t[0],text:n,href:a,tokens:[{type:"text",raw:n,text:n}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let n,a;if(t[2]==="@")n=ee(t[0]),a="mailto:"+n;else{let i;do i=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??"";while(i!==t[0]);n=ee(t[0]),t[1]==="www."?a="http://"+t[0]:a=t[0]}return{type:"link",raw:t[0],text:n,href:a,tokens:[{type:"text",raw:n,text:n}]}}}inlineText(e){const t=this.rules.inline.text.exec(e);if(t){let n;return this.lexer.state.inRawBlock?n=t[0]:n=ee(t[0]),{type:"text",raw:t[0],text:n}}}}const Za=/^(?: *(?:\n|$))+/,Ja=/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,Va=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,Be=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Qa=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,An=/(?:[*+-]|\d{1,9}[.)])/,Cn=D(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g,An).replace(/blockCode/g,/ {4}/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).getRegex(),Mt=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,ei=/^[^\n]+/,zt=/(?!\s*\])(?:\\.|[^\[\]\\])+/,ti=D(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/).replace("label",zt).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),ni=D(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,An).getRegex(),st="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",$t=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,ai=D("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))","i").replace("comment",$t).replace("tag",st).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),In=D(Mt).replace("hr",Be).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",st).getRegex(),Bt={blockquote:D(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",In).getRegex(),code:Ja,def:ti,fences:Va,heading:Qa,hr:Be,html:ai,lheading:Cn,list:ni,newline:Za,paragraph:In,table:ze,text:ei},Rn=D("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",Be).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",st).getRegex(),ii={...Bt,table:Rn,paragraph:D(Mt).replace("hr",Be).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Rn).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",st).getRegex()},si={...Bt,html:D(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",$t).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:ze,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:D(Mt).replace("hr",Be).replace("heading",` *#{1,6} *[^
]`).replace("lheading",Cn).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},On=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,oi=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Dn=/^( {2,}|\\)\n(?!\s*$)/,ri=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Ue="\\p{P}\\p{S}",li=D(/^((?![*_])[\spunctuation])/,"u").replace(/punctuation/g,Ue).getRegex(),di=/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g,ci=D(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,"u").replace(/punct/g,Ue).getRegex(),gi=D("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])","gu").replace(/punct/g,Ue).getRegex(),pi=D("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])","gu").replace(/punct/g,Ue).getRegex(),ui=D(/\\([punct])/,"gu").replace(/punct/g,Ue).getRegex(),hi=D(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),fi=D($t).replace("(?:-->|$)","-->").getRegex(),mi=D("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",fi).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),ot=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,ki=D(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label",ot).replace("href",/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Ln=D(/^!?\[(label)\]\[(ref)\]/).replace("label",ot).replace("ref",zt).getRegex(),Nn=D(/^!?\[(ref)\](?:\[\])?/).replace("ref",zt).getRegex(),bi=D("reflink|nolink(?!\\()","g").replace("reflink",Ln).replace("nolink",Nn).getRegex(),Ut={_backpedal:ze,anyPunctuation:ui,autolink:hi,blockSkip:di,br:Dn,code:oi,del:ze,emStrongLDelim:ci,emStrongRDelimAst:gi,emStrongRDelimUnd:pi,escape:On,link:ki,nolink:Nn,punctuation:li,reflink:Ln,reflinkSearch:bi,tag:mi,text:ri,url:ze},xi={...Ut,link:D(/^!?\[(label)\]\((.*?)\)/).replace("label",ot).getRegex(),reflink:D(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",ot).getRegex()},Ht={...Ut,escape:D(On).replace("])","~|])").getRegex(),url:D(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},yi={...Ht,br:D(Dn).replace("{2,}","*").getRegex(),text:D(Ht.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},rt={normal:Bt,gfm:ii,pedantic:si},He={normal:Ut,gfm:Ht,breaks:yi,pedantic:xi};class se{constructor(e){f(this,"tokens");f(this,"options");f(this,"state");f(this,"tokenizer");f(this,"inlineQueue");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||xe,this.options.tokenizer=this.options.tokenizer||new it,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const t={block:rt.normal,inline:He.normal};this.options.pedantic?(t.block=rt.pedantic,t.inline=He.pedantic):this.options.gfm&&(t.block=rt.gfm,this.options.breaks?t.inline=He.breaks:t.inline=He.gfm),this.tokenizer.rules=t}static get rules(){return{block:rt,inline:He}}static lex(e,t){return new se(t).lex(e)}static lexInline(e,t){return new se(t).inlineTokens(e)}lex(e){e=e.replace(/\r\n|\r/g,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){const n=this.inlineQueue[t];this.inlineTokens(n.src,n.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){this.options.pedantic?e=e.replace(/\t/g,"    ").replace(/^ +$/gm,""):e=e.replace(/^( *)(\t+)/gm,(d,l,g)=>l+"    ".repeat(g.length));let a,i,o;for(;e;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(d=>(a=d.call({lexer:this},e,t))?(e=e.substring(a.raw.length),t.push(a),!0):!1))){if(a=this.tokenizer.space(e)){e=e.substring(a.raw.length),a.raw.length===1&&t.length>0?t[t.length-1].raw+=`
`:t.push(a);continue}if(a=this.tokenizer.code(e)){e=e.substring(a.raw.length),i=t[t.length-1],i&&(i.type==="paragraph"||i.type==="text")?(i.raw+=`
`+a.raw,i.text+=`
`+a.text,this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(a);continue}if(a=this.tokenizer.fences(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.heading(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.hr(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.blockquote(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.list(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.html(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.def(e)){e=e.substring(a.raw.length),i=t[t.length-1],i&&(i.type==="paragraph"||i.type==="text")?(i.raw+=`
`+a.raw,i.text+=`
`+a.raw,this.inlineQueue[this.inlineQueue.length-1].src=i.text):this.tokens.links[a.tag]||(this.tokens.links[a.tag]={href:a.href,title:a.title});continue}if(a=this.tokenizer.table(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.lheading(e)){e=e.substring(a.raw.length),t.push(a);continue}if(o=e,this.options.extensions&&this.options.extensions.startBlock){let d=1/0;const l=e.slice(1);let g;this.options.extensions.startBlock.forEach(c=>{g=c.call({lexer:this},l),typeof g=="number"&&g>=0&&(d=Math.min(d,g))}),d<1/0&&d>=0&&(o=e.substring(0,d+1))}if(this.state.top&&(a=this.tokenizer.paragraph(o))){i=t[t.length-1],n&&i?.type==="paragraph"?(i.raw+=`
`+a.raw,i.text+=`
`+a.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(a),n=o.length!==e.length,e=e.substring(a.raw.length);continue}if(a=this.tokenizer.text(e)){e=e.substring(a.raw.length),i=t[t.length-1],i&&i.type==="text"?(i.raw+=`
`+a.raw,i.text+=`
`+a.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(a);continue}if(e){const d="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(d);break}else throw new Error(d)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n,a,i,o=e,d,l,g;if(this.tokens.links){const c=Object.keys(this.tokens.links);if(c.length>0)for(;(d=this.tokenizer.rules.inline.reflinkSearch.exec(o))!=null;)c.includes(d[0].slice(d[0].lastIndexOf("[")+1,-1))&&(o=o.slice(0,d.index)+"["+"a".repeat(d[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(d=this.tokenizer.rules.inline.blockSkip.exec(o))!=null;)o=o.slice(0,d.index)+"["+"a".repeat(d[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;(d=this.tokenizer.rules.inline.anyPunctuation.exec(o))!=null;)o=o.slice(0,d.index)+"++"+o.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;e;)if(l||(g=""),l=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(c=>(n=c.call({lexer:this},e,t))?(e=e.substring(n.raw.length),t.push(n),!0):!1))){if(n=this.tokenizer.escape(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.tag(e)){e=e.substring(n.raw.length),a=t[t.length-1],a&&n.type==="text"&&a.type==="text"?(a.raw+=n.raw,a.text+=n.text):t.push(n);continue}if(n=this.tokenizer.link(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(n.raw.length),a=t[t.length-1],a&&n.type==="text"&&a.type==="text"?(a.raw+=n.raw,a.text+=n.text):t.push(n);continue}if(n=this.tokenizer.emStrong(e,o,g)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.codespan(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.br(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.del(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.autolink(e)){e=e.substring(n.raw.length),t.push(n);continue}if(!this.state.inLink&&(n=this.tokenizer.url(e))){e=e.substring(n.raw.length),t.push(n);continue}if(i=e,this.options.extensions&&this.options.extensions.startInline){let c=1/0;const u=e.slice(1);let m;this.options.extensions.startInline.forEach(k=>{m=k.call({lexer:this},u),typeof m=="number"&&m>=0&&(c=Math.min(c,m))}),c<1/0&&c>=0&&(i=e.substring(0,c+1))}if(n=this.tokenizer.inlineText(i)){e=e.substring(n.raw.length),n.raw.slice(-1)!=="_"&&(g=n.raw.slice(-1)),l=!0,a=t[t.length-1],a&&a.type==="text"?(a.raw+=n.raw,a.text+=n.text):t.push(n);continue}if(e){const c="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(c);break}else throw new Error(c)}}return t}}class lt{constructor(e){f(this,"options");f(this,"parser");this.options=e||xe}space(e){return""}code({text:e,lang:t,escaped:n}){const a=(t||"").match(/^\S*/)?.[0],i=e.replace(/\n$/,"")+`
`;return a?'<pre><code class="language-'+ee(a)+'">'+(n?i:ee(i,!0))+`</code></pre>
`:"<pre><code>"+(n?i:ee(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){const t=e.ordered,n=e.start;let a="";for(let d=0;d<e.items.length;d++){const l=e.items[d];a+=this.listitem(l)}const i=t?"ol":"ul",o=t&&n!==1?' start="'+n+'"':"";return"<"+i+o+`>
`+a+"</"+i+`>
`}listitem(e){let t="";if(e.task){const n=this.checkbox({checked:!!e.checked});e.loose?e.tokens.length>0&&e.tokens[0].type==="paragraph"?(e.tokens[0].text=n+" "+e.tokens[0].text,e.tokens[0].tokens&&e.tokens[0].tokens.length>0&&e.tokens[0].tokens[0].type==="text"&&(e.tokens[0].tokens[0].text=n+" "+e.tokens[0].tokens[0].text)):e.tokens.unshift({type:"text",raw:n+" ",text:n+" "}):t+=n+" "}return t+=this.parser.parse(e.tokens,!!e.loose),`<li>${t}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t="",n="";for(let i=0;i<e.header.length;i++)n+=this.tablecell(e.header[i]);t+=this.tablerow({text:n});let a="";for(let i=0;i<e.rows.length;i++){const o=e.rows[i];n="";for(let d=0;d<o.length;d++)n+=this.tablecell(o[d]);a+=this.tablerow({text:n})}return a&&(a=`<tbody>${a}</tbody>`),`<table>
<thead>
`+t+`</thead>
`+a+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){const t=this.parser.parseInline(e.tokens),n=e.header?"th":"td";return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${e}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){const a=this.parser.parseInline(n),i=Tn(e);if(i===null)return a;e=i;let o='<a href="'+e+'"';return t&&(o+=' title="'+t+'"'),o+=">"+a+"</a>",o}image({href:e,title:t,text:n}){const a=Tn(e);if(a===null)return n;e=a;let i=`<img src="${e}" alt="${n}"`;return t&&(i+=` title="${t}"`),i+=">",i}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):e.text}}class Ft{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}}class oe{constructor(e){f(this,"options");f(this,"renderer");f(this,"textRenderer");this.options=e||xe,this.options.renderer=this.options.renderer||new lt,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Ft}static parse(e,t){return new oe(t).parse(e)}static parseInline(e,t){return new oe(t).parseInline(e)}parse(e,t=!0){let n="";for(let a=0;a<e.length;a++){const i=e[a];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){const d=i,l=this.options.extensions.renderers[d.type].call({parser:this},d);if(l!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(d.type)){n+=l||"";continue}}const o=i;switch(o.type){case"space":{n+=this.renderer.space(o);continue}case"hr":{n+=this.renderer.hr(o);continue}case"heading":{n+=this.renderer.heading(o);continue}case"code":{n+=this.renderer.code(o);continue}case"table":{n+=this.renderer.table(o);continue}case"blockquote":{n+=this.renderer.blockquote(o);continue}case"list":{n+=this.renderer.list(o);continue}case"html":{n+=this.renderer.html(o);continue}case"paragraph":{n+=this.renderer.paragraph(o);continue}case"text":{let d=o,l=this.renderer.text(d);for(;a+1<e.length&&e[a+1].type==="text";)d=e[++a],l+=`
`+this.renderer.text(d);t?n+=this.renderer.paragraph({type:"paragraph",raw:l,text:l,tokens:[{type:"text",raw:l,text:l}]}):n+=l;continue}default:{const d='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(d),"";throw new Error(d)}}}return n}parseInline(e,t){t=t||this.renderer;let n="";for(let a=0;a<e.length;a++){const i=e[a];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){const d=this.options.extensions.renderers[i.type].call({parser:this},i);if(d!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){n+=d||"";continue}}const o=i;switch(o.type){case"escape":{n+=t.text(o);break}case"html":{n+=t.html(o);break}case"link":{n+=t.link(o);break}case"image":{n+=t.image(o);break}case"strong":{n+=t.strong(o);break}case"em":{n+=t.em(o);break}case"codespan":{n+=t.codespan(o);break}case"br":{n+=t.br(o);break}case"del":{n+=t.del(o);break}case"text":{n+=t.text(o);break}default:{const d='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(d),"";throw new Error(d)}}}return n}}class Fe{constructor(e){f(this,"options");this.options=e||xe}preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}}f(Fe,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens"]));class wi{constructor(...e){Ba(this,he);f(this,"defaults",Pt());f(this,"options",this.setOptions);f(this,"parse",at(this,he,xn).call(this,se.lex,oe.parse));f(this,"parseInline",at(this,he,xn).call(this,se.lexInline,oe.parseInline));f(this,"Parser",oe);f(this,"Renderer",lt);f(this,"TextRenderer",Ft);f(this,"Lexer",se);f(this,"Tokenizer",it);f(this,"Hooks",Fe);this.use(...e)}walkTokens(e,t){let n=[];for(const a of e)switch(n=n.concat(t.call(this,a)),a.type){case"table":{const i=a;for(const o of i.header)n=n.concat(this.walkTokens(o.tokens,t));for(const o of i.rows)for(const d of o)n=n.concat(this.walkTokens(d.tokens,t));break}case"list":{const i=a;n=n.concat(this.walkTokens(i.items,t));break}default:{const i=a;this.defaults.extensions?.childTokens?.[i.type]?this.defaults.extensions.childTokens[i.type].forEach(o=>{const d=i[o].flat(1/0);n=n.concat(this.walkTokens(d,t))}):i.tokens&&(n=n.concat(this.walkTokens(i.tokens,t)))}}return n}use(...e){const t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(n=>{const a={...n};if(a.async=this.defaults.async||a.async||!1,n.extensions&&(n.extensions.forEach(i=>{if(!i.name)throw new Error("extension name required");if("renderer"in i){const o=t.renderers[i.name];o?t.renderers[i.name]=function(...d){let l=i.renderer.apply(this,d);return l===!1&&(l=o.apply(this,d)),l}:t.renderers[i.name]=i.renderer}if("tokenizer"in i){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");const o=t[i.level];o?o.unshift(i.tokenizer):t[i.level]=[i.tokenizer],i.start&&(i.level==="block"?t.startBlock?t.startBlock.push(i.start):t.startBlock=[i.start]:i.level==="inline"&&(t.startInline?t.startInline.push(i.start):t.startInline=[i.start]))}"childTokens"in i&&i.childTokens&&(t.childTokens[i.name]=i.childTokens)}),a.extensions=t),n.renderer){const i=this.defaults.renderer||new lt(this.defaults);for(const o in n.renderer){if(!(o in i))throw new Error(`renderer '${o}' does not exist`);if(["options","parser"].includes(o))continue;const d=o;let l=n.renderer[d];n.useNewRenderer||(l=at(this,he,Ua).call(this,l,d,i));const g=i[d];i[d]=(...c)=>{let u=l.apply(i,c);return u===!1&&(u=g.apply(i,c)),u||""}}a.renderer=i}if(n.tokenizer){const i=this.defaults.tokenizer||new it(this.defaults);for(const o in n.tokenizer){if(!(o in i))throw new Error(`tokenizer '${o}' does not exist`);if(["options","rules","lexer"].includes(o))continue;const d=o,l=n.tokenizer[d],g=i[d];i[d]=(...c)=>{let u=l.apply(i,c);return u===!1&&(u=g.apply(i,c)),u}}a.tokenizer=i}if(n.hooks){const i=this.defaults.hooks||new Fe;for(const o in n.hooks){if(!(o in i))throw new Error(`hook '${o}' does not exist`);if(o==="options")continue;const d=o,l=n.hooks[d],g=i[d];Fe.passThroughHooks.has(o)?i[d]=c=>{if(this.defaults.async)return Promise.resolve(l.call(i,c)).then(m=>g.call(i,m));const u=l.call(i,c);return g.call(i,u)}:i[d]=(...c)=>{let u=l.apply(i,c);return u===!1&&(u=g.apply(i,c)),u}}a.hooks=i}if(n.walkTokens){const i=this.defaults.walkTokens,o=n.walkTokens;a.walkTokens=function(d){let l=[];return l.push(o.call(this,d)),i&&(l=l.concat(i.call(this,d))),l}}this.defaults={...this.defaults,...a}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return se.lex(e,t??this.defaults)}parser(e,t){return oe.parse(e,t??this.defaults)}}he=new WeakSet,Ua=function(e,t,n){switch(t){case"heading":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,n.parser.parseInline(a.tokens),a.depth,Wa(n.parser.parseInline(a.tokens,n.parser.textRenderer)))};case"code":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text,a.lang,!!a.escaped)};case"table":return function(a){if(!a.type||a.type!==t)return e.apply(this,arguments);let i="",o="";for(let l=0;l<a.header.length;l++)o+=this.tablecell({text:a.header[l].text,tokens:a.header[l].tokens,header:!0,align:a.align[l]});i+=this.tablerow({text:o});let d="";for(let l=0;l<a.rows.length;l++){const g=a.rows[l];o="";for(let c=0;c<g.length;c++)o+=this.tablecell({text:g[c].text,tokens:g[c].tokens,header:!1,align:a.align[c]});d+=this.tablerow({text:o})}return e.call(this,i,d)};case"blockquote":return function(a){if(!a.type||a.type!==t)return e.apply(this,arguments);const i=this.parser.parse(a.tokens);return e.call(this,i)};case"list":return function(a){if(!a.type||a.type!==t)return e.apply(this,arguments);const i=a.ordered,o=a.start,d=a.loose;let l="";for(let g=0;g<a.items.length;g++){const c=a.items[g],u=c.checked,m=c.task;let k="";if(c.task){const w=this.checkbox({checked:!!u});d?c.tokens.length>0&&c.tokens[0].type==="paragraph"?(c.tokens[0].text=w+" "+c.tokens[0].text,c.tokens[0].tokens&&c.tokens[0].tokens.length>0&&c.tokens[0].tokens[0].type==="text"&&(c.tokens[0].tokens[0].text=w+" "+c.tokens[0].tokens[0].text)):c.tokens.unshift({type:"text",text:w+" "}):k+=w+" "}k+=this.parser.parse(c.tokens,d),l+=this.listitem({type:"list_item",raw:k,text:k,task:m,checked:!!u,loose:d,tokens:c.tokens})}return e.call(this,l,i,o)};case"html":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text,a.block)};case"paragraph":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"escape":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text)};case"link":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.href,a.title,this.parser.parseInline(a.tokens))};case"image":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.href,a.title,a.text)};case"strong":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"em":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"codespan":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text)};case"del":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(a.tokens))};case"text":return function(a){return!a.type||a.type!==t?e.apply(this,arguments):e.call(this,a.text)}}return e},xn=function(e,t){return(n,a)=>{const i={...a},o={...this.defaults,...i};this.defaults.async===!0&&i.async===!1&&(o.silent||console.warn("marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored."),o.async=!0);const d=at(this,he,Ha).call(this,!!o.silent,!!o.async);if(typeof n>"u"||n===null)return d(new Error("marked(): input parameter is undefined or null"));if(typeof n!="string")return d(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(n)+", string expected"));if(o.hooks&&(o.hooks.options=o),o.async)return Promise.resolve(o.hooks?o.hooks.preprocess(n):n).then(l=>e(l,o)).then(l=>o.hooks?o.hooks.processAllTokens(l):l).then(l=>o.walkTokens?Promise.all(this.walkTokens(l,o.walkTokens)).then(()=>l):l).then(l=>t(l,o)).then(l=>o.hooks?o.hooks.postprocess(l):l).catch(d);try{o.hooks&&(n=o.hooks.preprocess(n));let l=e(n,o);o.hooks&&(l=o.hooks.processAllTokens(l)),o.walkTokens&&this.walkTokens(l,o.walkTokens);let g=t(l,o);return o.hooks&&(g=o.hooks.postprocess(g)),g}catch(l){return d(l)}}},Ha=function(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){const a="<p>An error occurred:</p><pre>"+ee(n.message+"",!0)+"</pre>";return t?Promise.resolve(a):a}if(t)return Promise.reject(n);throw n}};const ye=new wi;function R(s,e){return ye.parse(s,e)}R.options=R.setOptions=function(s){return ye.setOptions(s),R.defaults=ye.defaults,yn(R.defaults),R},R.getDefaults=Pt,R.defaults=xe,R.use=function(...s){return ye.use(...s),R.defaults=ye.defaults,yn(R.defaults),R},R.walkTokens=function(s,e){return ye.walkTokens(s,e)},R.parseInline=ye.parseInline,R.Parser=oe,R.parser=oe.parse,R.Renderer=lt,R.TextRenderer=Ft,R.Lexer=se,R.lexer=se.lex,R.Tokenizer=it,R.Hooks=Fe,R.parse=R,R.options,R.setOptions,R.use,R.walkTokens,R.parseInline,oe.parse,se.lex;/*! @license DOMPurify 3.4.9 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.9/LICENSE */function Pn(s,e){(e==null||e>s.length)&&(e=s.length);for(var t=0,n=Array(e);t<e;t++)n[t]=s[t];return n}function _i(s){if(Array.isArray(s))return s}function vi(s,e){var t=s==null?null:typeof Symbol<"u"&&s[Symbol.iterator]||s["@@iterator"];if(t!=null){var n,a,i,o,d=[],l=!0,g=!1;try{if(i=(t=t.call(s)).next,e!==0)for(;!(l=(n=i.call(t)).done)&&(d.push(n.value),d.length!==e);l=!0);}catch(c){g=!0,a=c}finally{try{if(!l&&t.return!=null&&(o=t.return(),Object(o)!==o))return}finally{if(g)throw a}}return d}}function Ti(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Ei(s,e){return _i(s)||vi(s,e)||Si(s,e)||Ti()}function Si(s,e){if(s){if(typeof s=="string")return Pn(s,e);var t={}.toString.call(s).slice(8,-1);return t==="Object"&&s.constructor&&(t=s.constructor.name),t==="Map"||t==="Set"?Array.from(s):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?Pn(s,e):void 0}}const Mn=Object.entries,zn=Object.setPrototypeOf,Ai=Object.isFrozen,Ci=Object.getPrototypeOf,Ii=Object.getOwnPropertyDescriptor;let Z=Object.freeze,ne=Object.seal,Se=Object.create,$n=typeof Reflect<"u"&&Reflect,qt=$n.apply,jt=$n.construct;Z||(Z=function(e){return e}),ne||(ne=function(e){return e}),qt||(qt=function(e,t){for(var n=arguments.length,a=new Array(n>2?n-2:0),i=2;i<n;i++)a[i-2]=arguments[i];return e.apply(t,a)}),jt||(jt=function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),a=1;a<t;a++)n[a-1]=arguments[a];return new e(...n)});const ue=j(Array.prototype.forEach),Ri=j(Array.prototype.lastIndexOf),Bn=j(Array.prototype.pop),Ae=j(Array.prototype.push),Oi=j(Array.prototype.splice),J=Array.isArray,qe=j(String.prototype.toLowerCase),Gt=j(String.prototype.toString),Un=j(String.prototype.match),Ce=j(String.prototype.replace),Hn=j(String.prototype.indexOf),Di=j(String.prototype.trim),Li=j(Number.prototype.toString),Ni=j(Boolean.prototype.toString),Fn=typeof BigInt>"u"?null:j(BigInt.prototype.toString),qn=typeof Symbol>"u"?null:j(Symbol.prototype.toString),M=j(Object.prototype.hasOwnProperty),je=j(Object.prototype.toString),K=j(RegExp.prototype.test),we=Pi(TypeError);function j(s){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var t=arguments.length,n=new Array(t>1?t-1:0),a=1;a<t;a++)n[a-1]=arguments[a];return qt(s,e,n)}}function Pi(s){return function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return jt(s,t)}}function S(s,e){let t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:qe;if(zn&&zn(s,null),!J(e))return s;let n=e.length;for(;n--;){let a=e[n];if(typeof a=="string"){const i=t(a);i!==a&&(Ai(e)||(e[n]=i),a=i)}s[a]=!0}return s}function Mi(s){for(let e=0;e<s.length;e++)M(s,e)||(s[e]=null);return s}function X(s){const e=Se(null);for(const n of Mn(s)){var t=Ei(n,2);const a=t[0],i=t[1];M(s,a)&&(J(i)?e[a]=Mi(i):i&&typeof i=="object"&&i.constructor===Object?e[a]=X(i):e[a]=i)}return e}function zi(s){switch(typeof s){case"string":return s;case"number":return Li(s);case"boolean":return Ni(s);case"bigint":return Fn?Fn(s):"0";case"symbol":return qn?qn(s):"Symbol()";case"undefined":return je(s);case"function":case"object":{if(s===null)return je(s);const e=s,t=re(e,"toString");if(typeof t=="function"){const n=t(e);return typeof n=="string"?n:je(n)}return je(s)}default:return je(s)}}function re(s,e){for(;s!==null;){const n=Ii(s,e);if(n){if(n.get)return j(n.get);if(typeof n.value=="function")return j(n.value)}s=Ci(s)}function t(){return null}return t}function $i(s){try{return K(s,""),!0}catch{return!1}}const jn=Z(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),Wt=Z(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),Yt=Z(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),Bi=Z(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),Kt=Z(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),Ui=Z(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),Gn=Z(["#text"]),Wn=Z(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),Xt=Z(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),Yn=Z(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),dt=Z(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),Hi=ne(/{{[\w\W]*|^[\w\W]*}}/g),Fi=ne(/<%[\w\W]*|^[\w\W]*%>/g),qi=ne(/\${[\w\W]*/g),ji=ne(/^data-[\-\w.\u00B7-\uFFFF]+$/),Gi=ne(/^aria-[\-\w]+$/),Kn=ne(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),Wi=ne(/^(?:\w+script|data):/i),Yi=ne(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),Ki=ne(/^html$/i),Xi=ne(/^[a-z][.\w]*(-[.\w]+)+$/i),le={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,progressingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},Zi=function(){return typeof window>"u"?null:window},Ji=function(e,t){if(typeof e!="object"||typeof e.createPolicy!="function")return null;let n=null;const a="data-tt-policy-suffix";t&&t.hasAttribute(a)&&(n=t.getAttribute(a));const i="dompurify"+(n?"#"+n:"");try{return e.createPolicy(i,{createHTML(o){return o},createScriptURL(o){return o}})}catch{return console.warn("TrustedTypes policy "+i+" could not be created."),null}},Xn=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function Zn(){let s=arguments.length>0&&arguments[0]!==void 0?arguments[0]:Zi();const e=b=>Zn(b);if(e.version="3.4.9",e.removed=[],!s||!s.document||s.document.nodeType!==le.document||!s.Element)return e.isSupported=!1,e;let t=s.document;const n=t,a=n.currentScript;s.DocumentFragment;const i=s.HTMLTemplateElement,o=s.Node,d=s.Element,l=s.NodeFilter,g=s.NamedNodeMap;g===void 0&&(s.NamedNodeMap||s.MozNamedAttrMap),s.HTMLFormElement;const c=s.DOMParser,u=s.trustedTypes,m=d.prototype,k=re(m,"cloneNode"),w=re(m,"remove"),C=re(m,"nextSibling"),_=re(m,"childNodes"),I=re(m,"parentNode"),O=re(m,"shadowRoot"),v=re(m,"attributes"),x=o&&o.prototype?re(o.prototype,"nodeType"):null,y=o&&o.prototype?re(o.prototype,"nodeName"):null;if(typeof i=="function"){const b=t.createElement("template");b.content&&b.content.ownerDocument&&(t=b.content.ownerDocument)}let N,B="",te,ae=!1,Ve=0;const ua=function(){if(Ve>0)throw we('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')},Oe=function(r){ua(),Ve++;try{return N.createHTML(r)}finally{Ve--}},Ls=function(r){ua(),Ve++;try{return N.createScriptURL(r)}finally{Ve--}},Ns=function(){return ae||(te=Ji(u,a),ae=!0),te},Tt=t,tn=Tt.implementation,ha=Tt.createNodeIterator,Ps=Tt.createDocumentFragment,Ms=Tt.getElementsByTagName,zs=n.importNode;let W=Xn();e.isSupported=typeof Mn=="function"&&typeof I=="function"&&tn&&tn.createHTMLDocument!==void 0;const Et=Hi,St=Fi,At=qi,$s=ji,Bs=Gi,Us=Wi,fa=Yi,Hs=Xi;let ma=Kn,U=null;const nn=S({},[...jn,...Wt,...Yt,...Kt,...Gn]);let H=null;const an=S({},[...Wn,...Xt,...Yn,...dt]);let F=Object.seal(Se(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Qe=null,Ct=null;const me=Object.seal(Se(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let ka=!0,sn=!0,ba=!1,xa=!0,ke=!1,et=!0,Te=!1,on=!1,rn=!1,De=!1,It=!1,Rt=!1,ya=!0,wa=!1;const _a="user-content-";let ln=!0,dn=!1,Le={},ge=null;const cn=S({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]);let va=null;const Ta=S({},["audio","video","img","source","image","track"]);let gn=null;const Ea=S({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Ot="http://www.w3.org/1998/Math/MathML",Dt="http://www.w3.org/2000/svg",pe="http://www.w3.org/1999/xhtml";let Ne=pe,pn=!1,un=null;const Fs=S({},[Ot,Dt,pe],Gt);let hn=S({},["mi","mo","mn","ms","mtext"]),fn=S({},["annotation-xml"]);const qs=S({},["title","style","font","a","script"]);let tt=null;const js=["application/xhtml+xml","text/html"],Gs="text/html";let z=null,Pe=null;const Ws=t.createElement("form"),Sa=function(r){return r instanceof RegExp||r instanceof Function},mn=function(){let r=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(Pe&&Pe===r)return;(!r||typeof r!="object")&&(r={}),r=X(r),tt=js.indexOf(r.PARSER_MEDIA_TYPE)===-1?Gs:r.PARSER_MEDIA_TYPE,z=tt==="application/xhtml+xml"?Gt:qe,U=M(r,"ALLOWED_TAGS")&&J(r.ALLOWED_TAGS)?S({},r.ALLOWED_TAGS,z):nn,H=M(r,"ALLOWED_ATTR")&&J(r.ALLOWED_ATTR)?S({},r.ALLOWED_ATTR,z):an,un=M(r,"ALLOWED_NAMESPACES")&&J(r.ALLOWED_NAMESPACES)?S({},r.ALLOWED_NAMESPACES,Gt):Fs,gn=M(r,"ADD_URI_SAFE_ATTR")&&J(r.ADD_URI_SAFE_ATTR)?S(X(Ea),r.ADD_URI_SAFE_ATTR,z):Ea,va=M(r,"ADD_DATA_URI_TAGS")&&J(r.ADD_DATA_URI_TAGS)?S(X(Ta),r.ADD_DATA_URI_TAGS,z):Ta,ge=M(r,"FORBID_CONTENTS")&&J(r.FORBID_CONTENTS)?S({},r.FORBID_CONTENTS,z):cn,Qe=M(r,"FORBID_TAGS")&&J(r.FORBID_TAGS)?S({},r.FORBID_TAGS,z):X({}),Ct=M(r,"FORBID_ATTR")&&J(r.FORBID_ATTR)?S({},r.FORBID_ATTR,z):X({}),Le=M(r,"USE_PROFILES")?r.USE_PROFILES&&typeof r.USE_PROFILES=="object"?X(r.USE_PROFILES):r.USE_PROFILES:!1,ka=r.ALLOW_ARIA_ATTR!==!1,sn=r.ALLOW_DATA_ATTR!==!1,ba=r.ALLOW_UNKNOWN_PROTOCOLS||!1,xa=r.ALLOW_SELF_CLOSE_IN_ATTR!==!1,ke=r.SAFE_FOR_TEMPLATES||!1,et=r.SAFE_FOR_XML!==!1,Te=r.WHOLE_DOCUMENT||!1,De=r.RETURN_DOM||!1,It=r.RETURN_DOM_FRAGMENT||!1,Rt=r.RETURN_TRUSTED_TYPE||!1,rn=r.FORCE_BODY||!1,ya=r.SANITIZE_DOM!==!1,wa=r.SANITIZE_NAMED_PROPS||!1,ln=r.KEEP_CONTENT!==!1,dn=r.IN_PLACE||!1,ma=$i(r.ALLOWED_URI_REGEXP)?r.ALLOWED_URI_REGEXP:Kn,Ne=typeof r.NAMESPACE=="string"?r.NAMESPACE:pe,hn=M(r,"MATHML_TEXT_INTEGRATION_POINTS")&&r.MATHML_TEXT_INTEGRATION_POINTS&&typeof r.MATHML_TEXT_INTEGRATION_POINTS=="object"?X(r.MATHML_TEXT_INTEGRATION_POINTS):S({},["mi","mo","mn","ms","mtext"]),fn=M(r,"HTML_INTEGRATION_POINTS")&&r.HTML_INTEGRATION_POINTS&&typeof r.HTML_INTEGRATION_POINTS=="object"?X(r.HTML_INTEGRATION_POINTS):S({},["annotation-xml"]);const p=M(r,"CUSTOM_ELEMENT_HANDLING")&&r.CUSTOM_ELEMENT_HANDLING&&typeof r.CUSTOM_ELEMENT_HANDLING=="object"?X(r.CUSTOM_ELEMENT_HANDLING):Se(null);if(F=Se(null),M(p,"tagNameCheck")&&Sa(p.tagNameCheck)&&(F.tagNameCheck=p.tagNameCheck),M(p,"attributeNameCheck")&&Sa(p.attributeNameCheck)&&(F.attributeNameCheck=p.attributeNameCheck),M(p,"allowCustomizedBuiltInElements")&&typeof p.allowCustomizedBuiltInElements=="boolean"&&(F.allowCustomizedBuiltInElements=p.allowCustomizedBuiltInElements),ke&&(sn=!1),It&&(De=!0),Le&&(U=S({},Gn),H=Se(null),Le.html===!0&&(S(U,jn),S(H,Wn)),Le.svg===!0&&(S(U,Wt),S(H,Xt),S(H,dt)),Le.svgFilters===!0&&(S(U,Yt),S(H,Xt),S(H,dt)),Le.mathMl===!0&&(S(U,Kt),S(H,Yn),S(H,dt))),me.tagCheck=null,me.attributeCheck=null,M(r,"ADD_TAGS")&&(typeof r.ADD_TAGS=="function"?me.tagCheck=r.ADD_TAGS:J(r.ADD_TAGS)&&(U===nn&&(U=X(U)),S(U,r.ADD_TAGS,z))),M(r,"ADD_ATTR")&&(typeof r.ADD_ATTR=="function"?me.attributeCheck=r.ADD_ATTR:J(r.ADD_ATTR)&&(H===an&&(H=X(H)),S(H,r.ADD_ATTR,z))),M(r,"ADD_URI_SAFE_ATTR")&&J(r.ADD_URI_SAFE_ATTR)&&S(gn,r.ADD_URI_SAFE_ATTR,z),M(r,"FORBID_CONTENTS")&&J(r.FORBID_CONTENTS)&&(ge===cn&&(ge=X(ge)),S(ge,r.FORBID_CONTENTS,z)),M(r,"ADD_FORBID_CONTENTS")&&J(r.ADD_FORBID_CONTENTS)&&(ge===cn&&(ge=X(ge)),S(ge,r.ADD_FORBID_CONTENTS,z)),ln&&(U["#text"]=!0),Te&&S(U,["html","head","body"]),U.table&&(S(U,["tbody"]),delete Qe.tbody),r.TRUSTED_TYPES_POLICY){if(typeof r.TRUSTED_TYPES_POLICY.createHTML!="function")throw we('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof r.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw we('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');const h=N;N=r.TRUSTED_TYPES_POLICY;try{B=Oe("")}catch(T){throw N=h,T}}else r.TRUSTED_TYPES_POLICY===null?(N=void 0,B=""):(N===void 0&&(N=Ns()),N&&typeof B=="string"&&(B=Oe("")));(W.uponSanitizeElement.length>0||W.uponSanitizeAttribute.length>0)&&U===nn&&(U=X(U)),W.uponSanitizeAttribute.length>0&&H===an&&(H=X(H)),Z&&Z(r),Pe=r},Aa=S({},[...Wt,...Yt,...Bi]),Ca=S({},[...Kt,...Ui]),Ys=function(r){let p=I(r);(!p||!p.tagName)&&(p={namespaceURI:Ne,tagName:"template"});const h=qe(r.tagName),T=qe(p.tagName);return un[r.namespaceURI]?r.namespaceURI===Dt?p.namespaceURI===pe?h==="svg":p.namespaceURI===Ot?h==="svg"&&(T==="annotation-xml"||hn[T]):!!Aa[h]:r.namespaceURI===Ot?p.namespaceURI===pe?h==="math":p.namespaceURI===Dt?h==="math"&&fn[T]:!!Ca[h]:r.namespaceURI===pe?p.namespaceURI===Dt&&!fn[T]||p.namespaceURI===Ot&&!hn[T]?!1:!Ca[h]&&(qs[h]||!Aa[h]):!!(tt==="application/xhtml+xml"&&un[r.namespaceURI]):!1},ie=function(r){Ae(e.removed,{element:r});try{I(r).removeChild(r)}catch{if(w(r),!I(r))throw we("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")}},Ia=function(r){const p=_?_(r):r.childNodes;if(p){const T=[];ue(p,E=>{Ae(T,E)}),ue(T,E=>{try{w(E)}catch{}})}const h=v?v(r):null;if(h)for(let T=h.length-1;T>=0;--T){const E=h[T],A=E&&E.name;if(typeof A=="string")try{r.removeAttribute(A)}catch{}}},Ee=function(r,p){try{Ae(e.removed,{attribute:p.getAttributeNode(r),from:p})}catch{Ae(e.removed,{attribute:null,from:p})}if(p.removeAttribute(r),r==="is")if(De||It)try{ie(p)}catch{}else try{p.setAttribute(r,"")}catch{}},Ks=function(r){const p=v?v(r):r.attributes;if(p)for(let h=p.length-1;h>=0;--h){const T=p[h],E=T&&T.name;if(!(typeof E!="string"||H[z(E)]))try{r.removeAttribute(E)}catch{}}},Xs=function(r){const p=[r];for(;p.length>0;){const h=p.pop();(x?x(h):h.nodeType)===le.element&&Ks(h);const E=_?_(h):h.childNodes;if(E)for(let A=E.length-1;A>=0;--A)p.push(E[A])}},Ra=function(r){let p=null,h=null;if(rn)r="<remove></remove>"+r;else{const A=Un(r,/^[\r\n\t ]+/);h=A&&A[0]}tt==="application/xhtml+xml"&&Ne===pe&&(r='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+r+"</body></html>");const T=N?Oe(r):r;if(Ne===pe)try{p=new c().parseFromString(T,tt)}catch{}if(!p||!p.documentElement){p=tn.createDocument(Ne,"template",null);try{p.documentElement.innerHTML=pn?B:T}catch{}}const E=p.body||p.documentElement;return r&&h&&E.insertBefore(t.createTextNode(h),E.childNodes[0]||null),Ne===pe?Ms.call(p,Te?"html":"body")[0]:Te?p.documentElement:E},Oa=function(r){return ha.call(r.ownerDocument||r,r,l.SHOW_ELEMENT|l.SHOW_COMMENT|l.SHOW_TEXT|l.SHOW_PROCESSING_INSTRUCTION|l.SHOW_CDATA_SECTION,null)},kn=function(r){var p,h;r.normalize();const T=ha.call(r.ownerDocument||r,r,l.SHOW_TEXT|l.SHOW_COMMENT|l.SHOW_CDATA_SECTION|l.SHOW_PROCESSING_INSTRUCTION,null);let E=T.nextNode();for(;E;){let G=E.data;ue([Et,St,At],L=>{G=Ce(G,L," ")}),E.data=G,E=T.nextNode()}const A=(p=(h=r.querySelectorAll)===null||h===void 0?void 0:h.call(r,"template"))!==null&&p!==void 0?p:[];ue(Array.from(A),G=>{Me(G.content)&&kn(G.content)})},Lt=function(r){const p=y?y(r):null;return typeof p!="string"||z(p)!=="form"?!1:typeof r.nodeName!="string"||typeof r.textContent!="string"||typeof r.removeChild!="function"||r.attributes!==v(r)||typeof r.removeAttribute!="function"||typeof r.setAttribute!="function"||typeof r.namespaceURI!="string"||typeof r.insertBefore!="function"||typeof r.hasChildNodes!="function"||r.nodeType!==x(r)||r.childNodes!==_(r)},Me=function(r){if(!x||typeof r!="object"||r===null)return!1;try{return x(r)===le.documentFragment}catch{return!1}},nt=function(r){if(!x||typeof r!="object"||r===null)return!1;try{return typeof x(r)=="number"}catch{return!1}};function fe(b,r,p){ue(b,h=>{h.call(e,r,p,Pe)})}const Da=function(r){let p=null;if(fe(W.beforeSanitizeElements,r,null),Lt(r))return ie(r),!0;const h=z(y?y(r):r.nodeName);if(fe(W.uponSanitizeElement,r,{tagName:h,allowedTags:U}),et&&r.hasChildNodes()&&!nt(r.firstElementChild)&&K(/<[/\w!]/g,r.innerHTML)&&K(/<[/\w!]/g,r.textContent)||et&&r.namespaceURI===pe&&h==="style"&&nt(r.firstElementChild)||r.nodeType===le.progressingInstruction||et&&r.nodeType===le.comment&&K(/<[/\w]/g,r.data))return ie(r),!0;if(Qe[h]||!(me.tagCheck instanceof Function&&me.tagCheck(h))&&!U[h]){if(!Qe[h]&&Na(h)&&(F.tagNameCheck instanceof RegExp&&K(F.tagNameCheck,h)||F.tagNameCheck instanceof Function&&F.tagNameCheck(h)))return!1;if(ln&&!ge[h]){const E=I(r),A=_(r);if(A&&E){const G=A.length;for(let L=G-1;L>=0;--L){const q=dn?A[L]:k(A[L],!0);E.insertBefore(q,C(r))}}}return ie(r),!0}return(x?x(r):r.nodeType)===le.element&&!Ys(r)||(h==="noscript"||h==="noembed"||h==="noframes")&&K(/<\/no(script|embed|frames)/i,r.innerHTML)?(ie(r),!0):(ke&&r.nodeType===le.text&&(p=r.textContent,ue([Et,St,At],E=>{p=Ce(p,E," ")}),r.textContent!==p&&(Ae(e.removed,{element:r.cloneNode()}),r.textContent=p)),fe(W.afterSanitizeElements,r,null),!1)},La=function(r,p,h){if(Ct[p]||ya&&(p==="id"||p==="name")&&(h in t||h in Ws))return!1;const T=H[p]||me.attributeCheck instanceof Function&&me.attributeCheck(p,r);if(!(sn&&!Ct[p]&&K($s,p))){if(!(ka&&K(Bs,p))){if(!T||Ct[p]){if(!(Na(r)&&(F.tagNameCheck instanceof RegExp&&K(F.tagNameCheck,r)||F.tagNameCheck instanceof Function&&F.tagNameCheck(r))&&(F.attributeNameCheck instanceof RegExp&&K(F.attributeNameCheck,p)||F.attributeNameCheck instanceof Function&&F.attributeNameCheck(p,r))||p==="is"&&F.allowCustomizedBuiltInElements&&(F.tagNameCheck instanceof RegExp&&K(F.tagNameCheck,h)||F.tagNameCheck instanceof Function&&F.tagNameCheck(h))))return!1}else if(!gn[p]){if(!K(ma,Ce(h,fa,""))){if(!((p==="src"||p==="xlink:href"||p==="href")&&r!=="script"&&Hn(h,"data:")===0&&va[r])){if(!(ba&&!K(Us,Ce(h,fa,"")))){if(h)return!1}}}}}}return!0},Zs=S({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),Na=function(r){return!Zs[qe(r)]&&K(Hs,r)},Pa=function(r){fe(W.beforeSanitizeAttributes,r,null);const p=r.attributes;if(!p||Lt(r))return;const h={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:H,forceKeepAttr:void 0};let T=p.length;for(;T--;){const E=p[T],A=E.name,G=E.namespaceURI,L=E.value,q=z(A),be=L;let Y=A==="value"?be:Di(be);if(h.attrName=q,h.attrValue=Y,h.keepAttr=!0,h.forceKeepAttr=void 0,fe(W.uponSanitizeAttribute,r,h),Y=h.attrValue,wa&&(q==="id"||q==="name")&&Hn(Y,_a)!==0&&(Ee(A,r),Y=_a+Y),et&&K(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,Y)){Ee(A,r);continue}if(q==="attributename"&&Un(Y,"href")){Ee(A,r);continue}if(h.forceKeepAttr)continue;if(!h.keepAttr){Ee(A,r);continue}if(!xa&&K(/\/>/i,Y)){Ee(A,r);continue}ke&&ue([Et,St,At],za=>{Y=Ce(Y,za," ")});const Ma=z(r.nodeName);if(!La(Ma,q,Y)){Ee(A,r);continue}if(N&&typeof u=="object"&&typeof u.getAttributeType=="function"&&!G)switch(u.getAttributeType(Ma,q)){case"TrustedHTML":{Y=Oe(Y);break}case"TrustedScriptURL":{Y=Ls(Y);break}}if(Y!==be)try{G?r.setAttributeNS(G,A,Y):r.setAttribute(A,Y),Lt(r)?ie(r):Bn(e.removed)}catch{Ee(A,r)}}fe(W.afterSanitizeAttributes,r,null)},Nt=function(r){let p=null;const h=Oa(r);for(fe(W.beforeSanitizeShadowDOM,r,null);p=h.nextNode();)if(fe(W.uponSanitizeShadowNode,p,null),Da(p),Pa(p),Me(p.content)&&Nt(p.content),(x?x(p):p.nodeType)===le.element){const E=O?O(p):p.shadowRoot;Me(E)&&(bn(E),Nt(E))}fe(W.afterSanitizeShadowDOM,r,null)},bn=function(r){const p=[{node:r,shadow:null}];for(;p.length>0;){const h=p.pop();if(h.shadow){Nt(h.shadow);continue}const T=h.node,A=(x?x(T):T.nodeType)===le.element,G=_?_(T):T.childNodes;if(G)for(let L=G.length-1;L>=0;--L)p.push({node:G[L],shadow:null});if(A){const L=y?y(T):null;if(typeof L=="string"&&z(L)==="template"){const q=T.content;Me(q)&&p.push({node:q,shadow:null})}}if(A){const L=O?O(T):T.shadowRoot;Me(L)&&p.push({node:null,shadow:L},{node:L,shadow:null})}}};return e.sanitize=function(b){let r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},p=null,h=null,T=null,E=null;if(pn=!b,pn&&(b="<!-->"),typeof b!="string"&&!nt(b)&&(b=zi(b),typeof b!="string"))throw we("dirty is not a string, aborting");if(!e.isSupported)return b;on||mn(r),e.removed=[];const A=dn&&typeof b!="string"&&nt(b);if(A){const q=y?y(b):b.nodeName;if(typeof q=="string"){const be=z(q);if(!U[be]||Qe[be])throw we("root node is forbidden and cannot be sanitized in-place")}if(Lt(b))throw we("root node is clobbered and cannot be sanitized in-place");try{bn(b)}catch(be){throw Ia(b),be}}else if(nt(b))p=Ra("<!---->"),h=p.ownerDocument.importNode(b,!0),h.nodeType===le.element&&h.nodeName==="BODY"||h.nodeName==="HTML"?p=h:p.appendChild(h),bn(h);else{if(!De&&!ke&&!Te&&b.indexOf("<")===-1)return N&&Rt?Oe(b):b;if(p=Ra(b),!p)return De?null:Rt?B:""}p&&rn&&ie(p.firstChild);const G=Oa(A?b:p);try{for(;T=G.nextNode();)Da(T),Pa(T),Me(T.content)&&Nt(T.content)}catch(q){throw A&&Ia(b),q}if(A)return ue(e.removed,q=>{q.element&&Xs(q.element)}),ke&&kn(b),b;if(De){if(ke&&kn(p),It)for(E=Ps.call(p.ownerDocument);p.firstChild;)E.appendChild(p.firstChild);else E=p;return(H.shadowroot||H.shadowrootmode)&&(E=zs.call(n,E,!0)),E}let L=Te?p.outerHTML:p.innerHTML;return Te&&U["!doctype"]&&p.ownerDocument&&p.ownerDocument.doctype&&p.ownerDocument.doctype.name&&K(Ki,p.ownerDocument.doctype.name)&&(L="<!DOCTYPE "+p.ownerDocument.doctype.name+`>
`+L),ke&&ue([Et,St,At],q=>{L=Ce(L,q," ")}),N&&Rt?Oe(L):L},e.setConfig=function(){let b=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};mn(b),on=!0},e.clearConfig=function(){Pe=null,on=!1,N=te,B=""},e.isValidAttribute=function(b,r,p){Pe||mn({});const h=z(b),T=z(r);return La(h,T,p)},e.addHook=function(b,r){typeof r=="function"&&Ae(W[b],r)},e.removeHook=function(b,r){if(r!==void 0){const p=Ri(W[b],r);return p===-1?void 0:Oi(W[b],p,1)[0]}return Bn(W[b])},e.removeHooks=function(b){W[b]=[]},e.removeAllHooks=function(){W=Xn()},e}var Vi=Zn();let Jn=!1;function Qi(){Jn||(Jn=!0,R.setOptions({gfm:!0,breaks:!0}))}function es(s){return String(s).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function ts(s){let e=Vi.sanitize(s,{ADD_ATTR:["target","rel"]});return e=e.replace(/<a\s+([^>]*?)>/gi,(t,n)=>(/\btarget\s*=/i.test(n)||(n+=' target="_blank"'),/\brel\s*=/i.test(n)||(n+=' rel="noopener noreferrer"'),"<a "+n+">")),e}function ct(s){if(!s)return"";try{Qi();const e=R.parse(s,{async:!1});return ts(e)}catch(e){return console.warn("[AIAgent SDK] marked parse failed, fallback:",e),ns(s)}}function ns(s){let e=es(s);return e=e.replace(/`([^`\n]+)`/g,"<code>$1</code>"),e=e.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\n/g,"<br/>"),e}function gt(s){if(!s)return;const e=s.querySelectorAll("img");for(let t=0;t<e.length;t++){const n=e[t];if(n.dataset.aiagentDecorated==="1")continue;n.dataset.aiagentDecorated="1",n.setAttribute("loading","lazy"),n.classList.add("aiagent-sdk-img-loading");const a=()=>{n.classList.remove("aiagent-sdk-img-loading"),n.classList.add("aiagent-sdk-img-loaded")};n.complete&&n.naturalWidth>0?a():(n.addEventListener("load",a,{once:!0}),n.addEventListener("error",a,{once:!0}))}}const pt=`
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
`,as=`
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
`,Vn={cornerGlow:!0,statusDotStyle:"rainbow",sendIcon:"svg",messageEnter:"paint",bubbleAnimation:"rotate",fontStack:"mixed"};function ut(s){return{...Vn,...s}}function Qn(s,e){return{...s,...e,layout:ut({...s.layout,...e.layout})}}const _e={name:"iridescent-bloom",css:pt,palette:"ink",aiHint:"深色油彩画布 + 4 角油彩飞溅 + 虹彩动画 + 毛玻璃。视觉强烈,默认皮肤。",layout:{cornerGlow:!0,statusDotStyle:"rainbow",sendIcon:"svg",messageEnter:"paint",bubbleAnimation:"rotate",fontStack:"mixed"}},ht={name:"classic",css:as,aiHint:"浅灰白底 + 蓝色强调 + 系统字体 + 无装饰动画。商务/简洁风格,亮色环境。",layout:{cornerGlow:!1,statusDotStyle:"pulse",sendIcon:"arrow",messageEnter:"fade",bubbleAnimation:"none",fontStack:"system"}},Zt=Qn(_e,{name:"aurora",css:pt+`
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
`,layout:{fontStack:"serif"},aiHint:"极光绿/青/紫 + 衬线字体 + 4 角油彩 + 深绿底。夜读/文艺风格。"}),ve=class ve{constructor(){f(this,"_skins",new Map);this._skins.set(_e.name,_e),this._skins.set(ht.name,ht),this._skins.set(Zt.name,Zt)}static instance(){return ve._instance||(ve._instance=new ve),ve._instance}register(e){if(!e||!e.name||!e.css)throw new Error("[AIAgent SDK] SkinRegistry.register: invalid skin");this._skins.set(e.name,{...e,layout:ut(e.layout)})}get(e){return this._skins.get(e)||_e}has(e){return this._skins.has(e)}list(){return Array.from(this._skins.keys())}listWithInfo(){return Array.from(this._skins.values()).map(e=>({name:e.name,aiHint:e.aiHint||"no description"}))}remove(e){return e===_e.name||e===ht.name?(console.warn("[AIAgent SDK] cannot remove built-in skin:",e),!1):this._skins.delete(e)}};f(ve,"_instance",null);let V=ve;function is(s){return _e}function ft(s,e,t,n){const a=document.createElement("div");a.className="aiagent-sdk-tool-card",a.setAttribute("role","status"),a.setAttribute("data-tool",e);const i=document.createElement("div");i.className="aiagent-sdk-tool-head";const o=document.createElement("span");o.className="aiagent-sdk-tool-arrow",o.textContent="▸";const d=document.createElement("span");d.className="aiagent-sdk-tool-name",d.textContent=e;const l=document.createElement("span");l.className="aiagent-sdk-tool-dot",i.appendChild(o),i.appendChild(d),i.appendChild(l);const g=document.createElement("pre");g.className="aiagent-sdk-tool-body",g.innerHTML=ea(JSON.stringify(t,null,2)||"{}");const c=document.createElement("div");c.className="aiagent-sdk-tool-progress";const u=document.createElement("div");u.className="aiagent-sdk-tool-bar",u.style.setProperty("--p","0%");const m=document.createElement("span");return m.className="aiagent-sdk-tool-status",m.textContent="调用中…",c.appendChild(u),c.appendChild(m),a.appendChild(i),a.appendChild(g),a.appendChild(c),n&&n.parentNode===s?s.insertBefore(a,n):s.appendChild(a),s.scrollTop=s.scrollHeight,a}function Jt(s,e,t){if(s&&t){const n=s.querySelector(".aiagent-sdk-tool-status");n&&(n.textContent=t)}}function Ge(s,e="✓ 完成"){if(!s)return;s.classList.add("aiagent-sdk-tool-success"),s.classList.contains("aiagent-sdk-tool-card--pending")&&(s.classList.add("aiagent-sdk-tool-confirmed"),s.classList.remove("aiagent-sdk-tool-card--pending"));const t=s.querySelector(".aiagent-sdk-tool-status");t&&(t.textContent=e)}function mt(s,e="✕ 失败"){if(!s)return;s.classList.add("aiagent-sdk-tool-error"),s.style.borderLeftColor="var(--aia-error)";const t=s.querySelector(".aiagent-sdk-tool-status");t&&(t.textContent=e)}function ea(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,(t,n,a,i,o)=>n?a?`<span class="k">${n}</span>${a}`:`<span class="s">${n}</span>`:i?`<span class="k">${i}</span>`:o?`<span class="n">${o}</span>`:t)}function ta(s){const e=document.createElement("div");e.className="aiagent-sdk-thinking-card",e.setAttribute("role","status"),e.setAttribute("aria-label","AI 思考中");const t=document.createElement("div");t.className="aiagent-sdk-thinking-head";const n=document.createElement("span");n.className="aiagent-sdk-thinking-dot",n.setAttribute("aria-hidden","true");const a=document.createElement("span");a.className="aiagent-sdk-thinking-label",a.textContent="思考中…";const i=document.createElement("button");i.className="aiagent-sdk-thinking-toggle",i.textContent="展开",i.addEventListener("click",d=>{d.stopPropagation();const l=e.classList.toggle("aiagent-sdk-thinking-expanded");i.textContent=l?"收起":"展开"}),t.appendChild(n),t.appendChild(a),t.appendChild(i);const o=document.createElement("pre");return o.className="aiagent-sdk-thinking-body",e.appendChild(t),e.appendChild(o),s.appendChild(e),s.scrollTop=s.scrollHeight,e}function ss(s,e){if(!s)return;const t=s.querySelector(".aiagent-sdk-thinking-body");t&&(t.innerHTML=ct(e||""),gt(t),t.scrollTop=t.scrollHeight)}function Ie(s){if(!s||s.classList.contains("aiagent-sdk-thinking-done"))return;s.classList.add("aiagent-sdk-thinking-done");const e=s.querySelector(".aiagent-sdk-thinking-label");e&&(e.textContent="✓ 思考完成"),s.classList.remove("aiagent-sdk-thinking-expanded");const t=s.querySelector(".aiagent-sdk-thinking-toggle");t&&(t.textContent="展开")}function Vt(s,e,t,n){const a=document.createElement("div");a.className="aiagent-sdk-tool-card aiagent-sdk-tool-card--delta",a.setAttribute("role","status"),a.setAttribute("data-tool",t||"..."),a.setAttribute("data-tool-id",e||"");const i=document.createElement("div");i.className="aiagent-sdk-tool-head";const o=document.createElement("span");o.className="aiagent-sdk-tool-dot",o.setAttribute("aria-hidden","true");const d=document.createElement("span");d.className="aiagent-sdk-tool-name",d.textContent=t||"加载工具…";const l=document.createElement("span");l.className="aiagent-sdk-tool-status",l.textContent="加载参数…";const g=document.createElement("button");g.className="aiagent-sdk-tool-toggle",g.textContent="展开",g.addEventListener("click",u=>{u.stopPropagation();const m=a.classList.toggle("aiagent-sdk-tool-expanded");g.textContent=m?"收起":"展开"}),i.appendChild(o),i.appendChild(d),i.appendChild(l),i.appendChild(g);const c=document.createElement("pre");return c.className="aiagent-sdk-tool-body",c.textContent="",a.appendChild(i),a.appendChild(c),n&&n.parentNode===s?s.insertBefore(a,n):s.appendChild(a),s.scrollTop=s.scrollHeight,a}function na(s,e){if(!s)return;const t=s.querySelector(".aiagent-sdk-tool-body");if(!t)return;t.textContent=(t.textContent||"")+(e||"");const n=s.parentElement;n&&(n.scrollTop=n.scrollHeight)}function kt(s,e,t){if(!s)return;s.classList.remove("aiagent-sdk-tool-card--delta"),s.classList.add("aiagent-sdk-tool-card--pending"),s.setAttribute("data-tool",t||"");const n=s.querySelector(".aiagent-sdk-tool-name");n&&(n.textContent=t||"tool");const a=s.querySelector(".aiagent-sdk-tool-status");a&&(a.textContent="等待执行");const i=s.querySelector(".aiagent-sdk-tool-body");i&&(i.innerHTML=ea(JSON.stringify(e||{},null,2)))}function os(s){return new Promise(e=>{if(!s){e(!1);return}const t=s.querySelector(".aiagent-sdk-tool-head");if(!t){e(!1);return}const n=t.querySelector(".aiagent-sdk-tool-toggle");n&&n.remove();const a=t.querySelector(".aiagent-sdk-tool-status");a&&(a.textContent="⏸ 等待确认");const i=document.createElement("button");i.className="aiagent-sdk-tool-confirm-btn",i.textContent="✓ 确认";const o=document.createElement("button");o.className="aiagent-sdk-tool-cancel-btn",o.textContent="✕ 取消",t.appendChild(i),t.appendChild(o);let d=!1;const l=g=>{d||(d=!0,i.remove(),o.remove(),e(g))};i.addEventListener("click",g=>{g.stopPropagation(),s.classList.add("aiagent-sdk-tool-confirmed");const c=t.querySelector(".aiagent-sdk-tool-status");c&&(c.textContent="✓ 已确认"),l(!0)}),o.addEventListener("click",g=>{g.stopPropagation(),s.classList.add("aiagent-sdk-tool-cancelled");const c=t.querySelector(".aiagent-sdk-tool-status");c&&(c.textContent="✕ 已取消"),l(!1)})})}function rs(s){return String(s).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function ls(s,e,t=0,n){const a=document.createElement("div");return a.style.setProperty("--i",String(t)),s==="user"?(a.className="aiagent-sdk-msg aiagent-sdk-msg-user",a.innerHTML=rs(e||"")):s==="assistant"?(a.className="aiagent-sdk-msg aiagent-sdk-msg-assistant",a.innerHTML=ct(e||""),gt(a)):s==="tool"?(a.className="aiagent-sdk-msg aiagent-sdk-msg-tool",n&&ft(a,n.tool,n.args||{})):(a.className="aiagent-sdk-msg aiagent-sdk-msg-system",a.textContent=e||""),a}function aa(s,e,t,n=0,a){const i=ls(e,t,n,a);s.appendChild(i),s.scrollTop=s.scrollHeight}const ia=["#5eead4","#a78bfa","#f0abfc","#93c5fd","#fcd34d"];function ds(){const s=document.createElement("div");s.className="aiagent-sdk-msg aiagent-sdk-msg-assistant aiagent-sdk-typing-pending";for(let e=0;e<5;e++){const t=document.createElement("span");t.className="aia-p",t.style.setProperty("--c",ia[e%ia.length]),e>0&&t.style.setProperty("--d",e*.2+"s"),s.appendChild(t)}return s}function bt(s){const e=ds();return s.appendChild(e),s.scrollTop=s.scrollHeight,e}function sa(s){s&&(s.classList.remove("aiagent-sdk-typing-pending"),s.innerHTML="")}function cs(s){s&&s.classList.add("aiagent-sdk-typing-active")}function xt(s){s&&s.classList.remove("aiagent-sdk-typing-active")}function We(s){return s==null?!0:typeof s=="string"?s.trim()==="":Array.isArray(s)?s.length===0:!1}function Ye(s,e){return s[e]}function gs(s){return s instanceof RegExp?s:new RegExp(s)}function ps(s,e){const t=[],n=[];let a=0;for(const i of s){const o=i.severity||"error",d=o==="error"?t:n;let l=null;if(i.required&&!l&&We(Ye(e,i.required))&&(l={field:i.required,message:i.message}),i.pattern&&!l){const g=Ye(e,i.pattern.field);We(g)||gs(i.pattern.regex).test(String(g))||(l={field:i.pattern.field,message:i.pattern.message||i.message})}if(i.range&&!l){const g=Ye(e,i.range.field);if(!We(g)){const c=Number(g);if(Number.isFinite(c)){const u=i.range.min!==void 0&&c<i.range.min,m=i.range.max!==void 0&&c>i.range.max;(u||m)&&(l={field:i.range.field,message:i.range.message||i.message})}}}if(i.enum&&!l){const g=Ye(e,i.enum.field);!We(g)&&i.enum.values.indexOf(g)<0&&(l={field:i.enum.field,message:i.enum.message||i.message})}if(i.condition&&!l){let g=!1;try{g=i.condition.when(e)}catch{g=!1}if(g){if(i.condition.requires&&i.condition.requires.length>0){const c=i.condition.requires.filter(u=>We(Ye(e,u)));c.length>0&&(l={field:c[0],message:i.message})}if(!l&&i.condition.check){let c=!1;try{c=i.condition.check(e)}catch(u){c=u.message||"check 执行异常"}c!==!0&&(l={message:typeof c=="string"&&c?c:i.message})}}}l?d.push({ruleId:i.id,field:l.field,message:l.message,severity:o}):a++}return{valid:t.length===0,errors:t,warnings:n,passedCount:a}}function us(s){const e=s.toolName||"validate_form",t=s.fieldLabels||{},n=s.rules||[],a=new Set;for(const d of n)if(d.required&&a.add(d.required),d.pattern?.field&&a.add(d.pattern.field),d.range?.field&&a.add(d.range.field),d.enum?.field&&a.add(d.enum.field),d.condition?.requires)for(const l of d.condition.requires)a.add(l);const i={};a.forEach(d=>{i[d]={type:"string",description:t[d]||d}});const o=`校验表单数据。在调用 submit_form 之前必须调用本工具,确保数据合法。
传入所有已收集的字段(放在 formData 对象里),返回校验结果:
  - valid=true → 可调 submit_form 提交
  - valid=false → errors 数组列出问题字段和原因,请补全或修正后重试
  - warnings 不阻断提交但建议告知用户
`+(s.descriptionSuffix?`
`+s.descriptionSuffix:"");return{name:e,description:o,parameters:{type:"object",properties:{formData:{type:"object",description:"待校验的表单数据(字段名 → 值)",properties:i,additionalProperties:!0}},required:["formData"]},strict:!1,onCall:d=>{const l=d.formData||{},g=ps(n,l),c=k=>k?t[k]||k:void 0;if(g.valid&&g.warnings.length===0)return{ok:!0,valid:!0,errors:[],warnings:[],passedCount:g.passedCount,message:`校验通过,共 ${g.passedCount} 条规则全部命中,可以提交。`};const u=g.errors.map(k=>`  - [${c(k.field)||k.ruleId}] ${k.message}`),m=g.warnings.map(k=>`  - [警告:${c(k.field)||k.ruleId}] ${k.message}`);return{ok:g.valid,valid:g.valid,passedCount:g.passedCount,errors:g.errors.map(k=>({...k,fieldLabel:c(k.field)})),warnings:g.warnings.map(k=>({...k,fieldLabel:c(k.field)})),message:(g.valid?"校验通过但有警告。":"校验失败,请修正以下问题:")+`
`+u.concat(m).join(`
`)}}}}class hs{constructor(){f(this,"_tools",new Map)}register(e,t){const n=this._tools.get(e)||new Map,a=[];for(const i of t){const o={description:i.description||"",parameters:i.parameters||{type:"object",properties:{}},strict:i.strict!==!1,onCall:typeof i.onCall=="function"?i.onCall:null};n.set(i.name,o),a.push({name:i.name,description:o.description,parameters:o.parameters,strict:o.strict})}return this._tools.set(e,n),a}unregister(e,t){const n=this._tools.get(e);if(n){if(!t||!t.length){n.clear(),this._tools.delete(e);return}for(const a of t)n.delete(a);n.size===0&&this._tools.delete(e)}}get(e,t){const n=this._tools.get(e);return n&&n.get(t)||null}}async function fs(s,e,t,n){const a=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/register",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({tools:n})});if(!a.ok){const i=await a.text();throw new Error("register failed: "+a.status+" "+i)}return await a.json()}async function ms(s,e,t,n){const a=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/append",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({tools:n})});if(!a.ok){const i=await a.text();throw new Error("append failed: "+a.status+" "+i)}return await a.json()}async function oa(s,e,t,n){const a=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/unregister",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({names:n})});if(!a.ok)throw new Error("unregister failed: "+a.status);return await a.json()}async function ks(s,e,t){const n=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools",{method:"GET",headers:{Authorization:"Bearer "+e}});if(!n.ok)throw new Error("list failed: "+n.status);return await n.json()}async function yt(s,e,t){if(t){try{await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/abort",{method:"POST",headers:{Authorization:"Bearer "+e}})}catch(n){console.warn("[AIAgent SDK] abort failed:",n.message)}try{sessionStorage.removeItem("pending:"+t)}catch{}}}function bs(s){const e=s.dictTypes||[],t=s.dictTypeLabels||{},n=s.cascades||[],a=e.map(o=>{const d=t[o]||o;return`  - \`${o}\`: ${d}`}).join(`
`);let i="";return n.length>0&&(i=`

级联规则:
`+n.map(o=>{const d=o.parentLabel||t[o.parentType]||o.parentType,l=o.childLabel||t[o.childType]||o.childType;return`  - ${o.childType}(${l}) 需先查 ${o.parentType}(${d}) 获得编码,再通过parentCode传入`}).join(`
`)),{name:"query_dict",description:`查字典,将中文名转系统编码。需编码时先调本工具。
字典类型:
${a}
匹配方式:exact(精确)/contains(近似)/bigram(模糊,需确认)`+i,parameters:{type:"object",properties:{dictType:{type:"string",enum:e,description:"字典类型"},keyword:{type:"string",description:'搜索关键词,如城市名"北京"、产品名"华为"'},parentCode:{type:"string",description:"父级编码(级联字典必填)。查子字典时传父字典编码限定范围,如查设备型号时传设备类型编码。"},limit:{type:"number",description:"返回条数上限,默认5"}},required:["dictType","keyword"]},strict:!1,onCall:async o=>{const d=o.dictType||"",l=o.keyword||"",g=o.parentCode||"",c=o.limit||5;if(!d||!l)return{ok:!1,error:"dictType and keyword are required"};let m=(s.endpoint||"")+"/dict/"+encodeURIComponent(d)+"/query?keyword="+encodeURIComponent(l)+"&limit="+c;g&&(m+="&parentCode="+encodeURIComponent(g));try{const k=await fetch(m,{headers:{Accept:"application/json"}});if(!k.ok)return{ok:!1,error:"HTTP "+k.status,message:"字典查询失败"};const w=await k.json();if(!w||w.length===0)return{ok:!0,items:[],message:"未找到匹配项。请尝试:更换关键词、使用全称或简称、检查字典类型是否正确。"+(g?" 当前 parentCode="+g:"")};const C=w.map(_=>{let I="";_.matchType==="exact"||_.score>=.9?I="[精确]":_.matchType==="contains"||_.matchType==="suffix_stripped"||_.matchType==="alias"?I="[近似]":I="[模糊,请确认]";const O=_.parent?` (父级:${_.parent})`:"";return`${_.code} → ${_.name}${O} ${I}`}).join(`
`);return{ok:!0,items:w.map(_=>({code:_.code,name:_.name,matchType:_.matchType,score:_.score,parent:_.parent})),formatted:C,message:C}}catch(k){return{ok:!1,error:k.message,message:"字典查询异常"}}}}}function xs(s){return{name:"change_skin",description:`切换 AI 助手浮窗的皮肤。\`name\` 字段可传:
  - 具体皮肤名(见下方列表)
  - \`"next"\` 切到下一个(在已注册皮肤列表中循环)
  - \`"prev"\` 切到上一个
  - \`"random"\` 随机切一个

当前已注册皮肤:
${V.instance().list().map(n=>{const a=V.instance().get(n),i=a&&a.aiHint?a.aiHint:"(no description)";return`  - \`${n}\`: ${i}`}).join(`
`)}
传不在列表里的名字会返回 unknown_skin 错误(不会乱切)。`,parameters:{type:"object",properties:{name:{type:"string",description:'皮肤名(见 description 列表),或 "next" / "prev" / "random" 之一。'}},required:["name"]},strict:!1,onCall:n=>{const a=n&&n.name||"next",i=V.instance().list();let o;const d=s._widget?.getSkin?.()?.name||"";if(a==="random")o=i[Math.floor(Math.random()*i.length)]||d;else if(a==="next"||a==="prev"){const l=i.indexOf(d);o=i[((l+(a==="next"?1:-1))%i.length+i.length)%i.length]||d}else if(i.indexOf(a)>=0)o=a;else return{ok:!1,error:"unknown_skin",requested:a,available:i,currentSkin:d};try{return s.setSkin(o),{ok:!0,currentSkin:o,previousSkin:d,available:i,message:"已切换皮肤:"+d+" → "+o}}catch(l){return{ok:!1,error:l.message,currentSkin:d}}}}}function ra(s){return{name:"get_page_errors",description:`查询 SDK 检测到的宿主页面错误(JS 异常、HTTP 错误、UI 错误弹窗)。
当用户可能遇到问题但未明确描述,或你需要更多细节来诊断问题时,调用此工具。
返回结果包含错误时间、来源(global/network/dom_popup)、严重级别和详情。`,parameters:{type:"object",properties:{source:{type:"string",enum:["all","global","network","dom_popup"],description:"按来源过滤。all=全部,global=JS异常,network=HTTP/网络错误,dom_popup=UI弹窗。默认 all。"},limit:{type:"number",description:"最多返回几条(按时间倒序)。默认 10。"}},required:[]},strict:!1,onCall:e=>{const t=e?.source||"all",n=e?.limit||10;let a=s.getPageErrors();return t!=="all"&&(a=a.filter(i=>i.source===t)),a=a.slice(-n),a.length===0?{ok:!0,count:0,errors:[],message:"未检测到页面错误。"}:{ok:!0,count:a.length,errors:a.map(i=>({source:i.source,severity:i.severity,timestamp:i.timestamp,message:i.message,details:i.details})),message:`检测到 ${a.length} 条页面错误。可以根据错误信息向用户解释发生了什么,并建议解决或重试方案。`}}}}async function ys(s,e,t,n){if(!e)return;const a=s.getSessionId();if(!a){console.warn("[AIAgent SDK] no sessionId for tool result");return}const i={toolUseId:e,result:t,ts:Date.now()};s.setPending(i);try{sessionStorage.setItem("pending:"+a,JSON.stringify(i))}catch{}let o;try{o=await s.ensureToken()}catch(d){s.appendMsg("system","⚠️ "+d.message),s.setBusy(!1);return}await Qt(s,e,t,a,o,n)}async function Qt(s,e,t,n,a,i){const o=s.endpoint+"/chat/"+encodeURIComponent(n)+"/tools/result",d=JSON.stringify({toolUseId:e,result:t==null?"[Tool executed by client SDK; no result returned]":typeof t=="string"?t:JSON.stringify(t)}),l={Authorization:"Bearer "+a,"Content-Type":"application/json",Accept:"text/event-stream"},g=4;let c=500,u=0,m=null,k=null;for(;u<g;){k=null;try{m=await fetch(o,{method:"POST",headers:l,body:d})}catch(x){k=x}if(k){if(u===g-1)break;await s.sleep(c),c*=2,u++,i&&Jt(i,Math.min(60+u*10,90),"重试中…");continue}if(m&&m.status>=500&&m.status<600&&u<g-1){await s.sleep(c),c*=2,u++,i&&Jt(i,Math.min(60+u*10,90),"重试中…");continue}if(m&&m.status===429&&u<g-1){const x=parseInt(m.headers.get("Retry-After")||"1",10);await s.sleep(Math.max(x*1e3,c)),c*=2,u++,i&&Jt(i,Math.min(60+u*10,90),"限流中…");continue}break}if(k){i&&mt(i,"✕ 网络失败"),wt(s,n,e,"network: "+k.message);return}if(!m){i&&mt(i,"✕ 无响应"),wt(s,n,e,"network: no response");return}if(m.status===409){i&&mt(i,"✕ 409 冲突");const x=await m.text();s.appendMsg("system","⚠️ "+(x||"session 已被工具调用占用"));try{await yt(s.endpoint,a,n)}catch{}s.setPending(null),s.setBusy(!1);return}if(!m.ok||!m.body){i&&mt(i,"✕ HTTP "+m.status),wt(s,n,e,"http "+m.status);return}i&&Ge(i,"✓ 已提交");const w=s.appendTyping(),C=s.getMsgEl();let _=!1;const I={typing:w},O=(()=>{const x=Re.buildStreamHandlers({typing:w,msgEl:C,onUpgrade:()=>{s.handleThinking},onErrorFallback:y=>s.appendMsg("system",y),onAssistantText:y=>{y&&s.appendMsg("assistant",y)},onDoneCleanup:()=>{_||s.setBusy(!1)}});return{onChunk:x.onChunk,onDone:x.onDone,onError:x.onError,getAssistantBuf:x.getAssistantBuf}})();let v=!0;try{await Q(m.body,x=>O.onChunk(x),()=>O.onDone(),x=>O.onError(x),async x=>{s.handleToolCall&&(s.setBusy(!0),await s.handleToolCall(x)&&(_=!0))},x=>{s.handleToolCallDelta&&s.handleToolCallDelta(x)},x=>{s.handleToolCallStart&&s.handleToolCallStart(x)},x=>{},x=>{s.handleThinking&&s.handleThinking(x)},x=>{const y=I.typing;if(y&&y.parentNode){const te=y.querySelector(".aiagent-sdk-typing-particle"),ae=!y.textContent?.trim();te||ae?y.remove():xt(y)}const N=bt(C),B=Re.buildStreamHandlers({typing:N,msgEl:C,onUpgrade:()=>{},onErrorFallback:te=>s.appendMsg("system",te),onAssistantText:te=>{te&&s.appendMsg("assistant",te)},onDoneCleanup:()=>{_||s.setBusy(!1)}});O.onChunk=B.onChunk,O.onDone=B.onDone,O.onError=B.onError,I.typing=N},x=>{x&&O.onChunk({event:"text",data:x})})}catch{v=!1}if(v){try{sessionStorage.removeItem("pending:"+n)}catch{}s.setPending(null)}else wt(s,n,e,"sse")}async function ws(s){const e=s.getPending();if(!e)return;const t=s.getSessionId();if(!t)return;s.setBusy(!0);let n;try{n=await s.ensureToken()}catch(a){s.appendMsg("system","⚠️ "+a.message),s.setBusy(!1);return}await Qt(s,e.toolUseId,e.result,t,n)}async function _s(s){const e=s.getSessionId();if(!e){s.setBusy(!1);return}let t="";try{t=await s.ensureToken()}catch{}await yt(s.endpoint,t,e),s.appendMsg("system","已放弃本次工具调用,可继续对话。"),s.setBusy(!1)}function wt(s,e,t,n){console.warn("[AIAgent SDK] tool result failed:",n),vs(s,n),s.setBusy(!1)}function vs(s,e){const t=s.getMsgEl();if(t.querySelector(".aiagent-sdk-tool-result-failed"))return;const n=document.createElement("div");n.className="aiagent-sdk-tool-result-failed";const a=document.createElement("div");a.className="aiagent-sdk-tool-result-failed-header",a.textContent="提交工具结果失败";const i=document.createElement("div");i.className="aiagent-sdk-tool-result-failed-detail",i.textContent="原因:"+(e||"未知")+"。可重试,或取消本次调用以继续对话。";const o=document.createElement("div");o.className="aiagent-sdk-tool-result-actions";const d=document.createElement("button");d.type="button",d.className="aiagent-sdk-btn-retry",d.textContent="↻ 重试",d.addEventListener("click",()=>{n.parentNode&&n.parentNode.removeChild(n),ws(s)});const l=document.createElement("button");l.type="button",l.className="aiagent-sdk-btn-cancel",l.textContent="✕ 取消",l.addEventListener("click",()=>{n.parentNode&&n.parentNode.removeChild(n),_s(s)}),o.appendChild(d),o.appendChild(l),n.appendChild(a),n.appendChild(i),n.appendChild(o),t.appendChild(n),t.scrollTop=t.scrollHeight}async function Ts(s){if(typeof sessionStorage>"u")return;let e=null,t=null;try{for(let i=0;i<sessionStorage.length;i++){const o=sessionStorage.key(i);if(o&&o.indexOf("pending:")===0){e=o,t=JSON.parse(sessionStorage.getItem(o)||"null");break}}}catch{return}if(!e||!t||!t.toolUseId){e&&sessionStorage.removeItem(e);return}const n=e.substring(8);s.appendMsg("system","检测到上次未完成的工具调用,正在重试提交…"),s.setPending(t);let a;try{a=await s.ensureToken()}catch(i){s.appendMsg("system","⚠️ "+i.message);return}await Qt(s,t.toolUseId,t.result,n,a)}const la=[".el-message--error",".el-notification--error",".ant-message-error",".ant-notification-error",".ant-alert-error",".ivu-message-error",".van-toast--fail",'[role="alert"]',".toast-error",".alert-danger",".notification.is-danger"].join(", "),Es=[/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,/(?:password|passwd|pwd|secret|api[_-]?key)\s*[=:]\s*\S+/gi,/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,/\b(?:\d{4}[-\s]?){3}\d{4}\b/g,/(?:token|auth)\s*[=:]\s*["']?[A-Za-z0-9\-._~+/=]+/gi];let _t=0,Ke=null,Xe=null,Ze=null,Je=null;const de=new Set;function Ss(s,e,t,n,a){for(const i of de)try{i._handleGlobalError(s,e,t,n,a)}catch{}return typeof Ke=="function"?Ke(s,e,t,n,a):!1}function da(s){for(const e of de)try{e._handleUnhandledRejection(s.reason)}catch{}}async function As(...s){const e=typeof s[0]=="string"?s[0]:s[0]?.url||"",t=s[1]?.method||"GET",n=Date.now();try{const a=await Xe.apply(window,s);if(a.status>=400)for(const i of de)try{i._isOwnRequest(e)||i._ingestNetworkError(e,t,a.status,a.statusText,n)}catch{}return a}catch(a){for(const i of de)try{i._isOwnRequest(e)||i._ingestNetworkFailure(e,t,a.message,n)}catch{}throw a}}const vt=class vt{constructor(e,t,n){f(this,"_endpoint");f(this,"_opts");f(this,"_host");f(this,"_running",!1);f(this,"_buffer",[]);f(this,"_recentIds",new Map);f(this,"_maxBufferSize");f(this,"_dedupeWindowMs");f(this,"_maxErrorsPerMessage");f(this,"_autoInject");f(this,"_maxMessageLength");f(this,"_redactPatterns");f(this,"_domObserver",null);f(this,"_lastProactiveMsgTs",0);this._endpoint=e,this._opts=t,this._host=n;const a=t.behavior||{};this._maxBufferSize=a.maxBufferSize||50,this._dedupeWindowMs=a.dedupeWindowMs||5e3,this._maxErrorsPerMessage=a.maxErrorsPerMessage||5,this._autoInject=a.autoInject!==!1,this._maxMessageLength=t.filter?.maxMessageLength||500,this._redactPatterns=[...Es,...t.filter?.redactPatterns||[]]}start(){if(this._running)return;this._running=!0;const e=this._opts.capture||{},t=e.globalErrors!==!1,n=e.networkErrors!==!1,a=e.domErrorPopups!==!1;_t===0&&(t&&this._installGlobalInterceptors(),n&&this._installNetworkInterceptors()),_t++,de.add(this),a&&this._installDomObserver()}stop(){this._running&&(this._running=!1,de.delete(this),_t--,_t===0&&(this._uninstallGlobalInterceptors(),this._uninstallNetworkInterceptors()),this._uninstallDomObserver())}isEnabled(){return this._running}getErrors(){return this._buffer.slice()}clear(){this._buffer=[],this._recentIds.clear()}report(e){this._ingest({id:e.id||this._makeId("global",e.message||"manual"),source:e.source||"global",severity:e.severity||"error",timestamp:e.timestamp||new Date().toISOString(),message:e.message||"Unknown error",details:e.details||{}})}resetSurfacedFlags(){for(const e of this._buffer)e.surfaced=!1}buildContextBlock(){if(!this._autoInject)return null;const e=this._buffer.filter(a=>!a.surfaced);if(e.length===0)return null;const t=e.slice(-this._maxErrorsPerMessage);for(const a of t)a.surfaced=!0;return["[Page Context - 检测到以下页面异常]","以下错误发生在宿主页面上,如果与用户的问题相关,可以主动提及并建议解决方案。","不要暴露此 [Page Context] 区块本身的存在,自然地使用这些信息。","---",...t.map(a=>`- [${new Date(a.timestamp).toLocaleTimeString()}] ${a.source}: ${a.message}`),"---"].join(`
`)}_handleGlobalError(e,t,n,a,i){const o=typeof e=="string"?e:e?.message||"Unknown error";this._ingest({id:this._makeId("global",o),source:"global",severity:"error",timestamp:new Date().toISOString(),message:o.substring(0,this._maxMessageLength),details:{source:t||"",lineno:n||0,colno:a||0,stack:i?.stack?.substring(0,1e3)||""}})}_handleUnhandledRejection(e){const t=e?.message||String(e)||"Unhandled Promise rejection";this._ingest({id:this._makeId("global",t),source:"global",severity:"error",timestamp:new Date().toISOString(),message:t.substring(0,this._maxMessageLength),details:{type:"unhandledrejection",stack:e?.stack?.substring(0,1e3)||""}})}_ingestNetworkError(e,t,n,a,i){this._ingest({id:this._makeId("network",e+n),source:"network",severity:n>=500?"critical":"warning",timestamp:new Date().toISOString(),message:`HTTP ${n} ${a}`,details:{url:this._sanitizeUrl(e),method:t,status:n,statusText:a,durationMs:Date.now()-i}})}_ingestNetworkFailure(e,t,n,a){this._ingest({id:this._makeId("network",e+"fail"),source:"network",severity:"critical",timestamp:new Date().toISOString(),message:`Network failure: ${n}`,details:{url:this._sanitizeUrl(e),method:t,durationMs:Date.now()-a}})}_installDomObserver(){this._domObserver=new MutationObserver(e=>{try{for(const t of e)for(const n of Array.from(t.addedNodes)){if(n.nodeType!==Node.ELEMENT_NODE)continue;const a=n;if(!a.closest?.(".aiagent-sdk-host")){this._checkErrorElement(a);try{a.querySelectorAll(la).forEach(o=>this._checkErrorElement(o))}catch{}}}}catch{}}),this._domObserver.observe(document.body,{childList:!0,subtree:!0})}_uninstallDomObserver(){this._domObserver&&(this._domObserver.disconnect(),this._domObserver=null)}_checkErrorElement(e){if(!e.matches?.(la))return;const t=(e.innerText||e.textContent||"").trim();!t||t.length>this._maxMessageLength||this._ingest({id:this._makeId("dom_popup",t),source:"dom_popup",severity:"warning",timestamp:new Date().toISOString(),message:t,details:{tagName:e.tagName.toLowerCase(),className:(e.className?.toString?.()||"").substring(0,200)}})}_installGlobalInterceptors(){Ke=window.onerror,window.onerror=Ss,window.addEventListener("unhandledrejection",da)}_uninstallGlobalInterceptors(){window.onerror=Ke,Ke=null,window.removeEventListener("unhandledrejection",da)}_installNetworkInterceptors(){Xe=window.fetch,window.fetch=As,Ze=XMLHttpRequest.prototype.open,Je=XMLHttpRequest.prototype.send,XMLHttpRequest.prototype.open=function(e,t,...n){return this.__aia_method=e,this.__aia_url=String(t),this.__aia_start=Date.now(),Ze.apply(this,[e,t,...n])},XMLHttpRequest.prototype.send=function(...e){const t=this.__aia_url||"",n=this.__aia_method||"GET",a=this.__aia_start||Date.now();let i=!1;for(const o of de)if(!o._isOwnRequest(t)){i=!0;break}return i&&(this.addEventListener("load",function(){if(this.status>=400)for(const o of de)try{o._isOwnRequest(t)||o._ingestNetworkError(t,n,this.status,this.statusText,a)}catch{}}),this.addEventListener("error",function(){for(const o of de)try{o._isOwnRequest(t)||o._ingestNetworkFailure(t,n,"XHR error",a)}catch{}}),this.addEventListener("timeout",function(){for(const o of de)try{o._isOwnRequest(t)||o._ingestNetworkFailure(t,n,"XHR timeout",a)}catch{}})),Je.apply(this,e)}}_uninstallNetworkInterceptors(){Xe&&(window.fetch=Xe,Xe=null),Ze&&(XMLHttpRequest.prototype.open=Ze,Ze=null),Je&&(XMLHttpRequest.prototype.send=Je,Je=null)}_ingest(e){try{if(this._opts.onError)try{this._opts.onError(e)}catch{}if(this._shouldIgnore(e))return;this._redact(e);const t=this._recentIds.get(e.id);if(t&&Date.now()-t<this._dedupeWindowMs)return;if(this._recentIds.set(e.id,Date.now()),this._buffer.length>=this._maxBufferSize&&this._buffer.shift(),this._buffer.push(e),this._recentIds.size>this._maxBufferSize*2){const n=Date.now()-this._dedupeWindowMs;for(const[a,i]of this._recentIds)i<n&&this._recentIds.delete(a)}e.severity==="critical"&&this._notifyCritical(e)}catch(t){console.warn("[AIAgent SDK] pageAwareness._ingest failed:",t)}}_notifyCritical(e){try{this._host.onErrorBadge?.(this._buffer.length)}catch{}if(this._host.isWidgetOpen()){const t=Date.now();if(t-this._lastProactiveMsgTs>=vt.PROACTIVE_THROTTLE_MS){this._lastProactiveMsgTs=t;try{this._host.appendSystemMsg(`检测到页面异常: ${e.message.substring(0,100)}`)}catch{}}}}_shouldIgnore(e){const t=this._opts.filter;if(!t)return!1;if(t.ignoreUrls){const n=e.details.url;if(n){for(const a of t.ignoreUrls)if(a.test(n))return!0}}if(t.ignoreMessages){for(const n of t.ignoreMessages)if(n.test(e.message))return!0}return!1}_redact(e){if(e.message=this._applyRedaction(e.message),e.details)for(const t of Object.keys(e.details)){const n=e.details[t];typeof n=="string"&&(e.details[t]=this._applyRedaction(n))}}_applyRedaction(e){let t=e;for(const n of this._redactPatterns)t=t.replace(n,"[REDACTED]");return t}_isOwnRequest(e){if(!e)return!1;const t=this._endpoint;return e.startsWith(t+"/chat/")||e.startsWith(t+"/dict/")||e.startsWith(t+"/auth/")||e.includes("/ai-token")}_sanitizeUrl(e){try{const t=new URL(e,window.location.origin),n=Array.from(t.searchParams.keys()).map(a=>`${a}=[...]`).join("&");return t.origin+t.pathname+(n?"?"+n:"")}catch{return e.substring(0,200)}}_makeId(e,t){return e+":"+t.substring(0,100)}};f(vt,"PROACTIVE_THROTTLE_MS",3e4);let en=vt;const ca=`
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M5 12 L19 12 M13 6 L19 12 L13 18"/>
</svg>
`.trim();class Cs{constructor(e,t){f(this,"host",null);f(this,"shadow",null);f(this,"bubble",null);f(this,"panel",null);f(this,"msgEl",null);f(this,"taEl",null);f(this,"sendBtn",null);f(this,"welcomeEl",null);f(this,"isOpen",!1);f(this,"mounted",!1);f(this,"avatarRaw","🤖");f(this,"onMouseMove",null);f(this,"skin");f(this,"_pendingInput","");f(this,"_toolPanelItems",[]);f(this,"_toolPanelStates",new Map);f(this,"_toolPanelEl",null);f(this,"_toolPanelOpen",!1);f(this,"_errorBadge",null);this.opts=e,this.handlers=t;const n=e.skin||"iridescent-bloom";this.skin=V.instance().get(n)||is(e.theme||"ink")}get layout(){return ut(this.skin.layout)}getRefs(){return!this.host||!this.bubble||!this.panel||!this.msgEl||!this.taEl||!this.sendBtn?null:{host:this.host,bubble:this.bubble,panel:this.panel,msgEl:this.msgEl,taEl:this.taEl,sendBtn:this.sendBtn}}mount(){if(this.mounted||typeof document>"u")return;const e=document.createElement("div");e.className="aiagent-sdk-host",e.setAttribute("data-position",this.opts.position||"bottom-right"),e.setAttribute("data-theme",this.opts.theme||"ink"),e.setAttribute("data-skin",this.skin.name),e.setAttribute("data-status-dot",this.layout.statusDotStyle),e.setAttribute("data-send-icon",this.layout.sendIcon),e.setAttribute("data-message-enter",this.layout.messageEnter),e.setAttribute("data-bubble-anim",this.layout.bubbleAnimation),document.body.appendChild(e),this.host=e;const t=e.attachShadow({mode:"open"});this.shadow=t;const n=document.createElement("style");n.textContent=this.skin.css||pt,t.appendChild(n);const a=this.opts.position==="bottom-left"?" aiagent-sdk-pos-bl":"";this.avatarRaw=this.opts.avatar||"🤖";const i=this.avatarRaw.length<=2,o=document.createElement("button");i?(o.className="aiagent-sdk-bubble aiagent-sdk-bubble-emoji"+a,o.textContent=this.avatarRaw):o.className="aiagent-sdk-bubble"+a,o.setAttribute("aria-label",this.opts.title||"AI 助手 - 点击打开对话"),o.title=this.opts.title||"AI 助手",o.addEventListener("click",()=>this.toggle()),t.appendChild(o),this.bubble=o;const d=document.createElement("span");d.className="aiagent-sdk-error-badge",o.appendChild(d),this._errorBadge=d;const l=document.createElement("div");l.className="aiagent-sdk-panel"+a;const g=this.layout.cornerGlow?['<div class="aiagent-sdk-corner aiagent-sdk-corner-tl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-tr" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-bl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-br" aria-hidden="true"></div>'].join(""):"",u=V.instance().list().length>=2?`<button class="aiagent-sdk-iconbtn aiagent-sdk-cycle-skin" title="切换皮肤 (当前:${this.skin.name})" aria-label="切换皮肤">🎨</button>`:"",m=(()=>{switch(this.layout.sendIcon){case"svg":return ca;case"arrow":return"→";case"circle":return"";default:return ca}})();l.innerHTML=[g,'<div class="aiagent-sdk-header">','  <div class="aiagent-sdk-header-info">','    <span class="aiagent-sdk-status-dot" aria-hidden="true"></span>','    <span class="aiagent-sdk-title"></span>',"  </div>",'  <div class="aiagent-sdk-header-actions">','    <span class="aiagent-sdk-subtitle"></span>',u,'    <button class="aiagent-sdk-iconbtn aiagent-sdk-toggle-thinking" title="显示/隐藏 思考过程" aria-label="思考">🧠</button>','    <button class="aiagent-sdk-iconbtn aiagent-sdk-new" title="新会话" aria-label="新会话">＋</button>','    <button class="aiagent-sdk-iconbtn aiagent-sdk-close" title="关闭" aria-label="关闭">✕</button>',"  </div>","</div>",'<div class="aiagent-sdk-welcome" hidden></div>','<div class="aiagent-sdk-messages" role="log" aria-live="polite"></div>','<div class="aiagent-sdk-inputbar">','  <textarea rows="1" placeholder="" aria-label="输入消息"></textarea>',`  <button class="aiagent-sdk-send" aria-label="发送">${m}</button>`,"</div>"].join(""),t.appendChild(l),this.panel=l;const k=l.querySelector(".aiagent-sdk-title"),w=l.querySelector(".aiagent-sdk-subtitle");k.textContent=this.opts.title||"AI 助手",w.textContent=this.opts.subtitle||"";const C=l.querySelector("textarea");C.placeholder=this.opts.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",this.msgEl=l.querySelector(".aiagent-sdk-messages"),this.taEl=C,this.sendBtn=l.querySelector(".aiagent-sdk-send"),this.welcomeEl=l.querySelector(".aiagent-sdk-welcome");const _=l.querySelector(".aiagent-sdk-close"),I=l.querySelector(".aiagent-sdk-new"),O=l.querySelector(".aiagent-sdk-toggle-thinking"),v=l.querySelector(".aiagent-sdk-cycle-skin");_.addEventListener("click",()=>this.handlers.onClose()),I.addEventListener("click",()=>this.handlers.onNew()),O&&O.addEventListener("click",()=>{this.panel.classList.toggle("aiagent-sdk-thinking-hidden");const x=this.panel.classList.contains("aiagent-sdk-thinking-hidden");O.style.opacity=x?"0.4":"1"}),v&&v.addEventListener("click",()=>{const x=V.instance().list();if(x.length<2)return;const y=this.skin.name,N=x.indexOf(y),B=x[(N+1)%x.length];if(typeof this.handlers.onCycleSkin=="function"){this.handlers.onCycleSkin(B);return}this.applySkin(B),this.panel&&(this.panel.classList.add("aiagent-sdk-skin-just-changed"),setTimeout(()=>{this.panel&&this.panel.classList.remove("aiagent-sdk-skin-just-changed")},400)),console.log("[AIAgent SDK 🎨 换肤]",y,"→",B)}),this.sendBtn.addEventListener("click",()=>{this._burstSend(),this.handlers.onSend()}),C.addEventListener("keydown",x=>{x.key==="Enter"&&!x.shiftKey&&(x.preventDefault(),this._burstSend(),this.handlers.onSend())}),C.addEventListener("input",()=>{C.style.height="auto",C.style.height=Math.min(C.scrollHeight,80)+"px"}),this.onMouseMove=x=>{if(!this.panel)return;const y=this.panel.getBoundingClientRect(),N=(x.clientX-y.left)/y.width*100,B=(x.clientY-y.top)/y.height*100;this.panel.style.setProperty("--aia-mx",N+"%"),this.panel.style.setProperty("--aia-my",B+"%")},this.panel.addEventListener("mousemove",this.onMouseMove),this.panel.addEventListener("mouseleave",()=>{this.panel&&(this.panel.style.setProperty("--aia-mx","50%"),this.panel.style.setProperty("--aia-my","50%"))}),this.setTheme(this.opts.theme||"ink"),this._pendingInput&&this.taEl&&(this.taEl.value=this._pendingInput,this._pendingInput=""),this.mounted=!0}destroy(){this.mounted&&(this.taEl&&(this._pendingInput=this.taEl.value),this.panel&&this.onMouseMove&&this.panel.removeEventListener("mousemove",this.onMouseMove),this.host&&this.host.parentNode&&this.host.parentNode.removeChild(this.host),this.host=null,this.shadow=null,this.bubble=null,this.panel=null,this.msgEl=null,this.taEl=null,this.sendBtn=null,this.welcomeEl=null,this.mounted=!1,this.onMouseMove=null)}applySkin(e){const t=typeof e=="string"?V.instance().get(e):e;if(!t){console.warn("[AIAgent SDK] applySkin: skin not found");return}if(!this.mounted||!this.host||!this.shadow||!this.panel){this.skin=t;return}this.skin=t;const n=this.shadow.querySelector("style");n&&(n.textContent=this.skin.css||pt),this.host.setAttribute("data-skin",this.skin.name),this.host.setAttribute("data-status-dot",this.layout.statusDotStyle),this.host.setAttribute("data-send-icon",this.layout.sendIcon),this.host.setAttribute("data-message-enter",this.layout.messageEnter),this.host.setAttribute("data-bubble-anim",this.layout.bubbleAnimation);const a=this.panel.querySelectorAll(".aiagent-sdk-corner");if(!this.layout.cornerGlow)a.forEach(i=>i.remove());else if(a.length===0){const i=['<div class="aiagent-sdk-corner aiagent-sdk-corner-tl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-tr" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-bl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-br" aria-hidden="true"></div>'].join(""),o=document.createElement("div");for(o.innerHTML=i;o.firstChild;)this.panel.insertBefore(o.firstChild,this.panel.firstChild)}this.panel.classList.add("aiagent-sdk-skin-just-changed"),setTimeout(()=>{this.panel&&this.panel.classList.remove("aiagent-sdk-skin-just-changed")},400),this.panel.style.setProperty("--aia-mx","50%"),this.panel.style.setProperty("--aia-my","50%")}getSkin(){return this.skin}open(){this.panel&&(this.panel.classList.add("aiagent-sdk-open"),this.isOpen=!0,this.setErrorBadge(0),setTimeout(()=>{this.taEl&&this.taEl.focus()},50),this.handlers.onPanelOpen())}close(){this.panel&&(this.panel.classList.remove("aiagent-sdk-open"),this.isOpen=!1)}toggle(){this.isOpen?this.close():this.open()}getIsOpen(){return this.isOpen}setTheme(e){this.host&&this.host.setAttribute("data-theme",e)}clearMessages(){this.msgEl&&(this.msgEl.innerHTML="")}setErrorBadge(e){this._errorBadge&&(e<=0||this.isOpen?(this._errorBadge.style.display="none",this._errorBadge.textContent=""):(this._errorBadge.textContent=e>99?"99+":String(e),this._errorBadge.style.display="flex"))}setWelcome(e){if(this.welcomeEl){if(!e){this.welcomeEl.hidden=!0;return}this.welcomeEl.hidden=!1,this.welcomeEl.textContent=e}}hideWelcome(){this.welcomeEl&&(this.welcomeEl.hidden||(this.welcomeEl.classList.add("aiagent-sdk-welcome-leaving"),setTimeout(()=>{this.welcomeEl&&(this.welcomeEl.hidden=!0,this.welcomeEl.classList.remove("aiagent-sdk-welcome-leaving"))},280)))}_burstSend(){if(!this.sendBtn)return;const e=5,t=["#5eead4","#a78bfa","#f0abfc","#93c5fd","#fcd34d"];for(let n=0;n<e;n++){const a=Math.PI*2*n/e+Math.random()*.5,i=22+Math.random()*14,o=Math.cos(a)*i,d=Math.sin(a)*i,l=document.createElement("span");l.className="aiagent-sdk-send-burst",l.style.setProperty("--bx",o+"px"),l.style.setProperty("--by",d+"px");const g=t[n];l.style.setProperty("--c",g),l.style.background=g,this.sendBtn.appendChild(l),setTimeout(()=>l.remove(),750)}}registerToolPanelItems(e){for(const t of e)this._toolPanelItems=this._toolPanelItems.filter(n=>n.name!==t.name),this._toolPanelItems.push(t),t.type==="toggle"&&this._toolPanelStates.set(t.name,!!t.defaultOn);this._renderToolPanel()}getToolPanelState(e){return this._toolPanelStates.get(e)||!1}setToolPanelState(e,t){this._toolPanelStates.set(e,t),this._updateToolPanelUI()}_renderToolPanel(){if(!this.panel||!this.shadow)return;if(this._toolPanelItems.length===0){const t=this.panel.querySelector(".aiagent-sdk-tool-panel-btn");t&&t.remove(),this._toolPanelEl&&(this._toolPanelEl.remove(),this._toolPanelEl=null);return}let e=this.panel.querySelector(".aiagent-sdk-tool-panel-btn");if(!e){const t=this.panel.querySelector(".aiagent-sdk-header-actions");if(!t)return;e=document.createElement("button"),e.className="aiagent-sdk-iconbtn aiagent-sdk-tool-panel-btn",e.title="工具面板",e.setAttribute("aria-label","工具面板"),e.textContent="🔧";const n=t.querySelector(".aiagent-sdk-cycle-skin");n?t.insertBefore(e,n):t.insertBefore(e,t.children[1]),e.addEventListener("click",()=>this._toggleToolPanel())}this._renderToolPanelDropdown()}_toggleToolPanel(){this._toolPanelOpen=!this._toolPanelOpen,this._toolPanelEl&&this._toolPanelEl.classList.toggle("aiagent-sdk-tool-panel-open",this._toolPanelOpen),this._toolPanelOpen&&setTimeout(()=>{const e=t=>{this._toolPanelEl&&!this._toolPanelEl.contains(t.target)&&(this._toolPanelOpen=!1,this._toolPanelEl.classList.remove("aiagent-sdk-tool-panel-open"),document.removeEventListener("click",e))};document.addEventListener("click",e)},0)}_renderToolPanelDropdown(){if(!this.panel)return;if(!this._toolPanelEl){this._toolPanelEl=document.createElement("div"),this._toolPanelEl.className="aiagent-sdk-tool-panel";const t=this.panel.querySelector(".aiagent-sdk-header");t&&t.nextSibling?this.panel.insertBefore(this._toolPanelEl,t.nextSibling):this.panel.appendChild(this._toolPanelEl)}const e=this._toolPanelItems.map(t=>{const n=t.icon||(t.type==="toggle"?"🔌":"⚡"),a=t.type==="toggle"&&this._toolPanelStates.get(t.name)||!1,i=t.type==="toggle"?`aiagent-sdk-tp-toggle ${a?"aiagent-sdk-tp-on":"aiagent-sdk-tp-off"}`:"aiagent-sdk-tp-action",o=t.type==="toggle"?'<span class="aiagent-sdk-tp-switch"><span class="aiagent-sdk-tp-switch-knob"></span></span>':'<span class="aiagent-sdk-tp-arrow">→</span>';return`<div class="aiagent-sdk-tp-item ${i}" data-name="${t.name}" data-type="${t.type}" title="${t.description||""}">
        <span class="aiagent-sdk-tp-icon">${n}</span>
        <span class="aiagent-sdk-tp-label">${t.label}</span>
        ${o}
      </div>`}).join("");this._toolPanelEl.innerHTML=`<div class="aiagent-sdk-tp-title">工具面板</div>${e}`,this._toolPanelEl.querySelectorAll(".aiagent-sdk-tp-item").forEach(t=>{t.addEventListener("click",()=>{const n=t.dataset.name;t.dataset.type==="toggle"?this._handleToggle(n):this._handleAction(n)})}),this._toolPanelEl.classList.toggle("aiagent-sdk-tool-panel-open",this._toolPanelOpen)}_updateToolPanelUI(){this._toolPanelEl&&this._toolPanelEl.querySelectorAll('.aiagent-sdk-tp-item[data-type="toggle"]').forEach(e=>{const t=e.dataset.name,n=this._toolPanelStates.get(t)||!1;e.classList.toggle("aiagent-sdk-tp-on",n),e.classList.toggle("aiagent-sdk-tp-off",!n)})}_handleToggle(e){const t=this._toolPanelItems.find(o=>o.name===e);if(!t||t.type!=="toggle")return;const a=!(this._toolPanelStates.get(e)||!1);this._toolPanelStates.set(e,a),this._updateToolPanelUI();const i=!t.onToggle;typeof this.handlers.onToolPanelToggle=="function"&&this.handlers.onToolPanelToggle(e,a,i)}_handleAction(e){const t=this._toolPanelItems.find(a=>a.name===e);if(!t||t.type!=="action")return;const n=this._toolPanelEl?.querySelector(`.aiagent-sdk-tp-item[data-name="${e}"]`);n&&(n.classList.add("aiagent-sdk-tp-flash"),setTimeout(()=>n.classList.remove("aiagent-sdk-tp-flash"),300)),typeof this.handlers.onToolPanelAction=="function"&&this.handlers.onToolPanelAction(e)}}function Is(s,e){s.setTheme(e)}const ce=class ce{constructor(){f(this,"endpoint");f(this,"getAccessToken");f(this,"_opts");f(this,"_tokenCache",new P);f(this,"_tools",new hs);f(this,"_widget",null);f(this,"_isOpen",!1);f(this,"_busy",!1);f(this,"_messages",[]);f(this,"_chatSessionId",null);f(this,"_activeTools",[]);f(this,"_persistentTools",[]);f(this,"_ephemeralTools",[]);f(this,"_pendingToolCall",null);f(this,"_lastToolCard",null);f(this,"_thinkingCard",null);f(this,"_thinkingBuf","");f(this,"_pageAwareness",null);f(this,"_pendingDelta",new Map)}init(e){if(!e||!e.endpoint)throw new Error("endpoint required");if(typeof e.getAccessToken!="function")throw new Error("getAccessToken() required");if(this.endpoint=String(e.endpoint).replace(/\/+$/,""),this.getAccessToken=e.getAccessToken,this._opts={title:e.title||"AI 助手",subtitle:e.subtitle||"在线",placeholder:e.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",welcomeMessage:e.welcomeMessage||"你好!我是 AI 助手,有什么可以帮你的?",theme:e.theme||"ink",position:e.position||"bottom-right",autoOpen:!!e.autoOpen,avatar:e.avatar||"🤖",clientPrefix:e.clientPrefix||"app",persistentTools:e.persistentTools||[],builtinTools:e.builtinTools||{},skin:e.skin||"iridescent-bloom"},this._widget=new Cs(this._opts,{onSend:()=>this._onSend(),onNew:()=>this._newSession(),onClose:()=>this.close(),onPanelOpen:()=>{},onCycleSkin:t=>this.setSkin(t),onToolPanelToggle:(t,n,a)=>this._handleToolPanelToggle(t,n,a),onToolPanelAction:t=>this._handleToolPanelAction(t)}),this._widget.mount(),this._opts.autoOpen&&this.open(),this._opts.welcomeMessage&&this._widget.setWelcome(this._opts.welcomeMessage),e.pageAwareness?.enabled){const t=this,n={isWidgetOpen:()=>t._isOpen,appendSystemMsg:a=>t._appendMsg("system",a),onErrorBadge:a=>t._widget?.setErrorBadge(a)};this._pageAwareness=new en(this.endpoint,e.pageAwareness,n),this._pageAwareness.start(),e.pageAwareness.behavior?.registerTool!==!1&&ce.registerBuiltinTool(ra({getPageErrors:()=>this.getPageErrors(),clearPageErrors:()=>this.clearPageErrors()}))}return setTimeout(()=>{this._resumePendingToolResults()},0),this._persistentTools=this._opts.persistentTools.slice(),this}destroy(){this._pageAwareness?.stop(),this._pageAwareness=null,this._widget&&(this._widget.destroy(),this._widget=null)}async registerTools(e){if(!e||!e.sessionId)throw new Error("sessionId required");if(!e.tools||!e.tools.length)throw new Error("tools required");return this._internalRegister(e.sessionId,e.tools)}async unregisterTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const n=t.names||null;this._tools.unregister(t.sessionId,n);const a=await this._ensureToken();return oa(this.endpoint,a,t.sessionId,n)}async listTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const n=await this._ensureToken();return ks(this.endpoint,n,t.sessionId)}async _internalRegister(e,t){const n=this._tools.register(e,t),a=await this._ensureToken();return fs(this.endpoint,a,e,n)}async _internalAppend(e,t){const n=this._tools.register(e,t),a=await this._ensureToken();return ms(this.endpoint,a,e,n)}async _syncToolsForSession(e){const t=this._persistentTools.slice(),n=this._opts.builtinTools;for(const a of ce._builtinTools)a.name==="change_skin"&&n&&n.changeSkin===!1||a.name==="get_page_errors"&&n&&n.pageErrors===!1||t.push(a);if(t.length>0)try{await this._internalRegister(e,t);for(const a of t)this._activeTools.indexOf(a.name)<0&&this._activeTools.push(a.name);console.log("[AIAgent SDK 🧰 持久工具已注册到 chat session]",t.map(a=>a.name).join(", "))}catch(a){console.warn("[AIAgent SDK] persistent tools register failed:",a)}if(this._ephemeralTools.length>0)try{await this._internalAppend(e,this._ephemeralTools);for(const a of this._ephemeralTools)this._activeTools.indexOf(a.name)<0&&this._activeTools.push(a.name);console.log("[AIAgent SDK 🧰 临时工具已追加到 chat session]",this._ephemeralTools.map(a=>a.name).join(", "))}catch(a){console.warn("[AIAgent SDK] ephemeral tools append failed:",a)}}async addEphemeralTools(e){if(!(!e||!e.length)){for(const t of e)this._ephemeralTools=this._ephemeralTools.filter(n=>n.name!==t.name),this._ephemeralTools.push(t);if(this._chatSessionId)try{await this._internalAppend(this._chatSessionId,e);for(const t of e)this._activeTools.indexOf(t.name)<0&&this._activeTools.push(t.name);console.log("[AIAgent SDK 🧰 临时工具已追加到当前会话]",e.map(t=>t.name).join(", "))}catch(t){console.warn("[AIAgent SDK] ephemeral tools append failed:",t)}}}async removeEphemeralTools(e){if(!(!e||!e.length)&&(this._ephemeralTools=this._ephemeralTools.filter(t=>!e.includes(t.name)),this._activeTools=this._activeTools.filter(t=>!e.includes(t)),this._chatSessionId))try{const t=await this._ensureToken();await oa(this.endpoint,t,this._chatSessionId,e)}catch(t){console.warn("[AIAgent SDK] ephemeral tools remove failed:",t)}}_getLocalTool(e,t){return this._tools.get(e,t)}static registerBuiltinTool(e){if(!e||!e.name){console.warn("[AIAgent SDK] registerBuiltinTool: invalid tool");return}ce._builtinTools=ce._builtinTools.filter(t=>t.name!==e.name),ce._builtinTools.push(e)}async stream(e){const t=e||{};return this._postStream({sessionId:t.sessionId,message:t.message,activeTools:t.activeTools||[],onChunk:t.onChunk||(()=>{}),onDone:t.onDone||(()=>{}),onError:t.onError||(n=>console.error(n)),onToolCall:t.onToolCall,onToolCallDelta:t.onToolCallDelta,onToolCallStart:t.onToolCallStart,onToolCallEnd:t.onToolCallEnd})}open(){this._widget&&this._widget.open(),this._isOpen=!0}close(){this._widget&&this._widget.close(),this._isOpen=!1}toggle(){this._widget&&this._widget.toggle(),this._isOpen=this._widget?this._widget.getIsOpen():!1}setTheme(e){this._widget&&Is(this._widget,e.theme)}setSkin(e){if(!this._widget)return;if(!V.instance().get(e)){console.warn("[AIAgent SDK] setSkin: skin not found:",e);return}this._widget.applySkin(e)}registerSkin(e){V.instance().register(e)}listSkins(){return V.instance().list()}listSkinsWithInfo(){return V.instance().listWithInfo()}getPageErrors(){return this._pageAwareness?.getErrors()||[]}clearPageErrors(){this._pageAwareness?.clear()}reportPageError(e){this._pageAwareness?.report(e)}registerToolPanel(e){if(this._widget){this._widget.registerToolPanelItems(e);for(const t of e)t.type==="toggle"&&t.defaultOn&&t.tool&&!t.onToggle&&this.addEphemeralTools([t.tool])}}_handleToolPanelToggle(e,t,n){if(!this._widget)return;const i=this._widget._toolPanelItems?.find(o=>o.name===e);i&&(i.tool&&(t?this.addEphemeralTools([i.tool]):this.removeEphemeralTools([i.tool.name])),typeof i.onToggle=="function"&&i.onToggle(t))}_handleToolPanelAction(e){if(!this._widget)return;const n=this._widget._toolPanelItems?.find(a=>a.name===e);!n||n.type!=="action"||typeof n.onExecute=="function"&&n.onExecute()}_renderHistory(e){if(!(!this._widget||!this._widget.getRefs()))for(const n of e)n.role!=="tool"&&this._renderMsg(n.role,n.text)}_snapshotThinkingCard(e){const t=e.querySelector(".aiagent-sdk-thinking-body");return{content:t?t.innerHTML:"",done:e.classList.contains("aiagent-sdk-thinking-done")}}_snapshotToolCard(e){const t=e.getAttribute("data-tool")||"",n=e.getAttribute("data-args");let a={};if(n)try{a=JSON.parse(n)}catch{a={}}else{const d=e.querySelector(".aiagent-sdk-tool-body")?.textContent||"";try{a=JSON.parse(d)}catch{a={}}}let i="pending";e.classList.contains("aiagent-sdk-tool-success")?i="success":e.classList.contains("aiagent-sdk-tool-card--delta")?i="delta":e.classList.contains("aiagent-sdk-tool-cancelled")?i="cancelled":e.classList.contains("aiagent-sdk-tool-done")?i="done":e.classList.contains("aiagent-sdk-tool-confirmed")?i="confirmed":e.classList.contains("aiagent-sdk-tool-card--pending")&&(i="pending");const o=i==="delta"&&e.querySelector(".aiagent-sdk-tool-body")?.textContent||"";return{tool:t,args:a,state:i,bodyText:o}}_snapshotCards(){const e=this._widget?.getRefs();if(!e)return[];const t=[];return e.msgEl.querySelectorAll(".aiagent-sdk-thinking-card, .aiagent-sdk-tool-card").forEach(a=>{if(a.classList.contains("aiagent-sdk-thinking-card")){const i=this._snapshotThinkingCard(a);t.push({kind:"thinking",...i})}else{const i=this._snapshotToolCard(a);t.push({kind:"tool",...i})}}),t}_renderCardSnapshots(e){if(!this._widget)return;const t=this._widget.getRefs();if(t)for(const n of e)if(n.kind==="thinking"){const a=ta(t.msgEl),i=a.querySelector(".aiagent-sdk-thinking-body");i&&(i.innerHTML=n.content),n.done&&Ie(a)}else if(n.state==="delta"&&Object.keys(n.args).length===0){const a=Vt(t.msgEl,n.tool||"...",n.tool);n.bodyText&&na(a,n.bodyText)}else{const a=ft(t.msgEl,n.tool,n.args);if(n.state==="pending")a.classList.add("aiagent-sdk-tool-card--pending");else if(n.state==="confirmed"||n.state==="success")Ge(a,"✓ 完成");else if(n.state==="cancelled"){a.classList.add("aiagent-sdk-tool-cancelled");const i=a.querySelector(".aiagent-sdk-tool-status");i&&(i.textContent="✕ 已取消")}else n.state==="done"&&Ge(a,"✓ 完成")}}async _ensureToken(){return this._tokenCache.get(this.getAccessToken)}_newSession(){const e=this._chatSessionId;e&&yt(this.endpoint,"",e).catch(()=>{}),this._widget&&this._widget.clearMessages(),this._messages=[],this._activeTools=[],this._chatSessionId=null,this._thinkingCard=null,this._pendingDelta.clear(),this._ephemeralTools=[],this._pageAwareness?.resetSurfacedFlags(),this._widget&&this._widget.setErrorBadge(0),this._widget&&this._opts.welcomeMessage&&this._widget.setWelcome(this._opts.welcomeMessage)}static buildStreamHandlers(e){let t="",n=!1;function a(){n||(n=!0,sa(e.typing),cs(e.typing),e.onUpgrade&&e.onUpgrade())}return{onChunk:i=>{t+=i.data||"",a(),e.typing.innerHTML=ct(t),gt(e.typing),e.msgEl.scrollTop=e.msgEl.scrollHeight},onDone:()=>{!n&&!t?e.typing.remove():(a(),xt(e.typing),e.typing.innerHTML=ct(t),gt(e.typing)),e.onAssistantText&&e.onAssistantText(t),e.msgEl.scrollTop=e.msgEl.scrollHeight,e.onDoneCleanup&&e.onDoneCleanup()},onError:i=>{sa(e.typing),n?(xt(e.typing),e.typing.className="aiagent-sdk-msg aiagent-sdk-msg-system",e.typing.textContent="⚠️ "+i.message):(e.typing.remove(),e.onErrorFallback&&e.onErrorFallback("⚠️ "+i.message)),e.onDoneCleanup&&e.onDoneCleanup()},isReplaced:()=>n,getAssistantBuf:()=>t}}_onSend(){if(!this._widget)return;const e=this._widget.getRefs();if(!e)return;const t=e.taEl.value.trim();!t||this._busy||(e.taEl.value="",e.taEl.style.height="auto",this._sendUserMessage(t))}async _sendUserMessage(e){this._widget&&this._widget.hideWelcome(),this._appendMsg("user",e),this._setBusy(!0);const t=this._widget.getRefs(),n=bt(t.msgEl);this._thinkingBuf="";const a=this,i=this._activeTools.slice();let o=!1;const d={typing:n},l=(()=>{const u=ce.buildStreamHandlers({typing:n,msgEl:t.msgEl,onUpgrade:()=>{a._thinkingCard&&(Ie(a._thinkingCard),a._thinkingCard=null)},onErrorFallback:m=>a._appendMsg("system",m),onAssistantText:m=>{m&&a._messages.push({role:"assistant",text:m})},onDoneCleanup:()=>{o||a._setBusy(!1),a._thinkingCard&&(Ie(a._thinkingCard),a._thinkingCard=null)}});return{onChunk:u.onChunk,onDone:u.onDone,onError:u.onError,getAssistantBuf:u.getAssistantBuf}})();let g=e;if(this._pageAwareness?.isEnabled()){const u=this._pageAwareness.buildContextBlock();u&&(g=u+`

`+e)}const c={message:g,onChunk:u=>l.onChunk(u),onDone:()=>l.onDone(),onError:u=>l.onError(u),onThinking:u=>{a._handleThinking(u,t.msgEl,d.typing)},onToolCallStart:u=>{a._handleToolCallStart(u,t.msgEl,d.typing)},onToolCallDelta:u=>{a._handleToolCallDelta(u,t.msgEl,d.typing)},onToolCallEnd:u=>{console.log("[AIAgent SDK 🏁 onToolCallEnd] 流式工具参数传输结束",u)},onRoundEnd:u=>{a._thinkingBuf="",a._thinkingCard&&(Ie(a._thinkingCard),a._thinkingCard=null);const m=l.getAssistantBuf();m&&a._messages.push({role:"assistant",text:m});const k=d.typing;if(k&&k.parentNode){const _=k.querySelector(".aiagent-sdk-typing-particle"),I=!k.textContent?.trim();_||I?k.remove():xt(k)}const w=bt(t.msgEl),C=ce.buildStreamHandlers({typing:w,msgEl:t.msgEl,onUpgrade:()=>{a._thinkingCard&&(Ie(a._thinkingCard),a._thinkingCard=null)},onErrorFallback:_=>a._appendMsg("system",_),onAssistantText:_=>{_&&a._messages.push({role:"assistant",text:_})},onDoneCleanup:()=>{o||a._setBusy(!1),a._thinkingCard&&(Ie(a._thinkingCard),a._thinkingCard=null)}});l.onChunk=C.onChunk,l.onDone=C.onDone,l.onError=C.onError,d.typing=w},onToolCall:async u=>{a._setBusy(!0),await a._handleToolCall(u,t.msgEl,d.typing)&&(o=!0)},onText:u=>{u&&l.onChunk({event:"text",data:u})}};this._chatSessionId||(this._chatSessionId=this._opts.clientPrefix+":user-"+Date.now(),await this._syncToolsForSession(this._chatSessionId)),c.sessionId=this._chatSessionId,c.activeTools=i;try{await this._postStream(c)}catch{}}_handleThinking(e,t,n){if(this._thinkingBuf||(this._thinkingBuf=""),this._thinkingBuf+=e,!this._thinkingCard){t.insertBefore(ta(t),n);const a=t.querySelectorAll(".aiagent-sdk-thinking-card");this._thinkingCard=a.length?a[a.length-1]:null}this._thinkingCard&&ss(this._thinkingCard,this._thinkingBuf)}_handleToolCallStart(e,t,n){if(!e||!e.id||!e.name)return;const a=Vt(t,e.id,e.name,n||null);this._pendingDelta.set(e.id,a)}_handleToolCallDelta(e,t,n){if(!e||!e.id)return;let a=this._pendingDelta.get(e.id);a||(a=Vt(t,e.id,e.name||"...",n||null),this._pendingDelta.set(e.id,a)),na(a,e.delta||"")}async _handleToolCall(e,t,n){if(!e||!e.tool||e.tool.indexOf("__")===0)return!1;if(!!e.server_executed){const c=e.id?this._pendingDelta.get(e.id):null;if(c)kt(c,e.args||{},e.tool),this._pendingDelta.delete(e.id),Ge(c);else{const u=ft(t,e.tool,e.args||{},n||null);kt(u,e.args||{},e.tool),Ge(u)}return this._messages.push({role:"tool",text:"",data:{tool:e.tool,args:e.args||{}}}),!1}if(!e.args||typeof e.args!="object"||Object.keys(e.args).length===0)return!1;const i=e.id?this._pendingDelta.get(e.id):null,o=i?(kt(i,e.args,e.tool),this._pendingDelta.delete(e.id),i):(()=>{const c=ft(t,e.tool,e.args,n||null);return kt(c,e.args,e.tool),c})();this._lastToolCard=o,this._messages.push({role:"tool",text:"",data:{tool:e.tool,args:e.args}});const d=this._getLocalTool(this._chatSessionId,e.tool),l=!!(d&&d.onCall);if(!l&&!await os(o))return this._appendMsg("system",`🚫 已取消工具调用:${e.tool}`),await this._postAbort(),!0;let g=l?void 0:{confirmed:!0};if(l)try{g=await Promise.resolve(d.onCall(e.args))}catch(c){console.error("[AIAgent SDK] onCall threw:",c),this._appendMsg("system","⚠️ onCall 失败: "+c.message)}return e.id&&await this._postToolResult(e.id,g,o),!0}_setBusy(e){if(this._busy=e,!this._widget)return;const t=this._widget.getRefs();t&&(t.sendBtn.disabled=e,t.sendBtn.textContent=e?"...":"发送")}_sleep(e){return new Promise(t=>setTimeout(t,e))}_appendMsg(e,t,n){if(!this._widget)return;const a=this._widget.getRefs();a&&(aa(a.msgEl,e,t,this._messages.length,n),this._messages.push({role:e,text:t,data:n}))}_renderMsg(e,t,n){if(!this._widget)return;const a=this._widget.getRefs();a&&(!t&&e!=="system"||aa(a.msgEl,e,t,this._messages.length,n))}_appendTyping(){if(!this._widget)return document.createElement("div");const e=this._widget.getRefs();return e?bt(e.msgEl):document.createElement("div")}async _postStream(e){const t=e.sessionId,n=e.message,a=e.activeTools,i=e.onChunk||(()=>{}),o=e.onDone||(()=>{}),d=e.onError||(v=>console.error(v)),l=e.onToolCall,g=e.onToolCallDelta,c=e.onToolCallStart,u=e.onToolCallEnd,m=e.onThinking,k=e.onRoundEnd,w=e.onText;if(!t){d(new Error("sessionId required"));return}if(n==null){d(new Error("message required"));return}let C;try{C=await this._ensureToken()}catch(v){d(v);return}const _=this.endpoint+"/chat/"+encodeURIComponent(t)+"/stream",I={message:n};a&&a.length&&(I.activeTools=a);let O;try{O=await fetch(_,{method:"POST",headers:{Authorization:"Bearer "+C,"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify(I)})}catch(v){d(v);return}if(!O.ok||!O.body){d(new Error("http "+O.status));return}return Q(O.body,i,o,d,l,g,c,u,m,k,w)}async _postToolResult(e,t,n){const a=this._toolCtx();return ys(a,e,t,n)}async _postAbort(){const e=this._chatSessionId;if(e){try{await yt(this.endpoint,await this._ensureToken(),e)}catch(t){console.warn("[AIAgent SDK] abort failed:",t.message)}this._setBusy(!1)}}async _resumePendingToolResults(){return Ts(this._toolCtx())}_toolCtx(){const e=this;return{endpoint:this.endpoint,ensureToken:()=>e._ensureToken(),getSessionId:()=>e._chatSessionId,getPending:()=>e._pendingToolCall,setPending:t=>{e._pendingToolCall=t},appendMsg:(t,n,a)=>e._appendMsg(t,n,a),setBusy:t=>e._setBusy(t),sleep:t=>e._sleep(t),appendTyping:()=>e._appendTyping(),getMsgEl:()=>e._widget?.getRefs()?.msgEl||document.createElement("div"),handleThinking:t=>{const n=e._widget?.getRefs();if(!n)return;const a=n.msgEl.querySelector(".aiagent-sdk-typing");a&&e._handleThinking(t,n.msgEl,a)},handleToolCallStart:t=>{const n=e._widget?.getRefs();if(!n)return;const a=n.msgEl.querySelector(".aiagent-sdk-typing");e._handleToolCallStart(t,n.msgEl,a||void 0)},handleToolCallDelta:t=>{const n=e._widget?.getRefs();if(!n)return;const a=n.msgEl.querySelector(".aiagent-sdk-typing");e._handleToolCallDelta(t,n.msgEl,a||void 0)},handleToolCall:async t=>{const n=e._widget?.getRefs();if(!n)return!1;const a=n.msgEl.querySelector(".aiagent-sdk-typing");return e._handleToolCall(t,n.msgEl,a||void 0)}}}};f(ce,"_builtinTools",[]);let Re=ce;function Rs(){return{init:s=>new Re().init(s)}}const Os=["https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap"];let ga=!1;function Ds(){if(!ga&&!(typeof document>"u"))try{const s=document.createElement("link");s.rel="preconnect",s.href="https://fonts.googleapis.com",document.head.appendChild(s);const e=document.createElement("link");e.rel="preconnect",e.href="https://fonts.gstatic.com",e.crossOrigin="anonymous",document.head.appendChild(e);for(const t of Os){const n=document.createElement("link");n.rel="stylesheet",n.href=t,document.head.appendChild(n)}ga=!0}catch(s){console.warn("[AIAgent SDK] loadFonts failed, fallback to system fonts:",s)}}Ds();const pa=Rs();return globalThis.AIAgent=Object.assign(pa,{changeSkinTool:xs,dictTool:bs,pageErrorsTool:ra,validateTool:us,registerBuiltinTool:Re.registerBuiltinTool,IRIDESCENT_BLOOM:_e,CLASSIC:ht,AURORA:Zt,SkinRegistry:V,deriveSkin:Qn,resolveLayout:ut,DEFAULT_LAYOUT:Vn}),console.info("%c[AIAgent SDK v5.0.0]%c loaded (built __BUILD_TIME__). Theme: Iridescent Bloom. AIAgent.init({...}) is on window.AIAgent.","background:linear-gradient(135deg,#5eead4,#a78bfa,#f0abfc);color:#050505;padding:2px 8px;border-radius:3px;font-weight:700","color:#a1a1aa"),pa});
