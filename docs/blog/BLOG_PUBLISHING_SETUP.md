# 🚀 DHM Guide Blog Publishing - Initial Setup & Prerequisites

## 📋 Prerequisites

Before you can publish blog posts, ensure you have:

### Required Software
- **Node.js** (v18+ recommended): [Download](https://nodejs.org/)
- **Git**: [Download](https://git-scm.com/)
- **Code Editor** (VS Code recommended): [Download](https://code.visualstudio.com/)
- **Python 3** (for JSON validation): Usually pre-installed on macOS/Linux

### Required Access
- **GitHub account** with access to the DHM Guide repository
- **Write permissions** for the repository
- **Local clone** of the repository

## 🛠️ Initial Setup

### 1. Clone the Repository

```bash
# Clone via HTTPS (recommended)
git clone https://github.com/[your-org]/dhm-guide-website.git
cd dhm-guide-website

# Or via SSH if configured
git clone git@github.com:[your-org]/dhm-guide-website.git
cd dhm-guide-website
```

### 2. Install Dependencies

```bash
# Install Node.js packages
npm install

# Verify installation
npm run dev
# Should start development server at http://localhost:5173
```

### 3. Install Image Tools (Optional but Recommended)

```bash
# macOS (using Homebrew)
brew install webp imagemagick

# Ubuntu/Debian
sudo apt-get install webp imagemagick

# Windows (using Chocolatey)
choco install webp imagemagick
```

### 4. Set Up Your Git Identity

```bash
# Configure your name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 5. Verify Access

```bash
# Check you can pull latest changes
git pull origin main

# Test creating a branch
git checkout -b test-access
git checkout main
git branch -d test-access
```

## 🔐 Security & Permissions

### Repository Access Levels

| Role | Permissions | Can Do | Cannot Do |
|------|------------|--------|-----------|
| **Read** | Pull only | View content, clone repo | Push changes |
| **Write** | Full access | Create posts, push changes | Change settings |
| **Admin** | Everything | All operations | N/A |

### Security Best Practices

1. **Never commit sensitive data**:
   - API keys
   - Passwords
   - Personal information
   - Internal URLs

2. **Image security**:
   - Only use licensed/owned images
   - Include copyright information
   - Optimize file sizes (< 200KB)

3. **Content security**:
   - Sanitize any user-generated content
   - Avoid inline scripts in Markdown
   - Review external links

## 📁 Repository Structure

```
dhm-guide-website/
├── src/
│   └── newblog/
│       └── data/
│           ├── posts/          ← Your blog posts go here
│           ├── postRegistry.js ← Must update when adding posts
│           └── metadata/
│               └── index.json  ← Must update when adding posts
├── public/
│   ├── images/                 ← Hero images go here
│   └── sitemap.xml            ← Auto-generated
├── scripts/
│   ├── create-blog-post.js    ← Interactive post creator
│   ├── validate-blog-post.sh  ← Post validator
│   ├── check-blog-sync.js     ← Sync checker
│   └── generate-sitemap.js    ← Sitemap generator
└── package.json               ← Project configuration
```

## 🚦 Environment Verification

Run this checklist to ensure your environment is ready:

```bash
# 1. Check Node.js version
node --version
# Should show v18.0.0 or higher

# 2. Check npm version
npm --version
# Should show v8.0.0 or higher

# 3. Check Git version
git --version
# Should show 2.30.0 or higher

# 4. Check Python version
python3 --version
# Should show Python 3.8 or higher

# 5. Check image tools (optional)
cwebp -version
# Should show version info if installed

# 6. Test local development
npm run dev
# Should start without errors
```

## 🆘 Troubleshooting Setup Issues

### Common Setup Problems

| Problem | Solution |
|---------|----------|
| `npm: command not found` | Install Node.js from nodejs.org |
| `Permission denied (publickey)` | Set up SSH keys or use HTTPS clone |
| `npm install` fails | Delete node_modules and package-lock.json, retry |
| Port 5173 already in use | Kill the process or use different port |
| Git push rejected | Check branch permissions and pull latest |

### Getting Help

1. **Check error messages** carefully - they often contain the solution
2. **Search existing issues** on GitHub
3. **Ask for help** with full error output and steps to reproduce

## 🎯 Quick Start After Setup

Once setup is complete, you can:

```bash
# 1. Create your first blog post
node scripts/create-blog-post.js

# 2. Follow the interactive prompts

# 3. Test locally
npm run dev

# 4. Validate your post
./scripts/validate-blog-post.sh your-post-slug

# 5. Commit and push
git add .
git commit -m "Add blog post: Your Title"
git push
```

## 📚 Next Steps

After completing setup:
1. Read `BLOG_PUBLISHING_GUIDE.md` for detailed publishing instructions
2. Review `BLOG_PUBLISHING_QUICK_REFERENCE.md` for command reference
3. Try creating a test post to familiarize yourself with the workflow

---

*Remember: Always test locally before pushing changes!*