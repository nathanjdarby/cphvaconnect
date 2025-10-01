-- CPHVA Connect Database Seed Data (SQLite Version)
-- Converted from mock-data.ts to SQL INSERT statements

-- Insert Users
INSERT INTO users (id, name, email, role, name_is_public, email_is_public, bio, avatar_url, avatar_storage_path) VALUES
('user1', 'Attendee User', 'attendee@example.com', 'attendee', 1, 0, 'Passionate about public health and attending the CPHVA Conference!', 'https://placehold.co/100x100.png?text=AU', NULL),
('admin1', 'Admin User', 'admin@example.com', 'admin', 1, 1, 'Ensuring a smooth conference experience for all.', 'https://placehold.co/100x100.png?text=AD', NULL),
('organiser1', 'Organiser User', 'organiser@example.com', 'organiser', 1, 1, 'Organising the CPHVA Annual Conference.', 'https://placehold.co/100x100.png?text=OU', NULL);

-- Insert Ticket Types
INSERT INTO ticket_types (id, name, price, description) VALUES
('tt-1', 'General Admission', 75.00, 'Access to all general sessions and exhibition hall.'),
('tt-2', 'Unite Member Rate', 60.00, 'Discounted rate for Unite members.'),
('tt-3', 'Student Pass', 30.00, 'Discounted rate for students. Valid student ID required.');

-- Insert Locations
INSERT INTO locations (id, name) VALUES
('loc-bcec-main', 'BCEC Birmingham Main Hall'),
('loc-bcec-exhibit', 'BCEC Birmingham Exhibition Hall'),
('loc-bcec-dining', 'BCEC Birmingham Dining Area');

