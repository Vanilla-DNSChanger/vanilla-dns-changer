<div align="center" dir="rtl">

# 🌐 وانیلا DNS چنجر

**تغییردهنده DNS متن‌باز برای ویندوز، مک و لینوکس**

[![GitHub license](https://img.shields.io/github/license/Vanilla-DNSChanger/vanilla-dns-changer?style=flat-square&color=53FC18)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Vanilla-DNSChanger/vanilla-dns-changer?style=flat-square&color=53FC18)](https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Vanilla-DNSChanger/vanilla-dns-changer?style=flat-square)](https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/issues)

<img src="apps/website/public/logo.svg" alt="لوگوی وانیلا DNS چنجر" width="200" />

یک برنامه تغییر DNS امن، سریع و زیبا با پشتیبانی از **بیش از 40 سرور DNS**.

[🖥️ اپلیکیشن دسکتاپ](#اپلیکیشن-دسکتاپ) • [⌨️ ابزار خط فرمان](#ابزار-خط-فرمان) • [🌐 وب‌سایت](https://vanilla-dnschanger.github.io)

</div>

---

## ✨ امکانات

- 🚀 **تغییر DNS با یک کلیک** - اتصال فوری به هر سرور DNS
- 📊 **+40 سرور DNS** - پایگاه داده بزرگ از سرورهای DNS عمومی
- 🎨 **رابط کاربری مدرن** - تم تیره زیبا با لهجه‌های سبز به سبک Kick
- 🖥️ **چند پلتفرمی** - پشتیبانی از ویندوز، مک و لینوکس
- 🔒 **متن‌باز** - کاملاً شفاف و جامعه‌محور
- ⚡ **سریع و سبک** - مصرف حداقلی منابع
- 🌍 **چند زبانه** - پشتیبانی از انگلیسی و فارسی
- 📡 **پینگ سرور** - تست تأخیر سرور قبل از اتصال
- 💾 **DNS سفارشی** - اضافه و ذخیره کردن سرورهای DNS خود
- 🔄 **همگام‌سازی خودکار** - به‌روزرسانی خودکار لیست سرورها از گیت‌هاب

---

## 🌟 Vanilla DNS

این برنامه به صورت پیش‌فرض از **Vanilla DNS** استفاده می‌کند - سرویس تحریم‌شکن هوشمند و پرسرعت ایرانی.

- **سرور اصلی:** `10.139.177.21`
- **سرور ثانویه:** `10.139.177.22`

برای اطلاعات بیشتر به [vanillapp.ir](https://vanillapp.ir) مراجعه کنید.

---

## 📦 پکیج‌ها

این مخزن شامل موارد زیر است:

| پکیج | توضیحات | وضعیت |
|---------|-------------|--------|
| [`@vanilla-dns/desktop`](apps/desktop) | اپلیکیشن دسکتاپ الکترون | ✅ آماده |
| [`@vanilla-dns/cli`](apps/cli) | ابزار رابط خط فرمان | ✅ آماده |
| [`@vanilla-dns/website`](apps/website) | صفحه فرود و مستندات | ✅ آماده |
| [`@vanilla-dns/shared`](packages/shared) | ابزارها و تایپ‌های مشترک | ✅ آماده |

---

## 🖥️ اپلیکیشن دسکتاپ

اپلیکیشن دسکتاپ زیبا بر پایه الکترون با پشتیبانی از سینی سیستم.

### امکانات
- رابط کاربری تیره مدرن با لهجه‌های سبز (به سبک Kick)
- سینی سیستم با اقدامات سریع
- شروع خودکار با سیستم
- پاک‌سازی کش DNS
- انتخاب رابط شبکه
- به‌روزرسانی خودکار

### دانلود

| پلتفرم | دانلود |
|--------|---------|
| ویندوز | [Vanilla-DNS-Setup-1.0.1.exe](https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/releases/latest/download/Vanilla-DNS-Setup-1.0.1.exe) |
| مک (Apple Silicon) | [Vanilla-DNS-Changer-1.0.1-arm64.dmg](https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/releases/latest/download/Vanilla-DNS-Changer-1.0.1-arm64.dmg) |
| لینوکس (deb) | [Vanilla-DNS-Changer-1.0.1-amd64.deb](https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/releases/latest/download/Vanilla-DNS-Changer-1.0.1-amd64.deb) |
| لینوکس (AppImage) | [Vanilla-DNS-Changer-1.0.1-x86_64.AppImage](https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/releases/latest/download/Vanilla-DNS-Changer-1.0.1-x86_64.AppImage) |

---

## ⌨️ ابزار خط فرمان

رابط خط فرمان قدرتمند برای مدیریت DNS.

### نصب

```bash
npm install -g @vanilla-dns/cli
```

### استفاده

```bash
# اتصال به سرور DNS به صورت تعاملی
vdns connect

# اتصال با نام سرور
vdns connect -n cloudflare

# اتصال با DNS سفارشی
vdns connect -s 8.8.8.8,8.8.4.4

# اتصال به Vanilla DNS
vdns connect -n vanilla

# قطع اتصال (بازیابی DNS پیش‌فرض)
vdns disconnect

# بررسی وضعیت فعلی DNS
vdns status

# لیست سرورهای موجود
vdns list
```

---

## 🛠️ توسعه

### پیش‌نیازها

- Node.js 18+
- pnpm 8+

### راه‌اندازی

```bash
# کلون مخزن
git clone https://github.com/Vanilla-DNSChanger/vanilla-dns-changer.git
cd vanilla-dns-changer

# نصب وابستگی‌ها
pnpm install

# ساخت همه پکیج‌ها
pnpm build

# اجرای اپلیکیشن دسکتاپ در حالت توسعه
pnpm --filter @vanilla-dns/desktop dev
```

---

## 🤝 مشارکت

مشارکت‌ها استقبال می‌شوند! لطفاً [راهنمای مشارکت](CONTRIBUTING.md) را برای جزئیات بخوانید.

1. Fork کردن مخزن
2. ایجاد شاخه ویژگی (`git checkout -b feature/amazing-feature`)
3. Commit تغییرات (`git commit -m 'Add amazing feature'`)
4. Push به شاخه (`git push origin feature/amazing-feature`)
5. ایجاد Pull Request

---

## 📄 مجوز

این پروژه تحت مجوز MIT است - برای جزئیات فایل [LICENSE](LICENSE) را ببینید.

---

## 🙏 قدردانی

- [Vanilla DNS](https://vanillapp.ir) - سرویس DNS تحریم‌شکن
- [Electron](https://electronjs.org) - فریم‌ورک اپلیکیشن دسکتاپ
- [Oclif](https://oclif.io) - فریم‌ورک CLI
- [Tailwind CSS](https://tailwindcss.com) - فریم‌ورک CSS
- جامعه متن‌باز

---

<div align="center">

ساخته شده با ❤️ توسط [SudoLite](https://x.com/sudolite)

</div>
