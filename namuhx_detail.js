/* 나무엑스 A1 공식 제품 소개의 핵심 정보만 별도 화면으로 구성합니다.
   제품사진은 저장소에 이미 검증되어 등록된 원본 URL을 사용하며 AI 생성 이미지는 사용하지 않습니다.
   출처: https://www.namuhx.com/a1 */
(() => {
'use strict';
const original='https://www.namuhx.com/a1';
const sections=[
 {title:'에어솔루션 · 자율주행 이동 청정',subtitle:'오염된 공간을 스스로 찾아가는 공기청정',body:'공기질 변화를 인지하면 이동 경로를 판단해 필요한 공간으로 이동하고, 청정을 마친 뒤 충전 스테이션으로 돌아갑니다. 집 안의 여러 공간을 한 대로 관리하도록 설계되었습니다.',points:['실시간 공기질 확인 및 오염 인지','자율이동 · 청정 · 스테이션 복귀','이동청정 / 고정청정 / 스캐닝 / All Time 청정 모드'],note:'일부 감지 및 청정 모드는 별도 구매하는 에어센서가 필요합니다.'},
 {title:'세이프 케어',subtitle:'집 안의 상태를 살펴보는 안전 관리',body:'설정한 공간을 순찰하며 움직임을 감지하고, 알림을 통해 외부에서도 실내 상황을 살필 수 있습니다.',points:['공간 순찰과 움직임 감지','알림 기반 실내 상황 확인','선택한 서비스에 따라 에스원 긴급출동 연계'],note:'세이프 케어는 유료 구독 서비스이며 긴급출동은 별도 플러스 서비스 조건에 따릅니다.'},
 {title:'라이브 뷰',subtitle:'보고 싶은 위치로 이동해 실내를 확인',body:'로봇이 원하는 위치로 이동해 집 안을 실시간으로 보여줍니다. 양방향 대화와 사진 캡처, 영상 녹화 기능을 지원합니다.',points:['원하는 위치로 이동','실시간 영상 확인','양방향 대화 · 녹화 · 캡처']},
 {title:'바이탈사인 체크',subtitle:'비접촉 방식의 간편한 건강 신호 확인',body:'제품 전면의 카메라와 센서를 이용해 약 10초 동안 다섯 가지 생체 신호를 측정하도록 설계되었습니다. 개인별 기록은 하이나무 앱과 연계해 확인합니다.',points:['별도 장비 부착 없이 비접촉 측정','약 10초 내 5가지 생체 신호 확인','하이나무 앱의 개인별 기록 관리'],note:'의료기기나 질병 진단 기능이 아니며 측정 결과는 웰니스 참고용입니다.'},
 {title:'마이 헬스케어',subtitle:'나의 건강 기록을 활용한 안내',body:'하이나무 앱을 통해 개인 기록을 바탕으로 생활 속 건강 관리와 관련된 정보를 확인하고 상담형 기능을 이용할 수 있습니다.',points:['개인별 건강 기록 활용','생활 관리 정보 안내']},
 {title:'지능형 AI 음성 대화',subtitle:'말로 제어하고 일상의 질문을 나누는 AI',body:'기기 제어에는 네트워크 연결 없이 동작하는 온디바이스 음성 인식을 활용하며, 대화와 정보 탐색에는 Gemini 기반 AI 기능을 활용합니다.',points:['음성으로 공기청정 등 기기 제어','일상 질문 · 정보 탐색 · 자연어 대화','기기 제어와 클라우드 대화 기능의 구분']},
 {title:'팔로우미',subtitle:'말 한마디로 따라오는 이동 청정',body:'음성 명령을 통해 사용자를 따라 이동하거나 정지할 수 있어, 로봇을 직접 옮기지 않고 필요한 공간으로 이동시키는 데 도움이 됩니다.',points:['“하이나무, 나를 따라와” 호출','음성 명령으로 정지']},
 {title:'AI 컴패니언',subtitle:'일상의 시간을 함께하는 생활 케어',body:'알림과 일상 루틴을 보조하는 기능으로 복약 시간 안내, 웨이크업, 웰컴, 릴랙스 등을 제공합니다.',points:['복약 시간 알림','웨이크업 · 웰컴','릴랙스 등 일상 편의 기능']},
 {title:'개인정보 및 보안',subtitle:'기기 내 처리와 단계별 보호',body:'제품은 정보 보호를 위한 온디바이스 처리, 정보 비식별화 및 전송 보호 등을 강조합니다. 상세 처리 범위와 인증 정보는 공식 페이지에서 확인할 수 있습니다.',points:['기기 내 데이터 처리 원칙','민감정보 보호 및 보안 설계']}
];
const specs=[['모델 코드','WRBA1M10KRNG / WRBA1M10KRDW'],['제품 색상','Night Gray / Dawn White'],['제품 크기','376 × 376 × 650~753mm'],['무게','14kg'],['표준 사용면적','66.0㎡ (20평형)'],['소비전력','156W'],['배터리','18.2V · 9.4Ah'],['충전 시간','급속 150분 / 완속 240분'],['충전 스테이션','318 × 238 × 113mm / 2.5kg']];
const css=`
.nhx-info{background:#fff;color:#192b40;border-radius:16px;overflow:hidden;font-family:inherit}
.nhx-info *{box-sizing:border-box}.nhx-info .nhx-hero{padding:clamp(22px,5vw,60px);background:linear-gradient(140deg,#071c31,#183955);color:#fff}
.nhx-info .nhx-tag{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#9cd7d0;font-weight:800}
.nhx-info .nhx-hero h2{font-size:clamp(30px,6vw,55px);line-height:1.17;margin:14px 0 12px;color:#fff}
.nhx-info .nhx-hero p{font-size:clamp(14px,2vw,18px);line-height:1.8;color:#e3f0fa;max-width:690px}
.nhx-info .nhx-hero img{display:block;width:auto;max-width:min(100%,540px);max-height:590px;object-fit:contain;margin:25px auto 0}
.nhx-info .nhx-section{padding:clamp(22px,4vw,42px);border-bottom:1px solid #e5ecf1}
.nhx-info .nhx-section:nth-of-type(2n+1){background:#f3f8fa}
.nhx-info .nhx-section h3{font-size:clamp(22px,3.5vw,30px);line-height:1.35;color:#102f45;margin:0 0 8px}
.nhx-info .nhx-section h4{font-size:16px;font-weight:650;color:#268387;margin:0 0 13px}
.nhx-info .nhx-section p{font-size:15px;line-height:1.9;margin:8px 0 14px;color:#344b60}
.nhx-info .nhx-section ul{margin:13px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:9px;list-style:none}
.nhx-info .nhx-section li{padding:12px 14px;border-radius:10px;background:#e8f1f4;color:#23485b;line-height:1.65;font-size:14px}
.nhx-info .nhx-note{font-size:12px!important;color:#6b7681!important;margin-top:18px!important}
.nhx-info .nhx-specgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.nhx-info .nhx-specgrid div{background:#edf3f6;padding:15px;border-radius:12px}
.nhx-info .nhx-specgrid small{display:block;color:#526b7c;margin-bottom:6px}.nhx-info .nhx-specgrid strong{font-size:14px;line-height:1.5}
.nhx-info .nhx-bottom{text-align:center;padding:22px;background:#e8f5f3;font-size:13px;line-height:1.7}
.nhx-info .nhx-bottom a{display:inline-block;margin:12px auto 0;padding:10px 16px;background:#0e5260;color:#fff;border-radius:9px;font-weight:700;text-decoration:none}
`;
function render(p={}){
 const photo='https://godomall-storage.cdn-nhncommerce.com/666491d955848ac771719e187e418aef/goods/1000000017/image/detail/1000000017_detail_024.png';
 return `<style>${css}</style><article class="nhx-info" aria-label="나무엑스 A1 제품 상세정보">
  <div class="nhx-hero"><span class="nhx-tag">Wellness Robotics · NAMUHX</span><h2>나무엑스 A1</h2><p>공기청정부터 안전·건강 관리까지 일상에 필요한 순간을 찾아가는 웰니스 로봇</p><img src="${photo}" alt="나무엑스 A1 공식 등록 제품 사진" loading="eager"></div>
  ${sections.map((s,i)=>`<section class="nhx-section"><span class="nhx-tag" style="color:#308887">A1 FEATURE ${String(i+1).padStart(2,'0')}</span><h3>${s.title}</h3><h4>${s.subtitle}</h4><p>${s.body}</p><ul>${s.points.map(x=>`<li>${x}</li>`).join('')}</ul>${s.note?`<p class="nhx-note">※ ${s.note}</p>`:''}</section>`).join('')}
  <section class="nhx-section"><h3>제품 규격</h3><div class="nhx-specgrid">${specs.map(([k,v])=>`<div><small>${k}</small><strong>${v}</strong></div>`).join('')}</div></section>
  <footer class="nhx-bottom">공식 사이트의 제품 소개를 상담용으로 재구성한 자료입니다. 제조사 상세 이미지 전체 복제본은 아니며, 최신 사양과 서비스 조건은 원본을 확인하세요.<div><a href="${original}" target="_blank" rel="noopener noreferrer">나무엑스 A1 공식 원본 페이지 열기 ↗</a></div></footer>
 </article>`;
}
window.NAMUHX_DETAIL={render};
})();
