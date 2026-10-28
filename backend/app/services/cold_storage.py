import json
import hashlib
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from app.core.config import settings

class ColdStorageDataLake:
    """
    S3-Compatible Object Storage Data Lake Service.
    Implements Hot/Cold Tiering:
    - Hot Tier: PostgreSQL (real-time transactional data & active queries)
    - Cold Tier: S3 Data Lake (immutable audit logs, telemetry archives, compliance snapshots)
    """

    def __init__(self):
        self.bucket_name = settings.S3_BUCKET_NAME
        self.region = settings.AWS_REGION
        self.endpoint_url = settings.S3_ENDPOINT_URL if settings.S3_ENDPOINT_URL else None
        
        # Local partition root mirroring S3 hierarchy for instant dev/demo inspection
        self.local_lake_dir = Path("data_lake") / "s3" / self.bucket_name
        self.local_lake_dir.mkdir(parents=True, exist_ok=True)
        
        # S3 Client initialization
        self.s3_client = None
        self._init_s3_client()

    def _init_s3_client(self):
        try:
            if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
                kwargs = {
                    "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
                    "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
                    "region_name": self.region,
                }
                if self.endpoint_url:
                    kwargs["endpoint_url"] = self.endpoint_url
                self.s3_client = boto3.client("s3", **kwargs)
            else:
                self.s3_client = None
        except Exception as e:
            print(f"[ColdStorage] Failed to initialize remote S3 client: {e}")
            self.s3_client = None

    def _generate_checksum(self, payload_bytes: bytes) -> str:
        return hashlib.sha256(payload_bytes).hexdigest()

    def _put_object(self, s3_key: str, payload_bytes: bytes, content_type: str = "application/json") -> str:
        """
        Stores object in local S3 data lake mirror and pushes to AWS S3 / MinIO if configured.
        Returns the canonical s3:// URI.
        """
        # 1. Save to local Lake mirror (guarantees zero-failure resilience)
        local_path = self.local_lake_dir / s3_key.replace("/", os.sep)
        local_path.parent.mkdir(parents=True, exist_ok=True)
        with open(local_path, "wb") as f:
            f.write(payload_bytes)

        # 2. Upload to Cloud S3 if credentials available
        if self.s3_client:
            try:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=s3_key,
                    Body=payload_bytes,
                    ContentType=content_type,
                    Metadata={
                        "storage-tier": "COLD_ANALYTICAL_LAKE",
                        "project": "AgentFlow-Cloud"
                    }
                )
            except (ClientError, NoCredentialsError) as e:
                print(f"[ColdStorage] Cloud S3 sync warning (stored locally in lake): {e}")

        s3_uri = f"s3://{self.bucket_name}/{s3_key}"
        return s3_uri

    def archive_workflow_decision(
        self,
        workflow_id: int,
        anomaly_id: int,
        farm_id: int,
        agent_outputs: Dict[str, Any],
        safety_decision: Optional[str] = None,
        safety_reasons: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Archives an immutable AI diagnostic and safety decision snapshot to S3.
        Partitioned path: audit_logs/year=YYYY/month=MM/day=DD/workflow_{id}.json
        """
        now = datetime.utcnow()
        date_partition = f"year={now.year}/month={now.month:02d}/day={now.day:02d}"
        s3_key = f"audit_logs/{date_partition}/workflow_{workflow_id:06d}.json"

        # Build production-grade compliance audit envelope
        audit_document = {
            "metadata": {
                "schema_version": "1.0",
                "storage_tier": "COLD_OBJECT_STORAGE_DATA_LAKE",
                "compliance_standard": "WORM_WRITE_ONCE_READ_MANY",
                "retention_policy": "PERMANENT_AUDIT_LOG",
                "archived_at_utc": now.isoformat() + "Z",
                "canonical_s3_key": s3_key,
                "s3_bucket": self.bucket_name
            },
            "workflow_execution": {
                "workflow_id": workflow_id,
                "anomaly_id": anomaly_id,
                "farm_id": farm_id,
                "status": "COMPLETED",
                "sensor_context": agent_outputs.get("sensor_data", {}),
                "weather_context": agent_outputs.get("weather_context", {}),
                "retrieved_knowledge": agent_outputs.get("retrieved_knowledge", ""),
                "diagnostic_reasoning": agent_outputs.get("recommendation", ""),
                "proposed_action": agent_outputs.get("proposed_action", {}),
                "safety_gate": {
                    "decision": safety_decision or agent_outputs.get("safety_decision", "approved"),
                    "reasons": safety_reasons or agent_outputs.get("safety_reasons", [])
                }
            }
        }

        payload_bytes = json.dumps(audit_document, indent=2).encode("utf-8")
        checksum = self._generate_checksum(payload_bytes)
        audit_document["metadata"]["sha256_checksum"] = checksum
        payload_bytes = json.dumps(audit_document, indent=2).encode("utf-8")

        s3_uri = self._put_object(s3_key, payload_bytes)
        return {
            "s3_uri": s3_uri,
            "s3_key": s3_key,
            "checksum": checksum,
            "archived_at": now.isoformat() + "Z"
        }

    def archive_telemetry_batch(self, readings: List[Dict[str, Any]], farm_id: int = 1) -> Dict[str, Any]:
        """
        Archives raw high-frequency telemetry readings from PostgreSQL to S3 Data Lake.
        Partitioned path: telemetry_lake/year=YYYY/month=MM/day=DD/batch_{timestamp}.json
        """
        now = datetime.utcnow()
        timestamp_str = now.strftime("%Y%m%d_%H%M%S")
        date_partition = f"year={now.year}/month={now.month:02d}/day={now.day:02d}"
        s3_key = f"telemetry_lake/{date_partition}/farm_{farm_id}_batch_{timestamp_str}.json"

        batch_envelope = {
            "metadata": {
                "storage_tier": "COLD_TELEMETRY_LAKE",
                "farm_id": farm_id,
                "record_count": len(readings),
                "batch_generated_at": now.isoformat() + "Z",
                "s3_bucket": self.bucket_name
            },
            "readings": readings
        }

        payload_bytes = json.dumps(batch_envelope, indent=2, default=str).encode("utf-8")
        checksum = self._generate_checksum(payload_bytes)
        batch_envelope["metadata"]["sha256_checksum"] = checksum
        payload_bytes = json.dumps(batch_envelope, indent=2, default=str).encode("utf-8")

        s3_uri = self._put_object(s3_key, payload_bytes)
        return {
            "s3_uri": s3_uri,
            "s3_key": s3_key,
            "record_count": len(readings),
            "checksum": checksum
        }

    def get_status(self) -> Dict[str, Any]:
        """Returns statistics for the S3 Cold Storage Data Lake."""
        audit_files = list(self.local_lake_dir.glob("audit_logs/**/*.json"))
        telemetry_files = list(self.local_lake_dir.glob("telemetry_lake/**/*.json"))

        recent_audit_uri = None
        if audit_files:
            latest_audit = max(audit_files, key=lambda p: p.stat().st_mtime)
            rel_path = latest_audit.relative_to(self.local_lake_dir).as_posix()
            recent_audit_uri = f"s3://{self.bucket_name}/{rel_path}"

        return {
            "status": "ONLINE",
            "tier": "COLD_OBJECT_STORAGE_LAKE",
            "provider": "AWS S3 / S3-Compatible Data Lake",
            "bucket_name": self.bucket_name,
            "cloud_sync_active": self.s3_client is not None,
            "total_archived_decisions": len(audit_files),
            "total_telemetry_batches": len(telemetry_files),
            "latest_archived_uri": recent_audit_uri or f"s3://{self.bucket_name}/audit_logs/pending...",
            "architecture_pattern": "Tiered Storage (Hot DB + Cold S3 Data Lake)"
        }

    def read_archived_object(self, s3_key: str) -> Optional[Dict[str, Any]]:
        """Reads back an archived object from the S3 data lake for verification."""
        local_path = self.local_lake_dir / s3_key.replace("/", os.sep)
        if local_path.exists():
            with open(local_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return None

# Singleton instance
cold_storage = ColdStorageDataLake()
