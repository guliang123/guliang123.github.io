import{D as n}from"./index.16a2e785.js";import{n as k,f as _,o as g}from"./element-plus.d0a892e1.js";import{d as w,b as y,e as b,W as a,U as s,S as l,u as d,P as h,o as $,a5 as o,Q as E}from"./vue.bb111ed2.js";import"./vue-i18n.a7365932.js";import"./vue-router.cdec1337.js";const V=w({__name:"RisksView",setup(K){let p=Array();Object.keys(n.risks).forEach(e=>{let i=n.risks[e];if(i.title){let r={...i,rKey:e};p.push(r)}});let c=()=>window.innerHeight;const m=e=>n.risks[e].category;return(e,i)=>{const r=k,u=_,f=g;return $(),y(h,null,[b("h3",null,a(e.$t("menu.risks")),1),s(f,{height:d(c)()-50,data:d(p),stripe:"",border:""},{default:l(()=>[s(r,{prop:"rKey",width:"120px",label:e.$t("riskKey")},{default:l(t=>[o(a(t.row.rKey),1)]),_:1},8,["label"]),s(r,{prop:"title",width:"250px",label:e.$t("riskTitle")},{default:l(t=>[o(a(t.row.rKey?e.$t(`DSRE.risks.${t.row.rKey}.title`):"")+" ",1),s(u,{size:"small",class:E(["category",m(t.row.rKey)]),effect:"plain"},{default:l(()=>[o(a(e.$t(`DSRE.riskCtg.${m(t.row.rKey)}.title`)),1)]),_:2},1032,["class"])]),_:1},8,["label"]),s(r,{prop:"description",label:e.$t("riskDescription")},{default:l(t=>[o(a(t.row.rKey?e.$t(`DSRE.risks.${t.row.rKey}.description`):""),1)]),_:1},8,["label"])]),_:1},8,["height","data"])],64)}}});export{V as default};