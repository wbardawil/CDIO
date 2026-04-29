-- ============================================================
-- AI-CDIO — Schema v6: Atomic synthesis replace
-- Closes P0-6: previously the /api/assessments/synthesize route did
-- delete-then-insert across two tables outside any transaction. If
-- the inserts failed after the deletes succeeded, the previous
-- synthesis was permanently lost.
--
-- This stored procedure wraps both deletes + both inserts in a single
-- Postgres function. The function body runs as one implicit transaction —
-- any failure rolls back ALL changes, preserving prior data.
-- Idempotent — safe to re-run.
-- ============================================================

create or replace function replace_assessment_synthesis(
  p_assessment_id uuid,
  p_syntheses jsonb,
  p_divergences jsonb
)
returns void
language plpgsql
security definer
as $$
begin
  -- Wipe prior synthesis + divergences for this assessment
  delete from assessment_synthesis where assessment_id = p_assessment_id;
  delete from divergence_points where assessment_id = p_assessment_id;

  -- Insert new syntheses
  if jsonb_array_length(p_syntheses) > 0 then
    insert into assessment_synthesis (
      assessment_id,
      module_number,
      consensus_score,
      divergence_score,
      business_impact,
      priority_rank,
      priority_class,
      recommended_actions
    )
    select
      p_assessment_id,
      (item->>'module_number')::integer,
      (item->>'consensus_score')::decimal,
      (item->>'divergence_score')::decimal,
      (item->>'business_impact')::decimal,
      (item->>'priority_rank')::integer,
      item->>'priority_class',
      coalesce(
        array(select jsonb_array_elements_text(item->'recommended_actions')),
        '{}'::text[]
      )
    from jsonb_array_elements(p_syntheses) as item;
  end if;

  -- Insert new divergences
  if jsonb_array_length(p_divergences) > 0 then
    insert into divergence_points (
      assessment_id,
      module_number,
      stakeholder_a_id,
      stakeholder_b_id,
      score_gap,
      framework_recommendation,
      decision_package
    )
    select
      p_assessment_id,
      (item->>'module_number')::integer,
      (item->>'stakeholder_a_id')::uuid,
      (item->>'stakeholder_b_id')::uuid,
      (item->>'score_gap')::integer,
      item->>'framework_recommendation',
      coalesce(item->'decision_package', '{}'::jsonb)
    from jsonb_array_elements(p_divergences) as item;
  end if;
end;
$$;

-- Grant execute to the roles that call this from the API
grant execute on function replace_assessment_synthesis(uuid, jsonb, jsonb) to service_role;
grant execute on function replace_assessment_synthesis(uuid, jsonb, jsonb) to authenticated;

comment on function replace_assessment_synthesis(uuid, jsonb, jsonb) is
  'Atomically replace all assessment_synthesis + divergence_points rows for an assessment. Used by /api/assessments/synthesize to close P0-6 (data-loss risk on retry). Either all deletes + inserts succeed or none do.';
