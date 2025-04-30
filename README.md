# 🎯 AcedAssessment

**AcedAssessment** is a desktop app built to help job seekers *ace technical assessments* during interviews by providing real-time assistance powered by OpenAI. Capture screenshots, get immediate feedback, and focus on *thinking*, not just memorizing.

---

## 📦 Features

- 🖼 **Screenshot Capture**  
  Use global keyboard shortcuts to quickly capture your screen.

- 🤖 **OpenAI Integration**  
  Automatically sends screenshots to OpenAI's API for analysis and response.

- 🪟 **Minimalist, Custom UI**  
  A sleek, always-on-top overlay that displays markdown-formatted guidance.

- ⌨️ **Global Shortcuts**  
  Control everything with your keyboard — fast, intuitive, and distraction-free.

---

## 🔧 Prerequisites

Before getting started, make sure you have:

- [Node.js](https://nodejs.org/) (v14+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A valid [OpenAI API Key](https://platform.openai.com/account/api-keys)

---

## 🚀 Installation

### 1. Clone the Repository

   git clone https://github.com/juleszweekhorst/acedassessment.git
   cd acedassessment

### 2. Install Dependencies
   npm install

### 3. Configure API Access
   Create a config.json file in the project root with the following structure:

   {
   "apiKey": "Your API key here",
   "model": "gpt-4o-mini"
   }

## 🧪 Usage
Start the App

   npm start

### Keyboard Shortcuts
Shortcut	Action
Ctrl + Shift + S	Capture and send a screenshot immediately
Ctrl + Shift + R	Reset session (clears screenshots + output)
Ctrl + Shift + Q	Quit the app and clean up resources

## ⚠️ Development Status

Still in development.
Some features are experimental or incomplete. Your feedback is super valuable and helps make this tool better — feel free to open issues or submit pull requests.
