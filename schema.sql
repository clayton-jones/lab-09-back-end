DROP TABLE IF EXISTS cities;

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  search_query TEXT,
  formatted_query TEXT,
  latitude DECIMAL,
  longitude DECIMAL
);

