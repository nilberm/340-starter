INSERT INTO classification (classification_name)
VALUES ('Crossover');

SELECT * FROM classification WHERE classification_id = 1;
SELECT * FROM inventory WHERE inv_id = 1;

UPDATE classification SET classification_name = 'Luxury' WHERE classification_id = 1;

DELETE FROM classification WHERE classification_id = 5;