-- Insert Speakers
INSERT INTO speakers (id, name, title, bio, image_url, data_ai_hint, image_storage_path) VALUES
('speaker-jt', 'Janet Taylor', 'CPHVA Executive Chair', 'Executive Chair of CPHVA, leading the organisation and advocating for community public health visitors and allied professionals.', 'https://placehold.co/400x400.png?text=JT', 'professional woman', NULL),
('speaker-dh', 'Dominic Hook', 'National Sector Coordinator for Public Services, Unite', 'National Sector Coordinator for Public Services at Unite the Union.', 'https://placehold.co/400x400.png?text=DH', 'professional man', NULL),
('speaker-pl', 'Paul Labourne', 'CNO for Wales (on behalf of Sue Tranka), Welsh Government', 'Representing the Chief Nursing Officer for Wales from the Welsh Government.', 'https://placehold.co/400x400.png?text=PL', 'professional person', NULL),
('speaker-aa', 'Anne Armstrong', 'CNO (interim) for Scotland', 'Interim Chief Nursing Officer for Scotland.', 'https://placehold.co/400x400.png?text=AA', 'professional woman', NULL),
('speaker-sg', 'Sonia Glendinning', 'CNO for Northern Ireland (on behalf of Maria McIlGorm), Dept of Health', 'Representing the Chief Nursing Officer for Northern Ireland from the Department of Health.', 'https://placehold.co/400x400.png?text=SG', 'professional woman', NULL),
('speaker-an', 'Acosia Nyanin', 'CNO for England (Deputy)', 'Deputy Chief Nursing Officer for England.', 'https://placehold.co/400x400.png?text=AN', 'professional woman', NULL),
('speaker-jb', 'Jo Bettison', 'Queen''s Nurse, Professional Nurse Advocate, Shropshire Community Health NHS Trust', 'Professional nurse advocate and family nurse partnership supervisor at Shropshire Community Health NHS Trust.', 'https://placehold.co/400x400.png?text=JB', 'nurse smiling', NULL),
('speaker-hb', 'Helen Burke', 'Queen''s Nurse, SCPHN Lead Nurse, Derbyshire Community Health Services NHS Foundation Trust', 'SCPHN lead nurse for children and young people''s mental health at Derbyshire Community Health Services NHS Foundation Trust.', 'https://placehold.co/400x400.png?text=HB', 'nurse caring', NULL),
('speaker-lg', 'Lydia Gunning', 'Programme Manager, Born in Bradford''s Centre for Applied Education Research', 'Programme manager of Born in Bradford''s Centre for Applied Education Research, focusing on research that impacts family health.', 'https://placehold.co/400x400.png?text=LG', 'researcher woman', NULL),
('speaker-jg', 'Jenny Gilmour', 'Legacy SCPHN Health Visitor', 'A legacy SCPHN health visitor and former clinical director for 0-19 services, with extensive experience in community health.', 'https://placehold.co/400x400.png?text=JG', 'experienced professional', NULL),
('speaker-nb', 'Nicky Brown', 'Senior Nurse and Public Health Specialist', 'Senior nurse and public health specialist with a focus on community well-being.', 'https://placehold.co/400x400.png?text=NB', 'public health specialist', NULL),
('speaker-erob', 'Elaine Robinson', 'Nurse Education Adviser, NMC & Northumbria University', 'Nurse education adviser for NMC professional practice, and assistant professor in the department of Nursing, Midwifery and Health at Northumbria University.', 'https://placehold.co/400x400.png?text=ERob', 'educator woman', NULL),
('speaker-hbed', 'Professor Helen Bedford', 'UCL Great Ormond Street Institute of Child Health', 'Professor at UCL Great Ormond Street Institute of Child Health, specializing in child health and vaccine-preventable diseases.', 'https://placehold.co/400x400.png?text=HBed', 'professor academic', NULL),
('speaker-erod', 'Ethel Rodrigues', 'Unite (Health) Lead Professional Officer', 'Lead professional officer for Health at Unite the Union.', 'https://placehold.co/400x400.png?text=ERod', 'union officer', NULL),
('speaker-kl', 'Kitty Lamb', 'CPHVA Education and Development Trust Chair', 'Chair of the CPHVA Education and Development Trust, dedicated to supporting the professional growth of health visitors.', 'https://placehold.co/400x400.png?text=KL', 'chairperson woman', NULL),
('speaker-rm', 'Richard Munn', 'Unite National Officer for Health', 'National officer for health at Unite the Union.', 'https://placehold.co/400x400.png?text=RM', 'union officer man', NULL),
('speaker-jp', 'Joanne Penny', 'Health Visitor & Unite Representative (Wales)', 'Details for Joanne Penny.', 'https://placehold.co/400x400.png?text=JP', 'professional person', NULL),
('speaker-kp', 'Kerry Parry', 'Health Visitor & Unite Representative (Wales)', 'Details for Kerry Parry.', 'https://placehold.co/400x400.png?text=KP', 'professional person', NULL),
('speaker-gc', 'Dr Georgia Cook', 'Research Fellow, Oxford Brookes University', 'Specialism: sleep. Current focus: how school nurses can help.', 'https://placehold.co/400x400.png?text=GC', 'researcher academic', NULL),
('speaker-ft', 'Dr Fiona Tierney', 'Post-doctoral Psychology Research Assistant, Oxford Brookes University', 'Specialism: sleep. Current focus: how school nurses can help.', 'https://placehold.co/400x400.png?text=FT', 'researcher academic', NULL),
('speaker-md', 'Mairead Donnelly', 'PHA Nurse Consultant for Early and School Years (Northern Ireland)', 'Details for Mairead Donnelly.', 'https://placehold.co/400x400.png?text=MD', 'nurse consultant', NULL),
('speaker-ah', 'Annie Hair', 'Senior Nurse Practice Development, Glasgow and Clyde Health Board & Unite OPC Chair', 'Details for Annie Hair.', 'https://placehold.co/400x400.png?text=AH', 'senior nurse', NULL),
('speaker-khg', 'Kirsty Haggerty', 'Practice Development Nurse Health Visitor (Scotland)', 'Details for Kirsty Haggerty.', 'https://placehold.co/400x400.png?text=KH', 'nurse health visitor', NULL),
('speaker-af', 'Amy Furness', 'Midwifery Researcher, Sheffield Hallam University', 'Part of Professor Hora Soltani''s team.', 'https://placehold.co/400x400.png?text=AF', 'midwifery researcher', NULL),
('speaker-hs', 'Professor Hora Soltani', 'Professor of Maternal and Infant Health, Sheffield Hallam University', 'Leading research on neonatal tests for diverse newborns.', 'https://placehold.co/400x400.png?text=HS', 'professor academic', NULL),
('speaker-dsw', 'Diana Skibniewski-Woods', 'Researcher on Mothers'' Coping Mechanisms', 'Presenting on understanding mothers'' coping mechanisms in the face of mental illness.', 'https://placehold.co/400x400.png?text=DSW', 'researcher woman', NULL),
('speaker-zr', 'Zoe Rawlence', 'Researcher (Cornwall)', 'Presenting on experiences of parents with learning disabilities.', 'https://placehold.co/400x400.png?text=ZR', 'researcher person', NULL),
('speaker-js', 'Jo Sumner', 'Researcher (Cornwall)', 'Presenting on experiences of parents with learning disabilities.', 'https://placehold.co/400x400.png?text=JS', 'researcher person', NULL),
('speaker-sa', 'Sophie Ames', 'Researcher (Leeds)', 'Presenting on improving uptake of childhood immunisations.', 'https://placehold.co/400x400.png?text=SAmes', 'researcher woman', NULL),
('speaker-rk', 'Rukshana Kapasi', 'Director of Health, Barnardo''s', 'Director of health at leading children''s charity Barnardo''s. Working in NHS and charity for 30+ years.', 'https://placehold.co/400x400.png?text=RK', 'director health', NULL),
('speaker-sh', 'Stephen Hamilton', 'Psychiatric Nurse, Author, Researcher, Teacher', 'Presenting an interactive session on a health and wellbeing toolkit.', 'https://placehold.co/400x400.png?text=SHam', 'psychiatric nurse', NULL),
('speaker-cn', 'Choir with No Name', 'Charity Supporting Homelessness', 'An interactive performance by the Choir with No Name.', 'https://placehold.co/400x400.png?text=CN', 'choir group', NULL);

