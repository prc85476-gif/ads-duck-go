# AdEarn - Telegram Mini App & Bot 🚀

আপনার নির্দেশ ও ছবির একদম নিখুঁত হুবহু ডিজাইনে তৈরি **AdEarn** (Adsgram / Income Mini App & Bot)।

---

## 🎨 ডিজাইন ফিচারসমূহ (ছবির সাথে ১০০% মিল রেখে)
1. **হোয়াইট প্রিমিয়াম থিম (Zero Glow Effect):** কোনো অতিরিক্ত ব্লার বা অনাকাঙ্ক্ষিত গ্লো ইফেক্ট নেই, একদম পরিষ্কার ও নিখুঁত।
2. **মডারেট রাউন্ডেড বক্স:** অতিরিক্ত গোল/সার্কেল নয়, ছবির মতো সুন্দর ব্যালেন্সড কর্নার রেডিয়াস (`14px - 18px`)।
3. **কালারফুল বক্স:** উজ্জ্বল, প্রাণবন্ত কিন্তু ফ্ল্যাট প্রিমিয়াম কালার কম্বিনেশন।

---

## 📱 ৪টি স্ক্রিন এবং তাদের ফিচারসমূহ:

### ১. Home Screen
- **টপ বার:** AdEarn ব্র্যান্ড লোগো, সাবটাইটেল (`Watch • Play • Earn`), নোটিফিকেশন বেল (উইথ ব্যাজ `2`), ইউজার প্রোফাইল অ্যাভাটার।
- **ব্যালেন্স কার্ড:** ব্লু ব্যাকগ্রাউন্ডে **Available Balance `$0.2500` (≈ 25.00 USDT)**।
- **ডুয়াল অ্যাকশন বাটন:** **Earn Now** (গ্রিন বাটন) এবং **Withdraw** (হোয়াইট বাটন)।
- **২টি কালারফুল গেম বক্স:** 
  - 🎡 **Lucky Spin** (ব্লু বক্স) - Spin & Win
  - 🔢 **Number Challenge** (পিংঙ্ক/রেড কোরাল বক্স) - Test Your Luck
- **Daily Reward বক্স:** প্রতিদিন **$0.01** ক্লেইম করার অপশন এবং লাইভ কাউন্টার ব্যাজ।
- **Recent Activity:** টাস্ক ও গেম থেকে আর্নিং হিস্ট্রি।

### ২. Tasks Screen (১০টি অ্যাড টাস্ক)
- **টাস্ক ব্যানার ও প্রগ্রেস বার:** `0/10 Completed` লাইভ প্রগ্রেস।
- **ট্যাব কাউন্টার:** All Tasks (10), Completed, In Progress।
- **১০টি স্পনসর অ্যাড টাস্ক:**
  1. `AdGem` - $0.02
  2. `BitLabs` - $0.03
  3. `Tapjoy` - $0.02
  4. `AdColony` - $0.04
  5. `Fyber` - $0.03
  6. `InMobi` - $0.02
  7. `ironSource` - $0.03
  8. `Chartboost` - $0.04
  9. `Vungle` - $0.02
  10. `Unity Ads` - $0.03
- প্রতি টাস্কে ক্লিক করলে ৫ সেকেন্ড কাউন্টডাউন সহ ভিডিও অ্যাড প্লেয়ার মডাল ওপেন হবে এবং ব্যালেন্স যোগ হবে।

### ৩. Wallet Screen
- **Available Balance** এবং **Pending Balance** (`$0.0000`)।
- বড় আকারের **Withdraw** বাটন।
- **Quick Stats:**
  - Total Earned: `$12.50`
  - Withdrawn: `$8.00`
  - Total Transactions: `15`
  - Pending Requests: `1`
- **Withdrawal Methods (মিনিমাম লিমিট সহ):**
  - USDT (TRC20) - Min. $5.00
  - Binance Pay - Min. $10.00
  - PayPal - Min. $10.00
- ফুল ইন্টারেক্টিভ উইথড্রয়াল মডাল যাতে ওয়ালেট অ্যাড্রেস ও অ্যামাউন্ট সাবমিট করা যায়।

### ৪. Profile Screen
- ইউজার তথ্য: **Md. Rakib**, Telegram ID, এবং নীল রঙের **Verified** শিল্ড ব্যাজ।
- **৩টি প্রধান স্ট্যাট:**
  - `$12.50` Total Earned
  - `10` Tasks Completed
  - `2` Games Played
- **সেটিংস অপশনস:**
  - Account Settings
  - Payment Settings
  - Help & Support
  - Terms & Conditions
  - About App (Version 1.0.0)
  - Logout বাটন

---

## 🛠️ প্রোজেক্ট রান করার নিয়ম

### ১. ব্যাকএন্ড সার্ভার (Express Node.js):
```bash
node server.js
```
*(এটি পোর্ট `5000`-এ রান করে API প্রোভাইড করে)*

### ২. ফ্রন্টএন্ড ক্লায়েন্ট (React + Vite):
```bash
cd client
npm run dev
```
*(ব্রাউজারে দেখার জন্য: **http://localhost:5173**)*

### ৩. টেলিগ্রাম বট চালু করতে (ঐচ্ছিক):
[.env](file:///c:/Users/User/Downloads/adsgram%20incoem%20bot/.env) ফাইলে আপনার `BOT_TOKEN` দিন এবং রান করুন:
```bash
node bot.js
```
