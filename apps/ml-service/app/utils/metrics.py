import numpy as np


def precision_at_k(recommended, relevant, k):
    rec_k = recommended[:k]
    hits = len(set(rec_k) & set(relevant))
    return hits / k if k > 0 else 0.0


def recall_at_k(recommended, relevant, k):
    rec_k = recommended[:k]
    hits = len(set(rec_k) & set(relevant))
    return hits / len(relevant) if len(relevant) > 0 else 0.0


def ndcg_at_k(recommended, relevant, k):
    rec_k = recommended[:k]
    dcg = sum(
        1.0 / np.log2(i + 2) for i, idx in enumerate(rec_k) if idx in relevant
    )
    ideal = sum(1.0 / np.log2(i + 2) for i in range(min(len(relevant), k)))
    return dcg / ideal if ideal > 0 else 0.0


def catalog_coverage(all_recommendations, n_total_events):
    unique = set()
    for rec_list in all_recommendations:
        unique.update(rec_list)
    return len(unique) / n_total_events if n_total_events > 0 else 0.0


def evaluate_model(model_name, predict_fn, test_ground_truth,
                   event_id_to_idx, idx_to_event_id, n_events, k_values=None):
    if k_values is None:
        k_values = [5, 10]

    results = {k: {"precision": [], "recall": [], "ndcg": []} for k in k_values}
    all_recs = []

    for user_id, true_event_ids in test_ground_truth.items():
        true_indices = set()
        for eid in true_event_ids:
            idx = event_id_to_idx.get(eid)
            if idx is not None:
                true_indices.add(idx)

        if not true_indices:
            continue

        rec_tuples = predict_fn(user_id)
        rec_indices = [idx for idx, _ in rec_tuples]
        all_recs.append(rec_indices)

        for k in k_values:
            results[k]["precision"].append(precision_at_k(rec_indices, true_indices, k))
            results[k]["recall"].append(recall_at_k(rec_indices, true_indices, k))
            results[k]["ndcg"].append(ndcg_at_k(rec_indices, true_indices, k))

    metrics = {}
    for k in k_values:
        metrics[f"P@{k}"] = np.mean(results[k]["precision"]) if results[k]["precision"] else 0
        metrics[f"R@{k}"] = np.mean(results[k]["recall"]) if results[k]["recall"] else 0
        metrics[f"NDCG@{k}"] = np.mean(results[k]["ndcg"]) if results[k]["ndcg"] else 0

    max_k = max(k_values)
    metrics["Coverage"] = catalog_coverage(all_recs, n_events)
    metrics["n_evaluated"] = len(all_recs)

    return metrics