-- Insert Exhibitors
INSERT INTO exhibitors (id, name, description, logo_url, logo_storage_path, data_ai_hint, website_url, booth_number) VALUES
('ex-1', 'Public Health Solutions Ltd.', 'Providing innovative solutions for public health challenges. Visit our booth for demos and consultations.', 'https://placehold.co/400x225.png?text=PHS', NULL, 'health company', 'https://example.com/phs', 'C102'),
('ex-2', 'Community Care Tech', 'Technology empowering community health workers and improving patient outcomes.', 'https://placehold.co/400x225.png?text=CCT', NULL, 'tech community', 'https://example.com/cct', 'D201');

-- Insert Schedule Events (Day 1: Wednesday, November 5th, 2025)
INSERT INTO schedule_events (id, title, description, start_time, end_time, location_id, offer_downloads) VALUES
('event-day1-1', 'Registration & Exhibitor Visiting', 'Time for registration and to visit the exhibition hall.', '2025-11-05 09:00:00', '2025-11-05 09:30:00', 'loc-bcec-exhibit', 0),
('event-day1-2', 'Welcome Address', 'Welcome by CPHVA Executive Chair Janet Taylor.', '2025-11-05 09:30:00', '2025-11-05 09:40:00', 'loc-bcec-main', 0),
('event-day1-3', 'Unite Opening Address', 'Opening address by Dominic Hook, National Sector Coordinator for Public Services, Unite.', '2025-11-05 09:40:00', '2025-11-05 10:00:00', 'loc-bcec-main', 0),
('event-day1-4', 'PANEL: Chief Nursing Officers on CP Workforce Challenges', 'An informative and interactive session from the UK''s most senior nursing leaders, including extended Q&As with delegates.', '2025-11-05 10:00:00', '2025-11-05 11:00:00', 'loc-bcec-main', 0),
('event-day1-5', 'Refreshment Break', 'Networking and exhibition viewing.', '2025-11-05 11:00:00', '2025-11-05 11:30:00', 'loc-bcec-exhibit', 0),
('event-day1-6', 'The Role of the Professional Nurse Advocate', 'Enhancing Practice: Part 1. Presented by Queen''s Nurse Jo Bettison.', '2025-11-05 11:30:00', '2025-11-05 12:00:00', 'loc-bcec-main', 0),
('event-day1-7', 'The Rise of Social Prescribing', 'Enhancing Practice: Part 2. Presented by Queen''s Nurse Helen Burke.', '2025-11-05 12:00:00', '2025-11-05 12:30:00', 'loc-bcec-main', 0),
('event-day1-8', 'Lunch Break', 'Networking and exhibition viewing.', '2025-11-05 12:30:00', '2025-11-05 13:30:00', 'loc-bcec-dining', 0),
('event-day1-9', 'Born in Bradford', 'Internationally recognised research project on what keeps families happy and healthy. Presented by Lydia Gunning.', '2025-11-05 13:30:00', '2025-11-05 14:10:00', 'loc-bcec-main', 0),
('event-day1-10', 'Innovative Projects: Improving Education Infrastructure', 'Supporting SCPHN workforce recruitment and quality post-registration teaching. Presented by Jenny Gilmour and Nicky Brown.', '2025-11-05 14:10:00', '2025-11-05 14:40:00', 'loc-bcec-main', 0),
('event-day1-11', 'NMC Important Updates', 'Presented by Elaine Robinson.', '2025-11-05 14:40:00', '2025-11-05 15:10:00', 'loc-bcec-main', 0),
('event-day1-12', 'Refreshment Break', 'Networking and exhibition viewing.', '2025-11-05 15:10:00', '2025-11-05 15:40:00', 'loc-bcec-exhibit', 0),
('event-day1-13', 'Vaccine Update', 'Latest developments in vaccines. Presented by Professor Helen Bedford.', '2025-11-05 15:40:00', '2025-11-05 16:10:00', 'loc-bcec-main', 0),
('event-day1-14', 'Positive Culture', 'Presented by Ethel Rodrigues.', '2025-11-05 16:10:00', '2025-11-05 16:30:00', 'loc-bcec-main', 0),
('event-day1-15', 'The CPHVA Education and Development Trust Update', 'Update on MacQueen Awards and charity work. Presented by Kitty Lamb.', '2025-11-05 16:30:00', '2025-11-05 16:45:00', 'loc-bcec-main', 0),
('event-day1-16', 'Unite Health Update', 'Presented by Richard Munn.', '2025-11-05 16:45:00', '2025-11-05 16:55:00', 'loc-bcec-main', 0),
('event-day1-17', 'Conference Day 1 Close', 'Closing remarks by CPHVA Executive Chair Janet Taylor.', '2025-11-05 17:00:00', '2025-11-05 17:15:00', 'loc-bcec-main', 0),
('event-day1-18', 'Unite-CPHVA Excellence Awards Presentation and Dinner Buffet', 'Awards presentation (starts 7:30 PM) and networking dinner.', '2025-11-05 19:00:00', '2025-11-05 22:00:00', 'loc-bcec-dining', 0);

