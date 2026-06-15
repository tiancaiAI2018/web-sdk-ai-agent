(function(H,N){typeof exports=="object"&&typeof module<"u"?module.exports=N():typeof define=="function"&&define.amd?define(N):(H=typeof globalThis<"u"?globalThis:H||self,H.AIAgent=N())})(this,function(){"use strict";var Do=Object.defineProperty;var ni=H=>{throw TypeError(H)};var Mo=(H,N,ae)=>N in H?Do(H,N,{enumerable:!0,configurable:!0,writable:!0,value:ae}):H[N]=ae;var f=(H,N,ae)=>Mo(H,typeof N!="symbol"?N+"":N,ae),Oo=(H,N,ae)=>N.has(H)||ni("Cannot "+ae);var ii=(H,N,ae)=>N.has(H)?ni("Cannot add the same private member more than once"):N instanceof WeakSet?N.add(H):N.set(H,ae);var ct=(H,N,ae)=>(Oo(H,N,"access private method"),ae);var he,si,Ca,oi;function H(s){if(!s)return null;try{const e=s.split(".");if(e.length!==3)return null;let t=e[1].replace(/-/g,"+").replace(/_/g,"/");for(;t.length%4;)t+="=";const a=atob(t),n=JSON.parse(a);return typeof n.exp=="number"?n.exp:null}catch{return null}}class N{constructor(){f(this,"_accessToken",null);f(this,"_expEpoch",0)}async get(e){const t=Math.floor(Date.now()/1e3);if(this._accessToken&&this._expEpoch>t+30)return this._accessToken;console.log("[AIAgent SDK] token missing/near-expiry, calling getAccessToken()...");const a=await e();if(!a||!a.accessToken)throw new Error("getAccessToken() must return { accessToken }");return this._accessToken=a.accessToken,this._expEpoch=H(a.accessToken)||t+300,this._accessToken}}async function ae(s,e,t,a,n,i,o,l,r,c,p){const g=s.getReader(),m=new TextDecoder;let b="",w=!1;function S(){w||(w=!0,t())}function _(){for(;;){const R=b.indexOf(`

`);if(R<0)return;const L=b.slice(0,R);if(b=b.slice(R+2),!L)continue;const k={},y=L.split(`
`);for(let h=0;h<y.length;h++){const T=y[h],O=T.indexOf(":");if(O<0)continue;const P=T.slice(0,O).trim();let J=T.slice(O+1);J.length>0&&J.charAt(0)===" "&&(J=J.slice(1)),P==="data"?k.data=(k.data?k.data+`
`:"")+J:k[P]=J}if(k.data&&(k.data=k.data.replace(/\\n/g,`
`)),k.event==="tool_call_start"&&typeof o=="function"){try{const h=JSON.parse(k.data||"{}");console.log("[AIAgent SDK 🚀 tool_call_start]",h),o(h)}catch(h){console.error("[AIAgent SDK] tool_call_start parse failed",h,k.data)}continue}if(k.event==="tool_call"&&typeof n=="function"){try{const h=JSON.parse(k.data||"{}");console.log("[AIAgent SDK 🔧 tool_call]",h),n(h)}catch(h){console.error("[AIAgent SDK] tool_call parse failed",h,k.data)}continue}if(k.event==="tool_call_delta"&&typeof i=="function"){try{const h=JSON.parse(k.data||"{}");console.log("[AIAgent SDK 🔧 tool_call_delta]",h),i(h)}catch(h){console.error("[AIAgent SDK] tool_call_delta parse failed",h,k.data)}continue}if(k.event==="tool_call_end"&&typeof l=="function"){try{const h=k.data?JSON.parse(k.data):{};console.log("[AIAgent SDK 🏁 tool_call_end]",h),l(h)}catch{console.log("[AIAgent SDK 🏁 tool_call_end] (no data)"),l({})}continue}if(k.event==="round_end"&&typeof c=="function"){try{const h=k.data?JSON.parse(k.data):{};console.log("[AIAgent SDK 🔄 round_end]",h),c(h)}catch{c({})}continue}if(k.id==="last"){S();continue}if(k.event==="thinking"&&typeof r=="function"){r(k.data||"");continue}if(k.event==="text"&&typeof p=="function"){p(k.data||"");continue}k.data!==void 0&&e(k)}}try{for(;;){const R=await g.read();if(R.done)break;b+=m.decode(R.value,{stream:!0}),_()}_(),S()}catch(R){a(R)}}function Ft(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}let we=Ft();function Ia(s){we=s}const Ra=/[&<>"']/,ri=new RegExp(Ra.source,"g"),La=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,li=new RegExp(La.source,"g"),di={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Da=s=>di[s];function ne(s,e){if(e){if(Ra.test(s))return s.replace(ri,Da)}else if(La.test(s))return s.replace(li,Da);return s}const ci=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;function pi(s){return s.replace(ci,(e,t)=>(t=t.toLowerCase(),t==="colon"?":":t.charAt(0)==="#"?t.charAt(1)==="x"?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""))}const gi=/(^|[^\[])\^/g;function M(s,e){let t=typeof s=="string"?s:s.source;e=e||"";const a={replace:(n,i)=>{let o=typeof i=="string"?i:i.source;return o=o.replace(gi,"$1"),t=t.replace(n,o),a},getRegex:()=>new RegExp(t,e)};return a}function Ma(s){try{s=encodeURI(s).replace(/%25/g,"%")}catch{return null}return s}const je={exec:()=>null};function Oa(s,e){const t=s.replace(/\|/g,(i,o,l)=>{let r=!1,c=o;for(;--c>=0&&l[c]==="\\";)r=!r;return r?"|":" |"}),a=t.split(/ \|/);let n=0;if(a[0].trim()||a.shift(),a.length>0&&!a[a.length-1].trim()&&a.pop(),e)if(a.length>e)a.splice(e);else for(;a.length<e;)a.push("");for(;n<a.length;n++)a[n]=a[n].trim().replace(/\\\|/g,"|");return a}function qe(s,e,t){const a=s.length;if(a===0)return"";let n=0;for(;n<a&&s.charAt(a-n-1)===e;)n++;return s.slice(0,a-n)}function ui(s,e){if(s.indexOf(e[1])===-1)return-1;let t=0;for(let a=0;a<s.length;a++)if(s[a]==="\\")a++;else if(s[a]===e[0])t++;else if(s[a]===e[1]&&(t--,t<0))return a;return-1}function Pa(s,e,t,a){const n=e.href,i=e.title?ne(e.title):null,o=s[1].replace(/\\([\[\]])/g,"$1");if(s[0].charAt(0)!=="!"){a.state.inLink=!0;const l={type:"link",raw:t,href:n,title:i,text:o,tokens:a.inlineTokens(o)};return a.state.inLink=!1,l}return{type:"image",raw:t,href:n,title:i,text:ne(o)}}function hi(s,e){const t=s.match(/^(\s+)(?:```)/);if(t===null)return e;const a=t[1];return e.split(`
`).map(n=>{const i=n.match(/^\s+/);if(i===null)return n;const[o]=i;return o.length>=a.length?n.slice(a.length):n}).join(`
`)}class pt{constructor(e){f(this,"options");f(this,"rules");f(this,"lexer");this.options=e||we}space(e){const t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){const t=this.rules.block.code.exec(e);if(t){const a=t[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?a:qe(a,`
`)}}}fences(e){const t=this.rules.block.fences.exec(e);if(t){const a=t[0],n=hi(a,t[3]||"");return{type:"code",raw:a,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:n}}}heading(e){const t=this.rules.block.heading.exec(e);if(t){let a=t[2].trim();if(/#$/.test(a)){const n=qe(a,"#");(this.options.pedantic||!n||/ $/.test(n))&&(a=n.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:a,tokens:this.lexer.inline(a)}}}hr(e){const t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:qe(t[0],`
`)}}blockquote(e){const t=this.rules.block.blockquote.exec(e);if(t){let a=qe(t[0],`
`).split(`
`),n="",i="";const o=[];for(;a.length>0;){let l=!1;const r=[];let c;for(c=0;c<a.length;c++)if(/^ {0,3}>/.test(a[c]))r.push(a[c]),l=!0;else if(!l)r.push(a[c]);else break;a=a.slice(c);const p=r.join(`
`),g=p.replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,`
    $1`).replace(/^ {0,3}>[ \t]?/gm,"");n=n?`${n}
${p}`:p,i=i?`${i}
${g}`:g;const m=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(g,o,!0),this.lexer.state.top=m,a.length===0)break;const b=o[o.length-1];if(b?.type==="code")break;if(b?.type==="blockquote"){const w=b,S=w.raw+`
`+a.join(`
`),_=this.blockquote(S);o[o.length-1]=_,n=n.substring(0,n.length-w.raw.length)+_.raw,i=i.substring(0,i.length-w.text.length)+_.text;break}else if(b?.type==="list"){const w=b,S=w.raw+`
`+a.join(`
`),_=this.list(S);o[o.length-1]=_,n=n.substring(0,n.length-b.raw.length)+_.raw,i=i.substring(0,i.length-w.raw.length)+_.raw,a=S.substring(o[o.length-1].raw.length).split(`
`);continue}}return{type:"blockquote",raw:n,tokens:o,text:i}}}list(e){let t=this.rules.block.list.exec(e);if(t){let a=t[1].trim();const n=a.length>1,i={type:"list",raw:"",ordered:n,start:n?+a.slice(0,-1):"",loose:!1,items:[]};a=n?`\\d{1,9}\\${a.slice(-1)}`:`\\${a}`,this.options.pedantic&&(a=n?a:"[*+-]");const o=new RegExp(`^( {0,3}${a})((?:[	 ][^\\n]*)?(?:\\n|$))`);let l=!1;for(;e;){let r=!1,c="",p="";if(!(t=o.exec(e))||this.rules.block.hr.test(e))break;c=t[0],e=e.substring(c.length);let g=t[2].split(`
`,1)[0].replace(/^\t+/,R=>" ".repeat(3*R.length)),m=e.split(`
`,1)[0],b=!g.trim(),w=0;if(this.options.pedantic?(w=2,p=g.trimStart()):b?w=t[1].length+1:(w=t[2].search(/[^ ]/),w=w>4?1:w,p=g.slice(w),w+=t[1].length),b&&/^ *$/.test(m)&&(c+=m+`
`,e=e.substring(m.length+1),r=!0),!r){const R=new RegExp(`^ {0,${Math.min(3,w-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),L=new RegExp(`^ {0,${Math.min(3,w-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),k=new RegExp(`^ {0,${Math.min(3,w-1)}}(?:\`\`\`|~~~)`),y=new RegExp(`^ {0,${Math.min(3,w-1)}}#`);for(;e;){const h=e.split(`
`,1)[0];if(m=h,this.options.pedantic&&(m=m.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),k.test(m)||y.test(m)||R.test(m)||L.test(e))break;if(m.search(/[^ ]/)>=w||!m.trim())p+=`
`+m.slice(w);else{if(b||g.search(/[^ ]/)>=4||k.test(g)||y.test(g)||L.test(g))break;p+=`
`+m}!b&&!m.trim()&&(b=!0),c+=h+`
`,e=e.substring(h.length+1),g=m.slice(w)}}i.loose||(l?i.loose=!0:/\n *\n *$/.test(c)&&(l=!0));let S=null,_;this.options.gfm&&(S=/^\[[ xX]\] /.exec(p),S&&(_=S[0]!=="[ ] ",p=p.replace(/^\[[ xX]\] +/,""))),i.items.push({type:"list_item",raw:c,task:!!S,checked:_,loose:!1,text:p,tokens:[]}),i.raw+=c}i.items[i.items.length-1].raw=i.items[i.items.length-1].raw.trimEnd(),i.items[i.items.length-1].text=i.items[i.items.length-1].text.trimEnd(),i.raw=i.raw.trimEnd();for(let r=0;r<i.items.length;r++)if(this.lexer.state.top=!1,i.items[r].tokens=this.lexer.blockTokens(i.items[r].text,[]),!i.loose){const c=i.items[r].tokens.filter(g=>g.type==="space"),p=c.length>0&&c.some(g=>/\n.*\n/.test(g.raw));i.loose=p}if(i.loose)for(let r=0;r<i.items.length;r++)i.items[r].loose=!0;return i}}html(e){const t=this.rules.block.html.exec(e);if(t)return{type:"html",block:!0,raw:t[0],pre:t[1]==="pre"||t[1]==="script"||t[1]==="style",text:t[0]}}def(e){const t=this.rules.block.def.exec(e);if(t){const a=t[1].toLowerCase().replace(/\s+/g," "),n=t[2]?t[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:a,raw:t[0],href:n,title:i}}}table(e){const t=this.rules.block.table.exec(e);if(!t||!/[:|]/.test(t[2]))return;const a=Oa(t[1]),n=t[2].replace(/^\||\| *$/g,"").split("|"),i=t[3]&&t[3].trim()?t[3].replace(/\n[ \t]*$/,"").split(`
`):[],o={type:"table",raw:t[0],header:[],align:[],rows:[]};if(a.length===n.length){for(const l of n)/^ *-+: *$/.test(l)?o.align.push("right"):/^ *:-+: *$/.test(l)?o.align.push("center"):/^ *:-+ *$/.test(l)?o.align.push("left"):o.align.push(null);for(let l=0;l<a.length;l++)o.header.push({text:a[l],tokens:this.lexer.inline(a[l]),header:!0,align:o.align[l]});for(const l of i)o.rows.push(Oa(l,o.header.length).map((r,c)=>({text:r,tokens:this.lexer.inline(r),header:!1,align:o.align[c]})));return o}}lheading(e){const t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){const t=this.rules.block.paragraph.exec(e);if(t){const a=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:a,tokens:this.lexer.inline(a)}}}text(e){const t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){const t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:ne(t[1])}}tag(e){const t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&/^<a /i.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){const t=this.rules.inline.link.exec(e);if(t){const a=t[2].trim();if(!this.options.pedantic&&/^</.test(a)){if(!/>$/.test(a))return;const o=qe(a.slice(0,-1),"\\");if((a.length-o.length)%2===0)return}else{const o=ui(t[2],"()");if(o>-1){const r=(t[0].indexOf("!")===0?5:4)+t[1].length+o;t[2]=t[2].substring(0,o),t[0]=t[0].substring(0,r).trim(),t[3]=""}}let n=t[2],i="";if(this.options.pedantic){const o=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(n);o&&(n=o[1],i=o[3])}else i=t[3]?t[3].slice(1,-1):"";return n=n.trim(),/^</.test(n)&&(this.options.pedantic&&!/>$/.test(a)?n=n.slice(1):n=n.slice(1,-1)),Pa(t,{href:n&&n.replace(this.rules.inline.anyPunctuation,"$1"),title:i&&i.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer)}}reflink(e,t){let a;if((a=this.rules.inline.reflink.exec(e))||(a=this.rules.inline.nolink.exec(e))){const n=(a[2]||a[1]).replace(/\s+/g," "),i=t[n.toLowerCase()];if(!i){const o=a[0].charAt(0);return{type:"text",raw:o,text:o}}return Pa(a,i,a[0],this.lexer)}}emStrong(e,t,a=""){let n=this.rules.inline.emStrongLDelim.exec(e);if(!n||n[3]&&a.match(/[\p{L}\p{N}]/u))return;if(!(n[1]||n[2]||"")||!a||this.rules.inline.punctuation.exec(a)){const o=[...n[0]].length-1;let l,r,c=o,p=0;const g=n[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(g.lastIndex=0,t=t.slice(-1*e.length+o);(n=g.exec(t))!=null;){if(l=n[1]||n[2]||n[3]||n[4]||n[5]||n[6],!l)continue;if(r=[...l].length,n[3]||n[4]){c+=r;continue}else if((n[5]||n[6])&&o%3&&!((o+r)%3)){p+=r;continue}if(c-=r,c>0)continue;r=Math.min(r,r+c+p);const m=[...n[0]][0].length,b=e.slice(0,o+n.index+m+r);if(Math.min(o,r)%2){const S=b.slice(1,-1);return{type:"em",raw:b,text:S,tokens:this.lexer.inlineTokens(S)}}const w=b.slice(2,-2);return{type:"strong",raw:b,text:w,tokens:this.lexer.inlineTokens(w)}}}}codespan(e){const t=this.rules.inline.code.exec(e);if(t){let a=t[2].replace(/\n/g," ");const n=/[^ ]/.test(a),i=/^ /.test(a)&&/ $/.test(a);return n&&i&&(a=a.substring(1,a.length-1)),a=ne(a,!0),{type:"codespan",raw:t[0],text:a}}}br(e){const t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e){const t=this.rules.inline.del.exec(e);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e){const t=this.rules.inline.autolink.exec(e);if(t){let a,n;return t[2]==="@"?(a=ne(t[1]),n="mailto:"+a):(a=ne(t[1]),n=a),{type:"link",raw:t[0],text:a,href:n,tokens:[{type:"text",raw:a,text:a}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let a,n;if(t[2]==="@")a=ne(t[0]),n="mailto:"+a;else{let i;do i=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??"";while(i!==t[0]);a=ne(t[0]),t[1]==="www."?n="http://"+t[0]:n=t[0]}return{type:"link",raw:t[0],text:a,href:n,tokens:[{type:"text",raw:a,text:a}]}}}inlineText(e){const t=this.rules.inline.text.exec(e);if(t){let a;return this.lexer.state.inRawBlock?a=t[0]:a=ne(t[0]),{type:"text",raw:t[0],text:a}}}}const fi=/^(?: *(?:\n|$))+/,mi=/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,bi=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,Ue=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,ki=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,za=/(?:[*+-]|\d{1,9}[.)])/,Na=M(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g,za).replace(/blockCode/g,/ {4}/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).getRegex(),Gt=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,xi=/^[^\n]+/,Wt=/(?!\s*\])(?:\\.|[^\[\]\\])+/,yi=M(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/).replace("label",Wt).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),vi=M(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,za).getRegex(),gt="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",Yt=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,wi=M("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))","i").replace("comment",Yt).replace("tag",gt).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),$a=M(Gt).replace("hr",Ue).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",gt).getRegex(),Kt={blockquote:M(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",$a).getRegex(),code:mi,def:yi,fences:bi,heading:ki,hr:Ue,html:wi,lheading:Na,list:vi,newline:fi,paragraph:$a,table:je,text:xi},Ba=M("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",Ue).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",gt).getRegex(),_i={...Kt,table:Ba,paragraph:M(Gt).replace("hr",Ue).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Ba).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",gt).getRegex()},Ti={...Kt,html:M(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",Yt).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:je,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:M(Gt).replace("hr",Ue).replace("heading",` *#{1,6} *[^
]`).replace("lheading",Na).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Ha=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Si=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,ja=/^( {2,}|\\)\n(?!\s*$)/,Ei=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Fe="\\p{P}\\p{S}",Ai=M(/^((?![*_])[\spunctuation])/,"u").replace(/punctuation/g,Fe).getRegex(),Ci=/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g,Ii=M(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,"u").replace(/punct/g,Fe).getRegex(),Ri=M("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])","gu").replace(/punct/g,Fe).getRegex(),Li=M("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])","gu").replace(/punct/g,Fe).getRegex(),Di=M(/\\([punct])/,"gu").replace(/punct/g,Fe).getRegex(),Mi=M(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Oi=M(Yt).replace("(?:-->|$)","-->").getRegex(),Pi=M("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",Oi).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),ut=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,zi=M(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label",ut).replace("href",/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),qa=M(/^!?\[(label)\]\[(ref)\]/).replace("label",ut).replace("ref",Wt).getRegex(),Ua=M(/^!?\[(ref)\](?:\[\])?/).replace("ref",Wt).getRegex(),Ni=M("reflink|nolink(?!\\()","g").replace("reflink",qa).replace("nolink",Ua).getRegex(),Xt={_backpedal:je,anyPunctuation:Di,autolink:Mi,blockSkip:Ci,br:ja,code:Si,del:je,emStrongLDelim:Ii,emStrongRDelimAst:Ri,emStrongRDelimUnd:Li,escape:Ha,link:zi,nolink:Ua,punctuation:Ai,reflink:qa,reflinkSearch:Ni,tag:Pi,text:Ei,url:je},$i={...Xt,link:M(/^!?\[(label)\]\((.*?)\)/).replace("label",ut).getRegex(),reflink:M(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",ut).getRegex()},Jt={...Xt,escape:M(Ha).replace("])","~|])").getRegex(),url:M(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},Bi={...Jt,br:M(ja).replace("{2,}","*").getRegex(),text:M(Jt.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},ht={normal:Kt,gfm:_i,pedantic:Ti},Ge={normal:Xt,gfm:Jt,breaks:Bi,pedantic:$i};class oe{constructor(e){f(this,"tokens");f(this,"options");f(this,"state");f(this,"tokenizer");f(this,"inlineQueue");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||we,this.options.tokenizer=this.options.tokenizer||new pt,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const t={block:ht.normal,inline:Ge.normal};this.options.pedantic?(t.block=ht.pedantic,t.inline=Ge.pedantic):this.options.gfm&&(t.block=ht.gfm,this.options.breaks?t.inline=Ge.breaks:t.inline=Ge.gfm),this.tokenizer.rules=t}static get rules(){return{block:ht,inline:Ge}}static lex(e,t){return new oe(t).lex(e)}static lexInline(e,t){return new oe(t).inlineTokens(e)}lex(e){e=e.replace(/\r\n|\r/g,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){const a=this.inlineQueue[t];this.inlineTokens(a.src,a.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],a=!1){this.options.pedantic?e=e.replace(/\t/g,"    ").replace(/^ +$/gm,""):e=e.replace(/^( *)(\t+)/gm,(l,r,c)=>r+"    ".repeat(c.length));let n,i,o;for(;e;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(l=>(n=l.call({lexer:this},e,t))?(e=e.substring(n.raw.length),t.push(n),!0):!1))){if(n=this.tokenizer.space(e)){e=e.substring(n.raw.length),n.raw.length===1&&t.length>0?t[t.length-1].raw+=`
`:t.push(n);continue}if(n=this.tokenizer.code(e)){e=e.substring(n.raw.length),i=t[t.length-1],i&&(i.type==="paragraph"||i.type==="text")?(i.raw+=`
`+n.raw,i.text+=`
`+n.text,this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(n);continue}if(n=this.tokenizer.fences(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.heading(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.hr(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.blockquote(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.list(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.html(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.def(e)){e=e.substring(n.raw.length),i=t[t.length-1],i&&(i.type==="paragraph"||i.type==="text")?(i.raw+=`
`+n.raw,i.text+=`
`+n.raw,this.inlineQueue[this.inlineQueue.length-1].src=i.text):this.tokens.links[n.tag]||(this.tokens.links[n.tag]={href:n.href,title:n.title});continue}if(n=this.tokenizer.table(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.lheading(e)){e=e.substring(n.raw.length),t.push(n);continue}if(o=e,this.options.extensions&&this.options.extensions.startBlock){let l=1/0;const r=e.slice(1);let c;this.options.extensions.startBlock.forEach(p=>{c=p.call({lexer:this},r),typeof c=="number"&&c>=0&&(l=Math.min(l,c))}),l<1/0&&l>=0&&(o=e.substring(0,l+1))}if(this.state.top&&(n=this.tokenizer.paragraph(o))){i=t[t.length-1],a&&i?.type==="paragraph"?(i.raw+=`
`+n.raw,i.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(n),a=o.length!==e.length,e=e.substring(n.raw.length);continue}if(n=this.tokenizer.text(e)){e=e.substring(n.raw.length),i=t[t.length-1],i&&i.type==="text"?(i.raw+=`
`+n.raw,i.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=i.text):t.push(n);continue}if(e){const l="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(l);break}else throw new Error(l)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let a,n,i,o=e,l,r,c;if(this.tokens.links){const p=Object.keys(this.tokens.links);if(p.length>0)for(;(l=this.tokenizer.rules.inline.reflinkSearch.exec(o))!=null;)p.includes(l[0].slice(l[0].lastIndexOf("[")+1,-1))&&(o=o.slice(0,l.index)+"["+"a".repeat(l[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(l=this.tokenizer.rules.inline.blockSkip.exec(o))!=null;)o=o.slice(0,l.index)+"["+"a".repeat(l[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;(l=this.tokenizer.rules.inline.anyPunctuation.exec(o))!=null;)o=o.slice(0,l.index)+"++"+o.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;e;)if(r||(c=""),r=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(p=>(a=p.call({lexer:this},e,t))?(e=e.substring(a.raw.length),t.push(a),!0):!1))){if(a=this.tokenizer.escape(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.tag(e)){e=e.substring(a.raw.length),n=t[t.length-1],n&&a.type==="text"&&n.type==="text"?(n.raw+=a.raw,n.text+=a.text):t.push(a);continue}if(a=this.tokenizer.link(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(a.raw.length),n=t[t.length-1],n&&a.type==="text"&&n.type==="text"?(n.raw+=a.raw,n.text+=a.text):t.push(a);continue}if(a=this.tokenizer.emStrong(e,o,c)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.codespan(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.br(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.del(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.autolink(e)){e=e.substring(a.raw.length),t.push(a);continue}if(!this.state.inLink&&(a=this.tokenizer.url(e))){e=e.substring(a.raw.length),t.push(a);continue}if(i=e,this.options.extensions&&this.options.extensions.startInline){let p=1/0;const g=e.slice(1);let m;this.options.extensions.startInline.forEach(b=>{m=b.call({lexer:this},g),typeof m=="number"&&m>=0&&(p=Math.min(p,m))}),p<1/0&&p>=0&&(i=e.substring(0,p+1))}if(a=this.tokenizer.inlineText(i)){e=e.substring(a.raw.length),a.raw.slice(-1)!=="_"&&(c=a.raw.slice(-1)),r=!0,n=t[t.length-1],n&&n.type==="text"?(n.raw+=a.raw,n.text+=a.text):t.push(a);continue}if(e){const p="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(p);break}else throw new Error(p)}}return t}}class ft{constructor(e){f(this,"options");f(this,"parser");this.options=e||we}space(e){return""}code({text:e,lang:t,escaped:a}){const n=(t||"").match(/^\S*/)?.[0],i=e.replace(/\n$/,"")+`
`;return n?'<pre><code class="language-'+ne(n)+'">'+(a?i:ne(i,!0))+`</code></pre>
`:"<pre><code>"+(a?i:ne(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){const t=e.ordered,a=e.start;let n="";for(let l=0;l<e.items.length;l++){const r=e.items[l];n+=this.listitem(r)}const i=t?"ol":"ul",o=t&&a!==1?' start="'+a+'"':"";return"<"+i+o+`>
`+n+"</"+i+`>
`}listitem(e){let t="";if(e.task){const a=this.checkbox({checked:!!e.checked});e.loose?e.tokens.length>0&&e.tokens[0].type==="paragraph"?(e.tokens[0].text=a+" "+e.tokens[0].text,e.tokens[0].tokens&&e.tokens[0].tokens.length>0&&e.tokens[0].tokens[0].type==="text"&&(e.tokens[0].tokens[0].text=a+" "+e.tokens[0].tokens[0].text)):e.tokens.unshift({type:"text",raw:a+" ",text:a+" "}):t+=a+" "}return t+=this.parser.parse(e.tokens,!!e.loose),`<li>${t}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t="",a="";for(let i=0;i<e.header.length;i++)a+=this.tablecell(e.header[i]);t+=this.tablerow({text:a});let n="";for(let i=0;i<e.rows.length;i++){const o=e.rows[i];a="";for(let l=0;l<o.length;l++)a+=this.tablecell(o[l]);n+=this.tablerow({text:a})}return n&&(n=`<tbody>${n}</tbody>`),`<table>
<thead>
`+t+`</thead>
`+n+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){const t=this.parser.parseInline(e.tokens),a=e.header?"th":"td";return(e.align?`<${a} align="${e.align}">`:`<${a}>`)+t+`</${a}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${e}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:a}){const n=this.parser.parseInline(a),i=Ma(e);if(i===null)return n;e=i;let o='<a href="'+e+'"';return t&&(o+=' title="'+t+'"'),o+=">"+n+"</a>",o}image({href:e,title:t,text:a}){const n=Ma(e);if(n===null)return a;e=n;let i=`<img src="${e}" alt="${a}"`;return t&&(i+=` title="${t}"`),i+=">",i}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):e.text}}class Zt{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}}class re{constructor(e){f(this,"options");f(this,"renderer");f(this,"textRenderer");this.options=e||we,this.options.renderer=this.options.renderer||new ft,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Zt}static parse(e,t){return new re(t).parse(e)}static parseInline(e,t){return new re(t).parseInline(e)}parse(e,t=!0){let a="";for(let n=0;n<e.length;n++){const i=e[n];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){const l=i,r=this.options.extensions.renderers[l.type].call({parser:this},l);if(r!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(l.type)){a+=r||"";continue}}const o=i;switch(o.type){case"space":{a+=this.renderer.space(o);continue}case"hr":{a+=this.renderer.hr(o);continue}case"heading":{a+=this.renderer.heading(o);continue}case"code":{a+=this.renderer.code(o);continue}case"table":{a+=this.renderer.table(o);continue}case"blockquote":{a+=this.renderer.blockquote(o);continue}case"list":{a+=this.renderer.list(o);continue}case"html":{a+=this.renderer.html(o);continue}case"paragraph":{a+=this.renderer.paragraph(o);continue}case"text":{let l=o,r=this.renderer.text(l);for(;n+1<e.length&&e[n+1].type==="text";)l=e[++n],r+=`
`+this.renderer.text(l);t?a+=this.renderer.paragraph({type:"paragraph",raw:r,text:r,tokens:[{type:"text",raw:r,text:r}]}):a+=r;continue}default:{const l='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return a}parseInline(e,t){t=t||this.renderer;let a="";for(let n=0;n<e.length;n++){const i=e[n];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){const l=this.options.extensions.renderers[i.type].call({parser:this},i);if(l!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){a+=l||"";continue}}const o=i;switch(o.type){case"escape":{a+=t.text(o);break}case"html":{a+=t.html(o);break}case"link":{a+=t.link(o);break}case"image":{a+=t.image(o);break}case"strong":{a+=t.strong(o);break}case"em":{a+=t.em(o);break}case"codespan":{a+=t.codespan(o);break}case"br":{a+=t.br(o);break}case"del":{a+=t.del(o);break}case"text":{a+=t.text(o);break}default:{const l='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return a}}class We{constructor(e){f(this,"options");this.options=e||we}preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}}f(We,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens"]));class Hi{constructor(...e){ii(this,he);f(this,"defaults",Ft());f(this,"options",this.setOptions);f(this,"parse",ct(this,he,Ca).call(this,oe.lex,re.parse));f(this,"parseInline",ct(this,he,Ca).call(this,oe.lexInline,re.parseInline));f(this,"Parser",re);f(this,"Renderer",ft);f(this,"TextRenderer",Zt);f(this,"Lexer",oe);f(this,"Tokenizer",pt);f(this,"Hooks",We);this.use(...e)}walkTokens(e,t){let a=[];for(const n of e)switch(a=a.concat(t.call(this,n)),n.type){case"table":{const i=n;for(const o of i.header)a=a.concat(this.walkTokens(o.tokens,t));for(const o of i.rows)for(const l of o)a=a.concat(this.walkTokens(l.tokens,t));break}case"list":{const i=n;a=a.concat(this.walkTokens(i.items,t));break}default:{const i=n;this.defaults.extensions?.childTokens?.[i.type]?this.defaults.extensions.childTokens[i.type].forEach(o=>{const l=i[o].flat(1/0);a=a.concat(this.walkTokens(l,t))}):i.tokens&&(a=a.concat(this.walkTokens(i.tokens,t)))}}return a}use(...e){const t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(a=>{const n={...a};if(n.async=this.defaults.async||n.async||!1,a.extensions&&(a.extensions.forEach(i=>{if(!i.name)throw new Error("extension name required");if("renderer"in i){const o=t.renderers[i.name];o?t.renderers[i.name]=function(...l){let r=i.renderer.apply(this,l);return r===!1&&(r=o.apply(this,l)),r}:t.renderers[i.name]=i.renderer}if("tokenizer"in i){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");const o=t[i.level];o?o.unshift(i.tokenizer):t[i.level]=[i.tokenizer],i.start&&(i.level==="block"?t.startBlock?t.startBlock.push(i.start):t.startBlock=[i.start]:i.level==="inline"&&(t.startInline?t.startInline.push(i.start):t.startInline=[i.start]))}"childTokens"in i&&i.childTokens&&(t.childTokens[i.name]=i.childTokens)}),n.extensions=t),a.renderer){const i=this.defaults.renderer||new ft(this.defaults);for(const o in a.renderer){if(!(o in i))throw new Error(`renderer '${o}' does not exist`);if(["options","parser"].includes(o))continue;const l=o;let r=a.renderer[l];a.useNewRenderer||(r=ct(this,he,si).call(this,r,l,i));const c=i[l];i[l]=(...p)=>{let g=r.apply(i,p);return g===!1&&(g=c.apply(i,p)),g||""}}n.renderer=i}if(a.tokenizer){const i=this.defaults.tokenizer||new pt(this.defaults);for(const o in a.tokenizer){if(!(o in i))throw new Error(`tokenizer '${o}' does not exist`);if(["options","rules","lexer"].includes(o))continue;const l=o,r=a.tokenizer[l],c=i[l];i[l]=(...p)=>{let g=r.apply(i,p);return g===!1&&(g=c.apply(i,p)),g}}n.tokenizer=i}if(a.hooks){const i=this.defaults.hooks||new We;for(const o in a.hooks){if(!(o in i))throw new Error(`hook '${o}' does not exist`);if(o==="options")continue;const l=o,r=a.hooks[l],c=i[l];We.passThroughHooks.has(o)?i[l]=p=>{if(this.defaults.async)return Promise.resolve(r.call(i,p)).then(m=>c.call(i,m));const g=r.call(i,p);return c.call(i,g)}:i[l]=(...p)=>{let g=r.apply(i,p);return g===!1&&(g=c.apply(i,p)),g}}n.hooks=i}if(a.walkTokens){const i=this.defaults.walkTokens,o=a.walkTokens;n.walkTokens=function(l){let r=[];return r.push(o.call(this,l)),i&&(r=r.concat(i.call(this,l))),r}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return oe.lex(e,t??this.defaults)}parser(e,t){return re.parse(e,t??this.defaults)}}he=new WeakSet,si=function(e,t,a){switch(t){case"heading":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,a.parser.parseInline(n.tokens),n.depth,pi(a.parser.parseInline(n.tokens,a.parser.textRenderer)))};case"code":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.text,n.lang,!!n.escaped)};case"table":return function(n){if(!n.type||n.type!==t)return e.apply(this,arguments);let i="",o="";for(let r=0;r<n.header.length;r++)o+=this.tablecell({text:n.header[r].text,tokens:n.header[r].tokens,header:!0,align:n.align[r]});i+=this.tablerow({text:o});let l="";for(let r=0;r<n.rows.length;r++){const c=n.rows[r];o="";for(let p=0;p<c.length;p++)o+=this.tablecell({text:c[p].text,tokens:c[p].tokens,header:!1,align:n.align[p]});l+=this.tablerow({text:o})}return e.call(this,i,l)};case"blockquote":return function(n){if(!n.type||n.type!==t)return e.apply(this,arguments);const i=this.parser.parse(n.tokens);return e.call(this,i)};case"list":return function(n){if(!n.type||n.type!==t)return e.apply(this,arguments);const i=n.ordered,o=n.start,l=n.loose;let r="";for(let c=0;c<n.items.length;c++){const p=n.items[c],g=p.checked,m=p.task;let b="";if(p.task){const w=this.checkbox({checked:!!g});l?p.tokens.length>0&&p.tokens[0].type==="paragraph"?(p.tokens[0].text=w+" "+p.tokens[0].text,p.tokens[0].tokens&&p.tokens[0].tokens.length>0&&p.tokens[0].tokens[0].type==="text"&&(p.tokens[0].tokens[0].text=w+" "+p.tokens[0].tokens[0].text)):p.tokens.unshift({type:"text",text:w+" "}):b+=w+" "}b+=this.parser.parse(p.tokens,l),r+=this.listitem({type:"list_item",raw:b,text:b,task:m,checked:!!g,loose:l,tokens:p.tokens})}return e.call(this,r,i,o)};case"html":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.text,n.block)};case"paragraph":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(n.tokens))};case"escape":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.text)};case"link":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.href,n.title,this.parser.parseInline(n.tokens))};case"image":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.href,n.title,n.text)};case"strong":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(n.tokens))};case"em":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(n.tokens))};case"codespan":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.text)};case"del":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,this.parser.parseInline(n.tokens))};case"text":return function(n){return!n.type||n.type!==t?e.apply(this,arguments):e.call(this,n.text)}}return e},Ca=function(e,t){return(a,n)=>{const i={...n},o={...this.defaults,...i};this.defaults.async===!0&&i.async===!1&&(o.silent||console.warn("marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored."),o.async=!0);const l=ct(this,he,oi).call(this,!!o.silent,!!o.async);if(typeof a>"u"||a===null)return l(new Error("marked(): input parameter is undefined or null"));if(typeof a!="string")return l(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(a)+", string expected"));if(o.hooks&&(o.hooks.options=o),o.async)return Promise.resolve(o.hooks?o.hooks.preprocess(a):a).then(r=>e(r,o)).then(r=>o.hooks?o.hooks.processAllTokens(r):r).then(r=>o.walkTokens?Promise.all(this.walkTokens(r,o.walkTokens)).then(()=>r):r).then(r=>t(r,o)).then(r=>o.hooks?o.hooks.postprocess(r):r).catch(l);try{o.hooks&&(a=o.hooks.preprocess(a));let r=e(a,o);o.hooks&&(r=o.hooks.processAllTokens(r)),o.walkTokens&&this.walkTokens(r,o.walkTokens);let c=t(r,o);return o.hooks&&(c=o.hooks.postprocess(c)),c}catch(r){return l(r)}}},oi=function(e,t){return a=>{if(a.message+=`
Please report this to https://github.com/markedjs/marked.`,e){const n="<p>An error occurred:</p><pre>"+ne(a.message+"",!0)+"</pre>";return t?Promise.resolve(n):n}if(t)return Promise.reject(a);throw a}};const _e=new Hi;function D(s,e){return _e.parse(s,e)}D.options=D.setOptions=function(s){return _e.setOptions(s),D.defaults=_e.defaults,Ia(D.defaults),D},D.getDefaults=Ft,D.defaults=we,D.use=function(...s){return _e.use(...s),D.defaults=_e.defaults,Ia(D.defaults),D},D.walkTokens=function(s,e){return _e.walkTokens(s,e)},D.parseInline=_e.parseInline,D.Parser=re,D.parser=re.parse,D.Renderer=ft,D.TextRenderer=Zt,D.Lexer=oe,D.lexer=oe.lex,D.Tokenizer=pt,D.Hooks=We,D.parse=D,D.options,D.setOptions,D.use,D.walkTokens,D.parseInline,re.parse,oe.lex;/*! @license DOMPurify 3.4.9 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.9/LICENSE */function Fa(s,e){(e==null||e>s.length)&&(e=s.length);for(var t=0,a=Array(e);t<e;t++)a[t]=s[t];return a}function ji(s){if(Array.isArray(s))return s}function qi(s,e){var t=s==null?null:typeof Symbol<"u"&&s[Symbol.iterator]||s["@@iterator"];if(t!=null){var a,n,i,o,l=[],r=!0,c=!1;try{if(i=(t=t.call(s)).next,e!==0)for(;!(r=(a=i.call(t)).done)&&(l.push(a.value),l.length!==e);r=!0);}catch(p){c=!0,n=p}finally{try{if(!r&&t.return!=null&&(o=t.return(),Object(o)!==o))return}finally{if(c)throw n}}return l}}function Ui(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Fi(s,e){return ji(s)||qi(s,e)||Gi(s,e)||Ui()}function Gi(s,e){if(s){if(typeof s=="string")return Fa(s,e);var t={}.toString.call(s).slice(8,-1);return t==="Object"&&s.constructor&&(t=s.constructor.name),t==="Map"||t==="Set"?Array.from(s):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?Fa(s,e):void 0}}const Ga=Object.entries,Wa=Object.setPrototypeOf,Wi=Object.isFrozen,Yi=Object.getPrototypeOf,Ki=Object.getOwnPropertyDescriptor;let V=Object.freeze,ie=Object.seal,Ie=Object.create,Ya=typeof Reflect<"u"&&Reflect,Vt=Ya.apply,Qt=Ya.construct;V||(V=function(e){return e}),ie||(ie=function(e){return e}),Vt||(Vt=function(e,t){for(var a=arguments.length,n=new Array(a>2?a-2:0),i=2;i<a;i++)n[i-2]=arguments[i];return e.apply(t,n)}),Qt||(Qt=function(e){for(var t=arguments.length,a=new Array(t>1?t-1:0),n=1;n<t;n++)a[n-1]=arguments[n];return new e(...a)});const ue=G(Array.prototype.forEach),Xi=G(Array.prototype.lastIndexOf),Ka=G(Array.prototype.pop),Re=G(Array.prototype.push),Ji=G(Array.prototype.splice),Q=Array.isArray,Ye=G(String.prototype.toLowerCase),ea=G(String.prototype.toString),Xa=G(String.prototype.match),Le=G(String.prototype.replace),Ja=G(String.prototype.indexOf),Zi=G(String.prototype.trim),Vi=G(Number.prototype.toString),Qi=G(Boolean.prototype.toString),Za=typeof BigInt>"u"?null:G(BigInt.prototype.toString),Va=typeof Symbol>"u"?null:G(Symbol.prototype.toString),$=G(Object.prototype.hasOwnProperty),Ke=G(Object.prototype.toString),X=G(RegExp.prototype.test),Te=es(TypeError);function G(s){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var t=arguments.length,a=new Array(t>1?t-1:0),n=1;n<t;n++)a[n-1]=arguments[n];return Vt(s,e,a)}}function es(s){return function(){for(var e=arguments.length,t=new Array(e),a=0;a<e;a++)t[a]=arguments[a];return Qt(s,t)}}function C(s,e){let t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:Ye;if(Wa&&Wa(s,null),!Q(e))return s;let a=e.length;for(;a--;){let n=e[a];if(typeof n=="string"){const i=t(n);i!==n&&(Wi(e)||(e[a]=i),n=i)}s[n]=!0}return s}function ts(s){for(let e=0;e<s.length;e++)$(s,e)||(s[e]=null);return s}function Z(s){const e=Ie(null);for(const a of Ga(s)){var t=Fi(a,2);const n=t[0],i=t[1];$(s,n)&&(Q(i)?e[n]=ts(i):i&&typeof i=="object"&&i.constructor===Object?e[n]=Z(i):e[n]=i)}return e}function as(s){switch(typeof s){case"string":return s;case"number":return Vi(s);case"boolean":return Qi(s);case"bigint":return Za?Za(s):"0";case"symbol":return Va?Va(s):"Symbol()";case"undefined":return Ke(s);case"function":case"object":{if(s===null)return Ke(s);const e=s,t=le(e,"toString");if(typeof t=="function"){const a=t(e);return typeof a=="string"?a:Ke(a)}return Ke(s)}default:return Ke(s)}}function le(s,e){for(;s!==null;){const a=Ki(s,e);if(a){if(a.get)return G(a.get);if(typeof a.value=="function")return G(a.value)}s=Yi(s)}function t(){return null}return t}function ns(s){try{return X(s,""),!0}catch{return!1}}const Qa=V(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),ta=V(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),aa=V(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),is=V(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),na=V(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),ss=V(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),en=V(["#text"]),tn=V(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),ia=V(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),an=V(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),mt=V(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),os=ie(/{{[\w\W]*|^[\w\W]*}}/g),rs=ie(/<%[\w\W]*|^[\w\W]*%>/g),ls=ie(/\${[\w\W]*/g),ds=ie(/^data-[\-\w.\u00B7-\uFFFF]+$/),cs=ie(/^aria-[\-\w]+$/),nn=ie(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),ps=ie(/^(?:\w+script|data):/i),gs=ie(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),us=ie(/^html$/i),hs=ie(/^[a-z][.\w]*(-[.\w]+)+$/i),de={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,progressingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},fs=function(){return typeof window>"u"?null:window},ms=function(e,t){if(typeof e!="object"||typeof e.createPolicy!="function")return null;let a=null;const n="data-tt-policy-suffix";t&&t.hasAttribute(n)&&(a=t.getAttribute(n));const i="dompurify"+(a?"#"+a:"");try{return e.createPolicy(i,{createHTML(o){return o},createScriptURL(o){return o}})}catch{return console.warn("TrustedTypes policy "+i+" could not be created."),null}},sn=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function on(){let s=arguments.length>0&&arguments[0]!==void 0?arguments[0]:fs();const e=v=>on(v);if(e.version="3.4.9",e.removed=[],!s||!s.document||s.document.nodeType!==de.document||!s.Element)return e.isSupported=!1,e;let t=s.document;const a=t,n=a.currentScript;s.DocumentFragment;const i=s.HTMLTemplateElement,o=s.Node,l=s.Element,r=s.NodeFilter,c=s.NamedNodeMap;c===void 0&&(s.NamedNodeMap||s.MozNamedAttrMap),s.HTMLFormElement;const p=s.DOMParser,g=s.trustedTypes,m=l.prototype,b=le(m,"cloneNode"),w=le(m,"remove"),S=le(m,"nextSibling"),_=le(m,"childNodes"),R=le(m,"parentNode"),L=le(m,"shadowRoot"),k=le(m,"attributes"),y=o&&o.prototype?le(o.prototype,"nodeType"):null,h=o&&o.prototype?le(o.prototype,"nodeName"):null;if(typeof i=="function"){const v=t.createElement("template");v.content&&v.content.ownerDocument&&(t=v.content.ownerDocument)}let T,O="",P,J=!1,fe=0;const it=function(){if(fe>0)throw Te('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')},me=function(d){it(),fe++;try{return T.createHTML(d)}finally{fe--}},be=function(d){it(),fe++;try{return T.createScriptURL(d)}finally{fe--}},st=function(){return J||(P=ms(g,n),J=!0),P},Mt=t,pa=Mt.implementation,Mn=Mt.createNodeIterator,mo=Mt.createDocumentFragment,bo=Mt.getElementsByTagName,ko=a.importNode;let Y=sn();e.isSupported=typeof Ga=="function"&&typeof R=="function"&&pa&&pa.createHTMLDocument!==void 0;const Ot=os,Pt=rs,zt=ls,xo=ds,yo=cs,vo=ps,On=gs,wo=hs;let Pn=nn,j=null;const ga=C({},[...Qa,...ta,...aa,...na,...en]);let q=null;const ua=C({},[...tn,...ia,...an,...mt]);let U=Object.seal(Ie(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),ot=null,Nt=null;const xe=Object.seal(Ie(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let zn=!0,ha=!0,Nn=!1,$n=!0,ye=!1,rt=!0,Ae=!1,fa=!1,ma=!1,ze=!1,$t=!1,Bt=!1,Bn=!0,Hn=!1;const jn="user-content-";let ba=!0,ka=!1,Ne={},pe=null;const xa=C({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]);let qn=null;const Un=C({},["audio","video","img","source","image","track"]);let ya=null;const Fn=C({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Ht="http://www.w3.org/1998/Math/MathML",jt="http://www.w3.org/2000/svg",ge="http://www.w3.org/1999/xhtml";let $e=ge,va=!1,wa=null;const _o=C({},[Ht,jt,ge],ea);let _a=C({},["mi","mo","mn","ms","mtext"]),Ta=C({},["annotation-xml"]);const To=C({},["title","style","font","a","script"]);let lt=null;const So=["application/xhtml+xml","text/html"],Eo="text/html";let B=null,Be=null;const Ao=t.createElement("form"),Gn=function(d){return d instanceof RegExp||d instanceof Function},Sa=function(){let d=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(Be&&Be===d)return;(!d||typeof d!="object")&&(d={}),d=Z(d),lt=So.indexOf(d.PARSER_MEDIA_TYPE)===-1?Eo:d.PARSER_MEDIA_TYPE,B=lt==="application/xhtml+xml"?ea:Ye,j=$(d,"ALLOWED_TAGS")&&Q(d.ALLOWED_TAGS)?C({},d.ALLOWED_TAGS,B):ga,q=$(d,"ALLOWED_ATTR")&&Q(d.ALLOWED_ATTR)?C({},d.ALLOWED_ATTR,B):ua,wa=$(d,"ALLOWED_NAMESPACES")&&Q(d.ALLOWED_NAMESPACES)?C({},d.ALLOWED_NAMESPACES,ea):_o,ya=$(d,"ADD_URI_SAFE_ATTR")&&Q(d.ADD_URI_SAFE_ATTR)?C(Z(Fn),d.ADD_URI_SAFE_ATTR,B):Fn,qn=$(d,"ADD_DATA_URI_TAGS")&&Q(d.ADD_DATA_URI_TAGS)?C(Z(Un),d.ADD_DATA_URI_TAGS,B):Un,pe=$(d,"FORBID_CONTENTS")&&Q(d.FORBID_CONTENTS)?C({},d.FORBID_CONTENTS,B):xa,ot=$(d,"FORBID_TAGS")&&Q(d.FORBID_TAGS)?C({},d.FORBID_TAGS,B):Z({}),Nt=$(d,"FORBID_ATTR")&&Q(d.FORBID_ATTR)?C({},d.FORBID_ATTR,B):Z({}),Ne=$(d,"USE_PROFILES")?d.USE_PROFILES&&typeof d.USE_PROFILES=="object"?Z(d.USE_PROFILES):d.USE_PROFILES:!1,zn=d.ALLOW_ARIA_ATTR!==!1,ha=d.ALLOW_DATA_ATTR!==!1,Nn=d.ALLOW_UNKNOWN_PROTOCOLS||!1,$n=d.ALLOW_SELF_CLOSE_IN_ATTR!==!1,ye=d.SAFE_FOR_TEMPLATES||!1,rt=d.SAFE_FOR_XML!==!1,Ae=d.WHOLE_DOCUMENT||!1,ze=d.RETURN_DOM||!1,$t=d.RETURN_DOM_FRAGMENT||!1,Bt=d.RETURN_TRUSTED_TYPE||!1,ma=d.FORCE_BODY||!1,Bn=d.SANITIZE_DOM!==!1,Hn=d.SANITIZE_NAMED_PROPS||!1,ba=d.KEEP_CONTENT!==!1,ka=d.IN_PLACE||!1,Pn=ns(d.ALLOWED_URI_REGEXP)?d.ALLOWED_URI_REGEXP:nn,$e=typeof d.NAMESPACE=="string"?d.NAMESPACE:ge,_a=$(d,"MATHML_TEXT_INTEGRATION_POINTS")&&d.MATHML_TEXT_INTEGRATION_POINTS&&typeof d.MATHML_TEXT_INTEGRATION_POINTS=="object"?Z(d.MATHML_TEXT_INTEGRATION_POINTS):C({},["mi","mo","mn","ms","mtext"]),Ta=$(d,"HTML_INTEGRATION_POINTS")&&d.HTML_INTEGRATION_POINTS&&typeof d.HTML_INTEGRATION_POINTS=="object"?Z(d.HTML_INTEGRATION_POINTS):C({},["annotation-xml"]);const u=$(d,"CUSTOM_ELEMENT_HANDLING")&&d.CUSTOM_ELEMENT_HANDLING&&typeof d.CUSTOM_ELEMENT_HANDLING=="object"?Z(d.CUSTOM_ELEMENT_HANDLING):Ie(null);if(U=Ie(null),$(u,"tagNameCheck")&&Gn(u.tagNameCheck)&&(U.tagNameCheck=u.tagNameCheck),$(u,"attributeNameCheck")&&Gn(u.attributeNameCheck)&&(U.attributeNameCheck=u.attributeNameCheck),$(u,"allowCustomizedBuiltInElements")&&typeof u.allowCustomizedBuiltInElements=="boolean"&&(U.allowCustomizedBuiltInElements=u.allowCustomizedBuiltInElements),ye&&(ha=!1),$t&&(ze=!0),Ne&&(j=C({},en),q=Ie(null),Ne.html===!0&&(C(j,Qa),C(q,tn)),Ne.svg===!0&&(C(j,ta),C(q,ia),C(q,mt)),Ne.svgFilters===!0&&(C(j,aa),C(q,ia),C(q,mt)),Ne.mathMl===!0&&(C(j,na),C(q,an),C(q,mt))),xe.tagCheck=null,xe.attributeCheck=null,$(d,"ADD_TAGS")&&(typeof d.ADD_TAGS=="function"?xe.tagCheck=d.ADD_TAGS:Q(d.ADD_TAGS)&&(j===ga&&(j=Z(j)),C(j,d.ADD_TAGS,B))),$(d,"ADD_ATTR")&&(typeof d.ADD_ATTR=="function"?xe.attributeCheck=d.ADD_ATTR:Q(d.ADD_ATTR)&&(q===ua&&(q=Z(q)),C(q,d.ADD_ATTR,B))),$(d,"ADD_URI_SAFE_ATTR")&&Q(d.ADD_URI_SAFE_ATTR)&&C(ya,d.ADD_URI_SAFE_ATTR,B),$(d,"FORBID_CONTENTS")&&Q(d.FORBID_CONTENTS)&&(pe===xa&&(pe=Z(pe)),C(pe,d.FORBID_CONTENTS,B)),$(d,"ADD_FORBID_CONTENTS")&&Q(d.ADD_FORBID_CONTENTS)&&(pe===xa&&(pe=Z(pe)),C(pe,d.ADD_FORBID_CONTENTS,B)),ba&&(j["#text"]=!0),Ae&&C(j,["html","head","body"]),j.table&&(C(j,["tbody"]),delete ot.tbody),d.TRUSTED_TYPES_POLICY){if(typeof d.TRUSTED_TYPES_POLICY.createHTML!="function")throw Te('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof d.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw Te('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');const x=T;T=d.TRUSTED_TYPES_POLICY;try{O=me("")}catch(E){throw T=x,E}}else d.TRUSTED_TYPES_POLICY===null?(T=void 0,O=""):(T===void 0&&(T=st()),T&&typeof O=="string"&&(O=me("")));(Y.uponSanitizeElement.length>0||Y.uponSanitizeAttribute.length>0)&&j===ga&&(j=Z(j)),Y.uponSanitizeAttribute.length>0&&q===ua&&(q=Z(q)),V&&V(d),Be=d},Wn=C({},[...ta,...aa,...is]),Yn=C({},[...na,...ss]),Co=function(d){let u=R(d);(!u||!u.tagName)&&(u={namespaceURI:$e,tagName:"template"});const x=Ye(d.tagName),E=Ye(u.tagName);return wa[d.namespaceURI]?d.namespaceURI===jt?u.namespaceURI===ge?x==="svg":u.namespaceURI===Ht?x==="svg"&&(E==="annotation-xml"||_a[E]):!!Wn[x]:d.namespaceURI===Ht?u.namespaceURI===ge?x==="math":u.namespaceURI===jt?x==="math"&&Ta[E]:!!Yn[x]:d.namespaceURI===ge?u.namespaceURI===jt&&!Ta[E]||u.namespaceURI===Ht&&!_a[E]?!1:!Yn[x]&&(To[x]||!Wn[x]):!!(lt==="application/xhtml+xml"&&wa[d.namespaceURI]):!1},se=function(d){Re(e.removed,{element:d});try{R(d).removeChild(d)}catch{if(w(d),!R(d))throw Te("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")}},Kn=function(d){const u=_?_(d):d.childNodes;if(u){const E=[];ue(u,A=>{Re(E,A)}),ue(E,A=>{try{w(A)}catch{}})}const x=k?k(d):null;if(x)for(let E=x.length-1;E>=0;--E){const A=x[E],I=A&&A.name;if(typeof I=="string")try{d.removeAttribute(I)}catch{}}},Ce=function(d,u){try{Re(e.removed,{attribute:u.getAttributeNode(d),from:u})}catch{Re(e.removed,{attribute:null,from:u})}if(u.removeAttribute(d),d==="is")if(ze||$t)try{se(u)}catch{}else try{u.setAttribute(d,"")}catch{}},Io=function(d){const u=k?k(d):d.attributes;if(u)for(let x=u.length-1;x>=0;--x){const E=u[x],A=E&&E.name;if(!(typeof A!="string"||q[B(A)]))try{d.removeAttribute(A)}catch{}}},Ro=function(d){const u=[d];for(;u.length>0;){const x=u.pop();(y?y(x):x.nodeType)===de.element&&Io(x);const A=_?_(x):x.childNodes;if(A)for(let I=A.length-1;I>=0;--I)u.push(A[I])}},Xn=function(d){let u=null,x=null;if(ma)d="<remove></remove>"+d;else{const I=Xa(d,/^[\r\n\t ]+/);x=I&&I[0]}lt==="application/xhtml+xml"&&$e===ge&&(d='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+d+"</body></html>");const E=T?me(d):d;if($e===ge)try{u=new p().parseFromString(E,lt)}catch{}if(!u||!u.documentElement){u=pa.createDocument($e,"template",null);try{u.documentElement.innerHTML=va?O:E}catch{}}const A=u.body||u.documentElement;return d&&x&&A.insertBefore(t.createTextNode(x),A.childNodes[0]||null),$e===ge?bo.call(u,Ae?"html":"body")[0]:Ae?u.documentElement:A},Jn=function(d){return Mn.call(d.ownerDocument||d,d,r.SHOW_ELEMENT|r.SHOW_COMMENT|r.SHOW_TEXT|r.SHOW_PROCESSING_INSTRUCTION|r.SHOW_CDATA_SECTION,null)},Ea=function(d){var u,x;d.normalize();const E=Mn.call(d.ownerDocument||d,d,r.SHOW_TEXT|r.SHOW_COMMENT|r.SHOW_CDATA_SECTION|r.SHOW_PROCESSING_INSTRUCTION,null);let A=E.nextNode();for(;A;){let W=A.data;ue([Ot,Pt,zt],z=>{W=Le(W,z," ")}),A.data=W,A=E.nextNode()}const I=(u=(x=d.querySelectorAll)===null||x===void 0?void 0:x.call(d,"template"))!==null&&u!==void 0?u:[];ue(Array.from(I),W=>{He(W.content)&&Ea(W.content)})},qt=function(d){const u=h?h(d):null;return typeof u!="string"||B(u)!=="form"?!1:typeof d.nodeName!="string"||typeof d.textContent!="string"||typeof d.removeChild!="function"||d.attributes!==k(d)||typeof d.removeAttribute!="function"||typeof d.setAttribute!="function"||typeof d.namespaceURI!="string"||typeof d.insertBefore!="function"||typeof d.hasChildNodes!="function"||d.nodeType!==y(d)||d.childNodes!==_(d)},He=function(d){if(!y||typeof d!="object"||d===null)return!1;try{return y(d)===de.documentFragment}catch{return!1}},dt=function(d){if(!y||typeof d!="object"||d===null)return!1;try{return typeof y(d)=="number"}catch{return!1}};function ke(v,d,u){ue(v,x=>{x.call(e,d,u,Be)})}const Zn=function(d){let u=null;if(ke(Y.beforeSanitizeElements,d,null),qt(d))return se(d),!0;const x=B(h?h(d):d.nodeName);if(ke(Y.uponSanitizeElement,d,{tagName:x,allowedTags:j}),rt&&d.hasChildNodes()&&!dt(d.firstElementChild)&&X(/<[/\w!]/g,d.innerHTML)&&X(/<[/\w!]/g,d.textContent)||rt&&d.namespaceURI===ge&&x==="style"&&dt(d.firstElementChild)||d.nodeType===de.progressingInstruction||rt&&d.nodeType===de.comment&&X(/<[/\w]/g,d.data))return se(d),!0;if(ot[x]||!(xe.tagCheck instanceof Function&&xe.tagCheck(x))&&!j[x]){if(!ot[x]&&Qn(x)&&(U.tagNameCheck instanceof RegExp&&X(U.tagNameCheck,x)||U.tagNameCheck instanceof Function&&U.tagNameCheck(x)))return!1;if(ba&&!pe[x]){const A=R(d),I=_(d);if(I&&A){const W=I.length;for(let z=W-1;z>=0;--z){const F=ka?I[z]:b(I[z],!0);A.insertBefore(F,S(d))}}}return se(d),!0}return(y?y(d):d.nodeType)===de.element&&!Co(d)||(x==="noscript"||x==="noembed"||x==="noframes")&&X(/<\/no(script|embed|frames)/i,d.innerHTML)?(se(d),!0):(ye&&d.nodeType===de.text&&(u=d.textContent,ue([Ot,Pt,zt],A=>{u=Le(u,A," ")}),d.textContent!==u&&(Re(e.removed,{element:d.cloneNode()}),d.textContent=u)),ke(Y.afterSanitizeElements,d,null),!1)},Vn=function(d,u,x){if(Nt[u]||Bn&&(u==="id"||u==="name")&&(x in t||x in Ao))return!1;const E=q[u]||xe.attributeCheck instanceof Function&&xe.attributeCheck(u,d);if(!(ha&&!Nt[u]&&X(xo,u))){if(!(zn&&X(yo,u))){if(!E||Nt[u]){if(!(Qn(d)&&(U.tagNameCheck instanceof RegExp&&X(U.tagNameCheck,d)||U.tagNameCheck instanceof Function&&U.tagNameCheck(d))&&(U.attributeNameCheck instanceof RegExp&&X(U.attributeNameCheck,u)||U.attributeNameCheck instanceof Function&&U.attributeNameCheck(u,d))||u==="is"&&U.allowCustomizedBuiltInElements&&(U.tagNameCheck instanceof RegExp&&X(U.tagNameCheck,x)||U.tagNameCheck instanceof Function&&U.tagNameCheck(x))))return!1}else if(!ya[u]){if(!X(Pn,Le(x,On,""))){if(!((u==="src"||u==="xlink:href"||u==="href")&&d!=="script"&&Ja(x,"data:")===0&&qn[d])){if(!(Nn&&!X(vo,Le(x,On,"")))){if(x)return!1}}}}}}return!0},Lo=C({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),Qn=function(d){return!Lo[Ye(d)]&&X(wo,d)},ei=function(d){ke(Y.beforeSanitizeAttributes,d,null);const u=d.attributes;if(!u||qt(d))return;const x={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:q,forceKeepAttr:void 0};let E=u.length;for(;E--;){const A=u[E],I=A.name,W=A.namespaceURI,z=A.value,F=B(I),ve=z;let K=I==="value"?ve:Zi(ve);if(x.attrName=F,x.attrValue=K,x.keepAttr=!0,x.forceKeepAttr=void 0,ke(Y.uponSanitizeAttribute,d,x),K=x.attrValue,Hn&&(F==="id"||F==="name")&&Ja(K,jn)!==0&&(Ce(I,d),K=jn+K),rt&&X(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,K)){Ce(I,d);continue}if(F==="attributename"&&Xa(K,"href")){Ce(I,d);continue}if(x.forceKeepAttr)continue;if(!x.keepAttr){Ce(I,d);continue}if(!$n&&X(/\/>/i,K)){Ce(I,d);continue}ye&&ue([Ot,Pt,zt],ai=>{K=Le(K,ai," ")});const ti=B(d.nodeName);if(!Vn(ti,F,K)){Ce(I,d);continue}if(T&&typeof g=="object"&&typeof g.getAttributeType=="function"&&!W)switch(g.getAttributeType(ti,F)){case"TrustedHTML":{K=me(K);break}case"TrustedScriptURL":{K=be(K);break}}if(K!==ve)try{W?d.setAttributeNS(W,I,K):d.setAttribute(I,K),qt(d)?se(d):Ka(e.removed)}catch{Ce(I,d)}}ke(Y.afterSanitizeAttributes,d,null)},Ut=function(d){let u=null;const x=Jn(d);for(ke(Y.beforeSanitizeShadowDOM,d,null);u=x.nextNode();)if(ke(Y.uponSanitizeShadowNode,u,null),Zn(u),ei(u),He(u.content)&&Ut(u.content),(y?y(u):u.nodeType)===de.element){const A=L?L(u):u.shadowRoot;He(A)&&(Aa(A),Ut(A))}ke(Y.afterSanitizeShadowDOM,d,null)},Aa=function(d){const u=[{node:d,shadow:null}];for(;u.length>0;){const x=u.pop();if(x.shadow){Ut(x.shadow);continue}const E=x.node,I=(y?y(E):E.nodeType)===de.element,W=_?_(E):E.childNodes;if(W)for(let z=W.length-1;z>=0;--z)u.push({node:W[z],shadow:null});if(I){const z=h?h(E):null;if(typeof z=="string"&&B(z)==="template"){const F=E.content;He(F)&&u.push({node:F,shadow:null})}}if(I){const z=L?L(E):E.shadowRoot;He(z)&&u.push({node:null,shadow:z},{node:z,shadow:null})}}};return e.sanitize=function(v){let d=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},u=null,x=null,E=null,A=null;if(va=!v,va&&(v="<!-->"),typeof v!="string"&&!dt(v)&&(v=as(v),typeof v!="string"))throw Te("dirty is not a string, aborting");if(!e.isSupported)return v;fa||Sa(d),e.removed=[];const I=ka&&typeof v!="string"&&dt(v);if(I){const F=h?h(v):v.nodeName;if(typeof F=="string"){const ve=B(F);if(!j[ve]||ot[ve])throw Te("root node is forbidden and cannot be sanitized in-place")}if(qt(v))throw Te("root node is clobbered and cannot be sanitized in-place");try{Aa(v)}catch(ve){throw Kn(v),ve}}else if(dt(v))u=Xn("<!---->"),x=u.ownerDocument.importNode(v,!0),x.nodeType===de.element&&x.nodeName==="BODY"||x.nodeName==="HTML"?u=x:u.appendChild(x),Aa(x);else{if(!ze&&!ye&&!Ae&&v.indexOf("<")===-1)return T&&Bt?me(v):v;if(u=Xn(v),!u)return ze?null:Bt?O:""}u&&ma&&se(u.firstChild);const W=Jn(I?v:u);try{for(;E=W.nextNode();)Zn(E),ei(E),He(E.content)&&Ut(E.content)}catch(F){throw I&&Kn(v),F}if(I)return ue(e.removed,F=>{F.element&&Ro(F.element)}),ye&&Ea(v),v;if(ze){if(ye&&Ea(u),$t)for(A=mo.call(u.ownerDocument);u.firstChild;)A.appendChild(u.firstChild);else A=u;return(q.shadowroot||q.shadowrootmode)&&(A=ko.call(a,A,!0)),A}let z=Ae?u.outerHTML:u.innerHTML;return Ae&&j["!doctype"]&&u.ownerDocument&&u.ownerDocument.doctype&&u.ownerDocument.doctype.name&&X(us,u.ownerDocument.doctype.name)&&(z="<!DOCTYPE "+u.ownerDocument.doctype.name+`>
`+z),ye&&ue([Ot,Pt,zt],F=>{z=Le(z,F," ")}),T&&Bt?me(z):z},e.setConfig=function(){let v=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};Sa(v),fa=!0},e.clearConfig=function(){Be=null,fa=!1,T=P,O=""},e.isValidAttribute=function(v,d,u){Be||Sa({});const x=B(v),E=B(d);return Vn(x,E,u)},e.addHook=function(v,d){typeof d=="function"&&Re(Y[v],d)},e.removeHook=function(v,d){if(d!==void 0){const u=Xi(Y[v],d);return u===-1?void 0:Ji(Y[v],u,1)[0]}return Ka(Y[v])},e.removeHooks=function(v){Y[v]=[]},e.removeAllHooks=function(){Y=sn()},e}var bs=on();let rn=!1;function ks(){rn||(rn=!0,D.setOptions({gfm:!0,breaks:!0}))}function xs(s){return String(s).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function ys(s){let e=bs.sanitize(s,{ADD_ATTR:["target","rel"]});return e=e.replace(/<a\s+([^>]*?)>/gi,(t,a)=>(/\btarget\s*=/i.test(a)||(a+=' target="_blank"'),/\brel\s*=/i.test(a)||(a+=' rel="noopener noreferrer"'),"<a "+a+">")),e}function bt(s){if(!s)return"";try{ks();const e=D.parse(s,{async:!1});return ys(e)}catch(e){return console.warn("[AIAgent SDK] marked parse failed, fallback:",e),vs(s)}}function vs(s){let e=xs(s);return e=e.replace(/`([^`\n]+)`/g,"<code>$1</code>"),e=e.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\n/g,"<br/>"),e}function kt(s){if(!s)return;const e=s.querySelectorAll("img");for(let t=0;t<e.length;t++){const a=e[t];if(a.dataset.aiagentDecorated==="1")continue;a.dataset.aiagentDecorated="1",a.setAttribute("loading","lazy"),a.classList.add("aiagent-sdk-img-loading");const n=()=>{a.classList.remove("aiagent-sdk-img-loading"),a.classList.add("aiagent-sdk-img-loaded")};a.complete&&a.naturalWidth>0?n():(a.addEventListener("load",n,{once:!0}),a.addEventListener("error",n,{once:!0}))}}const xt=`
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

/* ====================================================================
 * 侧边栏导航 + 多页面布局
 * ==================================================================== */
.aiagent-sdk-body {
  display: flex;
  height: calc(100% - 56px);
  min-height: 0;
}
.aiagent-sdk-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 4px;
  width: 44px;
  flex-shrink: 0;
  border-right: 1px solid var(--aia-border);
  background: rgba(255, 255, 255, 0.02);
}
.aiagent-sdk-nav-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 17px;
  cursor: pointer;
  color: var(--aia-text-muted);
  transition: background 160ms var(--aia-anim-ease),
              color 160ms var(--aia-anim-ease),
              transform 160ms var(--aia-anim-ease);
  font-family: var(--aia-font);
}
.aiagent-sdk-nav-item:hover {
  background: rgba(167, 139, 250, 0.12);
  color: var(--aia-text);
}
.aiagent-sdk-nav-item.aia-nav-active {
  background: linear-gradient(135deg, rgba(94, 234, 212, 0.22), rgba(167, 139, 250, 0.22));
  color: var(--aia-text);
  box-shadow: inset 0 0 0 1px rgba(167, 139, 250, 0.3);
}
.aiagent-sdk-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}
.aiagent-sdk-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  flex: 1;
}
.aiagent-sdk-page[hidden] { display: none; }

/* chat 页内嵌元素重新走主流程(消息/输入栏),用 flex 撑满 */
.aia-page-chat { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.aia-page-chat .aiagent-sdk-messages { flex: 1; min-height: 0; overflow-y: auto; }

/* page 空态 */
.aia-page-empty,
.aia-mem-empty,
.aia-hist-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--aia-text-muted);
  text-align: center;
  height: 100%;
  font-family: var(--aia-font);
}
.aia-page-empty-icon,
.aia-mem-empty-icon,
.aia-hist-empty-icon { font-size: 48px; opacity: 0.4; margin-bottom: 12px; }
.aia-page-empty-title,
.aia-mem-empty-title,
.aia-hist-empty-title { font-size: 15px; color: var(--aia-text); margin-bottom: 6px; font-weight: 600; }
.aia-page-empty-hint,
.aia-mem-empty-hint,
.aia-hist-empty-hint { font-size: 12px; opacity: 0.7; margin-bottom: 16px; }

/* ====================================================================
 * 记忆浏览页
 * ==================================================================== */
.aia-mem-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  font-family: var(--aia-font);
}
.aia-mem-searchbar {
  position: relative;
  padding: 10px 12px;
  border-bottom: 1px solid var(--aia-border);
}
.aia-mem-search-icon {
  position: absolute;
  left: 22px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  opacity: 0.5;
  pointer-events: none;
}
.aia-mem-search {
  width: 100%;
  padding: 7px 12px 7px 32px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--aia-border);
  border-radius: 8px;
  color: var(--aia-text);
  font: inherit;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  font-family: var(--aia-font);
}
.aia-mem-search:focus { border-color: var(--aia-glow); }
.aia-mem-chips {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--aia-border);
}
.aia-mem-chip {
  background: transparent;
  border: 1px solid var(--aia-border);
  color: var(--aia-text-muted);
  padding: 4px 10px;
  border-radius: 999px;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  font-family: var(--aia-font);
  transition: all 140ms var(--aia-anim-ease);
}
.aia-mem-chip:hover { background: rgba(167, 139, 250, 0.1); color: var(--aia-text); }
.aia-mem-chip-active {
  background: linear-gradient(135deg, rgba(94, 234, 212, 0.18), rgba(167, 139, 250, 0.18));
  border-color: rgba(167, 139, 250, 0.4);
  color: var(--aia-text);
}
.aia-mem-chip-count { opacity: 0.6; margin-left: 3px; font-size: 10px; }
.aia-mem-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 0;
}
.aia-mem-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  margin: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 140ms var(--aia-anim-ease);
  border: 1px solid transparent;
}
.aia-mem-item:hover { background: rgba(255, 255, 255, 0.04); border-color: var(--aia-border); }
.aia-mem-item-pinned { background: rgba(252, 211, 77, 0.06); border-color: rgba(252, 211, 77, 0.18); }
.aia-mem-pin {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
}
.aia-mem-item-main { flex: 1; min-width: 0; }
.aia-mem-item-key {
  font-size: 12px;
  color: var(--aia-text);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}
.aia-mem-item-cat {
  font-size: 10px;
  padding: 1px 6px;
  background: rgba(167, 139, 250, 0.15);
  border-radius: 4px;
  color: var(--aia-text-muted);
  font-weight: 400;
}
.aia-mem-item-value {
  font-size: 12px;
  color: var(--aia-text-muted);
  margin-top: 3px;
  line-height: 1.5;
  word-break: break-word;
  outline: none;
}
.aia-mem-editing {
  background: rgba(94, 234, 212, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
}
.aia-mem-item-tags { margin-top: 5px; display: flex; gap: 4px; flex-wrap: wrap; }
.aia-mem-tag {
  font-size: 10px;
  padding: 1px 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  color: var(--aia-text-faint);
}
.aia-mem-del {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
  opacity: 0;
  transition: opacity 140ms var(--aia-anim-ease);
  flex-shrink: 0;
  margin-top: 1px;
}
.aia-mem-item:hover .aia-mem-del { opacity: 0.5; }
.aia-mem-del:hover { opacity: 1 !important; }
.aia-mem-footer {
  border-top: 1px solid var(--aia-border);
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--aia-text-muted);
}
.aia-mem-actions { display: flex; gap: 4px; }
.aia-mem-btn {
  background: transparent;
  border: 1px solid var(--aia-border);
  color: var(--aia-text-muted);
  padding: 4px 10px;
  border-radius: 6px;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  font-family: var(--aia-font);
  transition: all 140ms var(--aia-anim-ease);
}
.aia-mem-btn:hover { background: rgba(167, 139, 250, 0.1); color: var(--aia-text); }
.aia-mem-btn-danger:hover { background: rgba(248, 113, 113, 0.15); color: #f87171; border-color: rgba(248, 113, 113, 0.3); }
.aia-mem-btn-primary {
  background: linear-gradient(135deg, var(--aia-paint-1), var(--aia-paint-2));
  color: #050505;
  border: none;
  font-weight: 600;
}
.aia-mem-toast {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 200ms, transform 200ms;
  pointer-events: none;
  z-index: 10;
  font-family: var(--aia-font);
}
.aia-mem-toast-show { opacity: 1; transform: translateX(-50%) translateY(0); }
.aia-mem-toast-success { background: rgba(74, 222, 128, 0.92); color: #050505; }
.aia-mem-toast-error { background: rgba(248, 113, 113, 0.92); color: #fff; }
.aia-mem-toast-info { background: rgba(167, 139, 250, 0.92); color: #fff; }

/* ====================================================================
 * 设置页
 * ==================================================================== */
.aia-set-page {
  height: 100%;
  overflow-y: auto;
  padding: 12px 0;
  font-family: var(--aia-font);
}
.aia-set-section {
  padding: 12px 16px;
  border-bottom: 1px solid var(--aia-border);
}
.aia-set-h3 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--aia-text-faint);
  margin: 0 0 10px;
  font-weight: 600;
}
.aia-set-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--aia-text);
}
.aia-set-row:last-child { margin-bottom: 0; }
.aia-set-row label { font-weight: 500; }
.aia-set-theme-group,
.aia-set-skin-group { display: flex; gap: 4px; flex-wrap: wrap; }
.aia-set-chip {
  background: transparent;
  border: 1px solid var(--aia-border);
  color: var(--aia-text-muted);
  padding: 4px 10px;
  border-radius: 6px;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  font-family: var(--aia-font);
  transition: all 140ms var(--aia-anim-ease);
}
.aia-set-chip:hover { background: rgba(167, 139, 250, 0.1); color: var(--aia-text); }
.aia-set-chip-active {
  background: linear-gradient(135deg, rgba(94, 234, 212, 0.18), rgba(167, 139, 250, 0.18));
  border-color: rgba(167, 139, 250, 0.4);
  color: var(--aia-text);
}
.aia-set-switch {
  width: 36px;
  height: 20px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--aia-border);
  cursor: pointer;
  position: relative;
  padding: 0;
  transition: background 200ms var(--aia-anim-ease);
}
.aia-set-switch::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  transition: transform 200ms var(--aia-anim-ease);
}
.aia-set-switch-on { background: linear-gradient(135deg, var(--aia-paint-1), var(--aia-paint-2)); }
.aia-set-switch-on::before { transform: translateX(16px); }
.aia-set-switch:disabled { opacity: 0.4; cursor: not-allowed; }
.aia-set-link {
  background: transparent;
  border: none;
  color: var(--aia-glow);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  padding: 4px 0;
}
.aia-set-link:hover { text-decoration: underline; }
.aia-set-about-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--aia-text-muted);
  padding: 3px 0;
}
.aia-set-about-row span:first-child { color: var(--aia-text-faint); }

/* ====================================================================
 * 快捷指令下拉面板 — 轻量毛玻璃风格
 * 设计目标:跟对话区融为一体,只在 active 态有微微高亮,
 * 不喧宾夺主。图标去除背景框,仅留 emoji 本体;配色用 --aia-paint 渐变。
 * ==================================================================== */
.aiagent-sdk-cmd-dropdown {
  position: relative;
  flex-shrink: 0;
  align-self: stretch;
  background: rgba(20, 20, 24, 0.75);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  display: block;
  box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.25);
  animation: aia-cmd-slide-in 160ms var(--aia-anim-ease);
  overflow: hidden;
  /* 顶边 1px 极细渐变线 — 5 色 paint 循环 */
  background-image:
    linear-gradient(90deg, var(--aia-paint-1), var(--aia-paint-3), var(--aia-paint-5), var(--aia-paint-2), var(--aia-paint-4), var(--aia-paint-1));
  background-size: 100% 1px;
  background-repeat: no-repeat;
  background-position: top;
  background-color: rgba(20, 20, 24, 0.75);
}
.aiagent-sdk-cmd-dropdown[hidden] { display: none; }
.aiagent-sdk-cmd-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  color: var(--aia-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 10px 14px 4px;
  font-weight: 500;
}
.aiagent-sdk-cmd-header::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--aia-paint-1);
  box-shadow: 0 0 6px var(--aia-paint-1);
  flex-shrink: 0;
}
.aiagent-sdk-cmd-list {
  max-height: 220px;
  overflow-y: auto;
  padding: 2px 4px 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(167, 139, 250, 0.25) transparent;
}
.aiagent-sdk-cmd-list::-webkit-scrollbar { width: 5px; }
.aiagent-sdk-cmd-list::-webkit-scrollbar-track { background: transparent; }
.aiagent-sdk-cmd-list::-webkit-scrollbar-thumb {
  background: rgba(167, 139, 250, 0.25);
  border-radius: 3px;
}
.aiagent-sdk-cmd-list::-webkit-scrollbar-thumb:hover { background: rgba(167, 139, 250, 0.4); }

.aiagent-sdk-cmd-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 10px;
  margin-bottom: 1px;
  cursor: pointer;
  border-radius: 7px;
  transition: background 120ms var(--aia-anim-ease);
  user-select: none;
  position: relative;
}
.aiagent-sdk-cmd-item:last-child { margin-bottom: 0; }
.aiagent-sdk-cmd-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
.aiagent-sdk-cmd-item.aiagent-sdk-cmd-active {
  background: rgba(167, 139, 250, 0.13);
}
.aiagent-sdk-cmd-item.aiagent-sdk-cmd-active::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  border-radius: 1px;
  background: linear-gradient(180deg, var(--aia-paint-1), var(--aia-paint-2));
}

.aiagent-sdk-cmd-icon {
  font-size: 14px;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
  opacity: 0.85;
  line-height: 1;
}
.aiagent-sdk-cmd-item.aiagent-sdk-cmd-active .aiagent-sdk-cmd-icon { opacity: 1; }

.aiagent-sdk-cmd-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.aiagent-sdk-cmd-name {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--aia-paint-2);
  font-family: var(--aia-mono);
  letter-spacing: 0.02em;
  line-height: 1.2;
  opacity: 0.85;
}
.aiagent-sdk-cmd-item.aiagent-sdk-cmd-active .aiagent-sdk-cmd-name {
  color: var(--aia-paint-1);
  opacity: 1;
}
.aiagent-sdk-cmd-label {
  font-size: 12px;
  color: var(--aia-text-muted);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.aiagent-sdk-cmd-item.aiagent-sdk-cmd-active .aiagent-sdk-cmd-label {
  color: var(--aia-text);
}
.aiagent-sdk-cmd-desc {
  font-size: 10.5px;
  color: var(--aia-text-faint);
  flex-shrink: 0;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
  opacity: 0.75;
}
.aiagent-sdk-cmd-empty {
  padding: 18px 12px;
  text-align: center;
  font-size: 12px;
  color: var(--aia-text-faint);
  font-style: italic;
}
.aiagent-sdk-cmd-footer {
  font-size: 10px;
  color: var(--aia-text-faint);
  padding: 5px 14px 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(0, 0, 0, 0.15);
  opacity: 0.7;
}
.aiagent-sdk-cmd-footer kbd {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 4px;
  border-radius: 3px;
  font-family: var(--aia-mono);
  font-size: 9.5px;
  margin-right: 3px;
  color: var(--aia-text-muted);
  line-height: 1.5;
}
.aiagent-sdk-cmd-footer span { margin-right: 6px; }
@keyframes aia-cmd-slide-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
`,ws=`
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

/* ====================================================================
 * 侧边栏导航 + 多页面布局(浅色调色板)
 * ==================================================================== */
.aiagent-sdk-body {
  display: flex;
  height: calc(100% - 56px);
  min-height: 0;
}
.aiagent-sdk-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 4px;
  width: 44px;
  flex-shrink: 0;
  border-right: 1px solid var(--aia-border);
  background: rgba(0, 0, 0, 0.02);
}
.aiagent-sdk-nav-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 17px;
  cursor: pointer;
  color: var(--aia-text-muted);
  transition: all 160ms ease;
  font-family: var(--aia-font);
}
.aiagent-sdk-nav-item:hover { background: rgba(0, 0, 0, 0.06); color: var(--aia-text); }
.aiagent-sdk-nav-item.aia-nav-active {
  background: rgba(37, 99, 235, 0.12);
  color: var(--aia-text);
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.3);
}
.aiagent-sdk-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}
.aiagent-sdk-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  flex: 1;
}
.aiagent-sdk-page[hidden] { display: none; }
.aia-page-chat { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.aia-page-chat .aiagent-sdk-messages { flex: 1; min-height: 0; overflow-y: auto; }

.aia-page-empty, .aia-mem-empty, .aia-hist-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--aia-text-muted);
  text-align: center;
  height: 100%;
  font-family: var(--aia-font);
}
.aia-page-empty-icon, .aia-mem-empty-icon, .aia-hist-empty-icon { font-size: 48px; opacity: 0.4; margin-bottom: 12px; }
.aia-page-empty-title, .aia-mem-empty-title, .aia-hist-empty-title { font-size: 15px; color: var(--aia-text); margin-bottom: 6px; font-weight: 600; }
.aia-page-empty-hint, .aia-mem-empty-hint, .aia-hist-empty-hint { font-size: 12px; opacity: 0.7; margin-bottom: 16px; }

/* 记忆页 */
.aia-mem-page { display: flex; flex-direction: column; height: 100%; min-height: 0; font-family: var(--aia-font); }
.aia-mem-searchbar { position: relative; padding: 10px 12px; border-bottom: 1px solid var(--aia-border); }
.aia-mem-search-icon { position: absolute; left: 22px; top: 50%; transform: translateY(-50%); font-size: 13px; opacity: 0.5; pointer-events: none; }
.aia-mem-search {
  width: 100%; padding: 7px 12px 7px 32px;
  background: var(--aia-bg); border: 1px solid var(--aia-border); border-radius: 8px;
  color: var(--aia-text); font: inherit; font-size: 13px; outline: none; box-sizing: border-box;
  font-family: var(--aia-font);
}
.aia-mem-search:focus { border-color: var(--aia-text-muted); }
.aia-mem-chips { display: flex; gap: 6px; padding: 8px 12px; flex-wrap: wrap; border-bottom: 1px solid var(--aia-border); }
.aia-mem-chip {
  background: transparent; border: 1px solid var(--aia-border); color: var(--aia-text-muted);
  padding: 4px 10px; border-radius: 999px; font: inherit; font-size: 11px; cursor: pointer;
  font-family: var(--aia-font); transition: all 140ms ease;
}
.aia-mem-chip:hover { background: rgba(0, 0, 0, 0.04); color: var(--aia-text); }
.aia-mem-chip-active { background: rgba(37, 99, 235, 0.1); border-color: rgba(37, 99, 235, 0.4); color: var(--aia-text); }
.aia-mem-chip-count { opacity: 0.6; margin-left: 3px; font-size: 10px; }
.aia-mem-list { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 0; }
.aia-mem-item {
  display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; margin: 4px 8px;
  border-radius: 8px; cursor: pointer; transition: background 140ms ease; border: 1px solid transparent;
}
.aia-mem-item:hover { background: rgba(0, 0, 0, 0.03); border-color: var(--aia-border); }
.aia-mem-item-pinned { background: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.2); }
.aia-mem-pin { background: transparent; border: none; cursor: pointer; font-size: 14px; padding: 0; line-height: 1; flex-shrink: 0; margin-top: 2px; }
.aia-mem-item-main { flex: 1; min-width: 0; }
.aia-mem-item-key { font-size: 12px; color: var(--aia-text); font-weight: 600; display: flex; align-items: center; gap: 6px; }
.aia-mem-item-cat { font-size: 10px; padding: 1px 6px; background: rgba(37, 99, 235, 0.12); border-radius: 4px; color: var(--aia-text-muted); font-weight: 400; }
.aia-mem-item-value { font-size: 12px; color: var(--aia-text-muted); margin-top: 3px; line-height: 1.5; word-break: break-word; outline: none; }
.aia-mem-editing { background: rgba(37, 99, 235, 0.08); padding: 2px 4px; border-radius: 4px; }
.aia-mem-item-tags { margin-top: 5px; display: flex; gap: 4px; flex-wrap: wrap; }
.aia-mem-tag { font-size: 10px; padding: 1px 6px; background: rgba(0, 0, 0, 0.05); border-radius: 3px; color: var(--aia-text-muted); }
.aia-mem-del { background: transparent; border: none; cursor: pointer; font-size: 13px; padding: 0; opacity: 0; transition: opacity 140ms ease; flex-shrink: 0; margin-top: 1px; }
.aia-mem-item:hover .aia-mem-del { opacity: 0.5; }
.aia-mem-del:hover { opacity: 1 !important; }
.aia-mem-footer { border-top: 1px solid var(--aia-border); padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--aia-text-muted); }
.aia-mem-actions { display: flex; gap: 4px; }
.aia-mem-btn { background: transparent; border: 1px solid var(--aia-border); color: var(--aia-text-muted); padding: 4px 10px; border-radius: 6px; font: inherit; font-size: 11px; cursor: pointer; font-family: var(--aia-font); transition: all 140ms ease; }
.aia-mem-btn:hover { background: rgba(0, 0, 0, 0.04); color: var(--aia-text); }
.aia-mem-btn-danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }
.aia-mem-btn-primary { background: rgba(37, 99, 235, 0.9); color: #fff; border-color: rgba(37, 99, 235, 0.4); font-weight: 600; }
.aia-mem-toast { position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%) translateY(10px); padding: 8px 16px; border-radius: 6px; font-size: 12px; opacity: 0; transition: opacity 200ms, transform 200ms; pointer-events: none; z-index: 10; font-family: var(--aia-font); }
.aia-mem-toast-show { opacity: 1; transform: translateX(-50%) translateY(0); }
.aia-mem-toast-success { background: rgba(34, 197, 94, 0.92); color: #fff; }
.aia-mem-toast-error { background: rgba(239, 68, 68, 0.92); color: #fff; }
.aia-mem-toast-info { background: rgba(37, 99, 235, 0.92); color: #fff; }

/* 设置页 */
.aia-set-page { height: 100%; overflow-y: auto; padding: 12px 0; font-family: var(--aia-font); }
.aia-set-section { padding: 12px 16px; border-bottom: 1px solid var(--aia-border); }
.aia-set-h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--aia-text-muted); margin: 0 0 10px; font-weight: 600; }
.aia-set-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; color: var(--aia-text); }
.aia-set-row:last-child { margin-bottom: 0; }
.aia-set-row label { font-weight: 500; }
.aia-set-theme-group, .aia-set-skin-group { display: flex; gap: 4px; flex-wrap: wrap; }
.aia-set-chip { background: transparent; border: 1px solid var(--aia-border); color: var(--aia-text-muted); padding: 4px 10px; border-radius: 6px; font: inherit; font-size: 11px; cursor: pointer; font-family: var(--aia-font); transition: all 140ms ease; }
.aia-set-chip:hover { background: rgba(0, 0, 0, 0.04); color: var(--aia-text); }
.aia-set-chip-active { background: rgba(37, 99, 235, 0.1); border-color: rgba(37, 99, 235, 0.4); color: var(--aia-text); }
.aia-set-switch { width: 36px; height: 20px; border-radius: 999px; background: rgba(0, 0, 0, 0.1); border: 1px solid var(--aia-border); cursor: pointer; position: relative; padding: 0; transition: background 200ms ease; }
.aia-set-switch::before { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: #fff; border-radius: 50%; transition: transform 200ms ease; }
.aia-set-switch-on { background: rgba(37, 99, 235, 0.9); }
.aia-set-switch-on::before { transform: translateX(16px); }
.aia-set-switch:disabled { opacity: 0.4; cursor: not-allowed; }
.aia-set-link { background: transparent; border: none; color: #2563eb; cursor: pointer; font: inherit; font-size: 12px; padding: 4px 0; }
.aia-set-link:hover { text-decoration: underline; }
.aia-set-about-row { display: flex; justify-content: space-between; font-size: 11px; color: var(--aia-text-muted); padding: 3px 0; }
.aia-set-about-row span:first-child { color: var(--aia-text-muted); opacity: 0.7; }

/* ====================================================================
 * 快捷指令下拉面板 — 极简白底风格
 * 与 classic 主题保持一致:实色背景 + 细描边 + 蓝色高亮。
 * 轻量设计,不喧宾夺主。
 * ==================================================================== */
.aiagent-sdk-cmd-dropdown {
  position: relative;
  flex-shrink: 0;
  align-self: stretch;
  background-color: var(--aia-bg);
  border: 1px solid var(--aia-border);
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  display: block;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
  animation: aia-cmd-slide-in 160ms ease;
  background-image: linear-gradient(90deg, #2563eb, #60a5fa, #2563eb);
  background-size: 100% 1px;
  background-repeat: no-repeat;
  background-position: top;
  overflow: hidden;
}
.aiagent-sdk-cmd-dropdown[hidden] { display: none; }
.aiagent-sdk-cmd-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  color: var(--aia-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 10px 14px 4px;
  font-weight: 600;
}
.aiagent-sdk-cmd-header::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #2563eb;
  flex-shrink: 0;
}
.aiagent-sdk-cmd-list {
  max-height: 220px;
  overflow-y: auto;
  padding: 2px 4px 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(37, 99, 235, 0.2) transparent;
}
.aiagent-sdk-cmd-list::-webkit-scrollbar { width: 5px; }
.aiagent-sdk-cmd-list::-webkit-scrollbar-track { background: transparent; }
.aiagent-sdk-cmd-list::-webkit-scrollbar-thumb {
  background: rgba(37, 99, 235, 0.2);
  border-radius: 3px;
}
.aiagent-sdk-cmd-list::-webkit-scrollbar-thumb:hover { background: rgba(37, 99, 235, 0.35); }

.aiagent-sdk-cmd-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 10px;
  margin-bottom: 1px;
  cursor: pointer;
  border-radius: 7px;
  transition: background 120ms ease;
  user-select: none;
  position: relative;
}
.aiagent-sdk-cmd-item:last-child { margin-bottom: 0; }
.aiagent-sdk-cmd-item:hover {
  background: rgba(37, 99, 235, 0.04);
}
.aiagent-sdk-cmd-item.aiagent-sdk-cmd-active {
  background: rgba(37, 99, 235, 0.08);
}
.aiagent-sdk-cmd-item.aiagent-sdk-cmd-active::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  border-radius: 1px;
  background: linear-gradient(180deg, #2563eb, #60a5fa);
}

.aiagent-sdk-cmd-icon {
  font-size: 14px;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
  opacity: 0.7;
  line-height: 1;
}
.aiagent-sdk-cmd-item.aiagent-sdk-cmd-active .aiagent-sdk-cmd-icon { opacity: 1; }

.aiagent-sdk-cmd-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.aiagent-sdk-cmd-name {
  font-size: 11.5px;
  font-weight: 600;
  color: #1d4ed8;
  font-family: var(--aia-mono);
  letter-spacing: 0.02em;
  line-height: 1.2;
  opacity: 0.85;
}
.aiagent-sdk-cmd-item.aiagent-sdk-cmd-active .aiagent-sdk-cmd-name { opacity: 1; }
.aiagent-sdk-cmd-label {
  font-size: 12px;
  color: var(--aia-text-muted);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.aiagent-sdk-cmd-item.aiagent-sdk-cmd-active .aiagent-sdk-cmd-label { color: var(--aia-text); }
.aiagent-sdk-cmd-desc {
  font-size: 10.5px;
  color: var(--aia-text-muted);
  flex-shrink: 0;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
  opacity: 0.75;
}
.aiagent-sdk-cmd-empty {
  padding: 18px 12px;
  text-align: center;
  font-size: 12px;
  color: var(--aia-text-muted);
  font-style: italic;
}
.aiagent-sdk-cmd-footer {
  font-size: 10px;
  color: var(--aia-text-muted);
  padding: 5px 14px 6px;
  border-top: 1px solid var(--aia-border);
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(0, 0, 0, 0.015);
  opacity: 0.7;
}
.aiagent-sdk-cmd-footer kbd {
  background: #fff;
  border: 1px solid var(--aia-border);
  padding: 0 4px;
  border-radius: 3px;
  font-family: var(--aia-mono);
  font-size: 9.5px;
  margin-right: 3px;
  color: var(--aia-text);
  line-height: 1.5;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
}
.aiagent-sdk-cmd-footer span { margin-right: 6px; }
@keyframes aia-cmd-slide-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
`,ln={cornerGlow:!0,statusDotStyle:"rainbow",sendIcon:"svg",messageEnter:"paint",bubbleAnimation:"rotate",fontStack:"mixed"};function yt(s){return{...ln,...s}}function dn(s,e){return{...s,...e,layout:yt({...s.layout,...e.layout})}}const Se={name:"iridescent-bloom",css:xt,palette:"ink",aiHint:"深色油彩画布 + 4 角油彩飞溅 + 虹彩动画 + 毛玻璃。视觉强烈,默认皮肤。",layout:{cornerGlow:!0,statusDotStyle:"rainbow",sendIcon:"svg",messageEnter:"paint",bubbleAnimation:"rotate",fontStack:"mixed"}},vt={name:"classic",css:ws,aiHint:"浅灰白底 + 蓝色强调 + 系统字体 + 无装饰动画。商务/简洁风格,亮色环境。",layout:{cornerGlow:!1,statusDotStyle:"pulse",sendIcon:"arrow",messageEnter:"fade",bubbleAnimation:"none",fontStack:"system"}},sa=dn(Se,{name:"aurora",css:xt+`
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
`,layout:{fontStack:"serif"},aiHint:"极光绿/青/紫 + 衬线字体 + 4 角油彩 + 深绿底。夜读/文艺风格。"}),Ee=class Ee{constructor(){f(this,"_skins",new Map);this._skins.set(Se.name,Se),this._skins.set(vt.name,vt),this._skins.set(sa.name,sa)}static instance(){return Ee._instance||(Ee._instance=new Ee),Ee._instance}register(e){if(!e||!e.name||!e.css)throw new Error("[AIAgent SDK] SkinRegistry.register: invalid skin");this._skins.set(e.name,{...e,layout:yt(e.layout)})}get(e){return this._skins.get(e)||Se}has(e){return this._skins.has(e)}list(){return Array.from(this._skins.keys())}listWithInfo(){return Array.from(this._skins.values()).map(e=>({name:e.name,aiHint:e.aiHint||"no description"}))}remove(e){return e===Se.name||e===vt.name?(console.warn("[AIAgent SDK] cannot remove built-in skin:",e),!1):this._skins.delete(e)}};f(Ee,"_instance",null);let ee=Ee;function _s(s){return Se}function wt(s,e,t,a){const n=document.createElement("div");n.className="aiagent-sdk-tool-card",n.setAttribute("role","status"),n.setAttribute("data-tool",e);const i=document.createElement("div");i.className="aiagent-sdk-tool-head";const o=document.createElement("span");o.className="aiagent-sdk-tool-arrow",o.textContent="▸";const l=document.createElement("span");l.className="aiagent-sdk-tool-name",l.textContent=e;const r=document.createElement("span");r.className="aiagent-sdk-tool-dot",i.appendChild(o),i.appendChild(l),i.appendChild(r);const c=document.createElement("pre");c.className="aiagent-sdk-tool-body",c.innerHTML=cn(JSON.stringify(t,null,2)||"{}");const p=document.createElement("div");p.className="aiagent-sdk-tool-progress";const g=document.createElement("div");g.className="aiagent-sdk-tool-bar",g.style.setProperty("--p","0%");const m=document.createElement("span");return m.className="aiagent-sdk-tool-status",m.textContent="调用中…",p.appendChild(g),p.appendChild(m),n.appendChild(i),n.appendChild(c),n.appendChild(p),a&&a.parentNode===s?s.insertBefore(n,a):s.appendChild(n),s.scrollTop=s.scrollHeight,n}function oa(s,e,t){if(s&&t){const a=s.querySelector(".aiagent-sdk-tool-status");a&&(a.textContent=t)}}function Xe(s,e="✓ 完成"){if(!s)return;s.classList.add("aiagent-sdk-tool-success"),s.classList.contains("aiagent-sdk-tool-card--pending")&&(s.classList.add("aiagent-sdk-tool-confirmed"),s.classList.remove("aiagent-sdk-tool-card--pending"));const t=s.querySelector(".aiagent-sdk-tool-status");t&&(t.textContent=e)}function _t(s,e="✕ 失败"){if(!s)return;s.classList.add("aiagent-sdk-tool-error"),s.style.borderLeftColor="var(--aia-error)";const t=s.querySelector(".aiagent-sdk-tool-status");t&&(t.textContent=e)}function cn(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,(t,a,n,i,o)=>a?n?`<span class="k">${a}</span>${n}`:`<span class="s">${a}</span>`:i?`<span class="k">${i}</span>`:o?`<span class="n">${o}</span>`:t)}function pn(s){const e=document.createElement("div");e.className="aiagent-sdk-thinking-card",e.setAttribute("role","status"),e.setAttribute("aria-label","AI 思考中");const t=document.createElement("div");t.className="aiagent-sdk-thinking-head";const a=document.createElement("span");a.className="aiagent-sdk-thinking-dot",a.setAttribute("aria-hidden","true");const n=document.createElement("span");n.className="aiagent-sdk-thinking-label",n.textContent="思考中…";const i=document.createElement("button");i.className="aiagent-sdk-thinking-toggle",i.textContent="展开",i.addEventListener("click",l=>{l.stopPropagation();const r=e.classList.toggle("aiagent-sdk-thinking-expanded");i.textContent=r?"收起":"展开"}),t.appendChild(a),t.appendChild(n),t.appendChild(i);const o=document.createElement("pre");return o.className="aiagent-sdk-thinking-body",e.appendChild(t),e.appendChild(o),s.appendChild(e),s.scrollTop=s.scrollHeight,e}function Ts(s,e){if(!s)return;const t=s.querySelector(".aiagent-sdk-thinking-body");t&&(t.innerHTML=bt(e||""),kt(t),t.scrollTop=t.scrollHeight)}function De(s){if(!s||s.classList.contains("aiagent-sdk-thinking-done"))return;s.classList.add("aiagent-sdk-thinking-done");const e=s.querySelector(".aiagent-sdk-thinking-label");e&&(e.textContent="✓ 思考完成"),s.classList.remove("aiagent-sdk-thinking-expanded");const t=s.querySelector(".aiagent-sdk-thinking-toggle");t&&(t.textContent="展开")}function ra(s,e,t,a){const n=document.createElement("div");n.className="aiagent-sdk-tool-card aiagent-sdk-tool-card--delta",n.setAttribute("role","status"),n.setAttribute("data-tool",t||"..."),n.setAttribute("data-tool-id",e||"");const i=document.createElement("div");i.className="aiagent-sdk-tool-head";const o=document.createElement("span");o.className="aiagent-sdk-tool-dot",o.setAttribute("aria-hidden","true");const l=document.createElement("span");l.className="aiagent-sdk-tool-name",l.textContent=t||"加载工具…";const r=document.createElement("span");r.className="aiagent-sdk-tool-status",r.textContent="加载参数…";const c=document.createElement("button");c.className="aiagent-sdk-tool-toggle",c.textContent="展开",c.addEventListener("click",g=>{g.stopPropagation();const m=n.classList.toggle("aiagent-sdk-tool-expanded");c.textContent=m?"收起":"展开"}),i.appendChild(o),i.appendChild(l),i.appendChild(r),i.appendChild(c);const p=document.createElement("pre");return p.className="aiagent-sdk-tool-body",p.textContent="",n.appendChild(i),n.appendChild(p),a&&a.parentNode===s?s.insertBefore(n,a):s.appendChild(n),s.scrollTop=s.scrollHeight,n}function gn(s,e){if(!s)return;const t=s.querySelector(".aiagent-sdk-tool-body");if(!t)return;t.textContent=(t.textContent||"")+(e||"");const a=s.parentElement;a&&(a.scrollTop=a.scrollHeight)}function Tt(s,e,t){if(!s)return;s.classList.remove("aiagent-sdk-tool-card--delta"),s.classList.add("aiagent-sdk-tool-card--pending"),s.setAttribute("data-tool",t||"");const a=s.querySelector(".aiagent-sdk-tool-name");a&&(a.textContent=t||"tool");const n=s.querySelector(".aiagent-sdk-tool-status");n&&(n.textContent="等待执行");const i=s.querySelector(".aiagent-sdk-tool-body");i&&(i.innerHTML=cn(JSON.stringify(e||{},null,2)))}function Ss(s){return new Promise(e=>{if(!s){e(!1);return}const t=s.querySelector(".aiagent-sdk-tool-head");if(!t){e(!1);return}const a=t.querySelector(".aiagent-sdk-tool-toggle");a&&a.remove();const n=t.querySelector(".aiagent-sdk-tool-status");n&&(n.textContent="⏸ 等待确认");const i=document.createElement("button");i.className="aiagent-sdk-tool-confirm-btn",i.textContent="✓ 确认";const o=document.createElement("button");o.className="aiagent-sdk-tool-cancel-btn",o.textContent="✕ 取消",t.appendChild(i),t.appendChild(o);let l=!1;const r=c=>{l||(l=!0,i.remove(),o.remove(),e(c))};i.addEventListener("click",c=>{c.stopPropagation(),s.classList.add("aiagent-sdk-tool-confirmed");const p=t.querySelector(".aiagent-sdk-tool-status");p&&(p.textContent="✓ 已确认"),r(!0)}),o.addEventListener("click",c=>{c.stopPropagation(),s.classList.add("aiagent-sdk-tool-cancelled");const p=t.querySelector(".aiagent-sdk-tool-status");p&&(p.textContent="✕ 已取消"),r(!1)})})}function Es(s){return String(s).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function As(s,e,t=0,a){const n=document.createElement("div");return n.style.setProperty("--i",String(t)),s==="user"?(n.className="aiagent-sdk-msg aiagent-sdk-msg-user",n.innerHTML=Es(e||"")):s==="assistant"?(n.className="aiagent-sdk-msg aiagent-sdk-msg-assistant",n.innerHTML=bt(e||""),kt(n)):s==="tool"?(n.className="aiagent-sdk-msg aiagent-sdk-msg-tool",a&&wt(n,a.tool,a.args||{})):(n.className="aiagent-sdk-msg aiagent-sdk-msg-system",n.textContent=e||""),n}function un(s,e,t,a=0,n){const i=As(e,t,a,n);s.appendChild(i),s.scrollTop=s.scrollHeight}const hn=["#5eead4","#a78bfa","#f0abfc","#93c5fd","#fcd34d"];function Cs(){const s=document.createElement("div");s.className="aiagent-sdk-msg aiagent-sdk-msg-assistant aiagent-sdk-typing-pending";for(let e=0;e<5;e++){const t=document.createElement("span");t.className="aia-p",t.style.setProperty("--c",hn[e%hn.length]),e>0&&t.style.setProperty("--d",e*.2+"s"),s.appendChild(t)}return s}function St(s){const e=Cs();return s.appendChild(e),s.scrollTop=s.scrollHeight,e}function fn(s){s&&(s.classList.remove("aiagent-sdk-typing-pending"),s.innerHTML="")}function Is(s){s&&s.classList.add("aiagent-sdk-typing-active")}function Et(s){s&&s.classList.remove("aiagent-sdk-typing-active")}function Je(s){return s==null?!0:typeof s=="string"?s.trim()==="":Array.isArray(s)?s.length===0:!1}function Ze(s,e){return s[e]}function Rs(s){return s instanceof RegExp?s:new RegExp(s)}function Ls(s,e){const t=[],a=[];let n=0;for(const i of s){const o=i.severity||"error",l=o==="error"?t:a;let r=null;if(i.required&&!r&&Je(Ze(e,i.required))&&(r={field:i.required,message:i.message}),i.pattern&&!r){const c=Ze(e,i.pattern.field);Je(c)||Rs(i.pattern.regex).test(String(c))||(r={field:i.pattern.field,message:i.pattern.message||i.message})}if(i.range&&!r){const c=Ze(e,i.range.field);if(!Je(c)){const p=Number(c);if(Number.isFinite(p)){const g=i.range.min!==void 0&&p<i.range.min,m=i.range.max!==void 0&&p>i.range.max;(g||m)&&(r={field:i.range.field,message:i.range.message||i.message})}}}if(i.enum&&!r){const c=Ze(e,i.enum.field);!Je(c)&&i.enum.values.indexOf(c)<0&&(r={field:i.enum.field,message:i.enum.message||i.message})}if(i.condition&&!r){let c=!1;try{c=i.condition.when(e)}catch{c=!1}if(c){if(i.condition.requires&&i.condition.requires.length>0){const p=i.condition.requires.filter(g=>Je(Ze(e,g)));p.length>0&&(r={field:p[0],message:i.message})}if(!r&&i.condition.check){let p=!1;try{p=i.condition.check(e)}catch(g){p=g.message||"check 执行异常"}p!==!0&&(r={message:typeof p=="string"&&p?p:i.message})}}}r?l.push({ruleId:i.id,field:r.field,message:r.message,severity:o}):n++}return{valid:t.length===0,errors:t,warnings:a,passedCount:n}}function Ds(s){const e=s.toolName||"validate_form",t=s.fieldLabels||{},a=s.rules||[],n=new Set;for(const l of a)if(l.required&&n.add(l.required),l.pattern?.field&&n.add(l.pattern.field),l.range?.field&&n.add(l.range.field),l.enum?.field&&n.add(l.enum.field),l.condition?.requires)for(const r of l.condition.requires)n.add(r);const i={};n.forEach(l=>{i[l]={type:"string",description:t[l]||l}});const o=`校验表单数据。在调用 submit_form 之前必须调用本工具,确保数据合法。
传入所有已收集的字段(放在 formData 对象里),返回校验结果:
  - valid=true → 可调 submit_form 提交
  - valid=false → errors 数组列出问题字段和原因,请补全或修正后重试
  - warnings 不阻断提交但建议告知用户
`+(s.descriptionSuffix?`
`+s.descriptionSuffix:"");return{name:e,description:o,parameters:{type:"object",properties:{formData:{type:"object",description:"待校验的表单数据(字段名 → 值)",properties:i,additionalProperties:!0}},required:["formData"]},strict:!1,onCall:l=>{const r=l.formData||{},c=Ls(a,r),p=b=>b?t[b]||b:void 0;if(c.valid&&c.warnings.length===0)return{ok:!0,valid:!0,errors:[],warnings:[],passedCount:c.passedCount,message:`校验通过,共 ${c.passedCount} 条规则全部命中,可以提交。`};const g=c.errors.map(b=>`  - [${p(b.field)||b.ruleId}] ${b.message}`),m=c.warnings.map(b=>`  - [警告:${p(b.field)||b.ruleId}] ${b.message}`);return{ok:c.valid,valid:c.valid,passedCount:c.passedCount,errors:c.errors.map(b=>({...b,fieldLabel:p(b.field)})),warnings:c.warnings.map(b=>({...b,fieldLabel:p(b.field)})),message:(c.valid?"校验通过但有警告。":"校验失败,请修正以下问题:")+`
`+g.concat(m).join(`
`)}}}}function mn(s){return{name:"save_memory",description:`保存一条用户记忆到本地设备(不上传云端,仅当前浏览器)。
适用场景:
  - 用户主动要求"记住..."、"以后都..."、"我一般在..."
  - 告知个人偏好:城市、语言、常去仓库、付款方式
  - 提供常用信息:客户编码、联系电话、收件地址
  - 历史操作:刚录入的单号、常录的商品
记忆会在未来对话中自动被召回,无需用户重复说明。
category 可选:preference(偏好)/ fact(事实)/ history(历史)/ note(备注)。`,parameters:{type:"object",properties:{key:{type:"string",description:"简短标识(英文 snake_case 优先),如 city / default_warehouse / customer_phone"},value:{type:"string",description:"记忆内容,一句话描述清楚"},category:{type:"string",enum:["preference","fact","history","note"],description:"类别:preference=偏好 / fact=事实 / history=历史操作 / note=备注"},tags:{type:"array",items:{type:"string"},description:'可选标签,便于后续按标签召回,如 ["客户", "VIP"]'},pinned:{type:"boolean",description:"是否置顶(重要记忆,每次对话都会注入给 AI)。默认 false。"}},required:["key","value","category"]},strict:!1,onCall:e=>s.saveFromTool(e)}}function bn(s){return{name:"recall_memory",description:`模糊检索用户在本地设备上保存的历史记忆。
适用场景:
  - 用户说"还是上次那个..."、"我上次提过的..."、"我常用的..."
  - 需要了解用户的偏好、常用信息、过去操作过的内容
  - 主动个性化:录单前查询默认仓库/客户
示例:用户说"还是上次那个仓库" → recall_memory({query:"仓库", category:"preference"})
返回按相关性排序的记忆列表,支持类别过滤和标签过滤。`,parameters:{type:"object",properties:{query:{type:"string",description:'查询关键词(支持模糊匹配,如"北京"会命中"BJ")'},category:{type:"string",enum:["preference","fact","history","note"],description:"按类别过滤。不传=全部。"},tags:{type:"array",items:{type:"string"},description:"标签过滤(OR 匹配,任意一个命中即可)"},limit:{type:"number",description:"返回条数上限,默认 5"}},required:["query"]},strict:!1,onCall:e=>s.recallFromTool(e)}}const Ms=Object.freeze([["北京","bj"],["上海","sh"],["广州","gz"],["深圳","sz"],["仓库","warehouse"],["快递","物流"],["顺丰","sf"],["加急","urgent"],["特急","critical"],["普通","normal"],["手机","电话"],["phone","mobile"],["电脑","笔记本"],["手机","phone"]]);function kn(s,e){if(s===e)return 0;if(!s.length)return e.length;if(!e.length)return s.length;if(s.length>e.length){const o=s;s=e,e=o}const t=s.length,a=e.length;let n=new Array(t+1),i=new Array(t+1);for(let o=0;o<=t;o++)n[o]=o;for(let o=1;o<=a;o++){i[0]=o;for(let r=1;r<=t;r++){const c=s.charCodeAt(r-1)===e.charCodeAt(o-1)?0:1;i[r]=Math.min(n[r]+1,i[r-1]+1,n[r-1]+c)}const l=n;n=i,i=l}return n[t]}function Os(s,e){if(!e.length)return 0;if(s.length<=e.length)return kn(s,e);let t=e.length;const a=s.length-Math.max(1,e.length-2);for(let n=0;n<=a;n++){const i=Math.min(s.length,n+e.length+2),o=s.slice(n,i),l=kn(o,e);if(l<t&&(t=l),t===0)return 0}return t}const Ps=/[\s,，。、;；:：!！?？()（）\-_/\\|]+/;function Ve(s){return s.toLowerCase().split(Ps).map(e=>e.trim()).filter(Boolean)}function Me(s,e){if(!s||!e)return 0;const t=s.toLowerCase(),a=e.toLowerCase();if(!a)return 0;if(t.includes(a)||a.includes(t))return 1;if(t.startsWith(a))return .9;const n=Ve(a);if(n.length>1&&n.every(l=>t.includes(l)))return .75;const i=Os(t,a),o=Math.max(1,Math.floor(a.length/4));return i<=o?.7-i/a.length*.3:0}function xn(s,e){const t=s.toLowerCase(),a=e.toLowerCase();for(const[n,i]of Ms){const o=n.toLowerCase(),l=i.toLowerCase();if(a.includes(o)&&t.includes(l)||a.includes(l)&&t.includes(o))return .65}return 0}function zs(s,e){if(!e)return 0;const t=Me(s.key,e),a=Me(s.value,e);let n=0;if(s.tags&&s.tags.length>0)for(const l of s.tags){const r=Me(l,e);r>n&&(n=r)}let i=0;if(s.lastHitAt){const r=(Date.now()-new Date(s.lastHitAt).getTime())/864e5;r<=30?i=1:r<=90?i=.6:i=.3}let o=.5*t+.3*a+.1*n+.1*i;if(o<.5){const l=xn(s.key,e),r=xn(s.value,e),c=Math.max(l,r);c>o&&(o=Math.max(o,c*.8))}if(s.pinned&&(o+=.05),s.lastHitAt){const l=(Date.now()-new Date(s.lastHitAt).getTime())/864e5;l>90?o*=.7:l>30&&(o*=.9)}return Math.min(1,o)}function yn(s,e,t){const a=t?.limit??5,n=t?.threshold??.15,i=[];for(const o of s){const l=zs(o,e);l>=n&&i.push({item:o,score:l})}return i.sort((o,l)=>{if(l.score!==o.score)return l.score-o.score;const r=o.item.pinned?1:0,c=l.item.pinned?1:0;return r!==c?c-r:0}),i.slice(0,a)}function Ns(){const s=globalThis.crypto;return s&&typeof s.randomUUID=="function"?s.randomUUID():"mem-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,10)}function Qe(){return new Date().toISOString()}const Pe=class Pe{constructor(e={}){f(this,"_enabled",!1);f(this,"_opts");f(this,"_entries",new Map);f(this,"_listeners",new Set);f(this,"_index",new Map);f(this,"_recentCapacityHits",new Map);f(this,"_lastSerializedBytes",0);this._opts={enabled:!!e.enabled,storageKey:e.storageKey||"aia-memories-v1",maxEntries:e.maxEntries??1e3,maxBytes:e.maxBytes??4*1024*1024,autoInject:e.autoInject!==!1,maxInjectCount:e.maxInjectCount??10,maxIndexChars:e.maxIndexChars??200,onMemoryChange:e.onMemoryChange||(()=>{})},e.onMemoryChange&&this._listeners.add(e.onMemoryChange)}enable(){this._enabled||(this._enabled=!0,this._loadFromStorage())}disable(){this._enabled&&(this._enabled=!1,this._entries.clear())}isEnabled(){return this._enabled}save(e){if(this._assertEnabled(),this._isCapacityFull()){const n=`${e.category}:${e.key}`;if(this._trackCapacityHit(n)==="fallback"){try{console.warn(`[AIAgent SDK] memory: same key "${n}" hit capacity_full 3+ times in 5min. Auto-evicting 1 LRU entry to break the loop.`)}catch{}this._evictOneLRU()}else throw this._buildCapacityError()}const t=Qe(),a={id:Ns(),category:e.category,key:e.key,value:e.value,tags:e.tags,scope:e.scope||"global",pinned:!!e.pinned,createdAt:t,updatedAt:t,hitCount:0};return this._entries.set(a.id,a),this._indexAdd(a),this._persist(),this._notify(),this._recentCapacityHits.delete(`${e.category}:${e.key}`),a}upsert(e){this._assertEnabled();for(const t of this._entries.values())if(t.scope!=="session"&&t.category===e.category&&t.key===e.key)return this.update(t.id,{value:e.value,tags:e.tags,pinned:e.pinned});return this.save(e)}get(e){return this._entries.get(e)||null}update(e,t){this._assertEnabled();const a=this._entries.get(e);if(!a)return null;const i=["key","value","tags"].some(l=>t[l]!==void 0&&t[l]!==a[l]);i&&this._indexRemove(a);const o={...a,...t,id:a.id,createdAt:a.createdAt,updatedAt:Qe()};return this._entries.set(e,o),i&&this._indexAdd(o),this._persist(),this._notify(),o}delete(e){this._assertEnabled();const t=this._entries.get(e);return t?(this._entries.delete(e),this._indexRemove(t),this._persist(),this._notify(),!0):!1}list(e){const t=Array.from(this._entries.values());return e?t.filter(a=>!(e.category&&a.category!==e.category||e.pinned!==void 0&&a.pinned!==e.pinned||e.scope&&a.scope!==e.scope)).sort(vn):t.slice().sort(vn)}clear(){this._assertEnabled(),this._entries.size!==0&&(this._entries.clear(),this._index.clear(),this._persist(),this._notify())}size(){return this._entries.size}search(e,t){if(!this._enabled||!e)return[];const a=t?.touch!==!1,n=t?.limit??5,i=Ve(e);let o;if(i.length>0&&this._index.size>0){const c=new Set;for(const p of i){const g=this._index.get(p);if(g)for(const m of g)c.add(m)}if(c.size>=3){o=[];for(const p of c){const g=this._entries.get(p);g&&o.push(g)}}else o=Array.from(this._entries.values())}else o=Array.from(this._entries.values());if(t?.category&&(o=o.filter(c=>c.category===t.category)),t?.tags&&t.tags.length>0){const c=new Set(t.tags.map(p=>p.toLowerCase()));o=o.filter(p=>p.tags&&p.tags.some(g=>c.has(g.toLowerCase())))}const r=yn(o,e,{limit:n,threshold:t?.threshold??.15}).map(c=>c.item);if(a&&r.length>0){const c=Qe();for(const p of r){const g=this._entries.get(p.id);g&&(g.hitCount=(g.hitCount||0)+1,g.lastHitAt=c)}this._persist(),this._notify()}return r}saveFromTool(e){try{const t=String(e.key||"").trim(),a=String(e.value||"").trim(),n=la(e.category);if(!t||!a||!n)return{ok:!1,error:"missing_field",message:"key、value、category 是必填字段"};const i=this.upsert({key:t,value:a,category:n,tags:Array.isArray(e.tags)?e.tags.map(String):void 0,pinned:!!e.pinned,scope:e.scope==="session"?"session":"global"});return{ok:!0,id:i.id,entry:wn(i),message:`已保存记忆「${i.key}」:${i.value}`}}catch(t){return t&&typeof t=="object"&&t.name==="CapacityError"?t:{ok:!1,error:t.message}}}recallFromTool(e){try{const t=String(e.query||"").trim();if(!t)return{ok:!1,error:"missing_query",message:"query 是必填字段"};const a=la(e.category),n=Array.isArray(e.tags)?e.tags.map(String):void 0,i=Number(e.limit)>0?Number(e.limit):5,o=this.search(t,{limit:i,category:a,tags:n});return o.length===0?{ok:!0,count:0,items:[],message:"未找到匹配的记忆。试试换个关键词,或检查类别过滤。"}:{ok:!0,count:o.length,items:o.map(wn),formatted:o.map(l=>`- [${l.category}] ${l.key}: ${l.value}`+(l.tags&&l.tags.length?` (tags: ${l.tags.join(",")})`:"")+(l.pinned?" 📌":"")).join(`
`)}}catch(t){return{ok:!1,error:t.message}}}buildContextBlock(e){if(!this._enabled||!this._opts.autoInject||this._entries.size===0)return null;const t=Array.from(this._entries.values()).filter(b=>b.scope!=="session");if(t.length===0)return null;const a=5,n=t.filter(b=>b.pinned).sort(Bs);if(n.length>a)try{console.warn(`[AIAgent SDK] memory: ${n.length} pinned entries (cap=${a}). Recommend unpinning old ones. Auto-injection shows first ${a}.`)}catch{}const i=n.slice(0,a),o=t.filter(b=>!b.pinned);let l;e&&e.trim()?l=yn(o,e,{limit:this._opts.maxInjectCount*2,threshold:.15}).map(w=>w.item.key):l=o.sort($s).slice(0,this._opts.maxInjectCount).map(b=>b.key);const r=i.length?"pinned: "+i.map(b=>`📌 ${b.key}`).join(", "):"",c=l.length>0?(r?`
`:"")+(o.length>l.length?`其他 (前 ${l.length}/${o.length}): `:"其他: ")+l.join(", "):"",p=n.length+o.length,g=o.length-l.length;let m=`[Memory Index - 共 ${p} 条记忆]
可调 recall_memory({query:"..."}) 检索详情。`+(g>0?` (另有 ${g} 条未列出,可用 recall 检索)`:"")+`
`+(r+c).trim();return m.length>this._opts.maxIndexChars&&(m=m.slice(0,this._opts.maxIndexChars-3)+"..."),m}export(){const e={version:1,entries:Array.from(this._entries.values())};return JSON.stringify(e)}import(e){this._assertEnabled();let t;try{t=JSON.parse(e)}catch(n){throw new Error("JSON 解析失败: "+n.message)}if(!t||!Array.isArray(t.entries))throw new Error("格式不正确:缺少 entries 数组");let a=0;for(const n of t.entries){if(!n||typeof n!="object"||!n.id||!n.key||!n.value||!n.category||this._entries.has(n.id))continue;if(this._entries.size>=this._opts.maxEntries)break;const i={id:n.id,category:la(n.category)??"note",key:String(n.key),value:String(n.value),tags:Array.isArray(n.tags)?n.tags.map(String):void 0,scope:n.scope==="session"?"session":"global",pinned:!!n.pinned,createdAt:n.createdAt||Qe(),updatedAt:n.updatedAt||Qe(),hitCount:Number(n.hitCount)||0,lastHitAt:n.lastHitAt};this._entries.set(i.id,i),a++}return a>0&&(this._persist(),this._notify()),a}onChange(e){return this._listeners.add(e),()=>{this._listeners.delete(e)}}_assertEnabled(){if(!this._enabled)throw new Error("MemoryEngine 未启用,请传 memory: { enabled: true }")}_enforceCapacity(){}_loadFromStorage(){this._entries.clear();try{const e=localStorage.getItem(this._opts.storageKey);if(!e)return;const t=JSON.parse(e);if(!t||!Array.isArray(t.entries))return;for(const a of t.entries)a&&typeof a=="object"&&a.id&&this._entries.set(a.id,a)}catch{}this._rebuildIndex()}_persist(){try{const t={version:1,entries:Array.from(this._entries.values()).filter(a=>a.scope==="global")};localStorage.setItem(this._opts.storageKey,JSON.stringify(t))}catch(e){try{console.warn("[AIAgent SDK] memory persist failed:",e.message)}catch{}}}_notify(){const e=Array.from(this._entries.values());for(const t of this._listeners)try{t(e)}catch{}}_indexAdd(e){const t=this._entryTokens(e);for(const a of t){let n=this._index.get(a);n||(n=new Set,this._index.set(a,n)),n.add(e.id)}}_indexRemove(e){const t=this._entryTokens(e);for(const a of t){const n=this._index.get(a);n&&(n.delete(e.id),n.size===0&&this._index.delete(a))}}_entryTokens(e){const t=new Set;for(const n of Ve(e.key))t.add(n);const a=e.value.length>500?e.value.slice(0,500):e.value;for(const n of Ve(a))t.add(n);if(e.tags)for(const n of e.tags)for(const i of Ve(n))t.add(i);return Array.from(t)}_rebuildIndex(){this._index.clear();for(const e of this._entries.values())this._indexAdd(e)}_isCapacityFull(){return this._entries.size>=this._opts.maxEntries||this._getSerializedBytes()>=this._opts.maxBytes}_getSerializedBytes(){return this._lastSerializedBytes===0&&this._entries.size>0&&(this._lastSerializedBytes=this._entries.size*500),Math.max(this._lastSerializedBytes,this._entries.size*500)}_trackCapacityHit(e){const t=Date.now(),a=Pe.CAPACITY_HIT_WINDOW_MS;let n=this._recentCapacityHits.get(e);for(n||(n=[],this._recentCapacityHits.set(e,n)),n.push(t);n.length>0&&t-n[0]>a;)n.shift();return n.length>=Pe.CAPACITY_HIT_THRESHOLD?"fallback":"allow"}_evictOneLRU(){let e=null;for(const t of this._entries.values()){if(t.pinned)continue;if(!e){e=t;continue}const a=e.lastHitAt||"0",n=t.lastHitAt||"0";(n<a||n===a&&t.updatedAt<e.updatedAt)&&(e=t)}e&&(this._entries.delete(e.id),this._indexRemove(e))}_buildCapacityError(){const e=Date.now(),t=864e5,a=r=>Math.max(0,Math.floor((e-new Date(r).getTime())/t)),i=Array.from(this._entries.values()).filter(r=>!r.pinned).sort((r,c)=>{const p=r.lastHitAt||"",g=c.lastHitAt||"";return!p&&g?-1:p&&!g?1:p!==g?p.localeCompare(g):r.updatedAt.localeCompare(c.updatedAt)}).slice(0,5).map(r=>({id:r.id,key:r.key,value:r.value.length>200?r.value.slice(0,200)+"…":r.value,category:r.category,daysSinceLastHit:r.lastHitAt?a(r.lastHitAt):null,daysSinceUpdate:a(r.updatedAt)})),o=new Map;for(const r of this._entries.values()){const c=r.key.split(/[._\s]/)[0]||r.key,p=`${r.category}::${c.toLowerCase()}`;let g=o.get(p);g||(g=[],o.set(p,g)),g.push(r)}const l=[];for(const[,r]of o)if(!(r.length<2)&&(l.push({ids:r.map(c=>c.id),keys:r.map(c=>c.key),category:r[0].category,reason:`同 category + 相似 key 前缀 (${r[0].key.split(/[._\s]/)[0]}),可合并/覆盖`}),l.length>=2))break;return{ok:!1,error:"capacity_full",current:this._entries.size,capacity:this._opts.maxEntries,bytes:this._getSerializedBytes(),maxBytes:this._opts.maxBytes,suggestions:{forgetCandidates:i,compressCandidates:l},message:`记忆容量已满 (${this._entries.size}/${this._opts.maxEntries} 条, ${Math.round(this._getSerializedBytes()/1024)}KB/${Math.round(this._opts.maxBytes/1024)}KB)。
AI 可选操作:
  A. 遗忘(给候选):查看 forgetCandidates 列表,挑出用户已不需要的记忆,调 delete_memory 删后再 save。
  B. 压缩(给候选):查看 compressCandidates 列表,合并相似条目后 save。
  C. 提示用户手动清理,告诉用户"打开浮窗 → 🧠 记忆 → 清空"。
注:5 分钟内同 key 连续 3 次失败会自动 LRU 淘汰 1 条兜底,避免循环。`,name:"CapacityError"}}};f(Pe,"CAPACITY_HIT_WINDOW_MS",5*60*1e3),f(Pe,"CAPACITY_HIT_THRESHOLD",3);let At=Pe;function vn(s,e){return e.createdAt.localeCompare(s.createdAt)}function $s(s,e){return e.updatedAt.localeCompare(s.updatedAt)}function Bs(s,e){return s.category.localeCompare(e.category)}function la(s){if(typeof s!="string")return;const e=s.toLowerCase();if(e==="preference"||e==="fact"||e==="history"||e==="note")return e}function wn(s){return{id:s.id,category:s.category,key:s.key,value:s.value,tags:s.tags,pinned:s.pinned,createdAt:s.createdAt,updatedAt:s.updatedAt,hitCount:s.hitCount}}class Hs{constructor(){f(this,"_tools",new Map)}register(e,t){const a=this._tools.get(e)||new Map,n=[];for(const i of t){const o={description:i.description||"",parameters:i.parameters||{type:"object",properties:{}},strict:i.strict!==!1,onCall:typeof i.onCall=="function"?i.onCall:null};a.set(i.name,o),n.push({name:i.name,description:o.description,parameters:o.parameters,strict:o.strict})}return this._tools.set(e,a),n}unregister(e,t){const a=this._tools.get(e);if(a){if(!t||!t.length){a.clear(),this._tools.delete(e);return}for(const n of t)a.delete(n);a.size===0&&this._tools.delete(e)}}get(e,t){const a=this._tools.get(e);return a&&a.get(t)||null}}async function js(s,e,t,a){const n=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/register",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({tools:a})});if(!n.ok){const i=await n.text();throw new Error("register failed: "+n.status+" "+i)}return await n.json()}async function qs(s,e,t,a){const n=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/append",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({tools:a})});if(!n.ok){const i=await n.text();throw new Error("append failed: "+n.status+" "+i)}return await n.json()}async function _n(s,e,t,a){const n=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/unregister",{method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({names:a})});if(!n.ok)throw new Error("unregister failed: "+n.status);return await n.json()}async function Us(s,e,t){const a=await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools",{method:"GET",headers:{Authorization:"Bearer "+e}});if(!a.ok)throw new Error("list failed: "+a.status);return await a.json()}async function Ct(s,e,t){if(t){try{await fetch(s+"/chat/"+encodeURIComponent(t)+"/tools/abort",{method:"POST",headers:{Authorization:"Bearer "+e}})}catch(a){console.warn("[AIAgent SDK] abort failed:",a.message)}try{sessionStorage.removeItem("pending:"+t)}catch{}}}function Fs(s){const e=s.dictTypes||[],t=s.dictTypeLabels||{},a=s.cascades||[],n=e.map(o=>{const l=t[o]||o;return`  - \`${o}\`: ${l}`}).join(`
`);let i="";return a.length>0&&(i=`

级联规则:
`+a.map(o=>{const l=o.parentLabel||t[o.parentType]||o.parentType,r=o.childLabel||t[o.childType]||o.childType;return`  - ${o.childType}(${r}) 需先查 ${o.parentType}(${l}) 获得编码,再通过parentCode传入`}).join(`
`)),{name:"query_dict",description:`查字典,将中文名转系统编码。需编码时先调本工具。
字典类型:
${n}
匹配方式:exact(精确)/contains(近似)/bigram(模糊,需确认)`+i,parameters:{type:"object",properties:{dictType:{type:"string",enum:e,description:"字典类型"},keyword:{type:"string",description:'搜索关键词,如城市名"北京"、产品名"华为"'},parentCode:{type:"string",description:"父级编码(级联字典必填)。查子字典时传父字典编码限定范围,如查设备型号时传设备类型编码。"},limit:{type:"number",description:"返回条数上限,默认5"}},required:["dictType","keyword"]},strict:!1,onCall:async o=>{const l=o.dictType||"",r=o.keyword||"",c=o.parentCode||"",p=o.limit||5;if(!l||!r)return{ok:!1,error:"dictType and keyword are required"};let m=(s.endpoint||"")+"/dict/"+encodeURIComponent(l)+"/query?keyword="+encodeURIComponent(r)+"&limit="+p;c&&(m+="&parentCode="+encodeURIComponent(c));try{const b=await fetch(m,{headers:{Accept:"application/json"}});if(!b.ok)return{ok:!1,error:"HTTP "+b.status,message:"字典查询失败"};const w=await b.json();if(!w||w.length===0)return{ok:!0,items:[],message:"未找到匹配项。请尝试:更换关键词、使用全称或简称、检查字典类型是否正确。"+(c?" 当前 parentCode="+c:"")};const S=w.map(_=>{let R="";_.matchType==="exact"||_.score>=.9?R="[精确]":_.matchType==="contains"||_.matchType==="suffix_stripped"||_.matchType==="alias"?R="[近似]":R="[模糊,请确认]";const L=_.parent?` (父级:${_.parent})`:"";return`${_.code} → ${_.name}${L} ${R}`}).join(`
`);return{ok:!0,items:w.map(_=>({code:_.code,name:_.name,matchType:_.matchType,score:_.score,parent:_.parent})),formatted:S,message:S}}catch(b){return{ok:!1,error:b.message,message:"字典查询异常"}}}}}function Gs(s){return{name:"change_skin",description:`切换 AI 助手浮窗的皮肤。\`name\` 字段可传:
  - 具体皮肤名(见下方列表)
  - \`"next"\` 切到下一个(在已注册皮肤列表中循环)
  - \`"prev"\` 切到上一个
  - \`"random"\` 随机切一个

当前已注册皮肤:
${ee.instance().list().map(a=>{const n=ee.instance().get(a),i=n&&n.aiHint?n.aiHint:"(no description)";return`  - \`${a}\`: ${i}`}).join(`
`)}
传不在列表里的名字会返回 unknown_skin 错误(不会乱切)。`,parameters:{type:"object",properties:{name:{type:"string",description:'皮肤名(见 description 列表),或 "next" / "prev" / "random" 之一。'}},required:["name"]},strict:!1,onCall:a=>{const n=a&&a.name||"next",i=ee.instance().list();let o;const l=s._widget?.getSkin?.()?.name||"";if(n==="random")o=i[Math.floor(Math.random()*i.length)]||l;else if(n==="next"||n==="prev"){const r=i.indexOf(l);o=i[((r+(n==="next"?1:-1))%i.length+i.length)%i.length]||l}else if(i.indexOf(n)>=0)o=n;else return{ok:!1,error:"unknown_skin",requested:n,available:i,currentSkin:l};try{return s.setSkin(o),{ok:!0,currentSkin:o,previousSkin:l,available:i,message:"已切换皮肤:"+l+" → "+o}}catch(r){return{ok:!1,error:r.message,currentSkin:l}}}}}function Tn(s){return{name:"get_page_errors",description:`查询 SDK 检测到的宿主页面错误(JS 异常、HTTP 错误、UI 错误弹窗)。
当用户可能遇到问题但未明确描述,或你需要更多细节来诊断问题时,调用此工具。
返回结果包含错误时间、来源(global/network/dom_popup)、严重级别和详情。`,parameters:{type:"object",properties:{source:{type:"string",enum:["all","global","network","dom_popup"],description:"按来源过滤。all=全部,global=JS异常,network=HTTP/网络错误,dom_popup=UI弹窗。默认 all。"},limit:{type:"number",description:"最多返回几条(按时间倒序)。默认 10。"}},required:[]},strict:!1,onCall:e=>{const t=e?.source||"all",a=e?.limit||10;let n=s.getPageErrors();return t!=="all"&&(n=n.filter(i=>i.source===t)),n=n.slice(-a),n.length===0?{ok:!0,count:0,errors:[],message:"未检测到页面错误。"}:{ok:!0,count:n.length,errors:n.map(i=>({source:i.source,severity:i.severity,timestamp:i.timestamp,message:i.message,details:i.details})),message:`检测到 ${n.length} 条页面错误。可以根据错误信息向用户解释发生了什么,并建议解决或重试方案。`}}}}async function Ws(s,e,t,a){if(!e)return;const n=s.getSessionId();if(!n){console.warn("[AIAgent SDK] no sessionId for tool result");return}const i={toolUseId:e,result:t,ts:Date.now()};s.setPending(i);try{sessionStorage.setItem("pending:"+n,JSON.stringify(i))}catch{}let o;try{o=await s.ensureToken()}catch(l){s.appendMsg("system","⚠️ "+l.message),s.setBusy(!1);return}await da(s,e,t,n,o,a)}async function da(s,e,t,a,n,i){const o=s.endpoint+"/chat/"+encodeURIComponent(a)+"/tools/result",l=JSON.stringify({toolUseId:e,result:t==null?"[Tool executed by client SDK; no result returned]":typeof t=="string"?t:JSON.stringify(t)}),r={Authorization:"Bearer "+n,"Content-Type":"application/json",Accept:"text/event-stream"},c=4;let p=500,g=0,m=null,b=null;for(;g<c;){b=null;try{m=await fetch(o,{method:"POST",headers:r,body:l})}catch(y){b=y}if(b){if(g===c-1)break;await s.sleep(p),p*=2,g++,i&&oa(i,Math.min(60+g*10,90),"重试中…");continue}if(m&&m.status>=500&&m.status<600&&g<c-1){await s.sleep(p),p*=2,g++,i&&oa(i,Math.min(60+g*10,90),"重试中…");continue}if(m&&m.status===429&&g<c-1){const y=parseInt(m.headers.get("Retry-After")||"1",10);await s.sleep(Math.max(y*1e3,p)),p*=2,g++,i&&oa(i,Math.min(60+g*10,90),"限流中…");continue}break}if(b){i&&_t(i,"✕ 网络失败"),It(s,a,e,"network: "+b.message);return}if(!m){i&&_t(i,"✕ 无响应"),It(s,a,e,"network: no response");return}if(m.status===409){i&&_t(i,"✕ 409 冲突");const y=await m.text();s.appendMsg("system","⚠️ "+(y||"session 已被工具调用占用"));try{await Ct(s.endpoint,n,a)}catch{}s.setPending(null),s.setBusy(!1);return}if(!m.ok||!m.body){i&&_t(i,"✕ HTTP "+m.status),It(s,a,e,"http "+m.status);return}i&&Xe(i,"✓ 已提交");const w=s.appendTyping(),S=s.getMsgEl();let _=!1;const R={typing:w},L=(()=>{const y=Oe.buildStreamHandlers({typing:w,msgEl:S,onUpgrade:()=>{s.handleThinking},onErrorFallback:h=>s.appendMsg("system",h),onAssistantText:h=>{h&&s.appendMsg("assistant",h)},onDoneCleanup:()=>{_||s.setBusy(!1)}});return{onChunk:y.onChunk,onDone:y.onDone,onError:y.onError,getAssistantBuf:y.getAssistantBuf}})();let k=!0;try{await ae(m.body,y=>L.onChunk(y),()=>L.onDone(),y=>L.onError(y),async y=>{s.handleToolCall&&(s.setBusy(!0),await s.handleToolCall(y)&&(_=!0))},y=>{s.handleToolCallDelta&&s.handleToolCallDelta(y)},y=>{s.handleToolCallStart&&s.handleToolCallStart(y)},y=>{},y=>{s.handleThinking&&s.handleThinking(y)},y=>{const h=R.typing;if(h&&h.parentNode){const P=h.querySelector(".aiagent-sdk-typing-particle"),J=!h.textContent?.trim();P||J?h.remove():Et(h)}const T=St(S),O=Oe.buildStreamHandlers({typing:T,msgEl:S,onUpgrade:()=>{},onErrorFallback:P=>s.appendMsg("system",P),onAssistantText:P=>{P&&s.appendMsg("assistant",P)},onDoneCleanup:()=>{_||s.setBusy(!1)}});L.onChunk=O.onChunk,L.onDone=O.onDone,L.onError=O.onError,R.typing=T},y=>{y&&L.onChunk({event:"text",data:y})})}catch{k=!1}if(k){try{sessionStorage.removeItem("pending:"+a)}catch{}s.setPending(null)}else It(s,a,e,"sse")}async function Ys(s){const e=s.getPending();if(!e)return;const t=s.getSessionId();if(!t)return;s.setBusy(!0);let a;try{a=await s.ensureToken()}catch(n){s.appendMsg("system","⚠️ "+n.message),s.setBusy(!1);return}await da(s,e.toolUseId,e.result,t,a)}async function Ks(s){const e=s.getSessionId();if(!e){s.setBusy(!1);return}let t="";try{t=await s.ensureToken()}catch{}await Ct(s.endpoint,t,e),s.appendMsg("system","已放弃本次工具调用,可继续对话。"),s.setBusy(!1)}function It(s,e,t,a){console.warn("[AIAgent SDK] tool result failed:",a),Xs(s,a),s.setBusy(!1)}function Xs(s,e){const t=s.getMsgEl();if(t.querySelector(".aiagent-sdk-tool-result-failed"))return;const a=document.createElement("div");a.className="aiagent-sdk-tool-result-failed";const n=document.createElement("div");n.className="aiagent-sdk-tool-result-failed-header",n.textContent="提交工具结果失败";const i=document.createElement("div");i.className="aiagent-sdk-tool-result-failed-detail",i.textContent="原因:"+(e||"未知")+"。可重试,或取消本次调用以继续对话。";const o=document.createElement("div");o.className="aiagent-sdk-tool-result-actions";const l=document.createElement("button");l.type="button",l.className="aiagent-sdk-btn-retry",l.textContent="↻ 重试",l.addEventListener("click",()=>{a.parentNode&&a.parentNode.removeChild(a),Ys(s)});const r=document.createElement("button");r.type="button",r.className="aiagent-sdk-btn-cancel",r.textContent="✕ 取消",r.addEventListener("click",()=>{a.parentNode&&a.parentNode.removeChild(a),Ks(s)}),o.appendChild(l),o.appendChild(r),a.appendChild(n),a.appendChild(i),a.appendChild(o),t.appendChild(a),t.scrollTop=t.scrollHeight}async function Js(s){if(typeof sessionStorage>"u")return;let e=null,t=null;try{for(let i=0;i<sessionStorage.length;i++){const o=sessionStorage.key(i);if(o&&o.indexOf("pending:")===0){e=o,t=JSON.parse(sessionStorage.getItem(o)||"null");break}}}catch{return}if(!e||!t||!t.toolUseId){e&&sessionStorage.removeItem(e);return}const a=e.substring(8);s.appendMsg("system","检测到上次未完成的工具调用,正在重试提交…"),s.setPending(t);let n;try{n=await s.ensureToken()}catch(i){s.appendMsg("system","⚠️ "+i.message);return}await da(s,t.toolUseId,t.result,a,n)}const Zs=10;class Vs{constructor(){f(this,"_map",new Map)}register(e){for(const t of e)!t||!t.name||this._map.set(t.name,t)}unregister(e){if(!e||e.length===0){this._map.clear();return}for(const t of e)this._map.delete(t)}list(){return Array.from(this._map.values())}get(e){return this._map.get(e)}search(e){const t=this.list();if(!e)return t.map(i=>({cmd:i,score:0}));const a=e.toLowerCase(),n=[];for(const i of t){const o=Me(i.name,a),l=Me(i.label,a)*.9,r=i.description?Me(i.description,a)*.5:0,c=Math.max(o,l,r);c>0&&n.push({cmd:i,score:c})}return n.sort((i,o)=>o.score!==i.score?o.score-i.score:0),n.slice(0,Zs)}size(){return this._map.size}}const Sn=[".el-message--error",".el-notification--error",".ant-message-error",".ant-notification-error",".ant-alert-error",".ivu-message-error",".van-toast--fail",'[role="alert"]',".toast-error",".alert-danger",".notification.is-danger"].join(", "),Qs=[/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,/(?:password|passwd|pwd|secret|api[_-]?key)\s*[=:]\s*\S+/gi,/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,/\b(?:\d{4}[-\s]?){3}\d{4}\b/g,/(?:token|auth)\s*[=:]\s*["']?[A-Za-z0-9\-._~+/=]+/gi];let Rt=0,et=null,tt=null,at=null,nt=null;const ce=new Set;function eo(s,e,t,a,n){for(const i of ce)try{i._handleGlobalError(s,e,t,a,n)}catch{}return typeof et=="function"?et(s,e,t,a,n):!1}function En(s){for(const e of ce)try{e._handleUnhandledRejection(s.reason)}catch{}}async function to(...s){const e=typeof s[0]=="string"?s[0]:s[0]?.url||"",t=s[1]?.method||"GET",a=Date.now();try{const n=await tt.apply(window,s);if(n.status>=400)for(const i of ce)try{i._isOwnRequest(e)||i._ingestNetworkError(e,t,n.status,n.statusText,a)}catch{}return n}catch(n){for(const i of ce)try{i._isOwnRequest(e)||i._ingestNetworkFailure(e,t,n.message,a)}catch{}throw n}}const Dt=class Dt{constructor(e,t,a){f(this,"_endpoint");f(this,"_opts");f(this,"_host");f(this,"_running",!1);f(this,"_buffer",[]);f(this,"_recentIds",new Map);f(this,"_maxBufferSize");f(this,"_dedupeWindowMs");f(this,"_maxErrorsPerMessage");f(this,"_autoInject");f(this,"_maxMessageLength");f(this,"_redactPatterns");f(this,"_domObserver",null);f(this,"_lastProactiveMsgTs",0);this._endpoint=e,this._opts=t,this._host=a;const n=t.behavior||{};this._maxBufferSize=n.maxBufferSize||50,this._dedupeWindowMs=n.dedupeWindowMs||5e3,this._maxErrorsPerMessage=n.maxErrorsPerMessage||5,this._autoInject=n.autoInject!==!1,this._maxMessageLength=t.filter?.maxMessageLength||500,this._redactPatterns=[...Qs,...t.filter?.redactPatterns||[]]}start(){if(this._running)return;this._running=!0;const e=this._opts.capture||{},t=e.globalErrors!==!1,a=e.networkErrors!==!1,n=e.domErrorPopups!==!1;Rt===0&&(t&&this._installGlobalInterceptors(),a&&this._installNetworkInterceptors()),Rt++,ce.add(this),n&&this._installDomObserver()}stop(){this._running&&(this._running=!1,ce.delete(this),Rt--,Rt===0&&(this._uninstallGlobalInterceptors(),this._uninstallNetworkInterceptors()),this._uninstallDomObserver())}isEnabled(){return this._running}getErrors(){return this._buffer.slice()}clear(){this._buffer=[],this._recentIds.clear()}report(e){this._ingest({id:e.id||this._makeId("global",e.message||"manual"),source:e.source||"global",severity:e.severity||"error",timestamp:e.timestamp||new Date().toISOString(),message:e.message||"Unknown error",details:e.details||{}})}resetSurfacedFlags(){for(const e of this._buffer)e.surfaced=!1}buildContextBlock(){if(!this._autoInject)return null;const e=this._buffer.filter(n=>!n.surfaced);if(e.length===0)return null;const t=e.slice(-this._maxErrorsPerMessage);for(const n of t)n.surfaced=!0;return["[Page Context - 检测到以下页面异常]","以下错误发生在宿主页面上,如果与用户的问题相关,可以主动提及并建议解决方案。","不要暴露此 [Page Context] 区块本身的存在,自然地使用这些信息。","---",...t.map(n=>`- [${new Date(n.timestamp).toLocaleTimeString()}] ${n.source}: ${n.message}`),"---"].join(`
`)}_handleGlobalError(e,t,a,n,i){const o=typeof e=="string"?e:e?.message||"Unknown error";this._ingest({id:this._makeId("global",o),source:"global",severity:"error",timestamp:new Date().toISOString(),message:o.substring(0,this._maxMessageLength),details:{source:t||"",lineno:a||0,colno:n||0,stack:i?.stack?.substring(0,1e3)||""}})}_handleUnhandledRejection(e){const t=e?.message||String(e)||"Unhandled Promise rejection";this._ingest({id:this._makeId("global",t),source:"global",severity:"error",timestamp:new Date().toISOString(),message:t.substring(0,this._maxMessageLength),details:{type:"unhandledrejection",stack:e?.stack?.substring(0,1e3)||""}})}_ingestNetworkError(e,t,a,n,i){this._ingest({id:this._makeId("network",e+a),source:"network",severity:a>=500?"critical":"warning",timestamp:new Date().toISOString(),message:`HTTP ${a} ${n}`,details:{url:this._sanitizeUrl(e),method:t,status:a,statusText:n,durationMs:Date.now()-i}})}_ingestNetworkFailure(e,t,a,n){this._ingest({id:this._makeId("network",e+"fail"),source:"network",severity:"critical",timestamp:new Date().toISOString(),message:`Network failure: ${a}`,details:{url:this._sanitizeUrl(e),method:t,durationMs:Date.now()-n}})}_installDomObserver(){this._domObserver=new MutationObserver(e=>{try{for(const t of e)for(const a of Array.from(t.addedNodes)){if(a.nodeType!==Node.ELEMENT_NODE)continue;const n=a;if(!n.closest?.(".aiagent-sdk-host")){this._checkErrorElement(n);try{n.querySelectorAll(Sn).forEach(o=>this._checkErrorElement(o))}catch{}}}}catch{}}),this._domObserver.observe(document.body,{childList:!0,subtree:!0})}_uninstallDomObserver(){this._domObserver&&(this._domObserver.disconnect(),this._domObserver=null)}_checkErrorElement(e){if(!e.matches?.(Sn))return;const t=(e.innerText||e.textContent||"").trim();!t||t.length>this._maxMessageLength||this._ingest({id:this._makeId("dom_popup",t),source:"dom_popup",severity:"warning",timestamp:new Date().toISOString(),message:t,details:{tagName:e.tagName.toLowerCase(),className:(e.className?.toString?.()||"").substring(0,200)}})}_installGlobalInterceptors(){et=window.onerror,window.onerror=eo,window.addEventListener("unhandledrejection",En)}_uninstallGlobalInterceptors(){window.onerror=et,et=null,window.removeEventListener("unhandledrejection",En)}_installNetworkInterceptors(){tt=window.fetch,window.fetch=to,at=XMLHttpRequest.prototype.open,nt=XMLHttpRequest.prototype.send,XMLHttpRequest.prototype.open=function(e,t,...a){return this.__aia_method=e,this.__aia_url=String(t),this.__aia_start=Date.now(),at.apply(this,[e,t,...a])},XMLHttpRequest.prototype.send=function(...e){const t=this.__aia_url||"",a=this.__aia_method||"GET",n=this.__aia_start||Date.now();let i=!1;for(const o of ce)if(!o._isOwnRequest(t)){i=!0;break}return i&&(this.addEventListener("load",function(){if(this.status>=400)for(const o of ce)try{o._isOwnRequest(t)||o._ingestNetworkError(t,a,this.status,this.statusText,n)}catch{}}),this.addEventListener("error",function(){for(const o of ce)try{o._isOwnRequest(t)||o._ingestNetworkFailure(t,a,"XHR error",n)}catch{}}),this.addEventListener("timeout",function(){for(const o of ce)try{o._isOwnRequest(t)||o._ingestNetworkFailure(t,a,"XHR timeout",n)}catch{}})),nt.apply(this,e)}}_uninstallNetworkInterceptors(){tt&&(window.fetch=tt,tt=null),at&&(XMLHttpRequest.prototype.open=at,at=null),nt&&(XMLHttpRequest.prototype.send=nt,nt=null)}_ingest(e){try{if(this._opts.onError)try{this._opts.onError(e)}catch{}if(this._shouldIgnore(e))return;this._redact(e);const t=this._recentIds.get(e.id);if(t&&Date.now()-t<this._dedupeWindowMs)return;if(this._recentIds.set(e.id,Date.now()),this._buffer.length>=this._maxBufferSize&&this._buffer.shift(),this._buffer.push(e),this._recentIds.size>this._maxBufferSize*2){const a=Date.now()-this._dedupeWindowMs;for(const[n,i]of this._recentIds)i<a&&this._recentIds.delete(n)}e.severity==="critical"&&this._notifyCritical(e)}catch(t){console.warn("[AIAgent SDK] pageAwareness._ingest failed:",t)}}_notifyCritical(e){try{this._host.onErrorBadge?.(this._buffer.length)}catch{}if(this._host.isWidgetOpen()){const t=Date.now();if(t-this._lastProactiveMsgTs>=Dt.PROACTIVE_THROTTLE_MS){this._lastProactiveMsgTs=t;try{this._host.appendSystemMsg(`检测到页面异常: ${e.message.substring(0,100)}`)}catch{}}}}_shouldIgnore(e){const t=this._opts.filter;if(!t)return!1;if(t.ignoreUrls){const a=e.details.url;if(a){for(const n of t.ignoreUrls)if(n.test(a))return!0}}if(t.ignoreMessages){for(const a of t.ignoreMessages)if(a.test(e.message))return!0}return!1}_redact(e){if(e.message=this._applyRedaction(e.message),e.details)for(const t of Object.keys(e.details)){const a=e.details[t];typeof a=="string"&&(e.details[t]=this._applyRedaction(a))}}_applyRedaction(e){let t=e;for(const a of this._redactPatterns)t=t.replace(a,"[REDACTED]");return t}_isOwnRequest(e){if(!e)return!1;const t=this._endpoint;return e.startsWith(t+"/chat/")||e.startsWith(t+"/dict/")||e.startsWith(t+"/auth/")||e.includes("/ai-token")}_sanitizeUrl(e){try{const t=new URL(e,window.location.origin),a=Array.from(t.searchParams.keys()).map(n=>`${n}=[...]`).join("&");return t.origin+t.pathname+(a?"?"+a:"")}catch{return e.substring(0,200)}}_makeId(e,t){return e+":"+t.substring(0,100)}};f(Dt,"PROACTIVE_THROTTLE_MS",3e4);let ca=Dt;const An={preference:"偏好",fact:"事实",history:"历史",note:"备注"},ao=["preference","fact","history","note"];function no(s,e,t){let a="all",n="",i=null;s.innerHTML=['<div class="aia-mem-page">','  <div class="aia-mem-searchbar">','    <span class="aia-mem-search-icon">🔍</span>','    <input type="text" class="aia-mem-search" placeholder="搜索记忆(key / value / tag)" />',"  </div>",'  <div class="aia-mem-chips"></div>','  <div class="aia-mem-list" role="list"></div>','  <div class="aia-mem-footer">','    <span class="aia-mem-stats">加载中…</span>','    <div class="aia-mem-actions">','      <button class="aia-mem-btn" data-act="export">导出</button>','      <button class="aia-mem-btn" data-act="import">导入</button>','      <button class="aia-mem-btn aia-mem-btn-danger" data-act="clear">清空</button>',"    </div>","  </div>","</div>"].join("");const o=s.querySelector(".aia-mem-search"),l=s.querySelector(".aia-mem-chips"),r=s.querySelector(".aia-mem-list"),c=s.querySelector(".aia-mem-stats");o.addEventListener("input",()=>{n=o.value.trim(),g()}),s.querySelector('[data-act="export"]').addEventListener("click",()=>{const k=e.export(),y=new Blob([k],{type:"application/json"}),h=URL.createObjectURL(y),T=document.createElement("a");T.href=h,T.download=`aia-memories-${new Date().toISOString().slice(0,10)}.json`,T.click(),URL.revokeObjectURL(h),S("已导出","success")}),s.querySelector('[data-act="import"]').addEventListener("click",()=>{const k=document.createElement("input");k.type="file",k.accept="application/json,.json",k.onchange=()=>{const y=k.files?.[0];if(!y)return;const h=new FileReader;h.onload=()=>{try{const T=e.import(String(h.result||""));S(`成功导入 ${T} 条记忆`,"success")}catch(T){S("导入失败: "+T.message,"error")}},h.readAsText(y)},k.click()}),s.querySelector('[data-act="clear"]').addEventListener("click",()=>{(t?.onConfirmClear?t.onConfirmClear():confirm("确定清空所有记忆？此操作不可恢复。"))&&(e.clear(),S("已清空","info"))});function p(){const k={all:e.size(),preference:0,fact:0,history:0,note:0};for(const h of e.list())k[h.category]++;const y=[{key:"all",label:"全部",count:k.all}];for(const h of ao)y.push({key:h,label:An[h],count:k[h]});l.innerHTML=y.map(h=>`<button class="aia-mem-chip ${h.key===a?"aia-mem-chip-active":""}" data-cat="${h.key}">${h.label} <span class="aia-mem-chip-count">${h.count}</span></button>`).join(""),l.querySelectorAll(".aia-mem-chip").forEach(h=>{h.addEventListener("click",()=>{a=h.dataset.cat,p(),g()})})}function g(){let k;if(n){const y={limit:50,touch:!1};a!=="all"&&(y.category=a),k=e.search(n,y)}else a==="all"?k=e.list().sort(R):k=e.list({category:a}).sort(R);if(k.length===0){r.innerHTML=m(),c.textContent="共 0 条记忆";return}r.innerHTML=k.map(b).join(""),c.textContent=`共 ${k.length} 条记忆`,r.querySelectorAll(".aia-mem-item").forEach(y=>{const h=y.dataset.id,T=y.querySelector('[data-act="pin"]');T&&T.addEventListener("click",P=>{P.stopPropagation();const J=e.get(h);J&&e.update(h,{pinned:!J.pinned})});const O=y.querySelector('[data-act="del"]');O&&O.addEventListener("click",P=>{P.stopPropagation(),confirm("删除这条记忆？")&&e.delete(h)}),y.addEventListener("click",()=>w(h))})}function m(){return n?'<div class="aia-mem-empty">没有匹配的记忆。试试换个关键词。</div>':['<div class="aia-mem-empty">','  <div class="aia-mem-empty-icon">🧠</div>','  <div class="aia-mem-empty-title">还没有记忆</div>','  <div class="aia-mem-empty-hint">告诉 AI "记住...",或点这里 →</div>','  <button class="aia-mem-btn aia-mem-btn-primary" data-act="add-sample">添加示例记忆</button>',"</div>"].join(`
`)}function b(k){const y=k.tags&&k.tags.length?`<div class="aia-mem-item-tags">${k.tags.map(h=>`<span class="aia-mem-tag">#${_(h)}</span>`).join("")}</div>`:"";return[`<div class="aia-mem-item ${k.pinned?"aia-mem-item-pinned":""}" data-id="${k.id}">`,`  <button class="aia-mem-pin" data-act="pin" title="${k.pinned?"取消置顶":"置顶"}">${k.pinned?"📌":"📍"}</button>`,'  <div class="aia-mem-item-main">',`    <div class="aia-mem-item-key">${_(k.key)} <span class="aia-mem-item-cat">${An[k.category]}</span></div>`,`    <div class="aia-mem-item-value">${_(k.value)}</div>`,y,"  </div>",'  <button class="aia-mem-del" data-act="del" title="删除">🗑</button>',"</div>"].join(`
`)}function w(k){const y=r.querySelector(`.aia-mem-item[data-id="${k}"]`);if(!y)return;const h=e.get(k);if(!h)return;const T=y.querySelector(".aia-mem-item-value"),O=h.value;T.contentEditable="true",T.classList.add("aia-mem-editing"),T.focus();const P=document.createRange();P.selectNodeContents(T);const J=window.getSelection();J?.removeAllRanges(),J?.addRange(P);const fe=be=>{if(T.contentEditable="false",T.classList.remove("aia-mem-editing"),T.removeEventListener("blur",it),T.removeEventListener("keydown",me),be){const st=T.textContent?.trim()||"";st&&st!==O?e.update(k,{value:st}):T.textContent=O}else T.textContent=O},it=()=>fe(!0),me=be=>{be.key==="Enter"&&!be.shiftKey?(be.preventDefault(),fe(!0)):be.key==="Escape"&&(be.preventDefault(),fe(!1))};T.addEventListener("blur",it),T.addEventListener("keydown",me)}function S(k,y="info"){if(t?.onToast){t.onToast(k,y);return}const h=document.createElement("div");h.className=`aia-mem-toast aia-mem-toast-${y}`,h.textContent=k,s.appendChild(h),requestAnimationFrame(()=>h.classList.add("aia-mem-toast-show")),setTimeout(()=>{h.classList.remove("aia-mem-toast-show"),setTimeout(()=>h.remove(),300)},2e3)}s.addEventListener("click",k=>{k.target.dataset.act==="add-sample"&&(e.save({key:"default_warehouse",value:"BJ-北京中心仓",category:"preference",pinned:!0,scope:"global"}),e.save({key:"city",value:"北京",category:"fact",pinned:!0,scope:"global"}),e.save({key:"customer_phone",value:"13800138000",category:"fact",scope:"global"}),S("已添加 3 条示例记忆","success"))});function _(k){return k.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function R(k,y){return k.pinned!==y.pinned?k.pinned?-1:1:y.updatedAt.localeCompare(k.updatedAt)}function L(){p(),g()}return L(),i=e.onChange(()=>{p(),g()}),{refresh:L,destroy(){i&&(i(),i=null),s.innerHTML=""}}}function io(s,e){let t=null;s.innerHTML=['<div class="aia-set-page">','  <section class="aia-set-section">','    <h3 class="aia-set-h3">外观</h3>','    <div class="aia-set-row">',"      <label>主题</label>",'      <div class="aia-set-theme-group" role="radiogroup"></div>',"    </div>",'    <div class="aia-set-row">',"      <label>皮肤</label>",'      <div class="aia-set-skin-group" role="radiogroup"></div>',"    </div>","  </section>",'  <section class="aia-set-section">','    <h3 class="aia-set-h3">记忆</h3>','    <div class="aia-set-row aia-set-row-toggle" data-row="memory-enabled">',"      <label>启用记忆系统</label>",'      <button class="aia-set-switch" data-toggle="memory-enabled" aria-pressed="false"></button>',"    </div>",'    <div class="aia-set-row aia-set-row-link">',"      <label>浏览记忆</label>",'      <button class="aia-set-link" data-go="memory">浏览 →</button>',"    </div>","  </section>",'  <section class="aia-set-section">','    <h3 class="aia-set-h3">关于</h3>','    <div class="aia-set-about"></div>',"  </section>","</div>"].join("");const a=s.querySelector(".aia-set-theme-group"),n=s.querySelector(".aia-set-skin-group"),i=s.querySelector(".aia-set-about");function o(){const g=[{value:"ink",label:"暗色 (ink)"},{value:"paper",label:"亮色 (paper)"}],m=e.getTheme(),b=m==="paper"||m==="light"?"paper":"ink";a.innerHTML=g.map(w=>`<button class="aia-set-chip ${w.value===b?"aia-set-chip-active":""}" data-theme="${w.value}">${w.label}</button>`).join(""),a.querySelectorAll(".aia-set-chip").forEach(w=>{w.addEventListener("click",()=>{const S=w.dataset.theme;e.setTheme(S),o()})})}function l(){const g=ee.instance().list(),m=e.getCurrentSkin();n.innerHTML=g.map(b=>`<button class="aia-set-chip ${b===m?"aia-set-chip-active":""}" data-skin="${b}">${b}</button>`).join(""),n.querySelectorAll(".aia-set-chip").forEach(b=>{b.addEventListener("click",()=>{const w=b.dataset.skin;e.setSkin(w),l()})})}function r(){const g=s.querySelector('[data-toggle="memory-enabled"]'),m=e.memory?.isEnabled()??!1;g.setAttribute("aria-pressed",String(m)),g.classList.toggle("aia-set-switch-on",m),e.memory||(g.disabled=!0,g.title="初始化时未启用记忆系统")}s.querySelector('[data-toggle="memory-enabled"]').addEventListener("click",g=>{const m=g.currentTarget;if(m.disabled||!e.memory)return;const b=m.getAttribute("aria-pressed")!=="true";e.onToggleMemory?e.onToggleMemory(b):b?e.memory.enable():e.memory.disable(),r()}),s.querySelector('[data-go="memory"]').addEventListener("click",()=>{e.onGoToMemory&&e.onGoToMemory()});function c(){const g=e.memory?.size()??0;i.innerHTML=[`<div class="aia-set-about-row"><span>SDK 版本</span><span>${e.sdkVersion||"5.x"}</span></div>`,`<div class="aia-set-about-row"><span>当前会话</span><span>${e.sessionId?e.sessionId.slice(0,8)+"…":"—"}</span></div>`,`<div class="aia-set-about-row"><span>记忆条数</span><span>${g}</span></div>`].join("")}e.memory&&(t=e.memory.onChange(()=>c()));function p(){o(),l(),r(),c()}return p(),{refresh:p,destroy(){t&&(t(),t=null),s.innerHTML=""}}}function so(s){return s.innerHTML=['<div class="aia-hist-page">','  <div class="aia-hist-empty">','    <div class="aia-hist-empty-icon">📜</div>','    <div class="aia-hist-empty-title">历史会话</div>','    <div class="aia-hist-empty-hint">即将推出 — 后续版本会列出该用户过往对话</div>',"  </div>","</div>"].join(""),{refresh(){},destroy(){s.innerHTML=""}}}function oo(s,e){const t=document.createElement("div");return t.className="aiagent-sdk-cmd-dropdown",t.setAttribute("role","listbox"),t.setAttribute("aria-label","快捷指令"),t.hidden=!0,t.innerHTML=['<div class="aiagent-sdk-cmd-header">快捷指令</div>','<div class="aiagent-sdk-cmd-list"></div>','<div class="aiagent-sdk-cmd-footer">',"  <span><kbd>↑</kbd><kbd>↓</kbd>导航</span>","  <span><kbd>Enter</kbd>选择</span>","  <span><kbd>Esc</kbd>关闭</span>","</div>"].join(""),t.querySelector(".aiagent-sdk-cmd-list").addEventListener("mousedown",n=>{const i=n.target.closest(".aiagent-sdk-cmd-item");if(!i)return;n.preventDefault();const o=Number(i.dataset.index);Number.isFinite(o)&&e.onSelect(o)}),s.parentElement?.insertBefore(t,s),t}function Cn(s,e,t){const a=s.querySelector(".aiagent-sdk-cmd-list"),n=s.querySelector(".aiagent-sdk-cmd-header");if(e.length===0){a.innerHTML='<div class="aiagent-sdk-cmd-empty">无匹配指令</div>',n.textContent="快捷指令";return}n.textContent=`快捷指令 (${e.length})`;const i=e.map((l,r)=>{const c=r===t?" aiagent-sdk-cmd-active":"",p=l.cmd.icon||"⚡",g=Lt("/"+l.cmd.name),m=Lt(l.cmd.label),b=l.cmd.description?Lt(l.cmd.description):"",w=b?`<span class="aiagent-sdk-cmd-desc">${b}</span>`:"";return[`<div class="aiagent-sdk-cmd-item${c}" data-index="${r}" role="option">`,`  <span class="aiagent-sdk-cmd-icon">${Lt(p)}</span>`,'  <div class="aiagent-sdk-cmd-body">',`    <span class="aiagent-sdk-cmd-name">${g}</span>`,`    <span class="aiagent-sdk-cmd-label">${m}</span>`,"  </div>",`  ${w}`,"</div>"].join("")}).join("");a.innerHTML=i;const o=a.querySelector(".aiagent-sdk-cmd-active");if(o){const l=s.getBoundingClientRect(),r=o.getBoundingClientRect();r.bottom>l.bottom?a.scrollTop+=r.bottom-l.bottom:r.top<l.top&&(a.scrollTop-=l.top-r.top)}}function In(s){s.hidden&&(s.hidden=!1)}function ro(s){s.hidden||(s.hidden=!0)}function lo(s){return!s.hidden}function co(s,e){const t=s.querySelector(".aiagent-sdk-cmd-list");t.querySelectorAll(".aiagent-sdk-cmd-item").forEach((i,o)=>{i.classList.toggle("aiagent-sdk-cmd-active",o===e)});const n=t.querySelector(".aiagent-sdk-cmd-active");if(n){const i=s.getBoundingClientRect(),o=n.getBoundingClientRect();o.bottom>i.bottom?t.scrollTop+=o.bottom-i.bottom:o.top<i.top&&(t.scrollTop-=i.top-o.top)}}function Lt(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}const Rn=`
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M5 12 L19 12 M13 6 L19 12 L13 18"/>
</svg>
`.trim();class po{constructor(e,t){f(this,"host",null);f(this,"shadow",null);f(this,"bubble",null);f(this,"panel",null);f(this,"msgEl",null);f(this,"taEl",null);f(this,"sendBtn",null);f(this,"welcomeEl",null);f(this,"isOpen",!1);f(this,"mounted",!1);f(this,"avatarRaw","🤖");f(this,"onMouseMove",null);f(this,"skin");f(this,"_pendingInput","");f(this,"_toolPanelItems",[]);f(this,"_toolPanelStates",new Map);f(this,"_toolPanelEl",null);f(this,"_toolPanelOpen",!1);f(this,"_errorBadge",null);f(this,"_currentPage","chat");f(this,"_pageConfig",{chat:!0,memory:!1,settings:!0,history:!1});f(this,"_sidebarEl",null);f(this,"_pageEls",null);f(this,"_cmdDropdown",null);f(this,"_cmdState",{visible:!1,items:[],activeIndex:0,slashStart:0});this.opts=e,this.handlers=t;const a=e.skin||"iridescent-bloom";this.skin=ee.instance().get(a)||_s(e.theme||"ink")}get layout(){return yt(this.skin.layout)}getRefs(){return!this.host||!this.bubble||!this.panel||!this.msgEl||!this.taEl||!this.sendBtn||!this._pageEls?null:{host:this.host,bubble:this.bubble,panel:this.panel,msgEl:this.msgEl,taEl:this.taEl,sendBtn:this.sendBtn,sidebarEl:this._sidebarEl,memoryPageEl:this._pageEls.memory,settingsPageEl:this._pageEls.settings,historyPageEl:this._pageEls.history}}mount(){if(this.mounted||typeof document>"u")return;const e=document.createElement("div");e.className="aiagent-sdk-host",e.setAttribute("data-position",this.opts.position||"bottom-right"),e.setAttribute("data-theme",this.opts.theme||"ink"),e.setAttribute("data-skin",this.skin.name),e.setAttribute("data-status-dot",this.layout.statusDotStyle),e.setAttribute("data-send-icon",this.layout.sendIcon),e.setAttribute("data-message-enter",this.layout.messageEnter),e.setAttribute("data-bubble-anim",this.layout.bubbleAnimation),document.body.appendChild(e),this.host=e;const t=e.attachShadow({mode:"open"});this.shadow=t;const a=document.createElement("style");a.textContent=this.skin.css||xt,t.appendChild(a);const n=this.opts.position==="bottom-left"?" aiagent-sdk-pos-bl":"";this.avatarRaw=this.opts.avatar||"🤖";const i=this.avatarRaw.length<=2,o=document.createElement("button");i?(o.className="aiagent-sdk-bubble aiagent-sdk-bubble-emoji"+n,o.textContent=this.avatarRaw):o.className="aiagent-sdk-bubble"+n,o.setAttribute("aria-label",this.opts.title||"AI 助手 - 点击打开对话"),o.title=this.opts.title||"AI 助手",o.addEventListener("click",()=>this.toggle()),t.appendChild(o),this.bubble=o;const l=document.createElement("span");l.className="aiagent-sdk-error-badge",o.appendChild(l),this._errorBadge=l;const r=document.createElement("div");r.className="aiagent-sdk-panel"+n;const c=this.layout.cornerGlow?['<div class="aiagent-sdk-corner aiagent-sdk-corner-tl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-tr" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-bl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-br" aria-hidden="true"></div>'].join(""):"",g=ee.instance().list().length>=2?`<button class="aiagent-sdk-iconbtn aiagent-sdk-cycle-skin" title="切换皮肤 (当前:${this.skin.name})" aria-label="切换皮肤">🎨</button>`:"",m=(()=>{switch(this.layout.sendIcon){case"svg":return Rn;case"arrow":return"→";case"circle":return"";default:return Rn}})();r.innerHTML=[c,'<div class="aiagent-sdk-header">','  <div class="aiagent-sdk-header-info">','    <span class="aiagent-sdk-status-dot" aria-hidden="true"></span>','    <span class="aiagent-sdk-title"></span>',"  </div>",'  <div class="aiagent-sdk-header-actions">','    <span class="aiagent-sdk-subtitle"></span>',g,'    <button class="aiagent-sdk-iconbtn aiagent-sdk-toggle-thinking" title="显示/隐藏 思考过程" aria-label="思考">🧠</button>','    <button class="aiagent-sdk-iconbtn aiagent-sdk-new" title="新会话" aria-label="新会话">＋</button>','    <button class="aiagent-sdk-iconbtn aiagent-sdk-close" title="关闭" aria-label="关闭">✕</button>',"  </div>","</div>",'<div class="aiagent-sdk-body">','  <nav class="aiagent-sdk-sidebar" aria-label="页面导航"></nav>','  <div class="aiagent-sdk-main">','    <div class="aiagent-sdk-page aia-page-chat" data-page="chat">','      <div class="aiagent-sdk-welcome" hidden></div>','      <div class="aiagent-sdk-messages" role="log" aria-live="polite"></div>','      <div class="aiagent-sdk-inputbar">','        <textarea rows="1" placeholder="" aria-label="输入消息"></textarea>',`        <button class="aiagent-sdk-send" aria-label="发送">${m}</button>`,"      </div>","    </div>",'    <div class="aiagent-sdk-page aia-page-memory" data-page="memory" hidden></div>','    <div class="aiagent-sdk-page aia-page-settings" data-page="settings" hidden></div>','    <div class="aiagent-sdk-page aia-page-history" data-page="history" hidden></div>',"  </div>","</div>"].join(""),t.appendChild(r),this.panel=r;const b=r.querySelector(".aiagent-sdk-title"),w=r.querySelector(".aiagent-sdk-subtitle");b.textContent=this.opts.title||"AI 助手",w.textContent=this.opts.subtitle||"";const S=r.querySelector("textarea");S.placeholder=this.opts.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",this.msgEl=r.querySelector(".aia-page-chat .aiagent-sdk-messages"),this.taEl=S,this.sendBtn=r.querySelector(".aia-page-chat .aiagent-sdk-send"),this.welcomeEl=r.querySelector(".aia-page-chat .aiagent-sdk-welcome"),this._sidebarEl=r.querySelector(".aiagent-sdk-sidebar"),this._pageEls={memory:r.querySelector(".aia-page-memory"),settings:r.querySelector(".aia-page-settings"),history:r.querySelector(".aia-page-history")};const _=r.querySelector(".aia-page-chat .aiagent-sdk-inputbar");this._cmdDropdown=oo(_,{onSelect:h=>this._cmdSelectByIndex(h)}),this._renderSidebar();const R=r.querySelector(".aiagent-sdk-close"),L=r.querySelector(".aiagent-sdk-new"),k=r.querySelector(".aiagent-sdk-toggle-thinking"),y=r.querySelector(".aiagent-sdk-cycle-skin");R.addEventListener("click",()=>this.handlers.onClose()),L.addEventListener("click",()=>this.handlers.onNew()),k&&k.addEventListener("click",()=>{this.panel.classList.toggle("aiagent-sdk-thinking-hidden");const h=this.panel.classList.contains("aiagent-sdk-thinking-hidden");k.style.opacity=h?"0.4":"1"}),y&&y.addEventListener("click",()=>{const h=ee.instance().list();if(h.length<2)return;const T=this.skin.name,O=h.indexOf(T),P=h[(O+1)%h.length];if(typeof this.handlers.onCycleSkin=="function"){this.handlers.onCycleSkin(P);return}this.applySkin(P),this.panel&&(this.panel.classList.add("aiagent-sdk-skin-just-changed"),setTimeout(()=>{this.panel&&this.panel.classList.remove("aiagent-sdk-skin-just-changed")},400)),console.log("[AIAgent SDK 🎨 换肤]",T,"→",P)}),this.sendBtn.addEventListener("click",()=>{this._burstSend(),this.handlers.onSend()}),S.addEventListener("keydown",h=>{if(this._cmdDropdown&&lo(this._cmdDropdown)){if(h.key==="ArrowDown"){h.preventDefault(),this._cmdMoveActive(1);return}if(h.key==="ArrowUp"){h.preventDefault(),this._cmdMoveActive(-1);return}if(h.key==="Enter"||h.key==="Tab"){h.preventDefault(),this._cmdSelectByIndex(this._cmdState.activeIndex);return}if(h.key==="Escape"){h.preventDefault(),this._cmdHide();return}}h.key==="Enter"&&!h.shiftKey&&(h.preventDefault(),this._burstSend(),this.handlers.onSend())}),S.addEventListener("input",()=>{S.style.height="auto",S.style.height=Math.min(S.scrollHeight,80)+"px",this._cmdHandleInput()}),S.addEventListener("blur",()=>{setTimeout(()=>{const h=document.activeElement;this._cmdDropdown&&!this._cmdDropdown.contains(h)&&this._cmdHide()},120)}),this.onMouseMove=h=>{if(!this.panel)return;const T=this.panel.getBoundingClientRect(),O=(h.clientX-T.left)/T.width*100,P=(h.clientY-T.top)/T.height*100;this.panel.style.setProperty("--aia-mx",O+"%"),this.panel.style.setProperty("--aia-my",P+"%")},this.panel.addEventListener("mousemove",this.onMouseMove),this.panel.addEventListener("mouseleave",()=>{this.panel&&(this.panel.style.setProperty("--aia-mx","50%"),this.panel.style.setProperty("--aia-my","50%"))}),this.setTheme(this.opts.theme||"ink"),this._pendingInput&&this.taEl&&(this.taEl.value=this._pendingInput,this._pendingInput=""),this.mounted=!0}destroy(){this.mounted&&(this.taEl&&(this._pendingInput=this.taEl.value),this.panel&&this.onMouseMove&&this.panel.removeEventListener("mousemove",this.onMouseMove),this.host&&this.host.parentNode&&this.host.parentNode.removeChild(this.host),this.host=null,this.shadow=null,this.bubble=null,this.panel=null,this.msgEl=null,this.taEl=null,this.sendBtn=null,this.welcomeEl=null,this.mounted=!1,this.onMouseMove=null,this._sidebarEl=null,this._pageEls=null,this._currentPage="chat")}applySkin(e){const t=typeof e=="string"?ee.instance().get(e):e;if(!t){console.warn("[AIAgent SDK] applySkin: skin not found");return}if(!this.mounted||!this.host||!this.shadow||!this.panel){this.skin=t;return}this.skin=t;const a=this.shadow.querySelector("style");a&&(a.textContent=this.skin.css||xt),this.host.setAttribute("data-skin",this.skin.name),this.host.setAttribute("data-status-dot",this.layout.statusDotStyle),this.host.setAttribute("data-send-icon",this.layout.sendIcon),this.host.setAttribute("data-message-enter",this.layout.messageEnter),this.host.setAttribute("data-bubble-anim",this.layout.bubbleAnimation);const n=this.panel.querySelectorAll(".aiagent-sdk-corner");if(!this.layout.cornerGlow)n.forEach(i=>i.remove());else if(n.length===0){const i=['<div class="aiagent-sdk-corner aiagent-sdk-corner-tl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-tr" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-bl" aria-hidden="true"></div>','<div class="aiagent-sdk-corner aiagent-sdk-corner-br" aria-hidden="true"></div>'].join(""),o=document.createElement("div");for(o.innerHTML=i;o.firstChild;)this.panel.insertBefore(o.firstChild,this.panel.firstChild)}this.panel.classList.add("aiagent-sdk-skin-just-changed"),setTimeout(()=>{this.panel&&this.panel.classList.remove("aiagent-sdk-skin-just-changed")},400),this.panel.style.setProperty("--aia-mx","50%"),this.panel.style.setProperty("--aia-my","50%")}getSkin(){return this.skin}open(){this.panel&&(this.panel.classList.add("aiagent-sdk-open"),this.isOpen=!0,this.setErrorBadge(0),setTimeout(()=>{this.taEl&&this.taEl.focus()},50),this.handlers.onPanelOpen())}close(){this.panel&&(this.panel.classList.remove("aiagent-sdk-open"),this.isOpen=!1)}toggle(){this.isOpen?this.close():this.open()}getIsOpen(){return this.isOpen}setTheme(e){this.host&&this.host.setAttribute("data-theme",e)}clearMessages(){this.msgEl&&(this.msgEl.innerHTML="")}setErrorBadge(e){this._errorBadge&&(e<=0||this.isOpen?(this._errorBadge.style.display="none",this._errorBadge.textContent=""):(this._errorBadge.textContent=e>99?"99+":String(e),this._errorBadge.style.display="flex"))}setWelcome(e){if(this.welcomeEl){if(!e){this.welcomeEl.hidden=!0;return}this.welcomeEl.hidden=!1,this.welcomeEl.textContent=e}}hideWelcome(){this.welcomeEl&&(this.welcomeEl.hidden||(this.welcomeEl.classList.add("aiagent-sdk-welcome-leaving"),setTimeout(()=>{this.welcomeEl&&(this.welcomeEl.hidden=!0,this.welcomeEl.classList.remove("aiagent-sdk-welcome-leaving"))},280)))}_cmdDetectSlash(e){const t=e.selectionStart??0,a=e.value;let n=t-1;for(;n>=0;){const i=a[n];if(i==="/"){if(n===0){const l=a.slice(n+1,t);return/\s/.test(l)?null:{start:n,query:l}}const o=a[n-1];if(/\s/.test(o)){const l=a.slice(n+1,t);return/\s/.test(l)?null:{start:n,query:l}}return null}if(/\s/.test(i))return null;n--}return null}_cmdHandleInput(){if(!this._cmdDropdown||!this.taEl||typeof this.handlers.onCommandSearch!="function")return;const e=this._cmdDetectSlash(this.taEl);if(!e){this._cmdState.visible&&this._cmdHide();return}const t=this.handlers.onCommandSearch(e.query);if(this._cmdState.slashStart=e.start,this._cmdState.items=t,this._cmdState.activeIndex=0,t.length===0){this._cmdShowEmpty();return}Cn(this._cmdDropdown,t,0),In(this._cmdDropdown),this._cmdState.visible=!0}_cmdShowEmpty(){this._cmdDropdown&&(Cn(this._cmdDropdown,[],0),In(this._cmdDropdown),this._cmdState.visible=!0)}_cmdHide(){this._cmdDropdown&&(ro(this._cmdDropdown),this._cmdState.visible=!1,this._cmdState.items=[],this._cmdState.activeIndex=0)}_cmdMoveActive(e){if(!this._cmdDropdown)return;const t=this._cmdState.items.length;if(t===0)return;let a=this._cmdState.activeIndex+e;a<0&&(a=t-1),a>=t&&(a=0),this._cmdState.activeIndex=a,co(this._cmdDropdown,a)}_cmdSelectByIndex(e){const t=this._cmdState.items[e];t&&(this._cmdHide(),typeof this.handlers.onCommandSelect=="function"&&this.handlers.onCommandSelect(t.cmd))}setInputFromCommand(e){if(!this.taEl)return;const t=this.taEl;if(e.mode==="append"){t.value=t.value+e.replace,t.style.height="auto",t.style.height=Math.min(t.scrollHeight,80)+"px",t.dispatchEvent(new Event("input",{bubbles:!0}));const o=t.value.length;t.setSelectionRange(o,o),t.focus();return}const a=this._cmdState.slashStart,n=e.deleteLen??0;a<0||a+n>t.value.length?t.value=t.value+e.replace:t.value=t.value.slice(0,a)+e.replace+t.value.slice(a+n),t.style.height="auto",t.style.height=Math.min(t.scrollHeight,80)+"px",t.dispatchEvent(new Event("input",{bubbles:!0}));const i=e.cursor!==void 0?a+e.cursor:a+e.replace.length;t.setSelectionRange(i,i),t.focus()}notifyInputChanged(){this.taEl&&this.taEl.dispatchEvent(new Event("input",{bubbles:!0}))}getSlashQueryLen(){if(!this.taEl)return 0;const e=this.taEl.selectionStart??0;return this._cmdState.visible?Math.max(0,e-this._cmdState.slashStart):0}clearInput(){this.taEl&&(this.taEl.value="",this.taEl.style.height="auto",this.taEl.style.height=Math.min(this.taEl.scrollHeight,80)+"px",this.taEl.dispatchEvent(new Event("input",{bubbles:!0})),this.taEl.focus())}_burstSend(){if(!this.sendBtn)return;const e=5,t=["#5eead4","#a78bfa","#f0abfc","#93c5fd","#fcd34d"];for(let a=0;a<e;a++){const n=Math.PI*2*a/e+Math.random()*.5,i=22+Math.random()*14,o=Math.cos(n)*i,l=Math.sin(n)*i,r=document.createElement("span");r.className="aiagent-sdk-send-burst",r.style.setProperty("--bx",o+"px"),r.style.setProperty("--by",l+"px");const c=t[a];r.style.setProperty("--c",c),r.style.background=c,this.sendBtn.appendChild(r),setTimeout(()=>r.remove(),750)}}registerToolPanelItems(e){for(const t of e)this._toolPanelItems=this._toolPanelItems.filter(a=>a.name!==t.name),this._toolPanelItems.push(t),t.type==="toggle"&&this._toolPanelStates.set(t.name,!!t.defaultOn);this._renderToolPanel()}getToolPanelState(e){return this._toolPanelStates.get(e)||!1}setToolPanelState(e,t){this._toolPanelStates.set(e,t),this._updateToolPanelUI()}_renderToolPanel(){if(!this.panel||!this.shadow)return;if(this._toolPanelItems.length===0){const t=this.panel.querySelector(".aiagent-sdk-tool-panel-btn");t&&t.remove(),this._toolPanelEl&&(this._toolPanelEl.remove(),this._toolPanelEl=null);return}let e=this.panel.querySelector(".aiagent-sdk-tool-panel-btn");if(!e){const t=this.panel.querySelector(".aiagent-sdk-header-actions");if(!t)return;e=document.createElement("button"),e.className="aiagent-sdk-iconbtn aiagent-sdk-tool-panel-btn",e.title="工具面板",e.setAttribute("aria-label","工具面板"),e.textContent="🔧";const a=t.querySelector(".aiagent-sdk-cycle-skin");a?t.insertBefore(e,a):t.insertBefore(e,t.children[1]),e.addEventListener("click",()=>this._toggleToolPanel())}this._renderToolPanelDropdown()}_toggleToolPanel(){this._toolPanelOpen=!this._toolPanelOpen,this._toolPanelEl&&this._toolPanelEl.classList.toggle("aiagent-sdk-tool-panel-open",this._toolPanelOpen),this._toolPanelOpen&&setTimeout(()=>{const e=t=>{this._toolPanelEl&&!this._toolPanelEl.contains(t.target)&&(this._toolPanelOpen=!1,this._toolPanelEl.classList.remove("aiagent-sdk-tool-panel-open"),document.removeEventListener("click",e))};document.addEventListener("click",e)},0)}_renderToolPanelDropdown(){if(!this.panel)return;if(!this._toolPanelEl){this._toolPanelEl=document.createElement("div"),this._toolPanelEl.className="aiagent-sdk-tool-panel";const t=this.panel.querySelector(".aiagent-sdk-header");t&&t.nextSibling?this.panel.insertBefore(this._toolPanelEl,t.nextSibling):this.panel.appendChild(this._toolPanelEl)}const e=this._toolPanelItems.map(t=>{const a=t.icon||(t.type==="toggle"?"🔌":"⚡"),n=t.type==="toggle"&&this._toolPanelStates.get(t.name)||!1,i=t.type==="toggle"?`aiagent-sdk-tp-toggle ${n?"aiagent-sdk-tp-on":"aiagent-sdk-tp-off"}`:"aiagent-sdk-tp-action",o=t.type==="toggle"?'<span class="aiagent-sdk-tp-switch"><span class="aiagent-sdk-tp-switch-knob"></span></span>':'<span class="aiagent-sdk-tp-arrow">→</span>';return`<div class="aiagent-sdk-tp-item ${i}" data-name="${t.name}" data-type="${t.type}" title="${t.description||""}">
        <span class="aiagent-sdk-tp-icon">${a}</span>
        <span class="aiagent-sdk-tp-label">${t.label}</span>
        ${o}
      </div>`}).join("");this._toolPanelEl.innerHTML=`<div class="aiagent-sdk-tp-title">工具面板</div>${e}`,this._toolPanelEl.querySelectorAll(".aiagent-sdk-tp-item").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.name;t.dataset.type==="toggle"?this._handleToggle(a):this._handleAction(a)})}),this._toolPanelEl.classList.toggle("aiagent-sdk-tool-panel-open",this._toolPanelOpen)}_updateToolPanelUI(){this._toolPanelEl&&this._toolPanelEl.querySelectorAll('.aiagent-sdk-tp-item[data-type="toggle"]').forEach(e=>{const t=e.dataset.name,a=this._toolPanelStates.get(t)||!1;e.classList.toggle("aiagent-sdk-tp-on",a),e.classList.toggle("aiagent-sdk-tp-off",!a)})}_handleToggle(e){const t=this._toolPanelItems.find(o=>o.name===e);if(!t||t.type!=="toggle")return;const n=!(this._toolPanelStates.get(e)||!1);this._toolPanelStates.set(e,n),this._updateToolPanelUI();const i=!t.onToggle;typeof this.handlers.onToolPanelToggle=="function"&&this.handlers.onToolPanelToggle(e,n,i)}_handleAction(e){const t=this._toolPanelItems.find(n=>n.name===e);if(!t||t.type!=="action")return;const a=this._toolPanelEl?.querySelector(`.aiagent-sdk-tp-item[data-name="${e}"]`);a&&(a.classList.add("aiagent-sdk-tp-flash"),setTimeout(()=>a.classList.remove("aiagent-sdk-tp-flash"),300)),typeof this.handlers.onToolPanelAction=="function"&&this.handlers.onToolPanelAction(e)}setPageConfig(e){this._pageConfig={chat:e.chat!==!1,memory:!!e.memory,settings:e.settings!==!1,history:!!e.history},this.mounted&&this._renderSidebar()}switchPage(e){if(!this._pageConfig[e]||this._currentPage===e||!this._pageEls)return;const t=this._currentPage;this._currentPage=e;const a={chat:this.msgEl?.parentElement||null,memory:this._pageEls.memory,settings:this._pageEls.settings,history:this._pageEls.history};for(const[n,i]of Object.entries(a))i&&(i.hidden=n!==e);if(this._updateSidebarActive(),typeof this.handlers.onPageChange=="function")try{this.handlers.onPageChange(e)}catch(n){try{console.warn("[AIAgent SDK] onPageChange failed:",n)}catch{}}try{console.log("[AIAgent SDK 📄]",t,"→",e)}catch{}}getCurrentPage(){return this._currentPage}_renderSidebar(){if(!this._sidebarEl)return;const e=[{name:"chat",icon:"💬",label:"对话"}];this._pageConfig.memory&&e.push({name:"memory",icon:"🧠",label:"记忆"}),this._pageConfig.settings&&e.push({name:"settings",icon:"⚙️",label:"设置"}),this._pageConfig.history&&e.push({name:"history",icon:"📜",label:"历史"}),this._sidebarEl.innerHTML=e.map(t=>`<button class="aiagent-sdk-nav-item" data-page="${t.name}" title="${t.label}" aria-label="${t.label}">${t.icon}</button>`).join(""),this._sidebarEl.querySelectorAll(".aiagent-sdk-nav-item").forEach(t=>{t.addEventListener("click",a=>{const n=a.currentTarget.dataset.page;this.switchPage(n)})}),this._updateSidebarActive()}_updateSidebarActive(){this._sidebarEl&&this._sidebarEl.querySelectorAll(".aiagent-sdk-nav-item").forEach(e=>{const t=e.dataset.page;e.classList.toggle("aia-nav-active",t===this._currentPage)})}}function go(s,e){s.setTheme(e)}const te=class te{constructor(){f(this,"endpoint");f(this,"getAccessToken");f(this,"_opts");f(this,"_tokenCache",new N);f(this,"_tools",new Hs);f(this,"_widget",null);f(this,"_isOpen",!1);f(this,"_busy",!1);f(this,"_messages",[]);f(this,"_chatSessionId",null);f(this,"_activeTools",[]);f(this,"_persistentTools",[]);f(this,"_ephemeralTools",[]);f(this,"_pendingToolCall",null);f(this,"_lastToolCard",null);f(this,"_thinkingCard",null);f(this,"_thinkingBuf","");f(this,"_pageAwareness",null);f(this,"_memory",null);f(this,"_memoryPage",null);f(this,"_settingsPage",null);f(this,"_historyPage",null);f(this,"_pendingDelta",new Map);f(this,"_commands",new Vs);f(this,"_cmdSlashEnd",0)}init(e){if(!e||!e.endpoint)throw new Error("endpoint required");if(typeof e.getAccessToken!="function")throw new Error("getAccessToken() required");if(this.endpoint=String(e.endpoint).replace(/\/+$/,""),this.getAccessToken=e.getAccessToken,this._opts={title:e.title||"AI 助手",subtitle:e.subtitle||"在线",placeholder:e.placeholder||"输入消息,Enter 发送,Shift+Enter 换行",welcomeMessage:e.welcomeMessage||"你好!我是 AI 助手,有什么可以帮你的?",theme:e.theme||"ink",position:e.position||"bottom-right",autoOpen:!!e.autoOpen,avatar:e.avatar||"🤖",clientPrefix:e.clientPrefix||"app",persistentTools:e.persistentTools||[],builtinTools:e.builtinTools||{},skin:e.skin||"iridescent-bloom"},this._widget=new po(this._opts,{onSend:()=>this._onSend(),onNew:()=>this._newSession(),onClose:()=>this.close(),onPanelOpen:()=>{},onCycleSkin:t=>this.setSkin(t),onToolPanelToggle:(t,a,n)=>this._handleToolPanelToggle(t,a,n),onToolPanelAction:t=>this._handleToolPanelAction(t),onPageChange:t=>this._handlePageChange(t),onCommandSearch:t=>this._commands.search(t),onCommandSelect:t=>this._executeCommand(t)}),this._widget.mount(),this._commands.register(te._builtinCommands()),e.quickCommands&&e.quickCommands.length>0&&this._commands.register(e.quickCommands),this._widget.setPageConfig({chat:!0,memory:!!e.memory?.enabled,settings:!0,history:!!(e.pages&&e.pages.history)}),this._opts.autoOpen&&this.open(),this._opts.welcomeMessage&&this._widget.setWelcome(this._opts.welcomeMessage),e.pageAwareness?.enabled){const t=this,a={isWidgetOpen:()=>t._isOpen,appendSystemMsg:n=>t._appendMsg("system",n),onErrorBadge:n=>t._widget?.setErrorBadge(n)};this._pageAwareness=new ca(this.endpoint,e.pageAwareness,a),this._pageAwareness.start(),e.pageAwareness.behavior?.registerTool!==!1&&te.registerBuiltinTool(Tn({getPageErrors:()=>this.getPageErrors(),clearPageErrors:()=>this.clearPageErrors()}))}return e.memory?.enabled&&(this._memory=new At(e.memory),this._memory.enable(),e.builtinTools?.memory!==!1&&(te.registerBuiltinTool(mn(this._memory)),te.registerBuiltinTool(bn(this._memory)))),setTimeout(()=>{this._resumePendingToolResults()},0),this._persistentTools=this._opts.persistentTools.slice(),this}destroy(){this._pageAwareness?.stop(),this._pageAwareness=null,this._memory?.disable(),this._memory=null,this._memoryPage?.destroy(),this._memoryPage=null,this._settingsPage?.destroy(),this._settingsPage=null,this._historyPage?.destroy(),this._historyPage=null,this._widget&&(this._widget.destroy(),this._widget=null)}registerCommands(e){this._commands.register(e||[])}unregisterCommands(e){if(!e||e.length===0){this._commands.register(te._builtinCommands());return}this._commands.unregister(e)}listCommands(){return this._commands.list()}_executeCommand(e){if(this._widget){if(e.action){this._widget.clearInput();try{const t=e.action(this);t&&typeof t.then=="function"&&t.catch(a=>{try{console.warn("[AIAgent SDK ⚡ 命令执行失败]",e.name,a)}catch{}})}catch(t){try{console.warn("[AIAgent SDK ⚡ 命令执行异常]",e.name,t)}catch{}}return}if(e.expandsTo){this._widget.setInputFromCommand({mode:"replace",deleteLen:this._widget.getSlashQueryLen(),replace:e.expandsTo,cursor:e.expandsTo.length});return}this._widget.setInputFromCommand({mode:"replace",deleteLen:this._widget.getSlashQueryLen(),replace:"/"+e.name+" "})}}static _builtinCommands(){return[{name:"new",label:"新会话",icon:"＋",description:"创建新的对话会话",action:e=>{e._newSession()}},{name:"clear",label:"清空聊天",icon:"✕",description:"清空当前聊天消息",action:e=>{const t=e;t._widget?.clearMessages(),t._messages=[]}},{name:"help",label:"帮助",icon:"?",description:"显示所有可用命令",action:e=>{const t=e,n=t._commands.list().map(i=>{const o=i.icon||"⚡",l=i.description?` — ${i.description}`:"";return`  ${o} /${i.name}  ${i.label}${l}`});t._appendMsg("system",`📋 可用命令:
