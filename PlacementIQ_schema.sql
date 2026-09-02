-- ============================================================
-- PlacementIQ — Database Schema (MySQL 8+ / PostgreSQL-compatible with minor tweaks)
-- Companion file to PlacementIQ_Antigravity_Build_Brief.md
-- ============================================================

CREATE TABLE Admin (
    admin_id        INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(50) DEFAULT 'placement_officer'
);

CREATE TABLE Student (
    student_id      INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    branch          VARCHAR(50) NOT NULL,
    batch_year      INT NOT NULL,
    cgpa            DECIMAL(4,2) NOT NULL CHECK (cgpa BETWEEN 0 AND 10),
    backlogs        INT DEFAULT 0 CHECK (backlogs >= 0),
    resume_url      VARCHAR(255),
    phone           VARCHAR(15)
);

CREATE TABLE Company (
    company_id      INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    sector          VARCHAR(100),
    hr_contact_email VARCHAR(150),
    description     TEXT
);

CREATE TABLE Drive (
    drive_id            INT AUTO_INCREMENT PRIMARY KEY,
    company_id          INT NOT NULL,
    role_offered        VARCHAR(150) NOT NULL,
    ctc_offered         DECIMAL(10,2),
    drive_date          DATE NOT NULL,
    min_cgpa            DECIMAL(4,2) NOT NULL,
    max_backlogs        INT DEFAULT 0,
    eligible_branches   VARCHAR(255) NOT NULL,   -- comma-separated e.g. 'CSE,ISE,ECE'
    status              VARCHAR(30) DEFAULT 'Open',
    created_by_admin_id INT,
    FOREIGN KEY (company_id) REFERENCES Company(company_id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by_admin_id) REFERENCES Admin(admin_id)
);

CREATE TABLE Drive_Round (
    round_id        INT AUTO_INCREMENT PRIMARY KEY,
    drive_id        INT NOT NULL,
    round_number    INT NOT NULL,
    round_name      VARCHAR(100) NOT NULL,       -- e.g. Aptitude, GD, Technical, HR
    scheduled_date  DATE,
    FOREIGN KEY (drive_id) REFERENCES Drive(drive_id) ON DELETE CASCADE,
    UNIQUE (drive_id, round_number)
);

CREATE TABLE Application (
    application_id  INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT NOT NULL,
    drive_id        INT NOT NULL,
    applied_date    DATE NOT NULL DEFAULT (CURRENT_DATE),
    current_status  VARCHAR(30) DEFAULT 'Applied',   -- Applied, In-Progress, Rejected, Selected
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (drive_id) REFERENCES Drive(drive_id) ON DELETE RESTRICT,
    UNIQUE (student_id, drive_id)                    -- prevents duplicate applications
);

CREATE TABLE Round_Result (
    result_id       INT AUTO_INCREMENT PRIMARY KEY,
    application_id  INT NOT NULL,
    round_id        INT NOT NULL,
    result          VARCHAR(20) DEFAULT 'Pending',    -- Pending, Pass, Fail
    remarks         TEXT,
    evaluated_date  DATE,
    FOREIGN KEY (application_id) REFERENCES Application(application_id) ON DELETE CASCADE,
    FOREIGN KEY (round_id) REFERENCES Drive_Round(round_id) ON DELETE CASCADE,
    UNIQUE (application_id, round_id)
);

CREATE TABLE Offer (
    offer_id        INT AUTO_INCREMENT PRIMARY KEY,
    application_id  INT NOT NULL,
    student_id      INT NOT NULL,
    final_ctc       DECIMAL(10,2),
    offer_status    VARCHAR(30) DEFAULT 'Pending',    -- Pending, Accepted, Declined, Superseded
    offer_date      DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (application_id) REFERENCES Application(application_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE
);

CREATE TABLE Notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT NOT NULL,
    message         TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE
);

-- ============================================================
-- Indexes for performance (justify these in the DB report section)
-- ============================================================
CREATE INDEX idx_application_student ON Application(student_id);
CREATE INDEX idx_application_drive ON Application(drive_id);
CREATE INDEX idx_drive_company ON Drive(company_id);
CREATE INDEX idx_roundresult_application ON Round_Result(application_id);

-- ============================================================
-- Trigger 1: Enforce eligibility at application time
-- ============================================================
DELIMITER //
CREATE TRIGGER check_eligibility_before_apply
BEFORE INSERT ON Application
FOR EACH ROW
BEGIN
    DECLARE v_cgpa DECIMAL(4,2);
    DECLARE v_backlogs INT;
    DECLARE v_branch VARCHAR(50);
    DECLARE v_min_cgpa DECIMAL(4,2);
    DECLARE v_max_backlogs INT;
    DECLARE v_eligible_branches VARCHAR(255);

    SELECT cgpa, backlogs, branch INTO v_cgpa, v_backlogs, v_branch
    FROM Student WHERE student_id = NEW.student_id;

    SELECT min_cgpa, max_backlogs, eligible_branches INTO v_min_cgpa, v_max_backlogs, v_eligible_branches
    FROM Drive WHERE drive_id = NEW.drive_id;

    IF v_cgpa < v_min_cgpa OR v_backlogs > v_max_backlogs OR FIND_IN_SET(v_branch, v_eligible_branches) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student does not meet eligibility criteria for this drive.';
    END IF;
END//
DELIMITER ;

-- ============================================================
-- Trigger 2: Only one 'Accepted' offer allowed per student
-- ============================================================
DELIMITER //
CREATE TRIGGER enforce_single_accepted_offer
BEFORE UPDATE ON Offer
FOR EACH ROW
BEGIN
    IF NEW.offer_status = 'Accepted' THEN
        UPDATE Offer
        SET offer_status = 'Superseded'
        WHERE student_id = NEW.student_id
          AND offer_id <> NEW.offer_id
          AND offer_status = 'Accepted';
    END IF;
END//
DELIMITER ;

-- ============================================================
-- Stored Procedure: Branch-wise placement statistics (bonus)
-- ============================================================
DELIMITER //
CREATE PROCEDURE sp_branch_placement_stats(IN in_branch VARCHAR(50))
BEGIN
    SELECT
        s.branch,
        COUNT(DISTINCT s.student_id) AS total_students,
        COUNT(DISTINCT o.student_id) AS placed_students,
        ROUND(COUNT(DISTINCT o.student_id) / COUNT(DISTINCT s.student_id) * 100, 2) AS placement_percentage,
        AVG(o.final_ctc) AS avg_ctc,
        MAX(o.final_ctc) AS highest_ctc
    FROM Student s
    LEFT JOIN Offer o ON s.student_id = o.student_id AND o.offer_status = 'Accepted'
    WHERE s.branch = in_branch
    GROUP BY s.branch;
END//
DELIMITER ;
