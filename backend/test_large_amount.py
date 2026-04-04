"""Quick test: verify large amount fraud detection fix."""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from ml_engine import score_transaction

tests = [
    ("Normal Rs.1,250 (rent)",       1_250),
    ("Medium Rs.50,000",             50_000),
    ("Near-limit Rs.1,80,000",       1_80_000),
    ("Exceeds limit Rs.2,50,000",    2_50_000),
    ("Very high Rs.10,00,000 (10L)", 10_00_000),
    ("ONE CRORE Rs.1,00,00,000",     1_00_00_000),
]

print("\n" + "="*66)
print(f"{'Test Case':<35} {'Amount':>14}  {'Score':>5}  {'Level'}")
print("="*66)
for label, amount in tests:
    r = score_transaction(
        amount=float(amount), note="transfer",
        is_known_fraud=False, repeated_txn_24h=0,
        unique_receivers=1, reported_count=0
    )
    score = r['risk_score']
    level = r['risk_level']
    icon  = "OK " if level=="LOW" else ("!!! HIGH" if level=="HIGH" else "~ MED")
    print(f"{label:<35} Rs.{amount:>10,.0f}  {score:>5.1f}  {icon}")
    if r.get('behavioral_reasons'):
        print(f"    => {r['behavioral_reasons'][0][:75]}")
print("="*66)
print("\nFIX VERIFIED if 2.5L/10L/1Cr show HIGH or MEDIUM risk.")
