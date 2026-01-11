-- Admin context
CREATE TABLE "admin_users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL
);

CREATE TABLE "community_proposals" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "requester_id" UUID NOT NULL, -- Refers to a User in Core, but no FK constraint across contexts
    "accepted" BOOLEAN,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Core context
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "city" VARCHAR(100) NOT NULL,
    "country" VARCHAR(2) NOT NULL
);

CREATE TABLE "anonymous_users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL
);

CREATE TABLE "communities" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) UNIQUE NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "community_members" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "community_id" UUID NOT NULL REFERENCES "communities"("id"),
    "user_id" UUID NOT NULL REFERENCES "users"("id"),
    "admin" BOOLEAN DEFAULT FALSE,
    CONSTRAINT "uq_members_community_user" UNIQUE ("community_id", "user_id")
);

CREATE TABLE "membership_requests" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "community_id" UUID NOT NULL REFERENCES "communities"("id"),
    "user_id" UUID NOT NULL REFERENCES "users"("id"),
    "accepted" BOOLEAN,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_requests_community_user" UNIQUE ("community_id", "user_id")
);

CREATE TABLE "causes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "community_id" UUID NOT NULL REFERENCES "communities"("id"),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "duration" VARCHAR(100),
    "ods" SMALLINT NOT NULL,
    "closed" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "cause_supports" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "cause_id" UUID NOT NULL REFERENCES "causes"("id"),
    "user_id" UUID REFERENCES "users"("id"),
    "anonymous_user_id" UUID REFERENCES "anonymous_users"("id"),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (("user_id" IS NOT NULL AND "anonymous_user_id" IS NULL) OR ("user_id" IS NULL AND "anonymous_user_id" IS NOT NULL))
);

-- Realizamos herencia mediante single table inheritance 
CREATE TABLE "actions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "cause_id" UUID NOT NULL REFERENCES "causes"("id"),
    "type" VARCHAR(50) NOT NULL, -- 'volunteering' or 'funding'
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "objectives" TEXT[],
    "closed" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- VolunteeringAction specific
    "start" TIMESTAMPTZ,
    "end" TIMESTAMPTZ,
    
    -- FundingAction specific
    "target_amount" NUMERIC(10, 2),
    "current_amount" NUMERIC(10, 2) NOT NULL DEFAULT 0,

    -- Constraint para validar la herencia
    CONSTRAINT action_type_integrity CHECK (
        ("type" = 'volunteering' AND "start" IS NOT NULL AND "end" IS NOT NULL AND "target_amount" IS NULL AND "current_amount" = 0) OR 
        ("type" = 'funding' AND "start" IS NULL AND "end" IS NULL AND "target_amount" IS NOT NULL)
    )
);

CREATE TABLE "volunteer_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "action_id" UUID NOT NULL REFERENCES "actions"("id"),
    "user_id" UUID NOT NULL REFERENCES "users"("id"),
    "start" TIMESTAMPTZ NOT NULL,
    "end" TIMESTAMPTZ NOT NULL
);