`+n.join(`
`))}}]}async registerTools(e){if(!e||!e.sessionId)throw new Error("sessionId required");if(!e.tools||!e.tools.length)throw new Error("tools required");return this._internalRegister(e.sessionId,e.tools)}async unregisterTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const a=t.names||null;this._tools.unregister(t.sessionId,a);const n=await this._ensureToken();return _n(this.endpoint,n,t.sessionId,a)}async listTools(e){const t=e||{};if(!t.sessionId)throw new Error("sessionId required");const a=await this._ensureToken();return Us(this.endpoint,a,t.sessionId)}async _internalRegister(e,t){const a=this._tools.register(e,t),n=await this._ensureToken();return js(this.endpoint,n,e,a)}async _internalAppend(e,t){const a=this._tools.register(e,t),n=await this._ensureToken();return qs(this.endpoint,n,e,a)}async _syncToolsForSession(e){const t=this._persistentTools.slice(),a=this._opts.builtinTools;for(const n of te._builtinTools)n.name==="change_skin"&&a&&a.changeSkin===!1||n.name==="get_page_errors"&&a&&a.pageErrors===!1||t.push(n);if(t.length>0)try{await this._internalRegister(e,t);for(const n of t)this._activeTools.indexOf(n.name)<0&&this._activeTools.push(n.name);console.log("[AIAgent SDK 🧰 持久工具已注册到 chat session]",t.map(n=>n.name).join(", "))}catch(n){console.warn("[AIAgent SDK] persistent tools register failed:",n)}if(this._ephemeralTools.length>0)try{await this._internalAppend(e,this._ephemeralTools);for(const n of this._ephemeralTools)this._activeTools.indexOf(n.name)<0&&this._activeTools.push(n.name);console.log("[AIAgent SDK 🧰 临时工具已追加到 chat session]",this._ephemeralTools.map(n=>n.name).join(", "))}catch(n){console.warn("[AIAgent SDK] ephemeral tools append failed:",n)}}async addEphemeralTools(e){if(!(!e||!e.length)){for(const t of e)this._ephemeralTools=this._ephemeralTools.filter(a=>a.name!==t.name),this._ephemeralTools.push(t);if(this._chatSessionId)try{await this._internalAppend(this._chatSessionId,e);for(const t of e)this._activeTools.indexOf(t.name)<0&&this._activeTools.push(t.name);console.log("[AIAgent SDK 🧰 临时工具已追加到当前会话]",e.map(t=>t.name).join(", "))}catch(t){console.warn("[AIAgent SDK] ephemeral tools append failed:",t)}}}async removeEphemeralTools(e){if(!(!e||!e.length)&&(this._ephemeralTools=this._ephemeralTools.filter(t=>!e.includes(t.name)),this._activeTools=this._activeTools.filter(t=>!e.includes(t)),this._chatSessionId))try{const t=await this._ensureToken();await _n(this.endpoint,t,this._chatSessionId,e)}catch(t){console.warn("[AIAgent SDK] ephemeral tools remove failed:",t)}}_getLocalTool(e,t){return this._tools.get(e,t)}static registerBuiltinTool(e){if(!e||!e.name){console.warn("[AIAgent SDK] registerBuiltinTool: invalid tool");return}te._builtinTools=te._builtinTools.filter(t=>t.name!==e.name),te._builtinTools.push(e)}async stream(e){const t=e||{};return this._postStream({sessionId:t.sessionId,message:t.message,activeTools:t.activeTools||[],onChunk:t.onChunk||(()=>{}),onDone:t.onDone||(()=>{}),onError:t.onError||(a=>console.error(a)),onToolCall:t.onToolCall,onToolCallDelta:t.onToolCallDelta,onToolCallStart:t.onToolCallStart,onToolCallEnd:t.onToolCallEnd})}open(){this._widget&&this._widget.open(),this._isOpen=!0}close(){this._widget&&this._widget.close(),this._isOpen=!1}toggle(){this._widget&&this._widget.toggle(),this._isOpen=this._widget?this._widget.getIsOpen():!1}setTheme(e){this._widget&&go(this._widget,e.theme)}setSkin(e){if(!this._widget)return;if(!ee.instance().get(e)){console.warn("[AIAgent SDK] setSkin: skin not found:",e);return}this._widget.applySkin(e)}registerSkin(e){ee.instance().register(e)}listSkins(){return ee.instance().list()}listSkinsWithInfo(){return ee.instance().listWithInfo()}getPageErrors(){return this._pageAwareness?.getErrors()||[]}clearPageErrors(){this._pageAwareness?.clear()}reportPageError(e){this._pageAwareness?.report(e)}enableMemory(){this._memory?.enable()}disableMemory(){this._memory?.disable()}isMemoryEnabled(){return this._memory?.isEnabled()??!1}saveMemory(e){if(!this._memory)return null;try{return this._memory.upsert(e)}catch(t){if(t&&typeof t=="object"&&t.name==="CapacityError")return t;throw t}}recallMemory(e,t){return this._memory?this._memory.search(e,{...t,touch:!1}):[]}listMemories(e){return this._memory?this._memory.list(e):[]}deleteMemory(e){return this._memory?.delete(e)??!1}clearMemories(){this._memory?.clear()}exportMemories(){return this._memory?.export()??'{"version":1,"entries":[]}'}importMemories(e){return this._memory?this._memory.import(e):0}onMemoryChange(e){return this._memory?this._memory.onChange(e):()=>{}}switchPage(e){this._widget&&this._widget.switchPage(e)}getCurrentPage(){return this._widget?.getCurrentPage()||"chat"}_handlePageChange(e){if(!this._widget)return;const t=this._widget.getRefs();if(t)if(e==="memory"){if(!this._memory){t.memoryPageEl.innerHTML='<div class="aia-page-empty"><div class="aia-page-empty-icon">🧠</div><div class="aia-page-empty-title">记忆系统未启用</div><div class="aia-page-empty-hint">请在 init 时配 memory: { enabled: true }</div></div>';return}if(this._memoryPage)this._memoryPage.refresh();else{const a=this;this._memoryPage=no(t.memoryPageEl,this._memory,{onConfirmClear:()=>{try{return confirm("确定清空所有记忆？此操作不可恢复。")}catch{return!1}},onToast:(n,i)=>{try{a._appendMsg("system",`[Memory] ${n}`)}catch{}}})}}else if(e==="settings")if(this._settingsPage)this._settingsPage.refresh();else{const a=this;this._settingsPage=io(t.settingsPageEl,{getTheme:()=>a._opts.theme,setTheme:n=>a.setTheme({theme:n}),getCurrentSkin:()=>a._widget?.getSkin()?.name||"iridescent-bloom",setSkin:n=>a.setSkin(n),memory:a._memory,onToggleMemory:n=>{n?a.enableMemory():a.disableMemory(),a._settingsPage?.refresh()},onGoToMemory:()=>a.switchPage("memory"),sdkVersion:"5.0.0",sessionId:a._chatSessionId})}else e==="history"&&(this._historyPage?this._historyPage.refresh():this._historyPage=so(t.historyPageEl))}registerToolPanel(e){if(this._widget){this._widget.registerToolPanelItems(e);for(const t of e)t.type==="toggle"&&t.defaultOn&&t.tool&&!t.onToggle&&this.addEphemeralTools([t.tool])}}_handleToolPanelToggle(e,t,a){if(!this._widget)return;const i=this._widget._toolPanelItems?.find(o=>o.name===e);i&&(i.tool&&(t?this.addEphemeralTools([i.tool]):this.removeEphemeralTools([i.tool.name])),typeof i.onToggle=="function"&&i.onToggle(t))}_handleToolPanelAction(e){if(!this._widget)return;const a=this._widget._toolPanelItems?.find(n=>n.name===e);!a||a.type!=="action"||typeof a.onExecute=="function"&&a.onExecute()}_renderHistory(e){if(!(!this._widget||!this._widget.getRefs()))for(const a of e)a.role!=="tool"&&this._renderMsg(a.role,a.text)}_snapshotThinkingCard(e){const t=e.querySelector(".aiagent-sdk-thinking-body");return{content:t?t.innerHTML:"",done:e.classList.contains("aiagent-sdk-thinking-done")}}_snapshotToolCard(e){const t=e.getAttribute("data-tool")||"",a=e.getAttribute("data-args");let n={};if(a)try{n=JSON.parse(a)}catch{n={}}else{const l=e.querySelector(".aiagent-sdk-tool-body")?.textContent||"";try{n=JSON.parse(l)}catch{n={}}}let i="pending";e.classList.contains("aiagent-sdk-tool-success")?i="success":e.classList.contains("aiagent-sdk-tool-card--delta")?i="delta":e.classList.contains("aiagent-sdk-tool-cancelled")?i="cancelled":e.classList.contains("aiagent-sdk-tool-done")?i="done":e.classList.contains("aiagent-sdk-tool-confirmed")?i="confirmed":e.classList.contains("aiagent-sdk-tool-card--pending")&&(i="pending");const o=i==="delta"&&e.querySelector(".aiagent-sdk-tool-body")?.textContent||"";return{tool:t,args:n,state:i,bodyText:o}}_snapshotCards(){const e=this._widget?.getRefs();if(!e)return[];const t=[];return e.msgEl.querySelectorAll(".aiagent-sdk-thinking-card, .aiagent-sdk-tool-card").forEach(n=>{if(n.classList.contains("aiagent-sdk-thinking-card")){const i=this._snapshotThinkingCard(n);t.push({kind:"thinking",...i})}else{const i=this._snapshotToolCard(n);t.push({kind:"tool",...i})}}),t}_renderCardSnapshots(e){if(!this._widget)return;const t=this._widget.getRefs();if(t)for(const a of e)if(a.kind==="thinking"){const n=pn(t.msgEl),i=n.querySelector(".aiagent-sdk-thinking-body");i&&(i.innerHTML=a.content),a.done&&De(n)}else if(a.state==="delta"&&Object.keys(a.args).length===0){const n=ra(t.msgEl,a.tool||"...",a.tool);a.bodyText&&gn(n,a.bodyText)}else{const n=wt(t.msgEl,a.tool,a.args);if(a.state==="pending")n.classList.add("aiagent-sdk-tool-card--pending");else if(a.state==="confirmed"||a.state==="success")Xe(n,"✓ 完成");else if(a.state==="cancelled"){n.classList.add("aiagent-sdk-tool-cancelled");const i=n.querySelector(".aiagent-sdk-tool-status");i&&(i.textContent="✕ 已取消")}else a.state==="done"&&Xe(n,"✓ 完成")}}async _ensureToken(){return this._tokenCache.get(this.getAccessToken)}_newSession(){const e=this._chatSessionId;e&&Ct(this.endpoint,"",e).catch(()=>{}),this._widget&&this._widget.clearMessages(),this._messages=[],this._activeTools=[],this._chatSessionId=null,this._thinkingCard=null,this._pendingDelta.clear(),this._ephemeralTools=[],this._pageAwareness?.resetSurfacedFlags(),this._widget&&this._widget.setErrorBadge(0),this._widget&&this._opts.welcomeMessage&&this._widget.setWelcome(this._opts.welcomeMessage)}static buildStreamHandlers(e){let t="",a=!1;function n(){a||(a=!0,fn(e.typing),Is(e.typing),e.onUpgrade&&e.onUpgrade())}return{onChunk:i=>{t+=i.data||"",n(),e.typing.innerHTML=bt(t),kt(e.typing),e.msgEl.scrollTop=e.msgEl.scrollHeight},onDone:()=>{!a&&!t?e.typing.remove():(n(),Et(e.typing),e.typing.innerHTML=bt(t),kt(e.typing)),e.onAssistantText&&e.onAssistantText(t),e.msgEl.scrollTop=e.msgEl.scrollHeight,e.onDoneCleanup&&e.onDoneCleanup()},onError:i=>{fn(e.typing),a?(Et(e.typing),e.typing.className="aiagent-sdk-msg aiagent-sdk-msg-system",e.typing.textContent="⚠️ "+i.message):(e.typing.remove(),e.onErrorFallback&&e.onErrorFallback("⚠️ "+i.message)),e.onDoneCleanup&&e.onDoneCleanup()},isReplaced:()=>a,getAssistantBuf:()=>t}}_onSend(){if(!this._widget)return;const e=this._widget.getRefs();if(!e)return;const t=e.taEl.value.trim();!t||this._busy||(e.taEl.value="",e.taEl.style.height="auto",this._sendUserMessage(t))}async _sendUserMessage(e){this._widget&&this._widget.hideWelcome(),this._appendMsg("user",e),this._setBusy(!0);const t=this._widget.getRefs(),a=St(t.msgEl);this._thinkingBuf="";const n=this,i=this._activeTools.slice();let o=!1;const l={typing:a},r=(()=>{const g=te.buildStreamHandlers({typing:a,msgEl:t.msgEl,onUpgrade:()=>{n._thinkingCard&&(De(n._thinkingCard),n._thinkingCard=null)},onErrorFallback:m=>n._appendMsg("system",m),onAssistantText:m=>{m&&n._messages.push({role:"assistant",text:m})},onDoneCleanup:()=>{o||n._setBusy(!1),n._thinkingCard&&(De(n._thinkingCard),n._thinkingCard=null)}});return{onChunk:g.onChunk,onDone:g.onDone,onError:g.onError,getAssistantBuf:g.getAssistantBuf}})();let c=e;if(this._pageAwareness?.isEnabled()){const g=this._pageAwareness.buildContextBlock();g&&(c=g+`

