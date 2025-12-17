"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { pickLocale } from "@/i18n/locale-utils";

type DocType = "terms" | "privacy";

export function LegalAgreements({
  locale,
  checked,
  onCheckedChange,
}: {
  locale: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [doc, setDoc] = useState<DocType>("terms");

  const copy = useMemo(() => {
    return pickLocale(locale, {
      zh: {
        labelPrefix: "我已阅读并同意",
        labelSuffix: "",
        terms: "《用户协议》",
        privacy: "《隐私政策》",
        and: "与",
        required: "请先同意用户协议与隐私政策",
        termsTitle: "用户协议",
        termsDesc: "使用本服务前请仔细阅读以下条款。",
        privacyTitle: "隐私政策",
        privacyDesc: "我们如何收集、使用与保护你的信息。",
        close: "我已了解",
        termsBody: [
          "1. 服务内容：本服务提供音频处理与分析功能（例如去伴奏、去混响、BPM/调性分析）。",
          "2. 账号与安全：你需对账号活动负责，请妥善保管登录凭证。",
          "3. 使用规范：禁止上传违法、侵权、恶意内容；禁止对服务进行逆向、攻击或滥用。",
          "4. 处理结果：算法输出仅供参考，可能因音频质量、编曲复杂度等原因产生误差。",
          "5. 内容权利：你应确保对上传音频拥有合法授权；如因侵权产生纠纷由你自行承担。",
          "6. 服务调整：我们可能对功能、限额、接口进行升级或调整，并在必要时进行通知。",
          "7. 免责声明：在法律允许范围内，我们不对间接损失、数据丢失等承担责任。",
        ],
        privacyBody: [
          "1. 收集的信息：账号信息（如邮箱）、使用日志（必要的安全与性能信息）、以及你提交的音频文件与处理结果链接。",
          "2. 使用目的：用于提供与改进服务、完成音频处理任务、展示历史记录（如你启用）。",
          "3. 存储与保留：上传文件与处理输出用于任务执行与下载，默认保留不超过 24 小时后自动清理。",
          "4. 分享与披露：除法律要求或你授权外，我们不会向第三方出售你的个人信息。",
          "5. 安全：我们采取合理措施保护数据，但无法保证绝对安全。",
          "6. 你的权利：你可以随时注销、清理历史记录或联系我们删除数据（在可行范围内）。",
        ],
      },
      en: {
        labelPrefix: "I have read and agree to the",
        labelSuffix: ".",
        terms: "User Agreement",
        privacy: "Privacy Policy",
        and: "and",
        required: "Please accept the User Agreement and Privacy Policy",
        termsTitle: "User Agreement",
        termsDesc: "Please read these terms carefully before using the service.",
        privacyTitle: "Privacy Policy",
        privacyDesc: "How we collect, use, and protect your information.",
        close: "Got it",
        termsBody: [
          "1. Service: Audio processing and analysis (demix, dereverb, BPM/key, etc.).",
          "2. Account: You are responsible for activity under your account.",
          "3. Acceptable use: No illegal, infringing, or abusive content; no attacks or misuse.",
          "4. Outputs: Results are best-effort and may be inaccurate depending on input quality.",
          "5. Rights: You must have rights/permission to upload the audio.",
          "6. Changes: We may update features, quotas, or APIs when needed.",
          "7. Disclaimer: To the extent permitted by law, we are not liable for indirect damages.",
        ],
        privacyBody: [
          "1. Data we collect: account info (e.g., email), necessary logs, uploaded audio and output links.",
          "2. Purpose: provide and improve the service, run processing jobs, and show history if enabled.",
          "3. Retention: uploads and outputs are stored for execution/download and cleaned up within 24 hours by default.",
          "4. Sharing: we do not sell personal data; disclosure only when required by law or with your consent.",
          "5. Security: we use reasonable safeguards but cannot guarantee absolute security.",
          "6. Your rights: you can delete history or request deletion within reasonable scope.",
        ],
      },
      ja: {
        labelPrefix: "私は",
        labelSuffix: "に同意します。",
        terms: "利用規約",
        privacy: "プライバシーポリシー",
        and: "および",
        required: "利用規約とプライバシーポリシーに同意してください",
        termsTitle: "利用規約",
        termsDesc: "ご利用前に必ずお読みください。",
        privacyTitle: "プライバシーポリシー",
        privacyDesc: "情報の収集・利用・保護について。",
        close: "確認しました",
        termsBody: [
          "1. サービス：音声処理・解析（伴奏分離、リバーブ除去、BPM/キー解析など）を提供します。",
          "2. アカウント：アカウントの利用は利用者の責任で管理してください。",
          "3. 禁止事項：違法・侵害・悪用コンテンツのアップロード、攻撃や不正利用を禁止します。",
          "4. 出力：結果は参考値であり、音質や編曲により誤差が生じる場合があります。",
          "5. 権利：アップロードする音声の権利・許諾を確保してください。",
          "6. 変更：機能・制限・API は必要に応じて更新されます。",
          "7. 免責：法令の範囲で間接損害等の責任を負いません。",
        ],
        privacyBody: [
          "1. 収集情報：メール等のアカウント情報、必要なログ、音声ファイルと出力リンク。",
          "2. 利用目的：サービス提供・改善、処理ジョブの実行、履歴表示（有効時）。",
          "3. 保管期間：アップロードと出力は実行/ダウンロードのため保管し、既定で 24 時間以内に削除します。",
          "4. 第三者提供：法令や同意がある場合を除き販売しません。",
          "5. セキュリティ：合理的な対策を行いますが完全な安全は保証できません。",
          "6. 権利：履歴削除や削除依頼が可能です（合理的範囲）。",
        ],
      },
      ko: {
        labelPrefix: "나는",
        labelSuffix: "에 동의합니다.",
        terms: "이용약관",
        privacy: "개인정보 처리방침",
        and: "및",
        required: "이용약관과 개인정보 처리방침에 동의해 주세요",
        termsTitle: "이용약관",
        termsDesc: "서비스 이용 전 아래 약관을 주의 깊게 읽어 주세요.",
        privacyTitle: "개인정보 처리방침",
        privacyDesc: "우리가 정보를 수집·이용·보호하는 방법.",
        close: "확인했습니다",
        termsBody: [
          "1. 서비스: 음성 처리 및 분석(보컬/반주 분리, 디리버브, BPM/키 분석 등)을 제공합니다.",
          "2. 계정: 계정 활동에 대한 책임은 사용자에게 있습니다.",
          "3. 이용 규정: 불법/권리침해/악성 콘텐츠 업로드 금지; 공격, 역공학, 남용 금지.",
          "4. 결과: 결과는 참고용이며 입력 품질 등에 따라 오차가 있을 수 있습니다.",
          "5. 권리: 오디오 업로드에 필요한 권리/허가를 보유해야 합니다.",
          "6. 변경: 필요 시 기능, 제한, API가 업데이트될 수 있습니다.",
          "7. 면책: 법이 허용하는 범위 내에서 간접 손해 및 데이터 손실 등에 대해 책임지지 않습니다.",
        ],
        privacyBody: [
          "1. 수집 정보: 계정 정보(예: 이메일), 필요한 로그, 업로드한 오디오 및 출력 링크.",
          "2. 목적: 서비스 제공 및 개선, 처리 작업 실행, (활성화 시) 기록 표시.",
          "3. 보관: 업로드/출력은 실행·다운로드를 위해 보관되며 기본적으로 24시간 이내 정리됩니다.",
          "4. 공유: 법적 요구 또는 동의가 없는 한 개인 정보를 판매하지 않습니다.",
          "5. 보안: 합리적 보호 조치를 취하지만 완전한 보안을 보장할 수는 없습니다.",
          "6. 권리: 기록 삭제 또는 합리적 범위 내 데이터 삭제를 요청할 수 있습니다.",
        ],
      },
      ru: {
        labelPrefix: "Я прочитал(а) и принимаю",
        labelSuffix: ".",
        terms: "Пользовательское соглашение",
        privacy: "Политику конфиденциальности",
        and: "и",
        required: "Пожалуйста, примите Пользовательское соглашение и Политику конфиденциальности",
        termsTitle: "Пользовательское соглашение",
        termsDesc: "Пожалуйста, внимательно прочитайте условия перед использованием сервиса.",
        privacyTitle: "Политика конфиденциальности",
        privacyDesc: "Как мы собираем, используем и защищаем вашу информацию.",
        close: "Понятно",
        termsBody: [
          "1. Сервис: обработка и анализ аудио (demix, dereverb, BPM/тональность и т. д.).",
          "2. Аккаунт: вы несёте ответственность за действия в вашем аккаунте.",
          "3. Допустимое использование: запрет незаконного/нарушающего права/вредоносного контента; запрет атак и злоупотреблений.",
          "4. Результаты: результаты носят оценочный характер и могут быть неточными из‑за качества входных данных.",
          "5. Права: вы должны иметь права/разрешение на загрузку аудио.",
          "6. Изменения: мы можем обновлять функции, лимиты или API при необходимости.",
          "7. Отказ от ответственности: в пределах закона мы не отвечаем за косвенные убытки и потерю данных.",
        ],
        privacyBody: [
          "1. Какие данные: информация аккаунта (например, email), необходимые логи, загруженное аудио и ссылки на результаты.",
          "2. Зачем: предоставление и улучшение сервиса, выполнение задач обработки, отображение истории (если включено).",
          "3. Хранение: загрузки и результаты сохраняются для выполнения/скачивания и по умолчанию удаляются в течение 24 часов.",
          "4. Передача: мы не продаём персональные данные; раскрытие — только по закону или с вашего согласия.",
          "5. Безопасность: применяем разумные меры защиты, но не гарантируем абсолютную безопасность.",
          "6. Ваши права: вы можете удалить историю или запросить удаление данных в разумных пределах.",
        ],
      },
      de: {
        labelPrefix: "Ich habe die",
        labelSuffix: "gelesen und stimme zu.",
        terms: "Nutzungsbedingungen",
        privacy: "Datenschutzerklärung",
        and: "und die",
        required: "Bitte akzeptiere die Nutzungsbedingungen und die Datenschutzerklärung",
        termsTitle: "Nutzungsbedingungen",
        termsDesc: "Bitte lies diese Bedingungen vor der Nutzung sorgfältig durch.",
        privacyTitle: "Datenschutzerklärung",
        privacyDesc: "Wie wir Informationen erfassen, nutzen und schützen.",
        close: "Verstanden",
        termsBody: [
          "1. Dienst: Audioverarbeitung und -analyse (Demix, Dereverb, BPM/Tonart usw.).",
          "2. Konto: Du bist verantwortlich für Aktivitäten unter deinem Konto.",
          "3. Zulässige Nutzung: Keine illegalen, rechtsverletzenden oder missbräuchlichen Inhalte; keine Angriffe oder Reverse Engineering.",
          "4. Ergebnisse: Ergebnisse sind Best-Effort und können je nach Eingabequalität ungenau sein.",
          "5. Rechte: Du musst die Rechte/Berechtigung zum Hochladen des Audios besitzen.",
          "6. Änderungen: Wir können Funktionen, Kontingente oder APIs bei Bedarf anpassen.",
          "7. Haftungsausschluss: Soweit gesetzlich zulässig, keine Haftung für indirekte Schäden oder Datenverlust.",
        ],
        privacyBody: [
          "1. Erhobene Daten: Kontoinfos (z. B. E‑Mail), notwendige Logs, hochgeladene Audios und Ergebnislinks.",
          "2. Zweck: Service bereitstellen/verbessern, Jobs ausführen, Verlauf anzeigen (falls aktiviert).",
          "3. Aufbewahrung: Uploads/Outputs werden für Ausführung/Download gespeichert und standardmäßig innerhalb von 24 Stunden bereinigt.",
          "4. Weitergabe: Wir verkaufen keine personenbezogenen Daten; Offenlegung nur gesetzlich erforderlich oder mit Einwilligung.",
          "5. Sicherheit: Wir nutzen angemessene Schutzmaßnahmen, können aber keine absolute Sicherheit garantieren.",
          "6. Rechte: Du kannst den Verlauf löschen oder Löschung im angemessenen Umfang anfordern.",
        ],
      },
      pt: {
        labelPrefix: "Li e concordo com os",
        labelSuffix: ".",
        terms: "Termos de Uso",
        privacy: "Política de Privacidade",
        and: "e a",
        required: "Por favor, aceite os Termos de Uso e a Política de Privacidade",
        termsTitle: "Termos de Uso",
        termsDesc: "Leia estes termos com atenção antes de usar o serviço.",
        privacyTitle: "Política de Privacidade",
        privacyDesc: "Como coletamos, usamos e protegemos suas informações.",
        close: "Entendi",
        termsBody: [
          "1. Serviço: processamento e análise de áudio (demix, dereverb, BPM/tom etc.).",
          "2. Conta: você é responsável pelas atividades na sua conta.",
          "3. Uso aceitável: não envie conteúdo ilegal, infrator ou abusivo; não ataque nem abuse do serviço.",
          "4. Resultados: são melhores esforços e podem ser imprecisos conforme a qualidade do áudio.",
          "5. Direitos: você deve ter direitos/permissão para enviar o áudio.",
          "6. Mudanças: podemos atualizar recursos, limites ou APIs quando necessário.",
          "7. Isenção: na medida permitida por lei, não nos responsabilizamos por danos indiretos.",
        ],
        privacyBody: [
          "1. Dados coletados: info da conta (ex.: e‑mail), logs necessários, áudio enviado e links de saída.",
          "2. Finalidade: fornecer e melhorar o serviço, executar tarefas e mostrar histórico se habilitado.",
          "3. Retenção: uploads e saídas ficam armazenados para execução/download e são limpos em até 24 horas por padrão.",
          "4. Compartilhamento: não vendemos dados pessoais; divulgamos apenas por lei ou com seu consentimento.",
          "5. Segurança: usamos medidas razoáveis, mas não garantimos segurança absoluta.",
          "6. Seus direitos: você pode apagar o histórico ou solicitar exclusão dentro de um escopo razoável.",
        ],
      },
      it: {
        labelPrefix: "Ho letto e accetto i",
        labelSuffix: ".",
        terms: "Termini di utilizzo",
        privacy: "Informativa sulla privacy",
        and: "e l’",
        required: "Accetta i Termini di utilizzo e l’Informativa sulla privacy",
        termsTitle: "Termini di utilizzo",
        termsDesc: "Leggi attentamente questi termini prima di usare il servizio.",
        privacyTitle: "Informativa sulla privacy",
        privacyDesc: "Come raccogliamo, utilizziamo e proteggiamo le tue informazioni.",
        close: "Ho capito",
        termsBody: [
          "1. Servizio: elaborazione e analisi audio (demix, dereverb, BPM/tonalità, ecc.).",
          "2. Account: sei responsabile delle attività sul tuo account.",
          "3. Uso consentito: vietati contenuti illegali, che violano diritti o abusivi; vietati attacchi o uso improprio.",
          "4. Risultati: i risultati sono best‑effort e possono essere imprecisi in base alla qualità dell’audio.",
          "5. Diritti: devi avere diritti/autorizzazione per caricare l’audio.",
          "6. Modifiche: potremmo aggiornare funzionalità, limiti o API quando necessario.",
          "7. Esclusione di responsabilità: nei limiti di legge non rispondiamo di danni indiretti.",
        ],
        privacyBody: [
          "1. Dati raccolti: informazioni dell’account (es. email), log necessari, audio caricato e link ai risultati.",
          "2. Scopo: fornire e migliorare il servizio, eseguire i job e mostrare la cronologia se abilitata.",
          "3. Conservazione: upload e output sono conservati per esecuzione/download e rimossi entro 24 ore per impostazione predefinita.",
          "4. Condivisione: non vendiamo dati personali; divulgazione solo per legge o consenso.",
          "5. Sicurezza: adottiamo misure ragionevoli ma non possiamo garantire sicurezza assoluta.",
          "6. Diritti: puoi eliminare la cronologia o richiedere la cancellazione entro limiti ragionevoli.",
        ],
      },
      ar: {
        labelPrefix: "لقد قرأت وأوافق على",
        labelSuffix: ".",
        terms: "اتفاقية المستخدم",
        privacy: "سياسة الخصوصية",
        and: "و",
        required: "يرجى الموافقة على اتفاقية المستخدم وسياسة الخصوصية",
        termsTitle: "اتفاقية المستخدم",
        termsDesc: "يرجى قراءة هذه الشروط بعناية قبل استخدام الخدمة.",
        privacyTitle: "سياسة الخصوصية",
        privacyDesc: "كيف نجمع معلوماتك ونستخدمها ونحميها.",
        close: "تم",
        termsBody: [
          "1. الخدمة: معالجة وتحليل الصوت (فصل الصوت، إزالة الصدى، تحليل BPM/المقام وغيرها).",
          "2. الحساب: أنت مسؤول عن النشاط الذي يتم عبر حسابك.",
          "3. الاستخدام المقبول: يُحظر المحتوى غير القانوني أو المنتهك للحقوق أو المسيء؛ ويُحظر الهجمات أو إساءة الاستخدام.",
          "4. النتائج: النتائج تقديرية وقد تكون غير دقيقة بحسب جودة الملف المُدخل.",
          "5. الحقوق: يجب أن تمتلك الحقوق/الإذن لرفع الملف الصوتي.",
          "6. التغييرات: قد نقوم بتحديث الميزات أو الحدود أو واجهات API عند الحاجة.",
          "7. إخلاء المسؤولية: إلى الحد الذي يسمح به القانون، لا نتحمل مسؤولية الأضرار غير المباشرة.",
        ],
        privacyBody: [
          "1. البيانات التي نجمعها: معلومات الحساب (مثل البريد الإلكتروني)، سجلات ضرورية، الملفات الصوتية المرفوعة وروابط النتائج.",
          "2. الغرض: تقديم الخدمة وتحسينها، تشغيل مهام المعالجة، وعرض السجل إذا تم تفعيله.",
          "3. الاحتفاظ: تُخزَّن الملفات والنتائج للتنفيذ/التنزيل وتُزال افتراضيًا خلال 24 ساعة.",
          "4. المشاركة: لا نبيع بياناتك الشخصية؛ ولا يتم الكشف إلا بموجب القانون أو بموافقتك.",
          "5. الأمان: نتخذ إجراءات معقولة للحماية لكن لا يمكن ضمان أمان مطلق.",
          "6. حقوقك: يمكنك حذف السجل أو طلب حذف البيانات ضمن نطاق معقول.",
        ],
      },
      es: {
        labelPrefix: "He leído y acepto los",
        labelSuffix: ".",
        terms: "Términos de uso",
        privacy: "Política de privacidad",
        and: "y la",
        required: "Acepta los Términos de uso y la Política de privacidad",
        termsTitle: "Términos de uso",
        termsDesc: "Lee estos términos detenidamente antes de usar el servicio.",
        privacyTitle: "Política de privacidad",
        privacyDesc: "Cómo recopilamos, usamos y protegemos tu información.",
        close: "Entendido",
        termsBody: [
          "1. Servicio: procesamiento y análisis de audio (demix, dereverb, BPM/tonalidad, etc.).",
          "2. Cuenta: eres responsable de la actividad de tu cuenta.",
          "3. Uso aceptable: no subas contenido ilegal, infractor o abusivo; no ataques ni hagas un uso indebido.",
          "4. Resultados: son de mejor esfuerzo y pueden ser inexactos según la calidad del audio.",
          "5. Derechos: debes tener derechos/permisos para subir el audio.",
          "6. Cambios: podemos actualizar funciones, límites o APIs cuando sea necesario.",
          "7. Exención: en la medida permitida por la ley, no somos responsables de daños indirectos.",
        ],
        privacyBody: [
          "1. Datos que recopilamos: info de cuenta (p. ej., email), registros necesarios, audio subido y enlaces de salida.",
          "2. Finalidad: prestar y mejorar el servicio, ejecutar tareas y mostrar el historial si está habilitado.",
          "3. Retención: subidas y resultados se almacenan para ejecución/descarga y se limpian en 24 horas por defecto.",
          "4. Compartir: no vendemos datos personales; solo divulgamos por ley o con tu consentimiento.",
          "5. Seguridad: usamos medidas razonables, pero no garantizamos seguridad absoluta.",
          "6. Tus derechos: puedes borrar el historial o solicitar eliminación dentro de un alcance razonable.",
        ],
      },
      fr: {
        labelPrefix: "J’ai lu et j’accepte les",
        labelSuffix: ".",
        terms: "Conditions d’utilisation",
        privacy: "Politique de confidentialité",
        and: "et la",
        required: "Veuillez accepter les Conditions d’utilisation et la Politique de confidentialité",
        termsTitle: "Conditions d’utilisation",
        termsDesc: "Veuillez lire attentivement ces conditions avant d’utiliser le service.",
        privacyTitle: "Politique de confidentialité",
        privacyDesc: "Comment nous collectons, utilisons et protégeons vos informations.",
        close: "Compris",
        termsBody: [
          "1. Service : traitement et analyse audio (demix, dereverb, BPM/tonalité, etc.).",
          "2. Compte : vous êtes responsable de l’activité de votre compte.",
          "3. Utilisation acceptable : pas de contenu illégal, contrefaisant ou abusif ; pas d’attaques ni d’abus.",
          "4. Résultats : best‑effort, pouvant être inexacts selon la qualité de l’entrée.",
          "5. Droits : vous devez disposer des droits/autorisations pour téléverser l’audio.",
          "6. Changements : nous pouvons mettre à jour les fonctionnalités, quotas ou API si nécessaire.",
          "7. Clause de non‑responsabilité : dans la limite autorisée par la loi, nous ne sommes pas responsables des dommages indirects.",
        ],
        privacyBody: [
          "1. Données collectées : informations de compte (ex. email), journaux nécessaires, audio téléversé et liens de sortie.",
          "2. Objectif : fournir et améliorer le service, exécuter les traitements et afficher l’historique si activé.",
          "3. Conservation : les téléversements et sorties sont conservés pour exécution/téléchargement et supprimés sous 24 h par défaut.",
          "4. Partage : nous ne vendons pas de données personnelles ; divulgation uniquement si exigée par la loi ou avec votre consentement.",
          "5. Sécurité : mesures raisonnables, sans garantie de sécurité absolue.",
          "6. Vos droits : vous pouvez supprimer l’historique ou demander la suppression dans une mesure raisonnable.",
        ],
      },
    });
  }, [locale]);

  const openDoc = (type: DocType) => {
    setDoc(type);
    setOpen(true);
  };

  const title = doc === "terms" ? copy.termsTitle : copy.privacyTitle;
  const desc = doc === "terms" ? copy.termsDesc : copy.privacyDesc;
  const body = doc === "terms" ? copy.termsBody : copy.privacyBody;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} className="mt-0.5" />
        <div className="leading-relaxed">
          <span>{copy.labelPrefix} </span>
          <button type="button" className="text-primary hover:underline" onClick={() => openDoc("terms")}>
            {copy.terms}
          </button>
          <span> {copy.and} </span>
          <button type="button" className="text-primary hover:underline" onClick={() => openDoc("privacy")}>
            {copy.privacy}
          </button>
          {copy.labelSuffix ? <span>{copy.labelSuffix}</span> : null}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{desc}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-auto rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
            {body.map((line) => (
              <p key={line} className="leading-6">
                {line}
              </p>
            ))}
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" className="rounded-full" onClick={() => setOpen(false)}>
              {copy.close}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function legalRequiredMessage(locale: string) {
  return pickLocale(locale, {
    zh: "请先同意用户协议与隐私政策",
    en: "Please accept the User Agreement and Privacy Policy",
    ja: "利用規約とプライバシーポリシーに同意してください",
    ko: "이용약관과 개인정보 처리방침에 동의해 주세요",
    ru: "Пожалуйста, примите Пользовательское соглашение и Политику конфиденциальности",
    de: "Bitte akzeptiere die Nutzungsbedingungen und die Datenschutzerklärung",
    pt: "Por favor, aceite os Termos de Uso e a Política de Privacidade",
    it: "Accetta i Termini di utilizzo e l’Informativa sulla privacy",
    ar: "يرجى الموافقة على اتفاقية المستخدم وسياسة الخصوصية",
    es: "Acepta los Términos de uso y la Política de privacidad",
    fr: "Veuillez accepter les Conditions d’utilisation et la Politique de confidentialité",
  });
}

