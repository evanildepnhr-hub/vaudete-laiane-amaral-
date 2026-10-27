const STORAGE_KEY = "bibliotecaDigitalLivros_v1";
const starterBooks = [
 {id:"demo1",title:"O Pequeno Príncipe",author:"Antoine de Saint-Exupéry",category:"Infantil",description:"Uma história delicada sobre amizade, afeto e aquilo que realmente importa.",link:"https://pt.wikipedia.org/wiki/O_Pequeno_Pr%C3%ADncipe",cover:"",read:false,favorite:false},
 {id:"demo2",title:"Dom Casmurro",author:"Machado de Assis",category:"Romance",description:"Um clássico da literatura brasileira narrado por Bento Santiago.",link:"https://pt.wikipedia.org/wiki/Dom_Casmurro",cover:"",read:false,favorite:false},
 {id:"demo3",title:"A Arte da Guerra",author:"Sun Tzu",category:"História",description:"Uma obra clássica sobre estratégia, planejamento e tomada de decisões.",link:"https://pt.wikipedia.org/wiki/A_Arte_da_Guerra",cover:"",read:false,favorite:false},
 {id:"demo4",title:"Viagem ao Centro da Terra",author:"Júlio Verne",category:"Fantasia",description:"Uma aventura científica repleta de descobertas e mistérios.",link:"https://pt.wikipedia.org/wiki/Viagem_ao_Centro_da_Terra",cover:"",read:false,favorite:false}
];
let books = loadBooks();
let activeChip = "Todos";
const $ = id => document.getElementById(id);
function loadBooks(){try{const v=localStorage.getItem(STORAGE_KEY);return v?JSON.parse(v):starterBooks.map(b=>({...b}));}catch{return starterBooks.map(b=>({...b}));}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(books));}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function iconFor(cat){return ({Romance:"💌",Fantasia:"🪄",Ficção:"🌌",Educação:"🎓",Religião:"🕊️",História:"🏛️",Ciência:"🔬",Infantil:"🧸",Biografia:"👤",Outros:"📚"})[cat]||"📚";}
function categories(){return [...new Set(books.map(b=>b.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"pt-BR"));}
function renderFilters(){
 const cats=categories(), filter=$("categoryFilter"), old=filter.value;
 filter.innerHTML='<option value="">Todas as categorias</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
 if(cats.includes(old))filter.value=old;
 $("chips").innerHTML=["Todos",...cats].map(c=>`<button class="chip ${activeChip===c?"active":""}" data-chip="${esc(c)}">${esc(c)}</button>`).join("");
 $("totalBooks").textContent=books.length;$("totalCategories").textContent=cats.length;$("totalRead").textContent=books.filter(b=>b.read).length;
}
function renderBooks(){
 renderFilters();
 const q=$("search").value.trim().toLocaleLowerCase("pt-BR"), category=$("categoryFilter").value;
 const filtered=books.filter(b=>{
  const text=[b.title,b.author,b.category,b.description].join(" ").toLocaleLowerCase("pt-BR");
  return (!q||text.includes(q))&&(!category||b.category===category)&&(activeChip==="Todos"||b.category===activeChip);
 });
 $("bookGrid").innerHTML=filtered.map(b=>`<article class="book-card">
  <div class="cover">${b.cover?`<img src="${esc(b.cover)}" alt="Capa de ${esc(b.title)}" onerror="this.remove()">`:`<span class="cover-emoji">${iconFor(b.category)}</span>`}
  <span class="category-tag">${esc(b.category)}</span><button class="favorite ${b.favorite?"on":""}" data-action="favorite" data-id="${esc(b.id)}" title="Favoritar" aria-label="Favoritar ${esc(b.title)}">${b.favorite?"♥":"♡"}</button></div>
  <div class="book-info"><h3>${esc(b.title)}</h3><p class="author">por ${esc(b.author)}</p><p class="description">${esc(b.description||"Sem descrição cadastrada.")}</p>
  <div class="card-actions"><button class="small-btn read-btn ${b.read?"done":""}" data-action="read" data-id="${esc(b.id)}">${b.read?"✓ Já lido":"Marcar como lido"}</button>
  ${b.link?`<button class="small-btn link-btn" data-action="open" data-id="${esc(b.id)}">↗ Abrir link</button>`:""}
  <button class="small-btn link-btn" data-action="edit" data-id="${esc(b.id)}">Editar</button><button class="small-btn delete-btn" data-action="delete" data-id="${esc(b.id)}">Excluir</button></div></div></article>`).join("");
 $("empty").classList.toggle("hidden",filtered.length!==0);
}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2400);}
function openDialog(book=null){
 $("bookForm").reset();$("bookId").value=book?.id||"";$("dialogTitle").textContent=book?"Editar livro":"Cadastrar livro";
 if(book){$("title").value=book.title;$("author").value=book.author;$("category").value=book.category;$("description").value=book.description||"";$("link").value=book.link||"";$("cover").value=book.cover||"";}
 $("bookDialog").showModal();
}
$("addBtn").addEventListener("click",()=>openDialog());
$("closeDialog").addEventListener("click",()=>$("bookDialog").close());
$("cancelBtn").addEventListener("click",()=>$("bookDialog").close());
$("search").addEventListener("input",renderBooks);
$("categoryFilter").addEventListener("change",()=>{activeChip="Todos";renderBooks();});
$("chips").addEventListener("click",e=>{const b=e.target.closest("[data-chip]");if(!b)return;activeChip=b.dataset.chip;$("categoryFilter").value="";renderBooks();});
$("bookGrid").addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b)return;
 const book=books.find(x=>x.id===b.dataset.id);if(!book)return;
 switch(b.dataset.action){
 case "favorite":book.favorite=!book.favorite;save();renderBooks();toast(book.favorite?"Adicionado aos favoritos ♥":"Removido dos favoritos");break;
 case "read":book.read=!book.read;save();renderBooks();toast(book.read?"Leitura marcada como concluída!":"Status de leitura atualizado");break;
 case "edit":openDialog(book);break;
 case "delete":if(confirm(`Deseja excluir "${book.title}" do acervo?`)){books=books.filter(x=>x.id!==book.id);save();renderBooks();toast("Livro excluído do acervo");}break;
 case "open":if(book.link)window.open(book.link,"_blank","noopener,noreferrer");break;
 }
});
$("bookForm").addEventListener("submit",e=>{
 e.preventDefault();
 const id=$("bookId").value;
 const item={id:id||("livro_"+Date.now()+"_"+Math.random().toString(36).slice(2,7)),title:$("title").value.trim(),author:$("author").value.trim(),category:$("category").value,description:$("description").value.trim(),link:$("link").value.trim(),cover:$("cover").value.trim(),read:false,favorite:false};
 if(id){const old=books.find(b=>b.id===id);item.read=old?.read||false;item.favorite=old?.favorite||false;books=books.map(b=>b.id===id?item:b);toast("Livro atualizado!");}
 else{books.unshift(item);toast("Livro cadastrado com sucesso!");}
 save();$("bookDialog").close();activeChip="Todos";$("categoryFilter").value="";$("search").value="";renderBooks();
});
renderBooks();
