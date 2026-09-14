(() => {
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const DB='giahuy-hub', VER=2;
const CATS={plugins:'Bài giảng',config:'Giáo án',mods:'Bài tập',assets:'Học liệu',tools:'Công cụ',resources:'Tài nguyên',guide:'Hướng dẫn'};
const DEFAULT=[
{name:'Đại số 9 - Chương 1: Căn bậc hai',cat:'plugins',desc:'Slide bài giảng chi tiết kèm ví dụ minh hoạ.',type:'Bài giảng'},
{name:'Hình học không gian lớp 11',cat:'plugins',desc:'Trực quan hoá khối đa diện bằng hình ảnh sinh động.',type:'Bài giảng'},
{name:'Giáo án Ngữ văn 8 - HK1',cat:'config',desc:'Giáo án chi tiết theo chương trình mới.',type:'Giáo án'},
{name:'Công cụ tạo đề trắc nghiệm',cat:'tools',desc:'Tạo và trộn đề thi trắc nghiệm nhanh chóng.',type:'Công cụ'},
{name:'Bộ đề ôn thi học kỳ',cat:'resources',desc:'Tổng hợp đề ôn tập nhiều môn học.',type:'Tài nguyên'},
{name:'Bộ slide nền bài giảng',cat:'assets',desc:'Hình nền, icon và template slide đẹp mắt cho bài giảng.',type:'Học liệu'},
{name:'Hướng dẫn học tốt môn Toán',cat:'guide',desc:'Phương pháp học tập và ôn thi hiệu quả.',type:'Hướng dẫn'}];
function db(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('files'))d.createObjectStore('files',{keyPath:'id',autoIncrement:true});if(!d.objectStoreNames.contains('music'))d.createObjectStore('music',{keyPath:'id',autoIncrement:true});if(!d.objectStoreNames.contains('meta'))d.createObjectStore('meta',{keyPath:'key'});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function tx(store,mode,cb){const d=await db();return new Promise((res,rej)=>{const t=d.transaction(store,mode),s=t.objectStore(store);const out=cb(s);t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error)})}
function getAll(store){return tx(store,'readonly',s=>new Promise(resolve=>{const r=s.getAll();r.onsuccess=()=>resolve(r.result)}))}
function add(store,obj){return tx(store,'readwrite',s=>s.add(obj))}
function del(store,id){return tx(store,'readwrite',s=>s.delete(id))}
async function seed(){const files=await getAll('files');if(!files.length)for(const x of DEFAULT)await add('files',{...x,id:crypto.randomUUID(),fileName:x.name+'.txt',mime:'text/plain',size:0,blob:null,created:Date.now(),builtin:true,featured:false})}
function notify(msg,type='ok'){const t=$('#toast');if(!t)return;t.textContent=msg;t.dataset.type=type;t.classList.add('show');clearTimeout(window.__t);window.__t=setTimeout(()=>t.classList.remove('show'),2800)}
function avatarSet(src){$$('.avatar-ring img,.mini-avatar img,.admin-avatar-preview img').forEach(i=>i.src=src)}
function jpIcon(id){return `<svg class="jp-svg" viewBox="0 0 48 48" aria-hidden="true"><use href="assets/landmarks.svg#${id}"></use></svg>`}
function enhanceStudyUI(){
  const navIcons=['book','pencil','cap','bulb','compass','pencil','book','cap','bulb','compass'];
  $$('.topnav a').forEach((a,i)=>{if(!a.querySelector('.jp-ui-icon')) a.insertAdjacentHTML('afterbegin',`<span class="jp-ui-icon">${jpIcon(navIcons[i%navIcons.length])}</span>`)})
  $$('.side-item').forEach((a,i)=>{const icon=a.querySelector('.side-icon'); if(icon&&!icon.querySelector('.jp-svg')){icon.textContent='';icon.insertAdjacentHTML('beforeend',jpIcon(navIcons[i%navIcons.length]))}})
  $$('.category-grid .cat-card').forEach((a,i)=>{const x=a.querySelector('.cat-icon');if(x&&!x.querySelector('.jp-svg')){const old=x.textContent.trim();x.textContent='';x.insertAdjacentHTML('beforeend',jpIcon(['book','pencil','cap','bulb','compass'][i%5]));x.dataset.label=old}})
  $$('.primary-btn,.secondary-btn,.small-btn,.ticket-btn,.section-link').forEach((b,i)=>{if(!b.querySelector('.jp-button-icon') && b.textContent.trim()){const id=['book','cap','pencil','compass','bulb'][i%5];b.insertAdjacentHTML('afterbegin',`<span class="jp-button-icon">${jpIcon(id)}</span>`)}})
}
function ensureDonateUI(){
  if(document.getElementById('donateModal')) return;
  document.body.insertAdjacentHTML('beforeend',`<button class="donate-fab" id="donateOpen" type="button" aria-label="Ủng hộ Thầy"><span class="donate-fab-icon">${jpIcon('cap')}</span><span>Ủng hộ Thầy</span></button><div class="donate-modal" id="donateModal" aria-hidden="true"><div class="donate-box"><button class="donate-close" id="donateClose" type="button" aria-label="Đóng">×</button><div class="donate-kicker">CẢM ƠN BẠN ĐÃ ĐỒNG HÀNH</div><h2>Ủng hộ Thầy Gia Huy duy trì website học tập</h2><p>Nếu website hữu ích với việc học của bạn, một lời ủng hộ nhỏ sẽ giúp thầy có thêm động lực cập nhật bài giảng, tài liệu và duy trì server.</p><div class="donate-grid"><div class="donate-qr-wrap"><div class="donate-qr-frame"><img src="assets/donate-qr.png" alt="QR ủng hộ Thầy"></div><span class="donate-demo">QR demo • thay bằng QR thanh toán thật</span></div><div class="donate-copy"><div class="donate-landmark">${jpIcon('cap')}<span>GV / Gia Huy</span></div><h3>Cảm ơn bạn đã ủng hộ ♡</h3><p>Đặt QR ngân hàng / MoMo / PayPal thật của bạn vào <code>assets/donate-qr.png</code> để dùng ngay mà không cần sửa giao diện.</p><div class="donate-note"><span>✦</span> Một chút ủng hộ • một chặng đường dài</div></div></div></div></div>`);
  $('#donateOpen').addEventListener('click',()=>{$('#donateModal').classList.add('open');$('#donateModal').setAttribute('aria-hidden','false')});
  $('#donateClose').addEventListener('click',closeDonate);
  $('#donateModal').addEventListener('click',e=>{if(e.target.id==='donateModal')closeDonate()});
  function closeDonate(){$('#donateModal').classList.remove('open');$('#donateModal').setAttribute('aria-hidden','true')}
}
const avatarDefault='assets/images/avatar.gif';avatarSet(localStorage.getItem('giahuy-avatar')||avatarDefault);
const getAnn=()=>localStorage.getItem('giahuy-announcement')||'';
function applyAnnouncement(){const text=getAnn(),box=$('#announcementBar');if(box){box.classList.toggle('show',!!text);box.querySelector('[data-announcement-text]').textContent=text}}
function updateClock(){const t=$('#liveTime'),d=$('#liveDate');if(!t||!d)return;const n=new Date();t.textContent=new Intl.DateTimeFormat('vi-VN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(n);d.textContent=new Intl.DateTimeFormat('vi-VN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(n)}updateClock();setInterval(updateClock,1000);
async function weather(){const temp=$('#weatherTemp'),icon=$('#weatherIcon');if(!temp||!icon)return;try{const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=13.78&longitude=109.22&current=temperature_2m,weather_code&timezone=Asia%2FHo_Chi_Minh',{cache:'no-store'});const d=await r.json();temp.textContent=Math.round(d.current.temperature_2m)+'°C';icon.textContent=d.current.weather_code===0?'☀':([1,2,3].includes(d.current.weather_code)?'☁':'☂')}catch(e){}}weather();
function theme(){document.body.classList.toggle('light-theme',localStorage.getItem('giahuy-theme')==='light');const b=$('#themeToggle');if(b)b.textContent=document.body.classList.contains('light-theme')?'☀':'◐'}theme();$('#themeToggle')?.addEventListener('click',()=>{localStorage.setItem('giahuy-theme',document.body.classList.contains('light-theme')?'dark':'light');theme()});
function scrollUI(){const p=$('#scrollProgress'),bt=$('#backTop');const max=document.documentElement.scrollHeight-innerHeight;if(p)p.style.width=(max?scrollY/max*100:0)+'%';bt?.classList.toggle('show',scrollY>500)}addEventListener('scroll',scrollUI,{passive:true});scrollUI();$('#backTop')?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
function modal(){const sm=$('#searchModal'),am=$('#adminModal');$('#searchOpen')?.addEventListener('click',()=>{sm?.classList.add('open');sm?.setAttribute('aria-hidden','false');renderSearch();$('#searchInput')?.focus()});$('#searchClose')?.addEventListener('click',()=>sm?.classList.remove('open'));$('#adminOpen')?.addEventListener('click',openAdmin);$('#adminClose')?.addEventListener('click',()=>am?.classList.remove('open'));$('#avatarBtn')?.addEventListener('click',openAdmin);addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#searchOpen')?.click()}if(e.key==='Escape'){$('#searchModal')?.classList.remove('open');$('#adminModal')?.classList.remove('open');document.getElementById('detailModal')?.classList.remove('open')}})};$$('[data-open-settings]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openAdmin()}))
async function renderSearch(q=''){const box=$('#searchResults');if(!box)return;const term=q.trim().toLowerCase();const items=(await getAll('files')).filter(x=>!term||[x.name,x.cat,x.desc,x.fileName].join(' ').toLowerCase().includes(term));box.innerHTML=items.slice(0,40).map(x=>`<a class="result" href="${CATS[x.cat]?x.cat+'.html':''}#resource-${encodeURIComponent(x.id)}"><b>${esc(x.name)}</b><small>${esc(CATS[x.cat]||x.cat)} • ${esc(x.desc||x.fileName||'')}</small></a>`).join('')||'<div class="result"><b>Không tìm thấy</b><small>Thử từ khóa khác.</small></div>'}
$('#searchInput')?.addEventListener('input',e=>renderSearch(e.target.value));
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function iconFor(x){if((x.mime||'').startsWith('audio/'))return'♫';if((x.mime||'').startsWith('image/'))return'▧';if((x.mime||'').includes('zip')||x.fileName?.endsWith('.jar'))return'◈';if((x.mime||'').includes('pdf'))return'▥';return '▤'}
function fmtSize(n){if(!n)return'0 B';const u=['B','KB','MB','GB'];let i=0,x=n;while(x>1024&&i<3){x/=1024;i++}return `${x.toFixed(i?1:0)} ${u[i]}`}
function favKey(id){return 'giahuy-fav-'+id}
function isFav(id){return localStorage.getItem(favKey(id))==='1'}
function toggleFav(id){const k=favKey(id);if(localStorage.getItem(k)==='1'){localStorage.removeItem(k);notify('Đã bỏ khỏi yêu thích.')}else{localStorage.setItem(k,'1');notify('★ Đã lưu vào kho cá nhân.')}renderCatalog();renderHome()}
function likeKey(id){return 'giahuy-like-'+id}
function likeSeed(id){const s=String(id);let h=0;for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return 6+(h%54)}
function isLiked(id){return localStorage.getItem(likeKey(id))==='1'}
function likeCount(id){return likeSeed(id)+(isLiked(id)?1:0)}
function toggleLike(id,btn){const k=likeKey(id);if(localStorage.getItem(k)==='1'){localStorage.removeItem(k)}else{localStorage.setItem(k,'1');btn?.classList.add('like-pop');setTimeout(()=>btn?.classList.remove('like-pop'),380)}renderCatalog();renderHome()}
function downloadCount(id){return Number(localStorage.getItem('giahuy-dl-'+id)||0)}
function bumpDownload(id){localStorage.setItem('giahuy-dl-'+id,String(downloadCount(id)+1));const h=JSON.parse(localStorage.getItem('giahuy-history')||'[]');const now=Date.now();const next=[{id,at:now},...h.filter(x=>String(x.id)!==String(id))].slice(0,30);localStorage.setItem('giahuy-history',JSON.stringify(next))}
async function blobOf(id,store='files'){const d=await db();return new Promise((res,rej)=>{const r=d.transaction(store,'readonly').objectStore(store).get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function downloadFile(id){const x=await blobOf(id);if(!x?.blob){notify('Mục mẫu chưa có file thật.','error');return}bumpDownload(x.id);const u=URL.createObjectURL(x.blob),a=document.createElement('a');a.href=u;a.download=x.fileName||x.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);notify('Đang tải xuống: '+x.name)}
function card(x){return `<article class="resource-card" id="resource-${esc(x.id)}"><div class="card-top"><span class="resource-icon">${iconFor(x)}</span><div style="min-width:0"><b title="${esc(x.name)}">${esc(x.name)}</b><small>${esc(CATS[x.cat]||x.cat)} • ${fmtSize(x.size)}${x.builtin?' • Mẫu':''} ${x.featured?'• ★ Nổi bật':''}</small></div><button class="fav-btn ${isFav(x.id)?'active':''}" title="${isFav(x.id)?'Bỏ yêu thích':'Lưu yêu thích'}" data-fav-id="${esc(x.id)}">${isFav(x.id)?'★':'☆'}</button></div>${x.featured?'<span class="featured-badge">FEATURED</span>':''}<p>${esc(x.desc||'Không có mô tả.')}</p><div class="tag-row"><span class="tag">${esc(x.fileName||'Không có file')}</span><span class="tag">↓ ${downloadCount(x.id)}</span><span class="tag">${new Date(x.created||Date.now()).toLocaleDateString('vi-VN')}</span><button class="tag like-btn ${isLiked(x.id)?'active':''}" title="${isLiked(x.id)?'Bỏ thích':'Thích'}" data-like-id="${esc(x.id)}">${isLiked(x.id)?'❤':'♡'} ${likeCount(x.id)}</button></div><div class="card-actions"><button class="small-btn primary" data-open-id="${esc(x.id)}">Tải xuống</button><button class="small-btn" data-detail-id="${esc(x.id)}">Chi tiết</button></div></article>`}
function detailOf(id){blobOf(id).then(async x=>{if(!x)return;let m=document.getElementById('detailModal');if(!m){m=document.createElement('div');m.className='search-modal';m.id='detailModal';document.body.appendChild(m)}const preview=x.blob&&x.mime?.startsWith('image/')?`<div class="detail-preview"><img src="${URL.createObjectURL(x.blob)}" alt=""></div>`:'';const aud=x.blob&&x.mime?.startsWith('audio/')?`<audio class="detail-audio" controls src="${URL.createObjectURL(x.blob)}"></audio>`:'';m.classList.add('open');m.innerHTML=`<div class="search-box detail-box"><button class="close" id="detailClose">×</button><div class="modal-heading"><span class="modal-kicker">CHI TIẾT TÀI LIỆU</span><b>${esc(x.name)}</b><small>${esc(CATS[x.cat]||x.cat)} • ${fmtSize(x.size)} • ${new Date(x.created||Date.now()).toLocaleString('vi-VN')}</small></div>${preview}${aud}<div class="detail-grid"><div class="detail-icon">${iconFor(x)}</div><div><p class="detail-desc">${esc(x.desc||'Chưa có mô tả.')}</p><div class="tag-row"><span class="tag">${esc(x.fileName||'Không có file')}</span><span class="tag">${esc(x.mime||'unknown')}</span><span class="tag">↓ ${downloadCount(x.id)} lượt tải</span><span class="tag">${isFav(x.id)?'★ Yêu thích':'☆ Chưa lưu'}</span></div><div class="card-actions" style="margin-top:18px"><button class="primary-btn" id="detailDownload">Tải xuống</button><button class="secondary-btn" id="detailFav">${isFav(x.id)?'Bỏ yêu thích':'Lưu yêu thích'}</button><button class="secondary-btn" id="detailCopy">Sao chép thông tin</button></div></div></div></div>`;$('#detailClose',m).onclick=()=>m.classList.remove('open');$('#detailDownload',m).onclick=()=>downloadFile(x.id);$('#detailFav',m).onclick=()=>{toggleFav(x.id);m.classList.remove('open')};$('#detailCopy',m).onclick=async()=>{await navigator.clipboard?.writeText(`${x.name}\n${CATS[x.cat]||x.cat}\n${x.fileName||''}`);notify('Đã sao chép thông tin tài nguyên.')}})}
addEventListener('click',e=>{const id=e.target.closest?.('[data-open-id]')?.dataset.openId;if(id){e.preventDefault();downloadFile(isNaN(id)?id:Number(id))}const f=e.target.closest?.('[data-fav-id]');if(f){e.preventDefault();toggleFav(isNaN(f.dataset.favId)?f.dataset.favId:Number(f.dataset.favId))}const d=e.target.closest?.('[data-detail-id]');if(d){e.preventDefault();detailOf(isNaN(d.dataset.detailId)?d.dataset.detailId:Number(d.dataset.detailId))}const lk=e.target.closest?.('[data-like-id]');if(lk){e.preventDefault();toggleLike(isNaN(lk.dataset.likeId)?lk.dataset.likeId:Number(lk.dataset.likeId),lk)}});
async function renderCatalog(){const root=$('#catalogRoot');if(!root)return;const cat=root.dataset.cat;const title=CATS[cat]||'Tài nguyên';$('#catTitle').textContent=title;$('#catDesc').textContent='Danh sách '+title.toLowerCase()+' được Thầy Gia Huy tổng hợp và cập nhật. Lọc, sắp xếp và lưu vào kho tài liệu cá nhân.';let items=(await getAll('files')).filter(x=>x.cat===cat);const search=($('#catalogSearch')?.value||'').trim().toLowerCase();const sort=$('#catalogSort')?.value||'new';const onlyFav=$('#onlyFav')?.checked;if(search)items=items.filter(x=>[x.name,x.desc,x.fileName].join(' ').toLowerCase().includes(search));if(onlyFav)items=items.filter(x=>isFav(x.id));items.sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'vi'):sort==='downloads'?downloadCount(b.id)-downloadCount(a.id):(b.created||0)-(a.created||0));$('#catCount').textContent=`${items.length} mục${onlyFav?' • yêu thích':''}`;const list=$('#catalogList');list.innerHTML=items.length?items.map(card).join(''):'<div class="empty-state"><b>Không có kết quả phù hợp.</b><br><small>Thử đổi từ khóa hoặc bỏ bộ lọc yêu thích.</small></div>';const hash=location.hash.replace('#resource-','');if(hash){const el=document.getElementById('resource-'+CSS.escape(decodeURIComponent(hash)));el?.scrollIntoView({behavior:'smooth',block:'center'})}}
$('#catalogSearch')?.addEventListener('input',()=>renderCatalog());$('#catalogSort')?.addEventListener('change',()=>renderCatalog());$('#onlyFav')?.addEventListener('change',()=>renderCatalog());$('#refreshCatalog')?.addEventListener('click',()=>renderCatalog());
function enterAdminPanel(){const f=$('#adminForm'),l=$('#adminLoader'),p=$('#adminPanel');f?.classList.add('hidden');p?.classList.add('hidden');l?.classList.remove('hidden');const bar=$('#adminLoaderBar');if(bar){bar.style.transition='none';bar.style.width='0%';requestAnimationFrame(()=>{bar.style.transition='width .78s cubic-bezier(.2,.7,.3,1)';bar.style.width='100%'})}setTimeout(()=>{l?.classList.add('hidden');p?.classList.remove('hidden');p?.classList.add('panel-enter');renderAdmin('upload');setTimeout(()=>p?.classList.remove('panel-enter'),420)},850)}
async function openAdmin(){const m=$('#adminModal');m?.classList.add('open');const admin=localStorage.getItem('giahuy-admin')==='1';if(admin){enterAdminPanel()}else{$('#adminForm')?.classList.remove('hidden');$('#adminPanel')?.classList.add('hidden');$('#adminLoader')?.classList.add('hidden')}}
$('#adminForm')?.addEventListener('submit',e=>{e.preventDefault();if($('#adminPassword').value!=='giahuy-admin'){notify('Mật khẩu Admin không đúng.','error');return}localStorage.setItem('giahuy-admin','1');notify('Đăng nhập quản trị thành công.');enterAdminPanel()});
$('#logoutAdmin')?.addEventListener('click',()=>{localStorage.removeItem('giahuy-admin');$('#adminPanel')?.classList.add('hidden');$('#adminLoader')?.classList.add('hidden');$('#adminForm')?.classList.remove('hidden');notify('Đã đăng xuất.')});
$('#changeAvatarBtn')?.addEventListener('click',()=>$('#avatarInput')?.click());$('#avatarInput')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>8*1024*1024){notify('Avatar tối đa 8MB.','error');return}const r=new FileReader();r.onload=()=>{localStorage.setItem('giahuy-avatar',r.result);avatarSet(r.result);notify('Đã đổi avatar.')} ;r.readAsDataURL(f)});$('#resetAvatarBtn')?.addEventListener('click',()=>{localStorage.removeItem('giahuy-avatar');avatarSet(avatarDefault);notify('Đã khôi phục avatar mặc định.')});
async function renderAdmin(tab){const w=$('#adminWorkspace');if(!w)return;const files=await getAll('files'),mus=await getAll('music');$$('.admin-tab').forEach(b=>b.classList.toggle('active',b.dataset.adminTab===tab));if(tab==='upload'){w.innerHTML=`<div class="upload-grid"><div class="upload-box"><form class="upload-form" id="uploadResource"><label>Tên hiển thị<input name="name" placeholder="Ví dụ: ThaiCuc 1.0"></label><label>Phân loại<select name="cat">${Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label>Mô tả<textarea name="desc" placeholder="Mô tả ngắn"></textarea></label><label class="check-line"><input name="featured" type="checkbox"> Đánh dấu tài nguyên nổi bật</label><label class="dropzone"><input name="file" type="file" multiple hidden><strong>Chọn file / kéo thả</strong><span>Jar, zip, rar, png, jpg, pdf, docx, json, txt...</span></label><button class="primary-btn" type="submit">Upload & phân vào list</button><p class="upload-meta">File được lưu vào IndexedDB của trình duyệt này.</p></form></div><div class="library-box"><div class="section-head"><div><h2>Phân loại & nổi bật</h2><p>Upload một lần → tự vào đúng trang + có thể ghim lên trang chủ.</p></div></div><div class="admin-stat-grid">${Object.entries(CATS).map(([k,v])=>`<div class="admin-stat"><b>${files.filter(x=>x.cat===k).length}</b><span>${v}</span></div>`).join('')}</div><div class="admin-tip">Mẹo: đánh dấu <strong>Nổi bật</strong> cho các file quan trọng để website ưu tiên hiển thị chúng.</div></div></div>`;const form=$('#uploadResource'),input=form.querySelector('input[name=file]');form.querySelector('.dropzone').addEventListener('click',()=>input.click());input.addEventListener('change',()=>form.querySelector('.dropzone span').textContent=input.files.length?`${input.files.length} file đã chọn`:'Chưa chọn file');const dz=form.querySelector('.dropzone');['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('dragging')}));['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('dragging')}));dz.addEventListener('drop',e=>{const dt=new DataTransfer();[...e.dataTransfer.files].forEach(f=>dt.items.add(f));input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}))});form.addEventListener('submit',async e=>{e.preventDefault();const fs=[...input.files];if(!fs.length){notify('Chưa chọn file.','error');return}const fd=new FormData(form);for(const f of fs){await add('files',{name:fs.length===1?(fd.get('name')||f.name.replace(/\.[^.]+$/,'')):f.name.replace(/\.[^.]+$/,''),cat:fd.get('cat'),desc:fd.get('desc'),fileName:f.name,mime:f.type,size:f.size,blob:f,created:Date.now(),builtin:false,featured:fd.get('featured')==='on'})}notify(`Đã upload ${fs.length} file.`);form.reset();renderAdmin('upload');renderCatalog();renderHome()})}
else if(tab==='library'){w.innerHTML=`<div class="library-box"><div class="filter-row">${Object.entries(CATS).map(([k,v])=>`<button class="filter-btn" data-lib-filter="${k}">${v}</button>`).join('')}<button class="filter-btn" data-lib-filter="featured">★ Nổi bật</button></div><div class="library-list" id="adminLibrary">${files.map(x=>`<div class="library-row"><span class="file-icon">${iconFor(x)}</span><div><b>${esc(x.name)}</b><small>${esc(CATS[x.cat])} • ${esc(x.fileName||'')} • ${fmtSize(x.size)} • ↓${downloadCount(x.id)}</small></div><div class="library-actions"><button data-admin-download="${x.id}">Tải</button>${x.builtin?'':'<button data-admin-delete="'+x.id+'">Xóa</button>'}</div></div>`).join('')}</div></div>`;w.querySelectorAll('[data-lib-filter]').forEach(b=>b.addEventListener('click',()=>{const c=b.dataset.libFilter;w.querySelectorAll('.library-row').forEach(r=>{const txt=r.innerText;r.style.display=c==='featured'?(txt.includes('Nổi bật')?'grid':'none'):(txt.includes(CATS[c])?'grid':'none')})}));w.querySelectorAll('[data-admin-download]').forEach(b=>b.addEventListener('click',()=>downloadFile(isNaN(b.dataset.adminDownload)?b.dataset.adminDownload:Number(b.dataset.adminDownload))));w.querySelectorAll('[data-admin-delete]').forEach(b=>b.addEventListener('click',async()=>{if(confirm('Xóa mục này?')){await del('files',Number(b.dataset.adminDelete));renderAdmin('library');renderCatalog();renderHome()}}))}
else if(tab==='music'){w.innerHTML=`<div class="upload-box"><form class="upload-form" id="uploadMusic"><label>Tên bài nhạc<input name="name" required placeholder="Tên bài nhạc"></label><label>Nghệ sĩ / ghi chú<input name="artist" placeholder="giahuy music"></label><label class="dropzone"><input name="file" type="file" accept="audio/*" hidden><strong>Chọn file nhạc</strong><span>MP3 / WAV / OGG / M4A...</span></label><button class="primary-btn" type="submit">Thêm vào playlist</button></form></div><div class="library-box music-library"><div class="library-list">${mus.map(x=>`<div class="library-row"><span class="file-icon">♫</span><div><b>${esc(x.name)}</b><small>${esc(x.artist||'giahuy')} • ${fmtSize(x.size)}</small></div><div class="library-actions"><button data-play-admin="${x.id}">Nghe</button><button data-del-music="${x.id}">Xóa</button></div></div>`).join('')||'<div class="empty-state">Chưa có bài nhạc.</div>'}</div></div>`;const form=$('#uploadMusic'),inp=form.querySelector('input[name=file]');form.querySelector('.dropzone').addEventListener('click',()=>inp.click());inp.addEventListener('change',()=>form.querySelector('.dropzone span').textContent=inp.files[0]?.name||'');form.addEventListener('submit',async e=>{e.preventDefault();const f=inp.files?.[0];if(!f){notify('Chưa chọn file nhạc.','error');return}const fd=new FormData(form);await add('music',{name:fd.get('name'),artist:fd.get('artist'),fileName:f.name,mime:f.type,size:f.size,blob:f,created:Date.now()});notify('Đã thêm bài nhạc vào playlist.');renderAdmin('music');renderMusic();renderHome()});w.querySelectorAll('[data-del-music]').forEach(b=>b.addEventListener('click',async()=>{await del('music',Number(b.dataset.delMusic));renderAdmin('music');renderMusic();renderHome()}));w.querySelectorAll('[data-play-admin]').forEach(b=>b.addEventListener('click',()=>playTrack(Number(b.dataset.playAdmin))))}
else {const totalBytes=files.reduce((a,x)=>a+(x.size||0),0)+mus.reduce((a,x)=>a+(x.size||0),0);const favs=files.filter(x=>isFav(x.id)).length;const downloads=files.reduce((a,x)=>a+downloadCount(x.id),0);w.innerHTML=`<div class="admin-stat-grid"><div class="admin-stat"><b>${files.length}</b><span>Tổng tài nguyên</span></div><div class="admin-stat"><b>${mus.length}</b><span>Bài nhạc</span></div><div class="admin-stat"><b>${downloads}</b><span>Lượt tải</span></div><div class="admin-stat"><b>${fmtSize(totalBytes)}</b><span>Dung lượng</span></div></div><div class="library-box"><h3 class="admin-section-title">Bảng điều khiển</h3><div class="admin-mini-grid">${Object.entries(CATS).map(([k,v])=>`<div class="mini-stat"><span>${esc(v)}</span><b>${files.filter(x=>x.cat===k).length}</b></div>`).join('')}</div><div class="admin-tip">Yêu thích: ${favs} mục • Nổi bật: ${files.filter(x=>x.featured).length} mục • Đăng nhập Admin hiện chỉ bảo vệ giao diện local.<br><br><strong>Mẹo:</strong> dùng banner thông báo bên dưới để đăng trạng thái bảo trì, cập nhật hoặc tin mới.</div><div class="upload-box" style="margin-top:12px"><form id="announceForm" class="upload-form"><label>Thông báo trang chủ<textarea name="text" placeholder="Ví dụ: Đang cập nhật bài giảng mới..."></textarea></label><div class="card-actions"><button class="primary-btn" type="submit">Lưu thông báo</button><button class="secondary-btn" type="button" id="clearAnnouncement">Xóa banner</button></div></form></div></div>`;$('#announceForm').addEventListener('submit',e=>{e.preventDefault();localStorage.setItem('giahuy-announcement',new FormData(e.currentTarget).get('text')||'');applyAnnouncement();notify('Đã cập nhật banner.');});$('#clearAnnouncement').addEventListener('click',()=>{localStorage.removeItem('giahuy-announcement');applyAnnouncement();notify('Đã xóa banner.')})}}
$$('.admin-tab').forEach(b=>b.addEventListener('click',()=>renderAdmin(b.dataset.adminTab)));
const audio=new Audio();audio.volume=.8;let currentTrack=null;const fmtTime=s=>{s=Math.max(0,Math.floor(s||0));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};
function syncMusicButtons(){const playing=!audio.paused&&!!audio.src;const main=$('#musicPlay');if(main){main.textContent=playing?'❚❚':'▶';main.title=playing?'Dừng nhạc':'Phát nhạc';main.setAttribute('aria-label',playing?'Dừng nhạc':'Phát nhạc')}$$('[data-track]').forEach(b=>{const id=Number(b.dataset.track);const active=id===Number(currentTrack);b.classList.toggle('active',active);const icon=b.querySelector('.track-icon');if(icon)icon.textContent=active&&playing?'❚❚':'▶';b.setAttribute('aria-label',active&&playing?`Dừng ${b.dataset.trackName||'bài nhạc'}`:`Phát ${b.dataset.trackName||'bài nhạc'}`)})}
async function renderMusic(){const list=$('#musicList');if(!list)return;const mus=await getAll('music');if(!mus.length){list.innerHTML='<div class="empty-state" style="padding:18px">Admin chưa upload nhạc. Vào Admin → Nhạc để thêm playlist.</div>';syncMusicButtons();return}list.innerHTML=mus.map(x=>`<button class="track-btn ${currentTrack===x.id?'active':''}" data-track="${x.id}" data-track-name="${esc(x.name)}"><span class="track-icon">${currentTrack===x.id&&!audio.paused?'❚❚':'▶'}</span><span class="track-copy"><b>${esc(x.name)}</b><small>${esc(x.artist||'giahuy')}</small></span></button>`).join('');list.querySelectorAll('[data-track]').forEach(b=>b.addEventListener('click',async()=>{const id=Number(b.dataset.track);if(id===Number(currentTrack)){if(audio.paused){try{await audio.play()}catch(e){}}else audio.pause()}else await playTrack(id,true)}));if(!currentTrack)await playTrack(mus[0].id,false);syncMusicButtons()}
async function playTrack(id,autoplay=true){const x=await blobOf(id,'music');if(!x?.blob)return;const url=URL.createObjectURL(x.blob);if(audio.__url)URL.revokeObjectURL(audio.__url);audio.__url=url;audio.src=url;currentTrack=x.id;const n=$('#nowMusic'),a=$('#nowArtist');if(n)n.textContent=x.name;if(a)a.textContent=x.artist||'giahuy';localStorage.setItem('giahuy-last-track',x.id);syncMusicButtons();if(autoplay){try{await audio.play()}catch(e){}}renderMusic()}
$('#musicPlay')?.addEventListener('click',async()=>{if(!audio.src){const m=await getAll('music');if(m[0])return playTrack(m[0].id,true);return}if(audio.paused){try{await audio.play()}catch(e){}}else audio.pause()});$('#musicPrev')?.addEventListener('click',async()=>{const m=await getAll('music');if(!m.length)return;const i=Math.max(0,m.findIndex(x=>x.id===currentTrack)-1);playTrack(m[i].id)});$('#musicNext')?.addEventListener('click',async()=>{const m=await getAll('music');if(!m.length)return;const i=(m.findIndex(x=>x.id===currentTrack)+1)%m.length;playTrack(m[i].id)});$('#musicVolume')?.addEventListener('input',e=>audio.volume=e.target.value);$('#musicSeek')?.addEventListener('input',e=>{if(audio.duration)audio.currentTime=(e.target.value/100)*audio.duration});audio.addEventListener('play',()=>syncMusicButtons());audio.addEventListener('pause',()=>syncMusicButtons());audio.addEventListener('timeupdate',()=>{const seek=$('#musicSeek');if(seek&&audio.duration)seek.value=(audio.currentTime/audio.duration)*100;const c=$('#musicCurrent');if(c)c.textContent=fmtTime(audio.currentTime)});audio.addEventListener('loadedmetadata',()=>{const d=$('#musicDuration');if(d)d.textContent=fmtTime(audio.duration)});audio.addEventListener('ended',async()=>{const m=await getAll('music');if(!m.length)return;const i=(m.findIndex(x=>x.id===currentTrack)+1)%m.length;playTrack(m[i].id)});
async function renderHome(){const files=await getAll('files'),mus=await getAll('music');const setText=(id,v)=>{const el=$('#'+id);if(el)el.textContent=v};const by=(cat)=>files.filter(x=>x.cat===cat).length;setText('homePluginCount',by('plugins'));setText('homeAssetCount',by('assets'));setText('homeResourceCount',by('resources'));setText('homeFavCount',files.filter(x=>isFav(x.id)).length);setText('heroTotalCount',files.length);setText('heroMusicCount',mus.length);const g=$('#latestGrid');if(g){const latest=[...files].sort((a,b)=>{const af=a.featured?1:0,bf=b.featured?1:0;return bf-af||(b.created||0)-(a.created||0)}).slice(0,6);g.innerHTML=latest.length?latest.map(card).join(''):'<div class="empty-state">Chưa có tài nguyên mới.</div>'}const h=$('#historyGrid');if(h){const his=JSON.parse(localStorage.getItem('giahuy-history')||'[]');const map=new Map(files.map(x=>[String(x.id),x]));const arr=his.map(x=>map.get(String(x.id))).filter(Boolean).slice(0,4);h.innerHTML=arr.length?arr.map(card).join(''):'<div class="empty-state">Bạn chưa tải tài nguyên nào.</div>'}applyAnnouncement()}
function bumpTotalViews(){const key='giahuy-total-views';let v=Number(localStorage.getItem(key)||0);if(!v)v=8200+Math.floor(Math.random()*3200);v+=1+Math.floor(Math.random()*3);localStorage.setItem(key,String(v));return v}
function fakeOnlineCount(){const curve=[8,6,5,4,4,5,8,14,20,26,30,34,38,40,42,44,46,50,58,68,74,70,55,20];const base=curve[new Date().getHours()]||20;const jitter=Math.floor(Math.random()*9)-4;return Math.max(3,base+jitter)}
function updateFakeStats(){const v=$('#liveVisits');if(v)v.textContent=bumpTotalViews().toLocaleString('vi-VN');const o=$('#heroOnlineCount');if(o)o.textContent=fakeOnlineCount().toLocaleString('vi-VN')}
(async()=>{enhanceStudyUI();ensureDonateUI();await seed();modal();applyAnnouncement();await renderCatalog();await renderHome();await renderMusic();updateFakeStats();setInterval(()=>{const o=$('#heroOnlineCount');if(o)o.textContent=fakeOnlineCount().toLocaleString('vi-VN')},5000)})();
})();

