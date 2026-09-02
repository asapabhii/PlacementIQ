-- ============================================================
-- PlacementIQ — PostgreSQL Triggers & Stored Procedures
-- Run AFTER Prisma has created tables (npx prisma db push)
-- ============================================================

-- ============================================================
-- Trigger 1: Enforce eligibility at application time
-- Rejects INSERT if student doesn't meet drive criteria
-- ============================================================
CREATE OR REPLACE FUNCTION check_eligibility_before_apply()
RETURNS TRIGGER AS $$
DECLARE
    v_cgpa DECIMAL(4,2);
    v_backlogs INT;
    v_branch VARCHAR(50);
    v_min_cgpa DECIMAL(4,2);
    v_max_backlogs INT;
    v_eligible_branches VARCHAR(255);
BEGIN
    SELECT cgpa, backlogs, branch INTO v_cgpa, v_backlogs, v_branch
    FROM student WHERE student_id = NEW.student_id;

    SELECT min_cgpa, max_backlogs, eligible_branches INTO v_min_cgpa, v_max_backlogs, v_eligible_branches
    FROM drive WHERE drive_id = NEW.drive_id;

    -- Check CGPA
    IF v_cgpa < v_min_cgpa THEN
        RAISE EXCEPTION 'Student does not meet minimum CGPA requirement (has %, needs %)', v_cgpa, v_min_cgpa;
    END IF;

    -- Check backlogs
    IF v_backlogs > v_max_backlogs THEN
        RAISE EXCEPTION 'Student has too many backlogs (has %, max allowed %)', v_backlogs, v_max_backlogs;
    END IF;

    -- Check branch eligibility (comma-separated list)
    IF v_branch NOT IN (SELECT TRIM(unnest(string_to_array(v_eligible_branches, ',')))) THEN
        RAISE EXCEPTION 'Student branch (%) is not eligible for this drive', v_branch;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_check_eligibility_before_apply
    BEFORE INSERT ON application
    FOR EACH ROW
    EXECUTE FUNCTION check_eligibility_before_apply();

-- ============================================================
-- Trigger 2: Enforce single accepted offer per student
-- When an offer is accepted, supersede any other accepted offers
-- ============================================================
CREATE OR REPLACE FUNCTION enforce_single_accepted_offer()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.offer_status = 'Accepted' THEN
        UPDATE offer
        SET offer_status = 'Superseded'
        WHERE student_id = NEW.student_id
          AND offer_id <> NEW.offer_id
          AND offer_status = 'Accepted';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_enforce_single_accepted_offer
    BEFORE UPDATE ON offer
    FOR EACH ROW
    EXECUTE FUNCTION enforce_single_accepted_offer();

-- ============================================================
-- Trigger 3: Auto-generate offer when all rounds passed
-- After a round result is updated to 'Pass', check if ALL
-- rounds for that application's drive are 'Pass'. If so,
-- update application status to 'Selected' and create an Offer.
-- ============================================================
CREATE OR REPLACE FUNCTION auto_generate_offer_on_selection()
RETURNS TRIGGER AS $$
DECLARE
    v_drive_id INT;
    v_student_id INT;
    v_total_rounds INT;
    v_passed_rounds INT;
    v_ctc DECIMAL(10,2);
    v_existing_offer INT;
BEGIN
    IF NEW.result = 'Pass' THEN
        -- Get drive and student info
        SELECT a.drive_id, a.student_id INTO v_drive_id, v_student_id
        FROM application a
        WHERE a.application_id = NEW.application_id;

        -- Count total rounds for this drive
        SELECT COUNT(*) INTO v_total_rounds
        FROM drive_round
        WHERE drive_id = v_drive_id;

        -- Count passed rounds for this application
        SELECT COUNT(*) INTO v_passed_rounds
        FROM round_result rr
        JOIN drive_round dr ON rr.round_id = dr.round_id
        WHERE rr.application_id = NEW.application_id
          AND rr.result = 'Pass'
          AND dr.drive_id = v_drive_id;

        -- If all rounds passed, auto-select and generate offer
        IF v_passed_rounds >= v_total_rounds AND v_total_rounds > 0 THEN
            -- Update application status
            UPDATE application
            SET current_status = 'Selected'
            WHERE application_id = NEW.application_id;

            -- Check if offer already exists
            SELECT COUNT(*) INTO v_existing_offer
            FROM offer
            WHERE application_id = NEW.application_id;

            IF v_existing_offer = 0 THEN
                -- Get CTC from drive
                SELECT ctc_offered INTO v_ctc
                FROM drive
                WHERE drive_id = v_drive_id;

                -- Create offer
                INSERT INTO offer (application_id, student_id, final_ctc, offer_status, offer_date)
                VALUES (NEW.application_id, v_student_id, v_ctc, 'Pending', CURRENT_DATE);
            END IF;
        END IF;
    END IF;

    -- If result is 'Fail', update application status to 'Rejected'
    IF NEW.result = 'Fail' THEN
        UPDATE application
        SET current_status = 'Rejected'
        WHERE application_id = NEW.application_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_auto_generate_offer_on_selection
    AFTER INSERT OR UPDATE ON round_result
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_offer_on_selection();

-- ============================================================
-- Stored Function: Branch-wise placement statistics
-- Usage: SELECT * FROM sp_branch_placement_stats('CSE');
-- ============================================================
CREATE OR REPLACE FUNCTION sp_branch_placement_stats(in_branch VARCHAR(50))
RETURNS TABLE (
    branch VARCHAR(50),
    total_students BIGINT,
    placed_students BIGINT,
    placement_percentage NUMERIC,
    avg_ctc NUMERIC,
    highest_ctc NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.branch,
        COUNT(DISTINCT s.student_id) AS total_students,
        COUNT(DISTINCT o.student_id) AS placed_students,
        ROUND(COUNT(DISTINCT o.student_id)::NUMERIC / NULLIF(COUNT(DISTINCT s.student_id), 0) * 100, 2) AS placement_percentage,
        ROUND(AVG(o.final_ctc), 2) AS avg_ctc,
        MAX(o.final_ctc) AS highest_ctc
    FROM student s
    LEFT JOIN offer o ON s.student_id = o.student_id AND o.offer_status = 'Accepted'
    WHERE s.branch = in_branch
    GROUP BY s.branch;
END;
$$ LANGUAGE plpgsql;
