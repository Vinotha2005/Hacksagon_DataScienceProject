"""
FraudShield ML Engine — Architecture-accurate smoke tests.

Key design points being tested:
  - score_transaction() = raw ML ensemble (may return LOW even for known numbers if features don't match)
  - simulate_transaction() = clamps known-fraud scenarios to HIGH (this is what judges see)
  - main.py /api/check-number = blends fraud DB (70%) + ML (30%) for known numbers
  - Determinism: same scenario key always returns same result
"""
import sys
sys.path.insert(0, '.')

print("=" * 60)
print("Loading ml_engine (XGBoost + IsoForest training)...")
print("=" * 60)

from ml_engine import score_transaction, simulate_transaction, get_model_info, get_all_scenario_keys

# ── Test 1: Safe transaction raw ML ──────────────────────────────────────────
print("\n[1] Raw ML - Safe transaction (rent, business hours)")
r = score_transaction(1250.0, "rent payment", False, hour=11)
print("  risk_score =", r["risk_score"], " | level =", r["risk_level"])
print("  XGB =", r["xgb_score"], " | ISO =", r["isolation_score"], " | Graph =", r["graph_score"])
print("  confidence =", r["model_confidence"])
print("  explanations:", len(r["explanations"]), "items")
print("  shap_features:", len(r["shap_features"]), "items")
assert r["risk_level"] == "LOW", "Safe transaction should be LOW: got " + str(r["risk_level"])
assert len(r["explanations"]) > 0, "Must have explanations"
assert len(r["shap_features"]) > 0, "Must have SHAP features"
print("  PASS")

# ── Test 2: High-risk raw ML signals ─────────────────────────────────────────
print("\n[2] Raw ML - Sentinel amount + midnight + scam note")
r2 = score_transaction(49999.0, "commission payment urgent otp", True, hour=0,
                        repeated_txn_24h=15, unique_receivers=10, reported_count=8)
print("  risk_score =", r2["risk_score"], " | level =", r2["risk_level"])
print("  behavioral_score =", r2["behavioral_score"], " | behavioral_reasons:", len(r2["behavioral_reasons"]))
assert r2["risk_score"] > 30, "High-signal transaction should score > 30: got " + str(r2["risk_score"])
assert r2["behavioral_score"] > 0, "Behavioral score should be > 0 for high-signal txn"
assert len(r2["behavioral_reasons"]) > 0, "Should have behavioral reasons"
assert "confidence" in r2, "Must have confidence key"
print("  PASS")

# ── Test 3: Simulator - Safe scenario ────────────────────────────────────────
print("\n[3] Simulator - safe")
s_safe = simulate_transaction("safe")
print("  risk_score =", s_safe["risk_score"], " | level =", s_safe["risk_level"])
print("  is_simulated =", s_safe["is_simulated"])
print("  scenario_label =", s_safe["scenario_label"])
assert s_safe["is_simulated"] == True, "Must be flagged as simulated"
assert s_safe["risk_level"] == "LOW", "Safe scenario must be LOW: got " + str(s_safe["risk_level"])
print("  PASS")

# ── Test 4: Simulator - HIGH risk scenarios ───────────────────────────────────
for key in ["otp_scam", "fraud_ring", "micro_fraud"]:
    print("\n[4] Simulator -", key)
    s = simulate_transaction(key)
    print("  risk_score =", s["risk_score"], " | level =", s["risk_level"])
    print("  explanations:", s["explanations"][:1])
    assert s["is_simulated"] == True, "Must be flagged as simulated"
    assert s["risk_level"] == "HIGH", key + " must be HIGH: got " + str(s["risk_level"])
    assert s["risk_score"] >= 82, key + " score must be >= 82: got " + str(s["risk_score"])
    print("  PASS")

# ── Test 5: Determinism ───────────────────────────────────────────────────────
print("\n[5] Determinism check - same scenario same result")
for key in ["safe", "otp_scam", "fraud_ring", "micro_fraud"]:
    s1 = simulate_transaction(key)
    s2 = simulate_transaction(key)
    assert s1["risk_score"] == s2["risk_score"], key + " not deterministic!"
    print("  [", key, "] score stable:", s1["risk_score"])
print("  PASS")

# ── Test 6: Model info ───────────────────────────────────────────────────────
print("\n[6] Model info endpoint")
info = get_model_info()
auc = info["primary_classifier"]["auc_proxy_test"]
print("  XGBoost AUC (proxy test):", auc)
print("  n_features:", info["primary_classifier"]["n_features"])
print("  Dataset (proxy):", info["dataset_strategy"]["layer_1_proxy_training"]["name"])
print("  Govt sources:", len(info["dataset_strategy"]["layer_2_government_data"]["sources"]), "sources")
print("  Govt stats used:", len(info["dataset_strategy"]["layer_2_government_data"]["key_statistics_used"]), "stats")
print("  Ensemble:", info["ensemble"]["formula"])
print("  Behavioral rules:", len(info["behavioral_layer"]["rules"]), "rules")
print("  Disclaimers:", len(info["disclaimers"]), "items")
assert auc >= 0.95, "AUC should be high on clean synthetic dataset"
assert info["primary_classifier"]["n_features"] == 25, "Should have 25 features"
assert len(info["disclaimers"]) >= 7, "Must have 7 disclaimers"
assert len(info["behavioral_layer"]["rules"]) >= 7, "Must have 7 behavioral rules"
assert info["ensemble"]["behavioral_weight"] == 0.15, "Behavioral weight must be 0.15"
print("  PASS")

# ── Test 7: Scenario list ────────────────────────────────────────────────────
print("\n[7] Scenario keys")
keys = get_all_scenario_keys()
print("  Available scenarios:", keys)
assert set(keys) == {"safe", "otp_scam", "fraud_ring", "micro_fraud"}
print("  PASS")

print("\n" + "=" * 60)
print("  ALL TESTS PASSED - ML Engine verified OK")
print("  AUC on proxy test set:", auc)
print("  SHAP: XGBoost native TreeSHAP (pred_contribs=True)")
print("  Ensemble: 60% XGB + 25% IsoForest + 15% Graph")
print("=" * 60)
