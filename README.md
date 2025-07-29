# 🧱 Tech Stack

The tech stack i used here is a mix of programming languages, primarily
C#, PHP, JS CSS, and HTML.

Each used for a different purpose (see below)

## ⚙️ C# Dotnet runtime

The runtime is used for faster server requests for certain "services". these services being:

- Quiz App Backend Api (service)

## 🐘 PHP

Used for inlining simple logic, and SSR templating. Primarily because php can be inserted in html (embedded php).

Also used for small "services" which require just a function or two.

## 🌐 HTML

Embedded in `.php` files. used for front-end.

## 🎨 CSS

Extended by tailwindcss, used for styling (ahem insert me doing styling for like 3 hours to perfect a button). (also insert me filling out [`theme.css`](./commons/theme.css) and studying color theory for hours.)

## ✨ JS

No much JS, work is done in server side this time. (Yaaaaaaaaaaaaaaaaaay!!!). I noticed putting severe work in the client is impractical so yeah... most page here dont require js in prod (except for DIY hot reload in dev.)

Note that javascript is also used here for tools.

# 📦 Requirements

## 🚀 Runtime Requirements

- Dotnet Runtime (i have an installer in my usb)
- WampServer64/Xampp (dev)

## 🛠️ Dev Requirements

- Git (for backup and stuff, also version control)
- VS Code (for intellisense)
- Node JS (for tools)

## ⚡ Optional Requirements

- Everything (like... you can just not run some stuff here. then its dependencies become optional)

# 📝 Notes

## 🔥 Important

### 🧩 Quiz Service

The database (for the quiz service) is sharded / fragmented into 3 parts:

- The `quizzes` table which holds quiz metadata

- The `quiz_tag` a table for one to many relations (pairs of quiz id and tag id)

- The `tags` a table that holds the ids of tags. fragmented for efficiency in space, and time. pairs of tag id and tag name

When resetting the database for this service, rerun the `schema.sql` in the backend folder. When resetting, also remove the `questions/` folder in the current directory as it contains the questions for a given quiz (recommended, like really. could cause issues...).

## 💬 Side Notes

About the directories and files here... yeah, imma fix that giant mess later. i need all this to work and be functional.

Also about some files here, they are auto-generated. this means they are used but not to be deleted, or modified.

Also note some json in the api responses might be pascal or camel case. the C# styling convention forces me to do java-style naming.
