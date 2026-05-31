import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

_scheduler = None


def get_scheduler():
    global _scheduler
    if _scheduler is None:
        _scheduler = BackgroundScheduler()
    return _scheduler


def start_scheduler():
    from app.services.recommendation_service import retrain

    scheduler = get_scheduler()

    # Midnight retrain: re-pull data, re-clean, re-train, re-load
    scheduler.add_job(
        retrain,
        trigger=CronTrigger(hour=0, minute=0),
        id="midnight_retrain",
        name="Midnight Model Retrain",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Scheduler started with midnight retrain job")


def stop_scheduler():
    scheduler = get_scheduler()
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")


def get_scheduler_status():
    scheduler = get_scheduler()
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": str(job.next_run_time) if job.next_run_time else None,
        })
    return {"running": scheduler.running, "jobs": jobs}