CREATE TABLE "donations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "action_id" UUID NOT NULL REFERENCES "actions"("id"),
    "user_id" UUID NOT NULL REFERENCES "users"("id"),
    "amount" NUMERIC(10, 2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1. Admin Users
INSERT INTO "admin_users" ("id", "name", "email", "phone", "password_hash") VALUES
('10000000-0000-4000-8000-000000000001', 'Super Admin', 'admin@solidarian.id', '+34600000000', 'hashed_secret'),
('10000000-0000-4000-8000-000000000002', 'Moderator One', 'mod1@solidarian.id', '+34600000001', 'hashed_secret');

-- 2. Users
INSERT INTO "users" ("id", "name", "email", "password_hash", "phone", "city", "country") VALUES
('20000000-0000-4000-8000-000000000001', 'Juan Pérez', 'juan.perez@email.com', 'hash123', '+34611111111', 'Madrid', 'es'),
('20000000-0000-4000-8000-000000000002', 'Maria Garcia', 'maria.garcia@email.com', 'hash123', '+34622222222', 'Barcelona', 'es'),
('20000000-0000-4000-8000-000000000003', 'Carlos Lopez', 'carlos.lopez@email.com', 'hash123', '+34633333333', 'Valencia', 'es'),
('20000000-0000-4000-8000-000000000004', 'Ana Martinez', 'ana.martinez@email.com', 'hash123', '+34644444444', 'Sevilla', 'es'),
('20000000-0000-4000-8000-000000000005', 'Luis Rodriguez', 'luis.rodriguez@email.com', 'hash123', '+34655555555', 'Bilbao', 'es'),
('20000000-0000-4000-8000-000000000006', 'Elena Gomez', 'elena.gomez@email.com', 'hash123', '+34666666666', 'Madrid', 'es'),
('20000000-0000-4000-8000-000000000007', 'David Ruiz', 'david.ruiz@email.com', 'hash123', '+34677777777', 'Valencia', 'es'),
('20000000-0000-4000-8000-000000000008', 'Sofia Black', 'sofia.black@email.com', 'hash123', '+34688888888', 'London', 'gb'),
('20000000-0000-4000-8000-000000000009', 'Miguel Angel', 'miguel.angel@email.com', 'hash123', '+34699999999', 'Mexico City', 'mx');

-- 3. Anonymous Users
INSERT INTO "anonymous_users" ("id", "email", "name") VALUES
('30000000-0000-4000-8000-000000000001', 'anon1@email.com', 'Anonymous Helper'),
('30000000-0000-4000-8000-000000000002', 'anon2@email.com', 'Secret Donor');

-- 4. Community Proposals
INSERT INTO "community_proposals" ("id", "name", "description", "requester_id", "accepted") VALUES
('50000000-0000-4000-8000-000000000001', 'Green Earth', 'Community for environmental projects', '20000000-0000-4000-8000-000000000001', true),
('50000000-0000-4000-8000-000000000002', 'Tech Education', 'Teaching code to kids', '20000000-0000-4000-8000-000000000002', NULL);

-- 5. Communities
INSERT INTO "communities" ("id", "name", "description") VALUES
('40000000-0000-4000-8000-000000000001', 'Green Earth', 'Community for environmental projects'),
('40000000-0000-4000-8000-000000000002', 'Animal Rescue', 'Helping stray animals find homes'),
('40000000-0000-4000-8000-000000000003', 'Tech for Good', 'Open source solutions for non-profits'),
('40000000-0000-4000-8000-000000000004', 'Local Food Bank', 'Collecting food for families in need');

-- 6. Members
INSERT INTO "community_members" ("id", "community_id", "user_id", "admin") VALUES
('60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', true), -- Juan is admin of Green Earth
('60000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', false), -- Maria is member of Green Earth
('60000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000003', true), -- Carlos is admin of Animal Rescue
('60000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000006', true), -- Elena is admin of Tech for Good
('60000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000007', false), -- David is member of Tech for Good
('60000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000009', true); -- Miguel is admin of Local Food Bank

-- 7. Membership Requests
INSERT INTO "membership_requests" ("id", "community_id", "user_id", "accepted") VALUES
('70000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000004', NULL), -- Ana wants to join Green Earth
('70000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000005', true); -- Luis wanted to join Animal Rescue and was accepted

-- 8. Causes
INSERT INTO "causes" ("id", "community_id", "title", "description", "duration", "ods", "closed") VALUES
('80000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Reforest the Park', 'Planting 1000 trees in the city park', '3 months', 15, false), -- Cause in Green Earth
('80000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'Winter Shelter', 'Building shelters for cats', '1 month', 15, false), -- Cause in Animal Rescue
('80000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003', 'Coding Bootcamp', 'Free coding classes for underprivileged youth', '6 months', 4, false), -- Cause in Tech for Good
('80000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000001', 'Beach Cleanup', 'Cleaning up the local beach', '1 weekend', 14, false), -- Cause in Green Earth (Beach Cleanup)
('80000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000004', 'Holiday Food Drive', 'Collecting food for the holidays', '1 month', 2, false), -- Cause in Local Food Bank
('80000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-000000000004', 'Emergency Flood Relief', 'Helping victims of recent floods', '2 weeks', 1, false); -- Emergency Flood Relief

-- 9. Cause Supports
INSERT INTO "cause_supports" ("id", "cause_id", "user_id", "anonymous_user_id") VALUES
('90000000-0000-4000-8000-000000000001', '80000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', NULL), -- Maria supports Reforest the Park
('90000000-0000-4000-8000-000000000002', '80000000-0000-4000-8000-000000000006', NULL, '30000000-0000-4000-8000-000000000001'), -- Anonymous supports Flood Relief
('90000000-0000-4000-8000-000000000003', '80000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000001', NULL); -- Juan supports Beach Cleanup

-- 10. Actions
INSERT INTO "actions" ("id", "cause_id", "type", "title", "description", "objectives", "target_amount", "current_amount", "start", "end") VALUES
('a0000000-0000-4000-8000-000000000001', '80000000-0000-4000-8000-000000000001', 'funding', 'Buy Saplings', 'Purchase 1000 oak saplings', ARRAY['Purchase 1000 saplings', 'Type: Oak'], 5000.00, 150.00, NULL, NULL), -- Funding Action for Reforest
('a0000000-0000-4000-8000-000000000002', '80000000-0000-4000-8000-000000000001', 'volunteering', 'Planting Day', 'Community gathering to plant trees', ARRAY['Target participants: 50'], NULL, 0, NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 8 hours'), -- Volunteering Action for Reforest
('a0000000-0000-4000-8000-000000000003', '80000000-0000-4000-8000-000000000006', 'funding', 'Food Supplies', 'Buy canned food', ARRAY['Target meals: 5000'], 10000.00, 200.00, NULL, NULL), -- Funding Action for Flood Relief
('a0000000-0000-4000-8000-000000000004', '80000000-0000-4000-8000-000000000003', 'funding', 'Laptop Fund', 'Buying laptops for students', ARRAY['Purchase 20 laptops', 'Specs: i5 8GB'], 10000.00, 1500.00, NULL, NULL), -- Funding Action for Coding Bootcamp
('a0000000-0000-4000-8000-000000000005', '80000000-0000-4000-8000-000000000003', 'volunteering', 'Mentorship Program', 'Mentoring students', ARRAY['Mentors needed: 10'], NULL, 0, NOW() + INTERVAL '30 days', NOW() + INTERVAL '180 days'), -- Volunteering Action for Coding Bootcamp
('a0000000-0000-4000-8000-000000000006', '80000000-0000-4000-8000-000000000004', 'volunteering', 'Cleanup Weekend', 'Gathering to clean the beach', ARRAY['Volunteers needed: 100'], NULL, 0, NOW() + INTERVAL '14 days', NOW() + INTERVAL '16 days'); -- Volunteering Action for Beach Cleanup

-- 11. Volunteer Logs (Volunteering)
INSERT INTO "volunteer_logs" ("id", "action_id", "user_id", "start", "end") VALUES
('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000003', NOW() + INTERVAL '7 days 1 hour', NOW() + INTERVAL '7 days 5 hours'), -- Carlos volunteers for Planting Day
('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000008', NOW() + INTERVAL '14 days 2 hours', NOW() + INTERVAL '14 days 6 hours'), -- Sofia volunteers for Cleanup Weekend
('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000009', NOW() + INTERVAL '40 days 3 hours', NOW() + INTERVAL '40 days 7 hours'), -- Miguel volunteers for Mentorship Program
('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000001', NOW() + INTERVAL '15 days 1 hour', NOW() + INTERVAL '15 days 4 hours'); -- Juan volunteers for Cleanup Weekend

-- 12. Donations
INSERT INTO "donations" ("id", "action_id", "user_id", "amount") VALUES
('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 100.00), -- Juan donates to Buy Saplings
('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 50.00), -- Maria donates to Buy Saplings
('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000005', 200.00), -- Luis donates to Food Supplies
('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000007', 500.00), -- David donates to Laptop Fund
('c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000006', 1000.00); -- Elena donates to Laptop Fund
