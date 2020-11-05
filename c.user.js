// ==UserScript==
// @name         .
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  .
// @author       .
// @match        https://skyward-ocprod.iscorp.com/*
// @grant        none
// @run-at       document_start
// ==/UserScript==
const n = ["port", "login", "acade", "gradu","atte"]
const r = "#Calendar, #missingAssignmentsModuleWrapper, #bPrintGrades, .home_MessageFeed"
setInterval(function(){
    [...document.querySelectorAll("td.sf_highlightYellow ")].filter(r=>(r.innerText=="0")).forEach(r=>{
         r.innerHTML = "-"});
    [...document.querySelectorAll("a#showGradeInfo")].map(r=>r.parentNode).forEach(r=>{
    r.innerHTML = r.innerText=="0"?"-":r.innerText
    })
document.querySelectorAll(".sf_navMenuItem").forEach(r=>{
n.forEach(s=>{
if(r.innerText.toLowerCase().startsWith(s))r.remove()
})
})
document.querySelectorAll(r).forEach(r=>r.remove())
document.querySelectorAll(".sf_expander").forEach(r=>{
if(r.sss) return;
  //r.href = ""
r.sss = true
   r.click()
})
})
