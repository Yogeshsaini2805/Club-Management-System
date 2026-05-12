import sqlite3
db = sqlite3.connect('jecrc_clubs.db')
c = db.cursor()
c.execute("DELETE FROM event_registrations WHERE roll_no IN ('24TEST001','24FRESH001','24FRESH002','24DBG001','24NEW999')")
print("Deleted", c.rowcount, "test rows")
db.commit()
db.close()
