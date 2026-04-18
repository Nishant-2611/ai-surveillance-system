import mysql.connector
from mysql.connector import errorcode
import os
from dotenv import load_dotenv

load_dotenv()

def test_connection():
    user = os.environ.get('DB_USER')
    password = os.environ.get('DB_PASSWORD')
    host = os.environ.get('DB_HOST')
    database = os.environ.get('DB_NAME')

    print(f"Attempting to connect to {host} as {user}...")

    try:
        cnx = mysql.connector.connect(user=user,
                                    password=password,
                                    host=host)
        print("[SUCCESS] Connection to MySQL server established!")
        
        # Check if database exists
        cursor = cnx.cursor()
        cursor.execute(f"SHOW DATABASES LIKE '{database}'")
        result = cursor.fetchone()
        
        if result:
            print(f"[SUCCESS] Database '{database}' exists!")
        else:
            print(f"[ERROR] Database '{database}' does not exist. You need to create it.")
            print(f"Run: CREATE DATABASE {database};")
            
        cursor.close()
        cnx.close()
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("[ERROR] Access denied. Your username or password in .env is incorrect.")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("[ERROR] Database does not exist.")
        else:
            print(f"[ERROR] {err}")

if __name__ == "__main__":
    test_connection()
