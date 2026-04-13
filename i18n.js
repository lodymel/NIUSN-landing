/**
 * UI strings: ko / en / zh-Hans / zh-Hant
 * Proxima Nova는 Adobe Fonts 키트 연동 시 로드 (index.html 주석 참고).
 */
(function () {
  const STORAGE_KEY = "niusn-lang";

  const LANG_MENU = [
    { code: "en", label: "English" },
    { code: "ko", label: "한국어" },
    { code: "zh-Hans", label: "简体中文" },
    { code: "zh-Hant", label: "繁體中文" },
  ];

  const STRINGS = {
    ko: {
      "doc.title": "NIUSN · Hong Kong Comic Con 2026",
      "lang.label": "언어",
      "lang.triggerAria": "언어 선택",
      skip: "본문으로 건너뛰기",
      "logo.aria": "NIUSN: 페이지 상단으로",
      "nav.label": "주요 메뉴",
      "nav.menu": "메뉴",
      "nav.event": "Hong Kong Comic Con 2026",
      "nav.schedule": "스케줄",
      "nav.prizes": "상품 · 경품",
      "nav.whatWeDo": "What We Do",
      "nav.product": "Product · Technology",
      "nav.contact": "Contact",
      "sound.off": "OFF",
      "sound.on": "ON",
      "sound.toggleAria": "배경 사운드와 히어로 영상 오디오 켜기/끄기",
      "page.title": "Hong Kong Comic Con",
      "page.year": "2026",
      "hero.panel": "보조 패널",
      "hero.countdownEyebrow": "개막까지",
      "hero.playAria": "재생 (와이어프레임)",
      "hero.posterLabel": "메인 포스터 또는 하이라이트 영상",
      "hero.quickLinks": "바로가기",
      "hero.boothMap": "부스 도면",
      "schedule.title": "스케줄",
      "schedule.type": "유형",
      "schedule.time": "시간",
      "schedule.titleCol": "제목",
      "schedule.place": "장소",
      "schedule.booth": "부스",
      "schedule.tabListAria": "일정 탭 · 자주 묻는 질문",
      "schedule.tabFaqs": "FAQs",
      "schedule.day1Num": "DAY 01",
      "schedule.day1Date": "2026년 5월 29일 (금) · 현장",
      "schedule.s1time": "09:00",
      "schedule.s1title": "등록 · 입장",
      "schedule.s1meta": "메인 로비 · HKCEC",
      "schedule.s2time": "10:00",
      "schedule.s2title": "오프닝 세레모니",
      "schedule.s2meta": "메인 홀 · 미정",
      "schedule.s3time": "12:30",
      "schedule.s3title": "점심 · 휴식",
      "schedule.s3meta": "자유 · TBC",
      "schedule.day2Num": "DAY 02",
      "schedule.day2Date": "2026년 5월 30일 (토)",
      "schedule.s4time": "10:00",
      "schedule.s4title": "패널 · 쇼케이스",
      "schedule.s4meta": "엑스포 플로어 · TBC",
      "schedule.s5time": "15:00",
      "schedule.s5title": "커뮤니티 밋업",
      "schedule.s5meta": "부스 존 · TBC",
      "schedule.day3Num": "DAY 03",
      "schedule.day3Date": "2026년 5월 31일 (일) · TBC",
      "schedule.s6time": "10:00",
      "schedule.s6title": "클로징 · 시상",
      "schedule.s6meta": "메인 홀 · TBC",
      "schedule.s7time": "16:00",
      "schedule.s7title": "전시 종료 · 퇴장",
      "schedule.s7meta": "HKCEC · TBC",
      "schedule.faqLead": "자주 묻는 질문 · 행사 전 공지 예정",
      "schedule.faqQ1": "티켓은 어디서 구매하나요?",
      "schedule.faqA1": "공식 채널 안내 전까지 TBC입니다.",
      "schedule.faqQ2": "현장 등록이 있나요?",
      "schedule.faqA2": "일정에 맞춰 공지 예정입니다.",
      "schedule.faqQ3": "NIUSN 부스는 어디인가요?",
      "schedule.faqA3": "도면 확정 후 이 페이지에 반영됩니다.",
      "booth.label": "부스",
      "prizes.title": "상품 · 경품",
      "prizes.cta": "CTA · 미정",
      "prizes.listTitle": "리스트 제목",
      "wwd.summary":
        "NIUSN은 단순한 콘텐츠 제작사를 넘어, 기술로 교육의 미래를 다시 정의합니다. AI로 구동되는 세계 수준의 애니메이션을 제작하며, 그 어느 때에도 본 적 없는 새로운 교육의 기준을 세우고 있습니다.",
      "wwd.displayPrimaryHtml":
        '<span class="wwd-line"><span class="word">NIUSN은</span></span><span class="wwd-line"><span class="word">콘텐츠 제작을 넘어서</span></span><span class="wwd-line"><span class="word">기술로 교육의 미래를</span></span><span class="wwd-line"><span class="word">다시 정의합니다</span></span>',
      "wwd.displaySecondaryHtml":
        '<span class="wwd-line"><span class="word wwd-accent">AI</span><span class="word">로 구동되는</span></span><span class="wwd-line"><span class="word">세계 수준의 애니메이션으로</span></span><span class="wwd-line"><span class="word">새로운 교육의 기준을</span></span><span class="wwd-line"><span class="word">세우고 있습니다</span></span>',
      "product.works": "작품 · 시리즈",
      "contact.lede1": "행사·제휴·문의가 있으신가요?",
      "contact.lede2": "남겨 주시면 빠르게 연락드릴게요.",
      "contact.sectionTag": "Contact",
      "contact.head1": "함께",
      "contact.head2": "연결해요",
      "contact.head3": "NIUSN",
      "contact.submitCta": "프로젝트 이야기",
      "contact.name": "이름",
      "contact.email": "이메일",
      "contact.message": "메시지",
      "contact.phName": "이름",
      "contact.phEmail": "이메일",
      "contact.phMessage": "메시지",
      "contact.submit": "전송",
      "scrollTopFab.aria": "맨 위로",
      "footer.snsNavAria": "SNS 링크",
      "footer.marqueeAria": "NIUSN · AI 애니메이션 스튜디오 · Hong Kong Comic Con 2026 · 장소",
      "footer.marqueeTagline": "AI 기반 애니메이션 스튜디오",
      "footer.marqueeEvent": "Hong Kong Comic Con 2026",
      "footer.marqueeVenue": "Hong Kong Convention and Exhibition Centre",
      "footer.copyright": "© 2026 NIUSN Corp. All rights reserved.",
      "dialog.close": "닫기",
      "dialog.boothEyebrow": "부스 도면",
      "dialog.mapAria": "부스 맵 플레이스홀더",
      "dialog.placeholder": "에셋 연결 전",
    },
    en: {
      "doc.title": "NIUSN · Hong Kong Comic Con 2026",
      "lang.label": "Language",
      "lang.triggerAria": "Choose language",
      skip: "Skip to main content",
      "logo.aria": "NIUSN: back to top",
      "nav.label": "Main menu",
      "nav.menu": "Menu",
      "nav.event": "Hong Kong Comic Con 2026",
      "nav.schedule": "Schedule",
      "nav.prizes": "Prizes",
      "nav.whatWeDo": "What We Do",
      "nav.product": "Product · Technology",
      "nav.contact": "Contact",
      "sound.off": "OFF",
      "sound.on": "ON",
      "sound.toggleAria": "Toggle background sound and hero video audio",
      "page.title": "Hong Kong Comic Con",
      "page.year": "2026",
      "hero.panel": "Side panel",
      "hero.countdownEyebrow": "Until opening",
      "hero.playAria": "Play (wireframe)",
      "hero.posterLabel": "Main poster or highlight video",
      "hero.quickLinks": "Quick links",
      "hero.boothMap": "Booth map",
      "schedule.title": "Schedule",
      "schedule.type": "Type",
      "schedule.time": "Time",
      "schedule.titleCol": "Title",
      "schedule.place": "Venue",
      "schedule.booth": "Booth",
      "schedule.tabListAria": "Event days and frequently asked questions",
      "schedule.tabFaqs": "FAQs",
      "schedule.day1Num": "DAY 01",
      "schedule.day1Date": "Friday, 29 May 2026 · On-site",
      "schedule.s1time": "09:00",
      "schedule.s1title": "Registration & doors",
      "schedule.s1meta": "Main lobby · HKCEC",
      "schedule.s2time": "10:00",
      "schedule.s2title": "Opening ceremony",
      "schedule.s2meta": "Main hall · TBC",
      "schedule.s3time": "12:30",
      "schedule.s3title": "Lunch break",
      "schedule.s3meta": "On your own · TBC",
      "schedule.day2Num": "DAY 02",
      "schedule.day2Date": "Saturday, 30 May 2026",
      "schedule.s4time": "10:00",
      "schedule.s4title": "Panels & showcases",
      "schedule.s4meta": "Expo floor · TBC",
      "schedule.s5time": "15:00",
      "schedule.s5title": "Community meetups",
      "schedule.s5meta": "Booth zone · TBC",
      "schedule.day3Num": "DAY 03",
      "schedule.day3Date": "Sunday, 31 May 2026 · TBC",
      "schedule.s6time": "10:00",
      "schedule.s6title": "Closing & awards",
      "schedule.s6meta": "Main hall · TBC",
      "schedule.s7time": "16:00",
      "schedule.s7title": "Floor closes · departure",
      "schedule.s7meta": "HKCEC · TBC",
      "schedule.faqLead": "Common questions · full details before the event.",
      "schedule.faqQ1": "Where do I buy tickets?",
      "schedule.faqA1": "TBC until official channels are announced.",
      "schedule.faqQ2": "Is on-site registration available?",
      "schedule.faqA2": "We will post updates alongside the program.",
      "schedule.faqQ3": "Where is the NIUSN booth?",
      "schedule.faqA3": "We will update this page once the map is final.",
      "booth.label": "Booth",
      "prizes.title": "Merch · Prizes",
      "prizes.cta": "CTA · TBD",
      "prizes.listTitle": "List title",
      "wwd.summary":
        "NIUSN goes beyond being a content production company to redefine the future of education through technology. By crafting world-class animations powered by AI, we are establishing a new educational standard that has never been seen before.",
      "wwd.displayPrimaryHtml":
        '<span class="wwd-line"><span class="word">NIUSN GOES BEYOND</span></span><span class="wwd-line"><span class="word">A CONTENT STUDIO</span></span><span class="wwd-line"><span class="word">TO REDEFINE EDUCATION</span></span><span class="wwd-line"><span class="word">THROUGH </span><span class="word wwd-accent">technology</span></span>',
      "wwd.displaySecondaryHtml":
        '<span class="wwd-line"><span class="word">BY CRAFTING WORLD-CLASS</span></span><span class="wwd-line"><span class="word">ANIMATIONS POWERED BY </span><span class="word wwd-accent">AI</span></span><span class="wwd-line"><span class="word">WE ESTABLISH A NEW</span></span><span class="wwd-line"><span class="word">STANDARD FOR EDUCATION</span></span>',
      "product.works": "Works · Series",
      "contact.lede1": "Event, partnership, or press?",
      "contact.lede2": "Drop a line, and we read every message.",
      "contact.sectionTag": "Contact",
      "contact.head1": "Let's",
      "contact.head2": "Connect",
      "contact.head3": "NIUSN",
      "contact.submitCta": "Discuss the project",
      "contact.name": "Name",
      "contact.email": "Email",
      "contact.message": "Message",
      "contact.phName": "Name",
      "contact.phEmail": "Email",
      "contact.phMessage": "Message",
      "contact.submit": "Send",
      "scrollTopFab.aria": "Back to top",
      "footer.snsNavAria": "Social media links",
      "footer.marqueeAria": "NIUSN · AI-Powered Animation Studio · Hong Kong Comic Con 2026 · venue",
      "footer.marqueeTagline": "AI-Powered Animation Studio",
      "footer.marqueeEvent": "Hong Kong Comic Con 2026",
      "footer.marqueeVenue": "Hong Kong Convention and Exhibition Centre",
      "footer.copyright": "© 2026 NIUSN Corp. All rights reserved.",
      "dialog.close": "Close",
      "dialog.boothEyebrow": "Booth map",
      "dialog.mapAria": "Booth map placeholder",
      "dialog.placeholder": "Before assets are linked",
    },
    "zh-Hans": {
      "doc.title": "NIUSN · Hong Kong Comic Con 2026",
      "lang.label": "语言",
      "lang.triggerAria": "选择语言",
      skip: "跳到正文",
      "logo.aria": "NIUSN: 返回页顶",
      "nav.label": "主导航",
      "nav.menu": "菜单",
      "nav.event": "Hong Kong Comic Con 2026",
      "nav.schedule": "日程",
      "nav.prizes": "商品 · 奖品",
      "nav.whatWeDo": "What We Do",
      "nav.product": "产品 · 技术",
      "nav.contact": "联系",
      "sound.off": "关",
      "sound.on": "开",
      "sound.toggleAria": "切换背景声音与主视频音频",
      "page.title": "Hong Kong Comic Con",
      "page.year": "2026",
      "hero.panel": "侧栏",
      "hero.countdownEyebrow": "距离开幕",
      "hero.playAria": "播放（线框）",
      "hero.posterLabel": "主海报或高光视频",
      "hero.quickLinks": "快捷入口",
      "hero.boothMap": "展位图",
      "schedule.title": "日程",
      "schedule.type": "类型",
      "schedule.time": "时间",
      "schedule.titleCol": "标题",
      "schedule.place": "地点",
      "schedule.booth": "展位",
      "schedule.tabListAria": "日程标签 · 常见问题",
      "schedule.tabFaqs": "FAQs",
      "schedule.day1Num": "DAY 01",
      "schedule.day1Date": "2026年5月29日（周五）· 现场",
      "schedule.s1time": "09:00",
      "schedule.s1title": "签到 · 入场",
      "schedule.s1meta": "主大堂 · HKCEC",
      "schedule.s2time": "10:00",
      "schedule.s2title": "开幕仪式",
      "schedule.s2meta": "主会场 · 待定",
      "schedule.s3time": "12:30",
      "schedule.s3title": "午休",
      "schedule.s3meta": "自由安排 · TBC",
      "schedule.day2Num": "DAY 02",
      "schedule.day2Date": "2026年5月30日（周六）",
      "schedule.s4time": "10:00",
      "schedule.s4title": "对谈与展示",
      "schedule.s4meta": "展区 · TBC",
      "schedule.s5time": "15:00",
      "schedule.s5title": "社群见面",
      "schedule.s5meta": "展位区 · TBC",
      "schedule.day3Num": "DAY 03",
      "schedule.day3Date": "2026年5月31日（周日）· 待定",
      "schedule.s6time": "10:00",
      "schedule.s6title": "闭幕 · 颁奖",
      "schedule.s6meta": "主会场 · TBC",
      "schedule.s7time": "16:00",
      "schedule.s7title": "闭展 · 离场",
      "schedule.s7meta": "HKCEC · TBC",
      "schedule.faqLead": "常见问题 · 活动前公布",
      "schedule.faqQ1": "门票在哪里购买？",
      "schedule.faqA1": "官方渠道公布前为待定。",
      "schedule.faqQ2": "是否有现场登记？",
      "schedule.faqA2": "将随日程公告更新。",
      "schedule.faqQ3": "NIUSN 展位在哪里？",
      "schedule.faqA3": "平面图确定后将更新本页。",
      "booth.label": "展位",
      "prizes.title": "商品 · 奖品",
      "prizes.cta": "行动按钮 · 待定",
      "prizes.listTitle": "列表标题",
      "wwd.summary": "NIUSN 不止是一家内容制作公司，而是以技术重新定义教育的未来。我们以 AI 驱动的世界级动画，正在建立前所未有的全新教育标准。",
      "wwd.displayPrimaryHtml":
        '<span class="wwd-line"><span class="word">NIUSN 不止是一家</span></span><span class="wwd-line"><span class="word">内容制作公司</span></span><span class="wwd-line"><span class="word">而是以技术</span></span><span class="wwd-line"><span class="word">重新定义教育的未来</span></span>',
      "wwd.displaySecondaryHtml":
        '<span class="wwd-line"><span class="word">我们以 </span><span class="word wwd-accent">AI</span><span class="word"> 驱动的</span></span><span class="wwd-line"><span class="word">世界级动画</span></span><span class="wwd-line"><span class="word">正在建立前所未有的</span></span><span class="wwd-line"><span class="word">全新教育标准</span></span>',
      "product.works": "作品 · 系列",
      "contact.lede1": "活动、合作或媒体咨询？",
      "contact.lede2": "欢迎留言，我们会尽快回复。",
      "contact.sectionTag": "Contact",
      "contact.head1": "携手",
      "contact.head2": "联动",
      "contact.head3": "NIUSN",
      "contact.submitCta": "洽谈项目",
      "contact.name": "姓名",
      "contact.email": "邮箱",
      "contact.message": "留言",
      "contact.phName": "姓名",
      "contact.phEmail": "邮箱",
      "contact.phMessage": "留言",
      "contact.submit": "发送",
      "scrollTopFab.aria": "返回顶部",
      "footer.snsNavAria": "社交媒体链接",
      "footer.marqueeAria": "NIUSN · AI 驱动动画工作室 · Hong Kong Comic Con 2026 · 场馆",
      "footer.marqueeTagline": "AI 驱动动画工作室",
      "footer.marqueeEvent": "Hong Kong Comic Con 2026",
      "footer.marqueeVenue": "香港会议展览中心",
      "footer.copyright": "© 2026 NIUSN Corp. All rights reserved.",
      "dialog.close": "关闭",
      "dialog.boothEyebrow": "展位图",
      "dialog.mapAria": "展位图占位",
      "dialog.placeholder": "接入素材前",
    },
    "zh-Hant": {
      "doc.title": "NIUSN · Hong Kong Comic Con 2026",
      "lang.label": "語言",
      "lang.triggerAria": "選擇語言",
      skip: "跳到正文",
      "logo.aria": "NIUSN: 返回頁頂",
      "nav.label": "主導航",
      "nav.menu": "選單",
      "nav.event": "Hong Kong Comic Con 2026",
      "nav.schedule": "日程",
      "nav.prizes": "商品 · 獎品",
      "nav.whatWeDo": "What We Do",
      "nav.product": "產品 · 技術",
      "nav.contact": "聯絡",
      "sound.off": "關",
      "sound.on": "開",
      "sound.toggleAria": "切換背景聲音與主影片音訊",
      "page.title": "Hong Kong Comic Con",
      "page.year": "2026",
      "hero.panel": "側欄",
      "hero.countdownEyebrow": "距離開幕",
      "hero.playAria": "播放（線框）",
      "hero.posterLabel": "主海報或高光影片",
      "hero.quickLinks": "快捷入口",
      "hero.boothMap": "展位圖",
      "schedule.title": "日程",
      "schedule.type": "類型",
      "schedule.time": "時間",
      "schedule.titleCol": "標題",
      "schedule.place": "地點",
      "schedule.booth": "展位",
      "schedule.tabListAria": "日程標籤 · 常見問題",
      "schedule.tabFaqs": "FAQs",
      "schedule.day1Num": "DAY 01",
      "schedule.day1Date": "2026年5月29日（週五）· 現場",
      "schedule.s1time": "09:00",
      "schedule.s1title": "簽到 · 入場",
      "schedule.s1meta": "主大堂 · HKCEC",
      "schedule.s2time": "10:00",
      "schedule.s2title": "開幕儀式",
      "schedule.s2meta": "主會場 · 待定",
      "schedule.s3time": "12:30",
      "schedule.s3title": "午休",
      "schedule.s3meta": "自由安排 · TBC",
      "schedule.day2Num": "DAY 02",
      "schedule.day2Date": "2026年5月30日（週六）",
      "schedule.s4time": "10:00",
      "schedule.s4title": "對談與展示",
      "schedule.s4meta": "展區 · TBC",
      "schedule.s5time": "15:00",
      "schedule.s5title": "社群見面",
      "schedule.s5meta": "展位區 · TBC",
      "schedule.day3Num": "DAY 03",
      "schedule.day3Date": "2026年5月31日（週日）· 待定",
      "schedule.s6time": "10:00",
      "schedule.s6title": "閉幕 · 頒獎",
      "schedule.s6meta": "主會場 · TBC",
      "schedule.s7time": "16:00",
      "schedule.s7title": "閉展 · 離場",
      "schedule.s7meta": "HKCEC · TBC",
      "schedule.faqLead": "常見問題 · 活動前公布",
      "schedule.faqQ1": "門票在哪裡購買？",
      "schedule.faqA1": "官方渠道公布前為待定。",
      "schedule.faqQ2": "是否有現場登記？",
      "schedule.faqA2": "將隨日程公告更新。",
      "schedule.faqQ3": "NIUSN 展位在哪裡？",
      "schedule.faqA3": "平面圖確定後將更新本頁。",
      "booth.label": "展位",
      "prizes.title": "商品 · 獎品",
      "prizes.cta": "行動按鈕 · 待定",
      "prizes.listTitle": "清單標題",
      "wwd.summary": "NIUSN 不止是一家內容製作公司，而是以技術重新定義教育的未來。我們以 AI 驅動的世界級動畫，正在建立前所未有的全新教育標準。",
      "wwd.displayPrimaryHtml":
        '<span class="wwd-line"><span class="word">NIUSN 不止是一家</span></span><span class="wwd-line"><span class="word">內容製作公司</span></span><span class="wwd-line"><span class="word">而是以技術</span></span><span class="wwd-line"><span class="word">重新定義教育的未來</span></span>',
      "wwd.displaySecondaryHtml":
        '<span class="wwd-line"><span class="word">我們以 </span><span class="word wwd-accent">AI</span><span class="word"> 驅動的</span></span><span class="wwd-line"><span class="word">世界級動畫</span></span><span class="wwd-line"><span class="word">正在建立前所未有的</span></span><span class="wwd-line"><span class="word">全新教育標準</span></span>',
      "product.works": "作品 · 系列",
      "contact.lede1": "活動、合作或媒體諮詢？",
      "contact.lede2": "歡迎留言，我們會盡快回覆。",
      "contact.sectionTag": "Contact",
      "contact.head1": "攜手",
      "contact.head2": "聯動",
      "contact.head3": "NIUSN",
      "contact.submitCta": "洽談項目",
      "contact.name": "姓名",
      "contact.email": "信箱",
      "contact.message": "留言",
      "contact.phName": "姓名",
      "contact.phEmail": "信箱",
      "contact.phMessage": "留言",
      "contact.submit": "送出",
      "scrollTopFab.aria": "返回頂部",
      "footer.snsNavAria": "社群媒體連結",
      "footer.marqueeAria": "NIUSN · AI 驅動動畫工作室 · Hong Kong Comic Con 2026 · 場館",
      "footer.marqueeTagline": "AI 驅動動畫工作室",
      "footer.marqueeEvent": "Hong Kong Comic Con 2026",
      "footer.marqueeVenue": "香港會議展覽中心",
      "footer.copyright": "© 2026 NIUSN Corp. All rights reserved.",
      "dialog.close": "關閉",
      "dialog.boothEyebrow": "展位圖",
      "dialog.mapAria": "展位圖占位",
      "dialog.placeholder": "接入素材前",
    },
  };

  function normalizeLang(v) {
    if (v === "zh-CN" || v === "zh") return "zh-Hans";
    if (v === "zh-TW" || v === "zh-HK") return "zh-Hant";
    if (STRINGS[v]) return v;
    return "en";
  }

  function t(lang, key) {
    const L = STRINGS[lang] || STRINGS.en;
    if (L[key] !== undefined) return L[key];
    if (STRINGS.en[key] !== undefined) return STRINGS.en[key];
    return STRINGS.ko[key] || key;
  }

  function closeLangMenu() {
    const root = document.getElementById("lang-dropdown");
    const trigger = document.getElementById("lang-trigger");
    const menu = document.getElementById("lang-menu");
    if (root) root.classList.remove("is-open");
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  function openLangMenu() {
    const root = document.getElementById("lang-dropdown");
    const trigger = document.getElementById("lang-trigger");
    const menu = document.getElementById("lang-menu");
    if (!root || !trigger || !menu) return;
    root.classList.add("is-open");
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    const active = menu.querySelector(".lang-menu__opt.is-active") || menu.querySelector(".lang-menu__opt");
    if (active && typeof active.focus === "function") {
      active.focus({ preventScroll: true });
    }
  }

  function toggleLangMenu() {
    const root = document.getElementById("lang-dropdown");
    if (!root) return;
    if (root.classList.contains("is-open")) closeLangMenu();
    else openLangMenu();
  }

  function syncLangDropdown(lang) {
    const L = normalizeLang(lang);
    const row = LANG_MENU.find((x) => x.code === L) || LANG_MENU[0];
    const labelEl = document.getElementById("lang-trigger-label");
    if (labelEl) labelEl.textContent = row.label;
    document.querySelectorAll(".lang-menu__opt").forEach((btn) => {
      const on = btn.getAttribute("data-lang") === L;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    closeLangMenu();
  }

  function initLangDropdown() {
    const root = document.getElementById("lang-dropdown");
    const trigger = document.getElementById("lang-trigger");
    const menu = document.getElementById("lang-menu");
    if (!root || !trigger || !menu) return;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleLangMenu();
    });

    menu.querySelectorAll(".lang-menu__opt").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const code = btn.getAttribute("data-lang");
        if (code) applyLang(code);
        document.dispatchEvent(new CustomEvent("niusn:close-mobile-nav"));
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest("#lang-dropdown")) closeLangMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLangMenu();
    });
  }

  function applyLang(lang) {
    const L = normalizeLang(lang);
    document.documentElement.lang = L;
    try {
      localStorage.setItem(STORAGE_KEY, L);
    } catch (_) {}

    document.title = t(L, "doc.title");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(L, key);
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (!key) return;
      el.innerHTML = t(L, key);
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const spec = el.getAttribute("data-i18n-attr");
      if (!spec || !spec.includes(":")) return;
      const [attr, key] = spec.split(":").map((s) => s.trim());
      el.setAttribute(attr, t(L, key));
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) el.setAttribute("placeholder", t(L, key));
    });

    document.querySelectorAll(".schedule-table tbody td[data-label-key]").forEach((td) => {
      const key = td.getAttribute("data-label-key");
      if (key) td.setAttribute("data-label", t(L, key));
    });

    syncLangDropdown(L);

    window.dispatchEvent(new CustomEvent("niusn:lang", { detail: { lang: L } }));
  }

  function init() {
    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (_) {}
    if (!stored) {
      stored = "en";
    }
    applyLang(stored);
    initLangDropdown();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.NIUSN_I18N = { applyLang, t, STRINGS };
})();
