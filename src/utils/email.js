const crypto = require('crypto');
const logger = require('./logger');

const FROM = 'Bravely Path <noreply@blackctrans.com>';
const APP_URL = 'https://bravely-path.onrender.com';
const BACKEND_URL = 'https://clearpath-backend-marl.onrender.com/v1';

const EMAIL_STRINGS = {
  en: {
    resetSubject:   'Reset your Bravely Path password',
    resetH2:        'Reset your password',
    resetP1:        'We received a request to reset your Bravely Path password. Click the button below to choose a new one.',
    resetBtn:       'Reset password',
    resetP2:        'This link expires in <strong>1 hour</strong>. If you didn\'t request this, you can safely ignore this email.',
    footer:         'Bravely Path &mdash; Your recovery companion',
    welcomeSubject: 'Welcome to Bravely Path 💙',
    welcomeH2:      'Welcome to Bravely Path 💙',
    welcomeHi:      'Hi',
    welcomeP2:      'We\'re so glad you\'re here. Starting a recovery journey takes real courage, and Bravely Path is here to walk alongside you every step of the way.',
    welcomeH3:      'Getting started',
    welcomeLi1:     '<strong>Log cravings</strong> — track what triggers them and celebrate every resistance',
    welcomeLi2:     '<strong>AI Coach</strong> — chat 24/7 with your personal recovery coach',
    welcomeLi3:     '<strong>Track streaks</strong> — watch your sobriety streak grow day by day',
    welcomeLi4:     '<strong>Progress reports</strong> — see patterns in your recovery journey',
    crisisTitle:    '🆘 In crisis?',
    crisisText:     'The SOS button in the app connects you instantly to crisis helplines in your language — available 24/7.',
    welcomeP3:      'Take it one day at a time. You\'ve got this. 💪',
    welcomeSign:    'With care,<br>The Bravely Path team',
    checkInSubject: 'How are you doing today? 💪',
    checkInH2:      'How are you doing today? 💪',
    checkInP2:      'Your recovery journey matters. Take a moment today to check in with yourself &mdash; log a craving, celebrate a win, or just open the app and breathe.',
    checkInBtn:     'Open Bravely Path',
    checkInP3:      'Remember: every day you show up is a victory. 💙',
    checkInUnsub:   'You\'re receiving this because you opted in to daily check-in reminders in Bravely Path.',
    unsubLink:      'Unsubscribe',
  },
  fr: {
    resetSubject:   'Réinitialisez votre mot de passe Bravely Path',
    resetH2:        'Réinitialisez votre mot de passe',
    resetP1:        'Nous avons reçu une demande de réinitialisation de votre mot de passe Bravely Path. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.',
    resetBtn:       'Réinitialiser le mot de passe',
    resetP2:        'Ce lien expire dans <strong>1 heure</strong>. Si vous n\'avez pas demandé cela, vous pouvez ignorer cet e-mail.',
    footer:         'Bravely Path &mdash; Votre compagnon de rétablissement',
    welcomeSubject: 'Bienvenue sur Bravely Path 💙',
    welcomeH2:      'Bienvenue sur Bravely Path 💙',
    welcomeHi:      'Bonjour',
    welcomeP2:      'Nous sommes très heureux que vous soyez là. Commencer un parcours de rétablissement demande un vrai courage, et Bravely Path est là pour vous accompagner à chaque étape.',
    welcomeH3:      'Pour commencer',
    welcomeLi1:     '<strong>Enregistrez vos envies</strong> — suivez ce qui les déclenche et célébrez chaque résistance',
    welcomeLi2:     '<strong>Coach IA</strong> — chattez 24h/24 avec votre coach personnel en rétablissement',
    welcomeLi3:     '<strong>Suivez vos séries</strong> — regardez votre série de sobriété grandir jour après jour',
    welcomeLi4:     '<strong>Rapports de progression</strong> — visualisez les tendances dans votre parcours',
    crisisTitle:    '🆘 En crise ?',
    crisisText:     'Le bouton SOS dans l\'application vous connecte instantanément aux lignes de crise dans votre langue — disponibles 24h/24.',
    welcomeP3:      'Un jour à la fois. Vous y arriverez. 💪',
    welcomeSign:    'Avec bienveillance,<br>L\'équipe Bravely Path',
    checkInSubject: 'Comment allez-vous aujourd\'hui ? 💪',
    checkInH2:      'Comment allez-vous aujourd\'hui ? 💪',
    checkInP2:      'Votre parcours de rétablissement est important. Prenez un moment aujourd\'hui pour faire le point — enregistrez une envie, célébrez une victoire, ou ouvrez simplement l\'application et respirez.',
    checkInBtn:     'Ouvrir Bravely Path',
    checkInP3:      'Rappelez-vous : chaque jour où vous vous montrez est une victoire. 💙',
    checkInUnsub:   'Vous recevez ceci parce que vous vous êtes inscrit aux rappels quotidiens dans Bravely Path.',
    unsubLink:      'Se désabonner',
  },
  ar: {
    resetSubject:   'إعادة تعيين كلمة مرور Bravely Path',
    resetH2:        'إعادة تعيين كلمة المرور',
    resetP1:        'تلقينا طلباً لإعادة تعيين كلمة مرور Bravely Path الخاصة بك. انقر على الزر أدناه لاختيار كلمة مرور جديدة.',
    resetBtn:       'إعادة تعيين كلمة المرور',
    resetP2:        'ينتهي صلاحية هذا الرابط خلال <strong>ساعة واحدة</strong>. إذا لم تطلب ذلك، يمكنك تجاهل هذا البريد الإلكتروني بأمان.',
    footer:         'Bravely Path &mdash; رفيقك في طريق التعافي',
    welcomeSubject: 'مرحباً بك في Bravely Path 💙',
    welcomeH2:      'مرحباً بك في Bravely Path 💙',
    welcomeHi:      'مرحباً',
    welcomeP2:      'يسعدنا وجودك هنا. إن بدء رحلة التعافي يتطلب شجاعة حقيقية، وBravely Path هنا لمرافقتك في كل خطوة.',
    welcomeH3:      'للبدء',
    welcomeLi1:     '<strong>سجّل الرغبات</strong> — تتبع ما يثيرها واحتفل بكل مقاومة',
    welcomeLi2:     '<strong>مدرب الذكاء الاصطناعي</strong> — تحدث على مدار الساعة مع مدربك الشخصي',
    welcomeLi3:     '<strong>تتبع الإنجازات</strong> — شاهد سلسلة صحوتك تنمو يوماً بعد يوم',
    welcomeLi4:     '<strong>تقارير التقدم</strong> — اكتشف الأنماط في رحلة تعافيك',
    crisisTitle:    '🆘 في أزمة؟',
    crisisText:     'زر SOS في التطبيق يوصلك فوراً بخطوط الأزمات بلغتك — متاحة على مدار الساعة.',
    welcomeP3:      'يوماً واحداً في كل مرة. أنت قادر على ذلك. 💪',
    welcomeSign:    'بعناية ومحبة،<br>فريق Bravely Path',
    checkInSubject: 'كيف حالك اليوم؟ 💪',
    checkInH2:      'كيف حالك اليوم؟ 💪',
    checkInP2:      'رحلة تعافيك مهمة. خذ لحظة اليوم للتحقق من نفسك — سجّل رغبة، احتفل بإنجاز، أو افتح التطبيق فقط وتنفس.',
    checkInBtn:     'فتح Bravely Path',
    checkInP3:      'تذكر: كل يوم تحضر فيه هو انتصار. 💙',
    checkInUnsub:   'تتلقى هذا لأنك اشتركت في تذكيرات المتابعة اليومية في Bravely Path.',
    unsubLink:      'إلغاء الاشتراك',
  },
  es: {
    resetSubject:   'Restablece tu contraseña de Bravely Path',
    resetH2:        'Restablece tu contraseña',
    resetP1:        'Recibimos una solicitud para restablecer tu contraseña de Bravely Path. Haz clic en el botón de abajo para elegir una nueva.',
    resetBtn:       'Restablecer contraseña',
    resetP2:        'Este enlace expira en <strong>1 hora</strong>. Si no solicitaste esto, puedes ignorar este correo con seguridad.',
    footer:         'Bravely Path &mdash; Tu compañero de recuperación',
    welcomeSubject: 'Bienvenido/a a Bravely Path 💙',
    welcomeH2:      'Bienvenido/a a Bravely Path 💙',
    welcomeHi:      'Hola',
    welcomeP2:      'Nos alegra mucho que estés aquí. Comenzar un camino de recuperación requiere un valor real, y Bravely Path está aquí para acompañarte en cada paso.',
    welcomeH3:      'Cómo empezar',
    welcomeLi1:     '<strong>Registra antojos</strong> — rastrea qué los desencadena y celebra cada resistencia',
    welcomeLi2:     '<strong>Coach de IA</strong> — chatea las 24 horas con tu coach personal de recuperación',
    welcomeLi3:     '<strong>Sigue rachas</strong> — mira crecer tu racha de sobriedad día a día',
    welcomeLi4:     '<strong>Informes de progreso</strong> — ve los patrones en tu viaje de recuperación',
    crisisTitle:    '🆘 ¿En crisis?',
    crisisText:     'El botón SOS en la app te conecta instantáneamente con líneas de crisis en tu idioma — disponibles las 24 horas.',
    welcomeP3:      'Un día a la vez. Tú puedes. 💪',
    welcomeSign:    'Con cariño,<br>El equipo de Bravely Path',
    checkInSubject: '¿Cómo estás hoy? 💪',
    checkInH2:      '¿Cómo estás hoy? 💪',
    checkInP2:      'Tu camino de recuperación importa. Tómate un momento hoy para hacer una pausa — registra un antojo, celebra un logro, o simplemente abre la app y respira.',
    checkInBtn:     'Abrir Bravely Path',
    checkInP3:      'Recuerda: cada día que apareces es una victoria. 💙',
    checkInUnsub:   'Recibes esto porque activaste los recordatorios diarios en Bravely Path.',
    unsubLink:      'Cancelar suscripción',
  },
  pt: {
    resetSubject:   'Redefina sua senha do Bravely Path',
    resetH2:        'Redefina sua senha',
    resetP1:        'Recebemos uma solicitação para redefinir sua senha do Bravely Path. Clique no botão abaixo para escolher uma nova.',
    resetBtn:       'Redefinir senha',
    resetP2:        'Este link expira em <strong>1 hora</strong>. Se você não solicitou isso, pode ignorar este e-mail com segurança.',
    footer:         'Bravely Path &mdash; Seu companheiro de recuperação',
    welcomeSubject: 'Bem-vindo(a) ao Bravely Path 💙',
    welcomeH2:      'Bem-vindo(a) ao Bravely Path 💙',
    welcomeHi:      'Olá',
    welcomeP2:      'Estamos muito felizes que você está aqui. Começar uma jornada de recuperação exige real coragem, e o Bravely Path está aqui para caminhar ao seu lado em cada passo.',
    welcomeH3:      'Como começar',
    welcomeLi1:     '<strong>Registre desejos</strong> — acompanhe o que os desencadeia e celebre cada resistência',
    welcomeLi2:     '<strong>Coach de IA</strong> — converse 24h com seu coach pessoal de recuperação',
    welcomeLi3:     '<strong>Acompanhe sequências</strong> — veja sua sequência de sobriedade crescer dia a dia',
    welcomeLi4:     '<strong>Relatórios de progresso</strong> — veja padrões na sua jornada de recuperação',
    crisisTitle:    '🆘 Em crise?',
    crisisText:     'O botão SOS no app conecta você instantaneamente a linhas de crise no seu idioma — disponíveis 24h.',
    welcomeP3:      'Um dia de cada vez. Você consegue. 💪',
    welcomeSign:    'Com carinho,<br>A equipe Bravely Path',
    checkInSubject: 'Como você está hoje? 💪',
    checkInH2:      'Como você está hoje? 💪',
    checkInP2:      'Sua jornada de recuperação importa. Reserve um momento hoje para se verificar — registre um desejo, celebre uma conquista, ou simplesmente abra o app e respire.',
    checkInBtn:     'Abrir Bravely Path',
    checkInP3:      'Lembre-se: cada dia que você aparece é uma vitória. 💙',
    checkInUnsub:   'Você recebe isto porque optou por lembretes diários no Bravely Path.',
    unsubLink:      'Cancelar inscrição',
  },
  de: {
    resetSubject:   'Setze dein Bravely Path-Passwort zurück',
    resetH2:        'Passwort zurücksetzen',
    resetP1:        'Wir haben eine Anfrage erhalten, dein Bravely Path-Passwort zurückzusetzen. Klicke auf den Button unten, um ein neues zu wählen.',
    resetBtn:       'Passwort zurücksetzen',
    resetP2:        'Dieser Link läuft in <strong>1 Stunde</strong> ab. Wenn du das nicht angefordert hast, kannst du diese E-Mail einfach ignorieren.',
    footer:         'Bravely Path &mdash; Dein Genesungsbegleiter',
    welcomeSubject: 'Willkommen bei Bravely Path 💙',
    welcomeH2:      'Willkommen bei Bravely Path 💙',
    welcomeHi:      'Hallo',
    welcomeP2:      'Wir freuen uns sehr, dass du da bist. Eine Genesungsreise zu beginnen erfordert echten Mut, und Bravely Path ist hier, um dich bei jedem Schritt zu begleiten.',
    welcomeH3:      'Erste Schritte',
    welcomeLi1:     '<strong>Heißhunger protokollieren</strong> — verfolge, was sie auslöst, und feiere jeden Widerstand',
    welcomeLi2:     '<strong>KI-Coach</strong> — chatte rund um die Uhr mit deinem persönlichen Genesungscoach',
    welcomeLi3:     '<strong>Strähnen verfolgen</strong> — beobachte, wie deine Nüchternheitssträhne täglich wächst',
    welcomeLi4:     '<strong>Fortschrittsberichte</strong> — sieh Muster auf deiner Genesungsreise',
    crisisTitle:    '🆘 In der Krise?',
    crisisText:     'Der SOS-Button in der App verbindet dich sofort mit Krisentelefonen in deiner Sprache — rund um die Uhr verfügbar.',
    welcomeP3:      'Nehme es einen Tag nach dem anderen. Du schaffst das. 💪',
    welcomeSign:    'Mit Fürsorge,<br>Das Bravely Path-Team',
    checkInSubject: 'Wie geht es dir heute? 💪',
    checkInH2:      'Wie geht es dir heute? 💪',
    checkInP2:      'Deine Genesungsreise ist wichtig. Nimm dir heute einen Moment — protokolliere einen Heißhunger, feiere einen Erfolg, oder öffne einfach die App und atme.',
    checkInBtn:     'Bravely Path öffnen',
    checkInP3:      'Denk daran: Jeder Tag, an dem du auftauchst, ist ein Sieg. 💙',
    checkInUnsub:   'Du erhältst dies, weil du tägliche Check-in-Erinnerungen in Bravely Path aktiviert hast.',
    unsubLink:      'Abmelden',
  },
  it: {
    resetSubject:   'Reimposta la tua password di Bravely Path',
    resetH2:        'Reimposta la tua password',
    resetP1:        'Abbiamo ricevuto una richiesta di reimpostazione della tua password di Bravely Path. Clicca sul pulsante qui sotto per sceglierne una nuova.',
    resetBtn:       'Reimposta password',
    resetP2:        'Questo link scade tra <strong>1 ora</strong>. Se non hai richiesto questo, puoi ignorare questa email.',
    footer:         'Bravely Path &mdash; Il tuo compagno di recupero',
    welcomeSubject: 'Benvenuto/a su Bravely Path 💙',
    welcomeH2:      'Benvenuto/a su Bravely Path 💙',
    welcomeHi:      'Ciao',
    welcomeP2:      'Siamo felici che tu sia qui. Iniziare un percorso di recupero richiede vero coraggio, e Bravely Path è qui per accompagnarti ad ogni passo.',
    welcomeH3:      'Come iniziare',
    welcomeLi1:     '<strong>Registra i craving</strong> — tieni traccia di cosa li scatena e celebra ogni resistenza',
    welcomeLi2:     '<strong>Coach AI</strong> — chatta 24h con il tuo coach personale di recupero',
    welcomeLi3:     '<strong>Tieni traccia delle serie</strong> — guarda la tua serie di sobrietà crescere giorno dopo giorno',
    welcomeLi4:     '<strong>Report di progresso</strong> — visualizza i pattern nel tuo percorso',
    crisisTitle:    '🆘 In crisi?',
    crisisText:     'Il pulsante SOS nell\'app ti collega istantaneamente alle linee di crisi nella tua lingua — disponibili 24h/24.',
    welcomeP3:      'Un giorno alla volta. Ce la fai. 💪',
    welcomeSign:    'Con cura,<br>Il team di Bravely Path',
    checkInSubject: 'Come stai oggi? 💪',
    checkInH2:      'Come stai oggi? 💪',
    checkInP2:      'Il tuo percorso di recupero è importante. Prenditi un momento oggi per fare il punto — registra un craving, celebra un successo, o semplicemente apri l\'app e respira.',
    checkInBtn:     'Apri Bravely Path',
    checkInP3:      'Ricorda: ogni giorno in cui ti presenti è una vittoria. 💙',
    checkInUnsub:   'Stai ricevendo questo perché hai attivato i promemoria giornalieri in Bravely Path.',
    unsubLink:      'Annulla iscrizione',
  },
  ro: {
    resetSubject:   'Resetează-ți parola Bravely Path',
    resetH2:        'Resetează-ți parola',
    resetP1:        'Am primit o solicitare de resetare a parolei tale Bravely Path. Apasă butonul de mai jos pentru a alege una nouă.',
    resetBtn:       'Resetează parola',
    resetP2:        'Acest link expiră în <strong>1 oră</strong>. Dacă nu ai solicitat asta, poți ignora în siguranță acest email.',
    footer:         'Bravely Path &mdash; Companionul tău de recuperare',
    welcomeSubject: 'Bun venit la Bravely Path 💙',
    welcomeH2:      'Bun venit la Bravely Path 💙',
    welcomeHi:      'Bună',
    welcomeP2:      'Suntem atât de bucuroși că ești aici. A începe o călătorie de recuperare necesită un curaj real, iar Bravely Path este aici pentru a fi alături de tine la fiecare pas.',
    welcomeH3:      'Primii pași',
    welcomeLi1:     '<strong>Înregistrează poftele</strong> — urmărește ce le declanșează și celebrează fiecare rezistență',
    welcomeLi2:     '<strong>Coach AI</strong> — conversează 24/7 cu antrenorul tău personal de recuperare',
    welcomeLi3:     '<strong>Urmărește seriile</strong> — privește cum crește seria ta de sobrietate zi de zi',
    welcomeLi4:     '<strong>Rapoarte de progres</strong> — descoperă tiparele în călătoria ta de recuperare',
    crisisTitle:    '🆘 În criză?',
    crisisText:     'Butonul SOS din aplicație te conectează instantaneu la linii de criză în limba ta — disponibile 24/7.',
    welcomeP3:      'O zi pe rând. Poți face asta. 💪',
    welcomeSign:    'Cu grijă,<br>Echipa Bravely Path',
    checkInSubject: 'Cum te simți astăzi? 💪',
    checkInH2:      'Cum te simți astăzi? 💪',
    checkInP2:      'Călătoria ta de recuperare contează. Ia-ți un moment astăzi să te verifici — înregistrează o poftă, celebrează o victorie, sau pur și simplu deschide aplicația și respiră.',
    checkInBtn:     'Deschide Bravely Path',
    checkInP3:      'Amintește-ți: fiecare zi în care apari este o victorie. 💙',
    checkInUnsub:   'Primești asta pentru că ai activat memento-urile zilnice în Bravely Path.',
    unsubLink:      'Dezabonare',
  },
  nl: {
    resetSubject:   'Stel je Bravely Path wachtwoord opnieuw in',
    resetH2:        'Stel je wachtwoord opnieuw in',
    resetP1:        'We hebben een verzoek ontvangen om je Bravely Path wachtwoord opnieuw in te stellen. Klik op de knop hieronder om een nieuw wachtwoord te kiezen.',
    resetBtn:       'Wachtwoord opnieuw instellen',
    resetP2:        'Deze link verloopt na <strong>1 uur</strong>. Als je dit niet hebt aangevraagd, kun je deze e-mail veilig negeren.',
    footer:         'Bravely Path &mdash; Jouw herstelgezel',
    welcomeSubject: 'Welkom bij Bravely Path 💙',
    welcomeH2:      'Welkom bij Bravely Path 💙',
    welcomeHi:      'Hallo',
    welcomeP2:      'We zijn zo blij dat je er bent. Een herstelreis beginnen vraagt echte moed, en Bravely Path is er om je bij elke stap te begeleiden.',
    welcomeH3:      'Aan de slag',
    welcomeLi1:     '<strong>Registreer cravings</strong> — volg wat ze veroorzaakt en vier elke weerstand',
    welcomeLi2:     '<strong>AI Coach</strong> — chat 24/7 met je persoonlijke herstelcoach',
    welcomeLi3:     '<strong>Volg series</strong> — zie je nuchtere serie dag na dag groeien',
    welcomeLi4:     '<strong>Voortgangsrapporten</strong> — zie patronen in je herstelreis',
    crisisTitle:    '🆘 In crisis?',
    crisisText:     'De SOS-knop in de app verbindt je direct met crisislijnen in jouw taal — 24/7 beschikbaar.',
    welcomeP3:      'Één dag tegelijk. Jij kunt dit. 💪',
    welcomeSign:    'Met zorg,<br>Het Bravely Path team',
    checkInSubject: 'Hoe gaat het vandaag? 💪',
    checkInH2:      'Hoe gaat het vandaag? 💪',
    checkInP2:      'Jouw herstelreis is belangrijk. Neem vandaag even de tijd om bij jezelf in te checken — registreer een craving, vier een overwinning, of open gewoon de app en adem.',
    checkInBtn:     'Bravely Path openen',
    checkInP3:      'Onthoud: elke dag dat je er bent is een overwinning. 💙',
    checkInUnsub:   'Je ontvangt dit omdat je dagelijkse herinneringen hebt ingeschakeld in Bravely Path.',
    unsubLink:      'Afmelden',
  },
  pl: {
    resetSubject:   'Zresetuj hasło do Bravely Path',
    resetH2:        'Zresetuj hasło',
    resetP1:        'Otrzymaliśmy prośbę o zresetowanie hasła do Bravely Path. Kliknij przycisk poniżej, aby wybrać nowe hasło.',
    resetBtn:       'Zresetuj hasło',
    resetP2:        'Ten link wygasa po <strong>1 godzinie</strong>. Jeśli nie prosiłeś o to, możesz bezpiecznie zignorować tę wiadomość.',
    footer:         'Bravely Path &mdash; Twój towarzysz zdrowienia',
    welcomeSubject: 'Witaj w Bravely Path 💙',
    welcomeH2:      'Witaj w Bravely Path 💙',
    welcomeHi:      'Cześć',
    welcomeP2:      'Cieszymy się, że tu jesteś. Rozpoczęcie drogi do zdrowia wymaga prawdziwej odwagi, a Bravely Path jest tu, by towarzyszyć Ci na każdym kroku.',
    welcomeH3:      'Jak zacząć',
    welcomeLi1:     '<strong>Zapisuj zachcianki</strong> — śledź, co je wywołuje, i świętuj każde opory',
    welcomeLi2:     '<strong>Coach AI</strong> — rozmawiaj 24/7 ze swoim osobistym coachem od zdrowienia',
    welcomeLi3:     '<strong>Śledź serie</strong> — obserwuj, jak Twoja seria trzeźwości rośnie dzień po dniu',
    welcomeLi4:     '<strong>Raporty postępu</strong> — dostrzegaj wzorce w swojej drodze do zdrowia',
    crisisTitle:    '🆘 W kryzysie?',
    crisisText:     'Przycisk SOS w aplikacji łączy Cię natychmiast z liniami kryzysowymi w Twoim języku — dostępne 24/7.',
    welcomeP3:      'Jeden dzień na raz. Dasz radę. 💪',
    welcomeSign:    'Z troską,<br>Zespół Bravely Path',
    checkInSubject: 'Jak się dziś masz? 💪',
    checkInH2:      'Jak się dziś masz? 💪',
    checkInP2:      'Twoja droga do zdrowia ma znaczenie. Znajdź dziś chwilę dla siebie — zapisz zachciankę, świętuj sukces, albo po prostu otwórz aplikację i oddychaj.',
    checkInBtn:     'Otwórz Bravely Path',
    checkInP3:      'Pamiętaj: każdy dzień, w którym się pojawiasz, jest zwycięstwem. 💙',
    checkInUnsub:   'Otrzymujesz to, ponieważ włączyłeś codzienne przypomnienia w Bravely Path.',
    unsubLink:      'Wypisz się',
  },
  tr: {
    resetSubject:   'Bravely Path şifrenizi sıfırlayın',
    resetH2:        'Şifrenizi sıfırlayın',
    resetP1:        'Bravely Path şifrenizi sıfırlama talebini aldık. Yeni bir şifre seçmek için aşağıdaki butona tıklayın.',
    resetBtn:       'Şifreyi sıfırla',
    resetP2:        'Bu bağlantı <strong>1 saat</strong> içinde sona erer. Bunu siz istemediyseniz, bu e-postayı güvenle yoksayabilirsiniz.',
    footer:         'Bravely Path &mdash; İyileşme yol arkadaşınız',
    welcomeSubject: 'Bravely Path\'e hoş geldiniz 💙',
    welcomeH2:      'Bravely Path\'e hoş geldiniz 💙',
    welcomeHi:      'Merhaba',
    welcomeP2:      'Burada olduğunuz için çok mutluyuz. Bir iyileşme yolculuğuna başlamak gerçek cesaret gerektirir ve Bravely Path her adımda yanınızda olmak için burada.',
    welcomeH3:      'Nasıl başlanır',
    welcomeLi1:     '<strong>Aşermeleri kaydedin</strong> — neyin tetiklediğini takip edin ve her direnişi kutlayın',
    welcomeLi2:     '<strong>Yapay Zeka Koçu</strong> — kişisel iyileşme koçunuzla 7/24 sohbet edin',
    welcomeLi3:     '<strong>Serileri takip edin</strong> — ayıklık serinizin gün geçtikçe büyümesini izleyin',
    welcomeLi4:     '<strong>İlerleme raporları</strong> — iyileşme yolculuğunuzdaki kalıpları görün',
    crisisTitle:    '🆘 Kriz mi yaşıyorsunuz?',
    crisisText:     'Uygulamadaki SOS butonu sizi anında kendi dilinizde kriz hatlarına bağlar — 7/24 mevcut.',
    welcomeP3:      'Bir günde bir adım. Başarabilirsiniz. 💪',
    welcomeSign:    'Sevgiyle,<br>Bravely Path ekibi',
    checkInSubject: 'Bugün nasılsınız? 💪',
    checkInH2:      'Bugün nasılsınız? 💪',
    checkInP2:      'İyileşme yolculuğunuz önemlidir. Bugün kendinizi kontrol etmek için bir dakika ayırın — bir aşerme kaydedin, bir başarıyı kutlayın veya uygulamayı açın ve nefes alın.',
    checkInBtn:     'Bravely Path\'i aç',
    checkInP3:      'Unutmayın: Göründüğünüz her gün bir zaferdir. 💙',
    checkInUnsub:   'Bravely Path\'te günlük hatırlatıcıları etkinleştirdiğiniz için bunu alıyorsunuz.',
    unsubLink:      'Abonelikten çık',
  },
};

