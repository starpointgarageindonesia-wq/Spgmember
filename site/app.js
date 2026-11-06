"use strict";

// Katalog historis dari source website Cireng Indi. Harga dan stok perlu
// dikonfirmasi via WhatsApp sebelum transaksi, bukan dipungut oleh website.
const BASE_IMAGE = "https://raw.githubusercontent.com/rizkyhidayat8999-netizen/Cirengindiapp/main/apps/member/app/src/main/assets/assets/";
const WA = "6282254710903";
const PRODUCTS = [
  {id:1,name:"Cireng Original",cat:"cireng",price:25000,detail:"250 g • 520 g • 1 kg",options:[["250 gram",25000],["520 gram",30000],["1 kg",55000]],tag:"Ciri khas"},
  {id:2,name:"Cireng Isi",cat:"cireng",price:25000,detail:"6 pcs per paket",options:[["Original (6 pcs)",25000],["Ayam Pedas (6 pcs)",25000]],tag:"Ciri khas"},
  {id:3,name:"Cilok",cat:"cireng",price:30000,detail:"520 gram / 1 kg • mulai dari",min:true},
  {id:4,name:"Sempol Ayam",cat:"cireng",price:40000,detail:"Isi 30 / isi 45 • mulai dari",min:true},
  {id:5,name:"Tahu Bakso",cat:"cireng",price:35000,detail:"Isi 10"},
  {id:6,name:"Pempek Ikan Tenggiri",cat:"cireng",price:25000,detail:"Box / 500 gram / 1 kg • mulai dari",min:true},
  {id:7,name:"Chicken Katsu",cat:"frozen",price:28000,detail:"250 g • 500 g • 1 kg",options:[["250 gram",28000],["500 gram",55000],["1 kg",110000]]},
  {id:8,name:"Nugget Ayam",cat:"frozen",price:30000,detail:"250 g • 500 g • 1 kg",options:[["250 gram",30000],["500 gram",60000],["1 kg",120000]]},
  {id:9,name:"Bola Ayam Keju",cat:"frozen",price:40000,detail:"1 box isi 10"},
  {id:10,name:"Bitterballen",cat:"frozen",price:40000,detail:"1 box isi 10"},
  {id:11,name:"Bakso Ayam",cat:"frozen",price:28000,detail:"Isi 25 / isi 50 • mulai dari",min:true},
  {id:12,name:"Ebi Furai",cat:"frozen",price:40000,detail:"1 box"},
  {id:13,name:"Baceman Frozen",cat:"frozen",price:35000,detail:"1 box"},
  {id:14,name:"Ayam Ungkep",cat:"frozen",price:60000,detail:"Isi 5"},
  {id:15,name:"Dimsum Crispy",cat:"frozen",price:40000,detail:"1 box"},
  {id:16,name:"Rollade Ayam",cat:"frozen",price:35000,detail:"1 box"},
  {id:17,name:"Kebab Pisang",cat:"camilan",price:35000,detail:"1 box"},
  {id:18,name:"Kebab Daging",cat:"camilan",price:45000,detail:"1 box"},
  {id:19,name:"Corndog",cat:"camilan",price:30000,detail:"1 box"},
  {id:20,name:"Churros",cat:"camilan",price:30000,detail:"1 box"},
  {id:21,name:"Kentang Goreng",cat:"camilan",price:25000,detail:"1 box"},
  {id:22,name:"Frozen Mix Platter",cat:"camilan",price:75000,detail:"Paket pilihan camilan"},
  {id:23,name:"Jamu Manjakani",cat:"jamu",price:28000,detail:"Jamu rumahan"},
  {id:24,name:"Jamu Komplit",cat:"jamu",price:28000,detail:"Jamu rumahan"},
  {id:25,name:"Jamu Kunyit Asam",cat:"jamu",price:28000,detail:"Jamu rumahan"},
  {id:26,name:"Jamu Jahe Latte",cat:"jamu",price:30000,detail:"Jamu rumahan"},
  {id:27,name:"Jamu Jahe Original",cat:"jamu",price:28000,detail:"Jamu rumahan"},
  {id:28,name:"Sari Kacang Hijau",cat:"jamu",price:28000,detail:"Minuman rumahan"},
  {id:29,name:"Puding Mix",cat:"dessert",price:20000,detail:"Menu pencuci mulut"},
  {id:30,name:"Salad Jelly",cat:"dessert",price:15000,detail:"Menu pencuci mulut"},
  {id:31,name:"Rengginang",cat:"camilan",price:35000,detail:"Camilan renyah"}
];
const CATEGORY_NAMES={cireng:"Cireng & Jajanan",frozen:"Lauk Frozen",camilan:"Camilan",jamu:"Jamu & Minuman",dessert:"Dessert"};
const rupiah = n => "Rp"+new Intl.NumberFormat("id-ID").format(n);
const image = id => BASE_IMAGE+"official_"+String(id).padStart(2,"0")+".webp";
const escapeHTML = str => String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const byId = id => document.getElementById(id);
const productById = new Map(PRODUCTS.map(p=>[p.id,p]));
let activeCategory="semua";
let cart=readCart();
let toastTimer;
let focusReturn=null;

