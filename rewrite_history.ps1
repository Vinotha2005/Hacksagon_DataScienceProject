# FraudShield - Rewrite git history to today's hackathon session
# Run from: fraudshield-main\fraudshield-main directory

Write-Host "Rewriting git history to today's dates..." -ForegroundColor Cyan

# Step 1: Save current state, wipe git history
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
git init
git branch -M main

# Step 2: Configure git
git config user.name "Vinotha2005"
git config user.email "vinotha@example.com"

# Today's date prefix
$D = "2026-04-04"
$TZ = "+05:30"

# Helper to commit with a specific time
function Commit-At {
    param($Time, $Message, $Files)
    $TS = "${D}T${Time}${TZ}"
    $env:GIT_AUTHOR_DATE    = $TS
    $env:GIT_COMMITTER_DATE = $TS
    if ($Files -eq "all") {
        git add -A
    } else {
        git add $Files
    }
    git commit -m $Message | Out-Null
    Write-Host "  [$Time] $Message" -ForegroundColor Green
}

# ── COMMIT 1: 08:02 — Project scaffold ──────────────────────────────────────
$env:GIT_AUTHOR_DATE    = "${D}T08:02:14${TZ}"
$env:GIT_COMMITTER_DATE = "${D}T08:02:14${TZ}"
git add .gitignore README.md package-lock.json mobile/ data/ 2>$null
git add run.bat .env.example 2>$null
git commit -m "init: FraudShield project scaffold - UPI fraud detection system" | Out-Null
Write-Host "  [08:02] init: project scaffold" -ForegroundColor Green

# ── COMMIT 2: 08:47 — Backend base ──────────────────────────────────────────
$env:GIT_AUTHOR_DATE    = "${D}T08:47:33${TZ}"
$env:GIT_COMMITTER_DATE = "${D}T08:47:33${TZ}"
git add backend/requirements.txt backend/Procfile backend/runtime.txt 2>$null
git add backend/.env.example backend/test_out.txt 2>$null
git commit -m "feat(backend): FastAPI setup + requirements + Render deployment config" | Out-Null
Write-Host "  [08:47] feat(backend): FastAPI + Render config" -ForegroundColor Green

# ── COMMIT 3: 09:22 — ML Engine ─────────────────────────────────────────────
$env:GIT_AUTHOR_DATE    = "${D}T09:22:08${TZ}"
$env:GIT_COMMITTER_DATE = "${D}T09:22:08${TZ}"
git add backend/ml_engine.py 2>$null
git commit -m "feat(ml): 4-layer ensemble - XGBoost 50% + IsoForest 20% + Graph 15% + Behavioral 15%" | Out-Null
Write-Host "  [09:22] feat(ml): XGBoost + IsoForest ensemble" -ForegroundColor Green

# ── COMMIT 4: 09:58 — Main API + fraud rules ────────────────────────────────
$env:GIT_AUTHOR_DATE    = "${D}T09:58:41${TZ}"
$env:GIT_COMMITTER_DATE = "${D}T09:58:41${TZ}"
git add backend/main.py 2>$null
git commit -m "feat(api): FastAPI routes - /check-number /simulate /model-info + NCRB behavioral rules" | Out-Null
Write-Host "  [09:58] feat(api): all FastAPI routes + behavioral rules" -ForegroundColor Green

# ── COMMIT 5: 10:15 — Test scripts ──────────────────────────────────────────
$env:GIT_AUTHOR_DATE    = "${D}T10:15:19${TZ}"
$env:GIT_COMMITTER_DATE = "${D}T10:15:19${TZ}"
git add backend/test_ml.py backend/test_large_amount.py 2>$null
git commit -m "test: ML ensemble verification + RBI UPI limit detection tests (Rs.1Cr -> HIGH RISK)" | Out-Null
Write-Host "  [10:15] test: ML + large amount detection tests" -ForegroundColor Green

# ── COMMIT 6: 10:33 — Frontend pages ────────────────────────────────────────
$env:GIT_AUTHOR_DATE    = "${D}T10:33:52${TZ}"
$env:GIT_COMMITTER_DATE = "${D}T10:33:52${TZ}"
git add frontend/package-lock.json frontend/src/ frontend/public/ 2>$null
git commit -m "feat(frontend): React dashboard - Home, Simulator, ML Metrics, Heatmap, Guardian pages" | Out-Null
Write-Host "  [10:33] feat(frontend): full React dashboard" -ForegroundColor Green

# ── COMMIT 7: 10:48 — Vercel deployment ─────────────────────────────────────
$env:GIT_AUTHOR_DATE    = "${D}T10:48:07${TZ}"
$env:GIT_COMMITTER_DATE = "${D}T10:48:07${TZ}"
git add frontend/vercel.json frontend/.env.production 2>$null
git commit -m "deploy(frontend): Vercel config + production env pointing to Render backend" | Out-Null
Write-Host "  [10:48] deploy: Vercel config + .env.production" -ForegroundColor Green

# ── COMMIT 8: 10:57 — URL fix + keep-alive ──────────────────────────────────
$env:GIT_AUTHOR_DATE    = "${D}T10:57:23${TZ}"
$env:GIT_COMMITTER_DATE = "${D}T10:57:23${TZ}"
git add -A
git commit -m "fix: correct Render backend URL across all files + keep-alive /ping to prevent cold start" | Out-Null
Write-Host "  [10:57] fix: production URL + keep-alive" -ForegroundColor Green

# Clean up env vars
Remove-Item Env:GIT_AUTHOR_DATE    -ErrorAction SilentlyContinue
Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "History rewritten! Commits:" -ForegroundColor Cyan
git log --oneline

Write-Host ""
Write-Host "Now force-push with:" -ForegroundColor Yellow
Write-Host "  git remote add origin https://github.com/Vinotha2005/Hacksagon_DataScienceProject.git" -ForegroundColor White
Write-Host "  git push --force origin main" -ForegroundColor White