-- Insert Schedule Events (Day 2: Thursday, November 6th, 2025)
INSERT INTO schedule_events (id, title, description, start_time, end_time, location_id, offer_downloads) VALUES
('event-day2-1', 'Registration & Exhibitor Visiting (Day 2)', 'Time for registration and to visit the exhibition hall.', '2025-11-06 08:40:00', '2025-11-06 09:00:00', 'loc-bcec-exhibit', 0),
('event-day2-2', 'Welcome (Day 2)', 'Welcome by CPHVA Executive Chair Janet Taylor.', '2025-11-06 09:00:00', '2025-11-06 09:10:00', 'loc-bcec-main', 0),
('event-day2-3', 'PANEL: Pressing issues facing clients across the UK', 'Senior practitioners and academics share insights on challenges and opportunities facing families. (Including extended Q&As with delegates)', '2025-11-06 09:10:00', '2025-11-06 10:20:00', 'loc-bcec-main', 0),
('event-day2-4', 'Innovative projects 2: Neonatal tests for diverse newborns', 'Research and practice updates on neonatal tests for Black, Asian and ethnic minority newborns.', '2025-11-06 10:20:00', '2025-11-06 11:00:00', 'loc-bcec-main', 0),
('event-day2-5', 'Refreshment Break (Day 2)', 'Networking and exhibition viewing.', '2025-11-06 11:00:00', '2025-11-06 11:30:00', 'loc-bcec-exhibit', 0),
('event-day2-6', 'CALL FOR PAPERS presentations', 'Celebrating Innovation in Practice: Successful submissions are presented to delegates. Includes: Understanding mothers'' coping mechanisms (Diana Skibniewski-Woods), Experiences of parents with learning disabilities (Zoe Rawlence; Jo Sumner), Developing research capacity of SCPHNs (O-19 Research Network), Improving uptake of childhood immunisations (Sophie Ames).', '2025-11-06 11:30:00', '2025-11-06 12:45:00', 'loc-bcec-main', 0),
('event-day2-7', 'Lunch Break (Day 2)', 'Networking and exhibition viewing.', '2025-11-06 12:45:00', '2025-11-06 13:45:00', 'loc-bcec-dining', 0),
('event-day2-8', 'Nick Robin Memorial Lecture/ Keynote speaker', 'Rukshana Kapasi, Director of health at Barnardo''s, will discuss major new projects and the need for more co-ordinated services due to workforce issues.', '2025-11-06 13:45:00', '2025-11-06 14:30:00', 'loc-bcec-main', 0),
('event-day2-9', 'Looking after number one', 'Health and wellbeing toolkit to improve practitioner mental health. Interactive session with Stephen Hamilton.', '2025-11-06 14:30:00', '2025-11-06 15:20:00', 'loc-bcec-main', 0),
('event-day2-10', 'A special finale to celebrate the professions', 'An interactive performance by the Choir with No Name, a charity supporting those affected by homelessness.', '2025-11-06 15:20:00', '2025-11-06 15:35:00', 'loc-bcec-main', 0),
('event-day2-11', 'Conference Close', 'Closing remarks by CPHVA Executive Chair Janet Taylor.', '2025-11-06 15:45:00', '2025-11-06 16:00:00', 'loc-bcec-main', 0);