/* V12 — scroll reveal for professional lecture feel */
(function(){
  const targets = document.querySelectorAll('.music-home, .home-insights, .latest, .history-section, .intro, .section, .page-hero, .resource-cards, .category-grid');
  if (!targets.length || !('IntersectionObserver' in window)) return;
  targets.forEach(el => el.classList.add('reveal-ready'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => io.observe(el));
})();

/* V13 — Unified draggable floating action dock */
(function(){
  if (document.querySelector('.fab-dock')) return;
  document.body.classList.add('has-fab-dock');

  const dock = document.createElement('div');
  dock.className = 'fab-dock';
  dock.innerHTML = `
    <div class="fab-dock-handle" title="Kéo để di chuyển"></div>
    <div class="fab-dock-btns">
      <button type="button" class="fab-btn" data-fab="donate" title="Ủng hộ Thầy">
        <span class="fab-ico">♡</span><span>Ủng hộ Thầy</span>
      </button>
      <button type="button" class="fab-btn primary" data-fab="ticket" title="Đặt câu hỏi">
        <span class="fab-ico">🎫</span><span>Đặt câu hỏi</span>
        <span class="fab-count" id="fabTicketCount">0</span>
      </button>
      <button type="button" class="fab-btn mini" data-fab="top" title="Lên đầu trang">
        <span class="fab-ico">↑</span>
      </button>
    </div>
  `;
  document.body.appendChild(dock);

  // Sync ticket count from existing launcher if present
  const syncCount = () => {
    const src = document.querySelector('.ticket-launcher .ticket-count, .ticket-count');
    const el = document.getElementById('fabTicketCount');
    if (el && src) el.textContent = src.textContent || '0';
  };
  syncCount();
  setInterval(syncCount, 2000);

  // Actions
  dock.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-fab]');
    if (!btn) return;
    const act = btn.getAttribute('data-fab');
    if (act === 'donate') {
      const open = document.querySelector('[data-open-donate], .donate-fab');
      if (open) open.click();
      else {
        // fallback: try open donate modal
        const m = document.querySelector('.donate-modal');
        if (m) m.classList.add('open');
      }
    } else if (act === 'ticket') {
      const open = document.querySelector('[data-open-ticket-nav], .ticket-launcher');
      if (open) open.click();
    } else if (act === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Drag
  const handle = dock.querySelector('.fab-dock-handle');
  let dragging = false, ox = 0, oy = 0;
  const posKey = 'giahuy-fab-dock-pos';

  // Restore position
  try {
    const saved = JSON.parse(localStorage.getItem(posKey) || 'null');
    if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
      dock.style.left = saved.x + 'px';
      dock.style.top = saved.y + 'px';
      dock.style.right = 'auto';
      dock.style.bottom = 'auto';
    }
  } catch (_) {}

  const onMove = (clientX, clientY) => {
    if (!dragging) return;
    const x = Math.max(8, Math.min(window.innerWidth - dock.offsetWidth - 8, clientX - ox));
    const y = Math.max(8, Math.min(window.innerHeight - dock.offsetHeight - 8, clientY - oy));
    dock.style.left = x + 'px';
    dock.style.top = y + 'px';
    dock.style.right = 'auto';
    dock.style.bottom = 'auto';
  };

  handle.addEventListener('pointerdown', (e) => {
    dragging = true;
    dock.classList.add('dragging');
    const rect = dock.getBoundingClientRect();
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  handle.addEventListener('pointermove', (e) => onMove(e.clientX, e.clientY));
  handle.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    dock.classList.remove('dragging');
    try {
      localStorage.setItem(posKey, JSON.stringify({
        x: parseFloat(dock.style.left) || 0,
        y: parseFloat(dock.style.top) || 0
      }));
    } catch (_) {}
  });
})();

