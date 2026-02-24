(()=>{
  try{
    if(location.origin!=="https://maimaidx-eng.com"){
      alert("Open this on maimaidx-eng.com while logged in.");
      return;
    }
    var receiver="https://dmmc-eight.vercel.app/my-score";
    var scriptOrigin="https://dmmc-eight.vercel.app";
    var t=Math.floor(Date.now()/60000);
    var s=document.createElement("script");
    s.src=scriptOrigin+"/scripts/all-in-one.js?receiver="+encodeURIComponent(receiver)+"&t="+t;
    s.async=true;
    s.onerror=function(){alert("DMMC Export: failed to load all-in-one script.");};
    document.body.appendChild(s);
  }catch(e){
    alert("DMMC Export failed: "+(e&&e.message?e.message:String(e)));
  }
})();
