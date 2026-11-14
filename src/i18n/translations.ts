export type Language = 'en' | 'ar';
export type ConversationMode = 'home' | 'deaf' | 'mute' | 'blind';

export interface QuickReplyItem {
  id: string;
  en: string;
  ar: string;
  icon: 'clock' | 'rotate-ccw' | 'check' | 'x' | 'keyboard' | 'hand' | 'heart-handshake' | 'life-buoy';
}

export interface AacBoardItem {
  id: string;
  en: string;
  ar: string;
  icon:
    | 'hand-wave'
    | 'heart-handshake'
    | 'life-buoy'
    | 'check'
    | 'x'
    | 'siren'
    | 'clock'
    | 'droplets'
    | 'map-pin'
    | 'message-circle-question'
    | 'phone-call'
    | 'volume-2';
  tone?: 'primary' | 'emerald' | 'danger' | 'neutral';
}

export const DEAF_QUICK_REPLIES: QuickReplyItem[] = [
  { id: 'slower', en: 'Please speak slower', ar: 'من فضلك تحدث ببطء', icon: 'hand' },
  { id: 'repeat', en: 'Please repeat that', ar: 'من فضلك أعد ما قلته', icon: 'rotate-ccw' },
  { id: 'understand', en: 'Yes, I understand', ar: 'نعم، أنا أفهم', icon: 'check' },
  { id: 'no-thanks', en: 'No, thank you', ar: 'لا، شكراً لك', icon: 'x' },
  { id: 'write-down', en: 'Can you type it here?', ar: 'هل يمكنك كتابته هنا؟', icon: 'keyboard' },
  { id: 'moment', en: 'One moment please', ar: 'لحظة واحدة من فضلك', icon: 'clock' },
  { id: 'thanks', en: 'Thank you so much', ar: 'شكراً جزيلاً لك', icon: 'heart-handshake' },
  { id: 'help', en: 'I need assistance', ar: 'أحتاج إلى مساعدة', icon: 'life-buoy' },
];

export const MUTE_AAC_BOARD: AacBoardItem[] = [
  { id: 'hello', en: 'Hello', ar: 'مرحباً', icon: 'hand-wave', tone: 'primary' },
  { id: 'thank-you', en: 'Thank you', ar: 'شكراً لك', icon: 'heart-handshake', tone: 'emerald' },
  { id: 'need-help', en: 'I need help', ar: 'أحتاج إلى مساعدة', icon: 'life-buoy', tone: 'primary' },
  { id: 'yes', en: 'Yes', ar: 'نعم', icon: 'check', tone: 'emerald' },
  { id: 'no', en: 'No', ar: 'لا', icon: 'x', tone: 'neutral' },
  { id: 'emergency', en: 'Emergency', ar: 'حالة طوارئ', icon: 'siren', tone: 'danger' },
  { id: 'wait', en: 'Please wait', ar: 'انتظر من فضلك', icon: 'clock', tone: 'neutral' },
  { id: 'water', en: 'Water please', ar: 'ماء من فضلك', icon: 'droplets', tone: 'neutral' },
  { id: 'where', en: 'Where is the exit?', ar: 'أين المخرج؟', icon: 'map-pin', tone: 'neutral' },
  { id: 'dont-understand', en: "I don't understand", ar: 'لا أفهم', icon: 'message-circle-question', tone: 'neutral' },
  { id: 'call-family', en: 'Please call my family', ar: 'اتصل بعائلتي من فضلك', icon: 'phone-call', tone: 'primary' },
  { id: 'speak-again', en: 'Please repeat that', ar: 'أعد الكلام من فضلك', icon: 'volume-2', tone: 'neutral' },
];

