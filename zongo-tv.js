
document.addEventListener("DOMContentLoaded",()=>{
  const popup=document.querySelector(".popup");
  if(popup){
    setTimeout(()=>popup.classList.add("show"),5000);
    popup.querySelector(".close")?.addEventListener("click",()=>popup.remove());
  }
  document.querySelectorAll("[data-menu]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const nav=document.querySelector(".navlinks");
      if(nav) nav.style.display=nav.style.display==="flex"?"none":"flex";
    });
  });
});
