import sqlite3

def export_to_sql(db_file, output_file):
    conn = sqlite3.connect(db_file)
    with open(output_file, 'w', encoding='utf-8') as f:
        for line in conn.iterdump():
            f.write('%s\n' % line)
    conn.close()
    print(f"Database exported to {output_file}")

if __name__ == "__main__":
    export_to_sql('surveillance.db', 'surveillance_dump.sql')
