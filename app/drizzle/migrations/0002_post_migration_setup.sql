-- ============================================================================
-- Post-schema invariants that Drizzle's ORM cannot generate.
--
--   1. Deferred FKs that break circular references.
--   2. Issue status consistency trigger (FR-014).
--   3. civic_memory_role for append-only timeline_events (FR-025, FR-026).
--   4. Referendum immutability on close (CR-010).
--   5. Official summaries immutability once published.
--   6. Decision records immutability once finalized.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Deferred foreign keys (break circular references from the ORM layer).
-- ----------------------------------------------------------------------------

ALTER TABLE issues
  ADD CONSTRAINT issues_current_decision_record_fk
  FOREIGN KEY (current_decision_record_id)
  REFERENCES decision_records (id)
  ON DELETE RESTRICT
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE memberships
  ADD CONSTRAINT memberships_departure_issue_fk
  FOREIGN KEY (departure_issue_id)
  REFERENCES issues (id)
  ON DELETE RESTRICT
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE delegations
  ADD CONSTRAINT delegations_revoked_by_referendum_fk
  FOREIGN KEY (revoked_by_referendum_id)
  REFERENCES referenda (id)
  ON DELETE RESTRICT
  DEFERRABLE INITIALLY DEFERRED;

-- ----------------------------------------------------------------------------
-- 2. Issue status consistency trigger (FR-014).
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION issue_status_consistency_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'decided' AND NEW.current_decision_record_id IS NULL THEN
    RAISE EXCEPTION 'issues: status=decided requires current_decision_record_id (FR-014)'
      USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'stalled' AND NEW.status = 'decided' THEN
    RAISE EXCEPTION 'issues: stalled issue cannot transition to decided (FR-039)'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS issue_status_consistency_trigger ON issues;

CREATE TRIGGER issue_status_consistency_trigger
  BEFORE INSERT OR UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION issue_status_consistency_fn();

-- ----------------------------------------------------------------------------
-- 3. Append-only civic memory (FR-025, FR-026).
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'civic_memory_role') THEN
    CREATE ROLE civic_memory_role NOINHERIT;
  END IF;
END
$$;

GRANT INSERT, SELECT ON TABLE timeline_events TO civic_memory_role;
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE timeline_events FROM civic_memory_role;

DO $$
DECLARE
  app_user text := current_user;
BEGIN
  EXECUTE format('GRANT civic_memory_role TO %I', app_user);
END
$$;

-- ----------------------------------------------------------------------------
-- 4. Referendum immutability on close (CR-010).
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION referenda_no_update_when_closed_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'closed' THEN
    RAISE EXCEPTION 'referenda: row is closed and cannot be updated (CR-010 integrity)'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS referenda_no_update_when_closed_trigger ON referenda;

CREATE TRIGGER referenda_no_update_when_closed_trigger
  BEFORE UPDATE ON referenda
  FOR EACH ROW
  EXECUTE FUNCTION referenda_no_update_when_closed_fn();

-- ----------------------------------------------------------------------------
-- 5. Official summaries immutability once published.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION official_summaries_no_mutate_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'official_summaries: summaries are immutable once published; create a new version instead'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS official_summaries_no_mutate_trigger ON official_summaries;

CREATE TRIGGER official_summaries_no_mutate_trigger
  BEFORE UPDATE OR DELETE ON official_summaries
  FOR EACH ROW
  EXECUTE FUNCTION official_summaries_no_mutate_fn();

-- ----------------------------------------------------------------------------
-- 6. Decision records immutability once finalized.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION decision_records_no_mutate_when_finalized_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.finalized_at IS NOT NULL THEN
    RAISE EXCEPTION 'decision_records: finalized record is immutable (FR-014, FR-023)'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS decision_records_no_mutate_when_finalized_trigger ON decision_records;

CREATE TRIGGER decision_records_no_mutate_when_finalized_trigger
  BEFORE UPDATE ON decision_records
  FOR EACH ROW
  EXECUTE FUNCTION decision_records_no_mutate_when_finalized_fn();
