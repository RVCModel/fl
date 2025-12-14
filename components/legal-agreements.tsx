"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    const zh = {
      labelPrefix: "我已阅读并同意",
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
    };

    const en = {
      labelPrefix: "I have read and agree to the",
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
    };

    const ja = {
      labelPrefix: "私は",
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
    };

    return locale === "ja" ? ja : locale === "en" ? en : zh;
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
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          className="mt-0.5"
        />
        <div className="leading-relaxed">
          <span>{copy.labelPrefix} </span>
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => openDoc("terms")}
          >
            {copy.terms}
          </button>
          <span> {copy.and} </span>
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => openDoc("privacy")}
          >
            {copy.privacy}
          </button>
          {locale === "ja" ? <span>に同意します。</span> : null}
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
  return locale === "en"
    ? "Please accept the User Agreement and Privacy Policy"
    : locale === "ja"
      ? "利用規約とプライバシーポリシーに同意してください"
      : "请先同意用户协议与隐私政策";
}