function getLang(locale) {
  if (!locale) return 'en';
  const code = locale.split('-')[0].toLowerCase();
  return EMAIL_STRINGS[code] ? code : 'en';
}

function getS(locale) {
  return EMAIL_STRINGS[getLang(locale)];
}

async function send({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn(`RESEND_API_KEY not set — skipping email to ${to}`);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
    if (!res.ok) {
      const text = await res.text();
      logger.error(`Resend ${res.status} sending to ${to}: ${text}`);
    }
  } catch (err) {
    logger.error(`Resend network error sending to ${to}:`, err);
  }
}

function makeUnsubToken(userId) {
  return crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'fallback')
    .update(userId)
    .digest('hex');
}

function verifyUnsubToken(userId, token) {
  return token === makeUnsubToken(userId);
}

async function sendPasswordReset(to, token, locale) {
  const s = getS(locale);
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  await send({
    to,
    subject: s.resetSubject,
    html: `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff">
  <h2 style="color:#4F46E5;margin-top:0">${s.resetH2}</h2>
  <p style="color:#374151">${s.resetP1}</p>
  <a href="${resetUrl}" style="display:inline-block;margin:24px 0;background:#4F46E5;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
    ${s.resetBtn}
  </a>
  <p style="color:#6B7280;font-size:13px">${s.resetP2}</p>
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:28px 0">
  <p style="color:#9CA3AF;font-size:12px;margin:0">${s.footer}</p>
</div>`,
  });
}

