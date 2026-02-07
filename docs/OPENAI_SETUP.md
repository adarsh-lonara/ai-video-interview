# How to Configure OPENAI_API_KEY for Detailed AI Evaluation

The interview platform uses OpenAI's API for:
- **Question generation** – domain-specific interview questions
- **Response evaluation** – scoring and detailed feedback (relevance, clarity, technical accuracy)

Without `OPENAI_API_KEY`, the app still runs but uses simple fallback logic (template questions and basic scoring). With the key, you get full AI-powered evaluation.

---

## Step 1: Get an OpenAI API Key

1. Go to **[platform.openai.com](https://platform.openai.com)** and sign in (or create an account).
2. Open **API keys**:  
   **Profile (top right) → API keys** or go to **[platform.openai.com/api-keys](https://platform.openai.com/api-keys)**.
3. Click **“Create new secret key”**.
4. Name it (e.g. “Video Interview App”), copy the key, and store it somewhere safe.  
   **You won’t be able to see it again** after closing the dialog.

---

## Step 2: Add the Key to Your Project

Create or edit a **`.env`** file in your **project root** (same folder as `package.json`):

```
# Required for AI question generation and detailed evaluation
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional but recommended
JWT_SECRET=your_jwt_secret_here
PORT=5000
API_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

- Replace `sk-proj-...` with your real API key.
- **Do not** commit `.env` to git (it should be in `.gitignore`).

---

## Step 3: Restart the Backend

The backend reads `.env` when it starts. After adding or changing the key:

1. Stop the server (Ctrl+C in the terminal where it’s running).
2. Start it again:
   ```bash
   npm run server
   ```

No need to change the frontend; it only talks to your backend, which uses the key.

---

## Step 4: Confirm It’s Working

- **Without key:**  
  Results show a message like: *“OPENAI_API_KEY is not configured, so scoring is using a baseline fallback.”*
- **With key:**  
  You get:
  - Richer, domain-specific questions
  - Detailed scores (overall, domain, communication, technical)
  - Strengths and areas for improvement
  - Domain-specific feedback in the results

---

## Security Notes

- Keep your API key **secret**. Don’t put it in frontend code or in public repos.
- Use **environment variables** (e.g. `.env`) and never commit `.env`.
- For production, set `OPENAI_API_KEY` in your hosting provider’s environment (Vercel, Railway, etc.), not in a file in the repo.

---

## Troubleshooting

| Issue | What to do |
|--------|------------|
| Key not picked up | Ensure the file is named `.env` (with the leading dot) and is in the project root. Restart the server after editing. |
| “Invalid API key” | Check for extra spaces or missing characters. Create a new key in the OpenAI dashboard if needed. |
| Quota / rate errors | Check usage and limits at [platform.openai.com/usage](https://platform.openai.com/usage). You may need to add payment method or upgrade. |