export interface TranslationBundle {
  brand: string;
  nav: {
    home: string;
    deaf: string;
    mute: string;
    blind: string;
    backHome: string;
  };
  controls: {
    languageName: string;
    switchLanguage: string;
    darkMode: string;
    lightMode: string;
    speechRate: string;
    clearLog: string;
    testAudio: string;
    stopAudio: string;
    faceToFaceFlip: string;
    faceToFaceHint: string;
    fullscreenCard: string;
    closeFullscreen: string;
    startChatHint: string;
    toggleBoard: string;
  };
  home: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    dashboardTitle: string;
    dashboardSubtitle: string;
    enterMode: string;
    modes: {
      deaf: {
        title: string;
        audience: string;
        description: string;
        features: string;
      };
      mute: {
        title: string;
        audience: string;
        description: string;
        features: string;
      };
      blind: {
        title: string;
        audience: string;
        description: string;
        features: string;
      };
    };
    readinessTitle: string;
    readinessSpeechSupport: string;
    readinessSynthesisSupport: string;
    supported: string;
    fallbackReady: string;
  };
  speech: {
    startListening: string;
    stopListening: string;
    listeningNow: string;
    micIdle: string;
    micDenied: string;
    micServiceNotAllowed: string;
    micAudioCapture: string;
    micNetwork: string;
    micUnsupported: string;
    noSpeechDetected: string;
    openInNewTab: string;
    manualCaptionPlaceholder: string;
    sendManualCaption: string;
    speakingNow: string;
    speechUnsupported: string;
  };
  deaf: {
    title: string;
    subtitle: string;
    hearingPanelTitle: string;
    hearingPanelHint: string;
    deafPanelTitle: string;
    deafPanelHint: string;
    liveCaptionPlaceholder: string;
    textSizeLabel: string;
    autoSpeakReplies: string;
    quickRepliesTitle: string;
    replyInputPlaceholder: string;
    sendReply: string;
    speakReply: string;
    latestReplyLabel: string;
    emptyTranscript: string;
    speakerHearing: string;
    speakerDeaf: string;
    historyTitle: string;
    visualSignGuide: string;
  };
  mute: {
    title: string;
    subtitle: string;
    listenerBoxTitle: string;
    listenerBoxHint: string;
    listenerPlaceholder: string;
    boardTitle: string;
    boardSubtitle: string;
    lastSpokenLabel: string;
    customKeyboardTitle: string;
    customPlaceholder: string;
    speakAloud: string;
    clearText: string;
    replayPhrase: string;
    recentSpokenTitle: string;
    emptyRecent: string;
  };
  blind: {
    title: string;
    subtitle: string;
    audioGuideToggle: string;
    replayGuide: string;
    guideAnnouncement: string;
    sightedPanelTitle: string;
    sightedPanelHint: string;
    sightedInputPlaceholder: string;
    readAloudBtn: string;
    dictateBtn: string;
    stopDictateBtn: string;
    tactilePanelTitle: string;
    tactilePanelHint: string;
    tapLeftYes: string;
    tapRightNo: string;
    yesWord: string;
    noWord: string;
    longPressTitle: string;
    longPressHint: string;
    holdingProgress: string;
    listeningVoiceReply: string;
    tapToFinishReply: string;
    keyboardShortcutHint: string;
    conversationFeedTitle: string;
    speakerSighted: string;
    speakerBlind: string;
    emptyFeed: string;
    brailleAudioGuide: string;
    autoVoiceActive: string;
    recordingVoiceClip: string;
    stopRecordingClip: string;
    voiceClipLabel: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  en: {
    brand: 'AccessBridge',
    nav: {
      home: 'Home',
      deaf: 'Deaf & HoH',
      mute: 'Non-Verbal',
      blind: 'Blind & Low Vision',
      backHome: 'All Modes',
    },
    controls: {
      languageName: 'العربية',
      switchLanguage: 'Switch language to Arabic',
      darkMode: 'Dark',
      lightMode: 'Light',
      speechRate: 'Voice Speed',
      clearLog: 'Clear Conversation',
      testAudio: 'Test Voice',
      stopAudio: 'Stop Voice',
      faceToFaceFlip: 'Face-to-Face Flip (180°)',
      faceToFaceHint: 'Rotate partner side for across-the-table chat',
      fullscreenCard: 'Show Fullscreen',
      closeFullscreen: 'Tap anywhere or press Esc to close',
      startChatHint: 'Speak, type, or tap a starter phrase to begin a two-way dialogue.',
      toggleBoard: 'Phrase Board',
    },
    home: {
      eyebrow: 'Zero-Setup Assistive Communication',
      headline: 'Every voice heard. Every conversation bridged.',
      subheadline:
        'Real-time speech-to-text, tactile audio responses, and expressive visual boards running natively in your browser—built for clear, dignified two-way communication.',
      dashboardTitle: 'Select Conversation Mode',
      dashboardSubtitle:
        'Choose the communication bridge tailored to the person you are speaking with.',
      enterMode: 'Open Mode',
      modes: {
        deaf: {
          title: 'Deaf / Hard of Hearing',
          audience: 'Hearing ↔ Visual & Sign Language User',
          description:
            'Designed for Deaf users who primarily rely on Visual & Sign Language communication—pairing real-time oversized captions with visual icon replies.',
          features: 'Visual & Sign Language Cues · Live Captions · Quick Replies',
        },
        mute: {
          title: 'Mute / Non-Verbal',
          audience: 'Hearing ↔ Non-Verbal Speaker',
          description:
            'High-contrast visual phrase board with clear icons, custom text-to-speech composer, and live listener captions.',
          features: 'Visual AAC Board · Custom Speech · Live Mic Box',
        },
        blind: {
          title: 'Blind / Visually Impaired',
          audience: 'Sighted ↔ Braille & Audio Cues User',
          description:
            'Built around Braille and Audio cues—spoken guidance, tactile Braille-indexed Yes/No zones, audio chimes, and eyes-free voice replies.',
          features: 'Braille & Audio Cues · Tactile Yes/No · Eyes-Free Reply',
        },
      },
      readinessTitle: 'Browser Speech Capabilities',
      readinessSpeechSupport: 'Speech Recognition',
      readinessSynthesisSupport: 'Speech Synthesis',
      supported: 'Ready in Browser',
      fallbackReady: 'Text Fallback Active',
    },
    speech: {
      startListening: 'Start Microphone',
      stopListening: 'Pause Microphone',
      listeningNow: 'Listening live',
      micIdle: 'Microphone paused',
      micDenied:
        'Microphone permission was blocked. Allow microphone access in your browser address bar, or open the app in a new tab.',
      micServiceNotAllowed:
        'Speech recognition is restricted inside this embedded frame. Open AccessBridge in a new browser tab to use the microphone.',
      micAudioCapture:
        'No active microphone was detected. Check that your microphone is connected and not used by another app.',
      micNetwork:
        'Could not reach the browser speech service (network error). Check your connection or try Chrome / Edge.',
      micUnsupported:
        'Live speech recognition is not supported in this browser (try Chrome, Edge, or Safari), or use the text input below.',
      noSpeechDetected: 'No speech detected yet—keep speaking clearly.',
      openInNewTab: 'Open in New Tab',
      manualCaptionPlaceholder: 'Type a live caption directly if microphone is unavailable...',
      sendManualCaption: 'Display Caption',
      speakingNow: 'Speaking aloud',
      speechUnsupported: 'Speech synthesis is not supported by this browser.',
    },
    deaf: {
      title: 'Deaf & Hard of Hearing Bridge',
      subtitle: 'Speak naturally for instant large captions, or tap a reply to respond clearly.',
      hearingPanelTitle: 'For the Hearing Person',
      hearingPanelHint: 'Tap the microphone and speak clearly. Your words appear instantly in large print.',
      deafPanelTitle: 'For the Deaf / Hard of Hearing Person',
      deafPanelHint: 'Tap a quick reply or type your message to display and optionally speak it aloud.',
      liveCaptionPlaceholder: 'Spoken words will appear here in real time...',
      textSizeLabel: 'Caption Size',
      autoSpeakReplies: 'Speak Replies Aloud',
      quickRepliesTitle: 'Quick Replies',
      replyInputPlaceholder: 'Type your reply here...',
      sendReply: 'Display Reply',
      speakReply: 'Speak',
      latestReplyLabel: 'Latest Reply',
      emptyTranscript: 'Conversation lines will appear here as you speak or reply.',
      speakerHearing: 'Hearing',
      speakerDeaf: 'Deaf / HoH',
      historyTitle: 'Conversation Log',
      visualSignGuide: 'Visual & Sign Language communication bridge — high-contrast captions and visual icon replies.',
    },
    mute: {
      title: 'Non-Verbal Communication Board',
      subtitle: 'Read incoming speech at the top and tap visual phrases or type to speak aloud.',
      listenerBoxTitle: 'Hearing Person Speech (Live Captions)',
      listenerBoxHint: 'Listen and display what the other person is saying in large readable text.',
      listenerPlaceholder: 'Tap Start Microphone to read what the other person says...',
      boardTitle: 'Visual Communication Board',
      boardSubtitle: 'Tap any phrase tile to speak it aloud immediately.',
      lastSpokenLabel: 'Currently Speaking',
      customKeyboardTitle: 'Custom Voice Keyboard',
      customPlaceholder: 'Type anything you want to say out loud...',
      speakAloud: 'Speak Aloud',
      clearText: 'Clear',
      replayPhrase: 'Replay',
      recentSpokenTitle: 'Recently Spoken',
      emptyRecent: 'Phrases you speak will appear here for one-tap replay.',
    },
    blind: {
      title: 'Blind & Visually Impaired Bridge',
      subtitle: 'Full auditory feedback with spatial tactile touch zones for eyes-free replies.',
      audioGuideToggle: 'Voice Guide',
      replayGuide: 'Replay Audio Guide',
      guideAnnouncement:
        'Voice-guided mode active. Tap the left side of the pad for Yes, tap the right side for No, or press and hold anywhere to speak your reply.',
      sightedPanelTitle: 'For the Sighted Person',
      sightedPanelHint: 'Type or dictate a message—AccessBridge reads it aloud clearly.',
      sightedInputPlaceholder: 'Type a message to read aloud...',
      readAloudBtn: 'Read Aloud',
      dictateBtn: 'Voice Input',
      stopDictateBtn: 'Stop Voice',
      tactilePanelTitle: 'Tactile Reply Surface (Eyes-Free)',
      tactilePanelHint: 'Tap left for Yes, tap right for No, or hold anywhere for 0.6s to speak.',
      tapLeftYes: 'Tap Left Side',
      tapRightNo: 'Tap Right Side',
      yesWord: 'Yes',
      noWord: 'No',
      longPressTitle: 'Press & Hold Anywhere to Speak',
      longPressHint: 'Hold for half a second until you hear a chime, then speak your reply.',
      holdingProgress: 'Keep holding for voice reply...',
      listeningVoiceReply: 'Listening for your voice reply... Tap anywhere or pause to send.',
      tapToFinishReply: 'Finish Voice Reply',
      keyboardShortcutHint: 'Keyboard: Y = Yes · N = No · Hold Space = Speak',
      conversationFeedTitle: 'Spoken Exchange',
      speakerSighted: 'Sighted',
      speakerBlind: 'Blind / Low Vision',
      emptyFeed: 'Messages read aloud and tactile replies appear here.',
      brailleAudioGuide: 'Braille & Audio cues active — Left: Braille ⠽ Yes · Right: Braille ⠝ No · Hold: Speak',
      autoVoiceActive: 'Auto-voice active: every message or voice sent plays aloud automatically',
      recordingVoiceClip: 'Recording voice message...',
      stopRecordingClip: 'Send Voice',
      voiceClipLabel: 'Voice message',
    },
  },
  ar: {
    brand: 'أكسس بريدج',
    nav: {
      home: 'الرئيسية',
      deaf: 'الصم وضعاف السمع',
      mute: 'غير الناطقين',
      blind: 'المكفوفين',
      backHome: 'كل الأوضاع',
    },
    controls: {
      languageName: 'English',
      switchLanguage: 'تبديل اللغة إلى الإنجليزية',
      darkMode: 'داكن',
      lightMode: 'فاتح',
      speechRate: 'سرعة الصوت',
      clearLog: 'مسح المحادثة',
      testAudio: 'اختبار الصوت',
      stopAudio: 'إيقاف الصوت',
      faceToFaceFlip: 'وضع المواجهة (قلب 180°)',
      faceToFaceHint: 'تدوير جهة الطرف الآخر للتحدث وجهاً لوجه',
      fullscreenCard: 'عرض بملء الشاشة',
      closeFullscreen: 'اضغط في أي مكان أو Esc للإغلاق',
      startChatHint: 'تحدث أو اكتب أو اختر عبارة للبدء بحوار مباشر بينكما.',
      toggleBoard: 'لوحة العبارات',
    },
    home: {
      eyebrow: 'تواصل شمولي فوري بدون إعداد',
      headline: 'لكل صوت صدى. ولكل محادثة جسر.',
      subheadline:
        'تحويل فوري للكلام إلى نص، واستجابات صوتية لمسية، ولوحات تواصل بصرية تعمل مباشرة من المتصفح لتواصل إنساني واضح وكريم.',
      dashboardTitle: 'اختر وضع المحادثة',
      dashboardSubtitle: 'حدد جسر التواصل المصمم بما يناسب الشخص الذي تتحدث معه.',
      enterMode: 'فتح الوضع',
      modes: {
        deaf: {
          title: 'الصم وضعاف السمع',
          audience: 'شخص سامع ↔ التواصل البصري ولغة الإشارة',
          description:
            'مصمم للأشخاص الصم الذين يعتمدون أساساً على لغة الإشارة والتواصل البصري — يجمع بين الترجمة الفورية والردود المصورة بالرموز.',
          features: 'لغة الإشارة والتواصل البصري · نص فوري · ردود بالرموز',
        },
        mute: {
          title: 'غير الناطقين (البكم)',
          audience: 'شخص سامع ↔ شخص غير ناطق',
          description:
            'لوحة تواصل بصرية بأيقونات واضحة وعبارات يومية مع لوحة كتابة ناطقة وصندوق استماع مباشر.',
          features: 'لوحة عبارات · نطق الكتابة · استماع مباشر',
        },
        blind: {
          title: 'المكفوفين وضعاف البصر',
          audience: 'شخص مبصر ↔ مستخدم برايل والإشارات الصوتية',
          description:
            'مصمم بالاعتماد على رموز برايل والإشارات الصوتية — توجيه صوتي، مناطق لمس بنمط برايل لنعم ولا، ونغمات استجابة فورية.',
          features: 'رموز برايل وإشارات صوتية · لمس نعم/لا · رد صوتي حر',
        },
      },
      readinessTitle: 'جاهزية تقنيات الصوت في المتصفح',
      readinessSpeechSupport: 'التعرف على الكلام',
      readinessSynthesisSupport: 'تحويل النص لصوت',
      supported: 'جاهز في المتصفح',
      fallbackReady: 'الكتابة البديلة متاحة',
    },
    speech: {
      startListening: 'تشغيل الميكروفون',
      stopListening: 'إيقاف الميكروفون',
      listeningNow: 'يستمع الآن مباشرة',
      micIdle: 'الميكروفون متوقف',
      micDenied:
        'تم رفض إذن الميكروفون. اسمح للمتصفح بالوصول إلى الميكروفون من شريط العنوان أو افتح التطبيق في تبويب جديد.',
      micServiceNotAllowed:
        'المتصفح يمنع خدمة التعرف على الكلام داخل الإطار المدمج. افتح التطبيق في تبويب جديد لتشغيل الميكروفون مباشرة.',
      micAudioCapture:
        'لم يتم العثور على ميكروفون نشط. تأكد من توصيل الميكروفون وعدم استخدامه في تطبيق آخر.',
      micNetwork:
        'تعذر الاتصال بخدمة التعرف على الكلام في المتصفح (خطأ شبكة). تأكد من الإنترنت أو جرب متصفح Chrome أو Edge.',
      micUnsupported:
        'التعرف التلقائي على الكلام غير مدعوم في هذا المتصفح (يفضل استخدام Chrome أو Edge أو Safari)، ويمكنك الكتابة مباشرة أدناه.',
      noSpeechDetected: 'لم يتم التقاط صوت بعد — تحدث بوضوح.',
      openInNewTab: 'فتح في تبويب جديد',
      manualCaptionPlaceholder: 'اكتب النص ليظهر بخط كبير في حال عدم توفر الميكروفون...',
      sendManualCaption: 'عرض النص',
      speakingNow: 'جاري النطق الآن',
      speechUnsupported: 'تحويل النص إلى صوت غير مدعوم في هذا المتصفح.',
    },
    deaf: {
      title: 'جسر التواصل مع الصم وضعاف السمع',
      subtitle: 'تحدث بوضوح ليظهر كلامك بنص كبير، أو اضغط على الردود السريعة للتجاوب فوراً.',
      hearingPanelTitle: 'للشخص السامع',
      hearingPanelHint: 'اضغط على الميكروفون وتحدث بوضوح. ستظهر كلماتك فوراً بخط كبير ومقروء.',
      deafPanelTitle: 'للشخص الأصم أو ضعيف السمع',
      deafPanelHint: 'اختر رداً سريعاً أو اكتب رسالتك لعرضها أو نطقها صوتياً.',
      liveCaptionPlaceholder: 'ستظهر الكلمات المنطوقة هنا بشكل فوري...',
      textSizeLabel: 'حجم الخط',
      autoSpeakReplies: 'نطق الردود صوتياً',
      quickRepliesTitle: 'ردود سريعة',
      replyInputPlaceholder: 'اكتب ردك هنا...',
      sendReply: 'عرض الرد',
      speakReply: 'نطق',
      latestReplyLabel: 'أحدث رد',
      emptyTranscript: 'سيظهر سجل المحادثة هنا بمجرد البدء بالكلام أو الرد.',
      speakerHearing: 'السامع',
      speakerDeaf: 'الأصم / ضعيف السمع',
      historyTitle: 'سجل المحادثة',
      visualSignGuide: 'جسر التواصل البصري ولغة الإشارة — نصوص كبيرة عالية التباين وردود بأيقونات بصرية.',
    },
    mute: {
      title: 'لوحة التواصل لغير الناطقين',
      subtitle: 'اقرأ كلام الطرف الآخر في الأعلى واضغط على البطاقات أو اكتب لينطق الجهاز بدلاً عنك.',
      listenerBoxTitle: 'كلام الشخص السامع (نص مباشر)',
      listenerBoxHint: 'استمع واعرض كلام المتحدث بنص كبير وواضح.',
      listenerPlaceholder: 'اضغط تشغيل الميكروفون لقراءة ما يقوله الطرف الآخر...',
      boardTitle: 'لوحة التواصل البصرية',
      boardSubtitle: 'اضغط على أي عبارة ليتم نطقها فوراً بصوت واضح.',
      lastSpokenLabel: 'تم النطق الآن',
      customKeyboardTitle: 'لوحة الكتابة الناطقة',
      customPlaceholder: 'اكتب أي جملة تريد نطقها بصوت مسموع...',
      speakAloud: 'انطق بصوت عالٍ',
      clearText: 'مسح',
      replayPhrase: 'إعادة',
      recentSpokenTitle: 'العبارات المنطوقة مؤخراً',
      emptyRecent: 'ستظهر العبارات التي نطقتها هنا لإعادة تشغيلها بلمسة واحدة.',
    },
    blind: {
      title: 'جسر التواصل مع المكفوفين وضعاف البصر',
      subtitle: 'تغذية صوتية كاملة مع مساحات لمسية كبيرة للرد بدون النظر إلى الشاشة.',
      audioGuideToggle: 'الدليل الصوتي',
      replayGuide: 'إعادة التوجيه الصوتي',
      guideAnnouncement:
        'تم تفعيل الوضع الصوتي الموجه. المس الجانب الأيسر للإجابة بنعم، والمس الجانب الأيمن للإجابة بلا، أو اضغط مطولاً في أي مكان للتحدث بصوتك.',
      sightedPanelTitle: 'للشخص المبصر',
      sightedPanelHint: 'اكتب رسالة أو أملِها بالصوت ليقرأها الجهاز بوضوح للمكفوف.',
      sightedInputPlaceholder: 'اكتب رسالة لقراءتها بصوت مسموع...',
      readAloudBtn: 'قراءة بصوت عالٍ',
      dictateBtn: 'إملاء صوتي',
      stopDictateBtn: 'إيقاف الإملاء',
      tactilePanelTitle: 'مساحة الرد اللمسية (بدون نظر)',
      tactilePanelHint: 'المس اليسار لـ نعم، المس اليمين لـ لا، أو اضغط مطولاً للتحدث.',
      tapLeftYes: 'المس الجانب الأيسر',
      tapRightNo: 'المس الجانب الأيمن',
      yesWord: 'نعم',
      noWord: 'لا',
      longPressTitle: 'اضغط مطولاً في أي مكان للتحدث',
      longPressHint: 'استمر بالضغط لنصف ثانية حتى تسمع النغمة ثم قل ردك.',
      holdingProgress: 'استمر بالضغط لتفعيل الرد الصوتي...',
      listeningVoiceReply: 'جاري الاستماع لردك الصوتي... المس الشاشة أو توقف للإرسال.',
      tapToFinishReply: 'إنهاء الرد الصوتي',
      keyboardShortcutHint: 'لوحة المفاتيح: Y = نعم · N = لا · ضغط مطول على المسافة = تحدث',
      conversationFeedTitle: 'سجل الحوار الصوتي',
      speakerSighted: 'المبصر',
      speakerBlind: 'الكفيف / ضعيف البصر',
      emptyFeed: 'ستظهر الرسائل المقروءة والردود اللمسية هنا.',
      brailleAudioGuide: 'دعم برايل والإشارات الصوتية — يسار: برايل ⠽ نعم · يمين: برايل ⠝ لا · ضغط مطول: تحدث',
      autoVoiceActive: 'النطق التلقائي مفعّل: أي نص أو فويس يُرسل يُشغّل صوتياً فوراً للكفيف',
      recordingVoiceClip: 'جاري تسجيل الرسالة الصوتية...',
      stopRecordingClip: 'إرسال الفويس',
      voiceClipLabel: 'رسالة صوتية',
    },
  },
};
