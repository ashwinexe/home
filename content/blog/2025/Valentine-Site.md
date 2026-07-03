---
title: "I turned my over-engineered Valentine's site into a template you can fork."
date: "2026-02-11"
description: ""
tags: []
pinned: false
category: "tech"
---

# I turned my over-engineered Valentine's site into a template you can fork.

It's Valentine week and I wanted to do something special, personal and geeky for her.

Normally I'd make one site, one game or one terminal app. But I've been hooked to Claude Code + Opus 4.6 this month so I made all of them!

Feb 7 to Feb 14, one surprise unlocks every day.

I stripped out the personal stuff and turned it into a template anyone can fork and deploy for their own person.

[Here's the repo](https://github.com/ashwinexe/valentine-template)

and below is the story.

## What She Got

The site has five sections, all themed around Valentine's Week:

A countdown timeline — Each day from Rose Day to Valentine's Day has a custom message that unlocks at midnight. Before that, it's blurred and locked. The anticipation is the whole point.

[Countdown timeline media](https://x.com/ashwinexe/article/2021299320235098149/media/2021283547139670019)

Love letters — One letter per day, with optional photos attached. She could read the letter and write a reply back. The replies sync in real time via [Firebase](http://firebase.google.com/).

[Love letters media](https://x.com/ashwinexe/article/2021299320235098149/media/2021284841287983105)

A Love Terminal — This one's my favorite. A terminal-style animation that types out a daily message character by character. Because I'm an engineer and she thinks it's cute.

It comes with an npm package, I published a CLI tool she could run in her terminal:

It plays a heart animation, shows daily messages, and on Valentine's Day it completes a hidden easter egg.

```bash
npx valentine-cli
```

[Love terminal media 1](https://x.com/ashwinexe/article/2021299320235098149/media/2021285211477245953)

[Love terminal media 2](https://x.com/ashwinexe/article/2021299320235098149/media/2021285211531771907)

[Love terminal media 3](https://x.com/ashwinexe/article/2021299320235098149/media/2021285211473051649)

A couples quiz — Questions like "What's our song?" and "What was our favourite adventure?", where somehow every answer leads to something sweet. The last question is "Will you be my Valentine?" Has only two accepted answers: "Yes!" and "Absolutely yes!"

> I replaced emoji with personal sticker on my version, go creative!

[Couples quiz media 1](https://x.com/ashwinexe/article/2021299320235098149/media/2021285778039726080)

[Couples quiz media 2](https://x.com/ashwinexe/article/2021299320235098149/media/2021285778945646592)

  

## The Tech

I kept this part intentionally boring and quick to spin up:

- Next.js 16 + React 19 + Tailwind CSS 4
    
- Firebase Realtime DB for syncing letter replies
    
- Vercel for deployment
    
- Little Claude Code + Opus 4.6 magic
    

The whole thing is a monorepo with two packages:

packages/ web/ ← The Next.js website valentine-cli/ ← The npm terminal package

To be verbose :

```json
packages/
  web/           ← Next.js app
    src/
      lib/
        config.ts  ← Your names, pronouns, year
        data.ts    ← All your messages, quiz, letters
      components/  ← Timeline, Terminal, Quiz, Letters
      middleware.ts ← Optional password gate
  valentine-cli/   ← The npm terminal package
```

Firebase turned out to be optional by accident. I wrote a localStorage fallback for development, and it worked so well that the site runs perfectly without any database. Replies just save in the browser. If you want cross-device sync, add Firebase credentials. If you don't, skip it entirely.

## What the Template Looks Like

The entire customization boils down to two files:

config.ts — Your names, pronouns, and the year:

```typescript
export const config = {
  senderName: "Your Name",
  recipientName: "Your Partner's Name",
  recipientPronoun: "They" as "He" | "She" | "They",
  year: 2026,
  siteUrl: "https://your-site.vercel.app",
  cliCommand: "npx valentine-cli",
};
```

data.ts — All your content. Timeline messages, terminal messages, quiz questions, love letters. Everything's in one file with comments explaining what to customize:

```typescript
export const quizData = [
  {
    q: "What was the first movie we watched together?",
    options: ["Movie A", "Movie B", "Movie C", "Movie D"],
    correct: 0,
    feedback: {
      right: "You remembered!",
      wrong: "Not quite, but we should rewatch them all!"
    },
  },
  // ... your questions here
];
```

Photos go in /public/letters/. Reference them in data.ts. If you don't, letters without photos render as text-only. No config change needed.

## Password Protection

This was an important one. You're building a personal site for one person. You probably don't want randos on the internet reading your letters.

I added optional password protection in about few lines.

1. Set SITE_PASSWORD=your-secret as an environment variable
    
2. Next.js middleware checks for an auth cookie on every request
    
3. Enter the right password, get a cookie that lasts 30 days
    
4. Share the password with your person. Done.
    

If you don't set the env var, there's no password gate at all. The site is public. It's completely opt-in.

[Password protection media](https://x.com/ashwinexe/article/2021299320235098149/media/2021287353650905093)

## The Date System

Content unlocks progressively based on the current date. Rose Day (Feb 7) through Valentine's Day (Feb 14). Before a day arrives, its content is blurred and locked.

The year is set in config.ts. Change one number and all 8 days update.

For development, just set the year to a past year and everything unlocks immediately so you can see all your content while editing.

## How to Deploy Your Own

1. Click "Use this template" on the GitHub repo
    
2. Clone your new repo
    
3. Edit config.ts with your names
    
4. Edit data.ts with your messages, quiz, and letters
    
5. Drop your photos in /public/letters/
    
6. Push to GitHub, import in Vercel
    
7. Set SITE_PASSWORD in Vercel's env vars
    
8. Send the link and password to your person
    

That's it. You're live....for your love &lt;3

[github.com/ashwinexe/valentine-template](https://github.com/ashwinexe/valentine-template)

Happy Hacking Valentine!
