(() => {
'use strict';
const STORE='sk_smart_sales_catalog_v04';
// v0.7: 원본 후기는 Google Apps Script를 통해 페이지 단위로 공식몰에서 요청하며 저장하지 않습니다.
let officialReviewMode='list', reviewSourceMode='live', officialReviewPage=1, officialReviewRequestSeq=0, officialReviewCallbackSeq=0;
let productGalleryIndex=0, lightboxState=null, currentReviewImages=[];
const officialGalleryCache=Object.create(null), officialGalleryLoaded=new Set(), officialGalleryLoading=new Set();
const officialInfo=p=>((window.SK_OFFICIAL_LINKS||{})[p?.id]||{});
// 모델별 검증 이미지 (사진 주소 실패 시에만 다음 후보를 사용)
const productImageSource=p=>((window.SK_IMAGE_SOURCES||{})[p?.id]||{});
function productImageCandidates(p){
  const list=[];
  const add=x=>{x=String(x||'').trim();if((/^https:\/\//i.test(x)||/^(\.\/|교육자료원본\/|assets\/|data:image\/)/i.test(x))&&!list.includes(x))list.push(x)};
  const registered=productImageSource(p);
  const seed=(window.SEED_PRODUCTS||[]).find(x=>x.id===p.id)||{};
  // 사용자가 관리자에서 변경한 사진은 덮어쓰지 않음
  if(p.hero && p.hero!==seed.hero)add(p.hero);
  (registered.images||[]).forEach(add);
  add(p.hero);add(officialInfo(p).cover);add(p.heroFallback);
  (p.officialPhotos||[]).forEach(x=>add(x.src));
  return list;
}
function imageOnErrorFallback(img,candidates,placeholder){
  let nextIndex=0;
  const advance=()=>{
    nextIndex++;
    if(nextIndex<candidates.length){img.src=candidates[nextIndex];return;}
    img.style.display='none';
    if(placeholder){placeholder.classList.add('photo-unavailable');placeholder.insertAdjacentHTML('beforeend','<span class="image-failure-label">사진 서버 연결 확인 필요</span>');}
  };
  img.addEventListener('error',advance);
  if(img.complete && img.naturalWidth===0)advance();
}
function setupCardImages(){
  document.querySelectorAll('.product-visual img[data-image-id]').forEach(img=>{
    const product=products.find(p=>p.id===img.dataset.imageId);
    if(product)imageOnErrorFallback(img,productImageCandidates(product),img.closest('.product-visual'));
  });
}


const deep=x=>JSON.parse(JSON.stringify(x));
const safe=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const PRICE_ROWS=(window.SK_PRICE_DATA&&window.SK_PRICE_DATA.rows)||[];
// 매트리스(3).xlsx 2026년 11월을 기반으로 한 비상용 가격표. 월별 기준 앱이 확인되면 그 값을 우선 적용합니다.
const MATTRESS_FALLBACK=window.SK_MATTRESS_FALLBACK||{month:'2026-11',rows:[]};
const MATTRESS_ROWS=MATTRESS_FALLBACK.rows||[];
const REMOTE_ARCHIVE=window.SK_MONTH_ARCHIVE||{};
const PRICE_MONTH_KEY='sk_smart_sales_price_month_v074';
let selectedMonth=(()=>{let m='2026-11';try{m=localStorage.getItem(PRICE_MONTH_KEY)||'2026-11'}catch(e){}return m})();
let selectedCommission=null;
const modelToken=p=>((p.model||'').match(/(WPU-[A-Z0-9]+|ACL-[A-Z0-9]+|BID[-A-Z0-9]+|WRB-[A-Z0-9]+|MAT-?[A-Z0-9]+(?:\/[A-Z0-9]+)?)/i)||[])[1]||'';
const normModel=s=>String(s||'').replace(/[^a-zA-Z0-9]/g,'').toUpperCase();
const priceKRW=v=>typeof v==='number'&&Number.isFinite(v)?v.toLocaleString('ko-KR')+'원':'—';
const availableMonths=()=>[...new Set([...Object.keys(REMOTE_ARCHIVE),...(PRICE_ROWS.length?[window.SK_PRICE_DATA.month||'2026-11']:[])])].sort().reverse();
function renderMonthSelect(){
 const e=$('#globalMonth');if(!e)return;
 const months=availableMonths();if(!months.includes(selectedMonth))selectedMonth=months[0]||'2026-11';
 e.innerHTML=months.map(m=>`<option value="${safe(m)}" ${m===selectedMonth?'selected':''}>${safe(m.replace('-', '년 '))}월</option>`).join('');
}
const PRICE_FAMILY={"WPUPBC204":"WPUPBC204S","WPUGBC102":"WPUGBC102S","ACL22P1C":"ACL22P","ACL22C1":"ACL22C","ACL22C12":"ACL22C","ACL16C":"ACL16C","ACL252015C1A":"ACL25C1ASK","BIDS51D":"BIDS51D","BIDS17D":"BIDS17D","BIDF17D":"BIDF17D","BID096P":"BID096P"};
const priceKey=p=>PRICE_FAMILY[normModel(modelToken(p))]||normModel(modelToken(p));
function priceRows(p){return PRICE_ROWS.filter(r=>normModel(r.model)===priceKey(p));}
function isMattress(p){return normModel(p?.model).startsWith('MAT');}
// Mattress sizes are variants inside one sales series. Keep every original product
// and its per-size historical prices; only the catalog presentation is grouped.
const MATTRESS_SERIES={
 cloud:{label:'워커힐 클라우드 매트리스',ids:['mattress-matsm430r','mattress-matqm430r','mattress-matkm430r'],
   ebook:'https://ebookimage.skmagic.com/images/매트리스 모바일용/클라우드/MAT-SM430R(미리보기).html'},
 sweet:{label:'워커힐 스위트 매트리스',ids:['mattress-matsm230','mattress-matqm230','mattress-matkm230'],
   ebook:'https://ebookimage.skmagic.com/images/매트리스 모바일용/스위트/MAT-M230(미리보기).html'},
 standard:{label:'워커힐 스탠다드 매트리스',ids:['mattress-matsm730','mattress-matqm730'],
   ebook:'https://ebookimage.skmagic.com/images/매트리스 모바일용/스탠다듣/MAT-730(미리보기).html'}
};
function mattressFamily(p){return Object.keys(MATTRESS_SERIES).find(k=>MATTRESS_SERIES[k].ids.includes(p?.id))||null;}
function mattressSize(p){if(!p)return null;const model=normModel(p.model);return /^MATSM|^MATSM/.test(model)?'SS':/^MATQM/.test(model)?'Q':/^MATKM/.test(model)?'K':null;}
function mattressMembers(p){const fam=mattressFamily(p);return fam?MATTRESS_SERIES[fam].ids.map(id=>products.find(x=>x.id===id)).filter(Boolean):[];}
let mattressChoice={years:null,management:null};
function displayProducts(list){
 const seen=new Set();
 return list.filter(p=>{
   const fam=mattressFamily(p);
   if(!fam)return true;
   if(seen.has(fam))return false;
   seen.add(fam);
   return true;
 });
}
function mattressSizeSelector(p){
 const fam=mattressFamily(p);
 if(!fam)return '';
 const members=mattressMembers(p);
 return `<section class="mattress-family-switch" aria-label="매트리스 사이즈 선택">
  <div class="mattress-family-heading"><strong>${safe(MATTRESS_SERIES[fam].label)}</strong><small>사이즈를 선택하면 해당 모델의 구독료와 수수료가 바뀝니다.</small></div>
  <div class="mattress-family-buttons">${members.map(item=>{
    const size=mattressSize(item);
    return `<button type="button" data-mattress-size="${safe(item.id)}" aria-pressed="${item.id===p.id}" class="${item.id===p.id?'selected':''}">${size==='SS'?'슈퍼싱글 (SS)':size==='Q'?'퀸 (Q)':'킹 (K)'} </button>`;
  }).join('')}</div>
 </section>`;
}
function switchMattressSize(id){
 if(!detail)return;
 const source=mattressFamily(detail),target=products.find(p=>p.id===id);
 if(!source||mattressFamily(target)!==source)return;
 detail=target;productGalleryIndex=0;
 renderDetail();
}
function mattressSimplePrices(p){
 const family=mattressFamily(p);
 if(!family)return '';
 if(selectedMonth!==MATTRESS_FALLBACK.month){
   return '<div class="warning-box">선택 월에는 사이즈별 확인된 원본 가격자료가 없습니다. 다른 월을 선택하거나 공식 가격표를 확인하세요.</div>';
 }
 const source=mattressFallbackRows(p);
 if(!source.length)return '<div class="warning-box">해당 사이즈의 가격표가 등록되지 않았습니다.</div>';
 const years=[...new Set(source.map(r=>r.contractYears))].sort((a,b)=>a-b);
 const selectedYears=years.includes(mattressChoice.years)?mattressChoice.years:years[0];
 const options=source.filter(r=>r.contractYears===selectedYears);
 const cycleTypes=['4개월','6개월','12개월','무방문'];
 const cycles=[...new Set(options.map(r=>r.management.replace(/ 관리$/,'')).filter(Boolean))].sort((a,b)=>cycleTypes.indexOf(a)-cycleTypes.indexOf(b));
 const selectedCycle=cycles.includes(mattressChoice.management)?mattressChoice.management:cycles[0];
 const row=options.find(r=>r.management.replace(/ 관리$/,'')===selectedCycle)||options[0];
 if(!row)return '<div class="warning-box">해당 계약조건의 구독료가 없습니다.</div>';
 const fmt=priceKRW;
 const pTypes=[['single','신규 단품'],['cross','크로스'],['package','패키지'],['renew','재구독 단품'],['renewPackage','재구독 패키지']];
 const normal=Number(row.normal)||0;
 const meta=`${mattressSize(p)} · ${selectedYears}년 · ${selectedCycle}`;
 return `<div class="mattress-prices-simple">
   <div class="mattress-prices-head"><div><strong>${safe(MATTRESS_SERIES[family].label)}</strong><small>${safe(p.model)} · 매트리스 2026년 11월 원본 요금표</small></div>
   <span class="price-source-tag">원본 금액 적용</span></div>
   <div class="mattress-price-filters">
     <div class="mattress-filter-field"><strong>의무사용 기간</strong><div class="mattress-filter-buttons">${years.map(y=>`<button type="button" data-mattress-years="${y}" class="${selectedYears===y?'active':''}">${y}년</button>`).join('')}</div></div>
     <div class="mattress-filter-field"><strong>관리 주기</strong><div class="mattress-filter-buttons">${cycles.map(c=>`<button type="button" data-mattress-cycle="${safe(c)}" class="${selectedCycle===c?'active':''}">${c}</button>`).join('')}</div></div>
   </div>
   <div class="mattress-price-summary"><div><span>정상 구독료</span><del>${normal?fmt(normal):'미확인'}</del></div><div><span>신규 기준 월 구독료</span><strong>${fmt(row.single)}</strong></div></div>
   <div class="mattress-customer-cards">${pTypes.filter(([k])=>Number(row[k])>0).map(([k,label])=>{
     const half=k==='single'?row.halfNew:k==='renew'?row.halfRenew:null;
     const fee=row.rate?.sheetCommissions?.[k]??row.commissions?.[k];
     const perc=row.rate?.sheetPayoutRates?.[k]??row.payoutRates?.[k];
     return `<button type="button" class="mattress-price-choice" data-select-price="${row.idx}" data-price-type="${k}">
       <span class="mattress-choice-type">${label}</span>
       <strong>${fmt(row[k])}</strong>
       ${half? `<small class="mattress-half">첫 6개월 반값 ${fmt(half)}</small>`:''}
       <small>판매수수료 ${fee!=null?fmt(fee):'정책 확인 필요'}${perc!=null?' · 지급 '+Math.round(perc*100)+'%':''}</small>
     </button>`;
   }).join('')}</div>
   <p class="price-footnote">${safe(meta)} · 첨부 매트리스(3).xlsx 원본 기준. 첫 6개월 반값은 원본의 해당 항목만 표시합니다. 실제 지급과 적용조건은 최종 정책 확인이 필요합니다.</p>
 </div>`;
}

function mattressFallbackRows(p){
  if(selectedMonth!==MATTRESS_FALLBACK.month || !isMattress(p))return [];
  const code=normModel(p.model);
  return MATTRESS_ROWS.filter(r=>normModel(r.model)===code).map((r,i)=>({
    ...r,idx:i,source:'mattress-excel',model:p.model,contractYears:Number(String(r.contract).split('/')[0])/12,
    management:r.management==='프레임'?'프레임':r.management==='무방문'?'무방문':r.management+' 관리',
    rate:{
      sheetContractMultiplier:r.multipliers?.single,
      sheetProfitMultiplier:r.profitMultipliers?.single,
      sheetPayoutRates:{'신규':r.payoutRates?.single,'신규단품':r.payoutRates?.single,
        '크로스':r.payoutRates?.cross,'패키지':r.payoutRates?.package,
        '재구독':r.payoutRates?.renew,'재구독단품':r.payoutRates?.renew,
        '재구독패키지':r.payoutRates?.renewPackage},
      sheetCommissions:r.commissions
    },month:selectedMonth
  }));
}
function archiveMonth(){return REMOTE_ARCHIVE[selectedMonth]||null;}
function archiveProduct(p){
 const snap=archiveMonth();if(!snap?.products)return null;
 const key=normModel(modelToken(p));
 return snap.products.find(x=>normModel(x.model)===key)||null;
}
function archiveRows(p){
 const snap=archiveMonth(),prod=archiveProduct(p);
 if(!snap||!prod)return [];
 const rows=snap.finalRates?.[String(prod.apiId)]||[];
 return rows.map((r,i)=>({source:'archive',idx:i,model:p.model,model_raw:'',management:r.management||'',contract:r.contractYears?String(r.contractYears)+'년':'',contractYears:Number(r.contractYears)||0,base:r.sheetBasePrice??prod.prices?.beforePrice??null,single:priceValue(r.pricesByCustomer,['신규단품','신규']),cross:priceValue(r.pricesByCustomer,['크로스','크로스/재구독/우대','재구독/우대']),package:priceValue(r.pricesByCustomer,['패키지']),renew:priceValue(r.pricesByCustomer,['재구독단품','재구독/우대','재구독']),renewPackage:priceValue(r.pricesByCustomer,['재구독패키지','재구독 패키지']),rate:r,variant:r.variant||'',plan:r.plan||'',size:r.size||'',cycle:r.visitCycleMonths,month:selectedMonth}));
}
function priceValue(prices,keys){for(const k of keys){const n=Number(prices?.[k]);if(n>0)return n;}return null;}
function priceRowsForMonth(p){
 if(p?.id==='namuhx'){
   if(selectedMonth!=='2026-11')return []; // 이전 월 가격은 자료로 확인되지 않았습니다.
   const rows=window.NAMUHX_RATES?.rows||[];
   return rows.map((r,idx)=>({
     ...r,idx,source:'namuhx-image',model:p.model,contractYears:r.contractYears,
     contract:r.contract,management:r.management+(r.visitCycleMonths?' · '+r.visitCycleMonths+'개월':' · 무방문'),
     rate:{sheetContractMultiplier:null,sheetProfitMultiplier:null,
       sheetPayoutRates:{'신규':1,'신규단품':1,'크로스':.8,'패키지':.7,'재구독':.7,'재구독단품':.7,'재구독패키지':.7,'타사보상':1},
       sheetCommissions:r.commissions},
     month:selectedMonth
   }));
 }
 const arch=archiveRows(p);
 // If the shared monthly archive contains actual customer prices, it is always authoritative.
 // For mattress, a generic/incomplete archive row must not conceal the validated Excel rows.
 if(arch.length && (!isMattress(p) || arch.some(r=>['single','cross','package','renew','renewPackage'].some(k=>r[k]>0))))return arch;
 const mattress=mattressFallbackRows(p);if(mattress.length)return mattress;
 if(selectedMonth!==(window.SK_PRICE_DATA?.month||'2026-11'))return [];
 let rows=priceRows(p).filter(r=>r.source_type==='2026년11월 프로모션');
 if(!rows.length)rows=priceRows(p);
 return rows.map((r,i)=>({...r,idx:i,source:'local',contractYears:Number(String(r.contract||'').split('/')[0])/12||0,package:null,renew:null,rate:null,month:selectedMonth}));
}
function priceTable(p){
 if(mattressFamily(p))return mattressSimplePrices(p);
 if(p?.id==='namuhx'){
   const rows=priceRowsForMonth(p);
   if(!rows.length)return '<div class="warning-box">나무엑스 구독료 자료를 불러오지 못했습니다.</div>';
   const fmt=n=>Number(n).toLocaleString('ko-KR')+'원';
   const types=[['single','신규 단품'],['cross','크로스'],['package','패키지'],['renew','재구독 단품'],['renewPackage','재구독 패키지'],['trade','타사보상']];
   return `<div class="price-table-tools"><div><strong>나무엑스 A1 · 프로모션 구독료</strong><p>제공된 나무엑스 프로모션 표 기준 · 16개 관리/약정 조건</p></div><span class="price-source-tag">첨부 원본 기준</span></div>
   <p class="price-footnote">표의 할인액 및 수수료를 원본대로 표시합니다. 원본에 적용월이 명시되지 않아 적용 기간은 계약 전 확인이 필요합니다.</p>
   <div class="price-scroll"><table class="compare-table price-table"><thead><tr><th>관리 방식</th><th>약정</th><th>구분</th><th>월 구독료</th><th>할인액</th><th>지급률</th><th>원본 수수료</th></tr></thead><tbody>
   ${rows.map(r=>types.map(([k,t],ti)=>`<tr>${ti===0?`<td rowspan="6"><strong>${safe(r.management)}</strong></td><td rowspan="6">${safe(r.contract)}</td>`:''}<td>${safe(t)}</td><td><button type="button" class="price-select" data-select-price="${r.idx}" data-price-type="${k}">${fmt(r[k])}<span>원본 수수료 보기 ↗</span></button></td><td>${k==='single'?'—':fmt(r.discounts[k])}</td><td>${Math.round(r.payoutRates[k]*100)}%</td><td><strong>${fmt(r.commissions[k])}</strong></td></tr>`).join('')).join('')}
   </tbody></table></div>
   <p class="price-footnote">타사보상은 지급률 100%, 재구독 패키지에는 추가 할인액이 반영된 구독료를 적용합니다. 상품 판매조건과 실제 지급 기준은 최종 확인하세요.</p>`;
 }
 const rows=priceRowsForMonth(p),s=archiveMonth(),prod=archiveProduct(p);
 const source=rows[0]?.source==='archive'?'SK매직 제품정보 앱 공통 월별 가격자료':rows[0]?.source==='mattress-excel'?'매트리스(3).xlsx · 2026년 11월 검증 원본':'내장된 2026년 11월 참고 가격';
 const guide=`<div class="price-table-tools"><div><strong>월별 구독료 확인</strong><p>${safe(source)} · 금액을 누르면 수수료 계산창이 열립니다.</p></div><div class="price-month-controls"><label>기준월 <select data-price-month aria-label="가격표 기준월">${availableMonths().map(m=>`<option value="${safe(m)}" ${m===selectedMonth?'selected':''}>${safe(m.replace('-','년 '))}월</option>`).join('')}</select></label><span class="price-source-tag">${rows[0]?.source==='archive'?'공통 월별 연동':'11월 원본 백업'}</span></div></div>`;
 if(!rows.length){return `${guide}<div class="warning-box">선택한 월에 해당 모델의 계약가격이 확인되지 않았습니다. 다른 기준월을 선택하거나 관리자가 가격표를 추가해 주세요. 임의의 금액은 표시하지 않습니다.</div>`;}
 const cell=(r,k,label)=>{const val=r[k];return typeof val==='number'&&val>0?`<button type="button" class="price-select" data-select-price="${r.idx}" data-price-type="${k}" title="${safe(label)} ${priceKRW(val)} 수수료 계산">${priceKRW(val)}<span>계산 ↗</span></button>`:'<span class="no-rate">—</span>';};
 const seen=new Set();
 const display=rows.filter(r=>{const key=[r.management,r.contract,r.variant,r.plan,r.size,r.cycle,r.base,r.single,r.cross,r.package,r.renew,r.renewPackage].join('|');if(seen.has(key))return false;seen.add(key);return true;});
 return `${guide}<div class="price-scroll"><table class="compare-table price-table"><thead><tr><th>관리</th><th>의무/계약</th><th>기준 구독료</th><th>신규 단품</th><th>크로스</th><th>패키지</th><th>재구독</th>${isMattress(p)?'<th>재구독 패키지</th>':''}</tr></thead><tbody>${display.map(r=>`<tr><td><strong>${safe(r.management||'—')}</strong>${(r.variant||r.plan||r.size)?`<small>${safe([r.variant,r.plan,r.size].filter(Boolean).join(' · '))}</small>`:''}</td><td>${safe(r.contract||'—')}${r.status==='단종 표시·추천 제외'?'<span class="retired-tag">단종·기존고객 참고</span>':''}</td><td>${cell(r,'base','기준 구독료')}</td><td>${cell(r,'single','신규 단품')}</td><td>${cell(r,'cross','크로스')}</td><td>${cell(r,'package','패키지')}</td><td>${cell(r,'renew','재구독')}</td>${isMattress(p)?`<td>${cell(r,'renewPackage','재구독 패키지')}</td>`:''}</tr>`).join('')}</tbody></table></div><p class="price-footnote">${safe(source)} · 실제 계약 시 계약형태, 프로모션 및 관리조건 최종 확인 필요. 모델 구성 반복 컬럼은 제외했습니다.</p>`;
}
function numericField(label,id,value,hint=''){
 return `<label class="calc-field">${safe(label)}<input type="number" id="${id}" step="0.01" min="0" value="${value??''}" placeholder="정책값 입력" inputmode="decimal">${hint?`<small>${safe(hint)}</small>`:''}</label>`;
}
function showCommission(idx,type){
 if(detail?.id==='namuhx'){
   const r=priceRowsForMonth(detail).find(x=>x.idx===idx);
   const map={single:'신규 단품',cross:'크로스',package:'패키지',renew:'재구독 단품',renewPackage:'재구독 패키지',trade:'타사보상'};
   if(!r||!map[type])return;
   const fmt=n=>Number(n).toLocaleString('ko-KR')+'원';
   selectedCommission={p:detail,row:r,amount:r[type],type,sourceFee:r.commissions[type],month:selectedMonth};
   $('#calcContext').textContent=`나무엑스 A1 · ${r.management} · ${r.contract} · ${map[type]}`;
   $('#calcBody').innerHTML=`<div class="calc-amount"><span>첨부 원본 월 구독료</span><strong>${fmt(r[type])}</strong><small>할인액 ${type==='single'?'0원':fmt(r.discounts[type])} · 지급률 ${Math.round(r.payoutRates[type]*100)}%</small></div><div class="calc-result"><span>첨부표의 판매수수료</span><strong>${fmt(r.commissions[type])}</strong><p>표에 기재된 수수료를 그대로 적용했습니다. 별도 배수로 재계산하지 않았습니다.</p></div><div class="calc-caution">자료 출처: 제공된 '나무엑스 프로모션 구독료' 표. 적용기간·실제 지급 조건은 계약 시 재확인해야 합니다.</div>`;
   $('#commissionLayer').classList.add('open');$('#commissionLayer').setAttribute('aria-hidden','false');
   return;
 }
 if(!detail)return;
 const r=priceRowsForMonth(detail).find(x=>x.idx===idx);if(!r||typeof r[type]!=='number'||r[type]<=0)return;
 const amount=r[type],snap=archiveMonth(),prod=archiveProduct(detail),policy=snap?.referencePolicy||{};
 const rateRow=r.rate || (snap&&prod?(snap.finalRates?.[String(prod.apiId)]||[]).find(x=>Number(x.contractYears)===r.contractYears&&String(x.management||'').includes(String(r.management||''))):null);
 const multip=rateRow?.sheetContractMultiplier??policy.termMultiplier?.[String(r.contractYears)]??null;
 const normalized=normModel(modelToken(detail));
 const referenceProfit=/^ACL(15C|20C|25C)|^BID(F17|S17)|^WPUB(600|610|700|710)|^WPUIC110F|^WPUJCC104|^WPUTD(C|F)(104|114)|^WPUB400/.test(normalized)?0.8:1;
 const profit=rateRow?.sheetProfitMultiplier??(snap&&prod?referenceProfit:null);
 const policyName={base:'기준 구독료',single:'신규 단품',cross:'크로스',package:'패키지',renew:'재구독',renewPackage:'재구독 패키지'}[type];
 const payKind={base:'신규',single:'신규',cross:'크로스',package:'패키지',renew:'교체',renewPackage:'교체'}[type];
 const payoutFromRow=rateRow?.sheetPayoutRates||{};
 const rateType={base:['신규','신규단품'],single:['신규','신규단품'],cross:['크로스','크로스/재구독/우대'],package:['패키지'],renew:['재구독','재구독단품'],renewPackage:['재구독패키지']}[type];
 let payout=null;for(const key of rateType){if(payoutFromRow[key]!=null){payout=Number(payoutFromRow[key]);break;}}
 if(payout===null&&policy.rateByType?.[payKind]!=null)payout=Number(policy.rateByType[payKind]);
 const payoutPercent=payout!=null?+(payout*100).toFixed(2):null;
 selectedCommission={p:detail,row:r,amount,type,month:selectedMonth};
 $('#calcContext').textContent=`${detail.name} · ${detail.model} · ${selectedMonth} · ${policyName}`;
 $('#calcBody').innerHTML=`<div class="calc-amount"><span>선택된 월 구독료</span><strong>${priceKRW(amount)}</strong><small>${safe(r.management||'')} · ${safe(r.contract||'')}</small></div><div class="calc-fields">${numericField('계약배수','calcMultiplier',multip, multip==null?'공식 정책값 확인 필요':'월별 정책 반영')}${numericField('이익배수','calcProfit',profit,profit==null?'공식 정책값 확인 필요':'월별 정책 반영')}${numericField('지급률 (%)','calcPayout',payoutPercent,payout==null?'수수료 유형별 정책 확인 필요':'월별 정책 반영')}${numericField('추가 수수료 (원)','calcExtra',0)}</div><div class="calc-result"><span>예상 판매수수료</span><strong id="calcResult">정책값 입력 필요</strong><p id="calcFormula"></p></div><div class="calc-caution">기존 제품정보 앱의 월별 계약배수·수수료 정책값을 참조한 예상액입니다. 스마트세일즈의 계산 화면은 별도 구현이므로 실제 지급 결과는 기준 계산기와 대조가 필요합니다. 입력된 정책값이 없으면 임의로 산출하지 않습니다. 실제 지급액은 SK매직 지급정책과 계약 확정 조건이 우선합니다.</div>`;
 $('#commissionLayer').classList.add('open');$('#commissionLayer').setAttribute('aria-hidden','false');calcCommission();
}
function calcCommission(){
 const box=$('#commissionLayer');if(!box?.classList.contains('open')||!selectedCommission)return;
 const inp=id=>$('#'+id)?.value||'';
 const mul=Number(inp('calcMultiplier')),prof=Number(inp('calcProfit')),payout=Number(inp('calcPayout')),extra=Number(inp('calcExtra'));
 if(!inp('calcMultiplier')||!inp('calcProfit')||!inp('calcPayout')||mul<=0||prof<=0||payout<=0){$('#calcResult').textContent='정책값 입력 필요';$('#calcFormula').textContent='계약배수·이익배수·지급률 확인 후 자동 계산됩니다.';return;}
 const raw=selectedCommission.amount*mul*prof*payout/100;
 const total=isMattress(selectedCommission.p)?Math.round(raw/10)*10+extra:Math.round(raw+extra);
 $('#calcResult').textContent=priceKRW(total);
 $('#calcFormula').textContent=`${selectedCommission.amount.toLocaleString('ko-KR')} × ${mul} × ${prof} × ${payout}%${isMattress(selectedCommission.p)?' (10원 단위 반올림)':''} + ${extra.toLocaleString('ko-KR')}원`;
}
function closeCommission(){$('#commissionLayer').classList.remove('open');$('#commissionLayer').setAttribute('aria-hidden','true');selectedCommission=null;}
let products=load().map(standardizeProduct),category='전체',subcat='전체',query='',compare=[],view='library',detail=null,activeTab='feature',reviewFilter='all';
const $=sel=>document.querySelector(sel);
const ic=cat=>cat==='정수기'?'💧':cat==='공기청정기'?'🌿':cat==='비데'?'✦':cat==='매트리스'?'🛏️':'▧';
function load(){
  const seed=deep(window.SEED_PRODUCTS);
  try{
    const now=JSON.parse(localStorage.getItem(STORE));
    if(Array.isArray(now?.products)&&now.products.length)return now.products.concat(seed.filter(s=>!now.products.some(p=>p.id===s.id)));
    // v0.3/v0.2 사용자 저장자료 유지. 신규 샘플 후기는 기존 직접 작성 후기와 중복되지 않도록 합칩니다.
    const prev=JSON.parse(localStorage.getItem('sk_smart_sales_catalog_v03'))
            ||JSON.parse(localStorage.getItem('sk_smart_sales_catalog_v02'));
    if(Array.isArray(prev?.products)&&prev.products.length){
      const byId=new Map(prev.products.map(x=>[x.id,x]));
      return seed.map(x=>{
        const old=byId.get(x.id);
        if(!old)return x;
        if(x.id==='mega606'){
          const own=Array.isArray(old.reviews)?old.reviews:[];
          const reviews=[...x.reviews.filter(r=>!own.some(a=>a.id===r.id)),...own];
          return {...old,...x,gallery:old.gallery||[],reviews,hero:old.hero||x.hero};
        }
        return old;
      }).concat(prev.products.filter(x=>!seed.some(p=>p.id===x.id)));
    }
  }catch(e){}
  return seed;
}
function standardizeProduct(p){
  const name=String(p.model||'').replace(/\s*계열(?:\s*\([^)]*\))?/g,'').trim();
  p.model=p.id==='mega606'?'WPU-IAC606':name;
  const mapping={ice425:'얼음정수기',ice414:'얼음정수기',mega506:'얼음정수기',mega606:'얼음정수기',standice110:'얼음정수기',ice302:'얼음정수기',water115:'초소형',water104:'초소형',water125:'초소형',water103:'초소형',waterpbc:'정수',watergbc:'정수',twowater306:'투워터 정수기',air22pet:'디아트',air22alarm:'디아트',air22:'디아트',air16:'디아트',airround:'올클린',airclean15:'올클린',airclean20:'올클린',airclean25:'올클린',namuhx:'웰니스 로보틱스'};
  if(mapping[p.id])p.subcategory=mapping[p.id];
  if(p.id==='namuhx')p.category='나무엑스';
  const verifiedSeed=(window.SEED_PRODUCTS||[]).find(s=>s.id===p.id);
  if(verifiedSeed){if(!p.hero&&verifiedSeed.hero)p.hero=verifiedSeed.hero;if(!p.officialUrl&&verifiedSeed.officialUrl)p.officialUrl=verifiedSeed.officialUrl;if(officialInfo(p).ebookDetailUrl)p.ebookDetailUrl=officialInfo(p).ebookDetailUrl;else if(!p.ebookDetailUrl&&verifiedSeed.ebookDetailUrl)p.ebookDetailUrl=verifiedSeed.ebookDetailUrl;if(!p.heroFallback&&verifiedSeed.heroFallback)p.heroFallback=verifiedSeed.heroFallback;if(!p.officialMedia?.length&&verifiedSeed.officialMedia?.length)p.officialMedia=deep(verifiedSeed.officialMedia);if(!p.officialPhotos?.length&&verifiedSeed.officialPhotos?.length)p.officialPhotos=deep(verifiedSeed.officialPhotos);if(p.id==='ice425')p.attributes={...verifiedSeed.attributes,...(p.attributes||{})};if(!p.photoSource && verifiedSeed.photoSource)p.photoSource=deep(verifiedSeed.photoSource);if(!p.photoNote && verifiedSeed.photoNote)p.photoNote=verifiedSeed.photoNote;}
  return p;
}
function save(){try{localStorage.setItem(STORE,JSON.stringify({version:'0.5.0',updated:new Date().toISOString().slice(0,10),products}));return true}catch(e){toast('저장 공간이 부족합니다. JSON으로 백업하고 사진 용량을 줄여주세요.');return false}}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),3200)}
function navigate(v){view=v;document.querySelectorAll('.screen').forEach(n=>n.classList.toggle('active',n.id===v+'View'));document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===v));const t={library:['제품 찾아보기','제품 설명, 실사용 후기, 월별 가격과 수수료를 한눈에.'],compare:['라인업 비교','제품별 주요 기능을 한눈에 비교하세요.'],dashboard:['자료 등록 현황','준비된 제품자료와 누락 항목을 확인하세요.'],admin:['자료 편집 / 백업','제품 정보 수정과 자료 백업을 관리하세요.']}[v];$('#crumb').textContent='SK MAGIC · '+t[0];$('#pageTitle').textContent='SK 스마트 세일즈 어시스턴트';$('#pageSubtitle').textContent=t[1];window.scrollTo(0,0);if(v==='compare')renderCompare();if(v==='dashboard')renderDashboard();if(v==='admin')renderAdmin()}
function metrics(){return [products.length,new Set(products.map(p=>p.category)).size,products.filter(p=>p.fab?.length).length,products.filter(p=>productImageCandidates(p).length).length]}
function renderStats(){
 const [count,categories,fab,photos]=metrics();
 const stats=[
  {title:'등록 모델',value:count,desc:'현재 제품자료실',symbol:'01'},
  {title:'제품 카테고리',value:categories,desc:'정수기 · 공청기 · 비데 등',symbol:'02'},
  {title:'FAB 설명',value:fab,desc:'상담용 설명 카드 등록',symbol:'03'},
  {title:'제품사진 보유',value:photos,desc:'대표사진 등록 모델',symbol:'04'}
 ];
 $('#statsBar').innerHTML=stats.map(x=>`<article class="stat"><div class="stat-index">${x.symbol}</div><div class="stat-content"><span class="stat-label">${x.title}</span><div class="stat-value">${x.value}<small>${x.title==='제품 카테고리'?'개':'개 모델'}</small></div><span class="stat-desc">${x.desc}</span></div></article>`).join('');
}
function renderFilters(){const cats=[...new Set(['전체','정수기','공기청정기','비데','나무엑스',...products.map(p=>p.category)])];$('#catChips').innerHTML=cats.map(c=>`<button class="chip ${category===c?'active':''}" data-cat="${safe(c)}">${safe(c)}</button>`).join('');const subs=['전체',...new Set(products.filter(p=>category==='전체'||p.category===category).map(p=>p.subcategory))];if(!subs.includes(subcat))subcat='전체';$('#subChips').innerHTML=subs.map(c=>`<button class="chip ${subcat===c?'active':''}" data-sub="${safe(c)}">${safe(c)}</button>`).join('')}
function filtered(){const q=query.toLowerCase();return products.filter(p=>(category==='전체'||p.category===category)&&(subcat==='전체'||p.subcategory===subcat)&&(!q||[p.name,p.model,p.category,...p.features].join(' ').toLowerCase().includes(q)))}
function renderLibrary(){renderStats();renderFilters();let arr=displayProducts(filtered());$('#resultCount').textContent=`총 ${arr.length}개 제품`;$('#productGrid').innerHTML=arr.length?arr.map(p=>`<article class="product"><div class="product-visual" data-open="${safe(p.id)}"><span class="status ${p.verified.startsWith('공식 일부')?'ok':''}">${p.verified.startsWith('공식 일부')?'공식 일부확인':'검증 필요'}</span>${productImageCandidates(p).length?`<img data-image-id="${safe(p.id)}" src="${safe(productImageCandidates(p)[0])}" alt="${safe(p.name)}" loading="lazy"/>${productImageSource(p).seriesRepresentative?`<span class="series-photo-label" title="${safe(productImageSource(p).note)}">시리즈 대표사진</span>`:``}`:`<span class="product-icon">${ic(p.category)}</span><span class="img-label">고화질 제품사진 등록 전</span>`}</div><div class="product-body"><div class="product-cat">${safe(p.subcategory)}</div><h3>${safe(mattressFamily(p)?MATTRESS_SERIES[mattressFamily(p)].label:p.name)}</h3><div class="code">${mattressFamily(p)?'SS · Q · K / 사이즈 선택':safe(p.model)}</div><div class="feature-row">${p.features.slice(0,3).map(f=>`<span class="fchip">${safe(f)}</span>`).join('')}</div><div class="product-bottom"><label class="compare-check"><input type="checkbox" data-check="${safe(p.id)}" ${compare.includes(p.id)?'checked':''}> 비교함 담기</label><button data-open="${safe(p.id)}">상세 보기 →</button></div></div></article>`).join(''):'<div class="empty"><div class="eicon">⌕</div><strong>검색 결과가 없어요</strong>다른 모델명이나 제품군으로 다시 검색해 보세요.</div>';$('#compareCount').textContent=compare.length;setupCardImages()}
function cmpCheck(id,checked){if(checked){if(compare.length>=3){toast('비교는 최대 3개까지 선택할 수 있습니다.');renderLibrary();return}compare.push(id)}else compare=compare.filter(x=>x!==id);renderLibrary();if(view==='compare')renderCompare()}
function addOrRemoveCompare(id){cmpCheck(id,!compare.includes(id));$('#compareCount').textContent=compare.length}
const tabLabels={feature:'핵심 기능',fab:'FAB 설명',spec:'상세 정보 · e-book',media:'실사용·후기',price:'월별 가격·수수료'};
function openDetail(id,tab='feature'){
 if(!detail||mattressFamily(detail)!==mattressFamily(products.find(p=>p.id===id)))mattressChoice={years:null,management:null};if(tab==='official')tab='spec';productGalleryIndex=0;reviewFilter='all';officialReviewMode='list';reviewSourceMode='live';officialReviewPage=1;detail=products.find(p=>p.id===id);if(!detail)return;activeTab=tab;$('#detailLayer').classList.add('open');$('#detailLayer').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';renderDetail()}
function closeDetail(){closeLightbox();officialReviewRequestSeq++;$('#detailLayer').classList.remove('open');$('#detailLayer').setAttribute('aria-hidden','true');document.body.style.overflow='';detail=null}
// 제품 사진은 원본 비율 그대로 표시하며, 썸네일 선택만으로 이미지를 전환합니다.
function productPhotoItems(p){
  const list=[];const seen=new Set();
  function add(src,title){
    src=String(src||'').trim();
    if(!src || seen.has(src))return;
    if(!/^(https:\/\/|data:image\/)/i.test(src) && !/^\.\//.test(src))return;
    seen.add(src);list.push({src,title:title||p.name});
  }
  const source=productImageSource(p);
  productImageCandidates(p).forEach((src,i)=>add(src,i===0?(source.seriesRepresentative?'시리즈 대표 제품사진':'대표 제품사진'):`제품 이미지 ${i+1}`));
  (source.additional||[]).forEach((x,i)=>add(x.src,x.title||`모델별 사진 ${i+1}`));
  (p.officialPhotos||[]).forEach((x,i)=>add(x.src,x.title||`공식 사진 ${i+1}`));
  (officialGalleryCache[p.id]||[]).forEach((src,i)=>add(src,`공식몰 제품사진 ${i+1}`));
  return list;
}
function renderProductGallery(p){
  const photos=productPhotoItems(p);
  if(!photos.length)return `<div class="detail-image"><div class="placeholder"><b>${ic(p.category)}</b><span>제품 공식 고화질 이미지 준비 중</span></div></div>`;
  productGalleryIndex=Math.min(productGalleryIndex,photos.length-1);
  const picked=photos[productGalleryIndex];
  return `<div class="product-gallery" aria-label="${safe(p.name)} 제품사진 갤러리">
    <div class="product-gallery-stage">
      <button class="product-gallery-main" type="button" data-product-photo-open aria-label="현재 제품 사진 크게 보기">
        <img id="productGalleryMain" src="${safe(picked.src)}" alt="${safe(picked.title)}" loading="eager" ${p.heroFallback?`data-fallback="${safe(p.heroFallback)}"`:''} >
        <span class="product-gallery-zoom">⤢ 크게 보기</span>
      </button>
      <span class="product-gallery-counter" id="productGalleryCounter">${productGalleryIndex+1} / ${photos.length}</span>
    </div>
    ${photos.length>1?`<div class="product-gallery-thumbs" aria-label="제품 사진 선택">${photos.map((item,i)=>`<button type="button" data-product-photo="${i}" class="${i===productGalleryIndex?'selected':''}" title="${safe(item.title)}" aria-label="제품 사진 ${i+1} · ${safe(item.title)}" aria-pressed="${i===productGalleryIndex}"><img src="${safe(item.src)}" alt="" loading="lazy"></button>`).join('')}</div>`:''}
    <p class="product-gallery-caption" id="productGalleryCaption">${safe(picked.title)} · ${safe(productImageSource(p).note||'이미지 전체 보기')}</p>
  </div>`;
}
function selectProductPhoto(index){
  if(!detail)return;
  const photos=productPhotoItems(detail);
  if(index<0||index>=photos.length)return;
  productGalleryIndex=index;
  const pic=$('#productGalleryMain'),counter=$('#productGalleryCounter'),caption=$('#productGalleryCaption');
  if(pic){pic.src=photos[index].src;pic.alt=photos[index].title;}
  if(counter)counter.textContent=`${index+1} / ${photos.length}`;
  if(caption)caption.textContent=photos[index].title+' · 이미지 전체 보기';
  document.querySelectorAll('[data-product-photo]').forEach(btn=>{
    const selected=Number(btn.dataset.productPhoto)===index;
    btn.classList.toggle('selected',selected);
    btn.setAttribute('aria-pressed',String(selected));
  });
}
// 공식 제품 상세 e-book: 판매용 공식몰 URL과 분리해 관리합니다.
// 보유 중인 브라우저 저장자료에도 seed의 e-book 링크가 반영되도록 표준화 단계에서 병합합니다.
function officialEbookUrl(p){
  const group=mattressFamily(p);
  if(group)return MATTRESS_SERIES[group].ebook;
  // 기존 월별 제품정보 사이트의 e-book 원본 주소도 모델명 일치 시 연결.
  // 확인되지 않은 유사 모델이나 다른 색상 페이지는 추측해 연결하지 않습니다.
  const matchKey=normModel(p?.model||'');
  const fromMonthly=Object.values(REMOTE_ARCHIVE).map(snap=>
    (snap?.products||[]).find(item=>normModel(item.model)===matchKey&&item.officialDetailUrl)
  ).find(Boolean);
  const url=String(officialInfo(p).ebookDetailUrl||p?.ebookDetailUrl||fromMonthly?.officialDetailUrl||'').trim();
  if(p?.id==='namuhx')return 'https://www.namuhx.com/a1';
  if(!url)return '';
  try{
    const u=new URL(url);
    return u.protocol==='https:'&&u.hostname==='ebookimage.skmagic.com'&&/\.html?$/i.test(u.pathname)?u.href:'';
  }catch(e){return ''}
}
// 제조사 e-book은 외부 사이트의 iframe 정책과 무관하게 보이도록
// 연결된 공식 설명 이미지(원본 CDN)를 본문에 먼저 펼쳐 보여줍니다.
// e-book HTML은 출처 링크로 제공하고 iframe은 부가 옵션으로만 사용합니다.
// e-book 원본 페이지를 상세정보 탭에 처음부터 표시합니다.
// 화면 삽입 제한이 있을 때는 제조사 원본보기 + 공식 이미지 모드로 전환할 수 있습니다.
function showOfficialEbook(p){
  const link=officialEbookUrl(p);
  if(!link)return '';
  if(p?.id==='namuhx'){
    const brandUrl='https://www.namuhx.com/a1';
    const internal=window.NAMUHX_DETAIL?.render(p)||renderProductFactDetails(p);
    return `<section class="ebook-reader" aria-label="나무엑스 A1 제품 상세정보">
      <header class="ebook-reader-header"><div><span class="ebook-kicker">NAMUHX · PRODUCT DETAIL</span><h3>나무엑스 A1 제품 상세정보</h3><p>공식 제품 소개를 프로그램 내부에서 확인</p></div><a class="ebook-direct-link" href="${brandUrl}" target="_blank" rel="noopener noreferrer">원본 페이지 열기 ↗</a></header>
      <div class="nhx-reader">${internal}</div>
    </section>`;
  }
  const media=(p.officialMedia||[]).filter(x=>/^https:\/\/static\.skmagic\.com\/image\/editor\//i.test(x.src||''));
  return `<section class="ebook-reader" aria-label="${safe(p.name)} 제조사 e-book 상세정보">
    <header class="ebook-reader-header"><div><span class="ebook-kicker">SK MAGIC · OFFICIAL E-BOOK</span><h3>제조사 공식 상세페이지</h3><p>${safe(p.name)} <strong>${safe(p.model)}</strong></p></div><a class="ebook-direct-link" href="${safe(link)}" target="_blank" rel="noopener noreferrer">원본 페이지 열기 ↗</a></header>
    <div class="ebook-browser-toolbar"><span class="ebook-live-dot"></span><span>제조사 e-book 실시간 화면</span><span class="ebook-frame-domain">ebookimage.skmagic.com</span></div>
    <div class="ebook-reading-area"><iframe class="ebook-live-frame" title="${safe(p.name)} SK매직 공식 e-book 상세 페이지" src="${safe(link)}" loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
    <div class="ebook-viewer-tools"><span>외부 사이트에서 화면 삽입을 제한할 경우 아래의 이미지 모드 또는 원본 링크를 이용하세요.</span><button class="ebook-images-toggle" type="button" data-ebook-images aria-expanded="false">${media.length?'제조사 상세 이미지로 보기':'상세 이미지 모드'} ▾</button></div>
    <div class="ebook-inline-images" id="ebookInlineImages" hidden>${media.length?renderEbookImageStack(media):'<div class="ebook-fetch-status">제조사 e-book에 등록된 상세 이미지 주소를 조회할 수 있습니다. 별도의 후기 파일 저장은 하지 않습니다.</div>'}</div>
    <details class="ebook-spec-support"><summary>제품 주요 사양·상담 메모 확인</summary>${renderProductFactDetails(p)}</details>
  </section>`;
}
function renderEbookImageStack(list){
  return `<div class="ebook-longform" aria-label="제조사 상세 이미지">${list.map((x,i)=>`<figure class="ebook-story"><img src="${safe(x.src)}" alt="${safe(x.title||`상세 이미지 ${i+1}`)}" loading="${i<2?'eager':'lazy'}" decoding="async" onerror="this.closest('figure').classList.add('image-failed')"><figcaption>${safe(x.title||`상세 이미지 ${i+1}`)}</figcaption></figure>`).join('')}</div>`;
}
const ebookImagesCache=Object.create(null),ebookImagesLoading=new Set();
function openEbookImageMode(){
  if(!detail)return;
  const area=$('#ebookInlineImages'),btn=document.querySelector('[data-ebook-images]');
  if(!area||!btn)return;
  area.hidden=!area.hidden;btn.setAttribute('aria-expanded',String(!area.hidden));
  if(area.hidden)return;
  if(detail.id==='namuhx')return;
  const originalMedia=(detail.officialMedia||[]).filter(x=>/^https:\/\/static\.skmagic\.com\/image\/editor\//i.test(x.src||''));
  if(originalMedia.length)return;
  if(ebookImagesCache[detail.id]){area.innerHTML=renderEbookImageStack(ebookImagesCache[detail.id]);return;}
  requestEbookImages(detail);
}
function requestEbookImages(p){
  const model=String(p.model||'').trim();const endpoint=String(window.SK_REVIEW_API_URL||'').trim();
  const area=$('#ebookInlineImages');
  if(!endpoint||!area){if(area)area.innerHTML='<div class="ebook-fetch-status">상세 이미지 서버 설정을 확인할 수 없습니다. 위 e-book 원본 페이지를 이용해 주세요.</div>';return;}
  if(ebookImagesLoading.has(p.id))return;
  ebookImagesLoading.add(p.id);
  area.innerHTML='<div class="ebook-fetch-status">제조사 상세 이미지 주소를 확인하는 중입니다…</div>';
  const callback='skEbookImages_'+Date.now()+'_'+(++officialReviewCallbackSeq);
  const url=new URL(endpoint);url.searchParams.set('action','ebook');url.searchParams.set('model',model);url.searchParams.set('ebookUrl',officialEbookUrl(p));url.searchParams.set('callback',callback);
  const script=document.createElement('script');let finished=false;
  const cleanup=()=>{if(finished)return;finished=true;clearTimeout(timer);script.remove();delete window[callback];ebookImagesLoading.delete(p.id)};
  const timer=setTimeout(()=>{cleanup();const x=$('#ebookInlineImages');if(x&&!x.hidden)x.innerHTML='<div class="ebook-fetch-status">이미지 조회 시간이 초과됐습니다. 위 e-book 원본 페이지 링크를 이용해 주세요.</div>';},15000);
  window[callback]=result=>{cleanup();const x=$('#ebookInlineImages');if(!x||detail?.id!==p.id)return;
    if(!result?.ok||!Array.isArray(result.images)||!result.images.length){x.innerHTML='<div class="ebook-fetch-status">원본 e-book에서 이미지 파일을 확인하지 못했습니다. Apps Script 서버의 e-book 기능을 업데이트하거나 원본 링크를 이용해 주세요.</div>';return;}
    ebookImagesCache[p.id]=result.images.filter(x=>x.src&&(/^https:\/\/ebookimage\.skmagic\.com\//i.test(x.src)||/^https:\/\/static\.skmagic\.com\//i.test(x.src))).slice(0,45);
    x.innerHTML=renderEbookImageStack(ebookImagesCache[p.id]);
  };
  script.onerror=()=>{cleanup();const x=$('#ebookInlineImages');if(x&&!x.hidden)x.innerHTML='<div class="ebook-fetch-status">서버에서 e-book 이미지를 불러오지 못했습니다. 원본 페이지를 이용해 주세요.</div>';};
  script.src=url.toString();document.head.appendChild(script);
}
function renderProductFactDetails(p){
  const entries=Object.entries(p.attributes||{}).filter(([key,val])=>key&&val!=null&&String(val).trim());
  const features=(p.features||[]).filter(Boolean);
  const photos=productPhotoItems(p);
  const handbook=officialEbookUrl(p);
  const evidenceLabel=String(p.sourceLabel||p.verified||'제공 자료');
  return `<section class="product-facts" aria-label="${safe(p.name)} 제품 설명">
    <div class="facts-intro"><span class="ebook-kicker">PRODUCT PROFILE · ${safe(p.model)}</span><h3>${safe(p.name)} 상세 가이드</h3><p>${safe(p.pitch||'현재 등록된 사양과 기능을 기준으로 제품을 소개합니다.')}</p><small>자료 출처: ${safe(evidenceLabel)}${handbook?' · e-book 연결':''}</small></div>
    ${photos.length?`<div class="facts-visual"><img src="${safe(photos[0].src)}" alt="${safe(p.name)} 제품사진" loading="lazy"><div><strong>${safe(p.model)}</strong><span>등록된 제품사진 · 원본 비율 유지</span></div></div>`:''}
    <div class="facts-columns"><section><h4>주요 기능</h4>${features.length?`<ul class="facts-list">${features.map(f=>`<li>${safe(f)}</li>`).join('')}</ul>`:'<p>확인된 주요 기능 항목이 아직 없습니다.</p>'}</section><section><h4>기능·사양</h4>${entries.length?`<dl class="facts-specs">${entries.map(([k,v])=>`<dt>${safe(k)}</dt><dd>${safe(v)}</dd>`).join('')}</dl>`:'<p>수치 사양은 모델별 공식 자료 확인이 필요합니다.</p>'}</section></div>
    ${p.attention?`<div class="facts-note"><strong>설치·사용 시 확인사항</strong><p>${safe(p.attention)}</p></div>`:''}
    ${p.officialUrl?`<p class="facts-source">관련 제조사 상품정보: <a href="${safe(p.officialUrl)}" target="_blank" rel="noopener noreferrer">모델별 사양 확인 ↗</a> <span>(판매사이트로 이동)</span></p>`:''}
  </section>`;
}
function renderProductDetails(p){
  const original=officialEbookUrl(p);
  const guide=renderProductFactDetails(p);
  return original?showOfficialEbook(p):guide;
}
function goOfficialDetail(){
  if(!detail)return;
  activeTab='spec';
  renderDetail();
  const tabs=document.querySelector('.detail-tabs');
  if(tabs)tabs.scrollIntoView({behavior:'smooth',block:'start'});
}
function renderDetail(){
  if(!detail)return;
  const p=detail;
  $('#detailContent').innerHTML=`<div class="detail-eyebrow">${safe(p.category)} / ${safe(p.subcategory)}</div><h2>${safe(p.name)}</h2><div class="detail-model">${safe(p.model)} · ${safe(p.verified)}</div>${mattressSizeSelector(p)}${activeTab!=='official'&&activeTab!=='spec'?`<div class="ebook-quick-action"><button class="ebook-open-cta" type="button" data-ebook-detail>📖 상세설명 전체 보기</button></div>`:''}${(activeTab==='media'||activeTab==='price'||activeTab==='spec')?'':`${renderProductGallery(p)}<div class="detail-note">${safe(p.pitch)||'상담 설명을 준비하고 있습니다.'}</div>`}<div class="detail-tabs">${Object.entries(tabLabels).map(([key,v])=>`<button class="tab ${activeTab===key?'active':''}" data-tab="${key}">${v}</button>`).join('')}</div><div class="detail-section">${renderTab(p)}</div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:26px"><button class="primary-btn" data-detail-compare="${safe(p.id)}">${compare.includes(p.id)?'비교함에서 제거':'이 제품 비교함에 추가'}</button><button class="outline-btn" data-edit="${safe(p.id)}">관리자: 자료 수정</button></div>`;
  const galleryImg=$('#productGalleryMain');
  if(galleryImg){
    const sources=productPhotoItems(p).map(x=>x.src);
    imageOnErrorFallback(galleryImg,sources,galleryImg.closest('.product-gallery-main'));
  }
  if(activeTab==='media'&&reviewSourceMode==='live')loadOfficialReviews(p,officialReviewPage);
  else if(officialInfo(p).model)loadOfficialProductPhotos(p);
}

function empty(t){return `<div class="empty-content">${safe(t)}<br><strong>→ 자료 편집에서 등록할 수 있어요.</strong></div>`}
function renderTab(p){if(activeTab==='feature')return `${p.id==='mega606'?'<div class="verified-spotlight"><strong>공식 확인 · MEGA ICE mini</strong><div class="spotlight-grid"><span><b>195mm</b>슬림 폭</span><span><b>11g</b>라지 모드 얼음</span><span><b>약 100℃</b>고온수</span><span><b>UV</b>코크 자동살균</span></div><p>※ 조리수 연결 불가 · 설치 환경별 여유공간 확인 필요</p></div>':''}<h3>핵심 기능</h3>${p.features?.length?`<div class="pill-grid">${p.features.map(f=>`<span>${safe(f)}</span>`).join('')}</div>`:empty('핵심 기능이 아직 등록되지 않았습니다.')}<h3>상담 전 확인</h3><div class="warning-box">교육자료에 기반한 사항은 최종 모델별 공식 사양을 확인한 뒤 고객에게 확정적으로 안내하세요.</div>`;
 if(activeTab==='fab')return `<h3>FAB + Evidence · 영업 설명 카드</h3><p class="subtle">특징 → 장점 → 고객에게 주는 가치 → 증빙자료 순서로 설명할 수 있도록 설계했습니다.</p>${p.fab?.length?p.fab.map((x,i)=>`<div class="fab-card"><span class="note-tag">${safe(x.status||'상담 초안')} · ${i+1}번째 포인트</span>${[['F · 특징',x.f],['A · 장점',x.a],['B · 고객 가치',x.b],['E · 증거',x.e]].map(([a,b],j)=>`<div class="fab-row"><span class="fab-key ${j===3?'fab-e':''}">${a}</span><span>${safe(b)}</span></div>`).join('')}</div>`).join(''):empty('이 제품의 FAB 설명이 아직 준비되지 않았습니다.')}`;
 if(activeTab==='spec'||activeTab==='official')return renderProductDetails(p);
 if(activeTab==='media')return renderOfficialLiveReviews(p);
 return `<h3>${safe(selectedMonth.replace('-', '년 '))}월 계약조건별 구독료</h3>${priceTable(p)}<h3>검증 출처</h3><div class="info-list"><b>자료 구분</b><span>${safe(p.sourceLabel)}</span><b>검증 상태</b><span>${safe(p.verified)}</span><b>확인일</b><span>${safe(p.checkedAt||'확인 필요')}</span><b>교육 원본</b><span>${safe(p.sourceImage)}</span></div><p style="margin-top:16px"><button type="button" class="reference-link ebook-jump" data-ebook-detail>${officialEbookUrl(p)?'제조사 e-book 상세설명 보기 ↗':'제품 상세정보 보기 ↗'}</button></p>`}



// 별도 공식몰 제품 이미지: 페이지 HTML에서 제품에 연결된 주소만 받아 임시로 표시 (저장하지 않음).
function loadOfficialProductPhotos(p){
  const meta=officialInfo(p);
  if(!meta.model||officialGalleryLoading.has(p.id)||officialGalleryLoaded.has(p.id))return;
  const endpoint=String(window.SK_REVIEW_API_URL||'').trim();
  if(!endpoint)return;
  const pid=p.id;
  officialGalleryLoading.add(pid);
  const cb='skOfficialPhotos_'+Date.now()+'_'+(++officialReviewCallbackSeq);
  const url=new URL(endpoint);
  url.searchParams.set('action','photos');url.searchParams.set('model',meta.model);
  url.searchParams.set('callback',cb);
  url.searchParams.set('_',String(Date.now()));
  const script=document.createElement('script');
  let finished=false;
  const cleanup=()=>{if(finished)return;finished=true;clearTimeout(timer);script.remove();delete window[cb];officialGalleryLoading.delete(pid)};
  const timer=setTimeout(()=>cleanup(),15000);
  window[cb]=result=>{
    cleanup();
    if(!result?.ok||!Array.isArray(result.images))return;
    officialGalleryCache[pid]=result.images.filter(src=>typeof src==='string'&&/^https:\/\/static\.skmagic\.com\/image\/goods\/G\d{9}\//i.test(src)).slice(0,16);
    officialGalleryLoaded.add(pid);
    if(detail?.id===pid){
      const stage=document.querySelector('.product-gallery');
      if(stage)stage.outerHTML=renderProductGallery(detail);
      if(activeTab==='official'){const section=$('.detail-section');if(section)section.innerHTML=renderTab(detail)}
      renderLibrary();
    }
  };
  script.onerror=cleanup;
  script.src=url.toString();document.head.appendChild(script);
}

// 공식몰 후기 API: Google Apps Script가 요청한 페이지만 구조화해 반환합니다.
function officialGoodsId(p){
  const manual=String(p.reviewGoodsId||'').trim().toUpperCase();
  if(/^G\d{9}$/.test(manual))return manual;
  try{
    const u=new URL(p.officialUrl||'');
    if(u.hostname!=='www.skmagic.com'&&u.hostname!=='skmagic.com')return '';
    const id=u.searchParams.get('goodsId')||'';
    return /^G\d{9}$/.test(id)?id:'';
  }catch(e){return ''}
}
function officialReviewApiModel(p){
  // 후기 API는 제품 모델명을 기준으로 연결합니다. 기존 e-book 상품번호는 사용하지 않습니다.
  const explicit=String(p.reviewApiModel||'').trim().toUpperCase();
  if(explicit)return explicit;
  if(officialInfo(p).model)return officialInfo(p).model;
  // v0.4~v0.6 브라우저 저장자료에서 신규 필드가 누락된 경우에도 기존 자료를 보존합니다.
  const seed=(window.SEED_PRODUCTS||[]).find(item=>item.id===p.id);
  if(seed&&seed.reviewApiModel)return String(seed.reviewApiModel).trim().toUpperCase();
  const model=String(p.model||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(p.id==='mega606'||model.includes('WPUIAC606'))return 'WPU-IAC606';
  return '';
}
function renderOfficialLiveReviews(p){
  if(reviewSourceMode==='saved'){
    return `<div class="live-review-header"><div><span class="live-overline">SAVED · OPTIONAL</span><h3>별도 등록 후기</h3></div><button class="outline-btn" data-review-source="live">공식몰 실시간 후기 보기</button></div>
    <div class="live-notice">여기는 이 기기에 별도로 등록된 자료만 보여줍니다. 공식몰 최신 후기와는 별개입니다.</div>${renderReviews(p)}`;
  }
  const model=officialReviewApiModel(p);
  if(!model){
    return `<div class="live-review-header"><div><span class="live-overline">OFFICIAL REVIEW</span><h3>공식몰 실시간 사용후기</h3></div></div><div class="live-notice">이 제품은 공식몰 후기 연동 모델키가 등록되지 않았습니다. 관리자 자료 편집에서 후기 모델키를 등록해야 합니다.</div><button class="outline-btn" data-review-source="saved">별도 등록 후기 보기</button>`;
  }
  return `<div class="live-review-header"><div><span class="live-overline">SKMAGIC · OFFICIAL LIVE REVIEW</span><h3>공식몰 실제 고객 후기</h3><p>공식몰에서 현재 페이지의 후기만 요청합니다. 후기 원문과 고객 사진은 우리 사이트나 태블릿에 저장하지 않습니다.</p></div><span class="live-cloud">↻ 실시간 연결</span></div>
  <div class="live-review-switch"><button type="button" class="${officialReviewMode==='list'?'is-active':''}" data-official-review-mode="list">전체 사용후기</button><button type="button" class="${officialReviewMode==='photo'?'is-active':''}" data-official-review-mode="photo">포토후기</button><button type="button" class="${officialReviewMode==='gallery'?'is-active':''}" data-official-review-mode="gallery">📷 사진만 보기</button></div>
  <div id="officialReviewResults" aria-live="polite"><div class="official-review-loading">공식몰 후기를 불러오는 중입니다…</div></div>
  <div class="live-review-linkrow"><button type="button" class="outline-btn" data-review-source="saved">별도 등록 자료 보기</button></div>
  <div class="live-notice">공식몰 원문 기준 · 한 번에 현재 페이지 5건만 요청 · 후기/사진 대량 저장 없음. 인터넷 연결이 필요합니다.</div>`;
}
function requestOfficialReviews(p,page,mode){
  const endpoint=String(window.SK_REVIEW_API_URL||'').trim();
  if(!endpoint||!/\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(endpoint)){
    return Promise.reject(new Error('Google Apps Script 웹 앱 주소가 아직 설정되지 않았습니다. config.js에 배포 URL을 입력해 주세요.'));
  }
  const model=officialReviewApiModel(p);
  if(!model)return Promise.reject(new Error('이 제품의 공식몰 연동 모델키가 없습니다.'));
  return new Promise((resolve,reject)=>{
    const callback='skReviewJsonp_'+Date.now()+'_'+(++officialReviewCallbackSeq);
    let script=null,timer=null,finished=false;
    const cleanup=()=>{
      if(finished)return;
      finished=true;
      if(timer)clearTimeout(timer);
      if(script&&script.parentNode)script.parentNode.removeChild(script);
      try{delete window[callback]}catch(e){window[callback]=undefined}
    };
    try{
      const url=new URL(endpoint);
      url.searchParams.set('model',model);
      url.searchParams.set('mode',mode==='gallery'?'photo':mode);
      url.searchParams.set('page',String(page));
      url.searchParams.set('callback',callback);
      url.searchParams.set('_',String(Date.now()));
      script=document.createElement('script');
      script.async=true;
      script.src=url.toString();
      window[callback]=(payload)=>{
        cleanup();
        if(!payload||payload.ok!==true)reject(new Error(payload?.message||'공식몰 후기 응답을 확인하지 못했습니다.'));
        else resolve(payload);
      };
      script.onerror=()=>{cleanup();reject(new Error('후기 서버에 연결하지 못했습니다. 배포 URL과 웹 앱 공개 권한을 확인해 주세요.'))};
      timer=setTimeout(()=>{cleanup();reject(new Error('공식몰 응답 시간이 초과됐습니다. 잠시 후 다시 시도해 주세요.'))},20000);
      document.head.appendChild(script);
    }catch(error){cleanup();reject(error)}
  });
}
// 고객 후기 사진만 임시로 참조합니다. 파일 자체는 서버/브라우저 저장소에 저장하지 않습니다.
function reviewImagesFromRows(rows){
  const images=[];
  rows.forEach((r,ri)=>(Array.isArray(r.images)?r.images:[]).forEach((src,ii)=>{
    if(/^https:\/\/static\.skmagic\.com\/image\/goods_comment\//i.test(src)){
      images.push({src,title:`${r.author||'고객'} 후기 사진 ${ii+1}`,subtitle:r.date||''});
    }
  }));
  return images;
}
function renderOfficialReviewResults(data){
  const rows=Array.isArray(data.reviews)?data.reviews:[];
  currentReviewImages=reviewImagesFromRows(rows);
  const page=Number(data.page||officialReviewPage);
  const pageSize=Number(data.pageSize||5);
  const totalPages=Number(data.totalPages||0);
  const totalCount=Number(data.totalCount||0);
  const countText=officialReviewMode==='list'&&totalCount
    ? `전체 ${totalCount.toLocaleString('ko-KR')}건 · ${page}/${totalPages}페이지`
    : `${page}페이지 · ${rows.length}건 표시`;
  const pagination=`<div class="official-review-pagination">
    <button type="button" data-review-page="first" ${page<=1?'disabled':''}>처음</button>
    <button type="button" data-review-page="prev" ${page<=1?'disabled':''}>이전</button>
    <strong>${countText}</strong>
    <button type="button" data-review-page="next" ${(totalPages?page>=totalPages:rows.length<pageSize)?'disabled':''}>다음</button>
    ${totalPages?`<button type="button" data-review-page="last" data-max="${totalPages}" ${page>=totalPages?'disabled':''}>마지막</button>`:''}
  </div>`;
  // JSONP의 전체 후기 데이터를 현재 화면에서만 사용합니다.
  if(officialReviewMode==='gallery'){
    if(!currentReviewImages.length)return `<div class="official-review-empty">이 페이지에 고객 사진이 없습니다.</div>${pagination}`;
    const photos=currentReviewImages.map((photo,i)=>`<button class="review-photo-only" type="button" data-review-photo="${i}" aria-label="후기 사진 ${i+1} 크게 보기"><img src="${safe(photo.src)}" alt="${safe(photo.title)}" loading="lazy"><span>${safe(photo.title)}</span></button>`).join('');
    return `<div class="official-review-count">사진만 보기 · ${currentReviewImages.length}장 · ${page}페이지</div><div class="official-photo-only-grid">${photos}</div>${pagination}`;
  }
  let imageCursor=0;
  const cards=rows.map(r=>{
    const author=safe(r.author||'작성자 미표기');
    const date=safe(r.date||'날짜 미표기');
    const stars=r.ratingPercent!==null&&r.ratingPercent!==undefined&&r.ratingPercent!==''&&Number.isFinite(Number(r.ratingPercent))
      ? '★'.repeat(Math.max(0,Math.min(5,Math.round(Number(r.ratingPercent)/20))))+'☆'.repeat(5-Math.max(0,Math.min(5,Math.round(Number(r.ratingPercent)/20))))
      : '';
    const rating=r.rating==null?'':`<span class="official-review-rating">${stars} <b>${safe(r.rating)}</b></span>`;
    const photos=(Array.isArray(r.images)?r.images:[]).filter(src=>/^https:\/\/static\.skmagic\.com\/image\/goods_comment\//i.test(src));
    const galleryHtml=photos.map((src,i)=>`<button type="button" data-review-photo="${imageCursor+i}" aria-label="후기 사진 ${i+1} 팝업으로 보기"><img src="${safe(src)}" alt="공식몰 고객 후기 사진 ${i+1}" loading="lazy"></button>`).join('');
    imageCursor+=photos.length;
    return `<article class="official-review-card">
      <div class="official-review-card-top"><strong>${author}</strong><span>${date}</span>${rating}</div>
      <p class="official-review-content">${safe(r.content||r.title||'')}</p>
      ${r.tags?`<div class="official-review-tags">${safe(r.tags)}</div>`:''}
      ${photos.length?`<div class="official-review-photos">${galleryHtml}</div>`:''}
      <div class="official-review-source">SK매직 공식몰 · 원문 후기${photos.length?' · 고객 첨부 사진':''}</div>
    </article>`;
  }).join('');
  if(!rows.length)return `<div class="official-review-empty"><strong>${page}페이지에 표시할 후기가 없습니다.</strong><p>마지막 페이지이거나 공식몰에 등록된 후기가 없는 상태입니다.</p></div>${pagination}`;
  return `<div class="official-review-count">${countText}</div><div class="official-review-list">${cards}</div>${pagination}`;
}
function openLightbox(images,index=0,title='사진 보기'){
  const cleaned=(images||[]).filter(x=>x&&typeof x.src==='string'&&x.src);
  if(!cleaned.length)return;
  lightboxState={images:cleaned,index:Math.max(0,Math.min(cleaned.length-1,index)),title};
  const node=$('#imageLightbox');node.classList.add('open');node.setAttribute('aria-hidden','false');
  renderLightbox();
}
function renderLightbox(){
  if(!lightboxState)return;
  const {images,index,title}=lightboxState;
  const item=images[index];
  $('#lightboxTitle').textContent=title;
  $('#lightboxImage').src=item.src;
  $('#lightboxImage').alt=item.title||title;
  $('#lightboxCaption').textContent=item.title||'';
  $('#lightboxCounter').textContent=`${index+1} / ${images.length}`;
  $('#lightboxPrev').disabled=index===0;
  $('#lightboxNext').disabled=index>=images.length-1;
  $('#lightboxThumbs').innerHTML=images.map((x,i)=>`<button type="button" data-lightbox-select="${i}" class="${i===index?'selected':''}" aria-label="사진 ${i+1}" aria-pressed="${i===index}"><img src="${safe(x.src)}" alt="" loading="lazy"></button>`).join('');
  const btn=$('#lightboxThumbs').querySelector('.selected');
  if(btn)btn.scrollIntoView({block:'nearest',inline:'nearest'});
}
function lightboxStep(delta){if(!lightboxState)return;const next=lightboxState.index+delta;if(next<0||next>=lightboxState.images.length)return;lightboxState.index=next;renderLightbox();}
function closeLightbox(){const el=$('#imageLightbox');if(el){el.classList.remove('open');el.setAttribute('aria-hidden','true');}lightboxState=null;}

function loadOfficialReviews(p,page){
  const host=$('#officialReviewResults');
  if(!host)return;
  const requestId=++officialReviewRequestSeq;
  currentReviewImages=[];
  host.innerHTML='<div class="official-review-loading">공식몰 후기를 불러오는 중입니다…</div>';
  requestOfficialReviews(p,page,officialReviewMode).then(data=>{
    if(requestId!==officialReviewRequestSeq||!detail||detail.id!==p.id||activeTab!=='media'||reviewSourceMode!=='live')return;
    host.innerHTML=renderOfficialReviewResults(data);
  }).catch(error=>{
    if(requestId!==officialReviewRequestSeq||!detail||detail.id!==p.id||activeTab!=='media'||reviewSourceMode!=='live')return;
    host.innerHTML=`<div class="official-review-error"><strong>공식몰 후기를 불러오지 못했습니다.</strong><p>${safe(error.message||error)}</p><button type="button" class="primary-btn" data-review-retry>다시 연결</button><small>서버 배포 URL, 웹 앱 접근 권한, 인터넷 연결을 확인해 주세요.</small></div>`;
  });
}
function renderReviews(p){
 const entries=Array.isArray(p.reviews)?p.reviews:[];
 const gallery=(p.gallery||[]).map((src,i)=>({src,caption:`현장 설치 사진 ${i+1}`,source:'직접 등록 사진'}));
 entries.forEach(r=>(r.photos||[]).forEach((src,i)=>gallery.push({src,caption:r.title||`후기 사진 ${i+1}`,source:r.source||'후기 등록 사진'})));
 const cards=entries.map((r,i)=>`<article class="standalone-review">
   <div class="review-top"><span class="review-badge">공개 후기 · 출처 확인</span><span class="review-date">${safe(r.date||'날짜 미기재')}</span></div>
   <h4>${safe(r.title||'사용후기')}</h4><p class="review-body">${safe(r.body||'')}</p>
   ${r.photos?.length?`<div class="review-mini-photos">${r.photos.map(src=>`<img src="${safe(src)}" alt="등록된 후기 사진" loading="lazy">`).join('')}</div>`:''}
   <div class="review-footer"><strong>${safe(r.author||'작성자 미표기')}</strong><span>${safe(r.source||'등록 자료')}</span></div>
   <div class="review-disclosure">${safe(r.status||'관리자 등록 후기 · 출처 확인 필요')}</div>
 </article>`).join('');
 const photos=gallery.length?`<div class="customer-photo-grid">${gallery.map(x=>`<figure class="customer-shot"><img src="${safe(x.src)}" alt="${safe(x.caption)}" loading="lazy"><figcaption><strong>${safe(x.caption)}</strong><small>${safe(x.source)}</small></figcaption></figure>`).join('')}</div>`:`<div class="review-empty"><div class="review-empty-icon">▧</div><strong>실제 설치 사진은 아직 등록 전이에요.</strong><p>고객이 직접 촬영했거나 사용 허락을 받은 사진만 자료 편집에서 추가할 수 있어요.</p></div>`;
 return `<div class="review-headline"><div><div class="detail-eyebrow">REAL VOICE · REVIEW</div><h3>실제 사용후기</h3><p>상품 상세페이지로 이동하지 않고 여기에서 후기 내용을 바로 확인합니다.</p></div><span class="review-count">후기 ${entries.length}건</span></div>
 ${p.id==='mega606'&&entries.some(r=>String(r.id||'').startsWith('ext606-'))?`<div class="review-source-note">이 제품의 후기는 <strong>이전에 등록된 외부 판매처 후기 요약</strong>을 포함합니다. SK매직 공식몰에 게시된 후기와 혼동하지 않도록 출처를 구분했습니다. 본문은 원문 인용이 아니라 요약입니다. 포토리뷰 원본은 확보·사용승인되지 않아 포함하지 않았습니다.</div>`:''}
 <div class="review-switch" role="group" aria-label="후기 자료 선택"><button type="button" data-review-filter="all" class="${reviewFilter==='all'?'selected':''}">사용후기 <b>${entries.length}</b></button><button type="button" data-review-filter="photo" class="${reviewFilter==='photo'?'selected':''}">설치 사진 <b>${gallery.length}</b></button></div>
 ${reviewFilter==='photo'?photos:entries.length?`<div class="standalone-review-list">${cards}</div>`:`<div class="review-empty"><strong>등록된 사용후기가 아직 없어요.</strong><p>자료 편집에서 출처가 확인된 고객 후기를 등록하면 이 화면에 표시됩니다.</p></div>`}
 <div class="review-bottom-note">자료 검증: 출처 확인 · 작성자 개인정보 최소화 · 사진 사용 권한 확인. 후기 내용은 개인의 경험으로 모든 사용자에게 동일하게 적용되지는 않습니다.</div>`;
}
function renderCompare(){let selected=compare.map(id=>products.find(p=>p.id===id)).filter(Boolean);if(!selected.length){$('#compareArea').innerHTML=`<div class="empty"><div class="eicon">⚖</div><strong>비교할 제품을 먼저 담아주세요</strong>제품 자료실에서 모델의 '비교함 담기'를 선택하면 비교표가 만들어집니다.<div style="margin-top:16px"><button class="primary-btn" data-view-go="library">제품 찾아보기</button></div></div>`;return}const keys=[...new Set(selected.flatMap(p=>Object.keys(p.attributes||{})))];const rows=[['제품군',p=>safe(p.subcategory)],['대표 특징',p=>safe(p.features.slice(0,3).join(' / ')||'자료 준비 중')],...keys.map(k=>[k,p=>safe(p.attributes[k]||'확인 필요')]),['구독료',p=>priceRows(p).length?'선택 월 가격 조회 (상세 탭)':'자료 확인 필요']];$('#compareArea').innerHTML=`<div class="selected">${selected.map(p=>`<div class="select-card"><button data-remove="${safe(p.id)}">✕</button><strong>${safe(p.name)}</strong><small>${safe(p.model)}</small></div>`).join('')}</div><div class="warning-box">※ 다른 제품군끼리의 비교는 참고용입니다. 유사 제품끼리 비교할 때 의미가 더 큽니다. 확인이 필요한 항목은 ‘확인 필요’로 표시했습니다.</div><div style="overflow-x:auto"><table class="compare-table"><thead><tr><th>비교 항목</th>${selected.map(p=>`<th>${safe(p.name)}<div class="muted">${safe(p.model)}</div></th>`).join('')}</tr></thead><tbody>${rows.map(([k,fn])=>`<tr><td>${safe(k)}</td>${selected.map(p=>`<td>${fn(p)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
function renderDashboard(){let total=products.length;let m=[['기본 제품 등록',total,total],['핵심 기능 텍스트',products.filter(p=>p.features?.length).length,total],['FAB 초안',products.filter(p=>p.fab?.length).length,total],['공식 일부 확인',products.filter(p=>p.officialUrl).length,total],['고화질 제품 사진',products.filter(p=>productImageCandidates(p).length).length,total],['실제 설치·후기 자료',products.filter(p=>p.gallery?.length||p.reviews?.length).length,total],['선택 월 가격표 연결',products.filter(p=>priceRowsForMonth(p).length).length,total]];$('#dashboardArea').innerHTML=`<div class="dashboard-cards"><div class="dashboard-card"><strong>${total}</strong><span>등록 모델·계열</span></div><div class="dashboard-card"><strong>${products.filter(p=>p.fab?.length).length}</strong><span>FAB 설명이 들어간 모델</span></div><div class="dashboard-card"><strong>${products.filter(p=>productImageCandidates(p).length).length}</strong><span>대표 고화질 사진 확보</span></div></div><div class="progress-wrap"><h3>자료 채우기 체크리스트</h3>${m.map(([t,a,b])=>`<div class="progress-line"><span>${t}</span><strong>${a} / ${b}</strong></div><div class="meter"><span style="width:${b?Math.round(100*a/b):0}%"></span></div>`).join('')}</div><div class="warning-box">색상·관리형태별 세부 계약 코드와 공식몰 상품번호는 모델별로 별도 관리합니다.</div>`}
function renderAdmin(){let arr=[...products].sort((a,b)=>a.category.localeCompare(b.category,'ko'));$('#adminList').innerHTML=`<div class="admin-table">${arr.map(p=>`<div class="admin-item"><div><strong>${safe(p.name)}</strong><br><small>${safe(p.model)} · ${safe(p.verified)}</small></div><button data-edit="${safe(p.id)}">편집하기 ✎</button></div>`).join('')}</div>`}
function openEdit(id){const p=products.find(p=>p.id===id);if(!p)return;detail=p;$('#detailLayer').classList.add('open');$('#detailLayer').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('#detailContent').innerHTML=`<div class="detail-eyebrow">ADMIN · PRODUCT EDIT</div><h2>제품 자료 수정</h2><p class="detail-model">수정 후 '이 기기에 저장'을 눌러주세요. 수정 내용은 브라우저 내부에 저장됩니다.</p><form id="editForm" class="edit-form" style="margin-top:25px"><div class="field"><label>제품명</label><input name="name" value="${safe(p.name)}" required></div><div class="field"><label>모델번호</label><input name="model" value="${safe(p.model)}" required></div><div class="field"><label>제품군</label><select name="category">${['정수기','공기청정기','비데','나무엑스','기타'].map(s=>`<option ${s===p.category?'selected':''}>${s}</option>`).join('')}</select></div><div class="field"><label>세부 분류</label><input name="subcategory" value="${safe(p.subcategory)}"></div><div class="field wide"><label>핵심 기능 (줄바꿈으로 구분)</label><textarea name="features">${safe((p.features||[]).join('\n'))}</textarea></div><div class="field wide"><label>영업 설명 / 추천 포인트</label><textarea name="pitch">${safe(p.pitch)}</textarea></div><div class="field wide"><label>FAB 설명 (한 카드씩 네 줄: 특징 | 장점 | 고객가치 | 증거)</label><textarea name="fab" style="min-height:145px">${safe((p.fab||[]).map(x=>[x.f,x.a,x.b,x.e].join(' | ')).join('\n'))}</textarea><div class="edit-help">한 줄에 한 개의 FAB 카드. 구분자 | 를 사용해 F, A, B, E 순으로 입력합니다.</div></div><div class="field wide"><label>대표 제품 사진 (JPEG / PNG, 권장 고해상도)</label><input type="file" name="photo" accept="image/jpeg,image/png,image/webp"><div class="edit-help">파일 선택 시 1400px 이하로 자동 축소하여 이 브라우저에 저장됩니다. 대량의 사진은 차기 클라우드 저장소에 별도 보관 예정.</div></div><div class="field wide"><label>고객 실사용·설치 사진 추가 (여러 장)</label><input type="file" name="customerPhotos" accept="image/jpeg,image/png,image/webp" multiple><div class="edit-help">실제 사용 동의를 받은 자료만 추가하세요. 최대 6장씩 / 1100px로 축소 후 이 브라우저에 저장됩니다. 사진이 많으면 JSON 백업도 커집니다.</div></div><div class="field wide review-admin-head"><h3>고객 후기 등록 · 관리</h3><p class="edit-help">제품 상세의 ‘실사용·후기’에는 등록된 후기만 독립적으로 표시됩니다. 원문을 복사하기보다 확인된 내용만 요약하고, 사진 사용 허락을 확인해 주세요.</p></div><div class="field wide"><label>새 후기 제목 (선택)</label><input name="reviewTitle" placeholder="예: 얼음 크기 선택이 편리했다는 후기"></div><div class="field wide"><label>후기 요약 또는 원문 (선택)</label><textarea name="reviewBody" placeholder="공개된 실제 내용만 입력하세요. 요약이면 요약임을 표기합니다."></textarea></div><div class="field"><label>작성자 표시 (익명 권장)</label><input name="reviewAuthor" placeholder="예: 김*호"></div><div class="field"><label>후기 작성일</label><input name="reviewDate" type="date"></div><div class="field wide"><label>후기 출처</label><input name="reviewSource" placeholder="예: 고객이 직접 제공 · 외부 판매처 홈페이지"></div><div class="field wide"><label>원문 출처 URL (관리용 · 고객에게 직접 노출하지 않음)</label><input name="reviewSourceUrl" type="url" placeholder="https://..."></div><div class="field wide"><label>이 후기에 첨부할 고객 사진 (최대 3장)</label><input type="file" name="reviewPhotos" multiple accept="image/jpeg,image/png,image/webp"></div><div class="field wide"><label class="consent-line"><input type="checkbox" name="reviewConsent" value="ok">새 후기/사진에 대한 출처·활용 권한을 확인했고 개인정보를 가렸습니다.</label><p class="edit-help">후기 제목/본문을 입력하지 않으면 신규 후기는 생성하지 않습니다. 사진을 넣는 경우에도 후기 제목/본문이 필요합니다.</p></div><div class="field wide"><label>현재 저장된 후기 (삭제는 즉시 반영)</label><div class="edit-review-list">${(p.reviews||[]).length?(p.reviews||[]).map((r,i)=>`<div class="edit-review-item"><div><strong>${safe(r.title)}</strong><small>${safe(r.author||'작성자 미기재')} · ${safe(r.source||'출처 미기재')}</small></div><button type="button" class="danger-btn" data-review-remove="${i}" data-review-product="${safe(p.id)}">삭제</button></div>`).join(''):'<span class="edit-help">저장된 후기가 없습니다.</span>'}</div></div><div class="field wide"><label>현재 직접 등록한 설치 사진</label><div class="edit-gallery">${(p.gallery||[]).length?(p.gallery||[]).map((src,i)=>`<div class="edit-gallery-card"><img src="${safe(src)}" alt="등록된 설치 사진 ${i+1}"><button type="button" class="danger-btn" data-gallery-remove="${i}" data-gallery-product="${safe(p.id)}">삭제</button></div>`).join(''):'<span class="edit-help">설치 사진이 없습니다.</span>'}</div></div><div class="field wide"><label>검증 상태</label><select name="verified">${['교육자료 참고·검증 필요','공식 일부확인·판매조건 별도','공식 확인완료','판매코드별 공식 재검증 필요'].map(s=>`<option ${s===p.verified?'selected':''}>${s}</option>`).join('')}</select></div><div class="field wide"><label>기존 공식몰 제품 링크 (후기·출처용)</label><input name="officialUrl" value="${safe(p.officialUrl)}"></div><div class="field wide"><label>제조사 e-book 상세설명 URL (제품 설명 화면용)</label><input name="ebookDetailUrl" type="url" placeholder="https://ebookimage.skmagic.com/images/...html" value="${safe(p.ebookDetailUrl||'')}"><p class="edit-help">공식 사진·설명 탭에는 이 주소의 e-book 설명 페이지가 표시됩니다. 기존 공식몰 후기 연동 주소는 변경되지 않습니다.</p></div><div class="field wide"><label>공식몰 후기용 상품코드(goodsId, 선택)</label><input name="reviewGoodsId" placeholder="예: G000069931" value="${safe(p.reviewGoodsId||officialGoodsId(p))}"><p class="edit-help">공식몰 상품 상세 주소의 goodsId입니다.</p></div><div class="field wide"><label>공식몰 후기 서버 모델키</label><input name="reviewApiModel" placeholder="예: WPU-IAC606" value="${safe(officialReviewApiModel(p))}"><p class="edit-help">Google Apps Script Code.gs에 등록된 모델키와 정확히 같아야 합니다.</p></div><div class="edit-footer field wide"><button type="button" class="outline-btn" id="cancelEdit">취소</button><button type="submit" class="primary-btn">이 기기에 저장</button></div></form>`;$('#editForm').addEventListener('submit',e=>saveEdit(e,p));$('#cancelEdit').onclick=closeDetail}
async function saveEdit(e,p){e.preventDefault();const d=new FormData(e.target);const v=n=>String(d.get(n)||'').trim();p.name=v('name');p.model=v('model');p.category=v('category');p.subcategory=v('subcategory');p.pitch=v('pitch');p.features=v('features').split('\n').map(x=>x.trim()).filter(Boolean);p.verified=v('verified');p.officialUrl=v('officialUrl');p.ebookDetailUrl=v('ebookDetailUrl');p.reviewGoodsId=v('reviewGoodsId').toUpperCase();p.reviewApiModel=v('reviewApiModel').toUpperCase();p.fab=v('fab').split('\n').map(x=>x.split('|').map(s=>s.trim())).filter(xs=>xs.some(Boolean)).map(xs=>({f:xs[0]||'',a:xs[1]||'',b:xs[2]||'',e:xs[3]||'',status:'관리자 입력·검증 필요'}));p.lastEdited=new Date().toISOString().slice(0,10);const file=d.get('photo');if(file?.size){try{p.hero=await compressImage(file)}catch(err){toast('이미지 처리 오류: 다른 파일로 다시 선택해주세요.')}}const customerFiles=[...e.target.querySelector('[name="customerPhotos"]').files].slice(0,6);
if(customerFiles.length){try{const photoData=await Promise.all(customerFiles.map(f=>compressImage(f,1100,.72)));p.gallery=[...(p.gallery||[]),...photoData].slice(-20)}catch(err){toast('고객 사진을 처리하지 못했습니다. 파일을 확인해 주세요.')}}
const title=v('reviewTitle'),body=v('reviewBody');
const revPhotos=[...e.target.querySelector('[name="reviewPhotos"]').files].slice(0,3);
if(title||body||revPhotos.length){
 if(!title||!body){toast('새 후기의 제목과 내용을 모두 입력해 주세요.');return}
 if(d.get('reviewConsent')!=='ok'){toast('새 후기의 출처와 사용 권한을 확인해 주세요.');return}
 let photos=[];try{photos=await Promise.all(revPhotos.map(f=>compressImage(f,850,.65)))}catch(err){toast('후기 사진을 처리하지 못했습니다.');return}
 p.reviews=Array.isArray(p.reviews)?p.reviews:[];
 p.reviews.push({id:'user-'+Date.now(),title,body,author:v('reviewAuthor')||'익명',date:v('reviewDate'),source:v('reviewSource')||'관리자 등록 · 출처 별도 확인',sourceUrl:v('reviewSourceUrl'),status:'관리자 등록 후기 · 권한 확인 완료',photos});
}
save();closeDetail();renderLibrary();renderAdmin();toast('이 기기에 저장했어요. 다른 기기에 옮기려면 JSON 백업이 필요합니다.')}
function compressImage(file,maxSide=1400,quality=.8){return new Promise((resolve,reject)=>{if(file.size>25e6)return reject(Error('파일이 너무 큽니다'));const reader=new FileReader;reader.onload=()=>{const image=new Image;image.onload=()=>{const scale=Math.min(1,maxSide/Math.max(image.width,image.height));const can=document.createElement('canvas');can.width=Math.round(image.width*scale);can.height=Math.round(image.height*scale);can.getContext('2d').drawImage(image,0,0,can.width,can.height);resolve(can.toDataURL('image/jpeg',quality))};image.onerror=reject;image.src=reader.result};reader.onerror=reject;reader.readAsDataURL(file)})}
function backup(){const blob=new Blob([JSON.stringify({version:'0.5.0',updated:new Date().toISOString().slice(0,10),products},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`SK_제품자료실_백업_${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('JSON 백업 파일을 저장했어요.')}
function newProduct(){const id='new'+Date.now();const p={id,category:'정수기',subcategory:'기타',name:'새 제품',model:'모델번호 입력',features:[],attributes:{},fab:[],gallery:[],reviews:[],hero:'',pitch:'',verified:'교육자료 참고·검증 필요',sourceLabel:'사용자 입력',sourceImage:'',officialUrl:'',ebookDetailUrl:'',checkedAt:'',price:null,priceStatus:'미검증·고객노출 금지'};products.push(p);save();renderAdmin();openEdit(id)}
function restoreFile(file){const reader=new FileReader;reader.onload=()=>{try{const obj=JSON.parse(reader.result);if(!Array.isArray(obj.products)||obj.products.some(p=>!p.id||!p.name||!p.model)){throw Error('자료 구조가 맞지 않습니다')}if(!confirm('현재 이 브라우저에서 수정한 제품자료를 불러온 백업 내용으로 교체할까요?'))return;products=obj.products.map(p=>{if(p.id==='mega606'&&!(p.reviews||[]).length){const seed=window.SEED_PRODUCTS.find(s=>s.id==='mega606');return {...p,reviews:deep(seed.reviews)};}return p});compare=[];save();renderLibrary();renderAdmin();toast('백업 파일을 불러왔습니다.') }catch(e){toast('JSON 파일 형식을 확인해 주세요.')}};reader.readAsText(file)}

// Import user-captured reviews from an SK매직 공식몰 browser session (not an automatic API).
function importOfficialReviews(file){
 const reader=new FileReader;
 reader.onload=()=>{
  try{
   const obj=JSON.parse(reader.result);
   if(obj.format!=='skmagic-review-capture/1' || !Array.isArray(obj.reviews) || !/^https:\/\/www\.skmagic\.com\//i.test(obj.sourceUrl||'') || !String(obj.sourceUrl).includes('goodsId=G000069931')){
     throw Error('공식몰 수집기에서 만든 JSON만 불러올 수 있습니다.');
   }
   if(obj.reviews.length===0)throw Error('수집된 후기 카드가 없습니다.');
   if(obj.reviews.length>500)throw Error('한 번에 500건 이하만 처리할 수 있습니다.');
   const p=products.find(p=>p.id==='mega606');if(!p)throw Error('MEGA ICE mini 제품 정보를 찾을 수 없습니다.');
   const rows=obj.reviews.map((r,i)=>{
     const body=String(r.body||'').trim().slice(0,4000);
     if(body.length<3)return null;
     const photos=(Array.isArray(r.photos)?r.photos:[]).filter(u=>typeof u==='string' && /^https:\/\//i.test(u) && !/javascript:|data:/i.test(u)).slice(0,12);
     const id='official-capture-'+hash((obj.sourceUrl||'')+'|'+body.slice(0,400));
     return {id,title:String(r.title||'고객 사용후기').slice(0,130),body,
       author:String(r.author||'공식몰 작성자 미확인').slice(0,80),date:String(r.date||'').slice(0,20),
       source:'SK매직 공식몰 화면에서 직접 수집',sourceUrl:String(obj.sourceUrl||''),
       status:'원본 화면 수집 · 영업 재사용 권한 별도 확인',photos};
   }).filter(Boolean);
   if(!rows.length)throw Error('내용이 있는 후기가 없습니다.');
   const unique=rows.filter(r=>!(p.reviews||[]).some(x=>x.id===r.id));
   const countPhotos=unique.reduce((t,r)=>t+r.photos.length,0);
   if(!confirm(`공식몰 페이지에서 수집된 후기 ${rows.length}건 중 새 후기 ${unique.length}건, 사진 링크 ${countPhotos}개를 추가할까요? 기존 외부 판매처의 요약 후기 3건은 목록에서 교체됩니다.\n\n주의: 실제 고객이 작성한 원문 및 사진의 영업용 재사용 권한은 별도로 확인해야 하며, 사진은 공식몰 서버 연결이 필요합니다.`))return;
   if(!unique.length){toast('이미 가져온 후기들입니다.');return;}
   p.reviews=[...(p.reviews||[]).filter(r=>!String(r.id||'').startsWith('ext606-')),...unique].slice(-500);
   if(!save())return;
   renderLibrary();renderAdmin();openDetail('mega606','media');toast(`공식몰 후기 ${unique.length}건을 추가했습니다.`);
  }catch(e){alert('후기 가져오기 실패: '+e.message);}
 };
 reader.readAsText(file,'utf-8');
}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
// Left navigation can be collapsed on desktop and opened as an overlay on phones.
const SIDEBAR_PREF='sk_smart_sales_sidebar_collapsed_v079';
const layout=$('#appLayout'),sidebarToggle=$('#sidebarToggle'),sidebarClose=$('#sidebarClose'),sidebarScrim=$('#sidebarScrim'),appSidebar=$('#appSidebar');
const mobileSidebar=()=>window.matchMedia('(max-width:900px)').matches;
function syncSidebar(){
 const open=mobileSidebar()?layout.classList.contains('mobile-sidebar-open'):!layout.classList.contains('sidebar-collapsed');
 sidebarToggle.setAttribute('aria-expanded',String(open));
 sidebarToggle.setAttribute('aria-label',open?'왼쪽 메뉴 접기':'왼쪽 메뉴 펼치기');
 sidebarToggle.title=open?'메뉴 접기':'메뉴 펼치기';
 sidebarClose.setAttribute('aria-expanded',String(open));
 appSidebar.inert=!open;
 appSidebar.setAttribute('aria-hidden',String(!open));
 sidebarScrim.setAttribute('aria-hidden',String(!open||!mobileSidebar()));
}
function toggleSidebar(force){
 if(mobileSidebar()){
  const open=force===undefined?!layout.classList.contains('mobile-sidebar-open'):Boolean(force);
  if(!open&&appSidebar.contains(document.activeElement))sidebarToggle.focus();
  layout.classList.toggle('mobile-sidebar-open',open);
 }else{
  const collapsed=force===undefined?!layout.classList.contains('sidebar-collapsed'):!Boolean(force);
  if(collapsed&&appSidebar.contains(document.activeElement))sidebarToggle.focus();
  layout.classList.toggle('sidebar-collapsed',collapsed);
  try{localStorage.setItem(SIDEBAR_PREF,collapsed?'1':'0')}catch(e){}
 }
 syncSidebar();
}
try{layout.classList.toggle('sidebar-collapsed',localStorage.getItem(SIDEBAR_PREF)==='1')}catch(e){}
sidebarToggle.addEventListener('click',()=>toggleSidebar());
sidebarClose.addEventListener('click',()=>toggleSidebar(false));
sidebarScrim.addEventListener('click',()=>toggleSidebar(false));
window.addEventListener('resize',syncSidebar);
syncSidebar();
// Event delegation
window.addEventListener('click',e=>{
const ebookJump=e.target.closest('[data-ebook-detail]');if(ebookJump){e.preventDefault();goOfficialDetail();return;}const ebookImages=e.target.closest('[data-ebook-images]');if(ebookImages){openEbookImageMode();return;}
const switchSize=e.target.closest('[data-mattress-size]');if(switchSize){switchMattressSize(switchSize.dataset.mattressSize);return;}
const yearsButton=e.target.closest('[data-mattress-years]');if(yearsButton){mattressChoice.years=Number(yearsButton.dataset.mattressYears);mattressChoice.management=null;renderDetail();return;}
const cycleButton=e.target.closest('[data-mattress-cycle]');if(cycleButton){mattressChoice.management=cycleButton.dataset.mattressCycle;renderDetail();return;}
const cc=e.target.closest('[data-commission-close]');if(cc){closeCommission();return;}
const pr=e.target.closest('[data-select-price]');if(pr){showCommission(Number(pr.dataset.selectPrice),pr.dataset.priceType);return;}
const lightClose=e.target.closest('[data-lightbox-close]');if(lightClose){closeLightbox();return}
const lightNav=e.target.closest('[data-lightbox-step]');if(lightNav){lightboxStep(Number(lightNav.dataset.lightboxStep));return}
const lightSelect=e.target.closest('[data-lightbox-select]');if(lightSelect&&lightboxState){lightboxState.index=Number(lightSelect.dataset.lightboxSelect);renderLightbox();return}
const productSelect=e.target.closest('[data-product-photo]');if(productSelect){selectProductPhoto(Number(productSelect.dataset.productPhoto));return}
const productOpen=e.target.closest('[data-product-photo-open]');if(productOpen&&detail){openLightbox(productPhotoItems(detail),productGalleryIndex,detail.name+' · 제품 사진');return}
const officialPhoto=e.target.closest('[data-official-photo]');if(officialPhoto&&detail){openLightbox(productPhotoItems(detail),Number(officialPhoto.dataset.officialPhoto),detail.name+' · 공식 제품사진');return}
const officialMedia=e.target.closest('[data-official-media]');if(officialMedia&&detail){openLightbox((detail.officialMedia||[]).map(x=>({src:x.src,title:x.title})),Number(officialMedia.dataset.officialMedia),detail.name+' · 제품 설명 이미지');return}
const reviewPhoto=e.target.closest('[data-review-photo]');if(reviewPhoto){openLightbox(currentReviewImages,Number(reviewPhoto.dataset.reviewPhoto),'실제 고객 포토후기');return}
const nav=e.target.closest('[data-view]');if(nav){navigate(nav.dataset.view);if(mobileSidebar())toggleSidebar(false);return}const go=e.target.closest('[data-view-go]');if(go){navigate(go.dataset.viewGo);return}const c=e.target.closest('[data-cat]');if(c){category=c.dataset.cat;subcat='전체';renderLibrary();return}const sub=e.target.closest('[data-sub]');if(sub){subcat=sub.dataset.sub;renderLibrary();return}const opener=e.target.closest('[data-open]');if(opener){openDetail(opener.dataset.open);return}const tb=e.target.closest('[data-tab]');if(tb){activeTab=tb.dataset.tab==='official'?'spec':tb.dataset.tab;renderDetail();return}const edit=e.target.closest('[data-edit]');if(edit){openEdit(edit.dataset.edit);return}const rsm=e.target.closest('[data-review-source]');if(rsm){reviewSourceMode=rsm.dataset.reviewSource;officialReviewPage=1;renderDetail();return}const orm=e.target.closest('[data-official-review-mode]');if(orm){officialReviewMode=orm.dataset.officialReviewMode;/* 필터 전환 시 현재 페이지 유지: 2페이지에서 사진만 보기 → 2페이지 */renderDetail();return}const rp=e.target.closest('[data-review-page]');if(rp&&!rp.disabled){const action=rp.dataset.reviewPage;const max=Number(document.querySelector('[data-review-page="last"]')?.dataset.max||0);if(action==='first')officialReviewPage=1;else if(action==='prev')officialReviewPage=Math.max(1,officialReviewPage-1);else if(action==='next')officialReviewPage+=1;else if(action==='last'&&max)officialReviewPage=max;loadOfficialReviews(detail,officialReviewPage);return}const retry=e.target.closest('[data-review-retry]');if(retry&&detail){loadOfficialReviews(detail,officialReviewPage);return}const rf=e.target.closest('[data-review-filter]');if(rf){reviewFilter=rf.dataset.reviewFilter;const s=$('.detail-section');if(s&&detail)s.innerHTML=renderTab(detail);return}
const rr=e.target.closest('[data-review-remove]');if(rr){const pp=products.find(x=>x.id===rr.dataset.reviewProduct);const ix=Number(rr.dataset.reviewRemove);if(pp&&confirm('이 후기를 삭제할까요? 입력 중인 다른 수정 내용은 저장되지 않습니다.')){pp.reviews.splice(ix,1);save();openEdit(pp.id);toast('후기를 삭제했어요.')}return}
const gr=e.target.closest('[data-gallery-remove]');if(gr){const pp=products.find(x=>x.id===gr.dataset.galleryProduct);const ix=Number(gr.dataset.galleryRemove);if(pp&&confirm('이 고객 사진을 삭제할까요? 입력 중인 다른 수정 내용은 저장되지 않습니다.')){pp.gallery.splice(ix,1);save();openEdit(pp.id);toast('고객 사진을 삭제했어요.')}return}const rm=e.target.closest('[data-remove]');if(rm){compare=compare.filter(x=>x!==rm.dataset.remove);$('#compareCount').textContent=compare.length;renderCompare();return}const dc=e.target.closest('[data-detail-compare]');if(dc){addOrRemoveCompare(dc.dataset.detailCompare);renderDetail();return}});
window.addEventListener('toggle',e=>{if(e.target?.matches?.('.ebook-embedded-optional')&&e.target.open){const f=e.target.querySelector('iframe[data-ebook-frame]');if(f&&!f.src)f.src=f.dataset.ebookFrame;}},true);
window.addEventListener('change',e=>{if(e.target.matches('[data-check]'))cmpCheck(e.target.dataset.check,e.target.checked);if(e.target.matches('[data-price-month]')){selectedMonth=e.target.value;try{localStorage.setItem(PRICE_MONTH_KEY,selectedMonth)}catch(err){}renderMonthSelect();renderDetail();}});
// 태블릿 손가락 넘김(좌우 스와이프) 지원
let lightboxTouchStartX=null;
const lbStage=$('#imageLightbox .image-lightbox-stage');
lbStage.addEventListener('touchstart',e=>{if(e.touches.length===1)lightboxTouchStartX=e.touches[0].clientX},{passive:true});
lbStage.addEventListener('touchend',e=>{
  if(lightboxTouchStartX===null||!lightboxState)return;
  const dx=e.changedTouches[0].clientX-lightboxTouchStartX;
  lightboxTouchStartX=null;
  if(Math.abs(dx)>55)lightboxStep(dx>0?-1:1);
},{passive:true});
$('#searchInput').addEventListener('input',e=>{query=e.target.value.trim();renderLibrary()});$('#closeDetail').onclick=closeDetail;$('#closeBackdrop').onclick=closeDetail;window.addEventListener('keydown',e=>{if(lightboxState){if(e.key==='Escape'){closeLightbox();return}if(e.key==='ArrowLeft'){e.preventDefault();lightboxStep(-1);return}if(e.key==='ArrowRight'){e.preventDefault();lightboxStep(1);return}}else if(e.key==='Escape'){if(layout.classList.contains('mobile-sidebar-open'))toggleSidebar(false);else closeDetail()}});$('#resetView').onclick=()=>{query='';category='전체';subcat='전체';$('#searchInput').value='';navigate('library');renderLibrary()};$('#addProduct').onclick=newProduct;$('#exportJSON').onclick=backup;$('#importJSON').onclick=()=>$('#jsonFile').click();$('#jsonFile').onchange=e=>{if(e.target.files[0])restoreFile(e.target.files[0]);e.target.value=''};
renderLibrary();

renderMonthSelect();
updatePriceFeedStatus();
$('#globalMonth')?.addEventListener('change',e=>{
 selectedMonth=e.target.value;
 try{localStorage.setItem(PRICE_MONTH_KEY,selectedMonth)}catch(err){}
 renderMonthSelect();
 if(detail&&activeTab==='price')renderDetail();
 if(view==='compare')renderCompare();
 renderDashboard();
 toast(selectedMonth.replace('-', '년 ')+'월 가격표로 전환했습니다.');
});
function updatePriceFeedStatus(){
 const el=$('#priceFeedStatus');if(!el)return;
 if(Object.keys(REMOTE_ARCHIVE).length){
  el.textContent='가격·정책 자료: 기존 SK매직 제품정보 앱과 월별 데이터 공유 · 기준월 선택 가능';
 }else if(window.SK_PRICE_REMOTE_ERROR){
  el.textContent='기준 앱 연결 실패 · 현재는 내장 2026년 11월 참고 가격만 사용 중';
 }else{
  el.textContent='SK매직 제품정보 앱 월별 자료를 확인하는 중…';
 }
}
// Shared monthly pricing archive from the existing SK Magic product-info app.
// This independent script can finish after UI render. Reuse one monthly source and refresh views.
window.addEventListener('sk-remote-pricing-ready',()=>{
 const archive=window.SK_MONTH_ARCHIVE||{};
 for(const key of Object.keys(REMOTE_ARCHIVE))delete REMOTE_ARCHIVE[key];
 Object.assign(REMOTE_ARCHIVE,archive);
 window.SK_PRICE_REMOTE_ERROR=false;
 updatePriceFeedStatus();
 renderMonthSelect();
 if(detail&&activeTab==='price')renderDetail();
 if(view==='compare')renderCompare();
 if(view==='dashboard')renderDashboard();
});
window.addEventListener('sk-remote-pricing-error',()=>{
 updatePriceFeedStatus();
 if(detail&&activeTab==='price')renderDetail();
});

$('#commissionLayer')?.addEventListener('input',e=>{if(e.target.matches('input'))calcCommission();});
})();