async function sendWelcome(to, name, locale) {
  const s = getS(locale);
  await send({
    to,
    subject: s.welcomeSubject,
    html: `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff">
  <h2 style="color:#4F46E5;margin-top:0">${s.welcomeH2}</h2>
  <p style="color:#374151">${s.welcomeHi} ${name || ''},</p>
  <p style="color:#374151">${s.welcomeP2}</p>
  <h3 style="color:#374151;margin-top:28px">${s.welcomeH3}</h3>
  <ul style="color:#374151;line-height:2;padding-left:20px">
    <li>${s.welcomeLi1}</li>
    <li>${s.welcomeLi2}</li>
    <li>${s.welcomeLi3}</li>
    <li>${s.welcomeLi4}</li>
  </ul>
  <div style="background:#FEF3C7;border-radius:10px;padding:16px 20px;margin:24px 0">
    <strong style="color:#92400E">${s.crisisTitle}</strong>
    <p style="margin:8px 0 0;color:#92400E;font-size:14px">${s.crisisText}</p>
  </div>
  <p style="color:#374151">${s.welcomeP3}</p>
  <p style="color:#6B7280">${s.welcomeSign}</p>
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:28px 0">
  <p style="color:#9CA3AF;font-size:12px;margin:0">${s.footer}</p>
</div>`,
  });
}

async function sendDailyCheckIn(to, name, userId, locale) {
  const s = getS(locale);
  const token = makeUnsubToken(userId);
  const unsubUrl = `${BACKEND_URL}/auth/unsubscribe?id=${userId}&token=${token}`;
  await send({
    to,
    subject: s.checkInSubject,
    html: `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff">
  <h2 style="color:#4F46E5;margin-top:0">${s.checkInH2}</h2>
  <p style="color:#374151">${s.welcomeHi} ${name || ''},</p>
  <p style="color:#374151">${s.checkInP2}</p>
  <a href="${APP_URL}" style="display:inline-block;margin:24px 0;background:#4F46E5;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
    ${s.checkInBtn}
  </a>
  <p style="color:#6B7280;font-size:13px">${s.checkInP3}</p>
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:28px 0">
  <p style="color:#9CA3AF;font-size:11px;margin:0">
    ${s.checkInUnsub}<br>
    <a href="${unsubUrl}" style="color:#9CA3AF">${s.unsubLink}</a>
  </p>
</div>`,
  });
}

module.exports = { sendPasswordReset, sendWelcome, sendDailyCheckIn, makeUnsubToken, verifyUnsubToken };
