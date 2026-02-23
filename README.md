# Shahada — Become Muslim

> A zero-cognitive-load, Wikipedia-style single-page app to help people say the Shahada and become Muslim.

## 🎯 Mission

Make it as simple as possible for anyone, anywhere, to take their first step into Islam.

## ✨ Features

- **Word-by-word audio** — Click any Arabic word to hear its pronunciation
- **Full Shahada playback** — Listen to the complete declaration
- **Global counter** — See how many people have declared the Shahada (anonymous, no tracking)
- **Personal date** — Your Shahada date saved locally on your device
- **Comprehensive FAQ** — Answers to common questions (optimized for AI search)
- **Mobile-first** — Works perfectly on all devices
- **Accessible** — Keyboard navigation, screen reader friendly
- **No tracking** — Zero cookies, zero data collection

## 🏗️ Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | Pure HTML/CSS/JS | Maximum Core Web Vitals, no build step |
| Styling | Wikipedia-like | Minimal cognitive load, high readability |
| Counter API | CountAPI.xyz | Free, anonymous, no backend needed |
| Storage | localStorage | Personal data stays on user's device (GDPR-friendly) |

## 📁 Project Structure

```
shahada/
├── index.html          # Main page with all content + SEO
├── styles.css          # Wikipedia-like styling
├── script.js           # Audio player + counter logic
├── audio/
│   ├── shahada.mp3     # Full Shahada audio
│   └── shahada.ogg     # OGG fallback
├── tasks/
│   └── todo.md         # Project plan & progress
└── README.md           # This file
```

## 🚀 Getting Started

### Local Development

```bash
# No build step needed! Just open index.html in a browser.
# For local server (recommended for audio):

# Python 3
python -m http.server 8000

# Node.js
npx serve

# Then open http://localhost:8000
```

### Adding Audio

1. Record or obtain a clear, slow Shahada recitation (~10 seconds)
2. Save as `audio/shahada.mp3` and `audio/shahada.ogg`
3. Adjust timestamps in `index.html` if needed (see `audio/.gitkeep` for guide)

## 🌍 Multilingual Setup

The page is structured for multilingual SEO with hreflang tags. To add languages:

1. Create language folders: `/en/`, `/nl/`, `/fr/`, `/de/`, etc.
2. Copy and translate `index.html` for each language
3. Update the `hreflang` tags in each file
4. Translate the audio or provide language-specific recordings

## 📊 SEO Features

- **Core Web Vitals optimized** — Inline critical CSS, minimal JavaScript
- **Structured Data** — FAQ schema + HowTo schema for rich snippets
- **Meta tags** — Open Graph, Twitter Cards, comprehensive meta
- **Hreflang** — Prepared for multilingual deployment
- **Semantic HTML** — Proper heading hierarchy, ARIA labels

## 🔒 Privacy

- **No cookies**
- **No tracking pixels**
- **No analytics**
- **Counter is anonymous** — Only increments a number, no IP/User-Agent logged
- **Personal date stored locally** — Never leaves user's device

## 🧪 Testing Checklist

- [ ] Audio plays correctly on iOS Safari
- [ ] Audio plays correctly on Android Chrome
- [ ] Word-by-word timestamps are accurate
- [ ] Counter increments (check CountAPI dashboard)
- [ ] localStorage saves date correctly
- [ ] Keyboard navigation works
- [ ] Screen reader announces content correctly
- [ ] Lighthouse score > 95 for all categories

## 📝 Counter API Setup

The page uses [CountAPI.xyz](https://countapi.xyz/) for the global counter.

Current configuration in `script.js`:
```javascript
counterNamespace: 'shahada-org',
counterKey: 'declarations',
```

To use your own namespace:
1. Replace `'shahada-org'` with your unique namespace
2. The counter auto-creates on first hit

## 🤲 License

This project is dedicated to helping people embrace Islam. Use it freely.

---

*"Whoever guides someone to goodness will have a reward like the one who did it."* — Prophet Muhammad ﷺ (Sahih Muslim)

