CREATE TABLE IF NOT EXISTS noteful_notes(
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    content TEXT,
    date_modified TIMESTAMP NOT NULL DEFAULT now(),
    folder_id INTEGER REFERENCES noteful_folders(id) ON DELETE CASCADE NOT NULL
)