/* V16 — highlight active nav + soft page enter */
(function(){
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.topnav a, .side-item').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (!href || href === '#' || href.startsWith('#')) return;
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* V19 — Auth gate + session UI on main pages */
(function(){
  // load auth if not present
  if (typeof Auth === 'undefined') {
    const s = document.createElement('script');
    s.src = 'js/auth.js';
    s.onload = bootAuth;
    document.head.appendChild(s);
  } else bootAuth();

  function bootAuth(){
    // login page handles itself
    if (/login\.html$/i.test(location.pathname)) return;

    const session = Auth.requireAuth();
    if (!session) return;

    // session chip in topbar
    const actions = document.querySelector('.top-actions');
    if (actions && !document.querySelector('.session-pill')) {
      const pill = document.createElement('span');
      pill.className = 'session-pill';
      const roleLabel = session.role === 'teacher' ? 'GV' : 'HS';
      pill.innerHTML = `<span>${roleLabel}: ${escapeText(session.username || '')}</span>` +
        (session.role === 'teacher' ? ` <a href="teacher.html" style="color:#1a4f8c;font-weight:700">Panel</a>` : '') +
        ` <button type="button" id="sessionLogout">Thoát</button>`;
      actions.insertBefore(pill, actions.firstChild);
      document.getElementById('sessionLogout')?.addEventListener('click', () => Auth.logout());
    }

    // hide theme toggle
    document.getElementById('themeToggle')?.style.setProperty('display','none');
  }

  function escapeText(t){
    return String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})();





/* V26 — Topnav "..." dropdown with inline styles (bulletproof) */
(function () {
  function init() {
    const nav = document.querySelector('.topnav');
    if (!nav || nav.dataset.moreReady === 'v26') return;
    nav.dataset.moreReady = 'v26';
    nav.querySelectorAll('.nav-more-wrap').forEach((n) => n.remove());
    document.querySelectorAll('.nav-more-menu-portal').forEach((n) => n.remove());

    const links = [...nav.querySelectorAll(':scope > a')];
    if (links.length <= 5) return;

    const rest = links.slice(5);
    rest.forEach((a) => a.classList.add('nav-overflow-hidden'));

    const wrap = document.createElement('div');
    wrap.className = 'nav-more-wrap';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-more-btn';
    btn.title = 'Thêm mục';
    btn.textContent = '⋯';
    btn.setAttribute('aria-expanded', 'false');
    wrap.appendChild(btn);
    nav.appendChild(wrap);

    const menu = document.createElement('div');
    menu.className = 'nav-more-menu-portal';
    menu.setAttribute('role', 'menu');
    menu.style.cssText = 'display:none;position:fixed;z-index:2147483646;min-width:210px;background:#fff;border:1px solid #c5d4e6;border-radius:12px;box-shadow:0 16px 48px rgba(15,39,68,.18);padding:8px;flex-direction:column;gap:2px;';
    rest.forEach((a) => {
      const item = document.createElement('a');
      item.href = a.getAttribute('href') || '#';
      item.textContent = (a.textContent || '').replace(/\s+/g, ' ').trim();
      item.style.cssText = 'display:block;padding:11px 14px;border-radius:8px;color:#12263a;text-decoration:none;font:600 13px/1.3 Be Vietnam Pro,sans-serif;white-space:nowrap;';
      item.addEventListener('mouseenter', () => { item.style.background = '#e8eef5'; });
      item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
      if (a.hasAttribute('data-open-ticket-nav')) {
        item.href = '#';
        item.addEventListener('click', (e) => {
          e.preventDefault();
          close();
          const t = document.querySelector('a[data-open-ticket-nav],button[data-open-ticket-nav]');
          if (t && t !== item) t.click();
        });
      } else {
        item.addEventListener('click', close);
      }
      menu.appendChild(item);
    });
    document.body.appendChild(menu);

    function open() {
      const r = btn.getBoundingClientRect();
      menu.style.display = 'flex';
      menu.style.top = r.bottom + 8 + 'px';
      menu.style.left = Math.min(window.innerWidth - 230, Math.max(8, r.left - 20)) + 'px';
      btn.setAttribute('aria-expanded', 'true');
      btn.classList.add('is-open');
    }
    function close() {
      menu.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('is-open');
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (menu.style.display === 'none' || !menu.style.display) open();
      else close();
    });
    document.addEventListener('click', (e) => {
      if (e.target !== btn && !menu.contains(e.target)) close();
    });
    window.addEventListener('resize', close);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  setTimeout(init, 500);
})();