function readCart(){
  try{
    const value=JSON.parse(localStorage.getItem("cirengindi.cart.v2")||"[]");
    if(!Array.isArray(value))return [];
    return value.filter(row=>row && Number.isInteger(row.id) && PRODUCTS.some(p=>p.id===row.id) &&
      Number.isInteger(row.variant) && row.variant>=0 && Number.isInteger(row.quantity) && row.quantity>0 && row.quantity<=99)
      .map(row=>({id:row.id,variant:row.variant,quantity:row.quantity}));
  }catch(_e){return [];}
}
function saveCart(){try{localStorage.setItem("cirengindi.cart.v2",JSON.stringify(cart));}catch(_e){}}
function optionFor(p,variant){return p.options?.[variant]||null;}
function unitPrice(p,variant){return optionFor(p,variant)?.[1]??p.price;}
function itemName(p,variant){const o=optionFor(p,variant);return p.name+(o?" — "+o[0]:"");}
function itemCount(){return cart.reduce((sum,item)=>sum+item.quantity,0);}
function subtotal(){return cart.reduce((sum,item)=>{const p=productById.get(item.id);return sum+(p?unitPrice(p,item.variant)*item.quantity:0);},0);}
function notify(message){
  const toast=byId("toast");toast.textContent=message;toast.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2500);
}
function cardHTML(p){
  const select=p.options?'<label class="variant-label" for="variant-'+p.id+'">Pilih varian</label><select class="variant-select" id="variant-'+p.id+'" data-id="'+p.id+'">'+
    p.options.map((o,idx)=>'<option value="'+idx+'">'+escapeHTML(o[0])+'</option>').join("")+'</select>':"";
  return '<article class="product-card">'+
    '<div class="product-media"><img loading="lazy" decoding="async" src="'+image(p.id)+'" alt="Foto katalog '+escapeHTML(p.name)+'" width="320" height="320">'+
      (p.tag?'<span class="product-tag">'+escapeHTML(p.tag)+'</span>':"")+'</div>'+
    '<div class="product-content"><span class="product-type">'+escapeHTML(CATEGORY_NAMES[p.cat])+'</span>'+
      '<h3 class="product-name">'+escapeHTML(p.name)+'</h3>'+
      '<p class="product-detail">'+escapeHTML(p.detail)+'</p>'+
      select+
      '<div class="product-bottom"><div class="product-price"><small>'+(p.min?"Mulai dari":"Harga katalog")+'</small><strong id="price-'+p.id+'">'+rupiah(p.price)+'</strong></div>'+
      '<button class="add-btn" type="button" data-add="'+p.id+'" aria-label="Tambahkan '+escapeHTML(p.name)+' ke keranjang">+</button></div>'+
    '</div></article>';
}
function renderCatalog(){
  const query=byId("searchInput").value.toLocaleLowerCase("id").trim();
  const filtered=PRODUCTS.filter(p=>(activeCategory==="semua"||p.cat===activeCategory) &&
    (!query || (p.name+" "+p.detail+" "+CATEGORY_NAMES[p.cat]).toLocaleLowerCase("id").includes(query)));
  byId("productGrid").innerHTML=filtered.map(cardHTML).join("");
  byId("catalogSummary").textContent="Menampilkan "+filtered.length+" dari "+PRODUCTS.length+" menu";
  byId("emptyState").hidden=filtered.length!==0;
  byId("productGrid").hidden=filtered.length===0;
}
function addItem(id,variant=0){
  const p=productById.get(Number(id));if(!p)return;
  const safeVariant=p.options?Math.max(0,Math.min(p.options.length-1,Number(variant)||0)):0;
  let item=cart.find(row=>row.id===p.id&&row.variant===safeVariant);
  if(item){item.quantity=Math.min(item.quantity+1,99);}
  else cart.push({id:p.id,variant:safeVariant,quantity:1});
  saveCart();renderCart();notify(p.name+" masuk ke keranjang");
}
function renderCart(){
  const count=itemCount(), total=subtotal();
  document.querySelectorAll("[data-cart-count]").forEach(el=>el.textContent=count);
  byId("floatingCart").hidden=count===0;
  byId("floatingTotal").textContent=rupiah(total);
  byId("drawerTotal").textContent=rupiah(total);
  byId("checkoutButton").disabled=count===0;
  if(!count){
    byId("cartItems").innerHTML='<div class="cart-empty"><span>🛍</span><strong>Keranjang masih kosong</strong><p>Pilih camilan favorit, lalu tekan tanda +.</p></div>';
    return;
  }
  byId("cartItems").innerHTML=cart.map(row=>{
    const p=productById.get(row.id);if(!p)return "";
    const title=itemName(p,row.variant);
    return '<article class="cart-item"><img src="'+image(p.id)+'" width="75" height="75" loading="lazy" alt="">'+
      '<div><h3>'+escapeHTML(p.name)+'</h3>'+
      '<div class="item-variant">'+escapeHTML(optionFor(p,row.variant)?.[0]||p.detail)+'</div>'+
      '<div class="item-price">'+rupiah(unitPrice(p,row.variant)*row.quantity)+'</div>'+
      '<div class="cart-controls"><button type="button" data-qty="-1" data-key="'+p.id+':'+row.variant+'" aria-label="Kurangi '+escapeHTML(p.name)+'">−</button>'+
      '<span aria-label="Jumlah '+row.quantity+'">'+row.quantity+'</span>'+
      '<button type="button" data-qty="1" data-key="'+p.id+':'+row.variant+'" aria-label="Tambah '+escapeHTML(p.name)+'">+</button>'+
      '<button type="button" class="remove-item" data-remove="'+p.id+':'+row.variant+'">Hapus</button></div></div></article>';
  }).join("");
}
function updateQty(key,delta,remove=false){
  const match=/^(\d+):(\d+)$/.exec(key||"");if(!match)return;
  const id=Number(match[1]),variant=Number(match[2]);
  const idx=cart.findIndex(row=>row.id===id&&row.variant===variant);if(idx===-1)return;
  if(remove)cart.splice(idx,1);
  else{cart[idx].quantity+=delta;if(cart[idx].quantity<=0)cart.splice(idx,1);else cart[idx].quantity=Math.min(cart[idx].quantity,99);}
  saveCart();renderCart();
}
function openCart(){
  focusReturn=document.activeElement;
  byId("cartOverlay").hidden=false;
  byId("cartDrawer").classList.add("open");
  byId("cartDrawer").setAttribute("aria-hidden","false");
  document.body.classList.add("cart-open");
  byId("closeCart").focus();
}
function closeCart(){
  byId("cartDrawer").classList.remove("open");
  byId("cartDrawer").setAttribute("aria-hidden","true");
  byId("cartOverlay").hidden=true;
  document.body.classList.remove("cart-open");
  if(focusReturn?.focus)focusReturn.focus();
}
function checkout(){
  if(!cart.length){notify("Keranjang masih kosong");return;}
  const lines=["Halo Cireng Indi, saya ingin memesan:",""];
  cart.forEach((row,idx)=>{
    const p=productById.get(row.id);if(!p)return;
    lines.push((idx+1)+". "+itemName(p,row.variant));
    lines.push("   "+row.quantity+" x "+rupiah(unitPrice(p,row.variant))+" = "+rupiah(unitPrice(p,row.variant)*row.quantity));
    if(p.min)lines.push("   (Harga mulai dari, mohon konfirmasi varian)");
  });
  lines.push("","Perkiraan subtotal: "+rupiah(subtotal()));
  const note=byId("buyerNote").value.trim().slice(0,500);
  if(note)lines.push("","Catatan: "+note);
  lines.push("","Mohon konfirmasi stok, harga akhir, dan pilihan ambil di outlet / pengantaran. Terima kasih.");
  const url="https://wa.me/"+WA+"?text="+encodeURIComponent(lines.join("\n"));
  // Navigasi langsung dari klik pengguna; kompatibel dengan popup blocker seluler.
  window.location.assign(url);
}
function handleProductClick(event){
  const btn=event.target.closest("[data-add]");
  if(!btn)return;
  const id=Number(btn.dataset.add);
  const choice=byId("variant-"+id);
  addItem(id,choice?Number(choice.value):0);
}
function handleVariant(event){
  const sel=event.target.closest(".variant-select");if(!sel)return;
  const p=productById.get(Number(sel.dataset.id));if(!p)return;
  const text=byId("price-"+p.id);if(text)text.textContent=rupiah(unitPrice(p,Number(sel.value)));
}
function handleCartClick(event){
  const qty=event.target.closest("[data-qty]");
  const rem=event.target.closest("[data-remove]");
  if(qty)updateQty(qty.dataset.key,Number(qty.dataset.qty));
  else if(rem)updateQty(rem.dataset.remove,0,true);
}
function updateNav(target){
  const hash="#"+target;
  document.querySelectorAll(".desktop-nav a,.mobile-nav a").forEach(link=>link.classList.toggle("active",link.getAttribute("href")===hash));
}
function init(){
  renderCatalog();renderCart();
  byId("year").textContent=new Date().getFullYear();
  byId("categoryFilters").addEventListener("click",e=>{
    const btn=e.target.closest("[data-category]");if(!btn)return;
    activeCategory=btn.dataset.category;
    document.querySelectorAll("[data-category]").forEach(el=>{
      const on=el===btn;el.classList.toggle("selected",on);el.setAttribute("aria-pressed",on?"true":"false");
    });
    renderCatalog();
  });
  byId("searchInput").addEventListener("input",renderCatalog);
  byId("productGrid").addEventListener("click",handleProductClick);
  byId("productGrid").addEventListener("change",handleVariant);
  byId("resetFilters").addEventListener("click",()=>{
    activeCategory="semua";
    byId("searchInput").value="";
    document.querySelectorAll("[data-category]").forEach(el=>{
      const on=el.dataset.category==="semua";el.classList.toggle("selected",on);el.setAttribute("aria-pressed",on?"true":"false");
    });
    renderCatalog();byId("searchInput").focus();
  });
  for(const id of ["headerCart","mobileCart","floatingCart"])byId(id).addEventListener("click",openCart);
  byId("closeCart").addEventListener("click",closeCart);
  byId("cartOverlay").addEventListener("click",closeCart);
  byId("cartItems").addEventListener("click",handleCartClick);
  byId("checkoutButton").addEventListener("click",checkout);
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&byId("cartDrawer").classList.contains("open"))closeCart();
    if(event.key==="Tab"&&byId("cartDrawer").classList.contains("open")){
      const els=[...byId("cartDrawer").querySelectorAll('button:not(:disabled),textarea:not(:disabled)')].filter(el=>el.offsetParent!==null);
      if(!els.length)return;
      if(event.shiftKey&&document.activeElement===els[0]){event.preventDefault();els[els.length-1].focus();}
      else if(!event.shiftKey&&document.activeElement===els[els.length-1]){event.preventDefault();els[0].focus();}
    }
  });
  document.querySelectorAll(".desktop-nav a,.mobile-nav a").forEach(a=>a.addEventListener("click",()=>updateNav((a.getAttribute("href")||"#beranda").slice(1))));
  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(visible)updateNav(visible.target.id);
    },{rootMargin:"-22% 0px -58% 0px",threshold:[0,.1,.25,.5]});
    ["beranda","menu","paket","cerita","kontak"].forEach(id=>observer.observe(byId(id)));
  }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
else init();