`+e)}if(this._memory?.isEnabled()){const g=this._memory.buildContextBlock(e);g&&(c=(c===e?"":c+`

`)+g+`

`+e)}const p={message:c,onChunk:g=>r.onChunk(g),onDone:()=>r.onDone(),onError:g=>r.onError(g),onThinking:g=>{n._handleThinking(g,t.msgEl,l.typing)},onToolCallStart:g=>{n._handleToolCallStart(g,t.msgEl,l.typing)},onToolCallDelta:g=>{n._handleToolCallDelta(g,t.msgEl,l.typing)},onToolCallEnd:g=>{console.log("[AIAgent SDK 🏁 onToolCallEnd] 流式工具参数传输结束",g)},onRoundEnd:g=>{n._thinkingBuf="",n._thinkingCard&&(De(n._thinkingCard),n._thinkingCard=null);const m=r.getAssistantBuf();m&&n._messages.push({role:"assistant",text:m});const b=l.typing;if(b&&b.parentNode){const _=b.querySelector(".aiagent-sdk-typing-particle"),R=!b.textContent?.trim();_||R?b.remove():Et(b)}const w=St(t.msgEl),S=te.buildStreamHandlers({typing:w,msgEl:t.msgEl,onUpgrade:()=>{n._thinkingCard&&(De(n._thinkingCard),n._thinkingCard=null)},onErrorFallback:_=>n._appendMsg("system",_),onAssistantText:_=>{_&&n._messages.push({role:"assistant",text:_})},onDoneCleanup:()=>{o||n._setBusy(!1),n._thinkingCard&&(De(n._thinkingCard),n._thinkingCard=null)}});r.onChunk=S.onChunk,r.onDone=S.onDone,r.onError=S.onError,l.typing=w},onToolCall:async g=>{n._setBusy(!0),await n._handleToolCall(g,t.msgEl,l.typing)&&(o=!0)},onText:g=>{g&&r.onChunk({event:"text",data:g})}};this._chatSessionId||(this._chatSessionId=this._opts.clientPrefix+":user-"+Date.now(),await this._syncToolsForSession(this._chatSessionId)),p.sessionId=this._chatSessionId,p.activeTools=i;try{await this._postStream(p)}catch{}}_handleThinking(e,t,a){if(this._thinkingBuf||(this._thinkingBuf=""),this._thinkingBuf+=e,!this._thinkingCard){t.insertBefore(pn(t),a);const n=t.querySelectorAll(".aiagent-sdk-thinking-card");this._thinkingCard=n.length?n[n.length-1]:null}this._thinkingCard&&Ts(this._thinkingCard,this._thinkingBuf)}_handleToolCallStart(e,t,a){if(!e||!e.id||!e.name)return;const n=ra(t,e.id,e.name,a||null);this._pendingDelta.set(e.id,n)}_handleToolCallDelta(e,t,a){if(!e||!e.id)return;let n=this._pendingDelta.get(e.id);n||(n=ra(t,e.id,e.name||"...",a||null),this._pendingDelta.set(e.id,n)),gn(n,e.delta||"")}async _handleToolCall(e,t,a){if(!e||!e.tool||e.tool.indexOf("__")===0)return!1;if(!!e.server_executed){const p=e.id?this._pendingDelta.get(e.id):null;if(p)Tt(p,e.args||{},e.tool),this._pendingDelta.delete(e.id),Xe(p);else{const g=wt(t,e.tool,e.args||{},a||null);Tt(g,e.args||{},e.tool),Xe(g)}return this._messages.push({role:"tool",text:"",data:{tool:e.tool,args:e.args||{}}}),!1}if(!e.args||typeof e.args!="object"||Object.keys(e.args).length===0)return!1;const i=e.id?this._pendingDelta.get(e.id):null,o=i?(Tt(i,e.args,e.tool),this._pendingDelta.delete(e.id),i):(()=>{const p=wt(t,e.tool,e.args,a||null);return Tt(p,e.args,e.tool),p})();this._lastToolCard=o,this._messages.push({role:"tool",text:"",data:{tool:e.tool,args:e.args}});const l=this._getLocalTool(this._chatSessionId,e.tool),r=!!(l&&l.onCall);if(!r&&!await Ss(o))return this._appendMsg("system",`🚫 已取消工具调用:${e.tool}`),await this._postAbort(),!0;let c=r?void 0:{confirmed:!0};if(r)try{c=await Promise.resolve(l.onCall(e.args))}catch(p){console.error("[AIAgent SDK] onCall threw:",p),this._appendMsg("system","⚠️ onCall 失败: "+p.message)}return e.id&&await this._postToolResult(e.id,c,o),!0}_setBusy(e){if(this._busy=e,!this._widget)return;const t=this._widget.getRefs();t&&(t.sendBtn.disabled=e,t.sendBtn.textContent=e?"...":"发送")}_sleep(e){return new Promise(t=>setTimeout(t,e))}_appendMsg(e,t,a){if(!this._widget)return;const n=this._widget.getRefs();n&&(un(n.msgEl,e,t,this._messages.length,a),this._messages.push({role:e,text:t,data:a}))}_renderMsg(e,t,a){if(!this._widget)return;const n=this._widget.getRefs();n&&(!t&&e!=="system"||un(n.msgEl,e,t,this._messages.length,a))}_appendTyping(){if(!this._widget)return document.createElement("div");const e=this._widget.getRefs();return e?St(e.msgEl):document.createElement("div")}async _postStream(e){const t=e.sessionId,a=e.message,n=e.activeTools,i=e.onChunk||(()=>{}),o=e.onDone||(()=>{}),l=e.onError||(k=>console.error(k)),r=e.onToolCall,c=e.onToolCallDelta,p=e.onToolCallStart,g=e.onToolCallEnd,m=e.onThinking,b=e.onRoundEnd,w=e.onText;if(!t){l(new Error("sessionId required"));return}if(a==null){l(new Error("message required"));return}let S;try{S=await this._ensureToken()}catch(k){l(k);return}const _=this.endpoint+"/chat/"+encodeURIComponent(t)+"/stream",R={message:a};n&&n.length&&(R.activeTools=n);let L;try{L=await fetch(_,{method:"POST",headers:{Authorization:"Bearer "+S,"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify(R)})}catch(k){l(k);return}if(!L.ok||!L.body){l(new Error("http "+L.status));return}return ae(L.body,i,o,l,r,c,p,g,m,b,w)}async _postToolResult(e,t,a){const n=this._toolCtx();return Ws(n,e,t,a)}async _postAbort(){const e=this._chatSessionId;if(e){try{await Ct(this.endpoint,await this._ensureToken(),e)}catch(t){console.warn("[AIAgent SDK] abort failed:",t.message)}this._setBusy(!1)}}async _resumePendingToolResults(){return Js(this._toolCtx())}_toolCtx(){const e=this;return{endpoint:this.endpoint,ensureToken:()=>e._ensureToken(),getSessionId:()=>e._chatSessionId,getPending:()=>e._pendingToolCall,setPending:t=>{e._pendingToolCall=t},appendMsg:(t,a,n)=>e._appendMsg(t,a,n),setBusy:t=>e._setBusy(t),sleep:t=>e._sleep(t),appendTyping:()=>e._appendTyping(),getMsgEl:()=>e._widget?.getRefs()?.msgEl||document.createElement("div"),handleThinking:t=>{const a=e._widget?.getRefs();if(!a)return;const n=a.msgEl.querySelector(".aiagent-sdk-typing");n&&e._handleThinking(t,a.msgEl,n)},handleToolCallStart:t=>{const a=e._widget?.getRefs();if(!a)return;const n=a.msgEl.querySelector(".aiagent-sdk-typing");e._handleToolCallStart(t,a.msgEl,n||void 0)},handleToolCallDelta:t=>{const a=e._widget?.getRefs();if(!a)return;const n=a.msgEl.querySelector(".aiagent-sdk-typing");e._handleToolCallDelta(t,a.msgEl,n||void 0)},handleToolCall:async t=>{const a=e._widget?.getRefs();if(!a)return!1;const n=a.msgEl.querySelector(".aiagent-sdk-typing");return e._handleToolCall(t,a.msgEl,n||void 0)}}}};f(te,"_builtinTools",[]);let Oe=te;function uo(){return{init:s=>new Oe().init(s)}}const ho=["https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap"];let Ln=!1;function fo(){if(!Ln&&!(typeof document>"u"))try{const s=document.createElement("link");s.rel="preconnect",s.href="https://fonts.googleapis.com",document.head.appendChild(s);const e=document.createElement("link");e.rel="preconnect",e.href="https://fonts.gstatic.com",e.crossOrigin="anonymous",document.head.appendChild(e);for(const t of ho){const a=document.createElement("link");a.rel="stylesheet",a.href=t,document.head.appendChild(a)}Ln=!0}catch(s){console.warn("[AIAgent SDK] loadFonts failed, fallback to system fonts:",s)}}fo();const Dn=uo();return globalThis.AIAgent=Object.assign(Dn,{changeSkinTool:Gs,dictTool:Fs,pageErrorsTool:Tn,validateTool:Ds,saveMemoryTool:mn,recallMemoryTool:bn,MemoryEngine:At,registerBuiltinTool:Oe.registerBuiltinTool,IRIDESCENT_BLOOM:Se,CLASSIC:vt,AURORA:sa,SkinRegistry:ee,deriveSkin:dn,resolveLayout:yt,DEFAULT_LAYOUT:ln}),console.info("%c[AIAgent SDK v5.0.0]%c loaded (built __BUILD_TIME__). Theme: Iridescent Bloom. AIAgent.init({...}) is on window.AIAgent.","background:linear-gradient(135deg,#5eead4,#a78bfa,#f0abfc);color:#050505;padding:2px 8px;border-radius:3px;font-weight:700","color:#a1a1aa"),Dn});
