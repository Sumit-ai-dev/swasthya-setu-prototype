# Contributing to Swasthya-Setu

Welcome to the Swasthya-Setu team! To ensure our codebase remains clean, professional, and ready for the AI for Bharat Hackathon judging, we are adopting a standard **Open Source / GSoC-style development workflow**.

Please read this guide carefully before pushing any code.

---

## 🌳 1. Branching Strategy

**Never push directly to the `main` branch.** `main` is our production-ready branch that we will submit for the hackathon. 

When you start working on a new task, create a branch from `main` using the following naming conventions:

*   **`feat/...`**: For new features (e.g., `feat/auth-login`, `feat/video-consultation`)
*   **`fix/...`**: For bug fixes (e.g., `fix/triage-crash`, `fix/ui-alignment`)
*   **`docs/...`**: For documentation updates (e.g., `docs/api-readme`)
*   **`refactor/...`**: For code refactoring without adding features (e.g., `refactor/api-routes`)

**How to create a branch:**
```bash
# Ensure you are up to date with main
git checkout main
git pull origin main

# Create and switch to your new branch
git checkout -b feat/your-feature-name
```

---

## 📝 2. Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/). This keeps our Git history perfectly readable for the judges.

**Format:**
```
<type>(<scope optionally>): <short description>
```

**Examples:**
*   `feat(frontend): create triage form UI`
*   `fix(backend): resolve RAG context loading timeout`
*   `docs: update setup instructions in README`

---

## 🔄 3. Development Workflow (Step-by-Step)

This is the exact workflow you must follow for every task:

1. **Pull Latest:** Always run `git pull origin main` on your `main` branch before starting.
2. **Branch Out:** `git checkout -b type/feature-name`
3. **Code & Test Locally:**
    * Write your code.
    * If backend: run `pytest -v` to ensure nothing broke.
    * If frontend: verify UI in the browser (`npm run dev`).
4. **Commit:** Commit your changes using the Conventional Commits format.
5. **Push:** Push your specific branch to GitHub:
   ```bash
   git push origin feat/your-feature-name
   ```
6. **Open a Pull Request (PR):**
    * Go to our GitHub repository.
    * Click "Compare & pull request".
    * Write a brief description of what your PR does.
    * **Tag team members for review.**
7. **Review & Merge:**
    * At least one other team member must review the code.
    * Do not merge your own PRs without team approval.
    * Once approved, click "Squash and merge" to keep the `main` history clean.

---

## 🚀 4. Hackathon Phases Checklist

To stay aligned with the March 8th submission deadline, focus on these phases:

### Phase 1: MVP Core (Completed ✅)
- [x] Backend API Base (Triage, Chatbot, Analytics)
- [x] Frontend React Scaffold
- [x] Connect Frontend App to Backend APIs using Axios
- [x] Implement local Vector DB (pgvector) + HuggingFace embeddings for medical rules

### Phase 2: Refinement & Security (Completed ✅)
- [x] Connect RAG chatbot to actual WHO data chunks in VectorDB
- [x] Setup AWS standard credentials securely (IAM) for Bedrock generation
- [x] Polish Tailwind CSS UI for Mobile Responsiveness

### Phase 3: Deployment & Presentation (Completed ✅)
- [x] Investigate and fix 3D Rendering "Blank Screen" issues
- [x] Restore and verify RAG Database Connectivity (Docker/pgvector)
- [x] Implement real-time Analytics Dashboard with DB Logging
- [x] Prepare FastAPI for AWS Lambda (Dockerfile + Deploy Scripts)
- [x] Prepare React UI for AWS S3 / CloudFront (Build verified)
- [/] Record Final Demo Video & Finalize Presentation Doc

---

## 💡 Best Practices

*   **Communicate:** If two people are working on the frontend simultaneously, talk to each other to avoid merge conflicts.
*   **Pull frequently:** Run `git pull origin main` while on `main` to get your teammates' merged work locally.
*   **Don't commit `.env`:** Never commit AWS keys or database passwords. The `.gitignore` is set up to block `.env`, but be careful.