-- Insert Event Speakers relationships
INSERT INTO event_speakers (event_id, speaker_id) VALUES
-- Day 1 speakers
('event-day1-2', 'speaker-jt'),
('event-day1-3', 'speaker-dh'),
('event-day1-4', 'speaker-pl'),
('event-day1-4', 'speaker-aa'),
('event-day1-4', 'speaker-sg'),
('event-day1-4', 'speaker-an'),
('event-day1-6', 'speaker-jb'),
('event-day1-7', 'speaker-hb'),
('event-day1-9', 'speaker-lg'),
('event-day1-10', 'speaker-jg'),
('event-day1-10', 'speaker-nb'),
('event-day1-11', 'speaker-erob'),
('event-day1-13', 'speaker-hbed'),
('event-day1-14', 'speaker-erod'),
('event-day1-15', 'speaker-kl'),
('event-day1-16', 'speaker-rm'),
('event-day1-17', 'speaker-jt'),
-- Day 2 speakers
('event-day2-2', 'speaker-jt'),
('event-day2-3', 'speaker-jp'),
('event-day2-3', 'speaker-kp'),
('event-day2-3', 'speaker-gc'),
('event-day2-3', 'speaker-ft'),
('event-day2-3', 'speaker-md'),
('event-day2-3', 'speaker-ah'),
('event-day2-3', 'speaker-khg'),
('event-day2-4', 'speaker-af'),
('event-day2-4', 'speaker-hs'),
('event-day2-6', 'speaker-dsw'),
('event-day2-6', 'speaker-zr'),
('event-day2-6', 'speaker-js'),
('event-day2-6', 'speaker-sa'),
('event-day2-8', 'speaker-rk'),
('event-day2-9', 'speaker-sh'),
('event-day2-10', 'speaker-cn'),
('event-day2-11', 'speaker-jt');

-- Insert Tickets
INSERT INTO tickets (id, user_id, user_name, conference_name, ticket_type, ticket_price, purchase_date, qr_code_value, is_checked_in, check_in_timestamp) VALUES
('ticket-admin1-gen', 'admin1', 'Admin User', 'Unite-CPHVA Annual Professional Conference 2025', 'General Admission', 75.00, '2025-10-01 00:00:00', 'ADMIN1-TICKET1-CPHVA2025-GENERAL', 0, NULL),
('ticket-user1-gen', 'user1', 'Attendee User', 'Unite-CPHVA Annual Professional Conference 2025', 'Unite Member Rate', 60.00, '2025-10-02 00:00:00', 'USER1-TICKET1-CPHVA2025-UNITE', 0, NULL);

-- Insert Polls
INSERT INTO polls (id, question, is_open, created_at) VALUES
('poll-nov25-1', 'Which session are you most looking forward to on Day 1?', 1, '2025-11-05 08:00:00');

-- Insert Poll Options
INSERT INTO poll_options (id, poll_id, text, votes) VALUES
('optA1', 'poll-nov25-1', 'PANEL: Chief Nursing Officers', 0),
('optA2', 'poll-nov25-1', 'Born in Bradford', 0),
('optA3', 'poll-nov25-1', 'Vaccine Update', 0);

-- Insert App Settings
INSERT INTO app_settings (id, title, ticket_sales_enabled, background_color, foreground_color, primary_color, accent_color) VALUES
('settings', 'Unite-CPHVA Annual Professional Conference 2025', 1, '0 0% 94%', '0 0% 20%', '166 29% 40%', '283 49% 60%');
