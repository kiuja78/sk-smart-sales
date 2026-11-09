/* Original image-based subdetails from the corresponding NAMUHX pages.
   These do not embed whole storefronts, and are displayed in-app. */
(function(){
'use strict';
const sources={
  "filter": [
    {
      "src": "https://www.namuhx.com/product/detail/all-in-1-filter/section_01.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "두 개의 필터로, 단계별로 촘촘하게 — 프리필터(알레르겐 10종·굵은 먼지·반려동물의 털) + 올인원필터(펫 악취·새집 증후군·매연 속 유해가스), 2중 필터로 전체 28종 유해요소 99% 제거"
    },
    {
      "src": "https://www.namuhx.com/product/detail/all-in-1-filter/section_02.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "알레르겐 10종을 먼저 걸러냅니다(8종 99.9% 불활성화) — UV 살균으로 세균·바이러스까지 99.9% 제거(부유 세균 8종·바이러스 2종·곰팡이)"
    },
    {
      "src": "https://www.namuhx.com/product/detail/all-in-1-filter/section_03.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "새집증후군 유발물질부터 생활 냄새까지 제거 — 유해가스 6종 99% 이상 흡착, 누적 정화량 1.62배. 0.01μm 초미세 입자까지 99.999% 제거, 오염물질 28종"
    },
    {
      "src": "https://www.namuhx.com/product/detail/all-in-1-filter/section_04.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "편안한 관리 — 하이나무 앱이 두 개 필터 각각의 사용량을 보고 교체 시점을 알립니다. 프리필터 권장 교체주기 4개월, 올인원필터 12개월"
    },
    {
      "src": "https://www.namuhx.com/product/detail/all-in-1-filter/section_05.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "하이나무 앱 필터 사용량 알림과 자가 관리 방법 — Step 01 전원/커버, Step 02 분리, Step 03 장착, Step 04 완료"
    }
  ],
  "sensor": [
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/intro.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "에어센서 — 실시간 공기질 감지, 오염 감지 시 A1 자동 호출, 간편한 공기질 모니터링, 미려한 디자인"
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/s01_realtime_1.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "01 실시간 공기질 감지 — 실시간으로 공기질과 유해물질을 동시에 감지하여 LED로 공기의 상태를 보여줍니다"
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/s01_realtime_2.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "통합 공기질에 따른 LED 표시(좋음·보통·나쁨·매우 나쁨), 유해물질에 따른 LED 표시(포름알데히드·이산화탄소), LED 표시 우선 순위 안내"
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/s01_harmful_toggle.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "유해물질이란? 자세히 보기"
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/s01_tail.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": ""
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/s02_auto_call_1.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "02 오염 감지 시 A1 자동 호출 — 공기질이 나빠지면 에어센서가 자동으로 A1을 부르고 좋아지면 스스로 돌아갑니다. Step 01 오염감지, Step 02 나무엑스 A1 호출"
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/s02_auto_call_2.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "Step 03 공기 청정 실시, Step 04 공기질 양호 시 복귀 — 자동호출·수동호출 안내"
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/s03_monitoring.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "03 간편한 공기질 모니터링 — 하이나무(Hi NAMUH) 앱을 이용하여 실시간으로 공기질을 확인할 수 있습니다"
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/carousel_title_01.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "위치별 공기질 제공 — 에어센서를 놓은 공간마다 지금 상태를 확인합니다"
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/carousel_title_02.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": ""
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/carousel_title_03.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": ""
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/carousel_title_04.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": ""
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/carousel_screen_01.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "하이나무 앱 — 위치별 실시간 공기질 화면"
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/carousel_screen_02.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": ""
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/carousel_screen_03.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": ""
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/carousel_screen_04.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": ""
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/carousel_phone_frame.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": ""
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/s04_design_1.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "04 미려한 디자인 — 달항아리 작품의 곡선을 담은, 모든 공간에 스며드는 디자인 (달항아리 모티브 · 최영욱 작가 협업)"
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/s04_design_2.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "두 가지 색상(밤 그레이·던 화이트)과 두 가지 유형(유선 방식·무선 방식 배터리 내장) 안내"
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/s05_spec_1.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "05 제품 규격 — 제품 사양: 무선(SEN-SAWL1) 어댑터+배터리 14,000mAh 520g, 유선(SEN-SAWR1) 어댑터 DC 5V 3A 290g, 크기 94×94mm"
    },
    {
      "src": "https://www.namuhx.com/product/detail/air-sensor/s05_spec_2.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "센서 사양 — 먼지·가스·질소산화물·이산화탄소·포름알데히드·온습도 센서, 참고 및 유의사항"
    }
  ],
  "care": [
    {
      "src": "https://www.namuhx.com/_next/static/media/s01.335xluw8-upv2.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "NAMUHX Safe Care & Live View — 집을 비워도, 곁에 있는 것처럼"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s02.1vxbko5t273xv.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "스스로 이동하여 살피고, 실시간으로 알려 주고, 긴급 대응까지 든든한 안심을 제공합니다(에스원 긴급출동은 세이프 케어 플러스에서만 제공). 01 자율 및 수동 이동하며 실내 감시 및 감지 — 주기적으로 실내를 이동하며 감시, 하이나무 앱의 조이스틱 기능으로 A1을 특정 위치로 이동시켜 감시 가능"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s03.2njr9_7b28gt1.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "02 이상 상황 및 출입자 감지 알림 — 움직임을 감지하면 A1에 등록된 사람인지 자동으로 식별, 등록되지 않은 사람인 경우 하이나무 앱으로 보안 알림 발송"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s04.0hobxdeu14f7p.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "03 영상과 소리로 실시간 실내 상황 확인 — 하이나무 앱으로 A1이 수집하는 영상과 소리를 실시간으로 확인, 필요한 경우 A1을 원격 조정하여 보다 자세한 상황 확인"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s05.1qjl7pari98a_.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "04 필요 시 에스원 보안요원 긴급 출동 요청(세이프 케어 플러스) — 에스원에 긴급출동을 요청하면 보안 요원이 현장으로 출동, 상황에 따라 112·119와 연결"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s06.3hrmqpj9nv9u5.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "도난 및 화재 발생 시 에스원 안심 보상서비스 제공(세이프 케어 플러스) — 최대 도난 보상 1,500만원, 화재 보상 5,000만원. 라이브 뷰는 A1 구독 시 무료로 제공되며 세이프 케어 베이직과 플러스는 유료 서비스입니다"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s07.0zg7_ii95-ht3.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "확인하고 싶은 순간, 애태우지 마세요 — 1인 가구 비율 36.1%, 맞벌이 가구 비율 48.6%, 연간 주거침입 발생 18,894건. 노약자·아이·반려동물 케어, 보안 사각지대 해소, 외출 중 이상 상황 확인, 긴급 대응 및 보상까지"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s08.16dfc54uvaemt.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "라이브 뷰 — 사각지대 없는 확인과 실시간 소통 가능. 실내 공간 어디든 직접 이동: 하이나무 앱에서 조이스틱 기능으로 A1을 원격으로 원하는 장소로 이동"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s09.0quulv3vda-7b.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "실시간 원격 모니터링 — A1의 카메라가 보고 있는 상황을 실시간으로 하이나무 앱에서 동일하게 볼 수 있습니다"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s10.057oz_9_j9btv.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "양방향 대화 지원 — 집 안에 혼자 있는 반려견, 아이, 어르신을 영상으로 확인하고 양방향 대화가 가능합니다. 실시간 영상 녹화 및 캡처"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s11.077vgwino_n1l.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "라이브 뷰 기능은 하이나무 앱을 켰을 때만 사용 가능합니다."
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s12.1mfokj2eqfkgz.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "세이프 케어 — 자율적인 감시와 감지부터 보상까지 원스톱 케어"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s13.3qcpwj2bzkdzh.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "전체 공간에 대한 주기적인 자동 순찰 — 순찰 위치와 경로, 순찰 주기를 설정할 수 있습니다. 순찰 주기는 최소 1시간에서 12시간까지(1시간 단위) 설정 가능"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s14.03vdleku204qf.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "보안모드 순찰 — 거점을 시작으로 설정된 공간을 순찰하고 복귀 후 보안모드 유지, 한 공간 집중 순찰, 전체 공간 순찰"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s15.0wmpmh2_zxwi7.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "객체·움직임 이상 상황 실시간 감지 — 움직임이 감지되면 AI로 구분·인식하고, 사전에 등록된 얼굴 데이터로 외부인 여부를 식별합니다"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s16.13ncxtoro54ux.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "이상 상황 발생 시 앱 즉시 알림 — 식별 불가 및 비식별 등 이상 상황이 확인되면 하이나무 앱에서 알림이 울립니다"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s17.1xmmk3fyif2_d.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "감지 시점 영상으로 현장 상황 파악 — 영상은 감지된 시점을 기준으로 이전 5초부터 이후 10초까지 전체 15초 분량입니다"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s18.26nw2ya94ays-.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "에스원 긴급출동 요청 및 추가 대응 — 긴급 상황으로 판단될 경우 에스원의 보안요원에게 긴급 출동을 요청할 수 있고, 112·119로 통화할 수 있는 긴급 버튼이 노출됩니다"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s19.2ekgdtllr6p7y.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "에스원 긴급출동 — 실시간 현장 상황 확인(영상·소리) → 에스원에 긴급 출동 요청 → 에스원 관제센터에서 상황파악 및 출동 지시 → 보안요원 현장으로 긴급 출동 및 상황 대응. 긴급출동 접수는 월 1회 무료로 제공되며, 월 1회를 초과하거나 긴급 상황이 아닌 접수로 출동요원이 배정된 경우 회당 35,000원의 출동비를 부담합니다. 사전에 에스원 계정 등록 및 연동이 필요합니다"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s20.07f1tsz4m5aeh.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "에스원 안심보상 — 화재보상 최대 5,000만 원(가구당 총 1회 한도/년), 도난·파손 보상 최대 1,500만 원(가구당 총 1회 한도/년)"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s21.0561mseit2ct1.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "에스원 긴급출동은 세이프 케어 플러스 구독 시에만 제공됩니다."
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s22.1pamay-r_1vwg.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "기능 비교"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s23.0fmkw8q9qs-rc.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "기능 비교표 — 라이브 뷰(무료) / 세이프 케어 베이직(월 4,900원) / 플러스(월 12,900원). 실시간 확인·자동 감지·긴급 대응·사후 보상 항목별 제공 여부"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s24.4449bs88412zm.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "서비스 신청 방법 — Step 01 구독 내용 확인, Step 02 전화상담 신청, Step 03 전문상담사 상담, Step 04 서비스 신청 완료"
    },
    {
      "src": "https://www.namuhx.com/_next/static/media/s25.27aaoztwp5o6t.webp?dpl=16dd0194f90642488507d7f9045b55c183249b2c",
      "alt": "서비스 이용 유의사항 — 긴급출동은 사전에 플러스 구독과 에스원 계정 연동이 완료된 경우에만 이용 가능합니다. 감지된 영상은 일정 기간 경과 후 자동 삭제되며 복구가 불가능합니다. 어두운 환경·역광에서는 객체 인식률이 저하될 수 있고 3m 이상 거리에서는 얼굴 식별이 어려울 수 있습니다. 객체 인식 기능은 보안을 위한 보조 수단이며 감지 누락·알림·출동 지연으로 인한 손해는 책임 범위에서 제외됩니다. 세이프 케어·라이브 뷰 활성화 중에는 하이나무 음성인식 기능이 자동으로 꺼집니다. 라이브 뷰 원격제어 시 네트워크 지연으로 주행 반응이 늦어질 수 있습니다. 맵핑이 완료되지 않은 상태에서는 일부 서비스가 제한될 수 있습니다"
    }
  ]
};
const defs={
 filter:{title:'올인원 필터',url:'https://www.namuhx.com/store/all-in-1-filter'},
 sensor:{title:'에어센서',url:'https://www.namuhx.com/air-sensor'},
 care:{title:'세이프 케어',url:'https://www.namuhx.com/subscription/safe-care'}
};
function safe(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function openDetail(which){
 const info=defs[which],pictures=sources[which];
 if(!info||!pictures?.length)return;
 const existing=document.getElementById('nhx-subdetail-dialog');if(existing)existing.remove();
 if(!document.getElementById('nhx-subdetail-css')){
   const style=document.createElement('style');style.id='nhx-subdetail-css';
   style.textContent=`
     #nhx-subdetail-dialog{position:fixed;inset:0;margin:auto;width:min(960px,calc(100vw - 20px));height:min(92dvh,980px);max-height:none;max-width:none;padding:0;border:0;border-radius:15px;overflow:hidden;background:#fff;color:#213b4b;box-shadow:0 30px 110px #0009}
     #nhx-subdetail-dialog::backdrop{background:rgba(4,11,24,.77)}
     #nhx-subdetail-dialog .nhx-subhead{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:64px;padding:12px 18px;border-bottom:1px solid #e2e8ee}
     #nhx-subdetail-dialog .nhx-subhead strong{font-size:18px;color:#102a3b}
     #nhx-subdetail-dialog .nhx-subactions{display:flex;align-items:center;gap:8px}
     #nhx-subdetail-dialog .nhx-subactions a,#nhx-subdetail-dialog .nhx-subactions button{display:inline-flex;align-items:center;justify-content:center;font:700 13px/1.4 inherit;color:#183d49;padding:9px 11px;border-radius:8px;border:1px solid #d6e5e9;background:#eef5f6;text-decoration:none;cursor:pointer}
     #nhx-subdetail-dialog .nhx-subactions button{font-size:20px;min-width:38px}
     #nhx-subdetail-dialog .nhx-subbody{height:calc(100% - 65px);overflow-y:auto;overscroll-behavior:contain;background:white}
     #nhx-subdetail-dialog .nhx-subbody img{display:block;width:100%;height:auto;max-width:100%;margin:0;border:0}
     #nhx-subdetail-dialog .nhx-note{padding:12px 18px;text-align:center;font-size:12px;color:#6a7988}
     @media(max-width:600px){#nhx-subdetail-dialog{width:100vw;height:100dvh;border-radius:0}#nhx-subdetail-dialog .nhx-subactions a{font-size:11px;padding:8px}}
   `;document.head.appendChild(style);
 }
 const modal=document.createElement('dialog');modal.id='nhx-subdetail-dialog';
 const imgs=pictures.map((p,i)=>'<img src="'+safe(p.src)+'" alt="'+safe(p.alt||info.title+' 공식 상세 이미지')+'" loading="'+(i<2?'eager':'lazy')+'" decoding="async">').join('');
 modal.innerHTML='<header class="nhx-subhead"><strong>'+safe(info.title)+' · 상세정보</strong><div class="nhx-subactions"><a href="'+info.url+'" target="_blank" rel="noopener noreferrer">원본 열기 ↗</a><button type="button" data-nhx-close aria-label="상세 닫기">×</button></div></header><div class="nhx-subbody">'+imgs+'<div class="nhx-note">나무엑스 공식 제품 상세 이미지를 표시합니다.</div></div>';
 document.body.appendChild(modal);
 const close=()=>modal.close();
 modal.querySelector('[data-nhx-close]').addEventListener('click',close);
 modal.addEventListener('click',event=>{if(event.target===modal)close()});
 modal.addEventListener('close',()=>modal.remove(),{once:true});
 if(modal.showModal)modal.showModal();else modal.setAttribute('open','');
}
window.NAMUHX_SUBDETAIL={open:openDetail,available:Object.keys(sources)};
})();
