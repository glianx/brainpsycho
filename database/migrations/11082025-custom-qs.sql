CREATE TYPE question_category AS ENUM (
    'Algebra',
    'Geometry',
    'Number Theory',
    'Combinatorics',
    'Probability',
    'Other'
);

-- needs more
CREATE TYPE interest AS ENUM (
    'Sports',
    'Music',
    'Art',
);

ALTER TABLE questions 
ADD COLUMN category question_category NOT NULL DEFAULT 'Other';

CREATE TABLE IF NOT EXISTS custom_questions (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    interest interest NOT NULL,
    custom_question_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);
CREATE INDEX IF NOT EXISTS idx_custom_questions_question_id ON custom_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_custom_questions_interest ON custom_questions(interest);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_questions_updated_at 
    BEFORE UPDATE ON custom_questions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();